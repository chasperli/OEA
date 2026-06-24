# US-002: API-Key-Authentifizierung für Maschine-zu-Maschine-Zugriffe

**ID**: US-002
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Maschinen-Client (z.B. CI-Skript, Discovery-Adapter) möchte ich mich mit einem API-Key authentifizieren, damit ich geschützte Ressourcen ansprechen kann, ohne einen Browser-OIDC-Flow zu durchlaufen.

## Bezug

**Use Case**: [UC-01: Login](../use-cases/UC-01-login.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-002: API-Key-Authentifizierung](../req/REQ-002-api-key-authentication.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein Request mit gültigem, nicht widerrufenem API-Key
- Wenn: er gegen eine geschützte Ressource gestellt wird
- Dann: wird er ohne Redirect autorisiert, gemäß den Rollen der zugeordneten Identität

**AC2**:
- Gegeben: ein Request mit ungültigem oder widerrufenem API-Key
- Wenn: er gestellt wird
- Dann: wird er abgelehnt, ohne dass ein Autorisierungs-Kontext entsteht

## Technische Hinweise

- Betroffene Komponenten: Auth-Modul (API-Key-Validierung)
- Betroffene EntityTypes/Relations: `Person`/Service-Identität, `Role`
- API-Endpunkte: alle geschützten Endpunkte, zusätzlicher Header `Authorization: ApiKey ...`
- Datenbank-Änderungen: Speicherung von API-Keys (Hash, nicht Klartext), Scoping-Metadaten

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (Unit, Integration)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-001 (gemeinsames Rollen-/Autorisierungsmodell)
- Blockiert: keine

## Notizen

Deckt Alternative A2 aus UC-01 ab.
