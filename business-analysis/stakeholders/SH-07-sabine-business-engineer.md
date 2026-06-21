# Stakeholder: Sabine – Senior Business Engineer im Globalkonzern

**ID**: SH-07
**Typ**: persona
**Bezug zum Tool**: primary
**Internal/External**: internal

## Kurzbeschreibung

Sabine ist Senior Business Engineer / Business Architect in einem global tätigen Konzern. Sie modelliert die fachliche Domäne strukturiert: Business Objects, Business Capabilities, Business Rules, Information Flows. Ihre Outputs sind die Grundlage für Use Cases, Requirements und Solution Design. Sie denkt in formalisierten Geschäftsmodellen und bringt strukturelle Klarheit in komplexe Konzern-Realitäten.

## Rolle und Verantwortung

- **Aktuelle Rolle**: Senior Business Engineer / Business Architect (10+ Jahre Erfahrung)
- **Organisation/Branche**: Globalkonzern (>10.000 Mitarbeitende, mehrere Geschäftsbereiche, internationale Operations)
- **Erfahrungsniveau**: sehr hoch in Business-Modellierung, vertraut mit BIAN, ARIS, BPMN, ArchiMate
- **Tägliche Hauptaufgaben**:
  - Business Objects und deren Beziehungen modellieren (Customer, Product, Order, Contract, etc.)
  - Business Capabilities und deren Abhängigkeiten erfassen
  - Business Rules formalisieren und mit Compliance abstimmen
  - Process Maps und Wertschöpfungsketten erstellen
  - Übergaben an Solution Architecture und Requirements Engineering
  - Konzernweite Vereinheitlichung von Begriffen und Strukturen
  - Stakeholder-Management über Bereiche und Länder hinweg

## Beziehung zum OEA

- **Nutzungsfrequenz**: täglich
- **Hauptnutzung**: pflegen (Business-Modell), reviewen (Cross-Bereich-Konsistenz), generieren (Reports für Management)
- **Technisches Niveau**: mittel-hoch (kann Markdown, YAML, JSON Schema lesen; programmiert nicht, versteht aber Datenstrukturen)
- **Bevorzugte Schnittstelle**: UI primär (für Modellierung und Reviews), CLI/Export für Reports

## Aktuelle Pain Points

- **Fehlende strukturierte Business-Objekt-Modellierung in vielen Tools**: ArchiMate hat zwar Konzepte, aber kein dezidiertes Business-Object-Modell. ARIS hat es, ist aber proprietär und teuer.
- **Begriffs-Wildwuchs im Konzern**: Was in Deutschland "Kunde" heißt, ist in einer Tochter "Account", in einer anderen "Customer Master". Vereinheitlichung ohne Tool-Unterstützung mühsam.
- **Business Rules ungenügend formalisiert**: Geschäftsregeln existieren oft nur in Köpfen oder verstreut in Doku. Compliance-Audits decken Lücken auf.
- **Übergabe zwischen Business und IT bricht**: Business-Modelle werden für IT übersetzt, Übersetzungs-Verluste sind die Regel. Sie wünscht sich dieselbe Quelle für beide.
- **Business Capabilities ohne klare Abhängigkeiten**: Capability-Maps sehen schön aus, aber die Beziehungen zwischen Capabilities werden selten sauber erfasst.
- **Versionierte Business-Modelle fehlen**: Modelle ändern sich (M&A, Restrukturierungen, neue Geschäftsfelder), aber die Historie wird selten erfasst.
- **Cross-Border-Konsistenz**: Geschäftsmodelle in DE, US, APAC haben strukturelle Gemeinsamkeiten, aber auch Unterschiede. Ein Tool, das beides ausdrücken kann, ist selten.

## Concerns

