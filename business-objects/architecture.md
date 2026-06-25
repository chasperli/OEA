---
identifier: architecture
name_de: Architektur
name_en: Architecture
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Domänen-Architektur
  - Architektur-Workspace
  - Architecture Scope
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/40-extensibility/14-erweiterbarkeit.md
---

# Business Object: Architecture

## Definition

Eine `Architecture` ist ein benannter, abgegrenzter Arbeitsbereich innerhalb einer OEA-Instanz, der eine zusammenhängende Menge von EA-Entitäten, eine zugehörige Stakeholder-Gruppe und optional ein eigenes Metamodell-Erweiterungsobjekt bündelt.

## Beschreibung

Eine OEA-Instanz kann mehrere `Architecture`-Objekte enthalten. Typische Verwendungen:

- **Domänen-Architektur**: „Cloud-Plattform-Architektur", „Data-Platform-Architektur" – langlebige Domänen mit eigenem Architekturteam
- **Initiatives-Architektur**: „Migration SAP S/4HANA" – zeitlich begrenzte Initiative mit eigenem Scope
- **Experimentelle Architektur**: Erprobungsbereich für neue Metamodell-Typen, bevor sie ins Default-Metamodell übernommen werden

Jede `Architecture` kann eine eigene [MetamodelConfiguration](./metamodel-configuration.md) mit `scope=architecture` haben. Diese Erweiterungskonfiguration:
- Erbt alle Entitätstypen aus der Instanz-Standardkonfiguration (`scope=instance`)
- Kann zusätzliche Custom EntityTypes, Stereotypen und Constraint-Regeln hinzufügen, die **nur innerhalb dieser Architecture** verfügbar sind
- Hat einen eigenen `editMode` (unabhängig vom Instanz-Level)

Der Mechanismus ermöglicht es, das Instanz-Standardmetamodell zu sperren (`import-only`) und gleichzeitig in einzelnen Architectures experimentell neue Typen zu erproben.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig innerhalb der Instanz | Lesbarer Name (z.B. „Cloud-Plattform-Architektur") |
| description | string | optional | | max. 2000 Zeichen | Zweck und Scope der Architecture |
| status | enum | required | active | `[active, archived]` | Aktiver Arbeitsbereich oder archiviert |
| ownerId | reference | required | | target: person | Verantwortliche Person (Lead-Architekt) |
| metamodelExtensionId | reference | optional | null | target: MetamodelConfiguration (scope=architecture) | Eigene Metamodell-Erweiterung; null = nur Instanz-Standard-Typen verfügbar |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |
| archivedAt | datetime | optional | | ISO 8601, UTC; nur gesetzt wenn status=archived | Zeitpunkt der Archivierung |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| hasMetamodelExtension | [metamodel-configuration](./metamodel-configuration.md) | 1:0..1 | yes | Optionale Metamodell-Erweiterung dieser Architecture |
| ownedBy | [person](./person.md) | n:1 | no | Verantwortliche Person |
| containsEntities | (EA-Entitäten) | 1:n | yes | Alle Entitäten, die diesem Architecture-Scope zugeordnet sind |

**Hinweise**:
- Eine Entität kann mehreren Architectures zugeordnet sein (Shared Entity zwischen Scopes).
- Ist `metamodelExtensionId=null`, verwendet die Architecture ausschliesslich das Instanz-Standardmetamodell.
- Ein archiviertes Architecture-Objekt ist read-only; keine Änderungen an zugehörigen Entitäten möglich.

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `Architecture.name` muss innerhalb der Instanz eindeutig sein | onCreate, onUpdate | – |
| BR-02 | `metamodelExtensionId` darf nur auf eine `MetamodelConfiguration` mit `scope=architecture` zeigen | onCreate, onUpdate | – |
| BR-03 | Eine archivierte Architecture (`status=archived`) kann keine neuen Entitäten aufnehmen und ihre Metamodell-Erweiterung nicht verändern | onArchive | – |

## Lifecycle

```
active → archived
```

- `active`: Architecture ist in Betrieb; Entitäten können angelegt und bearbeitet werden.
- `archived`: Architecture ist abgeschlossen; read-only; Entitäten und Metamodell-Erweiterung eingefroren.

## Abgrenzung zu ähnlichen Objekten

- **NICHT** eine EA-Entität: `Architecture` ist ein Organisations- und Scope-Konzept, kein Modell-Element wie `ApplicationComponent`.
- **NICHT** eine Instanz: Eine OEA-Instanz ist die Gesamtinstallation für eine Organisation; eine `Architecture` ist ein thematischer Teilbereich innerhalb einer Instanz.
- **NICHT** ein ADR: Architektur-Entscheidungen werden in ADRs dokumentiert; die `Architecture` ist der Scope, in dem diese Entscheidungen gelten.

## Verwendung in Use Cases

- [UC-04: Metamodell konfigurieren](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) (Architecture als Scope für Metamodell-Erweiterung)

## Notizen

`Architecture` wird in künftigen Use Cases (Entitäts-Erfassung, Views, Exports) als primärer Scope-Container verwendet. Das BO ist bewusst schlank gehalten; weitere Attribute (Team, Budget, Timeline) können per Stereotype oder Custom Properties ergänzt werden.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft; eingeführt als Scope-Container für architektur-spezifische Metamodell-Erweiterungen (REQ-037) |
