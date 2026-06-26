---
identifier: architecture-entity
name_de: Architektur-Entität
name_en: Architecture Entity
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Entity
  - Architektur-Element
  - Komponente
  - ArchEntity
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/40-extensibility/14-erweiterbarkeit.md
  - concept: concept/40-extensibility/15-schema-evolution.md
---

# Business Object: ArchitectureEntity

## Definition

Eine `ArchitectureEntity` ist eine konkrete, benannte Instanz eines Entitätstyps im Architekturmodell – z.B. die Anwendung „SAP S/4HANA" als Instanz des Typs `application-component`. Jede Entität besitzt eine **global eindeutige, fortlaufende Integer-ID** (beginnend bei 1, menschenlesbar) und eine **obligatorische Referenz auf ihre EntityTypeDefinition** (den Metatyp). Diese Verbindung ist unveränderlich und strukturell erzwungen.

## Beschreibung

ArchitectureEntities sind die zentralen Inhaltsobjekte jeder OEA-Instanz. Sie bilden die Bausteine der Unternehmensarchitektur: Anwendungen, Dienste, Prozesse, Schnittstellen, Server, Domänen, Personen-Rollen usw. Der konkrete Typ jeder Entität – also was eine Entität *ist* – wird ausschliesslich durch ihre `entityTypeId` bestimmt.

Die ID ist ein **fortlaufender Integer** (1, 2, 3, …), der instanzweit eindeutig ist. Das macht IDs in URLs, API-Aufrufen, Exporten und manuellen Referenzen lesbar und merkbar. Verbindungen (`isConnection=true`) und Elemente (`isConnection=false`) teilen denselben Nummernraum.

**Zwei Arten von Entitäten:**

| Art | Merkmal | Beispiel |
|---|---|---|
| **Element** (Knoten) | `EntityType.isConnection=false` | ApplicationComponent „SAP ERP", BusinessProcess „Rechnungsfreigabe" |
| **Verbindung** (Kante) | `EntityType.isConnection=true` | DataFlow „ERP→CRM", SequenceFlow „Schritt 1 → Schritt 2" |

Verbindungen sind vollwertige Entitäten mit eigener UUID, eigenem Metatyp und eigenen Properties. Sie referenzieren zusätzlich ihre Quell- und Ziel-Entität.

---

### Metatyp-Bindung

Die Verbindung zwischen `ArchitectureEntity` und ihrer `EntityTypeDefinition` ist die strukturell wichtigste Invariante des Modells:

```
EntityTypeDefinition (im Metamodell)        ArchitectureEntity (Instanz)
─────────────────────────────────────       ────────────────────────────
id:             application-component  ←── entityTypeId: application-component
name:           ApplicationComponent        id:           42
isConnection:   false                       name:         SAP S/4HANA
propertyDefs:   [investitionskosten, ...]   properties:   [{investitionskosten: "450000"}]
architectureLayerId: application-layer      architectureDomainIds: [finance-domain]
```

Die `entityTypeId` bestimmt:
- welche **Properties** die Entität haben kann und muss (PropertyDefinitions mit validationMode)
- welches **Notation-Element** verwendet wird (NotationMapping in Viewpoints)
- welche **Standardgrösse** im Canvas gilt (NotationMapping.defaultWidth / defaultHeight)
- ob sie als **Knoten oder Kante** im Diagramm erscheint (`isConnection`)
- zu welcher **Architektur-Schicht** sie gehört (via `architectureLayerId` der EntityTypeDefinition)

---

### Diagramm-Bezug

Wenn eine Entität in einem Diagramm (Viewpoint-Instanz) platziert wird, wird sie als Shape auf dem Canvas referenziert. Die Shape-Darstellung (Notation-Element, Grösse, Farbe) leitet sich vom Viewpoint's `NotationMapping` für `entityTypeId` ab. Die Entity selbst enthält keine Layout-Informationen – diese liegen im Diagram-Objekt.

---

## Property-Kategorien

Jede Entität hat zwei Arten von Properties:

### General-Kategorie (systemdefiniert, gesperrt)

Die `General`-Kategorie enthält die unveränderlichen Systemfelder jeder ArchitectureEntity. Sie ist in der UI immer an erster Stelle sichtbar. Im Metamodell können keine weiteren Properties zur `General`-Kategorie hinzugefügt werden.

| Feld | Anzeigename | Editierbar |
|---|---|---|
| `id` | ID | nein (systemvergeben) |
| `name` | Name | ja |
| `description` | Beschreibung | ja |
| `entityTypeId` | Typ | nein (unveränderlich nach Anlage) |
| `isLogical` | Logisch | ja |

### Custom-Kategorien (metamodell-konfiguriert)

