# ADR-011: Frontend-Framework – Vue 3 + TypeScript

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
**Konsultiert**: Requirements Engineer
**Informiert**: ADR-007 (Canvas-Bibliothek; aktualisiert auf Vue Flow)

## Kontext und Problem

Das OEA-Frontend (Client App via Electron, Web Portal via Browser) muss mit einem Web-Framework gebaut werden. ADR-007 hatte React Flow als Canvas-Bibliothek gewählt und damit React implizit als Framework vorausgesetzt. Diese Entscheidung war nie formal begründet.

Da der primäre Entwickler React nicht kennt und Typensicherheit ein zentrales Projektziel ist, wird das Frontend-Framework hier explizit entschieden — mit Auswirkung auf ADR-007 (Canvas-Bibliothek).

## Entscheidungstreiber

- **Typensicherheit**: das gesamte Frontend muss in TypeScript geschrieben werden; Template-Ausdrücke müssen typengeprüft sein
- **Einstiegshürde**: der primäre Entwickler kennt weder React noch Vue; die Lernkurve beeinflusst Liefergeschwindigkeit direkt
- **OSS-Kompatibilität**: Framework-Lizenz muss mit Apache 2.0 kompatibel sein
- **Canvas-Bibliothek**: der gewählte Stack muss eine vollwertige Canvas-Bibliothek (für UC-05) unterstützen
- **Electron-Kompatibilität**: Framework muss als Renderer-Prozess in Electron laufen (kein Node-spezifisches API im Frontend nötig)
- **Langfristige Wartbarkeit**: Framework muss aktiv gepflegt, dokumentiert und verbreitet sein

## Betrachtete Optionen

### Option 1: Vue 3 + TypeScript (Composition API)

Vue 3 mit Composition API und `<script setup lang="ts">` — Single-File-Components (`.vue`).

- **Pro**:
  - Einsteigerfreundlich: Single-File-Components trennen Template, Logik und Styles übersichtlich in einer Datei
  - Exzellente TypeScript-Integration: `vue-tsc` prüft Template-Ausdrücke; Composables sind TypeScript-nativ
  - Sehr gute offizielle Dokumentation (gilt als beste im Ökosystem)
  - Weniger Entscheidungsfreiheit als React → weniger Entscheidungsmüdigkeit (State, Routing, Tooling sind offiziell empfohlen)
  - Canvas: **Vue Flow** (`@vue-flow/core`, MIT) ist ein direkter Port von React Flow — gleiche Konzepte, Vue 3-native API
  - Vite als offiziell empfohlenes Build-Tool (schnell, minimal Konfiguration)
  - MIT-Lizenz
- **Contra**:
  - Kleinere Community als React (aber für OEA ausreichend)
  - Weniger externe Bibliotheken als React-Ökosystem (für OEA kein Problem — alle benötigten Äquivalente existieren)

### Option 2: React 18 + TypeScript

- **Pro**: Grösste Community, meiste Bibliotheken, meiste Open-Source-Beiträge zu erwarten
- **Contra**: Steilere Lernkurve für Entwickler ohne React-Erfahrung; JSX-Syntax ungewohnt; mehr Boilerplate für State-Management; Hook-Regeln sind fehleranfällig beim Einstieg
- Scheidet aus: Lernkurve überwiegt strategischen Vorteil für Solo/Kleinstteam

### Option 3: Angular 17 + TypeScript

- **Pro**: TypeScript-first by design; stark opinionated (gut für Konsistenz)
- **Contra**: Sehr steile Lernkurve; viel Boilerplate (Decorators, Modules, DI); Overkill für ein OSS-Tool dieser Grösse; Electron-Integration komplexer
- Scheidet aus

### Option 4: Svelte 5 + TypeScript

- **Pro**: Minimale Bundle-Grösse, elegante Syntax
- **Contra**: Keine vollwertige Canvas-Bibliothek für Svelte (Vue Flow / React Flow existieren nicht); Ökosystem zu klein für Enterprise-Komponenten; scheidet aus wegen Canvas-Anforderung

## Entscheidung

Wir wählen **Option 1: Vue 3 + TypeScript**.

Begründung: Vue 3 bietet exzellente TypeScript-Unterstützung bei deutlich niedrigerer Einstiegshürde als React. Vue Flow ist ein vollwertiger Ersatz für React Flow (gleiche Konzepte, MIT-Lizenz). Die offizielle Vue 3-Dokumentation ist ideal für den Einstieg. Für OEA in der aktuellen Phase (Solo/Kleinstteam) überwiegt die Produktivität des bekannten/leichter erlernbaren Stacks den strategischen Vorteil einer grösseren React-Community.

**Folgeänderung**: ADR-007 wird aktualisiert — React Flow → **Vue Flow** (`@vue-flow/core`).

## Konsequenzen

### Positive Konsequenzen

- Schnellerer Einstieg für den primären Entwickler
- Template-Typprüfung via `vue-tsc` — kein ungetyptes Template-Land
- Vite as Build-Tool: Hot-Module-Replacement in Millisekunden, minimale Konfiguration
- Pinia als State-Management (offiziell empfohlen, TypeScript-first)
- Vue Router für SPA-Routing (offiziell, Typen out-of-the-box)
- Vue Flow (`@vue-flow/core`) für UC-05 Canvas — direkte Portierung der React-Flow-Konzepte

### Negative Konsequenzen / Trade-offs

- Potenzielle OSS-Beiträger mit React-Background müssen Vue 3 lernen (geringer Aufwand dank ähnlicher Konzepte)
- Weniger Stack-Overflow-Antworten als React — offizielle Docs kompensieren das gut

### Folgeentscheidungen

- **Komponenten-Bibliothek**: PrimeVue, Vuetify 3 oder Radix Vue — zu entscheiden vor erstem UI-Sprint (eigene ADR oder als Teil ADR-012)
- **Nuxt 3 für Web Portal**: Web Portal könnte von Nuxt 3 (SSR/SSG) profitieren — zu evaluieren wenn Web Portal gebaut wird; für Walking Skeleton nicht relevant
- **ADR-007**: aktualisiert (Vue Flow statt React Flow)

## Bezüge

**Verwandte ADRs**:
- [ADR-007](./ADR-007-canvas-bibliothek.md) — aktualisiert auf Vue Flow
- [ADR-008](./ADR-008-gui-architektur-dual-track.md) — GUI-Architektur (Electron + Web Portal)
- [ADR-009](./ADR-009-client-app-framework.md) — Electron als Client-App-Shell

**Use Cases**:
- [UC-05](../requirements/use-cases/UC-05-architektur-vision-beschreiben.md) — Canvas-Anforderung (Vue Flow)
- [US-045](../requirements/user-stories/US-045-delta-neue-entitaet-diagramm.md) — In-Place-Edit im Canvas

## Notizen

Vue Flow: `@vue-flow/core` (MIT). GitHub: `bcakmakoglu/vue-flow`. Setzt Vue 3.x voraus.  
State Management: **Pinia** (offiziell, ersetzt Vuex, TypeScript-native).  
Build-Tool: **Vite** (offiziell empfohlen für Vue 3).  
Type-Check: **vue-tsc** (`vue-tsc --noEmit` als CI-Schritt).  
IDE: **Volar** Extension für VS Code (nicht Vetur — Vetur ist Vue 2).
