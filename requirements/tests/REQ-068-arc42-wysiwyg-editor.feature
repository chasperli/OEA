# Ableitung aus: requirements/req/req-068-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @should @UC-09
Feature: REQ-068 – Arc42 WYSIWYG-Editor mit Mermaid- und PlantUML-Rendering

  Das System MUSS für das `content`-Feld einer Arc42MetaObject-Entität
  einen WYSIWYG-Editor bereitstellen, der Markdown-Formatierung,
  `mermaid`-Codeblöcke und `plantuml`-Codeblöcke unterstützt.
  Mermaid-Blöcke MÜSSEN client-seitig als SVG gerendert werden.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Mermaid gerendert – content enthält:
    Given content enthält:
    When  Michael öffnet die Arc42-Antwort
    Then  Ein SVG-Diagramm (A→B→C) ist im Editor sichtbar; kein Roh-Code

  @AC2
  Scenario: AC2 – PlantUML via Server – `plantumlServerUrl` konfiguriert; content mit PlantUML-Block
    Given `plantumlServerUrl` konfiguriert; content mit PlantUML-Block
    When  Editor geöffnet
    Then  SVG vom Server geladen und angezeigt

  @AC3
  Scenario: AC3 – PlantUML Fallback – kein Server – kein PlantUML-Server konfiguriert und WASM nicht geladen
    Given kein PlantUML-Server konfiguriert und WASM nicht geladen
    When  Editor geöffnet
    Then  Roh-Code angezeigt; Warning-Icon; Meldung „PlantUML nicht verfügbar"

  @AC4
  Scenario: AC4 – Edit-Toggle – Michael klickt auf Mermaid-Diagramm → „Bearbeiten"
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael klickt auf Mermaid-Diagramm → „Bearbeiten"
    Then  Code-Editor öffnet sich; Änderungen live nachgerendert

  @AC5
  Scenario: AC5 – Speichern als Markdown – Michael speichert
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Michael speichert
    Then  `content`-Feld enthält Markdown-String mit unveränderten Codeblöcken; kein SVG in DB

  @AC6
  Scenario: AC6 – Zeichenlimit – content > 100.000 Zeichen
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  content > 100.000 Zeichen
    Then  Fehlermeldung; Speichern verhindert

  @AC7
  Scenario: AC7 – Web Portal rendering – CIO öffnet Arc42-Dokumentation im Web Portal
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  CIO öffnet Arc42-Dokumentation im Web Portal
    Then  Mermaid und PlantUML werden gerendert (read-only); kein Editor
