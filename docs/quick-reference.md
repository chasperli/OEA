# Quick Reference – Agents auf einen Blick

Einseitige Übersicht zum Nachschlagen. Drucken oder neben den Bildschirm legen.

## Die sieben Agents

| Agent | Wann aufrufen | Output | Reading: |
|---|---|---|---|
| **Business Engineer** | Neue fachliche Domäne, Begriffe klären | `business-objects/*.md`, Business Rules | Konzept §6, §7, Persona SH-07 |
| **Solution Architect** | Klärung mit PO, Scope, Specs, Tickets | OpenAPI/Schema-Specs, Tasks pro Agent | Konzept INDEX, ADRs |
| **Requirements Engineer** | Nach Use Cases, vor Implementation | `requirements/req/REQ-NNN-*.md` | Use Cases, Business Objects |
| **UI Designer** | Mockup-Bedarf, Design-Tokens | Penpot-Files, `design/<feature>/` | Personas, UC-Specs |
| **Backend Engineer** | Backend-Implementation aus Spec | Code in `backend/`, Tests, Migrations | OpenAPI-Spec, Schema |
| **Frontend Engineer** | Frontend-Implementation aus Spec | Code in `frontend/`, Stories, E2E-Tests | OpenAPI-Spec, Mockups |
| **Security Engineer** | Vor jedem Merge, bei Spec-Reviews | Reviews in `security-reviews/` | Code, Specs, Konfiguration |

## Workflow-Reihenfolge

```
PO → Solution Architect → Business Engineer → (PO entscheidet)
   → Use Case (PO + Solution Architect)
   → Requirements Engineer → (PO reviewt)
   → UI Designer + Backend + Frontend (parallel auf Spec)
   → Security Engineer (querschneidend)
   → Solution Architect (Integration)
   → PO (Akzeptanz, Merge)
```

## Aufruf-Muster

**Explizite Rolle**:
```
Bitte agiere als <agent-name> (.claude/agents/<agent-name>.md) und ...
```

**Über Slash-Command**:
```
/new-business-object
/new-usecase
/new-requirement
/new-adr
/trace-check
```

**Direkter Sub-Agent-Call** (wenn Claude Code das nativ unterstützt):
```
@solution-architect klär doch ...
@business-engineer modelliere ...
```

## Schnittstellen-Specs (verbindlich)

| Typ | Standard | Pfad |
|---|---|---|
| REST API | OpenAPI 3.1 | `api/openapi/` |
| Async Events | AsyncAPI 3.0 | `api/asyncapi/` |
| Daten | JSON Schema | `api/schemas/` |
| CLI | Markdown | `api/cli/` |

Backend + Frontend generieren Stubs aus Specs. Specs sind die Wahrheit.

## ID-Konventionen

| Artefakt | Schema | Beispiel |
|---|---|---|
| Stakeholder | SH-NN | SH-01 |
| Use Case | UC-NN | UC-01 |
| User Story | US-NNN | US-001 |
| Requirement | REQ-NNN | REQ-042 |
| NFR (Legacy) | NFR-NN | NFR-03 |
| ADR | ADR-NNN | ADR-006 |
| Business Object | english-kebab-case | `application-component` |
| Business Rule | BR-NN | BR-12 |

Nummern werden niemals wiederverwendet.

## Verbindliche Tech-Anforderungen

- **Typsicherheit**: Frontend TypeScript Pflicht, Backend mit ausgereiftem Type-Layer
- **OpenAPI 3.1**: Spec-First, beidseitig generiert
- **Self-Hosting first**: keine harten Cloud-Abhängigkeiten
- **Property-Level-AuthZ**: Pflicht, nicht optional
- **Audit-Trail**: Append-only, separat gespeichert

## Pflicht vor jedem Merge

- [ ] Conventional-Commits-Format
- [ ] Tests grün (Unit, Integration, Contract)
- [ ] Spec-Konsistenz (Backend/Frontend gegen Spec validiert)
- [ ] Security-Review Sign-off
- [ ] Link-Validierung (`scripts/validate_links.py`)
- [ ] A11y-Check (für Frontend)
- [ ] Doku aktualisiert

## PO-Verantwortlichkeiten

- Vision und Priorisierung (nicht delegierbar)
- Entscheidung bei Konflikten zwischen Personas
- Akzeptanz von Artefakten und Code
- Stakeholder-Übersetzung (echte Welt → Tool)
- Klärung von Ambiguitäten, wenn Agents fragen

## PO-Nicht-Verantwortlichkeiten

- Implementierung (das machen die Engineers)
- Detail-Modellierung (Business Engineer, Requirements Engineer)
- Security-Audit (Security Engineer)
- Mockup-Erstellung (UI Designer)

## Slash-Commands im Überblick

| Command | Wirkung |
|---|---|
| `/new-stakeholder` | Stakeholder-Profil anlegen |
| `/new-business-object` | Business Object anlegen |
| `/new-usecase` | Use Case anlegen |
| `/new-requirement` | Requirement anlegen |
| `/new-story` | User Story anlegen |
| `/new-nfr` | NFR anlegen (Legacy-Pfad) |
| `/new-adr` | ADR anlegen |
| `/trace-check` | Konsistenz-Check über alle Artefakte |
| `/release` | Version hochziehen |

## Quality-Gate-Befehle

```bash
# Link-Validierung
python3 scripts/validate_links.py

# Trace-Check
# (via Slash-Command in Claude Code)
/trace-check
```

## Bei Problemen

| Problem | Schritt |
|---|---|
| Agent macht Annahme, die falsch ist | sofort korrigieren, nicht durchwinken |
| Verlorener Überblick | Solution Architect: "Status aller offenen Tasks?" |
| Security Theater (Findings ohne Substanz) | gemeinsam prüfen, dokumentierte Ablehnung möglich |
| Backend/Frontend driften vom Spec | Solution Architect re-synchronisieren lassen |
| Konflikt zwischen Personas | PO entscheidet, ADR dokumentieren |
| Tech-Frage außerhalb der Agents | Konzept-Kapitel prüfen, ggf. neue ADR vorbereiten |

## Realistischer Zeitrahmen

| Phase | Erste Iteration | Spätere Iterationen |
|---|---|---|
| Initial-Klärung mit Solution Architect | 30-60 Min | 10 Min |
| Business Object modellieren | 1-2 Std | 0 (existiert oft) |
| Tech-Stack-Vorschlag | 1 Std (einmalig pro Stack) | 0 |
| Use Case formulieren | 1 Std | 30 Min |
| Requirements ableiten | 1-2 Std | 30 Min |
| UI-Mockups | 2-4 Std | 1-2 Std |
| Backend-Implementation | 1-3 Tage | 0,5-1 Tag |
| Frontend-Implementation | 1-3 Tage | 0,5-1 Tag |
| Security-Review | 1-2 Std | 30 Min |
| Integration + PO-Akzeptanz | 1-2 Std | 30 Min |
| **Gesamt** | **1-2 Wochen** | **2-4 Tage** |

## Drei goldene Regeln

1. **Stakeholder zuerst, Templates später**: Investition in echte Personas zahlt sich x-fach aus
2. **Specs vor Code**: Spec-Code-Drift ist der teuerste Bug
3. **Security ist Pflicht, nicht Wahl**: Audit-Trail und AuthZ von Anfang an

## Wo du nachschlägst

- Konzept-Übersicht: `concept/README.md` → Lesepfade je nach Rolle
- Kapitel-Index: `concept/INDEX.md`
- Offene Punkte: `concept/90-backlog/23-offene-punkte.md`
- Vision: `business-analysis/vision.md`
- Personas: `business-analysis/stakeholders/`
- Workflow-Beispiel: `docs/workflow-example.md`
- Anti-Patterns: `docs/anti-patterns.md`
- Diese Quick Reference: `docs/quick-reference.md`
