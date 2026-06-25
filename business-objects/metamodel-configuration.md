---
identifier: metamodel-configuration
name_de: Metamodell-Konfiguration
name_en: Metamodel Configuration
version: 0.1.0
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
Das Architekturteam kann die Konfiguration durch drei Kategorien erweitern (gemäß [§14 Erweiterbarkeit](../concept/40-extensibility/14-erweiterbarkeit.md)):
1. **Custom EntityTypes**: neue Typen, die nicht im TOGAF-Kern enthalten sind (z.B. `SecurityZone`, `DataPipeline`)
2. **Stereotypes**: nicht-brechende Erweiterungen bestehender Typen mit zusätzlichen Properties (z.B. `SaaSApplication` auf `ApplicationComponent`)
3. **ConstraintRules**: deklarative Validierungsregeln für Entities (z.B. "jede Interface muss einen Owner haben")

Änderungen an der Konfiguration werden versioniert und im Audit-Log festgehalten.

## Attribute

### MetamodelConfiguration (Wurzel-Objekt)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| instanceId | reference | required | | target: instance; 1:1 | Verknüpfung zur OEA-Instanz |
| schemaVersion | string | required | "1.0" | Semver | Aktuelle Schema-Version der Konfiguration |
| lastModifiedAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der letzten Änderung |
| lastModifiedBy | reference | required | | target: person | Person, die die letzte Änderung vorgenommen hat |
| entityTypeDefinitions | EntityTypeDefinition[] | required | [] | | Liste der benutzerdefinierten Entitätstypen |
| stereotypes | Stereotype[] | required | [] | | Liste der definierten Stereotypen |
| constraintRules | ConstraintRule[] | required | [] | | Liste der Constraint-Regeln |

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

### PropertyDefinition

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | camelCase | Attribut-Name |
| type | enum | required | | `[string, integer, float, boolean, date, enum, string[]]` | Datentyp |
| required | boolean | required | false | | Pflichtfeld-Kennzeichnung |
| enumValues | string[] | optional | | nur bei `type=enum` | Erlaubte Enum-Werte |
| defaultValue | any | optional | | muss zum Typ passen | Standardwert |
| description | string | optional | | | Beschreibung des Attributs |

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

## Beispiele

**Custom EntityType (YAML-Darstellung, §14.1)**:
```yaml
entityType: SecurityZone
id: security-zone
extends: null
description: "Logische Netzwerkzone mit definiertem Trust-Level"
properties:
  - name: trustLevel
    type: enum
    required: true
    enumValues: [public, dmz, internal, restricted]
  - name: complianceScope
    type: string[]
    required: false
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

**Constraint-Regel (YAML-Darstellung, §14.3)**:
```yaml
name: every-interface-has-owner
appliesTo: Interface
rule: "entity.owner != null"
severity: error
message: "Jede Interface muss einen Owner-ApplicationComponent zugewiesen haben"
```

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [person](./person.md): Die Konfiguration gehört der Instanz, nicht einer Person; Personen sind nur Bearbeiter.
- **NICHT** ein EA-Modell-Element: `ApplicationComponent`, `BusinessProcess` etc. sind Instanzen der durch die `MetamodelConfiguration` definierten Typen, nicht Teil der Konfiguration selbst.
- **NICHT** ADR: Architektur-Entscheidungen (Welchen EntityType verwenden wir für Kafka?) sind ADRs; die `MetamodelConfiguration` ist die technische Umsetzung dieser Entscheidung.

## Verwendung in Use Cases

- [UC-04: Metamodell konfigurieren](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) (erzeugt und verwaltet MetamodelConfiguration)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft |
