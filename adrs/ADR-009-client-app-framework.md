# ADR-009: Client-App-Framework – Electron vs. Tauri

**Status**: accepted
**Datum**: 2026-06-26
**Entscheider**: Inhaber des Repositorys
**Konsultiert**: Requirements Engineer (US-045), Frontend-Engineer
**Informiert**: –

## Kontext und Problem

[ADR-008](./ADR-008-gui-architektur-dual-track.md) hat entschieden, dass OEA eine **Client App** für den vollständigen Modellierungs-Umfang bereitstellt. Die Client App bettet die React/TypeScript-Oberfläche (inkl. React Flow Canvas, ADR-007) in eine native Desktop-Anwendung ein, die Zugriff auf Dateisystem, Offline-Betrieb und volle Plattform-Integration bietet.

Offen ist die Wahl des **Embedding-Frameworks**: Was stellt die native Hülle, den Prozessmanager, die IPC-Brücke und den Packaging-/Distributions-Mechanismus bereit?

Die beiden ernsthaften Kandidaten im OSS-Ökosystem 2026 sind **Electron** und **Tauri v2**. Beide packen eine Webview mit nativen Fähigkeiten; sie unterscheiden sich fundamental in der Rendering-Strategie (gebündeltes Chromium vs. System-WebView) und im Backend-Stack (Node.js vs. Rust).

## Entscheidungstreiber

- **Canvas-Rendering-Konsistenz**: React Flow (ADR-007) ist eine DOM-basierte Canvas-Bibliothek – kein WebGL. DOM-Performance und CSS-Rendering-Fidelity sind vom Laufzeit-Browser abhängig. Inkonsistente System-WebViews sind ein Risiko für Diagramm-Editierung und Typeahead-Interaktion (US-045).
- **Dev-Team-Fit**: Das OEA-Frontend ist React/TypeScript. Native Erweiterungen (IPC-Handler, Dateisystem-Zugriff, Auto-Update) sollten ebenfalls in einer dem Team vertrauten Sprache schreibbar sein.
- **OSS-Lizenz-Kompatibilität**: Apache 2.0-Projekt; das Framework muss MIT, Apache 2.0 oder BSD sein.
- **Installations-Grösse**: Relevant für OSS-Adoption; grosse Bundles erhöhen die Hürde für neue Nutzer.
- **Offline-Betrieb und Dateisystem**: Architekten exportieren Modelle als YAML/JSON direkt in lokale Git-Repos; nativer Dateisystem-Zugriff ist Pflicht.
- **Auto-Update**: OSS-Projekt ohne proprietäre Store-Abhängigkeit; der Update-Mechanismus muss selbst gehostet werden können.
- **Cross-Platform**: macOS, Windows, Linux (alle drei gleich wichtig; EA-Teams sind gemischt).
- **Langfristige Projekt-Stabilität**: Bibliothek muss aktiv gepflegt und community-getragen sein.

## Betrachtete Optionen

### Option 1: Electron

Electron (MIT) bettet **Chromium + Node.js** in die App ein. VS Code, Figma (Desktop), Slack, Notion, Postman – viele professionelle Tools basieren auf Electron. Rendering-Engine ist immer Chromium (V8 + Blink); kein System-WebView-Wildwuchs.

- **Pro**:
  - Garantiert konsistentes Rendering auf allen Plattformen: alle Nutzer sehen dieselbe Chromium-Version
  - React Flow und alle CSS-Features laufen auf einem bekannten, getesteten Engine-Stand
  - Node.js im Main-Prozess: Dateisystem, IPC, native Module – alles in JavaScript/TypeScript schreibbar; kein Rust nötig
  - Riesiges Ökosystem: `electron-updater` (Auto-Update), `electron-builder` (Packaging), umfangreiche Plugin-Sammlung
  - Grösste Community; ausgezeichnete Dokumentation; viele OSS-Vorbilder
  - Electron Forge / electron-builder erzeugen signierte `.dmg`, `.exe`, `.AppImage`-Bundles ohne proprietären Store
  - Gut getestete Sicherheitsarchitektur: `contextIsolation + preload` als etabliertes Muster
- **Contra**:
  - **Bundle-Grösse**: ~150–200 MB unkomprimiert (Chromium ist gross); komprimierter Installer typisch 80–120 MB
  - **Speicher-Verbrauch**: jede Electron-Instanz bringt eigenen Chromium-Prozess; auf Rechnern mit 8 GB RAM spürbar
  - Chromium muss mit der App mitgepflegt werden (Sicherheits-Updates → neue Electron-Hauptversionen)
  - Reputation als „schwer" und „ressourcenfressend" (teils berechtigt, teils übertrieben)

### Option 2: Tauri v2

