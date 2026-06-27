# Traceability-Matrix

Vollständige Verfolgbarkeit von Use Cases über Requirements bis zu User Stories. Wird per `/trace-check` auf Konsistenz geprüft oder manuell gepflegt.

**Stand**: 2026-06-28 | **REQs gesamt**: 106 | **USs gesamt**: 106 | **UCs gesamt**: 16

---

## 1. UC × REQ × US – Vollständige Trace-Tabelle

### UC-01: Login

**Primärer Akteur**: SH-03 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-001](req/REQ-001-oidc-login-session.md) | OIDC-Login und Session-Handling | functional | must | [US-001](user-stories/US-001-oidc-login.md) |
| [REQ-002](req/REQ-002-api-key-authentication.md) | API-Key-Authentifizierung | functional | must | [US-002](user-stories/US-002-api-key-auth.md) |
| [REQ-003](req/REQ-003-zugriff-ohne-rollenzuweisung.md) | Zugriff ohne Rollenzuweisung | functional | must | [US-003](user-stories/US-003-zugriff-ohne-rolle.md) |
| [REQ-004](req/REQ-004-ablehnung-unbekannte-offboarded-person.md) | Ablehnung unbekannter/offboardeter Personen | functional | must | [US-004](user-stories/US-004-ablehnung-unbekannte-person.md) |
| [REQ-005](req/REQ-005-audit-log-login.md) | Audit-Log Login-Ereignisse | functional | must | [US-005](user-stories/US-005-audit-log-login.md) |
| [REQ-006](req/REQ-006-keine-preisgabe-account-existenz.md) | Keine Preisgabe der Account-Existenz | security | must | [US-006](user-stories/US-006-generische-fehlermeldung.md) |
| [REQ-007](req/REQ-007-lifecycle-uebergang-invited-active.md) | Lifecycle-Übergang invited→active | functional | must | [US-007](user-stories/US-007-lifecycle-invited-active.md) |
| [REQ-008](req/REQ-008-login-latenz.md) | Login-Latenz ≤ 500 ms (p95) | non-functional | must | [US-008](user-stories/US-008-login-latenz.md) |
| [REQ-009](req/REQ-009-passkey-login.md) | Passkey-Login | functional | should | [US-009](user-stories/US-009-passkey-login.md) |
| [REQ-010](req/REQ-010-username-passwort-totp.md) | Username/Passwort + TOTP | functional | must | [US-010](user-stories/US-010-totp-login.md) |
| [REQ-011](req/REQ-011-username-passwort-minimal.md) | Username/Passwort minimal | functional | must | [US-011](user-stories/US-011-passwort-minimal.md) |
| [REQ-012](req/REQ-012-token-lebensdauer-lokal.md) | Token-Lebensdauer lokal konfigurierbar | functional | must | [US-012](user-stories/US-012-token-lebensdauer-konfigurierbar.md) |

**Konzept**: §21 API-Architektur, §8 Organisation/Rollen/Personen | **ADRs**: [ADR-006](../adrs/ADR-006-auth-stack-wahl.md)

---

### UC-02: System-Admin-Bootstrapping

**Primärer Akteur**: SH-06 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-013](req/REQ-013-lokales-bootstrapping.md) | Lokales Bootstrapping | functional | must | [US-013](user-stories/US-013-lokales-bootstrapping.md) |
| [REQ-014](req/REQ-014-remote-bootstrapping.md) | Remote-Bootstrapping | functional | must | [US-014](user-stories/US-014-remote-bootstrapping.md) |
| [REQ-015](req/REQ-015-kein-paralleles-bootstrapping.md) | Kein paralleles Bootstrapping | functional | must | [US-015](user-stories/US-015-kein-paralleles-bootstrapping.md) |
| [REQ-016](req/REQ-016-audit-log-bootstrapping.md) | Audit-Log Bootstrapping | functional | must | [US-016](user-stories/US-016-audit-log-bootstrapping.md) |
| [REQ-017](req/REQ-017-sichere-setup-token-uebergabe.md) | Sichere Setup-Token-Übergabe | security | must | [US-017](user-stories/US-017-sichere-setup-token-uebergabe.md) |
| [REQ-018](req/REQ-018-warnung-leerer-admin-claim.md) | Warnung bei leerem Admin-Claim | functional | must | [US-018](user-stories/US-018-warnung-leerer-admin-claim.md) |
| [REQ-019](req/REQ-019-deaktivierbarkeit-lokaler-admin.md) | Deaktivierbarkeit des lokalen Admins | functional | must | [US-019](user-stories/US-019-deaktivierbarkeit-lokaler-admin.md) |

**Konzept**: §21 API-Architektur | **ADRs**: [ADR-006](../adrs/ADR-006-auth-stack-wahl.md)

