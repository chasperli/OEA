# ADR-029: Testframework für BDD-Systemtests — Cucumber JVM

**Status**: accepted
**Datum**: 2026-06-30
**Entscheider**: [Lukas – Repository-Inhaber](../business-analysis/stakeholders/SH-01-lukas-enterprise-architect.md)

---

## Kontext

Im Rahmen der Requirements-Phase wurden bereits 155 Gherkin Feature Files unter
`requirements/tests/` aus den Requirements (`requirements/req/REQ-*.md`) generiert
(`scripts/generate_feature_files.py`). Sie bilden die V-Modell-Systemtestspezifikation
und definieren *was* getestet wird — nicht *wie*.

Vor dem Implementierungsstart (ADR-012 Java/Spring Boot, ADR-027 Maven-Struktur,
ADR-028 Schichtenarchitektur) müssen zwei Fragen geklärt sein:

1. Mit welchem Test-Execution-Framework werden die Gherkin-Feature-Files gegen
   das Java/Spring-Boot-Backend ausgeführt?
2. Wie entstehen die Step-Definitionen (der Java-Code hinter Given/When/Then),
   ohne dass ein Entwickler sie für alle 155 Dateien von Hand schreiben muss?

Diese Entscheidung war bisher nur informell in `requirements/tests/README.md`
festgehalten (Tool-Versionen, Verzeichnisstruktur), ohne dokumentierte Alternativen
oder Trade-offs — das wird hiermit nachgeholt.

---

## Entscheidungstreiber

- 155 Feature Files existieren bereits im Standard-Gherkin-Format und sollen
  ohne Migration weiterverwendet werden
- Tag-Schema (`@must`, `@should`, `@UC-06`, `@performance`, `@skip`, …) ist
  bereits in den Feature Files angelegt und muss zur Testselektion nutzbar sein
- Stakeholder ohne Java-Kenntnisse (Product Owner, QA) sollen Testszenarien
  weiterhin lesen können
- Step-Definitionen sollen von einem lokal gehosteten LLM (Qwen2.5-14B,
  4-Bit-Quantisierung, headless via Ollama) generierbar sein — Aufwand pro
  Feature File muss klein und klar abgegrenzt sein
- Integration mit Spring Boot (Dependency Injection, Testcontainers) muss
  ohne Zusatz-Framework funktionieren

---

## Betrachtete Optionen

### Option 1: Cucumber JVM (cucumber-java + cucumber-spring + cucumber-junit-platform-engine)

- **Pro**: Standard-Gherkin-Parser — die 155 bestehenden Feature Files sind
  ohne Änderung nutzbar; `cucumber-spring` injiziert Spring-Beans direkt in
  Step-Definitionen; Tag-Filterung (`--tags`) bildet das bestehende Tag-Schema
  1:1 ab; etabliertes Ökosystem mit Testcontainers-Integration; Ausführung über
  Standard-Maven/JUnit-Platform-Tooling
- **Contra**: Zusätzliche Indirektionsebene (Gherkin → generierte
  Step-Definition-Klasse → Java) gegenüber reinem JUnit-Test; Pflege von
  Step-Definitionen als eigene Code-Schicht

### Option 2: JUnit 5 + RestAssured ohne Gherkin/BDD-Layer

- **Pro**: Weniger Tooling-Schichten; direkter Java-Code ohne
  Gherkin-Step-Mapping; etwas schnellere Testausführung
- **Contra**: Die 155 bereits erstellten Feature Files wären nicht ausführbar
  und müssten verworfen oder in Code-Kommentare übersetzt werden; Verlust der
  Lesbarkeit für Nicht-Entwickler; kein deklaratives Tag-Filtering wie
  `@must and @UC-06`, stattdessen JUnit-Tags manuell nachbauen
- **Verworfen**: Wirft bereits investierte Arbeit (155 Feature Files,
  Tag-Schema, REQ-Traceability) weg, ohne einen Vorteil zu bieten, der diesen
  Verlust aufwiegt

### Option 3: Karate DSL

- **Pro**: Eigene BDD-ähnliche Syntax mit eingebautem HTTP-Client — für reine
  REST-Tests oft weniger Step-Definition-Code nötig
- **Contra**: Eigene DSL statt Standard-Gherkin — die 155 bestehenden Feature
  Files wären nicht 1:1 kompatibel und müssten neu geschrieben werden;
  kleineres Ökosystem für Spring-Boot-/Testcontainers-Integration; weniger
  geeignet für Domain-Assertions jenseits reiner HTTP-Response-Prüfung (z.B.
  Constraint-Checks, Property-Validierung in `core/`)
- **Verworfen**: Inkompatibel mit bestehenden Feature Files; Migrationsaufwand
  übersteigt den Nutzen des eingebauten HTTP-Clients

---

## Entscheidung

Wir wählen **Option 1: Cucumber JVM**
(`cucumber-java`, `cucumber-spring`, `cucumber-junit-platform-engine`,
Version 7.15.0), ausgeführt über Maven/JUnit-Platform
(`mvn test -Dcucumber.filter.tags="..."`).

Die Java-Step-Definitionen unter `api/src/test/java/de/oea/steps/` werden
während der Implementierungsphase pro Feature File von **Qwen2.5-14B-Instruct**
(Q4_K_M, lokal headless via Ollama, siehe `requirements/tests/README.md`)
generiert — ein Prompt je Feature File, mit Spring-Boot/RestAssured/
Testcontainers als Ziel-Stack.

**Begründung**: Die Feature Files sind bereits investierte Arbeit und das
verbindliche V-Modell-Testartefakt der Requirements-Phase. Cucumber JVM ist die
einzige der drei Optionen, die diese Dateien unverändert weiterverwendet und
gleichzeitig nativ in den Spring-Boot-Stack (ADR-012, ADR-028) integriert.

---

## Konsequenzen

### Positive Konsequenzen

- Bestehende 155 Feature Files bleiben 1:1 nutzbar, keine Migration nötig
- Tag-basierte Filterung (`@must`, `@UC-06`, `@performance`, `not @skip`)
  bereits vorhanden und sofort einsetzbar (siehe `requirements/tests/README.md`)
- Stakeholder ohne Java-Kenntnisse können Testszenarien weiterhin lesen
- Step-Definitionen lassen sich pro Feature File isoliert generieren — kleine,
  klar abgegrenzte Prompts für Qwen statt einer monolithischen Codebasis
- `cucumber-spring` nutzt dieselbe Dependency-Injection wie die
  Anwendungsschichten aus ADR-028, kein Parallel-Wiring nötig

### Negative Konsequenzen / Trade-offs

- Zusätzliche Indirektionsebene (Gherkin → Step-Definition → Java) gegenüber
  einem direkten JUnit-Test bedeutet mehr Tooling-Komplexität und eine weitere
  Stelle, an der Fehler entstehen können (z.B. nicht erkannte Step-Patterns)
- Qualität der generierten Step-Definitionen hängt von einem lokal gehosteten,
  4-Bit-quantisierten 14B-Modell ab — schwächer als Cloud-Alternativen,
  voraussichtlich höherer manueller Repair-Aufwand
- Lokale Generierung auf 16GB RAM ist langsam (ca. 4–8 Tokens/s) — die
  Step-Def-Generierung für alle 155 Feature Files ist ein Batch-Prozess über
  Nacht, kein interaktiver Workflow
- Die 4 Feature Files mit TODO-Platzhaltern (REQ-070, REQ-079, REQ-080,
  REQ-081, siehe `requirements/tests/README.md`) müssen vor der
  Step-Def-Generierung manuell ins Standard-Gegeben/Wenn/Dann-Format gebracht
  werden, sonst scheitert die Generierung oder liefert Platzhalter-Code

---

## Bezüge

**Verwandte ADRs**:
- ADR-012: Backend-Stack Java 21 + Spring Boot 3 (Ziel-Stack der Step-Definitionen)
- ADR-027: Mono-Repo und Maven-Modul-Struktur (Verzeichnis `api/src/test/`)
- ADR-028: Backend-Schichtenarchitektur (App-Services als Testziel der Step-Definitionen)

**Konzept**: §21 (Tech-Stack Backend)

**Weitere Quelle**: `requirements/tests/README.md` (Tag-Schema, Cucumber-CLI-Filterbeispiele, Qwen/Ollama-Setup)
