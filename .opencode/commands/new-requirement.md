# /new-requirement – Neue atomare Anforderung anlegen

Legt eine atomare Anforderung in `requirements/req/` an. Unterstützt alle 7 Typen.

## Argumente

`$ARGUMENTS` enthält optional: `<UC-NN> <type> <Kurztitel>`
Beispiel: `/new-requirement UC-05 functional Entität im Diagramm platzieren`

## Erlaubte Typen

`functional` | `non-functional` | `constraint` | `business-rule` | `data` | `interface` | `compliance`

## Ausführung

1. **Nächste freie ID ermitteln**:
   ```bash
   ls requirements/req/REQ-*.md | sed 's/.*REQ-//' | sed 's/-.*//' | sort -n | tail -1
   ```
   Nächste ID = höchste Nummer + 1, dreistellig (z.B. `REQ-135`).

2. **UC-Referenz prüfen**:
   - UC-NN aus `$ARGUMENTS` oder erfragen
   - Verifizieren: `ls requirements/use-cases/UC-NN-*.md`
   - Falls UC nicht existiert: STOP

3. **Typ bestimmen**:
   - `type` aus `$ARGUMENTS` oder erfragen
   - Bei `non-functional`: messbare Zielwerte sind Pflicht (keine "soll schnell sein"-Aussagen)
   - Bei `compliance`: Regelwerk und konkreter Artikel sind Pflicht

4. **Datei anlegen**:
   Kopiere `templates/requirement.template.md` nach `requirements/req/REQ-NNN-kurzname.md`
   - Frontmatter: `id`, `title`, `type`, `priority`, `status: proposed`, `created` (heute)
   - `references.use_cases` mit UC-NN befüllen
   - Nur den zum Typ passenden Block unter "Typ-spezifische Felder" behalten, Rest entfernen
   - Mindestens ein Akzeptanzkriterium (AC1) formulieren

5. **Pflicht-Checks**:
   - Aussage enthält RFC-2119-Schlüsselwort (MUSS / SOLL / DARF NICHT / KANN)?
   - Verifikationsmethode angegeben?
   - Bei `non-functional`: Scope-Angabe vorhanden?

6. **Ausgabe**:
   Pfad, ID, Typ, UC-Bezug, und Hinweis auf noch offene Pflichtfelder.

## Konventionen

- Dateiname: `REQ-NNN-kurzname.md` (dreistellig; Kurzname englisch, kebab-case)
- Eine Anforderung = eine Aussage. Mehrere Aussagen → mehrere REQs
- Keine Technologie-Vorgaben in der Aussage (Solution Design ≠ Requirement)
