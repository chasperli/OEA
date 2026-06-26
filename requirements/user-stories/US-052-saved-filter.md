# US-052: Gesetzten Filter als SavedFilter speichern

**ID**: US-052
**Story Points**: 2
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Katalog-Nutzer möchte ich einen ad-hoc gesetzten Filter benennen und speichern können, damit ich ihn beim nächsten Besuch des Katalogs per Schnellauswahl wieder aktivieren kann, ohne ihn neu einzugeben.

## Bezug

**Use Case**: [UC-06: Architektur-Katalog anlegen, konfigurieren und verwenden](../use-cases/UC-06-katalog-anlegen-und-verwenden.md)
**Persona**: Alle Stakeholder (SH-01 bis SH-07); Katalog-Manager (SH-03, SH-07) können zusätzlich scope=instance wählen
**Requirement**: [REQ-047: Filter setzen und als SavedFilter speichern](../req/REQ-047-filter-setzen-und-speichern.md)

## Akzeptanzkriterien

**AC1** (Filter speichern, Happy Path):
- Gegeben: Kurt hat Filter `status = "active"` gesetzt (US-051)
- Wenn: Kurt klickt „Filter speichern", gibt Name „Nur aktive Systeme" ein und bestätigt
- Dann: SavedFilter in der Katalog-Konfiguration persistiert; erscheint in der Schnellauswahl-Liste für alle Besucher (scope=instance, weil Kurt Manager ist)

**AC2** (SavedFilter aktivieren):
- Gegeben: SavedFilter „Nur aktive Systeme" existiert
- Wenn: Franz öffnet den Katalog und klickt in der Schnellauswahl auf „Nur aktive Systeme"
- Dann: Filter sofort aktiv; Tabelle zeigt nur aktive Entitäten

**AC3** (Persönlicher Filter – scope=personal):
- Gegeben: Franz hat Besucher-Rolle (keine Schreibberechtigung)
- Wenn: Franz setzt einen Filter und klickt „Filter speichern"
- Dann: Filter als scope=personal gespeichert; erscheint nur in Franzens Schnellauswahl

**AC4** (AND / OR zwischen Expressions):
- Wenn: Kurt speichert Filter mit 2 Expressions und wählt OR als Kombination
- Dann: SavedFilter mit `logicalOperator=or` gespeichert; Abfrage liefert Entitäten die mind. eine Bedingung erfüllen

## Technische Hinweise

- Betroffene Komponenten: „Filter speichern"-Button in Filter-Leiste, Name-Eingabe-Dialog, Backend `POST /api/v1/catalogs/{id}/filters`
- UX: minimales Modal: Name + AND/OR-Auswahl + Bestätigung
- Abhängigkeit: US-051

## Definition of Done

- [ ] Akzeptanzkriterien AC1–AC4 erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests: Filter speichern (instance), in Schnellauswahl sichtbar, personal scope für Besucher, AND/OR-Kombination
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen
