# US-089: Realized-Plateau ist unveränderlich

**ID**: US-089
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Kurt – Lead Enterprise Architekt möchte ich, dass realisierte Plateaus nicht mehr bearbeitet werden können, damit die Architektur-Historie unveränderlich und auditierbar bleibt.

## Bezug

**Use Case**: [UC-11](../use-cases/UC-11-plateau-definieren-und-go-live.md)
**Persona**: Kurt – Lead Enterprise Architekt (SH-03)
**Requirements**: [REQ-089](../req/REQ-089-plateau-realized-schreibgeschuetzt.md)

## Akzeptanzkriterien

**AC1** (API-Schreibschutz):
- Wenn: ich einen PUT-Request für ein realized-Plateau sende
- Dann: erhalte ich HTTP 422 "Realisiertes Plateau ist read-only"

**AC2** (UI-Schreibschutz):
- Wenn: ich ein realized-Plateau in der Übersicht ansehe
- Dann: ist keine Bearbeiten-Schaltfläche sichtbar

## Definition of Done

- [ ] AC1–AC2 erfüllt
- [ ] Tests vorhanden
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
