# ADR-002: Enterprise Continuum – Ein Repository oder zwei?

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
**Konsultiert**: Requirements Engineer (metamodel-configuration.md, ADR-005)
**Informiert**: alle Stakeholder

---

## Kontext und Problem

Das TOGAF Enterprise Continuum unterscheidet zwischen allgemein wiederverwendbaren Bausteinen (Foundation/Industry/Common-Systems-Architecture) und organisationsspezifischen Inhalten. Die offene Frage: Werden diese in einem Repository mit Scope-Markierung gehalten, oder in zwei getrennten Repositorys?

**Bereits getroffene Vorentscheidung** (metamodel-configuration.md): Das Metamodell kennt bereits das Attribut `isBuiltIn: boolean` auf EntityTypeDefinition. Built-in Typen (`bpmn-user-task`, `arc42-meta-object`, `organizational-unit` etc.) sind Teil der Software-Auslieferung. Dieses Konzept ist der Startpunkt für die ADR-Entscheidung.

## Entscheidungstreiber

- **Einfachheit**: Kein zweites Repository für Erstnutzer
- **Wiederverwendbarkeit**: Continuum-Inhalte sollen zwischen OEA-Instanzen teilbar sein
- **Update-Pfad**: Neue Continuum-Versionen (z.B. TOGAF TRM 2025) müssen einspielbrar sein ohne lokale Anpassungen zu verlieren
- **OSS-Verteilung**: Continuum-Pakete als unabhängige Pakete veröffentlichbar

## Betrachtete Optionen

### Option 1 (gewählt): Ein Repository + Import-Mechanismus

Alle Inhalte (built-in, importiert, organisationsspezifisch) in einer OEA-Instanz. Differenzierung über `scope`-Property auf EntityTypeDefinition:
- `built-in`: Teil der Software-Auslieferung; unveränderlich; Update via OEA-Release
- `imported`: aus einem Continuum-Paket importiert; unveränderlich ausser explizite „Gabel"
- `organization`: organisationsspezifisch; frei veränderbar

Continuum-Pakete sind JSON/YAML-Dateien mit EntityTypeDefinitions und Connection-Typen, die per `POST /api/v1/metamodel/import` importiert werden.

**Pro**: einfache Architektur; einheitliche API; keine Sync-Probleme; kein zweites Repository zu betreiben
**Contra**: Trennung von Continuum und Org-Inhalten ist nur per `scope`-Filter möglich, nicht durch physische Trennung

### Option 2: Zwei getrennte Repositorys
- Pro: Continuum als eigenes OSS-Paket; klare Trennung
- Contra: zwei APIs, zwei Repositories, Versions-Management, Referenz-Resolution zwischen Repos — erhebliche Komplexität für v1.0

### Option 3: Sub-Repository-Mechanismus
- Pro: Continuum eingebettet, separat versioniert
- Contra: Git-Submodule oder Paket-Mechanismus erhöht Deployment-Komplexität; overkill für v1.0

## Entscheidung

**Option 1 ist die Entscheidung.**

**Scope-Modell** auf EntityTypeDefinition (ergänzt metamodel-configuration.md):

| Scope | Beschreibung | Veränderbar? | Herkunft |
|---|---|---|---|
| `built-in` | Teil der OEA-Software; immer vorhanden | nein (read-only) | OEA-Release |
| `imported` | Aus Continuum-Paket importiert | nein; „Gabel" erzeugt org-Kopie | Paket-Import |
| `organization` | Organisationsspezifisch | ja | Admin |

**Paket-Format** (Continuum-Bibliothek):
- JSON oder YAML; enthält EntityTypeDefinitions, Connection-Typen, optionale Beispiel-Entitäten
- Identifiziert durch `packageId` (z.B. `oea-togaf-trm:1.0`) und `publisher`
- Import via API: `POST /api/v1/metamodel/packages/import`
- Nach Import: Typen sind `scope=imported`; unveränderlich; Organisations-Fork via „Als eigene Kopie übernehmen"-Aktion

**Auslieferungs-Pakete** (v1.0):
- `oea-bpmn-2.0` — BPMN 2.0 Typen (bereits als built-in in process.md)
- `oea-arc42` — Arc42-Typen (bereits als built-in in arc42.md)
- `oea-togaf-starter` — Basis-TOGAF-Typen (ApplicationComponent, TechnologyComponent, DataObject etc.)

## Konsequenzen

### Positiv
- Einheitliche API für alle EntityType-Operationen (kein zweites Repository)
- Continuum-Pakete sind als eigenständige OSS-Artefakte veröffentlichbar und versionierbar
- `scope=imported` schützt Paket-Inhalte vor unbeabsichtigter Änderung
- Update-Pfad: neues Paket importieren → bestehende `imported`-Typen aktualisiert; Org-Forks bleiben unverändert

### Negativ / Trade-offs
- Physische Trennung von Continuum und Org-Inhalten nur per Filter, nicht per Repository
- Paket-Import-Mechanismus muss für v1.0 implementiert werden (zusätzlicher Scope)

### Folgeentscheidungen
- metamodel-configuration.md wird um `scope`-Property auf EntityTypeDefinition ergänzt
- REQ-004 (Metamodell konfigurieren, UC-04) erhält neuen REQ für Paket-Import

## Bezüge

**Konzept-Kapitel**:
- [§4 Enterprise Continuum und TRM](../concept/10-foundations/04-enterprise-continuum-trm.md)

**Abhängige ADRs**: ADR-005 (Starter-Konfiguration nutzt Import-Pakete)

**Bezogene Business Objects**: metamodel-configuration.md (EntityTypeDefinition + scope), process.md (BPMN built-in), arc42.md (Arc42 built-in)
