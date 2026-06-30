# Ableitung aus: requirements/req/req-137-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert) + demonstration (manuell)

@functional @should @UC-01
Feature: REQ-137 – Automatische SSO-Weiterleitung zum konfigurierten Identity Provider

  Das System **SOLL** konfigurierbar sein, beim Aufruf der Login-Seite
  automatisch und ohne Benutzerinteraktion zum konfigurierten
  OIDC-Identity-Provider weiterzuleiten (Auto-SSO-Redirect), sofern der
  Betreiber diese Option aktiviert hat und ausschließlich OIDC als
  Authentifizierungsmethode konfiguriert ist.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – `autoSsoRedirect = true`, `oidcEnabled = true`, `localAuthEnabled = false`
    Given `autoSsoRedirect = true`, `oidcEnabled = true`, `localAuthEnabled = false`
    When  Nutzer ruft Login-URL auf (ohne `?noredirect=1`)
    Then  Übergangsseite erscheint kurz, danach automatischer Redirect zur OIDC-Authorization-URL; kein Login-Formular sichtbar

  @AC2
  Scenario: AC2 – `autoSsoRedirect = true` (Auto-Redirect wäre aktiv)
    Given `autoSsoRedirect = true` (Auto-Redirect wäre aktiv)
    When  Nutzer ruft Login-URL mit `?noredirect=1` auf
    Then  Normaler Login-Screen wird angezeigt; kein automatischer Redirect

  @AC3
  Scenario: AC3 – `autoSsoRedirect = true`, `oidcEnabled = true`, `localAuthEnabled = true`
    Given `autoSsoRedirect = true`, `oidcEnabled = true`, `localAuthEnabled = true`
    When  Nutzer ruft Login-URL auf
    Then  Normaler Login-Screen mit beiden Optionen; kein Auto-Redirect

  @AC4
  Scenario: AC4 – Auto-Redirect ist aktiv, Übergangsseite wird angezeigt
    Given Auto-Redirect ist aktiv, Übergangsseite wird angezeigt
    When  Nutzer klickt „Anderweitig anmelden"
    Then  Redirect wird abgebrochen, normaler Login-Screen erscheint (äquivalent zu `?noredirect=1`)

  @AC5
  Scenario: AC5 – Auto-Redirect aktiv, IdP gibt 3× keinen erfolgreichen Login zurück
    Given Auto-Redirect aktiv, IdP gibt 3× keinen erfolgreichen Login zurück
    When  OEA erkennt Schleife
    Then  Login-Screen mit Fehlermeldung „Automatische Anmeldung fehlgeschlagen" und Link „Manuell anmelden"
