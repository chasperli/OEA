# NFR-NN: {{Sprechender Titel}}

<!--
Verwendung: Eine nicht-funktionale Anforderung pro Datei.
Dateiname: nfr/NFR-NN-kurzname.md (z.B. NFR-03-response-time.md)

NFRs sind anders als funktionale Use Cases: Sie beschreiben Qualitätseigenschaften
des Systems, nicht Aktionen. Pflicht: messbare Zielwerte mit Verifikationsmethode.
-->

**ID**: NFR-NN
**Kategorie**: performance | scalability | reliability | availability | security | maintainability | usability | portability | compatibility | cost | sustainability
**Priority**: must | should | could | wont
**Status**: proposed | approved | realized | verified

## Anforderung

Eine prägnante Aussage in einem Satz, was erfüllt sein muss.

## Kontext und Begründung

Warum ist diese Anforderung wichtig? Welcher Stakeholder, welcher Use Case begründet sie?

## Messbarer Zielwert

NFRs ohne messbare Zielwerte sind Wunschdenken. Beispiele:

- **Performance**: "p95 Response-Zeit < 200ms bei 1000 Entitäten im Repository"
- **Scalability**: "Repository skaliert auf 10.000 Entitäten ohne Architektur-Änderung"
- **Availability**: "99,5% Verfügbarkeit pro Quartal (≤ ca. 11 Stunden Ausfall)"
- **Security**: "Property-Level-Autorisierung wird in jedem API-Response durchgesetzt"
- **Maintainability**: "Neuer EntityType ohne Code-Änderung über Schema-Konfiguration hinzufügbar"
- **Usability**: "Neuer Nutzer kann erste Application Component in <5 Min anlegen, ohne Dokumentation zu lesen"

| Metrik | Zielwert | Schwellwert (warning) | Schwellwert (critical) |
|---|---|---|---|
| | | | |

## Skopierung

- **Gilt für**: alle EntityTypes | bestimmte EntityTypes ([Liste]) | bestimmte Operationen ([Liste])
- **Gilt nicht für**: <Ausnahmen, falls vorhanden>
- **Zeitlich**: dauerhaft | ab Release X | bis Release Y

## Verifikationsmethode

Wie wird geprüft, ob die Anforderung erfüllt ist?

- [ ] Method: test | inspection | demonstration | analysis | monitoring
- [ ] Test-Setup:
- [ ] Mess-Werkzeug:
- [ ] Bestanden-Kriterium:

## Akzeptanzkriterien

- [ ] Zielwert mit definiertem Test-Setup messbar
- [ ] Test ist automatisiert ausführbar (CI-tauglich)
- [ ] Alerting bei Schwellwert-Überschreitung (für Run-Time-NFRs)

## Bezüge

**Konzept-Bezug**:
- [§N (Kapitel)](../../concept/...)

**Stakeholder**:
- [SH-NN: Name](../stakeholders/SH-NN-kurzname.md)

**Verbundene Use Cases / Stories**:
- [UC-NN: Titel](../use-cases/UC-NN-kurzname.md)

**Verbundene ADRs**:
- ADR-NN (z.B. Persistenz-Entscheidung, weil performance-relevant)

## Risiken bei Nichterfüllung

Was passiert, wenn diese NFR nicht erfüllt wird?

- Risiko 1:
- Risiko 2:

## Trade-offs

Welche anderen Anforderungen werden möglicherweise eingeschränkt, um diese zu erfüllen?

- vs. NFR-XX:

## Notizen
