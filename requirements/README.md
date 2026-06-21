# Requirements

Use Cases, User Stories und nicht-funktionale Anforderungen für OEA.

## Inhalt

```
requirements/
├── README.md                    ← dieses Dokument
├── traceability.md              ← Trace-Matrix Use Case × Konzept × ADR
├── use-cases/                   ← zielorientierte Szenarien
│   ├── README.md
│   ├── UC-01-...md
│   └── ...
├── user-stories/                ← granulare Backlog-Items
│   ├── README.md
│   ├── US-001-...md
│   └── ...
└── nfr/                         ← nicht-funktionale Anforderungen
    ├── README.md
    ├── NFR-01-...md
    └── ...
```

## Templates

Vorlagen liegen in `../templates/`:
- `use-case.template.md`
- `user-story.template.md`
- `nfr.template.md`

## Vorgehen

1. **Stakeholder zuerst** (in `../business-analysis/stakeholders/`), nicht direkt mit Use Cases starten
2. **Use Cases** aus Stakeholder-Concerns und Pain Points ableiten
3. **NFRs** parallel zu Use Cases, mit messbaren Zielwerten
4. **Priorisierung** nach MoSCoW (must/should/could/wont)
5. **User Stories** erst, wenn Use Cases priorisiert sind – als Zerlegung der MUST-Use-Cases für den Walking Skeleton
6. **Traceability** regelmäßig prüfen mit `/trace-check`

## MoSCoW-Übersicht

<!-- Hier nach Priorisierung manuell aktuell halten oder per Skript generieren -->

| Priorität | Use Cases | NFRs |
|---|---|---|
| MUST (Walking Skeleton) | | |
| SHOULD (v1.0) | | |
| COULD (v1.x) | | |
| WONT (für diese Phase) | | |

## Slash-Commands

In `.claude/commands/`:
- `/new-usecase` – legt neuen Use Case an
- `/new-story` – legt neue User Story an
- `/new-nfr` – legt neue NFR an
- `/trace-check` – prüft Verknüpfungs-Konsistenz
