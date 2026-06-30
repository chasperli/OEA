#!/usr/bin/env python3
"""
Erzeugt Gherkin Feature Files aus OEA-Requirement-Dateien.
V-Modell: Systemtestspezifikation wird parallel zur Requirements-Phase erstellt.

Usage: python3 scripts/generate_feature_files.py
"""

import os
import re
from pathlib import Path

REQ_DIR = Path("requirements/req")
OUT_DIR = Path("requirements/tests")

# Bootstrap-REQs brauchen keinen Login als Vorbedingung
BOOTSTRAP_REQS = {
    "REQ-013", "REQ-014", "REQ-015", "REQ-016",
    "REQ-017", "REQ-018", "REQ-019",
}
# Login-REQs beschreiben den Login selbst
LOGIN_REQS = {
    "REQ-001", "REQ-002", "REQ-003", "REQ-004", "REQ-005",
    "REQ-006", "REQ-007", "REQ-008", "REQ-009", "REQ-010",
    "REQ-011", "REQ-012",
}

TYPE_TAGS = {
    "functional":     "@functional",
    "non-functional": "@non-functional @performance",
    "compliance":     "@compliance",
    "business-rule":  "@business-rule",
    "constraint":     "@constraint",
    "interface":      "@interface",
    "data":           "@data",
}


# ---------------------------------------------------------------------------
# Frontmatter-Parser (ohne externe YAML-Bibliothek)
# ---------------------------------------------------------------------------

def parse_frontmatter(content: str) -> tuple:
    """Liest YAML-Frontmatter und gibt (meta_dict, body) zurück."""
    meta = {}
    if not content.startswith("---"):
        return meta, content
    parts = content.split("---", 2)
    if len(parts) < 3:
        return meta, content
    fm = parts[1]
    body = parts[2]

    # Einfacher Zeilenparser (reicht für die REQ-Felder)
    for line in fm.splitlines():
        line = line.rstrip()
        if not line or line.startswith("#"):
            continue
        if ":" in line and not line.startswith(" ") and not line.startswith("-"):
            k, _, v = line.partition(":")
            v = v.strip().strip('"').strip("'")
            meta[k.strip()] = v if v else None
        # use_cases / UC-Referenzen als Liste
        if line.strip().startswith("- UC-"):
            uc = line.strip().lstrip("- ").strip()
            meta.setdefault("_uc_refs", []).append(uc)
        if line.strip().startswith("- ADR-"):
            adr = line.strip().lstrip("- ").strip()
            meta.setdefault("_adr_refs", []).append(adr)

    return meta, body


# ---------------------------------------------------------------------------
# Markdown-Abschnitt extrahieren
# ---------------------------------------------------------------------------

def extract_section(body: str, heading: str) -> str:
    pattern = rf"##\s+{re.escape(heading)}\s*\n(.*?)(?=\n##\s|\Z)"
    m = re.search(pattern, body, re.DOTALL)
    return m.group(1).strip() if m else ""


# ---------------------------------------------------------------------------
# Akzeptanzkriterien parsen
# ---------------------------------------------------------------------------

def parse_acs(ac_text: str) -> list:
    """Zerlegt den AC-Block in strukturierte Szenarien."""
    acs = []
    blocks = re.split(r'\n(?=\*\*AC\d+)', ac_text)
    for block in blocks:
        block = block.strip()
        if not block:
            continue
        header = re.match(r'\*\*AC(\d+)\*\*\s*(?:\(([^)]*)\))?[:\s]*\n?(.*)',
                          block, re.DOTALL)
        if not header:
            continue
        num    = header.group(1)
        label  = (header.group(2) or "").strip()
        body   = header.group(3)

        given, when, then, other = [], [], [], []
        for raw_line in body.splitlines():
            line = raw_line.strip()
            if re.match(r'^- Gegeben[: ]', line):
                given.append(re.sub(r'^- Gegeben[: ]+', '', line).strip())
            elif re.match(r'^- Wenn[: ]', line):
                when.append(re.sub(r'^- Wenn[: ]+', '', line).strip())
            elif re.match(r'^- Dann[: ]', line):
                then.append(re.sub(r'^- Dann[: ]+', '', line).strip())
            elif line and not line.startswith("#"):
                other.append(line)

        acs.append({
            "num": num, "label": label,
            "given": given, "when": when, "then": then,
            "has_structure": bool(given or when or then),
            "raw": body.strip(),
        })
    return acs


# ---------------------------------------------------------------------------
# Feature-File bauen
# ---------------------------------------------------------------------------

def scenario_name(ac: dict) -> str:
    """Kurzer, beschreibender Szenario-Name aus den AC-Inhalten."""
    candidates = ac["given"] + ac["when"]
    if candidates:
        name = candidates[0]
    elif ac["raw"]:
        name = ac["raw"].splitlines()[0].lstrip("- ").strip()
    else:
        name = f"AC{ac['num']}"
    return (name[:72] + "...") if len(name) > 75 else name


def wrap(text: str, indent: str = "  ", width: int = 72) -> list:
    """Bricht langen Text auf mehrere eingerückte Zeilen."""
    words = text.split()
    lines, cur = [], indent
    for w in words:
        if len(cur) + len(w) + 1 > width:
            lines.append(cur.rstrip())
            cur = indent + w + " "
        else:
            cur += w + " "
    if cur.strip():
        lines.append(cur.rstrip())
    return lines


def build_background(req_id: str, req_type: str, uc_refs: list) -> list:
    lines = []
    if req_type != "functional":
        return lines   # NFR / compliance haben eigenen Kontext
    lines.append("  Background:")
    if req_id in BOOTSTRAP_REQS:
        lines.append("    Given eine frisch installierte OEA-Instanz ohne System-Admin-Account")
    elif req_id in LOGIN_REQS:
        lines.append("    Given eine OEA-Instanz mit konfiguriertem Authentifizierungsmechanismus")
        lines.append("    And eine Person mit E-Mail \"test@example.com\" und aktiver Rolle existiert")
    else:
        lines.append("    Given eine laufende OEA-Instanz")
        lines.append("    And ein Nutzer mit der erforderlichen Rolle ist angemeldet")
    lines.append("")
    return lines


def build_feature(meta: dict, body: str) -> str:
    req_id   = meta.get("id", "REQ-???")
    title    = meta.get("title", "Unbekannt")
    req_type = meta.get("type", "functional")
    priority = meta.get("priority", "must")
    status   = meta.get("status", "proposed")
    uc_refs  = meta.get("_uc_refs", [])

    aussage   = extract_section(body, "Aussage")
    ac_text   = extract_section(body, "Akzeptanzkriterien")
    verif     = extract_section(body, "Verifikationsmethode")
    acs       = parse_acs(ac_text)

    # Tags
    type_tag = TYPE_TAGS.get(req_type, "@functional")
    tags = [type_tag, f"@{priority}"]
    if status == "rejected":
        tags.append("@skip")
    if uc_refs:
        tags += [f"@{uc}" for uc in uc_refs]

    # Verifikationshinweis
    verif_hint = ""
    for vl in verif.splitlines():
        vl = vl.strip().lstrip("- [x] ").lstrip("- [ ] ").strip()
        if vl.startswith("Methode:"):
            verif_hint = vl
            break

    out = []
    out.append(f"# Ableitung aus: requirements/req/{req_id.lower().replace('-', '-', 1)}-*.md")
    out.append("# V-Modell Systemtestspezifikation – erstellt 2026-06-30")
    if verif_hint:
        out.append(f"# Verifikation: {verif_hint}")
    out.append("")
    out.append(" ".join(tags))
    out.append(f"Feature: {req_id} – {title}")
    out.append("")

    # Kurzbeschreibung (erste 2 Sätze der Aussage)
    if aussage:
        sentences = re.split(r'(?<=[.!?])\s+', aussage)
        short = " ".join(sentences[:2])
        out += wrap(short, "  ")
        out.append("")

    # Background
    out += build_background(req_id, req_type, uc_refs)

    # Szenarien
    if acs:
        for ac in acs:
            lbl = f" – {ac['label']}" if ac['label'] else ""
            out.append(f"  @AC{ac['num']}")
            out.append(f"  Scenario: AC{ac['num']}{lbl} – {scenario_name(ac)}")

            if ac["has_structure"]:
                first = True
                for g in ac["given"]:
                    out.append(f"    {'Given' if first else 'And  '} {g}")
                    first = False
                if not ac["given"]:
                    out.append("    Given die Vorbedingung gemäß Anforderung ist erfüllt")

                first = True
                for w in ac["when"]:
                    out.append(f"    {'When ' if first else 'And  '} {w}")
                    first = False
                if not ac["when"]:
                    out.append("    When die beschriebene Aktion ausgeführt wird")

                first = True
                for t in ac["then"]:
                    out.append(f"    {'Then ' if first else 'And  '} {t}")
                    first = False
                if not ac["then"]:
                    out.append("    Then ist das erwartete Ergebnis eingetreten")
            else:
                # Kein strukturiertes Given/When/Then – Rohtext als Kommentar
                out.append("    # TODO: AC ohne Standard-Struktur – manuell verfeinern")
                for raw_line in ac["raw"].splitlines()[:6]:
                    if raw_line.strip():
                        out.append(f"    # {raw_line.strip()}")
                out.append("    Given die Vorbedingung gemäß Anforderung ist erfüllt")
                out.append("    When die beschriebene Aktion ausgeführt wird")
                out.append("    Then verhält sich das System gemäß der Aussage")

            out.append("")
    else:
        out.append("  # TODO: Keine Akzeptanzkriterien gefunden – manuell ergänzen")
        out.append("  Scenario: Anforderung ist erfüllt")
        out.append("    Given die Vorbedingungen gemäß Anforderungsdokument sind erfüllt")
        out.append("    When die beschriebene Aktion ausgeführt wird")
        out.append("    Then verhält sich das System gemäß der Aussage")
        out.append("")

    return "\n".join(out)


# ---------------------------------------------------------------------------
# Haupt-Routine
# ---------------------------------------------------------------------------

def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    req_files = sorted(REQ_DIR.glob("REQ-*.md"))
    print(f"Verarbeite {len(req_files)} Anforderungs-Dateien ...\n")

    ok = skip = warn = 0
    for req_file in req_files:
        content = req_file.read_text(encoding="utf-8")
        meta, body = parse_frontmatter(content)

        if not meta.get("id"):
            print(f"  SKIP (kein id):  {req_file.name}")
            skip += 1
            continue

        try:
            feature = build_feature(meta, body)
            out_path = OUT_DIR / req_file.name.replace(".md", ".feature")
            out_path.write_text(feature, encoding="utf-8")

            acs = parse_acs(extract_section(body, "Akzeptanzkriterien"))
            structured = sum(1 for a in acs if a["has_structure"])
            flag = "⚠" if structured < len(acs) else "✓"
            print(f"  {flag} {out_path.name}  ({len(acs)} ACs, {structured} strukturiert)")
            if structured < len(acs):
                warn += 1
            ok += 1
        except Exception as e:
            print(f"  ✗ FEHLER {req_file.name}: {e}")
            skip += 1

    print(f"\n{'='*60}")
    print(f"  Erstellt:  {ok} Feature Files")
    print(f"  Warnungen: {warn} (ACs ohne Standard-Struktur, TODO-Markierung)")
    print(f"  Übersprungen: {skip}")
    print(f"  Ausgabe:   {OUT_DIR}/")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
