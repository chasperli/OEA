---
identifier: viewpoint
name_de: Viewpoint / Architektursicht
name_en: Viewpoint
version: 0.2.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Architektursicht
  - Diagrammtyp
  - View Definition
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/20-entities/12-domain-sichten.md
  - concept: concept/70-platform/21-api-architektur.md
---

# Business Object: Viewpoint

## Definition

Ein `Viewpoint` ist eine benannte Architektursicht, die festlegt, welche Entitätstypen und Verbindungstypen in einem Diagramm dieses Typs erscheinen dürfen, in welcher Notation sie dargestellt werden und mit welchen Standard-Abmessungen und Darstellungstypen sie gerendert werden. Er ist die Brücke zwischen dem semantischen Metamodell (EntityTypes, Connections) und der visuellen Repräsentation.

Jeder Entitätstyp und Verbindungstyp besitzt eine **stabile, eindeutige ID** (kebab-case; z.B. `application-component`). Viewpoints referenzieren diese IDs – nicht die Anzeigenamen. Dadurch bleiben Viewpoint-Definitionen beim Import/Export zwischen OEA-Instanzen konsistent, auch wenn Anzeigenamen lokalisiert oder umbenannt werden.

## Beschreibung

Ein Viewpoint beantwortet drei Fragen:

1. **Was darf in dieser Sicht erscheinen?** – Auswahl aus den im Metamodell definierten EntityTypes und Connection-Typen (referenziert via ID)
2. **Wie wird es dargestellt?** – Wahl einer Notation: ArchiMate 3, UML oder BPMN 2.0; pro EntityType ein konkretes Notation-Element (z.B. `archimate:ApplicationComponent`, `bpmn:UserTask`)
3. **In welcher Standardgrösse?** – pro EntityType eine Default-Breite und -Höhe in Pixel, die der Canvas-Editor beim Einfügen neuer Elemente verwendet

Jede Instanz einer OEA-[MetamodelConfiguration](./metamodel-configuration.md) enthält eine Menge von Viewpoints, analog zu den EntityTypes und Stereotypes. Einige Viewpoints sind **system-definiert** (built-in, nicht löschbar), andere werden vom Architekturteam als **user-defined** ergänzt.

---

### Eingebaute Viewpoints (system-defined)

OEA liefert standardmässig eine Reihe vordefinierter Viewpoints aus den drei unterstützten Notationen:

**ArchiMate 3 (Auswahl)**:

| Name | Erlaubte Schichten | Typische Entitätstypen |
|---|---|---|
| Business Architecture View | Business | Actor, Role, BusinessProcess, BusinessFunction, BusinessService, Capability |
| Application Architecture View | Application | ApplicationComponent, ApplicationService, ApplicationFunction, Interface |
| Technology Architecture View | Technology | TechnologyComponent, Platform, Node, CommunicationPath |
| Application Cooperation View | Application | ApplicationComponent, ApplicationService, Interface (Beziehungen im Fokus) |
| Layered View | Alle | Alle Schichten sichtbar; volle Landschaft |

**UML (Auswahl)**:

| Name | Diagramm-Typ | Typische Entitätstypen |
|---|---|---|
| Component Diagram | Komponenten | ApplicationComponent, Interface, Dependency |
| Class Diagram | Klassen/Daten | DataEntity, LogicalDataComponent, Property |
| Deployment Diagram | Deployment | Node, TechnologyComponent, ApplicationComponent |

**BPMN 2.0 (Auswahl)**:

| Name | Diagramm-Typ | Typische Entitätstypen |
|---|---|---|
| Process View | Prozessfluss | BusinessProcess, Task, Event, Gateway, SequenceFlow |
| Collaboration View | Zusammenarbeit | Pool, Lane, MessageFlow, BusinessProcess |

---

### Notation und Darstellung

Ein Viewpoint ist genau einer Notation zugeordnet. Die Notation steuert, wie die Elemente visuell gerendert werden:

| Notation | Charakteristik | Typischer Einsatz |
|---|---|---|
| `archimate3` | Box-basiert, farbcodierte TOGAF-Schichten, standardisierte Symbole | Landschaftsübersichten, Plateaus, Geschäfts-IT-Alignment |
| `uml` | Strukturdiagramme (Component, Class, Deployment), Verhaltensdiagramme (Sequence, Activity) | Software-Architektur, Schnittstellen-Verträge |
| `bpmn2` | Flow-basiert, Ereignisse/Aufgaben/Gateways, Pool-Lane-Struktur | Geschäftsprozesse, Abläufe, Organisationsübergänge |

---

### Zusammenspiel mit MetamodelConfiguration

```
MetamodelConfiguration (scope=instance)
  ├── EntityTypeDefinitions: application-component, data-flow, security-zone, ...
  ├── Stereotypes: saas-application, ...
  ├── ConstraintRules: every-interface-has-owner, ...
  └── Viewpoints:
        ├── [built-in] Application Architecture View (archimate3)
        │     allowedEntityTypes: [application-component, application-service, interface, ...]
        │     allowedConnectionTypes: [data-flow, ...]
        │     notationMappings: [{entityTypeId: application-component, notationElement: archimate:ApplicationComponent,
        │                          defaultWidth: 120, defaultHeight: 55}, ...]
        ├── [built-in] Process View (bpmn2)
        │     allowedEntityTypes: [business-process, task, start-event, ...]
        │     allowedConnectionTypes: [sequence-flow, message-flow, ...]
        └── [user-defined] Cloud Security View (archimate3)
              allowedEntityTypes: [application-component, security-zone, technology-component]
              allowedConnectionTypes: [data-flow]
```

Ein Diagram in OEA referenziert immer genau einen Viewpoint. Entitäten und Connections, die nicht im `allowedEntityTypes`/`allowedConnectionTypes`-Set des Viewpoints enthalten sind, können diesem Diagramm nicht hinzugefügt werden.

---

### Notation-Mappings und Standardgrössen

Für jeden EntityType existiert eine **Standard-Mapping-Tabelle** (system-defined), die den OEA-Typ auf das entsprechende Notation-Element und die üblichen Standardabmessungen abbildet:

| OEA EntityType (ID) | ArchiMate 3 | UML | BPMN 2.0 | Default W×H (px) |
|---|---|---|---|---|
| `application-component` | `archimate:ApplicationComponent` | `uml:Component` | – | 120 × 55 |
| `business-process` | `archimate:BusinessProcess` | `uml:Activity` | `bpmn:Process` | 120 × 55 |
| `interface` | `archimate:ApplicationInterface` | `uml:Interface` | – | 100 × 55 |
| `data-flow` (Connection) | `archimate:FlowRelationship` | `uml:Dependency` | `bpmn:MessageFlow` | – |
| `sequence-flow` (Connection) | `archimate:TriggeringRelationship` | – | `bpmn:SequenceFlow` | – |
| Custom EntityType | `archimate:ApplicationComponent` (Fallback) | `uml:Class` (Fallback) | `bpmn:Task` (Fallback) | 120 × 55 |

User-defined Viewpoints können für ihre Custom EntityTypes optional eigene Notation-Mappings hinterlegen, um das Default-Rendering zu überschreiben (z.B. spezifische ArchiMate-Symbole für Custom-Typen, abweichende Standardgrössen).

## Notation-Element-Katalog

Gültige Werte für `NotationMapping.notationElement`, gegliedert nach Notation-Standard. Das Präfix bestimmt den Standard (`archimate:`, `uml:`, `bpmn:`). Der Viewpoint darf nur Elemente seiner eigenen Notation verwenden.

### ArchiMate 3 – Elemente (Präfix `archimate:`)

**Business-Schicht**: `archimate:BusinessActor` · `archimate:BusinessRole` · `archimate:BusinessProcess` · `archimate:BusinessService` · `archimate:BusinessFunction` · `archimate:BusinessInteraction` · `archimate:BusinessEvent` · `archimate:BusinessObject` · `archimate:Contract` · `archimate:Capability` · `archimate:ValueStream`

**Application-Schicht**: `archimate:ApplicationComponent` · `archimate:ApplicationService` · `archimate:ApplicationFunction` · `archimate:ApplicationInterface` · `archimate:ApplicationCollaboration` · `archimate:DataObject`

**Technology-Schicht**: `archimate:TechnologyComponent` · `archimate:TechnologyService` · `archimate:TechnologyFunction` · `archimate:Node` · `archimate:Device` · `archimate:SystemSoftware` · `archimate:CommunicationNetwork` · `archimate:Path` · `archimate:Artifact`

**Beziehungen (Connections)**: `archimate:AssociationRelationship` · `archimate:CompositionRelationship` · `archimate:AggregationRelationship` · `archimate:RealizationRelationship` · `archimate:AssignmentRelationship` · `archimate:ServingRelationship` · `archimate:AccessRelationship` · `archimate:TriggeringRelationship` · `archimate:FlowRelationship` · `archimate:InfluenceRelationship` · `archimate:SpecializationRelationship`

### UML – Elemente (Präfix `uml:`)

**Struktur**: `uml:Class` · `uml:Interface` · `uml:Component` · `uml:Package` · `uml:Node` · `uml:Artifact` · `uml:Collaboration`

**Verhalten**: `uml:Actor` · `uml:UseCase` · `uml:Activity` · `uml:State`

**Beziehungen (Connections)**: `uml:Dependency` · `uml:Association` · `uml:Realization` · `uml:Generalization` · `uml:Composition` · `uml:Aggregation`

**Sonstiges**: `uml:Note`

### BPMN 2.0 – Elemente (Präfix `bpmn:`)

**Tasks**: `bpmn:Task` · `bpmn:UserTask` · `bpmn:ServiceTask` · `bpmn:SendTask` · `bpmn:ReceiveTask` · `bpmn:ManualTask` · `bpmn:BusinessRuleTask` · `bpmn:ScriptTask` · `bpmn:SubProcess` · `bpmn:CallActivity`

**Events**: `bpmn:StartEvent` · `bpmn:EndEvent` · `bpmn:IntermediateCatchEvent` · `bpmn:IntermediateThrowEvent` · `bpmn:BoundaryEvent`

**Gateways**: `bpmn:ExclusiveGateway` · `bpmn:InclusiveGateway` · `bpmn:ParallelGateway` · `bpmn:EventBasedGateway`

**Flows (Connections)**: `bpmn:SequenceFlow` · `bpmn:MessageFlow`

**Daten & Struktur**: `bpmn:DataObject` · `bpmn:DataStore` · `bpmn:Pool` · `bpmn:Lane` · `bpmn:Group`

### Generischer Fallback

`generic:Box` (Entity ohne spezifisches Notation-Element) · `generic:Arrow` (Connection ohne spezifisches Notation-Element)

---

### Empfohlene Standardgrössen nach Notation-Element

| Kategorie | Beispiel-Elemente | Empfehlung W×H (px) |
|---|---|---|
| ArchiMate Box (Schicht-Elemente) | `archimate:ApplicationComponent`, `archimate:BusinessProcess` | 120 × 55 |
| ArchiMate Node / Device | `archimate:Node`, `archimate:Device` | 120 × 70 |
| UML Class / Component | `uml:Class`, `uml:Component` | 140 × 80 |
| UML Actor | `uml:Actor` | 40 × 60 |
| BPMN Task | `bpmn:Task`, `bpmn:UserTask`, `bpmn:ServiceTask` | 100 × 80 |
| BPMN SubProcess | `bpmn:SubProcess`, `bpmn:CallActivity` | 140 × 80 |
| BPMN Event (Kreis) | `bpmn:StartEvent`, `bpmn:EndEvent`, `bpmn:IntermediateCatchEvent` | 36 × 36 |
| BPMN Gateway (Raute) | `bpmn:ExclusiveGateway`, `bpmn:ParallelGateway` | 50 × 50 |
| BPMN Pool | `bpmn:Pool` | 600 × 150 |
| BPMN Lane | `bpmn:Lane` | 600 × 120 |

