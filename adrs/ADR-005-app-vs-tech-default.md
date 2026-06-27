# ADR-005: Application-vs-Technology-Klassifikations-Prinzip (Default)

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
**Konsultiert**: Requirements Engineer (metamodel-configuration.md, ADR-002)
**Informiert**: alle Stakeholder

---

## Kontext und Problem

§6.1.1 des Konzepts fordert von jeder Organisation ein verbindliches Architektur-Prinzip, das die Abgrenzung Application vs. Technology festlegt:

- **Variante A** ("Plattform-as-Technology"): Plattform-Services sind Technology, auch bei eigenem Betriebsteam — klassische TOGAF-Lesart
- **Variante B** ("Plattform-as-Application"): Produkte mit Product Owner sind Applications, auch bei technischem Charakter — moderne Product-Org-Lesart

Die offene Frage: Welche Variante ist der **Default-Auslieferungszustand** von OEA?

**Bereits getroffene Vorentscheidung** (metamodel-configuration.md + ADR-002): OEA ist vollständig metamodell-getrieben. Es gibt keine hardcodierten EntityTypes „ApplicationComponent" oder „TechnologyComponent" im Code — diese sind konfigurierbare EntityTypeDefinitions. Der Begriff „Default" bedeutet daher: **welche Starter-Konfiguration wird beim Bootstrapping angeboten?**

## Entscheidungstreiber

- **Open-Source-Charakter**: Ein starres Default-Prinzip könnte bestimmte Organisationen ausschliessen oder bevorzugen
- **Nicht-Erzwingung**: OEA soll Modellierungs-Entscheidungen unterstützen, nicht abnehmen
- **Niedrige Einstiegshürde**: Ohne irgendeinen Startpunkt steht Erstnutzer vor leerem Metamodell — Frustration
- **Konsistenz mit ADR-002**: Starter-Konfigurationen als importierbare Pakete; kein Hardcoding

## Betrachtete Optionen

### Option 1: Variante A als Default ("Plattform-as-Technology")
- Pro: klassischere TOGAF-Lesart; bekannter für EA-Seniors
- Contra: passt nicht zu Product-Orgs (wachsende Mehrheit); könnte als Bias wahrgenommen werden

### Option 2: Variante B als Default ("Plattform-as-Application")
- Pro: passt zu modernen Product/Platform-Engineering-Trends
- Contra: weicht von klassischer EA-Lehre ab; unvertraut für traditionelle EA-Abteilungen

### Option 3 (gewählt): Bewusst undefiniert + zwei Starter-Pakete
- OEA wird ohne erzwungenes App/Tech-Prinzip ausgeliefert
- Beim Bootstrapping wählt der Admin aus zwei optionalen Starter-Paketen (oder startet ohne)
- **Pro**: kein Bias; respektiert Organisations-Entscheidung; niedrige Einstiegshürde durch konkrete Beispiele
- **Contra**: Erstnutzer muss eine Entscheidung treffen (aber das ist bewusst gewollt)

### Option 4: Variante A als Default, Wechsel jederzeit möglich
- Pro: pragmatischer Mittelweg
- Contra: „Wechsel jederzeit möglich" ist faktisch aufwändig wenn bereits 10.000 Entitäten modelliert sind; der vermeintliche Vorteil ist illusorisch

## Entscheidung

**Option 3 ist die Entscheidung.**

OEA hat **keinen erzwungenen Default** für Application vs. Technology. Stattdessen gibt es zwei optionale Starter-Pakete (ADR-002 Import-Mechanismus), die beim Bootstrapping (UC-02) angeboten werden:

### Starter-Paket A: `oea-starter-togaf-classic`
Modelliert nach klassischer TOGAF/ArchiMate-Lesart (Variante A: Plattform-as-Technology):

| EntityType | Kategorie | Beispiel |
|---|---|---|
| `application-component` | Application | CRM-System, ERP |
| `application-service` | Application | Kunden-API |
| `data-object` | Application | Kundenstamm |
| `technology-component` | Technology | Kubernetes-Cluster, PostgreSQL |
| `technology-service` | Technology | Datenbank-Service |
| `system-software` | Technology | Linux, JVM |
| `network-node` | Technology | Load-Balancer |

### Starter-Paket B: `oea-starter-product-org`
Modelliert nach moderner Product-Org-Lesart (Variante B: Plattform-as-Application):

| EntityType | Kategorie | Beispiel |
|---|---|---|
| `product` (aus ADR-003) | Application | CRM-Plattform, Data-Platform |
| `service` | Application | Kunden-API, Analytics-Service |
| `data-product` | Application | Kundenstamm-Datensatz |
| `infrastructure` | Technology | Cloud-Region, On-Prem-DC |
| `runtime-platform` | Technology | EKS-Cluster, VM-Farm |

### Bootstrapping-Ablauf (ergänzt UC-02)
1. Admin wählt beim ersten Login: „Starter-Konfiguration importieren?"
2. Optionen: `oea-starter-togaf-classic`, `oea-starter-product-org`, „Leer starten"
3. Wahl importiert das Paket als `scope=imported`; Admin kann danach eigene Typen ergänzen oder vorhandene forken

### Kein Zwang
- Beide Pakete können nach dem Import frei modifiziert werden (via „Als eigene Kopie" forken → `scope=organization`)
- Admin kann beide Pakete gleichzeitig importieren (manche Organisationen haben Hybridmodelle)
- Kein Code-Pfad im Backend ist von der Wahl abhängig — es sind reine EntityTypeDefinition-Konfigurationen

## Konsequenzen

### Positiv
- Kein Bias gegenüber einem Klassifikationsprinzip
- Niedrige Einstiegshürde durch konkrete Starter-Konfigurationen
- Vollständige Erweiterbarkeit: Org kann eigene Subtypen (`private-cloud-app extends application-component`) ergänzen
- Konsistent mit ADR-002 (Import-Mechanismus) und ADR-003 (work-initiative als Metamodell-Typ)

### Negativ / Trade-offs
- Zwei Starter-Pakete müssen gepflegt werden (eigenständige OSS-Artefakte)
- Erstnutzer muss beim Bootstrapping eine bewusste Entscheidung treffen — aber das ist eine konzeptionelle Notwendigkeit, keine Schwäche

### Folgeentscheidungen
- UC-02 (Bootstrapping) erhält Schritt für Starter-Konfiguration (ergänzt REQ-013/014)
- `oea-starter-togaf-classic` und `oea-starter-product-org` werden als eigenständige Paket-Dateien im Repository verwaltet (`packages/` Verzeichnis — kommt mit Walking Skeleton)

## Bezüge

**Konzept-Kapitel**:
- [§6.1.1 Application vs. Technology](../concept/20-entities/06-kern-entitaetstypen.md)

**Abhängige ADRs**: ADR-002 (Import-Mechanismus für Starter-Pakete), ADR-003 (product/project als konfigurierbare Typen)

**Bezogene Requirements**: REQ-013/014 (Bootstrapping), UC-02, UC-04 (Metamodell konfigurieren)
