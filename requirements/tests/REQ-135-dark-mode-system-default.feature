# Ableitung aus: requirements/req/req-135-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert) + demonstration (manuell)

@functional @should @UC-01 @UC-02 @UC-03
Feature: REQ-135 – Dark-Mode-Unterstützung mit System-Default und Benutzer-Präferenz

  Die OEA-Benutzeroberfläche **MUSS** ein helles und ein dunkles
  Farbschema unterstützen. Das aktive Schema **MUSS** pro Benutzer
  serverseitig am `Person`-Objekt persistiert werden können (Werte:
  `light` | `dark` | `system`).

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – `person.uiTheme = system`, OS hat Light-Mode aktiv
    Given `person.uiTheme = system`, OS hat Light-Mode aktiv
    When  Login abgeschlossen, App initialisiert
    Then  Light-Schema wird ohne Benutzerinteraktion angezeigt

  @AC2
  Scenario: AC2 – `person.uiTheme = system`, OS hat Dark-Mode aktiv
    Given `person.uiTheme = system`, OS hat Dark-Mode aktiv
    When  Login abgeschlossen, App initialisiert
    Then  Dark-Schema wird ohne Benutzerinteraktion angezeigt

  @AC3
  Scenario: AC3 – `person.uiTheme = system`, OS wechselt während der Laufzeit das Schema
    Given `person.uiTheme = system`, OS wechselt während der Laufzeit das Schema
    When  OS-Präferenz ändert sich (z. B. automatischer Nacht-Modus)
    Then  UI wechselt innerhalb von 1 Sekunde auf neues Schema ohne Seitenreload

  @AC4
  Scenario: AC4 – Benutzer setzt in Profil-Einstellungen auf Gerät A den Override „Dunkel"
    Given Benutzer setzt in Profil-Einstellungen auf Gerät A den Override „Dunkel"
    When  Benutzer meldet sich auf Gerät B an
    Then  Dark-Schema wird auf Gerät B ohne weitere Aktion angewendet (`person.uiTheme = dark` kommt mit Session)

  @AC5
  Scenario: AC5 – `person.uiTheme = dark`
    Given `person.uiTheme = dark`
    When  Benutzer wählt „System-Einstellung" in Profil-Einstellungen
    Then  `person.uiTheme` wird auf `system` gesetzt, OS-Präferenz gilt sofort wieder

  @AC6
  Scenario: AC6 – Dark-Mode ist aktiv
    Given Dark-Mode ist aktiv
    When  beliebiger Fließtext gegen seinen Hintergrund geprüft wird
    Then  Kontrastverhältnis ≥ 4.5:1

  @AC7
  Scenario: AC7 – Benutzer ist nicht eingeloggt (Bootstrapping-Wizard, Login-Screen)
    Given Benutzer ist nicht eingeloggt (Bootstrapping-Wizard, Login-Screen)
    When  App gestartet wird
    Then  `prefers-color-scheme` des Clients wird angewendet (kein Server-Kontext verfügbar)
