# US-010: Username/Passwort-Login mit TOTP als zweitem Faktor

**ID**: US-010
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Person auf einer Instanz ohne Passkey-fähigen Client möchte ich mich mit Username, Passwort und einem TOTP-Code anmelden, damit ich auch ohne WebAuthn-Unterstützung einen zweiten Faktor nutzen kann.

## Bezug

**Use Case**: [UC-01: Login](../use-cases/UC-01-login.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-010: Username/Passwort-Login mit TOTP](../req/REQ-010-username-passwort-totp.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: eine Person mit korrektem Passwort und gültigem TOTP-Code
- Wenn: sie sich anmeldet
- Dann: erhält sie eine Session gemäß ihren aktiven Rollenzuweisungen

**AC2**:
- Gegeben: ein korrektes Passwort, aber ein falscher TOTP-Code
- Wenn: der Login-Versuch abgeschlossen wird
- Dann: wird keine Session erstellt, und die Fehlermeldung lässt nicht erkennen, dass das Passwort korrekt war

## Technische Hinweise

- Betroffene Komponenten: Auth-Modul, TOTP-Bibliothek (RFC 6238)
- Betroffene EntityTypes/Relations: Passwort-Hash, TOTP-Secret (getrennt vom `Person`-Objekt)
- API-Endpunkte: Login-Endpunkt mit zwei Schritten (Passwort, dann TOTP)
- Datenbank-Änderungen: separate Tabelle für Passwort-Hash (Argon2id) und TOTP-Secret pro Person

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (inkl. Rate-Limiting-Test gegen Brute-Force)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-001, US-006 (generische Fehlermeldungen), US-021 (TOTP-Enrollment), US-023 (Passwort-Enrollment)
- Blockiert: keine

## Notizen

Rate-Limiting für TOTP-Versuche ist Pflicht-Bestandteil dieser Story (Brute-Force-Schutz bei nur 6-stelligem Code).
