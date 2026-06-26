---
id: REQ-054
title: CatalogQuery-DataSource konfigurieren und validieren
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
    - catalog
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

# REQ-054: CatalogQuery-DataSource konfigurieren und validieren

## Aussage

Das System MUSS eine `CatalogQueryDataSource`-Konfiguration für `table`-Widgets validieren und bei der Daten-Berechnung (REQ-055) auf die Katalog-Abfrage-API (REQ-046) delegieren. Die DataSource MUSS `catalogId` als Pflichtfeld voraussetzen und MUSS zur Schreibzeit prüfen, ob der referenzierte [Katalog](../../business-objects/catalog.md) für den anfragenden Nutzer sichtbar ist. Optionale `savedViewId` und `additionalFilters` ergänzen die Basis-Abfrage.

## Begründung

Das Einbetten von Katalog-Daten in ein Dashboard-Table-Widget vermeidet Duplikation der Abfragelogik. Der Katalog bleibt die einzige konfigurierte Datenquelle; das Dashboard delegiert und rendert das Ergebnis in seinem Grid-Layout.

## Kontext

`CatalogQueryDataSource` ist ausschliesslich für `table`-Widgets gültig (BR-04 in REQ-052). Die Sichtbarkeit des referenzierten Katalogs richtet sich nach dessen `scope`: ein `scope=personal`-Katalog eines anderen Nutzers darf nicht als DataSource verwendet werden.

## Typ-spezifische Felder

### DataSource-Konfigurationsfelder

| Feld | Typ | Optional | Beschreibung |
|---|---|---|---|
| catalogId | string | required | UUID des referenzierten Katalogs; muss für den Requester sichtbar sein |
| savedViewId | string | optional | UUID einer SavedView im referenzierten Katalog; null = Standard-View |
| additionalFilters | FilterExpression[] | optional | Zusätzliche Filter; werden AND-verknüpft mit Katalog-eigenen Filtern |
| pageSize | integer | optional | Zeilen pro Seite für die Tabellen-Darstellung; Default aus Widget-Konfiguration |

### Validierungsregeln zur Schreibzeit

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | `catalogId` muss einen existierenden, für den Requester sichtbaren Katalog referenzieren | onCreate, onUpdate |
| BR-02 | `savedViewId` (wenn gesetzt) muss eine SavedView im referenzierten Katalog sein | onCreate, onUpdate |
| BR-03 | Wird der referenzierte Katalog gelöscht, liefert das Widget beim nächsten Daten-Abruf einen isolierten Fehler-Status; das Dashboard als Ganzes bleibt funktionsfähig | onCatalogDelete |
| BR-04 | Ein `scope=personal`-Katalog eines anderen Nutzers darf nicht als DataSource verwendet werden → 403 | onCreate, onUpdate |

### Ausgabe bei Daten-Berechnung (REQ-055)

Die Ausgabe entspricht der Katalog-Abfrage-Antwort aus REQ-046, eingeschränkt auf `page=0` und `pageSize` aus der Widget-Konfiguration:

```json
{
  "totalCount": 47,
  "page": 0,
  "pageSize": 10,
  "columns": ["name", "status", "Schnittstellen"],
  "data": [
    { "columns": { "name": "CRM-System", "status": "active" }, "joinResults": { "Schnittstellen": [...] } }
  ]
}
```

## Akzeptanzkriterien

**AC1** (Gültige DataSource):
- Gegeben: Katalog „Application Inventory" (scope=instance) existiert; Kurt ist eingeloggt
- Wenn: Widget anlegen mit type=table, catalogId=<id>
- Dann: HTTP 201; DataSource gespeichert

**AC2** (Ungültige catalogId):
- Wenn: Widget anlegen mit nicht-existierender catalogId
- Dann: HTTP 422 „Katalog nicht gefunden oder nicht sichtbar"

**AC3** (Fremder personal-Katalog):
- Gegeben: Franz hat einen scope=personal-Katalog
- Wenn: Kurt versucht, diesen Katalog als DataSource zu verwenden
- Dann: HTTP 403 „Katalog nicht sichtbar"

**AC4** (savedViewId gültig):
- Gegeben: Katalog hat SavedView „Kompaktansicht"
- Wenn: Widget anlegen mit savedViewId=<view-id>
- Dann: HTTP 201; beim Daten-Abruf werden Spalten und Filter der SavedView angewendet

**AC5** (Katalog später gelöscht):
- Gegeben: Widget mit CatalogQueryDataSource existiert; Katalog wird danach gelöscht
- Wenn: GET /api/v1/dashboards/{id}/data
- Dann: dieses Widget liefert `{ "status": "error", "error": "Katalog nicht gefunden" }`; andere Widgets rendern normal

## Abhängigkeiten

- Delegiert Abfrage-Logik an: REQ-046 (Katalog-Abfrage)
- Validierung zur Schreibzeit: Katalog-API GET /api/v1/catalogs/{id}
- Wird verwendet durch: REQ-052 (Widget-Validierung), REQ-055 (Daten-Berechnung)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Requirements Engineer | Initial draft; Delegation an Katalog-API, Fehler-Isolation, BR-01–04 |
