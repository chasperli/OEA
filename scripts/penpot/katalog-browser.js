#!/usr/bin/env node
/**
 * OEA Catalog Browser (SCR-020) — Walking Skeleton Screen
 * Light + Dark mode on one Penpot page (stacked vertically).
 * UC-06: Architecture Catalog — create, configure and use
 *
 * Inline column filters (REQ-143): always AND-combined, one input per column.
 * "+ Filter" button: opens complex filter builder (AND/OR, REQ-047).
 *
 * Run (local, no Penpot):
 *   node scripts/penpot/katalog-browser.js
 *
 * Run (with Penpot upload):
 *   NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/penpot/katalog-browser.js
 */
const fs   = require('fs');
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280, FH=800, GAP=100;
const sy = row => row * (FH + GAP);

// ── Layout (identical to hauptfenster.js) ─────────────────────────────────────
const MENU_H=28, TOOL_H=36, MAIN_Y=64, MAIN_H=520;
const LEFT_W=260, DIV_W=4, CENTER_W=716, RIGHT_W=296;
const CENTER_X=LEFT_W+DIV_W;
const RIGHT_X=CENTER_X+CENTER_W+DIV_W;
const BOTTOM_Y=MAIN_Y+MAIN_H;
const BOTTOM_H=192, STATUS_Y=776, STATUS_H=24;

// ── Palettes (identical to hauptfenster.js) ───────────────────────────────────
const L = {
  bg:'#F1F5F9', panel:'#FFFFFF', panelAlt:'#F8FAFC',
  menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC',
  selBg:'#E0F2FE', secBg:'#F1F5F9', statusText:'#94A3B8',
  tagBg:'#BAE6FD', rowAlt:'#F8FAFC',
};
const D = {
  bg:'#0F172A', panel:'#1E293B', panelAlt:'#172030',
  menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0B1829',
  selBg:'#0C4A6E', secBg:'#162030', statusText:'#64748B',
  tagBg:'#0C4A6E', rowAlt:'#162030',
};

// ArchiMate badge colors
const C = { AC:'#2563EB', AS:'#0284C7', KAT:'#DC2626', DIA:'#0891B2' };

// Status colors + badge backgrounds
const STATUS = {
  active:     { color:'#059669', bgL:'#D1FAE5', bgD:'#064E3B' },
  inactive:   { color:'#DC2626', bgL:'#FEE2E2', bgD:'#7F1D1D' },
  'in-review':{ color:'#D97706', bgL:'#FEF3C7', bgD:'#78350F' },
  deprecated: { color:'#94A3B8', bgL:'#F1F5F9', bgD:'#1E293B' },
};

