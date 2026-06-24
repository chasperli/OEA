---
id: REQ-005
title: Audit-Log-Eintrag für jeden Login-Versuch
type: compliance
priority: must
status: proposed
version: 0.1.0
created: 2026-06-24
last_updated: 2026-06-24
author: requirements-engineer
references:
  use_cases:
    - UC-01
  business_objects:
    - person
  business_rules: []
  stakeholders:
    - SH-03
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-005: Audit-Log-Eintrag für jeden Login-Versuch

## Aussage

Das System MUSS für jeden Login-Versuch – erfolgreich oder nicht – einen Audit-Log-Eintrag mit Zeitpunkt, verwendetem Authentifizierungsmechanismus und Ergebnis erzeugen.

## Begründung

UC-01 fordert in den Nachbedingungen einen Audit-Log-Eintrag bei Erfolg; die Exception Flows E1, E2 und E4 fordern dieselbe Nachvollziehbarkeit bei Fehlschlag. Nachvollziehbarkeit von Zugriffsversuchen ist Grundlage für Audit-Vorbereitung (siehe SH-03 Pain Point "Audit-Berichte werden zusammengezimmert") und für Compliance-Nachweise.

## Kontext

Betrifft alle Pfade aus UC-01: erfolgreicher OIDC-Login, API-Key-Login, sowie alle Fehlerfälle E1–E4.

## Typ-spezifische Felder

### Bei type=compliance

**Regelwerk**: internes Audit-/Nachvollziehbarkeits-Prinzip von OEA (siehe Konzept §22 Auswertbarkeit); keine spezifische externe Norm vorgegeben, aber kompatibel zu ISO 27001 / DORA-Audit-Trail-Anforderungen

**Konkrete Vorschrift**: Jeder Authentifizierungsversuch ist nachvollziehbar zu protokollieren (Zeitpunkt, Mechanismus, Ergebnis, betroffene Identität soweit ermittelbar)

**Nachweis-Anforderung**: Audit-Log muss über den in der jeweiligen Organisation vorgeschriebenen Aufbewahrungszeitraum hinweg abrufbar und exportierbar sein (konkreter Zeitraum: offene Frage, siehe unten)

**Audit-Relevanz**: ja, Bestandteil künftiger Audit-Reports (Konzept §22)

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein Login-Versuch (OIDC oder API-Key) wird durchgeführt
- Wenn: er erfolgreich ist
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Mechanismus, Ergebnis `success` und Identitäts-Referenz

**AC2**:
- Gegeben: ein Login-Versuch schlägt fehl (E1, E2 oder E4)
- Wenn: der Fehlschlag eintritt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Mechanismus, Ergebnis `failure` und – soweit ohne Preisgabe sicherheitsrelevanter Details möglich – dem Fehlergrund

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Login-Versuche in allen Pfaden (Erfolg, E1, E2, E4) gegen Audit-Log-Inhalt prüfen
- [x] Mess-Werkzeug: Test-Suite des Auth-Moduls + Audit-Log-Reader
- [x] Bestanden-Kriterium: AC1, AC2 grün für alle Pfade
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-001, REQ-002, REQ-004
- **Folgewirkungen**: spätere Use Cases zu Audit-Reports (Konzept §22)
- **Konflikte**: REQ-006 (Audit-Log darf keine sicherheitsrelevanten Details wie Account-Existenz preisgeben – Detailgrad muss abgestimmt werden)

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Audit-Trail keine forensische Nachvollziehbarkeit bei Sicherheitsvorfällen – schwerwiegend
- Risiko 2: Fehlende Protokollierung erschwert Audit-Vorbereitung weiterhin (ungelöster Pain Point von SH-03)

## Trade-offs

- vs. REQ-006: Audit-Log-Detailgrad vs. Vermeidung von User-Enumeration nach außen – das Log selbst darf intern detaillierter sein als die nach außen sichtbare Fehlermeldung

## Realisierungs-Hinweise

- Aufbewahrungsdauer und Exportformat sind in einem eigenen NFR/Requirement zu Audit-Reports zu klären, nicht hier vorwegnehmen

## Realisierung

- ADR(s): keine
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-01 Login, Nachbedingungen und allen Exception Flows.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | requirements-engineer | Initial draft aus UC-01 |
