# Vollständige Kapitelübersicht

Chronologische Liste aller Kapitel mit Kurzbeschreibung.

## 00 – Overview

1. [Einordnung und Zielsetzung](00-overview/01-einordnung.md) – Scope, Leitprinzipien
2. [Meta-Metamodell: Die drei Ebenen](00-overview/02-meta-metamodell.md) – M2/M1/M0-Konzept, Reifikation

## 10 – Foundations

3. [Verhältnis zu Arc42 und TOGAF](10-foundations/03-framework-verhaeltnis.md) – Reibungspunkte und Auflösung
4. [Enterprise Continuum und Technical Reference Model](10-foundations/04-enterprise-continuum-trm.md) – ABBs, SBBs, Patterns, TRM
5. [Architekturprinzipien, Standards und Entscheidungen](10-foundations/05-prinzipien-standards-adrs.md) – Prinzip vs. Standard, Waivers, ADRs

## 20 – Entities

6. [Kern-Entitätstypen](20-entities/06-kern-entitaetstypen.md) – TOGAF-Mapping, Arc42-Mapping, BPMN-Integration
7. [Motivation, Stakeholder und Ziele](20-entities/07-motivation-stakeholder-ziele.md) – Vision, Driver, Goal, Stakeholder, Glossar
8. [Organisation, Rollen und Personen](20-entities/08-organisation-rollen-personen.md) – Org-Hierarchie, Rollen-Typen, Skills, RACI, Governance Bodies
9. [Prozess-Architektur](20-entities/09-prozess-architektur.md) – Abstrakte Prozess-Modellierung, Process Landscape, CRUD-Matrix, Value Streams
10. [Weitere Cross-Cutting-Konzepte](20-entities/10-cross-cutting.md) – Location, Security, Sustainability, Contracts, Deliverables, Schutzbedarf, Requirements-Repository

## 30 – Dynamics

11. [Temporales Modell](30-dynamics/11-temporales-modell.md) – Plateaus, Lifecycle, Gaps, Work Packages, Zielbilder
12. [Domain-Konzept und Sichten](30-dynamics/12-domain-sichten.md) – n:m-Domains, Bebauungspläne, gespeicherte Sichten
13. [Verlinkung Fach- und Technik-Ebene](30-dynamics/13-fach-technik-verlinkung.md) – Die Traceability-Kette

## 40 – Extensibility

14. [Erweiterbarkeit](40-extensibility/14-erweiterbarkeit.md) – Custom EntityTypes, Stereotypen, Constraints
15. [Schema-Evolution](40-extensibility/15-schema-evolution.md) – Subjektive Scopes, Patterns, Versionierung, Data Quality

## 50 – Walkthrough

16. [Beispiel-Walkthrough](50-walkthrough/16-beispiel-walkthrough.md) – CRM-Migration als End-to-End-Szenario

## 60 – Integrations

17. [ITSM-Integration (CMDB und Service Catalog)](60-integrations/17-itsm-integration.md) – Mastership, Services, ITIL-4-Practices
18. [Projekt-Portfolio-Integration (PPM)](60-integrations/18-ppm-integration.md) – Project, Program, Portfolio, Benefits, ARB
19. [Agile Skalierungs-Frameworks (SAFe, LeSS)](60-integrations/19-agile-skalierung.md) – Framework-spezifische Abbildung und Schema-Profile
20. [GRC-, DSGVO- und ISMS-Integration](60-integrations/20-grc-dsgvo-isms-integration.md) – Asset-Export, Art. 30, Drittlandtransfers, ISO 27005, Audit-Trail

## 70 – Platform

21. [API-Architektur und Modularität](70-platform/21-api-architektur.md) – Schichten, Module (inkl. BPMN), Events, SDK, Property-Level-AuthZ
22. [Auswertbarkeit und Query-Architektur](70-platform/22-auswertbarkeit.md) – Graph-Traversierung, Analytics, Persistenz-Optionen

## 90 – Backlog

23. [Offene Punkte / nächste Entscheidungen](90-backlog/23-offene-punkte.md) – ADR-Kandidaten
24. [Nächste Schritte](90-backlog/24-naechste-schritte.md) – Review, Use-Case-Katalog, Walking Skeleton

---

## Lesepfade

Je nach Fokus sind unterschiedliche Reihenfolgen sinnvoll:

**Für Entscheider** (Was ist das Konzept?):
README → 01 → 03 → 11 → 12 → 16

**Für Metamodell-Designer** (Wie ist es strukturiert?):
02 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 14 → 15

**Für Integrations-Architekten** (Wie dockt es an bestehende Systeme an?):
17 → 18 → 19 → 20 → 21

**Für Implementierer** (Was ist zu bauen?):
21 → 22 → 23 → 24

**Für Fachbereich-Stakeholder** (Was bedeutet das für uns?):
01 → 07 → 08 → 09 → 12 → 16

**Für Compliance-/Datenschutz-/Sicherheitsrollen** (Was wird regulatorisch unterstützt?):
01 → 10 → 17 → 20 → 21
