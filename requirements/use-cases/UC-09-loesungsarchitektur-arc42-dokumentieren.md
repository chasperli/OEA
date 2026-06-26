---
id: UC-09
title: Lösungsarchitektur nach Arc42 dokumentieren
version: 0.1.0
status: draft
priority: should
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  stakeholders:
    - SH-04
  business_objects:
    - arc42
    - metamodel-configuration
    - entity
  concept:
    - concept/20-entities/14-erweiterbarkeit.md
---

# UC-09: Lösungsarchitektur nach Arc42 dokumentieren

## Kurzbeschreibung

Der Solution Architekt dokumentiert die Architektur eines Systems (z.B. CRM, ERP-Nachfolger) direkt in OEA nach Arc42-Vorlage — verknüpft mit dem EA-Modell, ohne separates Dokumentations-Tool.

## Primärer Akteur

**SH-04 – Michael, Solution Architekt im Mittelstand**

Sekundäre Akteure: SH-03 (Lead EA liest Dokumentation mit), SH-05 (CIO im Web Portal)

## Ziel

Michael hat für jedes relevante System eine vollständige oder partielle Arc42-Dokumentation, die im EA-Repository lebt, über Viewpoints sichtbar ist und mit ADRs, NFRs und dem Diagramm-Canvas verbunden ist.

## Vorbedingungen

- Eine Arc42ChapterCollection ist im MetamodelConfiguration konfiguriert und dem EntityType `application-component` (oder einem anderen Systemtyp) zugewiesen (UC-04)
- Das zu dokumentierende System existiert als ArchitectureEntity im Repository

## Hauptfluss

1. Michael öffnet die ArchitectureEntity „CRM-System" (application-component, id=1)
2. Das System zeigt den Tab „Arc42 Dokumentation" mit allen zugewiesenen Chapter-Collections
3. Michael wählt die Sammlung „Standard Arc42" und sieht alle 12 Fragen als Abschnitte
4. Michael klickt auf „1. Kontextabgrenzung" — ein WYSIWYG-Editor öffnet sich
5. Michael schreibt den Kontext-Text und fügt einen Mermaid-Block (C4-Context-Diagramm) ein
6. Das System rendert den Mermaid-Block als Vorschau inline im Editor
7. Michael speichert — das System legt eine `arc42-meta-object`-Entität an und verknüpft sie via `arc42-describes` mit id=1
8. Michael wechselt zu „9. Architekturentscheidungen" und verlinkt bestehende ADRs per Link im Editor
9. Michael wechselt zu Frage „5. Bausteinsicht" und fügt ein PlantUML-Komponentendiagramm ein
10. Nach Abschluss: alle beantworteten Fragen sind in der Übersicht mit Status „✓" markiert

## Alternativflüsse

**A1 – Eigene Kapitelsammlung statt Standard-Arc42:**
- Schritt 2a: Der Metamodell-Admin hat eine eigene Collection „Arc42 KMU (5 Kapitel)" konfiguriert
- Michael sieht nur 5 Fragen; beantwortet diese in 5 Editoren

**A2 – PlantUML Server nicht verfügbar:**
- Schritt 6a: Das Rendering schlägt fehl; System zeigt Code-Fallback (roher Text); keine Fehlermeldung, nur Warning-Icon
- Michael kann Content speichern; Rendering wird beim nächsten Laden erneut versucht

**A3 – Mehrere Collections für denselben EntityType:**
- Schritt 3a: Michael sieht mehrere Sammlungen als Tabs (z.B. „Standard Arc42", „Security Review")
- Michael beantwortet je nach Bedarf eine oder mehrere

## Ausnahmen

**E1 – Entität ohne Collection-Zuweisung:**
- Kein Arc42-Tab erscheint; kein Fehler; nur eine Meldung „Keine Arc42-Kapitelsammlung für diesen Typ konfiguriert"

**E2 – Antwort wird überschrieben:**
- Nur eine Arc42-Antwort-Entität pro (Subject-Entität + questionRef + Collection) erlaubt; erneutes Speichern überschreibt die bestehende

## Akzeptanzkriterien

**AC1** (Tab erscheint für zugewiesenen Typ):
- Gegeben: EntityType `application-component` hat Collection `arc42-standard` zugewiesen
- Wenn: Michael öffnet CRM-System-Entität
- Dann: Tab „Arc42 Dokumentation" sichtbar; alle 12 Fragen aufgelistet; unbeantwortete Fragen als leer

**AC2** (WYSIWYG Speichern):
- Wenn: Michael schreibt Text + Mermaid-Block und klickt Speichern
- Dann: arc42-meta-object-Entität angelegt mit content, verknüpft via arc42-describes(sourceId=neu, targetId=1)

**AC3** (Mermaid-Rendering):
- Wenn: Content enthält ```mermaid-Block
- Dann: Block wird als SVG-Diagramm gerendert; Fallback auf Code wenn mermaid.js nicht verfügbar

**AC4** (PlantUML-Rendering):
- Wenn: Content enthält ```plantuml-Block
- Dann: Block wird via konfigurierten PlantUML-Server oder WASM als SVG gerendert

**AC5** (Web Portal read-only):
- Wenn: CIO öffnet dieselbe Entität im Web Portal
- Dann: Arc42-Tab sichtbar; Inhalte lesbar; Mermaid/PlantUML gerendert; kein Bearbeitungs-Button

**AC6** (Fortschrittsanzeige):
- Wenn: 4 von 12 Fragen beantwortet
- Dann: Übersicht zeigt „4 / 12 beantwortet" und welche Fragen noch leer sind

## Nicht im Scope

- Automatisches Befüllen von Fragen aus dem EA-Modell (in v2.0 denkbar: §3 Kontext aus Diagramm generieren)
- PDF-Export des Arc42-Dokuments (v2.0)
- Kollaborative Echtzeit-Bearbeitung (v2.0)
- Column-Level-Diagramme (zu spezifisch für Arc42)

## Beziehung zu anderen Use Cases

- **UC-04**: Metamodell-Admin konfiguriert die Arc42ChapterCollections und weist sie EntityTypes zu (Voraussetzung)
- **UC-05**: Architektur-Vision und Solutions definieren das modellierte System; UC-09 dokumentiert seine Architektur
- **UC-06**: Katalog kann arc42-meta-object-Entitäten auflisten (Überblick aller dokumentierten Systeme)

## Konzept-Bezug

- §14 Erweiterbarkeit: Arc42ChapterCollection als Metamodell-Erweiterung
- §18 Reporting: Arc42-Dokumentation als strukturierte Ausgabe pro System
