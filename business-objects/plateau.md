---
identifier: plateau
name_de: Plateau
name_en: Architecture Plateau
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Architektur-Plateau
  - Architektur-Zustand
  - Baseline
  - Target Architecture
related_capabilities: []
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - concept: concept/40-extensibility/15-schema-evolution.md
---

# Business Object: Plateau

## Definition

Ein `Plateau` ist ein relativ stabiler, benannter Zustand der Unternehmensarchitektur einer OEA-Instanz zu einem bestimmten Zeitpunkt oder Zeitraum. Es beschreibt, welche Entitäten und Beziehungen in diesem Zustand existieren, aktiv oder ausser Betrieb sind.

## Beschreibung

Das Plateau-Konzept stammt aus TOGAF und ArchiMate und bildet die Grundlage für zeitlich strukturierte EA-Arbeit. Eine OEA-Instanz hat zu jedem Zeitpunkt genau ein **Baseline-Plateau** (den aktuellen Produktivstand) und beliebig viele **Target- oder Transition-Plateaus** (geplante Zustände).

**Plateau-Typen**:

| Status | Bedeutung | Editierbarkeit |
|---|---|---|
| `baseline` | Aktueller Produktivstand (AS-IS); einziges aktives Baseline-Plateau | Nur per kontrolliertem Prozess; in der Regel gesperrt |
| `target` | Angestrebter Zielzustand (TO-BE); kann noch nicht produktiv sein | Durch Solution Architekten editierbar |
| `transition` | Zwischenzustand auf dem Weg vom Baseline zum Target | Durch Solution Architekten editierbar |
| `realized` | Ehemaliger Target-Zustand, der produktiv geworden ist; neues Baseline ersetzt alten Baseline | Archiviert, read-only |

**Zusammenhang mit Solutions**: Plateaus sind stabile Zustände. [Solutions](./solution.md) sind die Arbeitseinheiten, die Entitäten *von einem Plateau zu einem anderen* verändern. Ein Solution Architekt arbeitet in einer Solution, die einem Target-Plateau zugeordnet ist.

**Effektiver Inhalt eines Plateaus**: Die Menge aller Entitäten, die in diesem Plateau-Zustand `active` oder `retiring` sind. Entitäten aus dem Baseline-Plateau werden in Target-Plateaus geerbt (sie existieren dort, bis sie durch eine Solution explizit geändert oder `retired` werden).

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig innerhalb der Instanz | Lesbarer Name (z.B. „Baseline 2026-Q1", „Target Cloud-Migration 2027") |
| description | string | optional | | max. 2000 Zeichen | Zweck und Scope des Plateaus |
| status | enum | required | | `[baseline, transition, target, realized]` | Typ des Plateaus |
| validFrom | date | optional | | ISO 8601 | Gültig ab (für Baseline: Datum des letzten Go-Live; für Target: geplantes Go-Live) |
| validTo | date | optional | | ISO 8601; nur wenn status=realized oder abgelöster baseline | Gültig bis |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| isTargetOf | [solution](./solution.md) | 1:0..n | yes | Solutions, die auf dieses Plateau hinarbeiten |
| succeeds | Plateau | 0..1:1 | yes | Vorgänger-Plateau (bei transition/target: das Baseline, von dem aus gearbeitet wird) |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Eine OEA-Instanz hat zu jedem Zeitpunkt genau ein Plateau mit `status=baseline` | onStatusChange | – |
| BR-02 | Ein Plateau mit `status=baseline` kann nur durch einen kontrollierten Go-Live-Prozess auf `status=realized` gesetzt werden; gleichzeitig wird ein bestehendes Target- oder Transition-Plateau zum neuen Baseline | onStatusChange | – |
| BR-03 | Ein Plateau mit `status=realized` ist read-only; keine Entitätsänderungen möglich | onUpdate | – |

## Lifecycle

```
target / transition → realized → (wird zum neuen baseline)
                                  alter baseline → realized
```

Der Übergang `target → realized` entspricht dem Go-Live: die geplante Architektur wird zur neuen Realität.

## Abgrenzung

- **NICHT** eine [Solution](./solution.md): Ein Plateau ist der stabile Zustand; eine Solution ist der Änderungsprozess zwischen zwei Plateaus.
- **NICHT** eine Zeitreihe einzelner Entitäten: Bitemporalität (Gültigkeitszeit vs. Erfassungszeit) ist eine offene Frage (§23 Offene Punkte, Punkt 3); das Plateau-Konzept abstrahiert darüber.

## Verwendung in Use Cases

- Künftig: UC für Plateau-Verwaltung (Anlegen, Go-Live-Prozess)
- [UC-04](../requirements/use-cases/UC-04-metamodell-konfigurieren.md) (Metamodell ist instanzweit; Plateau-spezifische Erweiterungen laufen über Solutions)

## Notizen

TOGAF-Referenz: „Plateau" in der Migration-Schicht (TOGAF 10, Teil IV). ArchiMate 3.x: `Plateau`-Element in der Motivation- und Migration-Schicht. Die offenen Fragen zu Bitemporalität (§23 Punkte 3–6) werden den Plateau-Mechanismus weiter präzisieren.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft |
