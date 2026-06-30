# Ableitung aus: requirements/req/req-154-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-19
Feature: REQ-154 – Batch-Write für Entitäten und Verbindungen

  Das System **MUSS** einen Endpoint bereitstellen, der bis zu 500
  Entitäten und 500 Verbindungen in einem einzigen HTTP-Request mit
  konfigurierbarer Upsert-Strategie anlegt oder aktualisiert, und
  **MUSS** einen `dryRun`-Modus unterstützen, der alle Validierungen
  durchführt ohne zu persistieren.

  Background:
    Given eine laufende OEA-Instanz
    And ein Nutzer mit der erforderlichen Rolle ist angemeldet

  @AC1
  Scenario: AC1 – 100 Entitäten im Batch, 5 mit mandatory-Property-Verletzung, `atomic=false`
    Given 100 Entitäten im Batch, 5 mit mandatory-Property-Verletzung, `atomic=false`
    When  POST /api/v1/entities/batch
    Then  200 OK; summary.created=95, summary.errors=5; fehlerhafte Items mit status=error

  @AC2
  Scenario: AC2 – 100 Entitäten, `dryRun=true`
    Given 100 Entitäten, `dryRun=true`
    When  POST /api/v1/entities/batch?dryRun=true
    Then  ValidationResult; keine Entität in DB; Response zeigt was angelegt würde

  @AC3
  Scenario: AC3 – Batch mit Verbindung, deren `sourceExternalId` nicht existiert
    Given Batch mit Verbindung, deren `sourceExternalId` nicht existiert
    When  POST /api/v1/entities/batch (entities + connections im selben Request)
    Then  Entitäten zuerst angelegt; Verbindung dann aufgelöst (sourceExternalId aus diesem Batch)