// ── Screen builder ────────────────────────────────────────────────────────────
function screen(pid, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, 0, sy(row), FW, FH, `${m}/CatalogBrowser`);
  const ch = [change];
  const isDark = m === 'Dark';

  // ── MENU BAR ──
  ch.push(r(0,0,FW,MENU_H,'MenuBg',P.menuBg));
  [['File',8],['Edit',54],['View',100],['Model',148],['Tools',200],['Help',248]].forEach(([l,x]) =>
    ch.push(t(x,6,50,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-112,6,104,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR — Breadcrumb ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,60,14,'TBcKat','Catalogs',12,400,P.muted,'left'));
  ch.push(t(70,MENU_H+11,12,14,'TBcSep','›',12,400,P.muted,'center'));
  ch.push(t(84,MENU_H+11,200,14,'TBcTitle','Application Inventory',12,600,P.text,'left'));
  ch.push(t(FW-208,MENU_H+11,62,14,'PlLbl','Plateau:',12,500,P.muted,'right'));
  ch.push(r(FW-140,MENU_H+6,132,24,'PlDd',P.inputBg,1,P.border,1));
  ch.push(t(FW-135,MENU_H+12,98,14,'PlVal','AS-IS (current)',12,500,P.text,'left'));
  ch.push(t(FW-24,MENU_H+12,16,14,'PlArr','▾',11,400,P.muted,'center'));

  // ── DIVIDERS ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,MAIN_H,'DivLC',P.border));
  ch.push(r(RIGHT_X-DIV_W,MAIN_Y,DIV_W,MAIN_H,'DivCR',P.border));

  // ══════════════════════════════════════════════════════════════════════════════
  // LEFT PANEL — Explorer (catalog focus)
  // ══════════════════════════════════════════════════════════════════════════════
  ch.push(r(0,MAIN_Y,LEFT_W,MAIN_H,'LP/Bg',P.panel));
  // Simple header — no Diagrams tab
  ch.push(r(0,MAIN_Y,LEFT_W,28,'LP/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+7,LEFT_W-16,14,'LP/HTitle','Explorer',12,600,P.text,'left'));

  ch.push(r(8,MAIN_Y+36,LEFT_W-16,26,'LP/Srch',P.inputBg,1,P.border,1));
  ch.push(t(14,MAIN_Y+42,LEFT_W-28,14,'LP/SrchT','Search ...',12,400,P.muted,'left'));

  let ty=MAIN_Y+70;

  // Catalogs section (expanded)
  ch.push(r(0,ty,LEFT_W,22,'LP/KatHBg',P.secBg));
  ch.push(t(4,ty+3,12,14,'LP/KatArr','▼',9,700,P.muted,'center'));
  ch.push(r(16,ty+7,8,8,'LP/KatDot',C.KAT));
  ch.push(t(28,ty+3,LEFT_W-36,14,'LP/KatLbl','Catalogs  (5)',11,600,P.text,'left'));
  ty+=22;

  const catalogs = [
    'Application Inventory',
    'Compliance Overview',
    'Data Lineage View',
    'Executive Dashboard',
    'Domain View Finance',
  ];
  catalogs.forEach((name,i) => {
    const sel = i===0;
    if(sel) ch.push(r(0,ty,LEFT_W,24,`LP/KSel${i}`,P.selBg));
    ch.push(r(18,ty+5,12,12,`LP/KIBg${i}`,C.KAT));
    ch.push(t(18,ty+6,12,9,`LP/KIT${i}`,'KT',7,700,'#FFFFFF','center'));
    ch.push(t(34,ty+5,LEFT_W-42,14,`LP/KLbl${i}`,name,11,sel?600:400,sel?P.primary:P.text,'left'));
    ty+=24;
  });
  ty+=6;

  // Architecture Elements section (collapsed)
  ch.push(r(0,ty,LEFT_W,22,'LP/AEBg',P.secBg));
  ch.push(t(4,ty+3,12,14,'LP/AEArr','▶',9,700,P.muted,'center'));
  ch.push(r(16,ty+7,8,8,'LP/AEDot',C.AC));
  ch.push(t(28,ty+3,LEFT_W-36,14,'LP/AELbl','Architecture Elements',11,600,P.muted,'left'));
  ty+=22;

  // Diagrams section (collapsed — groups remain in explorer)
  ch.push(r(0,ty,LEFT_W,22,'LP/DIBg',P.secBg));
  ch.push(t(4,ty+3,12,14,'LP/DIArr','▶',9,700,P.muted,'center'));
  ch.push(r(16,ty+7,8,8,'LP/DIDot',C.DIA));
  ch.push(t(28,ty+3,LEFT_W-36,14,'LP/DILbl','Diagrams',11,600,P.muted,'left'));

  // ══════════════════════════════════════════════════════════════════════════════
  // CENTER PANEL — Catalog table view (UC-06 main flow step 12)
  // ══════════════════════════════════════════════════════════════════════════════
  const cx=CENTER_X, cw=CENTER_W;
  ch.push(r(cx,MAIN_Y,cw,MAIN_H,'CP/Bg',P.panelAlt));

  // Catalog title row
  const TITLE_H=36;
  ch.push(r(cx,MAIN_Y,cw,TITLE_H,'CP/HBg',P.panel,1,P.border,1));
  ch.push(r(cx+8,MAIN_Y+10,14,14,'CP/HIBg',C.KAT));
  ch.push(t(cx+8,MAIN_Y+11,14,10,'CP/HIT','KT',7,700,'#FFFFFF','center'));
  ch.push(t(cx+26,MAIN_Y+10,220,16,'CP/HTitle','Application Inventory',13,700,P.text,'left'));
  ch.push(t(cx+252,MAIN_Y+12,200,12,'CP/HDesc','ApplicationComponent · scope: instance',10,400,P.muted,'left'));
  ch.push(r(cx+cw-158,MAIN_Y+8,74,20,'CP/BtnCfg',P.inputBg,1,P.border,1));
  ch.push(t(cx+cw-158,MAIN_Y+12,74,14,'CP/BtnCfgT','⚙ Configure',10,500,P.muted,'center'));
  ch.push(r(cx+cw-78,MAIN_Y+8,70,20,'CP/BtnNew',P.primary));
  ch.push(t(cx+cw-78,MAIN_Y+12,70,14,'CP/BtnNewT','+ New',11,600,'#FFFFFF','center'));

  // View / SavedFilter bar
  const FILTER_H=34;
  const fy=MAIN_Y+TITLE_H;
  ch.push(r(cx,fy,cw,FILTER_H,'CP/FBg',P.secBg,1,P.border,1));
  // Saved view dropdown
  ch.push(r(cx+8,fy+7,128,20,'CP/FVDd',P.panel,1,P.border,1));
  ch.push(t(cx+12,fy+11,100,12,'CP/FVVal','Compact View',10,500,P.text,'left'));
  ch.push(t(cx+130,fy+11,8,12,'CP/FVArr','▾',10,400,P.muted,'center'));
  // Active saved filter tag
  ch.push(r(cx+144,fy+7,124,20,'CP/FTag',P.tagBg,1,P.primary,1));
  ch.push(t(cx+148,fy+11,110,12,'CP/FTagT','Active systems only  ×',10,500,P.primary,'left'));
  // + Filter button → opens OR/complex query builder (REQ-047)
  ch.push(r(cx+274,fy+7,68,20,'CP/FAdd',P.inputBg,1,P.border,1));
  ch.push(t(cx+274,fy+11,68,12,'CP/FAddT','+ Filter (OR)',10,400,P.muted,'center'));
  // Table search
  ch.push(r(cx+350,fy+7,150,20,'CP/FSrch',P.inputBg,1,P.border,1));
  ch.push(t(cx+354,fy+11,142,12,'CP/FSrchT','Search ...',10,400,P.muted,'left'));
  // Join mode
  ch.push(t(cx+cw-154,fy+11,60,12,'CP/JLbl','Interfaces:',10,400,P.muted,'left'));
  ch.push(r(cx+cw-90,fy+7,82,20,'CP/JDd',P.panel,1,P.border,1));
  ch.push(t(cx+cw-86,fy+11,62,12,'CP/JVal','Aggregate',10,500,P.text,'left'));
  ch.push(t(cx+cw-14,fy+11,8,12,'CP/JArr','▾',10,400,P.muted,'center'));

  // Column definitions
  const cols=[
    { key:'Name',    label:'Name ↑',    x:8,   w:186, ph:'Filter name...'   },
    { key:'Status',  label:'Status',    x:198, w:74,  ph:'All statuses'     },
    { key:'Type',    label:'Type',      x:276, w:138, ph:'Filter type...'   },
    { key:'Layer',   label:'Layer',     x:418, w:88,  ph:'All layers'       },
    { key:'Ifaces',  label:'Interfaces',x:510, w:96,  ph:'e.g. > 3'         },
    { key:'Created', label:'Created',   x:610, w:80,  ph:'e.g. 2025'        },
  ];

  // Column headers
  const COL_H=30;
  const hy=fy+FILTER_H;
  ch.push(r(cx,hy,cw,COL_H,'CP/CHBg',P.panel,1,P.border,1));
  cols.forEach(c => {
    if(c.x>8) ch.push(r(cx+c.x-4,hy+8,1,14,`CP/CD${c.key}`,P.border));
    ch.push(t(cx+c.x,hy+9,c.w,12,`CP/CH${c.key}`,c.label,10,600,P.muted,'left'));
  });

  // ── Inline column filter row (REQ-143) ───────────────────────────────────────
  // Always AND-combined; one quick-filter input per column.
  const IF_H=26;
  const iffy=hy+COL_H;
  ch.push(r(cx,iffy,cw,IF_H,'CP/IFBg',P.secBg,1,P.border,1));
  cols.forEach(c => {
    ch.push(r(cx+c.x,iffy+3,c.w,20,`CP/IF${c.key}`,P.inputBg,1,P.border,1));
    ch.push(t(cx+c.x+3,iffy+7,c.w-6,12,`CP/IFT${c.key}`,c.ph,9,400,P.muted,'left'));
  });
  // AND badge to signal the logic
  ch.push(r(cx+cw-38,iffy+5,32,16,'CP/IFAnd',P.border));
  ch.push(t(cx+cw-38,iffy+7,32,12,'CP/IFAndT','AND',8,700,P.muted,'center'));

  // Entity rows
  const ROW_H=28;
  const entities = [
    { name:'Catalog-Service',   status:'active',     type:'Application Component', layer:'Application',  ifaces:'3',  date:'2026-01', sel:true  },
    { name:'Portal-Frontend',   status:'active',     type:'Application Component', layer:'Presentation', ifaces:'2',  date:'2026-01', sel:false },
    { name:'Auth-Service',      status:'active',     type:'Application Component', layer:'Application',  ifaces:'5',  date:'2025-11', sel:false },
    { name:'Reporting-Engine',  status:'inactive',   type:'Application Component', layer:'Application',  ifaces:'1',  date:'2025-09', sel:false },
    { name:'Legacy-ERP',        status:'active',     type:'Application Component', layer:'Application',  ifaces:'12', date:'2019-03', sel:false },
    { name:'Data-Warehouse',    status:'in-review',  type:'Application Component', layer:'Data',         ifaces:'8',  date:'2023-06', sel:false },
    { name:'API-Gateway',       status:'active',     type:'Application Component', layer:'Application',  ifaces:'15', date:'2024-08', sel:false },
    { name:'Notification-Svc',  status:'active',     type:'Application Component', layer:'Application',  ifaces:'4',  date:'2025-03', sel:false },
    { name:'Identity-Provider', status:'active',     type:'Application Component', layer:'Application',  ifaces:'6',  date:'2024-02', sel:false },
    { name:'File-Storage-Svc',  status:'deprecated', type:'Application Component', layer:'Application',  ifaces:'2',  date:'2022-11', sel:false },
  ];

  const rowsY=iffy+IF_H;
  entities.forEach((ent,i) => {
    const ry=rowsY+i*ROW_H;
    const s=STATUS[ent.status]||STATUS.active;
    const bg = ent.sel ? P.selBg : (i%2===0 ? P.panel : P.rowAlt);
    ch.push(r(cx,ry,cw,ROW_H,`CP/R${i}Bg`,bg,1,P.border,1));
    ch.push(r(cx+8,ry+7,14,14,`CP/R${i}IBg`,C.AC));
    ch.push(t(cx+8,ry+8,14,10,`CP/R${i}IT`,'AC',7,700,'#FFFFFF','center'));
    ch.push(t(cx+26,ry+8,168,14,`CP/R${i}Name`,ent.name,11,ent.sel?600:400,ent.sel?P.primary:P.text,'left'));
    const sBg=isDark?s.bgD:s.bgL;
    ch.push(r(cx+198,ry+8,66,13,`CP/R${i}SBg`,sBg));
    ch.push(t(cx+200,ry+9,62,10,`CP/R${i}SLbl`,ent.status,9,500,s.color,'left'));
    ch.push(t(cx+276,ry+8,134,14,`CP/R${i}Type`,ent.type,10,400,P.text,'left'));
    ch.push(t(cx+418,ry+8,84,14,`CP/R${i}Layer`,ent.layer,10,400,P.muted,'left'));
    ch.push(t(cx+510,ry+8,92,14,`CP/R${i}Ifaces`,ent.ifaces,10,400,P.muted,'center'));
    ch.push(t(cx+610,ry+8,76,14,`CP/R${i}Created`,ent.date,10,400,P.muted,'left'));
  });

  // Pagination
  const pgY=rowsY+entities.length*ROW_H;
  ch.push(r(cx,pgY,cw,30,'CP/PgBg',P.panel,1,P.border,1));
  ch.push(t(cx+8,pgY+9,220,12,'CP/PgInfo','47 entries  ·  1 – 25 of 47',11,400,P.muted,'left'));
  ch.push(t(cx+cw-120,pgY+9,112,12,'CP/PgNav','‹  Page 1  2  ›',11,400,P.text,'right'));

  // ══════════════════════════════════════════════════════════════════════════════
  // RIGHT PANEL — Properties (selected entity: Catalog-Service)
  // ══════════════════════════════════════════════════════════════════════════════
  const pw=RIGHT_W-16, pxb=RIGHT_X+8;
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,28,'RP/TBg',P.secBg,1,P.border,1));
  ch.push(r(RIGHT_X,MAIN_Y,112,28,'RP/TA',P.panel,1,P.border,1));
  ch.push(t(RIGHT_X,MAIN_Y+6,112,16,'RP/TAT','Properties',12,600,P.primary,'center'));
  ch.push(t(RIGHT_X+112,MAIN_Y+6,100,16,'RP/TBT','Relations',12,400,P.muted,'center'));

  let py=MAIN_Y+36;
  const sec=(k,l) => {
    ch.push(r(RIGHT_X,py,RIGHT_W,20,`RP/${k}Bg`,P.secBg));
    ch.push(t(pxb,py+3,pw,13,`RP/${k}Lbl`,l,10,600,P.muted,'left'));
    py+=20;
  };
  const cfld=(k,l,v) => {
    ch.push(t(pxb,py+1,pw,11,`RP/${k}L`,l,9,500,P.muted,'left')); py+=12;
    ch.push(r(pxb,py,pw,22,`RP/${k}F`,P.inputBg,1,P.border,1));
    ch.push(t(pxb+4,py+4,pw-8,13,`RP/${k}V`,v,11,400,P.text,'left')); py+=26;
  };

  sec('SA','General');
  ch.push(t(pxb,py+2,20,11,'RP/IDL','ID',9,600,P.muted,'left'));
  ch.push(t(pxb+24,py+2,pw-60,11,'RP/IDV','#2847',10,400,P.muted,'left'));
  ch.push(t(pxb+pw-32,py+2,32,10,'RP/IDRo','(system)',8,400,P.muted,'right'));
  py+=18;
  cfld('Name','Name','Catalog-Service');
  ch.push(t(pxb,py+1,pw,11,'RP/TypL','Type',9,500,P.muted,'left')); py+=12;
  ch.push(r(pxb,py,pw,22,'RP/TypF',P.inputBg,1,P.border,1));
  ch.push(r(pxb+4,py+5,16,12,'RP/TIBg',C.AC));
  ch.push(t(pxb+4,py+6,16,10,'RP/TIT','AC',7,700,'#FFFFFF','center'));
  ch.push(t(pxb+23,py+4,pw-30,13,'RP/TypV','Application Component',11,400,P.text,'left')); py+=26;
  ch.push(r(pxb,py+2,16,16,'RP/LogBox',P.primary,1,P.primary,1));
  ch.push(t(pxb+1,py+3,14,12,'RP/LogChk','✓',9,700,'#FFFFFF','center'));
  ch.push(t(pxb+22,py+3,pw-22,12,'RP/LogLbl','Logical  (logical / conceptual)',10,400,P.text,'left'));
  py+=22;
  cfld('Par','Parent','—');
  py+=4;

  sec('SB','Classification');
  cfld('Layer','Layer','Application');
  cfld('Status','Status','active');
  py+=4;

  sec('SC','Description');
  ch.push(r(pxb,py,pw,44,'RP/DescF',P.inputBg,1,P.border,1));
  ch.push(t(pxb+4,py+4,pw-8,38,'RP/DescV','Core application component of the OEA catalog.',10,400,P.muted,'left'));

  // ══════════════════════════════════════════════════════════════════════════════
  // BOTTOM PANEL — Log
  // ══════════════════════════════════════════════════════════════════════════════
  ch.push(r(0,BOTTOM_Y,FW,BOTTOM_H,'Bot/Bg',P.panel,1,P.border,1));
  ch.push(r(0,BOTTOM_Y,FW,28,'Bot/TBg',P.secBg,1,P.border,1));
  ch.push(r(0,BOTTOM_Y,72,28,'Bot/TA',P.panel,1,P.border,1));
  ch.push(t(0,BOTTOM_Y+6,72,16,'Bot/TAT','Log',12,600,P.primary,'center'));
  ch.push(t(80,BOTTOM_Y+6,80,16,'Bot/TBT','Validation',12,400,P.muted,'left'));

  const logs=[
    '[INFO]   Catalog «Application Inventory» loaded  ·  47 entries  ·  12 ms',
    '[INFO]   Saved filter «Active systems only» applied  ·  38 entries remaining',
    '[INFO]   Join «Interfaces» (Aggregate mode)  ·  DataFlow → Interface',
    '[DEBUG]  Saved view «Compact View» applied (isDefault: true)',
    '[INFO]   Inline column filters: AND-combined, 0 active',
  ];
  logs.forEach((l,i)=>
    ch.push(t(8,BOTTOM_Y+36+i*18,FW-16,12,`Bot/L${i}`,l,10,400,P.muted,'left')));

  // ── STATUS BAR ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,360,12,'St/L','Catalog Browser  ·  Application Inventory  ·  47 entries',10,400,P.statusText,'left'));
  ch.push(t(FW-192,STATUS_Y+6,184,12,'St/R','Connected  ·  OEA Server 0.1.0-SNAPSHOT',10,400,P.statusText,'right'));

  return { frameId, changes: ch };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const outDir = path.join(__dirname, '..', '..', 'docs', 'screens');
  const hasPenpot = !!(process.env.PENPOT_API_URL && process.env.PENPOT_ACCESS_TOKEN && process.env.PENPOT_PROJECT_ID);

  if (hasPenpot) {
    const PID = process.env.PENPOT_PROJECT_ID;
    const API = process.env.PENPOT_API_URL;
    try {
      const profile = await rpc('get-profile', {});
      console.log(`Penpot: ${profile.email}`);
      const projectFiles = await rpc('get-project-files', { project_id: PID });
      for (const f of projectFiles.filter(f => f.name && f.name.includes('Catalog-Browser')))
        await rpc('delete-file', { id: f.id });
      const f = await rpc('create-file', { name: 'OEA - Catalog Browser v0.2', project_id: PID });
      const fileId = f.id, pageId = f.data.pages[0];
      const modes = [{row:0, P:L, m:'Light'}, {row:1, P:D, m:'Dark'}];
      const allChanges = [];
      for (const {row, m} of modes)
        allChanges.push(canvasText(pageId, -160, sy(row)+FH/2-10, 150, 20, `Lbl${m}`, `${m} Mode`, 13, 600, '#64748B', 'right'));
      for (const {row, P, m} of modes) {
        const {changes} = screen(pageId, row, P, m);
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

  const pid = '00000000-0000-0000-0000-000000000001';
  const modes = [{row:0, P:L, m:'Light'}, {row:1, P:D, m:'Dark'}];
  console.log('\nSVG export ...');
  for (const {row, P, m} of modes) {
    const {changes} = screen(pid, row, P, m);
    const outPath = path.join(outDir, `katalog-browser-${m.toLowerCase()}.svg`);
    generateLocalSVG(changes[0], changes.slice(1), outPath);
    console.log(`  katalog-browser-${m.toLowerCase()}.svg`);
  }
  console.log(`\nSVGs: docs/screens/`);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
