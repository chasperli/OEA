# Ableitung aus: requirements/req/req-036-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @must @UC-04
Feature: REQ-036 – Connection-EntityType im Metamodell

  Das System MUSS es ermöglichen, beim Anlegen eines Custom EntityTypes
  das Flag `isConnection=true` zu setzen; ein Connection-Typ MUSS an
  jeder seiner Instanzen genau eine `source`- und eine
  `target`-Referenz erzwingen; `source` und `target` DÜRFEN auf
  Instanzen beliebiger EntityType-Klassen zeigen – einschliesslich
  anderer Connection-Instanzen, wodurch T-Beziehungen entstehen; die
  erlaubten Typen für `source` und `target` KÖNNEN optional
  eingeschränkt werden.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – EntityType `DataFlow` mit `isConnection=true`, `allowedSourceTypes=[Appl...
    Given EntityType `DataFlow` mit `isConnection=true`, `allowedSourceTypes=[ApplicationComponent, DataFlow]`, `allowedTargetTypes=[ApplicationComponent, DataFlow]`
    When  Kurt eine neue `DataFlow`-Instanz anlegt ohne `source` anzugeben
    Then  erscheint Validierungsfehler "source ist Pflichtfeld"; kein Objekt wird gespeichert

  @AC2
  Scenario: AC2 – `DataFlow`-Instanz DF-1 (source=AppA, target=AppB) existiert bereits
    Given `DataFlow`-Instanz DF-1 (source=AppA, target=AppB) existiert bereits
    When  Kurt eine neue `DataFlow`-Instanz DF-2 anlegt mit `source=DF-1` (Connection → Connection) und `target=AppC`
    Then  wird DF-2 gespeichert; im Graphen zeigt DF-2 auf DF-1 (T-Beziehung: DF-2 zweigt von DF-1 ab, AppC ist Endpunkt)

  @AC3
  Scenario: AC3 – `DataFlow` hat `allowedSourceTypes=[ApplicationComponent]` (DataFlow nic...
    Given `DataFlow` hat `allowedSourceTypes=[ApplicationComponent]` (DataFlow nicht in der Liste)
    When  Kurt DF-2 mit `source=DF-1` (eine Connection-Instanz) anlegen möchte
    Then  erscheint Validierungsfehler "DataFlow ist kein erlaubter Source-Typ für DataFlow"

  @AC4
  Scenario: AC4 – EntityType `DataFlow` mit `isConnection=true` und Property `protocol (en...
    Given EntityType `DataFlow` mit `isConnection=true` und Property `protocol (enum)`
    When  Kurt eine Instanz mit `source=AppA`, `target=AppB`, `protocol=REST` anlegt
    Then  wird die Instanz mit allen Feldern gespeichert (eigene Properties koexistieren mit source/target)

  @AC5
  Scenario: AC5 – `isConnection=false` (Standard-EntityType `ApplicationComponent`)
    Given `isConnection=false` (Standard-EntityType `ApplicationComponent`)
    When  Kurt eine `ApplicationComponent`-Instanz anlegt
    Then  sind `source` und `target` kein Pflichtfeld; keine Änderung am bestehenden Verhalten

  @AC6
  Scenario: AC6 – eine YAML-Import-Datei (REQ-033) definiert `DataFlow` mit `isConnection=...
    Given eine YAML-Import-Datei (REQ-033) definiert `DataFlow` mit `isConnection=true`
    When  Kurt die Datei importiert
    Then  wird `DataFlow` korrekt als Connection-Typ importiert; `isConnection=true` ist im GUI sichtbar
