# ADR-002: Enterprise Continuum – Ein Repository oder zwei?

**Status**: draft
**Datum**: TBD
**Entscheider**: TBD

## Kontext und Problem

Das TOGAF Enterprise Continuum unterscheidet zwischen Foundation/Industry/Common-Systems-Architecture (allgemein wiederverwendbare Bausteine) und Organization-Specific Architecture (organisationsspezifische Inhalte).

Die offene Frage: Werden diese in **einem Repository** mit Scope-Markierung gehalten, oder in **zwei getrennten Repositorys** (eine Continuum-Bibliothek, eine Organisations-Instanz)?

## Entscheidungstreiber

- **Wiederverwendbarkeit**: Continuum-Inhalte sollten organisationsübergreifend nutzbar sein
- **Lizensierung**: möglicherweise unterschiedliche Lizenzen für Continuum-Inhalte
- **Update-Pfad**: wie wird Continuum-Bibliothek aktualisiert, ohne lokale Anpassungen zu verlieren?
- **OSS-Verteilung**: Continuum-Bibliotheken als eigene Pakete distribuieren

## Betrachtete Optionen

### Option 1: Ein Repository, Scope-Property
- Pro: einfache Architektur, einheitliche API
- Contra: schwierig zu trennen für externe Verteilung

### Option 2: Zwei getrennte Repositorys, Continuum als Referenz
- Pro: Continuum als eigenes OSS-Paket, klare Trennung
- Contra: komplexere Resolution, Versions-Management

### Option 3: Ein Repository, aber mit Sub-Repository-Mechanismus
- Pro: Continuum eingebettet, aber separat versioniert (Git-Submodule oder Package-Mechanismus)
- Contra: technische Komplexität

## Entscheidung

TBD.

## Konsequenzen

TBD.

## Bezüge

**Konzept-Kapitel**:
- [§4 Enterprise Continuum und TRM](../concept/10-foundations/04-enterprise-continuum-trm.md)

**Offener Punkt im Konzept**: §23, Punkt 13

## Notizen

Beispiel-Anwendungsfall: Eine Organisation will TOGAF TRM nutzen + eigene Architektur-Patterns. Wie kommen TRM und Patterns ins Repository, ohne dass die Organisation den TRM-Inhalt manuell pflegen muss?
