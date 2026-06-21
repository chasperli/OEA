---
identifier: {{english-kebab-case-id}}
name_de: {{Deutscher Name}}
name_en: {{English Name}}
version: 0.1.0
status: draft  # draft | reviewed | approved | deprecated
maturity: initial  # initial | developing | stable | mature
owner_role: {{Role-ID oder Rollen-Bezeichnung}}
aliases:
  - {{Synonym oder Bezeichnung in anderem Bereich}}
related_capabilities:
  - {{capability-id}}
references:
  - concept: concept/20-entities/06-kern-entitaetstypen.md
  - external: {{optional: Link zu externer Norm wie BIAN, ISO}}
---

# Business Object: {{Name}}

<!--
Verwendung: Ein Business Object pro Datei, strukturiert modelliert.
Dateiname: business-objects/<identifier>.md
Identifier sprachneutral in english-kebab-case (z.B. customer, sales-order, master-contract)
-->

## Definition

Eine prägnante Definition in einem bis zwei Sätzen. Was ist das Business Object eindeutig? Wodurch ist es von ähnlichen Objekten abgegrenzt?

## Beschreibung

Erweiterte Beschreibung: Kontext, fachlicher Zweck, typische Lebensdauer.

## Attribute

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| {{name}} | string \| integer \| decimal \| boolean \| date \| datetime \| enum \| reference \| composite | required \| optional | {{default-wert}} | {{z.B. max 255, regex...}} | {{Bedeutung}} |
| | | | | | |

**Notation**:
- `reference` → verweist auf anderes Business Object, mit `target: <object-id>`
- `enum` → Wertemenge auflisten, z.B. `[active, inactive, archived]`
- `composite` → eingebettete Struktur, in separater Tabelle aufschlüsseln

## Beziehungen

Beziehungen zu anderen Business Objects:

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| {{beziehungsname}} | [{{object-id}}](./{{object-id}}.md) | 1:1 \| 1:n \| n:m | yes \| no | {{Bedeutung}} |
| | | | | |

**Hinweise**:
- Beziehungs-Richtung ist semantisch wichtig (z.B. "Order belongsTo Customer")
- Bei n:m: ggf. eigenes Verbindungs-Objekt modellieren

## Lifecycle

Zustände, die das Business Object durchlaufen kann:

```
{{initial-state}} → {{state-1}} → {{state-2}} → {{terminal-state}}
                       ↓
                   {{alternative-state}}
```

**Zustände**:
- `{{state}}`: Bedeutung, wie wird erreicht, was darf in diesem Zustand
- ...

**Übergänge**:
- `{{from}} → {{to}}`: Trigger, Berechtigung, Folgen

## Business Rules

Geschäftsregeln, die für dieses Business Object gelten:

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-{{NN}} | {{z.B. "Customer mit personalDataCategory MUSS legalBasis haben"}} | {{onCreate, onUpdate}} | {{DSGVO Art. 6}} |
| | | | |

Bei komplexen Regeln: eigene Datei in `business-objects/rules/BR-NN-name.md` und hier verlinken.

## Beispiele

Konkrete Beispiele helfen beim Verständnis:

**Beispiel 1**: {{name}}
```yaml
{{attribute1}}: {{wert1}}
{{attribute2}}: {{wert2}}
```

**Beispiel 2**: {{name}}
```yaml
{{...}}
```

## Begriffs-Mapping

Wenn das Objekt in unterschiedlichen Geschäftsbereichen unterschiedlich bezeichnet wird:

| Bereich | Bezeichnung | Hinweis |
|---|---|---|
| {{DACH}} | {{Bezeichnung DE}} | |
| {{US}} | {{Bezeichnung EN}} | |
| {{APAC}} | {{Bezeichnung}} | {{ggf. semantische Abweichungen}} |

## Abgrenzung zu ähnlichen Objekten

Was dieses Objekt **nicht** ist, im Vergleich zu verwandten:

- **NICHT** {{verwandtes Objekt 1}}: weil ...
- **NICHT** {{verwandtes Objekt 2}}: weil ...

## Verwendung in Use Cases

<!-- Wird automatisch oder manuell gepflegt: welche UCs nutzen dieses Business Object? -->

- [UC-NN: Titel](../requirements/use-cases/UC-NN-kurzname.md)

## Konzept-Bezug

- [§{{N}} {{Kapitel}}](../concept/...)

## Notizen

Freitext für Modellierungs-Entscheidungen, offene Fragen, Diskussionen.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | YYYY-MM-DD | Business Engineer | Initial draft |
