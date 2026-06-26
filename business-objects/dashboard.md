---
identifier: dashboard
name_de: Dashboard
name_en: Dashboard
version: 0.1.0
status: draft
maturity: initial
owner_role: Lead Enterprise Architect
aliases:
  - C-Level-Dashboard
  - Auswertungs-Dashboard
related_capabilities: []
references:
  - concept: concept/70-platform/21-api-architektur.md
---

# Business Object: Dashboard

## Definition

Ein `Dashboard` ist eine konfigurierbare Ansicht im **Web Portal**, die mehrere Widgets zu einem zusammenhängenden C-Level-Bericht kombiniert. Widgets visualisieren aggregierte Metriken, Kostenprognosen und Verteilungen aus dem Architektur-Repository.

## Beschreibung

Dashboards richten sich primär an C-Level-Entscheidungsträger (CIO, Bereichsleitungen), die keine Rohdaten aus Katalogen lesen, sondern verdichtete Kennzahlen und Trends benötigen. Ein typisches Beispiel ist die Auswertung von Investitionskosten-Prognosen über mehrere Plateaus hinweg, um Budgetentscheidungen zu unterstützen.

**Datenquellen**: Widgets beziehen ihre Daten aus zwei Quellen:
1. **CatalogQueryDataSource**: nutzt einen bestehenden [Katalog](./catalog.md) inkl. seiner Joins, Spalten und Filter als Daten-Basis
2. **PropertyAggregationDataSource**: aggregiert direkt [PropertyDefinitions](./metamodel-configuration.md) über Entitäten eines bestimmten Typs – ohne Katalog als Zwischenschicht; unterstützt Gruppen und Aggregationsfunktionen

**Scope**: Dashboards haben denselben Scope-Mechanismus wie Kataloge – `instance` (für alle sichtbar) oder `personal` (nur für den Ersteller).

## Attribute

### Dashboard (Wurzel-Objekt)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4 | Primärschlüssel |
| name | string | required | | max. 200 Zeichen; eindeutig pro Scope | Bezeichnung des Dashboards |
| description | string | optional | | max. 1000 Zeichen | Zweck und Zielgruppe |
| scope | enum | required | `instance` | `[instance, personal]` | `instance` = für alle sichtbar; `personal` = nur Ersteller |
| createdBy | reference | required | | target: person | Ersteller |
| instanceId | reference | required | | target: instance | Verknüpfung zur OEA-Instanz |
| widgets | Widget[] | required | [] | min. 1 Widget | Enthaltene Widgets |
| globalFilters | FilterExpression[] | optional | [] | gleiche Syntax wie Katalog-Filter | Filter, die alle datengetriebenen Widgets einschränken |

### Widget (abstrakte Basis)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, eindeutig im Dashboard | Interne Widget-ID |
| widgetType | enum | required | | `[kpi, chart, table, text]` | Art des Widgets |
| title | string | required | | max. 150 Zeichen | Anzeigetitel |
| gridPosition | GridPosition | required | | | Position im Dashboard-Raster (Spalte, Zeile, Breite, Höhe) |

### KPIWidget

Zeigt eine einzelne Kennzahl prominent an (Zahl + Einheit, optional mit Vergleichswert).

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| dataSource | PropertyAggregationDataSource | required | | | Datenquelle; muss aggregationFn enthalten |
| unit | string | optional | | max. 20 Zeichen | Einheit (z.B. "CHF", "Mio. EUR", "%") |
| comparisonMode | enum | optional | `none` | `[none, vs-previous-value, vs-target]` | Vergleichsmodus für Trend-Pfeil |
| targetValue | decimal | conditional | | nur wenn comparisonMode=vs-target | Zielwert |
| numberFormat | string | optional | | z.B. "#,##0" | Zahlenformat (Locale-sensitiv) |

### ChartWidget

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| chartType | enum | required | | `[bar, line, pie, donut, area, treemap]` | Diagrammtyp |
| dataSource | CatalogQueryDataSource \| PropertyAggregationDataSource | required | | | Datenquelle |
| xAxis | AxisConfig | conditional | | nicht bei chartType=pie/donut/treemap | X-Achsen-Konfiguration |
| yAxis | AxisConfig | conditional | | min. 1 bei bar/line/area; genau 1 bei pie/donut | Y-Achsen-Konfiguration |
| colorScheme | string | optional | `default` | | Farbpalette |
| showLegend | boolean | optional | true | | Legende anzeigen |
| showDataLabels | boolean | optional | false | | Werte direkt auf Chart |

### TableWidget

Zeigt Katalogergebnisse direkt im Dashboard (read-only, keine Konfiguration).

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| dataSource | CatalogQueryDataSource | required | | | Datenquelle; muss auf existenten Katalog zeigen |
| pageSize | integer | optional | 10 | 5–100 | Zeilen pro Seite |
| columnOverrides | ColumnOverride[] | optional | [] | | Override für Spaltentitel oder -breite im Dashboard-Kontext |

### TextWidget

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| content | string | required | | max. 10 000 Zeichen; Markdown | Freier Text mit Markdown-Formatierung; keine Datenbindung |

### CatalogQueryDataSource

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| catalogId | reference | required | | target: catalog | Referenzierter Katalog inkl. Joins und Spalten |
| savedViewId | reference | optional | | target: SavedView im referenzierten Katalog | Vorauswahl einer SavedView; null = Standard-View des Katalogs |
| additionalFilters | FilterExpression[] | optional | [] | | Weitere Filter on top der Katalog-Filter |

