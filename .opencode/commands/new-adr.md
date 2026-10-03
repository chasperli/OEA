# /new-adr – Neuen ADR anlegen

Legt einen neuen Architectural Decision Record in `adrs/` an. Nächste freie Nummer wird automatisch ermittelt.

## Argumente

`$ARGUMENTS` enthält den Kurztitel des ADRs (optional).
Beispiel: `/new-adr Logging-Strategie`

## Ausführung

1. **Nächste freie Nummer ermitteln**:
   ```bash
   ls adrs/ADR-*.md | sed 's/.*ADR-//' | sed 's/-.*//' | sort -n | tail -1
   ```
   Nächste Nummer = höchste Nummer + 1, dreistellig mit führenden Nullen (z.B. `ADR-019`).
   ADR-Nummern werden **niemals wiederverwendet** — auch nicht bei `rejected`.

2. **Dateinamen ableiten**:
   `adrs/ADR-NNN-kurzname.md`
   - Kurzname aus `$ARGUMENTS`: englisch, kebab-case, 2-4 Wörter
   - Beispiel: "Logging-Strategie" → `ADR-019-logging-strategie.md`

3. **Datei anlegen** mit folgendem Grundgerüst:

   ```markdown
   # ADR-NNN: {{Titel}}

   **Status**: draft
   **Datum**: {{YYYY-MM-DD}}
   **Entscheider**: [Rigobert – Produkt Owner](../business-analysis/stakeholders/SH-09-rigobert-produkt-owner.md) (SH-09)
   **Konsultiert**: {{ggf. Requirements Engineer, Business Engineer, …}}
   **Informiert**: –

   ## Kontext und Problem

   {{Was ist das konkrete Problem, das diese Entscheidung löst? Welche Situation erzwingt die Entscheidung jetzt?}}

   ## Entscheidungstreiber

   - {{Treiber 1}}
   - {{Treiber 2}}

   ## Betrachtete Optionen

   ### Option 1: {{Name}}

   - **Pro**: …
   - **Contra**: …

   ### Option 2: {{Name}}

   - **Pro**: …
   - **Contra**: …

   ## Entscheidung

   Wir wählen **Option N: {{Name}}**.

   **Begründung**: …

   ## Konsequenzen

   ### Positive Konsequenzen

   - …

   ### Negative Konsequenzen / Trade-offs

   - …

   ## Bezüge

   **Verwandte ADRs**: …
   **Konzept**: …
   ```

4. **Pflicht-Checks**:
   - Mindestens 2 Optionen mit je Pro/Contra?
   - Entscheidungstreiber explizit (kein "weil Standard")?
   - Konsequenzen (beide Richtungen) vorhanden?
   - Konzept-Bezug gesetzt?
   - `Entscheider` auf Rigobert (SH-09) gesetzt?

5. **Anti-Pattern vermeiden**:
   - Kein ADR auf Vorrat — nur bei konkretem Entscheidungsbedarf
   - Kein ADR ohne dokumentierte Alternativen
   - Kein ADR ohne Konsequenzen

6. **Ausgabe**:
   Pfad, Nummer, Titel, Status `draft`.

## Konventionen

- `draft` → `proposed` → `accepted | rejected`; später ggf. `superseded by ADR-NNN`
- Nummern niemals wiederverwenden
- Filename: Deutsch oder Englisch — konsistent mit bestehendem Stil (bisher deutsch)
