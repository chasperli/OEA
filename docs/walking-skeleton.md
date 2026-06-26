# Walking Skeleton – Definition

**Stand**: 2026-06-26
**Status**: definiert

---

## Was ist der Walking Skeleton?

Ein Walking Skeleton ist der dünnstmögliche End-to-End-Schnitt durch alle technischen Schichten, der echten Wert für mindestens einen Stakeholder liefert. Er beweist, dass die Architektur funktioniert — nicht als Hello-World, sondern als minimale, nutzbare Version des eigentlichen Produkts.

CLAUDE.md schreibt vor: **genau ein End-to-End-Use-Case**.

---

## Entscheidung: UC-06 (Katalog anlegen und verwenden)

### Begründung

| Kriterium | UC-05 Canvas | UC-06 Katalog | Warum Katalog gewinnt |
|---|---|---|---|
| Frontend-Komplexität | React Flow (Nested Nodes, Layout-Engine, Drag & Drop) | React-Tabelle (sortierbar, paginierbar) | Katalog ist 4× einfacher zu rendern |
| Domain-Modell-Komplexität | Solution, EntityDelta, Plateau, Conflict-Detection | ArchitectureEntity + EntityTypeDefinition | Katalog kommt mit dem Kern-Modell aus |
| Externe Abhängigkeiten | React Flow, ELK.js, D3 | keine zusätzlichen Libraries | weniger Risiko im ersten Sprint |
| Stakeholder-Value | Architekt kann modellieren | **Jeder** Stakeholder kann Inventar einsehen | universellerer Wert |
| Realismus für Sprint 1 | ~34 SP (alle USs), davon >50% Canvas-Code | **22 SP** (Minimal-Set, siehe unten) | realistisch in 2 Wochen |

UC-05 (Canvas) kommt **nach** dem Walking Skeleton — es setzt UC-06 voraus (Entitäten müssen existieren, bevor sie gezeichnet werden können). UC-06 ist damit der natürliche erste Schritt.

**Was UC-06 beweist**:
- Docker Compose startet (REQ-075): API, DB, Auth, Frontend
- PostgreSQL-Schema: Migrations, Entity-CRUD, Metamodell-Abfrage
- OIDC-Auth: Token-Validierung, Rollen-Mapping (ADR-006)
- REST-API: Endpunkte für EntityType-Import, Entity-CRUD, Catalog-Query
- Frontend: React-App rendert im Browser; Katalog-Tabelle; Formular zur Entitäts-Anlage
- End-to-End-Datenfluss: Admin tippt Name → API → DB → Tabelle im Browser

---

## Prerequisite-UCs (müssen parallel implementiert werden)

UC-06 allein ist nicht startbar. Zwei UCs sind Voraussetzungen:

| UC | Warum notwendig | Minimal-Scope |
|---|---|---|
| **UC-02** (Bootstrapping) | Ohne Admin-User und `instance-slug` (ADR-001) gibt es keine Instanz | US-013 (Bootstrapping) |
| **UC-01** (Login) | Ohne Auth ist keine API-Anfrage möglich | US-001 (OIDC Login) |
| **UC-04** (Metamodell, minimal) | Ohne mindestens einen EntityType gibt es keinen Katalog | US-033 (Starter-Paket importieren) |

---

## Minimal-User-Stories des Walking Skeleton

Diese 6 User Stories bilden den Walking Skeleton. Alles andere kommt danach.

| # | User Story | UC | SP | Was wird bewiesen |
|---|---|---|---|---|
| 1 | [US-013](../requirements/user-stories/US-013-lokales-bootstrapping.md): Lokales Bootstrapping | UC-02 | 3 | DB-Schema, instance-slug (ADR-001), erster Admin-User |
| 2 | [US-001](../requirements/user-stories/US-001-oidc-login.md): OIDC Login | UC-01 | 3 | OIDC-Token-Flow, Auth-Stack (ADR-006), JWT-Validierung |
| 3 | [US-033](../requirements/user-stories/US-033-metamodell-importieren.md): Starter-Paket importieren | UC-04 | 5 | Paket-Import (ADR-002), `application-component` EntityType verfügbar, `scope=imported` |
| 4 | [US-046](../requirements/user-stories/US-046-katalog-anlegen.md): Katalog anlegen | UC-06 | 3 | Katalog-Entity in DB, Admin-Workflow |
| 5 | [US-047](../requirements/user-stories/US-047-primaeren-entitytype-waehlen.md): Primären EntityType wählen | UC-06 | 5 | Metamodell-API, Katalog-Konfiguration |
| 6 | [US-051](../requirements/user-stories/US-051-entitaet-im-katalog-anlegen.md): Entität im Katalog anlegen | UC-06 | 3 | Entity-CRUD-API, DB-Persistenz, Tabellen-Rendering im Frontend |

