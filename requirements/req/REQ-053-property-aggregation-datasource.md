---
id: REQ-053
title: PropertyAggregation-DataSource konfigurieren und validieren
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  use_cases:
    - UC-07
  business_objects:
    - dashboard
    - metamodel-configuration
  business_rules: []
  stakeholders:
    - SH-03
    - SH-07
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-053: PropertyAggregation-DataSource konfigurieren und validieren

## Aussage

Das System MUSS eine `PropertyAggregationDataSource`-Konfiguration für `kpi`- und `chart`-Widgets validieren und bei der Daten-Berechnung (REQ-055) als Aggregations-Abfrage auf dem Entity-Store auflösen. Die DataSource MUSS folgende Parameter unterstützen: `entityType`, `propertyName`, `aggregationFn` (sum|count|avg|min|max), optionales `groupBy` und optionale `filters`. Das System MUSS zur Schreibzeit (Widget anlegen/bearbeiten) prüfen, ob `entityType` und `propertyName` in der aktuellen [MetamodelConfiguration](../../business-objects/metamodel-configuration.md) existieren.

## Begründung

PropertyAggregation ist die Kern-DataSource für C-Level-KPIs wie „Gesamte Investitionskosten über alle Plateaus". Ohne serverseitige Validierung zur Schreibzeit könnten Widgets mit ungültigen Referenzen gespeichert werden und beim Abrufen stumm scheitern.

## Kontext

`propertyName` referenziert eine [PropertyDefinition](../../business-objects/metamodel-configuration.md) (v0.6.0) mit `dataType.kind` ∈ {int, varchar, enum}. Die Aggregationsfunktionen `sum`, `avg`, `min`, `max` sind nur auf `kind=int` gültig. `count` ist immer gültig (zählt Entitäten unabhängig vom Attributtyp).

Das Spezialwort `id` ist für `propertyName` bei `aggregationFn=count` immer gültig, auch wenn kein explizites Property „id" in der MetamodelConfiguration definiert ist (entity-id ist system-defined).

## Typ-spezifische Felder

### DataSource-Konfigurationsfelder

| Feld | Typ | Optional | Beschreibung |
|---|---|---|---|
| entityType | string | required | EntityType-ID (built-in oder custom); muss in MetamodelConfiguration existieren |
| propertyName | string | required | PropertyDefinition.name auf entityType; `id` immer gültig für count |
| aggregationFn | enum | required | `sum`, `count`, `avg`, `min`, `max` |
| groupBy | string | optional | PropertyDefinition.name auf entityType ODER `architectureDomainId` ODER `architectureLayerId` |
| filters | FilterExpression[] | optional | Dieselbe Filtersyntax wie Katalog-Filter (REQ-047); nur Attribute des entityType; kein Join |

### Validierungsregeln zur Schreibzeit

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | `entityType` muss in MetamodelConfiguration (scope=instance) als gültiger Typ existieren | onCreate, onUpdate |
| BR-02 | `propertyName` muss als `PropertyDefinition.name` auf `entityType` existieren; Ausnahme: `id` immer gültig | onCreate, onUpdate |
| BR-03 | `aggregationFn` ∈ {sum, avg, min, max} erfordert `propertyName` mit `dataType.kind=int`; bei Verletzung → 422 | onCreate, onUpdate |
| BR-04 | `groupBy` (wenn gesetzt) muss ein PropertyDefinition.name auf entityType sein ODER einer der Systemwerte `architectureDomainId`, `architectureLayerId` | onCreate, onUpdate |
| BR-05 | Wird ein EntityType oder eine PropertyDefinition aus dem Metamodell entfernt (UC-04), werden betroffene Widgets nicht automatisch gelöscht; beim nächsten Daten-Abruf (REQ-055) liefern sie einen Fehler-Status statt Daten | onMetamodelChange |

### Ausgabe bei Daten-Berechnung (REQ-055)

**Ohne groupBy** (KPI-Widget):
```json
{ "value": 42500000 }
```

**Mit groupBy** (Chart-Widget):
```json
{
  "series": [
    { "group": "Plateau 2026", "value": 12000000 },
    { "group": "Plateau 2027", "value": 30500000 }
  ]
}
```

**Mit groupBy=architectureDomainId** (Pie-Chart nach Domäne):
```json
{
  "series": [
    { "group": "finance", "groupLabel": "Finance", "value": 18 },
    { "group": "hr", "groupLabel": "Human Resources", "value": 7 }
  ]
}
```
`groupLabel` wird aus der `ArchitectureDomainDefinition.name` aufgelöst.

## Akzeptanzkriterien

**AC1** (Gültige int-Aggregation, kein groupBy):
- Gegeben: EntityType `plateau` mit PropertyDefinition `investitionskostenPrognose` (kind=int); 3 Plateau-Instanzen mit Werten 5000, 12000, 25000
- Wenn: DataSource konfiguriert mit entityType=plateau, propertyName=investitionskostenPrognose, aggregationFn=sum
- Dann: Daten-Berechnung liefert `{ "value": 42000 }`

**AC2** (Gültige count-Aggregation mit groupBy):
- Gegeben: EntityType `application-component`; 20 Entitäten, davon 12 domain=finance, 8 domain=hr
- Wenn: DataSource mit propertyName=id, aggregationFn=count, groupBy=architectureDomainId
- Dann: series=[{group: "finance", value: 12}, {group: "hr", value: 8}]

**AC3** (Ungültiger propertyName für sum):
- Gegeben: PropertyDefinition `name` (kind=varchar) auf EntityType `plateau`
- Wenn: Widget anlegen mit aggregationFn=sum, propertyName=name
- Dann: HTTP 422 „sum/avg/min/max erfordern propertyName mit dataType.kind=int"

**AC4** (Ungültiger entityType):
- Wenn: Widget anlegen mit entityType=nicht-vorhandener-typ
- Dann: HTTP 422 „EntityType 'nicht-vorhandener-typ' nicht in MetamodelConfiguration gefunden"

**AC5** (Keine Entitäten vorhanden):
- Gegeben: EntityType `plateau` hat keine Instanzen im Repository
- Wenn: Daten-Berechnung mit aggregationFn=sum
- Dann: `{ "value": null }` (kein Fehler; null bedeutet „keine Daten")

**AC6** (groupBy=architectureLayerId):
- Gegeben: 3 EntityTypes je einem Layer zugewiesen; 50 Entitäten verteilt
- Wenn: propertyName=id, aggregationFn=count, groupBy=architectureLayerId
- Dann: series mit Einträgen pro Layer-ID und deren Entitäten-Anzahl

## Abhängigkeiten

- Bezieht Validierungs-Informationen aus: MetamodelConfiguration v0.6.0 (PropertyDefinition, ArchitectureLayers, ArchitectureDomains)
- Wird verwendet durch: REQ-052 (Widget-Validierung), REQ-055 (Daten-Berechnung)
- Filtersyntax analog zu: REQ-047 (Katalog-Filter)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Requirements Engineer | Initial draft; BR-01–05, Ausgabeformat mit/ohne groupBy, groupBy-Sonderwerte |
