---
id: REQ-070
title: Entity-Mention via /@ im WYSIWYG-Editor (Autocomplete + Verlinkung)
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
    - entity
  business_rules:
    - arc42:BR-07
    - arc42:BR-08
  stakeholders:
    - SH-04
  concept: []
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-070: Entity-Mention via /@ im WYSIWYG-Editor (Autocomplete + Verlinkung)

## Aussage

Das System MUSS im Arc42-WYSIWYG-Editor überall — in Markdown-Freitext-Abschnitten und innerhalb von Mermaid- und PlantUML-Codeblöcken — beim Tippen von `/@` ein Autocomplete-Dropdown öffnen, das Entitäten aus dem Architecture-Repository live durchsucht. Nach Auswahl einer Entität MUSS das System den Mention kontextabhängig einfügen: als strukturierten Link `[@Name](entity:ID)` im Freitext, als reinen Textnamen in Codeblöcken. Beim Rendering von Freitext-Mentions MUSS der aktuelle Name der Entität via ID aufgelöst werden.

## Begründung

Arc42-Dokumentation beschreibt Systeme, die im EA-Repository modelliert sind. Ohne `/@`-Verlinkung entstehen doppelt gepflegte Namen: der Architekt schreibt „CRM-System" als Text, das Modell kennt die Entität mit id=1. Bei Umbenennung divergieren Dokumentation und Modell. Die ID-stabile Verlinkung im Freitext stellt sicher, dass Umbenennungen im Repository automatisch in allen Arc42-Dokumenten nachgezogen werden. In Codeblöcken ist dies technisch nicht möglich (Diagrammsprachen kennen kein Link-Konzept), daher greift dort reiner Textname als pragmatische Lösung.

## Kontext

Das `/@`-Muster ist als Einstiegspunkt bewusst von `/` (Slash-Commands) und `@` (klassische User-Mentions in anderen Tools) abgegrenzt — im EA-Kontext ist `/@` die sauberste Tastenkombination ohne Kollision mit Diagrammsyntax (Mermaid und PlantUML nutzen `@` nicht als Sonderzeichen an erster Position einer Eingabe).

## Typ-spezifische Felder

### Autocomplete-Verhalten

| Phase | Verhalten |
|---|---|
| Nutzer tippt `/@` | Dropdown öffnet sich sofort; zeigt Top-10 Entitäten nach Relevanz (zuletzt verwendet / Alphabetisch) |
| Nutzer tippt weiter (z.B. `/@CRM`) | Live-Suche gegen `GET /api/v1/entities/search?q=CRM&limit=10`; Ergebnis wird gefiltert |
| Nutzer wählt Entität | Mention wird eingefügt; `/@CRM` wird durch Mention ersetzt; Dropdown schliesst sich |
| Nutzer drückt ESC | Dropdown schliesst sich; `/@`-Text bleibt als Rohtext |

### Suchanfrage und Response

```
GET /api/v1/entities/search?q={term}&limit=10
```

Response:
```json
[
  { "id": 1, "name": "CRM-System", "entityTypeId": "application-component", "entityTypeName": "ApplicationComponent" },
  { "id": 5, "name": "ERP→CRM Kundenstamm-Sync", "entityTypeId": "data-flow", "entityTypeName": "DataFlow" }
]
```

- Suche: Case-insensitive, Prefix-Match auf `name`; optional Fuzzy-Match
- Scope: alle ArchitectureEntities der aktuellen Instanz (Elemente und Connections)
- Sortierung: Exact-Match vor Prefix-Match vor Fuzzy-Match; bei Gleichstand alphabetisch

### Dropdown-Darstellung

Jedes Ergebnis zeigt:
- Entitätsname (fett)
- EntityType-Name (grau, klein) — z.B. „ApplicationComponent"
- Entitäts-ID (rechts, monospace) — z.B. „#1"

### Einfüge-Format je Kontext

**Markdown-Freitext** (ausserhalb von Codeblöcken):

```markdown
[@CRM-System](entity:1)
```

Rendering: Inline-Badge mit aktuellem Namen (ID-aufgelöst), klickbar → öffnet Entity-Detail. Wenn Entität nicht mehr existiert: `[gelöscht](entity:1)` in roter Schrift.

**Mermaid-Codeblock** (innerhalb von ` ```mermaid `):

```
CRM-System
```

Reiner Textname — kein Link-Markup, da Mermaid-Syntax keine Hyperlinks in Node-Labels unterstützt.

**PlantUML-Codeblock** (innerhalb von ` ```plantuml `):

