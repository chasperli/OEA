# Ableitung aus: requirements/req/req-070-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @should @UC-09
Feature: REQ-070 – Entity-Mention via [[ im WYSIWYG-Editor (Autocomplete + Verlinkung)

  Das System MUSS im WYSIWYG-Editor überall — in
  Markdown-Freitext-Abschnitten, in Mermaid-/PlantUML-Codeblöcken und
  in Draw.io-Shape-Labels — beim Tippen von `[[` ein
  Autocomplete-Dropdown öffnen, das Entitäten aus dem
  Architecture-Repository live durchsucht. Nach Auswahl einer Entität
  MUSS das System den Mention kontextabhängig einfügen: als
  strukturierten Wiki-Link `[[Name|entity:ID]]` im Freitext, als reinen
  Textnamen in allen Codeblock-Kontexten.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Dropdown öffnet sich im Freitext – Michael tippt `[[` im Markdown-Freitext des Editors
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael tippt `[[` im Markdown-Freitext des Editors
    Then  Autocomplete-Dropdown erscheint mit Top-10 Entitäten; kein Seitenaufruf nötig

  @AC2
  Scenario: AC2 – Live-Suche filtert Ergebnisse – Michael tippt `[[CRM`
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael tippt `[[CRM`
    Then  Dropdown zeigt nur Entitäten, deren Name „CRM" enthält (case-insensitive); Ergebnisse aktualisieren sich mit jedem weiteren Zeichen

  @AC3
  Scenario: AC3 – Mention im Freitext — ID-stable – Michael wählt „CRM-System" (id=1) im Dropdown
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael wählt „CRM-System" (id=1) im Dropdown
    Then  `[[CRM-System|entity:1]]` wird eingefügt; Rendering zeigt klickbares Badge „CRM-System"

  @AC4
  Scenario: AC4 – Umbenennung spiegelt sich in Rendering wider – Entität id=1 wird von „CRM-System" auf „Salesforce CRM" umbenannt
    Given Entität id=1 wird von „CRM-System" auf „Salesforce CRM" umbenannt
    When  Michael öffnet die Arc42-Antwort erneut
    Then  Badge zeigt „Salesforce CRM"; Rohtext im `content` bleibt `[[CRM-System|entity:1]]` (unveränderter Rohwert)

  @AC5
  Scenario: AC5 – Gelöschte Entität – Entität id=1 wurde gelöscht
    Given Entität id=1 wurde gelöscht
    When  Arc42-Antwort mit `[[CRM-System|entity:1]]` geöffnet
    Then  Badge zeigt `[gelöscht]` in roter Schrift; kein Link; keine Exception

  @AC6
  Scenario: AC6 – Dropdown im Mermaid-Block – Michael tippt `[[CRM` innerhalb eines ` ```mermaid `-Codeblocks (im Edit...
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael tippt `[[CRM` innerhalb eines ` ```mermaid `-Codeblocks (im Edit-Modus)
    Then  Autocomplete-Dropdown erscheint; nach Auswahl wird nur der Textname `CRM-System` eingefügt (kein Link-Markup)

  @AC7
  Scenario: AC7 – Dropdown im PlantUML-Block – Wie AC6, für PlantUML-Codeblock
    # TODO: AC ohne Standard-Struktur – manuell verfeinern
    # - Wie AC6, für PlantUML-Codeblock
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When die beschriebene Aktion ausgeführt wird
    Then verhält sich das System gemäß der Aussage

  @AC8
  Scenario: AC8 – ESC schliesst Dropdown ohne Änderung – Michael tippt `[[CR` und drückt ESC
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael tippt `[[CR` und drückt ESC
    Then  Dropdown schliesst; `[[CR` bleibt als Rohtext

  @AC9
  Scenario: AC9 – Web Portal: Mentions gerendert, kein Edit – CIO öffnet Arc42-Dokumentation im Web Portal
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  CIO öffnet Arc42-Dokumentation im Web Portal
    Then  Mentions als Badges gerendert (mit aktuellem Namen); kein Dropdown-Trigger bei Klick auf Badge im Lese-Modus (Badge öffnet Entity-Detail)
