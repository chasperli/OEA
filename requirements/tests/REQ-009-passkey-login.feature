# Ableitung aus: requirements/req/req-009-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-01
Feature: REQ-009 – Passkey-Login (lokale Authentifizierung ohne externen IdP)

  Das System SOLL Personen die Anmeldung per Passkey (WebAuthn/FIDO2)
  ermöglichen, wenn die OEA-Instanz ohne externen
  OIDC-Identity-Provider betrieben wird. Bei Passkeys, die als
  discoverable credential (resident key) registriert wurden, SOLL die
  Anmeldung ohne vorherige Eingabe von Username oder Passwort möglich
  sein.

  Background:
    Given eine OEA-Instanz mit konfiguriertem Authentifizierungsmechanismus
    And eine Person mit E-Mail "test@example.com" und aktiver Rolle existiert

  @AC1
  Scenario: AC1 – eine Person mit zuvor registriertem Passkey
    Given eine Person mit zuvor registriertem Passkey
    When  sie sich mit diesem Passkey anmeldet
    Then  erhält sie eine Session gemäß ihren aktiven Rollenzuweisungen

  @AC2
  Scenario: AC2 – eine fehlgeschlagene Passkey-Verifikation
    Given eine fehlgeschlagene Passkey-Verifikation
    When  der Login-Versuch abgeschlossen wird
    Then  wird keine Session erstellt und die Fehlermeldung ist nicht von anderen Fehlerfällen (z.B. E1, E2) unterscheidbar

  @AC3
  Scenario: AC3 – eine Person mit einem als discoverable credential registrierten Passkey
    Given eine Person mit einem als discoverable credential registrierten Passkey
    When  sie sich anmeldet
    Then  ist keine vorherige Eingabe von Username oder Passwort erforderlich
