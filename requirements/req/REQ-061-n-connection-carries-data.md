---
id: REQ-061
title: n-Connection carries-data — DataFlow mit DataObject verknüpfen
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  use_cases:
    - UC-08
  business_objects:
    - entity
    - metamodel-configuration
  business_rules: []
  stakeholders:
    - SH-02
    - SH-03
  concept:
    - concept/20-entities/06-kern-entitaetstypen.md
    - concept/40-extensibility/14-erweiterbarkeit.md
  adrs:
    - ADR-010
supersedes: []
superseded_by: []
---

# REQ-061: n-Connection carries-data — DataFlow mit DataObject verknüpfen

## Aussage

Das System MUSS es ermöglichen, eine ArchitectureEntity vom Typ `carries-data` (`isConnection=true`) anzulegen, bei der `sourceEntityId` auf eine Connection-Entity (d.h. eine ArchitectureEntity mit `isConnection=true`, z.B. `data-flow`) zeigt und `targetEntityId` auf eine Nicht-Connection-Entity (z.B. `data-object`); dies setzt voraus, dass die EntityTypeDefinition des Source-Typs `allowsConnectionAsSource=true` hat. Jede `carries-data`-Instanz erhält eine eigene Integer-ID aus demselben instanzweiten Nummernraum.

## Begründung

Ohne n-Connections ist Lineage auf String-Referenzen (Property-String) angewiesen — semantisch schwach, nicht FK-validiert, schwer abfragbar. Die `carries-data`-Connection als First-Class-Entität ermöglicht traversierbare Lineage-Queries (REQ-062), typsichere Referenzen und spätere Erweiterungen (z.B. Column-Level-Lineage durch Properties auf `carries-data`). Dies ist der Kern-Differenzierungspunkt gegenüber Abacus/Avolution (ADR-010 proposed, Option B).

## Kontext

[ADR-010](../../adrs/ADR-010-n-connection-data-lineage.md) (proposed, Option B) beschreibt die Entscheidungsgrundlage. Dieses REQ setzt Option B voraus.

**Metamodell-Erweiterung (Voraussetzung)**:
`EntityTypeDefinition` in MetamodelConfiguration erhält ein neues Feld `allowsConnectionAsSource: bool` (Default: `false`). Für den EntityType `data-flow` wird dieses auf `true` gesetzt. Damit ist `data-flow` der einzige Typ (neben weiteren, wenn vom Architektur-Team konfiguriert), der als `sourceEntityId` in einer anderen Connection auftreten darf.

**entity.md BR-04 Lockerung**:
Aktuell: `sourceEntityId` MUSS auf Entity mit `isConnection=false` zeigen.
Neu: `sourceEntityId` darf auf Entity mit `isConnection=true` zeigen, sofern deren EntityTypeDefinition `allowsConnectionAsSource=true` hat.

