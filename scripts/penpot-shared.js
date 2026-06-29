/**
 * Shared helpers for OEA Penpot mockup scripts.
 * Provides shape builders, frame management, SVG export, and file upload.
 */
const { v4: uuidv4 } = require('uuid');
const fs   = require('fs');
const path = require('path');

const ROOT = '00000000-0000-0000-0000-000000000000';

// ── RPC ───────────────────────────────────────────────────────────────────────

async function rpc(command, body = {}) {
  const API   = process.env.PENPOT_API_URL;
  const TOKEN = process.env.PENPOT_ACCESS_TOKEN;
  const res = await fetch(`${API}api/rpc/command/${command}`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${command} (${res.status}): ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

// ── Geometry ──────────────────────────────────────────────────────────────────

function geo(x, y, w, h) {
  return {
    x, y, width: w, height: h, rotation: 0,
    selrect: { x, y, width: w, height: h, x1: x, y1: y, x2: x+w, y2: y+h },
    points: [{ x, y }, { x: x+w, y }, { x: x+w, y: y+h }, { x, y: y+h }],
    transform: { a:1,b:0,c:0,d:1,e:0,f:0 }, transformInverse: { a:1,b:0,c:0,d:1,e:0,f:0 },
    flipX: null, flipY: null, proportion: 1, proportionLock: false, r1:0, r2:0, r3:0, r4:0,
  };
}

// ── Shape builders (flat, for use inside frames) ──────────────────────────────

/** Rectangle relative to frame origin (x/y are local coords within the frame). */
function R(pid, frameId, x, y, w, h, name, fill='#FFF', fo=1, sc=null, sw=1) {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': frameId, 'frame-id': frameId,
    obj: { id, name, type: 'rect', parentId: frameId, frameId,
      ...geo(x, y, w, h),
      fills: [{ fillColor: fill, fillOpacity: fo }],
      strokes: sc ? [{ 'stroke-color': sc, 'stroke-opacity': 1, 'stroke-width': sw }] : [],
      shapes: [] },
  };
}

/** Text relative to frame origin. */
function T(pid, frameId, x, y, w, h, name, text, size=14, weight=400, color='#0F172A', align='left') {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': frameId, 'frame-id': frameId,
    obj: { id, name, type: 'text', parentId: frameId, frameId,
      ...geo(x, y, w, h),
      fills: [], strokes: [],
      content: { type: 'root', children: [{ type: 'paragraph-set', children: [{
        type: 'paragraph', 'text-align': align,
        children: [{ text, 'font-size': String(size), 'font-weight': String(weight),
          fills: [{ 'fill-color': color, 'fill-opacity': 1 }] }],
      }]}]} },
  };
}

/** Label placed on the canvas (outside any frame, for annotations or row labels). */
function canvasText(pid, x, y, w, h, name, text, size=12, weight=400, color='#64748B', align='left') {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: { id, name, type: 'text', parentId: ROOT, frameId: ROOT,
      ...geo(x, y, w, h), fills: [], strokes: [],
      content: { type: 'root', children: [{ type: 'paragraph-set', children: [{
        type: 'paragraph', 'text-align': align,
        children: [{ text, 'font-size': String(size), 'font-weight': String(weight),
          fills: [{ 'fill-color': color, 'fill-opacity': 1 }] }],
      }]}]} },
  };
}

// ── Frame builder ─────────────────────────────────────────────────────────────

/**
 * Creates a frame (artboard) on the page and returns { frameId, change, r, t }
 * where r(x,y,w,h,...) and t(x,y,w,h,...) are shape builders pre-bound to this frame.
 *
 * x/y are canvas coordinates of the frame's top-left corner.
 */
function createFrame(pid, x, y, w, h, name) {
  const frameId = uuidv4();
  const change = {
    type: 'add-obj', id: frameId, 'page-id': pid, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: {
      id: frameId, name, type: 'frame', parentId: ROOT, frameId: ROOT,
      ...geo(x, y, w, h),
      fills: [{ fillColor: '#FFFFFF', fillOpacity: 1 }],
      strokes: [], shapes: [],
      // clip children to frame bounds
      'clip-content': true,
    },
  };
  const r = (lx, ly, lw, lh, n, fill, fo, sc, sw) => R(pid, frameId, lx, ly, lw, lh, `${name}/${n}`, fill, fo, sc, sw);
  const t = (lx, ly, lw, lh, n, text, size, weight, color, align) => T(pid, frameId, lx, ly, lw, lh, `${name}/${n}`, text, size, weight, color, align);
  return { frameId, change, r, t };
}

// ── SVG export ────────────────────────────────────────────────────────────────

/**
 * Exports a specific frame from a Penpot file as SVG and writes it to outPath.
 * Uses Penpot's export-file RPC command with type=svg.
 */
