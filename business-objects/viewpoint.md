---
identifier: viewpoint
name_de: Viewpoint / Architektursicht
name_en: Viewpoint
version: 0.1.0
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

Ein `Viewpoint` ist eine benannte Architektursicht, die festlegt, welche Entitätstypen und Verbindungstypen in einem Diagramm dieses Typs erscheinen dürfen und in welcher Notation sie dargestellt werden. Er ist die Brücke zwischen dem semantischen Metamodell (EntityTypes, Connections) und der visuellen Repräsentation.

## Beschreibung

Ein Viewpoint beantwortet zwei Fragen:

1. **Was darf in dieser Sicht erscheinen?** – Auswahl aus den im Metamodell definierten EntityTypes und Connection-Typen
2. **Wie wird es dargestellt?** – Wahl einer Notation: ArchiMate 3, UML oder BPMN 2.0

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
  ├── EntityTypeDefinitions: ApplicationComponent, DataFlow, SecurityZone, ...
  ├── Stereotypes: SaaSApplication, ...
  ├── ConstraintRules: every-interface-has-owner, ...
  └── Viewpoints:
        ├── [built-in] Application Architecture View (archimate3)
        │     allowedEntityTypes: [ApplicationComponent, ApplicationService, Interface, ...]
        │     allowedConnectionTypes: [DataFlow, ...]
        ├── [built-in] Process View (bpmn2)
        │     allowedEntityTypes: [BusinessProcess, BusinessService, ...]
        │     allowedConnectionTypes: [SequenceFlow, MessageFlow, ...]
        └── [user-defined] Cloud Security View (archimate3)
              allowedEntityTypes: [ApplicationComponent, SecurityZone, TechnologyComponent]
              allowedConnectionTypes: [DataFlow]
