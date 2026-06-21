## 18. Projekt-Portfolio-Integration (PPM)

Das EA-Repository beschreibt, *was* sich architektonisch ändern soll. Project Portfolio Management (PPM) beschreibt, *welche Projekte das mit welchen Ressourcen bis wann umsetzen*. Zwischen beiden Welten existiert eine natürliche Brücke – das **Work Package** – die im Metamodell bereits angelegt ist. Dieses Kapitel präzisiert die Integration.

### 18.1 Rollenverteilung EA ↔ PPM

| EA-Repository beantwortet | PPM beantwortet |
|---|---|
| Was sollte sich architektonisch ändern? | Welche Projekte setzen das um? |
| Warum (Goals, Outcomes, Capabilities)? | Mit welchem Budget, welchen Ressourcen? |
| Welche Zielzustände bis wann (Plateaus)? | Welche Meilensteine, welche Abhängigkeiten? |
| Welche Gaps sind zu schließen? | Wer ist Projekt-Sponsor, -Manager, -Team? |
| Technische/architektonische Risiken? | Projekt-/Ressourcen-/Schedule-Risiken? |

EA denkt in **Capabilities, Gaps und Plateaus**. PPM denkt in **Projekten, Meilensteinen und Budgets**. Die Verbindung entsteht über Work Packages (EA-Seite) und Projects (PPM-Seite).

### 18.2 Neue EntityTypes

```yaml
EntityType: Project
  properties:
    - name, description
    - status: proposed | approved | active | on-hold | completed | cancelled
    - dates: plannedStart, plannedEnd, actualStart, actualEnd
    - budget: { planned, committed, spent }
    - methodology: waterfall | agile | hybrid
    - planningConfidence: committed | planned | proposed | directional
    - externalReferences[] (zu PPM-Tool-IDs)
  relations:
    - realizes: WorkPackage[]
    - dependsOn: Project[]
    - sponsoredBy: OrganizationUnit
    - managedBy: Role
    - contributesTo: Goal[] | Outcome[]

EntityType: Program
  basedOn: Project (strukturelle Ähnlichkeit)
  additionalRelations:
    - contains: Project[]
    - realizesStrategy: Goal | Outcome

EntityType: Portfolio
  properties:
    - portfolioType: strategic | operational | mandatory | innovation
  relations:
    - contains: Program[] | Project[]
    - structuredBy: Capability | Domain
    - ownedBy: OrganizationUnit

EntityType: Demand
  properties:
    - status: submitted | evaluated | approved | rejected | deferred
    - businessJustification
    - estimatedBudget, estimatedEffort
    - priority
  relations:
    - proposedFor: Capability | Domain
    - evaluatedAgainst: ArchitecturePrinciple[]
    - convertedTo: Project (wenn approved)

EntityType: BusinessCase
  relations:
    - forProject: Project
    - expectedBenefits: Benefit[]
    - contributesToGoal: Goal[]
  properties:
    - roi, npv, paybackPeriod

EntityType: Benefit
  properties:
    - type: cost-saving | revenue | quality | compliance | capability-uplift
    - plannedValue, realizedValue
    - realizationDate (planned / actual)
  relations:
    - measuredThrough: KPI
    - contributesToGoal: Goal
    - realizedThrough: Project

EntityType: Risk
  properties:
    - type: technical | financial | schedule | compliance | strategic | obsolescence | competence
    - probability, impact, status
    - mitigation
  relations:
    - affects: Project | Capability | ApplicationComponent | Interface
    - ownedBy: Role
```

### 18.3 Erweiterungen bestehender Entitäten

**WorkPackage** erhält:
- `realizedByProject: Project[]` – welche Projekte setzen es um
- `requiredSkills: Skill[]` – Kompetenz-Bedarf
- `estimatedEffort, estimatedCost` – für Portfolio-Planung

**PhysicalApplicationComponent** erhält optional:
- `tco: { licenseCost, operationalCost, developmentCost }` pro Jahr
- `costCenter`
- `financialLifecycle: invest | sustain | rationalize | retire`
- `activeProjects: Project[]` (die aktuell an dieser Application arbeiten)

**Capability** erhält optional:
- `investmentLevel: heavy | moderate | minimal | divest`
- `strategicPriority: high | medium | low`
- `timeCategorization: tolerate | invest | migrate | eliminate` (TIME-Modell, Gartner)

### 18.4 Architektur-Abhängigkeiten als Projekt-Abhängigkeiten

Eine zentrale Stärke der Integration: **Projekt-Dependencies können automatisch aus Architektur-Dependencies abgeleitet werden.**

Regel: Wenn Component A von Component B abhängt und Project X die Component B verändert, während Project Y Component A verändert, dann hat Project Y eine Abhängigkeit zu Project X.

Diese Ableitung ist in reinen PPM-Tools unmöglich, weil ihnen die Architektur-Information fehlt. Im integrierten Repository wird sie als Sicht oder automatische Dependency-Suggestion verfügbar.

### 18.5 Mastership pro Konzept

**EA ist Master für:**
- Work Package, Gap, Plateau
- Strategic Goal, Capability, Driver, Outcome
- Architektur-spezifische Risiken (Obsoleszenz, technical debt)
- Architecture Principles, Standards

**PPM ist Master für:**
- Project, Program, Portfolio (operative Einheiten)
- Demand / Initiative (Vorstufen)
- Ressourcen, Budgets, konkrete Meilensteine
- Projekt-spezifische Risiken
- Benefits-Tracking (Realization-Seite)
- Business Cases

