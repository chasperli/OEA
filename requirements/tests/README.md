# Systemtestspezifikation (Gherkin / BDD)

**V-Modell-Einordnung:** Diese Feature Files sind die Systemtestspezifikation,
die parallel zur Requirements-Phase erstellt wurde. Sie definieren *was* getestet
wird — nicht *wie*. Die Step-Definitionen (Java-Code) werden von Qwen 2.5 / Devstral
während der Implementierungsphase generiert.

**Generiert:** 2026-06-30 aus `requirements/req/REQ-*.md` via
`scripts/generate_feature_files.py`

---

## Dateiübersicht

| Bereich | Dateien | REQs |
|---|---|---|
| Auth / Login | REQ-001 – REQ-012 | 12 |
| Bootstrapping | REQ-013 – REQ-019 | 7 |
| 2FA / Enrollment | REQ-020 – REQ-031 | 12 |
| Metamodell | REQ-032 – REQ-037, REQ-058–059 | 8 |
| Solution / Architektur | REQ-038 – REQ-042 | 5 |
| Katalog | REQ-043 – REQ-050, REQ-065, REQ-071, REQ-143 | 10 |
| Dashboard | REQ-051 – REQ-057 | 7 |
| Data Lineage | REQ-060 – REQ-065 | 6 |
| Dokumentation / Arc42 | REQ-066 – REQ-070, REQ-132–134 | 9 |
| NFRs (Performance) | REQ-071 – REQ-075, REQ-082–083, REQ-131 | 8 |
| BPMN | REQ-076 – REQ-081 | 6 |
| Plateau / Go-Live | REQ-084 – REQ-089 | 6 |
| Viewpoints | REQ-090 – REQ-093 | 4 |
| Navigationsbaum | REQ-094 – REQ-097 | 4 |
| Historisierung | REQ-098 – REQ-106 | 9 |
| Continuum / TRM | REQ-107 – REQ-120 | 14 |
| Canvas | REQ-121 – REQ-123, REQ-144–146 | 6 |
| Property-Sichtbarkeit | REQ-124 – REQ-128 | 5 |
| Sicherheit / NFR | REQ-129 – REQ-130 | 2 |
| Explorer / Navigation | REQ-138 – REQ-142 | 5 |
| Integration / API | REQ-147 – REQ-155 | 9 |
| UX / I18N | REQ-135, REQ-137, REQ-152 | 3 |
| **Gesamt** | **155 Feature Files** | |

---

## Tag-Schema

```
@functional         – Funktionale Anforderung
@non-functional     – Nicht-funktionale Anforderung
@performance        – Latenzmessung / Lasttest (immer mit @non-functional)
@compliance         – Compliance-Anforderung (DSGVO, WCAG)
@business-rule      – Geschäftsregel
@constraint         – Randbedingung

@must               – MoSCoW: MUST (Pflicht für v1.0)
@should             – MoSCoW: SHOULD (hohe Priorität)
@could              – MoSCoW: COULD (optional)

@UC-01 … @UC-21     – Zugehöriger Use Case
@AC1 … @ACN         – Einzelnes Akzeptanzkriterium

@skip               – Verworfene Anforderung (z.B. REQ-021)
```

### Nützliche Filterbeispiele (Cucumber-CLI / Gradle)

```bash
# Nur Walking-Skeleton-Tests (UC-06)
--tags "@UC-06"

# Alle Auth-Tests (Must)
--tags "@functional and @must and (@UC-01 or @UC-02 or @UC-03)"

# Nur Performance-Tests
--tags "@performance"

# Alles ausser @skip
--tags "not @skip"

# Einzelnes AC
--tags "@AC2"
```

---

## Ausführung mit Cucumber JVM

### 1. Abhängigkeiten (pom.xml / build.gradle)

```xml
<!-- pom.xml -->
<dependency>
  <groupId>io.cucumber</groupId>
  <artifactId>cucumber-java</artifactId>
  <version>7.15.0</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>io.cucumber</groupId>
  <artifactId>cucumber-spring</artifactId>
  <version>7.15.0</version>
  <scope>test</scope>
</dependency>
<dependency>
  <groupId>io.cucumber</groupId>
  <artifactId>cucumber-junit-platform-engine</artifactId>
  <version>7.15.0</version>
  <scope>test</scope>
</dependency>
```

### 2. Verzeichnisstruktur im Backend

