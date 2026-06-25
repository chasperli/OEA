---
id: REQ-025
title: Audit-Log-Eintrag für jeden Enrollment-Vorgang
type: compliance
priority: must
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
    - SH-03
    - SH-06
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-025: Audit-Log-Eintrag für jeden Enrollment-Vorgang

## Aussage

Das System MUSS für jeden abgeschlossenen Enrollment-Vorgang – erfolgreich oder fehlgeschlagen – einen Audit-Log-Eintrag mit Zeitpunkt, betroffener Person-ID, eingerichteter Methode und Ergebnis erzeugen; Credentials-Werte (Secrets, Hashes, Public Keys) DÜRFEN NICHT im Audit-Log erscheinen.

## Begründung

Die Registrierung einer Authentifizierungsmethode ist ein sicherheitskritisches Ereignis, das vollständig nachvollziehbar sein muss: Wer hat wann welche Methode eingerichtet? Bei einem Sicherheitsvorfall (z.B. Enrollment durch unberechtigte Person nach Token-Kompromittierung) muss der Zeitpunkt und die Methode aus dem Audit-Log rekonstruierbar sein. Entspricht der Nachvollziehbarkeits-Philosophie von OEA (Konzept §22) und ergänzt REQ-005 (Audit-Log Login).

## Kontext

Betrifft alle Enrollment-Pfade aus UC-03: TOTP (REQ-022), Passkey (REQ-023), Passwort (REQ-024) sowie das Hinzufügen weiterer Methoden für authentifizierte Personen (REQ-026). Fehlgeschlagene Versuche (z.B. falscher TOTP-Verifikations-Code, Passkey-Abbruch) müssen ebenfalls geloggt werden, jedoch ohne den Klartextwert des eingegebenen Codes.

## Typ-spezifische Felder

### Bei type=compliance

**Regelwerk**: internes Audit-/Nachvollziehbarkeits-Prinzip von OEA (Konzept §22); kompatibel zu ISO 27001 Annex A.8.15 (Logging) und DORA Art. 10 (ICT-Sicherheit)

**Konkrete Vorschrift**: Jeder Enrollment-Vorgang ist mit Zeitpunkt, betroffener Identität, Methoden-Typ und Ergebnis zu protokollieren

**Nachweis-Anforderung**: Audit-Log muss über den instanzweit konfigurierten Aufbewahrungszeitraum abrufbar und exportierbar sein

**Audit-Relevanz**: ja; Enrollment-Ereignisse sind Teil des Security-Event-Logs

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein Enrollment-Vorgang wird erfolgreich abgeschlossen (REQ-022, REQ-023 oder REQ-024)
- Wenn: die Methode persistiert ist
- Dann: enthält das Audit-Log einen Eintrag mit: Zeitpunkt (ISO 8601), Person-ID, Methoden-Typ (totp | passkey | password), Ergebnis `success`

**AC2**:
- Gegeben: ein Enrollment-Vorgang schlägt fehl (z.B. TOTP-Verifikation fehlgeschlagen, Passkey-Abbruch, Passwort zu schwach)
- Wenn: der Fehlschlag eintritt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Person-ID (soweit aus Token ermittelbar), Methoden-Typ, Ergebnis `failure` und Fehlergrund (generisch, ohne sensible Details)

**AC3**:
- Gegeben: ein Audit-Log-Eintrag für einen Enrollment-Vorgang
- Wenn: er in der Log-Infrastruktur gespeichert ist
- Dann: enthält er keine Credentials-Werte (kein TOTP-Secret, kein Passwort-Hash, kein Public Key)

**AC4**:
- Gegeben: ein ungültiges Enrollment-Token wird eingereicht (E1 aus UC-03)
- Wenn: der Fehlschlag eintritt
- Dann: enthält das Audit-Log einen Eintrag mit Zeitpunkt, Ergebnis `failure`, Fehlergrund `invalid_token`; keine Person-ID (Token ist ungültig, Person nicht ermittelbar)

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Enrollment-Versuche (Erfolg und Fehlschlag) gegen Audit-Log-Inhalt prüfen
- [x] Mess-Werkzeug: Test-Suite des Enrollment-Moduls + Audit-Log-Reader
- [x] Bestanden-Kriterium: AC1–AC4 grün für alle Enrollment-Pfade
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-022, REQ-023, REQ-024 (REQ-021 war Token-Validierung, wurde rejected; Person-ID-Kontext kommt nun aus dem JIT-Login-Flow)
- **Folgewirkungen**: spätere Use Cases zu Audit-Reports (Konzept §22)
- **Konflikte**: REQ-022 AC4 / REQ-024 AC4 (Audit-Log darf keine Secrets enthalten – durch AC3 geregelt)

## Risiken bei Nichterfüllung

- Risiko 1: Ohne Enrollment-Audit-Log ist eine nachträgliche Kompromittierungs-Analyse (wann wurde welche Methode registriert?) nicht möglich – schwerwiegend
- Risiko 2: Credentials im Audit-Log wären ein eigenständiger Leak-Vektor – schwerwiegend (durch AC3 mitigiert)

## Trade-offs

- Keine: Audit-Logging für sicherheitskritische Ereignisse ist nicht verhandelbar

## Realisierungs-Hinweise

- Audit-Log-Schema sollte konsistent mit REQ-005 (Login-Audit) sein: gleiche Felder, gleiche Formate
- Methoden-Typ als enum-Wert, nicht als Freitext (Typo-Vermeidung bei Log-Auswertung)
- AC4 (ungültiges Token): da Person-ID nicht ermittelbar, ggf. Token-Hash (nicht Klartext) im Log vermerken, um wiederholte Versuche zu erkennen

## Realisierung

- ADR(s): keine
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-03 Nachbedingungen (Audit-Log-Eintrag) und analog zu REQ-005 (Audit-Log Login). Bewusst als `compliance`-Typ klassifiziert, da das Audit-Logging eine Nachvollziehbarkeits-Anforderung ist, keine funktionale Kernanforderung.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-25 | requirements-engineer | Initial draft aus UC-03 |
