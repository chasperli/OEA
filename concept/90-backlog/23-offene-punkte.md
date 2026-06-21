## 23. Offene Punkte / nächste Entscheidungen

Diese Themen sind bewusst noch nicht entschieden und werden in Folge-ADRs geklärt:

1. **Persistenz-Technologie**: Graph-DB, Postgres+JSONB, oder Git+Index – zu entscheiden anhand Query-Anforderungen (siehe [§22 (Auswertbarkeit)](../70-platform/22-auswertbarkeit.md) – Graph-Traversierung und Analytics)
2. **Identitäts-Schema**: URN-Format für Entity-IDs (`urn:ea:org:domain:type:id`?)
3. **Bitemporalität**: Reicht Gültigkeits-Zeit (Plateau), oder brauchen wir zusätzlich Erfassungszeit?
4. **Diff-Semantik**: Wie werden Plateau-Diffs berechnet – property-by-property oder nur Lifecycle-basiert?
5. **BPMN-Speicherung**: Natives BPMN-XML im Repo, oder Konvertierung ins interne Modell + Re-Export?
6. **Referenz-Integrität über Plateaus**: Wenn eine Entität in einem Plateau `retired` ist, darf eine andere Entität sie dort noch referenzieren?
7. **ITSM-Konnektor-Scope**: Welche ITSM-Systeme werden initial unterstützt (ServiceNow als erstes? generischer REST-Adapter?)
8. **Sync-Konflikt-Resolution**: Wie werden Mastership-Konflikte behandelt – Letzter gewinnt, manuelle Auflösung, Master immer siegt?
9. **PPM-Konnektor-Scope**: Welche PPM-Tools initial unterstützen (Jira, OpenProject, ServiceNow SPM)?
10. **Schema-Profile**: Welche Profile ausliefern (enterprise-safe, enterprise-classical, product-less, solo-architect)? Wie werden sie versioniert?
11. **Abgrenzung Product vs. Project**: Dürfen beide im selben Repository koexistieren? Wenn ja, wie werden Duplikate/Overlaps behandelt?
12. **SAFe-Capability-Kollision**: Finale Lösung für Namensgleichheit TOGAF-Capability vs. SAFe-Capability (Stereotype ist Vorschlag, aber reicht das UI-seitig?)
13. **Continuum-Repository-Verhältnis**: Separate Git-Repos für Continuum und Instanzen, oder ein Repo mit zwei Top-Level-Ordnern? (Governance-Frage)
14. **TRM-Taxonomie-Pflege**: Eigenes TRM vom TOGAF-Beispiel ableiten oder ein standardisiertes Branchenmodell (z.B. von Open Group) als Basis?
15. **Scope-Ausdrucksstärke für Schema-Evolution**: Wie mächtig muss die Scope-Query-Sprache sein? Nur Properties + IN-Listen, oder volle Graph-Queries?
16. **Data-Quality-Score-Gewichtung**: Wer definiert Gewichte pro Property-Relevanz? Zentral im Schema oder pro Organisation konfigurierbar?
17. **Person-Datenhaltung und DSGVO**: Welche Detail-Tiefe für Person-Entitäten (full vs. reference-only vs. anonymized)? Wie wird Rechtmäßigkeit der Verarbeitung modelliert?
18. **Skill-Taxonomie**: SFIA als Standardreferenz mitliefern, oder nur als Import-Option? Updates bei neuen SFIA-Versionen?
19. **BPM-Tool-Adapter-Scope**: Welche BPM-Tools initial unterstützen (Camunda, Signavio, BIC, ARIS)? Lese- oder auch Schreibzugriff?
20. **PCF-Integration**: APQC-PCF lizenzpflichtig – wie im Open-Source-Tool handhaben? Nur Verweise auf Codes, oder Taxonomie mitliefern?
21. **Carbon-Assessment-Methodik**: Welche Methoden unterstützen (SCI, GHG Protocol)? Automatische Schätzung oder nur manuelle Pflege?
22. **Contract-Dokumenten-Ablage**: Verträge selbst im Repo oder nur Referenzen zu externen DMS?
23. **Query-Sprachen**: Cypher + SQL nebeneinander oder einheitliche DSL? Wie werden Ergebnisse kombinierbar?
24. **Persistenz-Entscheidung für Walking Skeleton**: Postgres+JSONB+AGE als Default – final?
25. **Graph-Query-Standard**: openCypher, GQL (ISO), oder Gremlin? (Einfluss auf DB-Wahl)
26. **Event-Transport**: SSE als Default, aber welche weiteren Optionen initial (WebSocket, Kafka, Webhooks)?
27. **API-Authentifizierungs-Scope**: OIDC als Muss, aber welche IdPs initial getestet (Keycloak, Auth0, Azure AD)?
28. **Modul-Isolierung**: Module in gleichem Prozess, als Sidecar oder als eigenständige Services?
29. **CLI-Query-Tool Scope**: Volle Query-Engine lokal oder nur Proxy zum Server?
30. **Maximale Reifikations-Tiefe**: Default 2 – ist das für alle realistischen Fälle ausreichend? Pro-Schema konfigurierbar oder global?
31. **Relation-Adressierung**: Alle Relationen immer direkt per URN erreichbar (`/relations/{urn}`) oder nur die mit Meta-Properties? Hat Auswirkungen auf Storage-Overhead.
32. **Relation-Lifecycle pro Plateau**: Wenn Relationen eigenen Lifecycle haben – wie in UI darstellen (Farbe auf Kante? Separate Relation-Liste pro Plateau?)
33. **GRC-Adapter-Priorität**: Verinice zuerst (Open Source, ISMS-nah), ServiceNow GRC (Enterprise-Verbreitung), oder OSCAL-basierter generischer Export?
34. **Verarbeitungsverzeichnis-Format**: Eigenes Schema oder sich an nationalen Behörden-Vorgaben (BSI, CNIL, ICO) orientieren?
35. **Control-Framework-Integration**: ISO 27001 Annex A als Continuum-Artefakt auslieferbar, oder nur strukturelle Unterstützung ohne Inhalte?
36. **Audit-Trail-Speicherung**: Gleiche DB wie Repository, separater Store, oder externes System (Write-Only-Log)?
37. **Schutzbedarfs-Vererbung**: Automatische Ableitung aus Data Entities, oder nur manuelle Pflege mit Validierungs-Hint?
38. **Property-Level-AuthZ-Konfiguration**: Global im Schema, oder pro Organisation im Deployment? Welche UI zum Pflegen?
39. **Segregation-of-Duties-Erzwingung**: Soft-Constraint (Warning) oder Hard-Constraint (blockiert Aktion)? Wer kann SoD-Regeln überschreiben?
40. **Application-vs-Technology-Klassifikations-Prinzip**: Welche Variante gilt als Default-Prinzip im Auslieferungszustand (Plattform-Services=Technology vs. Produkte-mit-PO=Application)? Oder bewusst undefiniert, damit jede Org selbst entscheidet?
41. **Requirements-Versionierung-Trigger**: Welche Änderungen erzeugen automatisch eine neue Version (statement, acceptanceCriteria, priority)? Welche sind "minor" und brauchen keine neue Version?
42. **System-Requirements-Scope**: Sollen SystemRequirements im Tool nur referenziert (externalReference auf Jira/Doors) oder auch direkt erfasst werden können? Wenn beides erlaubt: wann was?
43. **ReqIF-Import-Export**: Als Modul (über API-Adapter) oder gar nicht? Falls ja: Mapping-Konventionen zu Architecture/System-Requirement-Stereotypen?
44. **Logical-Stub-Auto-Generierung**: Per Default aktiv, opt-in, oder opt-out? Wie werden auto-generierte Stubs visuell von gepflegten unterschieden? Lifecycle eines Auto-Stubs (verfällt nach Zeit?, wird bei nachträglicher Pflege "promoted"?)
45. **Inventar-Sicht-Scope**: Welche EntityTypes erscheinen in der Default-Inventar-Sicht? Nur Application + Technology, oder auch DataComponent, Interface, BusinessService?
46. **Visualisierungs-Strategie / Renderer-Notation**: Welche Diagramm-Notation(en) unterstützt das Tool? Textbasiert (PlantUML, Mermaid, D2, Graphviz, Structurizr DSL), grafisch (Archi/ArchiMate-XML, drawio), oder use-case-bezogene Mischung? Entscheidung nach Abschluss der Requirements-Engineering-Phase basierend auf Persona- und Use-Case-Analyse. Siehe §21.2.1.
47. **Bestandstool-Migration**: Sollen vorhandene Modelle aus Sparx EA, Archi, anderen EA-Tools importiert werden können? Welche Formate (ArchiMate Open Exchange, XMI, eigene Importer)?

---

← [Auswertbarkeit & Query-Architektur](../70-platform/22-auswertbarkeit.md) · [🏠 Übersicht](../README.md) · [Nächste Schritte](24-naechste-schritte.md) →
