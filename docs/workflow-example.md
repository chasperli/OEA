# Beispiel-Workflow: Vom PO-Request zum gemergten Feature

Konkretes End-to-End-Beispiel für ein erstes Feature im Walking Skeleton. Das Dokument zeigt jeden Schritt mit Beispiel-Prompts an die Agents und realistische Antworten.

**Szenario**: Du willst, dass Franz (SH-01, Junior Domain Architekt) eine Application Component im Tool erfassen kann. Das ist eines der ersten Walking-Skeleton-Features.

**Dauer**: Realistisch 1-2 Wochen, je nach Tiefe der Reviews.

---

## Phase 0 – Voraussetzungen prüfen

Bevor du startest, vergewissere dich:

- [ ] Vision in `business-analysis/vision.md` ist formuliert
- [ ] Mindestens Franz (SH-01) als Stakeholder vorhanden
- [ ] CLAUDE.md ist im Repo
- [ ] Sieben Agent-Dateien sind in `.claude/agents/`
- [ ] Templates sind in `templates/`

Wenn nicht: das vorher fixen, sonst arbeiten die Agents im luftleeren Raum.

---

## Phase 1 – Initial-Klärung mit Solution Architect

**Du** (im Claude Code Chat):

> Ich möchte mit dem Walking Skeleton starten. Als erstes Feature soll Franz (SH-01) eine Application Component erfassen können. Bitte agiere als Solution Architect (`.claude/agents/solution-architect.md`) und klär mit mir das Vorgehen.

**Solution Architect** liest Konzept und Persona, antwortet etwa:

> Bevor wir starten, drei Klärungsfragen:
> 
> 1. **Business Object existiert noch nicht**. Application Component ist in §6 konzeptionell beschrieben, aber wir haben kein `business-objects/application-component.md`. Soll der Business Engineer das zuerst modellieren?
> 
> 2. **Offene ADRs sind relevant**: ADR-001 (URN-Schema) und die noch fehlende ADR zu Persistenz. Wollen wir die zuerst entscheiden oder iterativ klären?
> 
> 3. **Tech-Stack noch offen**: Backend und Frontend Engineer haben noch keinen Vorschlag gemacht. Soll das vor oder parallel passieren?

**Du** entscheidest:

> Business Object zuerst – das ist die Basis. ADRs iterativ – ich entscheide, wenn ein konkreter Konflikt auftaucht. Tech-Stack parallel – frag die zwei Engineering-Agents heute noch nach Vorschlägen.

**Solution Architect** legt einen `tasks/uc-01-application-component-erfassen/` Ordner an mit einer `architect-notes.md`, die den Plan dokumentiert. Dort steht:

```markdown
# Plan: UC-01 Application Component erfassen

1. Business Engineer modelliert Application Component (business-objects/application-component.md)
2. Backend Engineer macht Stack-Vorschlag
3. Frontend Engineer macht Stack-Vorschlag
4. PO entscheidet Stack (ADR-006 Backend, ADR-007 Frontend)
5. Use Case formulieren
6. Requirements ableiten
7. UI Designer macht Mockups
8. Backend implementiert
9. Frontend implementiert
10. Security reviewt
11. Integration und PO-Akzeptanz
```

---

## Phase 2 – Business Object modellieren

**Du**:

> Bitte agiere jetzt als Business Engineer und modelliere "Application Component" als Business Object. Nutze `templates/business-object.template.md`.

**Business Engineer** liest Template, §6.1.1 (Application vs. Technology) und §6.1, fragt:

> Klärungsfragen:
> 1. Logical/Physical-Trennung: Soll Application Component für den Walking Skeleton nur Physical sein, oder beide Layer? §6.1.1 sagt Logical ist optional.
> 2. Owner: Soll das ein freier Text sein oder eine Referenz auf Stakeholder/Role?
> 3. Lifecycle: Welche Zustände sind initial sinnvoll? Vorschlag: `proposed → active → sunset → retired`. Passt das?
> 4. Beziehung zu Capability: 1:n (eine Application gehört zu einer Capability) oder n:m?

