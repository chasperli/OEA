# US-014: Remote-Bootstrapping über IdP-Claim-Mapping

**ID**: US-014
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Operator mit bereits konfiguriertem Entra ID oder Authentik möchte ich System-Admin-Rechte über einen Gruppen-/Rollen-Claim vergeben können, damit ich keinen zusätzlichen lokalen Account pflegen muss.

## Bezug

**Use Case**: [UC-02: System-Admin-Bootstrapping](../use-cases/UC-02-system-admin-bootstrapping.md)
**Persona**: [SH-06: Max – Operator im KMU](../../business-analysis/stakeholders/SH-06-max-operator-kmu.md)
**Requirement**: [REQ-014: Remote-Bootstrapping über IdP-Claim-Mapping](../req/REQ-014-remote-bootstrapping.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein konfiguriertes Claim-Mapping auf eine IdP-Gruppe
- Wenn: eine Person mit diesem Gruppen-Claim im Identity-Token sich anmeldet
- Dann: erhält die Session System-Admin-Rechte

**AC2**:
- Gegeben: dasselbe Mapping
- Wenn: eine Person ohne diesen Claim sich anmeldet
- Dann: erhält die Session keine System-Admin-Rechte über diesen Weg

## Technische Hinweise

- Betroffene Komponenten: Auth-Modul (Claim-Auswertung), Instanz-Konfiguration
- Betroffene EntityTypes/Relations: `SystemAdminAccount` mit `mode: remote`
- API-Endpunkte: Konfigurations-Endpunkt für Claim-Mapping
- Datenbank-Änderungen: Speicherung von `provider`, `claimType`, `claimValue`

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (Test-IdP mit konfigurierbaren Claims)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-001 (OIDC-Login muss funktionieren), US-013
- Blockiert: US-018, US-019

## Notizen

Deckt Alternative A1 aus UC-02 ab. Claim-Mapping-Konventionen je Provider sind technische Spezifikation, nicht Teil dieser Story.
