# Ableitung aus: requirements/req/req-062-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-08
Feature: REQ-062 – Lineage-Graph-API (traversierbare Pfade, upstream/downstream/impact)

  Das System MUSS einen dedizierten Lineage-Endpunkt (`GET
  /api/v1/lineage`) bereitstellen, der zu einer gegebenen
  ArchitectureEntity-ID alle upstream- und/oder downstream-verbundenen
  Entitäten durch Traversierung des ArchitectureEntity-Graphen via
  `carries-data`-Connections und angrenzenden `data-flow`-Connections
  berechnet; die Traversierung MUSS Zyklen erkennen (max. 50 Hops) und
  einen vollständigen Pfad als strukturierten JSON-Graphen zurückgeben.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Downstream end-to-end – SAP ERP(1) →[data-flow:5, carries-data:103→DataObject:42]→ DWH(2) →[data...
    Given SAP ERP(1) →[data-flow:5, carries-data:103→DataObject:42]→ DWH(2) →[data-flow:6, carries-data:104→DataObject:42]→ BI Tool(14)
    When  `GET /api/v1/lineage?entityId=42&direction=downstream`
    Then  `nodes` enthält id=1 (SAP ERP), id=2 (DWH), id=14 (BI Tool); `path=[1,2,14]`; `cycleDetected=false`

  @AC2
  Scenario: AC2 – Upstream – gleiche Konfiguration wie AC1
    Given gleiche Konfiguration wie AC1
    When  `GET /api/v1/lineage?entityId=42&direction=upstream`
    Then  `nodes` enthält id=1 (SAP ERP); DWH nur als Zwischenknoten; path rückwärts

  @AC3
  Scenario: AC3 – Zykluserkennung – Zyklus A→B→C→A mit DataObject 42 in allen Flows
    Given Zyklus A→B→C→A mit DataObject 42 in allen Flows
    When  `GET /api/v1/lineage?entityId=42&direction=downstream`
    Then  `cycleDetected=true`; Response enthält traversierten Teilgraph; kein Timeout/Endlosloop

  @AC4
  Scenario: AC4 – EntityType-Filter – `entityTypeFilter=application-component`
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  `entityTypeFilter=application-component`
    Then  Response enthält nur Knoten mit `entityTypeId=application-component`; DataFlows erscheinen nur in `edges`

  @AC5
  Scenario: AC5 – Leeres Ergebnis – DataObject id=42 wird von keinem DataFlow via carries-data referenziert
    Given DataObject id=42 wird von keinem DataFlow via carries-data referenziert
    When  Lineage-Query für id=42
    Then  `nodes=[]`, `edges=[]`, HTTP 200; kein Fehler
