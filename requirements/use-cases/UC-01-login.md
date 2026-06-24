---
id: UC-01
title: Login
status: draft
priority: must
target_release: walking-skeleton
complexity: small
version: 0.5.0
created: 2026-06-24
last_updated: 2026-06-24
primary_actor: SH-03
secondary_actors:
  - SH-06
references:
  business_objects:
    - person
    - role
  concept:
    - concept/70-platform/21-api-architektur.md
    - concept/20-entities/08-organisation-rollen-personen.md
  related_use_cases:
    - UC-02
---

# UC-01: Login

## Goal in Context

Kurt verwaltet das Architektur-Repository über Git/Markdown, nutzt aber auch UI- und API-Funktionen (siehe SH-03: CLI bevorzugt, UI nur für Diagramme). Bevor er irgendeine Aktion im Repository durchführen kann, muss das System wissen, wer er ist und welche Rolle er ausfüllt – nur so lassen sich seine Berechtigungen (z.B. Schema-Änderungen, Plateau-Freigaben) korrekt zuordnen. Login ist die Voraussetzung für jeden weiteren Use Case, der über öffentlich-lesbare Inhalte hinausgeht.

## Persona und Story

**Primärer Akteur**: [Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Weitere Beteiligte**: [Max – Operator im KMU](../../business-analysis/stakeholders/SH-06-max-operator-kmu.md) – Max betreibt die Instanz und entscheidet, welche Authentifizierungsmechanismen (SSO via OIDC vs. lokale Authentifizierung) für die Organisation verfügbar sind

**Story**: Als Person mit einer im Repository hinterlegten Rolle möchte ich mich am System anmelden, damit ich gemäß meiner Rolle auf die für mich freigegebenen Bereiche des EA-Repositorys zugreifen kann.

## Trigger

- Externer Anlass: Kurt öffnet die OEA-Oberfläche oder ruft die API/CLI mit einer schreibenden oder geschützten Operation auf
- Zeitpunkt: zu Beginn jeder Arbeitssitzung, oder wenn eine bestehende Sitzung abgelaufen ist
- Vorgänger-Use-Case: keiner – Login ist Einstiegspunkt

## Vorbedingungen (Pre-Conditions)

- [ ] Eine [Person](../../business-objects/person.md) mit gültiger `email`/`externalReference` existiert
- [ ] Der Person ist mindestens eine aktive [Role](../../business-objects/role.md) zugewiesen (RoleAssignment mit `validFrom <= heute <= validTo`)
- [ ] Mindestens ein Authentifizierungsmechanismus ist für die OEA-Instanz konfiguriert (siehe Konzept §21.8): OIDC-Identity-Provider (inkl. SSO), und/oder lokale Authentifizierung (Passkey, Username/Passwort optional mit TOTP)
- [ ] Falls der Betreiber bei der Inbetriebnahme die Erzwingung eines zweiten Faktors aktiviert hat (siehe REQ-020): A5 (Username/Passwort ohne zweiten Faktor) ist für reguläre Personen nicht nutzbar – diese Erzwingung gilt nicht für den System-Admin-Account aus UC-02
- [ ] Falls lokale Authentifizierung mit Passkey oder TOTP genutzt wird: die Person hat den jeweiligen Faktor zuvor registriert (Enrollment, siehe "Nicht im Scope")

## Nachbedingungen (Post-Conditions)

### Bei Erfolg

- Eine gültige Session/Access-Token existiert, gebunden an die Person und ihre aktiven Rollen
- Kurt sieht die für seine Rolle(n) sichtbaren Bereiche des Repositorys – der sichtbare Funktionsumfang hängt von der jeweiligen Role ab und ist nicht auf die Rolle "Enterprise Architect" beschränkt (z.B. Schema-Verwaltung bei entsprechender Berechtigung, lesender Zugriff bei anderen Rollen)
- Audit-Log enthält einen Login-Eintrag (Person, Zeitpunkt, genutzter Provider)
- Bei erstem erfolgreichem Login wechselt der Lifecycle-Status der Person von `invited` zu `active` (siehe [person.md](../../business-objects/person.md))

### Bei Misserfolg

- Keine Session wird erstellt
- Keine Berechtigungen werden gewährt
- Kurt erhält eine verständliche Fehlermeldung ohne sicherheitsrelevante Details preiszugeben (kein Hinweis, ob die E-Mail-Adresse existiert)

## Hauptablauf (Basic Flow)

1. **Kurt**: ruft die OEA-Oberfläche auf oder eine geschützte API/CLI-Operation
2. **System**: erkennt fehlende oder abgelaufene Session, leitet zum konfigurierten OIDC-Identity-Provider weiter
3. **Kurt**: authentifiziert sich beim Identity-Provider (z.B. mit Unternehmens-Account)
4. **Identity-Provider**: bestätigt die Identität, leitet mit Authorization Code zu OEA zurück
5. **System**: löst den Authorization Code gegen den Identity-Provider ein, erhält Identity-Token, und verifiziert dessen Gültigkeit (standardmäßig lokale Signaturprüfung gegen die JWKS des Providers; optional zusätzlich Online-Prüfung beim IdP, z.B. Token-Introspection, falls für die Instanz konfiguriert)
6. **System**: gleicht die im Token enthaltene Identität mit dem [Person](../../business-objects/person.md)-Objekt im Repository ab und lädt deren aktive [Role](../../business-objects/role.md)-Zuweisungen
7. **System**: erstellt Session mit den entsprechenden Berechtigungen, bestätigt Kurt die erfolgreiche Anmeldung und zeigt seinen rollenbasierten Einstiegsbereich

## Alternative Abläufe (Alternative Flows)

**A1 – Bestehende gültige Session**: Bei Schritt 2, wenn bereits eine gültige Session vorliegt, dann:
1. System überspringt die Weiterleitung zum Identity-Provider
2. System fährt direkt mit dem für die Operation nötigen Autorisierungs-Check fort
- Mündet zurück in Schritt 7 (Bestätigung entfällt, da keine neue Anmeldung stattfand)

**A2 – API-Key-Authentifizierung (Maschine-zu-Maschine)**: Bei Schritt 2, wenn die Anfrage einen API-Key statt eines Browser-Logins nutzt (siehe Konzept §21.8):
1. System validiert den API-Key direkt, ohne Redirect zum Identity-Provider
2. System ermittelt die dem API-Key zugeordnete Person/Service-Identität und deren Rollen
- Mündet zurück in Schritt 6 des Hauptablaufs

**A3 – Passkey-Login (lokale Authentifizierung, ohne externen IdP)**: Bei Schritt 2, wenn die OEA-Instanz keinen OIDC-Provider, sondern lokale Authentifizierung mit Passkey nutzt (siehe Konzept §21.8):
1. System fordert Kurt zur Passkey-Authentifizierung auf (WebAuthn-Challenge), **ohne vorherige Eingabe von Username oder Passwort** – sofern der registrierte Passkey ein discoverable credential (resident key) ist, identifiziert der Authenticator die Person selbst (FIDO2/WebAuthn-Standard)
2. Kurt bestätigt mit registriertem Passkey (z.B. Plattform-Authenticator, Sicherheitsschlüssel)
3. System verifiziert die WebAuthn-Signatur und ermittelt die Person über den im Credential enthaltenen User-Handle
- Mündet zurück in Schritt 6 des Hauptablaufs
- Nicht-discoverable Credentials (non-resident keys), die eine vorherige Username-Eingabe erfordern, bleiben als Fallback möglich, sind aber nicht der empfohlene Standardfall

**A4 – Username/Passwort mit TOTP (lokale Authentifizierung, zweiter Faktor)**: Bei Schritt 2, wenn die OEA-Instanz lokale Authentifizierung mit Username/Passwort und TOTP nutzt:
1. Kurt gibt Username und Passwort ein
2. System prüft Passwort-Hash; bei Erfolg fordert es den aktuellen TOTP-Code an
3. Kurt gibt den TOTP-Code aus seiner Authenticator-App ein
4. System verifiziert den TOTP-Code gegen das registrierte Secret der Person
- Mündet zurück in Schritt 6 des Hauptablaufs

**A5 – Username/Passwort ohne zweiten Faktor (lokale Authentifizierung, Minimal-Variante)**: Bei Schritt 2, wenn die OEA-Instanz lokale Authentifizierung ohne zweiten Faktor nutzt:
1. Kurt gibt Username und Passwort ein
2. System prüft Passwort-Hash
- Mündet zurück in Schritt 6 des Hauptablaufs
- Diese Variante ist bewusst riskanter (kein zweiter Faktor) und wird im Audit-Log entsprechend gekennzeichnet (siehe REQ-005)
- Der Betreiber kann diese Variante für alle regulären Personen instanzweit sperren, indem er die Erzwingung eines zweiten Faktors aktiviert (siehe REQ-020); diese Sperre betrifft ausschließlich reguläre Personen, nicht den System-Admin-Account aus UC-02

## Ausnahmen / Fehlerfälle (Exception Flows)

**E1 – Identity-Provider lehnt Authentifizierung ab**:
- Bedingung: Kurt gibt falsche Credentials ein oder bricht den Login beim Provider ab
- Erwartete Reaktion: System zeigt allgemeine Fehlermeldung ("Anmeldung nicht erfolgreich"), keine Session wird erstellt
- Wiederaufnahme: Kurt kann den Login-Versuch erneut starten (zurück zu Schritt 2)

**E2 – Person existiert nicht oder ist `offboarded` im Repository**:
- Bedingung: Identity-Token ist gültig, aber keine zugeordnete aktive Person im Repository vorhanden
- Erwartete Reaktion: System verweigert die Session-Erstellung, Audit-Log vermerkt den abgelehnten Zugriffsversuch
- Wiederaufnahme: Kurt muss über eine Rolle mit entsprechender Autorität (z.B. Admin) im Repository freigeschaltet werden

**E3 – Person hat keine aktive Rollenzuweisung**:
- Bedingung: BR-01 aus [person.md](../../business-objects/person.md) ist verletzt (keine `fillsRoles`-Zuweisung mit gültigem Zeitraum)
- Erwartete Reaktion: Session wird erstellt, aber ohne Berechtigungen über öffentlich-lesbare Inhalte hinaus; Kurt erhält Hinweis, dass keine Rolle zugewiesen ist
- Wiederaufnahme: Kurt kontaktiert eine Person mit Autorisierungsrecht zur Rollenzuweisung

**E4 – Identity-Provider nicht erreichbar**:
- Bedingung: Timeout oder Netzwerkfehler bei Schritt 2–5
- Erwartete Reaktion: System zeigt technische Fehlermeldung mit Hinweis auf erneuten Versuch, keine Session
- Wiederaufnahme: Kurt versucht es erneut, sobald der Provider erreichbar ist

## Datenfluss

| Schritt | Daten | Richtung | Bemerkung |
|---|---|---|---|
| 2 | Redirect-URL mit OIDC-Parametern | System → Kurt | state/nonce zur CSRF-Absicherung |
| 3–4 | Credentials, Authorization Code | Kurt ↔ Identity-Provider, Provider → System | nie im Klartext durch OEA-Backend |
| 5 | Authorization Code → Identity-Token (Access Token, ID Token) | System ↔ Identity-Provider | Server-zu-Server, TLS |
| 6 | Identity-Claims (z.B. E-Mail, Subject-ID) | System intern | Abgleich mit Person.externalReference |
| 6 | RoleAssignment-Abfrage | System intern | nur aktive Zuweisungen (validFrom/validTo) |
| 7 | Session-Bestätigung | System → Kurt | enthält keine sensiblen Token-Inhalte im UI |

## Beteiligte Business Objects

| Business Object | Operation | Notiz |
|---|---|---|
| [person](../../business-objects/person.md) | read, update | `update`, wenn Lifecycle-Übergang `invited → active` beim ersten Login erfolgt |
| [role](../../business-objects/role.md) | read | Aktive RoleAssignments werden gelesen, um Berechtigungen abzuleiten |

## Akzeptanzkriterien

- [ ] Hauptablauf vollständig durchlaufbar mit einem konfigurierten OIDC-Provider
- [ ] Vorbedingungen (gültige Person, aktive Rollenzuweisung) werden vor Session-Erstellung geprüft
- [ ] Nachbedingungen bei Erfolg sind erfüllt: Session existiert, Audit-Log-Eintrag vorhanden, rollenbasierter Einstiegsbereich sichtbar
- [ ] Alternative Abläufe A1 (bestehende Session) und A2 (API-Key) funktionieren
- [ ] Besitzt Kurt bereits eine aktive Session beim konfigurierten OIDC-Identity-Provider (SSO), wird er ohne erneute Credential-Eingabe angemeldet
- [ ] Alternative Abläufe A3 (Passkey), A4 (Username/Passwort + TOTP) und A5 (Username/Passwort ohne zweiten Faktor) funktionieren, sofern die Instanz lokale Authentifizierung anbietet
- [ ] Fehlerfälle E1–E4 werden korrekt behandelt, ohne sicherheitsrelevante Informationen zu leaken (kein User-Enumeration-Vektor) – gilt für alle Authentifizierungsmechanismen (OIDC, API-Key, Passkey, lokale Anmeldung)
- [ ] Audit-Log enthält bei jedem Login-Versuch (erfolgreich oder nicht) mindestens: Zeitpunkt, verwendeter Mechanismus (inkl. ob mit/ohne zweiten Faktor), Ergebnis
- [ ] Eine Person ohne aktive Rollenzuweisung kann sich anmelden, erhält aber nur Zugriff auf öffentlich-lesbare Inhalte (E3)

## Nicht im Scope

- Self-Service-Registrierung neuer Personen im Identity-Provider (das ist Aufgabe des IdP/HR-Systems, nicht von OEA)
- Verwaltung von Rollen und Rollenzuweisungen selbst (separater Use Case, z.B. "Rollenzuweisung verwalten")
- Property-Level-Autorisierung auf einzelne Felder (siehe Konzept §21.8) – das betrifft Folge-Use-Cases nach erfolgreichem Login
- Passwort-Reset für OIDC-verwaltete Accounts (liegt beim Identity-Provider)
- Enrollment/Einrichtung von Passkeys, TOTP-Secrets oder lokalen Passwörtern (separater Use Case, z.B. "Authentifizierungsmethode einrichten") – UC-01 setzt eine bereits abgeschlossene Registrierung voraus
- Passwort-Reset für lokal verwaltete Accounts (separater Use Case)

## Konzept-Bezüge

- [§21.8 Authentifizierung/Autorisierung](../../concept/70-platform/21-api-architektur.md)
- [§8.2 Role](../../concept/20-entities/08-organisation-rollen-personen.md)
- [§8.3 Person](../../concept/20-entities/08-organisation-rollen-personen.md)

## Realisierungs-Hinweise

- EntityTypes: `Person`, `Role`
- Relations: `RoleAssignment` (role, person, validFrom, validTo, assignmentType, percentage)
- Constraints: `person-minimum-role` (Konzept §8.8) – wird bei E3 bewusst als Warning statt Hard-Block behandelt, um Onboarding nicht zu blockieren
- Performance-Hinweise: Login ist ein hochfrequenter, latenzkritischer Pfad – Rollenzuweisungen sollten gecacht werden, nicht bei jedem Request neu aufgelöst
- Lokale Authentifizierung (A3–A5) erfordert zusätzliche Datenhaltung pro Person: WebAuthn-Public-Keys, TOTP-Secrets, Passwort-Hashes – Speicherung getrennt vom restlichen Person-Objekt empfehlenswert (sensibel, nicht Teil des fachlichen EA-Modells)
- A5 (Username/Passwort ohne zweiten Faktor) sollte instanzweit deaktivierbar/aktivierbar sein, nicht pro Person

## Realisierende Bestandteile

- Requirements: [REQ-001](../req/REQ-001-oidc-login-session.md), [REQ-002](../req/REQ-002-api-key-authentication.md), [REQ-003](../req/REQ-003-zugriff-ohne-rollenzuweisung.md), [REQ-004](../req/REQ-004-ablehnung-unbekannte-offboarded-person.md), [REQ-005](../req/REQ-005-audit-log-login.md), [REQ-006](../req/REQ-006-keine-preisgabe-account-existenz.md), [REQ-007](../req/REQ-007-lifecycle-uebergang-invited-active.md), [REQ-008](../req/REQ-008-login-latenz.md), [REQ-009](../req/REQ-009-passkey-login.md), [REQ-010](../req/REQ-010-username-passwort-totp.md), [REQ-011](../req/REQ-011-username-passwort-minimal.md), [REQ-012](../req/REQ-012-token-lebensdauer-lokal.md), [REQ-020](../req/REQ-020-erzwingung-zweiter-faktor.md)
- User Stories: [US-001](../user-stories/US-001-oidc-login.md), [US-002](../user-stories/US-002-api-key-auth.md), [US-003](../user-stories/US-003-zugriff-ohne-rolle.md), [US-004](../user-stories/US-004-ablehnung-unbekannte-person.md), [US-005](../user-stories/US-005-audit-log-login.md), [US-006](../user-stories/US-006-generische-fehlermeldung.md), [US-007](../user-stories/US-007-lifecycle-invited-active.md), [US-008](../user-stories/US-008-login-latenz.md), [US-009](../user-stories/US-009-passkey-login.md), [US-010](../user-stories/US-010-totp-login.md), [US-011](../user-stories/US-011-passwort-minimal.md), [US-012](../user-stories/US-012-token-lebensdauer-konfigurierbar.md)
- ADRs: [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md) (Entra ID + Authentik Pflicht, lokale Auth optional)
- Test Cases: noch keine
- Implementation: noch keine

## Offene Fragen

- [x] Welcher konkrete Identity-Provider/Auth-Stack wird genutzt? → entschieden in [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md): Entra ID + Authentik Pflicht, lokale Auth optional
- [ ] Welcher lokale Authentifizierungsmechanismus (Passkey, TOTP, oder nur Username/Passwort) wird für den Walking Skeleton zuerst implementiert, falls nicht alle gleichzeitig?
- [x] Bootstrapping-Use-Case für den initialen System-Admin-Zugang → siehe [UC-02: System-Admin-Bootstrapping](./UC-02-system-admin-bootstrapping.md)
- [x] Wie lange ist eine Session gültig, und wie wird Refresh gehandhabt? → bei externem IdP gibt dieser die Lebensdauer vor (REQ-001, AC4); bei lokaler Authentifizierung ist sie instanzweit konfigurierbar (REQ-012)
- [ ] Soll die Minimal-Variante A5 (Username/Passwort ohne zweiten Faktor) standardmäßig deaktiviert sein und von einer Rolle mit Admin-Autorität bewusst aktiviert werden müssen?
- [ ] Soll die optionale Online-Token-Validierung gegen den IdP (REQ-001) instanzweit konfigurierbar sein, oder pro Rolle/Permission-Level (z.B. nur für `admin`-Operationen verpflichtend)?
- [ ] Welche WebAuthn-Authenticator-Anforderungen werden für discoverable credentials vorausgesetzt (z.B. nur Plattform-Authenticator, oder auch externe Sicherheitsschlüssel)?
- [ ] Wie wird der Fallback von Passkey (A3) auf TOTP (A4) oder Minimal-Variante (A5) gehandhabt, wenn eine Person keinen WebAuthn-fähigen Client nutzt?

## Notizen

Login wurde bewusst zielorientiert formuliert ("Zugriff gemäß Rolle erhalten"), nicht als technischer OIDC-Redirect-Ablauf, auch wenn der Hauptablauf den OIDC-Standardfall beschreibt. Primärer Akteur ist SH-03 (Kurt), weil er im Single-User-KMU-Szenario der härteste Testfall für Self-Hosting-Tauglichkeit ohne dediziertes IdP-Team ist.

Lokale Authentifizierung (Passkey, TOTP, Username/Passwort) wurde als optionale Alternative zu OIDC ergänzt, weil SH-06 (Max, Operator KMU) eigene Nutzerverwaltung ohne SSO explizit als Ablehnungsgrund nennt – im Umkehrschluss darf das Tool aber auch nicht zwingend einen externen IdP voraussetzen. Konzept §21.8 wurde entsprechend erweitert (siehe `concept/CHANGELOG.md` v0.16).

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | Requirements Engineer | Initial draft |
| 0.2.0 | 2026-06-24 | Requirements Engineer | SSO-Akzeptanzkriterium und SH-06-Bezug ergänzt; Alternative Flows A3 (Passkey), A4 (Username/Passwort + TOTP), A5 (Username/Passwort ohne zweiten Faktor) als optionale lokale Authentifizierung ergänzt |
| 0.3.0 | 2026-06-24 | Requirements Engineer | A3 (Passkey) um discoverable-credential/usernameless-Flow präzisiert; optionale Online-Token-Validierung gegen den IdP (Schritt 5) ergänzt |
| 0.4.0 | 2026-06-24 | Requirements Engineer | ADR-006 (Auth-Stack-Wahl: Entra ID + Authentik Pflicht, lokale Auth optional, System-Admin lokal/remote) verlinkt; Token-Lebensdauer geklärt (extern: IdP-vorgegeben, lokal: konfigurierbar, REQ-012) |
| 0.4.1 | 2026-06-24 | Requirements Engineer | Klarstellung in Nachbedingungen: Login und sichtbarer Funktionsumfang betreffen alle Rollen, nicht nur "Enterprise Architect" |
| 0.5.0 | 2026-06-24 | Requirements Engineer | REQ-020 ergänzt: instanzweite Erzwingung eines zweiten Faktors für reguläre Personen, explizit ausgenommen der System-Admin-Account aus UC-02 |
