# ADR-013: API-Stil – REST + OpenAPI 3.x

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: Inhaber des Repositorys
**Konsultiert**: Requirements Engineer
**Informiert**: –

## Kontext und Problem

OEA ist API-first (Leitprinzip in `concept/README.md`): alle Funktionalität ist über eine stabile, versionierte API zugänglich. UI, CLI, CI-Pipelines, Module und externe Integrationen nutzen dieselbe API. Es muss entschieden werden, welches API-Paradigma verwendet wird und wie die Spezifikation gepflegt wird.

Alle bisherigen REQs spezifizieren bereits REST-Endpunkte (`GET /api/v1/entities/...`, `POST /api/v1/catalogs/...`). Diese Entscheidung bestätigt und formalisiert diesen Ansatz.

## Entscheidungstreiber

- **Universelle Konsumierbarkeit**: CLI-Tool, CI-Pipelines, externe Integrationen (ITSM, PPM) müssen die API ohne TypeScript-Bindung nutzen können
- **Selbst-dokumentierend**: API-Spezifikation soll aus dem Code generiert werden (kein manuelles Pflegeproblem)
- **Typ-Sharing**: Frontend (Vue 3, ADR-011) soll typsichere API-Clients aus der Spezifikation generieren können
- **Standard-Konformität**: etablierter Standard, den Enterprise-Integrationsteams kennen
- **REQ-075**: keine proprietären Protokolle; API muss von Standard-HTTP-Clients konsumierbar sein

## Betrachtete Optionen

### Option 1: REST + OpenAPI 3.x ✓

- **Pro**:
  - Universell: jeder HTTP-Client (curl, Postman, fetch, Python requests) kann die API nutzen
  - `@nestjs/swagger` generiert OpenAPI 3.x Spec automatisch aus NestJS-Decorators (code-first)
  - `openapi-typescript`: generiert typsichere Fetch-Clients für Vue 3-Frontend aus der Spec
  - Swagger UI ist out-of-the-box verfügbar (`/api/docs`)
  - Standard in EA-Tool-Integrationen (ITSM, PPM, CMDB alle sprechen REST)
  - Alle bestehenden REQ-Endpunkte sind bereits als REST spezifiziert
- **Contra**: Kein natives Subscription-Protokoll (→ SSE separat, §23 #26)

### Option 2: GraphQL

- **Pro**: Flexible Queries, Subscriptions nativ, kein Over-/Under-Fetching
- **Contra**: Zusätzliche Lernkurve; Caching komplexer (kein HTTP-Caching); CLI-Tools brauchen GraphQL-Client; Schema-Versionierung schwieriger; für OEA kein wesentlicher Vorteil gegenüber REST + OpenAPI
- Scheidet für v1.0 aus; kann als optionale Query-Schicht in v2.0 ergänzt werden

### Option 3: tRPC

- **Pro**: Maximale TypeScript-Type-Safety end-to-end (Frontend ↔ Backend)
- **Contra**: Nur für TypeScript-Clients sinnvoll — CLI-Tool (Node.js oder andere Sprachen), CI-Pipelines, ITSM-Konnektoren können tRPC nicht einfach konsumieren; bricht das API-first-Prinzip
- Scheidet aus

## Entscheidung

Wir wählen **Option 1: REST + OpenAPI 3.x**.

**Umsetzung:**

| Aspekt | Entscheidung |
|---|---|
| Paradigma | REST (ressourcenorientiert) |
| Spezifikation | OpenAPI 3.x (code-first via `@nestjs/swagger`) |
| API-Basis-Pfad | `/api/v1/` (versioniert) |
| Dokumentation | Swagger UI unter `/api/docs` (nur non-production) |
| Typ-Generierung Frontend | `openapi-typescript` (generiert `types.d.ts` aus Spec) |
| Echtzeit-Events | SSE unter `GET /api/v1/events` (§23 #26); kein WebSocket in v1.0 |
| Graph-Queries | `POST /api/v1/graph/cypher` (openCypher via Apache AGE, §22 §23) |
| Analytics | `POST /api/v1/analytics/query` (SQL-Analytics, §22) |
| Authentifizierung | Bearer-Token (JWT) im `Authorization`-Header (ADR-006) |

**Versionierungsstrategie**: URL-basiert (`/api/v1/`, `/api/v2/`). Breaking Changes → neue Version; alte Version mind. 6 Monate parallel betreiben.

**OpenAPI-Spec als CI-Artefakt**: `npm run generate:openapi` erzeugt `openapi.json`; wird in CI geprüft (kein Bruch ohne Version-Bump) und als Release-Artefakt published.

## Konsequenzen

### Positive Konsequenzen

- Alle bestehenden REQ-Endpunkte (`GET /api/v1/entities`, `POST /api/v1/catalogs`, ...) sind 1:1 umsetzbar
- Swagger UI ermöglicht interaktives Testen ohne separaten Client
- `openapi-typescript` hält Frontend-Typen automatisch synchron mit Backend-API
- Enterprise-Integrationen (ITSM, PPM, CI-Tools) können mit Standard-REST-Clients angebunden werden

### Negative Konsequenzen / Trade-offs

- SSE für Echtzeit-Updates ist nicht so elegant wie WebSocket/GraphQL Subscriptions; ausreichend für v1.0
- Kein automatisches Type-Safety für CLI-Tool wenn es nicht in TypeScript geschrieben wird (→ OpenAPI Spec als Quelle)

## Bezüge

**Verwandte ADRs**: [ADR-012](./ADR-012-backend-stack.md) (NestJS), [ADR-006](./ADR-006-auth-stack-wahl.md) (Auth)

**Konzept**: [§21 API-Architektur](../concept/70-platform/21-api-architektur.md), [§22 Auswertbarkeit](../concept/70-platform/22-auswertbarkeit.md)
