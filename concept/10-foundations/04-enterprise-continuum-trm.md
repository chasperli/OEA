## 4. Enterprise Continuum und Technical Reference Model

Zwei TOGAF-Konzepte, die für die Repository-Struktur grundlegend sind und oft unterschätzt werden: das **Enterprise Continuum** als Klassifizierungs- und Organisationsstruktur für wiederverwendbare Architektur-Artefakte, und das **Technical Reference Model (TRM)** als taxonomische Einordnung von Technology-Services.

### 4.1 Enterprise Continuum als eigenständiger Repository-Bereich

Das Enterprise Continuum unterscheidet **wiederverwendbare Blueprints** von **konkreten Organisations-Instanzen**. Diese Unterscheidung zieht sich durch das gesamte Repository.

**Architecture Continuum** (spezifikatorisch, von generisch zu spezifisch):
- Foundation Architectures (universelle Building Blocks)
- Common Systems Architectures (branchenübergreifend)
- Industry Architectures (branchenspezifisch, z.B. TM Forum Frameworx)
- Organization-Specific Architectures

**Solutions Continuum** (implementierend, parallel dazu):
- Foundation Solutions
- Common Systems Solutions
- Industry Solutions
- Organization-Specific Solutions

### 4.2 Architecture Building Blocks und Solution Building Blocks

Zentrale Unterscheidung im Enterprise Continuum:

- **Architecture Building Block (ABB)**: Spezifikation einer wiederverwendbaren Architektur-Einheit. Beschreibt *was* etwas tut und *welche Eigenschaften* es haben muss, technologie-neutral.
- **Solution Building Block (SBB)**: Konkrete Implementierung eines ABBs durch ein Produkt oder eine Komponente.

Beispiel: ABB "Identity Provider" (muss SAML 2.0 sprechen, muss MFA unterstützen) wird implementiert durch SBB "Keycloak 23.0" oder SBB "Azure AD".

Dies ist dieselbe Logical/Physical-Logik wie auf Instanz-Ebene – aber auf höherer Abstraktion: es geht nicht um eine konkrete Instanz *in* der Organisation, sondern um Blueprints *für* die Organisation.

### 4.3 Repository-Struktur

```
Repository:
├── /continuum/                    (wiederverwendbare Blueprints)
│   ├── /architecture-building-blocks/
│   ├── /solution-building-blocks/
│   ├── /patterns/
│   └── /reference-architectures/
│
└── /instances/                    (konkrete Organisations-Entities)
    ├── /applications/
    ├── /technologies/
    └── ...
```

Eine Organisations-Instanz referenziert ABBs/SBBs:

```yaml
PhysicalApplicationComponent "acme-keycloak-prod":
  instanceOf: SBB "keycloak"
  conformsToABB: "identity-provider"
```

### 4.4 Neue EntityTypes

```yaml
EntityType: ArchitectureBuildingBlock (ABB)
  properties:
    - name, description
    - continuumLevel: foundation | common | industry | organization
    - maturityLevel: experimental | emerging | established | industry-standard
    - governanceStatus: proposed | approved | deprecated
    - specifications: text / structured
    - requirements: Requirement[]
    - industry: string (für Industry-Level)
  relations:
    - refinesABB: ABB (Hierarchie: spezifischer ABB verfeinert generischeren)
    - implementedBy: SBB[]

EntityType: SolutionBuildingBlock (SBB)
  properties:
    - name, vendor, version
    - continuumLevel: foundation | common | industry | organization
    - maturityLevel
    - governanceStatus: approved | acceptable | deprecated | prohibited
  relations:
    - implements: ABB[]
    - instantiatedAs: PhysicalApplicationComponent[] | PhysicalTechnologyComponent[]

EntityType: ArchitecturePattern
  properties:
    - name, description, problem, solution
    - applicability, consequences
    - maturityLevel
  relations:
    - appliedIn: Entity[] (wo ist das Pattern konkret umgesetzt?)
    - relatedPatterns: ArchitecturePattern[]

EntityType: ReferenceArchitecture
  properties:
    - scope, targetIndustry
  relations:
    - composedOf: ABB[]
    - basedOnPatterns: ArchitecturePattern[]
    - instantiatedAs: Plateau (als Zielbild nutzbar)
```

