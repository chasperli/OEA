# US-066: n-Connection-Indikator im Canvas sehen

**ID**: US-066
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Data Architekt möchte ich auf einen Blick sehen, welche Verbindungen im Diagramm zusätzliche n-Connections tragen – damit ich weiss, an welchen Pfeilen ich weitere Informationen (z.B. transportierte Datenobjekte) per Doppelklick abrufen kann.

## Bezug

**Use Case**: [UC-08](../use-cases/UC-08-data-lineage-modellieren.md)
**Persona**: Lukas – Senior Data Architekt (SH-02); auch alle anderen Canvas-Nutzer (SH-03, SH-04)
**Requirements**: [REQ-063](../req/REQ-063-n-connection-canvas-darstellung.md)

## Akzeptanzkriterien

**AC1** (Indikator erscheint bei n-Connection):
- Gegeben: DataFlow id=5 ist sourceEntityId von carries-data id=103
- Wenn: Lukas öffnet Diagramm mit DataFlow id=5
- Dann: Kreis mit `•••` erscheint auf der Verbindungslinie; bei Zoom-out weiterhin sichtbar

**AC2** (Kein Indikator ohne n-Connection):
- Gegeben: DataFlow id=7 hat keine n-Connections
- Wenn: Diagramm mit DataFlow id=7
- Dann: Kein Indikator auf dieser Linie

**AC3** (Gesamtzahl angezeigt):
- Gegeben: DataFlow id=5 hat 5 n-Connections (3 carries-data + 2 security-control)
- Wenn: Diagramm geladen
- Dann: Ein einziger Indikator mit Zahl „5" oder `•••`; nicht 5 separate Kreise

**AC4** (Web Portal zeigt Indikator auch):
- Wenn: CIO öffnet Diagramm im Web Portal mit n-Connection-Indikator
- Dann: Indikator sichtbar (read-only; kein Anlege-Button)

## Technische Hinweise

- `hasNConnections: bool` und `nConnectionCount: int` vom Backend beim Diagramm-Load
- React Flow Custom Edge mit optionalem Kreismarker

## Definition of Done

- [ ] AC1–AC4 erfüllt
- [ ] Tests: Indikator-Sichtbarkeit, Abwesenheit, Zählung; E2E-Test im Canvas
- [ ] Code-Review
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen
