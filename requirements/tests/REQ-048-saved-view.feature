# Ableitung aus: requirements/req/req-048-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @should @UC-06
Feature: REQ-048 – SavedView anlegen und beim Öffnen anwenden

  Das System MUSS dem Katalog-Manager ermöglichen, benannte
  `SavedView`-Einträge innerhalb eines
  [Catalogs](../../business-objects/catalog.md) anzulegen. Eine
  SavedView bündelt: `columnOrder` (geordnete Liste sichtbarer
  Attributnamen, BR-05), `activeFilterIds` (IDs von SavedFilters dieses
  Catalogs) und `joinModeOverrides` (optionale Modus-Overrides pro
  JoinDefinition).

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – SavedView anlegen, Happy Path – Catalog hat columns [name, status, vendor] und SavedFilter „Nur aktive S...
    Given Catalog hat columns [name, status, vendor] und SavedFilter „Nur aktive Systeme"
    When  `POST /api/v1/catalogs/{id}/views` mit `{ name: "Kompaktansicht", columnOrder: ["name", "status"], activeFilterIds: ["filter-1"], isDefault: true }`
    Then  HTTP 201; SavedView gespeichert; isDefault=true

  @AC2
  Scenario: AC2 – BR-06 – Default-Wechsel – SavedView A mit isDefault=true existiert
    Given SavedView A mit isDefault=true existiert
    When  SavedView B mit isDefault=true angelegt
    Then  HTTP 201; SavedView B isDefault=true; SavedView A isDefault=false (automatisch)

  @AC3
  Scenario: AC3 – BR-05 – ungültiger columnOrder-Eintrag – Catalog hat keine Spalte „unbekannt"
    Given Catalog hat keine Spalte „unbekannt"
    When  `columnOrder: ["name", "unbekannt"]`
    Then  HTTP 422 „Das Attribut ‹unbekannt› ist nicht in der Spalten-Konfiguration des Catalogs"

  @AC4
  Scenario: AC4 – Default-View beim Öffnen anwenden – Catalog hat SavedView „Kompaktansicht" mit isDefault=true; columnOrder=[...
    Given Catalog hat SavedView „Kompaktansicht" mit isDefault=true; columnOrder=[name, status]; activeFilterIds=[filter-aktive-systeme]
    When  Besucher öffnet den Catalog
    Then  Tabelle zeigt nur Spalten name und status; Filter „Nur aktive Systeme" ist aktiv; `totalCount` entsprechend gefiltert

  @AC5
  Scenario: AC5 – Kein Default – Catalog hat keine SavedView mit isDefault=true
    Given Catalog hat keine SavedView mit isDefault=true
    When  Besucher öffnet den Catalog
    Then  Alle konfigurierten Spalten sichtbar; kein Filter vorausgewählt

  @AC6
  Scenario: AC6 – SavedView löschen – `DELETE /api/v1/catalogs/{id}/views/{viewId}` für die Default-View
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  `DELETE /api/v1/catalogs/{id}/views/{viewId}` für die Default-View
    Then  HTTP 200; View gelöscht; kein anderer Default wird automatisch gesetzt; nächster Öffne-Vorgang nutzt kein Default
