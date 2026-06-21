# Migrations- und Namens-Notizen

Dieses Dokument fasst die Namens-Entscheidung und mögliche zukünftige Anpassungen zusammen. **Nach Etablierung kann diese Datei gelöscht werden.**

## Projektname: OEA

**Offizielle Bezeichnung**: OEA – Open Enterprise Architecture

**Begründung**:
- Klar deskriptiv: jeder versteht sofort, was es ist
- Niedriges Trademark-Risiko (keine bekannten Konflikte)
- Kein Verwechslungsrisiko mit OpenAI oder anderen geschützten Marken
- "Open" als Präfix folgt etablierter OSS-Konvention (OpenSSH, OpenStack, OpenStreetMap)
- "EA" ist im Fach-Diskurs etablierter Begriff für Enterprise Architecture

## Verwendung im Repo

- **Eigenname**: OEA (Großbuchstaben, ohne Artikel im Deutschen)
- **Langform**: Open Enterprise Architecture
- **Repo-Slug**: `oea`
- **Domain**: TBD (`oea.dev`, `oea.org` oder `open-enterprise-architecture.org`)
- **Identifier in Configs**: `oea`

## Wichtige Abgrenzungen

Bei Texten und Code-Kommentaren sorgfältig unterscheiden:

- **OEA** = unser Projekt
- **EA** = Enterprise Architecture als Disziplin
- **EA-Tools** (Plural) = Marktbezug auf existierende kommerzielle Tools (Sparx EA, Avolution, LeanIX, Ardoq etc.)
- **EA-Disziplin**, **EA-Bereich**, **EA-Modell** = Fachbegriffe, bleiben unverändert

## Vor Go-Live einzurichten

- [ ] Domain reservieren: prüfe Verfügbarkeit von `oea.dev`, `oea.org`, `oea.ch`, `open-enterprise-architecture.org`
- [ ] E-Mail-Adressen einrichten:
  - `security@<domain>` (SECURITY.md)
  - `conduct@<domain>` (CODE_OF_CONDUCT.md)
  - `maintainers@<domain>` (MAINTAINERS.md)
- [ ] Trademark-Recherche für DE, EU, US (auch wenn Konflikte unwahrscheinlich sind)
- [ ] Repository-URL in `.github/ISSUE_TEMPLATE/config.yml` aktualisieren
- [ ] MAINTAINERS.md: Lead-Maintainer-Zeile mit deinem Namen füllen
- [ ] Logo gestalten (für ersten Release nicht zwingend)

## Hinweis zur Schreibweise

Im Deutschen funktioniert "OEA" als Eigenname ohne Artikel:

- ✓ "OEA unterstützt Use Cases"
- ✓ "OEA wird als Open Source entwickelt"
- ✗ "Das OEA macht..." (klingt wie "das BMW")

In Listen oder im technischen Kontext sind kurze Bezüge wie "im OEA-Repository" oder "OEA-Konfiguration" idiomatisch.

## Falls OEA später doch geändert werden muss

Die meisten Erwähnungen sind über `grep -r "OEA"` und `grep -r "Open Enterprise Architecture"` schnell findbar. Auf "EA"-Fachbegriffe (siehe Liste oben) bei Massenersetzungen besonders achten.