---

### UC-03: Authentifizierungsmethode einrichten

**Primärer Akteur**: SH-04 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-020](req/REQ-020-erzwingung-zweiter-faktor.md) | Erzwingung eines zweiten Faktors | functional | must | [US-031](user-stories/US-031-2fa-erzwingung-konfigurieren.md) |
| [REQ-021](req/REQ-021-enrollment-token-validierung.md) | Enrollment-Token-Validierung | functional | must | [US-020](user-stories/US-020-enrollment-einstieg-einladungslink.md) |
| [REQ-022](req/REQ-022-totp-enrollment.md) | TOTP-Enrollment | functional | must | [US-021](user-stories/US-021-totp-enrollment.md) |
| [REQ-023](req/REQ-023-passkey-enrollment.md) | Passkey-Enrollment | functional | should | [US-022](user-stories/US-022-passkey-enrollment.md) |
| [REQ-024](req/REQ-024-initiales-passwort-admin.md) | Initiales Passwort durch Admin | functional | must | [US-023](user-stories/US-023-initiales-passwort-admin.md) |
| [REQ-025](req/REQ-025-audit-log-enrollment.md) | Audit-Log Enrollment | functional | must | [US-024](user-stories/US-024-audit-log-enrollment.md) |
| [REQ-026](req/REQ-026-weitere-methode-authentifizierte-person.md) | Weitere Methode für eingeloggte Person | functional | must | [US-025](user-stories/US-025-weitere-methode-eingeloggte-person.md) |
| [REQ-027](req/REQ-027-passwort-generator.md) | Passwort-Generator | functional | should | [US-026](user-stories/US-026-passwort-generator.md) |
| [REQ-028](req/REQ-028-passwort-richtlinien.md) | Passwort-Richtlinien konfigurierbar | functional | must | [US-027](user-stories/US-027-passwort-richtlinien-konfigurieren.md) |
| [REQ-029](req/REQ-029-rollen-basierte-2fa-ausnahme.md) | Rollenbasierte 2FA-Ausnahme | functional | should | [US-028](user-stories/US-028-rollen-basierte-2fa-ausnahme.md) |
| [REQ-030](req/REQ-030-mehrere-totp-credentials.md) | Mehrere TOTP-Credentials | functional | should | [US-029](user-stories/US-029-mehrere-totp-credentials.md) |
| [REQ-031](req/REQ-031-passwort-reset-durch-admin.md) | Passwort-Reset durch Admin | functional | must | [US-030](user-stories/US-030-passwort-reset-durch-admin.md) |

**Konzept**: §21 API-Architektur, §8 Organisation/Rollen/Personen | **ADRs**: [ADR-006](../adrs/ADR-006-auth-stack-wahl.md)

---

### UC-04: Metamodell gemeinsam konfigurieren

**Primärer Akteur**: SH-03 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-032](req/REQ-032-entitytype-gui-konfiguration.md) | EntityType per GUI konfigurieren | functional | must | [US-032](user-stories/US-032-entitytype-anlegen.md) |
| [REQ-033](req/REQ-033-metamodell-import.md) | Metamodell-Import | functional | must | [US-033](user-stories/US-033-metamodell-importieren.md) |
| [REQ-034](req/REQ-034-audit-log-metamodell.md) | Audit-Log Metamodell-Änderungen | functional | must | [US-034](user-stories/US-034-audit-log-metamodell.md) |
| [REQ-035](req/REQ-035-metamodell-sperrmodus.md) | Metamodell-Sperrmodus (editMode) | functional | must | [US-035](user-stories/US-035-metamodell-sperrmodus.md) |
| [REQ-036](req/REQ-036-connection-entitytype.md) | Connection-EntityType (isConnection) | functional | must | [US-036](user-stories/US-036-connection-entitytype-anlegen.md) |
| [REQ-037](req/REQ-037-architektur-metamodell-erweiterung.md) | Architektur-spezifische Metamodell-Erweiterung (scope=solution) | functional | must | [US-037](user-stories/US-037-architektur-metamodell-erproben.md) |
| [REQ-058](req/REQ-058-metamodell-exportieren.md) | Metamodell-Konfiguration exportieren (YAML/JSON) | functional | should | [US-078](user-stories/US-078-metamodell-konfiguration-exportieren.md) |
| [REQ-059](req/REQ-059-viewpoint-import-export.md) | Viewpoint importieren und exportieren | functional | should | [US-079](user-stories/US-079-viewpoint-exportieren-und-importieren.md) |
| [REQ-079](req/REQ-079-mehrsprachige-benutzeroberflaeche.md) | Mehrsprachige Benutzeroberfläche (i18n) | functional | should | [US-081](user-stories/US-081-sprache-umschalten.md) |

