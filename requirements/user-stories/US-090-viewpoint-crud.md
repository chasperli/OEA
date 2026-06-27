# US-090: Viewpoint anlegen, bearbeiten und löschen

**ID**: US-090
**Story Points**: 8
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Kurt – Lead Enterprise Architekt möchte ich eigene Viewpoints mit Notation, erlaubten Entity- und Verbindungstypen sowie Notation-Mappings anlegen, bearbeiten und löschen, damit ich organisationsspezifische Sichtweisen im EA-Repository abbilden kann.

## Bezug

**Use Case**: [UC-12](../use-cases/UC-12-viewpoint-verwalten.md)
**Persona**: Kurt – Lead Enterprise Architekt (SH-03)
**Requirements**: [REQ-090](../req/REQ-090-viewpoint-anlegen-bearbeiten-loeschen.md)

## Akzeptanzkriterien

**AC1** (Viewpoint anlegen):
- Wenn: ich einen neuen Viewpoint mit 3 EntityTypes anlege
- Dann: erhalte ich HTTP 201; der Viewpoint ist sofort für neue Diagramme auswählbar

**AC2** (EntityType entfernen mit Warnung):
- Wenn: ich beim Bearbeiten einen genutzten EntityType entferne
- Dann: sehe ich eine Warnung "N Diagramme betroffen"; die Bearbeitung ist nicht blockiert

**AC3** (Viewpoint löschen):
- Wenn: ich einen user-defined Viewpoint lösche
- Dann: wird er aus der MetamodelConfiguration entfernt

## Definition of Done

- [ ] AC1–AC3 erfüllt
- [ ] Tests vorhanden
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
