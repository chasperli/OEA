# US-021: TOTP-Secret einrichten (Authenticator-App registrieren)

**ID**: US-021
**Story Points**: 5
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Person, die sich zum ersten Mal mit ihrem initialen Passwort anmeldet, möchte ich im Rahmen des Logins ein TOTP-Secret per QR-Code in meiner Authenticator-App einrichten, damit ich danach mit Username, Passwort und TOTP-Code vollen Zugriff erhalte.

## Bezug

**Use Case**: [UC-03: Authentifizierungsmethode einrichten](../use-cases/UC-03-authentifizierungsmethode-einrichten.md)
**Persona**: [SH-03: Kurt – Lead Enterprise Architekt](../../business-analysis/stakeholders/SH-03-kurt-lead-enterprise-architekt.md)
**Requirement**: [REQ-022: TOTP-Secret-Enrollment](../req/REQ-022-totp-enrollment.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: Kurt hat TOTP als Methode gewählt
- Wenn: die Seite geladen wird
- Dann: sieht er einen QR-Code (Key-URI-Format `otpauth://totp/…`) und den Secret-Klartext zur manuellen Eingabe

**AC2**:
- Gegeben: Kurt scannt den QR-Code und gibt den aktuellen 6-stelligen Code ein
- Wenn: der Code korrekt ist (Zeittoleranz ±1 Fenster à 30 s)
- Dann: ist das Secret verschlüsselt persistiert; der Login mit TOTP (UC-01 A4) ist möglich

**AC3**:
- Gegeben: Kurt gibt einen falschen Code ein
- Wenn: er das Formular absendet
- Dann: bleibt das Token gültig, es wird kein Secret gespeichert, Kurt kann es erneut versuchen

**AC4**:
- Gegeben: Enrollment wurde abgeschlossen
- Wenn: Server-Logs und Datenbank-Einträge vorliegen
- Dann: ist das TOTP-Secret weder im Klartext noch als Hash in Logs enthalten; in der Datenbank ist es verschlüsselt gespeichert

## Technische Hinweise

- Betroffene Komponenten: Enrollment-Modul (TOTP-Secret-Generierung, QR-Code-Rendering, Verifikation), Credential-Speicher
- Betroffene EntityTypes/Relations: `local_credentials`-Tabelle (`person_id`, `type=totp`, `secret_encrypted`, `created_at`)
- API-Endpunkte: `GET /auth/enrollment/totp/init` (Secret generieren, QR-Code zurückgeben); `POST /auth/enrollment/totp/verify` (Code prüfen und persistieren)
- Datenbank-Änderungen: Zeile in `local_credentials` (Secret AES-256-verschlüsselt)

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (korrekter Code, falscher Code, Secret-Verschlüsselung, Log-Scan)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-023 (initiales Passwort muss gesetzt sein, damit der erste Login als Trigger funktioniert), US-010 (TOTP-Login-Endpunkt ist Ziel nach Enrollment)
- Blockiert: US-024 (Audit-Log kann erst über TOTP-Enrollment-Ereignisse schreiben, wenn dieser Pfad existiert)

## Notizen

Key-URI-Format: `otpauth://totp/{Instanzname}:{E-Mail}?secret={BASE32}&issuer={Instanzname}&algorithm=SHA1&digits=6&period=30`. Das Secret wird nach der Verifikation serverseitig nicht mehr im Klartext gehalten; der QR-Code wird nur einmalig angezeigt (kein Re-Display-Endpunkt).
