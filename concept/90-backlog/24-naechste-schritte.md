## 24. Nächste Schritte

Stand: 2026-06-26 — Requirements-Phase abgeschlossen. Alle §23-Punkte kategorisiert.

### Abgeschlossen

- [x] Vision, Stakeholder-Profile (8), Business Objects
- [x] Use Cases (10), Requirements (78), User Stories (80)
- [x] Gruppe-A-ADRs (ADR-001–005) entschieden
- [x] Erweiterte ADRs (ADR-006–011): Auth, Canvas, GUI, Electron, n-Connection, Frontend (Vue 3)
- [x] Walking Skeleton identifiziert: UC-06 (Katalog), 6 USs, 22 SP
- [x] Trace-Check: grün, keine Warnings
- [x] §23 Offene Punkte: alle 47 kategorisiert und abgearbeitet

### Nächste Phase: Implementation

**Vor dem ersten Commit noch zu entscheiden (Tech-ADRs):**

1. **ADR-012** — Backend-Stack (Sprache + Framework)
2. **ADR-013** — API-Stil (REST + OpenAPI-Strategie)
3. **ADR-014** — Frontend-Komponentenbibliothek + WYSIWYG-Editor (TipTap)
4. **ADR-015** — DB-Migration-Tool (Flyway vs. Liquibase) — eng mit ADR-012 verbunden

**Walking Skeleton (UC-06 Minimal-Scope, 22 SP):**

End-to-End-Szenario: `docker compose up` → Login → Metamodell mit `application-component` konfigurieren → Katalog anlegen → Entity anlegen → Entity im Katalog sehen. Details: [docs/walking-skeleton.md](../../docs/walking-skeleton.md)

**Dann: Sprint-by-Sprint nach MoSCoW**

Module-Sprints (nach Walking Skeleton, Reihenfolge TBD):
- UC-05: Canvas (Vue Flow, React-Flow-ähnliche Nested Nodes für BPMN)
- UC-01: Entity-Management vollständig
- UC-09: Arc42-Dokumentation (WYSIWYG)
- UC-10: BPMN-Prozessmodellierung
- ITSM-Modul-Sprint (§23 Punkte #7, #8)
- DSGVO-Modul-Sprint (§23 Punkte #17, #34)
- Security-Sprint (§23 Punkte #38)

---

← [Offene Punkte](23-offene-punkte.md) · [🏠 Übersicht](../README.md)
