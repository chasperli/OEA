# OEA Screen-Inventar

Vollständige Liste aller UI-Screens als Grundlage für Penpot-Mockups und API-Definitionen.

**Plattformen** (ADR-008, ADR-009):
- **CA** = Client App (Tauri/Desktop) — vollständiger Modellierungs-Umfang
- **WP** = Web Portal (Vue 3 SPA, Browser) — Read-only-Publikation
- **CA+WP** = beide Plattformen

**Status-Werte**: `todo` | `mockup` | `api-defined` | `implemented`

---

## Auth & Setup

| ID | Screen | Plattform | UC-Bezug | Priorität | Status |
|---|---|---|---|---|---|
| SCR-001 | Login | CA+WP | UC-01 | must | `mockup` |
| SCR-002 | Setup-Wizard (Ersteinrichtung) | CA | UC-02 | must | `todo` |
| SCR-003 | Auth-Methode einrichten (Required Action) | CA | UC-03 | must | `todo` |

---

## Client App – Shell & Navigation

| ID | Screen | Plattform | UC-Bezug | Priorität | Status |
|---|---|---|---|---|---|
| SCR-010 | Hauptfenster / App-Shell | CA | UC-06, UC-13 | must | `mockup` |
| SCR-011 | Explorer / Navigationsbaum | CA | UC-13 | must | `todo` |
| SCR-012 | Entity-Eigenschaften-Panel | CA | UC-06, UC-04 | must | `mockup` |

---

## Client App – Kernfunktionen

| ID | Screen | Plattform | UC-Bezug | Priorität | Status |
|---|---|---|---|---|---|
| SCR-020 | Katalog-Browser (Walking Skeleton) | CA | UC-06 | must | `todo` |
| SCR-021 | Diagramm-Editor / Canvas | CA | UC-05, UC-08, UC-10 | must | `todo` |
| SCR-022 | BPMN-Editor | CA | UC-10 | must | `todo` |
| SCR-023 | Data-Lineage-Editor | CA | UC-08 | should | `todo` |
| SCR-024 | Dashboard-Editor | CA | UC-07 | should | `todo` |
| SCR-025 | Plateau-Roadmap | CA | UC-11 | must | `todo` |
| SCR-026 | Änderungshistorie / Audit-Log | CA | UC-14 | must | `todo` |
| SCR-027 | Entität wiederherstellen (Diff-Ansicht) | CA | UC-15, UC-16 | should | `todo` |

---

## Client App – Administration & Konfiguration

| ID | Screen | Plattform | UC-Bezug | Priorität | Status |
|---|---|---|---|---|---|
| SCR-030 | Metamodell-Konfiguration | CA | UC-04 | must | `todo` |
| SCR-031 | Viewpoint-Verwaltung | CA | UC-12 | must | `todo` |
| SCR-032 | Property-Sichtbarkeit konfigurieren | CA | UC-21 | must | `todo` |
| SCR-033 | TRM-Konfiguration | CA | UC-19 | must | `todo` |
| SCR-034 | Continuum-Bausteine verwalten | CA | UC-17 | must | `todo` |
| SCR-035 | Continuum-Paket importieren | CA | UC-18 | should | `todo` |
| SCR-036 | Conformance-Analyse | CA | UC-20 | should | `todo` |
| SCR-037 | Auth-Konfiguration (Admin) | CA | UC-03 | must | `todo` |
| SCR-038 | System-Einstellungen | CA | UC-02 | must | `todo` |

---

## Web Portal – Read-only-Publikation

| ID | Screen | Plattform | UC-Bezug | Priorität | Status |
|---|---|---|---|---|---|
| SCR-050 | Portal-Startseite / Katalog-Übersicht | WP | UC-06 | must | `todo` |
| SCR-051 | Entity-Detailansicht (read-only) | WP | UC-06 | must | `todo` |
| SCR-052 | Diagramm-Viewer (read-only) | WP | UC-05, UC-08 | must | `todo` |
| SCR-053 | Dashboard-Ansicht (read-only) | WP | UC-07 | should | `todo` |
| SCR-054 | Änderungshistorie (read-only) | WP | UC-14 | should | `todo` |

---

## Übersicht nach Priorität

**Must-have** (Walking Skeleton + v1.0 Kern):
SCR-001, SCR-002, SCR-003, SCR-010, SCR-011, SCR-012, SCR-020, SCR-021, SCR-022, SCR-025, SCR-026, SCR-030, SCR-031, SCR-032, SCR-033, SCR-034, SCR-037, SCR-038, SCR-050, SCR-051, SCR-052

**Should-have** (v1.0 Erweiterungen):
SCR-023, SCR-024, SCR-027, SCR-035, SCR-036, SCR-053, SCR-054

---

## Reihenfolge für Penpot-Mockups

Empfohlene Reihenfolge (GUI-first → OpenAPI → Code):

1. **SCR-020** Katalog-Browser — Walking Skeleton (UC-06)
2. **SCR-011** Explorer / Navigationsbaum
3. **SCR-002** Setup-Wizard
4. **SCR-021** Diagramm-Editor
5. **SCR-030** Metamodell-Konfiguration
6. **SCR-026** Änderungshistorie
7. **SCR-050** Portal-Startseite
8. **SCR-051** Entity-Detailansicht (Web Portal)

---

## Zugehörige Penpot-Scripts

| Script | Screens |
|---|---|
| `scripts/penpot/hauptfenster.js` | SCR-010, SCR-012 (Light + Dark) |
| _(geplant)_ `scripts/penpot/katalog-browser.js` | SCR-020 |
| _(geplant)_ `scripts/penpot/setup-wizard.js` | SCR-002, SCR-003 |
| _(geplant)_ `scripts/penpot/admin.js` | SCR-030–SCR-038 |
| _(geplant)_ `scripts/penpot/web-portal.js` | SCR-050–SCR-054 |