Die Werte sind Empfehlungen; jeder user-defined Viewpoint kann pro EntityType abweichende Werte in `NotationMapping.defaultWidth`/`defaultHeight` hinterlegen.

---

## Attribute

### ViewpointDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | kebab-case, eindeutig innerhalb der MetamodelConfiguration | Stabiler Bezeichner (z.B. `application-architecture-view`) |
| name | string | required | | max. 255 Zeichen, eindeutig innerhalb der MetamodelConfiguration | Anzeigename |
| description | string | optional | | max. 1000 Zeichen | Fachliche Beschreibung, wofür dieser Viewpoint genutzt wird |
| notation | enum | required | | `[archimate3, uml, bpmn2]` | Notation für die Darstellung; ein Viewpoint gehört genau einer Notation an |
| viewpointType | enum | required | `user-defined` | `[system-defined, user-defined]` | `system-defined` = built-in (read-only); `user-defined` = vom Architekturteam angelegt |
| allowedEntityTypes | string[] | required | [] | Werte sind `EntityTypeDefinition.id` (kebab-case); alle IDs müssen in der zugehörigen MetamodelConfiguration existieren | EntityTypes, die in Diagrammen dieses Viewpoints verwendet werden dürfen |
| allowedConnectionTypes | string[] | required | [] | Werte sind `EntityTypeDefinition.id`; alle IDs müssen auf Typen zeigen, für die `isConnection=true` gilt | Connection-Typen, die als Kanten in Diagrammen dieses Viewpoints erlaubt sind |
| notationMappings | NotationMapping[] | optional | [] | Überschreibt Default-Mapping pro EntityType; empfohlen für alle custom EntityTypes | Notation-Element, Darstellungstyp und Standardgrösse pro EntityType |
| createdBy | reference | optional | null | target: person; nur bei `viewpointType=user-defined` | Erstellende Person |
| createdAt | datetime | optional | null | ISO 8601, UTC; nur bei `viewpointType=user-defined` | Zeitpunkt der Anlage |

### NotationMapping (Werteobjekt)

