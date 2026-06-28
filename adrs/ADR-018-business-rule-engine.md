# ADR-018: Business-Rule-Engine – CEL mit GUI-Abstraktionsschicht

**Status**: accepted
**Datum**: 2026-06-27
**Entscheider**: Inhaber des Repositorys
**Konsultiert**: Business Engineer
**Informiert**: ADR-012 (Backend-Stack), ADR-017 (Layer-Strategie)
**Supersedes**: –
**Aktualisiert**: 2026-06-28 — CEL-Library korrigiert: `@cel-community/cel-js` (npm/Node.js) → `dev.cel:cel` (Google CEL-Java, Maven); Entscheidungstreiber „TypeScript/Node.js" war falsch, ADR-012 hat Java 21 + Spring Boot 3 gewählt

## Kontext und Problem

OEA erlaubt Betreibern, Validierungsregeln für Architektur-Entitäten zu definieren (`ConstraintRule`, `MandatoryConnectionConstraint` in der `MetamodelConfiguration`). Diese Regeln sollen:

1. Im Web-GUI anlegbar, editierbar und löschbar sein
2. Als JSON-Datei importierbar und exportierbar sein
3. Per Admin-Setting auf Import-only sperrbar sein (kein GUI-Edit)
4. Für nicht-technische Konfigurierer (Enterprise Architects) ohne Syntax-Kenntnisse bedienbar sein

Offen war: Welche OSS-Technologie wertet die Regelausdrücke aus, und wie wird die Konfigurationsoberfläche gestaltet?

## Entscheidungstreiber

- **Zielgruppe ist nicht Entwickler**: Admins und Enterprise Architects sollen Regeln im GUI bauen können, ohne CEL/Code zu kennen
- **Ausdrucksstärke**: Einfache Null-Checks bis zu Mehrfachbedingungen mit AND/OR; Cardinality-Checks auf Arrays
- **JSON-Serialisierbarkeit**: Regeln müssen als JSON importiert/exportiert werden können
- **Java 21 + Spring Boot 3** ([ADR-012](./ADR-012-backend-stack.md)): die Rule-Engine muss JVM-kompatibel sein; Node.js/npm-Bibliotheken scheiden aus
- **Sandboxing**: Regelauswertung muss sicher sein (kein `eval`); Regeln dürfen keinen Seiteneffekt haben
- **Zukunftssicherheit**: Ausdruckssprache soll erweiterbar sein, ohne das Rule-Format zu brechen

## Betrachtete Optionen

### Option 1: CEL + GUI-Abstraktionsschicht ✓

**Common Expression Language (CEL)** als Auswertungs-Engine; der Konfigurierer sieht nie die CEL-Syntax — das GUI generiert CEL-Ausdrücke aus einem visuellen Condition-Builder. Power-User können optional direkt CEL eingeben.

Java-Implementierung: **`dev.cel:cel`** — Googles offizielle CEL-Referenzimplementierung für die JVM (Apache 2.0). Diesel­be Organisation, die die CEL-Spezifikation pflegt. In Produktion in Kubernetes-Java-Clients und Istio-Java-Integrationen.

```kotlin
// build.gradle.kts
dependencies {
    implementation("dev.cel:cel:0.7.+")
}
```

- **Pro**: CEL ist typsicher, sandboxed, ohne Seiteneffekte; in Google Cloud, Kubernetes Admission Policies und Firebase etabliert; `dev.cel:cel` ist die offizielle Java-Referenzimplementierung der CEL-Spezifikation; Expression-Syntax ist 1:1 identisch mit der ursprünglich geplanten JS-Implementierung — GUI-Builder, JSON-Format und CEL-Vorschau bleiben unverändert gültig; ausdrucksstark genug für alle absehbaren v1.0-Use-Cases; GUI-Abstraktion entkoppelt das Nutzer-Erlebnis von der Ausdruckssprache; Apache 2.0
- **Contra**: `dev.cel:cel` ist noch im 0.x-Versions-Bereich (API kann sich ändern); im Java-Ökosystem jünger als Drools oder SpEL; GUI-Builder-Entwicklung ist eigener Aufwand

### Option 2: json-rules-engine

Rules sind nativ JSON-strukturiert (conditions/events); kein separater Ausdruck-String.