**Gesamt: 22 Story Points** — realistisch für Sprint 1 (2 Wochen, 1 Fullstack-Entwickler).

---

## Walking-Skeleton-Szenario (End-to-End-Ablauf)

```
1. Admin startet docker compose up
   → PostgreSQL, API-Server, Auth-Service starten
   → Migrations laufen durch (Flyway/Liquibase)

2. Admin öffnet Browser: https://oea.local
   → React-App lädt

3. Admin ruft /setup auf (noch kein Admin vorhanden)
   → US-013: gibt instance-slug "acme-corp" und OIDC-Config ein
   → Ergebnis: erster Admin-User gespeichert; instance-slug = "acme-corp"

4. Admin loggt sich ein (UC-01)
   → US-001: OIDC-Redirect → Token → JWT in LocalStorage
   → Admin landet auf Dashboard (leere Startseite)

5. Admin importiert Starter-Paket
   → US-033: klickt "Starter-Konfiguration importieren"
   → wählt oea-starter-togaf-classic (ADR-005)
   → application-component, data-object, technology-component etc. sind als EntityTypes verfügbar

6. Admin legt Katalog an
   → US-046: klickt "Neuer Katalog" → Name: "Applikations-Inventar"

7. Admin wählt primären EntityType
   → US-047: wählt "application-component" aus Dropdown

8. Admin legt erste Entität an
   → US-051: klickt "Neu" → Formular: Name "CRM-System" → Speichern
   → Tabelle zeigt: CRM-System | application-component | active

9. Ergebnis: "CRM-System" ist im EA-Repository. 
   Jeder eingeloggte Nutzer sieht es im Katalog.
```

Dieses Szenario beweist alle technischen Layer End-to-End. Die Architektur funktioniert.

---

## Explizit ausgeschlossen (kommt nach Walking Skeleton)

| Feature | UC | Begründung |
|---|---|---|
| Canvas / Diagramme | UC-05 | React Flow — höchste Frontend-Komplexität; baut auf UC-06 auf |
| Join-Spalten, Filter, Sortierung | UC-06 (advanced) | Sprint 2; Kern-Katalogtabelle reicht für Skeleton |
| Anlage-Wizard | US-069 / REQ-066 | Sprint 2; einfaches Formular reicht |
| Dashboard | UC-07 | Sprint 3+; setzt funktionierende Entitäten voraus |
| Data Lineage | UC-08 | Feature-Track; setzt Entity-Modell voraus |
| Arc42 | UC-09 | Feature-Track |
| BPMN / Prozesse | UC-10 | Feature-Track |
| Web-Portal (read-only) | UC-08 / ADR-008 | Dual-Track; nach Client-App |
| Passwort/TOTP Login | UC-01 (advanced) | Sprint 2; OIDC reicht für Skeleton |

---

## Technischer Stack (Walking Skeleton bringt die Entscheidungen zum Glühen)

| Schicht | Entscheidung | ADR |
|---|---|---|
| Deployment | Docker Compose; `docker compose up` = lauffähig | REQ-075 |
| Datenbank | PostgreSQL 15; Flyway/Liquibase Migrations | ADR-001, REQ-075 |
| API | REST, JSON; `/api/v1/entities`, `/api/v1/metamodel` | ADR-001 |
| Auth | OIDC; JWT; Keycloak oder Entra ID | ADR-006 |
| Frontend | React + TypeScript; Catalog = HTML-Tabelle für den Skeleton | ADR-008, ADR-009 |
| Entity-IDs | Integer; instance-slug beim Bootstrapping gesetzt | ADR-001 |
| Metamodell | scope: built-in / imported / organization | ADR-002 |
| Starter-Paket | oea-starter-togaf-classic als JSON-Import | ADR-005 |

---

## DoD-Kriterium

Das Walking Skeleton gilt als implementiert, wenn das Szenario in Abschnitt 3 vollständig durchläuft:
- `docker compose up` startet ohne Fehler
- Bootstrapping-Schritt abgeschlossen
- OIDC-Login erfolgreich
- Starter-Paket importiert
- Katalog anlegen und erste Entität speichern
- Entität in Katalog-Tabelle sichtbar

**Kein Canvas, keine Joins, keine Filter, kein Dashboard** — das ist der Skeleton.
