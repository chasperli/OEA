# ADR-015: Datenbank-Migrations-Tool – Flyway

**Status**: accepted
**Datum**: 2026-06-27
**Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
**Konsultiert**: Business Engineer
**Informiert**: –

## Kontext und Problem

Das Datenbankschema (Tabellen, Indizes, Constraints) muss versioniert und automatisch migriert werden — bei jedem Deployment und bei `docker compose up`. OEA unterstützt fünf Zieldatenbanken (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle; ADR-012). Das Migrations-Tool muss in den Java/Spring-Boot-Stack (ADR-012) passen und alle fünf Datenbanken unterstützen.

## Entscheidungstreiber

- **Multi-DB-Support**: PostgreSQL, MySQL, MariaDB, SQL Server, Oracle müssen alle unterstützt werden
- **Spring-Boot-Integration**: automatische Migrations bei App-Start ohne separaten Container
- **SQL-Transparenz**: plain SQL-Dateien, reviewbar und git-diffbar
- **OSS**: keine kommerziellen Features nötig; Community Edition muss ausreichen
- **REQ-075**: `docker compose up` soll ohne manuelle Migrations-Schritte funktionieren

## Betrachtete Optionen

### Option 1: Flyway Community ✓

Flyway ist das de-facto-Standard-Migrations-Tool im Java/Spring-Ökosystem.

- **Pro**:
  - Spring Boot hat nativen Flyway-Support (`spring.flyway.*`): Migrations laufen automatisch beim App-Start
  - Unterstützt alle 5 Ziel-DBs in der Community Edition: PostgreSQL, MySQL, MariaDB, SQL Server, Oracle
  - plain SQL-Migrationsdateien (`V1__init.sql`, `V2__add_index.sql`) — lesbar, reviewbar, versioniert
  - Battle-tested: im Einsatz in tausenden von Java-Enterprise-Projekten
  - Apache 2.0-Lizenz (Community Edition)
- **Contra**: Kein automatisches Schema-Diff aus Java-Entities (Migrations werden manuell geschrieben); Rollback-Support nur in kommerzieller Edition — Down-Migrations müssen manuell als neue Migration geschrieben werden

### Option 2: Liquibase Community

Ähnlich Flyway, aber XML/YAML/SQL-Formate.

- **Pro**: Rollback-Support in Community Edition; mehrere Formats
- **Contra**: XML-Changeset-Format für DB-neutrale Migrations ist weniger lesbar als plain SQL; höhere Komplexität; Apache 2.0 Community, proprietäre Features
- Scheidet aus: Flyway mit plain SQL ist einfacher und ausreichend

### Option 3: Drizzle Kit (Node.js)

Migrations-Tool von Drizzle ORM; war an TypeScript/NestJS-Stack gebunden.

- **Contra**: Node.js-basiert; kein Java/Spring-Integration; kein Oracle-Support; entfällt mit ADR-012-Entscheidung für Java

### Option 4: Hibernate `hbm2ddl` / `validate`

Hibernate kann das Schema automatisch aus Entities generieren (`spring.jpa.hibernate.ddl-auto=update`).

- **Pro**: kein separates Tool; immer synchron mit Entities
- **Contra**: **Nicht für Produktion geeignet** — unkontrollierte Schema-Änderungen bei Code-Änderungen; kein Versions-Tracking; keine Rollback-Möglichkeit; scheidet aus für produktive Deployments

## Entscheidung

**Option 1: Flyway Community (Apache 2.0).**

Spring Boot integriert Flyway nativ — kein separater Container, kein manueller Schritt:

```yaml
# application.yml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true
```

Migrations laufen automatisch beim App-Start vor dem ersten DB-Zugriff.

### Migrations-Konvention

```
src/main/resources/db/migration/
  V1__init_core_schema.sql        ← entities, entity_versions, audit_events
  V2__init_plateau_schema.sql     ← plateaus, entity_plateau_states
  V3__init_metamodel_schema.sql   ← metamodel_configurations, entity_type_definitions
  V4__add_indexes.sql             ← Indizes (DB-neutral: B-Tree)
```

Naming-Schema: `V{version}__{beschreibung}.sql` (Flyway-Standard).

### DB-spezifische Migrations

Für DB-spezifische Optimierungen (z.B. GIN-Index auf PostgreSQL) werden separate Flyway-Locations pro Dialekt genutzt:

```yaml
spring:
  flyway:
    locations:
      - classpath:db/migration          # DB-neutral (Pflicht)
      - classpath:db/migration/${DB_DIALECT:postgresql}  # DB-spezifisch (optional)
```

So erhalten PostgreSQL-Deployments GIN-Indexe, ohne dass andere Datenbanken scheitern.

### Rollback-Strategie

Flyway Community unterstützt kein automatisches Rollback. Strategie für v1.0:

- **Forward-only**: Fehlerhafte Migrations werden durch eine neue `V{n+1}__rollback_*.sql`-Migration rückgängig gemacht
- **Pre-Migration-Backup**: Betreiber sichern die DB vor jedem Deployment (empfohlen in Betriebsdokumentation)

## Konsequenzen

### Positive Konsequenzen

- `docker compose up` führt automatisch alle ausstehenden Migrations aus — zero-config für Betreiber
- plain SQL-Migrations: im Repository versioniert, im PR reviewbar, für alle 5 DBs portabel
- Spring-nativer Start: kein separater Migrations-Container
- Unterstützung aller 5 Zieldatenbanken ohne Lizenzkosten

### Negative Konsequenzen / Trade-offs

- Migrations werden manuell geschrieben (kein Schema-Diff aus Hibernate-Entities); erfordert Disziplin beim Entwickler
- Kein automatisches Rollback; Down-Migrations als neue Version schreiben
- `baseline-on-migrate: true` für Installationen mit bestehendem Schema nötig (Upgrade-Szenarien)

## Bezüge

**Verwandte ADRs**: [ADR-012](./ADR-012-backend-stack.md) (Java + Spring Boot), [ADR-016](./ADR-016-persistenz-strategie.md) (Persistenz-Strategie)

**Requirements**: [REQ-075](../requirements/req/REQ-075-plattformunabhaengigkeit-deployment.md)