### 4.5 Analysen über das Enterprise Continuum

Die Trennung von Continuum und Instanzen eröffnet neue Sicht-Möglichkeiten:

- **ABB-Abdeckung**: Welche ABBs haben wir definiert, aber keine Instanz dafür? (Lücke)
- **SBB-Diversität**: Wie viele verschiedene SBBs erfüllen denselben ABB? (Ungewollte Vielfalt)
- **Standards-Drift**: Welche Instanzen weichen von ihrem referenzierten SBB ab (z.B. nicht-genehmigte Version)?
- **Continuum-Reife**: Welche Organization-Specific-Artefakte haben das Potenzial, als Common Systems oder Industry Blueprint zurück ins Continuum zu wandern?

### 4.6 Technical Reference Model (TRM)

Das TRM ist ein konkretes Beispiel einer Foundation Architecture: eine **Taxonomie von Technology-Services** mit Kategorien und Subkategorien. TOGAF liefert ein Beispiel-TRM mit, das organisationsspezifisch angepasst werden sollte.

Das TRM ist im Metamodell eine **eigenständige Klassifikations-Hierarchie**:

```yaml
EntityType: TRMCategory
  properties:
    - name, description
    - level: 1 | 2 | 3  (Hierarchie-Tiefe)
  relations:
    - parent: TRMCategory
    - children: TRMCategory[]
    - preferredStandard: SBB | PhysicalTechnologyComponent
    - acceptedAlternatives: SBB[]
    - deprecatedOptions: SBB[]
    - evaluationCriteria: string[]
    - lastReviewed: date
```

Jede `PhysicalTechnologyComponent` kann einer oder mehreren TRM-Kategorien zugeordnet werden:

```yaml
PhysicalTechnologyComponent erhält:
  - trmClassification: TRMCategory[] (n:m)
```

### 4.7 TRM-basierte Analysen

- **Technology Diversity**: Wie viele Produkte haben wir pro TRM-Kategorie? Fünf Message-Broker, wenn zwei reichen würden?
- **TRM Coverage**: Welche TRM-Services haben wir abgedeckt, welche fehlen?
- **Standard Enforcement**: Welche Technologien weichen vom Preferred Standard ihrer TRM-Kategorie ab?
- **Lifecycle pro Kategorie**: Bebauungsplan gefiltert auf eine TRM-Kategorie zeigt Wandel innerhalb eines Service-Bereichs

### 4.8 Nutzung im Workflow

Das Enterprise Continuum ist nicht nur Dokumentation, sondern **aktiv im Architektur-Workflow**:

1. **Neues Projekt startet** → prüfe, ob existierende ABBs/SBBs/Patterns wiederverwendet werden können
2. **Neue Technologie wird evaluiert** → einordnen in TRM, prüfen gegen bestehende Standards
3. **Architekturentscheidung** → nutzt ABBs/Patterns als Referenz in ADRs
4. **Erfahrung aus Projekt** → wenn Organization-Specific-Artefakt wiederverwendbar wird, rückwärts ins Continuum promovieren

### 4.9 Constraints

```yaml
constraint: instance-conforms-to-sbb
  appliesTo: PhysicalApplicationComponent | PhysicalTechnologyComponent
  rule: "if entity.instanceOf != null, entity properties must satisfy SBB specification"
  severity: warning

constraint: technology-has-trm-classification
  appliesTo: PhysicalTechnologyComponent
  rule: "entity.trmClassification.length >= 1"
  severity: warning
  message: "Technology nicht ins TRM eingeordnet – Standards-Governance nicht möglich"

constraint: sbb-implements-abb
  appliesTo: SolutionBuildingBlock
  rule: "entity.implements.length >= 1"
  severity: warning
  message: "SBB ohne ABB-Referenz ist nur ein Produktkatalog-Eintrag"
```

---

← [Framework-Verhältnis](03-framework-verhaeltnis.md) · [🏠 Übersicht](../README.md) · [Prinzipien, Standards & ADRs](05-prinzipien-standards-adrs.md) →
