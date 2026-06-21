# Business Analysis

Stakeholder-Profile, Concerns und Pain Points. Grundlage für die Requirements-Phase.

## Inhalt

```
business-analysis/
├── README.md                    ← dieses Dokument
├── vision.md                    ← eine Vision in einem Satz, ergänzt um Kontext
├── stakeholders/                ← konkrete Personen oder Rollen
│   ├── SH-01-...md
│   └── ...
├── concerns/                    ← Stakeholder-übergreifende Concerns
│   └── ...
└── glossary.md                  ← projektspezifische Begriffsdefinitionen
```

## Vorgehen

### Schritt 1: Vision festhalten

Eine Aussage in einem Satz: Was soll das Tool für wen leisten? Beispiel:

> "Das Tool gibt einem Enterprise Architekten volle Kontrolle über Landschaft, Zielbilder und Governance über ein Git-basiertes Repository, ohne ihn an proprietäre Formate zu binden."

Diese Vision entscheidet später jeden Trade-off. Sie wird in `vision.md` festgehalten.

### Schritt 2: Stakeholder identifizieren

Drei bis fünf konkrete Personen (mit echten Namen aus deinem Umfeld, wenn möglich) als primäre Stakeholder. Pro Person ein Profil basierend auf `../templates/stakeholder.template.md`.

**Anti-Pattern vermeiden**: "Enterprise Architect mittlerer Erfahrung" ist nichtssagend. "Stefan, Solution Architect bei einem Schweizer Versicherer, frustriert von Sparx-EA-Lizenzkosten" ist Gold wert.

### Schritt 3: Pain Points sammeln

Pro Stakeholder die größten Probleme heute. Was kostet Zeit? Was funktioniert nicht? Was nervt? Pain Points sind wertvoller als Wünsche, weil sie konkrete Use Cases generieren.

### Schritt 4: Concerns ableiten

Stakeholder-übergreifende Sorgen, die das Tool adressieren muss. Beispiele:
- "Architektur-Dokumentation veraltet schnell"
- "EA-Tools sind teuer und proprietär"
- "Compliance-Nachweise sind manuell und fehleranfällig"

Concerns werden später in Use Cases übersetzt.

## Verbindung zu anderen Ordnern

- Stakeholder → Use Cases in `../requirements/use-cases/`
- Concerns → Anforderungen in `../requirements/`
- Vision → Leitprinzipien in `../concept/README.md`

## Slash-Commands

In `.claude/commands/` sollten verfügbar sein:
- `/new-stakeholder` – legt neues Stakeholder-Profil an
- `/list-stakeholders` – zeigt alle Stakeholder mit Use-Case-Bezug
