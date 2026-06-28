---
id: REQ-135
title: Dark-Mode-Unterstützung mit System-Default und Benutzer-Präferenz
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-28
last_updated: 2026-06-28
author: requirements-engineer
references:
  use_cases:
    - UC-01
    - UC-02
    - UC-03
  business_objects:
    - person
  business_rules: []
  stakeholders:
    - SH-03
    - SH-06
  concept: []
  adrs:
    - ADR-011
supersedes: []
superseded_by: []
---

# REQ-135: Dark-Mode-Unterstützung mit System-Default und Benutzer-Präferenz

## Aussage

Die OEA-Benutzeroberfläche **MUSS** ein helles und ein dunkles Farbschema unterstützen. Das aktive Schema **MUSS** pro Benutzer serverseitig am `Person`-Objekt persistiert werden können (Werte: `light` | `dark` | `system`). Solange kein Benutzer-Override gesetzt ist, **MUSS** als Default der Wert `system` gelten, d. h. das vom Betriebssystem gemeldete Farbschema (`prefers-color-scheme`) wird übernommen.

## Begründung

SH-03 (Kurt) und SH-06 (Max) nutzen OEA auf mehreren Geräten und in unterschiedlichen Umgebungen. Eine rein lokale Speicherung (localStorage / Electron-Store) würde bedeuten, dass die Präferenz bei einem Gerätewechsel verloren geht. Durch serverseitige Speicherung am `Person`-Objekt ist die Einstellung geräteübergreifend konsistent und wird bei jedem Login automatisch geladen.

## Kontext

Die Anforderung gilt für alle UI-Oberflächen von OEA: Client App (Electron), Web Portal und alle Dialoge/Fenster. Sie gilt nicht für rein maschinenlesbare Ausgaben (CLI-Output, API-Responses, Exports).

## Typ-spezifische Felder

**Eingaben**:
- Betriebssystem-Präferenz (`prefers-color-scheme: dark | light`) beim App-Start/Browser-Aufruf
- Serverseitig gespeicherte Benutzer-Präferenz (`person.uiTheme`: `light` | `dark` | `system`) — wird beim Login geladen
- Explizite Benutzeraktion in den Profil-Einstellungen (Auswahl Hell / Dunkel / System)

**Verarbeitung**:
1. Beim Login: `person.uiTheme` aus dem Session-Response laden
2. `system`: `prefers-color-scheme` des Clients auswerten; bei OS-Wechsel während der Laufzeit sofort reagieren (kein Reload nötig)
3. `light` oder `dark`: OS-Präferenz ignorieren, festes Schema anwenden
4. Benutzer ändert Präferenz in Profil-Einstellungen: sofort im UI anwenden **und** per `PATCH /api/v1/persons/me` an Server senden; bei Netzwerkfehler: lokal zwischenspeichern und beim nächsten erfolgreichen Request nachsenden
5. Kein Login (öffentliche Seiten, Bootstrapping-Wizard): `prefers-color-scheme` ohne Server-Kontext anwenden

**Ausgaben**:
- Gesamtes UI (Hintergründe, Karten, Texte, Icons, Eingabefelder, Buttons) in konsistenten Farb-Tokens des gewählten Schemas
- Aktives Schema ist für Accessibility-Tools erkennbar (`<html data-theme="dark|light">` und CSS `color-scheme`-Property)
- Session-Response enthält `uiTheme`-Feld sodass der Client es direkt beim Login anwenden kann (kein separater Request nötig)

**Fehlerfälle**:
- `prefers-color-scheme` nicht auflösbar (sehr alte Browser/OS): Fallback auf `light`
- `person.uiTheme` hat unbekannten Wert (z. B. nach Migration): Fallback auf `system`
- Server nicht erreichbar beim Speichern der Präferenz: lokal puffern, kein Fehler-Dialog

## Akzeptanzkriterien

**AC1** — Default: kein Override, Light-OS:
- Gegeben: `person.uiTheme = system`, OS hat Light-Mode aktiv
- Wenn: Login abgeschlossen, App initialisiert
- Dann: Light-Schema wird ohne Benutzerinteraktion angezeigt

**AC2** — Default: kein Override, Dark-OS:
- Gegeben: `person.uiTheme = system`, OS hat Dark-Mode aktiv
- Wenn: Login abgeschlossen, App initialisiert
- Dann: Dark-Schema wird ohne Benutzerinteraktion angezeigt

**AC3** — Laufzeit-OS-Wechsel (kein Override):
- Gegeben: `person.uiTheme = system`, OS wechselt während der Laufzeit das Schema
- Wenn: OS-Präferenz ändert sich (z. B. automatischer Nacht-Modus)
- Dann: UI wechselt innerhalb von 1 Sekunde auf neues Schema ohne Seitenreload

