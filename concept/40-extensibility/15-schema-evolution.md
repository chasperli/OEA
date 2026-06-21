## 15. Schema-Evolution

Ein EA-Repository lebt über Jahre, das Schema dahinter evolviert. Nach 2 Jahren Betrieb mit 500 Application Components kommt die Anforderung: "Wir müssen pro Application die Datenklassifizierung pflegen, wegen ISO 27001." Ohne evolutionären Ansatz bedeutet das 500 Entitäten nachpflegen und monatelange Review-Board-Arbeit.

Dieses Kapitel beschreibt, wie Schema-Änderungen **kontrolliert, subjektiv und ohne Flächenwirkung** eingeführt werden können.

### 15.1 Drei Klassen von Properties

Nicht jedes Property ist gleich kritisch. Das Metamodell unterscheidet:

**Klasse 1 – Identity & Essentials**
Immer Pflicht, sonst ist die Entität nutzlos: Name, ID, Typ. Keine Ausnahmen, kein Evolutions-Bedarf.

**Klasse 2 – Architectural Essentials**
Pflicht, weil ohne sie keine Architektur-Aussagen möglich: Lifecycle, primäre Relationen (z.B. Application zu Capability). Änderungen hier sind Breaking Changes.

**Klasse 3 – Everything Else**
Optional oder bedingt Pflicht. Hier findet die eigentliche Schema-Evolution statt. Fast alle neuen Properties landen in dieser Klasse.

### 15.2 Evolutions-Pattern

#### Pattern 1 – Optional hinzugefügtes Property

Das einfachste Pattern: Property ist optional, bestehende Entitäten haben keinen Wert, neue können einen haben. Kein Breaking Change.

```yaml
EntityType: PhysicalApplicationComponent
  properties:
    - name: dataClassification
      type: enum[public, internal, confidential, restricted]
      cardinality: 0..1
      introducedIn: "schema-v2.3"
      required: false
```

#### Pattern 2 – Scope-basierte Pflicht (subjektive Wahl)

Der zentrale Mechanismus für pragmatische Einführung: Eine neue Pflicht gilt **nicht global**, sondern für eine bewusst gewählte Teilmenge. Diese Teilmenge kann kriterien-basiert oder explizit definiert werden.

```yaml
constraint: data-classification-required
  appliesTo: PhysicalApplicationComponent
  scope:
    type: subjective-selection
    criteria:
      - entity.criticalityClass == "tier-1"          # automatisch
      - entity.belongsTo.domain == "finance"         # automatisch
      - entity.id in explicitlySelectedEntities      # manuell selektiert
    combineWith: OR
  rule: "entity.dataClassification != null"
  severity: error
  introducedIn: "schema-v2.3"
```

Der entscheidende Punkt: `type: subjective-selection` mit einer Kombination aus **automatischen Kriterien** und **expliziter manueller Auswahl**. Architekturteams können:

- Automatisch alle Tier-1-Applications oder alle Finance-Applications einschließen
- Manuell einzelne weitere Entitäten hinzufügen oder ausschließen
- Den Scope schrittweise erweitern, sobald der initiale Scope gepflegt ist

Ergebnis: Eine neue Property-Anforderung betrifft zunächst nur 30 von 500 Applications – machbar in wenigen Wochen, statt 500 auf einmal.

#### Pattern 3 – Bedingte Pflicht (Rule-basiert)

Klassisch kontextabhängig, ohne manuelle Selektion:

```yaml
constraint: data-classification-for-production
  appliesTo: PhysicalApplicationComponent
  when: "entity.lifecycleState == 'active' AND entity.environment == 'production'"
  rule: "entity.dataClassification != null"
  severity: error
  exemptions: [legacy-before-2023]
```

Legacy-Entitäten explizit ausgenommen, neue Produktions-Applications sofort betroffen. Das ist stärker als Pattern 2 (greift automatisch für alle passenden Entitäten), aber weniger flexibel (keine manuelle Auswahl).

#### Pattern 4 – Deadline-basierter Pflicht-Übergang

Für Fälle, in denen langfristig globale Pflicht erreicht werden soll:

```yaml
properties:
  - name: dataClassification
    type: enum[...]
    required: true
    requiredFrom: "2027-07-01"
    gracePeriod: "2026-01-01 to 2027-06-30"
    escalation:
      warning: "2026-06-01"
      error: "2027-07-01"
```

Das Tool zeigt während der Grace Period Warnungen, eskaliert zu Errors ab Deadline. Kombinierbar mit Pattern 2: Grace Period für Tier-1, danach globale Pflicht.

### 15.3 Data Quality statt Pflicht-Binarität

Ein komplementäres Konzept: Statt jede Regel als Pflicht oder nicht-Pflicht zu klassifizieren, wird pro Entität ein **Data Quality Score** berechnet:

```yaml
EntityType erhält Meta-Property:
  - dataQualityScore:
      completeness: 0-100    # Anteil gepflegter relevanter Properties
      accuracy: 0-100        # Validität geprüfter Werte
      timeliness: 0-100      # Alter der letzten Aktualisierung
      overall: 0-100         # gewichtetes Mittel
```

Neue Properties senken den Completeness-Score, sind aber nicht blocking. Sichten wie "Applications mit schlechtester Data Quality" erlauben **zielgerichtete Nachpflege** ohne Flächenzwang. Das ist oft wirksamer als harte Pflicht-Regeln.

### 15.4 Schema-Versionierung als First-Class-Konzept

Jedes Schema trägt eine semantische Version und explizite Migrationsregeln zwischen Versionen:

