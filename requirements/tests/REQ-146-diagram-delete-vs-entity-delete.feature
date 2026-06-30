# Ableitung aus: requirements/req/req-146-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30

@functional @must @UC-05 @UC-14 @UC-15
Feature: REQ-146 – Delete from Diagram (DEL) vs. Delete Entity (Ctrl+DEL) via Context Menu

  Das System MUSS im Diagramm-Editor zwei semantisch verschiedene
  Lösch-Operationen anbieten: 1. **"Remove from Diagram" (DEL)**:
  Entfernt die Shape aus dem aktuellen Diagramm.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – Remove from Diagram — Modell unberührt – Shape "Catalog-Service" [AC] ist in Diagramm A und B
    Given Shape "Catalog-Service" [AC] ist in Diagramm A und B
    When  Nutzer drückt DEL auf Shape in Diagramm A
    Then  Shape in Diagramm A weg; Shape in Diagramm B unverändert; Entität im Explorer vorhanden

  @AC2
  Scenario: AC2 – Delete Entity — Bestätigungsdialog – Nutzer drückt Ctrl+DEL auf Shape
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer drückt Ctrl+DEL auf Shape
    Then  Bestätigungsdialog erscheint mit Warnung "affects all diagrams"; nur bei Bestätigung fortfahren

  @AC3
  Scenario: AC3 – Delete Entity — Soft-Delete – Nutzer bestätigt Delete Entity
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer bestätigt Delete Entity
    Then  Entität hat `deleted_at` gesetzt; erscheint nicht mehr in normalen Katalog-Abfragen; ist über Audit Log wiederherstellbar (UC-15)

  @AC4
  Scenario: AC4 – Delete Entity — andere Diagramme markiert – Entität gelöscht, die in 3 weiteren Diagrammen als Shape vorkommt
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Entität gelöscht, die in 3 weiteren Diagrammen als Shape vorkommt
    Then  In diesen 3 Diagrammen wird die Shape als "deleted" markiert (grau, Warnung); kein stiller Datenverlust

  @AC5
  Scenario: AC5 – Kontextmenü-Erreichbarkeit – Nutzer rechtsklickt auf eine Shape
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer rechtsklickt auf eine Shape
    Then  Kontextmenü erscheint mit beiden Optionen inkl. Shortcuts; DEL und Ctrl+DEL funktionieren auch ohne Kontextmenü

  @AC6
  Scenario: AC6 – Undo Remove from Diagram – Nutzer hat Shape via DEL aus Diagramm entfernt
    Given die Vorbedingung gemäß Anforderung ist erfüllt
    When  Nutzer hat Shape via DEL aus Diagramm entfernt
    Then  Ctrl+Z stellt die Shape wieder her (lokales Undo, kein API-Call)
