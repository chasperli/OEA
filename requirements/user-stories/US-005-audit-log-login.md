# US-005: Audit-Log-Eintrag für jeden Login-Versuch

**ID**: US-005
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Betreiber möchte ich, dass jeder Login-Versuch protokolliert wird, damit ich im Audit-Fall nachvollziehen kann, wer sich wann mit welchem Mechanismus angemeldet hat – erfolgreich oder nicht.

## Bezug

**Use Case**: [UC-01: Login](../use-cases/UC-01-login.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-005: Audit-Log-Eintrag für jeden Login-Versuch](../req/REQ-005-audit-log-login.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein erfolgreicher Login-Versuch (OIDC, API-Key, Passkey, lokal)
- Wenn: er abgeschlossen ist
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Mechanismus, Ergebnis `success` und Identitäts-Referenz

**AC2**:
- Gegeben: ein fehlgeschlagener Login-Versuch
- Wenn: der Fehlschlag eintritt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Mechanismus, Ergebnis `failure` und – soweit ohne Preisgabe sicherheitsrelevanter Details möglich – dem Fehlergrund

## Technische Hinweise

- Betroffene Komponenten: Audit-Log-Modul, Auth-Modul (alle Mechanismen)
- Betroffene EntityTypes/Relations: keine fachlichen, separates Audit-Log-Schema
- API-Endpunkte: alle Login-Endpunkte (OIDC-Callback, API-Key, Passkey, lokal)
- Datenbank-Änderungen: Audit-Log-Tabelle/Append-Only-Store

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (Unit, Integration über alle Mechanismen)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-001, US-002 (mindestens ein Login-Mechanismus muss existieren, um zu loggen)
- Blockiert: keine

## Notizen

Sollte parallel zu jedem neuen Login-Mechanismus erweitert werden (Passkey, TOTP, lokal) – ggf. iterativ statt in einem Schritt für alle Mechanismen.