### PropertyAggregationDataSource

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| entityType | string | required | | gültiger EntityType-ID (built-in oder custom) | Entitätstyp, über den aggregiert wird |
| propertyName | string | required | | muss als PropertyDefinition auf entityType existieren; dataType.kind muss `int` sein für sum/avg/min/max | Aggregiertes Attribut |
| aggregationFn | enum | required | | `[sum, count, avg, min, max]` | Aggregierungsfunktion |
| groupBy | string | optional | null | gültiger PropertyName oder `architectureLayerId` oder `architectureDomainId` | Gruppierungsfeld; null = keine Gruppierung (ein einziges Ergebnis) |
| filters | FilterExpression[] | optional | [] | gleiche Syntax wie Katalog-Filter | Vorfilter auf die Entitäten |

### AxisConfig

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| label | string | optional | | | Achsenbeschriftung |
| propertyName | string | required | | muss aus Datenquelle verfügbar sein | Datenbindung |
| numberFormat | string | optional | | | Zahlenformat; nur bei numerischen Achsen |

### GridPosition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| col | integer | required | | 1–12 | Startspalte im 12-Spalten-Raster |
| row | integer | required | | ≥ 1 | Startzeile |
| width | integer | required | | 1–12; col+width ≤ 13 | Spaltenbreite |
| height | integer | required | | 1–6 | Zeilenhöhe (in Rastereinheiten) |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| belongsTo | instance | n:1 | no | Dashboard gehört zur OEA-Instanz |
| createdBy | [person](./person.md) | n:1 | no | Ersteller |
| references | [catalog](./catalog.md) | n:m | yes | Optionale Datenquelle für Table- und Chart-Widgets |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `Dashboard.name` muss pro Scope eindeutig sein (`instance`: global; `personal`: pro Nutzer) | onCreate, onUpdate | – |
| BR-02 | `CatalogQueryDataSource.catalogId` muss auf einen existierenden und für den anfragenden Nutzer sichtbaren Katalog zeigen | onCreate, onUpdate, onQuery | – |
| BR-03 | `PropertyAggregationDataSource.propertyName` muss eine gültige `PropertyDefinition` auf dem referenzierten `entityType` sein | onCreate, onUpdate | – |
| BR-04 | `PropertyAggregationDataSource.aggregationFn` = `sum` / `avg` / `min` / `max` erfordert `propertyName` mit `dataType.kind=int` | onCreate, onUpdate | – |
| BR-05 | `ChartWidget` mit `chartType=pie` oder `chartType=donut` darf genau eine Y-Achse haben | onCreate, onUpdate | – |
| BR-06 | `KPIWidget` mit `comparisonMode=vs-target` muss `targetValue` gesetzt haben | onCreate, onUpdate | – |
| BR-07 | `GridPosition.col + GridPosition.width` darf 13 nicht überschreiten | onCreate, onUpdate | – |
| BR-08 | Dashboards mit `scope=personal` sind für andere Nutzer nicht sichtbar und nicht über Sharing-Links teilbar | onRead | – |

## Beispiel: Investitionskosten-Dashboard für CIO

```yaml
dashboard:
  name: "IT-Investitionsplanung 2026–2030"
  scope: instance
  globalFilters: []
  widgets:
    - widgetType: kpi
      title: "Gesamte Investitionskosten (Prognose)"
      dataSource:
        entityType: plateau
        propertyName: investitionskostenPrognose
        aggregationFn: sum
      unit: "Mio. CHF"
      gridPosition: { col: 1, row: 1, width: 3, height: 1 }

    - widgetType: chart
      title: "Investitionskosten pro Plateau"
      chartType: bar
      dataSource:
        entityType: plateau
        propertyName: investitionskostenPrognose
        aggregationFn: sum
        groupBy: name
      xAxis: { propertyName: name, label: "Plateau" }
      yAxis: { propertyName: investitionskostenPrognose, label: "CHF" }
      gridPosition: { col: 4, row: 1, width: 9, height: 3 }

    - widgetType: chart
      title: "Entitäten nach Architekturdomäne"
      chartType: pie
      dataSource:
        entityType: application-component
        propertyName: id
        aggregationFn: count
        groupBy: architectureDomainId
      yAxis: { propertyName: id, label: "Anzahl" }
      gridPosition: { col: 1, row: 2, width: 6, height: 3 }
```

**Voraussetzung**: Das Plateau-EntityType (oder ein Stereotype `ManagedPlateau`) muss `PropertyDefinition { name: investitionskostenPrognose, dataType: { kind: int }, validationMode: warning, category: "Kosten" }` definiert haben.

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [catalog](./catalog.md): Ein Katalog ist eine tabellarische Zeilenansicht ohne Aggregation; ein Dashboard aggregiert, visualisiert und verdichtet auf Kennzahlen und Charts. Dashboards nutzen Kataloge optional als Datenquelle.
- **NICHT** Bericht / Report-Export: Ein Report ist ein Punkt-in-Zeit-Export (PDF, Excel) für Archivierung und Weitergabe; ein Dashboard ist live und interaktiv im Web Portal.
- **NICHT** Diagramm / Canvas: Diagramme zeigen Architektur-Notation (ArchiMate-Entitäten, Verbindungen); Dashboards zeigen Business-Metriken in Standard-Chart-Typen.
- **NICHT** [viewpoint](./viewpoint.md): Ein Viewpoint steuert, welche EntityTypes in einem Architektur-Diagramm erscheinen dürfen; ein Dashboard ist eine Reporting-Ansicht ohne Modellierungs-Funktion.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft: KPI-, Chart-, Table-, Text-Widgets; CatalogQuery- und PropertyAggregation-DataSource; C-Level-Investitionskosten-Beispiel |
