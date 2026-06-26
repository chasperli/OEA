# US-042: Bestehende Entität in einer Solution als retiring markieren

**ID**: US-042
**Story Points**: 2
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Solution Architekt möchte ich eine bestehende Entität aus der IT-Landschaft in einer Solution als „ausser Betrieb gehend" markieren können (deltaType=retiring), damit der Scope der Initiative klar zeigt, welche Systeme oder Komponenten durch diese Initiative abgelöst werden.

## Bezug

**Use Case**: [UC-05: Architektur-Vision einer Änderungsinitiative beschreiben](../use-cases/UC-05-architektur-vision-beschreiben.md)
**Persona**: [SH-04: Michael – Solution Architekt](../../business-analysis/stakeholders/SH-04-michael-solution-architekt.md)
**Requirement**: [REQ-040: EntityDeltas einer Solution erfassen](../req/REQ-040-entity-deltas-erfassen.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: `CRM-Legacy (ApplicationComponent)` ist in der Ausgangsbasis
- Wenn: Michael `CRM-Legacy` aus der Ausgangsbasis auswählt und „Ausser Betrieb nehmen" klickt
- Dann: erscheint `CRM-Legacy` in der Delta-Liste mit `deltaType=retiring`; in der Diff-Ansicht (US-043) wird sie als abgehend dargestellt

**AC2** (nicht in Ausgangsbasis):
- Gegeben: Michael gibt eine entityId ein, die nicht in der Ausgangsbasis vorhanden ist
- Wenn: er speichert
- Dann: Validierungsfehler „Entität nicht in der aktuellen Landschaft gefunden"

**AC3** (Duplikat-Prüfung):
- Gegeben: `CRM-Legacy` hat bereits ein `new`-Delta in dieser Solution (wäre widersprüchlich)
- Wenn: Michael versucht, `CRM-Legacy` zusätzlich als `retiring` zu markieren
- Dann: Validierungsfehler „Für CRM-Legacy existiert bereits ein Delta in dieser Solution"

**AC4** (Solution implemented):
- Gegeben: Solution hat status=`implemented`
- Wenn: Michael versucht, eine Entität als retiring zu markieren
- Dann: 409 Conflict „Diese Solution ist abgeschlossen und kann nicht mehr verändert werden"

## Technische Hinweise

- Betroffene Komponenten: Solution-Detailansicht (Delta-Erfassung, Aktion „Ausser Betrieb nehmen" direkt in der Ausgangsbasis-Liste), Backend `POST /api/v1/solutions/{id}/deltas`
- Request-Body: `{ entityId: UUID, deltaType: "retiring" }` – minimaler Payload, kein `changes`-Map nötig
- UI: Direktaktion in der Ausgangsbasis-Liste (Button oder Kontextmenü pro Zeile); kein separates Formular nötig

## Definition of Done

- [ ] Akzeptanzkriterien AC1–AC4 erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests: retiring anlegen, ungültige entityId, Duplikat-Prüfung, Solution=implemented blockiert
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-038 (Solution), US-039 (Ausgangsbasis muss laden, damit Direktaktion möglich ist)
- Blockiert: US-043 (retiring-Deltas sind Kernbestandteil der Diff-Ansicht)

## Notizen

2 SP: minimaler Backend-Aufwand (kein `changes`-Map). UI: Direktaktion in der Ausgangsbasis-Liste ist die natürlichste Interaktion – Michael sieht die Entität und markiert sie mit einem Klick. Gemeinsamer Backend-Endpunkt mit US-040 und US-041 (`POST /solutions/{id}/deltas`).
