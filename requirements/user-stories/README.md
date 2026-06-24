# User Stories

Granulare Backlog-Items, kleiner als Use Cases. Pro Story eine Datei mit Schema `US-NNN-kurzname.md` (3-stellig, weil mehr Stories als Use Cases entstehen).

## INVEST-Kriterien

Jede Story soll erfüllen:
- **Independent**: möglichst unabhängig von anderen Stories
- **Negotiable**: Details verhandelbar
- **Valuable**: liefert Wert
- **Estimable**: Aufwand schätzbar
- **Small**: in 1-3 Tagen umsetzbar
- **Testable**: prüfbares Akzeptanzkriterium

## Übersicht

| ID | Titel | Use Case | Story Points | Status |
|---|---|---|---|---|
| [US-001](./US-001-oidc-login.md) | OIDC-Login mit Session-Erstellung | UC-01 | 8 | backlog |
| [US-002](./US-002-api-key-auth.md) | API-Key-Authentifizierung (M2M) | UC-01 | 3 | backlog |
| [US-003](./US-003-zugriff-ohne-rolle.md) | Eingeschränkter Zugriff ohne Rollenzuweisung | UC-01 | 2 | backlog |
| [US-004](./US-004-ablehnung-unbekannte-person.md) | Ablehnung bei unbekannter/offboardeter Person | UC-01 | 2 | backlog |
| [US-005](./US-005-audit-log-login.md) | Audit-Log für Login-Versuche | UC-01 | 3 | backlog |
| [US-006](./US-006-generische-fehlermeldung.md) | Generische Fehlermeldung (Anti-Enumeration) | UC-01 | 2 | backlog |
| [US-007](./US-007-lifecycle-invited-active.md) | Lifecycle-Übergang invited→active | UC-01 | 1 | backlog |
| [US-008](./US-008-login-latenz.md) | Login-Latenz-Ziele erfüllen und messen | UC-01 | 5 | backlog |
| [US-009](./US-009-passkey-login.md) | Passkey-Login | UC-01 | 8 | backlog |
| [US-010](./US-010-totp-login.md) | Username/Passwort-Login mit TOTP | UC-01 | 5 | backlog |
| [US-011](./US-011-passwort-minimal.md) | Username/Passwort-Login ohne 2. Faktor | UC-01 | 3 | backlog |
| [US-012](./US-012-token-lebensdauer-konfigurierbar.md) | Konfigurierbare Token-Lebensdauer (lokal) | UC-01 | 2 | backlog |
| [US-013](./US-013-lokales-bootstrapping.md) | Lokales Bootstrapping bei fehlendem Admin | UC-02 | 5 | backlog |
| [US-014](./US-014-remote-bootstrapping.md) | Remote-Bootstrapping über IdP-Claim-Mapping | UC-02 | 5 | backlog |
| [US-015](./US-015-kein-paralleles-bootstrapping.md) | Kein paralleles/wiederholtes Bootstrapping | UC-02 | 3 | backlog |
| [US-016](./US-016-audit-log-bootstrapping.md) | Audit-Log für Bootstrapping-Vorgang | UC-02 | 2 | backlog |
| [US-017](./US-017-sichere-setup-token-uebergabe.md) | Sichere Setup-Token-Übergabe | UC-02 | 3 | backlog |
| [US-018](./US-018-warnung-leerer-admin-claim.md) | Warnung bei leerem Remote-Admin-Claim | UC-02 | 3 | backlog |
| [US-019](./US-019-deaktivierbarkeit-lokaler-admin.md) | Deaktivierbarkeit des lokalen System-Admin-Accounts | UC-02 | 2 | backlog |
