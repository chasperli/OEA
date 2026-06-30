# Ableitung aus: requirements/req/req-145-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @must @UC-05
Feature: REQ-145 – Shape Drag-to-Canvas with Entity Lookup and Inline Creation

  Das System MUSS nach dem Ablegen einer Shape-Vorlage aus der Palette
  auf den Canvas einen Entity-Lookup-Dialog anzeigen. Der Dialog MUSS
  ein Texteingabefeld enthalten, das während der Eingabe bestehende
  Entitäten desselben Typs als Autocomplete-Vorschläge anzeigt.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Bestehende Entität einfügen – Entität "Catalog-Service" [AC] existiert in der Solution
    Given Entität "Catalog-Service" [AC] existiert in der Solution
    When  Nutzer zieht [AC]-Shape auf Canvas, tippt "Catalog", sieht "Catalog-Service (existing)", wählt es
    Then  Shape erscheint auf Canvas; kein neues Objekt im Modell; Log zeigt "existing"

  @AC2
  Scenario: AC2 – Neue Entität anlegen – Nutzer tippt "New-Reporting-Service", kein Autocomplete-Match, drückt OK
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer tippt "New-Reporting-Service", kein Autocomplete-Match, drückt OK
    Then  Neue Entität "New-Reporting-Service" [AC] wird angelegt; Shape erscheint auf Canvas; Explorer-Tree aktualisiert

  @AC3
  Scenario: AC3 – Autocomplete bei Eingabe – Nutzer tippt "auth"
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer tippt "auth"
    Then  Dropdown zeigt max. 8 Entitäten mit "auth" im Namen; Antwortzeit < 300 ms bei 10 000 Entitäten

  @AC4
  Scenario: AC4 – Cancel = kein Side-Effect – Nutzer drückt Cancel oder ESC nach dem Drop
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer drückt Cancel oder ESC nach dem Drop
    Then  Keine Entität angelegt, keine Shape im Diagramm, Drop vollständig rückgängig

  @AC5
  Scenario: AC5 – Duplikat-Warnung – Nutzer zieht dieselbe Entität ein zweites Mal in das gleiche Diagramm
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer zieht dieselbe Entität ein zweites Mal in das gleiche Diagramm
    Then  System zeigt Warnung "Entity already on canvas — insert again?" mit Ja/Nein
