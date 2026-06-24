# US-001: OIDC-Login mit Session-Erstellung

**ID**: US-001
**Story Points**: 8
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Person mit einer im Repository hinterlegten Rolle möchte ich mich über den konfigurierten OIDC-Identity-Provider anmelden, damit ich eine Session mit meinen aktiven Berechtigungen erhalte, ohne dass eine bereits bestehende IdP-Session erneut abgefragt wird.

## Bezug

**Use Case**: [UC-01: Login](../use-cases/UC-01-login.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-001: OIDC-basierte Anmeldung und Session-Erstellung](../req/REQ-001-oidc-login-session.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: eine Person ohne gültige Session ruft eine geschützte Ressource auf
- Wenn: sie sich erfolgreich beim konfigurierten OIDC-Provider authentifiziert
- Dann: erhält sie eine Session, die ihre aktiven Rollenzuweisungen widerspiegelt

**AC2**:
- Gegeben: eine Person besitzt bereits eine gültige Session
- Wenn: sie eine weitere geschützte Ressource aufruft
- Dann: erfolgt kein erneuter Redirect zum Identity-Provider

**AC3**:
- Gegeben: ein vom externen IdP ausgestelltes Token mit vom IdP festgelegter Gültigkeitsdauer
- Wenn: die Session erstellt wird
- Dann: wird diese Gültigkeitsdauer unverändert übernommen

**AC4** (optional, konfigurierbar):
- Gegeben: eine Instanz, für die Online-Token-Validierung gegen den IdP (z.B. Token-Introspection) konfiguriert ist, und ein Token, das beim IdP bereits widerrufen wurde
- Wenn: der Login-Vorgang abgeschlossen wird
- Dann: wird die Session-Erstellung verweigert

## Technische Hinweise

- Betroffene Komponenten: Auth-Modul, Session-Management
- Betroffene EntityTypes/Relations: `Person`, `Role`, `RoleAssignment`
- API-Endpunkte: OIDC-Redirect-/Callback-Endpunkte, Session-Erstellung
- Datenbank-Änderungen: Session-Storage; Lookup-Index auf `Person.externalReference`

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (Unit, Integrationstest gegen Mock-OIDC-Provider)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung (siehe ADR-006)
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: ADR-006 (Auth-Stack-Wahl, bereits accepted)
- Blockiert: US-002, US-003, US-004, US-007

## Notizen

Deckt Hauptablauf und Alternative A1 aus UC-01 ab. AC4 (optionale Online-Token-Validierung) kann bei Bedarf in einem separaten Sprint nachgezogen werden, ohne den Kern-Login-Flow zu blockieren.
