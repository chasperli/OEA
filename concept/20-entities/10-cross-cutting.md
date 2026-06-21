## 10. Weitere Cross-Cutting-Konzepte

Kürzer gefasste Ergänzungen, die das Metamodell abrunden.

### 10.1 Location und Geography

```yaml
EntityType: Location
  properties:
    - name
    - type: country | region | city | site | building | room | zone | cloud-region
    - coordinates: {lat, lng}
    - jurisdictionalRegion: string  # für Compliance (EU, US, APAC)
    - dataResidencyZone: string
  relations:
    - partOf: Location
    - hosts: TechnologyComponent[] | ApplicationComponent[]
    - regulatedBy: ComplianceRequirement[]
```

**Wichtige Anwendungen**:
- Data Residency Nachweis (DSGVO, BDSG)
- Disaster-Recovery-Planung (Multi-Region)
- Sovereign Cloud Compliance
- Latenz-kritische Anwendungen (Node-Verteilung)

### 10.2 Security-Modellierung

```yaml
EntityType: SecurityZone
  properties:
    - name
    - trustLevel: public | dmz | internal | restricted | top-secret
    - networkSegment: string
  relations:
    - contains: TechnologyComponent[] | ApplicationComponent[]
    - connectedTo: SecurityZone[] (über TrustBoundary)

EntityType: TrustBoundary
  properties:
    - description
    - securityControls: string[]    # z.B. "firewall", "waf", "idp"
  relations:
    - separates: SecurityZone, SecurityZone
    - monitoredBy: ApplicationComponent

EntityType: DataClassification (als Enum erweitert)
  values: public | internal | confidential | restricted | pii | phi | pci
  relations:
    - appliesTo: DataEntity
    - requiresControls: SecurityControl[]

EntityType: SecurityControl
  properties:
    - type: encryption | access-control | audit | monitoring
    - implementation: text
  relations:
    - protects: Entity[]
    - mandatedBy: ComplianceRequirement[]

# CIA-Schutzbedarfsklassifikation nach ISO 27005 / BSI Grundschutz
EntityType: ProtectionNeed
  properties:
    - confidentiality: normal | high | very-high
    - integrity: normal | high | very-high
    - availability: normal | high | very-high
    - justification: text            # Begründung der Einstufung
    - assessedBy: Role
    - assessedDate: date
    - nextReview: date
  relations:
    - appliesTo: Entity              # Application, Technology, DataEntity, Process, ...
```

**Schutzbedarfsvererbung**: Der Schutzbedarf eines Application Components kann vom Maximum der Schutzbedarfe der verarbeiteten Data Entities abgeleitet werden. Das Metamodell erlaubt sowohl explizite Pflege als auch berechnete Ableitung.

### 10.3 Sustainability / Green IT

Zunehmend wichtig für Enterprise-Reporting (CSRD, GHG Protocol):

```yaml
ApplicationComponent, TechnologyComponent erhalten optional:
  - estimatedAnnualCarbonKg: number
  - energyEfficiencyRating: string
  - powerConsumptionKwh: number
  - sustainabilityCertifications: string[]  # z.B. "ENERGY STAR"

EntityType: CarbonAssessment
  properties:
    - entity: reference
    - assessmentMethod: string        # z.B. "SCI", "GHG Protocol Scope 3"
    - co2eKgPerYear: number
    - confidence: low | medium | high
    - assessmentDate: date
  relations:
    - assesses: Entity
    - contributesToGoal: Goal         # z.B. "Net Zero 2030"
```

**Anwendungen**:
- Carbon-Hotspot-Analyse (welche Applications/Technologies verursachen die meisten Emissionen)
- Sustainability-Zielbild (Plateau mit niedrigerer Gesamt-CO2-Bilanz)
- Vendor-Selection unter Nachhaltigkeits-Aspekten
- CSRD-Reporting

### 10.4 Lokalisierung und Internationalisierung

Für global aufgestellte Organisationen:

```yaml
Entity erhält optional:
  - supportedLanguages: string[]     # ISO 639-1
  - supportedRegions: string[]
  - i18nStatus: not-applicable | planned | partial | complete

ApplicationComponent erweitert um:
  - localizationScope: string[]      # was ist lokalisiert (UI, Content, Date-Formats, Currency)
```

