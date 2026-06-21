# OEA

**Open Enterprise Architecture** – Open-Source-Werkzeug für versionierte EA-Disziplin

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange.svg)](#status)
[![Conventional Commits](https://img.shields.io/badge/conventional%20commits-1.0.0-yellow.svg)](https://www.conventionalcommits.org/)

---

OEA macht die Architektur einer Organisation zur gemeinsamen, versionierten Wahrheit – für Architekten als Pflegewerkzeug, für Fachbereiche als Inventar, für Compliance als Asset-Quelle, für automatisierte Pipelines als prüfbares Artefakt.

## Vision

> Enterprise Architecture als versionierte, modulare und werkzeugoffene Open-Source-Disziplin – konzeptionell so rigoros wie nötig, pragmatisch so niederschwellig wie möglich.

Drei bewusste Designprinzipien prägen OEA:

- **Offene, textbasierte Repräsentation statt proprietärer Formate**, weil Architektur-Wissen den Hersteller überleben muss
- **Progressive Disclosure statt erzwungener Modellierungs-Tiefe**, weil unterschiedliche Rollen unterschiedliche Sichten brauchen
- **Modulare, schnittstellen-orientierte Architektur statt Monolith**, weil das Tool nicht alles selbst können muss

Mehr Details: [business-analysis/vision.md](business-analysis/vision.md)

## Status

**Pre-Alpha** – das Projekt ist in der konzeptionellen Phase. Konzeptpapier ist auf v0.15 reif, Implementierung beginnt.

- Konzept: vollständig (24 Kapitel + Changelog), siehe [`concept/`](concept/)
- Requirements: in Aufbau
- Code: noch nicht begonnen
- v1.0-Release: TBD

OEA ist **noch nicht produktiv einsetzbar**. Wenn du mitwirken willst: [CONTRIBUTING.md](CONTRIBUTING.md).

## Schnellüberblick

| Was | Wo |
|---|---|
| Konzeptpapier | [`concept/README.md`](concept/README.md) |
| Vision und Stakeholder | [`business-analysis/`](business-analysis/) |
| Anforderungen | [`requirements/`](requirements/) |
| Architekturentscheidungen | [`adrs/`](adrs/) |
| Business Objects | [`business-objects/`](business-objects/) |
| Templates | [`templates/`](templates/) |
| Workflow-Beispiel | [`docs/workflow-example.md`](docs/workflow-example.md) |
| Quick Reference | [`docs/quick-reference.md`](docs/quick-reference.md) |
| Anti-Patterns | [`docs/anti-patterns.md`](docs/anti-patterns.md) |
| Beitragen | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Verhaltenskodex | [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) |
| Sicherheit | [SECURITY.md](SECURITY.md) |
| Maintainer | [MAINTAINERS.md](MAINTAINERS.md) |

## Wer profitiert von OEA

Sieben Persona-Profile sind ausgearbeitet (siehe [`business-analysis/stakeholders/`](business-analysis/stakeholders/)):

- **Franz** – Junior Domain Architekt im Konzern, Greenfield
- **Sabine** – Senior Business Engineer im Globalkonzern
- **Lukas** – Senior Data Architekt im Mittelstand (Avolution heute)
- **Kurt** – Lead Enterprise Architekt im KMU (Wiki heute)
- **Michael** – Solution Architekt im Mittelstand (Sparx heute)
- **Max** – Operator im regulierten KMU
- **CIO** – Konzern mit Multi-Tool-Stack

## Technologie-Entscheidungen

Stand der Stack-Entscheidungen:

| Bereich | Status | Anforderung |
|---|---|---|
| Backend | offen | Typsicher (Python+Pydantic / Rust / Go / TypeScript / Kotlin) |
| Frontend | offen | TypeScript Pflicht, Framework offen |
| Persistenz | offen | Graph + Analytics, austauschbar |
| API | entschieden | OpenAPI 3.1 als Spec-Standard |
| Lizenz | entschieden | Apache 2.0 |

Architekturentscheidungen werden als ADR dokumentiert: [`adrs/`](adrs/).

## Mitwirken

Wir freuen uns über Beiträge jeder Größe:

- **Bug Reports**: Issue mit Template [Bug Report](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature Requests**: Issue mit Template [Feature Request](.github/ISSUE_TEMPLATE/feature_request.md)
- **Code, Doku, Konzept**: Pull Request, siehe [CONTRIBUTING.md](CONTRIBUTING.md)
- **Sicherheitslücken**: Bitte **NICHT öffentlich**, siehe [SECURITY.md](SECURITY.md)

Erste Schritte: Suche nach Issues mit Label `good first issue`.

## Wenn du OEA evaluierst

Drei realistische Fragen vor einem Test:

1. **Bist du in einer regulierten Branche?** Dann lies [SECURITY.md](SECURITY.md) und die [GRC/DSGVO/ISMS-Integration](concept/60-integrations/20-grc-dsgvo-isms-integration.md). Audit-Trail und Compliance sind Pflicht-Features, aber v1.0 wird sie erstmalig vollständig liefern.
2. **Migrierst du aus Sparx, Avolution, LeanIX?** Migration-Adapter sind in Planung, aber pre-v1.0 noch nicht produktiv. Lies die [Persona-Profile](business-analysis/stakeholders/) für realistische Erwartungen.
3. **Brauchst du Vendor-Support?** OEA ist OSS ohne kommerzielle Anbietersicherung. Community-Support ist da, SLAs nicht.

## Lizenz

Apache License 2.0 – siehe [LICENSE](LICENSE) und [NOTICE](NOTICE).

## Quellenverzeichnis

OEA baut auf etablierten Standards auf:
- TOGAF Content Metamodel (The Open Group)
- ArchiMate (The Open Group)
- BPMN 2.0 (OMG)
- arc42 (Gernot Starke, Peter Hruschka)
- ISO 42010 (Architecture Description)
- ISO 27005 (Risk Management)
- BIAN (für Business Object Modeling)

## Kontakt

- **Konzeptionelle Fragen**: GitHub/Gitea Discussions
- **Sicherheits-Meldungen**: siehe [SECURITY.md](SECURITY.md)
- **Maintainer**: siehe [MAINTAINERS.md](MAINTAINERS.md)
- **Verhaltenskodex-Verstöße**: `conduct@oea.org` (TBD)
