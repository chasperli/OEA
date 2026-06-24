---
identifier: role
name_de: Rolle
name_en: Role
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Funktion
  - Verantwortlichkeit
related_capabilities: []
references:
  - concept: concept/20-entities/08-organisation-rollen-personen.md
---

# Business Object: Role

## Definition

Eine Role ist eine fachlich-funktionale Verantwortung im EA-Repository, unabhängig von der Person, die sie aktuell ausfüllt. Rollen sind von Personen entkoppelt, damit Personalwechsel keine Architektur-Änderungen auslösen.

## Beschreibung

Rollen aus dem EA-Metamodell (§8.2) werden direkt als Autorisierungs-Rollen im Sinne von RBAC genutzt (siehe Konzept §21.8): Eine Person, die eine bestimmte Role ausfüllt, erhält die entsprechenden Zugriffsrechte im System. Damit ist Role das zentrale Bindeglied zwischen fachlicher Verantwortung im EA-Repository und technischer Autorisierung beim Login.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | | Rollenbezeichnung, z.B. "Enterprise Architect" |
| description | string | optional | | | Freitext-Beschreibung |
| type | enum | required | | `[functional, process, project, governance, architectural]` | Rollen-Typ |
| responsibilities | string | optional (Liste) | | min. 1 Eintrag empfohlen | Was die Rolle verantwortet |
| authorities | string | optional (Liste) | | | Was die Rolle entscheiden darf |
| isStandardRole | boolean | required | false | | Aus Referenzmodell vs. organisationsspezifisch |
| permissionLevel | enum | required | read | `[read, write, admin]` | Default-Zugriffslevel pro Ressource für die Autorisierung (siehe §21.8) |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| filledBy | [person](./person.md) | n:m | yes | Aktuell mit dieser Rolle betraute Personen (über RoleAssignment) |
| belongsToUnit | organization-unit | 1:1 | yes | Organisationseinheit, der die Rolle zugeordnet ist |
| reportsToRole | role | 1:1 | yes | Übergeordnete Rolle |

## Lifecycle

```
draft → active → deprecated
```

**Zustände**:
- `draft`: Rolle ist definiert, aber noch nicht im Einsatz
- `active`: Rolle wird aktiv zugewiesen und für Autorisierung genutzt
- `deprecated`: Rolle wird nicht mehr neu zugewiesen, bestehende Zuweisungen laufen aus

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Jede `active`-Role MUSS mindestens eine `responsibility` haben (Konzept-Constraint `role-has-responsibilities`) | onCreate, onUpdate | – |
| BR-02 | Pro Activity darf höchstens eine Role mit RACI-Status `accountable` zugewiesen sein (Konzept-Constraint `single-accountable-per-activity`) | onUpdate | – |

## Beispiele

**Beispiel 1**: Architectural Role
```yaml
name: Enterprise Architect
type: architectural
responsibilities:
  - Architektur-Reviews durchführen
  - ADR-Workflow moderieren
authorities:
  - Architektur-Entscheidungen mit ARB freigeben
isStandardRole: true
permissionLevel: admin
```

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [person](./person.md): Role ist die Funktion, Person der konkrete Mensch, der sie ausfüllt.
- **NICHT** organization-unit: Role ist fachlich-funktional, OrganizationUnit ist strukturell.

## Verwendung in Use Cases

- [UC-01: Login](../requirements/use-cases/UC-01-login.md)

## Konzept-Bezug

- [§8.2 Role](../concept/20-entities/08-organisation-rollen-personen.md)
- [§21.8 Authentifizierung/Autorisierung](../concept/70-platform/21-api-architektur.md)

## Notizen

Erste Modellierung im Rahmen von UC-01 Login. `permissionLevel` ist eine Vereinfachung des in §21.8 beschriebenen RBAC/ABAC-Modells für den Walking-Skeleton-Scope; Property-Level-Autorisierung folgt einem späteren Use Case.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | Business Engineer | Initial draft im Rahmen von UC-01 Login |
