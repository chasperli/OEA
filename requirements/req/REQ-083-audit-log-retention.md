---
id: REQ-083
title: Audit-Log-Retention und Abfrage-Performance
type: non-functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-27
last_updated: 2026-06-27
author: requirements-engineer
references:
  use_cases:
    - UC-01
    - UC-04
  business_objects:
    - architecture
  business_rules: []
  stakeholders:
    - SH-05
    - SH-06
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs:
    - ADR-016
supersedes: []
superseded_by: []
---

# REQ-083: Audit-Log-Retention und Abfrage-Performance

## Aussage

Das System MUSS alle sicherheits- und compliance-relevanten Ereignisse (Login, Logout, Entitäts-Anlage/-Änderung/-Löschung, Metamodell-Änderung, Rollen-Zuweisung) in einem append-only Audit-Log persistieren. Audit-Einträge MÜSSEN mindestens **2 Jahre** aufbewahrt werden. Abfragen über die letzten **30 Tage** MÜSSEN innerhalb von **5 Sekunden** abgeschlossen sein.

## Begründung

OEA wird in Konzernumgebungen eingesetzt, in denen Change-Tracking für strategische Architektur-Entscheidungen nachvollziehbar sein muss (SH-05: CIO, Audit-Nachweis; SH-06: KMU-Operator, Versionshistorie für Entscheidungsdokumentation). Gleichzeitig ist das Audit-Log die Grundlage für die Entity-Versionshistorie (ADR-016: `entity_versions` + `audit_events`). 2 Jahre Retention deckt typische Compliance-Anforderungen (DSGVO Art. 30, ISO 27001 A.12.4) ab, ohne exzessiven Speicheraufwand.

## Kontext

„Audit-Log" umfasst zwei Tabellen (ADR-016):
- `entity_versions`: Property-Snapshots vor jedem Entity-Update (Content-History)
- `audit_events`: Strukturelle Ereignisse (Löschung, Typ-Änderung, Login, Rollen-Zuweisung)

Retention gilt für beide. Der append-only-Charakter (kein Update/Delete auf Audit-Einträgen) ist architektonisch erzwungen (BR-14 in entity.md).

„Letzte 30 Tage" ist der häufigste Query-Use-Case (Nachvollzug von Änderungen in laufenden Sprint/Projekt-Zeiträumen). Ältere Einträge dürfen paginiert und langsamer sein.

## Typ-spezifische Felder

### Bei type=non-functional

**Kategorie**: compliance / performance

**Messbare Zielwerte**:

| Metrik | Zielwert | Schwellwert (warning) | Scope |
|---|---|---|---|
| Aufbewahrungsdauer Audit-Einträge | ≥ 2 Jahre | < 1 Jahr | `entity_versions` + `audit_events` |
| Abfrage-Latenz (letzte 30 Tage, eine Entity) | ≤ 5s p95 | > 2s | Repository mit 100.000 Entitäten, 50 Versionen/Entität |
| Abfrage-Latenz (letzte 30 Tage, alle Events) | ≤ 10s p95 | > 5s | paginiert, 100 Einträge/Seite |
| Append-only-Garantie | 100 % | | kein UPDATE/DELETE auf `entity_versions` oder `audit_events` |

## Akzeptanzkriterien

**AC1** (Append-only):
- Gegeben: `audit_events`- und `entity_versions`-Tabellen in PostgreSQL
- Wenn: Datenbankbenutzer der Applikation einen UPDATE- oder DELETE-Befehl auf diesen Tabellen ausführt
- Dann: Datenbank verweigert den Befehl (Row-Level-Security oder Tabellen-Permission; kein Soft-Delete)

**AC2** (Retention aktiv):
- Gegeben: Audit-Eintrag vom Datum `NOW() - INTERVAL '2 years'`
- Wenn: Standard-Abfrage über `audit_events` für diesen Zeitraum
- Dann: Eintrag ist vorhanden und abrufbar; kein automatisches Löschen durch das System

**AC3** (Abfrage-Performance letzte 30 Tage):
- Gegeben: `entity_versions` mit 5.000.000 Einträgen (100.000 Entitäten × 50 Versionen); B-Tree-Index auf `changed_at`
- Wenn: `SELECT * FROM entity_versions WHERE entity_id = ? AND changed_at >= NOW() - INTERVAL '30 days' ORDER BY version DESC`
- Dann: p95 ≤ 5s; Ergebnis korrekt und vollständig

**AC4** (API-Endpunkt):
- Gegeben: `GET /api/v1/entities/{id}/history?days=30`
- Wenn: Aufruf für eine Entität mit 50 Versionen in den letzten 30 Tagen
- Dann: HTTP 200, vollständige Version-Liste, p95 ≤ 5s

## Verifikationsmethode

- [x] Methode: test (automatisiert) + inspection (DB-Permissions)
- [x] Test-Setup: synthetische `entity_versions`-Tabelle mit 5M Einträgen; Query-Plan-Analyse via `EXPLAIN ANALYZE`; Permission-Test (UPDATE verweigert)
- [x] Bestanden-Kriterium: Latenz ≤ 5s p95; UPDATE/DELETE abgewiesen; 2-Jahres-Einträge vorhanden
- [ ] In CI integriert: Permission-Test ja; Performance-Test als Release-Gate

## Abhängigkeiten

- **Voraussetzungen**: ADR-016 (entity_versions, audit_events Tabellenstruktur); REQ-005 (Login-Audit-Log)
- **Folgewirkungen**: Index auf `entity_versions.changed_at` und `audit_events.occurred_at` ist Pflicht (in Init-Migration)

## Risiken bei Nichterfüllung

- Compliance-Verstoss (DSGVO Art. 30, ISO 27001) bei Kunden mit Audit-Anforderungen
- Nachvollziehbarkeit von Architektur-Entscheidungen geht verloren (wer hat was wann geändert?)

## Trade-offs

- Unbegrenzte Retention vs. 2 Jahre: 2 Jahre ist Kompromiss zwischen Compliance und Speicherkosten. Für Instanzen mit vielen Änderungen (> 1M Events/Jahr) wächst die Tabelle auf > 50 GB — Partitionierung nach `changed_at` (monatlich) empfohlen ab v2.0
- Keine automatische Archivierung in v1.0: Einträge bleiben in denselben Tabellen; Cold-Storage-Archivierung ist v2.0-Feature

## Realisierungs-Hinweise

- PostgreSQL Row-Level-Security oder separater DB-User ohne DELETE-Rechte auf `entity_versions` und `audit_events`
- Partielle Indizes auf `changed_at >= NOW() - INTERVAL '30 days'` für häufige Abfragen
- `GET /api/v1/entities/{id}/history` — paginierter Endpunkt (Cursor-basiert, nicht Offset)

## Realisierung

- ADR(s): ADR-016
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-27 | requirements-engineer | Initial draft |
