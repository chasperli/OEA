# ADR-010: Modellierung der DataFlow↔DataObject-Beziehung (n-Connection vs. Property-String)

**Status**: proposed
**Datum**: 2026-06-26
**Entscheider**: SH-02 (Lukas – Data Architekt), SH-03 (Kurt – Lead EA)
**Konsultiert**: SH-02 (Lukas), SH-03 (Kurt)
**Informiert**: alle Stakeholder

## Kontext und Problem

In [UC-08 (Data Lineage)](../requirements/use-cases/UC-08-data-lineage-modellieren.md) muss modelliert werden, welche **Datenobjekte** (`data-object`-Entitäten) ein **Datenfluss** (`data-flow`-Connection) transportiert. Das ist die Schlüsselbeziehung für traversierbare Lineage: „Welche Systeme berühren Datenobjekt X?"

Es gibt zwei grundlegend verschiedene Modellierungsansätze:

1. **Property-String** (`carriedDataObjectIds`): Der DataFlow speichert die referenzierten DataObject-IDs als kommaseparierten String in einem PropertyValue.
2. **n-Connection** (`carries-data`): Ein eigenständiger Connection-Typ verbindet die DataFlow-Connection als Quell-Entity mit der DataObject-Entity als Ziel. Eine Connection zeigt auf eine andere Connection als Quelle — das ist eine **n-Connection** (Connection zweiten Grades).

Abacus (Avolution) und viele andere EA-Tools unterstützen ausschliesslich direkte Kanten zwischen Knoten. Connections sind dort keine First-Class-Objekte, die selbst wieder als Endpunkt einer anderen Connection fungieren können. Dies ist eine strukturelle Einschränkung, die komplexe Beziehungsmodelle verhindert — z.B. „welche Sicherheitskontrolle greift auf welchen Datenfluss?" oder „welche Compliance-Anforderung gilt für welche Schnittstelle?".

OEA hat durch die `isConnection=true`-Semantik auf `EntityTypeDefinition` und das `sourceEntityId`/`targetEntityId`-Modell in `ArchitectureEntity` die **architektonische Grundlage für n-Connections** — die Frage ist, ob und wie weit dies freigegeben wird.

## Entscheidungstreiber

- **Ausdrucksstärke**: Kann das Modell beliebig komplexe Beziehungen zwischen Relationen abbilden? (Differenzierungsmerkmal gegenüber Abacus)
- **Abfragbarkeit**: Wie aufwändig ist die Lineage-Traversierung im Backend?
- **Renderer-Komplexität**: Kann React Flow (ADR-007) Kanten, die selbst Knoten einer anderen Kante sind, sinnvoll darstellen?
- **Migrierbarkeit**: Kann eine einfachere Lösung in v1.0 später ohne Datenverlust auf die mächtigere Lösung migriert werden?
- **Metamodell-Kontrolle**: Sollen Organisationen selbst entscheiden, welche Modellierungstiefe sie für Datenflüsse brauchen? (unterschiedliche Bedürfnisse je nach Compliance-Anforderungen)

## Betrachtete Optionen

### Option A: Property-String (`carriedDataObjectIds`)

Der `data-flow`-EntityType erhält eine PropertyDefinition `carriedDataObjectIds` (varchar). Werte: kommaseparierte Integer-IDs von `data-object`-Entitäten. Beispiel: `"42,43"`.

Die Lineage-API parst diesen String serverseitig und folgt den IDs.

- **Pro**:
  - Keine Änderung am Entity-Modell (BR-04 bleibt unverändert)
  - Einfach zu implementieren; kein spezielles Renderer-Handling
  - Funktioniert mit dem PropertyValue-System aus v0.6.0
- **Contra**:
  - Soft-Referenz: keine FK-Constraint; IDs können ungültig werden (entity.md E2)
  - String-Parsing im Backend bei jeder Lineage-Query (Performance bei vielen Datenflüssen)
  - Keine Typsicherheit: ein falscher Wert bricht die Lineage still
  - Nur ein fester Property-Name; für andere Relationship-Annotation-Bedarfe (z.B. Sicherheitskontrollen auf Datenflüssen) müssten weitere Property-Strings erfunden werden
  - Schwer erweiterbar: Column-Level-Lineage (Feld zu Feld) lässt sich in einem String nicht sauber abbilden

### Option B: n-Connection (`carries-data`)

Ein neuer EntityType `carries-data` (isConnection=true) wird im Metamodell definiert:
- `sourceEntityId` → ID einer `data-flow`-Connection (isConnection=**true**)
- `targetEntityId` → ID einer `data-object`-Entity (isConnection=false)

