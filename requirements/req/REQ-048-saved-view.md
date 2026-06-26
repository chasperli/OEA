---
id: REQ-048
title: SavedView anlegen und beim Öffnen anwenden
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  use_cases:
    - UC-06
  business_objects:
    - catalog
  business_rules:
    - catalog:BR-05
    - catalog:BR-06
  stakeholders:
    - SH-03
    - SH-07
  concept: []
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-048: SavedView anlegen und beim Öffnen anwenden

## Aussage

Das System MUSS dem Katalog-Manager ermöglichen, benannte `SavedView`-Einträge innerhalb eines [Catalogs](../../business-objects/catalog.md) anzulegen. Eine SavedView bündelt: `columnOrder` (geordnete Liste sichtbarer Attributnamen, BR-05), `activeFilterIds` (IDs von SavedFilters dieses Catalogs) und `joinModeOverrides` (optionale Modus-Overrides pro JoinDefinition). Maximal eine SavedView pro Catalog DARF `isDefault=true` gesetzt haben (BR-06). Beim Öffnen eines Catalogs MUSS die Default-SavedView – sofern vorhanden – automatisch angewendet werden. Wird eine neue SavedView als Default markiert, MUSS eine bestehende Default-SavedView automatisch auf `isDefault=false` gesetzt werden.

## Begründung

Ohne SavedViews muss jeder Besucher bei jedem Öffnen des Catalogs die gewünschte Spalten- und Filter-Kombination manuell rekonfigurieren. SavedViews erlauben dem Katalog-Manager, mehrere kontextbezogene Sichten vorzukonfigurieren (z.B. eine für den täglichen Check, eine für den Compliance-Export) und die wichtigste als Default zu markieren.

## Kontext

Eine SavedView verändert nicht die gespeicherte `columns`-Konfiguration des Catalogs; sie ist ein Overlay, das beim Öffnen angewendet wird. Die `columnOrder` in der SavedView überschreibt die `sortOrder` der `ColumnConfig`; sichtbar sind nur die in `columnOrder` genannten Spalten. Spalten, die in der `columns`-Konfiguration des Catalogs nicht existieren, sind in `columnOrder` nicht erlaubt (BR-05).

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:

| Feld | Typ | Optional | Beschreibung |
|---|---|---|---|
| name | string | Pflicht | Lesbarer Name, eindeutig innerhalb des Catalogs |
| description | string | optional | |
| columnOrder | string[] | optional | Geordnete Liste von attributeNames; nur aus `catalog.columns`; fehlende Spalten = ausgeblendet |
| activeFilterIds | string[] | optional | IDs von SavedFilters dieses Catalogs |
| joinModeOverrides | JoinModeOverride[] | optional | Pro JoinDefinitionId: `rows` oder `aggregate` |
| isDefault | boolean | Pflicht | true = wird beim Öffnen des Catalogs automatisch aktiviert |

**Verarbeitung**:

1. `columnOrder`-Einträge gegen `catalog.columns.attributeName`-Liste validieren (BR-05); 422 bei unbekannten Attributnamen
2. `activeFilterIds` gegen `catalog.savedFilters`-IDs validieren; 422 bei unbekannten IDs
3. Wenn `isDefault=true`: alle anderen SavedViews dieses Catalogs auf `isDefault=false` setzen (BR-06)
4. `joinModeOverrides[].joinDefinitionId` gegen `catalog.joinDefinitions` validieren; 422 bei unbekannten IDs
5. SavedView im Catalog persistieren

**Ausgaben**:

- HTTP 201 Created mit aktualisiertem Catalog (inkl. neuer SavedView mit id)
- HTTP 200 OK beim Aktualisieren (PUT)
- HTTP 422 Unprocessable Entity bei Validierungsfehlern

## Akzeptanzkriterien

**AC1** (SavedView anlegen, Happy Path):
- Gegeben: Catalog hat columns [name, status, vendor] und SavedFilter „Nur aktive Systeme"
- Wenn: `POST /api/v1/catalogs/{id}/views` mit `{ name: "Kompaktansicht", columnOrder: ["name", "status"], activeFilterIds: ["filter-1"], isDefault: true }`
- Dann: HTTP 201; SavedView gespeichert; isDefault=true

**AC2** (BR-06 – Default-Wechsel):
- Gegeben: SavedView A mit isDefault=true existiert
- Wenn: SavedView B mit isDefault=true angelegt
- Dann: HTTP 201; SavedView B isDefault=true; SavedView A isDefault=false (automatisch)

**AC3** (BR-05 – ungültiger columnOrder-Eintrag):
- Gegeben: Catalog hat keine Spalte „unbekannt"
- Wenn: `columnOrder: ["name", "unbekannt"]`
- Dann: HTTP 422 „Das Attribut ‹unbekannt› ist nicht in der Spalten-Konfiguration des Catalogs"

**AC4** (Default-View beim Öffnen anwenden):
- Gegeben: Catalog hat SavedView „Kompaktansicht" mit isDefault=true; columnOrder=[name, status]; activeFilterIds=[filter-aktive-systeme]
- Wenn: Besucher öffnet den Catalog
- Dann: Tabelle zeigt nur Spalten name und status; Filter „Nur aktive Systeme" ist aktiv; `totalCount` entsprechend gefiltert

**AC5** (Kein Default):
- Gegeben: Catalog hat keine SavedView mit isDefault=true
- Wenn: Besucher öffnet den Catalog
- Dann: Alle konfigurierten Spalten sichtbar; kein Filter vorausgewählt

**AC6** (SavedView löschen):
- Wenn: `DELETE /api/v1/catalogs/{id}/views/{viewId}` für die Default-View
- Dann: HTTP 200; View gelöscht; kein anderer Default wird automatisch gesetzt; nächster Öffne-Vorgang nutzt kein Default

## Abhängigkeiten

- Blockiert durch: REQ-043, REQ-044, REQ-047 (SavedViews referenzieren Spalten und Filter)
- Ermöglicht: bessere Nutzbarkeit des Catalogs für alle Besucher

## Realisierungs-Hinweise

- Endpoints: `POST /api/v1/catalogs/{id}/views`, `PUT /api/v1/catalogs/{id}/views/{viewId}`, `DELETE /api/v1/catalogs/{id}/views/{viewId}`
- Default-View-Propagation: beim Setzen von isDefault=true auf einer View alle anderen Views transaktional auf false setzen (kein Partial-Update-Problem)
- Beim Öffnen des Catalogs: Client fragt zuerst die Catalog-Konfiguration ab und findet die Default-View; dann verwendet er deren Parameter für den ersten Query-Aufruf (REQ-046)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Requirements Engineer | Initial draft; BR-05/BR-06, Default-View-Mechanismus |
