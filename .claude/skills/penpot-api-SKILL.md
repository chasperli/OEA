---
name: penpot-api
description: Programmatic design generation with Penpot RPC API. Use this skill whenever you need to create, read, or modify Penpot design files via API calls. Covers file creation, page management, shape manipulation (rectangles, text, frames), property updates, and error handling for self-hosted Penpot instances. Useful for design automation workflows, programmatic mockup generation, design system instantiation, and integration with other tools. Always apply this skill when the user asks to generate designs programmatically, automate design tasks, or integrate Penpot with other applications.
---

# Penpot RPC API Skill

Enables programmatic design creation and manipulation in self-hosted Penpot instances via the RPC (Remote Procedure Call) API.

## When to Use This Skill

- **File Operations**: Create new Penpot files, retrieve file data, update file structure
- **Design Automation**: Generate designs from data (design tokens, component definitions, mockups)
- **Page & Shape Management**: Add pages, frames, shapes (rectangles, text, circles, etc.)
- **Property Modification**: Update colors, sizes, text content, positioning
- **Workflow Automation**: Integrate Penpot into design system pipelines, generate component variations
- **Data-Driven Design**: Convert JSON/YAML design specifications into Penpot files

---

## Prerequisites

**Environment Variables** are configured in the Claude Code user settings (outside the project):

```
~/distrobox/claude-dev/.claude/settings.json
```

```json
{
  "env": {
    "PENPOT_ACCESS_TOKEN": "...",
    "PENPOT_API_URL": "<url — einzige Quelle: settings.json>",
    "PENPOT_PROJECT_ID": "<uuid — einzige Quelle: settings.json>"
  }
}
```

Variables are available automatically in every Claude Code session — no `export` or shell setup needed.

**How to Generate Access Token:**
1. In Penpot: Your Account → Access Tokens → "Generate new token"
2. Enter descriptive name (e.g., "claude-code-automation")
3. Choose expiration (recommended: 90 days for regular use)
4. Copy the token immediately (shown only once)
5. Treat like password – don't commit to git, don't add to project files

---

## Core API Concepts

### Request Format

All RPC calls use HTTP POST to `{PENPOT_API_URL}api/rpc/command/{method-name}`

**Required Headers:**
```
Authorization: Token {PENPOT_ACCESS_TOKEN}
Content-Type: application/json
Accept: application/json
```

`Accept: application/json` forces JSON response (default is Transit/Clojure format).

### Self-Signed Certificate (Node.js)

Node.js 18+ built-in `fetch` does **not** support `https.Agent` for TLS options. Use the env var instead:

```bash
NODE_TLS_REJECT_UNAUTHORIZED=0 node your-script.js
```

Reusable RPC helper pattern:

```javascript
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false }); // only works with node-fetch, not native fetch

async function rpc(command, body = {}) {
  const res = await fetch(`${process.env.PENPOT_API_URL}api/rpc/command/${command}`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.PENPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
    // NOTE: agent option is silently ignored by native fetch in Node 18+
    // Run with NODE_TLS_REJECT_UNAUTHORIZED=0 instead
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${command} failed (${res.status}): ${text.slice(0, 400)}`);
  return JSON.parse(text);
}
```

### Response Format

**The API returns data directly — there is no `result` wrapper.**

```javascript
// ✗ WRONG (old assumption):
const fileId = response.result.id;

