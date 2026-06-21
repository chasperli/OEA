# ADR-003: Product vs. Project – Koexistenz oder Trennung?

**Status**: draft
**Datum**: TBD

## Kontext und Problem

Moderne IT-Organisationen arbeiten oft **product-orientiert** (langfristige Verantwortung, Product Owner, kontinuierliche Entwicklung). Klassische IT arbeitet **projekt-orientiert** (zeitlich begrenzt, definierter Scope, definitives Ende).

Das OEA muss beide Welten unterstützen können. Die offene Frage: Werden Products und Projects als **separate EntityTypes** modelliert, oder als **Stereotypen eines gemeinsamen Konzepts** (z.B. "Initiative")?

## Entscheidungstreiber

- **Realität abbilden**: Die meisten Organisationen haben beides parallel
- **PPM-Integration**: bestehende Projekt-Tools (Jira, MS Project) sind project-zentriert
- **Lifecycle-Unterschiede**: Products haben keinen End-Date, Projects schon
- **Reporting**: Manche Reports brauchen einheitliche Sicht, andere getrennt

## Betrachtete Optionen

### Option 1: Getrennte EntityTypes (Product, Project)
- Pro: jeweils eigene Properties klar definiert
- Contra: Code-Duplizierung, schwierigere übergreifende Sichten

### Option 2: Gemeinsames Konzept (Initiative) mit Stereotypen (ProductInitiative, ProjectInitiative)
- Pro: einheitliches Modell, flexibel erweiterbar
- Contra: Stereotype-Komplexität, evtl. unnötige Properties

### Option 3: WorkPackage als Basis, Product und Project als Aggregat-Stereotypen
- Pro: Konsistenz mit bestehendem WorkPackage-Konzept
- Contra: WorkPackage ist eher tactical, Product/Project sind strategical

## Entscheidung

TBD.

## Bezüge

**Konzept-Kapitel**:
- [§18 PPM-Integration](../concept/60-integrations/18-ppm-integration.md)
- [§11 Temporales Modell](../concept/30-dynamics/11-temporales-modell.md)

**Offener Punkt im Konzept**: §23, Punkt 11

## Notizen

Empfehlung im Konzept tendiert zu Option 2 (Stereotypen). Validierung mit konkreten Use Cases nötig.
