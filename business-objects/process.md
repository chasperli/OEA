---
id: process
title: Prozess-Modellierung (BPMN 2.0)
version: 0.2.0
status: draft
created: 2026-06-26
last_updated: 2026-06-26
references:
  concept:
    - concept/20-entities/09-prozess-architektur.md
    - concept/20-entities/06-kern-entitaetstypen.md
  business_objects:
    - entity
    - metamodel-configuration
    - viewpoint
---

# Business Object: Prozess-Modellierung (BPMN 2.0)

## Überblick

OEA ermöglicht die Modellierung von Geschäftsprozessen nach BPMN 2.0 — als vollständig integrierter Bestandteil des EA-Repositorys. Prozess-Elemente (Pools, Lanes, Tasks, Events, Gateways, DataObjects) sind reguläre `ArchitectureEntities` im geteilten Integer-ID-Raum. Ihre Typen sind im Metamodell als `EntityTypeDefinition` konfiguriert; die Notation ist im Viewpoint-System verankert (siehe viewpoint.md).

Diese Datei beschreibt die zusätzlichen Konzepte, die für Prozess-Modellierung nötig sind:

1. **OrganizationalUnit** — strukturelle Einheit eines Unternehmens (Abteilung, Team, Bereich)
2. **BPMN-spezifische built-in EntityTypes** — Pool, Lane, Task-Varianten, Events, Gateways, DataObjects, DataStore
3. **Zuordnungs-Connections** — Lane → Rolle, Lane → OrgUnit, Task → Person
4. **DataObject und Prozess-Datenlineage** — DataObjects in Prozessen anreichern; Data Lineage durch Geschäftsprozesse
5. **Pool/Lane-Struktur auf dem Canvas**

---

## 1. OrganizationalUnit

### Beschreibung

Eine **OrganizationalUnit** (OrgUnit) repräsentiert eine strukturelle Einheit des Unternehmens: Abteilung, Team, Fachbereich, Konzerngesellschaft. OrgUnits sind von **Rollen** (funktionale Funktion, z.B. „Genehmiger") und **Personen** (individuelle Mitarbeiter) konzeptuell zu trennen.

OrgUnits sind als **konfigurierbare EntityTypes** im Metamodell modellierbar. Der built-in Basis-Typ `organizational-unit` dient als Basistyp; konkrete Subtypen (z.B. `department`, `team`, `business-unit`) werden vom Administrator per `extends: organizational-unit` konfiguriert.

### Attribute

| Attribut | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `id` | integer | ja | Gemeinsamer ID-Raum mit allen ArchitectureEntities |
| `entityTypeId` | string | ja | `organizational-unit` oder konfigurierbarer Subtyp |
| `name` | string | ja | Name der Einheit (z.B. „Einkauf", „IT Operations") |
| `parentOrgUnitId` | integer ⟶ ArchitectureEntity | nein | Übergeordnete Einheit (Hierarchie); via `org-unit-part-of` Connection |
| `architectureDomainIds` | integer[] | nein | Zugeordnete Architekturdomänen |
| properties | frei konfigurierbar | nein | z.B. Kostenstelle, SAP-OrgUnit-ID, Verantwortliche Person |

### Built-in EntityType: `organizational-unit`

```
EntityTypeDefinition {
  id:           "organizational-unit"
  name:         "Organisationseinheit"
  isConnection: false
  isBuiltIn:    true
  extends:      null
  icon:         "org-chart"
  color:        "#6B7280"
}
```

### Built-in Connection: `org-unit-part-of`

```
EntityTypeDefinition {
  id:                    "org-unit-part-of"
  isConnection:          true
  isBuiltIn:             true
  allowsConnectionAsSource: false
  sourceEntityType:      "organizational-unit" (+ Subtypen)
  targetEntityType:      "organizational-unit" (+ Subtypen)
}
```

---

## 2. BPMN-spezifische built-in EntityTypes

Alle Prozess-Elemente sind ArchitectureEntities. Die folgenden Typen sind built-in; Administratoren können sie per `extends` um eigene Subtypen erweitern.

### Elemente (isConnection=false)

| EntityType ID | BPMN-Konzept | Notations-Element | Besonderheit |
|---|---|---|---|
| `bpmn-process` | BusinessProcess | `bpmn:Process` | Top-level Container; Wurzel-Element |
| `bpmn-pool` | Pool | `bpmn:Pool` | Repräsentiert einen Teilnehmer; enthält Lanes |
| `bpmn-lane` | Lane | `bpmn:Lane` | Zuständigkeitsbereich innerhalb eines Pools |
| `bpmn-task` | Task | `bpmn:Task` | Generische Aufgabe |
| `bpmn-user-task` | UserTask | `bpmn:UserTask` | Manuelle Aufgabe durch Person |
| `bpmn-service-task` | ServiceTask | `bpmn:ServiceTask` | Automatisierte Aufgabe |
| `bpmn-send-task` | SendTask | `bpmn:SendTask` | Nachricht versenden |
| `bpmn-receive-task` | ReceiveTask | `bpmn:ReceiveTask` | Nachricht empfangen |
| `bpmn-business-rule-task` | BusinessRuleTask | `bpmn:BusinessRuleTask` | Regelauswertung |
| `bpmn-script-task` | ScriptTask | `bpmn:ScriptTask` | Skript-Ausführung |
| `bpmn-sub-process` | SubProcess | `bpmn:SubProcess` | Eingebetteter Prozess |
| `bpmn-start-event` | StartEvent | `bpmn:StartEvent` | Prozessstart |
| `bpmn-end-event` | EndEvent | `bpmn:EndEvent` | Prozessende |
| `bpmn-intermediate-catch-event` | IntermediateCatchEvent | `bpmn:IntermediateCatchEvent` | Zwischenereignis (empfangen) |
| `bpmn-intermediate-throw-event` | IntermediateThrowEvent | `bpmn:IntermediateThrowEvent` | Zwischenereignis (senden) |
| `bpmn-exclusive-gateway` | ExclusiveGateway | `bpmn:ExclusiveGateway` | XOR-Verzweigung |
| `bpmn-parallel-gateway` | ParallelGateway | `bpmn:ParallelGateway` | AND-Verzweigung |
| `bpmn-inclusive-gateway` | InclusiveGateway | `bpmn:InclusiveGateway` | OR-Verzweigung |
| `bpmn-event-gateway` | EventBasedGateway | `bpmn:EventBasedGateway` | Ereignisbasierte Verzweigung |
| `bpmn-data-object` | DataObject | `bpmn:DataObject` | Datenobjekt im Prozess; extends `data-object` aus entity.md; `isCollection: boolean`-Property |
| `bpmn-data-store` | DataStore | `bpmn:DataStoreReference` | Persistenter Datenspeicher (z.B. Datenbank, Archiv); steht ausserhalb von Pools |

### Connections (isConnection=true)

| Connection ID | BPMN-Konzept | Notations-Element | sourceEntityType | targetEntityType |
|---|---|---|---|---|
| `bpmn-sequence-flow` | SequenceFlow | `bpmn:SequenceFlow` | Beliebiges BPMN-Flusselement | Beliebiges BPMN-Flusselement |
| `bpmn-message-flow` | MessageFlow | `bpmn:MessageFlow` | Pool oder Task | Pool oder Task |
| `bpmn-contained-in` | ContainedIn | – | Beliebiges BPMN-Element | `bpmn-lane` oder `bpmn-pool` |
| `bpmn-lane-in-pool` | LaneInPool | – | `bpmn-lane` | `bpmn-pool` |
| `bpmn-data-input-association` | DataInputAssociation | `bpmn:DataInputAssociation` | `data-object` / `bpmn-data-object` / `bpmn-data-store` | `bpmn-task` (+ alle Task-Subtypen) |
| `bpmn-data-output-association` | DataOutputAssociation | `bpmn:DataOutputAssociation` | `bpmn-task` (+ alle Task-Subtypen) | `data-object` / `bpmn-data-object` / `bpmn-data-store` |

---

## 3. Zuordnungs-Connections (Rollen, OrgUnits, Personen)

| Connection ID | Quelle | Ziel | Semantik |
|---|---|---|---|
| `bpmn-lane-performs-role` | `bpmn-lane` | `role` | Lane ist für diese Rolle zuständig |
| `bpmn-lane-belongs-to-org-unit` | `bpmn-lane` | `organizational-unit` | Lane gehört zu dieser OrgUnit |
| `bpmn-pool-represents-org-unit` | `bpmn-pool` | `organizational-unit` | Pool repräsentiert diese OrgUnit/Gesellschaft |
| `bpmn-task-assigned-to` | `bpmn-user-task` | `person` | Konkrete Person ist für diesen Task verantwortlich |
| `bpmn-task-requires-role` | `bpmn-task` (+ Subtypen) | `role` | Aufgabe erfordert diese Rolle |

Durch diese Connections sind alle Verantwortlichkeiten im gemeinsamen ID-Raum abfragbar.

---

## 4. DataObject und Prozess-Datenlineage

### 4.1 Konzept

BPMN-Prozesse arbeiten mit Daten: Ein Task liest ein `data-object` (Bestellung, Kundendatensatz), verarbeitet es und schreibt das Ergebnis in ein anderes (oder dasselbe) `data-object`. Diese **Prozess-Datenlineage** ist in OEA modellierbar und mit der technischen Data Lineage (UC-08) verknüpfbar.

**`bpmn-data-object`** ist ein Subtyp von `data-object` (aus entity.md). Dadurch teilt es den ID-Raum und ist sowohl im BPMN-Diagramm sichtbar als auch in der technischen Lineage-API abfragbar. Alternativ kann ein bereits im EA-Repository vorhandenes `data-object` direkt in einem BPMN-Prozess referenziert werden — ohne Duplizierung.

### 4.2 Anreicherungs-Semantik

Die `bpmn-data-output-association`-Connection trägt Properties, die beschreiben, **was ein Task mit dem Datenobjekt macht**:

| Property | Typ | Pflicht | Werte |
|---|---|---|---|
| `transformationType` | enum | nein | `create` · `enrich` · `overwrite` · `delete` · `read-only` |
| `affectedAttributes` | string[] | nein | Liste der Attribut-Namen, die der Task setzt oder ändert |
| `condition` | string | nein | Bedingung, unter der die Assoziation aktiv ist (z.B. „nur bei Genehmigung") |

Beispiel: Ein `bpmn-user-task` „Bestellung prüfen" hat:
- `bpmn-data-input-association` → `data-object` Bestellung (lesen)
- `bpmn-data-output-association` → `data-object` Bestellung mit `transformationType: enrich`, `affectedAttributes: ["status", "reviewedBy", "reviewedAt"]` (anreichern)

### 4.3 Verbindung zur technischen Data Lineage

Die Zweischicht-Lineage verbindet Geschäftsprozess-Ebene und technische Ebene:

```
[bpmn-task „Bestellung prüfen"]
  └─ bpmn-data-output-association (enrich) ──▶ [data-object „Bestellung"]
                                                    └─ carries-data (ADR-010) ──▶ [data-flow „ERP → Archiv"]
                                                                                       └─ realizesProcess ──▶ [bpmn-process „Beschaffung"]
```

**Abfrage-Beispiel** — „Welche Tasks erzeugen oder verändern das DataObject ‚Bestellung'?":
```cypher
MATCH (t)-[r:bpmn-data-output-association]->(d:data-object {name: "Bestellung"})
RETURN t.name, r.transformationType, r.affectedAttributes
ORDER BY t.name
```

**Abfrage-Beispiel** — „Welcher Prozess steckt hinter einem technischen DataFlow?":
```cypher
MATCH (flow:data-flow {id: 42})-[:carries-data]->(d:data-object)
MATCH (t)-[:bpmn-data-output-association]->(d)
MATCH (t)-[:bpmn-contained-in*]->(p:bpmn-process)
RETURN flow.name, d.name, t.name, p.name
```

### 4.4 DataStore

`bpmn-data-store` repräsentiert persistenten Datenspeicher (Datenbank, Archiv, Filesystem), auf den ein Task lesend oder schreibend zugreift. Im Gegensatz zum `data-object` (transientes Datenobjekt im Prozessfluss) ist der DataStore **kein Element innerhalb eines Pools**, sondern steht eigenständig im Prozessdiagramm.

`bpmn-data-store` kann via `realizes`-Connection mit einem technischen `data-component` (aus entity.md) verknüpft werden — damit ist der Bezug zur technischen Infrastruktur hergestellt.

---

## 5. Pool/Lane-Struktur auf dem Canvas

Pools und Lanes sind hierarchisch verschachtelte Elemente auf dem Canvas:

- **Pool** = Vue Flow GroupNode; enthält Lanes als Kinder
- **Lane** = Vue Flow Subgruppe innerhalb Pool; enthält Tasks, Events, Gateways, DataObjects als Kinder
- **Elemente** (Tasks, Events, Gateways, DataObjects) = reguläre Nodes, deren `parentId` auf eine Lane zeigt
- **DataObjects** können auch ausserhalb von Pools auf der Prozessebene platziert werden (Pool-übergreifende Daten)

Die `parentId`-Beziehung wird im Repository über `bpmn-contained-in` modelliert.

---

## 6. Business Rules

| ID | Aussage | Auslöser | Verantwortlich |
|---|---|---|---|
| BR-01 | `bpmn-sequence-flow` verbindet nur BPMN-Flusselemente (Tasks, Events, Gateways); keine Verbindung zu DataObjects oder DataStores | onConnectionCreate | API |
| BR-02 | `bpmn-message-flow` verbindet nur `bpmn-pool`- oder Task-Elemente verschiedener Pools | onConnectionCreate | API |
| BR-03 | Eine `bpmn-lane` hat höchstens eine `bpmn-lane-belongs-to-org-unit`-Connection (1 OrgUnit pro Lane) | onConnectionCreate | API |
| BR-04 | Eine `bpmn-lane` kann mehrere `bpmn-lane-performs-role`-Connections haben (Lane kann mehrere Rollen bündeln) | – | Daten |
| BR-05 | Ein `bpmn-user-task` sollte (SHOULD) höchstens eine `bpmn-task-assigned-to`-Connection haben | onConnectionCreate | UI-Warnung |
| BR-06 | Prozess-Elemente innerhalb eines Pools MÜSSEN über `bpmn-contained-in` mit einer Lane oder dem Pool verbunden sein | onSave | API |
| BR-07 | `bpmn-data-input-association` läuft immer von DataObject/DataStore **zu** Task (Pfeilrichtung: Datenquelle → Task); `bpmn-data-output-association` läuft immer von Task **zu** DataObject/DataStore | onConnectionCreate | API |
| BR-08 | Ein `bpmn-data-object` mit `transformationType: create` darf nicht gleichzeitig eine `bpmn-data-input-association` auf dasselbe Objekt haben (neu erstellt = vorher nicht vorhanden) | onSave | API-Warnung |

---

## 7. Erweiterbarkeit (Metamodell-Konfigurierbarkeit)

Alle built-in BPMN-Typen sind via `extends` erweiterbar:

```yaml
# Unternehmensspezifischer Review-Task
EntityTypeDefinition:
  id:      "review-task"
  extends: "bpmn-user-task"
  properties:
    - name: "reviewDueDate"
      type: "date"
      required: true

# Prozess-DataObject mit Datenklassifizierung
EntityTypeDefinition:
  id:      "classified-data-object"
  extends: "bpmn-data-object"
  properties:
    - name: "dataClassification"
      type: "enum[public, internal, confidential, restricted]"
      required: true
```

---

## 8. Abgrenzung zu bestehenden BOs

| Konzept | In process.md | In anderen BOs |
|---|---|---|
| Entity-Grundmodell | – | entity.md |
| `data-object` Basis-Typ | Subtyp `bpmn-data-object` verwendet | entity.md |
| DataFlow / carries-data | Verknüpft via Data Lineage (§4.3) | entity.md, ADR-010 |
| EntityTypeDefinition-Struktur | Verwendet | metamodel-configuration.md |
| Viewpoint / NotationMapping | Verwendet | viewpoint.md |
| Person als Entität | Zuordnungs-Ziel | role.md |
| Role als Entität | Zuordnungs-Ziel | role.md |
| Canvas-Rendering | – | viewpoint.md, ADR-007 (Vue Flow) |

---

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.2.0 | 2026-06-26 | business-engineer | DataObject/DataStore-Integration: bpmn-data-object (extends data-object), bpmn-data-store; DataAssociation-Connections; Prozess-Datenlineage (§4); BR-07/08; Vue Flow |
| 0.1.0 | 2026-06-26 | business-engineer | Initial draft: OrganizationalUnit, BPMN-Typen, Zuordnungs-Connections, BR-01–06 |
