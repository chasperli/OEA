# Ableitung aus: requirements/req/req-124-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @must @UC-21
Feature: REQ-124 – PropertyDefinition um visibilityMode erweitern

  Das Datenmodell der `PropertyDefinition` (in
  `MetamodelConfiguration`) MUSS um drei neue Felder erweitert werden:
  | Feld | Typ | Default | Constraint | |---|---|---|---| |
  `visibilityMode` | enum | `public` | `[public, role-restricted,
  connection-scoped]` | | `allowedRoles` | Role[] | [] | Pflicht wenn
  `visibilityMode = role-restricted`; mind. 1 Eintrag | |
  `scopingConnectionType` | string | null | Pflicht wenn
  `visibilityMode = connection-scoped`; muss gültige
  `ConnectionType`-ID referenzieren | **Semantik der Modi**: -
  `public`: Wert ist für jeden authentifizierten Nutzer lesbar und
  schreibbar (aktuelles Verhalten, Default) - `role-restricted`: Wert
  ist nur für Nutzer lesbar/schreibbar, deren aktive Rolle in
  `allowedRoles` enthalten ist - `connection-scoped`: Wert ist nur für
  Nutzer lesbar/schreibbar, die über den Connection-Typ
  `scopingConnectionType` einen Pfad zur angefragten Entität im Graphen
  haben

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Datenmodell – Eine `PropertyDefinition` angelegt oder bearbeitet wird
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Eine `PropertyDefinition` angelegt oder bearbeitet wird
    Then  `visibilityMode` ist speicherbar; Default `public` ist korrekt

  @AC2
  Scenario: AC2 – Validierung role-restricted – `visibilityMode = role-restricted` und `allowedRoles` leer
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  `visibilityMode = role-restricted` und `allowedRoles` leer
    Then  Speichern wird mit Validierungsfehler abgelehnt

  @AC3
  Scenario: AC3 – Validierung connection-scoped – `visibilityMode = connection-scoped` und `scopingConnectionType` zeigt a...
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  `visibilityMode = connection-scoped` und `scopingConnectionType` zeigt auf nicht-existierende ConnectionType-ID
    Then  Speichern wird mit Validierungsfehler abgelehnt

  @AC4
  Scenario: AC4 – Abwärtskompatibilität – Bestehende `PropertyDefinition` ohne `visibilityMode`
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Bestehende `PropertyDefinition` ohne `visibilityMode`
    Then  Default `public` wird angewandt; bestehende Werte bleiben erhalten
