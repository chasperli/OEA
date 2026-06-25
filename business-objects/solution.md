---
identifier: solution
name_de: Lösung / Solution Architecture
name_en: Solution
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Solution Architecture
  - Architecture Initiative
  - Lösungsarchitektur
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept/40-extensibility/14-erweiterbarkeit.md
---

# Business Object: Solution

## Definition

Eine `Solution` ist eine benannte Architecture-Initiative, die beschreibt, wie eine Menge von Entitäten vom Zustand eines **Baseline-[Plateaus](./plateau.md)** in den Zustand eines **Target-Plateaus** überführt wird. Sie ist der primäre Arbeitsbereich eines Solution Architekten und kann noch nicht produktiv sein.

## Beschreibung

Während [Plateaus](./plateau.md) die stabilen Zustände der Unternehmensarchitektur beschreiben, beschreibt eine `Solution` den **Delta** zwischen zwei Plateaus: welche Entitäten neu entstehen, sich verändern oder ausser Betrieb gehen. Mehrere Solutions können gleichzeitig existieren und auf dasselbe oder verschiedene Target-Plateaus hinarbeiten.

**Beispiele**:
- „Ablösung Legacy-CRM durch Salesforce" (Solution): nimmt `ApplicationComponent CRM-Legacy` (Baseline) → `retired`; fügt `ApplicationComponent Salesforce-CRM` (Target) → `active` ein
- „Cloud-Migration Infrastruktur Q3 2027" (Solution): bewegt 12 TechnologyComponents aus On-Prem → Cloud-Region

**Status-Bedeutung**:

| Status | Bedeutung | Wer arbeitet daran |
|---|---|---|
| `draft` | Idee, noch unvollständig | Solution Architekt (allein) |
| `proposed` | Vollständig beschrieben, zur Review eingereicht | Architecture Review Board |
| `approved` | Freigegeben zur Umsetzung | Projektteam |
| `in-progress` | Umsetzung läuft; Solution ist noch nicht im Plateau | Projektteam + Solution Architekt |
| `implemented` | Go-Live erfolgt; Target-Plateau ist neues Baseline | abgeschlossen |
| `archived` | Solution aufgegeben oder ersetzt | – |

