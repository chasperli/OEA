# Ableitung aus: requirements/req/req-143-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @must @UC-06
Feature: REQ-143 – Inline column filter in catalog table (AND-combined)

  Das System MUSS in der Katalog-Tabellenansicht direkt unterhalb der
  Spalten-Header eine Filtereingabe-Zeile anbieten. Jede Spalte MUSS
  ein eigenes Eingabefeld besitzen, das einen Schnellfilter auf dem
  jeweiligen Attribut ermöglicht.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Inline-Filter setzt Ergebnis – Katalog „Application Inventory" mit 47 ApplicationComponent-Einträgen
    Given Katalog „Application Inventory" mit 47 ApplicationComponent-Einträgen
    When  Nutzer tippt „Catalog" in das Inline-Filter-Feld der Spalte „Name"
    Then  Tabelle zeigt nur Entitäten deren Name „Catalog" enthält (contains); Statusleiste aktualisiert Anzahl

  @AC2
  Scenario: AC2 – AND-Kombination mehrerer Inline-Filter – Nutzer setzt Inline-Filter Name=„Service" UND Layer=„Application"
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer setzt Inline-Filter Name=„Service" UND Layer=„Application"
    Then  Nur Entitäten, die BEIDE Bedingungen erfüllen, erscheinen in der Tabelle

  @AC3
  Scenario: AC3 – Kombination Inline-Filter + SavedFilter – SavedFilter „Active systems only" ist aktiv
    Given SavedFilter „Active systems only" ist aktiv
    When  Zusätzlich Inline-Filter Layer=„Application" gesetzt
    Then  Ergebnis = active AND layer=Application (alle Filter AND-kombiniert)

  @AC4
  Scenario: AC4 – Inline-Filter nicht persistent – Nutzer setzt Inline-Filter, verlässt den Katalog und öffnet ihn erneut
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer setzt Inline-Filter, verlässt den Katalog und öffnet ihn erneut
    Then  Inline-Filter sind geleert; SavedFilter bleiben aktiv (da persistiert)

  @AC5
  Scenario: AC5 – Kein API-Call zum Speichern – Inline-Filter gesetzt wird
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Inline-Filter gesetzt wird
    Then  Kein `POST /api/v1/catalogs/{id}/filters` — nur GET-Abfrage mit Inline-Parameter

  @AC6
  Scenario: AC6 – OR-Hinweis – Nutzer möchte Name=„Gateway" OR Name=„Service" filtern
    Given Nutzer möchte Name=„Gateway" OR Name=„Service" filtern
    When die beschriebene Aktion ausgeführt wird
    Then  Inline-Filter unterstützt kein OR; Nutzer wird durch Tooltip/Hinweis auf „+ Filter"-Dialog verwiesen
