---
id: UC-{{NN}}
title: {{Sprechender Titel}}
status: draft  # draft | reviewed | approved | implemented | verified
priority: must  # must | should | could | wont (MoSCoW)
target_release: walking-skeleton  # walking-skeleton | v1.0 | v1.x | future
complexity: medium  # trivial | small | medium | large | xl
version: 0.1.0
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
primary_actor: SH-NN
secondary_actors:
  - SH-NN
references:
  business_objects:
    - {{object-id}}
  concept:
    - concept/...
  related_use_cases:
    - UC-NN
---

# UC-{{NN}}: {{Sprechender Titel}}

<!--
Verwendung: Ein Use Case pro Datei, zielorientiert aus Nutzersicht.
Dateiname: requirements/use-cases/UC-NN-kurzname.md

WICHTIG: Use Cases beschreiben WAS jemand erreichen will, nicht WIE das Tool funktioniert.
Schlecht: "ApplicationComponent anlegen"
Gut:     "Neue Anwendung im Landschafts-Repository erfassen, damit sie in Sichten erscheint"
-->

## Goal in Context

In welchem größeren Kontext steht dieser Use Case? Was ist das übergeordnete Ziel der Persona, wozu trägt der UC bei?

## Persona und Story

**Primärer Akteur**: [{{Name}}](../../business-analysis/stakeholders/SH-NN-kurzname.md)
**Weitere Beteiligte**: [{{Name}}](../../business-analysis/stakeholders/SH-NN-kurzname.md) (optional)

**Story**: Als {{Persona}} möchte ich {{Aktion/Capability}}, damit {{Nutzen}}.

## Trigger

Was löst diesen Use Case aus?
- Externer Anlass: {{z.B. Workshop-Vorbereitung, Kunden-Anfrage}}
- Zeitpunkt: {{z.B. quartalsweise, ad-hoc}}
- Vorgänger-Use-Case: {{z.B. nach UC-NN}}

## Vorbedingungen (Pre-Conditions)

Was muss gegeben sein, bevor der Use Case starten kann?

- [ ] Persona ist im System angemeldet
- [ ] Persona hat Rolle X
- [ ] Business Object Y existiert
- [ ] {{weitere Vorbedingungen}}

## Nachbedingungen (Post-Conditions)

### Bei Erfolg

Was ist nach erfolgreichem Ablauf wahr?

- {{z.B. Application Component existiert im Repository}}
- {{Audit-Log-Eintrag wurde geschrieben}}
- {{Persona sieht die Erfolgsbestätigung}}

### Bei Misserfolg

Was bleibt unverändert, wenn der UC fehlschlägt?

- {{z.B. keine Daten wurden geschrieben}}
- {{Persona erhält klare Fehlermeldung}}

## Hauptablauf (Basic Flow)

Schritt-für-Schritt, was die Persona tut (und was das System antwortet):

1. **Persona**: {{Aktion}}
2. **System**: {{Reaktion}}
3. **Persona**: {{Aktion}}
4. **System**: {{Reaktion}}
5. **Persona**: {{Aktion}}
6. **System**: {{Bestätigung}}

<!-- 5-10 Schritte sind typisch. Mehr → vermutlich Prozess statt UC. -->

## Alternative Abläufe (Alternative Flows)

Verzweigungen im Hauptablauf:

**A1 – {{Alternative}}**: Bei Schritt {{N}}, wenn {{Bedingung}}, dann:
1. {{abweichender Schritt}}
2. {{...}}
- Mündet zurück in Schritt {{M}} des Hauptablaufs oder endet hier

**A2 – {{weitere Alternative}}**:
- {{...}}

## Ausnahmen / Fehlerfälle (Exception Flows)

Was muss das System tun, wenn etwas schiefgeht?

**E1 – {{Fehler}}**:
- Bedingung: {{wann tritt der Fehler auf}}
- Erwartete Reaktion: {{Fehlermeldung, Rollback, Fallback}}
- Wiederaufnahme: {{kann der Nutzer fortfahren? Wo?}}

**E2 – {{Fehler}}**:
- {{...}}

## Datenfluss

Welche Daten fließen wie?

| Schritt | Daten | Richtung | Bemerkung |
|---|---|---|---|
| 1 | {{Eingabe}} | Persona → System | |
| 2 | {{Validierung}} | System intern | |
| 3 | {{Persistierung}} | System → DB | |
| 4 | {{Confirmation}} | System → Persona | |

## Beteiligte Business Objects

Welche Business Objects werden gelesen, geschrieben, verändert?

| Business Object | Operation | Notiz |
|---|---|---|
| [{{object-id}}](../../business-objects/{{object-id}}.md) | read \| create \| update \| delete | |
| | | |

## Akzeptanzkriterien

Prüfbare Bedingungen, die erfüllt sein müssen, damit der Use Case als umgesetzt gilt.

- [ ] Hauptablauf vollständig durchlaufbar
- [ ] Vorbedingungen werden geprüft
- [ ] Nachbedingungen werden erreicht
- [ ] Alternative Abläufe A1, A2 funktionieren
- [ ] Fehlerfälle E1, E2 werden korrekt behandelt
- [ ] Audit-Log enthält {{erwartete Einträge}}
- [ ] {{weitere konkrete und messbare Kriterien}}

## Nicht im Scope

Was bewusst NICHT zu diesem Use Case gehört, auch wenn es nahe liegt.

- {{ähnliches Szenario, das aber separater UC ist}}
- {{Feature, das in v2 kommt}}

## Konzept-Bezüge

Mindestens ein Konzept-Kapitel ist Pflicht:

- [§N {{Kapitel}}](../../concept/...)

## Realisierungs-Hinweise

Hinweise an Solution Architect und Engineering-Agents:

- EntityTypes: {{die im Metamodell verwendet werden}}
- Relations: {{die im Metamodell relevant sind}}
- Constraints: {{die zu beachten sind}}
- Performance-Hinweise: {{erwartete Größenordnungen}}

## Realisierende Bestandteile

<!-- Wird gefüllt, wenn Requirements/User Stories existieren. -->

- Requirements: REQ-NNN, REQ-NNN
- User Stories: [US-NNN: Titel](../user-stories/US-NNN-kurzname.md)
- ADRs: ADR-NNN
- Test Cases: {{Verweis auf Test-Suite}}
- Implementation: {{Commit-Hash oder PR-Link}}

## Offene Fragen

Was muss vor Implementierung geklärt werden?

- [ ] Frage 1
- [ ] Frage 2

## Notizen

Freitext, Diskussionen, Verlauf.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | YYYY-MM-DD | {{Autor}} | Initial draft |
