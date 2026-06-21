# Anti-Pattern-Katalog für das Arbeiten mit Agents

Häufige Fehler im Vibe-Coding-Workflow und wie man sie vermeidet. Geschrieben als Prophylaxe – wenn du diese Muster kennst, fällst du seltener hinein.

## Über die Struktur

Pro Anti-Pattern:
- **Symptom**: woran du es erkennst
- **Ursache**: warum es passiert
- **Konsequenz**: was schiefläuft, wenn es bleibt
- **Gegenmaßnahme**: was du stattdessen tust

---

## Kategorie 1: PO-Rolle

### AP-01: Mikromanagement der Agents

**Symptom**: Du genehmigst jeden Satz, den ein Agent schreibt. Du redest in jeden Modellierungs-Entscheid hinein. Du gibst Vorgaben bis auf Klassennamen.

**Ursache**: Unsicherheit, ob die Agents wirklich gut arbeiten. Verstärkt durch erste positive Erfahrungen ("vielleicht ist Detail-Kontrolle der Schlüssel zum Erfolg").

**Konsequenz**: Du bist Bottleneck, alles dauert mit dir doppelt so lange. Agents werden vorsichtig und fragen bei jedem Detail – das war nicht gewollt. Du verschwendest deine Zeit in falsche Detailtiefe.

**Gegenmaßnahme**: Definiere klare Akzeptanz-Häppchen. Reviewe pro Use Case, nicht pro Satz. Lass die Agents 2-3 Stunden arbeiten, dann reviewe. Mikrokontrollen sind teuer.

---

### AP-02: PO als Bottleneck durch Abwesenheit

**Symptom**: Agents fragen, du antwortest nicht für Tage. Wenn du zurückkommst, sind Annahmen getroffen oder Stillstand.

**Ursache**: PO-Rolle wird als nebenher betrachtet. Vibe Coding wird unterschätzt – "die Agents machen das schon".

**Konsequenz**: Falsche Annahmen pflanzen sich fort. Refactoring später ist teuer. Agents lernen, dass Fragen wenig Sinn machen, und treffen mehr Annahmen.

**Gegenmaßnahme**: Plane PO-Zeit ein wie Meeting-Slots. Mindestens 2-3 Stunden pro Tag während aktiver Phase. Wenn keine Zeit: Slot mit Agents kommunizieren ("bin morgen 14-16 Uhr verfügbar").

---

### AP-03: Vision-Drift durch schweigende Akzeptanz

**Symptom**: Über Wochen schleichen sich Features ein, die nicht zur Vision passen. Du merkst es, akzeptierst aber, "weil schon halb fertig".

**Ursache**: Reviews fokussieren auf "funktioniert es" statt "passt es zur Vision". Verstärkt durch Sunk-Cost-Fallacy.

**Konsequenz**: Tool wird zur Frankenstein-Mischung aus widersprüchlichen Konzepten. Vision wird formal beibehalten, real ignoriert.

**Gegenmaßnahme**: Bei jedem Review explizit fragen: "Würde das in der Vision-Aussage Platz finden?" Wenn nein: blockieren oder Vision-Revision begründen. Vision-Drift ist tödlicher als Bug.

---

### AP-04: PO als Implementierer

**Symptom**: Du schreibst selbst Code, weil "schneller als erklären". Du modellierst Business Objects selbst, weil "ich weiß doch was ich will".

**Ursache**: Mangel an Geduld, technisches Selbstbewusstsein, Vertrauen-Aufbau zu Agents fehlt.

**Konsequenz**: Du wirst von PO zu Solo-Entwickler. Agents werden überflüssig. Vibe Coding als Idee scheitert.

**Gegenmaßnahme**: Diszipliniert. Wenn du den Wunsch zu coden hast: Stop. Frage dich, welcher Agent das machen sollte. Erklären statt coden ist eine Fähigkeit – sie zu trainieren ist die eigentliche Investition.

---

## Kategorie 2: Agent-Nutzung

### AP-05: Falscher Agent für die Aufgabe

**Symptom**: Du fragst den Frontend Engineer nach Datenmodellierung. Du fragst den Backend Engineer nach UI-Layout. Du fragst den Solution Architect nach detaillierter Implementation.

**Ursache**: Unklarheit über die Rollen, oder bequem den Agent zu fragen, mit dem du gerade arbeitest.

**Konsequenz**: Antworten sind oberflächlich oder falsch. Agents arbeiten außerhalb ihres Mandats. Verantwortlichkeiten verschwimmen.

