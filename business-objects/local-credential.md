---
identifier: local-credential
name_de: Lokales Credential
name_en: Local Credential
version: 0.2.0
status: draft
maturity: initial
owner_role: Business Engineer
aliases:
  - Auth-Credential
  - Lokale Authentifizierungsmethode
  - Credential
related_capabilities: []
references:
  - concept: concept/70-platform/21-api-architektur.md
---

# Business Object: Local Credential

## Definition

Ein Local Credential ist das kryptographische Authentifizierungsmaterial, das eine [Person](./person.md) für einen der drei lokalen Authentifizierungsmechanismen (Passkey, TOTP, Passwort) eingerichtet hat und das OEA beim Login ohne externen Identity-Provider prüft.

## Beschreibung

Sobald eine OEA-Instanz lokale Authentifizierung aktiviert hat (kein externer OIDC-Provider vorhanden oder als Ergänzung konfiguriert), müssen Persons ihre Credentials vorab registrieren (Enrollment, [UC-03](../requirements/use-cases/UC-03-authentifizierungsmethode-einrichten.md)). Das Ergebnis dieses Vorgangs ist je ein `LocalCredential`-Objekt pro eingerichteter Methode.

`LocalCredential` ist bewusst **getrennt vom fachlichen Person-Objekt** gehalten: Credential-Daten sind hochsensibel, haben einen anderen Lifecycle als die fachliche Identität und dürfen nicht in EA-Repository-Exporten oder Audit-Reports erscheinen (anders als Name, Rolle oder Verantwortungsbereich einer Person). Ein Person-Objekt kann gleichzeitig mehrere LocalCredentials verschiedener Typen besitzen.

Das BO hat drei Ausprägungen, die über `type` unterschieden werden:
- **passkey**: WebAuthn-Credential (Public Key + Credential-ID); mehrere pro Person zulässig (verschiedene Geräte)
- **totp**: TOTP-Secret nach RFC 6238; mehrere pro Person aktiv zulässig (REQ-030), je mit eigenem Label
- **password**: argon2id- oder bcrypt-Hash; maximal eines pro Person aktiv

Der [System-Admin-Account](./system-admin-account.md) besitzt kein `LocalCredential`; sein Credential ist direkt im dortigen BO modelliert, da er unabhängig vom Person/Role-System existiert.

## Attribute

### Gemeinsame Attribute (alle Typen)

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | string | required | | UUID v4, global eindeutig | Interner Primärschlüssel |
| personId | reference | required | | target: person; immutable nach Anlage | Verknüpfung zur Person |
| type | enum | required | | `[passkey, totp, password]`; immutable | Typ des Credentials |
| status | enum | required | active | `[active, revoked]` | Aktueller Zustand |
| createdAt | datetime | required | | ISO 8601, UTC | Zeitpunkt des Enrollments |
| lastUsedAt | datetime | optional | | ISO 8601, UTC | Letzter erfolgreicher Login mit diesem Credential |
| revokedAt | datetime | optional | | nur gesetzt, wenn `status=revoked` | Zeitpunkt der Deaktivierung |
| revokedReason | enum | optional | | `[device_lost, superseded, admin_action, person_request]`; nur gesetzt, wenn `status=revoked` | Grund der Deaktivierung |

### Typ-spezifische Attribute: `type=passkey`

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| credentialId | string | required | | Base64url-kodiert; eindeutig über alle Passkey-Credentials | WebAuthn Credential ID (vom Authenticator erzeugt) |
| publicKey | string | required | | CBOR-kodierter COSE-Key, Base64url | Public Key des registrierten Authenticators |
| signCount | integer | required | 0 | ≥ 0; wird bei jedem Login aktualisiert | Signatur-Zähler für Replay-Schutz |
| aaguid | string | optional | | UUID-Format | Authenticator-Modell-ID (für zukünftige Attestation-Checks) |
| deviceLabel | string | optional | | max. 255 Zeichen; nutzer-vergeben | Lesbarer Name für das Gerät, z.B. "MacBook Pro" |

### Typ-spezifische Attribute: `type=totp`

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| secretEncrypted | string | required | | AES-256-GCM-verschlüsselt, Base64url; Schlüssel außerhalb der DB | RFC 6238-TOTP-Secret (im Klartext 160 Bit, Base32-kodiert) |
| algorithm | enum | required | SHA1 | `[SHA1, SHA256, SHA512]` | HMAC-Algorithmus (SHA1 für maximale Authenticator-App-Kompatibilität) |
| digits | integer | required | 6 | `[6, 8]` | Länge des generierten Codes |
| period | integer | required | 30 | Sekunden | Gültigkeitsfenster pro Code |
| label | string | optional | auto-generiert | max. 255 Zeichen; nutzer-vergeben | Lesbarer Name für das Gerät/die App, z.B. "iPhone – Google Authenticator"; Default: "TOTP-Authenticator YYYY-MM-DD" |

### Typ-spezifische Attribute: `type=password`

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| passwordHash | string | required | | argon2id- oder bcrypt-Encoded-String; enthält Algorithmus-Parameter | Gehashtes Passwort; Klartext wird nach dem Hashing nicht gehalten |
| algorithm | enum | required | argon2id | `[argon2id, bcrypt]` | Verwendeter Hash-Algorithmus |

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| belongsTo | [person](./person.md) | n:1 | no | Jedes Credential gehört genau einer Person |

**Hinweise**:
- Eine Person kann beliebig viele `passkey`-Credentials haben (ein pro registriertem Gerät).
- Eine Person kann mehrere aktive `totp`-Credentials haben (REQ-030; BR-02 aufgehoben).
- Eine Person hat höchstens ein aktives `password`-Credential (BR-03).
- LocalCredential gehört **nicht** zum fachlichen EA-Metamodell; keine Beziehungen zu Architecture-Objekten (ApplicationComponent, Capability etc.).

## Lifecycle

```
created → active → revoked
```

**Zustände**:
- `active`: Credential ist gültig und für den Login verwendbar (UC-01 A3/A4/A5).
- `revoked`: Credential wurde deaktiviert. Einträge werden nicht gelöscht (Audit-Nachvollziehbarkeit), aber beim Login ignoriert.

**Übergänge**:
- `created → active`: sofort nach erfolgreichem Enrollment (UC-03); kein separater Aktivierungsschritt.
- `active → revoked`: durch die Person selbst in den Sicherheitseinstellungen, durch einen Administrator, oder automatisch beim Ersetzen durch ein neues Credential (nur bei `type=password`, BR-03).

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Credential-Werte (`publicKey`, `secretEncrypted`, `passwordHash`) DÜRFEN NICHT in Audit-Logs, Application-Logs oder API-Responses erscheinen | onCreate, onRead, onUpdate | – |
| BR-02 | ~~Pro Person darf zu einem Zeitpunkt höchstens ein `LocalCredential` mit `type=totp` und `status=active` existieren~~ – aufgehoben durch [REQ-030](../requirements/req/REQ-030-mehrere-totp-credentials.md); mehrere aktive TOTP-Credentials pro Person sind zulässig; kein Auto-Revoke beim Anlegen eines weiteren TOTP | – | – |
| BR-03 | Pro Person darf zu einem Zeitpunkt höchstens ein `LocalCredential` mit `type=password` und `status=active` existieren; wird ein neues Passwort gesetzt, wird das bisherige automatisch auf `revoked` gesetzt | onCreate | – |
| BR-04 | LocalCredentials sind nicht Bestandteil des fachlichen EA-Repository-Exports; sie DÜRFEN NICHT in Snapshots, Berichten oder Graph-Exporten des EA-Modells enthalten sein | onExport | – |
| BR-05 | `signCount` eines Passkey-Credentials MUSS bei jedem Login mit dem übermittelten Wert verglichen werden; ist der übermittelte Wert kleiner oder gleich dem gespeicherten, MUSS der Login abgelehnt werden (Replay-Schutz) | onLogin | – |

## Beispiele

