# US-073: Entität per /@ im Arc42-Editor einbetten

**ID**: US-073
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Solution Architekt möchte ich im Arc42-Editor durch Tippen von `/@` und anschliessendem Suchen eine Entität aus dem Repository einbetten – damit meine Dokumentation direkt auf das Modell verweist und Umbenennungen automatisch nachgezogen werden.

## Bezug

**Use Case**: [UC-09](../use-cases/UC-09-loesungsarchitektur-arc42-dokumentieren.md)
**Persona**: Michael – Solution Architekt (SH-04)
**Requirements**: [REQ-070](../req/REQ-070-entity-mention-autocomplete.md)

## Akzeptanzkriterien

**AC1** (Dropdown im Freitext):
- Wenn: Michael tippt `/@CRM` im Markdown-Bereich
- Dann: Autocomplete-Dropdown mit passenden Entitäten erscheint

**AC2** (Auswahl → ID-stabiler Link):
- Wenn: Michael wählt „CRM-System" (id=1)
- Dann: `[@CRM-System](entity:1)` eingefügt; gerendert als klickbares Badge

**AC3** (Umbenennung automatisch):
- Gegeben: Entität id=1 heisst neu „Salesforce CRM"
- Wenn: Michael öffnet die Antwort erneut
- Dann: Badge zeigt „Salesforce CRM"; Rohtext unverändert

**AC4** (Dropdown im Mermaid-Block):
- Wenn: Michael tippt `/@CRM` innerhalb eines Mermaid-Codeblocks
- Dann: Dropdown erscheint; nach Auswahl wird Textname `CRM-System` ohne Link eingefügt

**AC5** (PlantUML-Block analog zu AC4):
- Wenn: `/@CRM` in PlantUML-Block
- Dann: Textname wird eingefügt

**AC6** (Gelöschte Entität):
- Gegeben: Entität id=1 gelöscht
- Wenn: Antwort mit Mention geöffnet
- Dann: Badge zeigt `[gelöscht]` in roter Schrift

## Technische Hinweise

- `GET /api/v1/entities/search?q=CRM&limit=10` für Live-Suche (Debounce 150 ms)
- Batch-Auflösung beim Öffnen: `POST /api/v1/entities/batch?ids=[...]`
- TipTap MentionExtension; Code-Block-Erkennung für Text-only-Insertion

## Definition of Done

- [ ] AC1–AC6 erfüllt
- [ ] Tests: Dropdown-Trigger, Auswahl, ID-Auflösung, Umbenennung, Löschen, Codeblock-Mode
- [ ] E2E-Test (Playwright) für Freitext- und Mermaid-Flow
- [ ] XSS-Prevention auf Entity-Namen verifiziert
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