| Attribut | Typ | Optional | Beschreibung |
|---|---|---|---|
| entityTypeId | string | required | `EntityTypeDefinition.id` (kebab-case) des OEA-Typs, für den das Mapping gilt |
| notationElement | string | required | Notation-spezifisches Element aus dem Katalog (z.B. `archimate:ApplicationFunction`, `uml:Interface`, `bpmn:SubProcess`); Präfix muss zur `notation` des Viewpoints passen |
| defaultWidth | integer | optional | Standard-Breite in Pixel, die der Canvas-Editor beim Einfügen verwendet (muss > 0 sein) |
| defaultHeight | integer | optional | Standard-Höhe in Pixel, die der Canvas-Editor beim Einfügen verwendet (muss > 0 sein) |
| visualHint | string | optional | Optionaler Stil-Override (z.B. Füllfarbe `#ffcccc`, Icon-Override); Format TBD |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| definedIn | [metamodel-configuration](./metamodel-configuration.md) | n:1 | no | Jeder Viewpoint gehört zu einer MetamodelConfiguration |
| allowsEntityTypes | EntityTypeDefinition (via id) | n:n | no | Welche Typen in diesem Viewpoint erscheinen dürfen |
| allowsConnectionTypes | EntityTypeDefinition (isConnection=true, via id) | n:n | no | Welche Connection-Typen als Kanten erscheinen dürfen |
| usedBy | Diagram[] | 1:n | yes | Diagramme, die diesen Viewpoint verwenden |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `ViewpointDefinition.name` MUSS innerhalb einer MetamodelConfiguration eindeutig sein | onCreate, onUpdate | – |
| BR-02 | Ein Viewpoint mit `viewpointType=system-defined` DARF NICHT gelöscht oder in `allowedEntityTypes`, `allowedConnectionTypes` und `notation` verändert werden | onDelete, onUpdate | – |
| BR-03 | Alle Einträge in `allowedEntityTypes` MÜSSEN auf gültige `EntityTypeDefinition.id`-Werte der zugehörigen MetamodelConfiguration zeigen (built-in + custom) | onCreate, onUpdate | – |
| BR-04 | Alle Einträge in `allowedConnectionTypes` MÜSSEN auf `EntityTypeDefinition.id`-Werte zeigen, für die `isConnection=true` gilt | onCreate, onUpdate | – |
| BR-05 | Ein Diagramm DARF nur Entitäten und Connections des Typs enthalten, der im verknüpften Viewpoint's `allowedEntityTypes`/`allowedConnectionTypes` gelistet ist | onDiagramEdit | – |
| BR-06 | Ein `NotationMapping.entityTypeId` MUSS in `allowedEntityTypes` dieses Viewpoints enthalten sein | onCreate, onUpdate | – |
| BR-07 | `NotationMapping.notationElement` MUSS mit dem Präfix der `notation` des Viewpoints übereinstimmen (archimate3 → `archimate:*`, uml → `uml:*`, bpmn2 → `bpmn:*`) oder den Wert `generic:Box` / `generic:Arrow` haben | onCreate, onUpdate | – |
| BR-08 | Beim Import eines Viewpoints MÜSSEN alle IDs in `allowedEntityTypes` und `allowedConnectionTypes` in der Ziel-MetamodelConfiguration existieren; fehlende IDs werden als Validierungsfehler gemeldet (kein Partial-Import auf Type-Ebene) | onImport | – |

## Lifecycle

Viewpoints haben keinen eigenständigen Status-Lifecycle. Sie existieren als Konfigurationselement innerhalb der MetamodelConfiguration und folgen deren Änderungs-Tracking (Audit-Log, schemaVersion).

## Beispiele

**User-defined Viewpoint – Cloud Security View (ArchiMate 3)**:
```yaml
viewpoint:
  id: cloud-security-view
  name: Cloud Security View
  notation: archimate3
  viewpointType: user-defined
  description: >
    Zeigt Cloud-Komponenten und deren Sicherheitszonen-Zuordnung;
    geeignet für Security-Reviews und Compliance-Dokumentation.
  allowedEntityTypes:
    - application-component
    - technology-component
    - security-zone        # custom EntityType (ID kebab-case)
    - node
  allowedConnectionTypes:
    - data-flow            # custom Connection-Typ mit protocol/dataClassification
  notationMappings:
    - entityTypeId: security-zone
      notationElement: archimate:TechnologyComponent
      defaultWidth: 140
      defaultHeight: 70
      visualHint: "color=#ffcccc"
    - entityTypeId: application-component
      notationElement: archimate:ApplicationComponent
      defaultWidth: 120
      defaultHeight: 55
    - entityTypeId: technology-component
      notationElement: archimate:TechnologyComponent
      defaultWidth: 120
      defaultHeight: 55
```

**System-defined Viewpoint – Application Architecture View (ArchiMate 3)**:
```yaml
viewpoint:
  id: application-architecture-view
  name: Application Architecture View
  notation: archimate3
  viewpointType: system-defined
  description: Standard ArchiMate Application Layer View
  allowedEntityTypes:
    - application-component
    - application-service
    - application-function
    - interface
    - data-entity
  allowedConnectionTypes:
    - data-flow
    - used-by        # built-in Connection-Typ: Application → Application
  notationMappings:
    - entityTypeId: application-component
      notationElement: archimate:ApplicationComponent
      defaultWidth: 120
      defaultHeight: 55
    - entityTypeId: application-service
      notationElement: archimate:ApplicationService
      defaultWidth: 120
      defaultHeight: 55
    - entityTypeId: interface
      notationElement: archimate:ApplicationInterface
      defaultWidth: 100
      defaultHeight: 55
```

