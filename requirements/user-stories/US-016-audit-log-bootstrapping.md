# US-016: Audit-Log-Eintrag für den Bootstrapping-Vorgang

**ID**: US-016
**Story Points**: 2
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Betreiber möchte ich, dass jeder Bootstrapping-Vorgang protokolliert wird, damit ich nachweisen kann, wann und wie der erste privilegierte Zugang der Instanz entstanden ist.

## Bezug

**Use Case**: [UC-02: System-Admin-Bootstrapping](../use-cases/UC-02-system-admin-bootstrapping.md)
**Persona**: [SH-06: Max – Operator im KMU](../../business-analysis/stakeholders/SH-06-max-operator-kmu.md)
**Requirement**: [REQ-016: Audit-Log-Eintrag für Bootstrapping-Vorgang](../req/REQ-016-audit-log-bootstrapping.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein erfolgreich abgeschlossener Bootstrapping-Vorgang (lokal oder remote)
- Wenn: er abgeschlossen ist
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Modus und Ergebnis `success`

**AC2**:
- Gegeben: ein abgelehnter Bootstrapping-Versuch
- Wenn: die Ablehnung erfolgt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt und Ergebnis `rejected`

## Technische Hinweise

- Betroffene Komponenten: Audit-Log-Modul, Bootstrapping-Endpunkt
- Betroffene EntityTypes/Relations: keine fachlichen
- API-Endpunkte: Bootstrapping-Endpunkt
- Datenbank-Änderungen: Audit-Log muss bereits vor jeder Person-/Role-Konfiguration funktionsfähig sein

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (erfolgreiche und abgelehnte Versuche)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-013, US-015
- Blockiert: keine

## Notizen

Audit-Log-Mechanismus sollte mit US-005 (Login-Audit-Log) geteilt werden, muss aber bereits vor jeder regulären Person-/Role-Konfiguration einsatzbereit sein.
