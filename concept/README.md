# Meta-Metamodell für ein EA- und Solution-Architecture-Tool

**Status:** Entwurf v0.16 – siehe [CHANGELOG.md](CHANGELOG.md) für die Versionshistorie
**Scope:** Open-Source OEA, TOGAF-konform (inkl. Enterprise Continuum und TRM), Arc42-tauglich, BPMN 2.0 als optionales Zusatzmodul, erweiterbares Metamodell mit kontrollierter Schema-Evolution, pipelinefähige Diagrammgenerierung, API-zentrierte Architektur mit starker Auswertbarkeit (Graph-Traversierung und Repository-weite Aggregationen), ITSM/CMDB-, PPM-, GRC-/DSGVO- und ISMS-Integration als First-Class-Konzepte

## Leitprinzipien

- **Standards als Konfiguration, nicht als Code**: TOGAF Content Metamodel, Arc42, BPMN 2.0, ArchiMate werden als Schemata auf einem generischen Meta-Metamodell abgebildet.
- **Git-friendly, pipelinefähig**: Jede Entität ist als menschenlesbare Datei repräsentierbar, diff-bar, PR-reviewbar.
- **Zeit als First-Class-Citizen**: Ist-Zustand, Zielbilder und Bebauungspläne sind keine Sonderfälle, sondern Grundkonzepte des Metamodells.
- **Sichten statt Silos**: Domains, Layer und Bebauungspläne sind Filter über das Repository, nicht eigene Datenhaltungen.
- **ITSM-Koexistenz, nicht -Konkurrenz**: Das EA-Repository ergänzt CMDB und Service Catalog durch Planungs- und Strategie-Sicht. Mastership wird auf Property-Ebene definiert, nicht auf Entitäts-Ebene.
- **EA als Asset-Stammdatenlieferant**: Für GRC, DSGVO und ISMS liefert das EA die strukturelle Basis (Assets, Klassifizierungen, Flows). Risikobewertungen und Evidence bleiben in den spezialisierten Tools.
- **API-first**: Alle Funktionalität ist über eine stabile, versionierte API zugänglich. UI, Renderer, Integrationen, Zusatzmodule – alle nutzen dieselbe API. Keine privilegierten Zugriffswege.
- **Modulare Architektur**: Der Kern ist klein und unabhängig. Fachliche Ergänzungen (BPMN, ITSM-Konnektoren, PPM-Konnektoren, GRC-/ISMS-Adapter, Renderer) sind Module, die über die API andocken.
- **Persistenz-Neutralität**: Die API definiert Query-Fähigkeiten; die Implementierung darunter ist austauschbar. Ermöglicht Migration zu anderen Datenbanken ohne API-Breaking-Change.
- **Property-Level-Autorisierung**: Nicht nur Entitäten, sondern einzelne Properties unterliegen Zugriffskontrolle. Personenbezogene Daten und Schutzbedarfe sind sensibel und dürfen nicht für alle Nutzer sichtbar sein.
- **Vollständiger Audit-Trail**: Jede Änderung an Repository-Daten wird unveränderbar protokolliert, exportierbar und zugriffsgeschützt. Compliance-Anforderung, nicht Zusatzfeature.
- **Progressive Disclosure statt erzwungener Tiefe**: Konzeptionelle Korrektheit (Logical/Physical-Trennung, Schichten-Modell) wird unterstützt, aber nicht erzwungen. Das Tool akzeptiert pragmatische Einsteiger-Modelle (z.B. nur Physical Apps ohne Logical-Schicht) und erlaubt schrittweises Vertiefen. Die intuitive "Inventar-Sicht" ist Default, die strukturierte Sicht ist verfügbar für die, die sie brauchen.

## Navigation

Das Konzeptpapier ist thematisch in Unterordner gegliedert. Eine vollständige, geordnete Übersicht findet sich im [INDEX.md](INDEX.md).

### Schnellzugriff nach Thema

- **Einstieg**: [Einordnung und Zielsetzung](00-overview/01-einordnung.md), [Meta-Metamodell](00-overview/02-meta-metamodell.md)
- **Grundlagen**: [Framework-Verhältnis](10-foundations/03-framework-verhaeltnis.md), [Enterprise Continuum & TRM](10-foundations/04-enterprise-continuum-trm.md), [Prinzipien, Standards & ADRs](10-foundations/05-prinzipien-standards-adrs.md)
- **Entitäten**: [Kern](20-entities/06-kern-entitaetstypen.md), [Motivation](20-entities/07-motivation-stakeholder-ziele.md), [Organisation](20-entities/08-organisation-rollen-personen.md), [Prozesse](20-entities/09-prozess-architektur.md), [Cross-Cutting](20-entities/10-cross-cutting.md)
- **Dynamik**: [Temporales Modell](30-dynamics/11-temporales-modell.md), [Domains & Sichten](30-dynamics/12-domain-sichten.md), [Fach-Technik-Verlinkung](30-dynamics/13-fach-technik-verlinkung.md)
- **Erweiterbarkeit**: [Custom Entities](40-extensibility/14-erweiterbarkeit.md), [Schema-Evolution](40-extensibility/15-schema-evolution.md)
- **Beispiel**: [Walkthrough](50-walkthrough/16-beispiel-walkthrough.md)
- **Integrationen**: [ITSM](60-integrations/17-itsm-integration.md), [PPM](60-integrations/18-ppm-integration.md), [Agile Skalierung](60-integrations/19-agile-skalierung.md), [GRC / DSGVO / ISMS](60-integrations/20-grc-dsgvo-isms-integration.md)
- **Plattform**: [API-Architektur](70-platform/21-api-architektur.md), [Auswertbarkeit](70-platform/22-auswertbarkeit.md)
- **Backlog**: [Offene Punkte](90-backlog/23-offene-punkte.md), [Nächste Schritte](90-backlog/24-naechste-schritte.md)

## Struktur

```
concept/
├── README.md                          ← diese Datei (Einstieg, Leitprinzipien)
├── INDEX.md                           ← vollständige Kapitelübersicht
│
├── 00-overview/                       ← Einordnung und Meta-Metamodell
├── 10-foundations/                    ← Framework-Verhältnis, Continuum, Normative Schicht
├── 20-entities/                       ← Kern-Entitäten und fachliche Modellierung
├── 30-dynamics/                       ← Zeit, Sichten, Cross-Layer
├── 40-extensibility/                  ← Erweiterbarkeit und Schema-Evolution
├── 50-walkthrough/                    ← Konkretes Beispiel
├── 60-integrations/                   ← ITSM, PPM, Agile, GRC/DSGVO/ISMS
├── 70-platform/                       ← API und Query-Architektur
└── 90-backlog/                        ← Offene Fragen und nächste Schritte
```

## Arbeitsweise

Dieses Dokument ist die **Diskussionsgrundlage** für das Metamodell. Änderungen erfolgen per PR mit ADR-Referenz. Jede substanzielle Änderung sollte:

1. Konkrete offene Fragen aus [23-offene-punkte.md](90-backlog/23-offene-punkte.md) adressieren oder
2. Einen neuen offenen Punkt dokumentieren, wenn Unklarheit entsteht

Die Kapitelstruktur ist bewusst nach Themen, nicht nach Framework-Gliederung angelegt – das erlaubt parallele Arbeit an unabhängigen Themen und macht Reviews fokussierter.
