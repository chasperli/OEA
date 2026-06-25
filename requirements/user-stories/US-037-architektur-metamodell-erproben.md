# US-037: Neues Metamodell in einer Architektur erproben

**ID**: US-037
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Lead Enterprise Architekt möchte ich für eine spezifische Architektur ein eigenes, editierbares Metamodell-Erweiterungsobjekt anlegen können, damit ich neue Entitätstypen experimentell erproben kann, ohne das gesperrte Instanz-Standardmetamodell zu verändern.

## Bezug

**Use Case**: [UC-04: Metamodell gemeinsam konfigurieren](../use-cases/UC-04-metamodell-konfigurieren.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-037: Architektur-spezifische Metamodell-Erweiterung](../req/REQ-037-architektur-metamodell-erweiterung.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: Instanz-Metamodell mit `editMode=import-only`; Architecture „Cloud-Experiment" existiert
- Wenn: Kurt für „Cloud-Experiment" eine Erweiterungs-Konfiguration mit `editMode=gui-and-import` anlegt und `CloudService` definiert
- Dann: ist `CloudService` nur in „Cloud-Experiment" verfügbar; das Instanz-Metamodell bleibt unberührt und gesperrt

**AC2**:
- Gegeben: Architecture „Cloud-Experiment" mit Erweiterung
- Wenn: ein Architekt in „Cloud-Experiment" eine neue Entität anlegt
- Dann: stehen in der Typ-Auswahl beide Typen-Gruppen zur Verfügung: Standard (aus Instanz) und Architektur-spezifisch (aus „Cloud-Experiment")

**AC3**:
- Gegeben: Kurt versucht, in der Architecture-Erweiterung einen Typ mit dem Namen `ApplicationComponent` (Instanz-Typ) zu definieren
- Dann: erscheint Fehler; kein Eintrag wird angelegt

**AC4**:
- Gegeben: Architecture-Erweiterung mit `editMode=gui-and-import`
- Wenn: Lukas (mit Metamodell-Bearbeiter-Berechtigung) ebenfalls Typen in der Erweiterung anlegt
- Dann: erscheinen diese in der Erweiterung; Audit-Log weist die Änderungen Lukas zu

## Technische Hinweise

- Betroffene Komponenten: Architecture-Verwaltungs-UI, Metamodell-Konfigurationsmodul (neuer `scope=architecture`-Pfad), Entitäts-Anlage-Dialog (effektives Metamodell)
- API-Endpunkte:
  - `POST /architectures/{id}/metamodel` – Erweiterungs-Konfiguration anlegen
  - `GET /architectures/{id}/effective-metamodel` – Union aus Instanz + Architecture
  - `POST /architectures/{id}/metamodel/import` – Import für Architecture-Scope
- Datenbank: `scope`, `parent_id`, `architecture_id`-Spalten in `metamodel_configurations`-Tabelle

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Tests: Erweiterung anlegen; effektives Metamodell (Union); Namenskollision; `editMode` unabhängig von Instanz; mehrere Architekten
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-032 (EntityType-Formular – wird für Architecture-Scope wiederverwendet); US-035 (Sperrmodus – Motivation für diesen Use Case); Architecture-Verwaltungs-UC (Architecture-Objekte müssen existieren)
- Blockiert: künftige US für Entitäts-Anlage mit Architecture-Scope (müssen effektives Metamodell verwenden)

## Notizen

5 SP wegen: neuem DB-Schema-Aspekt (`scope`-Spalte), Effektives-Metamodell-API (Union + Cache-Invalidierung), UI-Erweiterung (gruppierte Typ-Auswahl mit Herkunfts-Badge). Die Architecture-Verwaltung selbst (Anlegen/Bearbeiten von Architecture-Objekten) ist ein eigener UC und US.
