# /new-stakeholder – Neues Stakeholder-Profil anlegen

Legt ein neues Stakeholder-Profil in `business-analysis/stakeholders/` an.

## Argumente

`$ARGUMENTS` enthält den Namen oder die Rolle des Stakeholders (optional).

## Ausführung

1. **Nächste freie ID ermitteln**:
   ```bash
   ls business-analysis/stakeholders/SH-*.md | sed 's/.*SH-//' | sed 's/-.*//' | sort -n | tail -1
   ```
   Nächste ID = höchste gefundene Nummer + 1, zweistellig mit führender Null (z.B. `SH-10`).

2. **Profil aus Template anlegen**:
   Kopiere `templates/stakeholder.template.md` nach `business-analysis/stakeholders/SH-NN-kurzname.md`
   - `NN` = nächste freie ID
   - `kurzname` = englisch, kebab-case, aus `$ARGUMENTS` ableiten
   - Alle `{{Platzhalter}}` durch konkrete Werte ersetzen

3. **Validierung**:
   - Hat das Profil `ID`, `Typ`, `Bezug zum Tool`?
   - Gibt es mindestens 2 Concerns in der Tabelle?
   - Ist `Beteiligte Use Cases` befüllt oder als Platzhalter markiert?

4. **README aktualisieren**:
   Prüfe ob `business-analysis/stakeholders/README.md` existiert; falls ja, SH-Eintrag in die Übersichtstabelle eintragen.

5. **Ausgabe**:
   Pfad der neuen Datei, ID, und Hinweis auf offene Felder melden.

## Konventionen

- Dateiname: `SH-NN-vorname-oder-kurzrolle.md`
- Keine echten Namen realer Personen ohne Zustimmung — stattdessen Personas
- Konzept-Bezüge: §7 und §8 aus Template sind Pflichtbezüge