Alle weiteren Properties werden in `PropertyGroup`-Kategorien definiert, die im Metamodell pro EntityType konfiguriert werden (z.B. „Finanzen", „Governance", „Technisch"). Diese Properties landen in `properties JSONB`. Keine custom Kategorie darf den reservierten Namen `General` verwenden.

---

## Attribute

### ArchitectureEntity

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | integer | required | | positiver Ganzzahl-Wert ≥ 1; instanzweit eindeutig; fortlaufend; unveränderlich nach Anlage | **[General]** Primärschlüssel; vom System bei onCreate als nächste freie Sequenznummer vergeben |
| entityTypeId | string | required | | FK → `EntityTypeDefinition.id`; muss in MetamodelConfiguration der Instanz existieren; unveränderlich nach Anlage | **[General]** Metatyp-Referenz; legt Typ, Properties und Notation fest |
| name | string | required | | max. 255 Zeichen | **[General]** Anzeigename (z.B. „SAP S/4HANA", „Rechnungsfreigabe") |
| description | string | required | `""` | max. 2000 Zeichen; nie null | **[General]** Fachliche Beschreibung; immer vorhanden, initial leer |
| isLogical | boolean | required | `true` | | **[General]** `true` = logische/konzeptionelle Entität (z.B. Fähigkeit, Prozess, Daten-Konzept); `false` = physische Entität (konkrete Umsetzung, z.B. Server, Datenbank-Tabelle, Applikations-Instanz). Relevant für Plateau-Darstellung (s.u.) |
| version | integer | required | `1` | ≥ 1; vom System inkrementiert bei jedem Update | Optimistic-Lock-Zähler (ADR-016); Client muss aktuelle Version beim Update mitsenden |
| stereotypeIds | string[] | optional | `[]` | FK → `StereotypeDefinition.id`; alle IDs müssen im Metamodell existieren und auf den `entityTypeId` anwendbar sein | Zugewiesene Stereotypes (z.B. `saas-application`) |
| architectureDomainIds | string[] | optional | `[]` | FK → `ArchitectureDomainDefinition.id`; Instanz-Zuweisung (ergänzt Layer-Zuweisung des Metatyps) | Architektur-Domänen, denen diese Entität zugeordnet ist |
| properties | PropertyValue[] | optional | `[]` | Keys müssen `PropertyDefinition.name` des `entityTypeId`-Typs entsprechen; mandatory-Properties müssen befüllt sein | Werte der vom Metatyp definierten Custom-Properties (nicht-General) |
| sourceEntityId | integer | conditional | null | REQUIRED wenn `EntityType.isConnection=true`; FK → ArchitectureEntity.id mit `isConnection=false`; unveränderlich nach Anlage | Quell-Entität (nur bei Verbindungen) |
| targetEntityId | integer | conditional | null | REQUIRED wenn `EntityType.isConnection=true`; FK → ArchitectureEntity.id mit `isConnection=false`; unveränderlich nach Anlage | Ziel-Entität (nur bei Verbindungen) |
| createdAt | datetime | required | | ISO 8601, UTC | Anlage-Zeitpunkt |
| createdBy | reference | required | | target: person | Anlegende Person |
| updatedAt | datetime | optional | null | ISO 8601, UTC | Letzte Änderung |
| updatedBy | reference | optional | null | target: person | Zuletzt ändernde Person |

### isLogical — Bedeutung im Plateau-Kontext

| Wert | Bedeutung | Plateau-Verhalten |
|---|---|---|
| `true` (logisch) | Konzeptionelle Entität (z.B. „CRM-Fähigkeit", „Kundenstamm" als Daten-Konzept) | Existiert über Plateau-Grenzen hinweg; Lifecycle-State ändert sich pro Plateau |
| `false` (physisch) | Konkrete Umsetzung (z.B. „SAP CRM 7.0 auf Server PROD-01", „Tabelle customers in PostgreSQL") | Hat klaren Zeitraum der Produktiv-Existenz; typischerweise `active` in Baseline, `retired` in Target |

`isLogical` kann beim Anlegen gesetzt werden und ist nachträglich editierbar. Die `EntityTypeDefinition` im Metamodell kann einen `defaultIsLogical`-Wert für neue Instanzen vorgeben (z.B. `capability` → `true`; `server` → `false`).

### EntityVersion (Werteobjekt / Snapshot)

Pro Update auf einer ArchitectureEntity wird automatisch ein Version-Snapshot erzeugt (ADR-016). Der Snapshot wird **vor** dem Update geschrieben.

| Attribut | Typ | Beschreibung |
|---|---|---|
| entityId | integer | FK → ArchitectureEntity.id |
| version | integer | Version zum Zeitpunkt dieses Snapshots |
| name | string | Name vor dem Update |
| description | string | Beschreibung vor dem Update |
| isLogical | boolean | Logisch-Flag vor dem Update |
| properties | object | Custom-Properties vor dem Update (JSONB) |
| changedBy | integer | Wer hat dieses Update ausgelöst |
| changedAt | datetime | Zeitpunkt des Updates |

### PropertyValue (Werteobjekt)

| Attribut | Typ | Optional | Constraints | Beschreibung |
|---|---|---|---|---|
| propertyName | string | required | muss einem `PropertyDefinition.name` des `entityTypeId`-Typs entsprechen | Schlüssel; referenziert die PropertyDefinition |
| value | string \| null | required | Serialisierungsformat: `int` als `"42"`, `enum` als Enum-Value-String, `varchar` direkt | Wert; null = nicht befüllt |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| instanceOf | [metamodel-configuration](./metamodel-configuration.md) → EntityTypeDefinition | n:1 | **no** | Jede Entität gehört genau einem Metatyp an; PFLICHT |
| hasSterotypes | [metamodel-configuration](./metamodel-configuration.md) → StereotypeDefinition | n:0..n | yes | Zugewiesene Stereotypes |
| belongsToDomains | [metamodel-configuration](./metamodel-configuration.md) → ArchitectureDomainDefinition | n:0..n | yes | Architektur-Domänen-Zugehörigkeit |
| source | ArchitectureEntity (isConnection=false) | 1:0..1 | conditional | Quell-Entität (nur Verbindungen) |
| target | ArchitectureEntity (isConnection=false) | 1:0..1 | conditional | Ziel-Entität (nur Verbindungen) |
| referencedBy | EntityDelta (in [solution](./solution.md)) | 1:0..n | yes | Solutions, die diese Entität ändern |
| appearsIn | Diagram[] | 1:0..n | yes | Diagramme, in denen diese Entität platziert ist |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Jede ArchitectureEntity MUSS eine `entityTypeId` haben, die auf eine existierende `EntityTypeDefinition` in der MetamodelConfiguration der Instanz zeigt | onCreate | – |
| BR-02 | `id` ist ein fortlaufender Integer ≥ 1; er wird bei Anlage systemseitig als nächste freie Sequenznummer vergeben; Elemente und Verbindungen teilen denselben Nummernraum; unveränderlich nach Anlage | onCreate | – |
| BR-03 | `entityTypeId` ist unveränderlich nach Anlage; ein Typ-Wechsel ist nicht möglich (neue Entität anlegen, alte löschen) | onUpdate | – |
| BR-04 | Wenn `EntityTypeDefinition.isConnection=true`: `sourceEntityId` UND `targetEntityId` MÜSSEN gesetzt sein. `sourceEntityId` darf auf eine Connection-Instanz zeigen, **nur wenn** deren Metatyp `allowsConnectionAsSource=true` trägt (ADR-010 n-Connection); andernfalls muss `sourceEntityId` auf eine Nicht-Connection-Instanz zeigen. `targetEntityId` muss immer auf eine Nicht-Connection-Instanz zeigen. | onCreate, onUpdate | ADR-010 |
| BR-05 | Wenn `EntityTypeDefinition.isConnection=false`: `sourceEntityId` und `targetEntityId` MÜSSEN null sein | onCreate, onUpdate | – |
| BR-06 | Alle `PropertyValue.propertyName`-Werte MÜSSEN PropertyDefinitions des `entityTypeId`-Metatyps entsprechen; unbekannte Property-Namen werden abgelehnt (422) | onCreate, onUpdate | – |
| BR-07 | PropertyDefinitions mit `validationMode=mandatory` MÜSSEN einen nicht-leeren Wert haben; fehlt der Wert → 422; `validationMode=warning` → Save mit Warnung-Response möglich; `validationMode=optional` → immer valid | onCreate, onUpdate | – |
| BR-08 | `architectureDomainIds` dürfen nur auf `ArchitectureDomainDefinition.id`-Werte der MetamodelConfiguration der Instanz zeigen | onCreate, onUpdate | – |
| BR-09 | `stereotypeIds` dürfen nur Stereotypes referenzieren, die für den `entityTypeId`-Metatyp definiert sind | onCreate, onUpdate | – |
| BR-10 | `sourceEntityId` und `targetEntityId` sind nach Anlage einer Verbindung unveränderlich; Kantenrichtung kann nicht geändert werden | onUpdate | – |
| BR-11 | `description` ist immer vorhanden (nie null); initial leerer String `""`; max. 2000 Zeichen | onCreate, onUpdate | – |
| BR-12 | `isLogical` ist ein Boolean; Default ist `true`; kann nachträglich geändert werden | onCreate, onUpdate | – |
| BR-13 | Bei jedem Update auf eine ArchitectureEntity MUSS der Client die aktuelle `version` mitsenden; stimmt sie nicht mit dem gespeicherten Wert überein → HTTP 409 Conflict; nach erfolgreichem Update wird `version` um 1 erhöht (Optimistic Locking, ADR-016) | onUpdate | ADR-016 |
| BR-14 | Vor jedem Update MUSS ein EntityVersion-Snapshot des vorherigen Zustands in `entity_versions` geschrieben werden; dieser Snapshot ist unveränderlich | onUpdate | ADR-016 |
| BR-15 | Keine `PropertyGroup` im Metamodell darf den reservierten Namen `general` (case-insensitive) tragen; General-Felder sind systemdefiniert und nicht erweiterbar | Metamodell-Konfiguration | – |

## Lifecycle

ArchitectureEntities haben keinen eigenständigen Lifecycle-Status. Ihr Zustand innerhalb des Architekturmodells (aktiv, auslaufend, realisiert) wird kontextuell gesteuert:

- **Projekt-Modus**: Status ergibt sich aus den `EntityDelta.deltaType`-Werten aller `implemented`-Solutions
- **Plateau-Modus**: Jedes Plateau hat für jede enthaltene Entität einen Zustand (`active`, `retiring`, `retired`); der Zustand ist platauspezifisch und in der `PlateauEntityMembership` gespeichert (offen; vgl. architecture.md Offene Fragen)

## Beispiele

**Element-Entität (ApplicationComponent)**:
```yaml
entity:
  id: 1
  entityTypeId: "application-component"
  name: "SAP S/4HANA"
  description: "Zentrales ERP-System der Finanzabteilung"
  stereotypeIds:
    - "on-premise-application"
  architectureDomainIds:
    - "finance-domain"
    - "hr-domain"
  properties:
    - propertyName: "investitionskosten"
      value: "450000"
    - propertyName: "betreiber"
      value: "IT-Operations"
  sourceEntityId: null
  targetEntityId: null
```

**Verbindungs-Entität (DataFlow)** – ID 5, verknüpft Entität 1 mit Entität 3:
```yaml
entity:
  id: 5
  entityTypeId: "data-flow"
  name: "ERP → CRM Kundenstamm-Sync"
  description: "Nächtliche Synchronisierung des Kundenstamms"
  properties:
    - propertyName: "protocol"
      value: "REST"
    - propertyName: "dataClassification"
      value: "internal"
  sourceEntityId: 1   # SAP S/4HANA
  targetEntityId: 3   # Salesforce CRM
```

**Entität mit mandatory Property nicht befüllt → Warnung**:
```yaml
entity:
  id: 7
  entityTypeId: "application-component"
  name: "Legacy-Schnittstelle"
  properties: []   # investitionskosten (validationMode=mandatory) fehlt
# → Save möglich wenn validationMode=warning; Fehler wenn validationMode=mandatory
```

## Abgrenzung

- **NICHT** [EntityTypeDefinition](./metamodel-configuration.md): Eine EntityTypeDefinition ist der Typ (Metatyp); eine ArchitectureEntity ist die Instanz. Typen definieren was es gibt; Entitäten sind konkrete Elemente.
- **NICHT** ein [EntityDelta](./solution.md): Ein EntityDelta beschreibt *was sich ändert* (new/modified/retiring); die ArchitectureEntity ist das *Objekt, das sich ändert*.
- **NICHT** ein Diagram-Shape: Ein Shape ist die visuelle Repräsentation einer Entität in einem bestimmten Diagramm (inkl. Position, Grösse-Override); die Entität selbst ist positionslos.

## Verwendung in Use Cases

- [UC-05: Architektur-Vision einer Änderungsinitiative beschreiben](../requirements/use-cases/UC-05-architektur-vision-beschreiben.md) – EntityDeltas legen neue Entitäten an oder modifizieren bestehende
- Künftig: UC für direkte Entitäts-Verwaltung (Create/Update/Delete ohne Solution-Kontext)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft; Integer-ID; entityTypeId als obligatorische Metatyp-Referenz; PropertyValue-Werteobjekt; BR-01–BR-10 |
| 0.2.0 | 2026-06-26 | Business Engineer | BR-04 erweitert: `sourceEntityId` darf auf Connection-Instanz zeigen wenn `allowsConnectionAsSource=true` (ADR-010) |
| 0.3.0 | 2026-06-27 | Business Engineer | `isLogical: boolean` (General, default true) hinzugefügt (BR-12); `description` als Pflichtfeld mit Default `""` (BR-11); General-Kategorie formalisiert (BR-15); `version`-Attribut für Optimistic Locking (BR-13); EntityVersion-Snapshot-Mechanismus (BR-14; ADR-016) |
