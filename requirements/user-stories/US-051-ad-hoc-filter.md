# US-051: Ad-hoc-Filter in einem Katalog setzen

**ID**: US-051
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Katalog-Besucher möchte ich Filterbedingungen auf Spalten des Katalogs setzen können, die sofort auf die Ergebnisliste wirken – damit ich gezielt die Entitäten finde, die für meine aktuelle Aufgabe relevant sind, ohne die Katalog-Konfiguration zu verändern.

## Bezug

**Use Case**: [UC-06: Architektur-Katalog anlegen, konfigurieren und verwenden](../use-cases/UC-06-katalog-anlegen-und-verwenden.md)
**Persona**: Alle Stakeholder (SH-01 bis SH-07)
**Requirement**: [REQ-047: Filter setzen und als SavedFilter speichern](../req/REQ-047-filter-setzen-und-speichern.md)

## Akzeptanzkriterien

**AC1** (Einfacher Filter, Happy Path):
- Gegeben: Katalog zeigt 10 ApplicationComponents verschiedener Status
- Wenn: Franz setzt Filter `status = "active"`
- Dann: Tabelle zeigt sofort nur die aktiven Applikationen; Zeile für Zeile ohne Seiten-Neuladen aktualisiert; `totalCount` zeigt reduzierte Anzahl

**AC2** (Filter auf Join-Attribut):
- Gegeben: Join „Schnittstellen" mit Zielattribut `protocol`
- Wenn: Lukas setzt Filter `Schnittstellen.protocol = "REST"`
- Dann: Nur Applikationen deren DataFlow-Verbindungen mind. eine REST-Schnittstelle haben; Schnittstellen ohne REST werden in der aggregierten Liste nicht angezeigt

**AC3** (Mehrere Filter, AND-Kombination):
- Wenn: Max setzt Filter `status = "active"` UND `layer = "application"`
- Dann: Nur Entitäten die BEIDEN Bedingungen erfüllen werden gezeigt

**AC4** (Filter entfernen):
- Wenn: Franz entfernt einen gesetzten Filter (X-Button am Filter-Chip)
- Dann: Tabelle zeigt wieder alle Entitäten; Filter ist vollständig entfernt

**AC5** (Unterstützte Operatoren im UI):
- Wenn: Franz öffnet den Filter-Konfigurator für Spalte „name"
- Dann: Mindestens folgende Operatoren stehen zur Verfügung: ist gleich (eq), enthält (contains), beginnt mit (startsWith), ist leer (isNull), ist nicht leer (isNotNull)
- Für numerische / Datum-Attribute zusätzlich: > (gt), < (lt), >= (gte), <= (lte)

## Technische Hinweise

- Betroffene Komponenten: Filter-Leiste über der Tabelle, Backend Query-Parameter (REQ-046)
- UX: Filter-Chips in einer Leiste; „Filter hinzufügen"-Button öffnet Dropdown (Spalte wählen → Operator wählen → Wert eingeben)
- Ad-hoc-Filter werden nicht persistiert; sie leben nur im Browser-State bis die Seite neu geladen wird
- Abhängigkeit: US-049

## Definition of Done

- [ ] Akzeptanzkriterien AC1–AC5 erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests: einfacher Filter, Filter auf Join-Attribut (Punkt-Notation), AND-Kombination, Filter entfernen, Operatoren-Auswahl
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen
