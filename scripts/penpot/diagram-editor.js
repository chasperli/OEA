#!/usr/bin/env node
/**
 * OEA Diagram Editor (SCR-021) — Architecture Canvas with ArchiMate Shapes & Connections
 * Light + Dark mode on one Penpot page (stacked vertically).
 *
 * UC-05: Describe Architecture Vision
 * UC-08: Model Data Lineage
 * UC-10: Model Business Processes (BPMN)
 *
 * Layout (left → right):
 *   Explorer (260px) | Shape Palette (180px) | Canvas (532px) | Properties (296px)
 *
 * Shape Palette (REQ-144): collapsible, filtered by active Viewpoint.
 * Drop dialog (REQ-145): entity lookup + inline creation after drag-to-canvas.
 * Context menu (REQ-146): "Remove from Diagram [DEL]" vs "Delete Entity [Ctrl+DEL]".
 *
 * Run (local SVG): node scripts/penpot/diagram-editor.js
 * Run (Penpot):    NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/penpot/diagram-editor.js
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW = 1280, FH = 800, GAP = 100;
const sy = row => row * (FH + GAP);

const MENU_H  = 28, TOOL_H = 36, MAIN_Y = 64, MAIN_H = 520;
const LEFT_W  = 260, DIV_W = 4;
const RIGHT_W = 296;

// Shape Palette sits between Explorer and Canvas (REQ-144)
const PALETTE_W  = 180;
const PALETTE_X  = LEFT_W + DIV_W;                        // 264
const CANVAS_X   = PALETTE_X + PALETTE_W + DIV_W;         // 448
const CANVAS_W   = FW - CANVAS_X - DIV_W - RIGHT_W;       // 532
const RIGHT_X    = CANVAS_X + CANVAS_W + DIV_W;           // 984

const BOTTOM_Y = MAIN_Y + MAIN_H;   // 584
const BOTTOM_H = 192, STATUS_Y = 776, STATUS_H = 24;

// Diagram-specific: canvas area within center section
const DIAG_TOOL_H = 34;
const CANVAS_Y    = MAIN_Y + DIAG_TOOL_H;  // 98

// ArchiMate element colors
const C = {
  AC:   '#2563EB',
  AS:   '#0284C7',
  TB:   '#7C3AED',
  CONN: '#64748B',
};

// ── Palettes ──────────────────────────────────────────────────────────────────
const L = {
  panel:'#FFFFFF', panelAlt:'#F8FAFC',
  menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC',
  selBg:'#E0F2FE', secBg:'#F1F5F9', statusText:'#94A3B8',
  canvas:'#FAFCFF', overlay:'#FFFFFF', grid:'#94A3B8',
  warnBg:'#FEF3C7', warnBorder:'#D97706', warnText:'#92400E',
};
const D = {
  panel:'#1E293B', panelAlt:'#172030',
  menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0B1829',
  selBg:'#0C4A6E', secBg:'#162030', statusText:'#64748B',
  canvas:'#0D1B2E', overlay:'#1E293B', grid:'#1E3A5A',
  warnBg:'#78350F', warnBorder:'#D97706', warnText:'#FDE68A',
};

// ── Screen builder ─────────────────────────────────────────────────────────────
function screen(pid, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, 0, sy(row), FW, FH, `${m}/DiagramEditor`);
  const ch = [change];

  // Canvas-local coords → frame-local coords
  const cR = (cx, cy, w, h, name, fill, fo=1, sc, sw) =>
    ch.push(r(CANVAS_X + cx, CANVAS_Y + cy, w, h, name, fill, fo, sc, sw));
  const cT = (cx, cy, w, h, name, text, size, weight, color, align) =>
    ch.push(t(CANVAS_X + cx, CANVAS_Y + cy, w, h, name, text, size, weight, color, align));

  // Palette-local coords → frame-local (y relative to MAIN_Y)
  const pR = (px, py, w, h, name, fill, fo=1, sc, sw) =>
    ch.push(r(PALETTE_X + px, MAIN_Y + py, w, h, name, fill, fo, sc, sw));
  const pT = (px, py, w, h, name, text, size, weight, color, align) =>
    ch.push(t(PALETTE_X + px, MAIN_Y + py, w, h, name, text, size, weight, color, align));

  // ArchiMate box shape on canvas
  const box = (cx, cy, w, h, key, abbr, typeLabel, name, sel) => {
    const HEADER = 20;
    if (sel) cR(cx-3, cy-3, w+6, h+6, `${key}/Sel`, P.selBg, 1, P.primary, 2);
    cR(cx, cy, w, h, `${key}/Bg`, P.panel, 1, sel ? P.primary : P.border, sel ? 2 : 1);
    cR(cx, cy, w, HEADER, `${key}/HBg`, C[abbr], 0.12);
    cR(cx+4, cy+4, 12, 12, `${key}/Badge`, C[abbr]);
    cT(cx+4, cy+5, 12, 10, `${key}/BT`, abbr, 7, 700, '#FFFFFF', 'center');
    cT(cx+20, cy+4, w-24, 12, `${key}/TypeLbl`, typeLabel, 8, 400, C[abbr], 'left');
    cT(cx+4, cy+HEADER+5, w-8, h-HEADER-8, `${key}/Name`, name, 11, 600, P.text, 'center');
    if (sel) {
      [[0,0],[w-6,0],[0,h-6],[w-6,h-6]].forEach(([hx,hy],i) =>
        cR(cx+hx, cy+hy, 6, 6, `${key}/H${i}`, P.panel, 1, P.primary, 1.5));
    }
  };

  // Connection helpers (canvas-local)
  const line = (cx, cy, w, h, name) => cR(cx, cy, w, h, name, C.CONN, 0.55);
  const arr  = (cx, cy, w, h, name, char) =>
    cT(cx, cy, w, h, name, char, 10, 700, C.CONN, 'center');
  const cLbl = (cx, cy, w, name, txt) =>
    cT(cx, cy, w, 12, name, txt, 9, 400, P.muted, 'center');

  // ── MENU BAR ──
  ch.push(r(0, 0, FW, MENU_H, 'MenuBg', P.menuBg));
  [['File',8],['Edit',54],['View',100],['Model',148],['Tools',200],['Help',248]].forEach(([l,x]) =>
    ch.push(t(x, 6, 50, 16, `M/${l}`, l, 12, 400, P.menuText, 'left')));
  ch.push(t(FW-120, 6, 112, 16, 'MV', 'OEA 0.1.0-SNAPSHOT', 11, 400, P.statusText, 'right'));

  // ── MAIN TOOLBAR — Breadcrumb + diagram actions ──
  ch.push(r(0, MENU_H, FW, TOOL_H, 'TBg', P.panel, 1, P.border, 1));
  ch.push(t(8,   MENU_H+11,  64, 14, 'TBcDia',   'Diagrams',                 12, 400, P.muted, 'left'));
  ch.push(t(74,  MENU_H+11,  12, 14, 'TBcSep',   '›',                        12, 400, P.muted, 'center'));
  ch.push(t(88,  MENU_H+11, 240, 14, 'TBcTitle', 'OEA Architecture Overview', 12, 600, P.text,  'left'));
  ch.push(t(340, MENU_H+11, 120, 14, 'TBcVP',    'Viewpoint: free-form',      10, 400, P.muted, 'left'));
  ch.push(r(FW-188, MENU_H+7, 78, 22, 'BtnSVG',  P.inputBg, 1, P.border, 1));
  ch.push(t(FW-188, MENU_H+11, 78, 14, 'BtnSVGT', 'Export SVG', 11, 500, P.muted, 'center'));
  ch.push(r(FW-102, MENU_H+7, 76, 22, 'BtnSave', P.primary));
  ch.push(t(FW-102, MENU_H+11, 76, 14, 'BtnSaveT', 'Save', 11, 600, '#FFFFFF', 'center'));

  // ── PANEL DIVIDERS ──
  ch.push(r(LEFT_W,            MAIN_Y, DIV_W, MAIN_H, 'DivLPal', P.border));
  ch.push(r(PALETTE_X+PALETTE_W, MAIN_Y, DIV_W, MAIN_H, 'DivPalC', P.border));
  ch.push(r(RIGHT_X - DIV_W,  MAIN_Y, DIV_W, MAIN_H, 'DivCR',   P.border));

  // ══════════════════════════════════════════════════════════════════════════════
  // LEFT PANEL — Explorer (navigation tree)
  // ══════════════════════════════════════════════════════════════════════════════
  ch.push(r(0, MAIN_Y, LEFT_W, MAIN_H, 'LP/Bg', P.panel));
  ch.push(r(0, MAIN_Y, LEFT_W, 28, 'LP/HBg', P.secBg, 1, P.border, 1));
  ch.push(t(8, MAIN_Y+7, LEFT_W-16, 14, 'LP/HTitle', 'Explorer', 12, 600, P.text, 'left'));
  ch.push(r(8, MAIN_Y+36, LEFT_W-16, 24, 'LP/Srch', P.inputBg, 1, P.border, 1));
  ch.push(t(14, MAIN_Y+42, LEFT_W-28, 12, 'LP/SrchT', 'Search...', 11, 400, P.muted, 'left'));

  let ly = MAIN_Y + 68;
  const tree = [
    { label:'Current State (AS-IS)', dot:'#0284C7', expanded:true },
    { label:'  Components  (14)',      dot:C.AC,      expanded:false, indent:true },
    { label:'  Connections  (38)',     dot:C.CONN,    expanded:false, indent:true },
    { label:'  Catalogs  (5)',         dot:'#DC2626', expanded:false, indent:true },
    { label:'  Diagrams  (6)',         dot:'#0891B2', expanded:false, indent:true },
    { label:'AS-IS → TO-BE',          dot:'#D97706', expanded:false },
    { label:'ERP-Rollout (Project)',   dot:'#7C3AED', expanded:false },
  ];
  tree.forEach((n, i) => {
    const indent = n.indent ? 18 : 4;
    ch.push(t(indent, ly+3, 12, 13, `LP/TArr${i}`, n.expanded ? '▼' : '▶', 9, 700, P.muted, 'center'));
    ch.push(r(indent+12, ly+7, 7, 7, `LP/TDot${i}`, n.dot));
    ch.push(t(indent+22, ly+3, LEFT_W-indent-30, 13, `LP/TLbl${i}`, n.label.trim(), 11, 400, P.text, 'left'));
    ly += 22;
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // SHAPE PALETTE — REQ-144: collapsible, viewpoint-filtered
  // ══════════════════════════════════════════════════════════════════════════════
  ch.push(r(PALETTE_X, MAIN_Y, PALETTE_W, MAIN_H, 'PAL/Bg', P.panelAlt));

  // Palette header with collapse toggle
  ch.push(r(PALETTE_X, MAIN_Y, PALETTE_W, 28, 'PAL/HBg', P.secBg, 1, P.border, 1));
  ch.push(t(PALETTE_X+8, MAIN_Y+7, PALETTE_W-40, 14, 'PAL/HTitle', 'Shape Palette', 11, 600, P.text, 'left'));
  ch.push(r(PALETTE_X+PALETTE_W-28, MAIN_Y+5, 22, 18, 'PAL/HideBtn', P.inputBg, 1, P.border, 1));
  ch.push(t(PALETTE_X+PALETTE_W-28, MAIN_Y+7, 22, 14, 'PAL/HideBtnT', '◀', 10, 500, P.muted, 'center'));

  // Active viewpoint filter badge
  ch.push(r(PALETTE_X, MAIN_Y+28, PALETTE_W, 26, 'PAL/VPBg', P.secBg, 1, P.border, 1));
  ch.push(t(PALETTE_X+4, MAIN_Y+30, 40, 11, 'PAL/VPLbl', 'Viewpoint:', 9, 400, P.muted, 'left'));
  ch.push(r(PALETTE_X+46, MAIN_Y+31, PALETTE_W-54, 18, 'PAL/VPTag', P.selBg, 1, P.primary, 1));
  ch.push(t(PALETTE_X+50, MAIN_Y+34, PALETTE_W-58, 11, 'PAL/VPTagT', 'free-form (all)', 9, 500, P.primary, 'left'));

  let py = 54; // palette-local y (rel. to MAIN_Y)

  // Shape palette sections per ArchiMate layer
  const palSections = [
    { label:'Application Layer', dot:C.AC, expanded:true,
      items:[{abbr:'AC',label:'Application Component',col:C.AC},
             {abbr:'AS',label:'Application Service',col:C.AS},
             {abbr:'AI',label:'Application Interface',col:C.AS},
             {abbr:'AF',label:'Application Function',col:C.AC},
             {abbr:'AP',label:'Application Process',col:C.AC}] },
    { label:'Technology Layer', dot:C.TB, expanded:false, items:[] },
    { label:'Business Layer',   dot:'#059669', expanded:false, items:[] },
    { label:'Motivation',       dot:'#DC2626', expanded:false, items:[] },
  ];

  palSections.forEach((sec, si) => {
    pR(0, py, PALETTE_W, 22, `PAL/S${si}Bg`, P.secBg);
    pT(4, py+4, 12, 13, `PAL/S${si}Arr`, sec.expanded ? '▼' : '▶', 9, 700, P.muted, 'center');
    pR(16, py+7, 7, 7, `PAL/S${si}Dot`, sec.dot);
    pT(26, py+4, PALETTE_W-34, 13, `PAL/S${si}Lbl`, sec.label, 10, 600, sec.expanded ? P.text : P.muted, 'left');
    py += 22;
    if (sec.expanded) {
      sec.items.forEach((item, ii) => {
        // Mini shape card — draggable
        pR(6, py+2, PALETTE_W-12, 28, `PAL/I${si}${ii}Card`, P.panel, 1, P.border, 1);
        pR(10, py+6, 22, 18, `PAL/I${si}${ii}Bg`, item.col, 0.12);
        pR(10, py+8, 10, 12, `PAL/I${si}${ii}Bdg`, item.col);
        pT(10, py+9, 10, 9, `PAL/I${si}${ii}BT`, item.abbr, 6, 700, '#FFFFFF', 'center');
        pT(34, py+8, PALETTE_W-42, 13, `PAL/I${si}${ii}Name`, item.label, 9, 400, P.text, 'left');
        py += 30;
      });
      py += 2;
    }
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // CENTER SECTION — Diagram Toolbar + Canvas
  // ══════════════════════════════════════════════════════════════════════════════

  // Diagram toolbar (inside center section, above canvas)
  ch.push(r(PALETTE_X+PALETTE_W+DIV_W, MAIN_Y, CANVAS_W, DIAG_TOOL_H, 'DT/Bg', P.panel, 1, P.border, 1));
  [['▷ Select',0,true],['⌒ Connect',68,false],['✋ Pan',138,false]].forEach(([lbl,dx,active]) => {
    ch.push(r(CANVAS_X+4+dx, MAIN_Y+5, 62, 24, `DT/T${dx}Bg`,
      active ? P.selBg : P.inputBg, 1, active ? P.primary : P.border, 1));
    ch.push(t(CANVAS_X+4+dx, MAIN_Y+10, 62, 14, `DT/T${dx}Lbl`,
      lbl, 10, active ? 600 : 400, active ? P.primary : P.muted, 'center'));
  });
  ch.push(r(CANVAS_X+208, MAIN_Y+8, 1, 18, 'DT/Sep1', P.border));
  ch.push(r(CANVAS_X+216, MAIN_Y+5, 56, 24, 'DT/Shape', P.inputBg, 1, P.border, 1));
  ch.push(t(CANVAS_X+216, MAIN_Y+10, 56, 14, 'DT/ShapeT', '+ Shape', 10, 400, P.muted, 'center'));
  ch.push(r(CANVAS_X+280, MAIN_Y+8, 1, 18, 'DT/Sep2', P.border));
  ch.push(r(CANVAS_X+288, MAIN_Y+5, 44, 24, 'DT/Grid', P.inputBg, 1, P.border, 1));
  ch.push(t(CANVAS_X+288, MAIN_Y+10, 44, 14, 'DT/GridT', '⊞ Grid', 10, 400, P.muted, 'center'));
  ch.push(r(CANVAS_X+338, MAIN_Y+5, 40, 24, 'DT/Snap', P.inputBg, 1, P.border, 1));
  ch.push(t(CANVAS_X+338, MAIN_Y+10, 40, 14, 'DT/SnapT', '⊡ Snap', 10, 400, P.muted, 'center'));
  ch.push(r(CANVAS_X+386, MAIN_Y+8, 1, 18, 'DT/Sep3', P.border));
  ch.push(r(CANVAS_X+394, MAIN_Y+5, 68, 24, 'DT/ZoomBg', P.inputBg, 1, P.border, 1));
  ch.push(t(CANVAS_X+396, MAIN_Y+10, 12, 14, 'DT/ZMin', '−', 11, 400, P.muted, 'center'));
  ch.push(t(CANVAS_X+410, MAIN_Y+10, 36, 14, 'DT/ZVal', '75%', 11, 500, P.text, 'center'));
  ch.push(t(CANVAS_X+448, MAIN_Y+10, 12, 14, 'DT/ZPls', '+', 11, 400, P.muted, 'center'));

  // Canvas background
  ch.push(r(CANVAS_X, CANVAS_Y, CANVAS_W, MAIN_H - DIAG_TOOL_H, 'CV/Bg', P.canvas));

  // Canvas grid (20px spacing)
  const GRID_SZ = 20;
  const CANVAS_H = MAIN_H - DIAG_TOOL_H;
  const GA = m === 'Dark' ? 0.45 : 0.28;
  for (let gx = 0; gx <= CANVAS_W; gx += GRID_SZ)
    cR(gx, 0, 1, CANVAS_H, `CV/GV${gx}`, P.grid, GA);
  for (let gy = 0; gy <= CANVAS_H; gy += GRID_SZ)
    cR(0, gy, CANVAS_W, 1, `CV/GH${gy}`, P.grid, GA);

  // ── Connection lines (drawn before shapes) ──
  //
  // Shape layout (canvas-local, 0=canvas top-left):
  //   S1 Portal-Frontend [AC]:   (186, 20,  160, 60)  Presentation
  //   S2 REST-API Facade [AS]:   ( 14, 140, 140, 60)  Application
  //   S3 Catalog-Service [AC]:   (186, 140, 160, 60)  Application  ← SELECTED
  //   S4 Auth-Service [AC]:      (378, 140, 140, 60)  Application
  //   S5 PostgreSQL-DB [TB]:     (186, 280, 160, 60)  Data

  // C1: PF (bottom-center) → CS (top-center)  — vertical
  line(265, 80, 2, 60, 'C1/V');
  arr(260, 132, 12, 12, 'C1/Arr', '▼');

  // C2: PF (left mid) → REST-API (top)  — L-shape
  line( 84, 49, 102, 2, 'C2/H');  // H: x=84→186 at y=50
  line( 83, 49,   2, 91, 'C2/V'); // V: down to REST top (y=140)
  arr(78, 132, 12, 12, 'C2/Arr', '▼');
  cLbl(20, 86, 80, 'C2/Lbl', 'accesses');

  // C3: REST-API (right) → CS (left)  — horizontal
  line(154, 169, 32, 2, 'C3/H');
  arr(181, 163, 12, 12, 'C3/Arr', '►');
  cLbl(144, 157, 54, 'C3/Lbl', 'delegates');

  // C4: CS (right) → Auth (left)  — horizontal
  line(346, 169, 32, 2, 'C4/H');
  arr(373, 163, 12, 12, 'C4/Arr', '►');
  cLbl(334, 157, 54, 'C4/Lbl', 'auth');

  // C5: CS (bottom-center) → DB (top-center)  — vertical
  line(265, 200, 2, 80, 'C5/V');
  arr(260, 272, 12, 12, 'C5/Arr', '▼');
  cLbl(274, 232, 96, 'C5/Lbl', 'reads / writes');

  // ── ArchiMate shapes (on top of connection lines) ──
  box(186,  20, 160, 60, 'S1', 'AC', 'ApplicationComponent', 'Portal-Frontend',   false);
  box( 14, 140, 140, 60, 'S2', 'AS', 'ApplicationService',   'REST-API (Facade)', false);
  box(186, 140, 160, 60, 'S3', 'AC', 'ApplicationComponent', 'Catalog-Service',   true);
  box(378, 140, 140, 60, 'S4', 'AC', 'ApplicationComponent', 'Auth-Service',      false);
  box(186, 280, 160, 60, 'S5', 'TB', 'TechnologyService',    'PostgreSQL-DB',     false);

  // ── Entity Lookup / Drop Dialog — REQ-145 ──
  // Appears inline on canvas after drag-drop of a new [AC] shape
  const DX = 132, DY = 54, DW = 218, DH = 124;
  // Shadow (offset rect)
  cR(DX+3, DY+3, DW, DH, 'DLG/Shadow', P.muted, 0.18);
  cR(DX, DY, DW, DH, 'DLG/Bg', P.overlay, 1, P.primary, 1.5);
  // Header
  cR(DX, DY, DW, 24, 'DLG/HBg', P.selBg, 1, P.primary, 1.5);
  cR(DX+4, DY+6, 12, 12, 'DLG/HBdg', C.AC);
  cT(DX+4, DY+7, 12, 9, 'DLG/HBT', 'AC', 6, 700, '#FFFFFF', 'center');
  cT(DX+20, DY+7, DW-48, 11, 'DLG/HTitle', 'Insert or Create Entity', 10, 600, P.primary, 'left');
  cT(DX+DW-18, DY+7, 14, 11, 'DLG/HClose', '×', 12, 600, P.muted, 'center');
  // Input field with typed text
  cT(DX+6, DY+30, DW-12, 11, 'DLG/InputLbl', 'Name this ApplicationComponent', 9, 400, P.muted, 'left');
  cR(DX+6, DY+42, DW-12, 22, 'DLG/InputBg', P.inputBg, 1, P.primary, 1.5);
  cT(DX+10, DY+47, DW-20, 11, 'DLG/InputVal', 'New-Reporting-Svc', 11, 400, P.text, 'left');
  // Autocomplete dropdown (shows existing entities)
  cR(DX+6, DY+64, DW-12, 18, 'DLG/AC1Bg', P.selBg, 1, P.border, 1);
  cR(DX+8, DY+68, 8, 8, 'DLG/AC1Bdg', C.AC);
  cT(DX+20, DY+67, DW-54, 11, 'DLG/AC1Name', 'Reporting-Engine', 10, 400, P.text, 'left');
  cT(DX+DW-36, DY+67, 30, 11, 'DLG/AC1Tag', 'existing', 8, 500, '#059669', 'right');
  cR(DX+6, DY+82, DW-12, 18, 'DLG/AC2Bg', P.panelAlt, 1, P.border, 1);
  cR(DX+8, DY+86, 8, 8, 'DLG/AC2Bdg', C.AC);
  cT(DX+20, DY+85, DW-54, 11, 'DLG/AC2Name', 'New-Reporting-Svc', 10, 500, P.primary, 'left');
  cT(DX+DW-36, DY+85, 30, 11, 'DLG/AC2Tag', 'new', 8, 500, P.primary, 'right');
  // OK / Cancel buttons
  cR(DX+DW-96, DY+104, 42, 18, 'DLG/BtnCancel', P.inputBg, 1, P.border, 1);
  cT(DX+DW-96, DY+107, 42, 12, 'DLG/BtnCancelT', 'Cancel', 10, 400, P.muted, 'center');
  cR(DX+DW-48, DY+104, 42, 18, 'DLG/BtnOK', P.primary);
  cT(DX+DW-48, DY+107, 42, 12, 'DLG/BtnOKT', 'OK', 10, 600, '#FFFFFF', 'center');

  // ── Context Menu — REQ-146: Remove from Diagram vs. Delete Entity ──
  // Appears on right-click on Auth-Service (canvas-local: 378, 140)
  const MX = 348, MY = 155, MW = 188, MH = 96;
  cR(MX+3, MY+3, MW, MH, 'CTX/Shadow', P.muted, 0.18);
  cR(MX, MY, MW, MH, 'CTX/Bg', P.overlay, 1, P.border, 1);
  // Menu items
  [
    { label:'Edit Properties',         shortcut:'',         y:0,  sep:false, warn:false },
    { label:'Add Connection',           shortcut:'',         y:20, sep:false, warn:false },
    { label:'──────────────────',       shortcut:'',         y:40, sep:true,  warn:false },
    { label:'Remove from Diagram',      shortcut:'DEL',      y:52, sep:false, warn:false },
    { label:'Delete Entity',            shortcut:'Ctrl+DEL', y:72, sep:false, warn:true  },
  ].forEach((item, i) => {
    if (item.sep) {
      cR(MX+4, MY+item.y+4, MW-8, 1, `CTX/Sep${i}`, P.border);
      return;
    }
    if (item.warn) {
      cR(MX, MY+item.y, MW, 20, `CTX/Item${i}Bg`, P.warnBg, 0.5);
      cT(MX+8, MY+item.y+4, MW-60, 12, `CTX/Item${i}Lbl`, item.label, 10, 600, P.warnText, 'left');
    } else {
      cT(MX+8, MY+item.y+4, MW-60, 12, `CTX/Item${i}Lbl`, item.label, 10, 400, P.text, 'left');
    }
    if (item.shortcut)
      cT(MX+MW-60, MY+item.y+4, 56, 12, `CTX/Item${i}SC`, item.shortcut, 9, 400, P.muted, 'right');
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // RIGHT PANEL — Shape Properties (selected: Catalog-Service)
  // ══════════════════════════════════════════════════════════════════════════════
  const pw  = RIGHT_W - 16;
  const pxb = RIGHT_X + 8;

  ch.push(r(RIGHT_X, MAIN_Y, RIGHT_W, MAIN_H, 'RP/Bg', P.panel));
  ch.push(r(RIGHT_X, MAIN_Y, RIGHT_W, 28, 'RP/TabBg', P.secBg, 1, P.border, 1));
  ch.push(r(RIGHT_X, MAIN_Y, 100, 28, 'RP/TabA', P.panel, 1, P.border, 1));
  ch.push(t(RIGHT_X, MAIN_Y+6, 100, 16, 'RP/TabAT', 'Properties', 12, 600, P.primary, 'center'));
  ch.push(t(RIGHT_X+100, MAIN_Y+6, 80, 16, 'RP/TabBT', 'Relations', 12, 400, P.muted, 'center'));
  ch.push(t(RIGHT_X+180, MAIN_Y+6, 72, 16, 'RP/TabCT', 'Diagram',   12, 400, P.muted, 'center'));

  let rpy = MAIN_Y + 36;
  const sec = (k, l) => {
    ch.push(r(RIGHT_X, rpy, RIGHT_W, 20, `RP/${k}Sec`, P.secBg));
    ch.push(t(pxb, rpy+3, pw, 12, `RP/${k}SLbl`, l, 10, 600, P.muted, 'left'));
    rpy += 20;
  };
  const fld = (k, l, v) => {
    ch.push(t(pxb, rpy+1, pw, 11, `RP/${k}FLbl`, l, 9, 500, P.muted, 'left')); rpy += 12;
    ch.push(r(pxb, rpy, pw, 22, `RP/${k}FBg`, P.inputBg, 1, P.border, 1));
    ch.push(t(pxb+4, rpy+4, pw-8, 13, `RP/${k}FVal`, v, 11, 400, P.text, 'left')); rpy += 26;
  };

  sec('Gen', 'General');
  ch.push(t(pxb, rpy+2, 20, 11, 'RP/IDLbl', 'ID', 9, 600, P.muted, 'left'));
  ch.push(t(pxb+24, rpy+2, pw-60, 11, 'RP/IDVal', '#AC-2847', 10, 400, P.muted, 'left'));
  ch.push(t(pxb+pw-34, rpy+2, 34, 10, 'RP/IDRo', '(system)', 8, 400, P.muted, 'right'));
  rpy += 18;
  fld('Name', 'Name', 'Catalog-Service');

  ch.push(t(pxb, rpy+1, pw, 11, 'RP/TypeLbl', 'Type', 9, 500, P.muted, 'left')); rpy += 12;
  ch.push(r(pxb, rpy, pw, 22, 'RP/TypeF', P.inputBg, 1, P.border, 1));
  ch.push(r(pxb+4, rpy+5, 14, 12, 'RP/TypeBdg', C.AC));
  ch.push(t(pxb+4, rpy+5, 14, 10, 'RP/TypeBT', 'AC', 7, 700, '#FFFFFF', 'center'));
  ch.push(t(pxb+22, rpy+4, pw-28, 13, 'RP/TypeVal', 'ApplicationComponent', 11, 400, P.text, 'left'));
  rpy += 26;

  ch.push(r(pxb, rpy+2, 16, 16, 'RP/LogBox', P.primary, 1, P.primary, 1));
  ch.push(t(pxb+1, rpy+3, 14, 12, 'RP/LogChk', '✓', 9, 700, '#FFFFFF', 'center'));
  ch.push(t(pxb+22, rpy+3, pw-22, 12, 'RP/LogLbl', 'Logical  (conceptual)', 10, 400, P.text, 'left'));
  rpy += 22 + 4;

  sec('Dia', 'Diagram Position & Size');
  const hw = Math.floor((pw - 6) / 2);
  ch.push(t(pxb, rpy+1, pw, 11, 'RP/PosLbl', 'X / Y', 9, 500, P.muted, 'left')); rpy += 12;
  ch.push(r(pxb,      rpy, hw, 22, 'RP/PosXF', P.inputBg, 1, P.border, 1));
  ch.push(t(pxb+4,    rpy+4, 14, 13, 'RP/PosXL', 'X', 10, 600, P.muted, 'left'));
  ch.push(t(pxb+18,   rpy+4, hw-20, 13, 'RP/PosXV', '186', 11, 400, P.text, 'left'));
  ch.push(r(pxb+hw+6, rpy, hw, 22, 'RP/PosYF', P.inputBg, 1, P.border, 1));
  ch.push(t(pxb+hw+10,rpy+4, 14, 13, 'RP/PosYL', 'Y', 10, 600, P.muted, 'left'));
  ch.push(t(pxb+hw+24,rpy+4, hw-20, 13, 'RP/PosYV', '140', 11, 400, P.text, 'left'));
  rpy += 26 + 4;

  sec('Cls', 'Classification');
  fld('Layer', 'Layer', 'Application');
  ch.push(t(pxb, rpy+1, pw, 11, 'RP/StLbl', 'Status', 9, 500, P.muted, 'left')); rpy += 12;
  ch.push(r(pxb, rpy, 66, 22, 'RP/StBg', '#D1FAE5', 1, '#059669', 1));
  ch.push(t(pxb+4, rpy+4, 58, 13, 'RP/StVal', 'active', 11, 500, '#059669', 'left'));
  rpy += 26 + 4;

  sec('Desc', 'Description');
  ch.push(r(pxb, rpy, pw, 40, 'RP/DescF', P.inputBg, 1, P.border, 1));
  ch.push(t(pxb+4, rpy+4, pw-8, 32, 'RP/DescV',
    'Core component. Manages catalog browsing and filter logic.', 10, 400, P.muted, 'left'));

  // ══════════════════════════════════════════════════════════════════════════════
  // BOTTOM PANEL — Validation
  // ══════════════════════════════════════════════════════════════════════════════
  ch.push(r(0, BOTTOM_Y, FW, BOTTOM_H, 'Bot/Bg', P.panel, 1, P.border, 1));
  ch.push(r(0, BOTTOM_Y, FW, 28, 'Bot/TabBg', P.secBg, 1, P.border, 1));
  ch.push(r(0, BOTTOM_Y, 96, 28, 'Bot/TabA', P.panel, 1, P.border, 1));
  ch.push(t(0, BOTTOM_Y+6, 96, 16, 'Bot/TabAT', 'Validation', 12, 600, P.primary, 'center'));
  ch.push(t(104, BOTTOM_Y+6, 60, 16, 'Bot/TabBT', 'Output', 12, 400, P.muted, 'left'));
  ch.push(t(8, BOTTOM_Y+38, 500, 14, 'Bot/OK',
    '✓  No issues  ·  5 shapes  ·  5 connections  ·  0 warnings', 11, 400, '#059669', 'left'));
  [
    '[INFO]   Diagram «OEA Architecture Overview» loaded  ·  UC-05  ·  AS-IS Plateau',
    '[INFO]   Shape Palette: 5 allowed types (Viewpoint: free-form)',
    '[INFO]   5 connections validated  ·  Last saved: 14:32:01',
  ].forEach((l, i) =>
    ch.push(t(8, BOTTOM_Y+58+i*18, FW-16, 12, `Bot/L${i}`, l, 10, 400, P.muted, 'left')));

  // ── STATUS BAR ──
  ch.push(r(0, STATUS_Y, FW, STATUS_H, 'St/Bg', P.menuBg));
  ch.push(t(8, STATUS_Y+6, 480, 12, 'St/L',
    'Diagram Editor  ·  OEA Architecture Overview  ·  AS-IS  ·  5 shapes, 5 connections', 10, 400, P.statusText, 'left'));
  ch.push(t(FW-192, STATUS_Y+6, 184, 12, 'St/R',
    'Connected  ·  OEA Server 0.1.0-SNAPSHOT', 10, 400, P.statusText, 'right'));

  return { frameId, changes: ch };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const outDir    = path.join(__dirname, '..', '..', 'docs', 'screens');
  const hasPenpot = !!(process.env.PENPOT_API_URL && process.env.PENPOT_ACCESS_TOKEN && process.env.PENPOT_PROJECT_ID);
  const pid       = '00000000-0000-0000-0000-000000000001';
  const modes     = [{ row:0, P:L, m:'Light' }, { row:1, P:D, m:'Dark' }];

  if (hasPenpot) {
    const PID = process.env.PENPOT_PROJECT_ID;
    const API = process.env.PENPOT_API_URL;
    try {
      const profile = await rpc('get-profile', {});
      console.log(`Penpot: ${profile.email}`);
      const projectFiles = await rpc('get-project-files', { project_id: PID });
      for (const f of projectFiles.filter(f => f.name && f.name.includes('Diagram Editor')))
        await rpc('delete-file', { id: f.id });
      const f = await rpc('create-file', { name: 'OEA - Diagram Editor v0.2', project_id: PID });
      const fileId = f.id, pageId = f.data.pages[0];
      const allChanges = [];
      for (const { row, m } of modes)
        allChanges.push(canvasText(pageId, -160, sy(row) + FH/2 - 10, 150, 20,
          `Lbl${m}`, `${m} Mode`, 13, 600, '#64748B', 'right'));
      for (const { row, P, m } of modes) {
        const { changes } = screen(pageId, row, P, m);
        allChanges.push(...changes);
      }
      await rpc('update-file', { id: fileId, 'session-id': fileId, revn: 0, vern: 0, changes: allChanges });
      console.log(`Penpot: ${allChanges.length} shapes uploaded`);
      console.log(`URL: ${API}dashboard/projects/${PID}`);
    } catch(e) {
      console.warn(`Penpot upload failed: ${e.message}`);
    }
  } else {
    console.log('(Penpot upload skipped — ENV vars not set)');
  }

  console.log('\nSVG export ...');
  for (const { row, P, m } of modes) {
    const { changes } = screen(pid, row, P, m);
    const outPath = path.join(outDir, `diagram-editor-${m.toLowerCase()}.svg`);
    generateLocalSVG(changes[0], changes.slice(1), outPath);
    console.log(`  diagram-editor-${m.toLowerCase()}.svg`);
  }
  console.log(`\nSVGs: docs/screens/`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
