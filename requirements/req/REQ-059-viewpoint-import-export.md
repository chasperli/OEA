---
id: REQ-059
title: Viewpoint importieren und exportieren
type: functional
priority: should
status: proposed
version: 0.1.0
created: 2026-06-26
last_updated: 2026-06-26
author: requirements-engineer
references:
  use_cases:
    - UC-04
  business_objects:
    - viewpoint
    - metamodel-configuration
  business_rules: []
  stakeholders:
    - SH-03
    - SH-06
    - SH-07
  concept:
    - concept/40-extensibility/14-erweiterbarkeit.md
    - concept/20-entities/12-domain-sichten.md
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-059: Viewpoint importieren und exportieren

## Aussage

Das System MUSS Personen mit Metamodell-Bearbeiter-Berechtigung ermöglichen, einzelne Viewpoints als YAML-Datei zu exportieren und Viewpoint-YAML-Dateien zu importieren; beim Import MUSS das System alle referenzierten EntityType-IDs (`allowedEntityTypes`, `allowedConnectionTypes`, `notationMappings.entityTypeId`) gegen die Ziel-MetamodelConfiguration validieren und fehlende IDs als Fehler melden, bevor der Import abgebrochen wird.

## Begründung

Viewpoints kapseln visuelles Wissen (welche Typen, welche Darstellung, welche Standardgrössen). Dieses Wissen soll zwischen Teams, zwischen OEA-Instanzen und in einem Viewpoint-Katalog (Community-Bibliothek) wiederverwendbar sein. Die ID-basierte Referenzierung (vgl. viewpoint.md v0.2.0) stellt sicher, dass die Viewpoint-Datei portabel ist und ihr Import in einer anderen Instanz deterministisch validierbar bleibt.

## Kontext

- Exportierte Viewpoints enthalten alle Felder der ViewpointDefinition inkl. `notationMappings` mit `defaultWidth`, `defaultHeight` und `notationElement`.
- System-defined Viewpoints KÖNNEN exportiert, aber NICHT importiert werden (built-ins sind in der Ziel-Instanz bereits vorhanden).
- Ein importierter Viewpoint erhält beim Import eine neue UUID, wenn seine ID in der Ziel-Instanz bereits existiert (Konfliktbehandlung: Nutzer wählt Abbrechen oder Umbenennen).
- Der Import-Pfad prüft keine Semantik der `notationElement`-Werte; er stellt nur die strukturelle Korrektheit (BR-07 aus viewpoint.md) und die ID-Existenz sicher.

## Typ-spezifische Felder

### Export

**Eingaben**:
- Viewpoint-ID (einzelner Export)
- Optional: Bulk-Export aller user-defined Viewpoints der Instanz

**Verarbeitung**:
1. Viewpoint aus der Datenbank lesen
2. Als YAML serialisieren (JSON als Option)
3. Header-Kommentar mit Export-Zeitstempel, OEA-Version, Quell-Instanz-ID einfügen

**Ausgaben**:
- Datei-Download; Filename: `oea-viewpoint-{viewpointId}-{ISO8601date}.yaml`
- Bulk: `oea-viewpoints-{instanceId}-{ISO8601date}.zip` (eine Datei pro Viewpoint)

**Fehlerfälle**:
- Viewpoint nicht gefunden → HTTP 404
- Keine Berechtigung → HTTP 403

### Import

**Eingaben**:
- Viewpoint-YAML-Datei (Multipart-Upload)

**Verarbeitung**:
1. Datei entgegennehmen; max. Grösse: 256 KB
2. Parsing: YAML → interne Datenstruktur; Syntaxfehler → sofortige Fehlermeldung
3. Schema-Validierung: Pflichtfelder vorhanden (`id`, `name`, `notation`, `viewpointType`, `allowedEntityTypes`)
4. ID-Validierung: alle IDs in `allowedEntityTypes`, `allowedConnectionTypes` und `notationMappings.entityTypeId` MÜSSEN in der Ziel-MetamodelConfiguration existieren; fehlende IDs → Liste aller Fehler; kein Partial-Import (BR-08 aus viewpoint.md)
5. Konfliktprüfung: Viewpoint-ID bereits vorhanden → Nutzer wählt Abbrechen oder neuen ID-Suffix
6. Importierter Viewpoint bekommt `viewpointType=user-defined`; system-defined aus Import wird ignoriert
7. Persistieren; Audit-Log-Eintrag

