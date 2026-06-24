# US-007: Lifecycle-Übergang invited→active beim ersten erfolgreichen Login

**ID**: US-007
**Story Points**: 1
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Person mit Status "invited" möchte ich nach meinem ersten erfolgreichen Login automatisch als "active" markiert werden, damit mein Status im Repository den tatsächlichen Onboarding-Fortschritt widerspiegelt.

## Bezug

**Use Case**: [UC-01: Login](../use-cases/UC-01-login.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-007: Lifecycle-Übergang invited→active](../req/REQ-007-lifecycle-uebergang-invited-active.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: eine Person mit Status `invited`
- Wenn: sie sich erstmals erfolgreich anmeldet
- Dann: wechselt ihr Status zu `active`

**AC2**:
- Gegeben: eine Person mit Status `active`
- Wenn: sie sich erneut anmeldet
- Dann: bleibt ihr Status unverändert `active`

## Technische Hinweise

- Betroffene Komponenten: Auth-Modul, Person-Lifecycle
- Betroffene EntityTypes/Relations: `Person.status`
- API-Endpunkte: Login-Endpunkte (alle Mechanismen)
- Datenbank-Änderungen: keine zusätzlichen

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (Unit)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-001
- Blockiert: keine

## Notizen

Übergang muss idempotent sein (kein Fehler bei mehrfachem Login).
