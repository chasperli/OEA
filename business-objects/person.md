---
identifier: person
name_de: Person
name_en: Person
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Mitarbeiter:in
  - User
  - Benutzer (im Kontext der Tool-Authentifizierung)
related_capabilities: []
references:
  - concept: concept/20-entities/08-organisation-rollen-personen.md
---

# Business Object: Person

## Definition

Eine Person ist ein:e konkrete:r Mitarbeiter:in oder externe:r Mitwirkende:r, die im EA-Repository über zugewiesene Rollen ([role](./role.md)) Verantwortung trägt oder das Tool nutzt. Person ist von Role bewusst entkoppelt, damit Personalwechsel keine Architektur-Änderungen auslösen.

## Beschreibung

Person ist im EA-Repository typischerweise **referenziert, nicht gemastert**: Stammdaten (Name, E-Mail, Beschäftigungsstatus) kommen aus HR-Systemen oder einem Identity-Provider (z.B. Active Directory, Okta) und werden im Repository nur referenziert oder in reduziertem Detailgrad gehalten (siehe `detailLevel`). Das schützt vor DSGVO-Konflikten durch doppelte Personaldatenhaltung.

Im Kontext der Tool-Authentifizierung (siehe [UC-01 Login](../requirements/use-cases/UC-01-login.md)) ist Person die Identität, die sich gegenüber OEA authentifiziert; die eigentliche Autorisierung erfolgt über die ihr zugewiesenen Rollen.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | | | Anzeigename |
| employeeId | string | optional | | | interne Personalnummer, falls vorhanden |
| email | string | required | | gültige E-Mail-Adresse | Primäre Kontakt- und Login-Identität |
| active | boolean | required | true | | Beschäftigungs-/Account-Status |
| startDate | date | optional | | | Beginn der Zugehörigkeit |
| endDate | date | optional | | | Ende der Zugehörigkeit |
| externalReference | reference | optional | | target: external-identity (z.B. AD, Workday, OIDC-Provider) | Verweis auf Master-System |
| detailLevel | enum | required | reference-only | `[full, reference-only, anonymized]` | Steuert, wie viele Personendaten im Repository selbst gehalten werden |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| fillsRoles | [role](./role.md) | n:m | yes | Rollen, die die Person aktuell oder historisch ausfüllt (siehe RoleAssignment) |
| memberOf | organization-unit | n:m | yes | Organisationseinheiten, denen die Person zugeordnet ist |
| primaryOrgUnit | organization-unit | 1:1 | yes | Primäre Organisationseinheit |

**Hinweise**: `fillsRoles` wird über die Relation `RoleAssignment` (role, person, validFrom, validTo, assignmentType, percentage) zeitlich aufgelöst, siehe Konzept §8.3.

## Lifecycle

```
invited → active → inactive
              ↓
          offboarded
```

**Zustände**:
- `invited`: Person ist im System angelegt/referenziert, aber noch nicht authentifiziert
- `active`: Person ist aktiv, kann sich anmelden und Rollen ausfüllen
- `inactive`: Person ist temporär ohne Zugriff (z.B. Elternzeit), Rollenzuweisungen bleiben erhalten
- `offboarded`: Person hat das Unternehmen/Mandat verlassen, Zugriff entzogen, Historie bleibt für Audit erhalten

**Übergänge**:
- `invited → active`: erstes erfolgreiches Login (siehe UC-01)
- `active → inactive`: durch HR-Mastersystem oder manuell durch Rollen mit Autorisierungsrecht
- `* → offboarded`: durch HR-Mastersystem getriggert, Zugriff wird beim nächsten Login-Versuch verweigert

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Eine `active`-Person MUSS mindestens eine Rolle ausfüllen (siehe Konzept-Constraint `person-minimum-role`) | onUpdate, onLogin | – |
| BR-02 | Personendaten mit `detailLevel: full` dürfen nur gehalten werden, wenn keine HR-Mastersystem-Anbindung besteht | onCreate, onUpdate | DSGVO Art. 5 (Datenminimierung) |

## Beispiele

**Beispiel 1**: Referenzierte Person (Standardfall)
```yaml
name: Kurt Lead Enterprise Architekt
email: kurt@example-kmu.de
active: true
detailLevel: reference-only
externalReference:
  system: oidc-provider
  id: kurt.architekt
fillsRoles:
  - role: enterprise-architect
```

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [role](./role.md): Role beschreibt fachlich-funktionale Verantwortung, unabhängig davon, wer sie aktuell ausfüllt. Person ist der konkrete Mensch.
- **NICHT** organization-unit: OrganizationUnit ist die strukturelle Einheit, in der eine Person organisatorisch verortet ist, nicht die Person selbst.

## Verwendung in Use Cases

- [UC-01: Login](../requirements/use-cases/UC-01-login.md)

## Konzept-Bezug

- [§8.3 Person](../concept/20-entities/08-organisation-rollen-personen.md)
- [§8.7 Mastership mit HR-Systemen](../concept/20-entities/08-organisation-rollen-personen.md)
- [§21.8 Authentifizierung/Autorisierung](../concept/70-platform/21-api-architektur.md)

## Notizen

Erste Modellierung im Rahmen von UC-01 Login. Attribute auf das für Authentifizierung/Autorisierung Nötige reduziert; vollständige HR-relevante Attribute (Skills, RACI) folgen bei Bedarf eigener Use Cases.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | Business Engineer | Initial draft im Rahmen von UC-01 Login |