**Ausgaben**:
- HTTP 201 mit der angelegten ViewpointDefinition (JSON)
- Audit-Log-Eintrag: `viewpoint.imported` mit Dateinamen und Quell-Instanz-ID aus Header-Kommentar

**Fehlerfälle**:
- Fehlende EntityType-IDs → HTTP 422 mit Liste der unbekannten IDs
- ID-Konflikt (ohne Nutzerauflösung) → HTTP 409 mit vorgeschlagenem Alternativ-ID
- Datei zu gross → HTTP 413
- Ungültiger YAML → HTTP 422 mit Zeilen-/Spaltenangabe

## Akzeptanzkriterien

**AC1** (Export einzelner Viewpoint):
- Gegeben: user-defined Viewpoint `cloud-security-view` mit 4 allowedEntityTypes, 3 notationMappings
- Wenn: Kurt exportiert diesen Viewpoint als YAML
- Dann: YAML enthält alle Felder inkl. notationMappings mit defaultWidth/defaultHeight; ID `cloud-security-view` ist enthalten

**AC2** (Roundtrip):
- Wenn: Kurt die exportierte YAML-Datei in eine andere Instanz importiert (alle referenzierten EntityType-IDs vorhanden)
- Dann: HTTP 201; Viewpoint ist in der Ziel-Instanz vorhanden mit identischer Konfiguration

**AC3** (Fehlende EntityType-IDs):
- Gegeben: YAML referenziert `allowedEntityTypes: [security-zone]`; Ziel-Instanz kennt keine EntityType-ID `security-zone`
- Wenn: Kurt die Datei importiert
- Dann: HTTP 422; Fehlermeldung enthält `unknown entityTypeId: security-zone`; kein Viewpoint angelegt

**AC4** (ID-Konflikt):
- Gegeben: Ziel-Instanz hat bereits einen Viewpoint mit ID `cloud-security-view`
- Wenn: Kurt eine Viewpoint-Datei mit derselben ID hochlädt
- Dann: HTTP 409; Response enthält vorgeschlagenen Alternativ-ID (z.B. `cloud-security-view-2`); kein Import ohne explizite Bestätigung

**AC5** (System-defined nicht importierbar):
- Gegeben: YAML mit `viewpointType: system-defined`
- Wenn: Kurt die Datei importiert
- Dann: System ignoriert `viewpointType=system-defined`; importiert den Viewpoint als `user-defined`; HTTP 201

**AC6** (Bulk-Export):
- Wenn: Kurt alle user-defined Viewpoints exportiert
- Dann: ZIP-Download mit einer YAML-Datei pro user-defined Viewpoint; system-defined Viewpoints enthalten (optional, da hilfreich für Roundtrip)

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Instanz mit bekannten Viewpoints; Clean-Target-Instanz für Roundtrip; Testdatei mit fehlenden IDs; Testdatei mit ID-Konflikt
- [x] Mess-Werkzeug: Test-Suite des Import/Export-Moduls
- [x] Bestanden-Kriterium: AC1–AC6 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: viewpoint.md v0.2.0 (ID-basierte Referenzierung als stabile Grundlage); REQ-033 (Import-Muster für Diff + Bestätigung; Viewpoint-Import ist strenger: kein Partial-Import)
- **Folgewirkungen**: Ermöglicht Community-Bibliothek für Viewpoints (z.B. ArchiMate-Standard-Viewpoints aus externer Quelle importierbar)
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Viewpoint-Wissen ist instanz-gebunden und nicht wiederverwendbar; jedes Team definiert Darstellungsstandards neu
- Risiko 2: Bei Metamodell-Migration (EntityType-Umbenennung) können Viewpoints nicht portiert werden, wenn keine ID-basierte Referenzierung besteht

## Realisierungs-Hinweise

- Export: `GET /admin/metamodel/viewpoints/{id}/export?format=yaml`
- Bulk-Export: `GET /admin/metamodel/viewpoints/export?format=zip`
- Import: `POST /admin/metamodel/viewpoints/import` (Multipart-Form-Data)
- ID-Validierung serverseitig; kein clientseitiges Pre-Parsing

## Realisierung

- ADR(s): –
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-26 | requirements-engineer | Initial draft |