**Beispiel 1**: Passkey-Credential (discoverable credential, MacBook)
```yaml
id: "cred-7f3a9b2e-..."
personId: "person-kurt-..."
type: passkey
status: active
credentialId: "dGVzdC1jcmVkZW50aWFsLWlk..."
publicKey: "pQECAyYgASFY..."
signCount: 42
aaguid: "adce0002-35bc-c60a-648b-0b25f1f05503"
deviceLabel: "MacBook Pro"
createdAt: "2026-06-25T09:15:00Z"
lastUsedAt: "2026-06-25T14:30:00Z"
```

**Beispiel 2**: TOTP-Credential
```yaml
id: "cred-2a8c4d1f-..."
personId: "person-kurt-..."
type: totp
status: active
secretEncrypted: "v1.AES256GCM.nonce.ciphertext..."
algorithm: SHA1
digits: 6
period: 30
createdAt: "2026-06-25T09:20:00Z"
lastUsedAt: "2026-06-25T14:30:00Z"
```

**Beispiel 3**: Passwort-Credential (revoked, durch neues ersetzt)
```yaml
id: "cred-9e1d5c3a-..."
personId: "person-max-..."
type: password
status: revoked
passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$..."
algorithm: argon2id
createdAt: "2026-06-24T11:00:00Z"
revokedAt: "2026-06-25T10:00:00Z"
revokedReason: superseded
```

## Begriffs-Mapping

| Bereich | Bezeichnung | Hinweis |
|---|---|---|
| WebAuthn-Spec | Credential / Public Key Credential | `credentialId` entspricht `id` der WebAuthn-Spec |
| FIDO2 | Authenticator Credential | `aaguid` ist FIDO2-Begriff |
| RFC 6238 | TOTP Secret | entspricht `secretEncrypted` (entschlüsselt) |
| OWASP | Password Hash | entspricht `passwordHash` |

## Abgrenzung zu ähnlichen Objekten

- **NICHT** [person](./person.md): Person ist die fachliche Identität im EA-Repository; `LocalCredential` ist ausschließlich Authentifizierungsmaterial ohne fachlichen EA-Inhalt.
- **NICHT** [system-admin-account](./system-admin-account.md): Der System-Admin-Account existiert vor dem Person/Role-System und hat ein direkt eingebettetes Credential für das Bootstrapping; `LocalCredential` setzt eine existierende Person voraus.
- **NICHT** Enrollment-Token: Das Token aus UC-03 ist ein einmaliger Zugangscode für das Enrollment selbst und wird nach Verbrauch invalidiert; `LocalCredential` ist das dauerhafte Ergebnis des Enrollments.
- **NICHT** OIDC-Session / Access-Token: Diese entstehen nach einem erfolgreichen Login und berechtigen zu einzelnen Operationen; `LocalCredential` ist das persistente Material, das den Login überhaupt erst ermöglicht.

## Verwendung in Use Cases

- [UC-01: Login](../requirements/use-cases/UC-01-login.md) (Alternative Flows A3, A4, A5 – Login setzt vorhandenes Credential voraus)
- [UC-03: Authentifizierungsmethode einrichten](../requirements/use-cases/UC-03-authentifizierungsmethode-einrichten.md) (erzeugt LocalCredential)

## Konzept-Bezug

- [§21.8 Authentifizierung/Autorisierung – Lokale Authentifizierung](../concept/70-platform/21-api-architektur.md)

## Notizen

Erste Modellierung im Rahmen von UC-03 (Enrollment). Bewusst als ein BO mit Type-Diskriminator modelliert statt drei separater BOs (`PasskeyCredential`, `TotpCredential`, `PasswordCredential`): Die gemeinsamen Felder (personId, status, lifecycle, Audit-Attribute) überwiegen die typ-spezifischen Unterschiede; separate BOs würden die Traceability-Matrix unnötig aufblähen.

Offene Fragen:
- Soll `deviceLabel` (Passkey) vom Nutzer frei editierbar sein, oder ist ein Standard-Label aus dem Authenticator (`authenticatorAttachment`) vorzuziehen?
- Wird ein separater Recovery-Code-Mechanismus (Recovery Codes für Lockout-Prävention) als weiterer `type` in diesem BO modelliert, oder als eigenständiges BO?

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Business Engineer | Initial draft im Rahmen von UC-03 Enrollment |
