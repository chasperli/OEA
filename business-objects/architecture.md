---
identifier: architecture
name_de: Architektur-Modell (Übersicht)
name_en: Architecture Model Overview
version: 0.3.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Architecture
  - EA-Modell
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/40-extensibility/14-erweiterbarkeit.md
  - concept: concept/90-backlog/23-offene-punkte.md
---

# Architektur-Modell: Übersicht

> **Hinweis**: Diese Datei war ursprünglich als generischer „Scope-Container" modelliert (v0.1.0). Mit v0.2.0 wird sie zur Übersichtsdatei des Gesamtmodells. Die konkreten BOs sind:
> - [Plateau](./plateau.md) — stabiler Architektur-Zustand (Baseline, Target, Transition)
> - [Solution](./solution.md) — Initiative, die Entitäten von einem Plateau zu einem anderen überführt

---

## Betriebsmodi

OEA unterstützt zwei Betriebsmodi, die je nach Organisations-Reifegrad gewählt werden können. Beide basieren auf dem [Solution](./solution.md)-Konzept; das [Plateau](./plateau.md) ist optional.

| Modus | Plateau erforderlich | Geeignet für |
|---|---|---|
| **Projekt-Modus** | nein | KMU, projektbasierte Arbeitsweise ohne formales Baseline-Target-Schema |
| **Plateau-Modus** | ja | Enterprise, TOGAF-Governance, formale Baseline/Target-Übergänge |

Im **Projekt-Modus** sind Solutions freie Workspaces. Nach Go-Live ergibt der Gesamtzustand der Landschaft sich aus der Summe aller `implemented`-Solutions. Kein Plateau nötig.

Im **Plateau-Modus** sind Solutions Transitionen zwischen Plateaus. Der Gesamtzustand zu einem Zeitpunkt ist ein Plateau; Solutions beschreiben den Delta zwischen zwei Plateaus.

---

## Konzeptionelles Modell (Plateau-Modus)

In OEA wird eine Unternehmensarchitektur in zwei komplementären Dimensionen beschrieben:

### Dimension 1: Zustände (Plateaus)

Ein **[Plateau](./plateau.md)** ist ein stabiler, benannter Zustand der Gesamtarchitektur zu einem Zeitpunkt. Die OEA-Instanz hat immer genau ein **Baseline-Plateau** (aktueller Produktivstand) und beliebig viele **Target-Plateaus** (geplante Zielzustände).

```
Plateau P0 (Baseline, produktiv)
  ├── ApplicationComponent: CRM-Legacy        [active]
  ├── ApplicationComponent: ERP-Core          [active]
  └── Interface: Legacy-ERP-Schnittstelle     [active]

Plateau P1 (Target 2027, noch nicht produktiv)
  ├── ApplicationComponent: ERP-Core          [active]    ← geerbt von P0
  ├── ApplicationComponent: Salesforce        [active]    ← neu (durch Solution)
  ├── ApplicationComponent: CRM-Legacy        [retiring]  ← wird abgelöst
  └── Interface: Salesforce-API               [active]    ← neu (durch Solution)
```

### Dimension 2: Transitionen (Solutions)

Eine **[Solution](./solution.md)** beschreibt den **Delta** zwischen zwei Plateaus: welche Entitäten neu entstehen, sich ändern oder ausser Betrieb gehen. Sie ist der Arbeitsbereich des Solution Architekten.

```
Solution: „Salesforce-Einführung"
  fromPlateau: P0 (Baseline)
  toPlateau:   P1 (Target 2027)
  deltas:
    - CRM-Legacy:             retiring
    - Salesforce:             new, type=ApplicationComponent
    - Salesforce-API:         new, type=Interface
    - Legacy-Schnittstelle:   retiring
```

### Zusammenspiel

Das entspricht dem **Plateau-Prinzip** aus TOGAF / ArchiMate 3:

```
Plateau P0 (Baseline)
      │
      ├── Solution A ──────────────── Plateau P1 (Target A)
      ├── Solution B ──────────────── Plateau P2 (Target B)
      │   [mehrere Solutions laufen parallel]
      │
      ▼ (nach Go-Live Solution A)
Plateau P1 wird realisiert → neues Baseline
Plateau P0 → realized (read-only)
```

### Metamodell-Scoping

Das Instanz-Metamodell ([MetamodelConfiguration](./metamodel-configuration.md) `scope=instance`) gilt instanzweit. Eine Solution kann eine eigene Metamodell-Erweiterung haben (`scope=solution`), um neue Entitätstypen zu erproben, ohne das gesperrte Instanz-Standardmetamodell zu verändern (REQ-037).

```
MetamodelConfiguration (scope=instance, editMode=import-only)
└── Solution-Erweiterung (scope=solution, editMode=gui-and-import)
      └── eigene Custom-Typen, nur innerhalb dieser Solution sichtbar
```

---

## Begriffsabgrenzung

| Begriff | Was es ist | BO-Datei |
|---|---|---|
| **Plateau** | Stabiler Architektur-Zustand (Baseline / Target) | [plateau.md](./plateau.md) |
| **Solution** | Initiative mit Entitäts-Deltas zwischen Plateaus | [solution.md](./solution.md) |
| **MetamodelConfiguration** | Instanz-Metamodell + optionale Solution-Erweiterung | [metamodel-configuration.md](./metamodel-configuration.md) |
| **ArchitectureEntity** | Konkrete Instanz eines Entitätstyps (UUID + Metatyp-Referenz) | [entity.md](./entity.md) |
| **EntityDelta** | Werteobjekt: einzelne Änderung einer Entität in einer Solution | in solution.md definiert |

---

## TOGAF-Referenz

| OEA-Begriff | TOGAF-Entsprechung | ArchiMate 3 |
|---|---|---|
| Plateau | Plateau | `Plateau` (Migration-Schicht) |
| Solution | Solution Architecture (Phase E/F) | `Deliverable`, `Gap` |
| fromPlateau / toPlateau | Baseline / Target Architecture | Plateau mit Rollen |
| EntityDelta | Architecture Change Request / Gap Analysis | `Gap` |

---

## Konzeptionelles Modell (Projekt-Modus / KMU)

```
OEA-Instanz (kein Plateau)
  │
  ├── Solution „Salesforce-Einführung" [implemented]
  │     deltas: CRM-Legacy retiring, Salesforce new
  │
  ├── Solution „API-Gateway Einführung" [implemented]
  │     deltas: API-GW new
  │
  └── Solution „ERP-Upgrade" [in-progress]
        deltas: ERP-Core v4 → v5 (modified)

Realisierter Gesamtzustand = Summe aller implemented-Solutions:
  - Salesforce        [active]
  - API-Gateway       [active]
  - ERP-Core v5       [active]  ← aus laufender Solution (nach Go-Live)
  - CRM-Legacy        [retired]
```

---

## Offene Fragen (§23 Offene Punkte)

- **Punkt 3 – Bitemporalität**: Gültigkeitszeit (Plateau-Zeitfenster) vs. Erfassungszeit. Das Plateau-Modell abstrahiert zunächst; Antwort beeinflusst das DB-Schema.
- **Punkt 4 – Plateau-Diffs**: Wie werden Übergänge berechnet und visualisiert? Das Solution/EntityDelta-Modell liefert die Grundlage.
- **Punkt 6 – Referenz-Integrität über Plateaus**: `retiring`-Entitäten bleiben im Target-Plateau sichtbar bis Go-Live; danach `archived`, nicht mehr als Relation-Ziel verwendbar.

Diese Fragen sind für künftige ADRs (Gruppe A oder B) vorgesehen.

---

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft als generischer Scope-Container |
| 0.2.0 | 2026-06-25 | Business Engineer | Umgewandelt zur Modell-Übersicht; Plateau + Solution als eigene BOs eingeführt |
| 0.3.0 | 2026-06-25 | Business Engineer | Projekt-Modus (KMU) eingeführt: Solutions ohne Plateau; Betriebsmodi-Tabelle; KMU-Beispiel |
