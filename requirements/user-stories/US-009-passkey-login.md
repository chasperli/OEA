# US-009: Passkey-Login (lokale Authentifizierung)

**ID**: US-009
**Story Points**: 8
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Person auf einer Instanz ohne externen Identity-Provider möchte ich mich mit einem Passkey anmelden, idealerweise ohne vorherige Eingabe von Username oder Passwort, damit ich passwortlos und phishing-resistent Zugriff erhalte.

## Bezug

**Use Case**: [UC-01: Login](../use-cases/UC-01-login.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-009: Passkey-Login](../req/REQ-009-passkey-login.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: eine Person mit zuvor registriertem Passkey
- Wenn: sie sich mit diesem Passkey anmeldet
- Dann: erhält sie eine Session gemäß ihren aktiven Rollenzuweisungen

**AC2**:
- Gegeben: eine fehlgeschlagene Passkey-Verifikation
- Wenn: der Login-Versuch abgeschlossen wird
- Dann: wird keine Session erstellt, Fehlermeldung nicht von anderen Fehlerfällen unterscheidbar

**AC3**:
- Gegeben: eine Person mit einem als discoverable credential registrierten Passkey
- Wenn: sie sich anmeldet
- Dann: ist keine vorherige Eingabe von Username oder Passwort erforderlich

## Technische Hinweise

- Betroffene Komponenten: Auth-Modul, WebAuthn-Client/Server-Bibliothek
- Betroffene EntityTypes/Relations: Passkey-Public-Keys (getrennt vom `Person`-Objekt, sensible Credential-Daten)
- API-Endpunkte: WebAuthn-Challenge-/Assertion-Endpunkte
- Datenbank-Änderungen: separate Tabelle für Passkey-Credentials pro Person

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (WebAuthn-Testclient mit virtuellem Authenticator)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-001 (gemeinsames Rollen-Lookup-Schema), US-022 (Passkey-Enrollment muss existieren, damit Passkeys vorhanden sind)
- Blockiert: keine

## Notizen

Enrollment (Registrierung eines Passkeys) ist explizit nicht Teil dieser Story – UC-01 setzt eine abgeschlossene Registrierung voraus. Enrollment ist eigener, hier nicht abgeleiteter Use Case.
