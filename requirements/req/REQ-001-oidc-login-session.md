---
id: REQ-001
title: OIDC-basierte Anmeldung und Session-Erstellung
type: functional
priority: must
status: proposed
version: 0.1.0
created: 2026-06-24
last_updated: 2026-06-24
author: requirements-engineer
references:
  use_cases:
    - UC-01
  business_objects:
    - person
    - role
  business_rules: []
  stakeholders:
    - SH-03
  concept:
    - concept/70-platform/21-api-architektur.md
  adrs:
    - ADR-006
supersedes: []
superseded_by: []
---

# REQ-001: OIDC-basierte Anmeldung und Session-Erstellung

## Aussage

Das System MUSS eine Person, die keine gültige Session besitzt, zur Authentifizierung an einen konfigurierten OIDC-Identity-Provider weiterleiten und nach erfolgreicher Authentifizierung eine Session erstellen, die an die Person und ihre aktiven Rollenzuweisungen gebunden ist. Das System KANN zusätzlich zur lokalen Signaturprüfung des Identity-Tokens optional eine Online-Validierung gegen den Identity-Provider durchführen (z.B. Token-Introspection nach RFC 7662 oder Userinfo-Endpoint), wenn dies für die Instanz konfiguriert ist.

## Begründung

Login ist Voraussetzung für jeden Use Case, der über öffentlich-lesbare Inhalte hinausgeht (siehe UC-01). Ohne standardkonforme Authentifizierung kann keine rollenbasierte Autorisierung (RBAC, Konzept §21.8) stattfinden.

## Kontext

Konzept §21.8 legt OAuth 2.0/OIDC als Standard-Authentifizierungsmechanismus fest. UC-01, Hauptablauf Schritte 2–7, sowie Alternative A1 (bestehende gültige Session wird nicht neu authentifiziert).

**Token-Gültigkeit**: Bei externem IdP (Entra ID, Authentik, siehe ADR-006) gibt der Identity-Provider die Gültigkeitsdauer von Access-, ID- und Refresh-Token vor; OEA übernimmt diese unverändert und erzwingt keine eigene, abweichende Lebensdauer für extern ausgestellte Token. Für lokale Authentifizierung gilt das nicht – siehe REQ-012.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- HTTP-Request ohne gültige Session an eine geschützte Ressource
- Authorization Code vom Identity-Provider nach erfolgreichem Redirect

**Verarbeitung**:
- Prüfung auf bestehende gültige Session; falls vorhanden, kein erneuter Redirect (A1)
- Redirect zum konfigurierten OIDC-Provider mit state/nonce-Absicherung
- Einlösen des Authorization Codes gegen Identity-Token (Access Token, ID Token)
- Validierung des Tokens: standardmäßig lokale Signaturprüfung gegen die JWKS des Providers; optional (konfigurierbar) zusätzliche Online-Prüfung beim IdP für Echtzeit-Widerruf-Erkennung
- Abgleich der Identity-Claims mit dem referenzierten [Person](../../business-objects/person.md)-Objekt
- Laden der aktiven Rollenzuweisungen (RoleAssignment mit `validFrom <= heute <= validTo`)
- Erstellung einer Session, gebunden an Person und aktive Rollen

**Ausgaben**:
- Gültige Session/Access-Token
- Bestätigung der Anmeldung mit rollenbasiertem Einstiegsbereich

**Fehlerfälle**:
- Identity-Provider lehnt Authentifizierung ab → siehe REQ-006 (keine Session, generische Fehlermeldung)
- Person nicht auffindbar/offboarded → siehe REQ-004
- Identity-Provider nicht erreichbar → technische Fehlermeldung, kein Session-Aufbau, Wiederholung möglich

## Akzeptanzkriterien

**AC1**:
- Gegeben: eine Person ohne gültige Session ruft eine geschützte Ressource auf
- Wenn: sie sich erfolgreich beim konfigurierten OIDC-Provider authentifiziert
- Dann: erhält sie eine Session, die ihre aktiven Rollenzuweisungen widerspiegelt

**AC2**:
- Gegeben: eine Person besitzt bereits eine gültige Session
- Wenn: sie eine weitere geschützte Ressource aufruft
- Dann: erfolgt kein erneuter Redirect zum Identity-Provider

**AC3**:
- Gegeben: eine Instanz, für die Online-Token-Validierung gegen den IdP konfiguriert ist, und ein Identity-Token, das lokal gültig signiert, aber beim IdP bereits widerrufen wurde
- Wenn: der Login-Vorgang abgeschlossen wird
- Dann: wird die Session-Erstellung verweigert

**AC4**:
- Gegeben: ein vom externen IdP ausgestelltes Token mit vom IdP festgelegter Gültigkeitsdauer
- Wenn: OEA die Session erstellt
- Dann: übernimmt OEA diese Gültigkeitsdauer unverändert, ohne sie zu verkürzen oder zu verlängern

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Integrationstest gegen einen Test-OIDC-Provider (z.B. Mock-IdP), inkl. Session-Cookie/Token-Prüfung
- [x] Mess-Werkzeug: Test-Suite des Auth-Moduls
- [x] Bestanden-Kriterium: AC1 und AC2 grün, kein Redirect bei bestehender Session
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: keine
- **Folgewirkungen**: REQ-002 (API-Key als Alternative), REQ-003, REQ-004, REQ-007
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne standardkonformes OIDC kein einheitlicher RBAC-Anschluss an bestehende Identity-Provider der Organisation – schwerwiegend
- Risiko 2: Eigenbau-Authentifizierung erhöht Angriffsfläche (Credential-Handling im eigenen Code) – schwerwiegend

## Trade-offs

- vs. Self-Hosting-Einfachheit (SH-03 Kurt, Single-User-KMU): OIDC erfordert einen Identity-Provider; ein leichtgewichtiger Default-Provider für Single-User-Betrieb sollte in der ADR zur Auth-Stack-Wahl mitbedacht werden.
- vs. REQ-008 (Login-Latenz): die optionale Online-Token-Validierung gegen den IdP fügt einen zusätzlichen Netzwerk-Roundtrip hinzu und ist daher per Default deaktiviert; bei Aktivierung muss das Latenzbudget aus REQ-008 neu bewertet werden.

## Realisierungs-Hinweise

- Bekannte technische Herausforderungen: state/nonce-Handling gegen CSRF, Token-Refresh, Mapping von Identity-Claims auf bestehende Person-Objekte bei wechselnden Claim-Formaten je Provider
- Konkrete Provider-Wahl ist nicht Teil dieses Requirements, sondern einer noch offenen ADR

## Realisierung

- ADR(s): [ADR-006](../../adrs/ADR-006-auth-stack-wahl.md)
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-01 Login, Hauptablauf und Alternative A1.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | requirements-engineer | Initial draft aus UC-01 |
