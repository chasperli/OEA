---
id: REQ-124
title: PropertyDefinition um visibilityMode erweitern
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-28
last_updated: 2026-06-28
author: requirements-engineer
references:
  use_cases:
    - UC-21
  business_objects:
    - metamodel-configuration
    - role
  stakeholders:
    - SH-03
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-124: PropertyDefinition um visibilityMode erweitern

## Aussage

Das Datenmodell der `PropertyDefinition` (in `MetamodelConfiguration`) MUSS um drei neue Felder erweitert werden:

| Feld | Typ | Default | Constraint |
|---|---|---|---|
| `visibilityMode` | enum | `public` | `[public, role-restricted, connection-scoped]` |
| `allowedRoles` | Role[] | [] | Pflicht wenn `visibilityMode = role-restricted`; mind. 1 Eintrag |
| `scopingConnectionType` | string | null | Pflicht wenn `visibilityMode = connection-scoped`; muss gültige `ConnectionType`-ID referenzieren |

**Semantik der Modi**:
- `public`: Wert ist für jeden authentifizierten Nutzer lesbar und schreibbar (aktuelles Verhalten, Default)
- `role-restricted`: Wert ist nur für Nutzer lesbar/schreibbar, deren aktive Rolle in `allowedRoles` enthalten ist
- `connection-scoped`: Wert ist nur für Nutzer lesbar/schreibbar, die über den Connection-Typ `scopingConnectionType` einen Pfad zur angefragten Entität im Graphen haben

## Begründung

Ohne Erweiterung der `PropertyDefinition` kann keine feingranulare Sichtbarkeitssteuerung erfolgen. Die Konfiguration muss deklarativ im Metamodell liegen, damit kein Code-Eingriff bei neuen Feldern nötig ist.

## Akzeptanzkriterien

**AC1** (Datenmodell):
- Wenn: Eine `PropertyDefinition` angelegt oder bearbeitet wird
- Dann: `visibilityMode` ist speicherbar; Default `public` ist korrekt

**AC2** (Validierung role-restricted):
- Wenn: `visibilityMode = role-restricted` und `allowedRoles` leer
- Dann: Speichern wird mit Validierungsfehler abgelehnt

**AC3** (Validierung connection-scoped):
- Wenn: `visibilityMode = connection-scoped` und `scopingConnectionType` zeigt auf nicht-existierende ConnectionType-ID
- Dann: Speichern wird mit Validierungsfehler abgelehnt

**AC4** (Abwärtskompatibilität):
- Wenn: Bestehende `PropertyDefinition` ohne `visibilityMode`
- Dann: Default `public` wird angewandt; bestehende Werte bleiben erhalten

## Abhängigkeiten

- **Voraussetzungen**: REQ-032 (PropertyDefinition bereits modelliert), REQ-036 (ConnectionType definiert)
- **Folgewirkungen**: REQ-125 (Konfigurationsmaske), REQ-126 (Enforcement role-restricted), REQ-127 (Enforcement connection-scoped)

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-28 | requirements-engineer | Initial draft |
