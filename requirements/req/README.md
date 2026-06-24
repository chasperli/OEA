# Requirements (atomar, alle Typen)

Atomare, prüfbare Anforderungen aus den Use Cases abgeleitet. Pro Anforderung eine Datei nach Schema `REQ-NNN-kurzname.md`.

## Requirement-Typen

| Typ | Beispiel |
|---|---|
| `functional` | "System muss Application Component erstellen können" |
| `non-functional` | "Erstellung muss in <200ms abgeschlossen sein" |
| `constraint` | "Nur Repository-Owner dürfen Schema ändern" |
| `business-rule` | "Personenbezogene Daten brauchen Rechtsgrundlage (DSGVO Art. 6)" |
| `data` | "Application Component hat Pflichtfeld: Name, max 255 Zeichen" |
| `interface` | "REST-Endpoint POST /api/v1/applications muss OpenAPI-konform sein" |
| `compliance` | "Audit-Trail erfasst alle schreibenden Operationen (DORA)" |

## Verantwortlich

Der Requirements Engineer (`.claude/agents/requirements-engineer.md`) leitet aus Use Cases ab. Pflicht: jedes Requirement hat einen Use-Case-Bezug.

## Anti-Patterns

- **Compound Requirement**: ein REQ, das mehrere Anforderungen mischt → zerlegen
- **Vague Requirement**: "soll benutzerfreundlich sein" ohne Messbarkeit
- **Solution in Requirement**: "MUSS Redis verwenden" – das ist Lösung, nicht Anforderung
- **NFR ohne Zahl**: ohne Zielwert und Verifikationsmethode nicht akzeptiert

## Übersicht

| ID | Titel | Typ | Priorität | Status | Use Case |
|---|---|---|---|---|---|
| [REQ-001](./REQ-001-oidc-login-session.md) | OIDC-basierte Anmeldung und Session-Erstellung | functional | must | proposed | UC-01 |
| [REQ-002](./REQ-002-api-key-authentication.md) | API-Key-Authentifizierung für M2M-Zugriffe | functional | should | proposed | UC-01 |
| [REQ-003](./REQ-003-zugriff-ohne-rollenzuweisung.md) | Eingeschränkter Zugriff bei fehlender Rollenzuweisung | business-rule | must | proposed | UC-01 |
| [REQ-004](./REQ-004-ablehnung-unbekannte-offboarded-person.md) | Ablehnung bei unbekannter/offboardeter Person | functional | must | proposed | UC-01 |
| [REQ-005](./REQ-005-audit-log-login.md) | Audit-Log-Eintrag für jeden Login-Versuch | compliance | must | proposed | UC-01 |
| [REQ-006](./REQ-006-keine-preisgabe-account-existenz.md) | Keine Preisgabe der Account-Existenz | constraint | must | proposed | UC-01 |
| [REQ-007](./REQ-007-lifecycle-uebergang-invited-active.md) | Lifecycle-Übergang invited→active | business-rule | should | proposed | UC-01 |
| [REQ-008](./REQ-008-login-latenz.md) | Login-Latenz | non-functional | should | proposed | UC-01 |
| [REQ-009](./REQ-009-passkey-login.md) | Passkey-Login (lokale Auth) | functional | should | proposed | UC-01 |
| [REQ-010](./REQ-010-username-passwort-totp.md) | Username/Passwort + TOTP (lokale Auth) | functional | should | proposed | UC-01 |
| [REQ-011](./REQ-011-username-passwort-minimal.md) | Username/Passwort ohne 2. Faktor (Minimal) | functional | could | proposed | UC-01 |
| [REQ-012](./REQ-012-token-lebensdauer-lokal.md) | Konfigurierbare Token-Lebensdauer (lokal) | data | should | proposed | UC-01 |
| [REQ-013](./REQ-013-lokales-bootstrapping.md) | Lokales Bootstrapping bei fehlendem System-Admin-Account | functional | must | proposed | UC-02 |
| [REQ-014](./REQ-014-remote-bootstrapping.md) | Remote-Bootstrapping über IdP-Claim-Mapping | functional | should | proposed | UC-02 |
| [REQ-015](./REQ-015-kein-paralleles-bootstrapping.md) | Kein paralleles oder wiederholtes Bootstrapping | business-rule | must | proposed | UC-02 |
| [REQ-016](./REQ-016-audit-log-bootstrapping.md) | Audit-Log-Eintrag für Bootstrapping-Vorgang | compliance | must | proposed | UC-02 |
| [REQ-017](./REQ-017-sichere-setup-token-uebergabe.md) | Sichere Übergabe des Setup-Tokens | constraint | must | proposed | UC-02 |
| [REQ-018](./REQ-018-warnung-leerer-admin-claim.md) | Warnung bei leerem Remote-Admin-Claim | functional | should | proposed | UC-02 |
| [REQ-019](./REQ-019-deaktivierbarkeit-lokaler-admin.md) | Deaktivierbarkeit des lokalen System-Admin-Accounts | business-rule | should | proposed | UC-02 |
| [REQ-020](./REQ-020-erzwingung-zweiter-faktor.md) | Instanzweite Erzwingung eines zweiten Faktors (nicht für System-Admin) | business-rule | should | proposed | UC-01 |

## Slash-Command

`/new-requirement` legt ein neues Requirement aus dem Template an.

## NFR-Migration

Falls du das Legacy-`nfr/`-Verzeichnis nutzt: NFRs können mit `type: non-functional` ins `req/`-Verzeichnis migriert werden. Empfehlung: ab jetzt nur noch `req/`.
