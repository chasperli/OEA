# Ableitung aus: requirements/req/req-083-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert) + inspection (DB-Permissions)

@non-functional @performance @should @UC-01 @UC-04
Feature: REQ-083 – Audit-Log-Retention und Abfrage-Performance

  Das System MUSS alle sicherheits- und compliance-relevanten
  Ereignisse (Login, Logout, Entitäts-Anlage/-Änderung/-Löschung,
  Metamodell-Änderung, Rollen-Zuweisung) in einem append-only Audit-Log
  persistieren. Audit-Einträge MÜSSEN mindestens **2 Jahre** aufbewahrt
  werden.

  @AC1
  Scenario: AC1 – Append-only – `audit_events`- und `entity_versions`-Tabellen in PostgreSQL
    Given `audit_events`- und `entity_versions`-Tabellen in PostgreSQL
    When  Datenbankbenutzer der Applikation einen UPDATE- oder DELETE-Befehl auf diesen Tabellen ausführt
    Then  Datenbank verweigert den Befehl (Row-Level-Security oder Tabellen-Permission; kein Soft-Delete)

  @AC2
  Scenario: AC2 – Retention aktiv – Audit-Eintrag vom Datum `NOW() - INTERVAL '2 years'`
    Given Audit-Eintrag vom Datum `NOW() - INTERVAL '2 years'`
    When  Standard-Abfrage über `audit_events` für diesen Zeitraum
    Then  Eintrag ist vorhanden und abrufbar; kein automatisches Löschen durch das System

  @AC3
  Scenario: AC3 – Abfrage-Performance letzte 30 Tage – `entity_versions` mit 5.000.000 Einträgen (100.000 Entitäten × 50 Versio...
    Given `entity_versions` mit 5.000.000 Einträgen (100.000 Entitäten × 50 Versionen); B-Tree-Index auf `changed_at`
    When  `SELECT * FROM entity_versions WHERE entity_id = ? AND changed_at >= NOW() - INTERVAL '30 days' ORDER BY version DESC`
    Then  p95 ≤ 5s; Ergebnis korrekt und vollständig

  @AC4
  Scenario: AC4 – API-Endpunkt – `GET /api/v1/entities/{id}/history?days=30`
    Given `GET /api/v1/entities/{id}/history?days=30`
    When  Aufruf für eine Entität mit 50 Versionen in den letzten 30 Tagen
    Then  HTTP 200, vollständige Version-Liste, p95 ≤ 5s
