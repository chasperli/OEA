# Ableitung aus: requirements/req/req-059-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-04
Feature: REQ-059 – Viewpoint importieren und exportieren

  Das System MUSS Personen mit Metamodell-Bearbeiter-Berechtigung
  ermöglichen, einzelne Viewpoints als YAML-Datei zu exportieren und
  Viewpoint-YAML-Dateien zu importieren; beim Import MUSS das System
  alle referenzierten EntityType-IDs (`allowedEntityTypes`,
  `allowedConnectionTypes`, `notationMappings.entityTypeId`) gegen die
  Ziel-MetamodelConfiguration validieren und fehlende IDs als Fehler
  melden, bevor der Import abgebrochen wird.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Export einzelner Viewpoint – user-defined Viewpoint `cloud-security-view` mit 4 allowedEntityTypes, 3...
    Given user-defined Viewpoint `cloud-security-view` mit 4 allowedEntityTypes, 3 notationMappings
    When  Kurt exportiert diesen Viewpoint als YAML
    Then  YAML enthält alle Felder inkl. notationMappings mit defaultWidth/defaultHeight; ID `cloud-security-view` ist enthalten

  @AC2
  Scenario: AC2 – Roundtrip – Kurt die exportierte YAML-Datei in eine andere Instanz importiert (alle ...
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Kurt die exportierte YAML-Datei in eine andere Instanz importiert (alle referenzierten EntityType-IDs vorhanden)
    Then  HTTP 201; Viewpoint ist in der Ziel-Instanz vorhanden mit identischer Konfiguration

  @AC3
  Scenario: AC3 – Fehlende EntityType-IDs – YAML referenziert `allowedEntityTypes: [security-zone]`; Ziel-Instanz ke...
    Given YAML referenziert `allowedEntityTypes: [security-zone]`; Ziel-Instanz kennt keine EntityType-ID `security-zone`
    When  Kurt die Datei importiert
    Then  HTTP 422; Fehlermeldung enthält `unknown entityTypeId: security-zone`; kein Viewpoint angelegt

  @AC4
  Scenario: AC4 – ID-Konflikt – Ziel-Instanz hat bereits einen Viewpoint mit ID `cloud-security-view`
    Given Ziel-Instanz hat bereits einen Viewpoint mit ID `cloud-security-view`
    When  Kurt eine Viewpoint-Datei mit derselben ID hochlädt
    Then  HTTP 409; Response enthält vorgeschlagenen Alternativ-ID (z.B. `cloud-security-view-2`); kein Import ohne explizite Bestätigung

  @AC5
  Scenario: AC5 – System-defined nicht importierbar – YAML mit `viewpointType: system-defined`
    Given YAML mit `viewpointType: system-defined`
    When  Kurt die Datei importiert
    Then  System ignoriert `viewpointType=system-defined`; importiert den Viewpoint als `user-defined`; HTTP 201

  @AC6
  Scenario: AC6 – Bulk-Export – Kurt alle user-defined Viewpoints exportiert
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Kurt alle user-defined Viewpoints exportiert
    Then  ZIP-Download mit einer YAML-Datei pro user-defined Viewpoint; system-defined Viewpoints enthalten (optional, da hilfreich für Roundtrip)