| Concern | Kategorie | Severity |
|---|---|---|
| Strukturierte Business-Object-Modellierung als First-Class | functional | blocking |
| Versionierte Business-Modelle (Plateaus, Lifecycle) | functional | worrying |
| Business Rules formalisierbar und prüfbar | functional | worrying |
| Business Capabilities mit Beziehungen modellieren | functional | worrying |
| Cross-Bereich-Konsistenz (z.B. Begriffs-Mapping) | functional | worrying |
| Übergabe an Use Cases nahtlos (Business Objects referenzierbar) | usability | blocking |
| Generierung von Reports für Management | usability | worrying |
| Mehrsprachigkeit (DE/EN minimum für globalen Konzern) | usability | worrying |
| Compliance-Bezug der Business Rules (DSGVO, branchenspezifisch) | compliance | worrying |

## Erfolgskriterien

- [ ] Business Object kann strukturiert modelliert werden (Attribute, Typen, Beziehungen)
- [ ] Beziehungen zwischen Business Objects sind navigierbar und auswertbar
- [ ] Business Capabilities mit Abhängigkeiten modellierbar
- [ ] Business Rules referenzieren Business Objects und sind prüfbar
- [ ] Use Cases können Business Objects direkt referenzieren
- [ ] Begriffs-Mapping zwischen Konzern-Töchtern abbildbar
- [ ] Reports für Management automatisch generierbar (Capability-Heatmap, Business-Object-Übersicht)
- [ ] Versionierung der Business-Modelle über Plateaus
- [ ] Mehrsprachigkeit zumindest für Bezeichner und Beschreibungen

## Beteiligte Use Cases

<!-- Wird gefüllt, sobald Use Cases definiert sind -->

## Konzept-Bezüge

- [§7 Motivation, Stakeholder und Ziele](../../concept/20-entities/07-motivation-stakeholder-ziele.md)
- [§9 Prozess-Architektur](../../concept/20-entities/09-prozess-architektur.md) – Geschäftsprozesse
- [§13 Verlinkung Fach- und Technik-Ebene](../../concept/30-dynamics/13-fach-technik-verlinkung.md) – Business-IT-Brücke

## Notizen

Sabine ist die **fachliche Strukturgeberin**. Sie liefert das Domain Model, auf dem alles andere aufbaut: Use Cases verweisen auf ihre Business Objects, Requirements referenzieren ihre Business Rules, Solution Architect leitet seine Specs aus ihrer Domain-Struktur ab.

**Senior und global**: Sie hat genug Erfahrung, um auch komplexe Konzern-Realitäten zu modellieren. Ihr Tool darf anspruchsvoll sein, muss aber strukturell sauber und konsistent sein.

**Hebelwirkung**: Ihre Arbeit ist Multiplikator für alle nachfolgenden Rollen. Ein falsch modelliertes Business Object pflanzt sich durch Use Cases, Requirements und Code fort. Die Investition in saubere Business-Modellierung zahlt sich auf jeder nachfolgenden Ebene aus.

**Cross-Cultural-Komplexität**: In Globalkonzernen ist nichts trivial. "Customer" in den USA hat andere Pflichtfelder als in Deutschland (DSGVO!). Ihr Tool muss diese Varianten ausdrücken können, ohne zur Komplexitäts-Hölle zu werden.

**Verbindung zu CIO (SH-05)**: Sie liefert dem CIO die strukturelle Basis für strategische Entscheidungen. Capability-Heatmaps, Business-Object-Inventare, Compliance-Bezug der Geschäftslogik – das ist ihr Output.

**Verbindung zu Lukas (SH-02)**: Datenmodellierung profitiert direkt von ihrer Arbeit. Wenn Business Objects sauber modelliert sind, ist die Übersetzung in Data Entities mechanisch.

**Verbindung zu Franz (SH-01)**: Sie liefert ihm das Domain Model als Lernmaterial. Junior-Architekten verstehen ein Tool schneller, wenn die Business-Modelle vorhanden sind.

**Verbindung zu Michael (SH-04)**: Solution-Architekt greift auf ihre Business Objects zurück, um Komponenten zu strukturieren.
