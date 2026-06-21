## 17. ITSM-Integration (CMDB und Service Catalog)

Das EA-Repository existiert nicht im luftleeren Raum. In jeder Enterprise-Umgebung koexistiert es mit ITSM-Werkzeugen (ServiceNow, BMC Helix, Ivanti, Jira Service Management, o.ä.), die eine **CMDB** und einen **Service Catalog** pflegen. Saubere Abgrenzung ist erfolgskritisch, weil sonst doppelte Pflege, widersprüchliche Daten und Vertrauensverlust drohen.

### 17.1 Grundlegende Rollenverteilung

EA-Repository und CMDB adressieren unterschiedliche Fragen:

| EA-Repository beantwortet | CMDB/ITSM beantwortet |
|---|---|
| Was sollten wir haben? | Was haben wir aktuell? |
| Warum haben wir es? | Wie läuft es gerade? |
| Wann ändern wir es? (Planung) | Wann ändern wir es? (Execution) |
| Wer nutzt es fachlich? | Wer supportet es operativ? |
| Wie sieht 2028 aus? | Welche Version läuft auf Node-42? |

EA denkt in **Plateaus und Zielbildern** (Monate bis Jahre), CMDB in **Konfigurationszuständen** (Sekunden bis Wochen).

### 17.2 Entitätsbezogene Mastership

Die Frage "wer ist Master?" wird **pro EntityType und teilweise pro Property** entschieden:

**EA ist Master für:**
- Alle Logical-Entitäten (LogicalApplication/-Technology/-Data)
- Business-Architecture-Entitäten (Capability, ValueStream, BusinessService, BusinessFunction, Process, OrgUnit, InformationObject, InformationFlow)
- Zeitliche und strategische Entitäten (Plateau, Goal, Driver, WorkPackage, Gap, ADR, Principle, Standard)
- Planungsrelevante Properties auf Physical-Entitäten (`lifecycleState` pro Plateau, `strategicClassification`, `targetArchitecture`-Zugehörigkeit)

**CMDB/ITSM ist Master für:**
- Konkrete Laufzeit-CIs (Server, VMs, Container, Netzwerk-Geräte, Storage)
- Software-Installationen inkl. Patchlevel, konkrete Versionen, Hostnamen, IPs
- Deployment-Instanzen (DEV/TEST/PROD)
- Operative Properties (Status, Uptime, Metriken, Incident-/Change-Historie, SLA-Bindung)

**Gemeinsam gepflegt** (mit Property-Level-Mastership):
- `PhysicalApplicationComponent`: EA-Master für Existenz, Fachzuordnung, strategische Bewertung; CMDB-Master für aktuelle Version, Deployment-Instanzen, operative Status
- `PhysicalTechnologyComponent`: EA-Master für Standards, Zielbild, Lifecycle-Planung; CMDB-Master für Patchstand, Konfiguration, Instanzen
- `Interface`: EA-Master für fachliche Semantik, Informationsfluss-Zuordnung, geplante Interfaces; CMDB-Master für aktive Endpoints, Monitoring-Status

### 17.3 Services – die besondere Schnittmenge

"Service" ist in EA und ITSM hoffnungslos überladen. Die saubere Zuordnung:

| EA-Konzept | ITSM-Konzept | Mastership |
|---|---|---|
| BusinessService | Business Service (Service Catalog Entry) | EA: fachliche Definition, Realisierung, Capability-Zuordnung. ITSM: Bestellweg, SLA, Pricing, Service Owner (operativ) |
| ApplicationService | Technical Service (falls im Catalog) | EA: funktionale Definition, Realisierungskette. ITSM: technisches SLA, Support-Level |
| PlatformService | Technical/Infrastructure Service | EA: Technologie-Standard, Zielbild. ITSM: Betriebs-Verantwortung, SLA |

**Strukturelle Asymmetrie**: EA strukturiert Services nach Realisierungsketten (Business → Application → Platform), ITSM nach Dependency-Ketten (Customer-facing → Supporting → Infrastructure). Beide Sichten sind legitim und sollten parallel existieren dürfen.

**Governance-Regel**: Wenn ein EA-Service für externe Konsumenten bestimmt ist, *sollte* ein Service Catalog Entry existieren. Umgekehrt *sollte* jeder Service Catalog Entry mit fachlicher Funktionalität mindestens einen EA-Service referenzieren. Nicht jeder EA-Service braucht einen Catalog-Eintrag (z.B. interne technische Interfaces).

