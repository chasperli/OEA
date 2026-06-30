# Ableitung aus: requirements/req/req-005-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@compliance @must @UC-01
Feature: REQ-005 – Audit-Log-Eintrag für jeden Login-Versuch

  Das System MUSS für jeden Login-Versuch – erfolgreich oder nicht –
  einen Audit-Log-Eintrag mit Zeitpunkt, verwendetem
  Authentifizierungsmechanismus und Ergebnis erzeugen.

  @AC1
  Scenario: AC1 – ein Login-Versuch (OIDC oder API-Key) wird durchgeführt
    Given ein Login-Versuch (OIDC oder API-Key) wird durchgeführt
    When  er erfolgreich ist
    Then  enthält das Audit-Log einen Eintrag mit Zeitpunkt, Mechanismus, Ergebnis `success` und Identitäts-Referenz

  @AC2
  Scenario: AC2 – ein Login-Versuch schlägt fehl (E1, E2 oder E4)
    Given ein Login-Versuch schlägt fehl (E1, E2 oder E4)
    When  der Fehlschlag eintritt
    Then  enthält das Audit-Log einen Eintrag mit Zeitpunkt, Mechanismus, Ergebnis `failure` und – soweit ohne Preisgabe sicherheitsrelevanter Details möglich – dem Fehlergrund
