---
identifier: catalog
name_de: Katalog
name_en: Catalog
version: 0.1.0
status: draft
maturity: initial
owner_role: Lead Enterprise Architect
aliases:
  - Architekturkatalog
  - Entity-Katalog
  - Tabellensicht
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/20-entities/12-domain-sichten.md
---

# Business Object: Catalog

## Definition

Ein `Catalog` ist eine benannte, konfigurierbare Tabellenansicht auf Entitäten des Architecture-Repositorys. Er legt fest, welcher Entitätstyp die primäre Zeile bildet, welche Attribute als Spalten erscheinen, wie über Connections zu weiteren Entitäten gejoint wird und welche gespeicherten Filter vorbelegt sind.

## Beschreibung

Während ein [Viewpoint](./viewpoint.md) eine graphische Diagrammsicht definiert, liefert ein Catalog eine **tabellarische Sicht** – vergleichbar mit einer parametrisierten Datenbankabfrage, die gespeichert, geteilt und interaktiv angepasst werden kann.

Der Catalog ist das primäre Werkzeug des Enterprise Architekten, um strukturierte Übersichten zu erzeugen: eine Liste aller Applikationen mit ihren Schnittstellen, eine Compliance-Übersicht aller Datenentitäten mit Klassifizierung, oder eine Cross-Layer-Sicht, die Applikationen mit den Technologie-Komponenten verknüpft, auf denen sie laufen.

---

### Primäre Entität und Spalten

Jeder Catalog hat eine **primäre Entität** (`primaryEntityType`): sie liefert die Zeilen der Tabelle. Aus ihren Attributen werden **Spalten** konfiguriert: welche Attribute sichtbar sind, in welcher Reihenfolge sie erscheinen und unter welchem Label.

---

### Joins über Connections

Ein Catalog kann über [Connection-Typen](./metamodel-configuration.md) (EntityTypes mit `isConnection=true`) **Join-Definitionen** enthalten, die weitere Entitäten einbeziehen – analog zu SQL-JOINs.

**Beispiel**: Catalog „Applikationen & Schnittstellen"

```
Primäre Entität: ApplicationComponent
Join: über DataFlow (Connection) → Interface (Zielentität)
```

Für jeden Join stehen zwei Modi zur Verfügung, die der **Katalog-Besucher** zur Laufzeit wechseln kann; der **Default-Modus** ist auf der JoinDefinition hinterlegt:

| Modus | Verhalten | Analogie |
|---|---|---|
| `rows` | Für jede verknüpfte Zielentität entsteht eine eigene Zeile; die primäre Entität wiederholt sich → SQL INNER/LEFT JOIN | `SELECT a.*, b.* FROM a JOIN c ON … JOIN b ON …` |
| `aggregate` | Die primäre Entität erscheint genau einmal; alle verknüpften Zielentitäten werden in eine einzige Zelle aggregiert (z.B. als kommaseparierte Liste oder Unter-Tabelle) | `SELECT a.*, array_agg(b.*) … GROUP BY a.id` |

Der **Catalog-Level-Default** (`defaultJoinMode`) gilt für alle JoinDefinitions, die keinen eigenen Default überschreiben. Der Besucher kann zur Laufzeit pro Join oder global zwischen `rows` und `aggregate` wechseln; seine Wahl persistiert optional als **SavedView**.

---

### Gespeicherte Filter

Filter können interaktiv gesetzt und als benannte **SavedFilter** persistiert werden. Ein SavedFilter ist eine wiederverwendbare, benannte Filterbedingung (z.B. „Nur Applikationen im Status active", „Nur Systeme der Business-Schicht"), die Besuchern als Schnellauswahl angeboten wird.

---

### Gespeicherte Views

Eine **SavedView** bündelt: sichtbare Spalten, Spaltenreihenfolge, aktive Filter (Referenzen auf SavedFilter) und Join-Modus. Sie erlaubt es, mehrere vorkonfigurierte Sichten auf denselben Catalog zu speichern (z.B. „Kompaktansicht", „Audit-Export-Sicht").

---

### Catalog-Scope

| Scope | Sichtbarkeit |
|---|---|
| `instance` | Für alle Nutzer der OEA-Instanz sichtbar (geteilter Catalog) |
| `personal` | Nur für den Ersteller sichtbar |

---

### Abgrenzung Catalog vs. Viewpoint

| Aspekt | Catalog | Viewpoint |
|---|---|---|
| Darstellungsform | Tabelle / Liste | Grafisches Diagramm |
| Konfigurierbar | Spalten, Joins, Filter, Sort | Erlaubte Typen, Notation |
| Primäre Aktion | Daten exportieren, filtern, abfragen | Architektur visualisieren, zeichnen |
| Notation | keine | ArchiMate 3, UML, BPMN 2.0 |
| Join-Konzept | ja (über Connections) | nein |