### 10.5 Contract-Modellierung (TOGAF Governance Extension)

```yaml
EntityType: Contract
  properties:
    - contractType: SLA | OLA | UC | data-sharing | license | outsourcing
    - status: active | expired | renegotiating
    - validFrom, validTo: date
    - autoRenew: boolean
  relations:
    - parties: OrganizationUnit[] | Vendor[]
    - governs: Entity[]               # was regelt der Vertrag
    - hasMetrics: KPI[]
    - documentLocation: url
```

Wichtig besonders für:
- SaaS-Verträge (Lizenz-Compliance)
- Outsourcing-Beziehungen
- Data-Sharing-Agreements (DSGVO-relevant)

### 10.6 Deliverable (Implementation Layer)

Aus ArchiMate fehlt noch:

```yaml
EntityType: Deliverable
  properties:
    - description
    - deliveryDate: date
    - status: planned | in-progress | delivered | accepted
    - type: document | artifact | system | training | data-migration
  relations:
    - producedBy: WorkPackage | Project
    - handedOverTo: Role | OrganizationUnit
    - enables: Plateau                # Deliverable ermöglicht Plateau-Übergang
```

### 10.7 Requirements-Repository-Aspekte

Der Requirement-EntityType selbst ist in [§7.2 (Motivation, Stakeholder, Ziele)](07-motivation-stakeholder-ziele.md) definiert. Dieser Abschnitt ergänzt die operativen Aspekte: Lifecycle, Verknüpfungs-Disziplin, Sichten und Constraints, die das Tool als **Architecture Requirements Repository** ausmachen.

**Lifecycle**: Anforderungen durchlaufen einen klar definierten Status-Workflow:

```
identified → analyzed → approved → allocated → realized → verified
                              ↓
                          rejected | deferred
                              ↓
                          retired (am Lebensende)
```

Kritische Übergänge:
- `identified → analyzed`: Erste fachliche Bewertung, Begründung dokumentiert
- `analyzed → approved`: Akzeptanzkriterium ist Pflicht (siehe Constraints unten)
- `approved → allocated`: Zuordnung zu Plateau und WorkPackage
- `allocated → realized`: Implementierung abgeschlossen, Realisierungs-Relation gepflegt
- `realized → verified`: Akzeptanzkriterium erfolgreich geprüft

**Erlaubte Verknüpfungen**: Requirements sind das zentrale Bindeglied zwischen Strategie und Umsetzung. Sinnvolle Verbindungen sind:

| Verbindung | Bedeutung | Wertigkeit |
|---|---|---|
| Requirement ↔ Goal/Outcome | Strategische Begründung | Soll für jede Architecture Requirement existieren |
| Requirement ↔ Stakeholder/Concern | Quelle und Adressat | Wichtig für Priorisierung |
| Requirement ↔ Entity / Relation | Realisierung | Kern der Trace-Matrix |
| Requirement ↔ Standard / ADR | Etablierung über Norm-/Entscheidungs-Bezug | Zentral für Governance |
| Requirement ↔ ComplianceRequirement | Regulatorische Quelle | Pflicht für compliance-getriebene Anforderungen |
| Requirement ↔ Plateau | Zeitliche Verortung | Pflicht für approved+ |
| Requirement ↔ WorkPackage | Umsetzungs-Allokation | Pflicht für allocated+ |
| Requirement ↔ Requirement | Hierarchie und Beziehungen | refines/dependsOn/conflictsWith |
| Requirement ↔ Risk | Risiko-Mitigation | Bei sicherheits-/compliance-Anforderungen |

**Vorsichtig zu nutzende Verknüpfungen**:

- Requirement → Process: nur auf Prozess-Ebene, nicht auf einzelne Aktivitäten (das wäre BPM-Tool-Detail)
- Requirement → Interface: nur wenn schnittstellen-spezifisch; allgemeine API-Anforderungen gehören in Standards
- Requirement → Capability: legitim, aber Überlapp mit Goal vermeiden

**Nicht erlaubte Verknüpfungen**:

