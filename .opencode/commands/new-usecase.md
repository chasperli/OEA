# /new-usecase – Neuen Use Case anlegen

Legt einen neuen Use Case in `requirements/use-cases/` an. Prüft Stakeholder- und Business-Object-Bezug.

## Argumente

`$ARGUMENTS` enthält den Titel des Use Cases (optional).

## Ausführung

1. **Nächste freie ID ermitteln**:
   ```bash
   ls requirements/use-cases/UC-*.md | sed 's/.*UC-//' | sed 's/-.*//' | sort -n | tail -1
   ```
   Nächste ID = höchste Nummer + 1, zweistellig (z.B. `UC-22`).

2. **Stakeholder-Bezug klären** (vor dem Anlegen fragen falls nicht aus `$ARGUMENTS` ableitbar):
   - Wer ist `primary_actor`? → muss als `SH-NN` in `business-analysis/stakeholders/` existieren
   - Verifizieren: `ls business-analysis/stakeholders/SH-NN-*.md`

3. **Business-Object-Bezug klären**:
   - Welche Business Objects nutzt dieser UC? → müssen in `business-objects/` existieren
   - Verifizieren: `ls business-objects/<identifier>.md`
   - Falls BO fehlt: STOP — erst `/new-business-object` aufrufen

4. **Datei anlegen**:
   Kopiere `templates/use-case.template.md` nach `requirements/use-cases/UC-NN-kurzname.md`
   - `id`, `title`, `primary_actor`, `created` (heute), `status: draft` setzen
   - Alle `{{Platzhalter}}` ersetzen
   - Mindestens einen Konzept-Bezug setzen (§-Angabe im Konzept-Verzeichnis)

5. **Anti-Pattern-Prüfung**:
   - Ist der Titel zielorientiert (NICHT: "X anlegen", "X bearbeiten")?
   - Hat der UC echte Akzeptanzkriterien (nicht nur Platzhalter)?
   - Hat der UC eine Story-Formulierung ("Als … möchte ich … damit …")?

6. **Ausgabe**:
   Pfad, ID, primary_actor, referenzierte BOs, und Hinweis auf offene Felder.

## Konventionen

- Dateiname: `UC-NN-kurzname.md` (Kurzname: deutsch, kebab-case, 2-4 Wörter)
- CRUD-Use-Cases vermeiden (kein "Entität anlegen" ohne Ziel-Kontext)
- Mindestens 1 Konzept-Bezug ist Pflicht
