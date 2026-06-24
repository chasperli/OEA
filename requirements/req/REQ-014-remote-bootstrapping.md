---
id: REQ-014
title: Remote-Bootstrapping über IdP-Claim-Mapping
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-24
last_updated: 2026-06-24
author: requirements-engineer
references:
  use_cases:
    - UC-02
  business_objects:
    - system-admin-account
  business_rules: []
  stakeholders:
    - SH-06
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs:
    - ADR-006
supersedes: []
superseded_by: []
---

# REQ-014: Remote-Bootstrapping über IdP-Claim-Mapping

## Aussage

Das System SOLL es ermöglichen, System-Admin-Rechte über ein Mapping auf einen Gruppen- oder Rollen-Claim eines konfigurierten externen Identity-Providers (Entra ID oder Authentik, siehe ADR-006) zu vergeben, ohne dass dafür ein lokales Credential angelegt werden muss.

## Begründung

Organisationen mit etablierter IdP-Governance (z.B. SH-05-artige Konzern-Umgebungen, aber auch SH-06 als Operator mit Anbindung an bestehendes OIDC/LDAP) wollen System-Admin-Rechte über die zentrale Identity-Verwaltung steuern, nicht über ein zusätzliches lokales Credential. UC-02, Alternative A1.

## Kontext

Setzt voraus, dass für die Instanz bereits ein OIDC-Provider konfiguriert ist (Entra ID oder Authentik). Das Mapping wird als Teil des [System-Admin-Accounts](../../business-objects/system-admin-account.md) mit `mode: remote` gespeichert.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- Konfiguration: Provider (Entra ID oder Authentik), `claimType` (group | role), `claimValue` (Name der Gruppe/Rolle)
- Identity-Token mit Claims bei nachfolgenden Logins

**Verarbeitung**:
- Speicherung des Mappings als System-Admin-Account mit `mode: remote`
- Bei jedem Login: Prüfung, ob das Identity-Token den konfigurierten Claim mit dem konfigurierten Wert enthält
- Bei Treffer: Session erhält System-Admin-Rechte zusätzlich zu ggf. vorhandenen regulären Rollen

**Ausgaben**:
- System-Admin-Account-Datensatz mit `mode: remote`
- Bei passendem Login: Session mit System-Admin-Rechten

**Fehlerfälle**:
- Identity-Token enthält den konfigurierten Claim nicht oder mit abweichendem Wert → keine System-Admin-Rechte, regulärer Login-Ablauf (UC-01) bleibt unberührt

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein konfiguriertes Claim-Mapping auf eine IdP-Gruppe
- Wenn: eine Person mit diesem Gruppen-Claim im Identity-Token sich anmeldet
- Dann: erhält die Session System-Admin-Rechte

**AC2**:
- Gegeben: dasselbe Mapping
- Wenn: eine Person ohne diesen Claim sich anmeldet
- Dann: erhält die Session keine System-Admin-Rechte über diesen Weg

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Test-IdP mit konfigurierbaren Claims, Login mit und ohne passenden Claim
- [x] Mess-Werkzeug: Test-Suite des Auth-Moduls
- [x] Bestanden-Kriterium: AC1, AC2 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-001 (OIDC-Login muss funktionieren, bevor Claims geprüft werden können)
- **Folgewirkungen**: REQ-018 (Warnung bei leerem Claim), REQ-019 (Deaktivierbarkeit des lokalen Zugangs)
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Remote-Mapping müssten Organisationen mit strikter IdP-Governance dennoch ein lokales Credential pflegen – widerspricht deren Sicherheitsrichtlinien, mittlerer Schweregrad

## Trade-offs

- vs. REQ-013 (lokales Bootstrapping): Remote-Mapping ist von der Verfügbarkeit und korrekten Konfiguration des IdP abhängig; beide Wege sollten parallel verfügbar bleiben (siehe UC-02, A2)

## Realisierungs-Hinweise

- Claim-Mapping-Konventionen je Provider (Entra-ID-`groups`-Claim vs. Authentik-Gruppen/Properties) sind technische Spezifikation, nicht Teil dieses Requirements (siehe ADR-006, Folgeentscheidungen)

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-02, Alternative A1.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | requirements-engineer | Initial draft aus UC-02 |
