# Requirements (atomar, alle Typen)

Atomare, prüfbare Anforderungen aus den Use Cases abgeleitet. Pro Anforderung eine Datei nach Schema `REQ-NNN-kurzname.md`.

## Requirement-Typen

| Typ | Beispiel |
|---|---|
| `functional` | "System muss Application Component erstellen können" |
| `non-functional` | "Erstellung muss in <200ms abgeschlossen sein" |
| `constraint` | "Nur Repository-Owner dürfen Schema ändern" |
| `business-rule` | "Personenbezogene Daten brauchen Rechtsgrundlage (DSGVO Art. 6)" |
| `data` | "Application Component hat Pflichtfeld: Name, max 255 Zeichen" |
| `interface` | "REST-Endpoint POST /api/v1/applications muss OpenAPI-konform sein" |
| `compliance` | "Audit-Trail erfasst alle schreibenden Operationen (DORA)" |

## Verantwortlich

Der Requirements Engineer (`.claude/agents/requirements-engineer.md`) leitet aus Use Cases ab. Pflicht: jedes Requirement hat einen Use-Case-Bezug.

## Anti-Patterns

- **Compound Requirement**: ein REQ, das mehrere Anforderungen mischt → zerlegen
- **Vague Requirement**: "soll benutzerfreundlich sein" ohne Messbarkeit
- **Solution in Requirement**: "MUSS Redis verwenden" – das ist Lösung, nicht Anforderung
- **NFR ohne Zahl**: ohne Zielwert und Verifikationsmethode nicht akzeptiert

## Übersicht

| ID | Titel | Typ | Priorität | Status | Use Case |
|---|---|---|---|---|---|
| | | | | | |

## Slash-Command

`/new-requirement` legt ein neues Requirement aus dem Template an.

## NFR-Migration

Falls du das Legacy-`nfr/`-Verzeichnis nutzt: NFRs können mit `type: non-functional` ins `req/`-Verzeichnis migriert werden. Empfehlung: ab jetzt nur noch `req/`.
