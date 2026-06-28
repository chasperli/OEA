---
id: REQ-137
title: Automatische SSO-Weiterleitung zum konfigurierten Identity Provider
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
  business_objects: []
  business_rules: []
  stakeholders:
    - SH-03
    - SH-04
    - SH-06
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs:
    - ADR-006
supersedes: []
superseded_by: []
---

# REQ-137: Automatische SSO-Weiterleitung zum konfigurierten Identity Provider

## Aussage

Das System **SOLL** konfigurierbar sein, beim Aufruf der Login-Seite automatisch und ohne Benutzerinteraktion zum konfigurierten OIDC-Identity-Provider weiterzuleiten (Auto-SSO-Redirect), sofern der Betreiber diese Option aktiviert hat und ausschließlich OIDC als Authentifizierungsmethode konfiguriert ist.

## Begründung

Im Enterprise-Kontext nutzen alle Benutzer denselben Identity-Provider (z.B. Entra ID). Das explizite Klicken auf „Via Unternehmens-SSO anmelden" ist dann ein unnötiger Schritt. Tools wie Jira, Confluence und GitHub Enterprise leiten in solchen Setups automatisch weiter — Nutzer erleben OEA als nahtlos in die bestehende IT-Infrastruktur integriert. SH-03 (Kurt) und SH-04 arbeiten typischerweise in genau diesem Kontext.

## Kontext

Auto-SSO-Redirect gilt nur, wenn:
- `auth.oidcEnabled = true` (mindestens ein IdP konfiguriert)
- `auth.localAuthEnabled = false` (keine lokale Authentifizierung aktiv) — bei gemischtem Setup ist Auto-Redirect inhärent mehrdeutig und wird nicht ausgelöst
- `auth.autoSsoRedirect = true` (Betreiber hat Auto-Redirect explizit aktiviert)

Die Anforderung betrifft nur den initialen Aufruf der Login-Seite. Bereits authentifizierte Sitzungen sind davon unberührt (UC-01 A1).

## Typ-spezifische Felder

**Eingaben**:
- Instanz-Konfiguration: `auth.autoSsoRedirect: boolean` (Default: `false`)
- Optionale Konfiguration: `auth.autoSsoRedirectDelay: integer` (Millisekunden, Default: `0`)
- Query-Parameter `?noredirect=1` als Escape-Hatch für Betreiber und Notfallzugang

**Verarbeitung**:
1. Nutzer ruft OEA-Login-URL auf (oder wird nach abgelaufener Session dorthin geleitet)
2. System prüft: `autoSsoRedirect = true` AND `oidcEnabled = true` AND `localAuthEnabled = false`
3. Bedingung erfüllt: kurze Übergangsseite „Weiterleitung zu [IdP-Name] …" für `autoSsoRedirectDelay` ms anzeigen, dann sofort OIDC-Redirect auslösen
4. `?noredirect=1` im URL: Auto-Redirect unterdrücken, normalen Login-Screen anzeigen (Escape-Hatch für Betreiber-Notfallzugang)
5. Bedingung nicht erfüllt: normaler Login-Screen gemäß REQ-136

**Ausgaben**:
- HTTP-Redirect (302 / clientseitiger Redirect) zur OIDC-Authorization-URL des konfigurierten Providers
- Übergangsseite zeigt: OEA-Logo, Provider-Name, kurze Ladeanimation, Link „Anderweitig anmelden" (aktiviert `?noredirect=1`)

**Fehlerfälle**:
- IdP nicht erreichbar (Timeout beim Redirect): OEA zeigt Fehlermeldung mit Option, manuell den Login-Screen zu öffnen (`?noredirect=1`)
- Auto-Redirect in Schleife (z.B. IdP leitet zurück ohne erfolgreichen Login): nach 3 fehlgeschlagenen Redirect-Zyklen Login-Screen anzeigen und Auto-Redirect für diese Session deaktivieren

## Akzeptanzkriterien

**AC1** — Auto-Redirect aktiv:
- Gegeben: `autoSsoRedirect = true`, `oidcEnabled = true`, `localAuthEnabled = false`
- Wenn: Nutzer ruft Login-URL auf (ohne `?noredirect=1`)
- Dann: Übergangsseite erscheint kurz, danach automatischer Redirect zur OIDC-Authorization-URL; kein Login-Formular sichtbar

**AC2** — Escape-Hatch:
- Gegeben: `autoSsoRedirect = true` (Auto-Redirect wäre aktiv)
- Wenn: Nutzer ruft Login-URL mit `?noredirect=1` auf
- Dann: Normaler Login-Screen wird angezeigt; kein automatischer Redirect

**AC3** — Gemischtes Setup: kein Auto-Redirect:
- Gegeben: `autoSsoRedirect = true`, `oidcEnabled = true`, `localAuthEnabled = true`
- Wenn: Nutzer ruft Login-URL auf
- Dann: Normaler Login-Screen mit beiden Optionen; kein Auto-Redirect

**AC4** — „Anderweitig anmelden"-Link auf Übergangsseite:
- Gegeben: Auto-Redirect ist aktiv, Übergangsseite wird angezeigt
- Wenn: Nutzer klickt „Anderweitig anmelden"
- Dann: Redirect wird abgebrochen, normaler Login-Screen erscheint (äquivalent zu `?noredirect=1`)

**AC5** — Redirect-Schleife:
- Gegeben: Auto-Redirect aktiv, IdP gibt 3× keinen erfolgreichen Login zurück
- Wenn: OEA erkennt Schleife
- Dann: Login-Screen mit Fehlermeldung „Automatische Anmeldung fehlgeschlagen" und Link „Manuell anmelden"

## Verifikationsmethode

- [ ] Methode: test (automatisiert) + demonstration (manuell)
- [ ] Test-Setup: Playwright mit OIDC-Mock-Provider; Konfigurationsvarianten via API-Interceptor
- [ ] Bestanden-Kriterium: AC1–AC5 alle grün; Redirect-URL enthält korrekte OIDC-Parameter (state, nonce, redirect_uri)
- [ ] In CI integriert: ja (nach Implementierung)

## Abhängigkeiten

- **Voraussetzungen**: REQ-136 (Betreiber-Konfiguration `auth.localAuthEnabled`, `auth.oidcEnabled`); ADR-006 (Auth-Stack: OIDC via Entra ID / Authentik)
- **Folgewirkungen**: keine
- **Konflikte**: REQ-136 AC3 definiert, wann Auto-Redirect explizit nicht ausgelöst wird

## Risiken bei Nichterfüllung

- Risiko 1: Enterprise-Nutzer müssen bei jedem Login manuell auf SSO-Button klicken → wahrgenommene Schwerfälligkeit gegenüber vergleichbaren Tools (niedrig bis mittel)
- Risiko 2: Kein Escape-Hatch → Betreiber bei IdP-Ausfall ausgesperrt → Recovery-Aufwand (hoch, daher Escape-Hatch als Pflicht in AC2)

## Realisierungs-Hinweise

- `?noredirect=1` muss auch nach dem OIDC-Callback erhalten bleiben (State-Parameter mitführen), damit nach einem Fehler nicht erneut Auto-Redirect ausgelöst wird
- `autoSsoRedirectDelay` (Default 0) erlaubt Betreibern, eine kurze Verzögerung einzubauen damit Nutzer die Übergangsseite wahrnehmen — empfohlener Wert falls gesetzt: 800–1500ms

## Realisierung

- ADR(s): ADR-006
- Implementiert durch: (noch offen)
- Tests: (noch offen)
- Status der Verifikation: not-verified

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | requirements-engineer | Initial draft aus Feedback Mockup-Session |
