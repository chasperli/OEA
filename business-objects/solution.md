---
identifier: solution
name_de: Lösung / Solution Architecture
name_en: Solution
version: 0.2.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Solution Architecture
  - Architecture Initiative
  - Lösungsarchitektur
  - Projekt (KMU)
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept/40-extensibility/14-erweiterbarkeit.md
---

# Business Object: Solution

## Definition

Eine `Solution` ist eine benannte Architecture-Initiative, die beschreibt, welche Entitäten im Rahmen eines Projekts oder einer Transition neu entstehen, sich verändern oder ausser Betrieb gehen. Sie ist der primäre Arbeitsbereich eines Solution Architekten.

## Beschreibung

Eine Solution unterstützt zwei **Betriebsmodi**, die je nach Organisations-Reifegrad gewählt werden:

---

### Modus A: Plateau-Modus (Enterprise)

`fromPlateauId` und `toPlateauId` sind gesetzt. Die Solution beschreibt den **Delta** von einem Baseline-[Plateau](./plateau.md) zu einem Target-Plateau. Entitäten des Baseline-Plateaus werden vererbt; die Solution beschreibt ausschliesslich die Änderungen.

Geeignet für: Organisationen, die formale Architektur-Zustände (Baseline / Target) verwalten und Governance über Plateau-Übergänge benötigen (TOGAF-Reife).

```
Baseline P0 (aktuell produktiv)
  │
  └── Solution „Salesforce-Einführung" (Plateau-Modus)
        fromPlateau: P0 → toPlateau: P1 (Target 2027)
        deltas:
          CRM-Legacy:  retiring
          Salesforce:  new
```

---

### Modus B: Projekt-Modus (KMU)

`fromPlateauId` und `toPlateauId` sind beide `null`. Die Solution ist ein freies Projekt-Workspace. Es gibt keine formale Baseline; der aktuelle Gesamtzustand der Landschaft ergibt sich aus der Summe aller `implemented`-Solutions. Die Solution modelliert direkt Entitäten und deren Änderungen, ohne einen formalen Plateau-Rahmen.

Geeignet für: KMU und Organisationen, die nicht mit dem Plateau-Prinzip arbeiten, sondern Projekte durchführen und die Landschaft kontinuierlich weiterentwickeln.

```
Solution „Salesforce-Einführung" (Projekt-Modus, kein Plateau)
  deltas:
    CRM-Legacy:  retiring
    Salesforce:  new
    [nach implemented: Gesamtzustand = Summe aller Solutions]
```

---

### Vergleich der Modi

| Merkmal | Plateau-Modus | Projekt-Modus |
|---|---|---|
| Plateau-Referenzen | `fromPlateauId` + `toPlateauId` gesetzt | beide `null` |
| Baseline-Erbschaft | Entitäten aus `fromPlateau` | keine; freistehendes Workspace |
| Effektiver Gesamtzustand | Baseline ∪ Solution-Deltas | Summe aller `implemented`-Solutions |
| Geeignet für | Enterprise, TOGAF-Governance | KMU, projektbasierte Arbeitsweise |
| Plateau erforderlich | ja | nein |

---

**Status-Bedeutung**:

| Status | Bedeutung |
|---|---|
| `draft` | Idee, noch unvollständig |
| `proposed` | Vollständig beschrieben, zur Review eingereicht |
| `approved` | Freigegeben zur Umsetzung |
| `in-progress` | Umsetzung läuft |
| `implemented` | Go-Live erfolgt; Delta ist Teil des realisierten Zustands |
| `archived` | Solution aufgegeben oder ersetzt |

**Metamodell-Erweiterung**: Eine Solution kann eine eigene [`MetamodelConfiguration`](./metamodel-configuration.md) mit `scope=solution` haben. Damit kann der Solution Architekt neue Entitätstypen erproben, ohne das gesperrte Instanz-Standardmetamodell zu verändern (REQ-037). Diese Typen sind ausschliesslich innerhalb dieser Solution sichtbar.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig innerhalb der Instanz | Lesbarer Name (z.B. „Cloud-Migration Infrastruktur 2027") |
| description | string | optional | | max. 2000 Zeichen | Ziel und Scope der Solution |
| status | enum | required | `draft` | `[draft, proposed, approved, in-progress, implemented, archived]` | Aktueller Fortschritt |
| fromPlateauId | reference | **optional** | null | target: Plateau (status=baseline oder transition); null = Projekt-Modus | Ausgangszustand (Plateau-Modus); null = kein formales Baseline-Plateau |
| toPlateauId | reference | **optional** | null | target: Plateau (status=target oder transition); null = Projekt-Modus | Zielzustand (Plateau-Modus); null = kein formales Target-Plateau |
| ownerId | reference | required | | target: person | Verantwortliche Person (Solution Architekt) |
| metamodelExtensionId | reference | optional | null | target: MetamodelConfiguration (scope=solution) | Eigene Metamodell-Erweiterung; null = nur Instanz-Standard-Typen verfügbar |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| startsFrom | [plateau](./plateau.md) | n:0..1 | yes | Ausgangszustand (nur Plateau-Modus) |
| targetsTo | [plateau](./plateau.md) | n:0..1 | yes | Zielzustand (nur Plateau-Modus) |
| ownedBy | [person](./person.md) | n:1 | no | Verantwortliche Person |
| hasMetamodelExtension | [metamodel-configuration](./metamodel-configuration.md) | 1:0..1 | yes | Optionale Metamodell-Erweiterung |
| containsDeltas | EntityDelta[] | 1:n | yes | Menge der Entitätsänderungen (neu / geändert / retiring) |

### EntityDelta (Werteobjekt, kein eigenes BO)

| Attribut | Typ | Beschreibung |
|---|---|---|
| entityId | reference | Betroffene Entität (neu: Entität wird durch diese Solution erstmalig angelegt) |
| deltaType | enum `[new, modified, retiring]` | Art der Änderung |
| changes | map | Für `modified`: geänderte Properties (vorher/nachher) |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `fromPlateauId` und `toPlateauId` MÜSSEN entweder **beide gesetzt** oder **beide null** sein (kein Mischzustand) | onCreate, onUpdate | – |
| BR-02 | Sind beide Plateau-IDs gesetzt: `fromPlateauId` ≠ `toPlateauId`; `toPlateauId.status` muss `target` oder `transition` sein | onCreate, onUpdate | – |
| BR-03 | Eine Solution mit `status=implemented` ist read-only | onUpdate | – |
| BR-04 | `metamodelExtensionId` darf nur auf eine `MetamodelConfiguration` mit `scope=solution` zeigen | onCreate, onUpdate | – |
| BR-05 | Entitäten einer Solution sind für andere Solutions sichtbar (Basis für Kollisions-Erkennung bei parallelen Änderungen an derselben Entität) | onRead | – |

## Lifecycle

```
draft → proposed → approved → in-progress → implemented
              ↘ archived (aufgegeben)
```

**Plateau-Modus nach `implemented`**: Go-Live-Prozess setzt `toPlateauId.status` von `target` auf `realized`; das alte Baseline-Plateau wird `realized`; das realisierte Plateau wird zum neuen Baseline.

**Projekt-Modus nach `implemented`**: Solution ist abgeschlossen; ihre Deltas sind fester Bestandteil des realisierten Gesamtzustands (keine Plateau-Übergänge nötig).

## Beispiele

**Projekt-Modus (KMU, kein Plateau)**:
```
Solution: „Salesforce-Einführung" (Projekt-Modus)
  fromPlateau: null
  toPlateau:   null
  status: draft → implemented
  deltas:
    - CRM-Legacy:  deltaType=retiring
    - Salesforce:  deltaType=new, type=ApplicationComponent
    - Integration: deltaType=new, type=Interface
```
Nach `implemented` ist der realisierte Gesamtzustand die Summe aller `implemented`-Solutions der Instanz.

**Plateau-Modus (Enterprise)**:
```
Baseline P0: CRM-Legacy [active], ERP-Core [active]

Solution: „Salesforce-Einführung" (Plateau-Modus)
  fromPlateau: P0  →  toPlateau: P1 (Target 2027)
  deltas:
    - CRM-Legacy:  deltaType=retiring
    - Salesforce:  deltaType=new, type=ApplicationComponent
    - Integration: deltaType=new, type=Interface

Target P1 (nach Go-Live):
  - ERP-Core    [active]    ← geerbt von P0
  - Salesforce  [active]    ← neu durch Solution
  - CRM-Legacy  [retiring]  ← wird ausser Betrieb genommen
```

## Abgrenzung

- **NICHT** ein [Plateau](./plateau.md): Ein Plateau ist ein stabiler Zustand; eine Solution ist der Änderungsprozess. Im Projekt-Modus existieren Solutions ohne jedes Plateau.
- **NICHT** ein Projekt**: Eine Solution ist eine Architektur-Beschreibung; das Projekt (Budget, Timeline, Teams) ist extern (PPM-Tool-Integration ist in §23 als offene Frage vermerkt).
- **NICHT** ein ADR: Architektur-Entscheidungen begleiten eine Solution, sind aber separate Artefakte.

## Verwendung in Use Cases

- Künftig: UC für Solution-Verwaltung (Anlegen, Review-Prozess, Go-Live; Projekt-Modus und Plateau-Modus)
- [UC-04](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) (Metamodell-Erweiterung für Solution, REQ-037)

## Notizen

TOGAF-Referenz (Plateau-Modus): „Solution Architecture" in Phase E/F. Die `EntityDelta`-Struktur entspricht TOGAF Architecture Change Request + Gap Analysis. Die Fragen zur Referenz-Integrität über Plateaus (§23 Punkt 6) betreffen ausschliesslich den Plateau-Modus; im Projekt-Modus gibt es keine Plateau-Grenzen.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft |
| 0.2.0 | 2026-06-25 | Business Engineer | `fromPlateauId` + `toPlateauId` optional gemacht; Projekt-Modus (KMU) eingeführt; BR-01 angepasst (entweder beide gesetzt oder beide null); Vergleichstabelle der Modi |
