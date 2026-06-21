# ADR-004: Reifikations-Details (Max-Tiefe, Adressierung, UI)

**Status**: draft
**Datum**: TBD

## Kontext und Problem

Das Konzept erlaubt **reifizierte Relationen**: Relationen können selbst Endpunkte anderer Relationen sein (siehe §2.1). Zu klären sind drei Detail-Fragen:

1. **Maximale Reifikations-Tiefe**: Default-Vorschlag 2 – passt das für alle realistischen Fälle?
2. **Relation-Adressierung**: Alle Relationen per URN erreichbar oder nur die mit Meta-Properties?
3. **UI-Darstellung**: Wie werden reifizierte Relationen in Diagrammen und Listen angezeigt?

## Entscheidungstreiber

- **Komplexität vermeiden**: Zu viel Reifikation führt zu unverständlichen Modellen
- **Performance**: Jede adressierbare Relation kostet Storage und Index-Aufwand
- **Visualisierungs-Möglichkeit**: Manche Notationen können reifizierte Relationen schlecht darstellen
- **API-Konsistenz**: Adressierungs-Schema sollte einheitlich sein

## Betrachtete Optionen pro Frage

### Frage 1: Max-Tiefe

- Option A: Default 2, pro Schema konfigurierbar
- Option B: Default 1, harte Grenze
- Option C: Unbegrenzt mit Warnung ab Tiefe 3

### Frage 2: Adressierung

- Option A: Alle Relationen haben URN (`/api/v1/relations/{urn}`)
- Option B: Nur Relationen mit Meta-Properties haben URN
- Option C: URN erst on-demand bei erster Reifikations-Nutzung

### Frage 3: UI

- Option A: Reifizierte Relation als Knoten in Diagrammen
- Option B: Klein-Symbol auf der Kante
- Option C: Tooltip/Detail-View bei Klick auf Relation

## Entscheidung

TBD.

## Bezüge

**Konzept-Kapitel**:
- [§2.1 Reifikation](../concept/00-overview/02-meta-metamodell.md)

**Offene Punkte im Konzept**: §23, Punkte 30-32