## Attribute

### Catalog (Wurzel-Objekt)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| name | string | required | | max. 255 Zeichen, eindeutig innerhalb der Instanz | Lesbarer Name (z.B. „Applikations-Übersicht") |
| description | string | optional | | max. 1000 Zeichen | Zweck und Zielgruppe des Catalogs |
| primaryEntityType | string | required | | gültiger EntityType-Name | Entitätstyp, der die Zeilen liefert |
| columns | ColumnConfig[] | required | [] | mind. 1 Eintrag | Konfiguration der Spalten aus Attributen der primären Entität |
| joinDefinitions | JoinDefinition[] | required | [] | | Joins über Connections zu weiteren Entitätstypen |
| defaultJoinMode | enum | required | `aggregate` | `[rows, aggregate]` | Globaler Default für alle Joins des Catalogs; überschreibbar pro JoinDefinition und durch Besucher |
| savedFilters | SavedFilter[] | required | [] | | Benannte, wiederverwendbare Filterbedingungen |
| savedViews | SavedView[] | required | [] | | Benannte Kombinationen aus Spalten, Filtern und Join-Modus |
| scope | enum | required | `instance` | `[instance, personal]` | Sichtbarkeit des Catalogs |
| createdBy | reference | required | | target: person | Erstellende Person |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| lastModifiedAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der letzten Änderung |
| lastModifiedBy | reference | required | | target: person | Person der letzten Änderung |

### ColumnConfig

| Attribut | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| attributeName | string | required | | Name des Attributs aus dem EntityType (z.B. `status`, `name`, `owner`) |
| displayLabel | string | optional | = `attributeName` | Überschreibt den Spalten-Header in der Anzeige |
| visible | boolean | required | true | Ob die Spalte sichtbar ist (false = vorhanden, aber ausgeblendet) |
| sortOrder | integer | required | | Reihenfolge in der Tabelle (0 = erste Spalte) |
| sortable | boolean | required | true | Ob nach dieser Spalte sortiert werden kann |
| defaultSortDirection | enum | optional | null | `[asc, desc]`; null = keine Default-Sortierung |

### JoinDefinition

