# US-091: Viewpoint Notation-Mapping konsistent halten

**ID**: US-091
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Kurt – Lead Enterprise Architekt möchte ich im Viewpoint-Editor nur Notation-Elemente auswählen können, die zur gewählten Notation passen, damit keine inkonsistenten Diagramm-Mappings entstehen.

## Bezug

**Use Case**: [UC-12](../use-cases/UC-12-viewpoint-verwalten.md)
**Persona**: Kurt – Lead Enterprise Architekt (SH-03)
**Requirements**: [REQ-091](../req/REQ-091-viewpoint-notation-mapping.md)

## Akzeptanzkriterien

**AC1** (Dropdown nach Notation gefiltert):
- Wenn: ich `notation=archimate3` auswähle
- Dann: zeigt das Dropdown nur `archimate3:*`-Elemente

**AC2** (API-Validierung):
- Wenn: ein API-Aufruf ein `bpmn:Task`-Element in einem `archimate3`-Viewpoint speichert
- Dann: erhalte ich HTTP 422

**AC3** (Dropdown-Reset bei Wechsel):
- Wenn: ich die Notation im Formular wechsle
- Dann: aktualisiert sich das Dropdown sofort; inkompatible Elemente werden zurückgesetzt

## Definition of Done

- [ ] AC1–AC3 erfüllt
- [ ] Tests vorhanden
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
