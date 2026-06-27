---
identifier: trm-category
name_de: TRM-Kategorie
name_en: TRM Category
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - TRM Category
  - Technology Reference Model Category
  - TRM-Knoten
references:
  - concept: concept/10-foundations/04-enterprise-continuum-trm.md
  - adr: adrs/ADR-002-continuum-repository.md
---

# Business Object: TRMCategory

## Definition

Eine `TRMCategory` ist ein Knoten in der hierarchischen Klassifikation des **Technical Reference Model (TRM)**. Das TRM ist ein konkretes Beispiel einer `foundation`-Level-Referenzarchitektur: eine vollständige Taxonomie aller Technology-Service-Kategorien, die eine Organisation nutzen kann. Jede `ArchitectureEntity` vom Typ einer Technology-Komponente kann einer oder mehreren TRM-Kategorien zugeordnet werden.

## Beschreibung

Das TRM ist eine **Klassifikations-Hierarchie** — kein Instanz-Modell. Es beschreibt nicht, welche konkreten Produkte vorhanden sind, sondern welche *Typen* von Services existieren und welche Produkte (SBBs) für jeden Service-Typ bevorzugt, akzeptabel, veraltend oder verboten sind.

TOGAF 10 liefert ein Beispiel-TRM mit drei Hierarchieebenen:

```
Level 1: Application Platform Services
  Level 2: Data Interchange Services
    Level 3: Data Formats & Protocols
    Level 3: Electronic Data Interchange
  Level 2: Data Management Services
    Level 3: Database Management
    Level 3: Data Warehousing
  Level 2: Security Services
    Level 3: Identity & Access Management
    Level 3: Cryptographic Services
```

Organisationen passen das TOGAF-Beispiel-TRM an und ergänzen branchenspezifische Kategorien. Importierte TRM-Strukturen sind unveränderlich; eigene Erweiterungen können hinzugefügt werden.

**Nutzung:** Wenn ein Enterprise-Architekt eine Technology-Entität (z.B. „PostgreSQL 16") anlegt, ordnet er sie TRM-Kategorien zu (z.B. „Database Management", „Relational DBMS"). Dadurch sind TRM-basierte Analysen möglich: Welche Kategorien sind doppelt besetzt? Welche weichen vom Standard ab?

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | UUID | required | | v4, global eindeutig | Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig unter Geschwistern innerhalb desselben `parentId` | Kategoriename (z.B. „Identity & Access Management") |
| description | string | optional | null | max. 3000 Zeichen; Markdown | Beschreibung des Service-Typs und seiner Abgrenzung |
| level | integer | required | | 1–5; Level 1 = oberste Ebene | Hierarchietiefe im TRM |
| parentId | reference | optional | null | target: TRMCategory; null = Wurzelknoten (Level 1) | Übergeordnete Kategorie |
| evaluationCriteria | string | optional | null | max. 2000 Zeichen; Markdown | Kriterien, nach denen SBBs für diese Kategorie bewertet werden (z.B. Skalierbarkeit, Lizenzkosten, Vendor-Support) |
| lastReviewedAt | date | optional | null | ISO 8601 | Datum der letzten Governance-Überprüfung dieser Kategorie |
| scope | enum | required | `organization` | `[built-in, imported, organization]` | Herkunft: `imported` = aus TRM-Paket (z.B. TOGAF); `organization` = eigene Erweiterung |
| sourcePackage | string | optional | null | max. 255 Zeichen; nur wenn `scope=imported` | Herkunftspaket (z.B. „TOGAF 10 TRM") |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| parent | [trm-category](./trm-category.md) | n:0..1 | yes | Übergeordnete Kategorie; null = Wurzelknoten |
| children | [trm-category](./trm-category.md) | 1:n | yes | Untergeordnete Kategorien |
| preferredStandard | [solution-building-block](./solution-building-block.md) | n:0..1 | yes | Bevorzugtes Produkt / SBB für diese Kategorie (governanceStatus=approved) |
| acceptedAlternatives | [solution-building-block](./solution-building-block.md) | n:m | yes | Akzeptable Alternativen (governanceStatus=acceptable) |
| deprecatedOptions | [solution-building-block](./solution-building-block.md) | n:m | yes | Auslaufende Produkte, die noch in Bestandssystemen existieren dürfen |
| classifiedEntities | [entity](./entity.md) | 1:n | yes | Technologie-Entitäten, die dieser Kategorie zugeordnet sind (via `entity.trmClassificationIds`) |

## Business Rules

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | TRMCategories mit `scope=imported` oder `scope=built-in` sind read-only (Knoten können nicht gelöscht oder umbenannt werden) | onUpdate, onDelete |
| BR-02 | Kein Zyklus im `parent`-Graphen: eine Kategorie darf nicht (direkt oder indirekt) ihr eigenes Kind sein | onCreate, onUpdate |
| BR-03 | `level` MUSS konsistent mit der `parent`-Kette sein: `level = parent.level + 1` | onCreate, onUpdate |
| BR-04 | Ein SBB kann in derselben TRMCategory nicht gleichzeitig `preferredStandard`, `acceptedAlternatives` UND `deprecatedOptions` sein — diese sind mutually exclusive | onCategoryUpdate |
| BR-05 | TRMCategory mit Unterknoten (`children` nicht leer) kann nicht gelöscht werden; erst Kinder entfernen | onDelete |

## Lifecycle

TRM-Kategorien haben keinen formalen Lifecycle-Status. Sie können:
- für `imported`-Kategorien: nie gelöscht oder umbenannt
- für `organization`-Kategorien: jederzeit ergänzt oder umstrukturiert (wenn keine Entitäten zugeordnet sind)

`lastReviewedAt` signalisiert, wie aktuell die SBB-Zuordnungen der Kategorie sind. Kategorien ohne Review in den letzten 24 Monaten sollten als veraltet markiert werden.

## Analysen (Konzept §4.7)

- **Technology Diversity**: Wie viele verschiedene SBBs implementieren dieselbe TRM-Kategorie? (5 Message-Broker statt 2 → Standardisierungspotenzial)
- **TRM Coverage**: Welche TRM-Kategorien haben eine `preferredStandard`-SBB, welche nicht?
- **Standard Enforcement**: Entitäten, deren `instanceOfSBBId` NICHT dem `preferredStandard` der zugeordneten TRMCategory entspricht → Abweichungs-Report
- **Lifecycle pro Kategorie**: Bebauungsplan gefiltert auf eine TRM-Kategorie zeigt Technologie-Wandel innerhalb eines Service-Bereichs

## Erweiterung von ArchitectureEntity

Technologie-Entitäten erhalten durch dieses BO ein zusätzliches Attribut (zukünftig in `entity.md` ergänzt):

| Neues Attribut | Typ | Optional | Beschreibung |
|---|---|---|---|
| `trmClassificationIds` | UUID[] | optional | Referenzen auf TRM-Kategorien; n:m; nur sinnvoll für Entitäten vom Typ einer PhysicalTechnologyComponent |

## Beispiel

```
TRM-Baum (Ausschnitt):
Level 1: Infrastructure Services
  Level 2: Data Management Services
    Level 3: Database Management
      preferredStandard: SBB „PostgreSQL 17"
      acceptedAlternatives: [SBB „MySQL 8.x", SBB „Amazon Aurora PostgreSQL"]
      deprecatedOptions: [SBB „Oracle Database 11g"]

Entity „acme-db-prod":
  entityTypeId: physical-technology-component
  trmClassificationIds: [<UUID von "Database Management">]
  instanceOfSBBId: <UUID von "PostgreSQL 17">
  → Konform: instanceOf = preferredStandard ✓
```

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | Business Engineer | Initial draft; Grundlage TOGAF TRM §4.6 (Konzept); Hierarchie, SBB-Zuordnung, Analysen |
