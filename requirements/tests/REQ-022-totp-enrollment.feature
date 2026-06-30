# Ableitung aus: requirements/req/req-022-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-03
Feature: REQ-022 – TOTP-Secret-Enrollment (Authenticator-App einrichten)

  Das System SOLL das Einrichten eines TOTP-Secrets (RFC 6238) als
  lokale Authentifizierungsmethode ermöglichen, indem es ein Secret
  generiert, es als QR-Code (Key-URI-Format) und im Klartext anzeigt,
  einen Verifikations-Code entgegennimmt und das Secret nur bei
  bestandener Verifikation verschlüsselt persistiert.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Kurt hat TOTP als Methode gewählt
    Given Kurt hat TOTP als Methode gewählt
    When  das System das Secret generiert
    Then  wird ein QR-Code (Key-URI-Format) und der Secret-Klartext angezeigt

  @AC2
  Scenario: AC2 – Kurt scannt den QR-Code und gibt den aktuellen TOTP-Code ein
    Given Kurt scannt den QR-Code und gibt den aktuellen TOTP-Code ein
    When  der Code korrekt ist (innerhalb Zeittoleranz ±1 Schritt)
    Then  ist das Secret verschlüsselt persistiert und mit Kurts Person verknüpft; der Login mit diesem TOTP ist ab sofort möglich (UC-01 A4)

  @AC3
  Scenario: AC3 – Kurt gibt einen falschen TOTP-Code ein
    Given Kurt gibt einen falschen TOTP-Code ein
    When  die Verifikation schlägt fehl
    Then  wird kein Secret persistiert, das Enrollment-Token bleibt gültig, Kurt kann es erneut versuchen

  @AC4
  Scenario: AC4 – Enrollment wurde abgeschlossen
    Given Enrollment wurde abgeschlossen
    When  das System Log-Einträge schreibt
    Then  ist das TOTP-Secret weder im Klartext noch als Hash in Logs enthalten

  @AC5
  Scenario: AC5 – das TOTP-Secret ist persistiert
    Given das TOTP-Secret ist persistiert
    When  es in der Datenbank gespeichert ist
    Then  ist es verschlüsselt (nicht im Klartext lesbar ohne Entschlüsselungsschlüssel)
