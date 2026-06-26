---
identifier: metamodel-configuration
name_de: Metamodell-Konfiguration
name_en: Metamodel Configuration
version: 0.6.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Metamodell
  - Schema-Konfiguration
  - Instanz-Metamodell
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/40-extensibility/14-erweiterbarkeit.md
  - concept: concept/40-extensibility/15-schema-evolution.md
---

# Business Object: MetamodelConfiguration

## Definition

Die `MetamodelConfiguration` ist die instanzweite Konfiguration, die festlegt, welche Entitätstypen, Stereotypen und Constraint-Regeln in einem OEA-Repository verfügbar sind. Sie ist das Aggregate, das alle vom Architekturteam verwalteten Schema-Elemente bündelt.

## Beschreibung

Jede OEA-Instanz hat genau eine `MetamodelConfiguration`. Sie besteht aus zwei Schichten:

**Eingebaute Elemente (built-in, read-only)**:
Die TOGAF-basierten Kern-Entitätstypen aus [§6 Kern-Entitätstypen](../concept/20-entities/06-kern-entitaetstypen.md) sind immer vorhanden:
- Business Architecture: `Actor`, `Role`, `OrganizationUnit`, `BusinessService`, `BusinessFunction`, `BusinessProcess`, `Capability`, `ValueStream`, `InformationObject`
- Data Architecture: `DataEntity`, `LogicalDataComponent`, `PhysicalDataComponent`
- Application Architecture: `ApplicationComponent`, `ApplicationService`, `ApplicationFunction`, `Interface`
- Technology Architecture: `TechnologyComponent`, `Platform`, `Node`, `CommunicationPath`

Diese Typen können nicht gelöscht oder in ihrer Grundstruktur verändert werden. Sie können durch Stereotypen und optionale Properties erweitert werden.

