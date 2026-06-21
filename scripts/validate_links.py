#!/usr/bin/env python3
"""Validate all relative markdown links in concept/.

Wird typischerweise aus dem Repo-Root ausgeführt:
  python3 scripts/validate_links.py

Exit code 0 = alle Links OK
Exit code 1 = mindestens ein Link kaputt
"""
import re
import sys
from pathlib import Path

# concept/-Verzeichnis relativ zum Repo-Root (Skript liegt in scripts/)
REPO_ROOT = Path(__file__).resolve().parent.parent
CONCEPT_DIR = REPO_ROOT / "concept"

if not CONCEPT_DIR.is_dir():
    print(f"FEHLER: {CONCEPT_DIR} nicht gefunden – aus Repo-Root ausführen.")
    sys.exit(2)

LINK_RE = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")

broken = []
total = 0

for md_file in sorted(CONCEPT_DIR.rglob("*.md")):
    text = md_file.read_text(encoding="utf-8")
    for m in LINK_RE.finditer(text):
        target = m.group(2)
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        if "#" in target:
            target = target.split("#")[0]
        if not target:
            continue
        total += 1
        resolved = (md_file.parent / target).resolve()
        if not resolved.exists():
            broken.append((md_file.relative_to(CONCEPT_DIR), target))

print(f"Geprüft: {total} relative Links in {CONCEPT_DIR.relative_to(REPO_ROOT)}/")

if broken:
    print(f"\nKaputte Links ({len(broken)}):")
    for f, t in broken:
        print(f"  {f}: {t}")
    sys.exit(1)
else:
    print("✓ Alle Links gültig")
    sys.exit(0)
