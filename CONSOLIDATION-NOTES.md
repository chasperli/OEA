# Konsolidierungs-Notizen

Dieses Dokument fasst zusammen, was im konsolidierten Tar-Archiv enthalten ist und welche manuellen Schritte noch nötig sind. **Nach erfolgreicher Übernahme in dein Arbeits-Repo kann diese Datei gelöscht werden.**

## Was im Archiv ist

| Bereich | Inhalt |
|---|---|
| Konzept | Vollständig (v0.15, 24 Kapitel + Changelog), 163 Links validiert |
| Vision | Ausformuliert in `business-analysis/vision.md` |
| Stakeholder | 7 Personas (Franz, Lukas, Kurt, Michael, CIO, Max, Sabine) |
| Business Objects | Ordner-Struktur angelegt, README mit Vorgehen, leer für Inhalt |
| Requirements | UC-, REQ-, US-, NFR-Ordner mit README, leer für Inhalt |
| ADRs | 5 Gruppe-A-Stubs (ADR-001 bis ADR-005), Template |
| Templates | 6 Vorlagen (Stakeholder, Business Object, Use Case, Requirement, User Story, NFR) |
| Agents | 7 Agent-Definitionen in `.claude/agents/` mit Workflow-README |
| Slash-Commands | 9 Befehle in `.claude/commands/` |
| Docs | 3 Onboarding-Dokumente (Workflow-Beispiel, Quick Reference, Anti-Patterns) |
| OSS-Standards | LICENSE, NOTICE, CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, MAINTAINERS, README |
| Config | .editorconfig, .gitattributes, .markdownlint.json, .commitlintrc.json, .pre-commit-config.yaml |
| CI | 3 Workflow-Dateien (docs/backend/frontend), Issue- und PR-Templates |
| Skripte | `install-concept.sh`, `scripts/validate_links.py` |

## Manuelle Schritte vor Go-Live

### Pflicht
- [ ] E-Mail-Adressen einrichten und Platzhalter ersetzen:
  - `security@oea.org` (SECURITY.md)
  - `conduct@oea.org` (CODE_OF_CONDUCT.md)
  - `maintainers@oea.org` (MAINTAINERS.md)
- [ ] Domain reservieren: `oea.org`, `oea.dev` und/oder `oea.ch`
- [ ] Git-Remote konfigurieren (GitHub-Org, Gitea-Instanz oder selbst-gehostet)
- [ ] MAINTAINERS.md: Lead-Maintainer-Zeile mit deinem Namen füllen
- [ ] Repository-URL in `.github/ISSUE_TEMPLATE/config.yml` aktualisieren

### Empfohlen vor erstem Feature
- [ ] CLAUDE.md durchlesen und an dein Workflow-Verständnis anpassen
- [ ] `docs/quick-reference.md` einmal überfliegen
- [ ] Erste Frage in Solution Architect: "Was ist der minimalste Walking-Skeleton-Use-Case?"

### Optional
- [ ] Logo gestalten (für ersten Release nicht zwingend)
- [ ] Trademark-Recherche für "OEA" / "Open Enterprise Architecture" in DE, EU, US (Konflikte unwahrscheinlich, aber gute Praxis)
- [ ] Penpot-Workspace einrichten (für UI Designer)

## Was bewusst leer ist

Diese Ordner haben README mit Vorgehen, sind aber inhaltlich leer:

- `business-objects/*.md` – Du modellierst sie selbst (oder mit Business Engineer)
- `requirements/use-cases/*.md` – Du formulierst sie selbst (oder mit Solution Architect)
- `requirements/req/*.md` – Requirements Engineer leitet sie aus UCs ab
- `requirements/user-stories/*.md` – Bei Implementierungsplanung
- `requirements/nfr/*.md` – Legacy, ggf. zu req/ migrieren
- `business-analysis/concerns/*.md` – Cross-Persona-Concerns nach Bedarf

Das ist kein Mangel – das ist Absicht. Die echten Inhalte kommen aus deinem Kopf, nicht aus einem Template.

## Was sich gegenüber den Einzeldateien geändert hat

Konsolidiert habe ich:

- Stakeholder-README erweitert um Übersichtstabelle aller 7 Personas mit Beobachtungen
- Templates-README erweitert um die zwei neuen Templates (Business Object, Requirement)
- Agents-README erweitert um Business Engineer und Requirements Engineer
- Workflow-Diagramm in Agents-README erweitert
- CLAUDE.md aktualisiert: OEA als Projektname, neue Ordner, neue Slash-Commands, neue Agents, Apache 2.0 statt TBD
- Vision in `business-analysis/vision.md` ausformuliert (war vorher Platzhalter)
- 2 neue Slash-Commands: `/new-business-object`, `/new-requirement`
- `business-objects/`, `requirements/req/` mit README angelegt
- `docs/` mit README angelegt
- `.github/` komplett mit Issue-Templates, PR-Template, CI-Workflows
- `MIGRATION-NOTES.md` für Namens-Entscheidung und mögliche zukünftige Anpassungen

## Erste Schritte nach Entpacken

```bash
tar xzf oea-complete.tar.gz
cd oea
git init
git add .
git commit -m "chore: initial repository skeleton with concept v0.15"

# Erste Checks
python3 scripts/validate_links.py
# Sollte: "Geprüft: 163 relative Links in concept/" und "✓ Alle Links gültig"

# Pre-commit installieren (optional, aber empfohlen)
pip install pre-commit
pre-commit install
```

Dann in Claude Code öffnen und mit dem Business Engineer das erste Business Object modellieren:

```
Bitte agiere als Business Engineer (.claude/agents/business-engineer.md) 
und modelliere "Application Component" als erstes Business Object.
Nutze templates/business-object.template.md.
```

Viel Erfolg.
