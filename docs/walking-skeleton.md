# Walking Skeleton – Definition

**Stand**: 2026-10-04
**Status**: definiert (überarbeitet: Story-Liste aktualisiert, Entitäten per Batch-API statt Formular, Platzierung in S1–S2)

---

## Was ist der Walking Skeleton?

Ein Walking Skeleton ist der dünnstmögliche End-to-End-Schnitt durch alle technischen Schichten, der echten Wert für mindestens einen Stakeholder liefert. Er beweist, dass die Architektur funktioniert — nicht als Hello-World, sondern als minimale, nutzbare Version des eigentlichen Produkts.

AGENTS.md schreibt vor: **genau ein End-to-End-Use-Case**. Der Skeleton wird **am Anfang** umgesetzt (Sprint S1–S2) und erst danach in die Breite ausgebaut (Anti-Pattern AP-25 „Walking Skeleton als Big Bang“ in `docs/anti-patterns.md`).

---

## Entscheidung: UC-06 (Katalog anlegen und verwenden)

### Begründung

| Kriterium | UC-05 Architektur-Vision (Solution, Deltas, Canvas) | UC-06 Katalog | Warum Katalog gewinnt |
|---|---|---|---|
| Frontend-Komplexität | Vue Flow (Nested Nodes, Layout-Engine, Drag & Drop) | Tabelle (sortierbar) | Katalog ist deutlich einfacher zu rendern |
| Domain-Modell-Komplexität | Solution, EntityDelta, Plateau, Conflict-Detection | ArchitectureEntity + EntityTypeDefinition | Katalog kommt mit dem Kern-Modell aus |
| Externe Abhängigkeiten | Vue Flow, ELK.js, D3 | keine zusätzlichen Libraries | weniger Risiko am Projektstart |
| Stakeholder-Value | Architekt kann modellieren | **Jeder** Stakeholder kann Inventar einsehen | universellerer Wert |
| Umfang | > 30 SP, davon > 50 % Canvas-Code | **31 SP** inkl. Bootstrapping und Login (siehe unten) | realistisch in 2 Sprints inkl. Projekt-Setup |

UC-06 hängt nur von UC-01 (Login) und UC-04 (Metamodell) ab, nicht von UC-05 (siehe Vorbedingungen in UC-06). UC-05 ergänzt den Katalog später um den fachlichen Weg, Entitäten als Delta einer Solution zu erfassen.

**Was der Skeleton beweist**:
- Docker Compose startet (REQ-075): Backend, DB, Auth, Frontend
- Persistenz: Flyway-Migrationen, Entity-Persistenz mit JSONB-Properties, Metamodell-Abfrage, Audit-Events (ADR-015, ADR-016, ADR-024)
- OIDC-Auth: Token-Validierung, Rollen-Mapping (ADR-006)
- REST-API spec-first aus `api/openapi.yaml`: Metamodell-Import, Entity-Batch, Katalog-Anlage, Katalog-Abfrage (ADR-013)
- Frontend: Vue-App rendert im Browser; Katalog-Anlage und Katalog-Tabelle (ADR-011, ADR-014)
- End-to-End-Datenfluss: Import-Skript → API → DB → Tabelle im Browser

---

## Prerequisite-UCs (müssen im Skeleton minimal umgesetzt werden)

UC-06 allein ist nicht startbar. Drei UCs sind Voraussetzungen, dazu ein Weg, Entitäten anzulegen:

| UC | Warum notwendig | Minimal-Scope |
|---|---|---|
| **UC-02** (Bootstrapping) | Ohne Admin-User und `instance-slug` (ADR-001) gibt es keine Instanz | US-013 (lokales Bootstrapping) |
| **UC-01** (Login) | Ohne Auth ist keine API-Anfrage möglich | US-001 (OIDC-Login) |
| **UC-04** (Metamodell, minimal) | Ohne mindestens einen EntityType gibt es keinen Katalog | US-033 (Starter-Paket importieren) |
| Entitäten anlegen | Eine Direkt-Anlage im Katalog gibt es fachlich nicht; Entitäten entstehen als Solution-Delta (UC-05) oder per Import | US-141 (Batch-API, Minimal-Scope) |

