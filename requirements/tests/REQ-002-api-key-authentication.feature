# Ableitung aus: requirements/req/req-002-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-01
Feature: REQ-002 – API-Key-Authentifizierung für Maschine-zu-Maschine-Zugriffe

  Das System SOLL Anfragen mit gültigem API-Key direkt validieren
  können, ohne Redirect zu einem OIDC-Identity-Provider, und die dem
  API-Key zugeordnete Identität samt aktiven Rollenzuweisungen
  ermitteln.

  Background:
    Given eine OEA-Instanz mit konfiguriertem Authentifizierungsmechanismus
    And eine Person mit E-Mail "test@example.com" und aktiver Rolle existiert

  @AC1
  Scenario: AC1 – ein Request enthält einen gültigen, nicht widerrufenen API-Key
    Given ein Request enthält einen gültigen, nicht widerrufenen API-Key
    When  der Request gegen eine geschützte Ressource gestellt wird
    Then  wird er ohne Redirect autorisiert, gemäß den Rollen der zugeordneten Identität

  @AC2
  Scenario: AC2 – ein Request enthält einen ungültigen oder widerrufenen API-Key
    Given ein Request enthält einen ungültigen oder widerrufenen API-Key
    When  der Request gestellt wird
    Then  wird er abgelehnt, ohne dass ein Autorisierungs-Kontext entsteht