### 17.4 Cross-Reference-Mechanismus

Stabile Identifier sind die Grundlage der Integration:

```
EA-URN-Schema:    urn:ea:<org>:<type>:<id>
                  z.B. urn:ea:acme:application:sap-fi
                       urn:ea:acme:bizservice:invoicing

CMDB-Referenz:    cmdb-ci-id: CI0042-SAP-FI-PROD
```

Beide Seiten tragen die jeweils andere ID als Property:
- EA-Entity hat Property `externalReferences[]` mit CMDB-CI-IDs
- CMDB-CI hat Property `eaReference` mit EA-URN

Daraus ergibt sich bidirektionale Navigierbarkeit ohne harte Kopplung.

### 17.5 Synchronisations-Muster

**CMDB → EA (Discovery-Richtung)**: Neue CIs, die durch automatische Discovery in der CMDB auftauchen, werden als Stub-Entities im EA angelegt. Shadow-IT wird sichtbar.

**EA → CMDB (Planungs-Richtung)**: Neu geplante Applications/Technologies werden als "ordered" CIs in die CMDB gepusht, damit Betrieb und Service Management sich vorbereiten können.

**Bidirektional mit Property-Mastership**: Für gemeinsame Entitäten synchronisiert der Konnektor nur die Properties, deren Master die andere Seite ist. Der eigene Master-Bereich bleibt unverändert.

### 17.6 Erweiterung des Meta-Metamodells

Das Meta-Metamodell wird um folgende Konzepte ergänzt:

```yaml
EntityType erhält optionale Properties:
  - externalReferences: ExternalReference[]

ExternalReference:
  - system: enum[servicenow, bmc-helix, ivanti, jira-sm, custom]
  - externalId: string
  - syncDirection: enum[read, write, bidirectional]
  - lastSynced: datetime
  - mastership: enum[ea, external, shared-per-property]

Property (M2-Ebene) erhält:
  - masterSystem: enum[ea, external]  # für shared-per-property
```

### 17.7 ITIL-4-Practices und Andockpunkte

| ITIL-4-Practice | Andockpunkt im EA |
|---|---|
| Service Configuration Management | CI-Types mappen auf EntityTypes; EA-URN als externe Referenz am CI |
| Service Catalog Management | `publishedAs`-Relation von EA-Service zu Catalog Entry |
| Change Enablement | Major Changes werden gegen EA-Standards und Zielbilder geprüft (Architecture Review Board) |
| Service Level Management | EA pflegt strategische Kritikalitätsklasse, daraus leitet ITSM die SLA ab |
| Incident/Problem Management | Aggregierte Statistiken können als Bewertungs-Input ("Technical Debt") ins EA fließen |

### 17.8 Praxisprinzipien

- **Nur das ins EA, was architekturrelevant ist**. Nicht jede VM, jeder Switch, jede Patchinstanz gehört modelliert. Faustregel: *Wird darüber jemals eine Architekturentscheidung getroffen?*
- **Property-Mastership explizit machen**. Wenn beide Seiten dieselbe Property pflegen ohne definierten Master, driften die Daten.
- **Rollen im Metamodell**: EA-Owner, Data-Steward, CI-Owner als Relationen modellieren – bei Konflikten weiß das System, wen es benachrichtigen muss.
- **Keine rückwirkende Bereinigung erzwingen**: Gewachsene Service-Kataloge werden nicht umgebogen. Neue Services gemeinsam designen, Altes über Zeit migrieren.

### 9.9 Sicht-Vorschläge

- **Service Catalog Alignment**: zeigt EA-Services ohne Catalog-Entry, Catalog-Entries ohne EA-Service, Services mit Referenz-Drift
- **CMDB Coverage**: zeigt EA-Applications/Technologies ohne verlinktes CI und umgekehrt
- **Mastership-Konflikte**: Properties, bei denen EA und CMDB unterschiedliche Werte haben

---

← [Beispiel-Walkthrough](../50-walkthrough/16-beispiel-walkthrough.md) · [🏠 Übersicht](../README.md) · [PPM-Integration](18-ppm-integration.md) →