**Du** beantwortest:

> 1. Walking Skeleton nur Physical. Logical kommt später.
> 2. Owner ist Referenz auf Role.
> 3. Vier Zustände sind ok – plus `planned` davor.
> 4. n:m. Eine Application kann mehreren Capabilities dienen.

**Business Engineer** produziert `business-objects/application-component.md`:

```markdown
---
identifier: application-component
name_de: Anwendungskomponente
name_en: Application Component
version: 0.1.0
status: draft
owner_role: domain-architect
references:
  concept:
    - concept/20-entities/06-kern-entitaetstypen.md
---

# Business Object: Application Component

## Definition
Eine eigenständig deploybare Software-Einheit, die Application Functionality 
kapselt (TOGAF Content Metamodel).

## Attribute
| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| name | string | required | - | 3-255 Zeichen | Eindeutiger Name |
| owner | reference→Role | required | - | - | Verantwortliche Rolle |
| description | string | optional | - | max 2000 | Fachliche Beschreibung |
...
```

**Du reviewst** und akzeptierst, oder forderst Änderungen.

---

## Phase 3 – Tech-Stack-Vorschläge parallel einholen

**Du** (zwei separate Sessions oder Sub-Agents):

> Backend Engineer: Bitte mach einen Stack-Vorschlag für das Backend. Berücksichtige die Persona Max (SH-06) und die Typsicherheits-Anforderung.

**Backend Engineer** antwortet mit einer Vergleichstabelle und Empfehlung. Beispiel:

> **Empfehlung**: Python + FastAPI + Pydantic + SQLAlchemy 2.0
> 
> Begründung:
> - OpenAPI nativ aus Pydantic (perfekt für Spec-First)
> - Type Hints + mypy strict erfüllt Typsicherheits-Anforderung
> - Mittlerer Ressourcen-Footprint (Max-tauglich)
> - Große OSS-Community für Contributor-Anziehung
> - Sekundäre Wahlen: PostgreSQL + Apache AGE (Graph + SQL), Redis für Cache
> 
> Alternative für Performance-Fokus: Rust + Axum (höhere Lernkurve)

**Frontend Engineer** parallel:

> **Empfehlung**: Vue 3 + TypeScript + Vite + Pinia + PrimeVue
> 
> Begründung:
> - Erstklassiger TypeScript-Support seit Vue 3.3
> - Sanftere Lernkurve als React (gut für OSS-Contributors)
> - PrimeVue: A11y eingebaut, Design-Token-fähig, dark mode
> - openapi-typescript für API-Client-Generation

**Du entscheidest**:

> Backend Python+FastAPI, Frontend Vue 3. Bitte als ADR-006 und ADR-007 dokumentieren.

Solution Architect oder du selbst erstellt die ADR-Dateien.

---

## Phase 4 – Use Case formulieren

**Du**:

> Solution Architect, lass uns UC-01 formulieren. Persona Franz, er soll eine Application Component erfassen.

**Solution Architect** schlägt Struktur vor:

> Vorschlag für UC-01:
> - Titel: "Application Component im Repository erfassen"
> - Hauptablauf: Wizard mit drei Schritten (Name → Owner → Capability-Zuordnung)
> - Vorbedingungen: Franz ist angemeldet, hat Rolle "domain-architect"
> - Akzeptanzkriterien: Application Component erscheint in Inventar-Sicht (§12.4)
> 
> Klärungsfragen:
> 1. Mehrere Capabilities zuordnen oder nur eine im MVP?
> 2. Bei doppeltem Namen: hart blockieren oder warnen?
> 3. Soll der Wizard speicherbar sein als Draft, oder nur "fertig oder abbrechen"?

**Du beantwortest**, Solution Architect produziert `requirements/use-cases/UC-01-application-component-erfassen.md` nach Template.

---

## Phase 5 – Requirements ableiten

**Du**:

> Requirements Engineer, leite die Requirements aus UC-01 ab.

