# US-023: Initiales Passwort einrichten

**ID**: US-023
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als eingeladene Person möchte ich ein initiales Passwort setzen, damit ich mich in Umgebungen ohne WebAuthn-Unterstützung oder Authenticator-App lokal anmelden kann.

## Bezug

**Use Case**: [UC-03: Authentifizierungsmethode einrichten](../use-cases/UC-03-authentifizierungsmethode-einrichten.md)
**Persona**: [SH-06: Max – Operator im KMU](../../business-analysis/stakeholders/SH-06-max-operator-kmu.md)
**Requirement**: [REQ-024: Initiales Passwort einrichten (Passwort-Enrollment)](../req/REQ-024-passwort-enrollment.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: Max gibt ein Passwort ein, das die Mindestanforderungen erfüllt, und bestätigt es korrekt
- Wenn: er das Formular absendet
- Dann: ist der Passwort-Hash persistiert; der Passwort-Login (UC-01 A5) ist möglich

**AC2**:
- Gegeben: Max gibt ein Passwort ein, das kürzer als die konfigurierte Mindestlänge ist
- Wenn: er das Formular absendet
- Dann: erhält er eine Fehlermeldung mit der konkreten Anforderung; kein Hash wird gespeichert; das Token bleibt gültig

**AC3**:
- Gegeben: Passwort und Bestätigung stimmen nicht überein
- Wenn: er das Formular absendet
- Dann: erhält er eine Fehlermeldung; kein Hash wird gespeichert

**AC4**:
- Gegeben: Enrollment wurde abgeschlossen
- Wenn: Server-Logs und Datenbank-Einträge vorliegen
- Dann: ist der Passwort-Klartext in keinem Log enthalten; in der Datenbank ist nur der Hash gespeichert (erkennbar am Algorithmus-Präfix)

## Technische Hinweise

- Betroffene Komponenten: Enrollment-Modul (Passwort-Stärkeprüfung, Hashing), Credential-Speicher
- Betroffene EntityTypes/Relations: `local_credentials`-Tabelle (`person_id`, `type=password`, `password_hash`, `created_at`, `last_changed_at`)
- API-Endpunkte: `POST /auth/enrollment/password` (Passwort setzen)
- Datenbank-Änderungen: Zeile in `local_credentials` (Hash argon2id oder bcrypt, nie Klartext); POST-Body-Logging für diesen Endpunkt deaktivieren

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (gültiges Passwort, zu kurz, keine Übereinstimmung, Hash-Format-Check, Log-Scan)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-020 (Token-Validierung), US-011 (Passwort-Login-Endpunkt ist Ziel nach Enrollment)
- Blockiert: US-024 (Audit-Log benötigt diesen Pfad)

## Notizen

Primäre Persona hier SH-06 (Max), weil das Passwort-Enrollment der Minimal-Einstieg für KMU-Self-Hosting ohne externe Hardware ist. Hashing-Default: argon2id (m=65536, t=3, p=4); bcrypt (cost≥12) als Fallback. Mindestlänge konfigurierbar, Default 12 Zeichen.
