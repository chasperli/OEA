# Traceability-Matrix

Vollständige Verfolgbarkeit von Use Cases über Requirements bis zu User Stories. Wird per `/trace-check` auf Konsistenz geprüft oder manuell gepflegt.

**Stand**: 2026-06-26 | **REQs gesamt**: 50 | **USs gesamt**: 54 | **UCs gesamt**: 6

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
| [REQ-058](req/REQ-058-metamodell-exportieren.md) | Metamodell-Konfiguration exportieren (YAML/JSON) | functional | should | – (US ausstehend) |
| [REQ-059](req/REQ-059-viewpoint-import-export.md) | Viewpoint importieren und exportieren | functional | should | – (US ausstehend) |

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

---

### UC-09: Lösungsarchitektur nach Arc42 dokumentieren

**Primärer Akteur**: SH-04 | **Prio**: should | **Status**: draft

| REQ | Titel | Typ | Prio | USs |
|---|---|---|---|---|
| [REQ-067](req/REQ-067-arc42-kapitelsammlung.md) | Arc42ChapterCollection im Metamodell konfigurieren | functional | should | [US-070](user-stories/US-070-arc42-kapitelsammlung-konfigurieren.md) |
| [REQ-068](req/REQ-068-arc42-wysiwyg-editor.md) | Arc42 WYSIWYG-Editor mit Mermaid/PlantUML-Rendering | functional | should | [US-072](user-stories/US-072-arc42-mermaid-plantuml.md) |
| [REQ-069](req/REQ-069-arc42-dokumentation-bearbeiten.md) | Arc42-Dokumentation zu einer Entität bearbeiten und anzeigen | functional | should | [US-071](user-stories/US-071-arc42-frage-beantworten.md) |
| [REQ-070](req/REQ-070-entity-mention-autocomplete.md) | Entity-Mention via /@ (Autocomplete + ID-stabile Verlinkung) | functional | should | [US-073](user-stories/US-073-entity-mention-autocomplete.md) |

**Konzept**: §14 Erweiterbarkeit, §18 Reporting | **ADRs**: –

---

## 3. REQ-Typ-Übersicht

| Typ | REQ-IDs | Anzahl |
|---|---|---|
| functional | REQ-001–007, REQ-009–022, REQ-024–040, REQ-043–070 | 66 |
| non-functional | REQ-008, REQ-071, REQ-072, REQ-073, REQ-074, REQ-075 | **6** ✓ |
| security | REQ-006, REQ-017 | 2 |

*Hinweis: REQ-006 und REQ-017 sind als `security` typisiert und erscheinen auch in der functional-Zählung der jeweiligen UCs.*

### NFR-Übersicht

| REQ | Titel | Kategorie | Prio | Kernzielwert |
|---|---|---|---|---|
| [REQ-008](req/REQ-008-login-latenz.md) | Login-Latenz | performance | should | p95 < 300ms bei 10k Personen |
| [REQ-071](req/REQ-071-katalog-abfrage-latenz.md) | Katalog-Abfrage-Latenz | performance | must | p95 < 500ms mit 3 Joins bei 10k Entitäten |
| [REQ-072](req/REQ-072-canvas-rendering-latenz.md) | Canvas-Rendering-Latenz | performance | must | Time-to-Interactive < 1.500ms bei 150 Entities |
| [REQ-073](req/REQ-073-systemverfuegbarkeit.md) | Systemverfügbarkeit | availability | must | ≥ 99,5 % / Monat (exkl. Wartung); RTO ≤ 30 min |
| [REQ-074](req/REQ-074-gleichzeitige-nutzer-skalierbarkeit.md) | Gleichzeitige Nutzer / Skalierbarkeit | scalability | should | 50 Nutzer ohne Latenz-Degradierung > 2×; 500k Entitäten |
| [REQ-075](req/REQ-075-plattformunabhaengigkeit-deployment.md) | Plattformunabhängigkeit und Cloud-Betreibbarkeit | portability | must | Docker Compose + Helm auf Linux/macOS/Win; kein Vendor-Lock-in (DB, S3, OIDC austauschbar) |

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
| **Gesamt** | **73 USs** | **~238 SP** | |

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

### Offene Punkte (bekannte Lücken)

| Lücke | Beschreibung | Betrifft |
|---|---|---|
| ~~ADR-007 proposed~~ ✓ | Canvas-Bibliothek (React Flow) accepted (2026-06-26); US-045 entsperrt | US-045 |
| ADR-008 ✓ accepted | Client App + Web Portal entschieden (2026-06-26) | UC-05, UC-06 |
| ADR-001–005 offen | Gruppe-A-ADRs: URN-Schema, Enterprise Continuum, Product vs. Project, Reifikation, Layer-Klassifikation | Domänenmodell allgemein |
| NFR-Lücke ✓ | 5 NFRs vorhanden (REQ-008, 071–074); DoD-Ziel erfüllt | – |
| UC-06 TreeNode | US-054 blockiert durch TreeNode-Implementierung (kein eigenes REQ/UC für TreeNode-Verwaltung) | US-054 |
| UC für Plateau/Go-Live | Noch nicht angelegt (in UC-05 als „künftiger UC" referenziert) | Plateau-Modus |
| UC für Viewpoints | UC für Viewpoint-Verwaltung noch nicht angelegt (REQ-059 bereits vorhanden für Import/Export) | Viewpoint-BO |
| UC-08 ✓ | REQ-060–064 + US-063–068 abgeleitet (2026-06-26); ADR-010 accepted | – |
| REQ-058/059 ohne US | Metamodell-Export und Viewpoint-Import/Export haben noch keine User Stories | UC-04 |
| UC für NavigationsTree | Kein eigener UC für TreeNode-CRUD (Ordner anlegen, umbenennen, löschen) | TreeNode-BO |

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