**Requirements Engineer** liest UC-01 und das Application-Component-Business-Object, denkt durch die sieben Typen:

> Aus UC-01 ergeben sich:
> 
> **Funktional**:
> - REQ-001: System MUSS Application Component anlegen können
> - REQ-002: System MUSS Wizard mit Schritt-Navigation anbieten
> - REQ-003: System MUSS Application Component sofort nach Anlage in Inventar-Sicht anzeigen
> 
> **Daten**:
> - REQ-004: Pflichtfelder Name, Owner; Constraints aus Business Object
> - REQ-005: URN wird automatisch generiert (siehe ADR-001)
> 
> **Non-Functional**:
> - REQ-006: Wizard-Schritt-Übergang p95 <300ms
> - REQ-007: Anlage-Endpoint p95 <500ms bei Repository <1000 Entities
> 
> **Interface**:
> - REQ-008: POST /api/v1/applications nach OpenAPI 3.1
> - REQ-009: Response enthält generierte URN und Audit-ID
> 
> **Compliance**:
> - REQ-010: Audit-Log-Eintrag bei jeder Anlage (Pflicht aus §21.8)
> 
> **Constraint**:
> - REQ-011: Nur authentifizierte Nutzer mit Rolle "domain-architect" oder höher dürfen anlegen
> 
> Soll ich alle als Drafts anlegen oder priorisieren?

**Du**:

> Alle als Drafts. REQ-006 und REQ-007 sind SHOULD, der Rest MUST.

Requirements Engineer produziert 11 Dateien in `requirements/req/`.

---

## Phase 6 – UI Designer macht Mockups

**Du**:

> UI Designer, ich brauche Mockups für UC-01. Persona Franz (Junior, niederschwellig). Bitte in Penpot.

**UI Designer** liest UC-01 und Franz-Profil:

> Mockup-Konzept:
> - Wizard mit drei Schritten
> - Inline-Validierung mit hilfreichen Hinweisen statt Fehlermeldungen
> - Progress-Indicator oben
> - "Speichern und beenden" als sekundärer Button neben "Weiter"
> 
> Fragen:
> 1. Capability-Auswahl: Multiselect-Dropdown oder Tag-Eingabe?
> 2. Wenn Owner-Rolle leer ist: Vorschlag "Du als Owner setzen"?
> 3. Erfolgsstate: Sofort in Inventar-Sicht navigieren oder Bestätigungs-Screen?

Du beantwortest, er produziert Mockups in Penpot, exportiert nach `design/uc-01/`:

```
design/uc-01/
├── README.md
├── tokens/colors.json
├── tokens/typography.json
├── screens/wizard-step-1.svg
├── screens/wizard-step-2.svg
├── screens/wizard-step-3.svg
├── screens/success-state.svg
└── penpot-link.md
```

---

## Phase 7 – Specs und Tickets

**Solution Architect** erstellt jetzt die Schnittstellen-Specs und Tickets:

```
api/openapi/applications.yaml          ← POST /api/v1/applications
api/schemas/application-component.json ← Datenstruktur
tasks/uc-01-application-component-erfassen/
├── README.md
├── backend-task.md
├── frontend-task.md
└── security-review.md (Vorbereitung)
```

Jedes Ticket referenziert die Specs, Requirements und Akzeptanzkriterien.

---

## Phase 8 – Implementierung parallel

**Du** rufst Backend und Frontend Engineer auf (parallel oder sequenziell – beide haben den Spec als gemeinsame Grundlage):

> Backend Engineer, implementiere `tasks/uc-01-application-component-erfassen/backend-task.md`.

**Backend Engineer** liest Spec, generiert FastAPI-Setup mit Pydantic-Models, schreibt:
- DB-Migration für `application_components`-Tabelle
- POST-Endpoint mit Validierung, Audit-Log, OIDC-Check
- Unit- und Contract-Tests gegen OpenAPI-Spec

> Frontend Engineer, implementiere `tasks/uc-01-application-component-erfassen/frontend-task.md`.