Tauri v2 (MIT/Apache 2.0) nutzt die **System-eigene WebView** des Betriebssystems und ein **Rust-Backend** für native Fähigkeiten. Install-Grösse typisch 5–15 MB.

- **Pro**:
  - Minimale Install-Grösse: kein gebündeltes Chromium; nutzt WKWebView (macOS), WebView2 (Windows), WebKitGTK (Linux)
  - Rust-Backend: sehr schnell, memory-safe, niedrige Ressourcenanforderung
  - Aktive, wachsende Community; Tauri v2 ist stabil (GA seit 2024)
  - Besseres Security-Modell out-of-the-box: explizite API-Allowlist; kein volles Node.js im Render-Prozess
  - Apache 2.0-kompatibel
- **Contra**:
  - **System-WebView-Inkonsistenz**: Das ist das zentrale Risiko für OEA
    - macOS: WKWebView (Safari-Engine) – gut, aber abweichend von Chrome
    - Windows: WebView2 (Chromium-basiert) – nah an Electron
    - Linux: **WebKitGTK** – kann mehrere Versionen hinter dem aktuellen WebKit stehen; DOM-Performance für komplexe Canvas-Layouts nachweislich schwächer als Chromium
  - React Flow ist für Chromium/Firefox optimiert; auf WebKitGTK (Linux) können subtile Rendering-Fehler oder Performance-Probleme auftreten, die nur auf dieser Plattform reproduzierbar sind
  - Native Erweiterungen (IPC, Plugins) werden in **Rust** geschrieben; das OEA-Team hat primär JS/TS-Kompetenz; jeder native Feature-Bedarf erfordert Rust-Know-how oder Community-Plugins
  - Tauri v2-Plugin-Ökosystem wächst, ist aber kleiner als Electrons; manche Features (z.B. spezifische System-APIs) sind als Community-Plugins noch unreif
  - `update`-Plugin (Auto-Update) für Tauri v2 ist verfügbar, aber weniger battle-tested als `electron-updater`

### Option 3: Neutralino.js

Neutralino (MIT) ist eine ultrakompakte Alternative (~2 MB): native Hülle + System-WebView + lightweight C++-Backend.

- **Pro**:
  - Kleinstmögliche Bundle-Grösse
  - Für einfache Desktop-Wrapper-Aufgaben geeignet
- **Contra**:
  - Sehr kleines Ökosystem; begrenzte Community-Unterstützung
  - Trägt dieselben System-WebView-Inkonsistenz-Risiken wie Tauri, ohne Tauris Rust-Backend-Stärke
  - Für eine komplexe Modellierungs-App (Canvas-Editor, Navigationsbaum, Katalog-Konfiguration) fehlen ausgereifte Integrations-Patterns
  - Scheidet als zu unreif für produktionellen Einsatz in OEA aus

### Nicht betrachtete Optionen

- **NW.js**: technisch ähnlich wie Electron (Chromium + Node.js), aber wesentlich kleinere Community und geringere Maintenance-Aktivität. Kein relevanter Vorteil gegenüber Electron.
- **Flutter Desktop / Qt / native Frameworks**: inkompatibel mit dem React/TypeScript-Stack (ADR-007); erfordern separate Codebase; ausgeschlossen.
- **PWA (als Client-App-Ersatz)**: von ADR-008 explizit ausgeschlossen (Option 3 der dortigen Entscheidung).

## Entscheidung

Wir wählen **Option 1: Electron**.

**Begründung**: OEA ist eine canvas-intensive Modellierungs-App. React Flow (ADR-007) nutzt DOM-Rendering intensiv; Typeahead-Interaktionen (US-045), Drag-and-Drop und grosse Diagramme stellen hohe Ansprüche an Browser-Engine-Konsistenz. Das Linux-WebKitGTK-Risiko von Tauri ist für eine EA-Tool-Zielgruppe (häufig Linux-affine Architekten und Entwickler) nicht akzeptabel: plattformspezifische Rendering-Fehler im Canvas-Editor sind aufwändiger zu debuggen als das Mitführen von Chromium.

Dazu kommt der Dev-Team-Fit: alle nativen Erweiterungen (Dateisystem-Watcher, lokaler Git-Export, IPC-Handler) können in TypeScript im Electron Main-Prozess geschrieben werden. Kein Rust-Know-how erforderlich.

Die grösste Schwäche – Bundle-Grösse – ist für eine professionelle Desktop-Anwendung in einem Enterprise-Kontext akzeptabel. OEA-Nutzer sind Architekten, keine gelegentlichen Browser-Nutzer; sie installieren ein Werkzeug und nutzen es täglich.

**Technologie-Entscheidungen innerhalb Electron**:

