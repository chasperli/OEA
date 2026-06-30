# Ableitung aus: requirements/req/req-054-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @should @UC-07
Feature: REQ-054 – CatalogQuery-DataSource konfigurieren und validieren

  Das System MUSS eine `CatalogQueryDataSource`-Konfiguration für
  `table`-Widgets validieren und bei der Daten-Berechnung (REQ-055) auf
  die Katalog-Abfrage-API (REQ-046) delegieren. Die DataSource MUSS
  `catalogId` als Pflichtfeld voraussetzen und MUSS zur Schreibzeit
  prüfen, ob der referenzierte
  [Katalog](../../business-objects/catalog.md) für den anfragenden
  Nutzer sichtbar ist.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Gültige DataSource – Katalog „Application Inventory" (scope=instance) existiert; Kurt ist ein...
    Given Katalog „Application Inventory" (scope=instance) existiert; Kurt ist eingeloggt
    When  Widget anlegen mit type=table, catalogId=<id>
    Then  HTTP 201; DataSource gespeichert

  @AC2
  Scenario: AC2 – Ungültige catalogId – Widget anlegen mit nicht-existierender catalogId
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Widget anlegen mit nicht-existierender catalogId
    Then  HTTP 422 „Katalog nicht gefunden oder nicht sichtbar"

  @AC3
  Scenario: AC3 – Fremder personal-Katalog – Franz hat einen scope=personal-Katalog
    Given Franz hat einen scope=personal-Katalog
    When  Kurt versucht, diesen Katalog als DataSource zu verwenden
    Then  HTTP 403 „Katalog nicht sichtbar"

  @AC4
  Scenario: AC4 – savedViewId gültig – Katalog hat SavedView „Kompaktansicht"
    Given Katalog hat SavedView „Kompaktansicht"
    When  Widget anlegen mit savedViewId=<view-id>
    Then  HTTP 201; beim Daten-Abruf werden Spalten und Filter der SavedView angewendet

  @AC5
  Scenario: AC5 – Katalog später gelöscht – Widget mit CatalogQueryDataSource existiert; Katalog wird danach gelöscht
    Given Widget mit CatalogQueryDataSource existiert; Katalog wird danach gelöscht
    When  GET /api/v1/dashboards/{id}/data
    Then  dieses Widget liefert `{ "status": "error", "error": "Katalog nicht gefunden" }`; andere Widgets rendern normal
