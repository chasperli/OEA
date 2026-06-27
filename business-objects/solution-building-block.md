---
identifier: solution-building-block
name_de: Lösungs-Baustein (SBB)
name_en: Solution Building Block
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - SBB
  - Solution Building Block
  - Produkt-Baustein
references:
  - concept: concept/10-foundations/04-enterprise-continuum-trm.md
  - adr: adrs/ADR-002-continuum-repository.md
---

# Business Object: SolutionBuildingBlock (SBB)

## Definition

Ein `SolutionBuildingBlock` (SBB) ist die konkrete Implementierung eines oder mehrerer `ArchitectureBuildingBlocks` (ABBs) durch ein Produkt, eine Open-Source-Komponente oder eine selbst entwickelte Lösung. SBBs bilden das **Solutions Continuum**: von universellen Produktkategorien bis zu organisationsspezifisch evaluierten und freigegebenen Produkten.

## Beschreibung

Während ein ABB beschreibt, *was* eine Komponente leisten muss, beschreibt ein SBB, *womit* das realisiert werden kann. SBBs sind die Verbindung zwischen dem abstrakten Architecture Continuum und konkreten Repository-Instanzen:

```
ABB „Identity Provider"
  ├── SBB „Keycloak 23.0"      (approved; community-supported)
  ├── SBB „Azure AD B2C"       (acceptable; Vendor-Lock-in Risiko)
  └── SBB „LDAP standalone"    (deprecated; kein MFA-Support)
```

Die `ArchitectureEntity` „acme-keycloak-prod" ist eine Instanz des SBB „Keycloak 23.0" (`entity.instanceOfSBBId`). Über die SBB-ABB-Kette ist damit auch die ABB-Konformität ableitbar.

**Governance-Status** steuert, welche SBBs für neue Projekte verwendbar sind:

| governanceStatus | Bedeutung | Verwendbar für neue Projekte? |
|---|---|---|
| `approved` | Bevorzugte Wahl; empfohlen | ja, bevorzugt |
| `acceptable` | Zulässig mit Begründung | ja, mit Einschränkung |
| `deprecated` | Auslaufend; nur in Bestandssystemen | nur Bestand; keine Neuimplementierung |
| `prohibited` | Verboten (Sicherheit, Lizenz, EOL) | nein; Bestandssysteme müssen migrieren |

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | UUID | required | | v4, global eindeutig | Primärschlüssel |
| name | string | required | | max. 255 Zeichen | Produktname (z.B. „Keycloak", „Azure API Management") |
| vendor | string | optional | null | max. 255 Zeichen | Hersteller oder Community (z.B. „Red Hat", „Microsoft", „Apache Foundation") |
| version | string | optional | null | max. 100 Zeichen | Produktversion oder Versionsbereich (z.B. „23.x", „>= 3.2.0") |
| description | string | optional | null | max. 5000 Zeichen; Markdown | Eigenschaften, Lizenzbedingungen, bekannte Einschränkungen |
| continuumLevel | enum | required | `organization` | `[foundation, common-systems, industry, organization]` | Verortung im Solutions Continuum |
| maturityLevel | enum | required | `experimental` | `[experimental, emerging, established, industry-standard]` | Reifegrad des Produkts |
| governanceStatus | enum | required | `acceptable` | `[approved, acceptable, deprecated, prohibited]` | Freigabestatus für neue Projekte |
| evaluationNotes | string | optional | null | max. 3000 Zeichen; Markdown | Begründung für den Governance-Status; Abwägungen |
| scope | enum | required | `organization` | `[built-in, imported, organization]` | Herkunft analog zu ABB |
| sourcePackage | string | optional | null | max. 255 Zeichen; nur wenn `scope=imported` | Herkunftspaket |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt der Anlage |
| createdBy | reference | required | | target: person | Anlegende Person |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| implements | [architecture-building-block](./architecture-building-block.md) | n:m | yes | ABBs, deren Anforderungen dieser SBB erfüllt |
| instantiatedAs | [entity](./entity.md) | 1:n | yes | Konkrete Instanzen im Repository, die auf diesen SBB referenzieren (`entity.instanceOfSBBId`) |
| trmCategories | [trm-category](./trm-category.md) | n:m | yes | TRM-Kategorien, unter die dieser SBB fällt |

## Business Rules

| Rule-ID | Aussage | Auslöser |
|---|---|---|
| BR-01 | Ein SBB mit `governanceStatus=prohibited` erzeugt eine Blockier-Warnung, wenn er als `instanceOfSBBId` einer neuen Entität gesetzt werden soll | onEntityCreate, onEntityUpdate |
| BR-02 | Ein SBB mit `governanceStatus=deprecated` erzeugt eine Governance-Warnung bei Neuverwendung, blockiert aber nicht | onEntityCreate |
| BR-03 | SBBs mit `scope=imported` oder `scope=built-in` sind read-only | onUpdate, onDelete |
| BR-04 | Ein SBB SOLLTE mindestens einen implementierten ABB referenzieren; SBBs ohne ABB-Referenz sind nur ein Produktkatalog-Eintrag ohne Architektur-Aussage (Governance-Warnung) | onCreate |

## Lifecycle

```
acceptable → approved → deprecated → prohibited
```

Importierte SBBs starten als `acceptable`. Die Organisation bewertet und setzt den Governance-Status. Wenn ein Produkt EOL erreicht oder Sicherheitsprobleme auftreten, wird es auf `deprecated` oder `prohibited` gesetzt; bestehende Instanzen erhalten in der UI einen Hinweis.

## Analysen (Konzept §4.5)

- **SBB-Diversität**: Wie viele SBBs implementieren denselben ABB? (Standardisierungspotenzial)
- **Standards-Drift**: Instanzen, deren `instanceOfSBBId` auf einen `deprecated`- oder `prohibited`-SBB zeigt
- **TRM-Coverage**: Welche TRM-Kategorien haben approved SBBs, welche nicht?

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | Business Engineer | Initial draft; Grundlage Enterprise Continuum §4 (Konzept); ADR-002 |
