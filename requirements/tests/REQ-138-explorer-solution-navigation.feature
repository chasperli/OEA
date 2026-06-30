# Ableitung aus: requirements/req/req-138-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert) + demonstration

@functional @must @UC-13
Feature: REQ-138 – Browser-Panel zeigt Solutions als primäre Navigationsebene

  Der Browser-Panel im Native Client MUSS Solutions als primäre
  Navigationsknoten auf der obersten Ebene anzeigen. Als erster Knoten
  MUSS ein virtueller „Aktueller Stand"-Knoten erscheinen, der die
  aggregierten Inhalte aller realisierten Lösungen darstellt.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Mindestens eine implementierte Solution existiert
    Given Mindestens eine implementierte Solution existiert
    When  Browser-Panel geöffnet wird
    Then  „Aktueller Stand" erscheint als erster Knoten

  @AC2
  Scenario: AC2 – Solution mit `fromPlateauId=P1, toPlateauId=P2`
    Given Solution mit `fromPlateauId=P1, toPlateauId=P2`
    When  Browser-Panel geladen wird
    Then  Solution erscheint unter Plateau-Knoten (z.B. „IST → SOLL 2027")

  @AC3
  Scenario: AC3 – Solution mit `status=archived`
    Given Solution mit `status=archived`
    When  Browser-Panel angezeigt wird
    Then  Archivierte Solution ist nicht sichtbar