**Gemeinsam (Property-Mastership):**
- Work Package ↔ Project: EA-Master für *was* umgesetzt wird, PPM-Master für *wann/wer/wie viel*
- Roadmap-Termine: EA-Plan wird von Projekt-Terminen beeinflusst, PPM-Termine müssen zu Plateaus passen
- Benefits: EA-Master für strategische Zuordnung, PPM-Master für Realization-Status

### 18.6 Planungshorizonte und -konfidenz

EA und PPM arbeiten mit unterschiedlichen Planungshorizonten, die synchronisiert werden müssen:

- EA-Plateaus: typischerweise 2–5 Jahre
- Budget-Planung: oft nur 1–2 Jahre
- Konkrete Projekte: 6 Monate bis 2 Jahre
- Agile PIs/Sprints: Wochen bis Quartale

Das `planningConfidence`-Property an Projects erlaubt, Roadmaps gestuft zu visualisieren:
- `committed`: Budget genehmigt, Team allokiert
- `planned`: in aktueller Portfolio-Planung
- `proposed`: im Backlog, noch nicht priorisiert
- `directional`: strategisch gewollt, noch kein Plan

### 18.7 Neue Sichten

- **Investment Heatmap**: Capabilities × Investment-Level, farblich nach aggregiertem Projekt-Budget
- **Portfolio-Architecture-Alignment**: Projekte ohne Work Package (architektonisch blind) und Work Packages ohne Projekt (umsetzungslos)
- **Resource Demand over Time**: Skill-Bedarf aggregiert aus WorkPackages, verteilt über Projekt-Zeiträume
- **Benefit Attribution**: welche Capabilities/Goals profitieren von welchen aktiven Projekten
- **Technical Debt Portfolio**: Applications mit Sunset-Druck und fehlendem Ablösungsprojekt
- **Strategic Alignment Check**: aktive Projekte ohne Beitrag zu einem strategischen Goal
- **Compliance Risk View**: Compliance-Requirements mit nahender Deadline und nicht durch Projekte adressiert
- **TIME-Matrix** (Gartner): Applications kategorisiert als Tolerate/Invest/Migrate/Eliminate mit zugehörigen Investitionen

### 18.8 Neue Constraints

```yaml
constraint: work-package-has-project
  appliesTo: WorkPackage
  rule: "entity.lifecycleState == 'active' → entity.realizedByProject.length >= 1"
  severity: warning

constraint: target-plateau-coverage
  appliesTo: Plateau (type: target)
  rule: "all gaps to this plateau are addressed by active or planned projects"
  severity: error
  message: "Zielplateau nicht durch Portfolio abgedeckt"

constraint: sunset-has-replacement-project
  appliesTo: PhysicalApplicationComponent
  rule: "entity.lifecycleState == 'sunset' → exists Project that addresses retirement"
  severity: warning

constraint: no-invest-in-sunset
  appliesTo: Project
  rule: "project.affects.applications must not include applications with lifecycleState in [sunset, retired]"
  severity: warning
  message: "Projekt investiert in Application, die abgelöst wird"
```

### 18.9 Architecture Review Board als organisatorische Brücke

Ein **Architecture Review Board (ARB)** ist der organisatorische Andockpunkt zwischen EA und PPM. Es prüft:

- Demands gegen Architektur-Prinzipien und Zielbilder
- Projekt-Business-Cases auf strategischen Fit
- Abweichungen von Standards (Waivers)
- Major Changes gegen Architektur-Implikationen

Im Metamodell:

```yaml
EntityType: ArchitectureReview
  properties:
    - reviewDate, outcome: approved | conditional | rejected
    - conditions[]
    - waiverGranted: boolean
  relations:
    - reviews: Project | Demand | Change
    - assessedAgainst: ArchitecturePrinciple[] | Plateau
    - decidedBy: Role (ARB-Mitglieder)
    - resultsInADR: ADR (bei grundsätzlichen Entscheidungen)
```

### 18.10 PPM-Tool-Integration

Relevante PPM-Tools:
- **Enterprise**: ServiceNow SPM, Planview, Clarity PPM, Jira Align
- **Mittelstand / Open Source**: OpenProject, Jira + Portfolio-Plugins
- **Agile-nativ**: Jira Advanced Roadmaps, AzureDevOps, Linear

Pragmatischer Ansatz: **Generischer REST-Connector mit Mapping-Konfiguration** statt tiefer Tool-Spezifika. Standardisierte Import/Export-Struktur (basierend auf PMBOK-Vokabular), die jedes Tool bedienen kann. Tool-spezifische Adapter als Plugins.

### 18.11 Praxisprinzipien

- **EA bewertet Demands *vor* der Portfolio-Entscheidung** – nicht nachträglich, sonst ist das Budget schon zugesagt
- **Work Package als Kontrakt zwischen EA und PPM** – Änderungen am Work Package brauchen Abstimmung beider Seiten
- **Benefits mit Goals verknüpfen** – sonst versickert Benefits-Realization und Strategie-Erfolg bleibt unmessbar
- **Keine separaten Roadmaps pflegen** – die integrierte Roadmap aus Repository-Daten ist die eine Wahrheit

---

← [ITSM-Integration](17-itsm-integration.md) · [🏠 Übersicht](../README.md) · [Agile Skalierungs-Frameworks](19-agile-skalierung.md) →
