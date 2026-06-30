# Ableitung aus: requirements/req/req-025-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@compliance @must @UC-03
Feature: REQ-025 – Audit-Log-Eintrag für jeden Enrollment-Vorgang

  Das System MUSS für jeden abgeschlossenen Enrollment-Vorgang –
  erfolgreich oder fehlgeschlagen – einen Audit-Log-Eintrag mit
  Zeitpunkt, betroffener Person-ID, eingerichteter Methode und Ergebnis
  erzeugen; Credentials-Werte (Secrets, Hashes, Public Keys) DÜRFEN
  NICHT im Audit-Log erscheinen.

  @AC1
  Scenario: AC1 – ein Enrollment-Vorgang wird erfolgreich abgeschlossen (REQ-022, REQ-023 ...
    Given ein Enrollment-Vorgang wird erfolgreich abgeschlossen (REQ-022, REQ-023 oder REQ-024)
    When  die Methode persistiert ist
    Then  enthält das Audit-Log einen Eintrag mit: Zeitpunkt (ISO 8601), Person-ID, Methoden-Typ (totp | passkey | password), Ergebnis `success`

  @AC2
  Scenario: AC2 – ein Enrollment-Vorgang schlägt fehl (z.B. TOTP-Verifikation fehlgeschlag...
    Given ein Enrollment-Vorgang schlägt fehl (z.B. TOTP-Verifikation fehlgeschlagen, Passkey-Abbruch, Passwort zu schwach)
    When  der Fehlschlag eintritt
    Then  enthält das Audit-Log einen Eintrag mit Zeitpunkt, Person-ID (soweit aus Token ermittelbar), Methoden-Typ, Ergebnis `failure` und Fehlergrund (generisch, ohne sensible Details)

  @AC3
  Scenario: AC3 – ein Audit-Log-Eintrag für einen Enrollment-Vorgang
    Given ein Audit-Log-Eintrag für einen Enrollment-Vorgang
    When  er in der Log-Infrastruktur gespeichert ist
    Then  enthält er keine Credentials-Werte (kein TOTP-Secret, kein Passwort-Hash, kein Public Key)

  @AC4
  Scenario: AC4 – ein ungültiges Enrollment-Token wird eingereicht (E1 aus UC-03)
    Given ein ungültiges Enrollment-Token wird eingereicht (E1 aus UC-03)
    When  der Fehlschlag eintritt
    Then  enthält das Audit-Log einen Eintrag mit Zeitpunkt, Ergebnis `failure`, Fehlergrund `invalid_token`; keine Person-ID (Token ist ungültig, Person nicht ermittelbar)