**BPMN-Viewpoint – Process View**:
```yaml
viewpoint:
  id: process-view
  name: Process View
  notation: bpmn2
  viewpointType: system-defined
  description: Standard BPMN 2.0 Prozessdiagramm
  allowedEntityTypes:
    - business-process
    - user-task
    - service-task
    - start-event
    - end-event
    - exclusive-gateway
    - parallel-gateway
    - pool
    - lane
  allowedConnectionTypes:
    - sequence-flow
    - message-flow
  notationMappings:
    - entityTypeId: user-task
      notationElement: bpmn:UserTask
      defaultWidth: 100
      defaultHeight: 80
    - entityTypeId: start-event
      notationElement: bpmn:StartEvent
      defaultWidth: 36
      defaultHeight: 36
    - entityTypeId: end-event
      notationElement: bpmn:EndEvent
      defaultWidth: 36
      defaultHeight: 36
    - entityTypeId: exclusive-gateway
      notationElement: bpmn:ExclusiveGateway
      defaultWidth: 50
      defaultHeight: 50
    - entityTypeId: pool
      notationElement: bpmn:Pool
      defaultWidth: 600
      defaultHeight: 150
```

## Abgrenzung

- **NICHT** [MetamodelConfiguration](./metamodel-configuration.md): Ein Viewpoint *wählt aus* dem Metamodell aus; er definiert keine neuen Typen. Das Metamodell ist die Grundlage, der Viewpoint ist ein Filter darauf.
- **NICHT** ein Diagram: Ein Viewpoint ist die Definition; ein konkretes Diagramm ist eine Instanz dieses Viewpoints mit konkreten Entitäten und deren Positionen.
- **NICHT** eine Domain-Sicht (§12): Domain-Sichten strukturieren das Modell fachlich (z.B. nach Domäne/Bounded Context); Viewpoints strukturieren die *visuelle Darstellung* nach Notation und erlaubten Typen. Beides kann kombiniert werden.

## Verwendung in Use Cases

- Künftig: UC für Viewpoints verwalten (Anlegen, Bearbeiten user-defined Viewpoints)
- [UC-04: Metamodell gemeinsam konfigurieren](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) – Viewpoints sind Teil der MetamodelConfiguration, die UC-04 verwaltet

## Offene Fragen

- Kann ein einzelner EntityType in mehreren Viewpoints unterschiedliche `notationMappings` haben (d.h. ArchiMate Box in einem View, UML-Klasse in einem anderen)? → Ja, per Design; jeder Viewpoint hat seine eigene Mapping-Tabelle.
- Wie werden Viewpoints in einer Client App vs. Web Portal unterschiedlich genutzt? Client App: voller Editier-Umfang inkl. Drag & Drop (ADR-008 accepted: Client App = Electron, ADR-009 accepted); Web Portal: read-only Rendering.
- Brauchen BPMN-Viewpoints explizite Pool/Lane-Konfiguration, oder reicht der EntityType `pool`/`lane`? → Offen; vermutlich über `allowedEntityTypes` abbildbar.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.2.0 | 2026-06-26 | Business Engineer | ID-basierte Referenzen (entityTypeId statt Name); defaultWidth/defaultHeight in NotationMapping; Notation-Element-Katalog (ArchiMate 3, UML, BPMN 2.0); BR-07/BR-08 (Präfix-Konsistenz, Import-Validierung); Import/Export-Grundlage durch REQ-058–060 |
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft; ArchiMate 3, UML, BPMN 2.0 als Notationen; system-defined + user-defined Viewpoints; NotationMapping als optionales Werteobjekt |