// ✓ CORRECT:
const fileId = response.id;
```

### Root Frame UUID

Every Penpot page has a root frame with a fixed UUID. Shapes on the top level use this as their `parentId` and `frameId`:

```javascript
const ROOT = '00000000-0000-0000-0000-000000000000';
```

---

## API Methods

### 1. CREATE-FILE

Creates a new file. Penpot automatically creates one default page — do not send an additional `add-page` change for it.

**Request:**
```json
{
  "name": "My Design File",
  "project_id": "<PENPOT_PROJECT_ID>"
}
```

**Response:** File object directly (no wrapper):
```javascript
const file = await rpc('create-file', { name: 'My File', project_id: PID });
const fileId = file.id;                    // file UUID
const pageId = file.data.pages[0];         // first (auto-created) page UUID
```

---

### 2. GET-FILE

```javascript
const file = await rpc('get-file', { id: fileId });
const pages = file.data.pages;             // array of page UUIDs
```

---

### 3. UPDATE-FILE

Applies a batch of changes to a file.

**Request — critical field names (all kebab-case):**
```javascript
await rpc('update-file', {
  id: fileId,
  'session-id': fileId,   // ← kebab-case, NOT sessionId; same value as id
  revn: 0,                // current revision (0 for first update after create-file)
  vern: 0,                // version number — required, start at 0
  changes: [ /* change objects */ ],
});
```

**Response:**
```javascript
{ revn: 0, lagged: [{ id: fileId, revn: 1, fileId, changes: [...] }] }
```

---

## Change Types

### ADD-OBJ — Add a shape

**The change type is `add-obj`, NOT `add-shape`.**

```javascript
{
  type: 'add-obj',
  id: shapeId,            // UUID of the new shape
  'page-id': pageId,      // ← kebab-case, NOT page_id
  'parent-id': ROOT,      // UUID of parent (ROOT for top-level)
  'frame-id': ROOT,       // UUID of containing frame (ROOT for top-level)
  obj: { /* shape object — see below */ }
}
```

### DEL-OBJ — Delete a shape

```javascript
{ type: 'del-obj', id: shapeId, 'page-id': pageId }
```

### MOD-OBJ — Modify a shape

```javascript
{
  type: 'mod-obj',
  id: shapeId,
  'page-id': pageId,
  operations: [
    { type: 'set', attr: 'name', val: 'New Name' },
    { type: 'set', attr: 'x', val: 200 },
  ]
}
```

### ADD-PAGE — Add an additional page

```javascript
{ type: 'add-page', id: newPageId }
```

---

## Shape Object (`obj`)

Every shape object requires these fields. Missing any causes a 400 validation error.

### Geometry helper

```javascript
function geo(x, y, w, h) {
  return {
    x, y, width: w, height: h, rotation: 0,
    selrect: { x, y, width: w, height: h, x1: x, y1: y, x2: x + w, y2: y + h },
    points: [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }],
    transform: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    transformInverse: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    flipX: null, flipY: null,
    proportion: 1, proportionLock: false,
    r1: 0, r2: 0, r3: 0, r4: 0,  // corner radii
  };
}
```

### Rectangle

```javascript
const id = uuidv4();
const obj = {
  id, name: 'Card', type: 'rect',
  parentId: ROOT, frameId: ROOT,
  ...geo(x, y, w, h),
  fills: [{ fillColor: '#FFFFFF', fillOpacity: 1 }],
  strokes: [],   // or see stroke format below
  shapes: [],
};
```

### Stroke format

Stroke keys are **kebab-case**. Do NOT include `stroke-type` or `stroke-position` — they are optional and have strict enum validation:

```javascript
strokes: [{
  'stroke-color': '#E5E7EB',
  'stroke-opacity': 1,
  'stroke-width': 1,
}]
```

### Text

`font-size` and `font-weight` are **strings**, not numbers. Text content uses a paragraph tree:

```javascript
const id = uuidv4();
const obj = {
  id, name: 'Label', type: 'text',
  parentId: ROOT, frameId: ROOT,
  ...geo(x, y, w, h),
  fills: [], strokes: [],
  content: {
    type: 'root',
    children: [{
      type: 'paragraph-set',
      children: [{
        type: 'paragraph',
        'text-align': 'left',          // 'left' | 'center' | 'right'
        children: [{
          text: 'Hello World',
          'font-size': '16',           // ← string
          'font-weight': '700',        // ← string
          fills: [{ 'fill-color': '#111827', 'fill-opacity': 1 }],
          // ↑ fills array with kebab-case keys — NOT flat fill-color/fill-opacity
        }],
      }],
    }],
  },
};
```

---

## Complete Working Example

```javascript
const { v4: uuidv4 } = require('uuid');
const ROOT = '00000000-0000-0000-0000-000000000000';

const API = process.env.PENPOT_API_URL;
const TOKEN = process.env.PENPOT_ACCESS_TOKEN;
const PID = process.env.PENPOT_PROJECT_ID;

