---
id: REQ-138
title: Browser-Panel zeigt Solutions als primäre Navigationsebene
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-28
last_updated: 2026-06-28
author: requirements-engineer
references:
  use_cases:
    - UC-13
  business_objects:
    - solution
    - plateau
  stakeholders:
    - SH-03
    - SH-04
  adrs:
    - ADR-020
supersedes: []
superseded_by: []
---

# REQ-138: Browser-Panel zeigt Solutions als primäre Navigationsebene

## Aussage

Der Browser-Panel im Native Client MUSS Solutions als primäre Navigationsknoten auf der obersten Ebene anzeigen. Als erster Knoten MUSS ein virtueller „Aktueller Stand"-Knoten erscheinen, der die aggregierten Inhalte aller realisierten Lösungen darstellt. Darunter folgen plateau-gebundene Solutions, gruppiert nach Plateau.

## Begründung

Solution Architekten arbeiten primär im Kontext einer Solution. Die Navigation soll diesen Arbeitskontext direkt widerspiegeln. Der „Aktueller Stand"-Knoten ist der wichtigste Einstiegspunkt für Analysen und Reviews.

## Typ-spezifische Felder

**Eingaben**:
- Alle Solutions mit `status ∈ {draft, proposed, approved, in-progress, implemented}` (nicht `archived`)
- Plateau-Informationen (fromPlateauId, toPlateauId) aus dem Solution-Objekt

**Verarbeitung**:
1. „Aktueller Stand"-Knoten immer als erstes Element anzeigen (aggregiert alle `status=implemented`-Solutions und plateau-freie Inhalte)
2. Solutions mit Plateau-Mapping werden unter dem entsprechenden Plateau-Knoten gruppiert
3. Solutions ohne Plateau-Mapping (`fromPlateauId=null`, `toPlateauId=null`) erscheinen NUR im „Aktueller Stand"-Knoten — nicht als eigener Top-Level-Knoten (→ REQ-140)
4. Innerhalb eines Plateaus: Solutions alphabetisch sortiert
5. Solutions mit `status=archived` werden nicht angezeigt

**Ausgaben**:
- Hierarchische Tree-Ansicht: [Aktueller Stand] → [Plateau A] → [Solution 1] → [Grundstruktur]

## Akzeptanzkriterien

**AC1** — Aktueller-Stand-Knoten:
- Gegeben: Mindestens eine implementierte Solution existiert
- Wenn: Browser-Panel geöffnet wird
- Dann: „Aktueller Stand" erscheint als erster Knoten

**AC2** — Plateau-Gruppierung:
- Gegeben: Solution mit `fromPlateauId=P1, toPlateauId=P2`
- Wenn: Browser-Panel geladen wird
- Dann: Solution erscheint unter Plateau-Knoten (z.B. „IST → SOLL 2027")

**AC3** — Keine archivierten Solutions:
- Gegeben: Solution mit `status=archived`
- Wenn: Browser-Panel angezeigt wird
- Dann: Archivierte Solution ist nicht sichtbar

## Verifikationsmethode

- [ ] Methode: test (automatisiert) + demonstration
- [ ] Test-Setup: Playwright; Solutions mit verschiedenen Status und Plateau-Mappings
- [ ] Bestanden-Kriterium: AC1–AC3 alle grün

## Abhängigkeiten

- **Voraussetzungen**: ADR-020 (Explorer-Navigationsmodell)
- **Folgewirkungen**: REQ-139 (Grundstruktur), REQ-140 (plateau-freie Solutions)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | requirements-engineer | Initial draft; abgeleitet aus ADR-020 und Mockup-Feedback |
