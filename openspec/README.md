# OpenSpec – Umsetzungs-Specs

OpenSpec ([openspec.dev](https://openspec.dev)) bildet die Brücke zwischen den Requirements-Artefakten und dem Code. Es ersetzt **nicht** die bestehenden Dokumente (UC, REQ, US, ADR), sondern referenziert sie.

## Struktur

```
openspec/
├── config.yaml            ← Projekt-Kontext (Stack, Konventionen) und Regeln je Artefakt
├── schemas/oea/           ← projektspezifisches Schema (Fork von spec-driven)
│   ├── schema.yaml
│   └── templates/         ← proposal.md, spec.md, design.md, tasks.md
├── specs/                 ← umgesetztes Systemverhalten je Capability (wächst mit jedem Change)
└── changes/               ← laufende Changes
    └── archive/           ← abgeschlossene Changes
```

## Ablauf je Change

Befehle in OpenCode (`.opencode/`):

| Schritt | Befehl | Ergebnis |
|---|---|---|
| Klären (optional) | `/opsx-explore` | – |
| Vorschlagen | `/opsx-propose "US-001 OIDC-Login"` | `changes/<name>/` mit proposal, specs, design, tasks |
| Umsetzen | `/opsx-apply` | Code, Tests, abgehakte tasks.md |
| Abschließen | `/opsx-archive` | Delta-Specs nach `specs/` übernommen |

## Konventionen

- Ein Change umfasst typischerweise eine User Story oder eine kleine Gruppe zusammengehöriger Stories eines Sprints.
- Change-Name: `<us-id>-<kurzname>`, z. B. `us-001-oidc-login`.
- Szenarien in den Specs werden aus den Akzeptanzkriterien der User Stories abgeleitet.
- Abweichungen von accepted ADRs erfordern zuerst eine neue ADR.
- Beim Archivieren: US-Status auf `realized` inkl. Implementation-Hash, `requirements/traceability.md` ergänzen.
