#!/usr/bin/env node
/**
 * OEA Hauptfenster Wireframes v0.2 — Native Client
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/create-penpot-mockups-hauptfenster.js
 *
 * v0.2 changes:
 * - Explorer goes full height (MAIN_Y → STATUS_Y)
 * - Solution-centric navigation: Aktueller Stand + plateau-mapped Solutions
 * - 6 Grundkategorien per Solution (Komponenten/Verbindungen/Kataloge/FBB/SBB/Diagramme)
 * - Component hierarchy with parent-child nesting (REQ-141/REQ-142)
 * - Bottom panel starts at CENTER_X (not full-width)
 * - Tab renamed: Architektur-Baum (was Diagramme)
 */
const { v4: uuidv4 } = require('uuid');
const API   = process.env.PENPOT_API_URL;
const TOKEN = process.env.PENPOT_ACCESS_TOKEN;
const PID   = process.env.PENPOT_PROJECT_ID;
const ROOT  = '00000000-0000-0000-0000-000000000000';

async function rpc(command, body = {}) {
  const res = await fetch(`${API}api/rpc/command/${command}`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${command} (${res.status}): ${text.slice(0, 500)}`);
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

function R(pid, x, y, w, h, name, fill='#FFF', fo=1, sc=null, sw=1) {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: { id, name, type: 'rect', parentId: ROOT, frameId: ROOT, ...geo(x,y,w,h),
      fills: [{ fillColor: fill, fillOpacity: fo }],
      strokes: sc ? [{ 'stroke-color': sc, 'stroke-opacity': 1, 'stroke-width': sw }] : [],
      shapes: [] },
  };
}

function T(pid, x, y, w, h, name, text, size=14, weight=400, color='#0F172A', align='left') {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: { id, name, type: 'text', parentId: ROOT, frameId: ROOT, ...geo(x,y,w,h),
      fills: [], strokes: [],
      content: { type: 'root', children: [{ type: 'paragraph-set', children: [{
        type: 'paragraph', 'text-align': align,
        children: [{ text, 'font-size': String(size), 'font-weight': String(weight),
          fills: [{ 'fill-color': color, 'fill-opacity': 1 }] }],
      }]}]} },
  };
}

// ── Layout ────────────────────────────────────────────────────────────────────
const FW=1280, FH=800;
const MENU_H=28, TOOL_H=36, MAIN_Y=64, MAIN_H=520;
const LEFT_W=260, DIV_W=4, CENTER_W=716, RIGHT_W=296;
const CENTER_X=LEFT_W+DIV_W;              // 264
const RIGHT_X=CENTER_X+CENTER_W+DIV_W;    // 984
const BOTTOM_Y=MAIN_Y+MAIN_H;             // 584
const BOTTOM_H=192, STATUS_Y=776, STATUS_H=24;
const LEFT_FULL_H = STATUS_Y - MAIN_Y;    // 712 — Explorer goes full height

// ── Palettes ──────────────────────────────────────────────────────────────────
const L = {
  bg:'#F1F5F9', panel:'#FFFFFF', panelAlt:'#F8FAFC',
  menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC',
  selBg:'#E0F2FE', secBg:'#F1F5F9', statusText:'#94A3B8',
  virtualBg:'#EFF6FF',  // Aktueller-Stand highlight
};
const D = {
  bg:'#0F172A', panel:'#1E293B', panelAlt:'#0F172A',
  menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0F172A',
  selBg:'#0C4A6E', secBg:'#0F172A', statusText:'#64748B',
  virtualBg:'#1E3A5F',
};

// ── Explorer tree data ────────────────────────────────────────────────────────
// type: 'virtual'   — Aktueller-Stand aggregation node
// type: 'solution'  — plateau-mapped solution
// type: 'category'  — Grundkategorie (Komponenten/Verbindungen/...)
// type: 'entity'    — ArchitectureEntity (instanziiert)
// type: 'sep'       — horizontal separator
const TREE = [
  { type:'virtual',  label:'Aktueller Stand',       open:true  },
  { type:'category', label:'Komponenten',            count:21,  open:false, indent:1 },
  { type:'category', label:'Verbindungen',           count:8,   open:false, indent:1 },
  { type:'category', label:'Kataloge',               count:3,   open:false, indent:1 },
  { type:'category', label:'Func. Building Blocks',  count:12,  open:false, indent:1 },
  { type:'category', label:'Solution Building Blocks',count:5,  open:false, indent:1 },
  { type:'category', label:'Diagramme',              count:4,   open:false, indent:1 },
  { type:'sep' },
  { type:'solution', label:'ERP-Modernisierung',     plateau:'IST → SOLL 2027',    open:true  },
  { type:'category', label:'Komponenten',            count:6,   open:true,  indent:1 },
  { type:'entity',   abbr:'AC', label:'SAP S/4HANA', color:'#2563EB', open:true,  indent:2 },
  { type:'entity',   abbr:'AC', label:'Finanzmodul', color:'#2563EB', sel:true,   indent:3 },
  { type:'entity',   abbr:'AC', label:'Logistikmodul',color:'#2563EB',            indent:3 },
  { type:'entity',   abbr:'AC', label:'Salesforce CRM',color:'#2563EB',           indent:2 },
  { type:'category', label:'Verbindungen',            count:4,  open:false, indent:1 },
  { type:'category', label:'Kataloge',                count:0,  open:false, indent:1, empty:true },
  { type:'category', label:'Func. Building Blocks',   count:3,  open:false, indent:1 },
  { type:'category', label:'Solution Building Blocks', count:2,  open:false, indent:1 },
  { type:'category', label:'Diagramme',               count:2,  open:false, indent:1 },
  { type:'sep' },
  { type:'solution', label:'Cloud-Migration',         plateau:'IST → TARGET 2028', open:false },
];

// ── Screen builder ────────────────────────────────────────────────────────────
function screen(pid, row, P, m) {
  const bx = 0, by = row*(FH+100);
  const ch = [];

  ch.push(R(pid, bx, by, FW, FH, `${m}/BG`, P.bg));

  // MENU BAR
  ch.push(R(pid, bx, by, FW, MENU_H, `${m}/MenuBg`, P.menuBg));
  [['Datei',8],['Bearbeiten',54],['Ansicht',126],['Modell',190],['Werkzeuge',246],['Hilfe',322]].forEach(([l,x]) =>
    ch.push(T(pid, bx+x, by+6, 66, 16, `${m}/M/${l}`, l, 12, 400, P.menuText, 'left'))
  );
  ch.push(T(pid, bx+FW-112, by+6, 104, 16, `${m}/M/Ver`, 'OEA 0.1.0-SNAPSHOT', 11, 400, P.statusText, 'right'));

  // TOOLBAR
  ch.push(R(pid, bx, by+MENU_H, FW, TOOL_H, `${m}/TBg`, P.panel, 1, P.border, 1));
  const iy = by+MENU_H+8;
  [[8,'N'],[30,'Oe'],[52,'Sp']].forEach(([x,n]) => ch.push(R(pid,bx+x,iy,20,20,`${m}/Ti/${n}`,P.border)));
  ch.push(R(pid,bx+78,iy,1,20,`${m}/TS0`,P.border));
  [[84,'Ax'],[106,'Ko'],[128,'Ei']].forEach(([x,n]) => ch.push(R(pid,bx+x,iy,20,20,`${m}/Ti/${n}`,P.border)));
  ch.push(R(pid,bx+154,iy,1,20,`${m}/TS1`,P.border));
  [[160,'Ru'],[182,'Wh']].forEach(([x,n]) => ch.push(R(pid,bx+x,iy,20,20,`${m}/Ti/${n}`,P.border)));
  ch.push(R(pid,bx+208,iy,1,20,`${m}/TS2`,P.border));
  ch.push(R(pid,bx+214,iy,20,20,`${m}/Ti/Va`,P.border));
  // Plateau selector (right side of toolbar)
  ch.push(T(pid, bx+FW-208, by+MENU_H+11, 62, 14, `${m}/PlLbl`, 'Plateau:', 12, 500, P.muted, 'right'));
  ch.push(R(pid, bx+FW-140, by+MENU_H+6, 132, 24, `${m}/PlDd`, P.inputBg, 1, P.border, 1));
  ch.push(T(pid, bx+FW-135, by+MENU_H+12, 98, 14, `${m}/PlVal`, 'IST (aktuell)', 12, 500, P.text, 'left'));
  ch.push(T(pid, bx+FW-24, by+MENU_H+12, 16, 14, `${m}/PlArr`, '▾', 11, 400, P.muted, 'center'));

  // ── LEFT PANEL — Explorer/Browser (full height to STATUS_Y) ──────────────
  const mY = by + MAIN_Y;
  ch.push(R(pid, bx, mY, LEFT_W, LEFT_FULL_H, `${m}/LP/Bg`, P.panel));

  // Tab row
  ch.push(R(pid, bx, mY, LEFT_W, 28, `${m}/LP/TBg`, P.secBg, 1, P.border, 1));
  ch.push(R(pid, bx, mY, 100, 28, `${m}/LP/TA`, P.panel, 1, P.border, 1));
  ch.push(T(pid, bx, mY+6, 100, 16, `${m}/LP/TAT`, 'Browser', 12, 600, P.primary, 'center'));
  ch.push(T(pid, bx+100, mY+6, 128, 16, `${m}/LP/TBT`, 'Architektur-Baum', 12, 400, P.muted, 'center'));

  // Search
  ch.push(R(pid, bx+8, mY+36, LEFT_W-16, 26, `${m}/LP/Srch`, P.inputBg, 1, P.border, 1));
  ch.push(T(pid, bx+12, mY+42, 14, 14, `${m}/LP/SrchI`, '⌕', 12, 400, P.muted, 'left'));
  ch.push(T(pid, bx+28, mY+42, LEFT_W-44, 14, `${m}/LP/SrchT`, 'Solutions, Entitaeten suchen...', 11, 400, P.muted, 'left'));

  // Explorer tree
  let ty = mY + 70;
  TREE.forEach((item, i) => {
    const n = `${m}/LP/T${i}`;
    const indent = (item.indent || 0) * 14;

    if (item.type === 'sep') {
      ch.push(R(pid, bx+8, ty+3, LEFT_W-16, 1, `${n}/Sep`, P.border));
      ty += 8;

    } else if (item.type === 'virtual') {
      // Aktueller Stand — virtual aggregation, distinct background
      ch.push(R(pid, bx, ty, LEFT_W, 28, `${n}/Bg`, P.virtualBg));
      ch.push(T(pid, bx+4,  ty+6, 12, 16, `${n}/Arr`, item.open?'▼':'▶', 9, 700, P.primary, 'center'));
      ch.push(T(pid, bx+20, ty+6, 16, 16, `${n}/Icon`, '◈', 13, 700, P.primary, 'center'));
      ch.push(T(pid, bx+40, ty+6, LEFT_W-48, 16, `${n}/Lbl`, item.label, 12, 700, P.primary, 'left'));
      ch.push(T(pid, bx+LEFT_W-40, ty+6, 36, 16, `${n}/Sub`, 'gesamt', 9, 400, P.muted, 'right'));
      ty += 28;

    } else if (item.type === 'solution') {
      // Solution node — 2-line: name + plateau badge
      ch.push(R(pid, bx, ty, LEFT_W, 36, `${n}/Bg`, P.secBg));
      ch.push(T(pid, bx+4,  ty+4, 12, 16, `${n}/Arr`, item.open?'▼':'▶', 9, 700, P.muted, 'center'));
      ch.push(T(pid, bx+18, ty+4, LEFT_W-60, 16, `${n}/Lbl`, item.label, 12, 600, P.text, 'left'));
      // Plateau badge (small, below name)
      ch.push(R(pid, bx+18, ty+22, LEFT_W-26, 10, `${n}/PlBg`, P.border));
      ch.push(T(pid, bx+20, ty+22, LEFT_W-28, 10, `${n}/PlT`, item.plateau||'', 8, 400, P.muted, 'left'));
      ty += 36;

    } else if (item.type === 'category') {
      // Category node
      const bg = item.open ? P.panel : null;
      if (bg) ch.push(R(pid, bx, ty, LEFT_W, 22, `${n}/Bg`, bg));
      ch.push(T(pid, bx+indent+4, ty+3, 12, 16, `${n}/Arr`, item.open?'▼':'▶', 8, 700, P.muted, 'center'));
      const countLabel = item.empty ? `${item.label} (0)` : `${item.label} (${item.count})`;
      const countColor = item.empty ? P.muted : P.text;
      const countWeight = item.empty ? 400 : (item.open ? 600 : 400);
      ch.push(T(pid, bx+indent+18, ty+3, LEFT_W-indent-26, 16, `${n}/Lbl`, countLabel, 11, countWeight, countColor, 'left'));
      ty += 22;

    } else if (item.type === 'entity') {
      // Entity node with ArchiMate icon
      if (item.sel) ch.push(R(pid, bx, ty, LEFT_W, 22, `${n}/Sel`, P.selBg));
      // Open/close arrow only if has children (open=true)
      if (item.open !== undefined) {
        ch.push(T(pid, bx+indent+2, ty+3, 10, 16, `${n}/Arr`, item.open?'▼':'▶', 8, 700, P.muted, 'center'));
      }
      // ArchiMate icon (small rect)
      const iconX = bx + indent + (item.open !== undefined ? 14 : 4);
      ch.push(R(pid, iconX, ty+4, 16, 14, `${n}/IBg`, item.color));
      ch.push(T(pid, iconX, ty+5, 16, 12, `${n}/IT`, item.abbr, 7, 700, '#FFFFFF', 'center'));
      ch.push(T(pid, iconX+20, ty+3, LEFT_W-iconX-24+bx, 16, `${n}/Lbl`, item.label,
        12, item.sel?600:400, item.sel?P.primary:P.text, 'left'));
      ty += 22;
    }
  });

  // LEFT divider (full height)
  ch.push(R(pid, bx+LEFT_W, mY, DIV_W, LEFT_FULL_H, `${m}/DivLC`, P.border));

  // ── CENTER PANEL — work area ──────────────────────────────────────────────
  const cx = bx + CENTER_X;
  ch.push(R(pid, cx, mY, CENTER_W, MAIN_H, `${m}/CP/Bg`, P.panelAlt));
  ch.push(R(pid, cx, mY, CENTER_W, 28, `${m}/CP/TBg`, P.secBg, 1, P.border, 1));
  ch.push(T(pid, cx+10, mY+6, 340, 16, `${m}/CP/TH`, 'Arbeitsfenster  --  Finanzmodul [AC]', 12, 500, P.text, 'left'));
  ch.push(R(pid, cx+CENTER_W-76, mY+4, 68, 20, `${m}/CP/NBtn`, P.primary));
  ch.push(T(pid, cx+CENTER_W-76, mY+8, 68, 12, `${m}/CP/NBtnT`, '+ Neu', 12, 600, '#FFFFFF', 'center'));

  // Diagram placeholder (selected entity is shown)
  const emX = cx + CENTER_W/2, emY = mY + MAIN_H/2;
  ch.push(R(pid, cx+60, mY+60, CENTER_W-120, MAIN_H-100, `${m}/CP/Canvas`, P.panel, 1, P.border, 1));
  ch.push(R(pid, emX-44, emY-32, 88, 64, `${m}/CP/EBox`, P.panelAlt, 1, '#2563EB', 2));
  ch.push(R(pid, emX-44, emY-32, 30, 22, `${m}/CP/EIBg`, '#2563EB'));
  ch.push(T(pid, emX-44, emY-31, 30, 20, `${m}/CP/EIT`, 'AC', 9, 700, '#FFFFFF', 'center'));
  ch.push(T(pid, emX-12, emY-26, 54, 18, `${m}/CP/EName`, 'Finanz-\nmodul', 11, 600, P.text, 'left'));
  ch.push(T(pid, cx, mY+MAIN_H-26, CENTER_W, 16, `${m}/CP/Hint`, 'Objekt ausgewaehlt — Eigenschaften rechts, Verbindungen im Tab Beziehungen', 10, 400, P.muted, 'center'));

  // RIGHT divider
  ch.push(R(pid, bx+RIGHT_X-DIV_W, mY, DIV_W, MAIN_H, `${m}/DivCR`, P.border));

  // ── RIGHT PANEL — Properties ──────────────────────────────────────────────
  const rx = bx + RIGHT_X, pw = RIGHT_W-16, pxb = rx+8;
  ch.push(R(pid, rx, mY, RIGHT_W, MAIN_H, `${m}/RP/Bg`, P.panel));
  ch.push(R(pid, rx, mY, RIGHT_W, 28, `${m}/RP/TBg`, P.secBg, 1, P.border, 1));
  ch.push(R(pid, rx, mY, 112, 28, `${m}/RP/TA`, P.panel, 1, P.border, 1));
  ch.push(T(pid, rx, mY+6, 112, 16, `${m}/RP/TAT`, 'Eigenschaften', 12, 600, P.primary, 'center'));
  ch.push(T(pid, rx+112, mY+6, 100, 16, `${m}/RP/TBT`, 'Beziehungen', 12, 400, P.muted, 'center'));

  let py = mY+36;
  const sec = (key, label) => {
    ch.push(R(pid, rx, py, RIGHT_W, 20, `${m}/RP/${key}`, P.secBg));
    ch.push(T(pid, pxb, py+3, pw, 14, `${m}/RP/${key}L`, label, 11, 600, P.muted, 'left'));
    py += 20;
  };
  const fld = (key, label, value, extra) => {
    ch.push(T(pid, pxb, py+2, pw, 12, `${m}/RP/${key}Lbl`, label, 10, 500, P.muted, 'left'));
    py += 14;
    ch.push(R(pid, pxb, py, pw, 26, `${m}/RP/${key}F`, P.inputBg, 1, P.border, 1));
    if (extra) extra(py);
    else ch.push(T(pid, pxb+6, py+6, pw-12, 14, `${m}/RP/${key}V`, value, 12, 400, P.text, 'left'));
    py += 30;
  };

  sec('SA', 'Allgemein');
  fld('Name', 'Name', 'Finanzmodul');
  fld('Typ', 'Typ', '', (fy) => {
    ch.push(R(pid, pxb+6, fy+7, 16, 12, `${m}/RP/TIBg`, '#2563EB'));
    ch.push(T(pid, pxb+6, fy+8, 16, 10, `${m}/RP/TIT`, 'AC', 7, 700, '#FFFFFF', 'center'));
    ch.push(T(pid, pxb+26, fy+6, pw-32, 14, `${m}/RP/TypV`, 'Application Component', 12, 400, P.text, 'left'));
  });
  fld('Sch', 'Schicht', 'Anwendungsschicht');
  fld('Parent', 'Elternelement', '', (fy) => {
    ch.push(R(pid, pxb+6, fy+7, 16, 12, `${m}/RP/PIBg`, '#2563EB'));
    ch.push(T(pid, pxb+6, fy+8, 16, 10, `${m}/RP/PIT`, 'AC', 7, 700, '#FFFFFF', 'center'));
    ch.push(T(pid, pxb+26, fy+6, pw-46, 14, `${m}/RP/ParV`, 'SAP S/4HANA', 12, 400, P.primary, 'left'));
    ch.push(T(pid, pxb+pw-12, fy+6, 12, 14, `${m}/RP/ParX`, '×', 12, 400, P.muted, 'center'));
  });
  py += 2;

  sec('SB', 'Beschreibung');
  ch.push(R(pid, pxb, py, pw, 56, `${m}/RP/DescF`, P.inputBg, 1, P.border, 1));
  ch.push(T(pid, pxb+4, py+4, pw-8, 48, `${m}/RP/DescV`, 'SAP-Modul fuer Finanzbuchhaltung, Controlling und Berichtswesen.', 11, 400, P.muted, 'left'));
  py += 60;
  ch.push(R(pid, pxb, py, pw, 24, `${m}/RP/DB1`, P.inputBg, 1, P.primary, 1));
  ch.push(T(pid, pxb+6, py+5, pw-12, 14, `${m}/RP/DB1T`, 'Betriebshandbuch  → Arbeitsfenster', 11, 400, P.primary, 'left'));
  py += 28;
  ch.push(R(pid, pxb, py, pw, 24, `${m}/RP/DB2`, P.inputBg, 1, P.primary, 1));
  ch.push(T(pid, pxb+6, py+5, pw-12, 14, `${m}/RP/DB2T`, 'Schnittstellendokumentation  → Arbeitsfenster', 11, 400, P.primary, 'left'));
  py += 32;

  sec('SC', 'Klassifizierung');
  fld('Sol', 'Solution', 'ERP-Modernisierung');
  fld('Pl', 'Plateau', '', (fy) => {
    ch.push(T(pid, pxb+6, fy+6, pw-20, 14, `${m}/RP/PlV`, 'SOLL 2027', 12, 400, P.text, 'left'));
    ch.push(T(pid, pxb+pw-12, fy+6, 12, 14, `${m}/RP/PlArr`, '▾', 10, 400, P.muted, 'center'));
  });

  // ── BOTTOM PANEL — Log/Changes/Validation (CENTER+RIGHT only) ────────────
  const botX = cx, botW = FW - CENTER_X;
  const botY = by + BOTTOM_Y;
  ch.push(R(pid, botX, botY, botW, BOTTOM_H, `${m}/Bot/Bg`, P.panel, 1, P.border, 1));
  ch.push(R(pid, botX, botY, botW, 28, `${m}/Bot/TBg`, P.secBg, 1, P.border, 1));
  ch.push(T(pid, botX+8,   botY+6, 44,  16, `${m}/Bot/TLog`, 'Log', 12, 400, P.muted, 'left'));
  ch.push(R(pid, botX+44,  botY, 160, 28, `${m}/Bot/TA`, P.panel, 1, P.border, 1));
  ch.push(T(pid, botX+44,  botY+6, 160, 16, `${m}/Bot/TAT`, 'Letzte Aenderungen', 12, 600, P.primary, 'center'));
  ch.push(T(pid, botX+212, botY+6, 80,  16, `${m}/Bot/TVal`, 'Validation', 12, 400, P.muted, 'left'));

  // Column headers
  const hY = botY + 36;
  ch.push(R(pid, botX, hY, botW, 20, `${m}/Bot/HBg`, P.secBg));
  [[8,'Zeit',110],[126,'Objekt / Typ',220],[354,'Aenderung',480],[842,'Plateau',80],[930,'Benutzer',90]].forEach(([x,l,w]) =>
    ch.push(T(pid, botX+x, hY+3, w, 14, `${m}/Bot/H/${l}`, l, 11, 600, P.muted, 'left'))
  );
  // Change log rows (related to the selected component)
  const rows = [
    { z:'Heute 15:10', obj:'Finanzmodul  [AC]',        a:"parentEntityId → SAP S/4HANA (auto Composition)",    pl:'SOLL 27', u:'Lukas' },
    { z:'Heute 14:32', obj:'Finanzmodul  [AC]',        a:"Beschreibung aktualisiert",                           pl:'SOLL 27', u:'Lukas' },
    { z:'Heute 11:15', obj:'SAP S/4HANA  [AC]',       a:'Logistikmodul eingeordnet (auto Composition)',         pl:'SOLL 27', u:'Anna'  },
    { z:'Heute 09:04', obj:'ERP-Modernisierung  [Sol]',a:'Verbindung Finanzmodul→Salesforce ergaenzt',          pl:'SOLL 27', u:'Lukas' },
    { z:'Gestern',     obj:'Finanzmodul  [AC]',        a:'Erstellt',                                            pl:'SOLL 27', u:'Lukas' },
  ];
  let bry = hY + 20;
  rows.forEach((r, i) => {
    if (i%2===0) ch.push(R(pid, botX, bry, botW, 24, `${m}/Bot/RBg${i}`, P.panelAlt));
    ch.push(T(pid, botX+8,   bry+5, 110, 14, `${m}/Bot/Rz${i}`,  r.z,   11, 400, P.muted,   'left'));
    ch.push(T(pid, botX+126, bry+5, 220, 14, `${m}/Bot/Ro${i}`,  r.obj, 12, 500, P.primary, 'left'));
    ch.push(T(pid, botX+354, bry+5, 480, 14, `${m}/Bot/Ra${i}`,  r.a,   11, 400, P.text,    'left'));
    ch.push(T(pid, botX+842, bry+5, 80,  14, `${m}/Bot/Rp${i}`,  r.pl,  11, 400, P.muted,   'left'));
    ch.push(T(pid, botX+930, bry+5, 90,  14, `${m}/Bot/Ru${i}`,  r.u,   11, 400, P.muted,   'left'));
    bry += 24;
  });

  // ── STATUS BAR ─────────────────────────────────────────────────────────────
  const stY = by + STATUS_Y;
  ch.push(R(pid, bx, stY, FW, STATUS_H, `${m}/St/Bg`, P.menuBg));
  ch.push(T(pid, bx+8,       stY+5, 100, 14, `${m}/St/L`, 'Bereit', 12, 400, P.statusText, 'left'));
  ch.push(T(pid, bx+FW/2-80, stY+5, 160, 14, `${m}/St/C`, 'ERP-Modernisierung  |  6 Komponenten', 12, 400, P.statusText, 'center'));
  ch.push(T(pid, bx+FW-168,  stY+5, 160, 14, `${m}/St/R`, 'SOLL 2027  |  Lukas', 12, 400, P.statusText, 'right'));

  // ── Annotation below screen (ausserhalb des App-Bereichs) ────────────────
  const ann1 = 'Explorer geht von MAIN_Y (64) bis STATUS_Y (776) durch — volle Hoehe. Solution-zentriert: Aktueller Stand (virtuell) + plateau-mapped Solutions.';
  const ann2 = 'Grundstruktur je Solution: Komponenten | Verbindungen | Kataloge | FBBs | SBBs | Diagramme. Component-Hierarchie: SAP S/4HANA > Finanzmodul (implizite Composition per ADR-021).';
  const ann3 = 'REQ-138/139/140/141/142 | ADR-020/021 | UC-13';
  ch.push(T(pid, bx, by+FH+10, FW, 14, `${m}/Ann1`, ann1, 10, 400, P.muted, 'center'));
  ch.push(T(pid, bx, by+FH+26, FW, 14, `${m}/Ann2`, ann2, 10, 400, P.muted, 'center'));
  ch.push(T(pid, bx, by+FH+42, FW, 14, `${m}/Ann3`, ann3, 10, 600, P.primary, 'center'));

  return ch;
}

async function main() {
  console.log('Verbinde ...');
  const p = await rpc('get-profile', {});
  console.log(`OK ${p.email}`);

  const f = await rpc('create-file', { name: 'OEA - Hauptfenster Wireframes v0.2', project_id: PID });
  const fileId=f.id, pageId=f.data.pages[0];
  console.log(`Datei: ${fileId}`);

  const changes = [
    T(pageId, -160, FH/2-10,        150, 20, 'LblLight', 'Light Mode', 13, 600, '#64748B', 'right'),
    T(pageId, -160, FH+100+FH/2-10, 150, 20, 'LblDark',  'Dark Mode',  13, 600, '#64748B', 'right'),
    ...screen(pageId, 0, L, 'Light'),
    ...screen(pageId, 1, D, 'Dark'),
  ];

  console.log(`${changes.length} Shapes ...`);
  await rpc('update-file', { id:fileId, 'session-id':fileId, revn:0, vern:0, changes });

  console.log('Fertig!');
  console.log(`Datei-ID : ${fileId}`);
  console.log(`Penpot   : ${API}dashboard/projects/${PID}`);
}

main().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
