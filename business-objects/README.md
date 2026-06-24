# Business Objects

Strukturiert modellierte fachliche Domäne von OEA. Pro Business Object eine Datei mit standardisiertem Frontmatter, Attributen, Beziehungen, Lifecycle und Business Rules.

## Struktur

```
business-objects/
├── README.md             ← dieses Dokument, Übersicht und Capability Map
├── <object-id>.md        ← eine Datei pro Business Object (english-kebab-case)
├── capabilities/
│   └── <capability>.md   ← Business Capabilities mit Beziehungen
└── rules/
    └── BR-NN-rule.md     ← objekt-übergreifende Business Rules
```

## Verantwortlich

Der Business Engineer (siehe `.claude/agents/business-engineer.md`) modelliert hier. Arbeitet **vor** dem Use-Case-Engineering nach dem Domain-Model-first-Ansatz.

## Vorgehen

1. Mit PO klären: welche Geschäftsbegriffe sind im Scope?
2. Erste Business-Object-Skizzen erstellen (eine Datei pro Objekt) mit `templates/business-object.template.md`
3. Beziehungen zwischen Objekten klären
4. PO-Review einholen
5. Iterieren, dann Übergabe an Use-Case-Engineering

## Übersicht der modellierten Business Objects

| ID | Name (DE) | Name (EN) | Status | Version |
|---|---|---|---|---|
| [person](./person.md) | Person | Person | draft | 0.1.0 |
| [role](./role.md) | Rolle | Role | draft | 0.1.0 |
| [system-admin-account](./system-admin-account.md) | System-Admin-Account | System Admin Account | draft | 0.1.0 |

## Capability Map

<!-- Übersichts-Diagramm der Business Capabilities und ihrer Beziehungen. Initial leer. -->

## Slash-Command

`/new-business-object` legt ein neues Business Object aus dem Template an.
