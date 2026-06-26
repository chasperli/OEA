# US-065: Lineage-Query — Datenpfad upstream/downstream abfragen

**ID**: US-065
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Data Architekt möchte ich zu einem Datenobjekt alle Quellsysteme (upstream) und alle Konsumenten (downstream) per API abfragen – damit ich sofort sehe, welchen Weg ein Datenobjekt durch die Systemlandschaft nimmt und welche Systeme bei einer Schemaänderung betroffen wären.

## Bezug

**Use Case**: [UC-08](../use-cases/UC-08-data-lineage-modellieren.md)
**Persona**: Lukas – Senior Data Architekt (SH-02)
**Requirements**: [REQ-062](../req/REQ-062-lineage-graph-api.md)

## Akzeptanzkriterien

**AC1** (Downstream end-to-end):
- Gegeben: SAP ERP(1) →[data-flow:5]→ DWH(2) →[data-flow:6]→ BI Tool(14); beide Flows tragen DataObject 42 via carries-data
- Wenn: `GET /api/v1/lineage?entityId=42&direction=downstream`
- Dann: Response enthält SAP ERP, DWH, BI Tool in korrekter Reihenfolge; `path=[1,2,14]`; `cycleDetected=false`

**AC2** (Upstream):
- Gegeben: gleiche Konfiguration
- Wenn: `GET /api/v1/lineage?entityId=42&direction=upstream`
- Dann: Response enthält SAP ERP als Quelle; Pfad rückwärts korrekt

**AC3** (Impact-Modus):
- Wenn: `direction=impact` für DataObject 42
- Dann: gleiche Knoten wie downstream; alle mit `impact: true` annotiert

**AC4** (Zykluserkennung):
- Gegeben: Zyklus A→B→C→A, alle mit DataObject 42
- Wenn: Lineage-Query
- Dann: `cycleDetected=true`; kein Timeout; traversierter Teilgraph zurückgegeben

**AC5** (Keine Ergebnisse):
- Gegeben: DataObject 42 in keinem carries-data referenziert
- Wenn: Lineage-Query
- Dann: `nodes=[]`, `edges=[]`, HTTP 200

## Technische Hinweise

- BFS-Traversierung über carries-data → data-flow → system; max 50 Hops
- Zykluserkennung via Visited-Set

## Definition of Done

- [ ] AC1–AC5 erfüllt
- [ ] Tests: Downstream, Upstream, Impact, Zyklus, Leer
- [ ] Code-Review
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen
