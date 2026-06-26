---
id: process
title: Prozess-Modellierung (BPMN 2.0)
version: 0.1.0
status: draft
created: 2026-06-26
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

OEA ermöglicht die Modellierung von Geschäftsprozessen nach BPMN 2.0 — als vollständig integrierter Bestandteil des EA-Repositorys. Prozess-Elemente (Pools, Lanes, Tasks, Events, Gateways) sind reguläre `ArchitectureEntities` im geteilten Integer-ID-Raum. Ihre Typen sind im Metamodell als `EntityTypeDefinition` konfiguriert; die Notation (`bpmn:Pool`, `bpmn:UserTask`, etc.) ist im Viewpoint-System verankert (siehe viewpoint.md).

Diese Datei beschreibt die zusätzlichen Konzepte, die für Prozess-Modellierung nötig sind und im bestehenden Entity-/Metamodell-Rahmen noch nicht explizit abgedeckt sind:

1. **OrganizationalUnit** — strukturelle Einheit eines Unternehmens (Abteilung, Team, Bereich)
2. **BPMN-spezifische built-in EntityTypes** — Pool, Lane, Task-Varianten, Events, Gateways
3. **Zuordnungs-Connections** — Lane → Rolle, Lane → OrgUnit, Task → Person

---

## 1. OrganizationalUnit

### Beschreibung

Eine **OrganizationalUnit** (OrgUnit) repräsentiert eine strukturelle Einheit des Unternehmens: Abteilung, Team, Fachbereich, Konzerngesellschaft. OrgUnits sind von **Rollen** (funktionale Funktion, z.B. "Genehmiger") und **Personen** (individuelle Mitarbeiter) konzeptuell zu trennen.

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
  properties:   []
  creationSteps: []
}
```

### Built-in Connection: `org-unit-part-of`

Hierarchie-Beziehung zwischen OrgUnits (Abteilung gehört zu Bereich):

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

Alle Prozess-Elemente sind ArchitectureEntities. Die folgenden Typen sind built-in; Administratoren können sie per `extends` um eigene Subtypen erweitern (z.B. `review-task extends bpmn-user-task`).

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

### Connections (isConnection=true)

| Connection ID | BPMN-Konzept | Notations-Element | sourceEntityType | targetEntityType |
|---|---|---|---|---|
| `bpmn-sequence-flow` | SequenceFlow | `bpmn:SequenceFlow` | Beliebiges BPMN-Element | Beliebiges BPMN-Element |
| `bpmn-message-flow` | MessageFlow | `bpmn:MessageFlow` | Pool oder Task | Pool oder Task |

---

## 3. Zuordnungs-Connections (Rollen, OrgUnits, Personen)

Die Zuordnung von Verantwortlichkeiten zu Prozess-Elementen erfolgt über reguläre Connections. Alle sind built-in und optional konfigurierbar:

| Connection ID | Quelle | Ziel | Semantik |
|---|---|---|---|
| `bpmn-lane-performs-role` | `bpmn-lane` | `role` | Lane ist für diese Rolle zuständig |
| `bpmn-lane-belongs-to-org-unit` | `bpmn-lane` | `organizational-unit` | Lane gehört zu dieser OrgUnit |
| `bpmn-pool-represents-org-unit` | `bpmn-pool` | `organizational-unit` | Pool repräsentiert diese OrgUnit/Gesellschaft |
| `bpmn-task-assigned-to` | `bpmn-user-task` | `person` | Konkrete Person ist für diesen Task verantwortlich |
| `bpmn-task-requires-role` | `bpmn-task` (+ Subtypen) | `role` | Aufgabe erfordert diese Rolle |

Durch diese Connections sind alle Verantwortlichkeiten im gemeinsamen ID-Raum abfragbar — z.B. „Alle Tasks, die Anna (Person #42) zugeordnet sind" via reguläre Catalog-Abfrage mit Join über `bpmn-task-assigned-to`.

---

## 4. Pool/Lane-Struktur auf dem Canvas

Pools und Lanes sind hierarchisch verschachtelte Elemente auf dem Canvas. Dies erfordert eine spezielle Darstellung:

- **Pool** = React-Flow-GroupNode; enthält Lanes als Kinder
- **Lane** = React-Flow-Subgruppe innerhalb Pool; enthält Tasks, Events, Gateways als Kinder
- **Elemente** (Tasks, Events, Gateways) = reguläre Nodes, deren `parentId` auf eine Lane zeigt

Die `parentId`-Beziehung wird im Repository über die Connection `bpmn-contained-in` modelliert:

| Connection ID | Quelle | Ziel | Semantik |
|---|---|---|---|
| `bpmn-contained-in` | Beliebiges BPMN-Element | `bpmn-lane` oder `bpmn-pool` | Element befindet sich in diesem Container |
| `bpmn-lane-in-pool` | `bpmn-lane` | `bpmn-pool` | Lane ist Teil dieses Pools |

---

## 5. Business Rules

| ID | Aussage | Auslöser | Verantwortlich |
|---|---|---|---|
| BR-01 | `bpmn-sequence-flow` verbindet nur BPMN-Prozess-Elemente (Tasks, Events, Gateways); keine Verbindung zu Nicht-BPMN-Entitäten | onConnectionCreate | API |
| BR-02 | `bpmn-message-flow` verbindet nur `bpmn-pool`- oder Task-Elemente verschiedener Pools | onConnectionCreate | API |
| BR-03 | Eine `bpmn-lane` hat höchstens eine `bpmn-lane-belongs-to-org-unit`-Connection (1 OrgUnit pro Lane) | onConnectionCreate | API |
| BR-04 | Eine `bpmn-lane` kann mehrere `bpmn-lane-performs-role`-Connections haben (Lane kann mehrere Rollen bündeln) | – | Daten |
| BR-05 | Ein `bpmn-user-task` sollte (SHOULD) höchstens eine `bpmn-task-assigned-to`-Connection haben (1 verantwortliche Person) | onConnectionCreate | UI-Warnung |
| BR-06 | Prozess-Elemente innerhalb eines Pools MÜSSEN über `bpmn-contained-in` mit einer Lane oder dem Pool selbst verbunden sein; freistehende Elemente in Pool-Kontext sind ungültig | onSave | API |

---

## 6. Erweiterbarkeit (Metamodell-Konfigurierbarkeit)

Alle built-in BPMN-Typen sind via `extends` erweiterbar:

```yaml
# Beispiel: Unternehmensspezifischer Review-Task
EntityTypeDefinition:
  id:      "review-task"
  name:    "Review-Aufgabe"
  extends: "bpmn-user-task"
  color:   "#F59E0B"
  icon:    "check-circle"
  properties:
    - name: "reviewDueDate"
      type: "date"
      required: true
    - name: "reviewCriteria"
      type: "text"
```

Administratoren können neue Task-Varianten, Ereignistypen oder OrgUnit-Subtypen definieren, ohne built-in Typen zu verändern.

---

## 7. Abgrenzung zu bestehenden BOs

| Konzept | In process.md | In anderen BOs |
|---|---|---|
| Entity-Grundmodell | – | entity.md |
| EntityTypeDefinition-Struktur | Verwendet | metamodel-configuration.md |
| Viewpoint / NotationMapping | Verwendet | viewpoint.md |
| Person als Entität | Zuordnungs-Ziel | role.md (geplant) |
| Role als Entität | Zuordnungs-Ziel | role.md (geplant) |
| Canvas-Rendering | – | viewpoint.md, ADR-007 |

---

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | business-engineer | Initial draft: OrganizationalUnit, BPMN-Typen, Zuordnungs-Connections, BR-01–06 |
