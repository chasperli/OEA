# ADR-012: Backend-Stack – Java 21 + Spring Boot 3 + Hibernate

**Status**: accepted
**Datum**: 2026-06-27
**Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
**Konsultiert**: Business Engineer
**Informiert**: ADR-013 (API-Stil), ADR-015 (DB-Migration), ADR-016 (Persistenz)
**Supersedes**: –

## Kontext und Problem

OEA benötigt einen Backend-Service, der:
- die REST-API (alle `/api/v1/...`-Endpunkte) bereitstellt
- das Metamodell und die EntityType-Engine ausführt
- Mehrere Datenbanken unterstützt (PostgreSQL, MySQL, MariaDB, SQL Server, Oracle)
- CEL-Rule-Evaluation (ADR-018) parallelisiert ausführen kann
- WebSocket/SSE-Events für Echtzeit-Updates sendet
- Als Docker-Container auf Linux, macOS und Windows betrieben werden kann

**DB-Neutralität ist Tier-1-Anforderung**: Firmen fokussieren sich auf möglichst wenige Technologien und setzen oft bereits eine Enterprise-Datenbank ein. OEA soll sich in bestehende Infrastruktur einfügen, nicht eine neue DB-Abhängigkeit erzwingen.

## Entscheidungstreiber

- **DB-Neutralität**: PostgreSQL, MySQL, MariaDB, SQL Server, Oracle — alle mit offiziellem ORM-Support
- **Oracle**: Schlüsselkriterium; nur Hibernate und EF Core haben offiziellen Oracle-Support
- **OpenJDK**: Kein Oracle JDK oder kommerzielle JVM; ausschliesslich freie Distributionen
- **Echtes Multithreading**: parallele Verarbeitung ohne Event-Loop-Beschränkungen
- **Cross-Platform + Container**: Standard-Docker-Images, keine proprietären Basis-Images
- **OpenAPI-Spec-Generierung**: Code-First OpenAPI für Typ-Sharing mit Vue 3-Frontend (ADR-013)
- **OSS-Kompatibilität**: Apache 2.0 oder GPL-kompatible Lizenzen

## Betrachtete Optionen

### Option 1: TypeScript + NestJS

- **Pro**: Ein-Sprachen-Stack (TypeScript überall); direkte DTO-Typen im Frontend
- **Contra**: Node.js single-threaded (Event Loop); kein ausgereifter ORM mit Oracle-Support; DB-Neutralität nur mit erheblichem Eigenaufwand erreichbar; scheidet durch DB-Neutralitäts-Anforderung aus

### Option 2: Go + chi + GORM

- **Pro**: Goroutines (echte Parallelität); ~20 MB Docker-Image; `microsoft/go-mssqldb` offiziell
- **Contra**: GORM hat **keinen offiziellen Oracle-Support**; `sijms/go-ora` ist Community-only; Oracle-Anforderung nicht zuverlässig erfüllbar; scheidet aus

### Option 3: C# / .NET 8 + Entity Framework Core

- **Pro**: EF Core mit offiziellem Oracle-Support; .NET 8 cross-platform; gute Performance
- **Contra**: Microsoft-Ökosystem politisch problematisch für neutrales OSS-Projekt; scheidet aus

### Option 4: Rust + Axum + sqlx

- **Pro**: Maximale Performance; ~15 MB Docker-Image
- **Contra**: Kein ausgereiftes Multi-DB-ORM; Oracle-Support (`tiberius`) Community-only; höchste Lernkurve; scheidet aus

### Option 5: Java 21 + Spring Boot 3 + Hibernate ✓

- **Pro**:
  - Hibernate 6.x: ausgereiftester Multi-DB ORM mit offiziellem Support für **alle 5 Ziel-DBs**
  - Java 21 Virtual Threads (Project Loom): echte Parallelität mit minimalem Overhead
  - Eclipse Temurin: vollständig Open Source, TCK-zertifiziert, keine Oracle-Lizenzkosten
  - GraalVM CE (optional): Native Image → ~100 MB Docker-Image, ~50 ms Startup
  - SpringDoc OpenAPI: generiert OpenAPI 3.x Spec aus Annotations (Code-First, ADR-013-konform)
  - Flyway: Spring-native DB-Migration, alle 5 Ziel-DBs unterstützt (ADR-015)
- **Contra**:
  - Zweite Sprache neben TypeScript (Frontend); kein direktes DTO-Sharing — nur via OpenAPI-Codegen
  - JVM ohne GraalVM: ~250–400 MB Speicher (für langlebigen Server-Prozess akzeptabel)
  - GraalVM Native Image: längere Build-Zeiten; Reflection-intensive Libraries brauchen Konfiguration

## Entscheidung

**Option 5: Java 21 + Spring Boot 3 + Hibernate.**

Hibernate ist der einzige ORM mit offiziellem, battle-tested Support für alle fünf Ziel-Datenbanken inklusive Oracle. Java 21 Virtual Threads lösen die Multithreading-Anforderung mit einem einzigen Config-Switch. Die Mehrsprachigkeit (Java Backend + TypeScript Frontend) ist durch klare Schichttrennung und OpenAPI-Typ-Generierung vertretbar.

### Gewählter Stack

