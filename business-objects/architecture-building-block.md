---
identifier: architecture-building-block
name_de: Architektur-Baustein (ABB)
name_en: Architecture Building Block
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - ABB
  - Architecture Building Block
  - Wiederverwendbarer Baustein
references:
  - concept: concept/10-foundations/04-enterprise-continuum-trm.md
  - adr: adrs/ADR-002-continuum-repository.md
---

# Business Object: ArchitectureBuildingBlock (ABB)

## Definition

Ein `ArchitectureBuildingBlock` (ABB) ist eine wiederverwendbare, technologieneutrale Architektur-Spezifikation, die beschreibt, *was* ein Baustein leisten muss und *welche Eigenschaften* er haben muss — ohne festzulegen, wie er implementiert wird. ABBs bilden den **Architecture Continuum**: von universellen Foundation-Bausteinen bis zu organisationsspezifischen Spezifikationen.

## Beschreibung

ABBs stehen auf einer höheren Abstraktionsebene als konkrete `ArchitectureEntity`-Instanzen. Die Beziehungskette lautet:

```
ABB „Identity Provider"          ← Spezifikation: was muss es können?
  └── SBB „Keycloak 23.0"        ← konkrete Implementierung (implements ABB)
        └── Entity „acme-iam"    ← Produktionsinstanz (instanceOf SBB, conformsTo ABB)
```

**Continuum-Hierarchie** (von generisch zu spezifisch):

| Level | Bedeutung | Beispiel |
|---|---|---|
| `foundation` | Universell, framework-seitig definiert (z.B. TOGAF TRM) | „Security Service", „Data Exchange Service" |
| `common-systems` | Branchenübergreifend wiederverwendbar | „Identity Provider", „API Gateway" |
| `industry` | Branchenspezifisch (z.B. Banking, Telekommunikation) | „Core Banking System", „BSS/OSS" |
| `organization` | Organisationsspezifisch; kann zurück ins Continuum promoviert werden | „Acme Central IAM Service" |

Foundation- und Common-Systems-ABBs werden typischerweise aus Continuum-Paketen importiert (ADR-002: `scope=imported`); organisationsspezifische ABBs werden selbst erstellt (`scope=organization`).

ABBs können sich gegenseitig verfeinern: ein spezialisierter ABB `MFA-fähiger Identity Provider` verfeinert den generischeren `Identity Provider`. Dadurch entsteht ein Verfeinerungsbaum innerhalb des Architecture Continuum.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | UUID | required | | v4, global eindeutig | Primärschlüssel |
| name | string | required | | max. 255 Zeichen; eindeutig je `continuumLevel` | Lesbarer Name (z.B. „Identity Provider") |
| description | string | optional | null | max. 5000 Zeichen; Markdown | Zweck und fachliche Einordnung |
| continuumLevel | enum | required | `organization` | `[foundation, common-systems, industry, organization]` | Verortung im Architecture Continuum |
| industry | string | optional | null | max. 100 Zeichen; nur relevant wenn `continuumLevel=industry` | Branche (z.B. „Banking", „Telekommunikation", „TM Forum") |
| maturityLevel | enum | required | `experimental` | `[experimental, emerging, established, industry-standard]` | Reifegrad des Bausteins |
| governanceStatus | enum | required | `proposed` | `[proposed, approved, deprecated]` | Freigabestatus in der Organisation |
| specifications | string | optional | null | max. 10000 Zeichen; Markdown | Anforderungen und Constraints, die Implementierungen (SBBs) erfüllen müssen |
| scope | enum | required | `organization` | `[built-in, imported, organization]` | Herkunft: `built-in` = OEA-Standard; `imported` = aus Continuum-Paket; `organization` = selbst erstellt |
| sourcePackage | string | optional | null | max. 255 Zeichen; nur wenn `scope=imported` | Herkunftspaket (z.B. „TOGAF 10 TRM", „TM Forum Frameworx 23.0") |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| refines | [architecture-building-block](./architecture-building-block.md) | n:0..1 | yes | Dieser ABB verfeinert einen generischeren ABB (Verfeinerungshierarchie im Continuum) |
| refinedBy | [architecture-building-block](./architecture-building-block.md) | 1:n | yes | Spezialisierungen dieses ABBs |
| implementedBy | [solution-building-block](./solution-building-block.md) | 1:n | yes | Konkrete Produkte / Komponenten, die diesen ABB implementieren |
| usedIn | [reference-architecture](./reference-architecture.md) | n:m | yes | Reference Architectures, in denen dieser ABB vorkommt |
| conformingEntities | [entity](./entity.md) | 1:n | yes | Instanzen, die explizit konform zu diesem ABB deklariert sind (via `entity.conformsToABBId`) |

## Business Rules

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | ABBs mit `scope=imported` oder `scope=built-in` sind read-only; Bearbeiten und Löschen sind gesperrt | onUpdate, onDelete |
| BR-02 | `industry`-Feld MUSS gesetzt sein, wenn `continuumLevel=industry` | onCreate, onUpdate |
| BR-03 | Ein ABB darf sich nicht selbst verfeinern — kein direkter oder indirekter Zyklus im `refines`-Graphen | onCreate, onUpdate |
| BR-04 | ABBs mit `governanceStatus=deprecated` sind auswählbar, erzeugen jedoch eine Warnung bei Neuverwendung | onUse |
| BR-05 | ABBs mit `continuumLevel=foundation` oder `common-systems` SOLLTEN aus Continuum-Paketen stammen (`scope=imported`); manuelle Anlage erzeugt eine Governance-Warnung | onCreate |

## Lifecycle

```
proposed → approved → deprecated
```

- `imported`-ABBs starten direkt als `approved` (durch das Paket validiert)
- `organization`-ABBs durchlaufen `proposed → approved`
- `deprecated`-ABBs können nicht gelöscht werden, solange Entitäten auf sie referenzieren

## Analysen (Konzept §4.5)

- **ABB-Abdeckungslücke**: ABBs ohne implementierenden SBB oder ohne konforme Instanz → Gap in der Architecture Delivery
- **Verfeinerungs-Baum**: Hierarchie von `foundation` → `organization` als Tree-View
- **Conformance-Check**: Entitäten ohne `conformsToABBId`, obwohl ein passender ABB existiert

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | Business Engineer | Initial draft; Grundlage Enterprise Continuum §4 (Konzept); ADR-002 (scope-basiert) |