```yaml
Schema: togaf-content-metamodel
  version: 2.3.0
  predecessor: 2.2.0
  migrationRules:
    from-2.2.0:
      - addProperty:
          entity: PhysicalApplicationComponent
          property: dataClassification
          required: false
          default: null
      - renameProperty:
          entity: Interface
          from: direction
          to: flowDirection
          preserveValues: true
      - deprecateProperty:
          entity: PhysicalApplicationComponent
          property: oldTagField
          removeIn: "2.5.0"
```

Beim Schema-Update führt das Tool die Migrationen automatisiert durch, wo möglich, und zeigt manuelle Aktionen für alle Fälle, die nicht automatisch lösbar sind.

### 15.5 Entity-Level Schema-Tracking

Jede Entität trägt die Info, nach welcher Schema-Version sie angelegt und zuletzt validiert wurde:

```yaml
Entity-Instanz (Meta-Properties):
  - schemaVersionCreated: "2.1.0"
  - schemaVersionLastUpdated: "2.3.0"
  - lastValidatedAt: "2.3.0"
  - validationStatus: valid | outdated | invalid
```

Das ermöglicht Aussagen wie "diese Entität wurde nach altem Schema angelegt und müsste gegen das aktuelle revalidiert werden". Typischer Fall in Audits. Sichten können gezielt "outdated entities" filtern und Review-Workflows anstoßen.

### 15.6 Tag-basierte Pilotierung

Bevor ein Attribut zum Property wird, kann es als **Tag** pilotiert werden:

```yaml
Entity erhält:
  - tags: Tag[]  # generisch, frei belegbar

Tag:
  - key: string  # z.B. "data-classification"
  - value: string  # z.B. "confidential"
  - source: string  # wer hat das Tag gesetzt
  - addedAt: datetime
```

Workflow: Tags werden experimentell eingeführt, gewonnen Daten werden evaluiert, bewährt sich das Konzept, wird daraus ein formales Property mit passendem Pattern aus [§15.2 (Schema-Evolution)](15-schema-evolution.md). Das reduziert die Zahl der Breaking Changes erheblich.

### 15.7 Governance und Impact-Analyse

Schema-Änderungen sind nicht nur technisch, sondern organisatorisch. Das Tool unterstützt:

**Impact-Analyse vor Schema-Änderung:**
```
"Property dataClassification als Pflicht hinzufügen?
 Scope 'alle Tier-1-Applications' betrifft 47 Entitäten.
 Betroffene Owner: Finance IT (23), Sales IT (14), Corporate (10).
 Geschätzter Pflegeaufwand: 12 Personentage."
```

**Ownership-Zuordnung für Nachpflege:**
Pro Entität wird der Owner ermittelt, Nachpflege-Tasks werden nach Owner gruppiert.

**Progress Tracking:**
Dashboard zeigt, wie viele Entitäten die neue Property bereits haben, wer noch liefern muss.

### 15.8 Severity-Levels statt Binary Gating

Für die Durchsetzung: Nicht jede Regelverletzung blockiert. Severity-Levels erlauben gestaffelte Reaktion:

- **Hint**: Empfehlung, nicht blockierend, nicht in Standard-Reports sichtbar
- **Info**: Information, nicht blockierend, in Reports sichtbar
- **Warning**: Sollte behoben werden, nicht blockierend, in Dashboards prominent
- **Error**: Blockiert weitere Änderungen an der Entität, muss behoben werden

Empfohlener Lifecycle einer neuen Regel: startet als Warning, wird nach Bewährung und Feedback zu Error hochgestuft.

### 15.9 Backwards-Compatibility und Deprecation

Für unvermeidliche Breaking Changes:

```yaml
Schema erhält:
  - compatibilityMode: strict | relaxed | migration-period
  - breakingChangesAllowed: boolean
  - deprecationPeriod: duration (default: 6 months)

Deprecated Properties:
  - bleiben im Schema während der Deprecation-Period
  - werden in UI durchgestrichen angezeigt
  - Schreibversuche erzeugen Warnings (später Errors)
  - verschwinden komplett erst nach Deprecation-Period
```

### 15.10 Praxisprinzipien

- **Starte mit wenigen Pflicht-Properties.** Lieber schlankes Schema mit nachträglicher Verschärfung, als überladenes Schema, das keiner pflegt.
- **Neue Regeln zuerst als Warning, später als Error.** Gibt Zeit für Feedback und Nachpflege.
- **Subjektive Scopes sind die Regel, nicht die Ausnahme.** Flächendeckende Pflicht selten wirklich nötig.
- **Tags für Pilotierung, Properties für bewährte Konzepte.**
- **Data Quality Scores als positives Framing.** "Verbessere Score", statt "erfülle Pflicht".
- **Schema-Änderungen mit Impact-Analyse.** Vor jeder Änderung Zahlen auf den Tisch: wie viele Entitäten, welche Owner, welcher Aufwand.

### 15.11 Constraints für Schema-Governance selbst

Meta-Ebene: Regeln für die Regeln.

```yaml
constraint: new-required-property-needs-scope
  appliesTo: Property (Meta-Ebene)
  rule: "if property.required == true AND property.introducedIn != initial,
         then property.scope must be defined (not global)"
  severity: warning
  message: "Neue globale Pflicht-Property ohne Scope – wirklich gewollt?"

constraint: deprecation-period-minimum
  appliesTo: Property (Meta-Ebene)
  rule: "if property.deprecated == true, deprecationPeriod >= 3 months"
  severity: error
```

---

← [Erweiterbarkeit](14-erweiterbarkeit.md) · [🏠 Übersicht](../README.md) · [Beispiel-Walkthrough](../50-walkthrough/16-beispiel-walkthrough.md) →
