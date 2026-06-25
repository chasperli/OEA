---
id: REQ-023
title: Passkey-Enrollment (WebAuthn-Credential-Registrierung)
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-25
last_updated: 2026-06-25
author: requirements-engineer
references:
  use_cases:
    - UC-03
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

# REQ-023: Passkey-Enrollment (WebAuthn-Credential-Registrierung)

## Aussage

Das System SOLL das Registrieren eines Passkeys (WebAuthn Level 2 / FIDO2) als lokale Authentifizierungsmethode ermöglichen, indem es eine Registrierungs-Challenge generiert, die Authenticator-Antwort verifiziert und den Public Key des registrierten Credentials persistent mit dem Person-Objekt verknüpft.

## Begründung

Passkey ist der empfohlene Standard für lokale Authentifizierung gemäß Konzept §21.8 (passwortlos, phishing-resistent). UC-03 Alternative A1. Ohne Passkey-Enrollment ist UC-01 Alternative A3 (Passkey-Login) nicht nutzbar. Passkeys sind für SH-03 und SH-06 im Self-Hosting-Szenario ohne externen IdP die sicherste lokale Option.

## Kontext

Wird als Required Action im Rahmen des ersten Logins ausgelöst (UC-03 Alternative A1): Das System erkennt nach erfolgreicher Passwort-Prüfung, dass 2FA erzwungen ist (REQ-020) und noch kein Passkey existiert. Alternativ kann ein Passkey über die Profil-Einstellungen einer bereits eingeloggten Person hinzugefügt werden (REQ-026). Der registrierte Public Key wird beim Login durch REQ-009 (Passkey-Login) verwendet. Der private Schlüssel verlässt den Authenticator zu keinem Zeitpunkt.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- Ausgelöster Enrollment-Schritt "Passkey"
- Authenticator-Antwort: `PublicKeyCredential` (enthält Attestation Object, Client Data JSON, Credential ID)

**Verarbeitung**:
- System generiert `PublicKeyCredentialCreationOptions` (enthält Challenge, RP-ID, User-Handle, Algorithmen-Liste)
- Client übermittelt Options an den Authenticator (Plattform oder Roaming); der Authenticator erzeugt ein neues Key-Pair
- Authenticator gibt `PublicKeyCredential` zurück; System verifiziert:
  - Signatur über Client Data JSON
  - RP-ID und Origin korrekt
  - Challenge-Abgleich (Replay-Schutz)
  - Attestation (Format: `none` als Default; andere Formate optional)
- Bei bestandener Verifikation: System persistiert Public Key, Credential-ID und Signatur-Counter, verknüpft mit Person; mehrere Credentials pro Person werden unterstützt

**Ausgaben**:
- Erfolgsmeldung mit Hinweis auf erfolgreiche Registrierung
- Bei Fehler: allgemeine Fehlermeldung, kein Credential wird gespeichert

**Fehlerfälle**:
- Nutzer bricht die Authenticator-Bestätigung ab (E3 aus UC-03) → kein Credential persistiert, Token bleibt gültig, Fehlermeldung
- RP-ID/Origin-Mismatch → technischer Fehler, kein Credential persistiert
- Authenticator nicht kompatibel → allgemeine Fehlermeldung; Kurt kann alternative Methode wählen

## Akzeptanzkriterien

**AC1**:
- Gegeben: Kurt hat Passkey als Methode gewählt und einen kompatiblen Authenticator
- Wenn: er die Authenticator-Bestätigung abschließt
- Dann: ist der Public Key persistent gespeichert und der Login per Passkey (UC-01 A3) ist ab sofort möglich

**AC2**:
- Gegeben: Kurt bricht die Authenticator-Bestätigung ab
- Wenn: der Abbruch eintritt
- Dann: wird kein Credential gespeichert, das Enrollment-Token bleibt gültig

**AC3**:
- Gegeben: eine Person hat bereits einen registrierten Passkey
- Wenn: sie einen weiteren Passkey registriert (z.B. zweites Gerät)
- Dann: sind beide Credentials gespeichert und einzeln für den Login verwendbar

**AC4**:
- Gegeben: eine Registrierungsantwort mit falschem Origin oder RP-ID
- Wenn: das System sie verarbeitet
- Dann: wird sie abgelehnt, kein Credential persistiert

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: virtuelle WebAuthn-Authenticator-Implementierung (z.B. go-webauthn Test-Utilities oder Browser-Stack mit virtualem Authenticator)
- [x] Mess-Werkzeug: Test-Suite des Enrollment-Moduls
- [x] Bestanden-Kriterium: AC1–AC4 grün; Login nach Enrollment (AC1) funktioniert via REQ-009
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: UC-03 Required-Action-Trigger (erster Login mit initialem Passwort, REQ-024) oder REQ-026 (Session-Auth für Profil-Einstellungen)
- **Folgewirkungen**: REQ-009 (Passkey-Login setzt registrierten Public Key voraus)
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Passkey-Enrollment nur Passwort/TOTP als lokale Optionen – geringere Sicherheit (Phishing-Anfälligkeit), mittlerer Schweregrad
- Risiko 2: Fehlerhafter Origin/RP-ID-Check erlaubt Cross-Origin-Credential-Registrierung, schwerwiegend (durch AC4 mitigiert)

## Trade-offs

- vs. Implementierungsaufwand: WebAuthn-Registrierung ist komplexer als TOTP/Passwort; lohnt sich wegen deutlich höherer Sicherheit

## Realisierungs-Hinweise

- Attestation: `none` als Default (kein Attestation-CA-Betrieb nötig, besserer Datenschutz); `direct` oder `indirect` bei Bedarf konfigurierbar
- Algorithmen: ES256 (P-256) und RS256 (RSA-2048) mindestens unterstützen; Reihenfolge in `PublicKeyCredentialParameters` bevorzugt ES256
- Signatur-Counter: speichern und bei jedem Login-Versuch prüfen (Replay-Schutz, UC-01 A3)
- User-Handle: opaque, nicht personenbezogen (z.B. UUID der Person), darf nicht die E-Mail-Adresse sein (FIDO2-Spec)
- Credential-Tabelle getrennt vom Person-Objekt; Spalten: `credential_id`, `public_key`, `sign_count`, `aaguid`, `person_id`, `created_at`, `last_used_at`

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-03 Alternative A1 und Exception Flow E3. Dass mehrere Passkeys pro Person (AC3) unterstützt werden müssen, folgt aus der offenen Frage in UC-03; hier als Anforderung festgeschrieben, da ein Geräteverlust sonst zum vollständigen Lockout führt.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | requirements-engineer | Initial draft aus UC-03 |
