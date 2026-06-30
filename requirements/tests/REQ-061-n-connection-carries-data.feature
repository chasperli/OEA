# Ableitung aus: requirements/req/req-061-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-08
Feature: REQ-061 – n-Connection carries-data — DataFlow mit DataObject verknüpfen

  Das System MUSS es ermöglichen, eine ArchitectureEntity vom Typ
  `carries-data` (`isConnection=true`) anzulegen, bei der
  `sourceEntityId` auf eine Connection-Entity (d.h. eine
  ArchitectureEntity mit `isConnection=true`, z.B.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – carries-data anlegen – DataFlow id=5 (`data-flow`, `allowsConnectionAsSource=true`); DataObject...
    Given DataFlow id=5 (`data-flow`, `allowsConnectionAsSource=true`); DataObject id=42 (`data-object`)
    When  Lukas legt `carries-data`-Connection an mit sourceEntityId=5, targetEntityId=42
    Then  HTTP 201; carries-data erhält eigene Integer-ID (z.B. 103); sourceEntityId=5 und targetEntityId=42 gesetzt

  @AC2
  Scenario: AC2 – Ablehnung wenn source kein allowsConnectionAsSource – ApplicationComponent id=1 (`application-component`, `allowsConnectionAsS...
    Given ApplicationComponent id=1 (`application-component`, `allowsConnectionAsSource=false`)
    When  Lukas versucht carries-data mit sourceEntityId=1 anzulegen
    Then  HTTP 422; Fehlermeldung benennt `application-component` als nicht als Connection-Quelle erlaubt

  @AC3
  Scenario: AC3 – Ablehnung target=Connection – DataFlow id=5 (isConnection=true) als potenzielle targetEntityId
    Given DataFlow id=5 (isConnection=true) als potenzielle targetEntityId
    When  Lukas versucht carries-data mit targetEntityId=5 anzulegen
    Then  HTTP 422

  @AC4
  Scenario: AC4 – Unveränderlichkeit source/target – carries-data id=103 mit sourceEntityId=5, targetEntityId=42
    Given carries-data id=103 mit sourceEntityId=5, targetEntityId=42
    When  Lukas versucht PUT mit sourceEntityId=6
    Then  HTTP 422; source/target wurden nicht geändert

  @AC5
  Scenario: AC5 – Tiefenbegrenzung v1.0 – carries-data id=103; carries-data hat `allowsConnectionAsSource=false`
    Given carries-data id=103; carries-data hat `allowsConnectionAsSource=false`
    When  Lukas versucht, eine weitere Connection mit sourceEntityId=103 anzulegen
    Then  HTTP 422 „n-Connection-Tiefe überschritten"