| Attribut | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| id | string | required | | UUID v4 |
| name | string | required | | Lesbarer Name für diesen Join (z.B. „Schnittstellen") |
| connectionType | string | required | | EntityType-Name mit `isConnection=true` |
| joinDirection | enum | required | `outbound` | `[outbound, inbound, both]`; outbound = primäre Entität als Source, inbound = als Target |
| targetEntityType | string | required | | EntityType der Zielentität nach dem Join |
| targetColumns | ColumnConfig[] | required | [] | Attribute der Zielentität, die als Spalten erscheinen |
| defaultJoinMode | enum | optional | = Catalog.defaultJoinMode | `[rows, aggregate]`; überschreibt den Catalog-Default für diesen Join |
| aggregateLabel | string | optional | = `name` | Label der Aggregat-Zelle im `aggregate`-Modus |

### SavedFilter

| Attribut | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| id | string | required | | UUID v4 |
| name | string | required | | Lesbarer Name (z.B. „Nur aktive Systeme") |
| description | string | optional | | |
| logicalOperator | enum | required | `and` | `[and, or]`; wie die Filterausdrücke verknüpft werden |
| expressions | FilterExpression[] | required | | Mind. ein Ausdruck |

### FilterExpression

| Attribut | Typ | Optional | Beschreibung |
|---|---|---|---|
| attributePath | string | required | Attributname der primären oder gejointen Entität (z.B. `status`, `dataFlow.protocol`) |
| operator | enum | required | `[eq, neq, contains, startsWith, in, notIn, isNull, isNotNull, gt, lt, gte, lte]` |
| value | any | optional | Vergleichswert; bei `isNull`/`isNotNull` leer; bei `in`/`notIn` ein Array |

### SavedView

| Attribut | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| id | string | required | | UUID v4 |
| name | string | required | | Lesbarer Name (z.B. „Audit-Export-Sicht") |
| description | string | optional | | |
| columnOrder | string[] | optional | | Geordnete Liste von `attributeName`-Werten der sichtbaren Spalten; überschreibt die Catalog-ColumnConfig-Reihenfolge |
| activeFilterIds | string[] | optional | [] | IDs von SavedFilters, die in dieser View aktiv sind |
| joinModeOverrides | JoinModeOverride[] | optional | [] | Pro Join expliziter Modus (`rows`/`aggregate`); überschreibt JoinDefinition-Defaults |
| isDefault | boolean | required | false | Ob diese View beim Öffnen des Catalogs vorausgewählt ist |

### JoinModeOverride (Werteobjekt in SavedView)

| Attribut | Typ | Beschreibung |
|---|---|---|
| joinDefinitionId | string | ID der betroffenen JoinDefinition |
| joinMode | enum `[rows, aggregate]` | Gewählter Modus für diese SavedView |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| createdBy | [person](./person.md) | n:1 | no | Erstellende Person |
| referencesEntityType | EntityTypeDefinition (via name) | n:1 | no | Primäre Entität |
| referencesConnectionTypes | EntityTypeDefinition (isConnection=true) | n:n | yes | Connections, über die gejoint wird |
| containedIn | [tree-node](./tree-node.md) | n:0..1 | yes | Position im Navigationsbaum |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `primaryEntityType` MUSS ein gültiger EntityType-Name in der MetamodelConfiguration sein | onCreate, onUpdate | – |
| BR-02 | `JoinDefinition.connectionType` MUSS ein EntityType mit `isConnection=true` sein | onCreate, onUpdate | – |
| BR-03 | `JoinDefinition.targetEntityType` MUSS einem der `allowedSourceTypes` oder `allowedTargetTypes` des ConnectionTypes entsprechen (bzw. beliebig sein wenn null) | onCreate, onUpdate | – |
| BR-04 | Ein `SavedFilter.expression.attributePath` MUSS auf ein gültiges Attribut der primären Entität oder einer gejointen Zielentität zeigen | onCreate, onUpdate | – |
| BR-05 | `SavedView.columnOrder` darf nur Attributnamen enthalten, die in der `columns`-Konfiguration des Catalogs definiert sind | onCreate, onUpdate | – |
| BR-06 | Pro Catalog darf höchstens eine `SavedView` `isDefault=true` sein | onCreate, onUpdate | – |

## Lifecycle

Catalogs haben keinen formalen Status-Lifecycle. Sie sind Konfigurations-Objekte, die angelegt, bearbeitet und gelöscht werden können. Gelöschte Catalogs werden aus dem [TreeNode](./tree-node.md) entfernt.

## Beispiele

**Catalog „Applikations-Übersicht mit Schnittstellen"**:

```
primaryEntityType: ApplicationComponent
defaultJoinMode: aggregate
columns:
  - attributeName: name,       sortOrder: 0
  - attributeName: status,     sortOrder: 1
  - attributeName: owner,      sortOrder: 2
  - attributeName: layer,      sortOrder: 3
joinDefinitions:
  - name: Schnittstellen
    connectionType: DataFlow
    joinDirection: outbound
    targetEntityType: Interface
    targetColumns:
      - attributeName: name,     sortOrder: 0
      - attributeName: protocol, sortOrder: 1
    defaultJoinMode: aggregate  ← zeigt alle Interfaces einer App in einer Zelle
savedFilters:
  - name: Nur aktive Applikationen
    expressions:
      - attributePath: status, operator: eq, value: active
savedViews:
  - name: Kompaktansicht
    columnOrder: [name, status]
    activeFilterIds: [filter-aktive-applikationen]
    isDefault: true
  - name: Vollständige Ansicht mit Interfaces (rows-Modus)
    joinModeOverrides:
      - joinDefinitionId: join-schnittstellen, joinMode: rows
```

**Resultat im `aggregate`-Modus (Default)**:

| Name | Status | Schnittstellen |
|---|---|---|
| CRM-System | active | REST-API, SFTP-Export |
| ERP-Core | active | JDBC-Connector, REST-API |

**Resultat im `rows`-Modus (Besucher wechselt)**:

| Name | Status | Schnittstelle | Protokoll |
|---|---|---|---|
| CRM-System | active | REST-API | REST |
| CRM-System | active | SFTP-Export | SFTP |
| ERP-Core | active | JDBC-Connector | JDBC |
| ERP-Core | active | REST-API | REST |

## Abgrenzung

- **NICHT** [Viewpoint](./viewpoint.md): Ein Viewpoint steuert die graphische Diagrammdarstellung; ein Catalog ist eine tabellarische Datenabfrage.
- **NICHT** ein Report: Reports (PDF, Export) können aus Catalogs generiert werden, sind aber kein eigenes BO.
- **NICHT** eine [Solution](./solution.md): Eine Solution beschreibt Änderungs-Deltas; ein Catalog zeigt den aktuellen (oder historischen) Zustand.

## Verwendung in Use Cases

- Künftig: UC für Kataloge anlegen und konfigurieren (primärer Akteur: SH-03 Kurt)
- [UC-05: Architektur-Vision beschreiben](../requirements/use-cases/UC-05-architektur-vision-beschreiben.md) – Catalogs können zur Ausgangsbasis-Analyse genutzt werden (komplementär zu REQ-039)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft; Join-Modi (rows/aggregate), SavedFilter, SavedView, ColumnConfig, JoinDefinition |
