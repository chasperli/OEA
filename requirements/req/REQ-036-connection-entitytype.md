---
id: REQ-036
title: Connection-EntityType im Metamodell
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-25
last_updated: 2026-06-25
author: requirements-engineer
references:
  use_cases:
    - UC-04
  business_objects:
    - metamodel-configuration
  business_rules: []
  stakeholders:
    - SH-03
    - SH-02
    - SH-04
  concept:
    - concept/20-entities/06-kern-entitaetstypen.md
    - concept/40-extensibility/14-erweiterbarkeit.md
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-036: Connection-EntityType im Metamodell

## Aussage

Das System MUSS es ermöglichen, beim Anlegen eines Custom EntityTypes das Flag `isConnection=true` zu setzen; ein Connection-Typ MUSS an jeder seiner Instanzen genau eine `source`- und eine `target`-Referenz erzwingen; `source` und `target` DÜRFEN auf Instanzen beliebiger EntityType-Klassen zeigen – einschliesslich anderer Connection-Instanzen, wodurch T-Beziehungen entstehen; die erlaubten Typen für `source` und `target` KÖNNEN optional eingeschränkt werden.

## Begründung

In Enterprise Architecture müssen Verbindungen zwischen Komponenten oft selbst Attribute tragen (Protokoll, Datenklassifizierung, Bandbreite) und an anderen Verbindungen anknüpfen können. Ein einfaches Relation-Feld am Source-Objekt reicht dafür nicht: die Verbindung ist ein eigenständiges, referenzierbares Objekt. Die T-Beziehung (Connection → Connection) ermöglicht es, Abzweigungen, Aggregationspunkte und Netzwerk-Topologien zu modellieren, ohne separate Hilfsobjekte einzuführen. Dies entspricht Konzepten wie ArchiMate-Junction oder UML-AssociationClass.

## Kontext

Connection-Typen sind vollständige EntityTypes mit allen Features: Properties, eigene ID, Lifecycle, Audit-Log, Constraint-Regeln. Das `isConnection`-Flag fügt lediglich zwei Pflichtfelder hinzu (`source`, `target`) und ermöglicht es, Instanzen visuell als Kanten statt als Knoten darzustellen. Ein Connection-Typ kann eigene Properties haben (z.B. `DataFlow` mit `protocol`, `dataClassification`). Die `allowedSourceTypes`- und `allowedTargetTypes`-Listen schränken bei Bedarf ein, welche Typen als Endpunkte erlaubt sind.

**T-Beziehung (Connection → Connection)**: Wenn `DataFlow` in `allowedSourceTypes` oder `allowedTargetTypes` den Typ `DataFlow` selbst enthält (oder die Listen leer/null sind), kann eine DataFlow-Instanz eine andere DataFlow-Instanz als Source oder Target referenzieren. Dies erzeugt im Graphen eine T-Form: der angebundene DataFlow verzweigt vom Mittelpunkt des referenzierten DataFlows.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben** (beim Anlegen/Bearbeiten einer EntityTypeDefinition via GUI oder Import):

| Feld | Typ | Default | Beschreibung |
|---|---|---|---|
| `isConnection` | boolean | false | Markiert den Typ als Connection-Typ |
| `allowedSourceTypes` | string[] | null | Optional: Liste erlaubter EntityType-Namen für `source`; null = alle erlaubt |
| `allowedTargetTypes` | string[] | null | Optional: Liste erlaubter EntityType-Namen für `target`; null = alle erlaubt |

**Verarbeitung bei der Instanz-Anlage** (wenn eine Entität des Connection-Typs angelegt wird):
- System erzwingt Vorhandensein von `source` (Referenz auf eine bestehende Entität, beliebigen Typs – sofern `allowedSourceTypes` nicht einschränkt)
- System erzwingt Vorhandensein von `target` (analog)
- Validierung: `source` und `target` müssen existierende Entitäten der erlaubten Typen referenzieren
- `source` oder `target` darf eine Connection-Instanz sein → T-Beziehung; keine rekursive Zirkularitätsprüfung in MVP (Zyklen sind zulässig, Darstellung obliegt der View-Layer)
- Eine Connection-Instanz kann zusätzlich eigene Properties haben (wie jeder andere EntityType)

**Fehlerfälle** (bei Instanz-Anlage):
- `source` fehlt → Validierungsfehler "source ist Pflichtfeld für Connection-Typ X"
- `target` fehlt → analog
- `source` ist kein erlaubter Typ (laut `allowedSourceTypes`) → Validierungsfehler mit konkreter Meldung
- `source`- oder `target`-Entität existiert nicht → Validierungsfehler "Entität nicht gefunden"

**Fehlerfälle** (bei EntityType-Definition):
- `allowedSourceTypes` oder `allowedTargetTypes` gesetzt, aber `isConnection=false` → wird ignoriert (BR-08); keine Fehlermeldung, aber Hinweis in der GUI

## Akzeptanzkriterien

**AC1**:
- Gegeben: EntityType `DataFlow` mit `isConnection=true`, `allowedSourceTypes=[ApplicationComponent, DataFlow]`, `allowedTargetTypes=[ApplicationComponent, DataFlow]`
- Wenn: Kurt eine neue `DataFlow`-Instanz anlegt ohne `source` anzugeben
- Dann: erscheint Validierungsfehler "source ist Pflichtfeld"; kein Objekt wird gespeichert

**AC2**:
- Gegeben: `DataFlow`-Instanz DF-1 (source=AppA, target=AppB) existiert bereits
- Wenn: Kurt eine neue `DataFlow`-Instanz DF-2 anlegt mit `source=DF-1` (Connection → Connection) und `target=AppC`
- Dann: wird DF-2 gespeichert; im Graphen zeigt DF-2 auf DF-1 (T-Beziehung: DF-2 zweigt von DF-1 ab, AppC ist Endpunkt)

**AC3**:
- Gegeben: `DataFlow` hat `allowedSourceTypes=[ApplicationComponent]` (DataFlow nicht in der Liste)
- Wenn: Kurt DF-2 mit `source=DF-1` (eine Connection-Instanz) anlegen möchte
- Dann: erscheint Validierungsfehler "DataFlow ist kein erlaubter Source-Typ für DataFlow"

**AC4**:
- Gegeben: EntityType `DataFlow` mit `isConnection=true` und Property `protocol (enum)`
- Wenn: Kurt eine Instanz mit `source=AppA`, `target=AppB`, `protocol=REST` anlegt
- Dann: wird die Instanz mit allen Feldern gespeichert (eigene Properties koexistieren mit source/target)

**AC5**:
- Gegeben: `isConnection=false` (Standard-EntityType `ApplicationComponent`)
- Wenn: Kurt eine `ApplicationComponent`-Instanz anlegt
- Dann: sind `source` und `target` kein Pflichtfeld; keine Änderung am bestehenden Verhalten

**AC6**:
- Gegeben: eine YAML-Import-Datei (REQ-033) definiert `DataFlow` mit `isConnection=true`
- Wenn: Kurt die Datei importiert
- Dann: wird `DataFlow` korrekt als Connection-Typ importiert; `isConnection=true` ist im GUI sichtbar

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Connection-Typ anlegen; Instanz ohne source/target (AC1); T-Beziehung (AC2); allowedTypes-Verletzung (AC3); Properties + source/target (AC4); normaler Typ unverändert (AC5); YAML-Import (AC6)
- [x] Bestanden-Kriterium: AC1–AC6 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-032 (GUI EntityType-Formular; um `isConnection`-Toggle und `allowedTypes`-Felder erweitert); REQ-033 (Import; YAML-Schema um `isConnection` erweitert)
- **Folgewirkungen**: Künftige UC für Entitäts-Anlage (UC-05 o.ä.) muss bei Connection-Typen source/target-Felder erzwingen; View-Layer (Graph/Tabelle) muss Connection-Instanzen als Kanten visualisieren
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Connection-Typen müssen Beziehungen als Property-Felder (z.B. `sourceId: string`) modelliert werden – keine Referenz-Integrität, kein Graphen-Traversal möglich; schwerwiegend für EA-Modellierung
- Risiko 2: Ohne T-Beziehung (Connection → Connection) können Netzwerk-Topologien und Datenstrom-Abzweigungen nicht modelliert werden; mittlerer Schweregrad

## Trade-offs

- Zirkularitätsprüfung (Connection A → Connection B → Connection A) ist in MVP nicht implementiert – zulässig, da EA-Modelle zirkuläre Referenzen fachlich vermeiden; View-Layer muss mit Zyklen umgehen können (Cycle-Detection beim Rendering)
- `allowedSourceTypes` / `allowedTargetTypes` leer = alles erlaubt: maximale Flexibilität, aber kein Schutz vor fachlich sinnlosen Verbindungen; Constraint-Regeln (REQ-032 A3) können das kompensieren

## Realisierungs-Hinweise

- DB-Schema: Connection-Instanzen erhalten zwei zusätzliche Foreign-Key-Spalten `source_entity_id` und `target_entity_id` in der Entitäts-Tabelle; beide NULL-able auf DB-Ebene, aber durch Anwendungsvalidierung erzwungen bei Connection-Typen
- `source_entity_id` und `target_entity_id` zeigen auf die gleiche Entitäts-Tabelle (self-join ermöglicht T-Beziehungen)
- GUI-Formular: bei `isConnection=true` → Pflicht-Dropdowns für `source` und `target` (Suche/Autocomplete über alle Entitäten der Instanz, gefiltert nach `allowedTypes`)
- Graph-Visualisierung: Connection-Instanzen als Kanten mit Pfeil dargestellt; bei T-Beziehung: Kante trifft auf andere Kante (T-Junction-Rendering im Graph-Layout)

## Realisierung

- ADR(s): –
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus Anforderung: "Connections zwischen 2 Components als Objekte erfasst werden können … mit einer anderen Connection verbunden werden, womit eine T-Beziehung entsteht." Das `isConnection`-Flag ist der Schlüsselmechanismus: er verwandelt einen EntityType von einem Knoten in eine gerichtete Kante des EA-Graphen, ohne die Homogenität der Entitäts-Tabelle aufzugeben.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | requirements-engineer | Initial draft |
