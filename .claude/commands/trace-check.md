# /trace-check – Verknüpfungs-Konsistenz aller Artefakte prüfen

Prüft die Konsistenz aller Requirements-Engineering-Artefakte im OEA-Repository.

## Was wird geprüft

1. **Zählung**: SH / UC / REQ / US / ADR
2. **UC-Vollständigkeit**: jeder UC hat `primary_actor`, Akzeptanzkriterien, Konzept-Bezug
3. **REQ-Vollständigkeit**: jeder REQ hat `type`, `status`, UC-Referenz
4. **US-Vollständigkeit**: jede US hat UC-Referenz und REQ-Referenz
5. **ADR-Vollständigkeit**: jeder ADR hat `Entscheider`
6. **Verwaiste Referenzen**: US→REQ und US→UC auf Existenz prüfen
7. **Stale-Referenzen**: "Inhaber des Repositorys" und "Lukas (Repository-Inhaber)"
8. **Link-Validierung**: `python3 scripts/validate_links.py`

## Ausführung

Führe die folgenden Bash-Kommandos aus und berichte das Ergebnis als Tabelle:

```bash
cd /run/host/home/lukas/Projects/oea

# Zählung
echo "SH: $(ls business-analysis/stakeholders/SH-*.md | wc -l)"
echo "UC: $(ls requirements/use-cases/UC-*.md | wc -l)"
echo "REQ: $(ls requirements/req/REQ-*.md | wc -l)"
echo "US: $(ls requirements/user-stories/US-*.md | wc -l)"
echo "ADR: $(ls adrs/ADR-*.md | wc -l)"

# UC-Vollständigkeit
for f in requirements/use-cases/UC-*.md; do
  grep -q "^primary_actor:" "$f" || echo "FEHLT primary_actor: $f"
  grep -q "Akzeptanzkriteri" "$f" || echo "FEHLT AK: $f"
  grep -q "concept\|konzept\|§\|Konzept" "$f" || echo "FEHLT Konzept-Bezug: $f"
done

# REQ-Vollständigkeit
for f in requirements/req/REQ-*.md; do
  grep -q "^type:" "$f" || echo "FEHLT type: $f"
  grep -q "^status:" "$f" || echo "FEHLT status: $f"
  grep -q "UC-" "$f" || echo "FEHLT UC-Ref: $f"
done

# US-Vollständigkeit + verwaiste Refs
for f in requirements/user-stories/US-*.md; do
  grep -q "UC-" "$f" || echo "FEHLT UC-Ref: $f"
  grep -q "REQ-" "$f" || echo "FEHLT REQ-Ref: $f"
  for req in $(grep -o "REQ-[0-9]*" "$f"); do
    num=${req#REQ-}
    ls requirements/req/REQ-${num}-*.md >/dev/null 2>&1 || echo "BROKEN REQ-Ref: $f → $req"
  done
  for uc in $(grep -o "UC-[0-9]*" "$f"); do
    num=${uc#UC-}
    ls requirements/use-cases/UC-${num}-*.md >/dev/null 2>&1 || echo "BROKEN UC-Ref: $f → $uc"
  done
done

# ADR-Vollständigkeit
for f in adrs/ADR-*.md; do
  grep -q "Entscheider" "$f" || echo "FEHLT Entscheider: $f"
done

# Stale-Referenzen
grep -rn "Inhaber des Repositorys\|Lukas (Repository-Inhaber)" adrs/ requirements/ business-analysis/ || echo "Keine stale Referenzen"

# Link-Validierung
python3 scripts/validate_links.py
```

## Ausgabe-Format

Tabelle mit Anzahl und ✅ / ⚠️ / ❌ pro Kategorie. Warnungen einzeln aufführen.
