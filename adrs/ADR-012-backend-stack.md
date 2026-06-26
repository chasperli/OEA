# ADR-012: Backend-Stack – TypeScript + NestJS

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: Inhaber des Repositorys
**Konsultiert**: Requirements Engineer
**Informiert**: ADR-013 (API-Stil), ADR-015 (DB-Migration)

## Kontext und Problem

OEA benötigt einen Backend-Service, der:
- die REST-API (alle `/api/v1/...`-Endpunkte aus den REQs) bereitstellt
- das Meta-Metamodell und die EntityType-Engine ausführt
- PostgreSQL + Apache AGE abfragt (SQL Analytics + openCypher Graph)
- PlantUML-Diagramme rendert (REQ-069)
- WebSocket/SSE-Events für Echtzeit-Updates sendet (§23 #26)

Die Sprachwahl wirkt sich direkt auf die Lernkurve aus, da der primäre Entwickler neu in der Web-Entwicklung ist und bereits TypeScript für das Frontend (ADR-011, Vue 3) lernt.

## Entscheidungstreiber

- **Typensicherheit**: Backend muss vollständig typisiert sein; kein implizites `any` in Produktionscode
- **Eine Sprache im Stack**: Gleiche Sprache wie Frontend reduziert Kontextwechsel und ermöglicht Typ-Sharing
- **Lernkurve**: Primärer Entwickler kennt weder Java noch umfangreiche Backend-Frameworks
- **PlantUML**: Rendering-Lösung muss ohne JVM im Backend-Container auskommen (reiner Node.js-Container)
- **PostgreSQL + Apache AGE**: Muss openCypher-Queries via JDBC/pg-Driver absenden können
- **OSS-Kompatibilität**: Apache 2.0-kompatible Lizenzen
- **REQ-075**: Deploybar als Docker-Container ohne proprietäre Abhängigkeiten

## Betrachtete Optionen

### Option 1: TypeScript + NestJS ✓

NestJS ist ein opinionated Node.js-Framework mit Angular-ähnlicher Architektur (Decorators, DI, Module). TypeScript-first by design.

- **Pro**:
  - Gleiche Sprache wie Frontend (ADR-011): ein Stack, eine Lernkurve
  - Typ-Sharing: DTOs und Interfaces via `packages/shared-types` oder OpenAPI-generierte Typen
  - Opinionated (Module, Controller, Service, Guard): reduziert Entscheidungsmüdigkeit
  - `@nestjs/swagger`: OpenAPI 3.x Spec aus Code generiert (kein separates Spec-File)
  - Aktive Community, gute Dokumentation
  - `pg` (node-postgres) + `@apache-age/pg` für Apache AGE openCypher-Queries
  - Drizzle ORM: TypeScript-first, SQL-nah, JSONB-Support, kein Black-Box-Magic
  - MIT-Lizenz
- **Contra**:
  - PlantUML: kein nativer Java-Embed → separater `plantuml-server`-Container nötig (aber konfigurierbar, REQ-075-konform)
  - Etwas mehr RAM als Go (~80–150 MB)

### Option 2: Java 21 + Spring Boot 3.x

- **Pro**: PlantUML direkt eingebettet (keine separater Container); mature Enterprise-Ökosystem
- **Contra**: Primärer Entwickler kennt Java kaum; zwei Sprachen im Stack (Java + TypeScript); höherer RAM-Verbrauch (300–500 MB); langsamere Startup-Zeit (5–15 s); kein Typ-Sharing mit TypeScript-Frontend
- Scheidet aus: Lernkurve und Zwei-Sprachen-Overhead überwiegen den PlantUML-Vorteil

### Option 3: Go + Chi

- **Pro**: Sehr schnell, geringer Ressourcenverbrauch
- **Contra**: Drittes Paradigma neben TypeScript; kein PlantUML-Vorteil; kleineres Bibliotheks-Ökosystem für komplexe Domain-Modelle; kein Typ-Sharing
- Scheidet aus

## Entscheidung

Wir wählen **Option 1: TypeScript + NestJS**.

Begründung: Ein-Sprachen-Stack (TypeScript überall) ist der dominante Faktor — der primäre Entwickler lernt TypeScript sowieso für das Frontend. NestJS ist opinionated genug, um Entscheidungen zu reduzieren, und bietet alle notwendigen Bausteine. Der PlantUML-Nachteil (separater Container) ist durch einen konfigurierbaren `plantUmlServerUrl` lösbar — Enterprise-Kunden können ihre bestehende PlantUML-Instanz eintragen; KMU bekommen einen vorkonfigurierten Container in `docker-compose.yml`.

**Gewählter Stack:**

| Komponente | Technologie | Version | Lizenz |
|---|---|---|---|
| Runtime | Node.js | 22 LTS | MIT |
| Framework | NestJS | 10.x | MIT |
| DB-Client | node-postgres (`pg`) | 8.x | MIT |
| ORM | Drizzle ORM | 0.x | Apache 2.0 |
| Validierung | class-validator + class-transformer | aktuell | MIT |
| PlantUML | `plantuml/plantuml-server` (Docker) | latest | LGPL |

**PlantUML-Integration:**
- `GET /api/v1/render/plantuml` → Backend sendet HTTP-Request an konfigurierten `plantUmlServerUrl` → gibt SVG zurück
- Konfiguration: `PLANTUML_SERVER_URL=http://plantuml:8080` (Umgebungsvariable)
- Default in `docker-compose.yml`: mitgelieferter `plantuml-server`-Container
- Enterprise: eigene URL konfigurieren → OEA nutzt diese ohne eigenen Container (REQ-075)

## Konsequenzen

### Positive Konsequenzen

- Entwickler lernt TypeScript einmal und kann sofort in Front- und Backend arbeiten
- Typ-Sharing: DTOs aus Backend per `openapi-typescript` in Vue 3 Frontend generieren (kein manuelles Duplizieren)
- NestJS-Struktur (Module/Controller/Service) ist klar und wartbar
- Drizzle ORM: JSONB-Properties der Entities sind direkt modellierbar; Graph-Traversal via Recursive CTEs in v1.0 (ADR-016)
- Docker-Image: reines Node.js-Image (~200 MB) ohne JVM

### Negative Konsequenzen / Trade-offs

- PlantUML als separater Docker-Service; minimaler Betriebsaufwand aber dokumentiert
- NestJS-Lernkurve: Decorators, DI, Module sind ungewohnt; Dokumentation ist gut
- Recursive CTEs für Graph-Traversal: bei Tiefen > 5 Hops oder sehr grossen Graphen kann Performance nachlassen — Apache AGE als v2.0-Option (ADR-016)

### Folgeentscheidungen

- **ADR-013**: API-Stil und OpenAPI-Strategie (NestJS Swagger-Integration)
- **ADR-014**: Frontend-Komponentenbibliothek (Typ-Sharing via OpenAPI)
- **ADR-015**: DB-Migration (Drizzle Kit, integriert mit Drizzle ORM)
- **Monorepo-Struktur**: `apps/backend` (NestJS), `apps/frontend` (Vue 3), `packages/shared-types` — zu entscheiden beim Walking-Skeleton-Setup

## Bezüge

**Verwandte ADRs**: [ADR-011](./ADR-011-frontend-framework.md) (Vue 3 + TypeScript), [ADR-013](./ADR-013-api-stil.md), [ADR-015](./ADR-015-db-migration.md), [ADR-016](./ADR-016-persistenz-strategie.md) (DB-Wahl)

**Requirements**: [REQ-069](../requirements/req/REQ-069-arc42-dokumentation-bearbeiten.md) (PlantUML), [REQ-075](../requirements/req/REQ-075-plattformunabhaengigkeit-deployment.md) (Portabilität)

**Konzept**: [§21 API-Architektur](../concept/70-platform/21-api-architektur.md), [§22.14 Empfehlung Walking Skeleton](../concept/70-platform/22-auswertbarkeit.md)