---

## Minimal-User-Stories des Walking Skeleton

Diese 6 User Stories bilden den Walking Skeleton. Alles andere kommt danach.

| # | User Story | UC | SP | Skeleton-Scope | Was wird bewiesen |
|---|---|---|---|---|---|
| 1 | [US-013](../requirements/user-stories/US-013-lokales-bootstrapping.md): Lokales Bootstrapping | UC-02 | 5 | vollständig | DB-Schema, Flyway, instance-slug (ADR-001), erster Admin-User |
| 2 | [US-001](../requirements/user-stories/US-001-oidc-login.md): OIDC-Login | UC-01 | 8 | vollständig | OIDC-Token-Flow, Auth-Stack (ADR-006), Session |
| 3 | [US-033](../requirements/user-stories/US-033-metamodell-importieren.md): Metamodell / Starter-Paket importieren | UC-04 | 5 | vollständig | Paket-Import (ADR-002), `ApplicationComponent` verfügbar, `scope=imported` |
| 4 | [US-141](../requirements/user-stories/US-141-entitaeten-batch-import.md): Entitäten per Batch anlegen | – | 5 | AC1 (upsert von Entitäten); Verbindungen, dryRun und Service-Account-Audit (AC2–AC4) folgen später | Entity-Persistenz, JSONB, Validierung gegen Metamodell, Audit |
| 5 | [US-046](../requirements/user-stories/US-046-katalog-anlegen.md): Katalog anlegen | UC-06 | 3 | vollständig (inkl. primärer Entitätstyp) | Katalog-Konfiguration, Metamodell-API, Rollenprüfung |
| 6 | [US-049](../requirements/user-stories/US-049-katalog-daten-anzeigen.md): Katalog-Daten anzeigen | UC-06 | 5 | Tabelle, Sortierung, Leerzustand; Standardspalten `name` und `status`, solange keine Spalten konfiguriert sind; Joins, Paginierung und SavedViews folgen später | Abfrage-API, Tabelle im Vue-Frontend |

**Gesamt: 31 Story Points** plus einmaliges Projekt-Setup (Maven-Modul `backend/`, Vue-Projekt `frontend/`, `api/openapi.yaml`, Docker Compose mit PostgreSQL und Keycloak, CI). Geplant für **Sprint S1–S2**.

Die ausgesparten Akzeptanzkriterien von US-141 und US-049 werden in den Ausbau-Sprints nachgezogen; die Stories gelten erst dann als `done`.

---

## Walking-Skeleton-Szenario (End-to-End-Ablauf)

```
1. Admin startet docker compose up
   → PostgreSQL, Backend, Keycloak, Frontend starten
   → Flyway-Migrationen laufen durch

2. Admin öffnet Browser: https://oea.local
   → Vue-App lädt

3. Admin ruft /setup auf (noch kein Admin vorhanden)
   → US-013: gibt instance-slug "acme-corp" und OIDC-Config ein
   → Ergebnis: erster Admin-User gespeichert; instance-slug = "acme-corp"

4. Admin loggt sich ein (UC-01)
   → US-001: OIDC-Redirect → Token → Session (Token-Ablage nach Security-Review, nicht im LocalStorage)
   → Admin landet auf leerer Startseite

5. Admin importiert Starter-Paket
   → US-033: "Starter-Konfiguration importieren" → oea-starter-togaf-classic (ADR-005)
   → ApplicationComponent, DataObject, TechnologyComponent etc. sind als EntityTypes verfügbar

6. Import-Skript legt Entitäten an
   → US-141: POST /api/v1/entities/batch (strategy=upsert) mit z. B. 3 ApplicationComponents
   → "CRM-System", "ERP", "Intranet" sind im Repository; Audit-Events geschrieben

7. Admin legt Katalog an
   → US-046: "Neuer Katalog" → Name "Applikations-Inventar", primärer Entitätstyp ApplicationComponent

8. Nutzer öffnet den Katalog
   → US-049: Tabelle zeigt 3 Zeilen mit name | status, sortierbar nach name

9. Ergebnis: Die importierten Applikationen sind im EA-Repository.
   Jeder eingeloggte Nutzer sieht sie im Katalog.
```