- Requirement → Person (statt Rolle/Stakeholder): DSGVO- und Personalwechsel-Problem
- Requirement → Code-Artefakte (Repos, Branches, Files): gehört nicht ins EA, sondern ins ALM
- Requirement → konkrete Dev-Tickets: läuft über WorkPackage, nicht direkt
- Requirement → Test-Implementierungen: Akzeptanzkriterium ja, Test-Code nein

**Anti-Pattern: Anforderung als Aufgabe formuliert**: "System X muss auf Cloud migriert werden" ist ein WorkPackage, keine Anforderung. Die Anforderung wäre: "System X muss in einer skalierbaren, geografisch verteilten Umgebung lauffähig sein, mit Verfügbarkeit ≥ 99.9%". Das Tool sollte durch Templates und Validierungen das **Was** statt das **Was wir tun werden** fördern.

**Sichten und Reports**:

- **Trace-Matrix**: alle Requirements × alle realisierenden Entitäten, mit Coverage-Indikator
- **Coverage-Lücken**: Requirements mit Status `approved` oder höher, aber ohne `realizedBy`-Verbindung
- **Verifikations-Status**: Requirements mit Status `realized`, aber ohne erfolgreiche Verifikation
- **Konflikt-Sicht**: alle `conflictsWith`-Beziehungen mit Auflösungs-Status
- **Plateau-Coverage**: Requirements pro Plateau, gefiltert auf nicht-`verified`
- **Stakeholder-Sicht**: Requirements gruppiert nach `raisedBy`, mit Status pro Stakeholder
- **Compliance-Trace**: ComplianceRequirement → ArchitectureRequirement → realisierende Entities

**Constraints**:

```yaml
constraint: approved-requirement-has-acceptance-criteria
  appliesTo: Requirement
  when: "entity.status in [approved, allocated, realized, verified]"
  rule: "entity.acceptanceCriteria != null AND entity.acceptanceCriteria != ''"
  severity: error
  message: "Genehmigte Anforderung ohne Akzeptanzkriterium ist Wunschvorstellung, kein Engineering-Artefakt"

constraint: approved-requirement-has-rationale
  appliesTo: Requirement
  when: "entity.status in [approved, allocated, realized, verified]"
  rule: "entity.derivedFromGoal.length >= 1 OR entity.derivedFromCompliance.length >= 1 
         OR entity.addresses.length >= 1"
  severity: warning
  message: "Genehmigte Anforderung ohne strategische, regulatorische oder Stakeholder-Begründung"

constraint: realized-requirement-has-realization
  appliesTo: Requirement
  when: "entity.status in [realized, verified]"
  rule: "entity.realizedBy.length >= 1"
  severity: error

constraint: allocated-requirement-has-plateau-and-workpackage
  appliesTo: Requirement
  when: "entity.status in [allocated, realized, verified]"
  rule: "entity.implementedInPlateau.length >= 1 AND entity.allocatedTo.length >= 1"
  severity: error

constraint: requirement-conflicts-resolved-before-approval
  appliesTo: Requirement
  when: "entity.status in [approved, allocated, realized, verified]"
  rule: "all entity.conflictsWith have resolution-ADR or both have status='deferred'"
  severity: warning

constraint: system-requirement-has-target-system
  appliesTo: Requirement
  when: "entity has stereotype 'SystemRequirement'"
  rule: "entity.targetSystem != null"
  severity: error
```

**Versionierung**: Jede semantische Änderung an einer Anforderung erzeugt eine neue Version. Die alte Version bleibt referenzierbar (für ADR- und Audit-Nachvollziehbarkeit). Genutzt wird der allgemeine Versionierungs-Mechanismus aus dem temporalen Modell – Anforderungen sind keine Sonderfälle.

**Was das Repository nicht ist**: Kein Issue-Tracker (keine Kommentar-Threads, Watcher, Activity-Streams), kein Test-Management-Tool (keine Test-Execution), kein Document-Management-System. Diese Funktionen würden den EA-Fokus verwässern – wer sie braucht, integriert spezialisierte Tools über die API.

---

← [Prozess-Architektur](09-prozess-architektur.md) · [🏠 Übersicht](../README.md) · [Temporales Modell](../30-dynamics/11-temporales-modell.md) →
