---
id: entity-version
title: EntityVersion – Entitäts-Versionsschnappschuss
version: 0.1.0
status: draft
created: 2026-06-27
last_updated: 2026-06-27
author: business-engineer
references:
  business_objects:
    - entity
    - person
  adrs:
    - adrs/ADR-016-persistenz-strategie.md
  use_cases:
    - UC-14
    - UC-15
---

# EntityVersion – Entitäts-Versionsschnappschuss

## Zweck

`EntityVersion` ist der unveränderliche Schnappschuss einer `ArchitectureEntity` zu einem bestimmten Versionsstand. Vor jeder Änderung an einer Entität wird der aktuelle Zustand als `EntityVersion`-Datensatz gesichert — zusammen mit Metadaten zur Änderung (wer, wann, warum, welche Felder). Dadurch ist die vollständige Änderungshistorie jederzeit nachvollziehbar und frühere Zustände können in UC-15 wiederhergestellt werden.

`EntityVersion`-Datensätze sind **nie editierbar oder löschbar**. Sie bilden die Audit-Grundlage des Repositories.

## Attribute

### EntityVersion

| Attribut | Typ | Optional | Default | Constraints | Beschreibung |
|---|---|---|---|---|---|
| id | UUID | required | | v4, global eindeutig | Primärschlüssel |
| entityId | integer | required | | FK → ArchitectureEntity.id; unveränderlich | Entität, zu der dieser Schnappschuss gehört |
| versionNumber | integer | required | | ≥ 1; eindeutig pro entityId | Versionsnummer, die dieser Schnappschuss repräsentiert; entspricht `ArchitectureEntity.version` zum Zeitpunkt der Sicherung |
| snapshot | JSON | required | | unveränderlich nach Anlage | Vollständiger Entitätszustand zu `versionNumber`; enthält alle wiederherstellbaren Felder (siehe unten) |
| appliedAt | datetime | required | | ISO 8601, UTC | Zeitpunkt, zu dem die Entität von `versionNumber` zu `versionNumber+1` übergegangen ist |
| appliedBy | reference | required | | target: person | Person, die die Änderung vorgenommen hat |
| changeReason | string | optional | null | max. 1000 Zeichen | Optionale Begründung, die beim Update angegeben wurde |
| changedFields | string[] | required | [] | Dot-Notation; z.B. `["name", "properties.owner"]` | Felder, die sich in der Transition von `versionNumber` zu `versionNumber+1` geändert haben |
| restoredFromVersion | integer | optional | null | FK → EntityVersion.versionNumber derselben entityId | Gesetzt, wenn diese Transition eine Wiederherstellung war (UC-15); gibt an, aus welchem früheren Stand wiederhergestellt wurde |

### Snapshot-Inhalt

Das `snapshot`-JSON enthält **alle** Felder der Entität zum Zeitpunkt `versionNumber` — einschliesslich systemseitig unveränderlicher Felder. Der Snapshot ist ein vollständiges, in sich lesbares Abbild des Entitätszustands: Ein Auditor oder ein Wiederherstellungs-Prozess soll den Zustand zu jedem Zeitpunkt vollständig rekonstruieren können, ohne weitere Daten nachschlagen zu müssen.

| Feld im Snapshot | Typ | Beschreibung |
|---|---|---|
| `id` | integer | Primärschlüssel der Entität |
| `entityTypeId` | string | Metatyp zum Zeitpunkt dieser Version |
| `name` | string | Anzeigename |
| `description` | string | Fachliche Beschreibung |
| `isLogical` | boolean | Logisch/physisch-Flag |
| `stereotypeIds` | string[] | Zugewiesene Stereotypes |
| `properties` | object | Key-Value-Map der Custom-Properties |
| `sourceEntityId` | integer \| null | Quell-Entität (nur bei Verbindungen) |
| `targetEntityId` | integer \| null | Ziel-Entität (nur bei Verbindungen) |
| `createdAt` | datetime | Anlage-Zeitstempel |
| `createdBy` | string | Anlage-Person (ID) |
| `updatedAt` | datetime \| null | Zeitpunkt der letzten Änderung vor diesem Snapshot |
| `updatedBy` | string \| null | Person der letzten Änderung vor diesem Snapshot |
| `version` | integer | Versionsnummer zum Zeitpunkt der Sicherung (identisch mit `versionNumber`) |

