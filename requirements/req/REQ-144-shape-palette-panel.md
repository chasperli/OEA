---
id: REQ-144
title: Collapsible Shape Palette Panel in Diagram Editor
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-29
last_updated: 2026-06-29
author: requirements-engineer
references:
  use_cases:
    - UC-05
    - UC-12
  business_objects:
    - diagram
    - viewpoint
  business_rules: []
  stakeholders:
    - SH-01
    - SH-03
    - SH-04
    - SH-07
  concept: []
  adrs:
    - ADR-007
    - ADR-008
    - ADR-020
supersedes: []
superseded_by: []
---

# REQ-144: Collapsible Shape Palette Panel in Diagram Editor

## Aussage

Das System MUSS im Diagramm-Editor eine Shape-Palette anbieten, die als eigenständiges Panel zwischen dem Explorer und dem Diagram-Canvas positioniert ist. Das Panel MUSS per Toggle-Button (◀ / ▶) vollständig ein- und ausgeblendet werden können. Die Palette MUSS die verfügbaren Metamodell-Entitäten als ziehbare Shape-Vorlagen anzeigen, gefiltert nach dem aktuell aktiven Viewpoint (REQ-047 Viewpoint-Definition). Entitätstypen, die für den aktiven Viewpoint nicht erlaubt sind, MÜSSEN ausgegraut oder ausgeblendet sein.

## Begründung

Architekten modellieren Diagramme durch Drag-and-Drop von Shapes aus einer Palette. Die Filterung nach Viewpoint stellt sicher, dass nur semantisch erlaubte Elemente in ein Diagramm eingefügt werden können — ein Kernprinzip von ArchiMate-Viewpoints (vgl. Konzept §8 Viewpoint-Mechanismus). Das Panel ist kollabierbar, um auf kleinen Bildschirmen Platz zu sparen.

## Kontext

Die Shape-Palette ist das primäre Eingabewerkzeug für die manuelle Diagrammerstellung:

| Panel | Position | Inhalt |
|---|---|---|
| Explorer | ganz links | Navigation im Modell-Tree |
| Shape-Palette (dieses REQ) | zwischen Explorer und Canvas | ziehbare Shape-Vorlagen, nach Viewpoint gefiltert |
| Canvas | Mitte | Diagramm-Zeichenfläche |
| Properties | rechts | Eigenschaften des ausgewählten Elements |

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:

| Feld | Typ | Beschreibung |
|---|---|---|
| activeViewpoint | Viewpoint \| null | aktueller Viewpoint; null = alle Typen erlaubt |
| collapseState | boolean | true = Panel kollabiert (nur Toggle-Button sichtbar) |

**Verarbeitung**:

1. Beim Öffnen des Diagramm-Editors: Palette standardmässig eingeblendet
2. Aktiver Viewpoint → nur erlaubte Metamodell-Typen werden angezeigt
3. Kein Viewpoint → alle konfigurierten Metamodell-Typen anzeigen
4. Toggle-Button (◀/▶) wechselt zwischen expanded und collapsed
5. Collapsed-State: Panel reduziert auf 28px breiten Streifen mit Toggle-Icon
6. Zustand wird pro Nutzer in den Benutzereinstellungen persistiert

**Ausgaben**:

- Palette zeigt Shape-Kacheln je Metamodell-Typ (Abbreviation-Badge + Typname + Mini-Preview)
- Drag-Indikator aktiviert sich sobald der Nutzer eine Kachel anfasst
- Beim Drop auf Canvas: Auslösen des REQ-145 Entity-Lookup-Dialogs

## Akzeptanzkriterien

**AC1** (Palette zeigt nur erlaubte Typen):
- Gegeben: Viewpoint "Application Layer View" erlaubt AC, AS, AI, AF, AP
- Wenn: Diagramm-Editor mit diesem Viewpoint geöffnet wird
- Dann: Palette zeigt nur die 5 erlaubten Typen; Technology-Typen sind ausgegraut/ausgeblendet

**AC2** (Kein Viewpoint = alle Typen):
- Gegeben: Diagramm-Editor ohne aktiven Viewpoint (free-form)
- Dann: Alle konfigurierten Metamodell-Typen erscheinen in der Palette

**AC3** (Kollabieren/Expandieren):
- Wenn: Nutzer klickt auf Toggle-Button (◀)
- Dann: Panel kollabiert auf 28px breiten Streifen; Canvas gewinnt den freigewordenen Platz
- Wenn: Nutzer klickt erneut (▶)
- Dann: Panel expandiert wieder auf Standardbreite

**AC4** (Persistenz des Zustands):
- Wenn: Nutzer kollabiert die Palette und schliesst den Editor
- Dann: Beim nächsten Öffnen ist die Palette weiterhin kollabiert

## Abhängigkeiten

- Blockiert durch: UC-05 (Diagramm-Editor), REQ-040 (Viewpoint-Mechanismus)
- Zusammenhang: REQ-145 (Drag & Drop + Entity-Lookup), REQ-146 (Delete-Verhalten)
- Betrifft: ADR-007 (Canvas-Bibliothek), ADR-020 (Explorer-Navigationsmodell)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-29 | Requirements Engineer | Initial draft |
