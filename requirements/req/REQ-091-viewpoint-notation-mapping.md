---
id: REQ-091
title: Viewpoint Notation-Mapping Konsistenz
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-28
last_updated: 2026-06-28
author: requirements-engineer
references:
  use_cases:
    - UC-12
  business_objects:
    - viewpoint
    - metamodel-configuration
  stakeholders:
    - SH-03
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-091: Viewpoint Notation-Mapping Konsistenz

## Aussage

Das `notationElement`-Dropdown im Viewpoint-Editor MUSS ausschliesslich Elemente der gewählten Notation anzeigen (Präfix-Filter: `archimate3:*`, `uml:*`, `bpmn:*`). Die Auswahl eines Elements mit falschem Präfix MUSS beim Speichern mit HTTP 422 abgewiesen werden.

## Begründung

Ein ArchiMate-Viewpoint mit UML-Elementen würde zu inkonsistenten Diagrammen führen, die in keiner Notation korrekt gerendert werden können. Die Konsistenz zwischen Notation und Mapping-Elementen muss sowohl im Frontend als auch im Backend erzwungen werden.

## Akzeptanzkriterien

**AC1** (Dropdown-Filter nach Notation):
- Wenn: `notation=archimate3` ausgewählt ist
- Dann: zeigt das Dropdown nur `archimate3:*`-Elemente

**AC2** (API-Validierung):
- Wenn: ein API-Aufruf ein `bpmn:Task`-Element in einem `archimate3`-Viewpoint speichern will
- Dann: antwortet die API mit HTTP 422

**AC3** (Dropdown-Reset bei Notation-Wechsel):
- Wenn: die Notation im Formular gewechselt wird
- Dann: aktualisieren sich die Dropdown-Inhalte sofort; bereits gewählte inkompatible Elemente werden zurückgesetzt

## Abhängigkeiten

- **Voraussetzungen**: REQ-090 (Viewpoint-Editor)
- **Folgewirkungen**: keine

## Realisierungs-Hinweise

- Präfix-Filter clientseitig im Dropdown und serverseitig in der Validierungslogik
- Notation-Wechsel triggert reaktive Aktualisierung der Mapping-Felder
- Fehlermeldung bei HTTP 422 benennt das inkonsistente Element explizit

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | requirements-engineer | Initial draft |