async function exportFrameSVG(fileId, pageId, objectId, outPath) {
  const API   = process.env.PENPOT_API_URL;
  const TOKEN = process.env.PENPOT_ACCESS_TOKEN;

  // Penpot export endpoint — returns binary SVG data
  const url = `${API}api/rpc/command/export-file`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      'file-id': fileId,
      'page-id': pageId,
      'object-id': objectId,
      type: 'svg',
      scale: 1,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    // Fallback: generate SVG locally from shapes collected on this frame
    console.warn(`  SVG-Export via API fehlgeschlagen (${res.status}): ${text.slice(0,200)}`);
    return false;
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, buffer);
  return true;
}

/**
 * Generates a minimal SVG locally from the shape changes for a frame.
 * Used as fallback when Penpot export API is unavailable.
 */
function generateLocalSVG(frameChange, childChanges, outPath) {
  const { obj: frame } = frameChange;
  const { x: fx, y: fy, width: fw, height: fh } = frame;

  const shapeSVG = childChanges.map(c => {
    const { obj, type: ct } = c;
    if (!obj || ct !== 'add-obj') return '';
    const { x=0, y=0, width=0, height=0 } = obj;
    // Shapes use frame-local coords (0,0 = frame top-left) — no offset needed.
    const lx = x, ly = y;

    if (obj.type === 'rect') {
      const fill  = obj.fills?.[0]?.fillColor ?? '#CCCCCC';
      const fo    = obj.fills?.[0]?.fillOpacity ?? 1;
      const sc    = obj.strokes?.[0]?.['stroke-color'];
      const sw    = obj.strokes?.[0]?.['stroke-width'] ?? 1;
      const stroke = sc ? `stroke="${sc}" stroke-width="${sw}"` : 'stroke="none"';
      return `<rect x="${lx}" y="${ly}" width="${width}" height="${height}" fill="${fill}" fill-opacity="${fo}" ${stroke}/>`;
    }
    if (obj.type === 'text') {
      const para  = obj.content?.children?.[0]?.children?.[0];
      const leaf  = para?.children?.[0];
      const text  = leaf?.text ?? '';
      const size  = leaf?.['font-size'] ?? '14';
      const color = leaf?.fills?.[0]?.['fill-color'] ?? '#000000';
      const align = para?.['text-align'] ?? 'left';
      const ax    = align === 'center' ? lx + width/2 : align === 'right' ? lx + width : lx;
      const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
      const safe  = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return `<text x="${ax}" y="${ly + Number(size)}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-family="Inter,system-ui,sans-serif">${safe}</text>`;
    }
    return '';
  }).join('\n  ');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${fw}" height="${fh}" viewBox="0 0 ${fw} ${fh}">
  <rect width="${fw}" height="${fh}" fill="${frame.fills?.[0]?.fillColor ?? '#FFFFFF'}"/>
  ${shapeSVG}
</svg>`;

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, svg, 'utf8');
}

// ── Upload + export orchestration ─────────────────────────────────────────────

/**
 * Creates a Penpot file, uploads all changes, then exports each registered
 * frame as SVG into docs/screens/.
 *
 * @param {string} fileName  Penpot file name
 * @param {Array}  changes   All add-obj changes (frames first, then children)
 * @param {Array}  frames    [ { id, name, pageId, svgName, children } ]
 */
async function uploadAndExport(fileName, changes, frames) {
  console.log('Verbinde ...');
  const p = await rpc('get-profile', {});
  console.log(`OK ${p.email}`);

  const PID = process.env.PENPOT_PROJECT_ID;
  const f   = await rpc('create-file', { name: fileName, project_id: PID });
  const fileId = f.id;
  const pageId = f.data.pages[0];
  console.log(`Datei: ${fileId}`);

  // Patch page-id into every change
  const patched = changes.map(c => ({ ...c, 'page-id': pageId }));
  console.log(`${patched.length} Shapes hochladen ...`);
  await rpc('update-file', { id: fileId, 'session-id': fileId, revn: 0, vern: 0, changes: patched });
  console.log('Upload OK');

  // SVG export per frame
  const outDir = path.join(__dirname, '..', 'docs', 'screens');
  console.log('\nSVG-Export ...');
  for (const frame of frames) {
    const outPath = path.join(outDir, `${frame.svgName}.svg`);
    const ok = await exportFrameSVG(fileId, pageId, frame.id, outPath);
    if (!ok) {
      // Fallback: generate locally
      const frameChange = patched.find(c => c.id === frame.id);
      generateLocalSVG(frameChange, frame.children, outPath);
      console.log(`  ${frame.svgName}.svg  (lokal generiert)`);
    } else {
      console.log(`  ${frame.svgName}.svg  (Penpot-Export)`);
    }
  }

  const API = process.env.PENPOT_API_URL;
  console.log(`\nPenpot : ${API}dashboard/projects/${PID}`);
  console.log(`SVGs   : docs/screens/`);
  return { fileId, pageId };
}

module.exports = { ROOT, rpc, geo, R, T, canvasText, createFrame, generateLocalSVG, exportFrameSVG, uploadAndExport };
