# ADR-005: Application-vs-Technology-Klassifikations-Prinzip (Default)

**Status**: draft
**Datum**: TBD

## Kontext und Problem

§6.1.1 fordert von jeder Organisation ein verbindliches Architektur-Prinzip, das die Abgrenzung Application vs. Technology festlegt. Zwei legitime Varianten sind dokumentiert:

- **Variante A**: Plattform-Services sind Technology (auch bei eigenem Betriebsteam)
- **Variante B**: Produkte mit Product Owner sind Applications (auch bei technischem Charakter)

Die offene Frage für das Tool: Welche Variante gilt als **Default-Prinzip** im Auslieferungszustand? Oder bleibt es bewusst undefiniert?

## Entscheidungstreiber

- **Open-Source-Charakter**: Default sollte breiten Konsens haben
- **Nicht-Erzwingung**: Tool soll Wahl nicht abnehmen
- **Pragmatik**: ohne Default müssen alle Erstnutzer eine Entscheidung treffen, bevor sie modellieren können

## Betrachtete Optionen

### Option 1: Variante A als Default ("Plattform-as-Technology")
- Pro: klassischere TOGAF-Lesart, einfacher zu kommunizieren
- Contra: passt nicht zu modernen Product-Organisationen

### Option 2: Variante B als Default ("Plattform-as-Application")
- Pro: passt zu modernen Product/Platform-Engineering-Trends
- Contra: weicht von klassischer EA-Lehre ab

### Option 3: Bewusst undefiniert, Erstnutzer muss wählen
- Pro: zwingt zur bewussten Entscheidung
- Contra: höhere Einstiegshürde

### Option 4: Variante A als Default, Wechsel jederzeit möglich
- Pro: pragmatischer Mittelweg
- Contra: Wechsel später aufwändig

## Entscheidung

TBD.

## Bezüge

**Konzept-Kapitel**:
- [§6.1.1 Application vs. Technology](../concept/20-entities/06-kern-entitaetstypen.md)

**Offener Punkt im Konzept**: §23, Punkt 40