**Gegenmaßnahme**: Quick Reference griffbereit. Im Zweifel: Solution Architect fragen, wer dafür zuständig ist. Er ist der Koordinator.

---

### AP-06: Mehrere Agents in einem Chat vermischen

**Symptom**: Du wechselst im selben Chat zwischen Rollen ("jetzt als Backend Engineer ... jetzt als Frontend ..."). Antworten werden zunehmend allgemein und verlieren Rollen-Schärfe.

**Ursache**: Bequemlichkeit, weniger Klicks. Verstärkt durch lange Sessions, in denen du müde wirst.

**Konsequenz**: Agent-Definitionen verwässern. Spezialisierung geht verloren. Du bekommst durchschnittliche statt rollen-spezifische Antworten.

**Gegenmaßnahme**: Eine Aufgabe = ein Agent = eine Session (wenn möglich). Bei längeren Phasen: Sessions pro Agent. Sub-Agent-Mechanismus (wenn verfügbar) nutzen.

---

### AP-07: Persona als Agent missverstehen

**Symptom**: Du sagst "Lass uns Franz fragen, was er will" – als ob Franz ein Agent wäre.

**Ursache**: Persona-Konzept und Agent-Konzept werden verwechselt, weil beide "Rollen" beschreiben.

**Konsequenz**: Agents werden falsch instruiert. Personas werden falsch verwendet. Klärungen verirren sich.

**Gegenmaßnahme**: Personas sind fiktive *Nutzer* deines Endprodukts. Agents sind *Helfer* in der Entwicklung. Persona Franz fragt nicht – du fragst, **für Franz**. Falsche Formulierung: "Frag Franz". Richtige Formulierung: "Solution Architect, was würde Franz brauchen für ..."

---

### AP-08: Agent als Wissens-Orakel

**Symptom**: "Backend Engineer, was ist der Unterschied zwischen JWT und Session-Cookies?" – allgemeine Wissensfragen, nicht projektspezifisch.

**Ursache**: Agents sind hilfsbereit und antworten. Es fühlt sich kosteneffizient an.

**Konsequenz**: Agent-Sessions werden lang, Tokens verbraucht. Antworten sind nicht besser als bei normalem Claude. Rollen-Klarheit leidet.

**Gegenmaßnahme**: Allgemeine Wissensfragen direkt fragen, ohne Agent-Rolle. Agents sind für rollen-spezifische Arbeit, nicht für Recherche.

---

## Kategorie 3: Anforderungs-Pipeline

### AP-09: Sprung in die Implementation

**Symptom**: Du sagst "lass uns das einfach mal bauen", überspringst Business Object, Use Case, Requirements. Engineer fängt an, du klärst während der Implementation.

**Ursache**: Pragmatismus-Druck, "Time to first Feature" als Metrik.

**Konsequenz**: Im Code stecken implizite Annahmen, die keiner dokumentiert hat. Refactoring später teuer. Onboarding neuer Personen unmöglich.

**Gegenmaßnahme**: Erinnere dich, dass Anforderungs-Pipeline kein Bürokratie ist, sondern Wissens-Sicherung. Selbst für kleine Features ein Mini-Use-Case und 2-3 Requirements. Wenn nichts geschrieben wird, ist es zu klein, um Agents zu nutzen.

---

### AP-10: Use Case als CRUD-Liste

**Symptom**: UC-01: "Application Component anlegen". UC-02: "Application Component lesen". UC-03: "Application Component ändern". UC-04: "Application Component löschen".

**Ursache**: Denken in Tabellen-Operationen statt in Zielen.

**Konsequenz**: 100 Use Cases, alle bedeutungslos. Niemand erkennt mehr, was dem Endnutzer Wert bringt. Priorisierung wird unmöglich.

**Gegenmaßnahme**: Use Cases sind zielorientiert. "Franz will eine neue Anwendung erfassen, damit sie in der Inventar-Sicht erscheint" – das ist ein Use Case. CRUD-Operationen sind Requirements, die aus dem UC entstehen.

---

### AP-11: NFR ohne Zahlen

**Symptom**: REQ-007: "System muss performant sein." REQ-008: "System muss sicher sein." REQ-009: "System muss benutzerfreundlich sein."

**Ursache**: Schwierigkeit, konkrete Zielwerte zu bestimmen. Vermeidungs-Strategie.

**Konsequenz**: NFRs sind unprüfbar, also wertlos. Niemand kann nachweisen, dass sie erfüllt sind. Auditor wird unglücklich.

