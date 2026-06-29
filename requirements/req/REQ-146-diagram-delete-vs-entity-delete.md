---
id: REQ-146
title: Delete from Diagram (DEL) vs. Delete Entity (Ctrl+DEL) via Context Menu
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-29
last_updated: 2026-06-29
author: requirements-engineer
references:
  use_cases:
    - UC-05
    - UC-14
    - UC-15
  business_objects:
    - diagram
    - architecture-element
  business_rules: []
  stakeholders:
    - SH-01
    - SH-03
    - SH-04
    - SH-07
  concept: []
  adrs:
    - ADR-019
supersedes: []
superseded_by: []
---

# REQ-146: Delete from Diagram (DEL) vs. Delete Entity (Ctrl+DEL) via Context Menu

## Aussage

Das System MUSS im Diagramm-Editor zwei semantisch verschiedene Lösch-Operationen anbieten:

1. **"Remove from Diagram" (DEL)**: Entfernt die Shape aus dem aktuellen Diagramm. Die referenzierte Entität in der Solution bleibt unverändert erhalten. Andere Diagramme, die dieselbe Entität referenzieren, sind nicht betroffen.

2. **"Delete Entity" (Ctrl+DEL)**: Löscht die Entität aus der Solution mittels Soft-Delete (ADR-019). Die Shape wird aus dem aktuellen Diagramm entfernt. Alle anderen Diagramme, die diese Entität referenzieren, MÜSSEN die Shape als "deleted" markieren oder automatisch entfernen (konfigurierbar). Die Entität ist über den Audit-Log wiederherstellbar (UC-15).

Beide Operationen MÜSSEN im Kontextmenü (Rechtsklick auf eine Shape) sowie als Tastenkürzel verfügbar sein.

## Begründung

Das Diagramm ist eine Sicht auf das Modell — keine eigenständige Datenquelle. Ein Architektelement existiert im Modell, bevor es in Diagrammen sichtbar gemacht wird. Diese Trennung muss auch beim Löschen klar kommuniziert werden. Irrtümliches "Delete Entity" kann Auswirkungen auf viele Diagramme haben und ist durch den Soft-Delete (ADR-019) reversibel — aber der Nutzer muss explizit bestätigen.

## Kontext

| Operation | Shortcut | Scope | Entity in Solution | Andere Diagramme |
|---|---|---|---|---|
| Remove from Diagram | DEL | nur dieses Diagramm | unverändert | unberührt |
| Delete Entity | Ctrl+DEL | Solution-weit | soft-deleted | Shape als "deleted" markiert |

Soft-Delete bedeutet: `deleted_at`, `deleted_by`, `deletionReason` gesetzt (ADR-019); Entität bleibt in DB, erscheint nicht in normalen Abfragen.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:

| Feld | Typ | Beschreibung |
|---|---|---|
| shapeId | uuid | ausgewählte Shape im Diagramm |
| operation | "remove-from-diagram" \| "delete-entity" | gewählte Lösch-Operation |

**Verarbeitung — Remove from Diagram**:

1. Nutzer drückt DEL oder wählt "Remove from Diagram" im Kontextmenü
2. Kein Bestätigungsdialog (nicht-destruktiv für das Modell)
3. `DELETE /api/v1/diagrams/{diagramId}/shapes/{shapeId}`
4. Shape verschwindet sofort aus dem Canvas
5. Log: "[INFO] Shape removed from diagram: <Name> — entity preserved"

**Verarbeitung — Delete Entity**:

1. Nutzer drückt Ctrl+DEL oder wählt "Delete Entity" im Kontextmenü
2. System zeigt Bestätigungsdialog: "Delete entity '<Name>' from the solution? This affects all diagrams referencing this entity. The entity can be restored via Audit Log."
3. Nutzer bestätigt → `DELETE /api/v1/entities/{entityId}` (Soft-Delete per ADR-019)
4. Shape wird aus aktuellem Diagramm entfernt
5. Alle anderen Diagramme: Shape wird als `status: deleted` markiert (grau, durchgestrichen) oder entfernt — abhängig von Nutzer-/Systemeinstellung
6. Log: "[WARN] Entity deleted: <Name> (<Type>) — soft-deleted, recoverable via Audit Log"

**Kontextmenü-Struktur** (auf Rechtsklick einer Shape):

```
Edit Properties
Add Connection
────────────────────
Remove from Diagram    DEL
Delete Entity          Ctrl+DEL
```

**Ausgaben**:

- Für "Remove": Shape nicht mehr auf Canvas; Entität weiterhin in Katalog/Explorer sichtbar
- Für "Delete Entity": Entität in Katalog als "deleted" markiert; Shape aus allen Diagrammen entfernt oder markiert

## Akzeptanzkriterien

**AC1** (Remove from Diagram — Modell unberührt):
- Gegeben: Shape "Catalog-Service" [AC] ist in Diagramm A und B
- Wenn: Nutzer drückt DEL auf Shape in Diagramm A
- Dann: Shape in Diagramm A weg; Shape in Diagramm B unverändert; Entität im Explorer vorhanden

**AC2** (Delete Entity — Bestätigungsdialog):
- Wenn: Nutzer drückt Ctrl+DEL auf Shape
- Dann: Bestätigungsdialog erscheint mit Warnung "affects all diagrams"; nur bei Bestätigung fortfahren

**AC3** (Delete Entity — Soft-Delete):
- Wenn: Nutzer bestätigt Delete Entity
- Dann: Entität hat `deleted_at` gesetzt; erscheint nicht mehr in normalen Katalog-Abfragen; ist über Audit Log wiederherstellbar (UC-15)

**AC4** (Delete Entity — andere Diagramme markiert):
- Wenn: Entität gelöscht, die in 3 weiteren Diagrammen als Shape vorkommt
- Dann: In diesen 3 Diagrammen wird die Shape als "deleted" markiert (grau, Warnung); kein stiller Datenverlust

**AC5** (Kontextmenü-Erreichbarkeit):
- Wenn: Nutzer rechtsklickt auf eine Shape
- Dann: Kontextmenü erscheint mit beiden Optionen inkl. Shortcuts; DEL und Ctrl+DEL funktionieren auch ohne Kontextmenü

**AC6** (Undo Remove from Diagram):
- Wenn: Nutzer hat Shape via DEL aus Diagramm entfernt
- Dann: Ctrl+Z stellt die Shape wieder her (lokales Undo, kein API-Call)

## Abhängigkeiten

- Blockiert durch: REQ-145 (Shape-Insert), ADR-019 (Soft-Delete)
- Zusammenhang: UC-14 (Audit Log), UC-15 (Restore)
- Betrifft: alle Diagramme die die gelöschte Entität referenzieren

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-29 | Requirements Engineer | Initial draft |
