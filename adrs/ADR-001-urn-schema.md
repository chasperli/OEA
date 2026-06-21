# ADR-001: URN-Schema und Stabilitäts-Garantien

**Status**: draft
**Datum**: TBD
**Entscheider**: TBD
**Konsultiert**: TBD
**Informiert**: TBD

## Kontext und Problem

Jede Entität im EA-Repository braucht eine eindeutige, stabile ID. Diese ID erscheint in:
- API-Endpunkten (`/api/v1/entities/{urn}`)
- Querverweisen zwischen Entitäten
- Audit-Logs und Versionsverläufen
- Externen Systemen (CMDB, GRC, PPM), die OEA referenzieren

Die Wahl des URN-Schemas prägt sehr viele Folgeentscheidungen. Falsche Entscheidung führt später zu schwer reversiblen Migrations-Aufwänden.

## Entscheidungstreiber

- **Stabilität**: URNs müssen über Jahre stabil bleiben, auch wenn Entitäten umbenannt werden
- **Lesbarkeit**: idealerweise menschenlesbar (kein UUID-Wildwuchs)
- **Globale Eindeutigkeit**: kein Konflikt zwischen Repositorys verschiedener Organisationen
- **Pipeline-Eignung**: in Git-Files diff-bar und greppbar
- **Verlinkungs-Fähigkeit**: gut in Markdown und Code referenzierbar

## Betrachtete Optionen

### Option 1: UUID v4 (`f47ac10b-58cc-4372-a567-0e02b2c3d479`)
- Pro: globale Eindeutigkeit garantiert
- Contra: nicht menschenlesbar, schlecht für Querverweise in Doku

### Option 2: Sprechende URN mit Hierarchie (`urn:ea:org-xy:application:crm-system`)
- Pro: lesbar, hierarchisch, gruppierbar
- Contra: instabil bei Umbenennung

### Option 3: Stabile ID + sprechender Slug getrennt
- Pro: beides verfügbar (stabile UUID intern, Slug für Doku)
- Contra: zwei IDs zu pflegen

### Option 4: ULID oder andere sortable-IDs
- Pro: zeitlich sortierbar, kompakter als UUID
- Contra: nicht menschenlesbar

## Entscheidung

TBD nach Stakeholder-Analyse und ersten Use Cases.

## Konsequenzen

TBD.

## Bezüge

**Konzept-Kapitel**:
- [§2 Meta-Metamodell](../concept/00-overview/02-meta-metamodell.md)
- [§15 Schema-Evolution](../concept/40-extensibility/15-schema-evolution.md)

**Offener Punkt im Konzept**: §23, Punkt 2

## Notizen

Vor Entscheidung prüfen: Hat irgendein Stakeholder schon harte Anforderungen an URN-Format (z.B. CMDB-Integration zwingt UUID)?