**Gegenmaßnahme**: Requirements Engineer ist explizit instruiert, NFRs ohne messbare Werte abzulehnen. Wenn du selbst keine Zahl weißt: Recherche oder geschätzte Zahl als Hypothese (besser als nichts). Beispiel: "p95 Response <500ms bei <1000 Entities". Korrigierbar.

---

### AP-12: Compound Requirement

**Symptom**: REQ-042: "Das System muss Application Components anlegen, ändern, löschen können und dabei Audit-Log schreiben und Validierung durchführen."

**Ursache**: Bequemlichkeit, "klingt wie eine zusammenhängende Anforderung".

**Konsequenz**: Bei der Verifikation unklar, ob "anlegen funktioniert, aber Audit-Log fehlt" ein Pass oder Fail ist. Status-Tracking unmöglich.

**Gegenmaßnahme**: Atomarität ist Pflicht. Ein Requirement = ein MUSS. Compound trennen in mehrere REQs.

---

### AP-13: Solution in Requirement

**Symptom**: REQ-055: "Das System MUSS Redis als Cache verwenden." REQ-056: "Das System MUSS Postgres als Datenbank verwenden."

**Ursache**: Verwechslung von "was" und "wie".

**Konsequenz**: Solution Design verlagert sich in Requirements. Solution Architect verliert seinen Spielraum. Falsche Tech-Wahl wird zementiert.

**Gegenmaßnahme**: Requirement beschreibt nur **was** das System leisten muss, nicht **wie**. Statt "Redis als Cache" → "Wiederholte Lookups mit Hit-Rate >95% bei kohärenten Daten". Tech-Wahl ist Lösungs-Design, kommt in ADR.

---

### AP-14: Requirement ohne Use-Case-Bezug

**Symptom**: REQ-100 existiert, keiner weiß warum. Bei Frage "wer braucht das" zuckt jeder mit den Schultern.

**Ursache**: Anforderung wurde vorausschauend angelegt, "weil mal sicher gebraucht".

**Konsequenz**: Backlog wächst um Requirements, die nie implementiert werden, aber Lärm in Priorisierung erzeugen.

**Gegenmaßnahme**: Jedes Requirement muss mindestens einen Use-Case-Bezug haben. Wenn keiner existiert: Requirement löschen oder erst Use Case formulieren. "Trace-check" hilft dabei.

---

## Kategorie 4: Spec-Disziplin

### AP-15: Spec-Code-Drift

**Symptom**: OpenAPI sagt POST /api/v1/applications nimmt JSON mit Field "name". Backend nimmt aber "title" entgegen. Frontend sendet "name". 500-Fehler.

**Ursache**: Backend hat während Implementation Feldname geändert, Spec nicht aktualisiert.

**Konsequenz**: Vertrauen in Specs bricht zusammen. Frontend und Backend brauchen eigene Tests gegeneinander. Spec wird sinnlos.

**Gegenmaßnahme**: Contract-Tests in CI: jeder PR validiert Spec gegen Implementation. Spec-Änderung ist eigener PR mit Solution-Architect-Review. Backend/Frontend dürfen Spec nicht eigenmächtig ändern.

---

### AP-16: Spec mit Implementation gemischt

**Symptom**: OpenAPI-Spec enthält Hinweise wie "wird via SQL aus tabelle X geholt" oder "verwendet Redis-Cache".

**Ursache**: Implementer schreibt Implementations-Details in Spec, weil "praktisch zur Doku".

**Konsequenz**: Spec ist nicht mehr unabhängig vom Backend. Frontend sieht Backend-Details. Migration zu anderem Backend wird unmöglich.

**Gegenmaßnahme**: Spec beschreibt nur die Schnittstelle: Endpunkt, Method, Request, Response. Implementations-Hinweise gehören in Code-Kommentare oder Backend-README, nicht in Spec.

---

### AP-17: Spec-First in der Theorie, Code-First in der Praxis

**Symptom**: Spec wird "irgendwann" geschrieben, nachdem Backend bereits implementiert wurde. Frontend wartet.

**Ursache**: Bequemlichkeit, "ich denke beim Coden schon, wie die API aussieht".

**Konsequenz**: Spec ist nicht mehr Quelle der Wahrheit, sondern nachträgliche Dokumentation. Frontend kann nicht parallel starten. Vorteil von Spec-First geht verloren.

**Gegenmaßnahme**: Solution Architect erstellt Spec **vor** Tickets. Backend und Frontend bekommen Tickets erst, wenn Spec ready ist. CI prüft Spec-Existenz.