Dies setzt voraus, dass BR-04 in `entity.md` gelockert wird: `sourceEntityId` darf auch auf eine ArchitectureEntity zeigen, deren Metatyp `isConnection=true` ist — sofern der eigene EntityType dies explizit erlaubt (`allowsConnectionSource=true` auf EntityTypeDefinition, oder über Metamodell-Constraint geregelt).

```
SAP ERP (1) ──[data-flow: 5]──► Data Warehouse (2)
                   │
             [carries-data: 103]
                   │
                   ▼
            Kundenstamm (42)
```

- **Pro**:
  - Echter FK: `carries-data`-Entität hat sourceEntityId=5 (DataFlow) und targetEntityId=42 (DataObject); referentielle Integrität vollständig modellierbar
  - Erweiterbar: `carries-data` kann eigene PropertyDefinitions bekommen (z.B. `columnMapping`, `transformationRule`, `mandatory`)
  - n-Connection als allgemeines Prinzip: dasselbe Muster gilt für `security-control → data-flow`, `compliance-requirement → interface`, etc. — keine Sonderlösung, sondern generisches Modell
  - Column-Level-Lineage in v2.0 ohne Schemabruch erweiterbar (Property auf `carries-data`)
  - Traversierung sauber: Standard-Graph-Query ohne String-Parsing
  - **Klarer Wettbewerbsvorteil gegenüber Abacus**: Abacus kann keine Connections als Endpunkte anderer Connections modellieren; dies ist eine oft zitierte strukturelle Schwäche
- **Contra**:
  - BR-04 in `entity.md` muss angepasst werden (sourceEntityId darf auf Connection-Entity zeigen, wenn Metamodell dies erlaubt)
  - React Flow (ADR-007) rendert Kanten normalerweise zwischen Knoten; eine Kante, deren Quelle selbst eine Kante ist, benötigt spezielle Canvas-Darstellung (z.B. Kante als Ankerpunkt auf einer anderen Kante — Pattern bekannt aus Hypergraphen und BPMN-Annotations)
  - Komplexer im Backend: Graphtraversierung muss Connection-Entities als traversierbare Knoten verstehen
  - Benutzer müssen verstehen, dass eine Connection selbst auch als Source/Target auftreten kann — Learning Curve

### Option C: Hybridansatz (A für v1.0, Migration zu B in v2.0)

In v1.0 wird Option A implementiert (`carriedDataObjectIds` als Property-String). Das Datenmodell wird so designed, dass eine spätere Migration zu Option B möglich ist: die Property-IDs werden als Seed für die Generierung von `carries-data`-Verbindungen genutzt (Migrations-Skript).

- **Pro**:
  - v1.0 kann schneller geliefert werden
  - Kein Renderer-Sonderfall in v1.0
  - Migration zu B ist möglich, ohne bestehende DataFlow-Entitäten zu ändern
- **Contra**:
  - Technische Schuld: Property-String und n-Connection koexistieren temporär
  - Migrations-Skript ist fehleranfällig (was passiert mit unaufgelösten IDs?)
  - Wenn die Migration nie stattfindet, bleibt das Modell dauerhaft schwächer als es sein könnte

## Entscheidung

Wir wählen **Option B (n-Connection)**, weil es dem Kern-Designprinzip von OEA (Connections als First-Class-Entities mit Integer-IDs) entspricht, einen klaren Wettbewerbsvorteil gegenüber Abacus schafft und die Renderer-Frage durch das **3-Punkte-Kreis-Muster** gelöst ist.

**Renderer-Lösung (3-Punkte-Kreis, Referenz Obsidian)**:
Eine Connection, die über n-Connections mit weiteren Entitäten verknüpft ist (d.h. selbst `sourceEntityId` einer anderen Connection ist), erhält auf ihrer Linie im Canvas einen kleinen Kreis mit drei Punkten (`•••`). Doppelklick öffnet ein **Verbindungs-Panel** mit allen verknüpften Entitäten und Connections. Am oberen Rand des Panels befinden sich Filter-Chips, einen pro vorhandenem Connection-Typ (z.B. `carries-data (2)`, `security-control (1)`). Die Grundidee stammt aus Obsidians Graph-View / Hover-Preview.

**Metamodell-Kontrolle**:
`allowsConnectionAsSource: bool` (Default: `false`) wird als neues Feld auf `EntityTypeDefinition` in MetamodelConfiguration ergänzt. Nur EntityTypes mit `allowsConnectionAsSource=true` (z.B. `data-flow`) dürfen als `sourceEntityId` in einer anderen Connection auftreten. Dies regelt `entity.md BR-04` (Lockerung von `isConnection=false`-Pflicht auf `allowsConnectionAsSource=true`).

