# VIBE.md – Anleitung für Mistral Vibe

Diese Datei codifiziert die Arbeitsweise in diesem Repository mit Mistral Vibe. Sie dokumentiert Konventionen, Skills und Integrationen.

## Projekt-Kontext

**Projekt**: OEA – Open Enterprise Architecture (Open-Source-Werkzeug für EA-Disziplin)
**Sprache**: Deutsch für Dokumentation, Englisch für Code-Kommentare
**Lizenz**: AGPL-3.0 (Community) / Proprietär (Enterprise)
**Phase**: Requirements Engineering (nach Abschluss der Konzept-Phase v0.15)
**Vision**: siehe `business-analysis/vision.md`

## Repository-Struktur

```
oea/
├── concept/              ← Konzeptpapier (v0.15+), 24 Kapitel + Changelog
├── business-analysis/    ← Vision, Stakeholder-Profile, Concerns
├── business-objects/     ← Domain Model: Business Objects, Capabilities, Business Rules
├── requirements/
│   ├── use-cases/        ← zielorientierte UC
│   ├── req/              ← atomare Requirements
│   ├── user-stories/     ← granulare Backlog-Items
│   └── nfr/              ← Legacy-NFRs
├── adrs/                 ← Architectural Decision Records
├── templates/            ← Vorlagen für Stakeholder, BO, UC, REQ, US, NFR
├── docs/                 ← Workflow, Quick Reference, Anti-Patterns
├── scripts/              ← Hilfsskripte (Validierung, Generation)
├── .vibe/
│   ├── skills/           ← Mistral Vibe Skills (siehe unten)
│   └── config/           ← Vibe-spezifische Konfiguration
├── .github/              ← Issue-Templates, PR-Template, CI-Workflows
├── install-concept.sh    ← Setup-Skript für Konzept-Verteilung
└── VIBE.md               ← diese Datei
```

## Mistral Vibe Skills

Skills sind spezialisierte Module, die Arbeitsabläufe kapseln. Sie leben in `.vibe/skills/`.

### Verfügbare Skills

1. **`oea-requirements`** – Requirements Engineering
   - Use-Case-Erstellung mit Template-Validierung
   - Requirements-Tracing und Konsistenzprüfung
   - Automatische Verknüpfung mit Business Objects

2. **`oea-architecture`** – Architektur-Unterstützung
   - ADR-Erstellung mit Vorlagen
   - Konzept-Dokumentation
   - Entscheidungsunterstützung

3. **`oea-validation`** – Qualitätssicherung
   - Link-Validierung
   - Markdown-Linting
   - Traceability-Checks

4. **`oea-penpot`** – Penpot-Integration (siehe unten)
   - Screen-Erstellung und -Verwaltung
   - Mockup-Generierung
   - Design-System-Synchronisation

### Skill-Nutzung

Skills werden durch direkte Anweisungen aktiviert:
- "Erstelle einen neuen Use Case für X" → aktiviert `oea-requirements`
- "Erstelle eine neue ADR für Y" → aktiviert `oea-architecture`
- "Validiere alle Links" → aktiviert `oea-validation`

## Penpot-Integration

### Konzept

Penpot ist ein Open-Source-Design-Tool für UI-Mockups. Die Integration erfolgt über:

1. **Penpot API**: REST-API für Screen-Erstellung und -Verwaltung
2. **Penpot CLI**: Command-Line-Tool für Batch-Operationen
3. **Penpot Scripts**: JavaScript/TypeScript für automatisierte Mockup-Generierung

### Implementierung

#### 1. Penpot API

Die Penpot API wird für folgende Operationen genutzt:
- Screen-Erstellung
- Screen-Aktualisierung
- Screen-Löschung
- Design-System-Synchronisation

#### 2. Penpot CLI

Das Penpot CLI wird für Batch-Operationen genutzt:
- Export aller Screens
- Import von Screens
- Batch-Aktualisierung

#### 3. Penpot Scripts

Penpot Scripts werden für automatisierte Mockup-Generierung genutzt:
- Generierung von Screens aus Use Cases
- Synchronisation mit `docs/screens/SCREENS.md`
- Automatische Aktualisierung von Design-Systemen

### Beispiel: Screen-Erstellung

1. Use Case wird erstellt
2. `oea-penpot` Skill wird aktiviert
3. Skill erstellt einen neuen Screen in Penpot
4. Screen wird in `docs/screens/SCREENS.md` eingetragen
5. Mockup wird generiert und in `docs/screens/` gespeichert

### Beispiel: Screen-Aktualisierung

1. Use Case wird aktualisiert
2. `oea-penpot` Skill wird aktiviert
3. Skill aktualisiert den entsprechenden Screen in Penpot
4. `docs/screens/SCREENS.md` wird aktualisiert
5. Mockup wird neu generiert

## Arbeitsweise mit Mistral Vibe

### Direkte Anweisungen

Statt Slash-Commands werden direkte Anweisungen verwendet:
- "Erstelle einen neuen Use Case für X" → Use-Case-Erstellung
- "Erstelle eine neue ADR für Y" → ADR-Erstellung
- "Validiere alle Links" → Link-Validierung

### Kontextbewusstsein

Mistral Vibe behält den Projektkontext im Auge und verknüpft automatisch mit bestehenden Artefakten.

### Konsistenzprüfung

Mistral Vibe prüft automatisch Verknüpfungen und Konsistenz bei Änderungen.

### Sprachmix

Mistral Vibe unterstützt sowohl Deutsch für Dokumentation als auch Englisch für Code.

## Git-Konventionen

### Commit-Messages: Conventional Commits

Format: `<type>(<scope>): <subject>`

Beispiele:
- `feat(requirements): add UC-03 Bebauungsplan-Export`
- `docs(concept): clarify Logical-Schicht-Optionalität in §6.1.1`
- `fix(scripts): correct link validator path handling`
- `chore(adrs): add ADR-006 stub for Persistenz-Wahl`

Erlaubte Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `build`, `ci`, `perf`

### Branches

- `main` ist immer deploybar / lesbar
- Feature-Branches: `feature/<kurz-beschreibung>`
- Doku-Branches: `docs/<kurz-beschreibung>`
- ADR-Branches: `adr/<NNN-kurzname>`

### Pull Requests

Jeder PR braucht:
- Conventional-Commits-konformen Titel
- Beschreibung mit Kontext
- Link zu verwandtem Use Case, NFR oder ADR
- Bestandene CI (siehe Quality Gates)

## Git-Zugriff in Distrobox

Da diese Umgebung eine Distrobox ist und git nicht direkt verfügbar ist, muss der Zugriff über einen Symlink konfiguriert werden.

### Einrichtung (einmalig pro Host)

Führe folgende Schritte aus, um git verfügbar zu machen:

```bash
# Symlink in .distrobox/bin erstellen (falls nicht vorhanden)
mkdir -p ~/.distrobox/bin
ln -sf /run/host/var/lib/flatpak/runtime/org.freedesktop.Sdk/x86_64/25.08/*/files/libexec/git-core/git ~/.distrobox/bin/git
```

### Nutzung

Füge den Pfad zu deiner PATH-Umgebungsvariable hinzu oder rufe git direkt auf:

```bash
# Option 1: PATH erweitern (empfohlen für Sessions)
export PATH="$HOME/.distrobox/bin:$PATH"
git --version  # sollte git version 2.xx.x anzeigen

# Option 2: Direktaufruf (absoluter Pfad für lukas)
$HOME/.distrobox/bin/git status
```

*Hinweis:* Die Flatpak-Runtime-Version kann sich ändern. Falls der Symlink nicht mehr funktioniert, suche die aktuelle git-Binärdatei mit:
```bash
find /run/host/var/lib/flatpak/runtime/org.freedesktop.Sdk -name "git" -type f 2>/dev/null | head -1
```

## Quality Gates (CI)

Vor jedem Merge auf `main`:

1. **Link-Validierung**: `python3 scripts/validate_links.py` – muss grün sein
2. **Markdown-Lint** (sobald eingerichtet)
3. **ADR-Konsistenz**: jede in `adrs/` referenzierte ADR existiert
4. **Use-Case-Vollständigkeit**: jeder Use Case hat Persona, Akzeptanzkriterien, Konzept-Bezug

## Versionierung

### Konzeptpapier

- Status in `concept/README.md` (Format: `**Status:** Entwurf vX.Y`)
- Bei Änderung: Eintrag in `concept/CHANGELOG.md` (Format: Keep a Changelog)
- Minor-Bump bei neuen Abschnitten/Kapiteln
- Patch-Bump bei Korrekturen

### ADRs

- Semantisch nummeriert (ADR-001, ADR-002, ...)
- Nummern werden nicht wiederverwendet, auch wenn eine ADR als `superseded` markiert wird
- Status-Übergänge: `draft → proposed → accepted | rejected`; später ggf. `superseded by ADR-NNN`

### Use Cases / User Stories / NFRs

- Status pro Datei verfolgen (siehe Templates)
- Bei Statusübergang `accepted → realized` ist Implementation-Hash zu vermerken

## Wichtige Prinzipien für die Arbeit mit Mistral Vibe

### Vor jeder Änderung

1. Bestehende Dateien lesen, bevor neue erstellt werden
2. Konzept-Bezüge prüfen – Anpassungen an Requirements haben oft Auswirkung auf Konzept
3. Bei Konflikt: lieber nachfragen als annehmen

### Bei Konzept-Änderungen

- IMMER `concept/CHANGELOG.md` aktualisieren
- IMMER Status in `concept/README.md` hochziehen
- IMMER Link-Validierung laufen lassen
- IMMER prüfen, ob `concept/INDEX.md` aktualisiert werden muss

### Bei neuen Use Cases

- IMMER Persona-Bezug prüfen (Stakeholder muss existieren)
- IMMER mindestens einen Konzept-Bezug setzen
- IMMER Akzeptanzkriterien als prüfbare Aussagen formulieren

### Bei neuen NFRs

- IMMER messbare Zielwerte fordern (keine "soll schnell sein"-Aussagen)
- IMMER Verifikationsmethode benennen
- IMMER Scope angeben (bei welcher Datenmenge gilt der Wert)

### Bei neuen ADRs

- IMMER alle Optionen mit Pro/Contra dokumentieren
- IMMER Entscheidungstreiber explizit machen
- IMMER betroffene Konzept-Kapitel verlinken
- NIEMALS ADR-Nummer wiederverwenden (auch nicht bei Rejected)

### Bei Screen-Änderungen (Penpot-Mockups)

`docs/screens/SCREENS.md` ist das verbindliche Screen-Inventar. Bei jedem der folgenden Ereignisse MUSS es geprüft und aktualisiert werden:

| Ereignis | Was tun |
|---|---|
| Neuer Screen erstellt | Eintrag in SCREENS.md anlegen: ID, Name, Plattform, UC-Bezug, Priorität; Status auf `mockup` setzen |
| Screen überarbeitet | Status in SCREENS.md prüfen und ggf. anpassen |
| Neues Penpot-Script angelegt | Eintrag in der Tabelle „Zugehörige Penpot-Scripts" ergänzen |
| Screen fällt weg oder wird zusammengelegt | Eintrag entfernen oder als `superseded` kommentieren |

**Faustregel:** Jeder SVG in `docs/screens/` hat einen korrespondierenden Eintrag in `SCREENS.md`.

### Bei Datenmodell-Änderungen

Das Datenmodell besteht aus zwei synchron zu haltenden Quellen:
- `docs/data-model.puml` – PlantUML-Gesamtdiagramm (Klassen, Attribute, Relationen, SQL-Constraints)
- `business-objects/<name>.md` – Einzelbeschreibung je Business Object

**Auslöser für eine Datenmodell-Prüfung** – bei jedem der folgenden Ereignisse MUSS geprüft werden, ob das Datenmodell noch aktuell ist und ggf. angepasst werden muss:

| Ereignis | Was prüfen |
|---|---|
| Neues Business Object | Klasse in `data-model.puml` ergänzen; Attribute, Typen, Relationen eintragen |
| Neues Requirement mit Daten-Auswirkung | Betroffenes BO in `business-objects/<name>.md` prüfen; neues Attribut/neue Relation in `data-model.puml` nachtragen |
| Neuer Use Case, der ein bisher unbekanntes BO referenziert | BO anlegen, dann Datenmodell ergänzen |
| Neue ADR mit Persistenz-Auswirkung (z. B. Soft-Delete, Audit-Log, neue Tabelle) | Konsequenzen in `data-model.puml` umsetzen |
| Geändertes Business Object (Attribut umbenannt, Typ geändert, Relation entfernt) | `data-model.puml` synchron halten; bestehende REQs und USs auf Konsistenz prüfen |

**Konkrete Schritte bei jeder Änderung:**

1. `docs/data-model.puml` öffnen und prüfen, ob das betroffene BO/Attribut bereits enthalten ist
2. Falls nicht vorhanden oder veraltet: Klasse, Attribute (mit Typ und Sichtbarkeit), Relationen und SQL-Constraints ergänzen/korrigieren
3. Falls das zugehörige `business-objects/<name>.md` noch kein Attribut kennt: dort ebenfalls ergänzen
4. Kurz notieren, warum die Änderung nötig war (z. B. als Kommentar in `data-model.puml` oder in der BO-Datei unter "Notizen")

**Faustregel:** Jedes Attribut, das in einem REQ oder einer User Story vorkommt, muss auch im Datenmodell sichtbar sein — spätestens bevor die zugehörige User Story als `accepted` markiert wird.

## Anti-Patterns

Bitte explizit vermeiden:

### Use Cases

- **CRUD-Use-Cases**: "ApplicationComponent anlegen" ist kein Use Case, sondern eine Funktion. Use Cases sind zielorientiert.
- **Use Cases ohne Persona**: Generische Use Cases führen zu generischer Funktionalität.
- **Use Cases ohne Akzeptanzkriterien**: ohne Prüfbarkeit ist es ein Wunsch, kein Use Case.

### NFRs

- **"Performant sein" ohne Zahl**
- **NFR ohne Verifikationsmethode**
- **NFR ohne Scope** (bei welcher Datenmenge?)

### ADRs

- **"Wir haben uns für X entschieden, weil es Standard ist" – ohne dokumentierte Alternativen**
- **ADR ohne Konsequenzen** – jede Entscheidung hat Trade-offs
- **ADR auf Vorrat** – ADRs sollten ein konkretes Problem lösen, nicht vorausschauend angelegt werden

### Konzept

- **Notation-spezifische Beispiele festschreiben** – siehe §21.2.1, Notation ist noch offen
- **Erzwungene Tiefe** – Logical-Schicht ist optional, das ist Grundprinzip

### Datenmodell

- **Requirement anlegen, Datenmodell vergessen** – jedes REQ/US mit Daten-Auswirkung muss eine Spur im Datenmodell hinterlassen
- **`data-model.puml` und `business-objects/*.md` auseinanderlaufen lassen** – beide Quellen müssen synchron sein; nur eine zu pflegen erzeugt versteckte Widersprüche
- **Attribute in Anforderungen beschreiben, aber nicht typisieren** – Typ, Wertebereich und Pflichtfeld-Status gehören ins BO, nicht nur in den Fließtext eines REQ

## Definition of Done für die Requirements-Phase

Die Requirements-Phase ist abgeschlossen, wenn:

- [ ] Vision formuliert und reviewed
- [ ] Mindestens 3 Stakeholder-Profile mit Concerns
- [ ] Mindestens 10 Use Cases, alle priorisiert (MoSCoW)
- [ ] Mindestens 5 NFRs mit messbaren Zielwerten
- [ ] Gruppe-A-ADRs (001 bis 005) entschieden oder bewusst deferred
- [ ] Walking-Skeleton-Use-Cases identifiziert
- [ ] Traceability-Matrix gepflegt
- [ ] Trace-Check ohne Warnings

Erst dann startet die Implementation-Phase.

## Kontakt für Klärungen

Bei konzeptionellen Fragen: Inhaber des Repositorys (TBD).
Bei strukturellen Fragen zu VIBE.md: PR mit Begründung.