**Tiefe**: v1.0 unterstützt genau eine Verschachtelungsebene (Connection-of-Connection). Eine `carries-data`-Connection darf nicht selbst wieder Source einer weiteren n-Connection sein.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- `entityTypeId`: `carries-data` (isConnection=true; allowsConnectionAsSource=false, da carries-data selbst keine weitere Connection-Quelle ist)
- `sourceEntityId`: Integer-ID einer ArchitectureEntity mit `isConnection=true` und `allowsConnectionAsSource=true` (z.B. DataFlow id=5)
- `targetEntityId`: Integer-ID einer ArchitectureEntity mit `isConnection=false` (z.B. DataObject id=42)
- `name`: optional (z.B. „ERP→DWH trägt Kundenstamm")

**Verarbeitung**:
1. Prüfe `sourceEntityId`: Entität muss existieren; ihr EntityType muss `allowsConnectionAsSource=true` haben → sonst HTTP 422
2. Prüfe `targetEntityId`: Entität muss existieren; ihr EntityType muss `isConnection=false` haben → sonst HTTP 422
3. Prüfe Tiefe: `sourceEntityId`-Entity darf nicht selbst eine n-Connection sein (`sourceEntityId.entityType.allowsConnectionAsSource` darf nicht referenzieren, dass carries-data selbst Quelle ist) → v1.0: max. 1 Ebene
4. System vergibt nächste freie Integer-ID
5. Persistieren; Audit-Log

**Ausgaben**:
- HTTP 201 mit vollständiger Entitäts-Repräsentation
- `sourceEntityId` und `targetEntityId` sind unveränderlich nach Anlage

**Fehlerfälle**:
- `sourceEntityId` zeigt auf Entität mit `allowsConnectionAsSource=false` → HTTP 422 mit Hinweis „EntityType X erlaubt keine Connection-Quelle"
- `targetEntityId` zeigt auf Connection-Entity → HTTP 422
- Beide IDs identisch → HTTP 422
- Tiefe > 1 verletzt → HTTP 422 „n-Connection-Tiefe überschritten (max. 1)"

## Akzeptanzkriterien

**AC1** (carries-data anlegen):
- Gegeben: DataFlow id=5 (`data-flow`, `allowsConnectionAsSource=true`); DataObject id=42 (`data-object`)
- Wenn: Lukas legt `carries-data`-Connection an mit sourceEntityId=5, targetEntityId=42
- Dann: HTTP 201; carries-data erhält eigene Integer-ID (z.B. 103); sourceEntityId=5 und targetEntityId=42 gesetzt

**AC2** (Ablehnung wenn source kein allowsConnectionAsSource):
- Gegeben: ApplicationComponent id=1 (`application-component`, `allowsConnectionAsSource=false`)
- Wenn: Lukas versucht carries-data mit sourceEntityId=1 anzulegen
- Dann: HTTP 422; Fehlermeldung benennt `application-component` als nicht als Connection-Quelle erlaubt

**AC3** (Ablehnung target=Connection):
- Gegeben: DataFlow id=5 (isConnection=true) als potenzielle targetEntityId
- Wenn: Lukas versucht carries-data mit targetEntityId=5 anzulegen
- Dann: HTTP 422

**AC4** (Unveränderlichkeit source/target):
- Gegeben: carries-data id=103 mit sourceEntityId=5, targetEntityId=42
- Wenn: Lukas versucht PUT mit sourceEntityId=6
- Dann: HTTP 422; source/target wurden nicht geändert

**AC5** (Tiefenbegrenzung v1.0):
- Gegeben: carries-data id=103; carries-data hat `allowsConnectionAsSource=false`
- Wenn: Lukas versucht, eine weitere Connection mit sourceEntityId=103 anzulegen
- Dann: HTTP 422 „n-Connection-Tiefe überschritten"

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Bestanden-Kriterium: AC1–AC5 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-060 (DataObject muss existieren); metamodel-configuration muss `allowsConnectionAsSource` auf EntityTypeDefinition unterstützen (Änderung BR-04 in entity.md)
- **Folgewirkungen**: REQ-062 (Lineage-API traversiert carries-data-Verbindungen); REQ-063 (Canvas zeigt 3-Punkte-Indikator wenn carries-data existieren)

## Realisierungs-Hinweise

- `POST /api/v1/entities` mit entityTypeId=`carries-data`; source/target validation serverseitig
- DB: gleiche `architecture_entities`-Tabelle wie alle anderen Entitäten; source_entity_id darf auf Rows mit isConnection=true zeigen (FK bleibt auf architecture_entities, keine separate Tabelle)
- Tiefencheck: beim Anlegen einer n-Connection prüfen ob `sourceEntity.entityType.allowsConnectionAsSource=true` AND `sourceEntity.entityType` selbst keine weitere n-Connection-Source-Erlaubnis erteilt

## Realisierung

- ADR(s): [ADR-010](../../adrs/ADR-010-n-connection-data-lineage.md) (proposed)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | requirements-engineer | Initial draft; n-Connection Option B gemäss ADR-010 |
