---
id: SH-08
name: Anna – Business Analyst
version: 0.1.0
status: draft
created: 2026-06-26
---

# Stakeholder: Anna – Business Analyst im Mittelstand

## Rolle und Verantwortung

Anna ist Senior Business Analyst in einem mittelständischen Fertigungsunternehmen. Sie modelliert Geschäftsprozesse, erhebt Anforderungen und ist die Schnittstelle zwischen Fachabteilungen und IT. Ihre Diagramme bilden die Grundlage für Automatisierungs- und Digitalisierungsprojekte.

- **Erfahrungsniveau**: sehr hoch in BPMN 2.0 und EPK; gut in ArchiMate-Basisbegriffen; kein UML-Spezialist
- **Toolerfahrung**: ARIS, Signavio (SAP), Microsoft Visio; vereinzelt Camunda Modeler
- **Arbeitsweise**: prozesszentriert, fachbereichsnah; modelliert Ist-Prozesse (AS-IS) und Soll-Prozesse (TO-BE) in Sprints; braucht schnelle, intuitive Werkzeuge
- **Kontext**: Arbeitet oft ohne direkten IT-Zugang; Ergebnisse müssen für Fachanwender lesbar sein

## Ziele

1. Geschäftsprozesse in BPMN 2.0 direkt im EA-Tool modellieren — kein separates Prozess-Tool mehr
2. Rollen und Organisationseinheiten den Lanes und Pools zuordnen — Verantwortlichkeiten auf einen Blick
3. Personen konkret einer Aufgabe (Task) zuweisen für Prozess-Ownership
4. Prozessmodelle mit dem EA-Modell verknüpfen: welche Applikation unterstützt diesen Task?
5. Prozesse versionieren und als Soll-Prozess mit EA-Solutions verknüpfen

## Concerns

| Concern | Typ | Wichtigkeit |
|---|---|---|
| BPMN-Pool/Lane-Struktur auf Canvas | functional | critical |
| Rollen- und OrgUnit-Zuordnung zu Lanes | functional | critical |
| Personen-Zuordnung zu Tasks | functional | high |
| Verknüpfung Task → Applikation (UC-05) | functional | high |
| Metamodell-Konfigurierbarkeit der Prozesstypen | functional | high |
| Lesbarkeit für Fachanwender (kein EA-Jargon) | usability | high |
| Export als PDF oder BPMN 2.0 XML | functional | medium |
| Import aus Camunda/Signavio | functional | low |

## Beteiligung

| UC | Rolle |
|---|---|
| [UC-10](../../requirements/use-cases/UC-10-geschaeftsprozesse-modellieren.md) | Primärer Akteur |
| [UC-04](../../requirements/use-cases/UC-04-metamodell-konfigurieren.md) | Konsultiert (Prozesstypen konfigurieren) |
| [UC-05](../../requirements/use-cases/UC-05-architektur-vision-beschreiben.md) | Konsultiert (Task → Applikation verknüpfen) |

## Frustrationen mit bisherigen Tools

- ARIS/Signavio: Mächtig, aber weit vom EA-Modell entfernt; doppelte Pflege von Applikations- und Prozessmodellen
- Visio: Keine Semantik; nur Grafik; keine Rollen-/Personen-Verlinkung mit lebendem Verzeichnis
- Camunda Modeler: Gut für technische BPMN, aber keine EA-Perspektive; keine OrgUnit-Zuordnung

## Konzept-Bezug

- [§9 Prozess-Architektur](../../concept/20-entities/09-prozess-architektur.md)
- [§6 Kern-Entitätstypen](../../concept/20-entities/06-kern-entitaetstypen.md)
