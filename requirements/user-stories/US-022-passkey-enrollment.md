# US-022: Passkey registrieren (WebAuthn-Credential-Registrierung)

**ID**: US-022
**Story Points**: 8
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als eingeladene Person möchte ich einen Passkey auf meinem Gerät registrieren, damit ich mich künftig passwortlos und phishing-resistent anmelden kann.

## Bezug

**Use Case**: [UC-03: Authentifizierungsmethode einrichten](../use-cases/UC-03-authentifizierungsmethode-einrichten.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-023: Passkey-Enrollment (WebAuthn-Credential-Registrierung)](../req/REQ-023-passkey-enrollment.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: Kurt hat Passkey als Methode gewählt und einen WebAuthn-fähigen Authenticator
- Wenn: er die Authenticator-Bestätigung abschließt
- Dann: ist der Public Key persistiert; der Passkey-Login (UC-01 A3) ist möglich

**AC2**:
- Gegeben: Kurt bricht die Authenticator-Bestätigung ab
- Wenn: der Abbruch eintritt
- Dann: wird kein Credential gespeichert; das Enrollment-Token bleibt gültig

**AC3**:
- Gegeben: eine Person hat bereits einen registrierten Passkey
- Wenn: sie einen weiteren registriert
- Dann: sind beide Credentials gespeichert und einzeln für den Login verwendbar

**AC4**:
- Gegeben: eine Registrierungsantwort mit falschem Origin oder RP-ID
- Wenn: das System sie verarbeitet
- Dann: wird sie abgelehnt; kein Credential gespeichert

## Technische Hinweise

- Betroffene Komponenten: Enrollment-Modul (WebAuthn-Challenge-Generierung, Attestation-Verifikation), Credential-Speicher
- Betroffene EntityTypes/Relations: `passkey_credentials`-Tabelle (`person_id`, `credential_id`, `public_key`, `sign_count`, `aaguid`, `created_at`, `last_used_at`)
- API-Endpunkte: `POST /auth/enrollment/passkey/challenge` (Challenge generieren); `POST /auth/enrollment/passkey/register` (Attestation verarbeiten und Public Key speichern)
- Datenbank-Änderungen: neue Tabelle `passkey_credentials`; mehrere Zeilen pro Person möglich

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (virtueller WebAuthn-Authenticator; Origin-Mismatch; Mehrfach-Registrierung)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-020 (Token-Validierung), US-009 (Passkey-Login-Endpunkt ist Ziel nach Enrollment)
- Blockiert: US-024 (Audit-Log benötigt diesen Pfad)

## Notizen

8 SP wegen WebAuthn-Komplexität: Challenge-Generierung, Attestation-Verifikation (inkl. Origin-Check, RP-ID-Check, Signatur-Verifikation), Signatur-Counter-Speicherung. Attestation-Format: `none` als Default; kein Attestation-CA-Betrieb nötig. User-Handle ist die opaque UUID der Person, nicht die E-Mail (FIDO2-Spec).
