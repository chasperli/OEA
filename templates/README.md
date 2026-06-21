# Requirements-Engineering-Templates

Sieben Markdown-Templates für die Requirements-Phase: **Stakeholder**, **Business Object**, **Use Cases**, **Requirements** (alle Typen), **User Stories**, **NFRs** und ADR-Template (separat in `adrs/`). Sie bauen aufeinander auf und referenzieren das Konzeptpapier sowie das ADR-Verzeichnis.

## Übersicht

| Template | Wofür | Wann | Dateiname-Schema |
|---|---|---|---|
| `stakeholder.template.md` | Konkrete Personen/Rollen mit Concerns | Zuerst – ohne Stakeholder keine Priorisierung | `SH-NN-kurzname.md` |
| `business-object.template.md` | Fachliche Domain-Modellierung mit Attributen, Beziehungen, Lifecycle | **Vor** Use Cases – Domain Model first | `<english-kebab-case>.md` |
| `use-case.template.md` | Zielorientierte Nutzer-Szenarien mit Pre/Post, Flows, Datenfluss | Nach Stakeholdern und Business Objects | `UC-NN-kurzname.md` |
| `requirement.template.md` | Atomare Requirements aller Typen (functional, NFR, constraint, business-rule, data, interface, compliance) | **Nach** Use Cases | `REQ-NNN-kurzname.md` |
| `user-story.template.md` | Granulare Backlog-Items, in 1-3 Tagen umsetzbar | Bei Implementierungsplanung | `US-NNN-kurzname.md` |
| `nfr.template.md` | Nicht-funktionale Anforderungen mit Zielwerten (Legacy – kann durch `requirement.template.md` mit `type: non-functional` ersetzt werden) | Parallel zu Use Cases | `NFR-NN-kurzname.md` |

ADR-Template liegt separat in `adrs/adr.template.md` (näher bei den ADR-Dokumenten).

## Wie die Templates zusammenhängen

```
Stakeholder (SH)
    ↓ hat Concern → adressiert durch
Use Case (UC)
    ↓ wird zerlegt in
User Stories (US)
    ↓ implementiert durch
Code + Tests

NFR
    ↓ gilt für
Use Cases und Stories
    ↓ wird verifiziert in
Tests / Monitoring
```

**Wichtigste Cross-References**:

- Jede User Story → Use Case → Stakeholder (Trace)
- Jeder Use Case → mindestens ein Konzept-Kapitel
- Jede NFR → mindestens ein Stakeholder
- Major-Architekturentscheidungen → ADR

## Empfohlene Repo-Struktur

```
requirements/
├── README.md                   ← Einstieg, MoSCoW-Übersicht, Trace-Matrix
├── glossary.md                 ← projektspezifische Begriffsdefinitionen
├── stakeholders/
│   ├── SH-01-stefan-solution-architect.md
│   ├── SH-02-anna-enterprise-architect.md
│   └── ...
├── use-cases/
│   ├── UC-01-application-erfassen.md
│   ├── UC-02-bebauungsplan-exportieren.md
│   └── ...
├── user-stories/
│   ├── US-001-entity-anlegen-cli.md
│   ├── US-002-validation-error-anzeigen.md
│   └── ...
├── nfr/
│   ├── NFR-01-response-time-cli.md
│   ├── NFR-02-repository-skalierung.md
│   └── ...
└── traceability.md             ← Trace-Matrix Use Case × Konzept × ADR
```

## Slash-Commands für Claude Code

Vorschlag für deine `.claude/commands/`:

### `/new-stakeholder`

```markdown
Erstelle eine neue Stakeholder-Datei in requirements/stakeholders/ basierend auf
templates/stakeholder.template.md.

Vorgehen:
1. Frage nach Name/Rolle für ID-Generierung (SH-NN-kurzname).
2. Nächste freie SH-NN-Nummer ermitteln.
3. Template kopieren, Platzhalter ersetzen.
4. In requirements/README.md die Stakeholder-Liste aktualisieren.
```

### `/new-usecase`

```markdown
Erstelle einen neuen Use Case in requirements/use-cases/ basierend auf
templates/use-case.template.md.

Vorgehen:
1. Frage nach Titel und primärem Stakeholder.
2. Validiere, dass der Stakeholder existiert (requirements/stakeholders/).
3. Nächste freie UC-NN-Nummer ermitteln.
4. Template kopieren, Platzhalter ersetzen.
5. Konzept-Bezug: Frage, welche Kapitel betroffen sind, oder schlage basierend auf
   Titel/Beschreibung aus concept/ Kapitel vor.
6. In requirements/README.md die Use-Case-Liste aktualisieren.
7. In stakeholders/SH-NN.md den Use-Case-Bezug nachtragen.
```

### `/new-story`

```markdown
Erstelle eine neue User Story in requirements/user-stories/ basierend auf
templates/user-story.template.md.

Vorgehen:
1. Frage nach Titel und übergeordnetem Use Case.
2. Validiere, dass der Use Case existiert.
3. Nächste freie US-NN-Nummer ermitteln (3-stellig, weil mehr Stories als Use Cases).
4. Template kopieren, Platzhalter ersetzen.
5. Im Use Case unter "Realisierende Bestandteile" Story nachtragen.
```

### `/new-nfr`

```markdown
Erstelle eine neue NFR in requirements/nfr/ basierend auf templates/nfr.template.md.

Vorgehen:
1. Frage nach Titel und Kategorie.
2. Nächste freie NFR-NN-Nummer ermitteln.
3. Erinnere: NFRs ohne messbare Zielwerte sind Wunschdenken – Zielwerttabelle ausfüllen.
4. Template kopieren, Platzhalter ersetzen.
```

### `/trace-check`

```markdown
Prüfe das requirements/-Verzeichnis auf Vollständigkeit:

1. Jeder Use Case hat einen Stakeholder-Bezug? (Pflicht)
2. Jeder Use Case hat mindestens einen Konzept-Bezug? (Pflicht)
3. Jede User Story hat einen Use-Case-Bezug? (Pflicht)
4. Jede NFR hat einen messbaren Zielwert? (Pflicht)
5. Jeder Stakeholder hat mindestens einen Use Case? (Sonst: warum modelliert?)
6. Generiere/aktualisiere traceability.md mit Matrix Use Case × Konzept × ADR.
```

## Praxis-Hinweise

### Beim Stakeholder-Schreiben

- **Echte Namen aus deinem Umfeld** schlagen abstrakte Personas. Wenn du niemanden namentlich nennst, ist die Persona oft zu generisch.
- Beginne mit 3-5 Personas, nicht 15. Du kannst später erweitern.
- Pain Points sind wertvoller als Wünsche. "Sparx EA ist zu teuer" ist klarer als "möchte ein günstiges Tool".

### Beim Use-Case-Schreiben

- **Zielorientiert, nicht funktional**: "Bebauungsplan exportieren" ist gut, "ApplicationComponent CRUD" ist schlecht.
- Hauptablauf in maximal 7-10 Schritten. Wenn länger, ist es ein Prozess, kein Use Case.
- Akzeptanzkriterien müssen prüfbar sein. "Soll schnell sein" ist nicht prüfbar. "Antwortet in <2s" ist prüfbar.

### Beim NFR-Schreiben

- **Immer messbar**, sonst ist es keine NFR.
- Zielwerte beziehen sich auf bestimmten Scope (z.B. "bei 1000 Entitäten"). Ohne Scope ist die Zahl wertlos.
- Trade-offs explizit dokumentieren – NFRs konkurrieren oft miteinander.

### Beim User-Story-Schreiben

- INVEST-Kriterien beachten (Independent, Negotiable, Valuable, Estimable, Small, Testable)
- Story Points geschätzt im Verhältnis zu anderen Stories, nicht in Stunden
- Akzeptanzkriterien als Given-When-Then für Klarheit

## Anti-Patterns

**1. Use Case = Datenmodell-Auflistung**
Schlecht: "Use Case: Application Component mit Name, Beschreibung, Owner erfassen"
Gut: "Als Solution Architect möchte ich eine neue Anwendung erfassen, damit sie in der Landschaftssicht erscheint"

**2. NFR ohne Zahl**
Schlecht: "Das Tool soll performant sein"
Gut: "Die CLI-Validierung eines Repos mit 1000 Entitäten beendet in <30s (p95)"

**3. Stakeholder ohne Concerns**
Schlecht: "Stakeholder: Enterprise Architect"
Gut: "Stakeholder: Anna, EA bei Bank X, frustriert von 6 Monaten Sparx-EA-Modellierung ohne sichtbaren Mehrwert, will Git-basierten Workflow"

**4. User Story zu groß**
Schlecht: "Als Architekt möchte ich das komplette OEA nutzen"
Gut: "Als Architekt möchte ich eine Application via CLI anlegen, damit sie in nachfolgenden Tests verfügbar ist"

## Empfohlene Startsequenz

1. **Tag 1**: README schreiben, Ordner anlegen, Templates kopieren
2. **Tag 2-3**: 3-5 Stakeholder-Profile (echte Personen, konkrete Pain Points)
3. **Tag 4-5**: 5-10 Use Cases zu den wichtigsten Pain Points
4. **Tag 6**: NFRs aus den Use Cases ableiten, Zielwerte konkretisieren
5. **Tag 7**: Priorisierung (MoSCoW über alle UC und NFR)
6. **Tag 8**: traceability.md generieren, Lücken finden
7. **Tag 9-10**: User Stories für MUST-Use-Cases zerlegen (Walking-Skeleton-Backlog)
8. **Tag 11-12**: Erste ADRs zu blockierenden Entscheidungen (siehe `concept/90-backlog/`)

Danach kann mit der Implementierung des Walking Skeletons gestartet werden.
