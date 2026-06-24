---
id: REQ-016
title: Audit-Log-Eintrag für den Bootstrapping-Vorgang
type: compliance
priority: must
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

# REQ-016: Audit-Log-Eintrag für den Bootstrapping-Vorgang

## Aussage

Das System MUSS jeden abgeschlossenen oder abgelehnten Bootstrapping-Vorgang mit Zeitpunkt, gewähltem Modus (lokal/remote) und Ergebnis im Audit-Log erfassen.

## Begründung

Der Bootstrapping-Vorgang erzeugt den ersten privilegierten Zugang einer Instanz – ein sicherheitskritisches Ereignis, das nachvollziehbar sein muss, auch weil zu diesem Zeitpunkt noch kein reguläres RBAC greift. UC-02, Nachbedingungen bei Erfolg und Exception Flows.

## Kontext

Gilt für den Hauptablauf (lokal), Alternative A1 (remote) und A2 (kombiniert), sowie für abgelehnte Versuche (E3, REQ-015).

## Typ-spezifische Felder

### Bei type=compliance

**Regelwerk**: internes Audit-/Nachvollziehbarkeits-Prinzip von OEA (siehe Konzept §22 Auswertbarkeit), kompatibel zu ISO 27001 / DORA-Audit-Trail-Anforderungen

**Konkrete Vorschrift**: Jeder Bootstrapping-Vorgang (erfolgreich oder abgelehnt) ist mit Zeitpunkt, Modus und Ergebnis zu protokollieren

**Nachweis-Anforderung**: Audit-Log muss auch für Ereignisse vor jeder regulären Person-/Role-Konfiguration zugänglich sein (z.B. über lokale Log-Datei oder Datenbank, nicht ausschließlich über eine UI, die RBAC voraussetzt)

**Audit-Relevanz**: ja, besonders hohe Relevanz, da Bootstrapping den ersten privilegierten Zugang erzeugt

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein erfolgreich abgeschlossener lokaler oder remote Bootstrapping-Vorgang
- Wenn: er abgeschlossen ist
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Modus und Ergebnis `success`

**AC2**:
- Gegeben: ein abgelehnter Bootstrapping-Versuch (z.B. wegen REQ-015)
- Wenn: die Ablehnung erfolgt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt und Ergebnis `rejected`

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Bootstrapping-Versuche (erfolgreich, abgelehnt) gegen Audit-Log-Inhalt prüfen
- [x] Mess-Werkzeug: Test-Suite + Audit-Log-Reader
- [x] Bestanden-Kriterium: AC1, AC2 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-013, REQ-014, REQ-015
- **Folgewirkungen**: keine bekannt
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Protokollierung des Bootstrapping-Vorgangs fehlt die forensische Grundlage, falls ein System-Admin-Zugang missbräuchlich erzeugt wurde – schwerwiegend

## Trade-offs

- keine bekannt

## Realisierungs-Hinweise

- Audit-Log-Mechanismus sollte derselbe sein wie in REQ-005 (UC-01), aber muss bereits funktionieren, bevor reguläre Person-/Role-Daten existieren

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-02, Nachbedingungen bei Erfolg.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | requirements-engineer | Initial draft aus UC-02 |
