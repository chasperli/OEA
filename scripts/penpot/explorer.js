#!/usr/bin/env node
/**
 * OEA Explorer / Navigation Tree (SCR-011) — Composite Mockup
 * Shows 4 interaction states simultaneously:
 *   1. Context menu (right-click on folder)
 *   2. Inline rename (double-click on folder name)
 *   3. Orphaned item (referenced entity was soft-deleted)
 *   4. "Add Content" search dialog (modal)
 *
 * UC-13: Navigationsbaum verwalten
 * REQs covered: inline edit (BR-01), orphaned items (E4),
 *               soft-reference delete (BR-05), read-only mode (E5)
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280, FH=800, GAP=100;
const sy = row => row*(FH+GAP);

const MENU_H=28, TOOL_H=36, MAIN_Y=64;
const LEFT_W=260, DIV_W=4;
const STATUS_Y=776, STATUS_H=24;
const MAIN_H=STATUS_Y-MAIN_Y;

const L = {
  panel:'#FFFFFF', panelAlt:'#F8FAFC', menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC', selBg:'#E0F2FE', secBg:'#F1F5F9',
  statusText:'#94A3B8', overlay:'#FFFFFF',
  warnBg:'#FEF3C7', warnBorder:'#D97706', warnText:'#92400E',
  errBg:'#FEE2E2', errText:'#991B1B',
  addBg:'#DCFCE7', addText:'#166534',
  ctxBg:'#FFFFFF', ctxHover:'#F0F9FF',
};
const D = {
  panel:'#1E293B', panelAlt:'#172030', menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0B1829', selBg:'#0C4A6E', secBg:'#162030',
  statusText:'#64748B', overlay:'#1E293B',
  warnBg:'#78350F', warnBorder:'#D97706', warnText:'#FDE68A',
  errBg:'#450A0A', errText:'#FCA5A5',
  addBg:'#14532D', addText:'#86EFAC',
  ctxBg:'#1E293B', ctxHover:'#0C2845',
};

// Folder / node dot colors
const DOT = {
  root:'#0F172A', gov:'#7C3AED', it:'#0284C7',
  del:'#059669', risk:'#DC2626', warn:'#D97706', diag:'#0891B2',
};

function screen(pid, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, 0, sy(row), FW, FH, `${m}/SCR-011-Explorer`);
  const ch = [change];

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['Edit',54],['View',100],['Model',148],['Help',196]].forEach(([l,x])=>
    ch.push(t(x,6,48,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,70,14,'TBC1','Explorer',12,600,P.text,'left'));
  // Edit mode toggle (active)
  ch.push(r(LEFT_W-90,MENU_H+7,82,22,'EditModeBtn',P.selBg,1,P.primary,1));
  ch.push(t(LEFT_W-90,MENU_H+11,82,14,'EditModeBtnT','✏  Edit mode',10,600,P.primary,'center'));
  // Breadcrumb
  ch.push(t(LEFT_W+DIV_W+8,MENU_H+11,400,14,'TBc','OEA Solution  ›  Architecture Governance',12,400,P.muted,'left'));

  // ── DIVIDER ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,MAIN_H,'Div',P.border));

  // ══════════════════════════════════════════════════════════════
  // EXPLORER PANEL (left 260px)
  // ══════════════════════════════════════════════════════════════
  ch.push(r(0,MAIN_Y,LEFT_W,MAIN_H,'LP/Bg',P.panel));

  // Header
  ch.push(r(0,MAIN_Y,LEFT_W,28,'LP/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+7,LEFT_W-60,14,'LP/HT','Explorer',12,600,P.text,'left'));
  // New folder button in header
  ch.push(r(LEFT_W-50,MAIN_Y+5,42,18,'LP/NewFolBtn',P.inputBg,1,P.border,1));
  ch.push(t(LEFT_W-50,MAIN_Y+7,42,14,'LP/NewFolBtnT','+ Folder',9,500,P.muted,'center'));

  // Search
  ch.push(r(8,MAIN_Y+36,LEFT_W-16,24,'LP/Srch',P.inputBg,1,P.border,1));
  ch.push(t(14,MAIN_Y+42,LEFT_W-28,12,'LP/SrchT','Search tree...',11,400,P.muted,'left'));

  // ── Tree nodes ──
  let ly = MAIN_Y+68;
  const ROW_H=22;

  // Helper: one tree row
  const trow=(key,label,indent,dotCol,expand,opts={})=>{
    const {sel,renaming,orphan,dragging,ctxOpen,bold}=opts;
    const bg=sel?P.selBg:dragging?P.panelAlt:P.panel;
    ch.push(r(0,ly,LEFT_W,ROW_H,`TR/${key}Bg`,bg));
    if(dragging){
      // Drag handle visible on left
      ch.push(t(2,ly+4,10,13,`TR/${key}DH`,'⠿',9,400,P.muted,'left'));
    }
    const arrowX=indent*14+4;
    ch.push(t(arrowX,ly+4,10,13,`TR/${key}Arr`,expand!==null?(expand?'▼':'▶'):'',9,700,P.muted,'left'));
    const dotX=arrowX+12;
    if(orphan){
      ch.push(t(dotX,ly+3,14,15,`TR/${key}Warn`,'⚠',11,700,DOT.warn,'center'));
    } else {
      ch.push(r(dotX+2,ly+7,8,8,`TR/${key}Dot`,dotCol||P.muted));
    }
    const textX=dotX+14;
    if(renaming){
      // Inline edit field
      ch.push(r(textX,ly+2,LEFT_W-textX-24,18,`TR/${key}InputBg`,P.inputBg,1,P.primary,1.5));
      ch.push(t(textX+3,ly+5,LEFT_W-textX-30,12,`TR/${key}InputV`,'ERP-Rollout Programme',10,400,P.text,'left'));
      // Cursor blink indicator
      ch.push(r(textX+133,ly+5,1,12,`TR/${key}Cursor`,P.primary));
      // Confirm/cancel mini buttons
      ch.push(r(LEFT_W-22,ly+3,18,16,`TR/${key}ConfBtn`,P.addBg||'#DCFCE7',1,P.addText||'#166534',1));
      ch.push(t(LEFT_W-22,ly+5,18,12,`TR/${key}ConfBtnT`,'✓',9,700,P.addText||'#166534','center'));
    } else {
      const tc=orphan?P.errText:ctxOpen?P.primary:P.text;
      const wt=bold||ctxOpen?600:400;
      ch.push(t(textX,ly+4,LEFT_W-textX-20,14,`TR/${key}Lbl`,label,10,wt,tc,'left'));
    }
    if(ctxOpen){
      // Highlight the right-click indicator
      ch.push(r(LEFT_W-18,ly+3,14,16,`TR/${key}RCHint`,P.selBg,1,P.primary,1));
      ch.push(t(LEFT_W-18,ly+5,14,12,`TR/${key}RCT`,'⋯',10,700,P.primary,'center'));
    }
    ly+=ROW_H;
  };

  trow('Root',   'OEA Solution',             0, DOT.root,  true,  {bold:true});
  trow('Gov',    'Architecture Governance',   1, DOT.gov,   true,  {ctxOpen:true});
  trow('Comp',   'Components  (14)',          2, '#2563EB', false, {dragging:true});
  trow('Diag',   'Diagrams  (6)',             2, DOT.diag,  false);
  trow('Orphan', 'Reporting-Engine [AC]',     2, DOT.warn,  null,  {orphan:true});
  trow('Del',    'Solution Delivery',         1, DOT.del,   true,  {renaming:true, sel:true});
  trow('ERP1',   'ERP Sprint Q1',             2, DOT.del,   false);
  trow('ERP2',   'ERP Sprint Q2',             2, DOT.del,   false);
  trow('Risk',   'Risk & Compliance',         1, DOT.risk,  false);

  ly += 4;
  // Orphaned item info box
  ch.push(r(4,ly,LEFT_W-8,36,'LP/OWarn',P.warnBg,1,P.warnBorder||'#D97706',1));
  ch.push(t(8,ly+4,LEFT_W-16,12,'LP/OWarnT1','⚠  Orphaned item: referenced entity',9,500,P.warnText,'left'));
  ch.push(t(8,ly+16,LEFT_W-16,12,'LP/OWarnT2','was deleted. Remove or restore it.',9,400,P.warnText,'left'));
  ch.push(r(LEFT_W-52,ly+26,44,8,'LP/OWarnBtn',P.warnBorder||'#D97706',0.3));
  ch.push(t(LEFT_W-52,ly+27,44,7,'LP/OWarnBtnT','Remove entry',7,600,P.warnText,'center'));

  // Read-only hint at bottom
  ch.push(r(0,STATUS_Y-36,LEFT_W,36,'LP/ROHint',P.secBg,1,P.border,1));
  ch.push(r(4,STATUS_Y-31,16,16,'LP/RODot',P.primary,0.2,P.primary,1));
  ch.push(t(4,STATUS_Y-30,14,14,'LP/RODotT','✏',9,600,P.primary,'center'));
  ch.push(t(24,STATUS_Y-31,LEFT_W-28,12,'LP/ROT1','Edit mode active. Drag to reorder.',9,500,P.text,'left'));
  ch.push(t(24,STATUS_Y-19,LEFT_W-28,12,'LP/ROT2','Read-only for viewers (E5).',9,400,P.muted,'left'));

  // ══════════════════════════════════════════════════════════════
  // CONTEXT MENU (floating over Explorer panel)
  // Appears at right-click on "Architecture Governance"
  // ══════════════════════════════════════════════════════════════
  const CM_X=52, CM_Y=MAIN_Y+68+ROW_H+4; // just below the "Architecture Governance" row
  const CM_W=196, CM_H=132;

  // Shadow
  ch.push(r(CM_X+3,CM_Y+3,CM_W,CM_H,'CTX/Shadow',P.muted,0.18));
  // Background
  ch.push(r(CM_X,CM_Y,CM_W,CM_H,'CTX/Bg',P.ctxBg||P.overlay,1,P.border,1));

  const ctxItems=[
    {label:'Edit Folder Name',  shortcut:'F2',          y:0,   sep:false,warn:false,active:false},
    {label:'Add Content...',    shortcut:'',            y:20,  sep:false,warn:false,active:true},
    {label:'',                  shortcut:'',            y:40,  sep:true, warn:false,active:false},
    {label:'Move',              shortcut:'',            y:48,  sep:false,warn:false,active:false},
    {label:'',                  shortcut:'',            y:68,  sep:true, warn:false,active:false},
    {label:'Delete Folder',     shortcut:'',            y:76,  sep:false,warn:true, active:false},
  ];
  ctxItems.forEach((item,i)=>{
    if(item.sep){
      ch.push(r(CM_X+6,CM_Y+item.y+3,CM_W-12,1,`CTX/Sep${i}`,P.border));
      return;
    }
    if(item.active){
      ch.push(r(CM_X,CM_Y+item.y,CM_W,20,`CTX/HL${i}`,P.ctxHover||P.selBg));
    }
    const tc=item.warn?P.errText:item.active?P.primary:P.text;
    ch.push(t(CM_X+8,CM_Y+item.y+4,CM_W-55,12,`CTX/L${i}`,item.label,10,item.active?600:400,tc,'left'));
    if(item.shortcut) ch.push(t(CM_X+CM_W-46,CM_Y+item.y+4,40,12,`CTX/S${i}`,item.shortcut,9,400,P.muted,'right'));
  });
  // Sub-text under "Delete Folder"
  ch.push(t(CM_X+8,CM_Y+92,CM_W-16,10,'CTX/DelSub','2 sub-folders, 14 items — content preserved',8,400,P.muted,'left'));

  // ══════════════════════════════════════════════════════════════
  // MAIN CONTENT AREA (right of Explorer) — dimmed behind dialog
  // ══════════════════════════════════════════════════════════════
  const CX=LEFT_W+DIV_W; // 264
  const CW=FW-CX;        // 1016

  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'CA/Bg',P.panel));
  // Dimmed content suggestion (catalog view behind modal)
  ch.push(r(CX,MAIN_Y,CW,28,'CA/HBg',P.secBg,1,P.border,1));
  ch.push(t(CX+8,MAIN_Y+7,300,14,'CA/HT','Architecture Governance  →  Contents  (16)',12,600,P.muted,'left'));
  // Some blurred rows to suggest content
  [0,1,2,3,4].forEach(i=>{
    ch.push(r(CX+8,MAIN_Y+36+i*36,CW-16,28,`CA/R${i}`,P.panelAlt,1,P.border,0.5));
    ch.push(r(CX+16,MAIN_Y+43+i*36,120,14,`CA/R${i}T1`,P.border,0.4));
    ch.push(r(CX+148,MAIN_Y+43+i*36,80,14,`CA/R${i}T2`,P.border,0.3));
  });
  // Overlay to dim content behind dialog
  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'Overlay',P.panel,0.55));

  // ══════════════════════════════════════════════════════════════
  // "ADD CONTENT" DIALOG (modal, centered)
  // ══════════════════════════════════════════════════════════════
  const DLG_W=640, DLG_H=400;
  const DLG_X=Math.round((FW-DLG_W)/2);  // 320
  const DLG_Y=Math.round((FH-DLG_H)/2);  // 200

  // Shadow
  ch.push(r(DLG_X+4,DLG_Y+4,DLG_W,DLG_H,'DLG/Shadow',P.muted,0.2));
  // Dialog bg
  ch.push(r(DLG_X,DLG_Y,DLG_W,DLG_H,'DLG/Bg',P.overlay,1,P.primary,1.5));

  // Header
  ch.push(r(DLG_X,DLG_Y,DLG_W,36,'DLG/HBg',P.selBg,1,P.primary,1.5));
  ch.push(t(DLG_X+12,DLG_Y+10,DLG_W-50,16,'DLG/HT','Add Content to «Architecture Governance»',12,700,P.primary,'left'));
  ch.push(r(DLG_X+DLG_W-28,DLG_Y+8,20,20,'DLG/CloseBtn',P.inputBg,1,P.border,1));
  ch.push(t(DLG_X+DLG_W-28,DLG_Y+10,20,16,'DLG/CloseBtnT','×',12,600,P.muted,'center'));

  // Search + Type filter row
  ch.push(r(DLG_X+12,DLG_Y+44,380,28,'DLG/SearchF',P.inputBg,1,P.primary,1.5));
  ch.push(t(DLG_X+18,DLG_Y+50,370,16,'DLG/SearchV','catalog',12,400,P.text,'left'));
  // Cursor in search
  ch.push(r(DLG_X+62,DLG_Y+51,1,14,'DLG/SCursor',P.primary));
  ch.push(r(DLG_X+400,DLG_Y+44,110,28,'DLG/TypeF',P.inputBg,1,P.border,1));
  ch.push(t(DLG_X+406,DLG_Y+50,90,16,'DLG/TypeV','Type: All  ▾',11,400,P.text,'left'));
  ch.push(r(DLG_X+518,DLG_Y+44,110,28,'DLG/SearchBtn',P.primary));
  ch.push(t(DLG_X+518,DLG_Y+50,110,16,'DLG/SearchBtnT','Search',11,600,'#FFFFFF','center'));

  // Column headers
  ch.push(r(DLG_X,DLG_Y+78,DLG_W,22,'DLG/ColH',P.secBg,1,P.border,1));
  ch.push(t(DLG_X+12,DLG_Y+83,28,12,'DLG/ColH0','',10,700,P.muted,'left'));
  ch.push(t(DLG_X+44,DLG_Y+83,220,12,'DLG/ColH1','Name',10,700,P.muted,'left'));
  ch.push(t(DLG_X+270,DLG_Y+83,100,12,'DLG/ColH2','Type',10,700,P.muted,'left'));
  ch.push(t(DLG_X+378,DLG_Y+83,240,12,'DLG/ColH3','Path',10,700,P.muted,'left'));

  // Result rows
  const results=[
    {checked:true,  name:'Application Landscape 2026', type:'Catalog',  path:'/ Catalogs',                   tc:'#D97706'},
    {checked:true,  name:'Catalog-Service',             type:'Entity AC',path:'/ Architecture Governance',   tc:'#2563EB'},
    {checked:false, name:'Technology Radar 2026',       type:'Catalog',  path:'/ Catalogs',                   tc:'#D97706'},
    {checked:false, name:'Auth-Service',                type:'Entity AC',path:'/ Architecture Governance',   tc:'#2563EB'},
    {checked:false, name:'BPMN — Architecture Review', type:'Diagram',  path:'/ Architecture Governance',   tc:'#0891B2'},
  ];
  results.forEach((row,i)=>{
    const ry=DLG_Y+100+i*34;
    const bg=row.checked?P.selBg:i%2===0?P.panel:P.panelAlt;
    ch.push(r(DLG_X,ry,DLG_W,34,`DLG/R${i}Bg`,bg,1,P.border,0.5));
    // Checkbox
    if(row.checked){
      ch.push(r(DLG_X+14,ry+9,16,16,`DLG/R${i}CB`,P.primary,1,P.primary,1));
      ch.push(t(DLG_X+14,ry+10,16,14,`DLG/R${i}CBT`,'✓',9,700,'#FFFFFF','center'));
    } else {
      ch.push(r(DLG_X+14,ry+9,16,16,`DLG/R${i}CB`,P.inputBg,1,P.border,1));
    }
    ch.push(t(DLG_X+36,ry+10,224,14,`DLG/R${i}Name`,row.name,11,row.checked?600:400,P.text,'left'));
    // Type badge
    ch.push(r(DLG_X+268,ry+10,88,14,`DLG/R${i}TBg`,row.tc,0.12,row.tc,1));
    ch.push(t(DLG_X+272,ry+11,82,11,`DLG/R${i}TT`,row.type,9,500,row.tc,'left'));
    ch.push(t(DLG_X+366,ry+10,256,14,`DLG/R${i}Path`,row.path,10,400,P.muted,'left'));
  });

  // Dialog footer
  const FOOT_Y=DLG_Y+DLG_H-48;
  ch.push(r(DLG_X,FOOT_Y,DLG_W,48,'DLG/FootBg',P.secBg,1,P.border,1));
  // Selected count badge
  ch.push(r(DLG_X+12,FOOT_Y+14,80,20,'DLG/SelBadge',P.selBg,1,P.primary,1));
  ch.push(t(DLG_X+16,FOOT_Y+17,72,14,'DLG/SelBadgeT','2 selected',10,600,P.primary,'center'));
  // Note
  ch.push(t(DLG_X+104,FOOT_Y+17,260,14,'DLG/Note','Items remain in other folders (BR-06)',10,400,P.muted,'left'));
  // Buttons
  ch.push(r(DLG_X+DLG_W-188,FOOT_Y+10,84,28,'DLG/BtnCancel',P.inputBg,1,P.border,1));
  ch.push(t(DLG_X+DLG_W-188,FOOT_Y+17,84,14,'DLG/BtnCancelT','Cancel',11,400,P.muted,'center'));
  ch.push(r(DLG_X+DLG_W-96,FOOT_Y+10,84,28,'DLG/BtnAdd',P.primary));
  ch.push(t(DLG_X+DLG_W-96,FOOT_Y+17,84,14,'DLG/BtnAddT','Add to folder',11,600,'#FFFFFF','center'));

  // ── STATUS BAR ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,580,12,'St/L','Explorer  ·  Edit mode  ·  OEA Solution  ·  3 folders  ·  14 items  ·  1 orphaned',10,400,P.statusText,'left'));
  ch.push(t(FW-192,STATUS_Y+6,184,12,'St/R','Connected  ·  OEA 0.1.0-SNAPSHOT',10,400,P.statusText,'right'));

  return { frameId, changes: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const outDir=path.join(__dirname,'..','..','docs','screens');
  const hasPenpot=!!(process.env.PENPOT_API_URL&&process.env.PENPOT_ACCESS_TOKEN&&process.env.PENPOT_PROJECT_ID);
  const pid='00000000-0000-0000-0000-000000000001';
  const modes=[{row:0,P:L,m:'Light'},{row:1,P:D,m:'Dark'}];

  if(hasPenpot){
    const PID=process.env.PENPOT_PROJECT_ID, API=process.env.PENPOT_API_URL;
    try{
      const profile=await rpc('get-profile',{});
      console.log(`Penpot: ${profile.email}`);
      const files=await rpc('get-project-files',{project_id:PID});
      for(const f of files.filter(f=>f.name&&f.name.includes('Explorer')))
        await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Explorer v0.1',project_id:PID});
      const fileId=f.id, pageId=f.data.pages[0];
      const all=[];
      for(const{row,m}of modes) all.push(canvasText(pageId,-160,sy(row)+FH/2-10,150,20,`Lbl${m}`,`${m} Mode`,13,600,'#64748B','right'));
      for(const{row,P,m}of modes){const{changes}=screen(pageId,row,P,m);all.push(...changes);}
      await rpc('update-file',{id:fileId,'session-id':fileId,revn:0,vern:0,changes:all});
      console.log(`Penpot: ${all.length} shapes  |  ${API}dashboard/projects/${PID}`);
    }catch(e){console.warn(`Penpot failed: ${e.message}`);}
  } else console.log('(Penpot skipped)');

  console.log('\nSVG ...');
  for(const{row,P,m}of modes){
    const{changes}=screen(pid,row,P,m);
    const op=path.join(outDir,`explorer-${m.toLowerCase()}.svg`);
    generateLocalSVG(changes[0],changes.slice(1),op);
    console.log(`  explorer-${m.toLowerCase()}.svg`);
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
