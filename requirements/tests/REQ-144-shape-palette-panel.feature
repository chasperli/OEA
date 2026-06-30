# Ableitung aus: requirements/req/req-144-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @must @UC-05 @UC-12
Feature: REQ-144 – Collapsible Shape Palette Panel in Diagram Editor

  Das System MUSS im Diagramm-Editor eine Shape-Palette anbieten, die
  als eigenständiges Panel zwischen dem Explorer und dem Diagram-Canvas
  positioniert ist. Das Panel MUSS per Toggle-Button (◀ / ▶)
  vollständig ein- und ausgeblendet werden können.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Palette zeigt nur erlaubte Typen – Viewpoint "Application Layer View" erlaubt AC, AS, AI, AF, AP
    Given Viewpoint "Application Layer View" erlaubt AC, AS, AI, AF, AP
    When  Diagramm-Editor mit diesem Viewpoint geöffnet wird
    Then  Palette zeigt nur die 5 erlaubten Typen; Technology-Typen sind ausgegraut/ausgeblendet

  @AC2
  Scenario: AC2 – Kein Viewpoint = alle Typen – Diagramm-Editor ohne aktiven Viewpoint (free-form)
    Given Diagramm-Editor ohne aktiven Viewpoint (free-form)
    When die beschriebene Aktion ausgeführt wird
    Then  Alle konfigurierten Metamodell-Typen erscheinen in der Palette

  @AC3
  Scenario: AC3 – Kollabieren/Expandieren – Nutzer klickt auf Toggle-Button (◀)
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer klickt auf Toggle-Button (◀)
    And   Nutzer klickt erneut (▶)
    Then  Panel kollabiert auf 28px breiten Streifen; Canvas gewinnt den freigewordenen Platz
    And   Panel expandiert wieder auf Standardbreite

  @AC4
  Scenario: AC4 – Persistenz des Zustands – Nutzer kollabiert die Palette und schliesst den Editor
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer kollabiert die Palette und schliesst den Editor
    Then  Beim nächsten Öffnen ist die Palette weiterhin kollabiert
