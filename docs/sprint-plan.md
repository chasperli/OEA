# Sprint-Plan: OEA Implementierungsreihenfolge

**Stand:** 2026-06-30  
**Grundannahmen:**
- 2-Wochen-Sprints, ~30 SP/Sprint
- LLM-Assistent: Devstral (Mistral API, 128k Kontext)
- Gesamt: ~577 SP → 20 Sprints ≈ 10 Monate
- Reihenfolge: Abhängigkeiten > MoSCoW-Priorität > thematische Kohärenz
- UC-01 (66 SP, 19 USs) und UC-05 (55 SP) werden bewusst gestreckt

---

## Milestone 1 — Walking Skeleton (Sprints 1–7)

**Ziel:** Erster End-to-End-Pfad: Bootstrapping → Login → Metamodell → Katalog

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S1** | UC-02 | System-Admin-Bootstrapping: Setup-Token, erster Admin-Account, Break-Glass, Audit-Log | 35 |
| **S2** | UC-01 (1/2) | Login: OIDC-Basis, Session-Erstellung, Passwort-Minimal, generische Fehlermeldungen | ~33 |
| **S3** | UC-01 (2/2) | Login: Passkey, TOTP, Token-Lebensdauer konfigurierbar, Lifecycle invited→active, Audit-Log | ~33 |
| **S4** | UC-03 | Authentifizierungsmethode einrichten: 2FA-Enrollment (TOTP + Passkey), Passwort-Policies, Passwort-Reset | 39 |
| **S5** | UC-04 (1/2) | Metamodell: EntityTypes anlegen/bearbeiten, Basis-PropertyDefinitions, GUI-Konfiguration | ~27 |
| **S6** | UC-04 (2/2) | Metamodell: Connection-EntityTypes, Architektur-Erweiterung, Sperrmodus, Import, Audit-Log | ~27 |
| **S7** | UC-06 (1/2) | **⭐ Walking Skeleton:** Katalog anlegen, Spalten konfigurieren, Basis-Abfrage ausführen | ~24 |

**Deliverable S7:** Erster vollständiger E2E-Vertikalschnitt lauffähig:
Admin-Bootstrap → OIDC-Login → Metamodell-Konfiguration → Katalog-Abfrage.

> Nach S7: Retrospektive + Tech-Debt-Sprint empfohlen bevor Milestone 2 startet.

---

## Milestone 2 — Core Platform (Sprints 8–13)

**Ziel:** Vollständiger Katalog, Property-Modell, Solution-Lifecycle

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S8** | UC-06 (2/2) | Katalog: Join-Definition, Join-Modus Laufzeit, Filter speichern, Saved Views | ~23 |
| **S9** | UC-21 + UC-05 (1/3) | Property-Sichtbarkeit konfigurieren + Solution anlegen, Ausgangsbasis definieren | 22 + ~8 |
| **S10** | UC-05 (2/3) | Solution: Entity-Deltas erfassen, Diff-Ansicht, parallele-Solution-Konfliktwarnung | ~25 |
| **S11** | UC-05 (3/3) + UC-14 | Solution: Freigabe-Workflow (proposed→approved) + Änderungshistorie einsehen | ~22 + 13 |
| **S12** | UC-15 + UC-16 | Entitätsstand wiederherstellen (vollständig) + Teilwiederherstellung einzelner Properties | 11 + 16 |
| **S13** | UC-11 | Plateau definieren, Go-Live durchführen, Zeitachse, Implementierungsstatus | 31 |

**Deliverable S13:** Vollständiger Solution-Lifecycle:
anlegen → Delta erfassen → Konflikt erkennen → Plateau → History → Restore.

---

## Milestone 3 — EA-Ansichten & Navigation (Sprints 14–17)

**Ziel:** Viewpoints, Navigationsbaum, Dashboard, Geschäftsprozesse — alle MUST-UCs abgedeckt

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S14** | UC-12 + UC-13 (1/2) | Viewpoint verwalten + Navigationsbaum-Grundstruktur | 15 + ~17 |
| **S15** | UC-13 (2/2) + UC-07 (1/2) | Navigationsbaum fertig + Dashboard-Grundgerüst, erste Widgets | ~17 + ~15 |
| **S16** | UC-07 (2/2) + UC-10 | Dashboard: Charts, KPI-Karten, PropertyAggregation + Geschäftsprozesse modellieren | ~16 + 24 |
| **S17** | UC-08 | Datenflusskarte (Data Lineage): n-Connection-Modell (ADR-010), Visualisierung, Analyse | 24 |

**Deliverable S17:** Vollständiges Navigations- und Visualisierungsset; alle 14 MUST-UCs implementiert.

---

## Milestone 4 — Erweiterte Features / SHOULD (Sprints 18–20)

**Ziel:** Arc42-Dokumentation, Continuum, TRM, Conformance-Analyse

| Sprint | UC | Inhalt | SP |
|--------|----|--------|----|
| **S18** | UC-09 (1/2) | Lösungsarchitektur nach Arc42: Grundstruktur, Kontextdiagramm, Bausteinsicht | ~23 |
| **S19** | UC-09 (2/2) + UC-17 | Arc42 fertig (Laufzeit-, Verteilungssicht) + Continuum-Bausteine verwalten | ~23 + 25 |
| **S20** | UC-18 + UC-19 + UC-20 | Continuum-Paket importieren + TRM konfigurieren + Conformance-Analyse | 13 + 17 + 13 |

**Deliverable S20:** Vollständiges Feature-Set v1.0, produktionsbereit.

---

## Gesamtübersicht

| Milestone | Sprints | Thema | MUST-UCs | SHOULD-UCs |
|-----------|---------|-------|----------|------------|
| Walking Skeleton | S1–S7 | Auth + Metamodell + Katalog (E2E) | UC-01, UC-02, UC-03, UC-04, UC-06 (teil) | — |
| Core Platform | S8–S13 | Katalog vollst. + Solution-Lifecycle | UC-06, UC-11, UC-14, UC-21 | — |
| EA-Ansichten | S14–S17 | Navigation + Dashboard + Prozesse | UC-10, UC-12, UC-13 | UC-07, UC-08 |
| SHOULD-Features | S18–S20 | Arc42 + Continuum + TRM | — | UC-09, UC-17, UC-18, UC-19, UC-20 |

---

## UC-Abhängigkeiten (Reihenfolge nicht verhandelbar)

```
UC-02 (kein Vorgänger — Bootstrapping ist erster Schritt)
└── UC-01 (Login setzt Person+Role voraus, die UC-02 anlegt)
    ├── UC-03 (Auth-Methode einrichten)
    └── UC-04 (Metamodell setzt Login voraus)
        ├── UC-05 (Solution setzt Metamodell voraus)
        │   └── UC-06 (Katalog setzt Solution-Daten und Metamodell voraus)
        │       └── UC-07 (Dashboard baut auf Katalog auf)
        └── UC-21 (Property-Sichtbarkeit setzt PropertyDefinitions voraus)
```

Die SHOULD-UCs (UC-08, UC-09, UC-15, UC-16, UC-18, UC-20) haben keine harten Vorgänger
außer UC-01/UC-04 und können ab Milestone 2 bei Bedarf vorgezogen werden.

---

## Hinweise

**UC-01 ist mit 66 SP der größte Einzelblock.** Auth-Bugs pflanzen sich durch alle späteren
Sprints fort — bewusst auf S2+S3 gestreckt und vor dem Metamodell abgeschlossen.

**Offene Auth-Punkte müssen in S1 entschieden werden** (kein DoD-Blocker, aber vor S4
kritisch): Setup-Token-Übergabekanal (REQ-017), Recovery/Break-Glass (UC-02 E4),
Claim-Mapping Entra-ID→OEA-Rollen. Siehe `memory/auth-requirements-open-points.md`.

**Devstral (Mistral API, 128k Kontext) empfohlen** für mehrdateiige Spring-Boot-Features
(ADR-028: api/app/core-Schichtentrennung). Der Kontexter erlaubt, vollständige Feature-Branches
in einem Request zu bearbeiten. Für hochkomplexe Architekturentscheidungen ggf. mit
einem Frontier-Modell (Claude Sonnet) gegenlesen.

**SHOULD-UCs können bei Stakeholder-Anfrage vorgezogen werden** — die Abhängigkeiten
sind dokumentiert; UC-07 (Dashboard) und UC-08 (Data Lineage) haben keine Vorgänger
außer UC-01/UC-04/UC-06.
