---
identifier: architecture-pattern
name_de: Architektur-Muster
name_en: Architecture Pattern
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Pattern
  - Architektur-Pattern
  - Muster
references:
  - concept: concept/10-foundations/04-enterprise-continuum-trm.md
  - adr: adrs/ADR-002-continuum-repository.md
---

# Business Object: ArchitecturePattern

## Definition

Ein `ArchitecturePattern` ist eine bewährte, wiederverwendbare Lösung für ein häufig auftretendes Architektur-Problem. Es beschreibt das Problem, den Lösungsansatz, Anwendungsvoraussetzungen und Konsequenzen — im Format angelehnt an die Gang-of-Four-Beschreibungsstruktur, aber auf Enterprise-Architektur-Ebene. Patterns sind Teil des Architecture Continuum und ergänzen ABBs um strukturelle und verhaltensorientierte Lösungsansätze.

## Beschreibung

Wo ABBs *Bausteine* spezifizieren, beschreiben Patterns *Strukturen und Zusammenspiele* zwischen Bausteinen. Beispiele:

| Pattern | Problem | Lösung |
|---|---|---|
| Strangler Fig | Legacy-System schrittweise ablösen | Proxy vor Legacy → schrittweise Funktionen in Neusystem verlagern |
| Event-Driven Architecture | Lose Kopplung zwischen Domänen | Domänen kommunizieren nur via Events, kein direkter Aufruf |
| API Gateway | Zentrale Eintrittsstelle für Clients | Ein Gateway vor allen Backend-Services; Auth, Rate-Limiting, Routing dort |
| Sidecar | Cross-cutting Concerns (Logging, Proxy) ohne Code-Änderung | Begleit-Container je Service |

Patterns können sowohl aus allgemeinen Quellen (importiert, z.B. TOGAF Patterns, Cloud-Design-Patterns) als auch organisationsspezifisch erarbeitet werden.

Wenn ein Pattern in einer konkreten Solution oder Entität angewendet wird, entsteht ein `appliedIn`-Link: so ist nachvollziehbar, wo welches Pattern tatsächlich umgesetzt wurde — und Abweichungen davon können identifiziert werden.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | UUID | required | | v4, global eindeutig | Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig je `scope` | Pattern-Name (z.B. „Strangler Fig", „CQRS") |
| problem | string | required | | max. 3000 Zeichen; Markdown | Beschreibung des Problems, das dieses Pattern löst |
| solution | string | required | | max. 5000 Zeichen; Markdown | Lösungsansatz, Struktur und Mechanismus |
| applicability | string | optional | null | max. 2000 Zeichen; Markdown | Wann ist dieses Pattern geeignet? Voraussetzungen und Einschränkungen |
| consequences | string | optional | null | max. 2000 Zeichen; Markdown | Trade-offs, Vorteile und bekannte Nachteile der Anwendung |
| maturityLevel | enum | required | `experimental` | `[experimental, emerging, established, industry-standard]` | Reifegrad und Verbreitung des Patterns |
| scope | enum | required | `organization` | `[built-in, imported, organization]` | Herkunft analog zu ABB/SBB |
| sourcePackage | string | optional | null | max. 255 Zeichen; nur wenn `scope=imported` | Herkunftspaket (z.B. „TOGAF 10", „Microsoft Azure Architecture Patterns") |
| tags | string[] | optional | [] | max. 20 Tags, je max. 50 Zeichen | Klassifizierungs-Tags (z.B. „integration", „cloud", „security", „data") |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| appliedIn | [entity](./entity.md) | n:m | yes | ArchitectureEntities, in denen dieses Pattern explizit angewendet wurde |
| usedIn | [reference-architecture](./reference-architecture.md) | n:m | yes | Reference Architectures, die auf diesem Pattern aufbauen |
| relatedPatterns | [architecture-pattern](./architecture-pattern.md) | n:m | yes | Verwandte oder ergänzende Patterns (z.B. „CQRS" und „Event Sourcing" sind komplementär) |

## Business Rules

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | Patterns mit `scope=imported` oder `scope=built-in` sind read-only | onUpdate, onDelete |
| BR-02 | `problem` und `solution` MÜSSEN beide gesetzt sein; ein Pattern ohne Problembeschreibung ist kein Pattern | onCreate, onUpdate |

## Lifecycle

Patterns haben keinen formalen Governance-Lifecycle wie ABBs oder SBBs. Sie werden gepflegt und können als `maturityLevel=experimental` eingeführt und durch Erfahrungen auf `established` hochgestuft werden. Veraltete Patterns werden nicht gelöscht, sondern durch `tags` als „deprecated" gekennzeichnet (kein eigenes Enum-Feld, da Patterns selten formell zurückgezogen werden).

## Analysen

- **Pattern-Adoption**: Wie viele Entitäten wenden ein Pattern an? Geringe Adoption → Pattern ggf. zu komplex oder schlecht dokumentiert
- **Pattern-Konflikte**: Zwei inkompatible Patterns an derselben Entität (`relatedPatterns` mit „conflicts-with"-Semantik als zukünftiges Feature)
- **Pattern-Coverage in Reference Architectures**: Welche Patterns werden in welchen Referenzarchitekturen genutzt?

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | Business Engineer | Initial draft; Grundlage Enterprise Continuum §4 (Konzept) |