Dieses Szenario beweist alle technischen Layer End-to-End. Die Architektur funktioniert.

---

## Explizit ausgeschlossen (kommt nach Walking Skeleton)

| Feature | UC | Begründung |
|---|---|---|
| Solution, Deltas, Canvas / Diagramme | UC-05 | Temporales Modell und Vue Flow — höchste Komplexität |
| Spalten-Konfiguration, Joins, Filter, Paginierung, SavedViews | UC-06 (US-047 ff.) | Ausbau; Standardspalten reichen für den Skeleton |
| Verbindungen, dryRun, Service-Accounts im Batch-Import | US-141 AC2–AC4 | Ausbau |
| Anlage-Wizard | US-069 / REQ-066 | Ausbau |
| Dashboard | UC-07 | setzt funktionierende Entitäten voraus |
| Data Lineage | UC-08 | Feature-Track; setzt Entity-Modell voraus |
| Arc42 | UC-09 | Feature-Track |
| BPMN / Prozesse | UC-10 | Feature-Track |
| Web-Portal (read-only) | ADR-008 | Dual-Track; nach Client-App |
| Passwort/TOTP/Passkey-Login, Remote-Bootstrapping | UC-01, UC-02, UC-03 (Rest) | Ausbau; OIDC und lokales Bootstrapping reichen für den Skeleton |

---

## Technischer Stack (Walking Skeleton bringt die Entscheidungen zum Glühen)

| Schicht | Entscheidung | ADR |
|---|---|---|
| Deployment | Docker Compose; `docker compose up` = lauffähig | REQ-075, ADR-027 |
| Backend | Java 21 + Spring Boot 3 + Hibernate; Maven-Modul `backend/`; Schichten api/app/core | ADR-012, ADR-027, ADR-028 |
| Datenbank | PostgreSQL 15 + JSONB; Flyway-Migrationen | ADR-015, ADR-016 |
| API | REST, JSON; OpenAPI 3.x spec-first (`api/openapi.yaml`) | ADR-013 |
| Auth | OIDC; Keycloak lokal, Entra ID / Authentik produktiv | ADR-006 |
| Frontend | Vue 3 + TypeScript + PrimeVue (DataTable) | ADR-011, ADR-014 |
| Tests | Cucumber JVM für die Feature Files der Skeleton-REQs | ADR-029 |
| Entity-IDs | Integer; instance-slug beim Bootstrapping gesetzt | ADR-001 |
| Metamodell | scope: built-in / imported / organization | ADR-002 |
| Starter-Paket | oea-starter-togaf-classic als JSON-Import | ADR-005 |
| Audit | Audit-Events in separatem Schema, von Anfang an | ADR-024 |

---

## DoD-Kriterium

Das Walking Skeleton gilt als implementiert, wenn das Szenario oben vollständig durchläuft:
- `docker compose up` startet ohne Fehler
- Bootstrapping-Schritt abgeschlossen
- OIDC-Login erfolgreich
- Starter-Paket importiert
- Entitäten per Batch-API angelegt
- Katalog angelegt, Entitäten in der Katalog-Tabelle sichtbar und sortierbar
- Cucumber-Szenarien der Skeleton-Akzeptanzkriterien grün in CI

**Kein Canvas, keine Solutions, keine Joins, keine Filter, kein Dashboard** — das ist der Skeleton.
