# Ableitung aus: requirements/req/req-001-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @must @UC-01
Feature: REQ-001 – OIDC-basierte Anmeldung und Session-Erstellung

  Das System MUSS eine Person, die keine gültige Session besitzt, zur
  Authentifizierung an einen konfigurierten OIDC-Identity-Provider
  weiterleiten und nach erfolgreicher Authentifizierung eine Session
  erstellen, die an die Person und ihre aktiven Rollenzuweisungen
  gebunden ist. Das System KANN zusätzlich zur lokalen Signaturprüfung
  des Identity-Tokens optional eine Online-Validierung gegen den
  Identity-Provider durchführen (z.B.

  Background:
    Given eine OEA-Instanz mit konfiguriertem Authentifizierungsmechanismus
    And eine Person mit E-Mail "test@example.com" und aktiver Rolle existiert

  @AC1
  Scenario: AC1 – eine Person ohne gültige Session ruft eine geschützte Ressource auf
    Given eine Person ohne gültige Session ruft eine geschützte Ressource auf
    When  sie sich erfolgreich beim konfigurierten OIDC-Provider authentifiziert
    Then  erhält sie eine Session, die ihre aktiven Rollenzuweisungen widerspiegelt

  @AC2
  Scenario: AC2 – eine Person besitzt bereits eine gültige Session
    Given eine Person besitzt bereits eine gültige Session
    When  sie eine weitere geschützte Ressource aufruft
    Then  erfolgt kein erneuter Redirect zum Identity-Provider

  @AC3
  Scenario: AC3 – eine Instanz, für die Online-Token-Validierung gegen den IdP konfigurier...
    Given eine Instanz, für die Online-Token-Validierung gegen den IdP konfiguriert ist, und ein Identity-Token, das lokal gültig signiert, aber beim IdP bereits widerrufen wurde
    When  der Login-Vorgang abgeschlossen wird
    Then  wird die Session-Erstellung verweigert

  @AC4
  Scenario: AC4 – ein vom externen IdP ausgestelltes Token mit vom IdP festgelegter Gültig...
    Given ein vom externen IdP ausgestelltes Token mit vom IdP festgelegter Gültigkeitsdauer
    When  OEA die Session erstellt
    Then  übernimmt OEA diese Gültigkeitsdauer unverändert, ohne sie zu verkürzen oder zu verlängern