**Metamodell-Erweiterung**: Eine Solution kann eine eigene [`MetamodelConfiguration`](./metamodel-configuration.md) mit `scope=solution` haben. Damit kann der Solution Architekt neue Entitätstypen erproben, die für diese Initiative spezifisch sind, ohne das gesperrte Instanz-Standardmetamodell zu verändern (REQ-037). Diese Typen sind ausschliesslich innerhalb dieser Solution sichtbar.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig innerhalb der Instanz | Lesbarer Name (z.B. „Cloud-Migration Infrastruktur 2027") |
| description | string | optional | | max. 2000 Zeichen | Ziel und Scope der Solution |
| status | enum | required | `draft` | `[draft, proposed, approved, in-progress, implemented, archived]` | Aktueller Fortschritt |
| fromPlateauId | reference | required | | target: Plateau (status=baseline oder transition) | Ausgangszustand: das Plateau, von dem die Solution ausgeht |
| toPlateauId | reference | required | | target: Plateau (status=target oder transition); muss anderes Plateau als fromPlateauId sein | Zielzustand: das Plateau, auf das die Solution hinarbeitet |
| ownerId | reference | required | | target: person | Verantwortliche Person (Solution Architekt) |
| metamodelExtensionId | reference | optional | null | target: MetamodelConfiguration (scope=solution) | Eigene Metamodell-Erweiterung; null = nur Instanz-Standard-Typen verfügbar |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| startsFrom | [plateau](./plateau.md) | n:1 | no | Ausgangszustand (Baseline oder Transition) |
| targetsTo | [plateau](./plateau.md) | n:1 | no | Zielzustand (Target oder Transition) |
| ownedBy | [person](./person.md) | n:1 | no | Verantwortliche Person |
| hasMetamodelExtension | [metamodel-configuration](./metamodel-configuration.md) | 1:0..1 | yes | Optionale Metamodell-Erweiterung für diese Solution |
| containsDeltas | EntityDelta[] | 1:n | yes | Menge der Entitätsänderungen (neu / geändert / retiring) |

### EntityDelta (Werteobjekt, kein eigenes BO)

| Attribut | Typ | Beschreibung |
|---|---|---|
| entityId | reference | Betroffene Entität (neu: noch nicht im Baseline vorhanden) |
| deltaType | enum `[new, modified, retiring]` | Art der Änderung |
| changes | map | Für `modified`: geänderte Properties (vorher/nachher) |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `fromPlateauId` und `toPlateauId` DÜRFEN NICHT auf dasselbe Plateau zeigen | onCreate, onUpdate | – |
| BR-02 | `toPlateauId` MUSS `status=target` oder `status=transition` haben (keine Solution richtet sich auf ein Baseline-Plateau) | onCreate, onUpdate | – |
| BR-03 | Eine Solution mit `status=implemented` ist read-only | onUpdate | – |
| BR-04 | `metamodelExtensionId` darf nur auf eine `MetamodelConfiguration` mit `scope=solution` zeigen | onCreate, onUpdate | – |
| BR-05 | Entitäten einer Solution sind für andere Solutions sichtbar (Kollisions-Erkennung bei parallelen Änderungen an derselben Entität) | onRead | – |

## Lifecycle

```
draft → proposed → approved → in-progress → implemented
                ↘ archived (aufgegeben)
```

Nach `implemented`: Go-Live-Prozess setzt `toPlateauId.status` von `target` auf `realized`; das alte Baseline-Plateau wird ebenfalls `realized`; das realisierte Plateau wird zum neuen Baseline.

## Beispiel (Konzept-Ebene)

```
Baseline P0 (aktuell produktiv):
  - AppComponent: CRM-Legacy  [active]
  - AppComponent: ERP-Core    [active]

Solution: "Salesforce-Einführung" (draft)
  fromPlateau: P0
  toPlateau: P1 (Target 2027)
  deltas:
    - CRM-Legacy:  deltaType=retiring
    - Salesforce:  deltaType=new, type=ApplicationComponent
    - Integration: deltaType=new, type=Interface (Connection: Salesforce → ERP-Core)

Target P1 (nach Go-Live):
  - AppComponent: ERP-Core    [active]     ← geerbt von P0
  - AppComponent: Salesforce  [active]     ← neu durch Solution
  - AppComponent: CRM-Legacy  [retiring]   ← wird ausser Betrieb genommen
  - Interface: Integration    [active]     ← neu durch Solution
```

## Abgrenzung

- **NICHT** ein [Plateau](./plateau.md): Ein Plateau ist der Zustand; eine Solution ist der Prozess des Übergangs.
- **NICHT** ein Projekt: Eine Solution ist eine Architektur-Beschreibung; das Projekt (Budget, Timeline, Teams) ist extern (PPM-Tool-Integration ist in §23 als offene Frage vermerkt).
- **NICHT** ein ADR: Architektur-Entscheidungen begleiten eine Solution, sind aber separate Artefakte.

## Verwendung in Use Cases

- Künftig: UC für Solution-Verwaltung (Anlegen, Review-Prozess, Go-Live)
- [UC-04](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) (Metamodell-Erweiterung für Solution, REQ-037)

## Notizen

TOGAF-Referenz: „Solution Architecture" in Phase E/F (Opportunities & Solutions, Migration Planning). Die `EntityDelta`-Struktur entspricht dem TOGAF-Konzept der „Architecture Change Request" + „Gap Analysis". Die Fragen zur Referenz-Integrität über Plateaus (§23 Punkt 6) werden das Delta-Modell weiter präzisieren.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft; ersetzt das zu generische Architecture-BO als primäres Scope-Konzept für Solution Architekten |
