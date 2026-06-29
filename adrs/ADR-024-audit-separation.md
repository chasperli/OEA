# ADR-024: Audit-Datenhaltung — separates Schema, konfigurierbar als externe Datenbank

**Status**: accepted
**Datum**: 2026-06-29
**Entscheider**: [Lukas – Repository-Inhaber](../business-analysis/stakeholders/SH-01-lukas-enterprise-architect.md)

---

## Kontext

Audit-Logs unterliegen in regulierten Branchen besonderen Anforderungen:
- **Unveränderlichkeit**: kein UPDATE/DELETE durch die Applikation
- **Aufbewahrungspflicht**: 7–10 Jahre (je nach Regulierung)
- **Separate Zugriffsrechte**: Revisoren brauchen Lesezugriff, die App nur INSERT
- **Regulatorische Abfragbarkeit**: einzelne Felder müssen direkt indiziert sein (kein JSONB-Payload)
- **Trennung von Systemdaten**: bei Compliance-Audits darf der Audit-Trail nicht mit Betriebsdaten
  vermischt sein

Das bisherige `audit_events`-Modell mit `payload JSONB` erfüllt keine dieser Anforderungen.

---

## Entscheidung

### Schema-Separation

Alle Audit-Tabellen werden im Schema **`audit`** geführt, getrennt vom Applikationsschema `public`.

**Default (Community / einfache Deployments)**: `audit`-Schema in derselben Datenbank wie die
Applikationsdaten. Konfigurierbar via `oea.datasource.audit.url` — falls gesetzt, schreibt OEA
die Audit-Daten in eine eigene Datenbank.

```yaml
# application.yml (Auszug)
oea:
  datasource:
    audit:
      url:      ${OEA_AUDIT_DB_URL:}          # leer = App-DB verwenden
      username: ${OEA_AUDIT_DB_USER:}
      password: ${OEA_AUDIT_DB_PASS:}
```

Spring konfiguriert bei gesetzter URL eine zweite `DataSource` und einen zweiten
`EntityManagerFactory` für das `audit`-Package. Ist die URL leer, verwendet OEA die App-`DataSource`
und schreibt in `audit.*` derselben DB.

### Datenbankrechte

Der App-Benutzer erhält auf `audit.*` ausschliesslich `INSERT`-Rechte:
```sql
GRANT INSERT ON ALL TABLES IN SCHEMA audit TO oea_app;
REVOKE UPDATE, DELETE ON ALL TABLES IN SCHEMA audit FROM oea_app;
```

Ein separater Lese-Benutzer für Revisoren:
```sql
GRANT SELECT ON ALL TABLES IN SCHEMA audit TO oea_auditor;
```

### Normalisierte Tabellenstruktur

Kein JSONB-Payload. Jedes Feld ist direkt abfragbar und indizierbar.

**`audit.events`** — Event-Header:
```
id             BIGSERIAL PK
event_type     TEXT NN   -- z.B. 'entity.created', 'entity.property_changed', 'entity.deleted'
entity_id      INTEGER   -- Soft-Referenz (kein FK — Audit-DB kann extern sein)
entity_name    TEXT      -- denormalisiert für Tamper-Nachweis
actor_id       BIGINT    -- Soft-Referenz
actor_name     TEXT NN   -- denormalisiert (Person kann später anonymisiert werden)
actor_email    TEXT NN   -- denormalisiert
source         TEXT NN   -- enum: UI | API | Job | Import
occurred_at    TIMESTAMPTZ NN DEFAULT NOW()
request_id     TEXT      -- Korrelations-ID (HTTP-Request oder Job-Run)
prev_hash      TEXT      -- SHA-256 des Vorgänger-Records (Enterprise: Tamper-Chain)
record_hash    TEXT      -- SHA-256(prev_hash || event_type || entity_id || occurred_at || …)
```