```

Ein Diagram in OEA referenziert immer genau einen Viewpoint. Entitäten und Connections, die nicht im `allowedEntityTypes`/`allowedConnectionTypes`-Set des Viewpoints enthalten sind, können diesem Diagramm nicht hinzugefügt werden.

---

### Notation-Mappings

Für jeden EntityType existiert eine **Standard-Mapping-Tabelle** (system-defined), die den OEA-Typ auf das entsprechende Notation-Element abbildet:

| OEA EntityType | ArchiMate 3 | UML | BPMN 2.0 |
|---|---|---|---|
| `ApplicationComponent` | Application Component | `«component»` | – |
| `BusinessProcess` | Business Process | Activity | Process |
| `Interface` | Application Interface | `«interface»` | – |
| `DataFlow` (Connection) | Data Flow (Relationship) | Dependency | Message Flow |
| `SequenceFlow` (Connection) | Triggering (Relationship) | – | Sequence Flow |
| Custom EntityType | Generic Box | Generic Box | Generic Task |

User-defined Viewpoints können für ihre Custom EntityTypes optional eigene Notation-Mappings hinterlegen, um das Default-Rendering zu überschreiben (z.B. spezifische ArchiMate-Symbole für Custom-Typen).

## Attribute

### ViewpointDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | kebab-case, eindeutig innerhalb der MetamodelConfiguration | Stabiler Bezeichner (z.B. `application-architecture-view`) |
| name | string | required | | max. 255 Zeichen, eindeutig innerhalb der MetamodelConfiguration | Anzeigename |
| description | string | optional | | max. 1000 Zeichen | Fachliche Beschreibung, wofür dieser Viewpoint genutzt wird |
| notation | enum | required | | `[archimate3, uml, bpmn2]` | Notation für die Darstellung; ein Viewpoint gehört genau einer Notation an |
| viewpointType | enum | required | `user-defined` | `[system-defined, user-defined]` | `system-defined` = built-in (read-only); `user-defined` = vom Architekturteam angelegt |
| allowedEntityTypes | string[] | required | [] | Alle Namen müssen gültige EntityType-Namen (built-in oder custom) sein | EntityTypes, die in Diagrammen dieses Viewpoints verwendet werden dürfen |
| allowedConnectionTypes | string[] | required | [] | Alle Namen müssen Connection-EntityTypes sein (`isConnection=true`) | Connection-Typen, die als Kanten in Diagrammen dieses Viewpoints erlaubt sind |
| notationMappings | NotationMapping[] | optional | [] | Nur für user-defined; überschreibt Default-Mapping pro EntityType | Optionale Überschreibung der Standard-Notation-Darstellung für Custom EntityTypes |
| createdBy | reference | optional | null | target: person; nur bei `viewpointType=user-defined` | Erstellende Person |
| createdAt | datetime | optional | null | ISO 8601, UTC; nur bei `viewpointType=user-defined` | Zeitpunkt der Anlage |

### NotationMapping (Werteobjekt)

| Attribut | Typ | Optional | Beschreibung |
|---|---|---|---|
| entityTypeName | string | required | OEA EntityType-Name, für den das Mapping gilt |
| notationElement | string | required | Notation-spezifisches Element (z.B. `archimate:ApplicationFunction`, `uml:Interface`, `bpmn:SubProcess`) |
| visualHint | string | optional | Optionaler Stil-Override (z.B. Farbe, Icon); Format TBD |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| definedIn | [metamodel-configuration](./metamodel-configuration.md) | n:1 | no | Jeder Viewpoint gehört zu einer MetamodelConfiguration |
| allowsEntityTypes | EntityTypeDefinition (via name) | n:n | no | Welche Typen in diesem Viewpoint erscheinen dürfen |
| allowsConnectionTypes | EntityTypeDefinition (isConnection=true, via name) | n:n | no | Welche Connection-Typen als Kanten erscheinen dürfen |
| usedBy | Diagram[] | 1:n | yes | Diagramme, die diesen Viewpoint verwenden |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `ViewpointDefinition.name` MUSS innerhalb einer MetamodelConfiguration eindeutig sein | onCreate, onUpdate | – |
| BR-02 | Ein Viewpoint mit `viewpointType=system-defined` DARF NICHT gelöscht oder in `allowedEntityTypes`, `allowedConnectionTypes` und `notation` verändert werden | onDelete, onUpdate | – |
| BR-03 | Alle Einträge in `allowedEntityTypes` MÜSSEN auf gültige EntityType-Namen der zugehörigen MetamodelConfiguration zeigen (built-in + custom) | onCreate, onUpdate | – |
| BR-04 | Alle Einträge in `allowedConnectionTypes` MÜSSEN auf EntityType-Namen zeigen, für die `isConnection=true` gilt | onCreate, onUpdate | – |
| BR-05 | Ein Diagramm DARF nur Entitäten und Connections des Typs enthalten, der im verknüpften Viewpoint's `allowedEntityTypes`/`allowedConnectionTypes` gelistet ist | onDiagramEdit | – |
| BR-06 | Ein `NotationMapping.entityTypeName` MUSS in `allowedEntityTypes` dieses Viewpoints enthalten sein | onCreate, onUpdate | – |

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
    - ApplicationComponent
    - TechnologyComponent
    - SecurityZone        # custom EntityType
    - Node
  allowedConnectionTypes:
    - DataFlow            # custom Connection-Typ mit protocol/dataClassification
  notationMappings:
    - entityTypeName: SecurityZone
      notationElement: archimate:TechnologyFunction
      visualHint: "color=#ffcccc"
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
    - ApplicationComponent
    - ApplicationService
    - ApplicationFunction
    - Interface
    - DataEntity
  allowedConnectionTypes:
    - DataFlow
    - UsedBy        # built-in Connection-Typ: Application → Application
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
- Wie werden Viewpoints in einer Client App vs. Web Portal unterschiedlich genutzt? Client App: voller Editier-Umfang inkl. Drag & Drop; Web Portal: read-only Rendering. (ADR-008 ausstehend)
- Brauchen BPMN-Viewpoints explizite Pool/Lane-Konfiguration, oder reicht der EntityType `Pool`/`Lane`? → Offen; vermutlich über `allowedEntityTypes` abbildbar.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft; ArchiMate 3, UML, BPMN 2.0 als Notationen; system-defined + user-defined Viewpoints; NotationMapping als optionales Werteobjekt |
