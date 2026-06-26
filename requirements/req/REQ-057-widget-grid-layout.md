---
id: REQ-057
title: Widget-Grid-Layout konfigurieren (GridPosition)
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

# REQ-057: Widget-Grid-Layout konfigurieren (GridPosition)

## Aussage

Das System MUSS für jedes Widget eines Dashboards eine `GridPosition` speichern und zur Laufzeit zurückliefern, die bestimmt, wo das Widget im **12-Spalten-Raster** des Dashboards platziert wird. Das System MUSS `col + width > 12` (Überschreitung der Rasterbreite) als Validierungsfehler ablehnen. Vertikale Reihen sind unbegrenzt (Dashboard scrollt); Widget-Überlappung wird serverseitig nicht geprüft (Verantwortung des Clients).

## Begründung

Ein einheitliches Grid-Layout (12 Spalten, analog zu Bootstrap/Material-Grid) ermöglicht eine flexible Positionierung von Widgets ohne feste Vorgaben. Die Breiten-Validierung serverseitig verhindert offensichtlich fehlerhafte Layouts; Überlappungs-Detektion ist Client-Aufgabe (Drag-and-Drop-Editor in der Client App).

## Typ-spezifische Felder

### GridPosition-Felder

| Feld | Typ | Wertebereich | Beschreibung |
|---|---|---|---|
| col | integer | 1–12 | Startspalte (1-basiert) |
| row | integer | ≥ 1 | Startzeile (1-basiert; unbegrenzt nach unten) |
| width | integer | 1–12 | Spaltenbreite; `col + width` darf 13 nicht überschreiten |
| height | integer | 1–6 | Höhe in Rastereinheiten (1 = kleinste Einheit, ~150px) |

GridPosition wird bei Widget-Anlage (REQ-052 POST) und Widget-Update (PUT) gesetzt und validiert.

### Persistenz und Abruf

- GridPosition wird als Teil der Widget-Konfiguration gespeichert
- `GET /api/v1/dashboards/{id}` liefert alle Widgets inkl. deren GridPositions
- Das Frontend liest GridPositions und rendert das Layout; serverseitig keine Layout-Berechnung

## Business Rules

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | `col + width` DARF 13 nicht überschreiten; bei Verletzung → HTTP 422 | onCreate, onUpdate |
| BR-02 | `col`, `row`, `width`, `height` sind positive ganze Zahlen; 0 und Negativwerte → 422 | onCreate, onUpdate |
| BR-03 | `height` ist auf maximal 6 begrenzt (entspricht ca. 900px bei 150px Einheitsgrösse) | onCreate, onUpdate |
| BR-04 | Widget-Überlappung wird serverseitig nicht geprüft; der Client ist für überlappungsfreies Layout verantwortlich | – |

## Akzeptanzkriterien

**AC1** (Gültige GridPosition):
- Wenn: Widget anlegen mit gridPosition={col:4, row:1, width:9, height:3}
- Dann: HTTP 201; `col + width = 13` → gültig (Grenze genau ausgeschöpft)

**AC2** (Zu breites Widget):
- Wenn: Widget anlegen mit gridPosition={col:4, row:1, width:10, height:2}
- Dann: HTTP 422 „col + width = 14 überschreitet die maximale Rasterbreite von 12"

**AC3** (Ungültige Werte):
- Wenn: Widget anlegen mit gridPosition={col:0, row:1, width:3, height:1}
- Dann: HTTP 422 „col muss ≥ 1 sein"

**AC4** (Height-Limit):
- Wenn: Widget anlegen mit height=7
- Dann: HTTP 422 „height darf maximal 6 sein"

**AC5** (GridPosition im Dashboard-Response):
- Gegeben: Dashboard mit 3 Widgets mit verschiedenen GridPositions
- Wenn: GET /api/v1/dashboards/{id}
- Dann: jedes Widget enthält sein `gridPosition`-Objekt; Client rendert Layout daraus

**AC6** (Überlappung nicht serverseitig geblockt):
- Wenn: Zwei Widgets werden mit überlappenden GridPositions angelegt
- Dann: beide Widgets werden akzeptiert (HTTP 201); Überlappung ist Client-Problem

## Abhängigkeiten

- Teil von: REQ-052 (Widget anlegen/konfigurieren) – GridPosition ist Pflichtfeld jedes Widgets
- Rendering: Client App (Electron, ADR-009) verwaltet Drag-and-Drop-Editor; Web Portal rendert Grid read-only

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Requirements Engineer | Initial draft; 12-Spalten-Grid, Breiten-Validierung, Überlappung client-seitig |
