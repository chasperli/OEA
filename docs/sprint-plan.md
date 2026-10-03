# Sprint-Plan: OEA Implementierungsreihenfolge

**Stand:** 2026-10-04 (Walking Skeleton an den Anfang gezogen, siehe `docs/walking-skeleton.md`)  
**Grundannahmen:**
- 2-Wochen-Sprints, ~30 SP/Sprint
- LLM-Assistent: Devstral (Mistral API, 128k Kontext)
- Gesamt: ~577 SP + Projekt-Setup → 21 Sprints ≈ 10,5 Monate
- Reihenfolge: Walking Skeleton zuerst (dünner E2E-Durchstich), danach Abhängigkeiten > MoSCoW-Priorität > thematische Kohärenz
- UC-01 (66 SP, 19 USs) und UC-05 (55 SP) werden bewusst gestreckt

---

## Milestone 1 — Walking Skeleton + Fundament (Sprints 1–8)

**Ziel:** In S1–S2 ein dünner End-to-End-Durchstich (Bootstrapping → Login → Metamodell-Import → Entitäten → Katalog), danach Ausbau von Auth und Metamodell auf diesem Gerüst.

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S1** | Setup + UC-02 + UC-01 | **⭐ Walking Skeleton (1/2):** Projekt-Setup (Maven `backend/`, Vue `frontend/`, `api/openapi.yaml`, Docker Compose, CI), US-013 Lokales Bootstrapping, US-001 OIDC-Login | 13 + Setup |
| **S2** | UC-04 + UC-06 + UC-19 | **⭐ Walking Skeleton (2/2):** US-033 Starter-Paket importieren, US-141 Batch-Anlage (AC1), US-046 Katalog anlegen, US-049 Katalog-Daten anzeigen (Basis) | 18 + E2E-Härtung |
| **S3** | UC-02 (Rest) | System-Admin-Bootstrapping: Setup-Token, Remote-Bootstrapping, Break-Glass, Audit-Log | ~30 |
| **S4** | UC-01 (1/2) | Login: Session-Härtung, Passwort-Minimal, generische Fehlermeldungen | ~25 |
| **S5** | UC-01 (2/2) | Login: Passkey, TOTP, Token-Lebensdauer konfigurierbar, Lifecycle invited→active, Audit-Log | ~33 |
| **S6** | UC-03 | Authentifizierungsmethode einrichten: 2FA-Enrollment (TOTP + Passkey), Passwort-Policies, Passwort-Reset | 39 |
| **S7** | UC-04 (1/2) | Metamodell: EntityTypes anlegen/bearbeiten, Basis-PropertyDefinitions, GUI-Konfiguration | ~27 |
| **S8** | UC-04 (2/2) + UC-06 | Metamodell: Connection-EntityTypes, Architektur-Erweiterung, Sperrmodus, Audit-Log + US-047 Spalten konfigurieren | ~22 + 5 |

**Deliverable S2:** Walking Skeleton lauffähig (DoD in `docs/walking-skeleton.md`):
Admin-Bootstrap → OIDC-Login → Starter-Paket → Entitäten per Batch-API → Katalog-Tabelle.

**Deliverable S8:** Auth (UC-01, UC-02, UC-03) und Metamodell (UC-04) vollständig.

> Nach S2: Retrospektive zur Architektur; Erkenntnisse aus dem Durchstich fließen in S3 ff. ein.

---

## Milestone 2 — Core Platform (Sprints 9–14)

**Ziel:** Vollständiger Katalog, Property-Modell, Solution-Lifecycle

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S9** | UC-06 (2/2) | Katalog: Join-Definition, Join-Modus Laufzeit, Filter, Paginierung, Saved Views (inkl. Rest von US-049) | ~30 |
| **S10** | UC-21 + UC-05 (1/3) | Property-Sichtbarkeit konfigurieren + Solution anlegen, Ausgangsbasis definieren | 22 + ~8 |
| **S11** | UC-05 (2/3) | Solution: Entity-Deltas erfassen, Diff-Ansicht, parallele-Solution-Konfliktwarnung | ~25 |
| **S12** | UC-05 (3/3) + UC-14 | Solution: Freigabe-Workflow (proposed→approved) + Änderungshistorie einsehen | ~22 + 13 |
| **S13** | UC-15 + UC-16 | Entitätsstand wiederherstellen (vollständig) + Teilwiederherstellung einzelner Properties | 11 + 16 |
| **S14** | UC-11 | Plateau definieren, Go-Live durchführen, Zeitachse, Implementierungsstatus | 31 |

**Deliverable S14:** Vollständiger Solution-Lifecycle:
anlegen → Delta erfassen → Konflikt erkennen → Plateau → History → Restore.

---

## Milestone 3 — EA-Ansichten & Navigation (Sprints 15–18)

**Ziel:** Viewpoints, Navigationsbaum, Dashboard, Geschäftsprozesse — alle MUST-UCs abgedeckt

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S15** | UC-12 + UC-13 (1/2) | Viewpoint verwalten + Navigationsbaum-Grundstruktur | 15 + ~17 |
| **S16** | UC-13 (2/2) + UC-07 (1/2) | Navigationsbaum fertig + Dashboard-Grundgerüst, erste Widgets | ~17 + ~15 |
| **S17** | UC-07 (2/2) + UC-10 | Dashboard: Charts, KPI-Karten, PropertyAggregation + Geschäftsprozesse modellieren | ~16 + 24 |
| **S18** | UC-08 | Datenflusskarte (Data Lineage): n-Connection-Modell (ADR-010), Visualisierung, Analyse | 24 |

**Deliverable S18:** Vollständiges Navigations- und Visualisierungsset; alle 14 MUST-UCs implementiert.

---

## Milestone 4 — Erweiterte Features / SHOULD (Sprints 19–21)

**Ziel:** Arc42-Dokumentation, Continuum, TRM, Conformance-Analyse

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S19** | UC-09 (1/2) | Lösungsarchitektur nach Arc42: Grundstruktur, Kontextdiagramm, Bausteinsicht | ~23 |
| **S20** | UC-09 (2/2) + UC-17 | Arc42 fertig (Laufzeit-, Verteilungssicht) + Continuum-Bausteine verwalten | ~23 + 25 |
| **S21** | UC-18 + UC-19 + UC-20 | Continuum-Paket importieren + TRM konfigurieren + Conformance-Analyse | 13 + 17 + 13 |

**Deliverable S21:** Vollständiges Feature-Set v1.0, produktionsbereit.

---

## Gesamtübersicht

| Milestone | Sprints | Thema | MUST-UCs | SHOULD-UCs |
|-----------|---------|-------|----------|------------|
| Walking Skeleton + Fundament | S1–S8 | E2E-Durchstich (S1–S2), dann Auth + Metamodell vollständig | UC-01, UC-02, UC-03, UC-04, UC-06 (teil) | UC-19 (US-141 teil) |
| Core Platform | S9–S14 | Katalog vollst. + Solution-Lifecycle | UC-06, UC-11, UC-14, UC-21 | — |
| EA-Ansichten | S15–S18 | Navigation + Dashboard + Prozesse | UC-10, UC-12, UC-13 | UC-07, UC-08 |
| SHOULD-Features | S19–S21 | Arc42 + Continuum + TRM | — | UC-09, UC-17, UC-18, UC-19, UC-20 |

---

## UC-Abhängigkeiten (Reihenfolge nicht verhandelbar)

```
UC-02 (kein Vorgänger — Bootstrapping ist erster Schritt)
└── UC-01 (Login setzt Person+Role voraus, die UC-02 anlegt)
    ├── UC-03 (Auth-Methode einrichten)
    └── UC-04 (Metamodell setzt Login voraus)
        ├── UC-06 (Katalog setzt Metamodell voraus; Vorbedingungen in UC-06)
        │   └── UC-07 (Dashboard baut auf Katalog auf)
        ├── UC-05 (Solution setzt Metamodell voraus; ergänzt UC-06, ist aber keine Vorbedingung)
        │   └── UC-11 (Plateau/Go-Live setzt Solutions voraus)
        └── UC-21 (Property-Sichtbarkeit setzt PropertyDefinitions voraus)
```

Entitäten für den Katalog entstehen im Walking Skeleton per Batch-API (US-141); der fachliche Weg über Solution-Deltas (UC-05) folgt in Milestone 2.

Die SHOULD-UCs (UC-08, UC-09, UC-15, UC-16, UC-18, UC-20) haben keine harten Vorgänger
außer UC-01/UC-04 und können ab Milestone 2 bei Bedarf vorgezogen werden.

---

## Hinweise

**UC-01 ist mit 66 SP der größte Einzelblock.** Auth-Bugs pflanzen sich durch alle späteren
Sprints fort — OIDC-Basis im Walking Skeleton (S1), Rest bewusst auf S4+S5 gestreckt und vor dem
Metamodell-Ausbau abgeschlossen.

**Offene Auth-Punkte müssen in S1–S2 entschieden werden** (kein DoD-Blocker, aber vor S3
kritisch): Setup-Token-Übergabekanal (REQ-017), Recovery/Break-Glass (UC-02 E4),
Claim-Mapping Entra-ID→OEA-Rollen. Siehe [UC-02](../requirements/use-cases/UC-02-system-admin-bootstrapping.md),
[ADR-006](../adrs/ADR-006-auth-stack-wahl.md) und [US-018](../requirements/user-stories/US-018-warnung-leerer-admin-claim.md).

**Devstral (Mistral API, 128k Kontext) empfohlen** für mehrdateiige Spring-Boot-Features
(ADR-028: api/app/core-Schichtentrennung). Der Kontexter erlaubt, vollständige Feature-Branches
in einem Request zu bearbeiten. Für hochkomplexe Architekturentscheidungen ggf. mit
einem Frontier-Modell (Claude Sonnet) gegenlesen.

**SHOULD-UCs können bei Stakeholder-Anfrage vorgezogen werden** — die Abhängigkeiten
sind dokumentiert; UC-07 (Dashboard) und UC-08 (Data Lineage) haben keine Vorgänger
außer UC-01/UC-04/UC-06.