async function rpc(command, body = {}) {
  const res = await fetch(`${API}api/rpc/command/${command}`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${command} (${res.status}): ${text.slice(0, 400)}`);
  return JSON.parse(text);
}

function geo(x, y, w, h) {
  return {
    x, y, width: w, height: h, rotation: 0,
    selrect: { x, y, width: w, height: h, x1: x, y1: y, x2: x+w, y2: y+h },
    points: [{ x, y }, { x: x+w, y }, { x: x+w, y: y+h }, { x, y: y+h }],
    transform: { a:1,b:0,c:0,d:1,e:0,f:0 }, transformInverse: { a:1,b:0,c:0,d:1,e:0,f:0 },
    flipX: null, flipY: null, proportion: 1, proportionLock: false, r1:0, r2:0, r3:0, r4:0,
  };
}

function addRect(pageId, x, y, w, h, name, fillColor = '#FFFFFF', fillOpacity = 1, strokeColor = null, strokeWidth = 1) {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pageId, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: {
      id, name, type: 'rect', parentId: ROOT, frameId: ROOT,
      ...geo(x, y, w, h),
      fills: [{ fillColor, fillOpacity }],
      strokes: strokeColor ? [{ 'stroke-color': strokeColor, 'stroke-opacity': 1, 'stroke-width': strokeWidth }] : [],
      shapes: [],
    },
  };
}

function addText(pageId, x, y, w, h, name, content, size = 14, weight = 400, color = '#111827', align = 'left') {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pageId, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: {
      id, name, type: 'text', parentId: ROOT, frameId: ROOT,
      ...geo(x, y, w, h),
      fills: [], strokes: [],
      content: {
        type: 'root',
        children: [{
          type: 'paragraph-set',
          children: [{
            type: 'paragraph', 'text-align': align,
            children: [{
              text: content,
              'font-size': String(size),
              'font-weight': String(weight),
              fills: [{ 'fill-color': color, 'fill-opacity': 1 }],
            }],
          }],
        }],
      },
    },
  };
}

async function main() {
  // create-file also creates page[0] automatically
  const file = await rpc('create-file', { name: 'Demo', project_id: PID });
  const fileId = file.id;
  const pageId = file.data.pages[0];

  await rpc('update-file', {
    id: fileId,
    'session-id': fileId,   // kebab-case
    revn: 0,
    vern: 0,                // required
    changes: [
      addRect(pageId, 0, 0, 800, 600, 'Background', '#F1F3F9'),
      addRect(pageId, 100, 100, 600, 400, 'Card', '#FFFFFF', 1, '#E5E7EB', 1),
      addText(pageId, 140, 140, 300, 40, 'Title', 'OEA Demo', 24, 700, '#4F46E5', 'left'),
    ],
  });

  console.log(`✓ File: ${fileId}`);
  console.log(`  Open: ${API}dashboard/projects/${PID}`);
}

// Run with: NODE_TLS_REJECT_UNAUTHORIZED=0 node script.js
main().catch(e => { console.error(e.message); process.exit(1); });
```

---

## Connectivity Check

```bash
# Self-signed cert → -k flag required
curl -sk -X POST "${PENPOT_API_URL}api/rpc/command/get-profile" \
  -H "Authorization: Token ${PENPOT_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{}" | python3 -m json.tool
```

---

## Common Errors

| Status | Cause | Fix |
|--------|-------|-----|
| 400 `params-validation` | Missing/wrong field in shape `obj` | Check `selrect`, `parentId`, `frameId`, `points` are all present |
| 400 on `stroke-type` | Invalid enum value | Remove `stroke-type` and `stroke-position` — they are optional |
| 400 on `session-id` | Wrong key name | Use `'session-id'` (kebab-case), not `sessionId` |
| 400 missing `vern` | `vern` not sent | Always include `vern: 0` in `update-file` |
| 401 | Token invalid/expired | Generate new token in Penpot UI |
| fetch failed | TLS cert rejected | Run with `NODE_TLS_REJECT_UNAUTHORIZED=0` |

---

## Wireframe Conventions

### Annotations ausserhalb des Artboards

Spezifikationshinweise (Use-Case-Referenzen, REQ-IDs, Entwicklernotizen) gehören **niemals** in den Screen-Bereich. Sie werden stattdessen unterhalb des Screen-Hintergrunds platziert:

```javascript
const FW = 1280, FH = 800;   // Screen dimensions

// ✗ FALSCH — Text liegt innerhalb des Screen-Rechtecks und erscheint in der App:
T(pid, x+400, y+756, 480, 18, 'UC', 'UC-01: Login | REQ-136', ...);

// ✓ RICHTIG — Text liegt unterhalb des Screens (y + FH + Abstand):
T(pid, x+400, y+FH+12, 480, 18, 'UC', 'UC-01: Login | REQ-136', ...);
```

**Faustregel**: `y`–`y+FH` = App-UI. `y+FH+N` = Annotation/Spezifikation.

Dieser Konvention folgen Figma, Sketch und Penpot gleichermassen: Alles innerhalb eines Artboards / Screen-Rechtecks wird als Produkt-UI betrachtet; Dokumentation und Rückverfolgbarkeit leben ausserhalb.

---

## SVG-Export — Architekturgrenze und Standard-Lösung

### Warum `api/export` mit API-Access-Token nicht funktioniert

Der Penpot-Maintainer hat es explizit bestätigt (GitHub Discussion #462):

> *"Right now you can't download SVG from backend, because backend only know about structured data."*

Der Exporter (`api/export?cmd=export-shapes`) ist ein separater **Headless-Chrome-Prozess** (Puppeteer). Er braucht intern ein `token`-Feld in `render-params`, damit Chrome beim Penpot-Backend authentifiziert Dateidaten abrufen kann. Dieses Token wird aus dem **Browser-Session-Cookie** erzeugt — nicht aus dem API-Access-Token. Resultat: `token nil` → 400 Validation Error.

**Keine offiziell unterstützte Lösung** für programmatischen SVG-Export mit Access-Token existiert. `penpot-export` (offizielles Tool) exportiert nur Design-Tokens (CSS/SCSS/JSON), keine Frames/Artboards. Die Plugin-API kann SVGs erzeugen, läuft aber nur im Browser.

### Standard-Lösung: lokaler SVG-Fallback via `generateLocalSVG()`

**Immer** `uploadAndExport()` aus `scripts/penpot-shared.js` verwenden. Diese Funktion:
1. Lädt alle Shapes nach Penpot (vollständig, interaktiv im Browser bedienbar)
2. Versucht SVG-Export via Penpot-API (`exportFrameSVG`)
3. Fällt bei 404/Fehler **automatisch** auf lokalen SVG-Generator zurück

```javascript
const { createFrame, canvasText, uploadAndExport } = require('./penpot-shared');

// Am Ende von main():
await uploadAndExport('OEA - Dateiname v0.1', allChanges, frames);
// → Penpot-Upload immer erfolgreich
// → docs/screens/<svgName>.svg  (lokal generiert falls API-Export fehlschlägt)
```

`generateLocalSVG()` erzeugt valides SVG aus den Shape-Daten, die im Script bereits vorhanden sind — kein zweiter API-Call nötig. Die SVGs landen in `docs/screens/` und werden in git versioniert.

**Nie** versuchen, `api/export` direkt mit dem Access-Token aufzurufen — das ist dokumentiert nicht supportet und wird immer mit `token nil` fehlschlagen.

### Frame-Architektur (Pflicht für SVG-Export)

Jeder Screen **muss** als Penpot-Frame (`type: 'frame'`) angelegt werden, damit `generateLocalSVG()` pro Screen eine separate SVG-Datei erzeugen kann. Dazu `createFrame()` aus `penpot-shared.js` nutzen:

```javascript
const { frameId, change, r, t } = createFrame(pid, x, y, FW, FH, 'Light/ScreenName');
const ch = [change]; // Frame-Change zuerst, dann Shape-Changes
ch.push(r(0, 0, FW, MENU_H, 'MenuBg', palette.menuBg));
// ... weitere Shapes mit lokalen Koordinaten (relativ zum Frame)

// Am Ende screen() zurückgeben:
return { frameId, changes: ch };

// In main() registrieren:
frames.push({ id: frameId, svgName: 'screenname-light', children: changes.slice(1) });
```

---

## Resources

- [Penpot Technical Guide](https://help.penpot.app/technical-guide/)
- [Penpot Data Model](https://help.penpot.app/technical-guide/developer/data-model/)
- [Penpot Exporter Architecture](https://help.penpot.app/technical-guide/developer/architecture/exporter/)
- [GitHub Discussion #462 — Backend SVG Export Limitation](https://github.com/penpot/penpot/discussions/462)
