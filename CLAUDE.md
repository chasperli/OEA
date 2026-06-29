# CLAUDE.md – Anleitung für Claude Code

Diese Datei codifiziert die Arbeitsweise in diesem Repository. Sie wird von Claude Code beim Start automatisch eingelesen und ist verbindlich.

## Projekt-Kontext

**Projekt**: OEA – Open Enterprise Architecture (Open-Source-Werkzeug für EA-Disziplin)
**Sprache**: Deutsch ist Arbeitssprache für Dokumentation, Code-Kommentare in Englisch
**Lizenz**: AGPL-3.0 (Community) / Proprietär (Enterprise) – siehe `LICENSE`, `LICENSES/LICENSE-ENTERPRISE.md`, `LICENSES/CLA.md`
**Phase**: Requirements Engineering (nach Abschluss der Konzept-Phase v0.15)
**Vision**: siehe `business-analysis/vision.md`

## Repository-Struktur

```
oea/
├── concept/              ← Konzeptpapier (v0.15+), 24 Kapitel + Changelog
├── business-analysis/    ← Vision, 7 Stakeholder-Profile, Concerns
├── business-objects/     ← Domain Model: Business Objects, Capabilities, Business Rules
├── requirements/
│   ├── use-cases/        ← zielorientierte UC
│   ├── req/              ← atomare Requirements (alle Typen)
│   ├── user-stories/     ← granulare Backlog-Items
│   └── nfr/              ← Legacy-NFRs (kann zu req/ migriert werden)
├── adrs/                 ← Architectural Decision Records
├── templates/            ← Vorlagen für Stakeholder, BO, UC, REQ, US, NFR
├── docs/                 ← Workflow, Quick Reference, Anti-Patterns
├── scripts/              ← Hilfsskripte (Validierung, Generation)
├── .claude/agents/       ← 7 Agent-Definitionen für Vibe Coding
├── .claude/commands/     ← Slash-Commands
├── .github/              ← Issue-Templates, PR-Template, CI-Workflows
├── install-concept.sh    ← Setup-Skript für Konzept-Verteilung
└── CLAUDE.md             ← diese Datei
```

Code (`backend/`, `frontend/`, `api/`) kommt später, wenn Walking Skeleton startet (siehe Konzept §21).

## Aktuelle Phase: Requirements Engineering

**Reihenfolge des Vorgehens** (Domain-Model-first):
1. Vision in `business-analysis/vision.md` ausformulieren (✓ erledigt)
2. 7 Stakeholder-Profile in `business-analysis/stakeholders/` anlegen (✓ erledigt)
3. Erste Business Objects mit Business Engineer modellieren (`business-objects/`)
4. Use Cases in `requirements/use-cases/` ableiten (zielorientiert, nicht CRUD)
5. Requirements mit Requirements Engineer aus UCs ableiten (`requirements/req/`, alle 7 Typen)
6. Priorisierung nach MoSCoW
7. User Stories für MUST-Use-Cases zerlegen
8. ADRs für blockierende Entscheidungen (Gruppe A: ADR-001 bis ADR-005)
9. Tech-Stack-Entscheidungen (ADR-006 Backend, ADR-007 Frontend)
10. Walking-Skeleton-Definition (genau ein End-to-End-Use-Case)

**Nicht ohne Stakeholder mit Use Cases starten** – das führt zu generischer Funktionalität.
**Nicht ohne Business Objects in Use Cases starten** – sonst entstehen referenz-lose Szenarien.

## Sprach- und Stil-Konventionen

### Dokumentation

- **Deutsch** als Hauptsprache
- **Du-Form vermeiden** in Dokumentation (sachlich, neutral); in Slash-Command-Output ist Du-Form OK
- **Markdown** als Format, mit Frontmatter wo sinnvoll
- **Diagramme**: Notation noch offen (siehe §21.2.1 im Konzept). Bis dahin: deskriptiv beschreiben, bei Bedarf Mermaid inline

### Code-Kommentare

- **Englisch** (international, OSS-tauglich)
- Code-Identifier englisch (Variablen, Funktionen, Klassen)
- Domain-Begriffe können deutsch bleiben, wenn fachlich etabliert (z.B. "Bebauungsplan")

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

## Slash-Commands (in `.claude/commands/`)

Verfügbare Befehle (siehe einzelne Dateien für Details):

- `/new-stakeholder` – legt Stakeholder-Profil aus Template an
- `/new-business-object` – legt Business Object aus Template an (vor Use Cases)
- `/new-usecase` – legt Use Case an, prüft Stakeholder- und Business-Object-Bezug
- `/new-requirement` – legt atomare Anforderung aus Template an (alle 7 Typen)
- `/new-story` – legt User Story an, prüft Use-Case-Bezug
- `/new-nfr` – legt NFR an, erinnert an messbare Zielwerte (Legacy – kann durch `/new-requirement` mit `type: non-functional` ersetzt werden)
- `/new-adr` – legt ADR mit nächster freier Nummer an
- `/trace-check` – prüft Verknüpfungs-Konsistenz aller Artefakte
- `/release` – setzt Konzept-Version hoch und aktualisiert CHANGELOG

## Agents (in `.claude/agents/`)

Sieben Agent-Definitionen für Vibe Coding:

- `business-engineer.md` – Domain Model first (vor UC)
- `solution-architect.md` – Klärung, Scope, Specs, Tickets
- `requirements-engineer.md` – atomare Requirements aus UCs
- `ui-designer.md` – Penpot-Mockups, Design-System
- `backend-engineer.md` – Backend (Typsicherheit verbindlich)
- `frontend-engineer.md` – Frontend (TypeScript Pflicht)
- `security-engineer.md` – querschneidende Sicherheits-Reviews

Workflow siehe `.claude/agents/README.md` und `docs/workflow-example.md`.

## Wichtige Prinzipien für die Arbeit mit Claude Code

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
| Neuer Screen erstellt (`scripts/penpot/*.js`) | Eintrag in SCREENS.md anlegen: ID, Name, Plattform, UC-Bezug, Priorität; Status auf `mockup` setzen |
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
| Neues Business Object (`/new-business-object`) | Klasse in `data-model.puml` ergänzen; Attribute, Typen, Relationen eintragen |
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

- **"Performant sein"** ohne Zahl
- **NFR ohne Verifikationsmethode**
- **NFR ohne Scope** (bei welcher Datenmenge?)

### ADRs

- **"Wir haben uns für X entschieden, weil es Standard ist"** – ohne dokumentierte Alternativen
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
Bei strukturellen Fragen zu CLAUDE.md: PR mit Begründung.