Bei der Wiederherstellung (UC-15) werden trotz vollständigem Snapshot nur die **wiederherstellbaren** Felder auf die Entität angewendet (`name`, `description`, `isLogical`, `stereotypeIds`, `properties`). Die unveränderlichen Felder im Snapshot dienen ausschliesslich dem Audit-Zweck.

## Beziehungen

| Beziehung | Ziel-Objekt | Kardinalität | Optional | Beschreibung |
|---|---|---|---|---|
| versionOf | [entity](./entity.md) | n:1 | no | Jeder Schnappschuss gehört zu genau einer Entität |
| appliedByPerson | [person](./person.md) | n:1 | no | Person, die die Transition ausgelöst hat |

## Business Rules

| Rule-ID | Aussage | Auslöser | Compliance-Bezug |
|---|---|---|---|
| BR-01 | Vor **jedem** Update auf eine `ArchitectureEntity` MUSS ein `EntityVersion`-Datensatz des aktuellen Zustands geschrieben werden, bevor die Änderung angewendet wird | onUpdate (entity) | ADR-016 |
| BR-02 | `EntityVersion`-Datensätze sind nach Anlage **unveränderlich und nicht löschbar** — weder über API noch über GUI | immer | ADR-016 |
| BR-03 | `versionNumber` + `entityId` bilden zusammen einen eindeutigen Schlüssel; es darf kein zweiter Schnappschuss für dieselbe Entität und dieselbe Versionsnummer existieren | onCreate | – |
| BR-04 | Das Schreiben des `EntityVersion`-Datensatzes und das Anwenden der Entitätsänderung MÜSSEN in **derselben DB-Transaktion** erfolgen; schlägt die Transaktion fehl, wird weder Schnappschuss noch Änderung persistiert | onUpdate (entity) | ADR-016 |
| BR-05 | `changedFields` MUSS mindestens ein Element enthalten; ein Update, das keinen Feldwert ändert, darf keine `EntityVersion` erzeugen und MUSS mit HTTP 304 abgewiesen werden | onCreate | – |
| BR-06 | Wenn `restoredFromVersion` gesetzt ist, MUSS der referenzierte `versionNumber`-Wert für dieselbe `entityId` in `entity_versions` existieren | onCreate | UC-15 |
| BR-07 | Der `snapshot` enthält ALLE Felder der Entität und wird nicht validiert oder transformiert — er ist eine exakte, vollständige Kopie des Entitätszustands zum Zeitpunkt der Sicherung, auch wenn spätere Metamodell-Änderungen einzelne Werte obsolet machen | onCreate | – |

## Lifecycle

`EntityVersion`-Datensätze haben keinen Lifecycle. Sie entstehen bei jedem Entity-Update und existieren dauerhaft. Es gibt keinen `deleted`-Zustand.

Ausnahme: wenn eine `ArchitectureEntity` hard-gelöscht wird (noch kein UC dafür), ist zu entscheiden, ob die zugehörigen `EntityVersion`-Datensätze kaskadierend gelöscht oder als „verwaiste" Audit-Records erhalten bleiben. Bis zur Entscheidung: kein Löschen.

## Beispiel

*Entität „SAP ERP" (id=42) wird von Kurt dreimal bearbeitet:*

| EntityVersion | versionNumber | appliedAt | appliedBy | changedFields | restoredFromVersion |
|---|---|---|---|---|---|
| Snapshot 1 | 1 | 2026-03-01T09:00Z | Kurt | `["description"]` | null |
| Snapshot 2 | 2 | 2026-05-15T14:30Z | Michael | `["properties.owner", "properties.criticality"]` | null |
| Snapshot 3 | 3 | 2026-06-27T10:00Z | Kurt | `["name", "description", "properties.owner"]` | 1 |

Snapshot 3 zeigt `restoredFromVersion=1`: Kurt hat die Entität auf den Stand von Version 1 zurückgesetzt (UC-15). Der Snapshot 3 selbst enthält den Zustand, den die Entität kurz vor der Wiederherstellung hatte (= Zustand von v3), so dass auch dieser Stand in der Historie erhalten bleibt.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-27 | Business Engineer | Initial draft; Grundlage für UC-14 (Änderungshistorie) und UC-15 (Wiederherstellung); Snapshot-Inhalt, BRs und Lifecycle definiert |
