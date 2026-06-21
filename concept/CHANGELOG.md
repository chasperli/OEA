# Changelog des Konzeptpapiers

Dieses Dokument hält fest, wie sich das Konzeptpapier selbst entwickelt hat. Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionierung nach Semantic Versioning (auf Konzept-Ebene: Major = grundlegend neue Konzepte, Minor = neue Kapitel/Abschnitte, Patch = Korrekturen).

## [v0.15] – Visualisierungs-Strategie als offene Entscheidung verankert

### Hinzugefügt
- §21.2.1 Visualisierungs-Strategie: bewusst offene Entscheidung über Diagramm-Notation
- Trade-off-Tabelle textbasierte DSL vs. grafische Editoren (10 Kriterien)
- Use-Case-bezogene Renderer-Wahl als Skizze (sieben Diagramm-Typen mit möglichen Backends)
- Fünf zu klärende Fragen vor Notations-Entscheidung
- Übergangs-Empfehlung für die Konzept-Dokumentation (deskriptiv statt DSL-spezifisch)
- Offene Punkte 46 (Visualisierungs-Strategie) und 47 (Bestandstool-Migration)

### Geändert
- §21.2: Renderer-Eintrag entschärft – konkrete Notationen entfernt, Verweis auf §21.2.1
- Positionierung: Diagramm-Notation ist Implementation-Detail, nicht Konzept-Kern

### Begründung
Die Notations-Entscheidung sollte nach Abschluss der Requirements-Engineering-Phase getroffen werden, wenn Personas, Use Cases und Nutzungsmuster klar sind. Bis dahin sind alle Optionen offen.

## [v0.14] – Progressive Disclosure und Nicht-Erzwingung der Logical-Schicht

### Hinzugefügt
- Neues Leitprinzip im README: "Progressive Disclosure statt erzwungener Tiefe" – konzeptionelle Korrektheit wird unterstützt, nicht erzwungen
- §6.1.1 Abschnitt zur kognitiven Realität ("Menschen denken in Lösungen, nicht in Schichten") mit drei Erkenntnissen:
  - Logical-Schicht ist optional, nicht obligatorisch
  - Progressive Disclosure über drei Sichten (Inventar, Schichten, Bebauungsplan)
  - Optionale Auto-Generierung von Logical-Stubs aus Physical
- §12.4 Progressive Disclosure mit konkreter Sichten-Definition (Inventar, Schichten, Bebauungsplan) und vier Reifestufen für stufenweisen Aufbau
- Trade-off explizit dokumentiert: OSS-Tool muss niederschwellig sein, darf analytische Sauberkeit nicht erzwingen

### Geändert
- Constraints zur Logical-Schicht durchgängig als `warning` oder `hint` markiert, nicht als `error`

## [v0.13] – Change-Log-Konzepte ausgearbeitet

### Hinzugefügt
- §11.5 Plateau-Diff als strukturierter Vergleich zwischen Plateaus (Diff-Dimensionen, Berechnungsregeln, Filterung, API-Endpunkt)
- §22.11 Repository-Changelog und Release-Notes (RepositoryRelease + ChangeEntry, drei Erzeugungs-Wege, Aggregations-Sichten)
- Abgrenzung von Audit-Log, Change-Log und Entity Change History in §21.8
- Dieses CHANGELOG-Dokument

### Geändert
- §22 Unterkapitel-Nummerierung (alte 22.11–22.13 sind jetzt 22.12–22.14)

## [v0.12] – Requirements-Repository

### Hinzugefügt
- §7.2 Requirement-EntityType deutlich erweitert (Lifecycle, Trace-Verbindungen aufwärts/abwärts, Risiko-Verbindungen, Hierarchie- und Beziehungstypen)
- Drei Stereotypen: ArchitectureRequirement (Default), SystemRequirement (mit externalReference), QualityRequirement
- §10.7 Requirements-Repository-Aspekte (Verknüpfungs-Disziplin, Sichten, Constraints, Anti-Patterns)
- Drei neue offene Punkte: Versionierungs-Trigger, System-Requirements-Scope, ReqIF-Integration

### Geändert
- INDEX-Beschreibung von §10 um Requirements-Repository ergänzt

## [v0.11] – Application-vs-Technology-Abgrenzung präzisiert

### Hinzugefügt
- §6.1.1 Abgrenzung Application vs. Technology mit vier Entscheidungs-Prinzipien (Business-Purpose, Austauschbarkeit, Ownership, Katalogisierung)
- Anerkennung der inhärenten Schwierigkeit der Abgrenzung
- Zwei legitime Organisations-Prinzip-Varianten als Vorlagen
- Drei Dual-Modellierungs-Optionen für Plattform-Produkte (beide Entities, Stereotype, ApplicationService als Brücke)
- Constraint-Beispiel zur Durchsetzung organisations-weiter Klassifikations-Entscheidung
- Offener Punkt 40 zur Default-Klassifikations-Wahl

### Korrigiert
- Frühere didaktische Zuspitzung "Kann ein Business-Stakeholder etwas damit anfangen?" als TOGAF-Test war ungenau; korrekte TOGAF-Definition ist strukturell (Funktionalität vs. Infrastruktur)

## [v0.10] – GRC-, DSGVO- und ISMS-Integration

### Hinzugefügt
- §20 GRC-, DSGVO- und ISMS-Integration als neues Kapitel (DSGVO Art. 30, Drittlandtransfers, ISO 27005 Asset-Modell, Audit-Trail, Property-Level-AuthZ, Segregation of Duties)
- §10.2 ProtectionNeed-EntityType (CIA-Schutzbedarf nach ISO 27005 / BSI Grundschutz)
- §21.8 Property-Level-Autorisierung als Pflicht-Feature, Audit-Trail-Spezifikation
- Drei neue Leitprinzipien (EA als Asset-Stammdatenlieferant, Property-Level-AuthZ, vollständiger Audit-Trail)
- Sieben neue offene Punkte zu GRC/DSGVO/ISMS

