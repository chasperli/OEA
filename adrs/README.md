# Architectural Decision Records (ADRs)

Dokumentierte Architektur-Entscheidungen mit Kontext, Optionen, Wahl und Konsequenzen.

## Konvention

- Dateiname: `ADR-NNN-kurzname.md` (3-stellig nummeriert)
- Template: `adr.template.md`
- Status-Workflow: `proposed → accepted | rejected → superseded`
- Eine ADR wird nicht gelöscht, sondern höchstens als `superseded` markiert und durch eine neue ersetzt

## Erste anstehende ADRs (Gruppe A – Vor-ADRs)

Diese Entscheidungen sollten vor oder parallel zum Requirements Engineering geklärt werden, weil sie den möglichen Lösungsraum prägen:

| ID | Titel | Status | Priorität |
|---|---|---|---|
| ADR-001 | URN-Schema und Stabilitäts-Garantien | draft | hoch |
| ADR-002 | Enterprise Continuum: Ein Repo oder zwei? | draft | hoch |
| ADR-003 | Product vs. Project: Koexistenz oder Trennung? | draft | hoch |
| ADR-004 | Reifikations-Details (Max-Tiefe, UI-Darstellung) | draft | mittel |
| ADR-005 | Application-vs-Technology-Klassifikations-Prinzip | draft | mittel |

## Weitere ADR-Kandidaten

Siehe [§23 Offene Punkte](../concept/90-backlog/23-offene-punkte.md) – aktuell 47 Kandidaten.

## Slash-Command

In `.claude/commands/`:
- `/new-adr` – legt neue ADR an, mit nächster freier Nummer

## Übersicht aller ADRs

<!-- Nach Anlegen der ersten ADRs hier eintragen oder per Skript generieren -->

| ID | Titel | Status | Datum | Supersedes |
|---|---|---|---|---|
| [ADR-006](./ADR-006-auth-stack-wahl.md) | Auth-Stack-Wahl (Entra ID + Authentik Pflicht, lokale Auth optional) | accepted | 2026-06-24 | – |
| [ADR-007](./ADR-007-canvas-bibliothek.md) | Canvas-Bibliothek für interaktive Diagramm-Editierung (React Flow) | accepted | 2026-06-26 | – |
| [ADR-008](./ADR-008-gui-architektur-dual-track.md) | GUI-Architektur: Client App + Web Portal (Dual-Track-Delivery) | accepted | 2026-06-26 | – |
| [ADR-009](./ADR-009-client-app-framework.md) | Client-App-Framework: Electron (vs. Tauri v2) | accepted | 2026-06-26 | – |
| [ADR-010](./ADR-010-n-connection-data-lineage.md) | Modellierung DataFlow↔DataObject: n-Connection vs. Property-String | draft | 2026-06-26 | – |
