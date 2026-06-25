# US-024: Enrollment-Vorgänge im Audit-Log protokollieren

**ID**: US-024
**Story Points**: 2
**Status**: backlog
**Sprint**: nicht-zugeordnet

## Story

Als Betreiber möchte ich, dass jeder Enrollment-Vorgang im Audit-Log festgehalten wird, damit ich im Sicherheitsfall nachvollziehen kann, wer wann welche Authentifizierungsmethode eingerichtet hat.

## Bezug

**Use Case**: [UC-03: Authentifizierungsmethode einrichten](../use-cases/UC-03-authentifizierungsmethode-einrichten.md)
**Persona**: [SH-06: Max – Operator im KMU](../../business-analysis/stakeholders/SH-06-max-operator-kmu.md)
**Requirement**: [REQ-025: Audit-Log-Eintrag für jeden Enrollment-Vorgang](../req/REQ-025-audit-log-enrollment.md)

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein Enrollment-Vorgang wird erfolgreich abgeschlossen (TOTP, Passkey oder Passwort)
- Wenn: die Methode persistiert ist
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt (ISO 8601), Person-ID, Methoden-Typ (`totp` | `passkey` | `password`), Ergebnis `success`

**AC2**:
- Gegeben: ein Enrollment-Vorgang schlägt fehl (falscher TOTP-Code, Passkey-Abbruch, Passwort zu schwach)
- Wenn: der Fehlschlag eintritt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Person-ID, Methoden-Typ, Ergebnis `failure` und generischem Fehlergrund

**AC3**:
- Gegeben: ein ungültiges Enrollment-Token wird eingereicht
- Wenn: der Fehlschlag eintritt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Ergebnis `failure`, Fehlergrund `invalid_token`; keine Person-ID (nicht ermittelbar)

**AC4**:
- Gegeben: ein Audit-Log-Eintrag für einen Enrollment-Vorgang
- Wenn: er in der Log-Infrastruktur gespeichert ist
- Dann: enthält er keine Credentials-Werte (kein TOTP-Secret, kein Passwort-Hash, kein Public Key)

## Technische Hinweise

- Betroffene Komponenten: Audit-Log-Modul, Enrollment-Modul (alle Pfade: TOTP, Passkey, Passwort, Token-Validierung)
- Betroffene EntityTypes/Relations: Audit-Log-Schema (konsistent mit REQ-005/US-005: gleiche Tabellenstruktur / gleicher Append-Only-Store)
- API-Endpunkte: kein eigener Endpunkt; Logging intern in jedem Enrollment-Endpunkt
- Datenbank-Änderungen: neue Event-Typen im Audit-Log (`enrollment_success`, `enrollment_failure`, `enrollment_token_invalid`)

## Definition of Done

- [ ] Akzeptanzkriterien erfüllt
- [ ] Code-Review durch zweite Person
- [ ] Tests geschrieben (Erfolg und Fehlschlag für alle drei Methoden + ungültiges Token; Credential-Freiheit im Log prüfen)
- [ ] Dokumentation aktualisiert
- [ ] ADR erstellt, falls Architekturentscheidung
- [ ] Linter und Type-Checks grün
- [ ] In Trace-Matrix eingetragen

## Abhängigkeiten

- Wartet auf: US-021, US-022, US-023 (mindestens ein Enrollment-Pfad muss existieren); US-005 (Login-Audit-Log als Referenz für Schema-Konsistenz)
- Blockiert: keine

## Notizen

Sollte parallel zur Fertigstellung der jeweiligen Enrollment-Story erweiterbar sein – ähnlich der Empfehlung in US-005, iterativ zu vorgehen. Schema-Konsistenz mit Login-Audit-Log (US-005) ist wichtig für spätere Audit-Report-Use-Cases (Konzept §22).