**Konzept**: §6 Kern-Entitätstypen, §13 Integration/Import-Export, §14 Erweiterbarkeit, §15 Schema-Evolution | **ADRs**: –

---

### UC-05: Architektur-Vision einer Änderungsinitiative beschreiben

**Primärer Akteur**: SH-04 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-038](req/REQ-038-solution-anlegen.md) | Solution anlegen | functional | must | [US-038](user-stories/US-038-solution-anlegen.md) |
| [REQ-039](req/REQ-039-landschaft-ausgangsbasis.md) | Landschaft als Ausgangsbasis anzeigen | functional | must | [US-039](user-stories/US-039-landschaft-ausgangsbasis-anzeigen.md) |
| [REQ-040](req/REQ-040-entity-deltas-erfassen.md) | EntityDeltas einer Solution erfassen | functional | must | [US-040](user-stories/US-040-delta-neue-entitaet.md), [US-041](user-stories/US-041-delta-modified.md), [US-042](user-stories/US-042-delta-retiring.md), [US-045](user-stories/US-045-delta-neue-entitaet-diagramm.md) |
| [REQ-041](req/REQ-041-diff-ansicht.md) | Diff-Ansicht (aktueller vs. Zielzustand) | functional | should | [US-043](user-stories/US-043-diff-ansicht.md) |
| [REQ-042](req/REQ-042-konflikt-warnung-parallele-solutions.md) | Konflikt-Warnung bei parallelen Solutions | functional | should | [US-044](user-stories/US-044-konflikt-warnung.md) |

**Konzept**: §6 Kern-Entitätstypen, §11 Temporales Modell, §12 Domain-Sichten, §16 Beispiel-Walkthrough | **ADRs**: [ADR-007](../adrs/ADR-007-canvas-bibliothek.md) (accepted), [ADR-008](../adrs/ADR-008-gui-architektur-dual-track.md) (accepted)

---

### UC-06: Architektur-Katalog anlegen, konfigurieren und verwenden

**Primärer Akteur**: SH-03 (alle Stakeholder) | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-043](req/REQ-043-katalog-anlegen.md) | Katalog anlegen | functional | must | [US-046](user-stories/US-046-katalog-anlegen.md) |
| [REQ-044](req/REQ-044-spalten-konfigurieren.md) | Spalten eines Katalogs konfigurieren | functional | must | [US-047](user-stories/US-047-spalten-konfigurieren.md) |
| [REQ-045](req/REQ-045-join-definition-konfigurieren.md) | Join-Definition konfigurieren | functional | must | [US-048](user-stories/US-048-join-hinzufuegen.md) |
| [REQ-046](req/REQ-046-katalog-abfrage.md) | Katalog-Abfrage ausführen (Live-Daten) | functional | must | [US-049](user-stories/US-049-katalog-daten-anzeigen.md) |
| [REQ-047](req/REQ-047-filter-setzen-und-speichern.md) | Filter setzen und als SavedFilter speichern | functional | must | [US-051](user-stories/US-051-ad-hoc-filter.md), [US-052](user-stories/US-052-saved-filter.md) |
| [REQ-048](req/REQ-048-saved-view.md) | SavedView anlegen und beim Öffnen anwenden | functional | should | [US-053](user-stories/US-053-saved-view.md) |
| [REQ-049](req/REQ-049-join-modus-laufzeit.md) | Join-Modus zur Laufzeit umschalten | functional | must | [US-050](user-stories/US-050-join-modus-wechseln.md) |
| [REQ-050](req/REQ-050-katalog-navigationsbaum.md) | Katalog im Navigationsbaum einordnen | functional | should | [US-054](user-stories/US-054-katalog-navigationsbaum.md) |
| [REQ-065](req/REQ-065-n-connection-katalog-join.md) | Katalog-Join für Connection-Typ-Primaries und n-Connection-Traversal | functional | should | – |
| [REQ-066](req/REQ-066-entity-anlage-workflow.md) | Konfigurierbare Entity-Anlage-Workflows (Wizard) | functional | must | [US-069](user-stories/US-069-anlage-wizard.md) |

**Konzept**: §6 Kern-Entitätstypen, §12 Domain-Sichten | **ADRs**: [ADR-010](../adrs/ADR-010-n-connection-data-lineage.md) (REQ-065)

---

### UC-08: Datenflusskarte (Data Lineage) modellieren und analysieren

