---
identifier: tree-node
name_de: Navigationsbaum-Knoten
name_en: Tree Node
version: 0.1.0
status: draft
maturity: initial
owner_role: Lead Enterprise Architect
aliases:
  - Ordner
  - Navigationseintrag
  - Architektur-Navigator
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
---

# Business Object: TreeNode

## Definition

Ein `TreeNode` ist ein Ordner im hierarchischen Navigationsbaum einer OEA-Instanz. Er kann Unterordner (weitere TreeNodes) und Verweise auf Repository-Inhalte (Entitäten, Diagramme, Kataloge) enthalten. Der Baum dient ausschliesslich der Navigation und Organisation; er beeinflusst nicht die Speicherung oder Semantik der referenzierten Objekte.

## Beschreibung

Das Architecture-Repository einer OEA-Instanz kann schnell wachsen: Hunderte von Entitäten, viele Diagramme zu verschiedenen Viewpoints, dutzende Kataloge. Der Navigationsbaum gibt dem Enterprise Architekten die Kontrolle, diesen Inhalt in einer fachlich sinnvollen Hierarchie zu präsentieren – ohne die internen Objekt-Identitäten oder ihre semantische Verknüpfung zu verändern.

```
Architecture Repository (Root)
├── Business Architecture
│   ├── [Katalog] Geschäftsfähigkeiten
│   ├── [Katalog] Geschäftsprozesse
│   └── [Diagramm] Business Architecture Overview
├── Applikationslandschaft
│   ├── [Katalog] Application Inventory
│   ├── [Katalog] Schnittstellen-Übersicht
│   └── [Diagramm] Applikations-Kooperation
├── Technologie-Infrastruktur
│   └── [Diagramm] Deployment Architecture
├── Architektur-Entscheide
│   ├── [Entität] ADR-006 (Auth Stack)
│   └── [Entität] ADR-007 (Canvas Library)
└── Solutions
    ├── ERP-Erweiterung Logistics
    └── CRM-Ablösung
```

---

### Inhaltstypen eines TreeNode

Ein TreeNode kann Einträge von vier Typen enthalten:

| Typ | Beschreibung | Beispiel |
|---|---|---|
| `tree-node` | Unterordner | „Business Architecture" |
| `entity` | Verweis auf eine Entität im Repository | ApplicationComponent „CRM-System" |
| `diagram` | Verweis auf ein Diagramm (Instanz eines Viewpoints) | „Application Cooperation View – aktuell" |
| `catalog` | Verweis auf einen [Catalog](./catalog.md) | „Application Inventory" |

---

### Soft-Reference-Prinzip

Ein Repository-Objekt (Entität, Diagramm, Katalog) kann in **mehreren** TreeNodes gleichzeitig referenziert werden. Der TreeNode besitzt das Objekt nicht; er verweist nur darauf. Das Löschen eines TreeNode-Eintrags löscht nicht das Objekt selbst – es entfernt nur den Navigationsverweis.

Analogie: TreeNodes verhalten sich wie Lesezeichen oder Shortcuts, nicht wie Dateisystem-Ordner mit Ownership.

---

### Wurzelknoten

Jede OEA-Instanz hat genau **einen Wurzelknoten** (`parentId = null`). Alle weiteren TreeNodes sind Nachkommen dieses Wurzelknotens. Der Wurzelknoten wird automatisch beim Anlegen einer Instanz erstellt und kann nicht gelöscht werden; sein Name kann angepasst werden (Default: Name der OEA-Instanz).

---

### Beziehung zu anderen Darstellungsformen

| Darstellungsform | Zweck | Primäres Objekt |
|---|---|---|
| Navigationsbaum (TreeNode) | Organisation und Navigation aller Repository-Inhalte | TreeNode |
| Diagramm | Graphische Visualisierung (Viewpoint-basiert) | Diagram + [Viewpoint](./viewpoint.md) |
| Katalog | Tabellarische Abfrage mit Joins und Filtern | [Catalog](./catalog.md) |

Alle drei Sichten zeigen denselben Datenbestand; sie sind komplementär, nicht konkurierend.

## Attribute

### TreeNode (Ordner)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| name | string | required | | max. 255 Zeichen, eindeutig innerhalb desselben Eltern-Knotens | Lesbarer Name des Ordners |
| description | string | optional | | max. 500 Zeichen | Kurzbeschreibung des Ordner-Inhalts |
| parentId | reference | optional | null | target: TreeNode; null = Wurzelknoten | Übergeordneter Knoten; null nur für den Instanz-Wurzelknoten |
| sortOrder | integer | required | 0 | >= 0 | Reihenfolge innerhalb des Eltern-Knotens |
| items | TreeNodeItem[] | required | [] | | Geordnete Liste von Verweisen in diesem Knoten |
| instanceId | reference | required | | target: OEA-Instanz | Zugehörige OEA-Instanz |
| createdBy | reference | required | | target: person | Erstellende Person |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |

### TreeNodeItem (Verweis auf Repository-Inhalt)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4 | Interner Schlüssel des Eintrags |
| itemType | enum | required | | `[tree-node, entity, diagram, catalog]` | Typ des referenzierten Objekts |
| referenceId | string | required | | UUID des referenzierten Objekts | Verweis auf Entität / Diagramm / Katalog / Unterordner |
| displayLabel | string | optional | = Name des Objekts | max. 255 Zeichen | Optionaler Anzeigetext im Baum (überschreibt den Namen des Originals) |
| sortOrder | integer | required | 0 | >= 0 | Reihenfolge innerhalb des übergeordneten TreeNode |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| parent | TreeNode | n:0..1 | yes | Eltern-Knoten (null = Wurzel) |
| children | TreeNode | 1:n | yes | Unterordner dieses Knotens |
| refersToEntities | entity | n:n | yes | Entitäten, auf die dieser Knoten verweist |
| refersTodiagrams | diagram (future BO) | n:n | yes | Diagramme, auf die dieser Knoten verweist |
| refersToCatalogs | [catalog](./catalog.md) | n:n | yes | Kataloge, auf die dieser Knoten verweist |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `TreeNode.name` MUSS innerhalb aller direkten Kinder desselben `parentId` eindeutig sein | onCreate, onUpdate | – |
| BR-02 | Der Wurzelknoten (`parentId = null`) DARF NICHT gelöscht werden | onDelete | – |
| BR-03 | Ein `TreeNode` DARF NICHT sein eigener Vorfahre sein (keine Zyklen) | onCreate, onUpdate | – |
| BR-04 | Ein `TreeNodeItem.referenceId` MUSS auf ein existierendes Objekt des angegebenen `itemType` zeigen | onCreate; prüfbar per Konsistenzcheck | – |
| BR-05 | Das Löschen eines `TreeNode` MUSS alle seine Kinder-Knoten und deren Items rekursiv entfernen; referenzierte Objekte (Entitäten, Diagramme, Kataloge) werden NICHT gelöscht | onDelete | – |
| BR-06 | Ein `TreeNodeItem` kann dasselbe Objekt (`referenceId`) in mehreren verschiedenen TreeNodes referenzieren (Soft-Reference-Prinzip) | – | – |

## Lifecycle

TreeNodes haben keinen formalen Status-Lifecycle. Sie existieren solange die OEA-Instanz aktiv ist. Einzelne Items können hinzugefügt, umbenannt (displayLabel), umsortiert und entfernt werden. Der Wurzelknoten wird beim Instanz-Setup automatisch angelegt.

## Beispiele

**Struktur für ein KMU (Projekt-Modus)**:
```
Root: "Architektur-Repository Musterfirma AG"
├── Geschäftsarchitektur
│   └── [Katalog] Geschäftsfähigkeiten (capabilities)
├── IT-Landschaft
│   ├── [Katalog] Application Inventory
│   ├── [Katalog] Schnittstellen-Übersicht (DataFlow → Interface)
│   └── [Diagramm] Layered View (archimate3)
└── Initiatives
    ├── ERP-Erweiterung 2026
    │   └── [Entität] Solution: ERP-Erweiterung 2026
    └── CRM-Ablösung
        └── [Entität] Solution: CRM-Ablösung
```

**Item, das mehrfach im Baum erscheint**:
```
[Katalog] "Application Inventory" erscheint in:
  1. IT-Landschaft/Application Inventory  ← primäre Ablage
  2. Compliance/ISO 27001 View/Systeminventar  ← Cross-Referenz
  (das Katalog-Objekt existiert einmal; zwei TreeNodeItems zeigen darauf)
```

## Abgrenzung

- **NICHT** Archivspeicher: TreeNodes speichern keine Daten; sie sind reine Navigation. Das Löschen eines TreeNode löscht nicht die referenzierten Objekte.
- **NICHT** Zugriffssteuerung: Berechtigungen werden nicht über TreeNodes vergeben (eigenes Konzept, noch offen).
- **NICHT** [Viewpoint](./viewpoint.md): Ein Viewpoint definiert, welche Typen in einem Diagramm erlaubt sind; ein TreeNode organisiert Diagramme, Kataloge und Entitäten für die Navigation.

## Verwendung in Use Cases

- Künftig: UC für Navigationsbaum verwalten (primärer Akteur: SH-03 Kurt)
- Kann als Default-Einstiegspunkt des Client Apps und Web Portals dienen (ADR-008 ausstehend)

## Offene Fragen

- Soll es mehrere benannte Bäume pro Instanz geben (z.B. „EA-Team-Baum" vs. „Stakeholder-Publikation")? → Offen; aktuell ein Baum pro Instanz.
- Soll der Baum rollenbasiert sichtbar sein (bestimmte Ordner nur für EA-Team)? → Hängt von Berechtigungskonzept ab (noch offen).
- Können Solutions als TreeNodes abgebildet werden (Unterordner-Struktur für Solution-Inhalte)? → Ja, eine Solution könnte als Ordner + ihre EntityDeltas als Items modelliert werden. Details TBD.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft; Soft-Reference-Prinzip, Wurzelknoten, vier Item-Typen (entity/diagram/catalog/tree-node) |
