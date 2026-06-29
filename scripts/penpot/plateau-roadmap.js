#!/usr/bin/env node
/**
 * OEA Plateau-Roadmap (SCR-025) — UC-11: Architektur-Plateaus planen
 * Shows a timeline of AS-IS → Transition → TO-BE across 4 capability rows
 * and 6 quarters (Q3 2025 – Q4 2026).
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280,FH=800,GAP=100;
const sy=row=>row*(FH+GAP);
const MENU_H=28,TOOL_H=36,MAIN_Y=64;
const LEFT_W=220,DIV_W=4;
const TL_X=LEFT_W+DIV_W;   // 224 — timeline start
const TL_W=FW-TL_X;        // 1056
const QTR_W=Math.round(TL_W/6); // 176
const TL_HDR_H=36;          // quarter-header height
const TL_Y=MAIN_Y+TL_HDR_H; // 100 — first row starts here
const PLAT_HDR=20;           // plateau band label height
const ROW_H=152;             // per-capability row height
const STATUS_Y=FH-24,STATUS_H=24;

// Plateau x-boundaries (canvas-relative, 0 = TL_X)
const P_ASIS_X=0,       P_ASIS_W=QTR_W;           // Q3'25
const P_TRANS_X=QTR_W,  P_TRANS_W=QTR_W*3;        // Q4'25–Q2'26
const P_TOBE_X=QTR_W*4, P_TOBE_W=QTR_W*2;         // Q3'26–Q4'26

const L={
  panel:'#FFFFFF',panelAlt:'#F8FAFC',menuBg:'#1E293B',menuText:'#E2E8F0',
  primary:'#0EA5E9',text:'#0F172A',muted:'#64748B',
  border:'#E2E8F0',inputBg:'#F8FAFC',selBg:'#E0F2FE',secBg:'#F1F5F9',
  statusText:'#94A3B8',overlay:'#FFFFFF',
  asisB:'#DBEAFE',asisT:'#1E40AF',asisBrd:'#3B82F6',        // blue — AS-IS
  transB:'#FEF9C3',transT:'#92400E',transBrd:'#D97706',     // amber — Transition
  tobeB:'#DCFCE7',tobeT:'#166534',tobeBrd:'#16A34A',        // green — TO-BE
  cardBg:'#FFFFFF',cardFg:'#0F172A',
  migArrow:'#D97706',delCard:'#FEE2E2',delFg:'#991B1B',
};
const D={
  panel:'#1E293B',panelAlt:'#172030',menuBg:'#020617',menuText:'#CBD5E1',
  primary:'#38BDF8',text:'#F1F5F9',muted:'#94A3B8',
  border:'#334155',inputBg:'#0B1829',selBg:'#0C4A6E',secBg:'#162030',
  statusText:'#64748B',overlay:'#1E293B',
  asisB:'#1E3A5F',asisT:'#93C5FD',asisBrd:'#3B82F6',
  transB:'#431407',transT:'#FDE68A',transBrd:'#D97706',
  tobeB:'#052E16',tobeT:'#86EFAC',tobeBrd:'#16A34A',
  cardBg:'#1E293B',cardFg:'#F1F5F9',
  migArrow:'#FBBF24',delCard:'#450A0A',delFg:'#FCA5A5',
};

// Capability rows
const CAPS=[
  {id:'APP',lbl:'Application Layer', dot:'#2563EB'},
  {id:'INT',lbl:'Integration Layer', dot:'#0891B2'},
  {id:'DAT',lbl:'Data Layer',        dot:'#7C3AED'},
  {id:'INF',lbl:'Infrastructure',    dot:'#059669'},
];

// Entity cards per row and plateau
// card = {key, label, sub, qFrom, qTo}  — qFrom/qTo: 0-5 (quarter index)
const CARDS={
  APP:[
    {key:'P1',  label:'Portal v1 (PHP)',   sub:'current',   qFrom:0,qTo:0,  phase:'asis',  dep:true},
    {key:'MIG', label:'Migration Project', sub:'UC-11',     qFrom:1,qTo:3,  phase:'trans', arrow:true},
    {key:'P2',  label:'Portal v2 (Vue 3)', sub:'target',    qFrom:3,qTo:5,  phase:'tobe'},
    {key:'ERP', label:'ERP Integration',  sub:'keep',      qFrom:0,qTo:5,  phase:'asis',  persist:true},
  ],
  INT:[
    {key:'GW0', label:'REST Monolith',    sub:'deprecated',qFrom:0,qTo:1,  phase:'asis',  dep:true},
    {key:'GW1', label:'API Extraction',   sub:'strangler',  qFrom:1,qTo:3,  phase:'trans'},
    {key:'GW2', label:'API Gateway',      sub:'Kong OSS',   qFrom:2,qTo:5,  phase:'tobe'},
    {key:'EVT', label:'Event Bus (Kafka)',sub:'new',        qFrom:3,qTo:5,  phase:'tobe'},
  ],
  DAT:[
    {key:'DB0', label:'PostgreSQL (silo)',sub:'monolith',   qFrom:0,qTo:2,  phase:'asis',  dep:true},
    {key:'DW',  label:'OEA-Data-Warehouse',sub:'central',  qFrom:2,qTo:5,  phase:'tobe'},
    {key:'RPT', label:'Reporting Mart',  sub:'new',        qFrom:4,qTo:5,  phase:'tobe'},
  ],
  INF:[
    {key:'VM',  label:'VM (on-prem)',    sub:'Hyper-V',    qFrom:0,qTo:2,  phase:'asis',  dep:true},
    {key:'K8S', label:'Kubernetes',      sub:'target',     qFrom:1,qTo:5,  phase:'tobe'},
    {key:'CI',  label:'CI/CD Pipeline',  sub:'new',        qFrom:2,qTo:5,  phase:'tobe'},
  ],
};

function screen(pid,row,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/PlateauRoadmap`);
  const ch=[change];

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['Edit',54],['View',100],['Roadmap',148],['Help',220]].forEach(([l,x])=>ch.push(t(x,6,58,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,60,14,'TBC1','Roadmaps',12,400,P.muted,'left'));
  ch.push(t(70,MENU_H+11,8,14,'TBC2','›',12,400,P.muted));
  ch.push(t(80,MENU_H+11,220,14,'TBC3','OEA Platform Transformation 2025–2026',12,600,P.text,'left'));
  ch.push(r(320,MENU_H+6,56,22,'TBViewBtn',P.selBg,1,P.primary,1));
  ch.push(t(320,MENU_H+10,56,14,'TBViewBtnT','Quarter',10,600,P.primary,'center'));
  ch.push(r(380,MENU_H+6,48,22,'TBView2',P.inputBg,1,P.border,1));
  ch.push(t(380,MENU_H+10,48,14,'TBView2T','Year',10,400,P.muted,'center'));
  ch.push(r(FW-200,MENU_H+6,88,22,'TBAddBtn',P.inputBg,1,P.primary,1));
  ch.push(t(FW-200,MENU_H+10,88,14,'TBAddBtnT','+ New Plateau',10,600,P.primary,'center'));
  ch.push(r(FW-104,MENU_H+6,64,22,'TBSaveBtn',P.primary));
  ch.push(t(FW-104,MENU_H+10,64,14,'TBSaveBtnT','Save',10,600,'#FFFFFF','center'));

  // ── LEFT SIDEBAR ──
  ch.push(r(0,MAIN_Y,LEFT_W,STATUS_Y-MAIN_Y,'SB/Bg',P.panel,1,P.border,1));
  ch.push(r(0,MAIN_Y,LEFT_W,24,'SB/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+5,LEFT_W-16,14,'SB/HT','Filters & Legend',11,600,P.text,'left'));

  let sly=MAIN_Y+28;
  ch.push(t(8,sly,LEFT_W-16,11,'SB/F1L','Solution',9,500,P.muted,'left'));sly+=12;
  ch.push(r(6,sly,LEFT_W-12,22,'SB/F1F',P.inputBg,1,P.primary,1.5));
  ch.push(t(10,sly+4,LEFT_W-20,13,'SB/F1V','OEA Platform Transformation',10,600,P.text,'left'));sly+=26;
  ch.push(t(8,sly,LEFT_W-16,11,'SB/F2L','Domain',9,500,P.muted,'left'));sly+=12;
  ch.push(r(6,sly,LEFT_W-12,22,'SB/F2F',P.inputBg,1,P.border,1));
  ch.push(t(10,sly+4,LEFT_W-20,13,'SB/F2V','All domains',10,400,P.muted,'left'));sly+=32;

  // Legend
  ch.push(r(0,sly,LEFT_W,20,'SB/LegH',P.secBg));
  ch.push(t(8,sly+3,LEFT_W-16,13,'SB/LegHT','Plateau-Legende',10,600,P.muted,'left'));sly+=24;
  const legItems=[
    {bg:P.asisB,brd:P.asisBrd,lbl:'AS-IS  (current state)',sub:'Q3 2025'},
    {bg:P.transB,brd:P.transBrd,lbl:'Transition  (migration)',sub:'Q4 2025 – Q2 2026'},
    {bg:P.tobeB, brd:P.tobeBrd, lbl:'TO-BE  (target state)',sub:'Q3 2026 onward'},
  ];
  legItems.forEach(l=>{
    ch.push(r(6,sly,LEFT_W-12,42,'SB/L'+l.lbl.slice(0,3),l.bg,1,l.brd,1.5));
    ch.push(t(10,sly+5,LEFT_W-20,13,'SB/LT'+l.lbl.slice(0,3),l.lbl,10,600,l.brd,'left'));
    ch.push(t(10,sly+20,LEFT_W-20,11,'SB/LS'+l.lbl.slice(0,3),l.sub,9,400,P.muted,'left'));
    sly+=48;
  });

  sly+=4;
  ch.push(r(0,sly,LEFT_W,20,'SB/IconH',P.secBg));
  ch.push(t(8,sly+3,LEFT_W-16,13,'SB/IconHT','Card-Symbole',10,600,P.muted,'left'));sly+=24;
  [['⚠ deprecated','Ablösungskandidat'],['→ migrating','In Ablösung'],['✓ stable','Bestätigt']].forEach(([ic,lb])=>{
    ch.push(t(10,sly,18,13,'SB/IS'+ic.slice(0,2),ic.slice(0,2),10,700,P.primary,'left'));
    ch.push(t(30,sly,LEFT_W-36,12,'SB/IL'+ic,lb,9,400,P.muted,'left'));sly+=18;
  });

  // ── DIVIDER ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,STATUS_Y-MAIN_Y,'SBDiv',P.border));

  // ══════════════════════════════════════════════════════════════
  // TIMELINE AREA
  // ══════════════════════════════════════════════════════════════
  const tlBg=P.panelAlt;
  ch.push(r(TL_X,MAIN_Y,TL_W,STATUS_Y-MAIN_Y,'TL/Bg',tlBg));

  // ── Plateau band backgrounds (full height, vertical) ──
  ch.push(r(TL_X+P_ASIS_X, MAIN_Y, P_ASIS_W,  STATUS_Y-MAIN_Y,'PL/AsisBg',  P.asisB,  0.3, P.asisBrd, 0.8));
  ch.push(r(TL_X+P_TRANS_X,MAIN_Y, P_TRANS_W, STATUS_Y-MAIN_Y,'PL/TransBg', P.transB, 0.3, P.transBrd,0.8));
  ch.push(r(TL_X+P_TOBE_X, MAIN_Y, P_TOBE_W,  STATUS_Y-MAIN_Y,'PL/TobeBg',  P.tobeB,  0.3, P.tobeBrd, 0.8));

  // ── Quarter column headers ──
  const qtrs=['Q3 2025','Q4 2025','Q1 2026','Q2 2026','Q3 2026','Q4 2026'];
  qtrs.forEach((q,i)=>{
    const qx=TL_X+i*QTR_W;
    ch.push(r(qx,MAIN_Y,QTR_W,TL_HDR_H,'QH/BG'+i,(i<1?P.asisB:i<4?P.transB:P.tobeB),0.5));
    ch.push(r(qx,MAIN_Y,1,TL_HDR_H,'QH/Sep'+i,P.border,0.6));
    ch.push(t(qx+4,MAIN_Y+4,QTR_W-8,11,'QH/Q'+i,q,10,600,(i<1?P.asisT:i<4?P.transT:P.tobeT),'center'));
    // Column separator extending down
    ch.push(r(qx,TL_Y,1,STATUS_Y-TL_Y,'QV/Sep'+i,P.border,0.3));
  });

  // Plateau labels in header
  [
    {x:P_ASIS_X,  w:P_ASIS_W,  lbl:'AS-IS',      col:P.asisT,  brd:P.asisBrd},
    {x:P_TRANS_X, w:P_TRANS_W, lbl:'Transition',  col:P.transT, brd:P.transBrd},
    {x:P_TOBE_X,  w:P_TOBE_W,  lbl:'TO-BE',       col:P.tobeT,  brd:P.tobeBrd},
  ].forEach(p=>{
    ch.push(t(TL_X+p.x+4,MAIN_Y+20,p.w-8,14,'PLbl/'+p.lbl,`◆ ${p.lbl}`,11,700,p.col,'center'));
  });

  // ── Capability rows ──
  CAPS.forEach((cap,ri)=>{
    const rowY=TL_Y+ri*ROW_H;
    // Row separator
    ch.push(r(TL_X,rowY,TL_W,1,'Row/Sep'+ri,P.border,0.5));
    // Row header (left part inside timeline area)
    ch.push(r(TL_X,rowY,80,ROW_H,'Row/HBg'+ri,P.panel,1,P.border,0.3));
    ch.push(r(TL_X+6,rowY+12,8,8,'Row/Dot'+ri,cap.dot));
    ch.push(t(TL_X+18,rowY+8,58,12,'Row/HL1_'+ri,cap.lbl,9,700,P.text,'left'));

    // Entity cards
    const cards=CARDS[cap.id]||[];
    cards.forEach((card,ci)=>{
      const cx=TL_X+80+card.qFrom*QTR_W+6;
      const cw=(card.qTo-card.qFrom)*QTR_W+QTR_W-12;
      const cy=rowY+PLAT_HDR+ci*26;
      const ph=card.phase;
      const bgC=ph==='asis'?P.asisB:ph==='tobe'?P.tobeB:P.transB;
      const brdC=ph==='asis'?P.asisBrd:ph==='tobe'?P.tobeBrd:P.transBrd;
      const fgC=ph==='asis'?P.asisT:ph==='tobe'?P.tobeT:P.transT;
      const cbg=card.dep?P.delCard:bgC;
      const cfg=card.dep?P.delFg:fgC;
      ch.push(r(cx,cy,cw,22,`C/${cap.id}/${card.key}/Bg`,cbg,1,brdC,card.dep?1.5:1));
      // Arrow icon if migration arrow
      if(card.arrow){
        ch.push(t(cx+cw-20,cy+4,16,13,`C/${cap.id}/${card.key}/Arr`,'→',10,700,P.migArrow,'center'));
      }
      const icon=card.dep?'⚠':card.persist?'↔':card.arrow?'→':'';
      if(icon) ch.push(t(cx+3,cy+4,14,13,`C/${cap.id}/${card.key}/Icon`,icon,9,700,cfg,'left'));
      const textX=icon?cx+16:cx+4;
      const textW=cw-(icon?20:8)-(card.arrow?22:0);
      ch.push(t(textX,cy+4,textW,13,`C/${cap.id}/${card.key}/Lbl`,card.label,9,card.dep?600:500,cfg,'left'));
      if(cw>80&&card.sub)
        ch.push(t(textX,cy+15,textW,9,`C/${cap.id}/${card.key}/Sub`,card.sub,7,400,P.muted,'left'));
    });
  });

  // Last row separator + "add row" button
  const lastRowY=TL_Y+CAPS.length*ROW_H;
  ch.push(r(TL_X,lastRowY,TL_W,1,'Row/LastSep',P.border,0.5));
  ch.push(r(TL_X+QTR_W*1+4,lastRowY+6,80,20,'Row/AddBtn',P.inputBg,1,P.transBrd,1));
  ch.push(t(TL_X+QTR_W*1+4,lastRowY+10,80,11,'Row/AddBtnT','+ Add Entity',8,500,P.transT,'center'));

  // ── "Today" marker (mid Q4-2025, between quarter 1 and 2) ──
  const todayX=TL_X+QTR_W*1+QTR_W/2;
  ch.push(r(todayX,MAIN_Y,2,STATUS_Y-MAIN_Y,'Today/Line','#DC2626',0.8));
  ch.push(r(todayX-24,MAIN_Y,50,16,'Today/Label','#DC2626'));
  ch.push(t(todayX-24,MAIN_Y+2,50,11,'Today/LabelT','▼ Today',8,700,'#FFFFFF','center'));

  // ── LEFT sidebar row labels ──
  CAPS.forEach((cap,ri)=>{
    const rowY=TL_Y+ri*ROW_H;
    const ly0=rowY+20;
    ch.push(r(0,rowY,LEFT_W,ROW_H,'SB/RBg'+ri,P.panel,1,P.border,0.2));
    ch.push(r(4,ly0,8,8,'SB/Dot'+ri,cap.dot));
    ch.push(t(16,ly0-2,LEFT_W-20,13,'SB/Cap'+ri,cap.lbl,10,600,P.text,'left'));
    ch.push(t(16,ly0+13,LEFT_W-20,11,'SB/CapSub'+ri,'UC-11 · click to filter',9,400,P.muted,'left'));
  });

  // ── STATUS ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,600,12,'St/L','Plateau Roadmap  ·  OEA Platform Transformation  ·  4 domains  ·  12 entities  ·  3 plateaus  ·  Q3 2025 – Q4 2026',10,400,P.statusText,'left'));
  ch.push(t(FW-192,STATUS_Y+6,184,12,'St/R','Connected  ·  OEA 0.1.0-SNAPSHOT',10,400,P.statusText,'right'));
  return{frameId,changes:ch};
}

async function main(){
  const outDir=path.join(__dirname,'..','..','docs','screens');
  const hasPenpot=!!(process.env.PENPOT_API_URL&&process.env.PENPOT_ACCESS_TOKEN&&process.env.PENPOT_PROJECT_ID);
  const pid='00000000-0000-0000-0000-000000000001';
  const modes=[{row:0,P:L,m:'Light'},{row:1,P:D,m:'Dark'}];
  if(hasPenpot){
    const PID=process.env.PENPOT_PROJECT_ID,API=process.env.PENPOT_API_URL;
    try{
      const profile=await rpc('get-profile',{});console.log(`Penpot: ${profile.email}`);
      const files=await rpc('get-project-files',{project_id:PID});
      for(const f of files.filter(f=>f.name&&f.name.includes('Plateau')))await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Plateau Roadmap v0.1',project_id:PID});
      const all=[];
      for(const{row,m}of modes)all.push(canvasText(f.data.pages[0],-160,sy(row)+FH/2-10,150,20,`Lbl${m}`,`${m} Mode`,13,600,'#64748B','right'));
      for(const{row,P,m}of modes){const{changes}=screen(f.data.pages[0],row,P,m);all.push(...changes);}
      await rpc('update-file',{id:f.id,'session-id':f.id,revn:0,vern:0,changes:all});
      console.log(`Penpot: ${all.length} shapes  |  ${API}dashboard/projects/${PID}`);
    }catch(e){console.warn(`Penpot failed: ${e.message}`);}
  }else console.log('(Penpot skipped)');
  console.log('\nSVG ...');
  for(const{row,P,m}of modes){
    const{changes}=screen(pid,row,P,m);
    generateLocalSVG(changes[0],changes.slice(1),path.join(outDir,`plateau-roadmap-${m.toLowerCase()}.svg`));
    console.log(`  plateau-roadmap-${m.toLowerCase()}.svg`);
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