- **Pro**: Regeln sind direkt JSON — kein Compile-Schritt; aktiv gepflegt; einfachster Import/Export
- **Contra**: Kein freier Ausdrucks-String möglich; Power-User können nicht ausserhalb der vordefinierten Operatoren arbeiten; CEL-Level-Ausdrücklichkeit nicht erreichbar; harter API-Lock-in in das json-rules-engine-Format

### Option 3: Eigener Ausdruck-Parser

OEA implementiert eine eigene Mini-Ausdruckssprache.

- **Pro**: Volle Kontrolle über Syntax und Feature-Set
- **Contra**: Hoher Entwicklungsaufwand; Sicherheitsrisiken selbst zu verantworten; kein Ökosystem; scheidet aus

### Option 4: Kein OSS-Engine — nur strukturierte Bedingungen

Nur GUI-Builder, kein freier Ausdrucks-Modus.

- **Pro**: Einfachste Implementierung
- **Contra**: Zu unflexibel für Enterprise-Anforderungen; kann nicht alle TOGAF-Constraint-Typen abdecken

## Entscheidung

**Option 1: CEL (`dev.cel:cel`, Google CEL-Java) mit GUI-Abstraktionsschicht.**

Kern-Prinzip: **CEL ist der Evaluator — unsichtbar für Konfigurierer.** Das GUI generiert CEL intern; der Konfigurierer arbeitet mit einem visuellen Condition-Builder.

---

### Zwei Rule-Modi

Jede `ConstraintRule` hat einen `ruleMode`:

| Modus | Wer nutzt ihn | Wie entsteht er |
|---|---|---|
| `structured` | Konfigurierer ohne Syntax-Kenntnisse | GUI-Builder generiert CEL intern; Nutzer sieht nur Felder und Dropdowns |
| `expression` | Entwickler, erfahrene Admins | Direkteingabe eines CEL-Ausdrucks; GUI zeigt Textfeld mit Syntax-Hint |

Das GUI zeigt in beiden Modi eine CEL-Vorschau (read-only), damit Power-User sehen, was ausgeführt wird.

---

### Condition-Builder (structured-Modus)

Der GUI-Builder erzeugt strukturierte Bedingungen, die das Backend zu CEL kompiliert:

```
[ Eigenschaft: owner ▼ ] [ Operator: ist nicht leer ▼ ]
[ AND ]
[ Eigenschaft: architectureDomainIds ▼ ] [ Operator: enthält mindestens ▼ ] [ Wert: 1 ]

→ CEL-Vorschau: entity.owner != null && entity.architectureDomainIds.size() >= 1
```

Unterstützte Operatoren v1.0:

| Kategorie | Operatoren |
|---|---|
| Null-Checks | `notNull`, `isNull` |
| String | `equals`, `notEquals`, `contains`, `startsWith`, `matches` (Regex) |
| Numerisch | `equals`, `notEquals`, `greaterThan`, `lessThan`, `between` |
| Array | `minCount`, `maxCount`, `contains`, `notContains` |
| Logisch | `all` (AND), `any` (OR) |

---

### JSON-Import/Export-Format

Beide Modi sind JSON-importierbar. Das Backend validiert das Format und kompiliert `structured`-Rules zu CEL vor der Persistierung:

```json
{
  "schemaVersion": "1.0",
  "constraintRules": [
    {
      "name": "appcomp-owner-required",
      "appliesTo": "application-component",
      "severity": "warning",
      "message": "Jede ApplicationComponent muss einen Owner haben.",
      "ruleMode": "structured",
      "conditions": {
        "all": [
          { "property": "owner", "operator": "notNull" }
        ]
      }
    },
    {
      "name": "interface-naming-convention",
      "appliesTo": "interface",
      "severity": "hint",
      "message": "Interface-Name sollte mit 'I-' beginnen.",
      "ruleMode": "expression",
      "expression": "entity.name.startsWith('I-')"
    }
  ],
  "mandatoryConnectionConstraints": [
    {
      "name": "appcomp-must-run-on-tech",
      "sourceEntityType": "application-component",
      "connectionType": "runs-on",
      "targetEntityType": "technology-component",
      "validationMode": "warning",
      "message": "ApplicationComponent sollte auf mindestens einer TechnologyComponent laufen."
    }
  ]
}
```

Import-Endpunkt: `POST /api/v1/metamodel/rules/import`
Export-Endpunkt: `GET /api/v1/metamodel/rules/export`

