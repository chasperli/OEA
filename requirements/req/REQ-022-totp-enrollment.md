---
id: REQ-022
title: TOTP-Secret-Enrollment (Authenticator-App einrichten)
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

# REQ-022: TOTP-Secret-Enrollment (Authenticator-App einrichten)

## Aussage

Das System SOLL das Einrichten eines TOTP-Secrets (RFC 6238) als lokale Authentifizierungsmethode ermöglichen, indem es ein Secret generiert, es als QR-Code (Key-URI-Format) und im Klartext anzeigt, einen Verifikations-Code entgegennimmt und das Secret nur bei bestandener Verifikation verschlüsselt persistiert.

## Begründung

TOTP ist die am breitesten unterstützte lokale Zwei-Faktor-Methode ohne Abhängigkeit von spezifischer Hardware oder Plattform-APIs. Sie ist der Hauptablauf in UC-03 und die Fallback-Option für Umgebungen, in denen WebAuthn (Passkey) nicht verfügbar ist. Adressiert SH-06s Anforderung nach lokaler Nutzerverwaltung ohne externen IdP und SH-03s Self-Hosting-Szenario.

## Kontext

Wird als Required Action im Rahmen des ersten Logins ausgelöst (UC-03 Hauptablauf): Das System erkennt nach erfolgreicher Passwort-Prüfung, dass 2FA erzwungen ist (REQ-020) und noch kein TOTP-Credential existiert, und leitet den Nutzer direkt zur Einrichtungsseite. Alternativ kann TOTP über die Profil-Einstellungen einer bereits eingeloggten Person hinzugefügt werden (REQ-026). Das Secret wird beim Login durch REQ-010 (TOTP-Login) verwendet. Das Secret darf nur einmalig im Klartext angezeigt werden; danach ist es nicht mehr abrufbar.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- Ausgelöster Enrollment-Schritt "TOTP" (nach Token-Validierung oder Session-Auth)
- Verifikations-Code: 6-stellige TOTP-Ziffer, eingegeben von Kurt aus seiner Authenticator-App

**Verarbeitung**:
- System generiert ein kryptographisch zufälliges TOTP-Secret (≥ 160 Bit, RFC 4226-konform)
- System erzeugt eine Key-URI (`otpauth://totp/...`) und rendert daraus einen QR-Code
- System zeigt QR-Code und Secret-Klartext (für manuelle Eingabe) genau einmal an
- Wenn Kurt den Verifikations-Code eingibt: System prüft ihn gegen das generierte Secret mit Zeittoleranz (±1 Schritt à 30 s, RFC 6238)
- Bei erfolgreicher Verifikation: System persistiert das Secret verschlüsselt (AES-256 oder gleichwertig), verknüpft es mit dem Person-Objekt

**Ausgaben**:
- QR-Code und Secret-Klartext (einmalig, während Enrollment)
- Erfolgsmeldung nach bestandener Verifikation
- Bei fehlgeschlagener Verifikation: Fehlermeldung ohne Hinweis auf den Secret-Wert, kein Persistieren

**Fehlerfälle**:
- Falscher oder abgelaufener Verifikations-Code (E2 aus UC-03) → Fehlermeldung, Secret wird nicht persistiert, Token bleibt gültig; Kurt kann erneut versuchen
- Secret-Generierung fehlgeschlagen (technischer Fehler) → allgemeine Fehlermeldung, kein Enrollment-Abschluss

## Akzeptanzkriterien

**AC1**:
- Gegeben: Kurt hat TOTP als Methode gewählt
- Wenn: das System das Secret generiert
- Dann: wird ein QR-Code (Key-URI-Format) und der Secret-Klartext angezeigt

**AC2**:
- Gegeben: Kurt scannt den QR-Code und gibt den aktuellen TOTP-Code ein
- Wenn: der Code korrekt ist (innerhalb Zeittoleranz ±1 Schritt)
- Dann: ist das Secret verschlüsselt persistiert und mit Kurts Person verknüpft; der Login mit diesem TOTP ist ab sofort möglich (UC-01 A4)

**AC3**:
- Gegeben: Kurt gibt einen falschen TOTP-Code ein
- Wenn: die Verifikation schlägt fehl
- Dann: wird kein Secret persistiert, das Enrollment-Token bleibt gültig, Kurt kann es erneut versuchen

**AC4**:
- Gegeben: Enrollment wurde abgeschlossen
- Wenn: das System Log-Einträge schreibt
- Dann: ist das TOTP-Secret weder im Klartext noch als Hash in Logs enthalten

**AC5**:
- Gegeben: das TOTP-Secret ist persistiert
- Wenn: es in der Datenbank gespeichert ist
- Dann: ist es verschlüsselt (nicht im Klartext lesbar ohne Entschlüsselungsschlüssel)

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: TOTP-Enrollment mit virtuellem Authenticator (RFC-6238-konforme Test-Implementierung); Prüfung gegen DB-Inhalt
- [x] Mess-Werkzeug: Test-Suite des Enrollment-Moduls; DB-Inspektion im Test
- [x] Bestanden-Kriterium: AC1–AC5 grün; Login nach Enrollment (AC2) funktioniert via REQ-010
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: UC-03 Required-Action-Trigger (erster Login mit initialem Passwort, REQ-024) oder REQ-026 (Session-Auth für Profil-Einstellungen)
- **Folgewirkungen**: REQ-010 (TOTP-Login setzt enrolltes Secret voraus)
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne TOTP-Enrollment kein 2-Faktor-Login für Umgebungen ohne WebAuthn-Hardware – erhöhtes Risiko durch reine Passwort-Anmeldung, mittlerer Schweregrad
- Risiko 2: TOTP-Secret im Klartext in Logs → Kompromittierung des zweiten Faktors, schwerwiegend (durch AC4 mitigiert)

## Trade-offs

- vs. REQ-023 (Passkey): TOTP ist weniger phishing-resistent als Passkey, aber ohne Plattform-API-Abhängigkeit – sinnvolle Ergänzung, kein Ersatz

## Realisierungs-Hinweise

- Key-URI-Format: `otpauth://totp/{issuer}:{account}?secret={BASE32}&issuer={issuer}&algorithm=SHA1&digits=6&period=30` (Standard für Authenticator-App-Kompatibilität)
- Zeittoleranz: ±1 Fenster (30 s) ist RFC-6238-Empfehlung; größere Toleranz schwächt Sicherheit
- Secret-Verschlüsselung: symmetrischer Key (AES-256) muss getrennt von der Datenbank verwaltet werden (z.B. Umgebungsvariable oder KMS); kein Hard-Coding
- Secret und Person in eigener Credential-Tabelle (nicht im Person-Objekt selbst, vgl. UC-01 Realisierungs-Hinweise)

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-03 Hauptablauf (Schritte 3–8) und Exception Flow E2.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | requirements-engineer | Initial draft aus UC-03 |