---

## Kategorie 5: Sicherheit und Compliance

### AP-18: Security als Nachgedanke

**Symptom**: Feature wird gebaut, dann Security Engineer dazu geholt. Findings sind Critical, alles muss umgebaut werden.

**Ursache**: Security wird als Quality Gate verstanden, nicht als Design-Constraint.

**Konsequenz**: Massiv teures Refactoring. Frust bei Engineers. Security-Engineer wird als Bremsklotz wahrgenommen.

**Gegenmaßnahme**: Security Engineer ist bei Spec-Reviews dabei, nicht erst beim Code-Review. Threat-Modeling als Teil der Architektur-Klärung. Sichere Defaults von Anfang an.

---

### AP-19: Audit-Trail als Toggle

**Symptom**: Konfiguration enthält "audit_log_enabled: false" als Option. Begründung: "manche Nutzer wollen weniger Logging".

**Ursache**: Pseudo-Flexibilität, Bequemlichkeit für Development-Umgebung.

**Konsequenz**: In Produktion wird vergessen, Audit zu aktivieren. Compliance-Audit findet Lücken. Tool unbrauchbar in regulierten Umgebungen.

**Gegenmaßnahme**: Audit-Trail ist Pflicht, nicht Toggle. Punkt. Wenn Development-Umgebung leichteres Logging braucht: andere Log-Stufe, aber Audit bleibt.

---

### AP-20: Property-Level-AuthZ "macht später"

**Symptom**: MVP wird mit Entity-Level-AuthZ gebaut. Property-Level kommt "nach dem Walking Skeleton".

**Ursache**: Komplexitäts-Vermeidung, Performance-Sorgen.

**Konsequenz**: Architektur-Refactoring später unbezahlbar. Personas SH-05 (CIO) und SH-06 (Max) lehnen Tool ab. OSS-Adoption in regulierten Umgebungen blockiert.

**Gegenmaßnahme**: Property-Level-AuthZ ist im Konzept als Pflicht definiert. Von Anfang an in der Architektur denken. Auch wenn initial wenige Properties geschützt sind, das Framework muss stehen.

---

## Kategorie 6: Dokumentations-Disziplin

### AP-21: Veraltete Konzept-Verweise

**Symptom**: ADR verweist auf "§7 Motivation". Aber im Konzept ist §7 jetzt "Stakeholder & Goals". Niemand merkt es, bis ein neuer Contributor verwirrt ist.

**Ursache**: Konzept evolviert, Querverweise bleiben starr.

**Konsequenz**: Vertrauen in Doku bricht. Refactoring wird vermieden. Konzept driftet von Realität.

**Gegenmaßnahme**: Link-Validierung in CI (`scripts/validate_links.py`). Bei jedem Konzept-Release Verweise prüfen. Solution Architect ist verantwortlich für Konsistenz.

---

### AP-22: Doku als Nachgedanke

**Symptom**: Code wird gemerged, README wird "irgendwann" aktualisiert.

**Ursache**: Doku gilt als "nicht-funktional", "kann nachgeholt werden".

**Konsequenz**: Doku driftet, neue Contributors verlieren sich, Onboarding wird teuer.

**Gegenmaßnahme**: Doku ist Teil der Definition of Done. Kein Merge ohne aktualisierte Doku. CLAUDE.md ist verbindlich.

---

### AP-23: Geheime Annahmen

**Symptom**: Backend-Implementation funktioniert nur, wenn die DB UTF-8 hat. Steht nirgends. Bei Deployment auf anderer DB: Bug.

**Ursache**: Implementer macht Annahmen, die für ihn offensichtlich sind, vergisst Dokumentation.

**Konsequenz**: Operations-Probleme (Max wäre erbost). Reproduzierbarkeit leidet.

**Gegenmaßnahme**: Solution Architect prüft bei Integration: "Was sind die unausgesprochenen Voraussetzungen?" Diese kommen in README oder NFR.

---

## Kategorie 7: Skalierung der Arbeit

### AP-24: Über-Spezifikation auf Vorrat

**Symptom**: Du modellierst 50 Business Objects "weil mal sicher gebraucht". UC-Katalog hat 100 Einträge, davon nur 5 priorisiert.

**Ursache**: Vollständigkeits-Wunsch, akademisches Denken.

**Konsequenz**: Modellierung kostet Wochen, ohne dass Code entsteht. Demotivation. Modelle altern, bevor sie implementiert werden.

