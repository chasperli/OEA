# ADR-001: URN-Schema und Stabilitäts-Garantien

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: Lukas (Repository-Inhaber)
**Konsultiert**: Requirements Engineer (entity.md, REQ-070)
**Informiert**: alle Stakeholder

---

## Kontext und Problem

Jede Entität im EA-Repository braucht eine eindeutige, stabile ID. Diese ID erscheint in API-Endpunkten, Querverweisen zwischen Entitäten, Audit-Logs, Versionsverfolgung und in externen Systemen (CMDB, GRC, PPM), die OEA referenzieren. Die Wahl prägt viele Folgeentscheidungen.

**Bereits getroffene Vorentscheidung** (entity.md v0.2.0): ArchitectureEntity.id ist ein **positiver ganzzahliger Wert (integer ≥ 1)**, instanzweit eindeutig, fortlaufend, unveränderlich nach Anlage. Alle bisherigen Requirements (REQ-070: `[[Name|entity:ID]]`), API-Endpunkte (`/api/v1/entities/{id}`) und User Stories verwenden bereits diese Integer-IDs. Die ADR-Entscheidung bestätigt und ergänzt diese implizite Vorentscheidung.

## Entscheidungstreiber

- **Stabilität**: ID muss über Jahre stabil bleiben, auch bei Umbenennung der Entität
- **Einfachheit der API**: Integer-IDs sind in REST-Pfaden, Joins und SQL nativ
- **Menschenlesbarkeit** der Verlinkung: `[[CRM-System|entity:42]]` — Name ist sichtbar, ID im Hintergrund
- **Globale Eindeutigkeit** für externe Referenzen (CMDB, Cross-Instanz)
- **Performance**: Integer-Join ist schneller als String-UUID-Join (relevant bei 500k Entitäten, REQ-074)

## Betrachtete Optionen

### Option 1: UUID v4 intern
- Pro: globale Eindeutigkeit ohne Instanz-Kontext
- Contra: nicht menschenlesbar; schlechter als Integer für DB-Performance bei JOIN-Operationen

### Option 2: Sprechende URN mit Hierarchie
- Pro: selbst-beschreibend (`urn:ea:org:application:crm-system`)
- Contra: instabil bei Umbenennung — widerspricht Stabilität-Treiber direkt

### Option 3 (gewählt): Integer-ID intern + konstruierbare externe URN
- **Intern**: positiver Integer (bereits durch entity.md etabliert)
- **Extern / Cross-Referenz**: `urn:oea:{instance-slug}:{integer-id}` (z.B. `urn:oea:acme-corp:42`)
- Pro: beste DB-Performance; Stabilität gewährleistet; extern konstruierbar; kein doppelter Pflege-Aufwand
- Contra: externe URN ohne semantischen Inhaltshinweis (Type nicht im URN)

### Option 4: ULID / sortable IDs
- Pro: zeitlich sortierbar
- Contra: nicht menschenlesbar; kein Mehrwert gegenüber Integer für diesen Anwendungsfall

## Entscheidung

**Option 3 ist die Entscheidung.**

- **Primär-ID**: `integer` (positiver Ganzzahl-Wert, automatisch vergeben, unveränderlich)
- **Externe Referenz-URN** (für CMDB-Integration, Cross-Instanz-Referenzen, Audit-Export): `urn:oea:{instance-slug}:{id}`
  - `instance-slug`: konfigurierbar beim Bootstrapping (z.B. `acme-corp`, `oea-demo`); unveränderlich nach erster Nutzung
  - `id`: die Integer-ID der Entität
  - Beispiel: `urn:oea:acme-corp:42`
- Der `name` einer Entität ist **kein Bestandteil der ID** — er ist ein veränderliches Attribut
- API-intern: immer Integer-Pfad (`/api/v1/entities/42`)
- Export-Format (ADR-002 Pakete, Audit-Log): URN-Format

## Konsequenzen

### Positiv
- Integer-IDs sind nativ in PostgreSQL, SQL-JOINs, Cursor-Paginierung (REQ-071) optimal
- Externe URN ist deterministisch aus bekannten Teilen konstruierbar — keine separate URN-Tabelle nötig
- Entity-Mention-Format `[[Name|entity:42]]` (REQ-070) ist konsistent mit dieser Entscheidung
- Stabile IDs sind Voraussetzung für ID-stabile Verlinkung in Arc42-Dokumenten (BR-07)

### Negativ / Trade-offs
- `instance-slug` muss beim Bootstrapping gesetzt werden und ist danach unveränderlich (sonst werden alle externen URNs ungültig)
- Keine Type-Information in der ID — externe Systeme müssen Type über API abfragen
- Cross-Instanz-Referenzen (z.B. OEA-Instanz A verweist auf Entität in OEA-Instanz B) sind über URN möglich, aber v1.0 löst diese Referenzen nicht automatisch auf

### Folgeentscheidungen
- Bootstrapping-REQ muss `instance-slug` als Pflichtfeld aufnehmen (ergänzt REQ-013/014)
- Export-Format für Audit-Log und Paket-Import (ADR-002) verwendet URN-Format

## Bezüge

**Konzept-Kapitel**:
- [§2 Meta-Metamodell](../concept/00-overview/02-meta-metamodell.md)
- [§15 Schema-Evolution](../concept/40-extensibility/15-schema-evolution.md)

**Abhängige ADRs**: ADR-002 (Paket-Format nutzt URN), ADR-004 (Reifikation — Connections haben ebenfalls Integer-IDs)

**Bezogene Requirements**: entity.md (BR-01–04), REQ-070 (Entity-Mention), REQ-013/014 (Bootstrapping)