| Komponente | Technologie | Version | Lizenz |
|---|---|---|---|
| JDK | Eclipse Temurin (OpenJDK) | 21 LTS | GPL v2 + CE |
| Framework | Spring Boot | 3.x | Apache 2.0 |
| ORM | Hibernate (via Spring Data JPA) | 6.x | LGPL 2.1 |
| API-Dokumentation | SpringDoc OpenAPI | 2.x | Apache 2.0 |
| DB-Migration | Flyway Community | 10.x | Apache 2.0 |
| Native Image (optional) | GraalVM Community Edition | 21 | GPL v2 + CE |
| Build | Gradle (Kotlin DSL) | 8.x | Apache 2.0 |
| Container-Basis | `eclipse-temurin:21-jre-alpine` | aktuell | GPL v2 + CE |

### OpenJDK: Eclipse Temurin

Eclipse Temurin ist die empfohlene OpenJDK-Distribution für OSS-Projekte:
- Herausgeber: Eclipse Adoptium Working Group (Eclipse Foundation)
- Vollständig Open Source; keine Oracle-Lizenzkosten; TCK-zertifiziert
- Docker: `eclipse-temurin:21-jre-alpine` (~170 MB) als Standard-Basis-Image
- GraalVM Native Image: `ghcr.io/graalvm/native-image:ol9-java21` (GraalVM CE, GPL)

### Virtual Threads (Project Loom)

```yaml
# application.yml
spring:
  threads:
    virtual:
      enabled: true
```

Ein Config-Switch aktiviert Virtual Threads für den gesamten Spring MVC Thread-Pool. Jeder HTTP-Request läuft in einem eigenen Virtual Thread — kein Thread-Pool-Engpass bei vielen parallelen Requests.

### DB-Neutralität via Hibernate-Dialekte

Hibernate erkennt den Datenbanktyp anhand der Datasource und wählt automatisch den passenden Dialekt:

| Datenbank | Hibernate-Dialekt | JSON-Spalte für Properties |
|---|---|---|
| PostgreSQL | `PostgreSQLDialect` | `JSONB` |
| MySQL | `MySQLDialect` | `JSON` |
| MariaDB | `MariaDBDialect` | `JSON` |
| SQL Server | `SQLServerDialect` | `NVARCHAR(MAX)` |
| Oracle | `OracleDialect` | `CLOB` / `JSON` (Oracle 21c+) |

Entity-Properties (metamodell-getrieben, kein fixes Schema) via `@JdbcTypeCode(SqlTypes.JSON)`:

```java
@Entity
@Table(name = "entities")
public class ArchitectureEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type_id", nullable = false, updatable = false)
    private String entityTypeId;

    @Version
    private Integer version;  // Optimistic Locking (ADR-016)

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "properties", nullable = false)
    private Map<String, Object> properties = new HashMap<>();
}
```

Hibernate serialisiert/deserialisiert JSON automatisch und nutzt den dialektspezifischen Spaltentyp — keine Anpassung pro Datenbank nötig.

### OpenAPI-Typ-Sharing (ADR-013-konform)

SpringDoc generiert die OpenAPI 3.x Spec aus Spring-Controller-Annotationen:

```java
@RestController
@RequestMapping("/api/v1/entities")
@Tag(name = "Entities")
public class EntityController {

    @GetMapping("/{id}")
    @Operation(summary = "Entität nach ID laden")
    public ResponseEntity<EntityDto> getById(@PathVariable Long id) { ... }
}
```

`openapi-typescript` im Vue 3 Frontend generiert typsichere API-Clients aus der Spec — identischer Workflow wie mit NestJS/Swagger.

## Konsequenzen

### Positive Konsequenzen

- Oracle, SQL Server, MySQL, MariaDB, PostgreSQL: alle first-class via Hibernate
- Virtual Threads: echte Parallelität ohne reaktive Programmiermodelle
- Eclipse Temurin: kein Vendor-Lock, vollständig frei und TCK-zertifiziert
- Flyway: Spring-native Migration, alle 5 Ziel-DBs, plain SQL-Dateien im Repository
- Optimistic Locking via `@Version` (Hibernate-nativ, ADR-016-konform)
- GraalVM CE optional: natives Binary, schneller Start, kleines Image

### Negative Konsequenzen / Trade-offs

- Zwei Sprachen im Stack: Java (Backend) + TypeScript (Frontend)
- Kein direktes DTO-Sharing; nur via OpenAPI-Codegen
- JVM ohne Native Image: ~250–400 MB Speicher vs. ~20 MB (Go/Rust)
- GraalVM Native Image: komplexere Build-Pipeline (optional; Fallback auf JVM-Betrieb möglich)

### Folgeentscheidungen

- **ADR-015**: Drizzle Kit → Flyway (Spring-nativ, alle 5 DBs)
- **ADR-016**: JSONB-spezifische GIN-Indexe entfallen zugunsten DB-Neutralität; `@JdbcTypeCode(SqlTypes.JSON)` als Abstraktionsschicht; Optimistic Locking und EntityVersion-Mechanismus bleiben gültig
- **Monorepo-Struktur**: `apps/backend` (Spring Boot / Gradle), `apps/frontend` (Vue 3 / Vite) — beim Walking-Skeleton-Setup zu entscheiden

## Bezüge

**Verwandte ADRs**: [ADR-013](./ADR-013-api-stil.md), [ADR-015](./ADR-015-db-migration.md), [ADR-016](./ADR-016-persistenz-strategie.md), [ADR-018](./ADR-018-business-rule-engine.md)

**Requirements**: [REQ-075](../requirements/req/REQ-075-plattformunabhaengigkeit-deployment.md)

**Konzept**: §21 API-Architektur, §22 Walking Skeleton