**Frontend Engineer** liest Spec und Mockups, schreibt:
- Vue-3-Komponenten für die drei Wizard-Schritte
- API-Client aus OpenAPI generiert
- Pinia-Store für Wizard-State
- Storybook-Stories für jede neue Komponente
- E2E-Test mit Playwright

---

## Phase 9 – Security Review

**Du**:

> Security Engineer, bitte reviewe die Implementation in PR #1 für UC-01.

**Security Engineer** prüft Spec, Backend-Code, Frontend-Code, Konfiguration:

> Security Review UC-01:
> 
> **Critical**: keine
> 
> **High**:
> - Audit-Log enthält Username im Klartext – sollte pseudonymisiert sein
> - POST-Endpoint hat kein Rate-Limiting (siehe ADR zu Rate Limits)
> 
> **Medium**:
> - Fehlermeldungen leaken interne Pfade in Stack Traces (Production-Logger anpassen)
> 
> **Low**:
> - CORS-Header zu permissiv für lokales Setup
> 
> Sign-off möglich, sobald High-Findings adressiert sind.

**Du entscheidest**, was vor Merge gefixt wird. Backend Engineer fixt die High-Findings. Security Engineer signed off.

---

## Phase 10 – Integration und Akzeptanz

**Solution Architect** prüft Konsistenz:

> Integration Check UC-01:
> - Spec, Backend, Frontend konsistent: ✓
> - Tests grün: ✓
> - Audit-Log funktioniert: ✓
> - Security Sign-off: ✓
> - Doku aktualisiert: ✓
> 
> Bereit für PO-Akzeptanz.

**Du** als PO testest selbst (oder mental aus Franz' Perspektive):
- Logge dich ein
- Klicke "Neue Application Component"
- Wizard durchlaufen
- Prüfen, ob Component in Inventar-Sicht erscheint

Wenn ok: Merge auf `main`. Status der Artefakte auf `realized`:
- UC-01: status `realized`
- REQ-001 bis REQ-011: status `realized`
- Tasks: status `done`

Trace-Matrix in `requirements/traceability.md` aktualisieren.

---

## Was du in dieser Sequenz gelernt hast

Wenn du das einmal durchgespielt hast, weißt du:

1. **Jeder Agent fragt, statt anzunehmen** – das ist Feature, nicht Bug
2. **Du bist nie aus dem Loop** – aber du musst auch nicht jeden Schritt mikromanagen
3. **Specs sind die Wahrheit** – Backend und Frontend können parallel arbeiten, ohne sich abzustimmen
4. **Reviews sind Quality Gates** – Security Engineer ist nicht optional
5. **Traceability ist Pflicht** – am Ende ist jedes Artefakt mit jedem verlinkt

## Nächste Iteration: schneller werden

Beim zweiten Use Case wird vieles automatisch klarer:

- Tech-Stack-Diskussion entfällt (ADR-006/007 sind getroffen)
- Business Object existiert vielleicht schon
- Templates sind bekannt
- Du weißt, welche Agents wann sinnvoll sind

Realistisch: UC-02 dauert die Hälfte der Zeit von UC-01. UC-10 ein Drittel.

## Wenn etwas schiefgeht

**Agent macht eine Annahme, die nicht zu deiner Welt passt**: sofort korrigieren, nicht durchwinken. Die Korrektur ist wertvoll, das spätere Refactoring ist teuer.

**Du verlierst den Überblick**: Solution Architect aufrufen, "gib mir Status zu allen offenen Tasks". Er hat den Überblick, weil er die Tasks erzeugt hat.

**Security Engineer blockiert wegen "Theater"**: gemeinsam prüfen, ob das Finding realistisch ist. Wenn nicht: Begründung dokumentieren, weiter.

**Backend und Frontend driften vom Spec ab**: Solution Architect anrufen, er muss den Spec re-synchronisieren.

**Du bist müde**: hör auf, dokumentiere wo du bist. Die Agents vergessen nichts (die Artefakte sind im Repo). Du kannst morgen weitermachen.
