# US-126: Eingeschränkte Properties werden ohne Berechtigung leer angezeigt

**ID**: US-126
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Anna – Business Analyst möchte ich bei Entitäten, für die ich keine Leseberechtigung auf bestimmte Felder habe, das Feld einfach leer sehen (nicht editierbar) — ohne Fehlermeldung und ohne den tatsächlichen Wert zu kennen, damit die Anwendung nahtlos nutzbar bleibt.

## Bezug

**Use Case**: [UC-21](../use-cases/UC-21-property-sichtbarkeit-konfigurieren.md)
**Persona**: Anna – Business Analyst (SH-02)
**Requirements**: [REQ-126](../req/REQ-126-property-sichtbarkeit-enforcement-rolle.md)

## Akzeptanzkriterien

**AC1** (API liefert null):
- Wenn: Anna eine Entität mit role-restricted Property abruft
- Dann: API-Response enthält `null` für dieses Feld; kein echter Wert übertragen

**AC2** (UI leer und deaktiviert):
- Wenn: Anna das Entity-Detailformular öffnet
- Dann: Eingeschränktes Feld ist leer und nicht editierbar; kein Tooltip, kein Placeholder mit Wert

**AC3** (Schreibversuch abgelehnt):
- Wenn: Anna versucht, Feld via direktem API-Aufruf zu schreiben
- Dann: HTTP 403; Wert unverändert

**AC4** (Katalog-Spalte leer):
- Wenn: Katalog enthält Spalte auf eingeschränktem Property
- Dann: Zelle ist leer; Sortieren und Filtern der Spalte für Anna deaktiviert

## Definition of Done

- [ ] AC1–AC4 erfüllt
- [ ] Tests vorhanden (inkl. API-Test mit falschem Token)
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
