---
id: REQ-009
title: Passkey-Login (lokale Authentifizierung ohne externen IdP)
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-24
last_updated: 2026-06-24
author: requirements-engineer
references:
  use_cases:
    - UC-01
  business_objects:
    - person
  business_rules: []
  stakeholders:
    - SH-03
    - SH-06
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs:
    - ADR-006
supersedes: []
superseded_by: []
---

# REQ-009: Passkey-Login (lokale Authentifizierung ohne externen IdP)

## Aussage

Das System SOLL Personen die Anmeldung per Passkey (WebAuthn/FIDO2) ermöglichen, wenn die OEA-Instanz ohne externen OIDC-Identity-Provider betrieben wird. Bei Passkeys, die als discoverable credential (resident key) registriert wurden, SOLL die Anmeldung ohne vorherige Eingabe von Username oder Passwort möglich sein.

## Begründung

Konzept §21.8 sieht lokale Authentifizierung als Alternative zu OIDC vor, mit Passkey als empfohlenem Standard (passwortlos, phishing-resistent). UC-01, Alternative A3. Adressiert SH-06s Anti-Pattern-Grenze (keine eigene Nutzerverwaltung ohne sinnvolle Alternative zu klassischen Passwörtern) und SH-03s Self-Hosting-Realität ohne eigenes IdP-Team.

## Kontext

Setzt voraus, dass die Person zuvor einen Passkey registriert hat (Enrollment ist eigener Use Case, nicht Teil von UC-01).

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- WebAuthn-Assertion (signierte Challenge-Response) vom Client-Authenticator, bei discoverable credentials ohne vorherige Username-Eingabe

**Verarbeitung**:
- System generiert WebAuthn-Challenge (bei discoverable credentials ohne vorherige Identitäts-Angabe, sog. usernameless flow)
- Client signiert Challenge mit dem privaten Schlüssel des registrierten Passkeys
- System ermittelt die Person über den in der Assertion enthaltenen User-Handle (discoverable credential) oder über die vorab eingegebene Identität (non-resident credential, Fallback)
- System verifiziert die Signatur gegen den hinterlegten Public Key der Person

**Ausgaben**:
- Bei erfolgreicher Verifikation: Fortsetzung mit Person-/Rollen-Lookup (siehe REQ-001, Schritt 6 des Hauptablaufs)

**Fehlerfälle**:
- Keine registrierten Passkeys für die angegebene Identität → generische Fehlermeldung (siehe REQ-006), kein Hinweis auf Nichtexistenz
- Signatur-Verifikation fehlgeschlagen → Ablehnung, Audit-Log-Eintrag (siehe REQ-005)

## Akzeptanzkriterien

**AC1**:
- Gegeben: eine Person mit zuvor registriertem Passkey
- Wenn: sie sich mit diesem Passkey anmeldet
- Dann: erhält sie eine Session gemäß ihren aktiven Rollenzuweisungen

**AC2**:
- Gegeben: eine fehlgeschlagene Passkey-Verifikation
- Wenn: der Login-Versuch abgeschlossen wird
- Dann: wird keine Session erstellt und die Fehlermeldung ist nicht von anderen Fehlerfällen (z.B. E1, E2) unterscheidbar

**AC3**:
- Gegeben: eine Person mit einem als discoverable credential registrierten Passkey
- Wenn: sie sich anmeldet
- Dann: ist keine vorherige Eingabe von Username oder Passwort erforderlich

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: WebAuthn-Testclient mit registriertem virtuellem Authenticator
- [x] Mess-Werkzeug: Test-Suite des Auth-Moduls
- [x] Bestanden-Kriterium: AC1, AC2 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: Enrollment-Use-Case (Passkey-Registrierung) muss vorher abgeschlossen sein
- **Folgewirkungen**: keine bekannt
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Passkey-Option bleibt für Self-Hosting ohne IdP nur Passwort-basierte Anmeldung – höheres Risiko (Phishing, schwache Passwörter), mittlerer Schweregrad

## Trade-offs

- vs. Implementierungsaufwand: WebAuthn ist komplexer zu implementieren als einfache Passwort-Prüfung, bietet aber deutlich höhere Sicherheit

## Realisierungs-Hinweise

- Public Keys pro Passkey sollten getrennt vom fachlichen Person-Objekt gespeichert werden (sensible Credential-Daten, siehe UC-01 Realisierungs-Hinweise)
- Mehrere Passkeys pro Person sollten unterstützt werden (z.B. mehrere Geräte)

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-01 Login, Alternative A3.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | requirements-engineer | Initial draft aus UC-01 |
