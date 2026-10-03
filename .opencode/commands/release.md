# /release – Konzept-Version hochziehen und CHANGELOG aktualisieren

Erstellt einen Release-Eintrag im CHANGELOG und aktualisiert den Status im Konzept-README.

## Argumente

`$ARGUMENTS` enthält optional: `<bump-type> "<Beschreibung>"`
- `bump-type`: `minor` (neues Kapitel/Abschnitt) | `patch` (Korrekturen)
- Beispiel: `/release minor "Neues Kapitel §24 Monitoring-Strategie"`
- Ohne Argumente: interaktiv erfragen

## Ausführung

1. **Aktuelle Version lesen**:
   ```bash
   grep -m1 "Status:" concept/README.md
   ```
   Format: `**Status:** Entwurf vX.Y`

2. **Neue Version berechnen**:
   - `minor`: Y bleibt, X+1 → v(X+1).0 — NEIN: Korrektur:
     - `minor`: X.Y → X.(Y+1) (neuer Abschnitt/Kapitel)
     - `patch`: X.Y → X.Y+1 als Patch: X.Y.Z → X.Y.(Z+1)
   - Aktuelles Schema prüfen: `vX.Y` (zweistellig) oder `vX.Y.Z` (dreistellig)

3. **CHANGELOG aktualisieren** (`concept/CHANGELOG.md`):
   Format: Keep a Changelog
   ```markdown
   ## [vX.Y] – YYYY-MM-DD

   ### Added / Changed / Fixed / Removed
   - {{Beschreibung der Änderungen}}
   ```
   - Neuen Eintrag **oben** unter `## [Unreleased]` einfügen (oder `[Unreleased]`-Block ersetzen)
   - Datum: heute

4. **Status in `concept/README.md` aktualisieren**:
   ```
   **Status:** Entwurf vX.Y  →  **Status:** Entwurf vX.(Y+1)
   ```

5. **INDEX.md prüfen** (`concept/INDEX.md`):
   - Hat sich die Kapitelstruktur geändert? Falls ja: INDEX anpassen.

6. **Link-Validierung laufen lassen**:
   ```bash
   python3 scripts/validate_links.py
   ```
   Muss grün sein vor dem Commit.

7. **Git-Commit erstellen**:
   ```
   chore(concept): Release vX.Y – <Kurzbeschreibung>
   ```

8. **Ausgabe**:
   Alte Version, neue Version, CHANGELOG-Eintrag-Vorschau.

## Konventionen

- Minor-Bump: neue Abschnitte, neue Kapitel, inhaltliche Erweiterungen
- Patch-Bump: Korrekturen, Klarstellungen, Tippfehler
- Kein Release ohne CHANGELOG-Eintrag
- Kein Release ohne grüne Link-Validierung