```
api/src/test/
├── java/
│   └── de/oea/
│       └── steps/          ← Step-Definitionen (von Qwen generiert)
│           ├── AuthSteps.java
│           ├── BootstrappingSteps.java
│           └── ...
└── resources/
    └── features/           ← Symlink oder Kopie von requirements/tests/
        ├── REQ-001-oidc-login-session.feature
        └── ...
```

### 3. Step-Definitionen mit Qwen 2.5 / Devstral generieren

```bash
# Beispiel: OpenHands mit Devstral
# Prompt: "Generiere Cucumber Step-Definitionen in Java (Spring Boot, RestAssured)
#          für das Feature File requirements/tests/REQ-001-oidc-login-session.feature.
#          Verwende einen eingebetteten Test-OIDC-Provider (Keycloak Testcontainer)."
```

#### Headless Qwen2.5-14B-Server (lokal, Mac Mini M1 16GB)

Für die Generierung der Step-Definitionen kann Qwen 2.5 14B (4-Bit-Quantisierung)
lokal als headless LLM-Server betrieben werden — kein GUI nötig, Ansprache über
OpenAI-kompatible REST-API.

```bash
# 1. Ollama installieren
brew install ollama

# 2. Als Hintergrunddienst starten (läuft dauerhaft auf http://localhost:11434)
brew services start ollama

# 3. Modell ziehen (Q4_K_M = Standard-Sweet-Spot Qualität/Speicher, ca. 8.5–9 GB)
ollama pull qwen2.5:14b-instruct-q4_K_M

# 4. Test-Request (OpenAI-kompatibler Endpoint)
curl http://localhost:11434/v1/chat/completions -d '{
  "model": "qwen2.5:14b-instruct-q4_K_M",
  "messages": [{"role": "user", "content": "..."}]
}'
```

**Hinweise für 16GB unified memory (eng, aber machbar):**

- `num_ctx` klein halten (z.B. 4096) — größerer Context + 14B@Q4 sprengt 16GB
  und führt zu Swapping (sehr langsam)
- Erwartete Geschwindigkeit auf M1 (kein Pro/Max), 16GB: ca. 4–8 Tokens/s —
  ausreichend für Batch-Generierung über Nacht, nicht für interaktives Arbeiten
- Bei Speicherdruck: `qwen2.5:14b-instruct-q3_K_M` (kleiner, Qualitätsverlust)
  oder `qwen2.5:7b-instruct-q4_K_M` (deutlich komfortabler auf 16GB)
- `OLLAMA_HOST=0.0.0.0:11434` setzen, falls Zugriff von einem anderen Rechner
  im Netz (z.B. CI-Runner) nötig ist
- `brew services start ollama` reicht für reinen Headless-Betrieb (LaunchAgent,
  kein Login nötig, startet bei Boot)

### 4. Regressionstests ausführen

```bash
# Alle Tests
mvn test -Dcucumber.filter.tags="not @skip"

# Nur Walking-Skeleton
mvn test -Dcucumber.filter.tags="@UC-06 or @UC-01 or @UC-02"

# Nur Performance (benötigt Gatling-Plugin)
mvn test -Dcucumber.filter.tags="@performance"

# Schneller Smoke-Test (AC1 jedes Requirements)
mvn test -Dcucumber.filter.tags="@AC1 and @must"
```

---

## Bekannte Lücken (TODO-markiert)

4 Feature Files haben ACs, die nicht im Standard-Format
(Gegeben/Wenn/Dann) vorliegen und manuell verfeinert werden müssen:

| Feature File | Problem |
|---|---|
| REQ-070 | 1 AC ohne Struktur (Autocomplete-Variante) |
| REQ-079 | 6 von 7 ACs in abweichendem Format (I18N-Prüfung) |
| REQ-080 | 4 von 7 ACs in abweichendem Format (Rechtschreibung) |
| REQ-081 | 8 ACs ohne Standard-Struktur (BPMN-Lineage) |

---

## Feature Files regenerieren

```bash
cd /path/to/oea
python3 scripts/generate_feature_files.py
```

Das Skript ist idempotent — es überschreibt bestehende Feature Files.
Manuelle Änderungen an den `.feature`-Dateien gehen beim Regenerieren verloren;
daher sollten Korrekturen immer im Quelldokument (`requirements/req/REQ-*.md`)
vorgenommen werden.