**AC4** — Expliziter Override, Geräteübergreifend:
- Gegeben: Benutzer setzt in Profil-Einstellungen auf Gerät A den Override „Dunkel"
- Wenn: Benutzer meldet sich auf Gerät B an
- Dann: Dark-Schema wird auf Gerät B ohne weitere Aktion angewendet (`person.uiTheme = dark` kommt mit Session)

**AC5** — Override zurücksetzen:
- Gegeben: `person.uiTheme = dark`
- Wenn: Benutzer wählt „System-Einstellung" in Profil-Einstellungen
- Dann: `person.uiTheme` wird auf `system` gesetzt, OS-Präferenz gilt sofort wieder

**AC6** — Kontrast (WCAG AA):
- Gegeben: Dark-Mode ist aktiv
- Wenn: beliebiger Fließtext gegen seinen Hintergrund geprüft wird
- Dann: Kontrastverhältnis ≥ 4.5:1

**AC7** — Unauthentifizierte Screens:
- Gegeben: Benutzer ist nicht eingeloggt (Bootstrapping-Wizard, Login-Screen)
- Wenn: App gestartet wird
- Dann: `prefers-color-scheme` des Clients wird angewendet (kein Server-Kontext verfügbar)

## Verifikationsmethode

- [ ] Methode: test (automatisiert) + demonstration (manuell)
- [ ] Test-Setup: Playwright mit `--force-prefers-color-scheme=dark/light`; API-Mock für Session-Response mit verschiedenen `uiTheme`-Werten; E2E-Test für PATCH-Request bei Einstellungsänderung
- [ ] Mess-Werkzeug: axe-core für Kontrast-Check (AC6); Browser DevTools Media-Query-Simulation
- [ ] Bestanden-Kriterium: AC1–AC7 alle grün; keine axe-Violation `color-contrast` im Dark-Mode
- [ ] In CI integriert: ja (nach Implementierung)

## Abhängigkeiten

- **Voraussetzungen**: `person.uiTheme`-Attribut muss im Datenmodell ergänzt werden (enum: `light | dark | system`, Default: `system`); ADR-011 (Vue 3) für CSS-Custom-Properties-Ansatz; ADR-009 (Electron) für `nativeTheme`-Integration
- **Folgewirkungen**: Design-System-Tokens müssen für beide Modi vollständig definiert sein; Session-Response-Schema erweitern
- **Konflikte**: keine bekannten

## Risiken bei Nichterfüllung

- Risiko 1: Präferenz geht bei Gerätewechsel verloren → Frustration bei SH-03, der OEA auf Desktop (Electron) und gelegentlich im Browser nutzt (mittel)
- Risiko 2: Fehlender Dark-Mode senkt wahrgenommene Produktqualität bei Early Adopters im Open-Source-Umfeld (mittel)
- Risiko 3: Kontrast-Probleme bei Behörden-Kunden → WCAG-AA-Verletzung (mittel)

## Trade-offs

- vs. Aufwand: Serverseitige Speicherung erfordert Datenbankattribut, API-Erweiterung und Session-Response-Anpassung — höherer Aufwand als rein lokale Lösung
- vs. Datenschutz: `uiTheme` ist eine UI-Präferenz ohne Personenbezug im datenschutzrechtlichen Sinne; kein DSGVO-Konflikt

## Realisierungs-Hinweise

- `person.uiTheme` als Enum-Spalte in der Personen-Tabelle (`light | dark | system`, Default `system`)
- Session-Response um `uiTheme` erweitern, damit der Client es ohne zweiten Request kennt
- CSS Custom Properties (Design Tokens) als einzige Farb-Quelle; kein Hard-coding von Farben in Komponenten
- Electron: `nativeTheme.themeSource` steuert das native Window-Frame-Theming; `nativeTheme.updated`-Event für Live-Wechsel
- Vue 3: Pinia-Store `useThemeStore` hält `resolvedTheme` (immer `light` oder `dark`, nie `system`); `window.matchMedia`-Listener für `system`-Modus
- Kein FOUC: Theme-Attribut (`data-theme`) vor erstem Render setzen

## Realisierung

- ADR(s): ADR-011 (Vue 3 Frontend), ADR-009 (Electron)
- Implementiert durch: (noch offen)
- Tests: (noch offen)
- Status der Verifikation: not-verified

## Notizen

Anforderung entstanden im Rahmen der Mockup-Erstellung der Startfenster (UC-01–UC-03). Primärfarbe des UI wurde gleichzeitig von Violett (#4F46E5) auf Sky-Blau (#0EA5E9) geändert. Der Hinweis auf geräteübergreifende Persistenz kam nach dem ersten Entwurf — erklärt die serverseitige Speicherung statt reinem localStorage.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | requirements-engineer | Initial draft inkl. serverseitiger Persistenz am Person-Objekt |