### Geändert
- Kapitel-Umnummerierung: alte §20 (API) → §21, alte §21 (Auswertbarkeit) → §22, alte §22 (Offene Punkte) → §23, alte §23 (Nächste Schritte) → §24
- Datei-Umbenennungen entsprechend

## [v0.9] – Reifikation von Relationen

### Hinzugefügt
- §2.1 Relationen als First-Class-Objekte (Reifikation) – RelationTypes können EntityType ODER RelationType als Start/Ziel haben
- Reifikations-Tiefe (Default 2, pro Schema konfigurierbar)
- §13 InformationFlow als Relation-Modellierung (Option B als Empfehlung)
- §22.5 Reifizierte Relationen in Queries mit drei Szenarien
- ADR.affects, Waiver.grantedFor, ComplianceDeviation.affects akzeptieren jetzt Entity[] | Relation[]
- Drei neue offene Punkte zu Reifikation (Max-Tiefe, Adressierung, UI-Darstellung)

### Geändert
- §22 Unterkapitel-Nummerierung verschoben (Reifikations-Abschnitt eingeschoben)

## [v0.8] – API-Architektur und Auswertbarkeit

### Hinzugefügt
- §20 API-Architektur und Modularität (Schichten, Module, Events, SDK)
- §21 Auswertbarkeit und Query-Architektur (zwei Query-Paradigmen, Persistenz-Optionen, gespeicherte Views)
- BPMN als exemplarisches Zusatzmodul
- Sieben neue offene Punkte zu API/Query

### Geändert
- Scope-Beschreibung um API-zentrierte Architektur und modulare Erweiterung
- Zwei neue Leitprinzipien: API-first und Persistenz-Neutralität

## [v0.7] – Motivation, Organisation, Prozesse, Cross-Cutting

### Hinzugefügt
- §7 Motivation, Stakeholder und Ziele (Vision, Driver, Goal, Outcome, Stakeholder, Concern, Requirement, Glossar)
- §8 Organisation, Rollen und Personen (DSGVO-bewusst, mit Skills, RACI, GovernanceBody)
- §9 Prozess-Architektur (abstrakte Modellierung, BPMN als Adapter, Process Landscape, CRUD-Matrix, Value Streams)
- §10 Cross-Cutting (Location, Security, Sustainability, Lokalisierung, Contract, Deliverable)
- Empfehlung Option 3 für Prozess-Modellierung (abstrakt mit BPMN/EPK als Export-Formate)

## [v0.6] – Architekturprinzipien, Standards und Entscheidungen

### Hinzugefügt
- §5 Architekturprinzipien, Standards und Entscheidungen (Prinzip vs. Standard vs. Guideline)
- ArchitectureWaiver mit Pflicht-Ablaufdatum
- ComplianceDeviation als drei Zustände (deviation, waiver, violation)
- ADR mit Superseding und n:m-Affects-Relation
- Navigationskette Goal → Principle → Standard → ADR → Entity → Deviation → Waiver → ADR

## [v0.5] – Enterprise Continuum und Schema-Evolution

### Hinzugefügt
- §4 Enterprise Continuum und Technical Reference Model (ABBs, SBBs, Patterns, Reference Architectures, TRM)
- §15 Schema-Evolution (subjektive Scopes, Evolutions-Patterns, Versionierung, Data Quality Scores, Tag-basierte Pilotierung)
- Schema-Profile als organisatorische Konfiguration

## [v0.4] – PPM- und Agile-Integration

### Hinzugefügt
- §18 PPM-Integration (Project, Program, Portfolio, Demand, BusinessCase, Benefit, Architecture Review Board)
- §19 Agile Skalierungs-Frameworks (SAFe und LeSS mit unterschiedlichen Philosophien, Schema-Profile)
- TIME-Modell-Kategorisierung
- Architectural Runway als Stereotype

## [v0.3] – Verhältnis zu Frameworks präzisiert

### Hinzugefügt
- §3 Verhältnis zu Arc42 und TOGAF (sieben Reibungspunkte mit Auflösungen, gemeinsames Metamodell als Brücke)

## [v0.2] – ITSM-Integration

### Hinzugefügt
- §17 ITSM-Integration (CMDB- und Service-Catalog-Mastership, ITIL-4-Practices, Service-Begriffs-Abgrenzung)
- ITSM-Koexistenz als Leitprinzip
- Externe-Referenz-Mechanismus mit Property-Level-Mastership

## [v0.1] – Erste Version

### Hinzugefügt
- §1 Einordnung und Zielsetzung mit ursprünglichen Leitprinzipien
- §2 Meta-Metamodell (M2/M1/M0)
- §6 Kern-Entitätstypen (TOGAF Content Metamodel, Arc42, BPMN-Mapping)
- §11 Temporales Modell (Plateaus, Lifecycle, Gaps, Work Packages, Zielbilder)
- §12 Domain-Konzept und Sichten (n:m-Klassifikation, Bebauungspläne, gespeicherte Views)
- §13 Verlinkung Fach- und Technik-Ebene
- §14 Erweiterbarkeit (Custom EntityTypes, Stereotypen, Constraints)
- §16 Beispiel-Walkthrough (CRM-Migration)
- §23 Offene Punkte (initiale ADR-Kandidaten)
- §24 Nächste Schritte
