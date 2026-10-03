# /new-business-object – Neues Business Object anlegen

Legt ein neues Business Object in `business-objects/` an. **Vor Use Cases modellieren.**

## Argumente

`$ARGUMENTS` enthält den deutschen Namen des Business Objects (optional).

## Ausführung

1. **Identifier ableiten**:
   - Englisch, kebab-case, aus `$ARGUMENTS` (z.B. "Anwendungskomponente" → `application-component`)
   - Sicherstellen, dass kein BO mit diesem Identifier bereits existiert:
     ```bash
     ls business-objects/*.md | grep -i "<identifier>"
     ```

2. **Datei anlegen**:
   Kopiere `templates/business-object.template.md` nach `business-objects/<identifier>.md`
   - Alle `{{Platzhalter}}` befüllen
   - `identifier`, `name_de`, `name_en`, `version: 0.1.0`, `status: draft` setzen
   - `owner_role` auf passende Stakeholder-Rolle setzen

3. **Validierung**:
   - Existieren alle referenzierten Business Objects in `Beziehungen`?
   - Hat das BO mindestens 3 Attribute?
   - Gibt es eine `Definition` in einem Satz?
   - Hat es mindestens einen Konzept-Bezug?

4. **Abgrenzung prüfen**:
   Ähnliche bestehende BOs in `business-objects/` lesen und sicherstellen, dass keine Dopplung entsteht.

5. **Ausgabe**:
   Pfad der neuen Datei, Identifier, und Hinweis auf offene Beziehungen oder Konzept-Bezüge.

## Konventionen

- Dateiname: `<english-kebab-case-identifier>.md`
- Identifier sprachneutral (nicht `anwendungs-komponente`, sondern `application-component`)
- Kein BO ohne Definition-Satz anlegen
- `Business Rules` leer lassen wenn noch keine bekannt — kein BR-NN-Platzhalter eintragen
