# ADR-003: Product vs. Project – Koexistenz oder Trennung?

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
**Konsultiert**: Requirements Engineer (metamodel-configuration.md, solution.md)
**Informiert**: alle Stakeholder

---

## Kontext und Problem

Moderne IT-Organisationen arbeiten product-orientiert (langfristige Verantwortung, kein End-Datum) und projekt-orientiert (zeitlich begrenzt, definierter Scope). OEA muss beide Welten unterstützen. Die offene Frage: Werden Product und Project als separate EntityTypes modelliert, oder als Stereotypen eines gemeinsamen Konzepts?

**Bereits getroffene Vorentscheidung** (metamodel-configuration.md): OEA ist metamodell-getrieben — EntityTypes sind keine hardcodierten Klassen, sondern konfigurierbare EntityTypeDefinitions mit `extends`-Mechanismus. Separate „hardcodierte" EntityTypes für Product und Project widersprechen diesem Ansatz.

## Entscheidungstreiber

- **Metamodell-Konsistenz**: keine Sonderbehandlung für Product/Project; selbes Modell wie alle anderen Typen
- **Realität abbilden**: beide Konzepte koexistieren in der meisten Organisationen
- **PPM-Integration**: Lifecycle-Unterschiede (endDate optional/pflicht) über Properties abbildbar
- **Erweiterbarkeit**: Org-spezifische Subtypen (z.B. `CapexProject`, `InternalProduct`) müssen möglich sein

## Betrachtete Optionen

### Option 1: Getrennte EntityTypes (hardcodiert)
- Pro: Properties klar getrennt; kein Stereotyp-Konzept nötig
- Contra: widerspricht Metamodell-Ansatz; Org kann keine eigenen Sub-Varianten definieren; Code-Duplizierung im Backend

### Option 2 (gewählt): Gemeinsames built-in Konzept + Subtypen im Metamodell
- `work-initiative` als built-in EntityType (scope=built-in, isBuiltIn=true)
- `product` und `project` als built-in Subtypen (`extends: work-initiative`)
- Lifecycle-Unterschiede über Properties und `creationSteps` (REQ-066 Wizard)
- Org kann eigene Subtypen definieren: `capex-project extends project`, `platform-product extends product`
- Pro: vollständige Metamodell-Konsistenz; erweiterbar; kein Sondercode
- Contra: Admin muss verstehen, dass product/project konfigurierbare Typen sind (nicht „eingebaut")

### Option 3: WorkPackage als Basis
- Pro: Konsistenz mit WorkPackage-Konzept
- Contra: WorkPackage ist taktisch (Sprint, Task); Product/Project sind strategisch — konzeptuell falsche Basis

## Entscheidung

**Option 2 ist die Entscheidung.**

**Built-in EntityTypes** (scope=built-in, als Starter-Paket `oea-togaf-starter`):

```
work-initiative (built-in)
  ├── product        extends: work-initiative
  └── project        extends: work-initiative
```

**Properties**:

| Property | work-initiative | product | project |
|---|---|---|---|
| `name` | required | geerbt | geerbt |
| `description` | optional | geerbt | geerbt |
| `status` | `planned\|active\|closed` | geerbt | geerbt |
| `startDate` | optional | geerbt | required |
| `endDate` | optional | nicht genutzt (kein Ende) | required |
| `owner` | optional | required (Product Owner) | optional (Sponsor) |
| `budget` | optional | optional | optional |

**CreationSteps** (REQ-066 Wizard):
- `project`: Schritt 1 = Basisinfo (name, startDate, endDate), Schritt 2 = Domain-Zuordnung
- `product`: Schritt 1 = Basisinfo (name, owner), Schritt 2 = Domain-Zuordnung

**Connection-Typen** (built-in):
- `initiative-realizes-solution` (work-initiative → solution): verknüpft Initiative mit EA-Solution
- `initiative-part-of` (work-initiative → work-initiative): Programm/Projekt-Hierarchie

## Konsequenzen

### Positiv
- Keine Sonderbehandlung im Backend; product/project sind reguläre EntityTypeDefinitions
- Erweiterbar: `capex-project extends project` ohne Code-Änderung
- Catalog + Dashboard (UC-06, UC-07) funktionieren ohne Anpassung für diese Typen
- Wizard (REQ-066) deckt die unterschiedlichen Pflichtfelder über `creationSteps` ab

### Negativ / Trade-offs
- Erstnutzer ohne Metamodell-Kenntnisse könnten verwirrt sein, dass „Projekt anlegen" durch einen konfigurierbaren Typ erfolgt
- Lifecycle-Validierung (endDate bei project pflicht) muss im Wizard/API als Constraint abgebildet werden — nicht als hartes DB-Schema-Constraint

### Folgeentscheidungen
- `initiative-realizes-solution` Connection wird in solution.md ergänzt
- `work-initiative`-Typen als Teil des `oea-togaf-starter`-Pakets (ADR-002)

## Bezüge

**Konzept-Kapitel**:
- [§18 PPM-Integration](../concept/60-integrations/18-ppm-integration.md)
- [§11 Temporales Modell](../concept/30-dynamics/11-temporales-modell.md)

**Bezogene Business Objects**: metamodel-configuration.md (EntityTypeDefinition + extends), solution.md