**Primärer Akteur**: SH-02 | **Prio**: should | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-060](req/REQ-060-datenobjekt-anlegen.md) | Datenobjekt (data-object) anlegen und verwalten | functional | should | [US-063](user-stories/US-063-datenobjekt-anlegen.md) |
| [REQ-061](req/REQ-061-n-connection-carries-data.md) | n-Connection carries-data (DataFlow ↔ DataObject) | functional | should | [US-064](user-stories/US-064-carries-data-connection.md) |
| [REQ-062](req/REQ-062-lineage-graph-api.md) | Lineage-Graph-API (upstream/downstream/impact) | functional | should | [US-065](user-stories/US-065-lineage-query.md) |
| [REQ-063](req/REQ-063-n-connection-canvas-darstellung.md) | n-Connection Canvas-Darstellung (3-Punkte-Indikator + Panel) | functional | should | [US-066](user-stories/US-066-n-connection-indikator.md), [US-067](user-stories/US-067-verbindungs-panel.md) |
| [REQ-064](req/REQ-064-dsgvo-katalogfilter.md) | DSGVO-Katalogfilter (personalDataCategories) | functional | should | [US-068](user-stories/US-068-dsgvo-katalogfilter.md) |
| [REQ-065](req/REQ-065-n-connection-katalog-join.md) | Katalog-Join für Connection-Primaries + n-Connection-Traversal | functional | should | – |

**Konzept**: §6 Kern-Entitätstypen, §13 Fach-Technik-Verlinkung, §14 Erweiterbarkeit, §20 GRC/DSGVO | **ADRs**: [ADR-010](../adrs/ADR-010-n-connection-data-lineage.md) (accepted)

---

## 2. UC × Konzept × ADR – Übersicht

| UC | Konzept-Kapitel | ADRs | NFRs |
|---|---|---|---|
| [UC-01](use-cases/UC-01-login.md) | §8 Organisation/Rollen, §21 API-Architektur | [ADR-006](../adrs/ADR-006-auth-stack-wahl.md) | REQ-008 (Login-Latenz), REQ-073 (Verfügbarkeit), REQ-074 (Skalierbarkeit) |
| [UC-02](use-cases/UC-02-system-admin-bootstrapping.md) | §21 API-Architektur | [ADR-006](../adrs/ADR-006-auth-stack-wahl.md) | – |
| [UC-03](use-cases/UC-03-authentifizierungsmethode-einrichten.md) | §8 Organisation/Rollen, §21 API-Architektur | [ADR-006](../adrs/ADR-006-auth-stack-wahl.md) | – |
| [UC-04](use-cases/UC-04-metamodell-konfigurieren.md) | §6 Kern-Entitätstypen, §14 Erweiterbarkeit, §15 Schema-Evolution | – | – |
| [UC-05](use-cases/UC-05-architektur-vision-beschreiben.md) | §6 Kern-Entitätstypen, §11 Temporales Modell, §12 Domain-Sichten, §16 Walkthrough | [ADR-007](../adrs/ADR-007-canvas-bibliothek.md) (accepted), [ADR-008](../adrs/ADR-008-gui-architektur-dual-track.md) (accepted) | – |
| [UC-06](use-cases/UC-06-katalog-anlegen-und-verwenden.md) | §6 Kern-Entitätstypen, §12 Domain-Sichten | – | – |
| [UC-07](use-cases/UC-07-dashboard-anlegen-und-verwenden.md) | §21 Visualisierungs-Strategie (Web Portal) | – | REQ-073 (Verfügbarkeit), REQ-074 (Skalierbarkeit) |
| [UC-08](use-cases/UC-08-data-lineage-modellieren.md) | §6 Kern-Entitätstypen, §13 Fach-Technik-Verlinkung, §14 Erweiterbarkeit, §15 Schema-Evolution, §20 GRC/DSGVO | [ADR-010](../adrs/ADR-010-n-connection-data-lineage.md) (accepted) | – |
| [UC-09](use-cases/UC-09-loesungsarchitektur-arc42-dokumentieren.md) | §14 Erweiterbarkeit, §18 Reporting | – | – |
| [UC-10](use-cases/UC-10-geschaeftsprozesse-modellieren.md) | §9 Prozess-Architektur, §6 Kern-Entitätstypen | – | REQ-071 (Katalog-Latenz), REQ-072 (Canvas-Latenz) |
| [UC-11](use-cases/UC-11-plateau-definieren-und-go-live.md) | §11 Temporales Modell | [ADR-017](../adrs/ADR-017-fully-open-layers.md) | – |
| [UC-12](use-cases/UC-12-viewpoint-verwalten.md) | §12 Domain-Sichten | – | – |
| [UC-13](use-cases/UC-13-navigationsbaum-verwalten.md) | §12 Domain-Sichten | – | – |
| [UC-14](use-cases/UC-14-aenderungshistorie-einsehen.md) | §6 Kern-Entitätstypen | [ADR-016](../adrs/ADR-016-persistenz-strategie.md) | – |
| [UC-15](use-cases/UC-15-entitaetsstand-wiederherstellen.md) | §6 Kern-Entitätstypen | [ADR-016](../adrs/ADR-016-persistenz-strategie.md) | – |
| [UC-16](use-cases/UC-16-teilwiederherstellung-entitaet.md) | §6 Kern-Entitätstypen | [ADR-016](../adrs/ADR-016-persistenz-strategie.md) | – |

