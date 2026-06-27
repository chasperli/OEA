# US-092: System-definierte Viewpoints sind schreibgeschützt

**ID**: US-092
**Story Points**: 2
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Kurt – Lead Enterprise Architekt möchte ich, dass system-definierte Viewpoints wie ArchiMate 3 oder BPMN 2.0 nicht bearbeitet oder gelöscht werden können, damit das Rendering-System stabil bleibt.

## Bezug

**Use Case**: [UC-12](../use-cases/UC-12-viewpoint-verwalten.md)
**Persona**: Kurt – Lead Enterprise Architekt (SH-03)
**Requirements**: [REQ-092](../req/REQ-092-system-viewpoint-schreibgeschuetzt.md)

## Akzeptanzkriterien

**AC1** (API-Schreibschutz):
- Wenn: ich einen DELETE-Request für einen system-defined Viewpoint sende
- Dann: erhalte ich HTTP 422

**AC2** (UI-Schreibschutz):
- Wenn: system-definierte Viewpoints in der Liste angezeigt werden
- Dann: sind Bearbeiten- und Löschen-Buttons nicht sichtbar

**AC3** (Import-Schutz):
- Wenn: beim Import system-defined Viewpoints enthalten sind
- Dann: werden diese nicht überschrieben

## Definition of Done

- [ ] AC1–AC3 erfüllt
- [ ] Tests vorhanden
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
