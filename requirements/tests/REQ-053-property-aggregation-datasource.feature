# Ableitung aus: requirements/req/req-053-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @should @UC-07
Feature: REQ-053 – PropertyAggregation-DataSource konfigurieren und validieren

  Das System MUSS eine `PropertyAggregationDataSource`-Konfiguration
  für `kpi`- und `chart`-Widgets validieren und bei der
  Daten-Berechnung (REQ-055) als Aggregations-Abfrage auf dem
  Entity-Store auflösen. Die DataSource MUSS folgende Parameter
  unterstützen: `entityType`, `propertyName`, `aggregationFn`
  (sum|count|avg|min|max), optionales `groupBy` und optionale
  `filters`.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Gültige int-Aggregation, kein groupBy – EntityType `plateau` mit PropertyDefinition `investitionskostenPrognose`...
    Given EntityType `plateau` mit PropertyDefinition `investitionskostenPrognose` (kind=int); 3 Plateau-Instanzen mit Werten 5000, 12000, 25000
    When  DataSource konfiguriert mit entityType=plateau, propertyName=investitionskostenPrognose, aggregationFn=sum
    Then  Daten-Berechnung liefert `{ "value": 42000 }`

  @AC2
  Scenario: AC2 – Gültige count-Aggregation mit groupBy – EntityType `application-component`; 20 Entitäten, davon 12 domain=financ...
    Given EntityType `application-component`; 20 Entitäten, davon 12 domain=finance, 8 domain=hr
    When  DataSource mit propertyName=id, aggregationFn=count, groupBy=architectureDomainId
    Then  series=[{group: "finance", value: 12}, {group: "hr", value: 8}]

  @AC3
  Scenario: AC3 – Ungültiger propertyName für sum – PropertyDefinition `name` (kind=varchar) auf EntityType `plateau`
    Given PropertyDefinition `name` (kind=varchar) auf EntityType `plateau`
    When  Widget anlegen mit aggregationFn=sum, propertyName=name
    Then  HTTP 422 „sum/avg/min/max erfordern propertyName mit dataType.kind=int"

  @AC4
  Scenario: AC4 – Ungültiger entityType – Widget anlegen mit entityType=nicht-vorhandener-typ
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Widget anlegen mit entityType=nicht-vorhandener-typ
    Then  HTTP 422 „EntityType 'nicht-vorhandener-typ' nicht in MetamodelConfiguration gefunden"

  @AC5
  Scenario: AC5 – Keine Entitäten vorhanden – EntityType `plateau` hat keine Instanzen im Repository
    Given EntityType `plateau` hat keine Instanzen im Repository
    When  Daten-Berechnung mit aggregationFn=sum
    Then  `{ "value": null }` (kein Fehler; null bedeutet „keine Daten")

  @AC6
  Scenario: AC6 – groupBy=architectureLayerId – 3 EntityTypes je einem Layer zugewiesen; 50 Entitäten verteilt
    Given 3 EntityTypes je einem Layer zugewiesen; 50 Entitäten verteilt
    When  propertyName=id, aggregationFn=count, groupBy=architectureLayerId
    Then  series mit Einträgen pro Layer-ID und deren Entitäten-Anzahl