---

### UC-09: Lösungsarchitektur nach Arc42 dokumentieren

**Primärer Akteur**: SH-04 | **Prio**: should | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-067](req/REQ-067-arc42-kapitelsammlung.md) | Arc42ChapterCollection im Metamodell konfigurieren | functional | should | [US-070](user-stories/US-070-arc42-kapitelsammlung-konfigurieren.md) |
| [REQ-068](req/REQ-068-arc42-wysiwyg-editor.md) | Arc42 WYSIWYG-Editor mit Mermaid/PlantUML-Rendering | functional | should | [US-072](user-stories/US-072-arc42-mermaid-plantuml.md) |
| [REQ-069](req/REQ-069-arc42-dokumentation-bearbeiten.md) | Arc42-Dokumentation zu einer Entität bearbeiten und anzeigen | functional | should | [US-071](user-stories/US-071-arc42-frage-beantworten.md) |
| [REQ-070](req/REQ-070-entity-mention-autocomplete.md) | Entity-Mention via /@ (Autocomplete + ID-stabile Verlinkung) | functional | should | [US-073](user-stories/US-073-entity-mention-autocomplete.md) |
| [REQ-080](req/REQ-080-rechtschreibungspruefung-wysiwyg.md) | Rechtschreibungsprüfung im WYSIWYG-Editor | functional | could | [US-082](user-stories/US-082-rechtschreibungspruefung-wysiwyg.md) |

**Konzept**: §14 Erweiterbarkeit, §18 Reporting | **ADRs**: –

---

### UC-10: Geschäftsprozesse modellieren (BPMN)

**Primärer Akteur**: SH-08 (Anna) | **Prio**: should | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-076](req/REQ-076-bpmn-prozesstypen-metamodell.md) | BPMN-Prozesstypen im Metamodell (19 EntityTypes + 9 Connections) | functional | should | [US-074](user-stories/US-074-prozessdiagramm-anlegen.md) |
| [REQ-077](req/REQ-077-rollen-orgunit-personen-prozess-zuordnung.md) | Rollen, OrgUnit und Personen Prozess-Zuordnung | functional | should | [US-075](user-stories/US-075-lane-orgunit-rolle-zuordnen.md), [US-076](user-stories/US-076-usertask-person-zuordnen.md) |
| [REQ-081](req/REQ-081-bpmn-dataobject-prozess-lineage.md) | BPMN-DataObject-Integration und Prozess-Datenlineage | functional | should | [US-083](user-stories/US-083-bpmn-dataobject-anreicherung.md) |

**Konzept**: §9 Prozess-Architektur, §6 Kern-Entitätstypen | **ADRs**: [ADR-007](../adrs/ADR-007-canvas-bibliothek.md) (Vue Flow)

---

### UC-11: Plateau definieren und Go-Live durchführen

**Primärer Akteur**: SH-03 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-084](req/REQ-084-plateau-anlegen.md) | Plateau anlegen | functional | must | [US-084](user-stories/US-084-plateau-anlegen.md) |
| [REQ-085](req/REQ-085-plateau-uebersicht.md) | Plateau-Übersicht strukturiert | functional | must | [US-085](user-stories/US-085-plateau-uebersicht.md) |
| [REQ-086](req/REQ-086-go-live-zweistufige-bestaetigung.md) | Go-Live zweistufige Bestätigung | functional | must | [US-086](user-stories/US-086-go-live-bestaetigung.md) |
| [REQ-087](req/REQ-087-go-live-kein-enforcement.md) | Go-Live kein Enforcement | functional | must | [US-087](user-stories/US-087-go-live-kein-enforcement.md) |
| [REQ-088](req/REQ-088-go-live-atomare-transition.md) | Go-Live atomare Transition | functional | must | [US-088](user-stories/US-088-go-live-atomare-transition.md) |
| [REQ-089](req/REQ-089-plateau-realized-schreibgeschuetzt.md) | Realized-Plateau schreibgeschützt | functional | must | [US-089](user-stories/US-089-plateau-realized-readonly.md) |

**Konzept**: §11 Temporales Modell | **ADRs**: [ADR-017](../adrs/ADR-017-fully-open-layers.md) (Fully Open Layers)

---

### UC-12: Viewpoint verwalten

**Primärer Akteur**: SH-03 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-090](req/REQ-090-viewpoint-anlegen-bearbeiten-loeschen.md) | Viewpoint anlegen, bearbeiten, löschen | functional | must | [US-090](user-stories/US-090-viewpoint-crud.md) |
| [REQ-091](req/REQ-091-viewpoint-notation-mapping.md) | Viewpoint Notation-Mapping | functional | must | [US-091](user-stories/US-091-viewpoint-notation-mapping.md) |
| [REQ-092](req/REQ-092-system-viewpoint-schreibgeschuetzt.md) | System-Viewpoints schreibgeschützt | functional | must | [US-092](user-stories/US-092-system-viewpoint-readonly.md) |
| [REQ-093](req/REQ-093-viewpoint-loeschen-warnung.md) | Viewpoint-Löschen Warnung | functional | must | [US-093](user-stories/US-093-viewpoint-loeschen-warnung.md) |

**Konzept**: §12 Domain-Sichten | **ADRs**: –

---

### UC-13: Navigationsbaum verwalten

**Primärer Akteur**: SH-03 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-094](req/REQ-094-navigationsbaum-ordner-crud.md) | Ordner-CRUD | functional | must | [US-094](user-stories/US-094-navigationsbaum-ordner-crud.md) |
| [REQ-095](req/REQ-095-navigationsbaum-item-soft-reference.md) | Item-Verwaltung mit Soft-Reference | functional | must | [US-095](user-stories/US-095-navigationsbaum-item-soft-reference.md) |
| [REQ-096](req/REQ-096-navigationsbaum-drag-drop.md) | Drag & Drop mit Zyklus-Schutz | functional | must | [US-096](user-stories/US-096-navigationsbaum-drag-drop.md) |
| [REQ-097](req/REQ-097-navigationsbaum-mehrfach-einordnung.md) | Mehrfach-Einordnung | functional | must | [US-097](user-stories/US-097-navigationsbaum-mehrfach-einordnung.md) |

**Konzept**: §12 Domain-Sichten | **ADRs**: –

---

### UC-14: Änderungshistorie einsehen

**Primärer Akteur**: SH-03 | **Prio**: must | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-098](req/REQ-098-versionshistorie-zeitlinie.md) | Versionshistorie-Zeitlinie | functional | must | [US-098](user-stories/US-098-versionshistorie-zeitlinie.md) |
| [REQ-099](req/REQ-099-versionshistorie-diff-ansicht.md) | Feldweise Diff-Ansicht | functional | must | [US-099](user-stories/US-099-versionshistorie-diff.md) |
| [REQ-100](req/REQ-100-versionshistorie-snapshot-abruf.md) | Vollständiger Snapshot-Abruf | functional | must | [US-100](user-stories/US-100-versionshistorie-snapshot.md) |

**Konzept**: §6 Kern-Entitätstypen | **ADRs**: [ADR-016](../adrs/ADR-016-persistenz-strategie.md) (Persistenz-Strategie)

---

### UC-15: Entitätsstand wiederherstellen

**Primärer Akteur**: SH-03 | **Prio**: should | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-101](req/REQ-101-entitaet-vollwiederherstellung.md) | Vollständige Wiederherstellung | functional | should | [US-101](user-stories/US-101-entitaet-vollwiederherstellung.md) |
| [REQ-102](req/REQ-102-wiederherstellung-audit-snapshot.md) | Audit-Snapshot vor Wiederherstellung | functional | should | [US-102](user-stories/US-102-wiederherstellung-audit-snapshot.md) |
| [REQ-103](req/REQ-103-wiederherstellung-atomare-transaktion.md) | Atomare Wiederherstellungstransaktion | functional | should | [US-103](user-stories/US-103-wiederherstellung-transaktion.md) |

**Konzept**: §6 Kern-Entitätstypen | **ADRs**: [ADR-016](../adrs/ADR-016-persistenz-strategie.md) (Persistenz-Strategie)

---

### UC-16: Entität teilweise wiederherstellen

**Primärer Akteur**: SH-03 | **Prio**: should | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-104](req/REQ-104-teilwiederherstellung-wizard.md) | Dreistufiger Wizard | functional | should | [US-104](user-stories/US-104-teilwiederherstellung-wizard.md) |
| [REQ-105](req/REQ-105-teilwiederherstellung-feldauswahl.md) | Selektive Feldauswahl | functional | should | [US-105](user-stories/US-105-teilwiederherstellung-feldauswahl.md) |
| [REQ-106](req/REQ-106-teilwiederherstellung-restored-fields.md) | restoredFields-Tracking | functional | should | [US-106](user-stories/US-106-teilwiederherstellung-restored-fields.md) |

**Konzept**: §6 Kern-Entitätstypen | **ADRs**: [ADR-016](../adrs/ADR-016-persistenz-strategie.md) (Persistenz-Strategie)

---

## 3. REQ-Typ-Übersicht

| Typ | REQ-IDs | Anzahl |
|---|---|---|
| functional | REQ-001–007, REQ-009–022, REQ-024–040, REQ-043–070, REQ-076–081, REQ-084–106 | 95 |
| non-functional | REQ-008, REQ-071, REQ-072, REQ-073, REQ-074, REQ-075, REQ-082, REQ-083 | **8** ✓ |
| security | REQ-006, REQ-017 | 2 |
| could | REQ-080 (Rechtschreibprüfung) | 1 |

*Hinweis: REQ-006 und REQ-017 sind als `security` typisiert und erscheinen auch in der functional-Zählung der jeweiligen UCs. REQ-080 ist `priority: could`.*

### NFR-Übersicht

| REQ | Titel | Kategorie | Prio | Kernzielwert |
|---|---|---|---|---|
| [REQ-008](req/REQ-008-login-latenz.md) | Login-Latenz | performance | should | p95 < 300ms bei 10k Personen |
| [REQ-071](req/REQ-071-katalog-abfrage-latenz.md) | Katalog-Abfrage-Latenz | performance | must | p95 < 500ms mit 3 Joins bei 10k Entitäten |
| [REQ-072](req/REQ-072-canvas-rendering-latenz.md) | Canvas-Rendering-Latenz | performance | must | Time-to-Interactive < 1.500ms bei 150 Entities |
| [REQ-073](req/REQ-073-systemverfuegbarkeit.md) | Systemverfügbarkeit | availability | must | ≥ 99,5 % / Monat (exkl. Wartung); RTO ≤ 30 min |
| [REQ-074](req/REQ-074-gleichzeitige-nutzer-skalierbarkeit.md) | Gleichzeitige Nutzer / Skalierbarkeit | scalability | should | 50 Nutzer ohne Latenz-Degradierung > 2×; 500k Entitäten |
| [REQ-075](req/REQ-075-plattformunabhaengigkeit-deployment.md) | Plattformunabhängigkeit und Cloud-Betreibbarkeit | portability | must | Docker Compose + Helm auf Linux/macOS/Win; kein Vendor-Lock-in (DB, S3, OIDC austauschbar) |
| [REQ-082](req/REQ-082-datensicherung-retention.md) | Datensicherung und Point-in-Time-Recovery | reliability | must | RPO ≤ 24h; RTO ≤ 4h; Backup-Retention ≥ 30 Tage |
| [REQ-083](req/REQ-083-audit-log-retention.md) | Audit-Log-Retention und Abfrage-Performance | compliance | should | Retention ≥ 2 Jahre; p95 Abfrage 30 Tage ≤ 5s; append-only garantiert |

---

## 4. Story-Points-Übersicht

| UC | USs | SP gesamt | Anmerkung |
|---|---|---|---|
| UC-01 | US-001–012 | ~29 | inkl. US-008 (Performance-Test) |
| UC-02 | US-013–019 | ~17 | |
| UC-03 | US-020–031 | ~29 | |
| UC-04 | US-032–037 | ~18 | |
| UC-05 | US-038–045 | ~34 | US-045 (Diagramm-Pfad) = 8 SP; ADR-007 + ADR-008 accepted; US-045 entsperrt |
| UC-06 | US-046–054 + US-069 | **39** | Details: US-046=3, US-047=5, US-048=5, US-049=5, US-050=3, US-051=3, US-052=2, US-053=3, US-054=2; US-069 (Wizard)=8 |
| UC-07 | US-055–062 | **28** | US-055=3, US-056=5, US-057=8, US-058=3, US-059=2, US-060=3, US-061=5, US-062=2 |
| UC-08 | US-063–068 | **24** | US-063=3, US-064=5, US-065=5, US-066=3, US-067=5, US-068=3 |
| UC-09 | US-070–073 | **20** | US-070=5, US-071=5, US-072=5, US-073=5 |
| UC-10 | US-074–076 | **16** | US-074=8, US-075=5, US-076=3 |
| UC-11 | US-084–089 | **21** | US-084=5, US-085=3, US-086=3, US-087=2, US-088=5, US-089=3 |
| UC-12 | US-090–093 | **15** | US-090=8, US-091=3, US-092=2, US-093=2 |
| UC-13 | US-094–097 | **18** | US-094=5, US-095=5, US-096=5, US-097=3 |
| UC-14 | US-098–100 | **13** | US-098=5, US-099=5, US-100=3 |
| UC-15 | US-101–103 | **11** | US-101=5, US-102=3, US-103=3 |
| UC-16 | US-104–106 | **16** | US-104=8, US-105=5, US-106=3 |
| **Gesamt** | **106 USs** | **~364 SP** | |

---

## 5. Coverage-Lücken

### REQs ohne US

Alle REQs haben mind. eine zugehörige US. ✓

### USs ohne REQ-Bezug

Alle USs referenzieren mind. ein REQ. ✓

### UCs ohne Konzept-Bezug

Alle 7 UCs haben mind. einen Konzept-Bezug. ✓

### UCs ohne primären Stakeholder

Alle 7 UCs haben einen `primary_actor`. ✓

### UC-07 REQ/US-Übersicht

| REQ | Titel | USs |
|---|---|---|
| [REQ-051](req/REQ-051-dashboard-anlegen.md) | Dashboard anlegen | US-055, US-062 |
| [REQ-052](req/REQ-052-widget-konfigurieren.md) | Widget konfigurieren | US-056, US-057, US-058, US-059 |
| [REQ-053](req/REQ-053-property-aggregation-datasource.md) | PropertyAggregation-DataSource | US-056, US-057 |
| [REQ-054](req/REQ-054-catalog-query-datasource.md) | CatalogQuery-DataSource | US-058 |
| [REQ-055](req/REQ-055-dashboard-daten-abrufen.md) | Dashboard-Daten live berechnen | US-061 |
| [REQ-056](req/REQ-056-dashboard-zugriff-sichtbarkeit.md) | Zugriff und Sichtbarkeit | US-055, US-062 |
| [REQ-057](req/REQ-057-widget-grid-layout.md) | Widget-Grid-Layout | US-060 |

### UC-10: Geschäftsprozesse modellieren

**Primärer Akteur**: SH-08 | **Prio**: must | **Status**: proposed

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-076](req/REQ-076-bpmn-prozesstypen-metamodell.md) | BPMN-Prozesselemente und OrganizationalUnit im Metamodell | functional | must | [US-074](user-stories/US-074-prozessdiagramm-anlegen-und-bpmn-elemente-platzieren.md) |
| [REQ-077](req/REQ-077-rollen-orgunit-personen-prozess-zuordnung.md) | Rollen, Organisationseinheiten und Personen Prozesselementen zuordnen | functional | must | [US-075](user-stories/US-075-lane-orgunit-und-rolle-zuordnen.md), [US-076](user-stories/US-076-aufgabe-person-zuordnen.md) |

**Konzept**: §9 Prozess-Architektur, §6 Kern-Entitätstypen | **ADRs**: ADR-007 (Nested Nodes)

---

### Offene Punkte (bekannte Lücken)

Alle bekannten Lücken wurden geschlossen. Stand 2026-06-28:

| Lücke | Status |
|---|---|
| ADR-001–005 (Gruppe A) | ✓ alle accepted |
| ADR-007 Canvas-Bibliothek | ✓ accepted (Vue Flow) |
| ADR-008 GUI-Architektur | ✓ accepted |
| ADR-016 Persistenz-Strategie | ✓ accepted (EntityVersion) |
| ADR-017 Fully Open Layers | ✓ accepted |
| Walking Skeleton | ✓ UC-06 identifiziert; docs/walking-skeleton.md vorhanden |
| NFR-Lücke (DoD ≥5) | ✓ 8 NFRs mit messbaren Zielwerten |
| UC-06 TreeNode (US-054 blockiert) | ✓ UC-13 (Navigationsbaum) angelegt; US-054 entsperrt |
| UC für Plateau/Go-Live | ✓ UC-11 angelegt + REQ-084–089 + US-084–089 |
| UC für Viewpoint-Verwaltung | ✓ UC-12 angelegt + REQ-090–093 + US-090–093 |
| UC für Navigationsbaum | ✓ UC-13 angelegt + REQ-094–097 + US-094–097 |
| UC-11–16 ohne REQs/USs | ✓ REQ-084–106 + US-084–106 angelegt (2026-06-28) |

---

## 6. Verwaiste Konzept-Kapitel (Auswahl)

Konzept-Kapitel, auf die noch kein UC verweist – potenzielle Scope-Kandidaten:

| Konzept-Kapitel | Thema | Status |
|---|---|---|
| §9 Zuständigkeiten / RACI | Rollen und Verantwortlichkeiten im EA-Team | kein UC |
| §10 Governance | Genehmigungsworkflows | kein UC |
| §13 Integration | Import/Export, XMI, API-Integrationen | kein UC |
| §17 Beispiel-Diagramme | Visualisierungs-Beispiele | kein UC (Diagramm-UC noch TBD) |
| §18 Reporting | Export-Formate, PDF-Berichte | teilweise UC-07 (Dashboard = live Reporting); PDF-Export TBD |
| §19 Suche | Volltext-Suche über Repository | kein UC |
| §22 Datenschutz | DSGVO-Aspekte, Audit-Retention | kein UC |