**Gegenmaßnahme**: Just-in-Time-Modellierung. Modelliere, was du in den nächsten 2-4 Wochen brauchst. Mehr ist Verschwendung, weniger ist Risiko.

---

### AP-25: Walking Skeleton als Big Bang

**Symptom**: Walking Skeleton soll "alle wichtigen Features" enthalten. 20+ Use Cases sind MUST.

**Ursache**: Falsches Verständnis. Walking Skeleton ist nicht "minimaler Marktwert", sondern "end-to-end-funktionierender Durchstich".

**Konsequenz**: Walking Skeleton dauert 6 Monate. Vibe Coding scheitert vorher.

**Gegenmaßnahme**: Walking Skeleton ist ein **einziger** End-to-End-Durchstich: ein einfacher Use Case, der die gesamte Architektur testet. Vielleicht "Application Component anlegen und in Liste sehen". Mehr nicht. Alles andere baut darauf auf.

---

### AP-26: Refactoring als Tabu

**Symptom**: Ein Use Case wurde modelliert, später stellt sich heraus, er war falsch. Statt zu ändern, wird die falsche Annahme im ganzen System mitgeschleppt.

**Ursache**: Sunk-Cost-Fallacy. Angst vor Mehraufwand.

**Konsequenz**: Falsche Strukturen verstärken sich. Schulden wachsen.

**Gegenmaßnahme**: Falsche Annahmen früh korrigieren ist immer billiger. ADR-Mechanismus erlaubt, Entscheidungen explizit als `superseded` zu markieren. Use Cases haben Versionierung.

---

## Kategorie 8: Mensch-Maschine-Dynamik

### AP-27: Übertriebenes Vertrauen

**Symptom**: Du akzeptierst alles, was Agents produzieren, ohne kritisch zu prüfen.

**Ursache**: Erste positive Erfahrungen, Energie-Sparen, Vertrauen-Aufbau zu Agents.

**Konsequenz**: Subtile Fehler schleichen sich ein. Du bemerkst sie erst spät, wenn Refactoring teuer ist.

**Gegenmaßnahme**: Kritisch reviewen ist Pflicht. Agents sind nicht unfehlbar. Trust but verify.

---

### AP-28: Übertriebenes Misstrauen

**Symptom**: Du hinterfragst jedes Detail, schreibst alles um, Agents werden nutzlos.

**Ursache**: Negative Erfahrung in der Vergangenheit, Kontrollbedürfnis.

**Konsequenz**: Vibe Coding kostet mehr Zeit als Solo-Arbeit. Du verlierst Motivation.

**Gegenmaßnahme**: Vertrauen aufbauen durch positive Erfahrung. Erlaube Agents, Aufgaben vollständig zu erledigen, bevor du reviewst. Lerne, welche Agents in welchen Bereichen zuverlässig sind.

---

### AP-29: Agents als Therapeuten

**Symptom**: Du diskutierst stundenlang mit Solution Architect, wann der "richtige Moment" für eine Entscheidung ist.

**Ursache**: Entscheidungsunsicherheit. Agents sind höflich, blockieren nicht.

**Konsequenz**: Massive Token-Verschwendung. Keine Fortschritte.

**Gegenmaßnahme**: Wenn du dreimal über dieselbe Sache redest: Entscheide. Auch falsche Entscheidung ist besser als Nicht-Entscheidung. ADRs sind reversibel.

---

## Notfall-Checkliste

Wenn etwas spürbar schiefläuft, gehe diese Liste durch:

- [ ] Bin ich noch in der Vision? (Vision-Dokument lesen)
- [ ] Habe ich vor 3 Tagen eine Annahme akzeptiert, die ich heute hinterfragen würde?
- [ ] Sind die Specs noch Quelle der Wahrheit?
- [ ] Hat ein Agent eine falsche Rolle übernommen?
- [ ] Wurden Tests übersprungen?
- [ ] Security-Review umgangen?
- [ ] Persona-Bezug aller Artefakte noch klar?
- [ ] Trace-Matrix gepflegt?

Wenn 2+ Punkte "nein": Pause machen, mit Solution Architect den aktuellen Stand reflektieren, ggf. Korrektur planen.

## Drei goldene Schutz-Regeln

1. **Bei Zweifel: Eine Frage statt zehn Annahmen**. Agents fragen lassen ist besser als später raten.
2. **Bei Konflikt: PO entscheidet, ADR dokumentiert**. Keine Konflikte aussitzen.
3. **Bei Hektik: Stoppen ist billiger als später Reparieren**. Müde macht Bugs.
