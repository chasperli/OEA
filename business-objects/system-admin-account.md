---
identifier: system-admin-account
name_de: System-Admin-Account
name_en: System Admin Account
version: 0.1.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Bootstrap-Admin
  - Break-Glass-Account
related_capabilities: []
references:
  - concept: concept/70-platform/21-api-architektur.md
---

# Business Object: System Admin Account

## Definition

Ein System-Admin-Account ist ein privilegierter, instanzweiter Zugang zur Administration einer OEA-Instanz selbst (Erst-Konfiguration, IdP-Einrichtung, Notfallzugriff) – unabhängig von den im EA-Repository fachlich modellierten [Person](./person.md)- und [Role](./role.md)-Objekten.

## Beschreibung

System-Admin-Account löst das Henne-Ei-Problem einer frisch installierten OEA-Instanz: Bevor irgendeine Person mit einer RoleAssignment im Repository existiert, muss bereits ein Zugang vorhanden sein, um die Instanz überhaupt konfigurieren zu können (siehe [UC-02 Bootstrapping](../requirements/use-cases/UC-02-system-admin-bootstrapping.md)). Er ist deshalb bewusst von Person/Role entkoppelt, nicht etwa eine besondere RoleAssignment.

Gemäß [ADR-006](../adrs/ADR-006-auth-stack-wahl.md) kann ein System-Admin-Account auf zwei Arten realisiert sein:
- **lokal**: ein eingebauter Account mit eigenem Credential (Passwort oder Setup-Token), unabhängig von jedem externen Identity-Provider
- **remote**: eine Zuordnung "wer mit Gruppen-/Rollen-Claim X bei Entra ID/Authentik einloggt, erhält System-Admin-Rechte" – ohne lokal gespeichertes Credential

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| mode | enum | required | local | `[local, remote]` | Bootstrapping-Modus |
| localCredentialHash | string | optional | | nur gesetzt, wenn `mode=local` | Passwort-/Setup-Token-Hash (niemals Klartext) |
| remoteIdpReference | composite | optional | | nur gesetzt, wenn `mode=remote`; Felder: `provider` (entra-id \| authentik), `claimType` (group \| role), `claimValue` (string) | Mapping auf einen IdP-Claim, der System-Admin-Rechte verleiht |
| createdAt | datetime | required | | | Zeitpunkt des Bootstrappings |
| lastUsedAt | datetime | optional | | | letzte erfolgreiche Nutzung |
| active | boolean | required | true | | Ob der Account aktuell nutzbar ist |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| optionallyLinkedTo | [person](./person.md) | 1:1 | yes | Nachträgliche, rein informative Verknüpfung zu einer Person, falls der Admin sich später auch als reguläre Person mit Rolle im Repository abbildet – keine fachliche Notwendigkeit |

**Hinweise**: Es besteht bewusst **keine** Pflicht-Beziehung zu Person oder Role – das ist der ganze Zweck dieses Objekts gegenüber der regulären Authentifizierung aus UC-01.

## Lifecycle

```
bootstrapped → active → deactivated
```

**Zustände**:
- `bootstrapped`: Account wurde während der Erstinstallation angelegt, noch nicht genutzt
- `active`: Account ist aktiv nutzbar
- `deactivated`: Account wurde bewusst deaktiviert (z.B. nach Etablierung einer regulären IdP-Governance, siehe Business Rule BR-02)

**Übergänge**:
- `bootstrapped → active`: erste erfolgreiche Anmeldung mit dem Account
- `active → deactivated`: manuell durch einen bestehenden System-Admin-Account oder eine Person mit entsprechender Autorität

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Pro Instanz darf zu einem Zeitpunkt höchstens ein Bootstrapping-Vorgang aktiv sein (kein paralleles Erst-Setup) | onCreate | – |
| BR-02 | Ein lokaler System-Admin-Account SOLL deaktivierbar sein, sobald mindestens ein externer IdP mit Admin-Mapping konfiguriert ist (Empfehlung, kein Hard-Constraint) | onUpdate | – |
| BR-03 | Eine instanzweite Erzwingung eines zweiten Faktors für reguläre Personen (siehe REQ-020) gilt NICHT für den System-Admin-Account | onLogin | – |

## Beispiele

**Beispiel 1**: Lokaler Bootstrap-Admin
```yaml
mode: local
localCredentialHash: "<argon2id-hash>"
createdAt: 2026-06-24T10:00:00Z
active: true
```

**Beispiel 2**: Remote-gemappter Admin (Entra ID)
```yaml
mode: remote
remoteIdpReference:
  provider: entra-id
  claimType: group
  claimValue: "oea-system-admins"
createdAt: 2026-06-24T10:00:00Z
active: true
```

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [person](./person.md) / [role](./role.md): Diese modellieren fachliche Verantwortung innerhalb des EA-Repositorys; der System-Admin-Account ist reine Instanz-Administration, existiert ggf. bevor überhaupt eine Person im Repository angelegt ist.
- **NICHT** die reguläre lokale Authentifizierung aus REQ-011 (Username/Passwort ohne zweiten Faktor): jene setzt eine bereits existierende Person mit RoleAssignment voraus; der System-Admin-Account existiert unabhängig davon und dient explizit dem Bootstrapping.

## Verwendung in Use Cases

- [UC-02: System-Admin-Bootstrapping](../requirements/use-cases/UC-02-system-admin-bootstrapping.md)

## Konzept-Bezug

- [§21.8 Sicherheit und Autorisierung](../concept/70-platform/21-api-architektur.md)

## Notizen

Erste Modellierung im Rahmen von UC-02 (Bootstrapping). Bewusst minimal gehalten – Multi-Admin-Szenarien (mehrere parallele System-Admin-Accounts) und Recovery/Break-Glass-Verfahren sind als offene Fragen in UC-02 vermerkt, nicht hier vorab entschieden.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | Business Engineer | Initial draft im Rahmen von UC-02 Bootstrapping |
