# Maintainers

Diese Datei listet die Maintainer und Verantwortungsbereiche für OEA.

## Konzept

Maintainer sind Personen mit Schreibzugriff auf das Hauptrepository und Review-Autorität über Pull Requests. Sie verpflichten sich, das Projekt im Sinne der [Vision](business-analysis/vision.md) und der [Leitprinzipien](concept/README.md) weiterzuentwickeln.

## Aktuelle Maintainer

| Bereich | Name | Kontakt |
|---|---|---|
| Lead Maintainer / PO | TBD | TBD |
| Konzept und Dokumentation | TBD | TBD |
| Backend | TBD | TBD |
| Frontend | TBD | TBD |
| Sicherheit | TBD | TBD |
| Operations / Deployment | TBD | TBD |

<!-- 
Format pro Eintrag:
| Bereich | Vollständiger Name (GitHub/Gitea-Handle) | E-Mail oder Kontaktweg |
-->

## Maintainer werden

Wir freuen uns über neue Maintainer. Der Weg:

1. **Substanzieller Beitrag** über mindestens 6 Monate (Code, Doku, Konzept, Reviews)
2. **Nomination** durch einen aktiven Maintainer im internen Maintainer-Kanal
3. **Konsens** unter den aktiven Maintainern (lazy consensus, mindestens 75% Zustimmung)
4. **Aufnahme** in diese Datei via PR
5. **Schreibzugriff** im Repository

Erwartete Verpflichtungen:

- Mindestens monatliche aktive Mitwirkung
- Verantwortung für Reviews im Fachbereich
- Einhaltung des [Code of Conduct](CODE_OF_CONDUCT.md)
- Kommunikation mit der Community

## Maintainer-Status verlieren

Status wird verloren durch:

- 6+ Monate Inaktivität ohne Ankündigung
- Schwerwiegende Verstöße gegen den Code of Conduct
- Eigene Ankündigung des Rücktritts

Inaktive Maintainer werden in eine "Emeritus"-Sektion verschoben, behalten aber keine Schreibrechte.

## Entscheidungs-Findung

OEA folgt einem **Lazy Consensus Model**:

- Kleine Änderungen (Doku, Bugfixes): ein Maintainer-Review reicht
- Mittlere Änderungen (Features, neue Abhängigkeiten): zwei Reviews, 7 Tage Vorlauf für Einwände
- Große Änderungen (Architektur, Tech-Stack, Lizenz): ADR erforderlich, Konsens unter aktiven Maintainern, 14 Tage Vorlauf

Bei Patt: Lead Maintainer / PO entscheidet.

## Verantwortungsbereiche

### Konzept und Dokumentation

- `concept/` und alle Markdown-Dokumente im Repo
- Sicherstellen, dass Konzeptpapier mit Code synchron bleibt
- CHANGELOG-Pflege

### Backend

- `backend/` Codebasis
- API-Specs in `api/openapi/`
- Persistenz-Schicht und Migrations

### Frontend

- `frontend/` Codebasis
- UI-Komponenten und Design-System-Integration
- A11y-Compliance

### Sicherheit

- Security-Reviews
- Abarbeitung von Security-Meldungen (siehe [SECURITY.md](SECURITY.md))
- SBOM und Dependency-Updates

### Operations / Deployment

- Container-Images und Release-Pipeline
- Deployment-Dokumentation
- Backup- und Recovery-Konzepte

## Emeritus (Inaktive Maintainer)

<!-- Aufgenommen, wenn Maintainer den Status zurückgeben oder verlieren. -->

(noch keine)

## Kontakt

Für Fragen zur Maintainer-Struktur: `maintainers@oea.org` (TBD)

Für inhaltliche Diskussionen: GitHub/Gitea Discussions oder Issue-Tracker.

Für Sicherheits-Meldungen: siehe [SECURITY.md](SECURITY.md).