**Tiefe**: n-Connections sind für v1.0 **einmal verschachtelt** (Connection-of-Connection). Connection-of-Connection-of-Connection ist nicht im Scope von v1.0.

**Ausstehend vor Acceptance**: Formale Bestätigung, dass die Änderung von BR-04 (entity.md) und das neue Feld `allowsConnectionAsSource` auf EntityTypeDefinition freigegeben sind.

## Konsequenzen (vorläufig, je nach Entscheidung)

### Positive Konsequenzen

- **entity.md BR-04** wird gelockert: `sourceEntityId` darf auf eine ArchitectureEntity zeigen, deren Metatyp `isConnection=true` ist, sofern deren EntityTypeDefinition `allowsConnectionAsSource=true` hat
- **metamodel-configuration.md**: `allowsConnectionAsSource: bool` (Default: `false`) auf EntityTypeDefinition; nur explizit freigegebene Typen (z.B. `data-flow`) können in n-Connections als Quelle auftreten
- **Canvas**: 3-Punkte-Kreis-Indikator auf Connection-Linie; Doppelklick → Verbindungs-Panel mit Typ-Filtern (REQ-063)
- **Lineage-API**: Graph-Traversierung versteht Connection-Entities als traversierbare Zwischenknoten; keine String-Parserei (REQ-062)
- **Erweiterbar**: `carries-data` kann in v2.0 um `columnMapping`-Property für Column-Level-Lineage erweitert werden ohne Schemabruch

### Negative Konsequenzen / Trade-offs

- Komplexerer Canvas-Renderer (3-Punkte-Indikator muss bei jedem Laden berechnet werden: hat diese Connection n-Connections?)
- Backend muss Connection-Entities als Graphknoten (nicht nur Kanten) verstehen
- Nutzer-Lernkurve: dass eine Linie selbst ein Objekt ist, das weitere Verbindungen haben kann, ist konzeptuell anspruchsvoller als Property-Strings

### Folgeentscheidungen

- entity.md BR-04 anpassen (Freigabe `allowsConnectionAsSource=true`-Typen als source)
- MetamodelConfiguration v0.7.0: `allowsConnectionAsSource` auf EntityTypeDefinition

## Bezüge

**Konzept-Kapitel**:
- §6 Kern-Entitätstypen
- §13 Fach-Technik-Verlinkung (Lineage als Brücke)
- §14 Erweiterbarkeit

**Verwandte ADRs**:
- [ADR-007](./ADR-007-canvas-bibliothek.md) – React Flow als Canvas; Renderer-Fähigkeiten für n-Connection relevant
- [ADR-004](./ADR-004-reifikation-details.md) – Reifikation (Verbindungen als First-Class-Objekte); konzeptuell verwandt

**Use Cases / Requirements**:
- [UC-08: Datenflusskarte (Data Lineage) modellieren und analysieren](../requirements/use-cases/UC-08-data-lineage-modellieren.md)

**Business Objects**:
- [entity.md](../business-objects/entity.md) – BR-04 ist von dieser Entscheidung direkt betroffen
- [metamodel-configuration.md](../business-objects/metamodel-configuration.md) – ggf. `allowsConnectionAsSource` auf EntityTypeDefinition

## Notizen

Abacus (Avolution) Schwäche: Connections sind dort reine Kanten (Relationships), keine First-Class-Objekte. Es ist nicht möglich, eine Connection als Source oder Target einer anderen Connection zu definieren. Typische Folge: Annotation von Datenflüssen mit Sicherheitskontrollen, Compliance-Anforderungen oder Daten-Klassifikationen muss über Workarounds (Custom-Attribute auf der Kante als Freitext) realisiert werden – semantisch arm, nicht abfragbar.

OEA's Integer-ID auf jeder ArchitectureEntity (inklusive Connections) schafft die technische Grundlage für n-Connections. Die offene Frage ist nicht ob es geht, sondern **wie weit der Metamodell-Freiheitsgrad aufgemacht wird** und welche Darstellungslösung für den Canvas gewählt wird.

Column-Level-Lineage (Feld-zu-Feld-Mapping) ist für v1.0 explizit nicht im Scope (UC-08), aber der n-Connection-Ansatz (Option B) würde es ermöglichen, `carries-data` in v2.0 um eine `columnMapping`-Property zu erweitern — ohne Schemabruch.