**Import-Semantik**: Replace-all (bestehende Rules werden komplett ersetzt). Ein Merge-Modus ist deferred für v2.0.

---

### rulesEditMode

`MetamodelConfiguration` erhält ein neues Feld `rulesEditMode` (unabhängig von `editMode`):

| `rulesEditMode` | Effekt |
|---|---|
| `gui-and-import` | Rules per GUI und JSON-Import änderbar (Default) |
| `import-only` | GUI-CRUD für Rules deaktiviert; nur Import möglich |

Mögliche Kombination mit `editMode`:

| `editMode` | `rulesEditMode` | Effekt |
|---|---|---|
| `gui-and-import` | `gui-and-import` | Alles via GUI bearbeitbar |
| `import-only` | `gui-and-import` | Metamodell gesperrt, Rules per GUI pflegbar |
| `gui-and-import` | `import-only` | Rules nur per JSON-Import; Rest via GUI |
| `import-only` | `import-only` | Vollständiger GitOps-Betrieb |

---

### CEL-Sicherheitskontext

CEL wird in einem eingeschränkten Kontext ausgeführt (Java-Implementierung via `dev.cel:cel`):

- Kein Dateisystem-Zugriff, kein Netzwerk-Aufruf — CEL ist per Spezifikation seiteneffektfrei
- Keine Seiteneffekte (pure evaluation); kein Reflection-Zugriff auf beliebige Java-Klassen
- Timeout: max. 100 ms pro Regelauswertung (Spring `@Async` + `CompletableFuture.get(100, MILLISECONDS)`)
- Evaluierungskontext: `{ entity: ArchitectureEntity, metamodel: MetamodelContext }`

```java
// Beispiel: CEL-Auswertung im Spring-Service
Cel cel = CelFactory.standardCelBuilder()
    .addVar("entity", CelTypes.createMap(CelTypes.STRING, CelTypes.DYN))
    .build();
CelProgram program = cel.createProgram(cel.compile(expression).getAst());
Object result = program.eval(Map.of("entity", entityProperties));
```

---

## Konsequenzen

### Positive Konsequenzen

- Konfigurierer ohne Programmierkenntnisse können vollständige Regelsätze im GUI bauen
- Power-User können CEL direkt nutzen, wenn der Builder an Grenzen stösst
- JSON-Format ist menschenlesbar und versionierbar (z.B. in Git)
- CEL ist im Kubernetes-Ökosystem etabliert — Entwickler kennen die Syntax
- `rulesEditMode` ermöglicht GitOps-Betrieb ohne die restliche Metamodell-Konfiguration zu sperren

### Negative Konsequenzen / Trade-offs

- GUI-Condition-Builder ist eigenständiger Frontend-Aufwand
- `dev.cel:cel` befindet sich noch im 0.x-Versionsbereich; API-Stabilität vor Walking Skeleton prüfen (Alternativer Fallback: Spring Expression Language `SimpleEvaluationContext` — ohne CEL-Standardkonformität, aber zero additional dependency)
- Import-Semantik (Replace-all) kann bei Versehen alle Rules löschen → Backup vor Import empfohlen (UI-Warnung)
- `structured`-zu-CEL-Kompilierung muss getestet werden; Inkonsistenz zwischen Builder-Darstellung und tatsächlich ausgeführtem CEL möglich

### Folgeentscheidungen / Offene Punkte

- **Operator-Erweiterung**: welche Operatoren in v2.0 (z.B. Cross-Entity-Checks: "jede Interface muss mindestens eine zugeordnete ApplicationComponent haben")? Betrifft CEL-Kontext-Erweiterung.
- **Import-Merge-Modus**: Replace-all ist v1.0; Merge (add/update/delete einzelner Rules) kommt v2.0
- **`MandatoryConnectionConstraint`-Builder**: strukturierter Builder für Connection-Constraints analog zu `ConstraintRule`; für v1.0 nur JSON-Import oder einfaches Formular

## Bezüge

**Verwandte ADRs**: [ADR-012](./ADR-012-backend-stack.md) (Java 21 + Spring Boot 3), [ADR-017](./ADR-017-architektur-layer-strategie.md) (Fully Open → Rules als Kompensation)

**Business Objects**: [metamodel-configuration.md](../business-objects/metamodel-configuration.md) (`constraintRules`, `mandatoryConnectionConstraints`, `rulesEditMode`)

**Konzept**: §14 Erweiterbarkeit
