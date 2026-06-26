---
id: REQ-068
title: Arc42 WYSIWYG-Editor mit Mermaid- und PlantUML-Rendering
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  use_cases:
    - UC-09
  business_objects:
    - arc42
  stakeholders:
    - SH-04
  concept: []
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-068: Arc42 WYSIWYG-Editor mit Mermaid- und PlantUML-Rendering

## Aussage

Das System MUSS für das `content`-Feld einer Arc42MetaObject-Entität einen WYSIWYG-Editor bereitstellen, der Markdown-Formatierung, `mermaid`-Codeblöcke und `plantuml`-Codeblöcke unterstützt. Mermaid-Blöcke MÜSSEN client-seitig als SVG gerendert werden. PlantUML-Blöcke MÜSSEN entweder via konfigurierten PlantUML-Server oder via WASM-basiertem Client-Rendering als SVG gerendert werden. Bei Rendering-Fehler MUSS der Roh-Code als Fallback angezeigt werden.

## Begründung

Arc42 lebt von Diagrammen: Kontextabgrenzung, Bausteinsicht, Verteilungssicht sind alle visuell. Ohne Diagramm-Rendering im Editor wäre Arc42 in OEA nur Prosa. Mermaid und PlantUML sind die zwei dominanten Diagram-as-Code-Formate im Solution-Architektur-Bereich; beide müssen unterstützt werden.

## Kontext

Der Editor ist keine Whiteboard-Canvas (das ist ADR-007 / React Flow). Er ist ein **Rich-Text-Editor** mit Code-Block-Rendering, vergleichbar mit Notion oder Confluence. Die Diagramme werden aus Text generiert — kein Drag & Drop.

## Typ-spezifische Felder

### Unterstützte Formate

**Markdown** (CommonMark + GFM):
- Überschriften H1–H4, Listen, Tabellen, Links, Code inline, Fettschrift, Kursiv

**Mermaid**:
- Trigger: Codeblock mit Sprache `mermaid`
- Rendering: client-seitig via mermaid.js (bereits im Bundle wenn ADR-007 React Flow verwendet)
- Unterstützte Typen: flowchart, sequenceDiagram, classDiagram, C4Context, erDiagram, gantt u.a.

**PlantUML**:
- Trigger: Codeblock mit Sprache `plantuml`
- Rendering:
  - Primär: HTTP-Request an konfigurierten PlantUML-Server (`/api/admin/config: plantumlServerUrl`)
  - Fallback: WASM-basiertes Rendering (plantuml-wasm, kein Server nötig)
  - Falls beides nicht verfügbar: Code als Fallback-Anzeige, Warning-Icon

### Editor-Verhalten

- **Toggle**: Jeder Code-Block kann zwischen Edit-Modus (Code) und Preview-Modus (Rendering) umgeschaltet werden
- **Inline-Preview**: Rendering erscheint direkt unter dem Code-Block in Split-View oder per Tab
- **Zoom**: Gerenderte SVGs sind zoombar (SVG-native Zoom)
- **Export**: SVG kann per Rechtsklick → „Bild speichern" heruntergeladen werden

### Speicherformat

`content` wird als Markdown-String gespeichert (inkl. Codeblöcke). Maximale Länge: 100.000 Zeichen. Kein pre-rendering beim Speichern.

## Akzeptanzkriterien

**AC1** (Mermaid gerendert):
- Gegeben: content enthält:
  ````
  ```mermaid
  graph LR; A-->B; B-->C;
  ```
  ````
- Wenn: Michael öffnet die Arc42-Antwort
- Dann: Ein SVG-Diagramm (A→B→C) ist im Editor sichtbar; kein Roh-Code

**AC2** (PlantUML via Server):
- Gegeben: `plantumlServerUrl` konfiguriert; content mit PlantUML-Block
- Wenn: Editor geöffnet
- Dann: SVG vom Server geladen und angezeigt

**AC3** (PlantUML Fallback – kein Server):
- Gegeben: kein PlantUML-Server konfiguriert und WASM nicht geladen
- Wenn: Editor geöffnet
- Dann: Roh-Code angezeigt; Warning-Icon; Meldung „PlantUML nicht verfügbar"

**AC4** (Edit-Toggle):
- Wenn: Michael klickt auf Mermaid-Diagramm → „Bearbeiten"
- Dann: Code-Editor öffnet sich; Änderungen live nachgerendert

**AC5** (Speichern als Markdown):
- Wenn: Michael speichert
- Dann: `content`-Feld enthält Markdown-String mit unveränderten Codeblöcken; kein SVG in DB

**AC6** (Zeichenlimit):
- Wenn: content > 100.000 Zeichen
- Dann: Fehlermeldung; Speichern verhindert

**AC7** (Web Portal rendering):
- Wenn: CIO öffnet Arc42-Dokumentation im Web Portal
- Dann: Mermaid und PlantUML werden gerendert (read-only); kein Editor

## Abhängigkeiten

- **Voraussetzungen**: REQ-067 (Collections); REQ-069 (Arc42-Entity anlegen)
- **Konfiguration**: `plantumlServerUrl` als neue optionale Instanzkonfiguration (Systemeinstellung)

## Realisierungs-Hinweise

- Editor-Bibliothek: TipTap oder ProseMirror (kompatibel mit React); eigene Mermaid/PlantUML-Node-Extension
- mermaid.js ist lizenzkompatibel (MIT); plantuml-wasm ist GPL → Server-Variante bevorzugen oder WASM nur lokal in Electron (Client App)
- SVG-Rendering: immer sanitized (XSS-Prevention auf SVG-Content)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | requirements-engineer | Initial draft |
