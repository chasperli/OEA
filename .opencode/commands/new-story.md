# /new-story – Neue User Story anlegen

Legt eine User Story in `requirements/user-stories/` an. Prüft Use-Case-Bezug.

## Argumente

`$ARGUMENTS` enthält optional: `<UC-NN> <Kurztitel>`
Beispiel: `/new-story UC-05 Delta-Entität im Diagramm als Knoten anlegen`

## Ausführung

1. **Nächste freie ID ermitteln**:
   ```bash
   ls requirements/user-stories/US-*.md | sed 's/.*US-//' | sed 's/-.*//' | sort -n | tail -1
   ```
   Nächste ID = höchste Nummer + 1 (z.B. `US-132`).

2. **UC-Referenz prüfen**:
   - UC-NN aus `$ARGUMENTS` oder erfragen
   - Verifizieren: `ls requirements/use-cases/UC-NN-*.md`
   - Falls UC nicht existiert: STOP — UC muss zuerst angelegt werden

3. **REQ-Referenz prüfen**:
   - Zu welchem REQ gehört diese Story? (mind. einer)
   - Verifizieren: `ls requirements/req/REQ-NNN-*.md`
   - Falls REQ nicht existiert: Erst `/new-requirement` aufrufen

4. **Persona klären**:
   - `primary_actor` des referenzierten UC lesen → Persona der Story
   - Story-Formulierung: "Als [Persona aus UC] möchte ich …"

5. **Datei anlegen**:
   Kopiere `templates/user-story.template.md` nach `requirements/user-stories/US-NNN-kurzname.md`
   - `ID`, `Story Points`, `Status: backlog`, `Sprint: nicht-zugeordnet` setzen
   - `Bezug`: UC-NN und REQ-NNN verlinken
   - Mindestens 2 Akzeptanzkriterien (AC1, AC2) formulieren

6. **INVEST-Check**:
   - Independent: Hängt die Story von einer anderen Story ab, die noch nicht done ist?
   - Small: Kann sie in 1-3 Tagen implementiert werden? (> 8 SP → splitten)
   - Testable: Sind die AKs prüfbar ohne Interpretation?

7. **Story Points schätzen** (Fibonacci: 1, 2, 3, 5, 8, 13):
   - 1-2 SP: triviale UI-Anpassung oder einfacher API-Endpunkt
   - 3-5 SP: typische Feature-Story mit Backend + Frontend
   - 8 SP: komplexe Story; überlegen ob Split sinnvoll
   - 13 SP: zu gross, muss gesplittet werden

8. **Ausgabe**:
   Pfad, ID, Story Points, UC- und REQ-Bezug.

## Konventionen

- Dateiname: `US-NNN-kurzname.md` (dreistellig; Kurzname deutsch, kebab-case)
- Stories beschreiben EINE Aufgabe — kein Multi-Feature in einer Story
- Definition-of-Done-Checkliste vollständig ausfüllen