**Konfigurierbare Elemente**:
Das Architekturteam kann die Konfiguration durch sieben Kategorien erweitern (gemäß [§14 Erweiterbarkeit](../concept/40-extensibility/14-erweiterbarkeit.md)):
1. **Custom EntityTypes**: neue Typen, die nicht im TOGAF-Kern enthalten sind (z.B. `SecurityZone`, `DataPipeline`); ein EntityType kann als **Connection-Typ** markiert werden, der eine Verbindung zwischen zwei Entitäten modelliert und Start und Ziel erzwingt (REQ-036); jeder EntityType kann beliebig viele **PropertyDefinitions** mit Datentyp, Validierungs-Modus und Kategorie erhalten
2. **Stereotypes**: nicht-brechende Erweiterungen bestehender Typen mit zusätzlichen Properties (z.B. `SaaSApplication` auf `ApplicationComponent`)
3. **ConstraintRules**: deklarative Ausdrucks-Validierungsregeln für Entities (z.B. "jede Interface muss einen Owner haben")
4. **Viewpoints**: benannte Architektursichten, die festlegen, welche EntityTypes und Connection-Typen in einem Diagramm dieses Typs erscheinen dürfen und in welcher Notation dargestellt wird (ArchiMate 3, UML oder BPMN 2.0); siehe [viewpoint.md](./viewpoint.md)
5. **ArchitectureLayers**: frei definierbare Architekturebenen (z.B. Business, Application, Technology oder domänenspezifische Ebenen); jedem EntityType kann genau eine Ebene zugewiesen werden; steuern Sortierung, Farb-Codierung und Filterbarkeit im Web Portal
6. **ArchitectureDomains**: frei definierbare Architekturdomänen (z.B. Finance, HR, Logistik); entity-instanzseitige Zuordnung (ein Entity kann mehreren Domänen zugehören); Basis für Domänen-Filter in Katalogen und Dashboard-Gruppierungen
7. **MandatoryConnectionConstraints**: deklarative Regeln, die eine Pflicht-Connection zwischen zwei EntityTypes erzwingen (z.B. „jede ApplicationComponent muss mindestens eine `runs-on`-Connection zu einer TechnologyComponent haben"); ergänzen ConstraintRules um strukturelle Verbindungs-Validierung

Der **Bearbeitungs-Modus** (`editMode`) steuert, ob Änderungen am Metamodell via GUI und Import oder ausschliesslich per Import möglich sind. Im Sperrmodus `import-only` ist die GUI-Bearbeitung für alle Nutzer deaktiviert; das YAML-File wird zur einzigen Quelle der Wahrheit (REQ-035).

**Zwei-Ebenen-Scoping** (REQ-037): Eine `MetamodelConfiguration` hat einen `scope`:
- `scope=instance`: das Instanz-Standardmetamodell (Singleton pro Instanz); `editMode` hier steuerbar; kann gesperrt werden
- `scope=solution`: Erweiterungs-Konfiguration für eine spezifische [Solution](./solution.md); erbt alle Typen der Instanz-Konfiguration (`parentId` verweist auf diese); kann eigene EntityTypes, Stereotypes und ConstraintRules hinzufügen; hat eigenen `editMode` unabhängig vom Parent; Solution-Typen sind nur innerhalb dieser Solution sichtbar

Das **effektive Metamodell** einer Solution ergibt sich als Union: Instanz-Typen ∪ Solution-eigene Typen. Solution-Typen können keine Instanz-Typen überschreiben oder entfernen.

Änderungen an der Konfiguration werden versioniert und im Audit-Log festgehalten.

## Attribute

### MetamodelConfiguration (Wurzel-Objekt)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| scope | enum | required | `instance` | `[instance, solution]` | Unterscheidet Instanz-Standard (Singleton) von Solution-Erweiterung |
| instanceId | reference | required | | target: instance; eindeutig wenn scope=instance | Verknüpfung zur OEA-Instanz |
| solutionId | reference | optional | null | target: solution; nur gesetzt wenn scope=solution | Verknüpfung zur Solution (scope=solution) |
| parentId | reference | optional | null | target: MetamodelConfiguration (scope=instance); nur gesetzt wenn scope=solution | Eltern-Konfiguration, deren Typen geerbt werden |
| schemaVersion | string | required | "1.0" | Semver | Aktuelle Schema-Version der Konfiguration |
| lastModifiedAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der letzten Änderung |
| lastModifiedBy | reference | required | | target: person | Person, die die letzte Änderung vorgenommen hat |
| editMode | enum | required | `gui-and-import` | `[gui-and-import, import-only]` | Steuert, ob GUI-Bearbeitung erlaubt ist; `import-only` = Sperrmodus (REQ-035); gilt unabhängig pro Scope-Ebene |
| entityTypeDefinitions | EntityTypeDefinition[] | required | [] | | Liste der benutzerdefinierten Entitätstypen |
| stereotypes | Stereotype[] | required | [] | | Liste der definierten Stereotypen |
| constraintRules | ConstraintRule[] | required | [] | | Liste der Ausdrucks-Constraint-Regeln |
| viewpoints | ViewpointDefinition[] | required | [] | Enthält system-defined (built-in) + user-defined Viewpoints | Liste der Viewpoints; Verweis auf [viewpoint.md](./viewpoint.md) für Vollspezifikation |
| architectureLayers | ArchitectureLayerDefinition[] | required | [] | | Liste der Architekturebenen; leer = keine Ebenen-Kategorisierung |
| architectureDomains | ArchitectureDomainDefinition[] | required | [] | | Liste der Architekturdomänen; leer = keine Domänen-Kategorisierung |
| mandatoryConnectionConstraints | MandatoryConnectionConstraint[] | required | [] | | Deklarative Pflicht-Connection-Regeln |
| arc42Collections | Arc42ChapterCollection[] | required | [] | | Konfigurierbare Arc42-Kapitelsammlungen (Verweis auf [arc42.md](./arc42.md)) |

### EntityTypeDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | kebab-case, global eindeutig | Stabiler Bezeichner (z.B. `security-zone`) |
| name | string | required | | PascalCase, eindeutig über alle Typen | Anzeigename (z.B. `SecurityZone`) |
| extends | string | optional | null | muss ein gültiger EntityType-Name sein | Basis-Typ; null = kein Eltern-Typ |
| description | string | optional | | max. 1000 Zeichen | Fachliche Beschreibung des Typs |
| properties | PropertyDefinition[] | required | [] | | Typ-spezifische Attribute |
| relations | RelationDefinition[] | required | [] | | Erlaubte Relationen zu anderen Typen |
| isBuiltIn | boolean | required | false | read-only; true nur für §6-Typen | Kennzeichnet eingebaute Typen |
| isConnection | boolean | required | false | | Markiert den Typ als Connection-Typ; erzwingt `source` und `target` an jeder Instanz (REQ-036) |
| allowedSourceTypes | string[] | optional | null | null = beliebiger EntityType oder Connection-Typ zulässig | Einschränkung: welche Typen als Start-Entität erlaubt sind |
| allowedTargetTypes | string[] | optional | null | null = beliebiger EntityType oder Connection-Typ zulässig | Einschränkung: welche Typen als Ziel-Entität erlaubt sind |
| allowsConnectionAsSource | boolean | optional | false | nur sinnvoll wenn `isConnection=true` | Gibt frei, dass Instanzen dieses Typs als `sourceEntityId` einer weiteren Connection fungieren dürfen (n-Connection, ADR-010); Default false |
| architectureLayerId | string | optional | null | muss gültige ArchitectureLayerDefinition.id referenzieren | Zuweisung zur Architekturebene; null = keine Ebene zugewiesen |
| creationSteps | CreationStep[] | optional | [] | | Definiert den Wizard bei der Anlage; leer = einfaches Anlage-Formular ohne Wizard |

### PropertyDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | camelCase; eindeutig pro EntityType | Technischer Attribut-Name (z.B. `investitionskostenPrognose`) |
| displayLabel | string | optional | | max. 100 Zeichen | Anzeigename in der GUI; überschreibt `name` wenn gesetzt |
| dataType | PropertyDataType | required | | | Datentyp-Definition (Details: PropertyDataType) |
| validationMode | enum | required | `optional` | `[mandatory, warning, optional]` | `mandatory` = Fehler beim Speichern wenn leer; `warning` = Hinweis, aber Speichern erlaubt; `optional` = keine Prüfung |
| category | string | required | | max. 100 Zeichen; frei wählbar | Kategorie-Zuordnung (z.B. `"Kosten"`, `"Organisation"`, `"Compliance"`, `"Sicherheit"`) |
| defaultValue | string | optional | null | muss zur dataType-Definition passen | Standardwert als String-Repräsentation |
| description | string | optional | | max. 500 Zeichen | Fachliche Beschreibung des Attributs |

### PropertyDataType

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| kind | enum | required | | `[int, varchar, enum]` | Basistyp: `int` = Ganzzahl; `varchar` = Text mit Länge; `enum` = Auswahlliste |
| maxLength | integer | conditional | | nur bei `kind=varchar`; Wertebereich 1–4000 | Maximale Zeichenanzahl |
| enumValues | string[] | conditional | | nur bei `kind=enum`; mindestens 2 Einträge; eindeutig | Erlaubte Auswahlwerte |

### RelationDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | camelCase | Relationsbezeichnung (z.B. `contains`) |
| target | string | required | | gültiger EntityType-Name | Ziel-Typ der Relation |
| cardinality | string | required | | Format: `min..max` (z.B. `0..n`, `1..1`) | Kardinalität |
| description | string | optional | | | Fachliche Bedeutung der Relation |

### Stereotype

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | PascalCase, eindeutig | Stereotyp-Name (z.B. `SaaSApplication`) |
| basedOn | string | required | | gültiger EntityType-Name | Basis-Typ, der erweitert wird |
| properties | PropertyDefinition[] | required | [] | | Zusätzliche Attribute |
| description | string | optional | | | Fachliche Bedeutung |

### ConstraintRule

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | kebab-case, eindeutig | Regelbezeichner (z.B. `every-interface-has-owner`) |
| appliesTo | string | required | | gültiger EntityType-Name | Geltungsbereich: Entitätstyp |
| scope | ScopeDefinition | optional | null | null = gilt für alle Instanzen des Typs | Einschränkung auf Teilmenge (§15.2) |
| rule | string | required | | Ausdruck-String | Validierungsausdruck (z.B. `entity.owner != null`) |
| severity | enum | required | warning | `[hint, warning, error]` | Schweregrad bei Regelverletzung |
| message | string | required | | max. 500 Zeichen | Meldung für den Nutzer bei Verletzung |

### ArchitectureLayerDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | kebab-case, eindeutig | Technischer Bezeichner (z.B. `business-layer`, `application-layer`) |
| name | string | required | | eindeutig in der MetamodelConfiguration | Anzeigename (z.B. „Business", „Applikation", „Technologie") |
| sortOrder | integer | required | | ≥ 0; steuert Anzeigereihenfolge | Reihenfolge in Listen und Diagrammen (aufsteigend) |
| color | string | optional | | Hex-Farbcode (#RRGGBB) | Farb-Codierung für visuelle Abgrenzung |
| description | string | optional | | max. 500 Zeichen | Beschreibung des Geltungsbereichs dieser Ebene |

**Verwendung**: Jeder `EntityTypeDefinition` kann über `architectureLayerId` genau einer Ebene zugewiesen werden. Entity-Instanzen erben die Ebene ihres Typs. Ebenen steuern Sortierung und Filterbarkeit in Katalogen und Dashboards.

### ArchitectureDomainDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | kebab-case, eindeutig | Technischer Bezeichner (z.B. `finance`, `hr`, `logistics`) |
| name | string | required | | eindeutig in der MetamodelConfiguration | Anzeigename (z.B. „Finance", „Human Resources", „Logistik") |
| color | string | optional | | Hex-Farbcode (#RRGGBB) | Farb-Codierung |
| description | string | optional | | max. 500 Zeichen | Beschreibung der fachlichen Domäne |
| responsiblePersonId | reference | optional | null | target: person | Fachlich Verantwortliche Person |

**Verwendung**: Die Domänenzuordnung erfolgt **instanzseitig** – jede Entity-Instanz kann einer oder mehreren Domänen zugeordnet werden (Mehrfach-Zuordnung erlaubt, da Systeme oft domänenübergreifend genutzt werden). Die Zuordnung wird als System-Attribut `architectureDomainIds: string[]` an jeder Entität gespeichert.

### MandatoryConnectionConstraint

Deklarative Regel, die vorschreibt, dass jede Instanz eines bestimmten EntityTypes mindestens eine Connection eines definierten Connection-Typs zu einem Ziel-EntityType haben muss.

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | kebab-case, eindeutig | Regelbezeichner (z.B. `appcomp-must-run-on-tech`) |
| sourceEntityType | string | required | | gültige EntityType-ID (built-in oder custom) | Quell-Entitätstyp, für den die Regel gilt |
| connectionType | string | required | | EntityType-ID mit `isConnection=true` | Connection-Typ, der als Pflicht-Verbindung gefordert wird |
| targetEntityType | string | optional | null | gültige EntityType-ID oder null | Ziel-Entitätstyp; null = beliebiger Zieltyp akzeptiert |
| validationMode | enum | required | `warning` | `[error, warning]` | `error` = Speichern blockiert; `warning` = Hinweis, Speichern erlaubt |
| message | string | required | | max. 500 Zeichen | Fehlermeldung oder Hinweis für den Nutzer |

### CreationStep

Beschreibt eine einzelne Seite (Schritt) im Anlage-Wizard, der beim Erstellen einer Entität dieses Typs durchlaufen wird. Wenn `EntityTypeDefinition.creationSteps` nicht leer ist, öffnet das System automatisch einen mehrseitigen Wizard statt des einfachen Anlage-Formulars.

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| stepId | string | required | | kebab-case; eindeutig innerhalb `creationSteps` | Technischer Bezeichner des Schritts |
| title | string | required | | max. 100 Zeichen | Seitentitel im Wizard (z.B. „Basisdaten", „Domänen-Zuordnung") |
| description | string | optional | null | max. 500 Zeichen | Hilfetext unterhalb des Titels |
| stepType | enum | required | | `[properties, domainAssignment, connectionAssignment]` | Art des Wizard-Schritts |
| propertyCategory | string | conditional | null | Pflicht wenn `stepType=properties` | Zeigt alle `PropertyDefinition`-Felder dieser Kategorie auf der Seite |
| connectionType | string | conditional | null | Pflicht wenn `stepType=connectionAssignment`; muss `isConnection=true` haben | Connection-Typ, den der Nutzer hier verknüpfen soll |
| targetEntityType | string | optional | null | nur relevant wenn `stepType=connectionAssignment` | Schränkt Zielauswahl auf diesen Typ ein; null = beliebiger Typ erlaubt |
| minConnections | integer | optional | 1 | nur relevant wenn `stepType=connectionAssignment`; ≥ 1 | Mindestanzahl Verbindungen; 0 = optional |

**stepType-Semantik**:
- `properties`: zeigt alle `PropertyDefinitions` der angegebenen `propertyCategory` als ausfüllbares Formular
- `domainAssignment`: zeigt MultiSelect aller `ArchitectureDomainDefinition`-Einträge; Nutzer wählt Zugehörigkeit
- `connectionAssignment`: zeigt Suchfeld + Auswahl für Zielentitäten; erzeugt Connection(s) nach Fertigstellung

**Wizard-Ablauf**: N Schritte → N-1 mal „Weiter" + einmal „Fertig". Die Entität wird erst nach Klick auf „Fertig" atomisch persistiert (Entität + alle angegebenen Connections in einer Transaktion). Bis dahin existiert sie nicht im Repository.

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| belongsTo | instance | 1:1 | no | Jede Instanz hat genau eine Konfiguration |
| modifiedBy | [person](./person.md) | n:1 | no | Letzte Änderung ist einer Person zugeordnet |

**Hinweise**:
- Die `MetamodelConfiguration` ist kein EA-Modell-Element; sie ist Infrastruktur, die das Modell formt.
- Änderungen an der Konfiguration wirken auf alle künftig angelegten Entitäten; bestehende Entitäten werden durch Schema-Evolution (§15) migriert.
- Built-in EntityTypes (`isBuiltIn=true`) werden im Code verwaltet, nicht in der DB-gespeicherten Konfiguration. Sie sind in der API und im UI sichtbar, aber nicht editierbar.

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Ein `EntityTypeDefinition.name` muss über alle Typen (built-in + custom) eindeutig sein | onCreate, onUpdate | – |
| BR-02 | Ein Built-in EntityType (`isBuiltIn=true`) darf nicht gelöscht oder in seiner Grundstruktur verändert werden | onDelete, onUpdate | – |
| BR-03 | Ein Custom EntityType kann nur gelöscht werden, wenn keine Instanz dieses Typs im Repository existiert | onDelete | – |
| BR-04 | Eine `ConstraintRule` mit `severity=error` blockiert das Speichern von Entitäten, die die Regel verletzen | onValidate | – |
| BR-05 | Änderungen an der `MetamodelConfiguration` erfordern eine berechtigt konfigurierende Person (Metamodell-Bearbeiter-Rolle) | onCreate, onUpdate, onDelete | – |
| BR-06 | Ist `editMode=import-only` einer Konfiguration, DÜRFEN Create-, Update- und Delete-Operationen auf EntityTypeDefinitions, Stereotypes und ConstraintRules dieser Konfiguration via GUI-API NICHT ausgeführt werden; nur der Import-Pfad (REQ-033) bleibt aktiv; gilt unabhängig pro Scope-Ebene: eine Solution-Erweiterung kann `gui-and-import` haben, während die Instanz-Konfiguration `import-only` ist | onUpdate | – |
| BR-09 | Eine `MetamodelConfiguration` mit `scope=solution` DARF keine Typen enthalten, die im Eltern-Objekt (`parentId`) bereits definiert sind (keine Überschreibung, nur Ergänzung) | onCreate, onUpdate | – |
| BR-10 | Eine `MetamodelConfiguration` mit `scope=solution` MUSS eine gültige `parentId` haben, die auf eine `MetamodelConfiguration` mit `scope=instance` derselben OEA-Instanz zeigt | onCreate | – |
| BR-07 | Eine Instanz eines Connection-Typs (`isConnection=true`) MUSS genau eine `source`- und eine `target`-Referenz besitzen; beide Referenzen dürfen auf Entitäten beliebiger EntityType-Klasse zeigen (inkl. andere Connection-Instanzen), sofern die jeweiligen `allowedSourceTypes`/`allowedTargetTypes`-Listen eingehalten werden | onCreate, onUpdate | – |
| BR-08 | `allowedSourceTypes`, `allowedTargetTypes` und `allowsConnectionAsSource` dürfen nur gesetzt werden, wenn `isConnection=true`; bei `isConnection=false` sind sie bedeutungslos und werden ignoriert | onCreate, onUpdate | – |
| BR-11 | `PropertyDefinition.dataType.kind=varchar` erfordert `maxLength` ≥ 1 | onCreate, onUpdate | – |
| BR-12 | `PropertyDefinition.dataType.kind=enum` erfordert `enumValues` mit mindestens 2 eindeutigen Einträgen | onCreate, onUpdate | – |
| BR-13 | `PropertyDefinition.name` muss innerhalb eines EntityType eindeutig sein (case-insensitive) | onCreate, onUpdate | – |
| BR-14 | `PropertyDefinition.category` darf nicht leer sein; Leerzeichen-only gilt als leer | onCreate, onUpdate | – |
| BR-15 | `EntityTypeDefinition.architectureLayerId` muss, wenn gesetzt, eine `ArchitectureLayerDefinition.id` derselben `MetamodelConfiguration` (oder deren Parent-Konfiguration) referenzieren | onCreate, onUpdate | – |
| BR-16 | `MandatoryConnectionConstraint.connectionType` muss ein `EntityTypeDefinition` mit `isConnection=true` referenzieren | onCreate, onUpdate | – |
| BR-17 | `MandatoryConnectionConstraint.sourceEntityType` und `targetEntityType` (wenn gesetzt) müssen gültige EntityType-IDs sein | onCreate, onUpdate | – |
| BR-18 | `ArchitectureLayerDefinition.id` und `ArchitectureDomainDefinition.id` müssen innerhalb der MetamodelConfiguration eindeutig sein (gemeinsamer Namensraum erlaubt Konflikte nicht) | onCreate, onUpdate | – |
| BR-19 | `CreationStep.stepId` muss innerhalb der `creationSteps`-Liste eines EntityType eindeutig sein | onCreate, onUpdate | – |
| BR-20 | `CreationStep.propertyCategory` muss, wenn gesetzt, einem vorhandenen `PropertyDefinition.category`-Wert des zugehörigen EntityType entsprechen | onCreate, onUpdate | – |
| BR-21 | `CreationStep.connectionType` muss, wenn gesetzt, eine gültige EntityType-ID mit `isConnection=true` in derselben MetamodelConfiguration sein | onCreate, onUpdate | – |
| BR-22 | Wenn der Anlage-Wizard gestartet wird (`creationSteps` nicht leer): die Entität wird erst nach Klick auf „Fertig" persistiert; ein Abbruch (ESC oder X) erzeugt keine Entität und hinterlässt keinen Zustand im Repository | onEntityCreate | – |

## Beispiele

**Custom EntityType (YAML-Darstellung, §14.1)**:
```yaml
entityType: SecurityZone
id: security-zone
extends: null
description: "Logische Netzwerkzone mit definiertem Trust-Level"
architectureLayerId: technology-layer
properties:
  - name: trustLevel
    displayLabel: "Vertrauensstufe"
    dataType: { kind: enum, enumValues: [public, dmz, internal, restricted] }
    validationMode: mandatory
    category: "Sicherheit"
  - name: complianceScope
    displayLabel: "Compliance-Scope"
    dataType: { kind: varchar, maxLength: 200 }
    validationMode: optional
    category: "Compliance"
  - name: investitionskostenPrognose
    displayLabel: "Investitionskosten Prognose (CHF)"
    dataType: { kind: int }
    validationMode: warning
    category: "Kosten"
relations:
  - name: contains
    target: TechnologyComponent
    cardinality: 0..n
```

**Stereotype (YAML-Darstellung, §14.2)**:
```yaml
stereotype: SaaSApplication
basedOn: ApplicationComponent
description: "Software-as-a-Service Anwendung ohne eigenen Hosting-Betrieb"
properties:
  - name: vendor
    type: string
    required: true
  - name: contractEndDate
    type: date
    required: false
  - name: dataResidency
    type: string
    required: false
```

**Connection-EntityType (YAML-Darstellung, REQ-036)**:
```yaml
entityType: DataFlow
id: data-flow
isConnection: true
description: "Datenfluss zwischen zwei Komponenten; Start und Ziel sind Pflicht"
allowedSourceTypes: [ApplicationComponent, ApplicationService, DataFlow]
allowedTargetTypes: [ApplicationComponent, ApplicationService, DataFlow]
properties:
  - name: protocol
    type: enum
    required: false
    enumValues: [REST, gRPC, AMQP, JDBC, SFTP]
  - name: dataClassification
    type: enum
    required: false
    enumValues: [public, internal, confidential, restricted]
```
*T-Beziehung*: `DataFlow.allowedSourceTypes` enthält `DataFlow` → ein DataFlow kann auf einen anderen DataFlow zeigen, was eine T-Verbindung ergibt (z.B. Abzweigung einer Datenleitung).

**Constraint-Regel (YAML-Darstellung, §14.3)**:
```yaml
name: every-interface-has-owner
appliesTo: Interface
rule: "entity.owner != null"
severity: error
message: "Jede Interface muss einen Owner-ApplicationComponent zugewiesen haben"
```

**ArchitectureLayer-Definitionen (YAML-Darstellung)**:
```yaml
architectureLayers:
  - id: business-layer
    name: "Business"
    sortOrder: 1
    color: "#F5A623"
    description: "Fachliche Prozesse, Rollen und Organisationseinheiten"
  - id: application-layer
    name: "Applikation"
    sortOrder: 2
    color: "#4A90D9"
    description: "Applikationskomponenten und -services"
  - id: technology-layer
    name: "Technologie"
    sortOrder: 3
    color: "#7ED321"
    description: "Infrastruktur, Plattformen und technische Dienste"
```

**ArchitectureDomain-Definitionen (YAML-Darstellung)**:
```yaml
architectureDomains:
  - id: finance
    name: "Finance"
    color: "#9B59B6"
    description: "Finanzbuchhaltung, Controlling, Treasury"
  - id: hr
    name: "Human Resources"
    color: "#E74C3C"
  - id: logistics
    name: "Logistik"
    color: "#1ABC9C"
```

**MandatoryConnectionConstraint (YAML-Darstellung)**:
```yaml
mandatoryConnectionConstraints:
  - name: appcomp-must-run-on-tech
    sourceEntityType: application-component
    connectionType: runs-on
    targetEntityType: technology-component
    validationMode: warning
    message: "Jede ApplicationComponent sollte mindestens eine 'runs-on'-Connection zu einer TechnologyComponent haben"
  - name: solution-must-realize-plateau
    sourceEntityType: solution
    connectionType: realizes
    targetEntityType: plateau
    validationMode: error
    message: "Jede Solution muss genau einem Plateau zugeordnet sein"
```

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [person](./person.md): Die Konfiguration gehört der Instanz, nicht einer Person; Personen sind nur Bearbeiter.
- **NICHT** ein EA-Modell-Element: `ApplicationComponent`, `BusinessProcess` etc. sind Instanzen der durch die `MetamodelConfiguration` definierten Typen, nicht Teil der Konfiguration selbst.
- **NICHT** ADR: Architektur-Entscheidungen (Welchen EntityType verwenden wir für Kafka?) sind ADRs; die `MetamodelConfiguration` ist die technische Umsetzung dieser Entscheidung.

## Verwendung in Use Cases

- [UC-04: Metamodell konfigurieren](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) (erzeugt und verwaltet MetamodelConfiguration inkl. Viewpoints)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft |
| 0.2.0 | 2026-06-25 | Business Engineer | `editMode` (Sperrmodus REQ-035) und Connection-Attribute (`isConnection`, `allowedSourceTypes`, `allowedTargetTypes`) zu EntityTypeDefinition hinzugefügt (REQ-036); BR-06/07/08 ergänzt |
| 0.3.0 | 2026-06-25 | Business Engineer | Zwei-Ebenen-Scoping eingeführt (REQ-037): `scope`, `architectureId`, `parentId`; BR-09/10 ergänzt; `editMode` gilt unabhängig pro Scope-Ebene |
| 0.4.0 | 2026-06-25 | Business Engineer | `scope=architecture` → `scope=solution`; `architectureId` → `solutionId`; Scope-Container präzisiert als Solution (Plateau-Prinzip, Option 3) |
| 0.5.0 | 2026-06-26 | Business Engineer | Viewpoints als vierte konfigurierbare Kategorie ergänzt; `viewpoints: ViewpointDefinition[]` zum Wurzel-Objekt hinzugefügt; Verweis auf viewpoint.md |
| 0.6.0 | 2026-06-26 | Business Engineer | PropertyDefinition überarbeitet: `type/required` → `dataType (kind: int/varchar/enum)` + `validationMode (mandatory/warning/optional)` + `category`; neues Sub-Objekt `PropertyDataType`; `architectureLayerId` zu EntityTypeDefinition; neue Sub-Objekte `ArchitectureLayerDefinition`, `ArchitectureDomainDefinition`, `MandatoryConnectionConstraint`; drei neue Felder im Wurzel-Objekt; BR-11–18 ergänzt; YAML-Beispiele aktualisiert |
| 0.7.0 | 2026-06-26 | Business Engineer | `allowsConnectionAsSource: boolean` (Default false) zu EntityTypeDefinition hinzugefügt (ADR-010, n-Connection); BR-08 erweitert |
| 0.8.0 | 2026-06-26 | Business Engineer | `creationSteps: CreationStep[]` zu EntityTypeDefinition hinzugefügt; neues Sub-Objekt `CreationStep` mit stepTypes properties/domainAssignment/connectionAssignment; BR-19–22 ergänzt (REQ-066) |
| 0.9.0 | 2026-06-26 | Business Engineer | `arc42Collections: Arc42ChapterCollection[]` zum Wurzel-Objekt hinzugefügt (Verweis auf arc42.md); eingebaute EntityTypes `arc42-meta-object` und `arc42-describes` deklariert (REQ-067) |
