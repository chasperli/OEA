# Ableitung aus: requirements/req/req-057-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @should @UC-07
Feature: REQ-057 – Widget-Grid-Layout konfigurieren (GridPosition)

  Das System MUSS für jedes Widget eines Dashboards eine `GridPosition`
  speichern und zur Laufzeit zurückliefern, die bestimmt, wo das Widget
  im **12-Spalten-Raster** des Dashboards platziert wird. Das System
  MUSS `col + width > 12` (Überschreitung der Rasterbreite) als
  Validierungsfehler ablehnen.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Gültige GridPosition – Widget anlegen mit gridPosition={col:4, row:1, width:9, height:3}
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Widget anlegen mit gridPosition={col:4, row:1, width:9, height:3}
    Then  HTTP 201; `col + width = 13` → gültig (Grenze genau ausgeschöpft)

  @AC2
  Scenario: AC2 – Zu breites Widget – Widget anlegen mit gridPosition={col:4, row:1, width:10, height:2}
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Widget anlegen mit gridPosition={col:4, row:1, width:10, height:2}
    Then  HTTP 422 „col + width = 14 überschreitet die maximale Rasterbreite von 12"

  @AC3
  Scenario: AC3 – Ungültige Werte – Widget anlegen mit gridPosition={col:0, row:1, width:3, height:1}
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Widget anlegen mit gridPosition={col:0, row:1, width:3, height:1}
    Then  HTTP 422 „col muss ≥ 1 sein"

  @AC4
  Scenario: AC4 – Height-Limit – Widget anlegen mit height=7
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Widget anlegen mit height=7
    Then  HTTP 422 „height darf maximal 6 sein"

  @AC5
  Scenario: AC5 – GridPosition im Dashboard-Response – Dashboard mit 3 Widgets mit verschiedenen GridPositions
    Given Dashboard mit 3 Widgets mit verschiedenen GridPositions
    When  GET /api/v1/dashboards/{id}
    Then  jedes Widget enthält sein `gridPosition`-Objekt; Client rendert Layout daraus

  @AC6
  Scenario: AC6 – Überlappung nicht serverseitig geblockt – Zwei Widgets werden mit überlappenden GridPositions angelegt
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Zwei Widgets werden mit überlappenden GridPositions angelegt
    Then  beide Widgets werden akzeptiert (HTTP 201); Überlappung ist Client-Problem
