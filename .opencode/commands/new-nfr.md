# /new-nfr – Neue NFR anlegen (Legacy)

> **Hinweis**: Dieser Command ist Legacy. Neue nicht-funktionale Anforderungen bevorzugt mit
> `/new-requirement` anlegen und `type: non-functional` setzen — dann landet die Anforderung
> in `requirements/req/` mit einheitlichem Tracking. `/new-nfr` schreibt nach `requirements/nfr/`
> und ist für ältere NFRs im Legacy-Format.

## Argumente

`$ARGUMENTS` enthält den Titel der NFR (optional).

## Ausführung

1. **Nächste freie ID ermitteln**:
   ```bash
   ls requirements/nfr/NFR-*.md 2>/dev/null | sed 's/.*NFR-//' | sed 's/-.*//' | sort -n | tail -1
   ```
   Nächste ID = höchste Nummer + 1, zweistellig (z.B. `NFR-06`).

2. **Kategorie klären**:
   `performance` | `scalability` | `reliability` | `availability` | `security` |
   `maintainability` | `usability` | `portability` | `compatibility` | `cost` | `sustainability`

3. **Datei anlegen**:
   Kopiere `templates/nfr.template.md` nach `requirements/nfr/NFR-NN-kurzname.md`
   - `ID`, `Kategorie`, `Priority`, `Status: proposed` setzen
   - Anforderung in einem Satz formulieren

4. **Pflicht-Checks** (ohne diese wird die NFR nicht akzeptiert):
   - [ ] **Messbarer Zielwert** mit Einheit und Schwellwert in der Tabelle?
   - [ ] **Scope** angegeben (bei welcher Datenmenge / welchem Lastprofil gilt der Wert)?
   - [ ] **Verifikationsmethode** konkret (Werkzeug, Test-Setup, Bestanden-Kriterium)?
   - Keine "soll performant sein"-Aussagen — immer konkrete Zahlen

5. **Stakeholder-Bezug**: mindestens ein SH, der diese NFR gefordert hat oder betroffen ist.

6. **Ausgabe**:
   Pfad, ID, Kategorie, Zielwert-Zusammenfassung.

## Konventionen

- Dateiname: `NFR-NN-kurzname.md` (zweistellig; Kurzname englisch, kebab-case)
- NFR ohne messbare Zielwerte ist ein Wunsch, keine Anforderung
- Für neue Projekte: `/new-requirement type=non-functional` bevorzugen
