---
id: REQ-154
title: Batch-Write für Entitäten und Verbindungen
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-29
last_updated: 2026-06-29
author: requirements-engineer
references:
  use_cases:
    - UC-19
  adrs:
    - ADR-026
supersedes: []
superseded_by: []
---

# REQ-154: Batch-Write für Entitäten und Verbindungen

## Aussage

Das System **MUSS** einen Endpoint bereitstellen, der bis zu 500 Entitäten und 500 Verbindungen in einem einzigen HTTP-Request mit konfigurierbarer Upsert-Strategie anlegt oder aktualisiert, und **MUSS** einen `dryRun`-Modus unterstützen, der alle Validierungen durchführt ohne zu persistieren.

## Begründung

Code-Scanner und Import-Werkzeuge analysieren ganze Repositories oder CMDB-Snapshots und erzeugen viele Objekte auf einmal. Einzelne HTTP-Requests pro Objekt sind ineffizient (hohe Latenz, viele Verbindungen) und fehleranfällig (partial-failure ohne Atomarität).

## Kontext

`POST /api/v1/entities/batch`. Strategien: upsert (default), create-only, skip-existing. Atomarität optional (atomic: true/false). (ADR-026)

## Typ-spezifische Felder

**Eingaben**:
- BatchWriteRequest (entities[], connections[], strategy, atomic)
- `?dryRun=true` Query-Parameter

**Verarbeitung**:
- Für jede Entität: Validierung, dann Create/Update/Skip je Strategie
- Verbindungen: nach Entitäten verarbeitet (Referenzintegrität)
- Bei `atomic=true`: ein Fehler → Rollback aller Änderungen
- Bei `dryRun=true`: kein Persistieren; ValidationResult pro Item

**Ausgaben**:
- BatchWriteResponse (summary, items[]) mit Status pro Item

**Fehlerfälle**:
- `atomic=true` + mind. ein Fehler → 422; alle rollback'd
- `atomic=false` + Teilfehler → 200 mit errors in items[]

## Akzeptanzkriterien

**AC1**:
- Gegeben: 100 Entitäten im Batch, 5 mit mandatory-Property-Verletzung, `atomic=false`
- Wenn: POST /api/v1/entities/batch
- Dann: 200 OK; summary.created=95, summary.errors=5; fehlerhafte Items mit status=error

**AC2**:
- Gegeben: 100 Entitäten, `dryRun=true`
- Wenn: POST /api/v1/entities/batch?dryRun=true
- Dann: ValidationResult; keine Entität in DB; Response zeigt was angelegt würde

**AC3**:
- Gegeben: Batch mit Verbindung, deren `sourceExternalId` nicht existiert
- Wenn: POST /api/v1/entities/batch (entities + connections im selben Request)
- Dann: Entitäten zuerst angelegt; Verbindung dann aufgelöst (sourceExternalId aus diesem Batch)

## Verifikationsmethode

- [ ] Methode: test (automatisiert)
- [ ] Test-Setup: Integration-Test; 100-Item-Batch mit Fehlerszenarien
- [ ] Bestanden-Kriterium: Korrekte summary-Zählung; dryRun schreibt nicht
- [ ] In CI integriert: ja

## Abhängigkeiten

- **Voraussetzungen**: REQ-153 (external_id + Upsert), REQ-149 (Validierung)
- **Folgewirkungen**: US-141

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-29 | requirements-engineer | Initial draft aus ADR-026 |
