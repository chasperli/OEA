# ADR-007: Canvas-Bibliothek für interaktive Diagramm-Editierung

**Status**: deferred
**Datum**: 2026-06-26
**Entscheider**: Inhaber des Repositorys
**Konsultiert**: Requirements Engineer (UC-05, US-045, REQ-040)
**Informiert**: –

> **Zurückgestellt**: Die Canvas-Bibliothekswahl hängt von der Entscheidung zwischen Client App (vollständiger Modellier-Umfang) und Web Portal (Publikation, eingeschränkter Umfang) ab. Diese Architektur-Entscheidung muss zuerst getroffen werden (ADR-008 ausstehend). Der interaktive Diagramm-Canvas ist primär ein Client-App-Feature. React Flow als Kandidat bleibt dokumentiert, ist aber noch nicht entschieden.

## Kontext und Problem

UC-05 (Architektur-Vision einer Änderungsinitiative beschreiben) erfordert, dass Solution Architekten Entitäten direkt in einem **interaktiven Diagramm** (Canvas) platzieren und benennen können. US-045 spezifiziert dabei eine besondere Verhaltensanforderung: Beim Eingeben des Namens einer neuen Entität auf dem Canvas muss eine Vorschlagsliste mit bestehenden Komponenten aus der IT-Landschaft erscheinen, damit der Architekt sofort erkennt, ob eine Komponente schon existiert und er statt eines `new`-Deltas ein `modified`- oder `retiring`-Delta anlegen sollte.

Dafür wird eine **Web-Canvas-Bibliothek** benötigt, die:
- Knoten (Entitäten) und Kanten (Relationen) interaktiv platzierbar und editierbar macht
- In-Place-Texteditierung direkt auf dem Canvas-Element unterstützt (kein separater Dialog)
- Sich in eine React/TypeScript-Webanwendung integriert
- State als sauberes JSON serialisiert (Git-taugliche Diffs, kein Binärformat)

§21.2.1 des Konzepts hat die Visualisierungsstrategie bewusst auf nach dem Requirements Engineering verschoben. Dieser ADR adressiert nur den **interaktiven Editier-Canvas** (Kernanforderung für UC-05 / Walking Skeleton), nicht die gesamte Visualisierungsstrategie (Rendering-Backends für read-only Diagramme, Notationsunterstützung etc.) – das bleibt ADR-008.

## Entscheidungstreiber

- **OSS-Kompatibilität**: OEA steht unter Apache 2.0; die Canvas-Bibliothek muss eine kompatible Open-Source-Lizenz haben (MIT, Apache 2.0, BSD)
- **React/TypeScript-native**: das Frontend wird als React-Anwendung entwickelt; die Bibliothek soll sich natürlich in dieses Ökosystem einfügen
- **In-Place-Editierung**: Name-Eingabe direkt auf dem Canvas-Knoten (US-045 AC1–AC3)
- **Serialisierbarkeit**: Diagramm-State als diff-bares JSON; kein proprietäres Binärformat (Concern SH-04: Git-nativer Workflow)
- **Custom Node Shapes**: verschiedene Entitätstypen (ApplicationComponent, Interface, BusinessProcess …) brauchen unterschiedliche visuelle Darstellungen
- **Aktive Community / Wartung**: Bibliothek muss langfristig gepflegt sein; keine toten Forks
- **Lizenzkosten**: keine pro-Seat- oder pro-Deployment-Gebühren (OSS-Prinzip)

## Betrachtete Optionen

### Option 1: React Flow (xyflow)

React Flow ist eine MIT-lizenzierte Bibliothek speziell für node-based UIs und interaktive Graphen in React. Nodes sind React-Komponenten – vollständige Kontrolle über Darstellung und Editierverhalten.

- **Pro**:
  - Beste React-TypeScript-Integration; Nodes sind plain React-Komponenten
  - Aktive Community, breite Adoption (Retool, Prefect, n8n u.a.)
  - In-Place-Editierung einfach implementierbar (Input-Element im Node-Component)
  - State (Nodes, Edges) als JSON-Array; diff-freundlich
  - MIT-Lizenz, keine Einschränkungen
  - Umfangreiche Dokumentation und Beispiele
- **Contra**:
  - Ursprünglich für Flow/DAG-Diagramme optimiert; ArchiMate-/EA-spezifisches Layout muss selbst gebaut werden
  - Auto-Layout (hierarchisch, layered) braucht externe Bibliothek (ELK.js, dagre)
  - Für sehr grosse Graphen (>1000 Knoten) sind Performance-Optimierungen nötig (Virtualisierung)

### Option 2: maxGraph (Community-Fork von mxGraph)

maxGraph ist der Apache 2.0-lizenzierte Community-Fork von mxGraph, auf dem draw.io / diagrams.net basiert. Sehr mächtige, battle-tested Bibliothek mit Jahrzehnten EA-Diagramm-Unterstützung.

- **Pro**:
  - Extrem feature-reich: Auto-Layout, vordefinierte EA-Shape-Bibliotheken, Gruppen, Swimlanes
  - Battle-tested in draw.io (Millionen von Nutzern)
  - Apache 2.0-Lizenz
  - Gut geeignet für komplexe architektonische Layouts (layered, orthogonal Routing)
- **Contra**:
  - Keine native React-Integration; erfordert Wrapper-Schicht
  - API ist konzeptionell älter (mxGraph-Erbe aus frühen 2000ern); TypeScript-Types unvollständig
  - Kleinere Community als React Flow; Dokumentation lückenhafter
  - Steilere Lernkurve; In-Place-Editierung ist konfigurierbar, aber nicht React-nativ
  - maxGraph ist junger Fork (seit 2022); Stabilität des Projekts noch im Aufbau

### Option 3: AntV X6

AntV X6 ist eine Apache 2.0-lizenzierte Graph-Editor-Bibliothek von Ant Group (Alibaba). Feature-reich, gute React-Integration, für interaktive Diagramm-Editierung konzipiert.

- **Pro**:
  - Apache 2.0-Lizenz
  - Starke Graph-Editierungs-Features (inklusive In-Place-Edit, Custom Shapes, Ports)
  - Gute React-Integration (@antv/x6-react-shape)
  - Aktiv gepflegt, professioneller Backing durch Ant Group
- **Contra**:
  - Primäre Dokumentation und Community auf Chinesisch; englische Dokumentation lückenhaft
  - Weniger Verbreitung im westlichen Open-Source-Ökosystem; weniger StackOverflow-/GitHub-Issues-Unterstützung
  - API hat zwischen v1 und v2 Breaking Changes eingeführt; langfristige Stabilität schwerer abschätzbar
  - TypeScript-Typen vollständig, aber API-Ergonomie weniger konsistent als React Flow

### Option 4: GoJS

Kommerzielle Canvas-Bibliothek mit professioneller EA-Diagramm-Unterstützung.

- **Pro**:
  - Sehr mächtig, ausgereifte EA-/UML-Unterstützung
  - Exzellente Dokumentation
- **Contra**:
  - Kommerzielle Lizenz (per-Developer-Gebühr); inkompatibel mit Apache 2.0 OSS-Projekt
  - Scheidet aus

## Entscheidung

Wir wählen **Option 1: React Flow**, weil es die beste Integration in den React/TypeScript-Stack bietet, die In-Place-Editierung durch React-Komponenten als Nodes trivial realisierbar ist, der State als diff-bares JSON-Array vorliegt, und die Community-Stärke die langfristige Wartung sichert.

Die EA-spezifischen Lücken (Auto-Layout, ArchiMate-Shape-Bibliothek) sind bekannte, lösbare Probleme:
- Auto-Layout wird über **ELK.js** (Eclipse Layout Kernel, EPL 2.0; per Bundling Apache 2.0-kompatibel verwendbar) nachgerüstet, sobald die Anforderung konkret wird
- Custom Shapes (ApplicationComponent, Interface, BusinessProcess etc.) werden als React-Komponenten direkt im OEA-Frontend definiert – kein Third-Party-Shape-Set nötig

GoJS scheidet wegen kommerzieller Lizenz aus. maxGraph und AntV X6 sind technisch geeignet, aber React Flow ist für den vorliegenden Stack die natürlichste Wahl.

## Konsequenzen

### Positive Konsequenzen

- US-045 (Neue Entität im Diagramm anlegen) ist implementierbar: Typeahead-Vorschlagsliste und In-Place-Edit sind über React-Nodes direkt realisierbar
- Entwickler im Frontend-Team müssen keine neue Abstraktionsschicht für die Canvas-Bibliothek erlernen – React Flow ist React
- Diagramm-State (Nodes, Edges, Positionen) ist als JSON in der Datenbank speicherbar und git-diff-freundlich

### Negative Konsequenzen / Trade-offs

- Auto-Layout für grosse EA-Diagramme (Bebauungsplan-Ansicht) ist nicht out-of-the-box; ELK.js-Integration ist eine eigene Aufgabe, wenn diese Ansicht gebaut wird
- React Flow ist nicht speziell für ArchiMate oder TOGAF-Notation gebaut; alle domänenspezifischen Shapes müssen im OEA-Frontend selbst gepflegt werden
- Performance bei sehr grossen Graphen (> 500 Knoten sichtbar) erfordert ggf. die React Flow Pro-Feature „Virtual Rendering" oder eigene Optimierungen; für Walking Skeleton kein Problem

### Folgeentscheidungen

- **ADR-008** (ausstehend): Vollständige Visualisierungsstrategie – welche Diagramm-Typen (ArchiMate Layer Views, C4, Sequenz, BPMN) rendert OEA, und mit welchen Backends (textbasiert vs. Canvas)? React Flow als Canvas-Bibliothek ist ein Baustein davon, löst aber nicht die gesamte Frage (§21.2.1)
- **ELK.js-Integration**: wenn hierarchisches Auto-Layout für Bebauungsplan-Ansichten gebraucht wird; als separates Requirement zu spezifizieren
- **Shape-Bibliothek**: ArchiMate-konforme Node-Shapes (ApplicationComponent, Interface, BusinessProcess, DataObject …) als React-Komponenten – Designaufgabe für UI-Designerin (SH-UI-Designer-Agent)

## Bezüge

**Konzept-Kapitel**:
- [§21.2.1 Visualisierungs-Strategie](../concept/70-platform/21-api-architektur.md)

**Verwandte ADRs**:
- ADR-008 (ausstehend): Vollständige Visualisierungsstrategie

**Use Cases / Requirements**:
- [UC-05: Architektur-Vision einer Änderungsinitiative beschreiben](../requirements/use-cases/UC-05-architektur-vision-beschreiben.md)
- [REQ-040: EntityDeltas einer Solution erfassen](../requirements/req/REQ-040-entity-deltas-erfassen.md)
- [US-045: Neue Entität im Diagramm als Delta anlegen](../requirements/user-stories/US-045-delta-neue-entitaet-diagramm.md)

## Notizen

React Flow v11+ (xyflow) ist der aktuelle Stand; die npm-Packages heissen `@xyflow/react` (React Flow v12+) bzw. `reactflow` (v11). Vor Implementierung prüfen, welche Version aktuell stabil ist.

ELK.js (Eclipse Layout Kernel) ist unter EPL 2.0 lizenziert. Die EPL 2.0 erlaubt die Nutzung in Apache 2.0-Projekten, solange ELK.js nicht modifiziert und separat ausgeliefert wird (Bundling via npm ist akzeptabel). Im Zweifelsfall Rechtshinweis im NOTICE-File ergänzen.
