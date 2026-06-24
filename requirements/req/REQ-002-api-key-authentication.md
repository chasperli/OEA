---
id: REQ-002
title: API-Key-Authentifizierung für Maschine-zu-Maschine-Zugriffe
type: functional
priority: should
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
  adrs: []
supersedes: []
superseded_by: []
---

# REQ-002: API-Key-Authentifizierung für Maschine-zu-Maschine-Zugriffe

## Aussage

Das System SOLL Anfragen mit gültigem API-Key direkt validieren können, ohne Redirect zu einem OIDC-Identity-Provider, und die dem API-Key zugeordnete Identität samt aktiven Rollenzuweisungen ermitteln.

## Begründung

Konzept §21.8 sieht API-Keys explizit für Maschine-zu-Maschine-Kommunikation vor (z.B. Discovery-Adapter, CI-Skripte, externe Module). UC-01, Alternative A2.

## Kontext

Browser-basierter OIDC-Redirect ist für nicht-interaktive Clients ungeeignet. API-Keys sind die in §21.8 vorgesehene Alternative.

## Typ-spezifische Felder

### Bei type=functional

**Eingaben**:
- HTTP-Request mit API-Key (z.B. als Header)

**Verarbeitung**:
- Validierung des API-Keys (Existenz, nicht abgelaufen, nicht widerrufen)
- Ermittlung der dem API-Key zugeordneten Service-Identität bzw. Person
- Laden der zugeordneten aktiven Rollenzuweisungen

**Ausgaben**:
- Autorisierter Request-Kontext mit den Berechtigungen der zugeordneten Rollen

**Fehlerfälle**:
- Ungültiger, abgelaufener oder widerrufener API-Key → Request wird mit Fehler abgelehnt, kein Berechtigungs-Kontext erstellt

## Akzeptanzkriterien

**AC1**:
- Gegeben: ein Request enthält einen gültigen, nicht widerrufenen API-Key
- Wenn: der Request gegen eine geschützte Ressource gestellt wird
- Dann: wird er ohne Redirect autorisiert, gemäß den Rollen der zugeordneten Identität

**AC2**:
- Gegeben: ein Request enthält einen ungültigen oder widerrufenen API-Key
- Wenn: der Request gestellt wird
- Dann: wird er abgelehnt, ohne dass ein Autorisierungs-Kontext entsteht

## Verifikationsmethode

- [x] Methode: test (automatisiert)
- [x] Test-Setup: Integrationstest mit gültigem/ungültigem/widerrufenem API-Key
- [x] Mess-Werkzeug: Test-Suite des Auth-Moduls
- [x] Bestanden-Kriterium: AC1 und AC2 grün
- [ ] In CI integriert: ja, sobald Implementation existiert

## Abhängigkeiten

- **Voraussetzungen**: REQ-001 (gemeinsames Rollen-/Autorisierungsmodell)
- **Folgewirkungen**: keine bekannt
- **Konflikte**: keine bekannt

## Risiken bei Nichterfüllung

- Risiko 1: Ohne API-Key-Unterstützung müssten Maschinen-Clients OIDC-Browser-Flows simulieren – unpraktikabel, Schweregrad mittel

## Trade-offs

- vs. Sicherheit: API-Keys sind langlebige Credentials und müssen daher Widerruf, Rotation und Scoping unterstützen, um nicht zum schwächsten Glied zu werden.

## Realisierungs-Hinweise

- Bekannte technische Herausforderungen: sicherer Storage und Rotation der API-Keys, Scoping (welche Rollen/Rechte ein Key maximal tragen darf)

## Realisierung

- ADR(s): ausstehend
- Implementiert durch: –
- Tests: –
- Status der Verifikation: not-verified

## Notizen

Abgeleitet aus UC-01 Login, Alternative A2.

## Änderungshistorie

| Version | Datum | Autor | Änderung |
|---|---|---|---|
| 0.1.0 | 2026-06-24 | requirements-engineer | Initial draft aus UC-01 |
