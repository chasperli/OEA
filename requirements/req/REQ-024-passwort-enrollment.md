---
id: REQ-024
title: Initiales Passwort einrichten (Passwort-Enrollment)
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-25
last_updated: 2026-06-25
author: requirements-engineer
references:
  use_cases:
    - UC-03
  business_objects:
    - person
  business_rules: []
  stakeholders:
    - SH-06
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs:
    - ADR-006
supersedes: []
superseded_by: []
---

# REQ-024: Initiales Passwort einrichten (Passwort-Enrollment)

## Aussage

Das System SOLL das Einrichten eines initialen Passworts als lokale Authentifizierungsmethode ermöglichen; das Passwort MUSS dabei gegen konfigurierbare Mindestanforderungen geprüft und ausschließlich als sicherer Hash (argon2id oder bcrypt) persistiert werden; der Passwort-Klartext DARF NICHT in Logs, Datenbank oder Netzwerk-Antworten erscheinen.

## Begründung

Passwort-Anmeldung ohne zweiten Faktor ist die Minimal-Variante lokaler Authentifizierung (UC-03 Alternative A2, UC-01 Alternative A5). Sie ist bewusst riskanter als Passkey oder TOTP, wird aber benötigt, wenn weder WebAuthn noch eine Authenticator-App verfügbar ist. Adressiert SH-06s Anforderung nach Self-Hosting ohne externen IdP auch in minimaler Infrastruktur.

## Kontext

Setzt ein gültiges Enrollment-Token (REQ-021) oder eine bestehende authentifizierte Session (REQ-026) voraus. Das Passwort wird beim Login durch REQ-011 (Passwort-Login) verwendet. Die Minimal-Variante kann instanzweit deaktiviert werden (REQ-020).

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- Passwort-Klartext (erster Eingabefeld)
- Passwort-Bestätigung (zweites Eingabefeld zur Verhinderung von Tippfehlern)

**Verarbeitung**:
- System prüft, ob beide Felder übereinstimmen
- System prüft das Passwort gegen konfigurierbare Mindestanforderungen (Mindestlänge in Zeichen; optionale Komplexitätsregeln instanzweit konfigurierbar)
- Bei bestandener Prüfung: System erzeugt Hash (argon2id bevorzugt; bcrypt als Fallback)
- Passwort-Hash wird persistiert und mit dem Person-Objekt verknüpft
- Passwort-Klartext wird nach dem Hashing nicht weiter gehalten

**Ausgaben**:
- Erfolgsmeldung
- Bei Fehler (E4 aus UC-03): konkrete Fehlermeldung mit den nicht erfüllten Anforderungen (welche Regel verletzt), kein Hash persistiert

**Fehlerfälle**:
- Felder stimmen nicht überein → Fehlermeldung "Passwörter stimmen nicht überein", kein Hash
- Mindestanforderungen nicht erfüllt → Fehlermeldung mit konkreten Anforderungen, kein Hash; Token bleibt gültig
- Technischer Hashing-Fehler → allgemeine Fehlermeldung, kein Hash

## Akzeptanzkriterien

**AC1**:
- Gegeben: Kurt gibt ein Passwort ein, das alle Mindestanforderungen erfüllt, und bestätigt es korrekt
- Wenn: er das Formular absendet
- Dann: ist der Passwort-Hash persistiert und der Login per Passwort (UC-01 A5) ist ab sofort möglich

**AC2**:
- Gegeben: Kurt gibt ein Passwort ein, das kürzer als die konfigurierte Mindestlänge ist
- Wenn: er das Formular absendet
- Dann: erhält er eine Fehlermeldung, die die Mindestlänge nennt; kein Hash wird gespeichert; das Enrollment-Token bleibt gültig

**AC3**:
- Gegeben: Passwort und Bestätigung stimmen nicht überein
- Wenn: er das Formular absendet
- Dann: erhält er eine Fehlermeldung; kein Hash wird gespeichert

**AC4**:
- Gegeben: Enrollment wurde abgeschlossen
- Wenn: das System Log-Einträge schreibt
- Dann: ist der Passwort-Klartext in keinem Log enthalten

**AC5**:
- Gegeben: der Passwort-Hash ist persistiert
- Wenn: er in der Datenbank abgerufen wird
- Dann: ist nur der Hash gespeichert, nicht der Klartext; der Hash beginnt mit dem algorithmus-spezifischen Präfix (argon2id: `$argon2id$`, bcrypt: `$2b$`)

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Enrollment mit gültigem und ungültigem Passwort; Prüfung des DB-Eintrags auf Hash-Format; Log-Scan nach Klartext-Vorkommen
- [x] Mess-Werkzeug: Test-Suite des Enrollment-Moduls; DB-Inspektion im Test
- [x] Bestanden-Kriterium: AC1–AC5 grün; Login nach Enrollment (AC1) funktioniert via REQ-011
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-021 (Token-Validierung) oder REQ-026 (Session-Auth)
- **Folgewirkungen**: REQ-011 (Passwort-Login setzt gespeicherten Hash voraus); REQ-020 (instanzweite Deaktivierung der Minimal-Variante)
- **Konflikte**: REQ-020 (wenn 2FA-Erzwingung aktiv ist, ist Passwort ohne zweiten Faktor für reguläre Personen gesperrt – Enrollment darf dann ggf. trotzdem stattfinden, aber Login schlägt fehl)

## Risiken bei Nichterfüllung

- Risiko 1: Schwache Passwörter ohne Stärkeprüfung erhöhen Brute-Force-Anfälligkeit, mittlerer Schweregrad (durch Mindestanforderungen mitigiert)
- Risiko 2: Klartext in Logs → direkter Credentials-Leak, schwerwiegend (durch AC4 mitigiert)

## Trade-offs

- vs. REQ-022 (TOTP): Passwort-only ist sicherheitsmäßig unterlegen; bewusste Minimal-Variante für eingeschränkte Umgebungen
- vs. Usability: Strenge Passwortanforderungen erhöhen Abbruchrate beim Enrollment; Konfigurierbarkeit ist Ausgleich

## Realisierungs-Hinweise

- Hashing: argon2id mit empfohlenen Parametern (m=65536, t=3, p=4 oder besser); bcrypt mit Kostenfaktor ≥ 12 als Fallback
- Mindestlänge-Default: 12 Zeichen; Komplexitätsregeln optional (Groß/Klein/Zahl/Sonderzeichen)
- Passwort-Klartext: nur im Arbeitsspeicher halten, nach Hashing zerstören; nie in Request-Logs (POST-Body-Logging deaktivieren für Enrollment-Endpunkte)
- Credential-Tabelle getrennt vom Person-Objekt (wie Passkey); `password_hash`, `person_id`, `created_at`, `last_changed_at`

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-03 Alternative A2 und Exception Flow E4. Der Hinweis auf "bewusst riskantere Minimal-Variante" aus UC-01 A5 gilt auch für das Enrollment: das System sollte den Nutzer beim Passwort-Enrollment explizit darauf hinweisen, dass Passkey oder TOTP (falls verfügbar) die sicherere Wahl sind.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | requirements-engineer | Initial draft aus UC-03 |
