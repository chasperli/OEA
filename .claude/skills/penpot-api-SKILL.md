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

All RPC calls use HTTP POST to `{API_BASE_URL}/api/rpc/command/{method-name}`

**Required Headers:**
```
Authorization: Token {PENPOT_ACCESS_TOKEN}
Content-Type: application/json
Accept: application/json
```

The `Accept: application/json` header forces JSON response (default is Transit format, which is Clojure-specific).

### Self-Signed Certificate (Node.js)

The Penpot instance uses a self-signed TLS certificate. Native `fetch` in Node.js rejects these by default. Use an `https.Agent` with `rejectUnauthorized: false`:

```javascript
const https = require('https');

const agent = new https.Agent({ rejectUnauthorized: false });

const response = await fetch(`${PENPOT_API_URL}api/rpc/command/get-profile`, {
  method: "POST",
  headers: {
    "Authorization": `Token ${PENPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: "{}",
  agent  // pass agent to every request
});
```

Create a reusable helper to avoid repeating the agent on every call:

```javascript
const https = require('https');
const agent = new https.Agent({ rejectUnauthorized: false });

async function penpotFetch(command, body = {}) {
  const res = await fetch(`${process.env.PENPOT_API_URL}api/rpc/command/${command}`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${process.env.PENPOT_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(body),
    agent
  });
  if (!res.ok) throw new Error(`Penpot ${command} failed: ${res.status}`);
  return res.json();
}
```

> **Note:** `NODE_TLS_REJECT_UNAUTHORIZED=0` works as an alternative but disables TLS checks globally for the process — avoid it.

### Data Types & UUIDs

Penpot uses UUIDs for all identifiers:
- **file_id**: Returned by `create-file`, used in all subsequent operations
- **page_id**: Created when adding pages, identifies pages within files
- **shape_id**: Generated for each shape (rectangle, text, frame, etc.)
- **project_id**: Your Penpot project identifier

Generate UUIDs in JavaScript/Node.js:
```javascript
const { v4: uuidv4 } = require('uuid');
const newId = uuidv4(); // e.g., "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
```

### Session Management

When calling `update-file`, you must provide:
- `sessionId`: Set to the `file_id` (identifies the edit session)
- `revn`: Revision number (start at 0, increment after each update)
- `changes`: Array of change objects describing modifications

---

## API Methods

### 1. CREATE-FILE

Create a new Penpot file.

**Endpoint:** `POST /api/rpc/command/create-file`

**Request Body:**
```json
{
  "name": "string (display name in Penpot UI)",
  "project_id": "uuid (from PENPOT_PROJECT_ID env var)"
}
```

**Response:**
```json
{
  "result": {
    "id": "file-uuid",
    "name": "string",
    "project_id": "uuid",
    "pages": [],
    "version": 1
  }
}
```

**Example:**
```javascript
const response = await fetch(`${PENPOT_API_URL}/api/rpc/command/create-file`, {
  method: "POST",
  headers: {
    "Authorization": `Token ${PENPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    name: "OEA_System_Context",
    project_id: PENPOT_PROJECT_ID
  })
});

const data = await response.json();
const fileId = data.result.id;
console.log(`Created file: ${fileId}`);
```

---

### 2. GET-FILE

Retrieve complete file data including pages, shapes, and metadata.

**Endpoint:** `POST /api/rpc/command/get-file`

**Request Body:**
```json
{
  "id": "file-uuid"
}
```

**Response:** Full file object with pages array, shape hierarchy, assets, etc.

**Example:**
```javascript
const response = await fetch(`${PENPOT_API_URL}/api/rpc/command/get-file`, {
  method: "POST",
  headers: {
    "Authorization": `Token ${PENPOT_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({ id: fileId })
});

const fileData = await response.json();
const pages = fileData.result.pages; // Array of pages in file
```

---

### 3. UPDATE-FILE

Modify file structure by applying "changes" (add pages, shapes, update properties).

**Endpoint:** `POST /api/rpc/command/update-file`

**Request Body:**
```json
{
  "id": "file-uuid",
  "sessionId": "file-uuid (same as id)",
  "revn": 0,
  "changes": [
    { /* change object 1 */ },
    { /* change object 2 */ }
  ]
}
```

**Critical Details:**
- `sessionId` must equal `id` (identifies edit session)
- `revn` must match server's current revision (typically 0 for first update, increments per change)
- `changes` is an array – you can batch multiple operations

**Response:**
```json
{
  "result": {
    "revn": 1,
    "changes-revn": 1
  }
}
```

---

## Change Types (for update-file)

### ADD-PAGE
Adds a new page to the file.

```json
{
  "type": "add-page",
  "id": "uuid-for-new-page"
}
```

### ADD-SHAPE

Adds a shape (rectangle, text, circle, frame, etc.) to a page.

**Structure:**
```json
{
  "type": "add-shape",
  "id": "uuid-for-shape",
  "page_id": "uuid-of-target-page",
  "shape": {
    "type": "rect|text|circle|path|frame|...",
    "x": 0,
    "y": 0,
    "width": 200,
    "height": 200,
    "name": "Shape Display Name",
    /* type-specific properties below */
  }
}
```

#### Rectangle Shape
```json
{
  "type": "add-shape",
  "id": "uuid1",
  "page_id": "uuid2",
  "shape": {
    "type": "rect",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 150,
    "name": "Card Container",
    "fill-color": "#FF6B6B",
    "fill-opacity": 1,
    "stroke-color": "#000000",
    "stroke-opacity": 0.5,
    "stroke-width": 2
  }
}
```

#### Text Shape
```json
{
  "type": "add-shape",
  "id": "uuid1",
  "page_id": "uuid2",
  "shape": {
    "type": "text",
    "x": 0,
    "y": 0,
    "width": 300,
    "height": 100,
    "name": "Title Text",
    "content": "Welcome to Penpot",
    "font-size": 24,
    "font-weight": 700,
    "font-family": "Roboto",
    "text-color": "#333333",
    "text-align": "center"
  }
}
```

#### Frame Shape
```json
{
  "type": "add-shape",
  "id": "uuid1",
  "page_id": "uuid2",
  "shape": {
    "type": "frame",
    "x": 0,
    "y": 0,
    "width": 1200,
    "height": 800,
    "name": "Desktop Layout"
  }
}
```

### MOD-OBJ

Modifies existing shape properties (update color, position, text, etc.).

```json
{
  "type": "mod-obj",
  "id": "shape-uuid",
  "operations": [
    ["fill-color", "#0066FF"],
    ["name", "Updated Name"],
    ["x", 50],
    ["y", 50]
  ]
}
```

**Common Properties:**
- `fill-color`: Hex color string (e.g., "#FF0000")
- `fill-opacity`: 0-1 float
- `name`: Display name in UI
- `x`, `y`: Position coordinates
- `width`, `height`: Dimensions
- `content`: Text content (text shapes only)
- `font-size`: Numeric size (text shapes)
- `text-color`: Hex color (text shapes)

---

## Workflow: Step-by-Step Example

**Goal:** Create a file with a header frame and three colored boxes.

```javascript
const { v4: uuidv4 } = require('uuid');
const fetch = require('node-fetch'); // or use native fetch in Node 18+

const PENPOT_API_URL = process.env.PENPOT_API_URL;
const PENPOT_TOKEN = process.env.PENPOT_ACCESS_TOKEN;
const PENPOT_PROJECT_ID = process.env.PENPOT_PROJECT_ID;

async function createDesign() {
  // Step 1: Create file
  console.log("Creating file...");
  const createRes = await fetch(`${PENPOT_API_URL}/api/rpc/command/create-file`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${PENPOT_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      name: "Color Palette Demo",
      project_id: PENPOT_PROJECT_ID
    })
  });

  const createData = await createRes.json();
  if (!createData.result?.id) throw new Error("Failed to create file");
  
  const fileId = createData.result.id;
  console.log(`✓ File created: ${fileId}`);

  // Step 2: Add page
  console.log("Adding page...");
  const pageId = uuidv4();
  
  // Step 3: Add shapes (batched)
  const frameId = uuidv4();
  const box1Id = uuidv4();
  const box2Id = uuidv4();
  const box3Id = uuidv4();

  const updateRes = await fetch(`${PENPOT_API_URL}/api/rpc/command/update-file`, {
    method: "POST",
    headers: {
      "Authorization": `Token ${PENPOT_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      id: fileId,
      sessionId: fileId,
      revn: 0,
      changes: [
        // Add page
        { type: "add-page", id: pageId },
        
        // Add frame
        {
          type: "add-shape",
          id: frameId,
          page_id: pageId,
          shape: {
            type: "frame",
            x: 0,
            y: 0,
            width: 1200,
            height: 800,
            name: "Main Frame"
          }
        },
        
        // Add three colored boxes
        {
          type: "add-shape",
          id: box1Id,
          page_id: pageId,
          shape: {
            type: "rect",
            x: 100,
            y: 100,
            width: 200,
            height: 200,
            name: "Red Box",
            "fill-color": "#FF0000",
            "fill-opacity": 1
          }
        },
        {
          type: "add-shape",
          id: box2Id,
          page_id: pageId,
          shape: {
            type: "rect",
            x: 400,
            y: 100,
            width: 200,
            height: 200,
            name: "Green Box",
            "fill-color": "#00FF00",
            "fill-opacity": 1
          }
        },
        {
          type: "add-shape",
          id: box3Id,
          page_id: pageId,
          shape: {
            type: "rect",
            x: 700,
            y: 100,
            width: 200,
            height: 200,
            name: "Blue Box",
            "fill-color": "#0000FF",
            "fill-opacity": 1
          }
        }
      ]
    })
  });

  const updateData = await updateRes.json();
  if (!updateData.result) throw new Error("Failed to update file");
  
  console.log(`✓ Design created! File ID: ${fileId}`);
  console.log(`✓ View at: ${PENPOT_API_URL}/dashboard/projects/${PENPOT_PROJECT_ID}`);
  
  return fileId;
}

createDesign().catch(err => console.error("Error:", err));
```

---

## Error Handling

### Common Error Responses

| Status | Error | Cause | Solution |
|--------|-------|-------|----------|
| 400 | Bad Request | Malformed JSON, invalid shape properties | Validate shape object structure, check required fields |
| 401 | Unauthorized | Token invalid/expired | Generate new token, verify env vars |
| 500 | Internal Server Error | Backend error, Transit encoding issue | Already using `Accept: application/json`; check server logs |

### Debug Checklist

```bash
# Quick connectivity check (self-signed cert → -k flag required)
curl -sk -X POST "${PENPOT_API_URL}api/rpc/command/get-profile" \
  -H "Authorization: Token ${PENPOT_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{}" | python3 -m json.tool
```

```javascript
// 1. Verify env vars
console.log("API URL:", process.env.PENPOT_API_URL);
console.log("Token exists:", !!process.env.PENPOT_ACCESS_TOKEN);
console.log("Project ID:", process.env.PENPOT_PROJECT_ID);

// 2. Test basic connectivity (self-signed cert: use agent options or --insecure equivalent)
const testRes = await fetch(`${PENPOT_API_URL}api/rpc/command/get-profile`, {
  method: "POST",
  headers: {
    "Authorization": `Token ${PENPOT_TOKEN}`,
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: "{}"
});
console.log("Profile check status:", testRes.status);

// 3. Log full response
const json = await testRes.json();
console.log(JSON.stringify(json, null, 2));
```

### Transit Format Issues

If you see response like `["^ ","~#'penpot/..."]`, the server returned Transit format instead of JSON.

**Solution:** Ensure request has these exact headers:
```javascript
"Content-Type": "application/json",
"Accept": "application/json"
```

---

## Best Practices

### 1. Batch Changes When Possible
Instead of multiple `update-file` calls, group changes in one request:

```javascript
// ✗ Inefficient: 3 API calls
await updateFile(fileId, [{ type: "add-page", ... }]);
await updateFile(fileId, [{ type: "add-shape", ... }]);
await updateFile(fileId, [{ type: "add-shape", ... }]);

// ✓ Better: 1 API call
await updateFile(fileId, [
  { type: "add-page", ... },
  { type: "add-shape", ... },
  { type: "add-shape", ... }
]);
```

### 2. Generate UUIDs in Advance
Pre-generate all UUIDs before making API calls to avoid coordination issues:

```javascript
const ids = {
  file: uuidv4(),
  page: uuidv4(),
  shapes: {
    frame: uuidv4(),
    box1: uuidv4(),
    box2: uuidv4()
  }
};
```

### 3. Validate Data Before API Calls
Check shape properties have required fields:

```javascript
function validateShape(shape) {
  if (!["rect", "text", "circle", "frame"].includes(shape.type)) {
    throw new Error(`Unknown shape type: ${shape.type}`);
  }
  if (typeof shape.x !== "number" || typeof shape.y !== "number") {
    throw new Error("Shape must have numeric x, y coordinates");
  }
  if (shape.width <= 0 || shape.height <= 0) {
    throw new Error("Shape width/height must be positive");
  }
}
```

### 4. Use Descriptive Names
Give shapes meaningful names for UI clarity:

```json
{
  "name": "Hero Section Header",
  "type": "frame"
}
```

### 5. Increment Revision Number Carefully
After successful `update-file`, the response includes new `revn`. For subsequent updates, use that new number:

```javascript
let currentRevn = 0;

// First update
const res1 = await updateFile(fileId, changes, currentRevn);
currentRevn = res1.result.revn; // Get new revision

// Second update uses new revision
const res2 = await updateFile(fileId, moreChanges, currentRevn);
```

---

## Integration with Claude Code

Use this skill whenever you need to:

1. **Generate designs programmatically:**
   ```
   "Create a design system mockup from this component definitions JSON"
   ```

2. **Automate design tasks:**
   ```
   "Generate 10 color variations of the OEA dashboard"
   ```

3. **Data-driven design:**
   ```
   "Create a Penpot file with typography samples for all sizes in design tokens"
   ```

4. **Workflow automation:**
   ```
   "Build a Python script that creates Penpot mockups from Figma specifications"
   ```

---

## Troubleshooting

**Q: Getting "Already connected to a transport" errors?**  
A: This is a Penpot MCP server bug (not your API usage). You're using raw RPC API, which should not have this issue. If it persists, restart Penpot server.

**Q: Revisions don't increment correctly?**  
A: Always use `sessionId` = `id` (same value). If mixing multiple edit sessions, ensure each uses its own `sessionId`.

**Q: Can't see my generated file in Penpot UI?**  
A: Verify:
1. Correct `project_id` in create-file call
2. File created successfully (check response)
3. Penpot UI is viewing the correct project
4. Try refreshing browser

**Q: Text isn't appearing in text shapes?**  
A: Ensure the `content` field is set:
```json
{
  "type": "text",
  "content": "Your text here",
  ...
}
```

---

## Resources

- [Penpot Technical Guide](https://help.penpot.app/technical-guide/)
- [Penpot Data Model](https://help.penpot.app/technical-guide/developer/data-model/)
- [Self-Hosted Setup](https://help.penpot.app/technical-guide/getting-started/)
