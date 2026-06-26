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
| ADR-001 | URN-Schema und Stabilitäts-Garantien | **accepted** | hoch |
| ADR-002 | Enterprise Continuum: Ein Repo oder zwei? | **accepted** | hoch |
| ADR-003 | Product vs. Project: Koexistenz oder Trennung? | **accepted** | hoch |
| ADR-004 | Reifikations-Details (Max-Tiefe, UI-Darstellung) | **accepted** | mittel |
| ADR-005 | Application-vs-Technology-Klassifikations-Prinzip | **accepted** | mittel |

## Weitere ADR-Kandidaten

Siehe [§23 Offene Punkte](../concept/90-backlog/23-offene-punkte.md) – aktuell 47 Kandidaten.

## Slash-Command

In `.claude/commands/`:
- `/new-adr` – legt neue ADR an, mit nächster freier Nummer

## Übersicht aller ADRs

<!-- Nach Anlegen der ersten ADRs hier eintragen oder per Skript generieren -->

| ID | Titel | Status | Datum | Supersedes |
|---|---|---|---|---|
| [ADR-001](./ADR-001-urn-schema.md) | Integer-ID intern + externe URN `urn:oea:{instance}:{id}` | accepted | 2026-06-26 | – |
| [ADR-002](./ADR-002-continuum-repository.md) | Ein Repository + Import-Mechanismus (scope: built-in/imported/organization) | accepted | 2026-06-26 | – |
| [ADR-003](./ADR-003-product-vs-project.md) | work-initiative als built-in Basis; product/project als Metamodell-Subtypen | accepted | 2026-06-26 | – |
| [ADR-004](./ADR-004-reifikation-details.md) | Max-Tiefe 1 (v1.0); alle Connections haben Integer-ID; 3-Dot-Circle-UI | accepted | 2026-06-26 | – |
| [ADR-005](./ADR-005-app-vs-tech-default.md) | Kein erzwungener Default; zwei optionale Starter-Pakete beim Bootstrapping | accepted | 2026-06-26 | – |
| [ADR-006](./ADR-006-auth-stack-wahl.md) | Auth-Stack-Wahl (Entra ID + Authentik Pflicht, lokale Auth optional) | accepted | 2026-06-24 | – |
| [ADR-007](./ADR-007-canvas-bibliothek.md) | Canvas-Bibliothek: Vue Flow (`@vue-flow/core`) — aktualisiert von React Flow infolge ADR-011 | accepted | 2026-06-26 | – |
| [ADR-008](./ADR-008-gui-architektur-dual-track.md) | GUI-Architektur: Client App + Web Portal (Dual-Track-Delivery) | accepted | 2026-06-26 | – |
| [ADR-009](./ADR-009-client-app-framework.md) | Client-App-Framework: Electron (vs. Tauri v2) | accepted | 2026-06-26 | – |
| [ADR-010](./ADR-010-n-connection-data-lineage.md) | Modellierung DataFlow↔DataObject: n-Connection vs. Property-String | accepted | 2026-06-26 | – |
| [ADR-011](./ADR-011-frontend-framework.md) | Frontend-Framework: Vue 3 + TypeScript (Composition API) | accepted | 2026-06-26 | – |
| [ADR-012](./ADR-012-backend-stack.md) | Backend-Stack: TypeScript + NestJS + Drizzle ORM; PlantUML via plantuml-server | accepted | 2026-06-26 | – |
| [ADR-013](./ADR-013-api-stil.md) | API-Stil: REST + OpenAPI 3.x (code-first via @nestjs/swagger) | accepted | 2026-06-26 | – |
| [ADR-014](./ADR-014-frontend-komponentenbibliothek.md) | Frontend-Komponentenbibliothek: PrimeVue 4 + TipTap 2.x | accepted | 2026-06-26 | – |
| [ADR-015](./ADR-015-db-migration.md) | DB-Migration: Drizzle Kit (integriert mit Drizzle ORM, kein JVM) | accepted | 2026-06-26 | – |
