---
id: document-collection
title: DocumentCollection – Strukturierte Dokumentation
version: 0.2.0
status: draft
created: 2026-06-26
last_updated: 2026-06-27
author: business-engineer
references:
  concept:
    - concept/20-entities/14-erweiterbarkeit.md
  stakeholders:
    - SH-03
    - SH-04
  use_cases:
    - UC-04
    - UC-09
---

# DocumentCollection – Strukturierte Dokumentation

## Zweck

OEA ermöglicht es, strukturierte Textdokumentation direkt an Entitäten zu pflegen — verknüpft mit dem EA-Modell, nicht in einem separaten Tool. Das Konzept ist vollständig generisch: Betreiber definieren eigene Dokumentationstypen (z.B. Arc42-Architektur, Third-Party-Management, Lizenzregister) als `DocumentCollectionDefinition` mit beliebigen Kapiteln.

Eine Entität kann mehreren Dokumentationstypen zugeordnet sein (1 Entity → n DocumentCollections). Der Inhalt jedes Kapitels wird als eigene `DocumentationEntry`-Entität gespeichert und über eine `documents`-Connection mit der dokumentierten Entität verknüpft.

**Zwei-Ebenen-Modell:**
1. **Definitonsebene** (Metamodell): Welche Dokumentationstypen gibt es? Welche Kapitel haben sie? (`DocumentCollectionDefinition` in MetamodelConfiguration)
2. **Instanzebene**: Was wurde für diese Entität dokumentiert? (`DocumentationEntry`-Entitäten per System, verknüpft via `documents`)

## Kernkonzepte

### DocumentationEntry (built-in EntityType)

`documentation-entry` ist ein eingebauter, erweiterbarer EntityType mit `isConnection=false`. Er repräsentiert den Inhalt eines Kapitels für eine bestimmte dokumentierte Entität.

| Attribut | Typ | Optional | Beschreibung |
|---|---|---|---|
| id | integer | required | Fortlaufende Integer-ID (gemeinsamer Nummernraum mit allen anderen Entitäten) |
| entityTypeId | string | required | `documentation-entry` oder ein Subtyp davon (z.B. `license-entry`) |
| name | string | required | Kurzbezeichnung (z.B. „Kontextabgrenzung CRM-System") |
| content | rich-text | required | WYSIWYG-Inhalt; unterstützt Markdown, Mermaid, PlantUML, Draw.io und Entity-Mentions |
| chapterRef | string | optional | ID des `DocumentChapterDefinition`, dem dieser Eintrag zugeordnet ist |
| collectionRef | string | optional | ID der `DocumentCollectionDefinition`, zu der dieser Eintrag gehört |

**Subtypen** können via `extends: documentation-entry` auf EntityTypeDefinition-Ebene definiert werden. Damit können zusätzliche Properties für spezifische Kapiteltypen ergänzt werden (z.B. `licenseType`, `expiryDate` für Lizenzregister-Kapitel).

### Documents (built-in Connection-Typ)

`documents` ist ein eingebauter Connection-Typ mit `isConnection=true`. Er verknüpft eine `DocumentationEntry`-Instanz mit der dokumentierten Entität (dem „Subject").

| Attribut | Typ | Beschreibung |
|---|---|---|
| sourceEntityId | integer | DocumentationEntry-Instanz (Typ: `documentation-entry` oder Subtyp) |
| targetEntityId | integer | Dokumentiertes Objekt (beliebiger EntityType, z.B. `application-component`) |

Über diese Verbindung kann das System zu jeder Entität alle zugehörigen Dokumentations-Einträge abrufen (`GET /api/v1/entities/{id}/documentation`) und umgekehrt zu jedem Eintrag das dokumentierte Objekt finden.

### DocumentCollectionDefinition (Metamodell-Objekt)

Eine `DocumentCollectionDefinition` ist ein betreiberdefinierter Dokumentationstyp mit einer geordneten Liste von Kapitel-Templates. Sie wird in der MetamodelConfiguration gespeichert und kann beliebigen EntityTypes zugewiesen werden.

| Attribut | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| id | string | required | | kebab-case; global eindeutig in der MetamodelConfiguration |
| name | string | required | | Anzeigename (z.B. „Arc42 Architektur", „Third-Party Management", „Lizenzregister") |
| description | string | optional | null | Beschreibung des Sammlungszwecks |
| assignedEntityTypeIds | string[] | required | [] | EntityTypeDefinition-IDs, für die diese Sammlung gilt; leer = für alle EntityTypes verfügbar |
| chapters | DocumentChapterDefinition[] | required | [] | Geordnete Liste der Kapitel-Templates |

### DocumentChapterDefinition (Sub-Objekt von DocumentCollectionDefinition)

| Attribut | Typ | Optional | Default | Beschreibung |
|---|---|---|---|---|
| chapterId | string | required | | kebab-case; eindeutig innerhalb der Collection |
| title | string | required | | Kapitelbezeichnung (z.B. „Kontextabgrenzung", „Vendor-Bewertung", „Lizenztyp") |
| prompt | string | optional | null | Ausfüllhinweis, der unter dem Kapitel angezeigt wird |
| sortOrder | integer | required | | Reihenfolge innerhalb der Collection; aufsteigend |
| entryEntityTypeId | string | optional | `documentation-entry` | Welcher Subtyp für den Eintrag verwendet wird; Default = Basistyp |

## Vordefinierte Dokumentationstypen (Templates)

OEA liefert als optionalen Template-Satz vordefinierte `DocumentCollectionDefinitions` aus. Betreiber können diese übernehmen, anpassen oder ignorieren:

### Template: Arc42 Architektur-Dokumentation (`arc42-standard`)

| # | chapterId | title | Arc42-Bezug |
|---|---|---|---|
| 1 | context-goals | Aufgabenstellung und Qualitätsziele | §1 |
| 2 | constraints | Randbedingungen | §2 |
| 3 | system-context | Kontextabgrenzung | §3 |
| 4 | solution-strategy | Lösungsstrategie | §4 |
| 5 | building-blocks | Bausteinsicht | §5 |
| 6 | runtime-view | Laufzeitsicht | §6 |
| 7 | deployment-view | Verteilungssicht | §7 |
| 8 | crosscutting-concepts | Querschnittliche Konzepte | §8 |
| 9 | architecture-decisions | Architekturentscheidungen | §9 (verweist auf ADRs) |
| 10 | quality-requirements | Qualitätsanforderungen | §10 (verweist auf NFRs/REQs) |
| 11 | risks | Risiken und technische Schulden | §11 |
| 12 | glossary | Glossar | §12 |

### Template: Third-Party Management (`third-party-management`)

| # | chapterId | title |
|---|---|---|
| 1 | vendor-profile | Vendor-Profil und Bewertung |
| 2 | sla-conditions | SLA-Bedingungen |
| 3 | exit-strategy | Exit-Strategie |
| 4 | contact-persons | Ansprechpersonen |

### Template: Lizenzregister (`license-register`)

| # | chapterId | title |
|---|---|---|
| 1 | license-type | Lizenztyp und Modell |
| 2 | license-scope | Nutzungsumfang und Einschränkungen |
| 3 | costs-renewal | Kosten und Verlängerungsfristen |
| 4 | compliance-notes | Compliance-Hinweise |

**Hinweis zu Arc42 §9 und §10**: Diese Kapitel können in OEA auf bestehende Artefakte verweisen — ADRs und REQs sind bereits im Tool; der WYSIWYG-Inhalt kann Links zu diesen Artefakten setzen, statt alles neu zu schreiben.

## WYSIWYG-Editor: Unterstützte Formate

Der `content`-Wert einer `DocumentationEntry`-Entität unterstützt:

| Format | Syntax | Rendering |
|---|---|---|
| Markdown | Standard CommonMark | Inline-Rendering |
| Mermaid | ` ```mermaid ` … ` ``` ` | Client-seitiges Rendering via mermaid.js |
| PlantUML | ` ```plantuml ` … ` ``` ` | Server-seitiges Rendering via PlantUML-Server oder WASM |
| Draw.io | ` ```drawio ` … ` ``` ` | SVG-Rendering via draw.io-Viewer-Library; Bearbeitung im draw.io-Editor-Popup |
| Entity-Mention | `[[` → Autocomplete → `[[Name\|entity:ID]]` | Inline-Badge mit Link zur Entität (in Code-Blöcken: reiner Textname) |

### Entity-Mention via `[[`

Überall im Editor — in Freitext, innerhalb von Mermaid-, PlantUML- und Draw.io-Codeblöcken — löst das Tippen von `[[` ein Autocomplete-Dropdown aus, das live gegen das Entity-Repository sucht.

**Speicherformat je Kontext:**

| Kontext | Eingabe | Gespeicherter Wert |
|---|---|---|
| Markdown-Freitext | `[[CRM` → Auswahl | `[[CRM-System\|entity:1]]` |
| Mermaid-Codeblock | `[[CRM` → Auswahl | `CRM-System` (reiner Text) |
| PlantUML-Codeblock | `[[CRM` → Auswahl | `CRM-System` (reiner Text) |
| Draw.io Shape-Label | `[[CRM` → Auswahl | `CRM-System` (reiner Text) |

Im **Markdown-Freitext** wird `[[Name|entity:ID]]` gespeichert. Beim Rendering löst das System den aktuellen Namen via ID auf — wird die Entität umbenannt, zeigt der Badge automatisch den neuen Namen. In **Code-Blöcken** wird der Name als reiner Text eingesetzt; Umbenennung im Repo wird nicht automatisch nachgezogen.

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| documents | ArchitectureEntity (beliebig) | n:1 | no | `documents`-Connection; jeder Eintrag dokumentiert genau ein Subject |
| answersChapter | DocumentChapterDefinition | n:1 | yes | via `chapterRef`; ordnet Eintrag einem Kapitel zu |
| belongsToCollection | DocumentCollectionDefinition | n:1 | yes | via `collectionRef` → Collection |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | `documentation-entry`-Entitäten MÜSSEN via eine `documents`-Connection mit genau einem Subject verknüpft sein | onCreate | – |
| BR-02 | `documents` darf NICHT zwischen zwei `documentation-entry`-Instanzen geknüpft werden (`sourceEntityId` darf kein `documentation-entry` sein) | onCreate | – |
| BR-03 | `DocumentCollectionDefinition.chapters[].sortOrder` muss innerhalb der Collection eindeutig sein | onCreate, onUpdate | – |
| BR-04 | Wird eine `DocumentCollectionDefinition` einem EntityType zugewiesen, der bereits eine andere Collection trägt, sind beide gültig (additive Zuweisung); ein EntityType kann n Collections tragen | onCreate | – |
| BR-05 | Pro (Subject-Entität + `chapterRef` + `collectionRef`) darf maximal ein `DocumentationEntry` existieren; erneutes Speichern überschreibt den bestehenden Eintrag | onCreate, onUpdate | – |
| BR-06 | `DocumentChapterDefinition.entryEntityTypeId` muss ein EntityType sein, der `documentation-entry` als direkten oder transitiven Eltern-Typ hat (`extends`-Kette) | onCreate, onUpdate | – |
| BR-07 | Der `content`-Wert darf maximal 100.000 Zeichen betragen; Code-Blöcke werden vor dem Speichern nicht gerendert | onRead | – |
| BR-08 | Entity-Mentions im Markdown-Freitext werden im Format `[[Name\|entity:ID]]` gespeichert; beim Rendering MUSS das System den aktuellen `name`-Wert via ID auflösen — bei gelöschter Entität: `[gelöscht|entity:ID]` in roter Schrift | onRead | – |
| BR-09 | Entity-Mentions innerhalb von Code-Blöcken (Mermaid, PlantUML, Draw.io) werden als reiner Textname gespeichert; keine ID-Auflösung beim Rendering | onCreate, onUpdate | – |
| BR-10 | Draw.io-Codeblöcke (` ```drawio `) enthalten valides `<mxGraphModel>`-XML; ungültige XML-Struktur wird vor dem Speichern als Fehler markiert; das XML MUSS serverseitig oder via DOMParser sanitisiert werden (keine `<script>`-Tags, keine `javascript:`-URIs in `href`-Attributen) | onSave, onRead | – |

## Verwendung

- **Metamodell-Admin (UC-04)**: legt `DocumentCollectionDefinitions` an (z.B. Arc42, Third-Party, Lizenzregister), konfiguriert Kapitel, weist EntityTypes zu
- **Solution Architekt / Lead EA (UC-09)**: öffnet eine Entität (z.B. CRM-System), navigiert zum Dokumentations-Tab, befüllt Kapitel per WYSIWYG-Editor
- **Read-Only-Nutzer (Web Portal)**: liest Inhalte, sieht gerenderte Mermaid/PlantUML-Diagramme

## Abgrenzung

- **NICHT** das Konzeptpapier (`concept/`): das Konzeptpapier ist projektinterne Dokumentation; `DocumentCollections` sind System-spezifische Inhalte im EA-Repository
- **NICHT** ein Diagramm (`diagram.md`): Diagramme sind Canvas-basierte visuelle Modelle; Dokumentations-Einträge sind textuelle Inhalte mit optionalen Inline-Diagrammen
- **NICHT** ein Use Case oder REQ: Kapitelinhalte sind Architekturbeschreibungen oder Managementinformationen, keine Anforderungen

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | Business Engineer | Initial draft als arc42.md (Arc42-spezifisch) |
| 0.2.0 | 2026-06-27 | Business Engineer | Generalisierung: Arc42MetaObject → DocumentationEntry; Arc42Describes → Documents; Arc42ChapterCollection → DocumentCollectionDefinition; Arc42QuestionTemplate → DocumentChapterDefinition; drei vordefinierte Templates (Arc42, Third-Party, Lizenzregister); 1-Entity-zu-n-Collections-Beziehung explizit modelliert (BR-04/BR-05) |