| Aspekt | Wahl | Begründung |
|---|---|---|
| Electron-Version | aktuelle Stable (v34+) | aktiver Support, neueste Chromium-Basis |
| Packaging | `electron-builder` | reif, signiert `.dmg` / `.exe` / `.AppImage`, unterstützt selbst-gehostete Updates |
| Auto-Update | `electron-updater` (via electron-builder) | kein proprietärer Store nötig; Update-Server selbst hostbar |
| Security | `contextIsolation=true`, `preload`-Script, `nodeIntegration=false` | Electron-Best-Practice seit v12 |
| IPC | `ipcMain` / `ipcRenderer` via `contextBridge` | sicheres Kommunikationsmuster; keine direkte Node-Exposition |

## Konsequenzen

### Positive Konsequenzen

- Konsistentes Rendering auf macOS, Windows und Linux: React Flow, Typeahead, CSS-Animationen verhalten sich überall gleich
- Native Erweiterungen (Dateisystem, lokaler Git-Export, System-Tray) in TypeScript schreibbar; kein neues Sprach-Know-how erforderlich
- `electron-builder` erzeugt alle nötigen Plattform-Bundles aus einer CI-Pipeline
- Auto-Update ohne Store-Abhängigkeit: OEA kann Updates über eigene GitHub-Releases oder selbst gehosteten S3-Bucket ausliefern
- US-045 (Diagramm-Pfad, 8 SP) ist damit vollständig entsperrt: alle Abhängigkeiten (ADR-007, ADR-008, ADR-009) sind entschieden

### Negative Konsequenzen / Trade-offs

- **Bundle-Grösse** ~80–120 MB komprimierter Installer; neuen Nutzern ist dies transparent zu kommunizieren (Erstinstallation dauert länger als eine Web-App)
- **Speicher-Verbrauch**: Electron-App mit React Front-End liegt typisch bei 200–400 MB RAM; auf low-end Hardware spürbar
- **Chromium-Updates**: mit jeder Electron-Hauptversion kommt eine neue Chromium-Version; Upgrade-Zyklus muss im Projekt-Prozess verankert werden (ca. quartalsweise)
- **Tauri als Option für v2.x**: Wenn WebKitGTK auf Linux aufholt und das Tauri-Plugin-Ökosystem reift, kann die Entscheidung für spätere Versionen neu bewertet werden (Architektur-Entscheid, nicht Lock-in)

### Folgeentscheidungen

- **ADR-010** (ausstehend): Shared-Component-Library und Design-System – wie teilen Client App und Web Portal UI-Komponenten?
- **Signing & Notarization**: macOS-Notarisierung (Apple) und Windows-Code-Signing (EV-Zertifikat) sind Distributions-Voraussetzungen; Setup-Anleitung als eigene Dokumentations-Aufgabe
- **CI/CD für Multi-Platform-Builds**: Electron-Builder braucht je ein Build-Environment pro Zielplattform (macOS-Runner für `.dmg`, Windows-Runner für `.exe`); GitHub Actions Matrix oder eigene Runner

## Bezüge

**Konzept-Kapitel**:
- [§21.2.1 Visualisierungs-Strategie](../concept/70-platform/21-api-architektur.md)

**Verwandte ADRs**:
- [ADR-007](./ADR-007-canvas-bibliothek.md): React Flow als Canvas-Bibliothek (accepted) – Rendering-Konsistenz ist Kernargument für Electron
- [ADR-008](./ADR-008-gui-architektur-dual-track.md): Client App + Web Portal (accepted) – dieser ADR konkretisiert die Client-App-Seite

**Use Cases / Requirements**:
- [US-045](../requirements/user-stories/US-045-delta-neue-entitaet-diagramm.md): Neue Entität im Diagramm als Delta anlegen – letzter offener Blocker, wird durch diesen ADR entsperrt

## Notizen

`electron-builder` vs. `Electron Forge`: Beide sind verbreitet. `electron-builder` ist ausgereifter für Multi-Platform-Bundles mit Auto-Update; `Electron Forge` ist offiziell von Electronjs.org empfohlen und einfacher einzurichten, aber weniger flexibel bei Custom-Signing-Pipelines. Entscheidung kann beim Aufsetzen des Build-Systems getroffen werden; kein eigener ADR nötig.

Tauri v3 (in Entwicklung, Stand 2026): Falls Tauri v3 die WebKitGTK-Linux-Situation verbessert und ein stabiles TypeScript/JavaScript-Plugin-API liefert, ist die Entscheidung für OEA v2.x neu zu evaluieren. Der Wechsel wäre möglich, da Business-Logik im Backend liegt (API-First, ADR-008) und das Frontend-React-Code unverändert bleibt.
