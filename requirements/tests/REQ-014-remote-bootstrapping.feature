# Ableitung aus: requirements/req/req-014-*.md
# V-Modell Systemtestspezifikation – erstellt 2026-06-30
# Verifikation: Methode: test (automatisiert)

@functional @should @UC-02
Feature: REQ-014 – Remote-Bootstrapping über IdP-Claim-Mapping

  Das System SOLL es ermöglichen, System-Admin-Rechte über ein Mapping
  auf einen Gruppen- oder Rollen-Claim eines konfigurierten externen
  Identity-Providers (Entra ID oder Authentik, siehe ADR-006) zu
  vergeben, ohne dass dafür ein lokales Credential angelegt werden
  muss.

  Background:
    Given eine frisch installierte OEA-Instanz ohne System-Admin-Account

  @AC1
  Scenario: AC1 – ein konfiguriertes Claim-Mapping auf eine IdP-Gruppe
    Given ein konfiguriertes Claim-Mapping auf eine IdP-Gruppe
    When  eine Person mit diesem Gruppen-Claim im Identity-Token sich anmeldet
    Then  erhält die Session System-Admin-Rechte

  @AC2
  Scenario: AC2 – dasselbe Mapping
    Given dasselbe Mapping
    When  eine Person ohne diesen Claim sich anmeldet
    Then  erhält die Session keine System-Admin-Rechte über diesen Weg
