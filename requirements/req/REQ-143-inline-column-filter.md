---
id: REQ-143
title: Inline column filter in catalog table (AND-combined)
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-29
last_updated: 2026-06-29
author: requirements-engineer
references:
  use_cases:
    - UC-06
  business_objects:
    - catalog
  business_rules: []
  stakeholders:
    - SH-01
    - SH-02
    - SH-03
    - SH-04
    - SH-06
    - SH-07
  concept: []
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-143: Inline column filter in catalog table (AND-combined)

## Aussage

Das System MUSS in der Katalog-Tabellenansicht direkt unterhalb der Spalten-Header eine Filtereingabe-Zeile anbieten. Jede Spalte MUSS ein eigenes Eingabefeld besitzen, das einen Schnellfilter auf dem jeweiligen Attribut ermöglicht. Alle gesetzten Inline-Filter MÜSSEN immer mit logischem AND kombiniert werden. Inline-Filter sind Laufzeit-Filter (ad-hoc); sie verändern die gespeicherte Katalog-Konfiguration nicht und werden NICHT automatisch als SavedFilter persistiert. Für komplexe Abfragen mit OR-Logik steht der separate "+ Filter"-Dialog zur Verfügung (REQ-047).

## Begründung

Katalog-Besucher brauchen einen schnellen Weg, um Ergebnisse auf einen Blick einzuschränken, ohne einen vollständigen Filterausdruck aufzubauen (REQ-047). Der Inline-Filter ist der UX-Mechanismus für UC-06/A1 Schritt 6 ("Franz setzt einen ad-hoc-Filter, z.B. `layer = 'application'`"). Die AND-Kombination ist intuitiv und ausreichend für die häufigsten Anwendungsfälle; komplexere OR-Logik ist über den "+ Filter"-Dialog erreichbar.

## Kontext

Der Inline-Filter ergänzt den SavedFilter-Mechanismus (REQ-047), ersetzt ihn aber nicht:

| Mechanismus | Operator | Persistierung | Einstiegspunkt |
|---|---|---|---|
| Inline-Spaltenfilter (dieses REQ) | einfacher Wert-Vergleich (contains / eq) | nein | Eingabefeld unter Spalten-Header |
| SavedFilter (REQ-047) | alle 12 Operatoren, AND/OR | ja (als benannter Filter) | „+ Filter"-Dialog |

Inline-Filter und SavedFilter sind kombinierbar: beide werden AND-kombiniert auf die Live-Abfrage angewendet.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben (Inline-Filter setzen)**:

| Feld | Typ | Beschreibung |
|---|---|---|
| columnKey | string | Attributname der Spalte (entspricht `attributePath` in REQ-047) |
| value | string | Frei eingegebener Wert; der Operator wird automatisch gewählt: `contains` für Textspalten, `eq` für Enum-Spalten (Status, Layer) |

**Verarbeitung**:

1. Bei jeder Eingabe-Änderung wird die Tabelle neu abgefragt (Debounce: 300 ms)
2. Alle nicht-leeren Inline-Filter werden als AND-Ausdrücke an `GET /api/v1/catalogs/{id}/query` übergeben (vgl. REQ-046), kombiniert mit aktiven SavedFilters
3. Inline-Filter werden im Browser-State gehalten; kein API-Aufruf zum Speichern
4. Das Backend behandelt Inline-Filter identisch zu ad-hoc-Filterausdrücken in REQ-047

**Ausgaben**:

- Tabelle aktualisiert sich live; Anzahl sichtbarer Einträge in der Statusleiste
- Optional: Hinweis „N column filters active" wenn mind. 1 Inline-Filter gesetzt ist

## Akzeptanzkriterien

**AC1** (Inline-Filter setzt Ergebnis):
- Gegeben: Katalog „Application Inventory" mit 47 ApplicationComponent-Einträgen
- Wenn: Nutzer tippt „Catalog" in das Inline-Filter-Feld der Spalte „Name"
- Dann: Tabelle zeigt nur Entitäten deren Name „Catalog" enthält (contains); Statusleiste aktualisiert Anzahl

**AC2** (AND-Kombination mehrerer Inline-Filter):
- Wenn: Nutzer setzt Inline-Filter Name=„Service" UND Layer=„Application"
- Dann: Nur Entitäten, die BEIDE Bedingungen erfüllen, erscheinen in der Tabelle

**AC3** (Kombination Inline-Filter + SavedFilter):
- Gegeben: SavedFilter „Active systems only" ist aktiv
- Wenn: Zusätzlich Inline-Filter Layer=„Application" gesetzt
- Dann: Ergebnis = active AND layer=Application (alle Filter AND-kombiniert)

**AC4** (Inline-Filter nicht persistent):
- Wenn: Nutzer setzt Inline-Filter, verlässt den Katalog und öffnet ihn erneut
- Dann: Inline-Filter sind geleert; SavedFilter bleiben aktiv (da persistiert)

**AC5** (Kein API-Call zum Speichern):
- Wenn: Inline-Filter gesetzt wird
- Dann: Kein `POST /api/v1/catalogs/{id}/filters` — nur GET-Abfrage mit Inline-Parameter

**AC6** (OR-Hinweis):
- Gegeben: Nutzer möchte Name=„Gateway" OR Name=„Service" filtern
- Dann: Inline-Filter unterstützt kein OR; Nutzer wird durch Tooltip/Hinweis auf „+ Filter"-Dialog verwiesen

## Abhängigkeiten

- Blockiert durch: REQ-043 (Catalog), REQ-046 (Abfrage-Endpoint)
- Ergänzt: REQ-047 (SavedFilter / complex filter dialog)
- Zusammenhang: UC-06/A1 Schritt 6 (ad-hoc filter setzen)

## Realisierungs-Hinweise

- Inline-Filter werden als zusätzliche Query-Parameter an `GET /api/v1/catalogs/{id}/query` übergeben, z.B. `?inlineFilters[name]=Catalog&inlineFilters[layer]=Application`
- Backend: inlineFilters werden vor der Abfrage mit SavedFilter-Ausdrücken AND-verknüpft
- Frontend: Debounce 300 ms, um unnötige Requests zu vermeiden
- Enum-Spalten (Status, Layer): Dropdown-Schnellauswahl statt Freitext-Input

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-29 | Requirements Engineer | Initial draft; AND-Inline-Filter, Abgrenzung zu REQ-047 (OR/SavedFilter) |
