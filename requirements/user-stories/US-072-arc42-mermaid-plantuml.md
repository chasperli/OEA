# US-072: Mermaid- und PlantUML-Diagramm in Arc42-Antwort einbetten

**ID**: US-072
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Solution Architekt möchte ich in einer Arc42-Antwort Mermaid- und PlantUML-Codeblöcke schreiben, die sofort als Diagramme gerendert werden – damit ich Kontextabgrenzung, Bausteinsicht und Verteilungssicht als Diagram-as-Code pflege, ohne ein separates Tool zu öffnen.

## Bezug

**Use Case**: [UC-09](../use-cases/UC-09-loesungsarchitektur-arc42-dokumentieren.md)
**Persona**: Michael – Solution Architekt (SH-04)
**Requirements**: [REQ-068](../req/REQ-068-arc42-wysiwyg-editor.md)

## Akzeptanzkriterien

**AC1** (Mermaid gerendert):
- Wenn: Michael tippt einen ```mermaid-Block mit C4Context-Diagramm
- Dann: Diagramm wird als SVG inline angezeigt; kein Roh-Code

**AC2** (PlantUML gerendert):
- Wenn: Michael tippt einen ```plantuml-Block mit Sequenzdiagramm
- Dann: Diagramm via konfiguriertem Server oder WASM als SVG gerendert

**AC3** (Fallback ohne PlantUML-Server):
- Wenn: Kein Server konfiguriert und WASM nicht verfügbar
- Dann: Roh-Code angezeigt + Warning-Icon; kein App-Crash

**AC4** (Code-Edit-Toggle):
- Wenn: Michael klickt auf gerendertes Mermaid-Diagramm → „Code bearbeiten"
- Dann: Code-Editor öffnet sich; Speichern rendert neu

**AC5** (Web Portal liest Diagramme):
- Wenn: CIO öffnet Arc42-Tab im Web Portal
- Dann: Mermaid und PlantUML werden read-only gerendert; kein Editor

## Definition of Done

- [ ] AC1–AC5 erfüllt
- [ ] Tests: Mermaid-Rendering, PlantUML-Rendering, Fallback, Toggle, Web Portal
- [ ] SVG sanitized (XSS-Prevention verifiziert)
- [ ] Code-Review; Linter grün; In Trace-Matrix eingetragen
