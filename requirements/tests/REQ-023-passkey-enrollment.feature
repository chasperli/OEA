# Ableitung aus: requirements/req/req-023-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-03
Feature: REQ-023 – Passkey-Enrollment (WebAuthn-Credential-Registrierung)

  Das System SOLL das Registrieren eines Passkeys (WebAuthn Level 2 /
  FIDO2) als lokale Authentifizierungsmethode ermöglichen, indem es
  eine Registrierungs-Challenge generiert, die Authenticator-Antwort
  verifiziert und den Public Key des registrierten Credentials
  persistent mit dem Person-Objekt verknüpft.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Kurt hat Passkey als Methode gewählt und einen kompatiblen Authenticator
    Given Kurt hat Passkey als Methode gewählt und einen kompatiblen Authenticator
    When  er die Authenticator-Bestätigung abschließt
    Then  ist der Public Key persistent gespeichert und der Login per Passkey (UC-01 A3) ist ab sofort möglich

  @AC2
  Scenario: AC2 – Kurt bricht die Authenticator-Bestätigung ab
    Given Kurt bricht die Authenticator-Bestätigung ab
    When  der Abbruch eintritt
    Then  wird kein Credential gespeichert, das Enrollment-Token bleibt gültig

  @AC3
  Scenario: AC3 – eine Person hat bereits einen registrierten Passkey
    Given eine Person hat bereits einen registrierten Passkey
    When  sie einen weiteren Passkey registriert (z.B. zweites Gerät)
    Then  sind beide Credentials gespeichert und einzeln für den Login verwendbar

  @AC4
  Scenario: AC4 – eine Registrierungsantwort mit falschem Origin oder RP-ID
    Given eine Registrierungsantwort mit falschem Origin oder RP-ID
    When  das System sie verarbeitet
    Then  wird sie abgelehnt, kein Credential persistiert
