# US-053: SavedView anlegen und als Default markieren

**ID**: US-053
**Story Points**: 3
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Lead Enterprise Architekt möchte ich für einen Katalog eine benannte Ansicht (View) anlegen, die eine bestimmte Spaltenreihenfolge, aktive Filter und Join-Modi bündelt – damit Besucher beim Öffnen des Katalogs sofort die für sie vorkonfigurierte Sicht sehen, ohne manuell einstellen zu müssen.

## Bezug

**Use Case**: [UC-06: Architektur-Katalog anlegen, konfigurieren und verwenden](../use-cases/UC-06-katalog-anlegen-und-verwenden.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-048: SavedView anlegen und beim Öffnen anwenden](../req/REQ-048-saved-view.md)

## Akzeptanzkriterien

**AC1** (SavedView anlegen, Happy Path):
- Gegeben: Katalog „Application Inventory" mit Spalten [name, status, vendor], SavedFilter „Nur aktive Systeme", Join „Schnittstellen"
- Wenn: Kurt legt View „Kompaktansicht" an mit columnOrder=[name, status], activeFilterIds=[filter-aktive-systeme], isDefault=true
- Dann: View gespeichert; beim nächsten Öffnen des Katalogs erscheint sofort die Kompaktansicht

**AC2** (View-Auswahl):
- Gegeben: Katalog hat 2 SavedViews: „Kompaktansicht" (default) und „Vollständige Ansicht"
- Wenn: Franz öffnet den Katalog
- Dann: „Kompaktansicht" ist automatisch aktiv; Franz kann über Dropdown-Menü zur „Vollständigen Ansicht" wechseln

**AC3** (Default-Wechsel):
- Gegeben: „Kompaktansicht" ist isDefault=true
- Wenn: Kurt markiert „Vollständige Ansicht" als Default
- Dann: „Vollständige Ansicht" isDefault=true; „Kompaktansicht" automatisch isDefault=false

**AC4** (JoinMode-Override in View):
- Wenn: Kurt legt View „Detailansicht" an mit joinModeOverrides=[{joinId: join-1, joinMode: rows}]
- Dann: Beim Aktivieren der „Detailansicht" wechselt Join „Schnittstellen" in rows-Modus

**AC5** (View ohne Default):
- Gegeben: Kein isDefault gesetzt
- Wenn: Max öffnet den Katalog
- Dann: Alle konfigurierten Spalten sichtbar; kein Filter vorausgewählt; Join-Modi wie in Konfiguration

## Technische Hinweise

- Betroffene Komponenten: Katalog-Konfigurationsbereich → „Views"-Tab, Backend `POST /api/v1/catalogs/{id}/views`
- UX: View-Dropdown in der Katalog-Ansicht (rechts oben); beim Anlegen: Modal mit Name, Spaltenauswahl, Filter-Referenzen, isDefault
- Abhängigkeit: US-047 (Spalten), US-052 (SavedFilter); US-050 (JoinMode-Override)

## Definition of Done

- [ ] Akzeptanzkriterien AC1–AC5 erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests: View anlegen, Default beim Öffnen angewendet, Default-Wechsel (alter Default zurückgesetzt), JoinMode-Override, kein Default
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen
