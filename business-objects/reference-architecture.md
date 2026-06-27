---
identifier: reference-architecture
name_de: Referenzarchitektur
name_en: Reference Architecture
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Referenzarchitektur
  - Blueprint
  - Reference Architecture
references:
  - concept: concept/10-foundations/04-enterprise-continuum-trm.md
  - adr: adrs/ADR-002-continuum-repository.md
---

# Business Object: ReferenceArchitecture

## Definition

Eine `ReferenceArchitecture` ist ein vorgefertigtes, wiederverwendbares Architektur-Blueprint, das eine Gruppe von `ArchitectureBuildingBlocks` (ABBs) und `ArchitecturePatterns` in einem definierten Scope zu einer vollständigen Lösung zusammenstellt. Sie dient als Ausgangspunkt für konkrete Solution Architectures und reduziert den Aufwand für wiederkehrende Architektur-Aufgaben.

## Beschreibung

Reference Architectures sind die Kompositions-Ebene des Architecture Continuum: Sie kombinieren ABBs (Spezifikationen) und Patterns (Strukturen) zu einem kohärenten Ganzen. Eine Reference Architecture ist kein Plateau und keine Solution — sie ist ein Blueprint, das in beliebig vielen Solutions instanziiert werden kann.

**Beispiele:**

| Reference Architecture | Scope | Genutzte ABBs |
|---|---|---|
| Cloud-Native Microservices | organisation-übergreifend | API Gateway, Service Mesh, Container Runtime, Identity Provider, Event Bus |
| Drei-Schichten-WebApp | common-systems | Presentation Layer, Business Logic Layer, Persistence Layer |
| TOGAF Application Platform | foundation | TOGAF TRM Infrastructure, Middleware, Application Services |
| Acme Banking Core Platform | organisation | Core Banking System, Regulatory Reporting, Customer Identity |

Eine Reference Architecture kann als Vorlage für ein [Plateau](./plateau.md) dienen: „instantiiert als" bedeutet, dass ein Plateau den Zielzustand beschreibt, der dieser Reference Architecture entspricht.

**Continuum-Verortung:**

| continuumLevel | Bedeutung |
|---|---|
| `foundation` | Allgemeingültig, framework-seitig (z.B. TOGAF Application Platform) |
| `common-systems` | Branchenübergreifend wiederverwendbar |
| `industry` | Branchenspezifisch (z.B. Banking, Energie) |
| `organization` | Organisationsspezifisch; eigenentwickelter Blueprint |

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | UUID | required | | v4, global eindeutig | Primärschlüssel |
| name | string | required | | max. 255 Zeichen | Name (z.B. „Cloud-Native Microservices Platform") |
| description | string | optional | null | max. 5000 Zeichen; Markdown | Zweck, Scope und Anwendungskontext |
| continuumLevel | enum | required | `organization` | `[foundation, common-systems, industry, organization]` | Verortung im Architecture Continuum |
| targetIndustry | string | optional | null | max. 100 Zeichen; nur relevant wenn `continuumLevel=industry` | Branche (z.B. „Banking", „Energie", „Public Sector") |
| maturityLevel | enum | required | `experimental` | `[experimental, emerging, established, industry-standard]` | Reifegrad |
| governanceStatus | enum | required | `proposed` | `[proposed, approved, deprecated]` | Freigabestatus |
| scope | enum | required | `organization` | `[built-in, imported, organization]` | Herkunft analog zu ABB/SBB |
| sourcePackage | string | optional | null | max. 255 Zeichen; nur wenn `scope=imported` | Herkunftspaket |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| composedOf | [architecture-building-block](./architecture-building-block.md) | n:m | yes | ABBs, die Teil dieser Reference Architecture sind |
| basedOnPatterns | [architecture-pattern](./architecture-pattern.md) | n:m | yes | Patterns, auf denen diese Reference Architecture strukturell aufbaut |
| instantiatedAs | [plateau](./plateau.md) | 1:n | yes | Plateaus, die diese Reference Architecture als Blueprint verwenden |

## Business Rules

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | Reference Architectures mit `scope=imported` oder `scope=built-in` sind read-only | onUpdate, onDelete |
| BR-02 | `targetIndustry` MUSS gesetzt sein, wenn `continuumLevel=industry` | onCreate, onUpdate |
| BR-03 | Eine Reference Architecture SOLLTE mindestens einen ABB oder ein Pattern referenzieren; leere Blueprints erzeugen eine Warnung | onCreate |
| BR-04 | `governanceStatus=deprecated` Reference Architectures sind als Vorlage für neue Plateaus nicht mehr auswählbar | onPlateau |

## Lifecycle

```
proposed → approved → deprecated
```

Importierte Reference Architectures starten als `approved`.
Organisationsspezifische durchlaufen `proposed → approved`.
Deprecated Reference Architectures bleiben für Analyse und Traceability erhalten.

## Analysen

- **Blueprint-Adoption**: Wie viele Plateaus basieren auf dieser Reference Architecture? Geringe Adoption → evtl. schlecht kommuniziert oder nicht passend
- **ABB-Lücken**: Welche ABBs in einer Reference Architecture haben keinen SBB oder keine Instanz in der Organisation?
- **Abweichungen**: Wenn ein Plateau diese Reference Architecture referenziert, aber bestimmte ABBs nicht besetzt — explizite Abweichungs-Dokumentation

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | Business Engineer | Initial draft; Grundlage Enterprise Continuum §4 (Konzept) |
