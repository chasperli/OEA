---
id: REQ-062
title: Lineage-Graph-API (traversierbare Pfade, upstream/downstream/impact)
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  use_cases:
    - UC-08
  business_objects:
    - entity
  business_rules: []
  stakeholders:
    - SH-02
  concept:
    - concept/20-entities/06-kern-entitaetstypen.md
    - concept/30-dynamics/13-fach-technik-verlinkung.md
  adrs:
    - ADR-010
supersedes: []
superseded_by: []
---

# REQ-062: Lineage-Graph-API (traversierbare Pfade, upstream/downstream/impact)

## Aussage

Das System MUSS einen dedizierten Lineage-Endpunkt (`GET /api/v1/lineage`) bereitstellen, der zu einer gegebenen ArchitectureEntity-ID alle upstream- und/oder downstream-verbundenen Entitäten durch Traversierung des ArchitectureEntity-Graphen via `carries-data`-Connections und angrenzenden `data-flow`-Connections berechnet; die Traversierung MUSS Zyklen erkennen (max. 50 Hops) und einen vollständigen Pfad als strukturierten JSON-Graphen zurückgeben.

## Begründung

Ein Lineage-Diagramm ohne Query-API ist nur eine statische Visualisierung — nicht abfragbar durch Tooling, CI-Pipelines oder Compliance-Systeme. Die Lineage-API macht die modellierten Datenflüsse zu einer echten Datengrundlage für Impact Analysis, Compliance-Reports und Änderungsmanagement.

## Kontext

Die Traversierung folgt diesem Muster:
1. Gegeben: DataObject-Entity mit id=X
2. Finde alle `carries-data`-Connections, deren `targetEntityId=X`
3. Für jede gefundene `carries-data`-Connection: `sourceEntityId` ist ein DataFlow
4. Vom DataFlow: lese `sourceEntityId` (Quellsystem) und `targetEntityId` (Zielsystem)
5. Rekursiv: vom Zielsystem aus weitersuchen (downstream) oder vom Quellsystem rückwärts (upstream)

`direction=impact` gibt dieselbe Traversierung wie `downstream` zurück, aber annotiert jeden Knoten mit `impact: true` — nützlich für „welche Systeme sind betroffen, wenn dieses Datenobjekt sich ändert?"

## Typ-spezifische Felder

### Query-Parameter

| Parameter | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| entityId | integer | required | | ID der Startentität (typisch: data-object oder system) |
| direction | enum | optional | `both` | `upstream` (Quellen), `downstream` (Konsumenten), `both`, `impact` |
| maxDepth | integer | optional | 50 | Maximale Traversierungstiefe; Minimum 1, Maximum 100 |
| entityTypeFilter | string[] | optional | | Nur Knoten dieser EntityType-IDs im Ergebnis aufführen |

### Response-Struktur

```json
{
  "startEntity": { "id": 42, "name": "Kundenstamm", "entityTypeId": "data-object" },
  "direction": "both",
  "cycleDetected": false,
  "nodes": [
    { "id": 1, "name": "SAP ERP", "entityTypeId": "application-component" },
    { "id": 2, "name": "Data Warehouse", "entityTypeId": "application-component" },
    { "id": 14, "name": "BI Tool", "entityTypeId": "application-component" }
  ],
  "edges": [
    { "id": 5, "entityTypeId": "data-flow", "sourceEntityId": 1, "targetEntityId": 2,
      "viaCarriesData": 103 },
    { "id": 6, "entityTypeId": "data-flow", "sourceEntityId": 2, "targetEntityId": 14,
      "viaCarriesData": 104 }
  ],
  "path": [1, 2, 14]
}
```

**Fehlerfälle**:
- `entityId` nicht gefunden → HTTP 404
- `maxDepth` überschritten → HTTP 400
- Keine Berechtigung zur Entität → HTTP 403

## Akzeptanzkriterien

**AC1** (Downstream end-to-end):
- Gegeben: SAP ERP(1) →[data-flow:5, carries-data:103→DataObject:42]→ DWH(2) →[data-flow:6, carries-data:104→DataObject:42]→ BI Tool(14)
- Wenn: `GET /api/v1/lineage?entityId=42&direction=downstream`
- Dann: `nodes` enthält id=1 (SAP ERP), id=2 (DWH), id=14 (BI Tool); `path=[1,2,14]`; `cycleDetected=false`

**AC2** (Upstream):
- Gegeben: gleiche Konfiguration wie AC1
- Wenn: `GET /api/v1/lineage?entityId=42&direction=upstream`
- Dann: `nodes` enthält id=1 (SAP ERP); DWH nur als Zwischenknoten; path rückwärts

**AC3** (Zykluserkennung):
- Gegeben: Zyklus A→B→C→A mit DataObject 42 in allen Flows
- Wenn: `GET /api/v1/lineage?entityId=42&direction=downstream`
- Dann: `cycleDetected=true`; Response enthält traversierten Teilgraph; kein Timeout/Endlosloop

**AC4** (EntityType-Filter):
- Wenn: `entityTypeFilter=application-component`
- Dann: Response enthält nur Knoten mit `entityTypeId=application-component`; DataFlows erscheinen nur in `edges`

**AC5** (Leeres Ergebnis):
- Gegeben: DataObject id=42 wird von keinem DataFlow via carries-data referenziert
- Wenn: Lineage-Query für id=42
- Dann: `nodes=[]`, `edges=[]`, HTTP 200; kein Fehler

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Bestanden-Kriterium: AC1–AC5 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-061 (carries-data-Verbindungen müssen existieren für sinnvolle Traversierung)
- **Folgewirkungen**: REQ-063 (Canvas nutzt Lineage-API um 3-Punkte-Indikator zu setzen)

## Realisierungs-Hinweise

- BFS-Algorithmus (Breadth-First Search); Visited-Set für Zykluserkennung
- Die carries-data-Connection ist der Schlüssel: Traversierung folgt `carries-data.source → dataFlow → dataFlow.target`
- Keine ORM-Joins über n Ebenen; Graph-Traversierung im Service-Layer (nicht in SQL)
- Caching: kein Cache in v1.0 (live Query); bei Performance-Problemen optional Redis-Cache mit TTL

## Realisierung

- ADR(s): [ADR-010](../../adrs/ADR-010-n-connection-data-lineage.md) (proposed)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | requirements-engineer | Initial draft |
