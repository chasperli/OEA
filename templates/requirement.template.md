---
id: REQ-{{NNN}}
title: {{Kurztitel der Anforderung}}
type: functional  # functional | non-functional | constraint | business-rule | data | interface | compliance
priority: must  # must | should | could | wont (MoSCoW)
status: proposed  # proposed | approved | realized | verified | rejected | deferred | superseded
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
author: requirements-engineer
references:
  use_cases:
    - UC-NN
  business_objects:
    - {{object-id}}
  business_rules:
    - BR-NN
  stakeholders:
    - SH-NN
  concept:
    - concept/...
  adrs:
    - ADR-NNN
supersedes: []  # IDs vorheriger Requirements, falls superseded
superseded_by: []  # Falls dieses Requirement abgelöst wurde
---

# REQ-{{NNN}}: {{Kurztitel}}

<!--
Verwendung: Eine atomare Anforderung pro Datei.
Dateiname: requirements/req/REQ-NNN-kurzname.md (3-stellig nummeriert)
-->

## Aussage

Das System **MUSS / SOLL / DARF NICHT** {{konkrete Anforderung in einem Satz}}.

<!-- RFC-2119-Schlüsselwörter verwenden:
  MUSS / MUST = Pflicht
  SOLL / SHOULD = empfohlen, kann mit Begründung abweichen
  DARF NICHT / MUST NOT = verbotenes Verhalten
  KANN / MAY = optional
-->

## Begründung

Warum existiert diese Anforderung? Welcher Stakeholder fordert sie? Welche Gefahr besteht ohne sie?

## Kontext

Hintergrund-Information, falls die Aussage allein nicht ausreicht. Welche Situation? Welche Voraussetzungen?

## Typ-spezifische Felder

<!-- Je nach Typ unterschiedliche Pflichtfelder. Nur den passenden Block ausfüllen. -->

### Bei type=functional

**Eingaben**:
- {{was kommt rein}}

**Verarbeitung**:
- {{was muss passieren}}

**Ausgaben**:
- {{was kommt raus}}

**Fehlerfälle**:
- {{wann und wie reagiert das System auf Fehler}}

### Bei type=non-functional

**Kategorie**: performance | scalability | reliability | availability | security | maintainability | usability | portability | compatibility | sustainability

**Messbare Zielwerte**:

| Metrik | Zielwert | Schwellwert (warning) | Schwellwert (critical) | Scope |
|---|---|---|---|---|
| {{Metrik}} | {{Wert + Einheit}} | {{Wert}} | {{Wert}} | {{bei welcher Datenmenge}} |

**Beispiel**: "p95 Response-Zeit < 200ms bei 1000 Entities im Repository"

### Bei type=constraint

**Art der Beschränkung**: technical | legal | organizational | physical

**Quelle**: {{Wer/Was schreibt die Beschränkung vor – Norm, Gesetz, ARB-Entscheidung}}

**Bindungsstärke**: hard (nicht umgehbar) | soft (mit Ausnahme möglich)

**Auswirkung bei Nichtbeachtung**: {{Konsequenz}}

### Bei type=business-rule

**Auslöser**: onCreate | onUpdate | onDelete | onRead | continuous

**Betroffene Business Objects**: [{{object-id}}](../business-objects/{{object-id}}.md)

**Formale Aussage** (falls möglich in formaler Notation, z.B. JSON Logic, OCL):
```
{{regelausdruck}}
```

**Beispiel**: "Customer mit `isPersonalData=true` MUSS `legalBasis` gesetzt haben (DSGVO Art. 6)"

### Bei type=data

**Betroffene Datenstruktur**: {{Business Object oder Attribut}}

**Datentyp**: string | integer | decimal | boolean | date | datetime | enum | reference | composite

**Constraints**:
- Pflichtfeld: ja/nein
- Format: {{z.B. ISO 8601, E.164}}
- Wertebereich: {{z.B. 0-100, regex...}}
- Eindeutigkeit: {{lokal / global eindeutig}}

**Default-Wert**: {{falls anwendbar}}

### Bei type=interface

**Schnittstelle**: REST | GraphQL | AsyncAPI | CLI | File-Format

**Spezifikation**: {{Pfad zu OpenAPI/AsyncAPI/etc.}}

**Verträge**:
- Endpunkt/Pfad: {{z.B. POST /api/v1/applications}}
- Request-Schema: {{Verweis}}
- Response-Schema: {{Verweis}}
- Fehlercodes: {{200, 400, 401, 403, 404, 500}}

### Bei type=compliance

**Regelwerk**: {{DSGVO, ISO 27001, DORA, NIS2, FINMA-Rundschreiben...}}

**Konkrete Vorschrift**: {{Artikel, Abschnitt, Paragraph}}

**Nachweis-Anforderung**: {{Was muss dokumentiert sein, wie nachgewiesen werden}}

**Audit-Relevanz**: {{ja/nein, ggf. Häufigkeit der Audits}}

## Akzeptanzkriterien

Prüfbare Bedingungen, die erfüllt sein müssen. Bevorzugt Given-When-Then, alternativ Checkliste.

**AC1**:
- Gegeben: {{Ausgangssituation}}
- Wenn: {{Aktion oder Bedingung}}
- Dann: {{erwartetes Ergebnis}}

**AC2**:
- Gegeben:
- Wenn:
- Dann:

<!-- Mindestens ein AC ist Pflicht. -->

## Verifikationsmethode

Wie wird geprüft, ob die Anforderung erfüllt ist?

- [ ] Methode: test (automatisiert) | inspection (manuell) | demonstration | analysis | monitoring
- [ ] Test-Setup: {{Beschreibung}}
- [ ] Mess-Werkzeug: {{Tool/Framework}}
- [ ] Bestanden-Kriterium: {{konkret}}
- [ ] In CI integriert: ja/nein

## Abhängigkeiten

- **Voraussetzungen**: REQ-XXX, REQ-YYY (müssen vorher erfüllt sein)
- **Folgewirkungen**: REQ-XXX (wird durch dieses ermöglicht)
- **Konflikte**: REQ-XXX (steht in Spannung zu dieser Anforderung)

## Risiken bei Nichterfüllung

Was passiert, wenn diese Anforderung nicht erfüllt wird?

- Risiko 1: {{Beschreibung, Schweregrad}}
- Risiko 2: {{...}}

## Trade-offs

Welche anderen Anforderungen werden möglicherweise eingeschränkt, um diese zu erfüllen?

- vs. REQ-XXX: {{Konflikt-Beschreibung}}

## Realisierungs-Hinweise

Hinweise für Solution Architect und Engineering-Agents – aber **keine Lösungs-Vorgaben**:

- {{Hinweis, der die Implementierung leitet}}
- {{Bekannte technische Herausforderungen}}

<!-- ACHTUNG: Konkrete Technologie-Wahl gehört NICHT hierher.
"System MUSS Redis als Cache verwenden" → das ist Solution Design, nicht Requirement.
Stattdessen: "System MUSS Cache-Layer haben, der >95% Hit-Rate bei wiederholten Lookups erreicht" -->

## Realisierung

<!-- Wird beim Bauen ausgefüllt. -->

- ADR(s): {{Bezug zu Entscheidungen, die zur Umsetzung getroffen wurden}}
- Implementiert durch: {{User Stories, Commits, PRs}}
- Tests: {{Verweis auf Test-Suite}}
- Status der Verifikation: {{not-verified | verified | failed}}

## Notizen

Diskussion, offene Fragen, Verlauf.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | YYYY-MM-DD | requirements-engineer | Initial draft aus UC-NN |
