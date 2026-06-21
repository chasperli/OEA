#!/usr/bin/env bash
#
# install-concept.sh
#
# Verteilt die 27 Konzeptpapier-Dateien in die richtige Verzeichnisstruktur.
# Erwartet alle Dateien (mit oder ohne Pfad-Präfix) in einem Quellverzeichnis.
#
# Verwendung:
#   1. Pfade unten konfigurieren
#   2. Skript ausführbar machen: chmod +x install-concept.sh
#   3. Ausführen: ./install-concept.sh
#

set -euo pipefail

# =============================================================================
# KONFIGURATION – diese Pfade vor Ausführung anpassen
# =============================================================================

# Quellverzeichnis: hier liegen alle 27 .md-Dateien
# Sie können entweder flach liegen (z.B. nach Download)
# oder bereits die Unterordner-Struktur enthalten.
SOURCE_DIR="${SOURCE_DIR:-./downloaded}"

# Zielverzeichnis: hier wird die fertige Struktur angelegt
# Typisch: das Verzeichnis deines Git-Repos, Unterordner "concept"
TARGET_DIR="${TARGET_DIR:-./concept}"

# Verhalten bei existierenden Dateien:
#   "fail"      – Skript bricht ab, wenn Zielverzeichnis nicht leer ist (Default)
#   "overwrite" – existierende Dateien werden überschrieben
#   "backup"    – existierende Dateien werden vor Überschreiben als .bak gesichert
ON_CONFLICT="${ON_CONFLICT:-fail}"

# =============================================================================
# AB HIER NICHT MEHR ANPASSEN
# =============================================================================

# Mapping: Dateiname -> Zielordner (relativ zu TARGET_DIR)
# Wurzel-Dateien haben Zielordner "" (= direkt in TARGET_DIR)
declare -A FILE_MAP=(
    # Wurzel
    ["README.md"]=""
    ["INDEX.md"]=""
    ["CHANGELOG.md"]=""

    # 00-overview
    ["01-einordnung.md"]="00-overview"
    ["02-meta-metamodell.md"]="00-overview"

    # 10-foundations
    ["03-framework-verhaeltnis.md"]="10-foundations"
    ["04-enterprise-continuum-trm.md"]="10-foundations"
    ["05-prinzipien-standards-adrs.md"]="10-foundations"

    # 20-entities
    ["06-kern-entitaetstypen.md"]="20-entities"
    ["07-motivation-stakeholder-ziele.md"]="20-entities"
    ["08-organisation-rollen-personen.md"]="20-entities"
    ["09-prozess-architektur.md"]="20-entities"
    ["10-cross-cutting.md"]="20-entities"

    # 30-dynamics
    ["11-temporales-modell.md"]="30-dynamics"
    ["12-domain-sichten.md"]="30-dynamics"
    ["13-fach-technik-verlinkung.md"]="30-dynamics"

    # 40-extensibility
    ["14-erweiterbarkeit.md"]="40-extensibility"
    ["15-schema-evolution.md"]="40-extensibility"

    # 50-walkthrough
    ["16-beispiel-walkthrough.md"]="50-walkthrough"

    # 60-integrations
    ["17-itsm-integration.md"]="60-integrations"
    ["18-ppm-integration.md"]="60-integrations"
    ["19-agile-skalierung.md"]="60-integrations"
    ["20-grc-dsgvo-isms-integration.md"]="60-integrations"

    # 70-platform
    ["21-api-architektur.md"]="70-platform"
    ["22-auswertbarkeit.md"]="70-platform"

    # 90-backlog
    ["23-offene-punkte.md"]="90-backlog"
    ["24-naechste-schritte.md"]="90-backlog"
)

# Liste aller Unterverzeichnisse (für mkdir)
SUBDIRS=(
    "00-overview"
    "10-foundations"
    "20-entities"
    "30-dynamics"
    "40-extensibility"
    "50-walkthrough"
    "60-integrations"
    "70-platform"
    "90-backlog"
)

# =============================================================================
# Hilfsfunktionen
# =============================================================================

log_info()  { printf '\033[0;32m[INFO]\033[0m  %s\n' "$*"; }
log_warn()  { printf '\033[0;33m[WARN]\033[0m  %s\n' "$*" >&2; }
log_error() { printf '\033[0;31m[ERROR]\033[0m %s\n' "$*" >&2; }

# Sucht eine Datei im Quellverzeichnis – egal ob flach oder in Unterordnern.
# Gibt den ersten Treffer aus oder leeren String, wenn nicht gefunden.
find_source_file() {
    local filename="$1"
    find "$SOURCE_DIR" -type f -name "$filename" -print -quit 2>/dev/null
}

# =============================================================================
# Vorabprüfungen
# =============================================================================

log_info "Konfiguration:"
log_info "  SOURCE_DIR  = $SOURCE_DIR"
log_info "  TARGET_DIR  = $TARGET_DIR"
log_info "  ON_CONFLICT = $ON_CONFLICT"
echo

if [[ ! -d "$SOURCE_DIR" ]]; then
    log_error "Quellverzeichnis nicht gefunden: $SOURCE_DIR"
    log_error "Bitte SOURCE_DIR konfigurieren oder Verzeichnis anlegen."
    exit 1
fi

if [[ "$ON_CONFLICT" != "fail" && "$ON_CONFLICT" != "overwrite" && "$ON_CONFLICT" != "backup" ]]; then
    log_error "ON_CONFLICT muss 'fail', 'overwrite' oder 'backup' sein, ist aber: $ON_CONFLICT"
    exit 1
fi

# Konflikt-Prüfung wenn TARGET_DIR existiert und nicht leer ist
if [[ -d "$TARGET_DIR" ]] && [[ -n "$(ls -A "$TARGET_DIR" 2>/dev/null || true)" ]]; then
    case "$ON_CONFLICT" in
        fail)
            log_error "Zielverzeichnis ist nicht leer: $TARGET_DIR"
            log_error "Setze ON_CONFLICT=overwrite oder ON_CONFLICT=backup, um trotzdem fortzufahren."
            exit 1
            ;;
        overwrite)
            log_warn "Zielverzeichnis ist nicht leer – existierende Dateien werden überschrieben."
            ;;
        backup)
            log_warn "Zielverzeichnis ist nicht leer – existierende Dateien werden als .bak gesichert."
            ;;
    esac
fi

# =============================================================================
# Vollständigkeits-Check der Quelldateien
# =============================================================================

log_info "Prüfe Vollständigkeit der Quelldateien..."

missing_files=()
for filename in "${!FILE_MAP[@]}"; do
    src=$(find_source_file "$filename")
    if [[ -z "$src" ]]; then
        missing_files+=("$filename")
    fi
done

if [[ ${#missing_files[@]} -gt 0 ]]; then
    log_error "Folgende Dateien fehlen im Quellverzeichnis:"
    for f in "${missing_files[@]}"; do
        log_error "  - $f"
    done
    log_error "Skript wird abgebrochen. Bitte alle Dateien bereitstellen."
    exit 1
fi

log_info "Alle ${#FILE_MAP[@]} Dateien gefunden."
echo

# =============================================================================
# Verzeichnisse anlegen
# =============================================================================

log_info "Lege Verzeichnisstruktur an..."
mkdir -p "$TARGET_DIR"
for subdir in "${SUBDIRS[@]}"; do
    mkdir -p "$TARGET_DIR/$subdir"
done

# =============================================================================
# Dateien kopieren
# =============================================================================

log_info "Kopiere Dateien..."
echo

copied=0
backed_up=0
overwritten=0

for filename in "${!FILE_MAP[@]}"; do
    src=$(find_source_file "$filename")
    target_subdir="${FILE_MAP[$filename]}"

    if [[ -z "$target_subdir" ]]; then
        target="$TARGET_DIR/$filename"
        display_target="$filename"
    else
        target="$TARGET_DIR/$target_subdir/$filename"
        display_target="$target_subdir/$filename"
    fi

    # Konflikt-Behandlung pro Datei
    if [[ -e "$target" ]]; then
        case "$ON_CONFLICT" in
            backup)
                cp -p "$target" "$target.bak"
                backed_up=$((backed_up + 1))
                ;;
            overwrite)
                overwritten=$((overwritten + 1))
                ;;
            fail)
                # Sollte nie erreicht werden wegen Vorab-Prüfung, aber sicherheitshalber
                log_error "Datei existiert bereits: $target"
                exit 1
                ;;
        esac
    fi

    cp -p "$src" "$target"
    copied=$((copied + 1))
    printf "  %-44s -> %s\n" "$filename" "$display_target"
done

# =============================================================================
# Zusammenfassung
# =============================================================================

echo
log_info "Fertig."
log_info "  Kopiert:        $copied Dateien"
[[ $backed_up   -gt 0 ]] && log_info "  Gesichert:      $backed_up Dateien (.bak)"
[[ $overwritten -gt 0 ]] && log_info "  Überschrieben:  $overwritten Dateien"
log_info "  Zielverzeichnis: $TARGET_DIR"

# =============================================================================
# Empfehlung für nächste Schritte
# =============================================================================

cat <<EOF

Nächste Schritte:
  - Strukturen prüfen:    ls -la "$TARGET_DIR"
  - Git initialisieren:   cd "$TARGET_DIR" && git init && git add . && git commit -m "Initial concept import"
  - Links validieren:     siehe validate_links.py (separat verfügbar)
EOF
