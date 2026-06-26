# US-041: Bestehende Entität in einer Solution als modified erfassen

**ID**: US-041
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Solution Architekt möchte ich eine bestehende Entität aus der IT-Landschaft in einer Solution als „verändert" markieren und die konkreten Property-Änderungen (Vorher/Nachher) beschreiben können, damit der Scope der Initiative klar zeigt, was sich an dieser Entität ändert.

## Bezug

**Use Case**: [UC-05: Architektur-Vision einer Änderungsinitiative beschreiben](../use-cases/UC-05-architektur-vision-beschreiben.md)
**Persona**: [SH-04: Michael – Solution Architekt](../../business-analysis/stakeholders/SH-04-michael-solution-architekt.md)
**Requirement**: [REQ-040: EntityDeltas einer Solution erfassen](../req/REQ-040-entity-deltas-erfassen.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: `ERP-Core (ApplicationComponent, version=v4)` ist in der Ausgangsbasis
- Wenn: Michael `ERP-Core` als modified markiert und `version` von „v4" auf „v5" ändert
- Dann: enthält das Delta `changes = {version: {before: "v4", after: "v5"}}`; in der Delta-Liste erscheint `ERP-Core` mit `deltaType=modified`

**AC2** (Vorher-Wert aus Ausgangsbasis):
- Gegeben: `ERP-Core` hat in der Ausgangsbasis `version=v4`
- Wenn: Michael das `modified`-Formular für `ERP-Core` öffnet
- Dann: ist der `before`-Wert für `version` automatisch auf „v4" vorbelegt (aus Ausgangsbasis)

**AC3** (Entität nicht in Ausgangsbasis):
- Gegeben: Michael gibt eine entityId ein, die nicht in der Ausgangsbasis vorhanden ist
- Wenn: er speichert
- Dann: Validierungsfehler „Entität nicht in der aktuellen Landschaft gefunden"; kein Delta gespeichert

**AC4** (Solution implemented):
- Gegeben: Solution hat status=`implemented`
- Wenn: Michael versucht, ein modified-Delta hinzuzufügen
- Dann: 409 Conflict „Diese Solution ist abgeschlossen und kann nicht mehr verändert werden"

**AC5** (Duplikat-Prüfung):
- Gegeben: `ERP-Core` hat bereits ein `retiring`-Delta in dieser Solution
- Wenn: Michael versucht, `ERP-Core` zusätzlich als `modified` zu erfassen
- Dann: Validierungsfehler „Für ERP-Core existiert bereits ein Delta in dieser Solution"

## Technische Hinweise

- Betroffene Komponenten: Solution-Detailansicht (Delta-Erfassung, Unterbereich „Entität ändern"), Backend `POST /api/v1/solutions/{id}/deltas`
- Request-Body: `{ entityId: UUID, deltaType: "modified", changes: { propertyName: { before: any, after: any }, ... } }`
- `before`-Werte: können beim Laden des Formulars aus der Ausgangsbasis (REQ-039-Endpunkt) vorbelegt werden; der Nutzer kann sie überschreiben
- Nur Properties, die sich ändern, müssen im `changes`-Map erscheinen (sparse diff)
- UI: Property-Liste der Entität mit je zwei Eingabefeldern (Vorher / Nachher); nicht geänderte Properties können leer bleiben

## Definition of Done

- [ ] Akzeptanzkriterien AC1–AC5 erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests: modified-Delta mit Vorher/Nachher, Vorbelegen aus Ausgangsbasis, ungültige entityId, Solution=implemented blockiert, Duplikat-Prüfung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-038 (Solution), US-039 (Ausgangsbasis liefert Vorher-Werte und Validierungsbasis)
- Blockiert: US-043 (Diff-Ansicht braucht modified-Deltas für aussagekräftige Diff)

## Notizen

5 SP wegen des Property-Diff-Editors: das UI muss die Properties der Entität laden (aus MetamodelConfiguration), zwei Spalten (Vorher/Nachher) darstellen und nur ausgefüllte Felder in den `changes`-Map aufnehmen. Der `before`-Wert aus der Ausgangsbasis ist eine UX-Verbesserung (kein MVP-Blocker, aber stark empfohlen für Usability).
