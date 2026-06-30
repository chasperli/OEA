# Ableitung aus: requirements/req/req-091-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @must @UC-12
Feature: REQ-091 – Viewpoint Notation-Mapping Konsistenz

  Das `notationElement`-Dropdown im Viewpoint-Editor MUSS
  ausschliesslich Elemente der gewählten Notation anzeigen
  (Präfix-Filter: `archimate3:*`, `uml:*`, `bpmn:*`). Die Auswahl eines
  Elements mit falschem Präfix MUSS beim Speichern mit HTTP 422
  abgewiesen werden.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Dropdown-Filter nach Notation – `notation=archimate3` ausgewählt ist
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  `notation=archimate3` ausgewählt ist
    Then  zeigt das Dropdown nur `archimate3:*`-Elemente

  @AC2
  Scenario: AC2 – API-Validierung – ein API-Aufruf ein `bpmn:Task`-Element in einem `archimate3`-Viewpoint s...
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  ein API-Aufruf ein `bpmn:Task`-Element in einem `archimate3`-Viewpoint speichern will
    Then  antwortet die API mit HTTP 422

  @AC3
  Scenario: AC3 – Dropdown-Reset bei Notation-Wechsel – die Notation im Formular gewechselt wird
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  die Notation im Formular gewechselt wird
    Then  aktualisieren sich die Dropdown-Inhalte sofort; bereits gewählte inkompatible Elemente werden zurückgesetzt
