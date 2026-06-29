---
id: REQ-145
title: Shape Drag-to-Canvas with Entity Lookup and Inline Creation
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-29
last_updated: 2026-06-29
author: requirements-engineer
references:
  use_cases:
    - UC-05
  business_objects:
    - diagram
    - architecture-element
  business_rules: []
  stakeholders:
    - SH-01
    - SH-03
    - SH-04
    - SH-07
  concept: []
  adrs:
    - ADR-007
    - ADR-019
supersedes: []
superseded_by: []
---

# REQ-145: Shape Drag-to-Canvas with Entity Lookup and Inline Creation

## Aussage

Das System MUSS nach dem Ablegen einer Shape-Vorlage aus der Palette auf den Canvas einen Entity-Lookup-Dialog anzeigen. Der Dialog MUSS ein Texteingabefeld enthalten, das während der Eingabe bestehende Entitäten desselben Typs als Autocomplete-Vorschläge anzeigt. Wenn der Nutzer eine bestehende Entität auswählt, MUSS diese als Shape-Referenz in das Diagramm eingefügt werden (keine Neuanlage). Wenn keine passende Entität gefunden wird und der Nutzer "OK" bestätigt, MUSS eine neue Entität des entsprechenden Typs angelegt und gleichzeitig in das Diagramm eingefügt werden. Wird "Cancel" gedrückt oder die Ablage rückgängig gemacht, DARF keine Entität angelegt werden.

## Begründung

In OEA gibt es eine strikte Trennung zwischen dem Modell (Entitäten in der Solution) und der Darstellung (Shapes im Diagramm). Jede Shape im Diagramm ist eine Referenz auf eine Entität — nicht die Entität selbst. Dieser Dialog stellt sicher, dass der Nutzer bewusst entscheidet, ob er eine bestehende Entität referenziert oder eine neue anlegt. Das verhindert versehentliche Duplikate und fördert die Wiederverwendung bestehender Architekturelemente.

## Kontext

| Szenario | Ergebnis |
|---|---|
| Nutzer zieht AC-Shape auf Canvas, tippt "Catalog-Service", wählt bestehende Entität aus | Shape wird eingefügt, Entität unverändert |
| Nutzer zieht AC-Shape auf Canvas, tippt "New-Service", kein Match, drückt OK | Neue Entität "New-Service" [AC] wird angelegt + Shape eingefügt |
| Nutzer zieht AC-Shape auf Canvas, drückt Cancel | Shape und Drop werden rückgängig gemacht |
| Nutzer zieht gleiche Entität ein zweites Mal in dasselbe Diagramm | System warnt: "Diese Entität ist bereits im Diagramm vorhanden. Nochmals einfügen?" |

## Typ-spezifische Felder

### Bei type=functional

**Eingaben (nach Drop)**:

| Feld | Typ | Beschreibung |
|---|---|---|
| dropPosition | {x, y} | Canvas-Koordinate des Drops |
| entityType | string | Metamodell-Typ der abgelegten Shape (z.B. "ApplicationComponent") |
| searchQuery | string | Vom Nutzer eingegebener Text im Lookup-Feld |

**Verarbeitung**:

1. Nach Drop: Entity-Lookup-Dialog erscheint inline auf dem Canvas nahe der Drop-Position
2. Dialog zeigt Typ-Badge (z.B. [AC]) und Typ-Label als Kontext
3. Während der Eingabe: `GET /api/v1/entities?type={entityType}&q={searchQuery}` — Debounce 200ms
4. Autocomplete listet max. 8 Treffer mit Typ-Badge und Namen; bestehende Entitäten werden mit "existing" markiert
5. Nutzer wählt bestehende Entität → `POST /api/v1/diagrams/{id}/shapes` mit `entityId` (kein Anlegen)
6. Nutzer tippt neuen Namen + OK → `POST /api/v1/entities` (Anlegen) + `POST /api/v1/diagrams/{id}/shapes`
7. Nutzer Cancel → Drop rückgängig, keine API-Calls

**Ausgaben**:

- Shape erscheint auf Canvas an der Drop-Position
- Neue Entität wird im Explorer-Tree unter dem entsprechenden Typ-Ordner sichtbar
- Log: "[INFO] Shape inserted: <Name> (<Type>)  ·  entity: existing|new"

## Akzeptanzkriterien

**AC1** (Bestehende Entität einfügen):
- Gegeben: Entität "Catalog-Service" [AC] existiert in der Solution
- Wenn: Nutzer zieht [AC]-Shape auf Canvas, tippt "Catalog", sieht "Catalog-Service (existing)", wählt es
- Dann: Shape erscheint auf Canvas; kein neues Objekt im Modell; Log zeigt "existing"

**AC2** (Neue Entität anlegen):
- Wenn: Nutzer tippt "New-Reporting-Service", kein Autocomplete-Match, drückt OK
- Dann: Neue Entität "New-Reporting-Service" [AC] wird angelegt; Shape erscheint auf Canvas; Explorer-Tree aktualisiert

**AC3** (Autocomplete bei Eingabe):
- Wenn: Nutzer tippt "auth"
- Dann: Dropdown zeigt max. 8 Entitäten mit "auth" im Namen; Antwortzeit < 300 ms bei 10 000 Entitäten

**AC4** (Cancel = kein Side-Effect):
- Wenn: Nutzer drückt Cancel oder ESC nach dem Drop
- Dann: Keine Entität angelegt, keine Shape im Diagramm, Drop vollständig rückgängig

**AC5** (Duplikat-Warnung):
- Wenn: Nutzer zieht dieselbe Entität ein zweites Mal in das gleiche Diagramm
- Dann: System zeigt Warnung "Entity already on canvas — insert again?" mit Ja/Nein

## Abhängigkeiten

- Blockiert durch: REQ-144 (Shape-Palette), REQ-031 (Entity anlegen)
- Zusammenhang: REQ-047 (Filter-Abfragen), REQ-146 (Delete-Verhalten)
- Betrifft: ADR-007 (Canvas-Bibliothek — Drag-and-Drop-API)

## Realisierungs-Hinweise

- Lookup-Endpoint: `GET /api/v1/entities?type=ApplicationComponent&q=catalog&solutionId=…&limit=8`
- Shape-Insert: `POST /api/v1/diagrams/{id}/shapes` `{ entityId, x, y, w, h }`
- Entity-Create + Shape-Insert ist eine atomare Transaktion (beides schlägt fehl oder beides gelingt)
- Der Lookup-Dialog erscheint inline auf dem Canvas (kein modales Overlay), damit der Nutzer die Drop-Position sieht

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-29 | Requirements Engineer | Initial draft |
