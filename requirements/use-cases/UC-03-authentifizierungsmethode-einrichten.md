---
id: UC-03
title: Authentifizierungsmethode einrichten
status: draft
priority: must
target_release: walking-skeleton
complexity: medium
version: 0.1.0
created: 2026-06-25
last_updated: 2026-06-25
primary_actor: SH-03
secondary_actors:
  - SH-06
references:
  business_objects:
    - person
    - local-credential
  concept:
    - concept/70-platform/21-api-architektur.md
    - concept/20-entities/08-organisation-rollen-personen.md
  related_use_cases:
    - UC-01
    - UC-02
---

# UC-03: Authentifizierungsmethode einrichten

## Goal in Context

UC-01 (Login) setzt bei lokaler Authentifizierung voraus, dass die Person einen Passkey, ein TOTP-Secret oder ein Passwort bereits registriert hat (Vorbedingung, Enrollment). Ohne diesen vorgelagerten Schritt kann eine Person in Instanzen ohne externen Identity-Provider gar nicht einloggen. UC-03 schließt diese Lücke: Eine neu eingeladene oder bereits aktive Person richtet die für ihre Instanz verfügbaren lokalen Authentifizierungsmethoden ein, bevor oder während sie das System produktiv nutzt.

## Persona und Story

**Primärer Akteur**: [Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Weitere Beteiligte**: [Max – Operator im KMU](../../business-analysis/stakeholders/SH-06-max-operator-kmu.md) – Max konfiguriert, welche lokalen Authentifizierungsmethoden für die Instanz aktiviert sind

**Story**: Als eingeladene Person möchte ich eine lokale Authentifizierungsmethode einrichten, damit ich mich ohne externen Identity-Provider an der OEA-Instanz anmelden kann.

## Trigger

- Externer Anlass: Kurt hat eine Einladung (Enrollment-Link mit einmaligem Token) von Max oder einem Administrator erhalten, nachdem sein Person-Objekt in OEA angelegt wurde
- Zeitpunkt: einmalig nach Einladung; optional erneut zum Hinzufügen weiterer Methoden
- Vorgänger-Use-Case: Personen-Anlage durch Administrator (noch kein UC modelliert); UC-02 für den initialen System-Admin-Account

## Vorbedingungen (Pre-Conditions)

- [ ] Eine [Person](../../business-objects/person.md) mit Lifecycle-Status `invited` oder `active` existiert im System
- [ ] Die OEA-Instanz hat mindestens eine lokale Authentifizierungsmethode aktiviert (Passkey, TOTP, oder Passwort; konfiguriert durch Max)
- [ ] Kurt hat einen Einrichtungslink mit gültigem, nicht bereits verbrauchtem Enrollment-Token erhalten
- [ ] Das Enrollment-Token ist noch nicht abgelaufen

## Nachbedingungen (Post-Conditions)

### Bei Erfolg

- Die eingerichtete Methode (Passkey-Public-Key, TOTP-Secret oder Passwort-Hash) ist sicher persistiert und mit Kurts Person-Objekt verknüpft
- Das verwendete Enrollment-Token ist als verbraucht markiert (einmalige Verwendung)
- Audit-Log enthält einen Eintrag: Person, Zeitpunkt, eingerichtete Methode
- Kurt kann sich ab sofort über die eingerichtete Methode anmelden (UC-01 A3 / A4 / A5)
- Lifecycle-Status der Person bleibt unverändert (`invited` oder `active`); Übergang zu `active` erfolgt erst beim ersten erfolgreichen Login (UC-01)

### Bei Misserfolg

- Keine Credentials werden persistiert
- Das Enrollment-Token bleibt gültig, sofern der Fehler nicht in E1 (ungültiges Token) besteht
- Kurt erhält eine klare Fehlermeldung ohne sicherheitsrelevante Details

## Hauptablauf (Basic Flow)

*Standardfall: TOTP-Einrichtung über Einladungslink*

1. **Kurt**: öffnet den Einrichtungslink aus der Einladung im Browser
2. **System**: prüft das Enrollment-Token (Gültigkeit, nicht verbraucht, nicht abgelaufen) und zeigt die Enrollment-Oberfläche mit den für die Instanz verfügbaren Methoden
3. **Kurt**: wählt TOTP als Methode
4. **System**: generiert ein neues TOTP-Secret, zeigt es als QR-Code (URI-Format: `otpauth://`) und im Klartext zur manuellen Eingabe an
5. **Kurt**: scannt den QR-Code mit einer Authenticator-App und gibt den aktuell angezeigten 6-stelligen Code zur Verifikation ein
6. **System**: verifiziert den eingegebenen Code gegen das generierte Secret; bei Erfolg persistiert es das Secret verschlüsselt, verknüpft es mit Kurts Person-Objekt
7. **System**: markiert das Enrollment-Token als verbraucht, schreibt Audit-Log-Eintrag
8. **System**: bestätigt die erfolgreiche Einrichtung; Kurt kann sich jetzt mit Username, Passwort und TOTP-Code anmelden (UC-01 A4)

## Alternative Abläufe (Alternative Flows)

**A1 – Passkey-Einrichtung**: Bei Schritt 3, wenn Kurt Passkey wählt:
1. System startet WebAuthn-Registrierungs-Challenge (PublicKeyCredentialCreationOptions); die Challenge enthält Nutzer-Handle und RP-ID
2. Kurt bestätigt die Registrierung mit einem kompatiblen Authenticator (Plattform-Authenticator oder Sicherheitsschlüssel)
3. Authenticator erzeugt ein neues Key-Pair; der Public Key und die Credential-ID werden an das System übermittelt
4. System verifiziert die Registrierungsantwort und persistiert Public Key und Credential-ID verknüpft mit Kurts Person-Objekt
- Mündet zurück in Schritt 7 des Hauptablaufs

**A2 – Passwort-Einrichtung (Minimal-Variante)**: Bei Schritt 3, wenn Kurt Passwort wählt (nur falls die Instanz diese Methode aktiviert hat):
1. System zeigt ein Formular für Passwort und Passwort-Bestätigung
2. Kurt gibt ein neues Passwort ein und bestätigt es
3. System prüft die Passwort-Stärke gegen die konfigurierten Mindestanforderungen; bei Erfolg wird der Passwort-Hash (bcrypt oder argon2) persistiert
- Mündet zurück in Schritt 7 des Hauptablaufs

**A3 – Weitere Methode hinzufügen (bereits eingeloggte Person)**: Wenn Kurt bereits authentifiziert ist (via OIDC oder bestehende lokale Methode) und eine weitere lokale Methode einrichten möchte, ohne einen Einladungslink zu verwenden:
1. Kurt navigiert zu den Sicherheitseinstellungen seines Profils
2. System zeigt verfügbare, noch nicht eingerichtete Methoden
3. Kurt wählt eine Methode (Passkey, TOTP oder Passwort); der methodenspezifische Ablauf entspricht A1, dem Hauptablauf oder A2
4. System persistiert die neue Methode; kein Enrollment-Token wird benötigt
- Kein Token-Verbrauch (A3 verwendet Session-Authentifizierung statt Enrollment-Token)

## Ausnahmen / Fehlerfälle (Exception Flows)

**E1 – Enrollment-Token ungültig oder abgelaufen**:
- Bedingung: Token existiert nicht, ist bereits verbraucht oder hat die maximale Lebensdauer überschritten
- Erwartete Reaktion: System zeigt allgemeine Fehlermeldung ("Einrichtungslink ungültig oder abgelaufen"), kein Enrollment-Formular wird angezeigt
- Wiederaufnahme: Kurt muss einen neuen Einrichtungslink vom Administrator anfordern

**E2 – TOTP-Verifikation schlägt fehl**:
- Bedingung: Kurt gibt bei Schritt 5 einen falschen oder abgelaufenen Code ein
- Erwartete Reaktion: System zeigt Fehlermeldung ("Code ungültig, bitte erneut versuchen"), kein Secret wird persistiert
- Wiederaufnahme: Kurt gibt den nächsten aktuellen Code ein; das Enrollment-Token bleibt gültig

**E3 – Passkey-Registrierung schlägt fehl**:
- Bedingung: Kurt bricht die Authenticator-Bestätigung ab, oder der Authenticator meldet einen Fehler (z.B. Gerät nicht kompatibel)
- Erwartete Reaktion: System zeigt allgemeine Fehlermeldung, kein Public Key wird persistiert
- Wiederaufnahme: Kurt kann die Registrierung erneut starten oder eine alternative Methode wählen; das Enrollment-Token bleibt gültig

**E4 – Passwort erfüllt Mindestanforderungen nicht**:
- Bedingung: Das eingegebene Passwort ist zu kurz oder verletzt andere konfigurierte Passwort-Regeln
- Erwartete Reaktion: System zeigt konkrete Fehlermeldung mit den nicht erfüllten Anforderungen
- Wiederaufnahme: Kurt gibt ein neues Passwort ein; das Enrollment-Token bleibt gültig

## Datenfluss

| Schritt | Daten | Richtung | Bemerkung |
|---|---|---|---|
| 1 | Enrollment-Token (im URL-Fragment oder als Query-Parameter) | Kurt → System | Token darf nicht im Server-Log erscheinen |
| 2 | Token-Validierungsergebnis, verfügbare Methoden | System → Kurt | |
| 4 (TOTP) | TOTP-Secret, QR-Code-URI | System → Kurt | Secret nur einmalig anzeigen |
| 5 (TOTP) | Verifikations-Code (6 Stellen) | Kurt → System | |
| A1 (Passkey) | WebAuthn-Challenge, RP-ID, Nutzer-Handle | System → Kurt | |
| A1 (Passkey) | Public Key, Credential-ID, Attestation | Kurt → System | Privater Schlüssel verlässt den Authenticator nie |
| A2 (Passwort) | Passwort-Klartext | Kurt → System | Nur für Hashing, nie persistiert oder geloggt |
| 6–7 | Credential-Persistierung, Audit-Log | System intern | Credentials getrennt vom Person-Objekt speichern |

## Beteiligte Business Objects

| Business Object | Operation | Notiz |
|---|---|---|
| [person](../../business-objects/person.md) | read | Identifikation der Person über Enrollment-Token; Lifecycle bleibt unverändert |
| [local-credential](../../business-objects/local-credential.md) | create | Je nach gewählter Methode wird ein Passkey-, TOTP- oder Passwort-Credential angelegt und mit der Person verknüpft |

## Akzeptanzkriterien

- [ ] Hauptablauf (TOTP-Einrichtung via Enrollment-Token) vollständig durchlaufbar
- [ ] A1 (Passkey-Registrierung via WebAuthn) funktioniert; Public Key ist korrekt persistiert und für UC-01 A3 verwendbar
- [ ] A2 (Passwort-Einrichtung) funktioniert; Passwort-Hash ist korrekt persistiert und für UC-01 A5 verwendbar
- [ ] A3 (Weitere Methode für eingeloggte Person) funktioniert ohne Enrollment-Token
- [ ] Enrollment-Token ist nach erfolgreicher Einrichtung als verbraucht markiert; ein zweites Einlösen des gleichen Tokens schlägt fehl (E1)
- [ ] Abgelaufene Enrollment-Token werden abgelehnt (E1)
- [ ] TOTP-Verifikations-Fehler (E2) lassen das Token gültig und geben keine Hinweise auf das Secret
- [ ] Passkey-Registrierungsfehler (E3) lassen das Token gültig
- [ ] Passwort-Anforderungsfehler (E4) zeigen konkrete Anforderungen ohne Sicherheits-Leak
- [ ] Audit-Log enthält nach erfolgreicher Einrichtung: Person-ID, Zeitpunkt, eingerichtete Methode
- [ ] Das TOTP-Secret und Passwort-Klartext erscheinen nicht in Server-Logs
- [ ] Nach erfolgreicher Einrichtung ist der Login mit der neuen Methode über UC-01 möglich

## Nicht im Scope

- Versand des Enrollment-Links / der Einladungs-E-Mail (separater Mechanismus, z.B. durch Administrator oder automatisch bei Personen-Anlage – kein UC modelliert)
- Anlegen der Person selbst (Persona- und Rollen-Zuweisung durch Administrator – kein UC modelliert)
- Passwort-Reset für lokal verwaltete Accounts (separater Use Case)
- Verwaltung (Anzeige, Löschen) bereits registrierter Methoden (separater Use Case oder Profil-Verwaltungs-UC)
- Enrollment-Link-Zustellung über sichere Kanäle (liegt beim Administrator/Betreiber, nicht bei OEA)
- Recovery-Codes für den Fall, dass alle registrierten Methoden verloren gehen (separater Use Case oder Teil des Break-Glass-Verfahrens)
- Enrollment für den System-Admin-Account (UC-02 löst das Bootstrapping-Problem separat)
- OIDC-Account-Verknüpfung (die Person hat bereits eine `externalReference` für OIDC; kein Enrollment nötig)

## Konzept-Bezüge

- [§21.8 Authentifizierung/Autorisierung – Lokale Authentifizierung](../../concept/70-platform/21-api-architektur.md)
- [§8.3 Person](../../concept/20-entities/08-organisation-rollen-personen.md)

## Realisierungs-Hinweise

- Enrollment-Token: kryptographisch zufällig (≥ 128 Bit Entropie), einmalig verwendbar, mit Ablaufzeit (konfigurierbar, z.B. 48 h)
- Token-Übergabe im Link: als URL-Fragment (`#token=...`) bevorzugen, um Server-Logs zu vermeiden; falls Query-Parameter, dann HTTPS erzwingen und kein Caching erlauben
- TOTP: RFC 6238, 30-Sekunden-Fenster, SHA-1 (Authenticator-App-Kompatibilität); Secret mit AES-256 verschlüsselt persistieren, nicht im Klartext
- Passkey: WebAuthn Level 2, `attestation: none` als Default (Datenschutz); Plattform-Authenticator und Roaming-Authenticator (CTAP2) unterstützen
- Passwort-Hashing: argon2id (empfohlen) oder bcrypt (Fallback für Umgebungen ohne argon2-Bibliothek); Klartext nur im Arbeitsspeicher, nie loggen
- Credentials getrennt vom Person-Objekt speichern (sensibel, kein Teil des fachlichen EA-Modells) – eigene Tabelle/Collection mit Fremdschlüssel zu `person.id`
- EntityTypes: `Person` (Referenz), neues BO `LocalCredential` (Passkey-Public-Key, TOTP-Secret, Passwort-Hash, Methoden-Typ)
- A3 (Methode hinzufügen) erfordert bestehende Session → CSRF-Schutz (SameSite-Cookie oder CSRF-Token)

## Realisierende Bestandteile

<!-- Wird gefüllt, wenn Requirements/User Stories existieren. -->

- Requirements: [REQ-021](../req/REQ-021-enrollment-token-validierung.md), [REQ-022](../req/REQ-022-totp-enrollment.md), [REQ-023](../req/REQ-023-passkey-enrollment.md), [REQ-024](../req/REQ-024-passwort-enrollment.md), [REQ-025](../req/REQ-025-audit-log-enrollment.md), [REQ-026](../req/REQ-026-weitere-methode-authentifizierte-person.md)
- User Stories: [US-020](../user-stories/US-020-enrollment-einstieg-einladungslink.md), [US-021](../user-stories/US-021-totp-enrollment.md), [US-022](../user-stories/US-022-passkey-enrollment.md), [US-023](../user-stories/US-023-passwort-enrollment.md), [US-024](../user-stories/US-024-audit-log-enrollment.md), [US-025](../user-stories/US-025-weitere-methode-eingeloggte-person.md)
- ADRs: [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md) (lokale Auth als Option)
- Test Cases: noch keine
- Implementation: noch keine

## Offene Fragen

- [x] Welches Business Object modelliert die lokalen Credentials? → [local-credential](../../business-objects/local-credential.md) modelliert (2026-06-25); ein BO mit Type-Diskriminator (`passkey` | `totp` | `password`).
- [x] Soll ein Nutzer mehrere Passkeys registrieren können? → Ja, gemäß BR-02/BR-03 in `local-credential.md`: mehrere Passkeys erlaubt, max. ein aktives TOTP und ein aktives Passwort.
- [ ] Wie wird der Enrollment-Link an Kurt übermittelt (E-Mail-Versand durch OEA vs. manuelles Kopieren durch Admin)? Beeinflusst, ob OEA einen Mail-Service braucht.
- [ ] Soll die Ablaufzeit des Enrollment-Tokens instanzweit konfigurierbar sein (z.B. 24 h / 72 h / kein Ablauf)?
- [ ] Kann ein Administrator einen neuen Enrollment-Link für eine bereits `active` Person ausstellen (z.B. nach Geräteverlust), oder ist dafür ein Recovery-Mechanismus nötig?
- [ ] Wird für die Minimal-Passkey-Einrichtung im Walking Skeleton nur discoverable credentials (resident keys) unterstützt, oder auch non-resident?

## Notizen

UC-03 schließt die Lücke, die UC-01 explizit als "Nicht im Scope" ausgewiesen hat. Der primäre Akteur ist Kurt (SH-03), weil er das Single-User-KMU-Szenario repräsentiert, in dem kein externer IdP vorhanden ist – Max (SH-06) ist als Operator für die Konfiguration relevant, aber nicht derjenige, der sich selbst einrichtet.

Die Wahl von TOTP als Hauptablauf (statt Passkey) erfolgt wegen der breiteren Gerätekompatibilität ohne WebAuthn-Hardware-Abhängigkeit. Passkey bleibt in A1 der empfohlene Mechanismus gemäß Konzept §21.8.

Der Enrollment-Token-Mechanismus ist bewusst abstrakt gehalten; der Zustellungskanal (E-Mail, CLI-Output, Setup-URL) ist noch offen (siehe Offene Fragen) und beeinflusst, ob OEA einen Mail-Service benötigt.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | Requirements Engineer | Initial draft |
