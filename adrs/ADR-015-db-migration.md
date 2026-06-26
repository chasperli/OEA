# ADR-015: Datenbank-Migrations-Tool – Drizzle Kit

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: Inhaber des Repositorys
**Konsultiert**: Requirements Engineer
**Informiert**: –

## Kontext und Problem

Das PostgreSQL-Schema (Tabellen, Indizes, AGE-Graph-Setup, Constraints) muss versioniert und automatisch migriert werden — bei jedem Deployment und bei jedem `docker compose up`. Das Migrations-Tool muss in den TypeScript/NestJS-Stack (ADR-012) passen, ohne eine externe JVM-Abhängigkeit einzuführen.

## Entscheidungstreiber

- **Kein JVM im NestJS-Container**: Flyway und Liquibase sind Java-Tools; ihre Verwendung würde entweder einen JVM-Layer im Node.js-Image oder einen separaten Migrations-Container erfordern
- **TypeScript-Integration**: Migrations sollten im gleichen Toolchain wie das Backend verwaltet werden
- **SQL-Transparenz**: Migrations-Dateien müssen als lesbares SQL vorliegen (kein proprietäres Format), damit sie reviewt und versioniert werden können
- **Spring-Boot-ähnliche Auto-Migration**: `docker compose up` soll Migrations automatisch ausführen (kein manueller Schritt)
- **Konsistenz mit ORM**: ADR-012 wählt Drizzle ORM; das Migrations-Tool sollte integriert sein

## Betrachtete Optionen

### Option 1: Drizzle Kit ✓

Drizzle Kit ist das offizielle CLI/Migration-Tool von Drizzle ORM. Es generiert SQL-Migrations aus dem TypeScript-Schema.

- **Pro**:
  - Vollständig integriert mit Drizzle ORM (ADR-012): Schema als TypeScript → SQL-Migration automatisch generiert (`drizzle-kit generate`)
  - Migrations sind plain SQL-Dateien im Repository — lesbar, reviewbar, git-diffbar
  - `drizzle-kit migrate` führt Migrations beim App-Start via NestJS-Bootstrap aus (kein separater Service)
  - Kein JVM, kein externer Prozess: läuft als Node.js-CLI
  - MIT-Lizenz
- **Contra**: Weniger battle-tested als Flyway; bei komplexen Migrations (z.B. Apache AGE Graph-Initialisierung) muss raw SQL direkt in die Migrations-Datei

### Option 2: Flyway (via Docker-Container)

Flyway kann als separater Docker-Container (`flyway/flyway`) vor dem Backend starten und Migrations ausführen.

- **Pro**: Sehr battle-tested, SQL-basiert, grosse Community
- **Contra**: Separater Container in `docker-compose.yml`; Java-basiert; kein nativer TypeScript-Schema-Sync; manuell SQL schreiben (kein Schema-Diff); Lizenz: Apache 2.0 (Community), Teile proprietär (Teams/Enterprise)
- Scheidet aus: unnötige Komplexität für TypeScript-Stack

### Option 3: Liquibase (via Docker-Container)

Ähnlich Flyway, aber XML/YAML/SQL-Formate.

- **Pro**: Mächtig, etabliert, Rollback-Support
- **Contra**: Dieselben Nachteile wie Flyway (JVM, separater Container); XML-Format für Migrations ist weniger lesbar als plain SQL; Lizenz: Apache 2.0 Community, proprietäre Features
- Scheidet aus

### Option 4: node-pg-migrate

Reines Node.js-Migrations-Tool, SQL-basiert.

- **Pro**: Kein JVM, Node.js-nativ, SQL-Migrations
- **Contra**: Kein Schema-Sync mit Drizzle ORM (manuell SQL schreiben); ein zusätzliches Tool neben Drizzle; kleinere Community
- Scheidet aus wenn Drizzle ORM gewählt

## Entscheidung

Wir wählen **Option 1: Drizzle Kit**.

**Workflow:**

```
Schema-Änderung in TypeScript (schema.ts)
  → drizzle-kit generate   → SQL-Migrationsdatei (z.B. 0003_add_audit_events.sql)
  → Git-Commit             → Review im PR
  → docker compose up      → NestJS-Bootstrap führt Migrations automatisch aus
```

**Initialisierungs-Migrations** (manuell ergänzt oder aus Schema generiert):
- `0001_init_schema.sql`: Core-Tabellen — entities, entity_versions, audit_events, entity_plateau_states (aus Drizzle-Schema generiert)
- `0002_init_indexes.sql`: GIN-Index auf `entities.properties`, B-Tree-Indizes auf häufige Filter-Spalten

**NestJS-Integration:**

```typescript
// app.module.ts Bootstrap
async function bootstrap() {
  await migrate(db, { migrationsFolder: './drizzle' });
  // dann App starten
}
```

Migrations laufen synchron vor dem App-Start — kein separater Container nötig.

## Konsequenzen

### Positive Konsequenzen

- `docker compose up` führt automatisch alle ausstehenden Migrations aus — zero-config für Betreiber
- SQL-Migrationsdateien sind im Repository versioniert und im PR reviewbar
- Drizzle Kit + Drizzle ORM: TypeScript-Schema und DB-Schema bleiben automatisch synchron
- Kein JVM, kein zusätzlicher Docker-Container für Migrations

### Negative Konsequenzen / Trade-offs

- Drizzle Kit ist jünger als Flyway/Liquibase; Edge-Cases (komplexe Schema-Änderungen) können manuelle SQL-Korrekturen in der generierten Datei erfordern
- Rollback: Drizzle Kit unterstützt kein automatisches Rollback; Down-Migrations müssen manuell geschrieben werden (akzeptabel für v1.0)
- `entity_versions` und `audit_events` werden von Drizzle Kit nicht automatisch mit Custom-Triggern versehen; die Snapshot-Logik liegt im NestJS-Service-Layer

## Bezüge

**Verwandte ADRs**: [ADR-012](./ADR-012-backend-stack.md) (Drizzle ORM), [ADR-011](./ADR-011-frontend-framework.md)

**Konzept**: [§23 #1 Persistenz-Entscheidung](../concept/90-backlog/23-offene-punkte.md) (PostgreSQL 15 + JSONB; AGE deferred — ADR-016)

**Requirements**: [REQ-075](../requirements/req/REQ-075-plattformunabhaengigkeit-deployment.md) (Docker-Compose-Deployment ohne manuelle Setup-Schritte)