**`audit.event_changes`** — Property-Deltas pro Event:
```
id               BIGSERIAL PK
event_id         BIGINT NN   -- FK→audit.events.id (oder Soft-Ref bei externer DB)
property_name    TEXT NN     -- denormalisiert ('name', 'lifecycle', 'version', …)
system_field     BOOLEAN NN DEFAULT false  -- true = System-Feld, false = user-defined Property
old_value        TEXT        -- serialisiert als Text (DB-agnostisch)
new_value        TEXT        -- serialisiert als Text
```

### Denormalisierung für Tamper-Nachweis

`actor_name`, `actor_email` und `entity_name` werden zum Zeitpunkt des Events gespeichert,
auch wenn die Person später anonymisiert oder die Entität gelöscht wird. Der Audit-Trail
bleibt vollständig und unveränderlich.

### Tamper-Chain (optional, Enterprise)

`prev_hash` und `record_hash` ermöglichen eine kryptographische Verkettung aller Audit-Records.
Eine Lücke oder Manipulation ist rechnerisch nachweisbar. Im Community-Betrieb werden diese
Felder nicht befüllt (NULL). Im Enterprise-Betrieb aktivierbar via Konfiguration:

```yaml
oea:
  audit:
    hash-chain-enabled: ${OEA_AUDIT_HASH_CHAIN:false}
```

### Aufbewahrung

Konfigurierbare Retention-Policy via Cron-Job (DELETE WHERE occurred_at < NOW() - INTERVAL):
```yaml
oea:
  audit:
    retention-days: ${OEA_AUDIT_RETENTION_DAYS:2555}  # Default: 7 Jahre
```
Der Delete-Job läuft als `oea_audit_cleanup`-Benutzer mit DELETE-Recht — nicht der App-Benutzer.

---

## Abgrenzung zu entity_property_value_history

| Aspekt | `entity_property_value_history` | `audit.event_changes` |
|---|---|---|
| Zweck | Restore (UC-15/UC-16) | Compliance, Nachvollziehbarkeit (UC-14) |
| Schema | `public` | `audit` |
| Zugriff App | READ + WRITE | INSERT only |
| Denormalisierung | nein (FKs) | ja (actor_name, entity_name) |
| Aufbewahrung | solange Entity existiert | konfigurierbar (Default 7 Jahre) |
| Inhalt | typed value-Spalten | TEXT (serialisiert) |
| Tamper-Schutz | nein | optional (hash_chain) |

Beide Tabellen werden parallel befüllt, wenn eine Entity-Änderung eintritt.

---

## Verworfene Alternativen

### JSONB payload (bisheriger Ansatz)
Nicht indizierbar, nicht portable (ADR-023), nicht regulatorisch abfragbar. **Verworfen**.

### Externes Audit-System (CloudTrail, Azure Monitor)
Maximale Isolation, aber Vendor-Lock-in, kein Self-Hosting möglich. **Verworfen** für Open-Source.

### Event Sourcing als primäres Modell
Hätte Audit als Nebenprodukt. Zu komplex für v1. **Zurückgestellt** auf v2.

---

## Konsequenzen

**Positiv:**
- Regulatorisch konform (Unveränderlichkeit, Aufbewahrung, Trennung)
- DB-agnostisch (kein JSONB)
- Revisoren bekommen eigenen Read-Only-Benutzer
- Optionale externe Audit-DB ohne Applikationsanpassung (nur Config)
- Tamper-Chain für Enterprise-Anforderungen nachrüstbar

**Negativ / Kompromisse:**
- Zwei DataSources erhöhen Komplexität der Spring-Konfiguration
- Denormalisierung (actor_name etc.) muss aktiv befüllt werden beim Schreiben
- Cleanup-Job braucht separaten DB-Benutzer

---

## Betroffene Konzept-Kapitel

- §14 (Audit und Versionierung), §15 (Sicherheit), §20 (Compliance/Konformanz)

## Verwandte ADRs

- ADR-019: Soft-Delete-Strategie
- ADR-022: Strukturiertes Property-Modell (entity_property_value_history)
- ADR-023: Multi-DB-Strategie (kein JSONB)