```
CRM-System
```

Reiner Textname — analog zu Mermaid.

### Rendering von `[@Name](entity:ID)` im Freitext

Beim Lesen des `content`-Felds MUSS das Backend (oder das Frontend via API-Call) den aktuellen `name` der Entität mit der gegebenen ID nachladen:
- Entität existiert + Name unverändert: normales Badge mit aktuellem Namen
- Entität existiert + umbenannt: Badge zeigt neuen Namen (transparent für den Leser)
- Entität gelöscht: Badge zeigt `[gelöscht]` + graue Schrift + kein Link

## Akzeptanzkriterien

**AC1** (Dropdown öffnet sich im Freitext):
- Wenn: Michael tippt `/@` im Markdown-Freitext des Editors
- Dann: Autocomplete-Dropdown erscheint mit Top-10 Entitäten; kein Seitenaufruf nötig

**AC2** (Live-Suche filtert Ergebnisse):
- Wenn: Michael tippt `/@CRM`
- Dann: Dropdown zeigt nur Entitäten, deren Name „CRM" enthält (case-insensitive); Ergebnisse aktualisieren sich mit jedem weiteren Zeichen

**AC3** (Mention im Freitext — ID-stable):
- Wenn: Michael wählt „CRM-System" (id=1) im Dropdown
- Dann: `[@CRM-System](entity:1)` wird eingefügt; Rendering zeigt klickbares Badge „CRM-System"

**AC4** (Umbenennung spiegelt sich in Rendering wider):
- Gegeben: Entität id=1 wird von „CRM-System" auf „Salesforce CRM" umbenannt
- Wenn: Michael öffnet die Arc42-Antwort erneut
- Dann: Badge zeigt „Salesforce CRM"; Rohtext im `content` bleibt `[@CRM-System](entity:1)` (unveränderter Rohwert)

**AC5** (Gelöschte Entität):
- Gegeben: Entität id=1 wurde gelöscht
- Wenn: Arc42-Antwort mit `[@CRM-System](entity:1)` geöffnet
- Dann: Badge zeigt `[gelöscht]` in roter Schrift; kein Link; keine Exception

**AC6** (Dropdown im Mermaid-Block):
- Wenn: Michael tippt `/@CRM` innerhalb eines ` ```mermaid `-Codeblocks (im Edit-Modus)
- Dann: Autocomplete-Dropdown erscheint; nach Auswahl wird nur der Textname `CRM-System` eingefügt (kein Link-Markup)

**AC7** (Dropdown im PlantUML-Block):
- Wie AC6, für PlantUML-Codeblock

**AC8** (ESC schliesst Dropdown ohne Änderung):
- Wenn: Michael tippt `/@CR` und drückt ESC
- Dann: Dropdown schliesst; `/@CR` bleibt als Rohtext

**AC9** (Web Portal: Mentions gerendert, kein Edit):
- Wenn: CIO öffnet Arc42-Dokumentation im Web Portal
- Dann: Mentions als Badges gerendert (mit aktuellem Namen); kein Dropdown-Trigger bei Klick auf Badge im Lese-Modus (Badge öffnet Entity-Detail)

## Abhängigkeiten

- **Voraussetzungen**: REQ-068 (WYSIWYG-Editor existiert); REQ-069 (Arc42-Tab)
- **Neuer Backend-Endpoint**: `GET /api/v1/entities/search?q=&limit=` (auch für andere Features nutzbar, z.B. UC-05 Entity-Auswahl in Deltas)
- **Rendering-Auflösung**: Entweder server-seitig (API liefert bereits aufgelöste Namen) oder client-seitig (Frontend löst via ID-Batch-Request auf)

## Realisierungs-Hinweise

- Editor-Extension: TipTap-MentionExtension (kompatibel); Trigger: `/@`; eigene SuggestionList-Komponente
- Entitäts-Suche-Debounce: 150 ms nach letztem Tastendruck; max. 10 Ergebnisse
- In Codeblöcken: Editor-Erweiterung muss erkennen, ob Cursor innerhalb eines Codeblocks ist → dann Text-only Insertion statt Link-Node; TipTap Code-Block-Node kennt diese Information
- Batch-ID-Auflösung beim Öffnen: `POST /api/v1/entities/batch?ids=[1,5,42]` — einzelne Calls pro Mention wären zu viele Requests
- XSS: Entity-Namen werden HTML-escaped vor dem Einfügen ins DOM

## Realisierung

- ADR(s): –
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | requirements-engineer | Initial draft |
