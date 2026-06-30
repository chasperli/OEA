# Ableitung aus: requirements/req/req-016-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@compliance @must @UC-02
Feature: REQ-016 – Audit-Log-Eintrag für den Bootstrapping-Vorgang

  Das System MUSS jeden abgeschlossenen oder abgelehnten
  Bootstrapping-Vorgang mit Zeitpunkt, gewähltem Modus (lokal/remote)
  und Ergebnis im Audit-Log erfassen.

  @AC1
  Scenario: AC1 – ein erfolgreich abgeschlossener lokaler oder remote Bootstrapping-Vorgang
    Given ein erfolgreich abgeschlossener lokaler oder remote Bootstrapping-Vorgang
    When  er abgeschlossen ist
    Then  enthält das Audit-Log einen Eintrag mit Zeitpunkt, Modus und Ergebnis `success`

  @AC2
  Scenario: AC2 – ein abgelehnter Bootstrapping-Versuch (z.B. wegen REQ-015)
    Given ein abgelehnter Bootstrapping-Versuch (z.B. wegen REQ-015)
    When  die Ablehnung erfolgt
    Then  enthält das Audit-Log einen Eintrag mit Zeitpunkt und Ergebnis `rejected`
