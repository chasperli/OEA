#!/usr/bin/env node
/**
 * OEA Admin & Configuration Screens (SCR-031 to SCR-038)
 *   SCR-031  Viewpoint-Verwaltung          UC-12
 *   SCR-032  Property-Sichtbarkeit         UC-21
 *   SCR-033  TRM-Konfiguration             UC-19
 *   SCR-034  Continuum-Bausteine           UC-17
 *   SCR-035  Continuum-Paket importieren   UC-18
 *   SCR-036  Conformance-Analyse           UC-20
 *   SCR-037  Auth-Konfiguration (Admin)    UC-03
 *   SCR-038  System-Einstellungen          UC-02
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280, FH=800, GAP=100;
const sy = row => row*(FH+GAP);
const MENU_H=28, TOOL_H=36, MAIN_Y=64, MAIN_H=712;
const STATUS_Y=776, STATUS_H=24;

const L = {
  panel:'#FFFFFF', panelAlt:'#F8FAFC', menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC', selBg:'#E0F2FE', secBg:'#F1F5F9',
  statusText:'#94A3B8', overlay:'#FFFFFF',
  green:'#059669', red:'#DC2626', amber:'#D97706', purple:'#7C3AED',
  greenBg:'#DCFCE7', redBg:'#FEE2E2', amberBg:'#FEF9C3', purpleBg:'#EDE9FE',
};
const D = {
  panel:'#1E293B', panelAlt:'#172030', menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0B1829', selBg:'#0C4A6E', secBg:'#162030',
  statusText:'#64748B', overlay:'#1E293B',
  green:'#10B981', red:'#F87171', amber:'#FBBF24', purple:'#A78BFA',
  greenBg:'#052E16', redBg:'#450A0A', amberBg:'#431407', purpleBg:'#2E1065',
};

// ── Shared shell builders ────────────────────────────────────────────────────

function shell(ch, r, t, FW, P, title, breadcrumb, btns=[]) {
  // Menu
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['Edit',54],['Admin',100],['Help',152]].forEach(([l,x])=>
    ch.push(t(x,6,44,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));
  // Toolbar
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,80,14,'TBC1','Administration',12,400,P.muted,'left'));
  ch.push(t(90,MENU_H+11,8,14,'TBC2','›',12,400,P.muted));
  ch.push(t(100,MENU_H+11,300,14,'TBC3',breadcrumb,12,600,P.text,'left'));
  btns.forEach(([lbl,act],i)=>{
    const bw=lbl.length*7+16; const bx=FW-8-(bw+8)*(btns.length-i);
    ch.push(r(bx,MENU_H+6,bw,22,`TBBtn${i}`,act?P.primary:P.inputBg,1,act?P.primary:P.border,1));
    ch.push(t(bx,MENU_H+10,bw,14,`TBBtnT${i}`,lbl,10,act?600:400,act?'#FFFFFF':P.muted,'center'));
  });
  // Status bar
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,500,12,'St/L',title,10,400,P.statusText,'left'));
  ch.push(t(FW-192,STATUS_Y+6,184,12,'St/R','Connected  ·  OEA 0.1.0-SNAPSHOT',10,400,P.statusText,'right'));
}

function fld(ch,r,t,P,x,y,w,label,value,hl) {
  ch.push(t(x,y,w,11,`${label}/L`,label,9,500,P.muted,'left')); y+=12;
  ch.push(r(x,y,w,22,`${label}/F`,P.inputBg,1,hl?P.primary:P.border,hl?1.5:1));
  ch.push(t(x+4,y+4,w-8,13,`${label}/V`,value,11,400,P.text,'left')); return y+26;
}

function toggle(ch,r,t,P,x,y,w,label,on,sub) {
  ch.push(t(x,y+4,w-44,12,`${label}/TL`,label,10,400,P.text,'left'));
  ch.push(r(x+w-34,y+2,34,18,`${label}/TB`,on?P.primary:P.border));
  ch.push(r(x+w-(on?4:18),y+4,14,14,`${label}/TD`,'#FFFFFF'));
  if(sub){ch.push(t(x,y+22,w,9,`${label}/TS`,sub,8,400,P.muted,'left'));return y+34;}
  return y+24;
}

function sec(ch,r,t,P,rx,ry,rw,key,label) {
  ch.push(r(rx,ry,rw,20,`${key}/SH`,P.secBg));
  ch.push(t(rx+6,ry+3,rw-12,13,`${key}/SHL`,label,10,600,P.muted,'left'));
  return ry+20;
}

// ── SCR-031: Viewpoint-Verwaltung ───────────────────────────────────────────
function sViewpoints(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR031-Viewpoints`);
  const ch=[change];
  shell(ch,r,t,FW,P,'Viewpoints  ·  5 defined  ·  1 selected','Viewpoint-Verwaltung',
    [['+ New Viewpoint',false],['Save',true]]);

  const LW=240, DIV=4, RW=280, CX=LW+DIV, CW=FW-LW-DIV*2-RW, RX=CX+CW+DIV;

  // ── Left: Viewpoint list ──
  ch.push(r(0,MAIN_Y,LW,MAIN_H,'LP/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LW,24,'LP/H',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+5,LW-16,13,'LP/HT','Viewpoints  (5)',11,600,P.text,'left'));
  const vps=[
    {n:'Solution Architecture',  sel:true,  locked:false, uc:'UC-12'},
    {n:'Application Landscape',  sel:false, locked:false, uc:'UC-05'},
    {n:'Technology View',        sel:false, locked:false, uc:'UC-05'},
    {n:'Business Context',       sel:false, locked:false, uc:'UC-05'},
    {n:'Conformance View',       sel:false, locked:true,  uc:'UC-20'},
  ];
  let ly=MAIN_Y+28;
  vps.forEach((v,i)=>{
    const bg=v.sel?P.selBg:P.panel;
    ch.push(r(0,ly,LW,32,`VP/${i}Bg`,bg,1,v.sel?P.primary:P.border,v.sel?0:0.3));
    ch.push(r(6,ly+9,10,14,`VP/${i}Dot`,'#0EA5E9',v.sel?1:0.3));
    ch.push(t(20,ly+6,LW-48,13,`VP/${i}L`,v.n,10,v.sel?600:400,v.sel?P.primary:P.text,'left'));
    ch.push(t(20,ly+19,LW-48,9,`VP/${i}S`,v.uc+(v.locked?'  🔒':''),8,400,P.muted,'left'));
    ly+=32;
  });

  // ── Center: Rule Editor (Solution Architecture selected) ──
  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'CTR/Bg',P.panel));
  // Header
  ch.push(r(CX,MAIN_Y,CW,40,'CTR/H',P.secBg,1,P.border,1));
  ch.push(t(CX+8,MAIN_Y+8,CW-80,14,'CTR/HN','Solution Architecture',13,700,P.text,'left'));
  ch.push(t(CX+8,MAIN_Y+22,CW-80,11,'CTR/HS','Shows Application + Technology layers with key relations',9,400,P.muted,'left'));
  // Tabs
  const tabs=['Entity Types','Relation Types','Layers','Preview'];
  let tx=CX; const TAB_Y=MAIN_Y+40;
  ch.push(r(CX,TAB_Y,CW,28,'CTR/TabBg',P.panelAlt,1,P.border,1));
  tabs.forEach((tab,i)=>{
    const tw=Math.round(CW/tabs.length); const act=i===0;
    ch.push(r(tx,TAB_Y,tw,28,`CTR/T${i}`,act?P.panel:P.panelAlt,1,act?P.primary:P.border,act?1.5:0.4));
    if(act) ch.push(r(tx,TAB_Y+26,tw,2,`CTR/TU${i}`,P.primary));
    ch.push(t(tx,TAB_Y+7,tw,14,`CTR/TL${i}`,tab,10,act?600:400,act?P.primary:P.muted,'center'));
    tx+=tw;
  });
  // Entity types grid
  let ety=TAB_Y+36; const etx=CX+8;
  ch.push(t(etx,ety,CW-16,11,'ETSub','Erlaubte Entity-Typen — angezeigt im Diagramm-Editor bei aktivem Viewpoint:',9,500,P.muted,'left'));
  ety+=16;
  const etypes=[
    {id:'AC',c:'#2563EB',on:true}, {id:'TC',c:'#0891B2',on:true}, {id:'IF',c:'#7C3AED',on:true},
    {id:'BO',c:'#D97706',on:false},{id:'ACT',c:'#059669',on:true}, {id:'DO',c:'#6D28D9',on:false},
    {id:'CAP',c:'#DC2626',on:false},{id:'BP',c:'#0F172A',on:false},
  ];
  etypes.forEach((e,i)=>{
    const ex=etx+(i%4)*((CW-24)/4+2); const ey2=ety+Math.floor(i/4)*44;
    const ew=Math.floor((CW-24)/4);
    ch.push(r(ex,ey2,ew,36,`ET/${e.id}Bg`,e.on?P.selBg:P.panelAlt,1,e.on?P.primary:P.border,e.on?1.5:1));
    ch.push(r(ex+4,ey2+8,e.on?14:14,14,`ET/${e.id}CB`,e.on?P.primary:P.inputBg,1,e.on?P.primary:P.border,1));
    if(e.on) ch.push(t(ex+4,ey2+9,14,12,`ET/${e.id}CBT`,'✓',8,700,'#FFFFFF','center'));
    ch.push(r(ex+22,ey2+9,26,16,`ET/${e.id}Icon`,e.c,0.15,e.c,1));
    ch.push(t(ex+22,ey2+10,26,11,`ET/${e.id}IT`,e.id,8,700,e.c,'center'));
    ety=ety; // keep ref
  });
  ety+=94;
  // Relation types (simplified)
  ch.push(r(CX,ety,CW,1,'CTR/Sep1',P.border,0.5)); ety+=8;
  ch.push(t(etx,ety,CW-16,11,'RLSub','Erlaubte Relation-Typen:',9,500,P.muted,'left')); ety+=14;
  const rels=[{n:'uses',on:true},{n:'serves',on:true},{n:'realizes',on:true},{n:'flows to',on:false},{n:'triggers',on:false},{n:'composed of',on:true}];
  rels.forEach((rel,i)=>{
    const rx2=etx+(i%3)*((CW-24)/3+2); const ry2=ety+Math.floor(i/3)*28;
    const rw=Math.floor((CW-24)/3);
    ch.push(r(rx2,ry2,rw,22,`RL/${rel.n}Bg`,rel.on?P.selBg:P.panelAlt,1,rel.on?P.primary:P.border,rel.on?1:0.5));
    ch.push(r(rx2+4,ry2+5,12,12,`RL/${rel.n}CB`,rel.on?P.primary:P.inputBg,1,rel.on?P.primary:P.border,1));
    if(rel.on) ch.push(t(rx2+4,ry2+6,12,10,`RL/${rel.n}CBT`,'✓',7,700,'#FFFFFF','center'));
    ch.push(t(rx2+20,ry2+5,rw-24,11,`RL/${rel.n}L`,rel.n,9,400,P.text,'left'));
  });

  // ── Right: Preview ──
  ch.push(r(RX,MAIN_Y,RW,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RX,MAIN_Y,RW,24,'RP/H',P.secBg,1,P.border,1));
  ch.push(t(RX+8,MAIN_Y+5,RW-16,13,'RP/HT','Vorschau',11,600,P.text,'left'));
  ch.push(r(RX+8,MAIN_Y+28,RW-16,FH-MAIN_Y-72,'RP/Prev',P.panelAlt,1,P.border,0.5));
  // Mini diagram preview
  const px=RX+16, py=MAIN_Y+36, pw=RW-32;
  [[0,'AC','Auth-Service','#2563EB'],[1,'TC','PostgreSQL','#0891B2'],[2,'IF','REST API','#7C3AED']].forEach(([i,tp,nm,c])=>{
    const nx=px+4+i*(pw/3-4); const ny=py+20;
    ch.push(r(nx,ny,pw/3-8,40,`PR/${i}Bg`,P.panel,1,c,1));
    ch.push(r(nx,ny,pw/3-8,10,`PR/${i}H`,c,0.15));
    ch.push(t(nx+2,ny+1,20,8,`PR/${i}TP`,tp,6,700,c,'center'));
    ch.push(t(nx+2,ny+13,pw/3-12,10,`PR/${i}N`,nm,8,500,P.text,'center'));
  });
  ch.push(r(px+pw/6,py+60,pw*2/3,2,'PR/Line',P.muted,0.5));
  ch.push(t(px+pw/3,py+54,pw/3,8,'PR/LArrow','→',8,700,P.muted,'center'));
  ch.push(t(RX+8,py+80,RW-16,10,'PR/Note','BO, DO, BP, ACT ausgeblendet',8,400,P.muted,'center'));

  return{frameId,changes:ch};
}

// ── SCR-032: Property-Sichtbarkeit ──────────────────────────────────────────
function sPropertyVisibility(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR032-PropVisibility`);
  const ch=[change];
  shell(ch,r,t,FW,P,'Property-Sichtbarkeit  ·  Rollen-Matrix','Property-Sichtbarkeit konfigurieren',
    [['Reset',false],['Save',true]]);

  const roles=['Admin','Architect','Reviewer','Viewer','Public'];
  const COL0=220, ROLE_W=Math.floor((FW-COL0-16)/roles.length);
  const props=[
    {mt:'AC',k:'name',       vis:{Admin:'always',Architect:'always',Reviewer:'always',Viewer:'always',Public:'always'}},
    {mt:'AC',k:'version',    vis:{Admin:'always',Architect:'always',Reviewer:'always',Viewer:'default',Public:'hidden'}},
    {mt:'AC',k:'lifecycle',  vis:{Admin:'always',Architect:'always',Reviewer:'always',Viewer:'always',Public:'default'}},
    {mt:'AC',k:'owner',      vis:{Admin:'always',Architect:'always',Reviewer:'hidden',Viewer:'hidden',Public:'hidden'}},
    {mt:'AC',k:'criticality',vis:{Admin:'always',Architect:'always',Reviewer:'always',Viewer:'hidden',Public:'hidden'}},
    {mt:'AC',k:'environment',vis:{Admin:'always',Architect:'always',Reviewer:'hidden',Viewer:'hidden',Public:'hidden'}},
    {mt:'TC',k:'name',       vis:{Admin:'always',Architect:'always',Reviewer:'always',Viewer:'always',Public:'always'}},
    {mt:'TC',k:'version',    vis:{Admin:'always',Architect:'always',Reviewer:'always',Viewer:'default',Public:'hidden'}},
    {mt:'TC',k:'licenseType',vis:{Admin:'always',Architect:'always',Reviewer:'hidden',Viewer:'hidden',Public:'hidden'}},
  ];

  // Filter bar
  ch.push(r(0,MAIN_Y,FW,32,'FB/Bg',P.secBg,1,P.border,0.5));
  ch.push(t(8,MAIN_Y+9,60,13,'FB/FL','MetaType:',10,500,P.muted,'left'));
  ch.push(r(72,MAIN_Y+5,100,22,'FB/FF',P.inputBg,1,P.primary,1.5));
  ch.push(t(76,MAIN_Y+9,92,12,'FB/FV','AC, TC',10,500,P.primary,'left'));
  ch.push(t(FW-200,MAIN_Y+9,192,11,'FB/Note','Sichtbarkeit gilt als Mindestanforderung — Admins sehen immer alles.',9,400,P.muted,'right'));

  // Header row
  const HDR_Y=MAIN_Y+32;
  ch.push(r(0,HDR_Y,FW,28,'MH/Bg',P.secBg,1,P.border,1));
  ch.push(t(8,HDR_Y+8,COL0-8,12,'MH/P','Property',10,600,P.muted,'left'));
  roles.forEach((role,i)=>{
    const rx=COL0+i*ROLE_W;
    ch.push(r(rx,HDR_Y,ROLE_W,28,`MH/R${i}`,P.secBg,1,P.border,0.5));
    ch.push(t(rx,HDR_Y+8,ROLE_W,12,`MH/RL${i}`,role,10,600,P.primary,'center'));
  });

  // Rows
  let py=HDR_Y+28;
  const visCol={always:L.green,default:P.primary,hidden:P.muted};
  const visBg={always:L.greenBg,default:P.selBg,hidden:P.panelAlt};
  let lastMT='';
  props.forEach((p,i)=>{
    if(p.mt!==lastMT){
      ch.push(r(0,py,FW,18,'MT/'+p.mt,P.panelAlt,1,P.border,0.5));
      ch.push(t(8,py+3,80,11,'MT/'+p.mt+'L',`[${p.mt}]`,9,700,P.primary,'left'));
      py+=18; lastMT=p.mt;
    }
    const bg=i%2===0?P.panel:P.panelAlt;
    ch.push(r(0,py,FW,28,`PR/${p.k}Bg`,bg,1,P.border,0.3));
    ch.push(t(8,py+8,COL0-8,12,`PR/${p.k}L`,p.k,10,400,P.text,'left'));
    roles.forEach((role,j)=>{
      const vis=p.vis[role]; const rx=COL0+j*ROLE_W;
      const vc=visCol[vis]||P.muted; const vb=visBg[vis]||P.panelAlt;
      ch.push(r(rx+4,py+6,ROLE_W-8,16,`PR/${p.k}R${j}`,vb,1,vc,0.6));
      ch.push(t(rx+4,py+8,ROLE_W-8,11,`PR/${p.k}RT${j}`,vis,8,500,vc,'center'));
    });
    py+=28;
  });
  ch.push(r(0,py+4,FW,28,'AddPropBg',P.panelAlt,1,P.border,0.3));
  ch.push(t(FW/2-80,py+11,160,13,'AddPropT','+ Weitere Property hinzufügen',10,400,P.muted,'center'));

  return{frameId,changes:ch};
}

// ── SCR-033: TRM-Konfiguration ───────────────────────────────────────────────
function sTRM(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR033-TRM`);
  const ch=[change];
  shell(ch,r,t,FW,P,'TRM  ·  Technology Reference Model  ·  42 Einträge','TRM-Konfiguration',
    [['Import TRM',false],['+ Add',false],['Save',true]]);

  const LW=220, DIV=4, CX=LW+DIV, CW=FW-LW-DIV;

  // Left: Category tree
  ch.push(r(0,MAIN_Y,LW,MAIN_H,'LT/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LW,24,'LT/H',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+5,LW-16,13,'LT/HT','Kategorien',11,600,P.text,'left'));
  const cats=[
    {n:'Frontend Technologies', n2:9, sel:false, exp:true},
    {n:'  Web Frameworks',      n2:4, sel:false, exp:false, sub:true},
    {n:'  Build Tools',         n2:3, sel:false, exp:false, sub:true},
    {n:'Backend Technologies',  n2:12,sel:true,  exp:true},
    {n:'  Frameworks',          n2:5, sel:false, exp:false, sub:true},
    {n:'  Runtimes',            n2:4, sel:false, exp:false, sub:true},
    {n:'Database Technologies', n2:8, sel:false, exp:false},
    {n:'Infrastructure',        n2:13,sel:false, exp:false},
  ];
  let ly=MAIN_Y+28;
  cats.forEach((c,i)=>{
    const bg=c.sel?P.selBg:P.panel; const indent=c.sub?22:6;
    ch.push(r(0,ly,LW,24,`CAT/${i}Bg`,bg));
    ch.push(t(indent,ly+5,8,13,`CAT/${i}Arr`,c.exp?'▼':c.sub?'':'▶',8,700,P.muted,'center'));
    ch.push(t(indent+10,ly+5,LW-indent-34,12,`CAT/${i}L`,c.n.trim(),9,c.sel?600:400,c.sel?P.primary:P.text,'left'));
    ch.push(r(LW-30,ly+6,22,12,`CAT/${i}Cnt`,P.tag||P.secBg,1,P.border,0.5));
    ch.push(t(LW-30,ly+7,22,9,`CAT/${i}CntT`,String(c.n2),8,500,P.muted,'center'));
    ly+=24;
  });

  // Right: TRM table
  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'TT/Bg',P.panel));
  // Filter bar
  ch.push(r(CX,MAIN_Y,CW,32,'TT/FB',P.secBg,1,P.border,1));
  ch.push(r(CX+8,MAIN_Y+5,200,22,'TT/Srch',P.inputBg,1,P.border,1));
  ch.push(t(CX+12,MAIN_Y+10,192,12,'TT/SrchT','Suche Technologie...',10,400,P.muted,'left'));
  const statuses=['All','approved','emerging','deprecated','prohibited'];
  let sx=CX+216;
  statuses.forEach((s,i)=>{
    const active=i===0; const sw=s.length*7+12;
    ch.push(r(sx,MAIN_Y+5,sw,22,`TT/SF${i}`,active?P.selBg:P.inputBg,1,active?P.primary:P.border,1));
    ch.push(t(sx,MAIN_Y+10,sw,12,`TT/SFL${i}`,s,9,active?600:400,active?P.primary:P.muted,'center'));
    sx+=sw+4;
  });
  // Table header
  const trmCols=[{k:'name',w:200,l:'Technologie'},{k:'ver',w:100,l:'Version'},{k:'status',w:110,l:'Status'},{k:'sunset',w:110,l:'Ablösung bis'},{k:'repl',w:160,l:'Ersetzt durch'},{k:'owner',w:100,l:'Owner'}];
  const THY=MAIN_Y+32;
  ch.push(r(CX,THY,CW,24,'TT/TH',P.secBg,1,P.border,1));
  let tcx=CX+8;
  trmCols.forEach(c=>{ch.push(t(tcx,THY+6,c.w-8,12,`TT/CH${c.k}`,c.l,9,600,P.muted,'left'));tcx+=c.w;});

  const entries=[
    {name:'Java / OpenJDK',  ver:'21 LTS', status:'approved',   sunset:'—',       repl:'—',               owner:'Backend'},
    {name:'Spring Boot',     ver:'3.3',    status:'approved',   sunset:'—',       repl:'—',               owner:'Backend'},
    {name:'Quarkus',         ver:'3.x',    status:'emerging',   sunset:'—',       repl:'—',               owner:'Backend'},
    {name:'Python 3',        ver:'3.12',   status:'approved',   sunset:'—',       repl:'—',               owner:'Data'},
    {name:'Node.js',         ver:'22 LTS', status:'approved',   sunset:'—',       repl:'—',               owner:'Frontend'},
    {name:'Java EE 8',       ver:'8',      status:'deprecated', sunset:'2026-12', repl:'Spring Boot 3',   owner:'Backend'},
    {name:'Log4j 1.x',       ver:'1.2',   status:'prohibited', sunset:'SOFORT',  repl:'Log4j 2 / Logback',owner:'Security'},
    {name:'Python 2',        ver:'2.7',   status:'prohibited', sunset:'—',       repl:'Python 3',        owner:'Backend'},
  ];
  const stCol2={approved:L.green,emerging:L.amber,deprecated:L.amber,prohibited:L.red};
  let try2=THY+24;
  entries.forEach((e,i)=>{
    const bg=i%2===0?P.panel:P.panelAlt;
    ch.push(r(CX,try2,CW,28,`TRM/${i}Bg`,bg,1,P.border,0.3));
    const vals=[e.name,e.ver,'',e.sunset,e.repl,e.owner];
    let vcx=CX+8;
    trmCols.forEach((c,j)=>{
      if(j===2){
        const sc2=stCol2[e.status]||P.muted;
        ch.push(r(vcx,try2+7,c.w-8,14,`TRM/${i}StBg`,sc2,0.12,sc2,0.5));
        ch.push(t(vcx+4,try2+8,c.w-12,10,`TRM/${i}StT`,e.status,8,600,sc2,'left'));
      } else {
        const tc=e.status==='prohibited'&&j===0?L.red:P.text;
        ch.push(t(vcx,try2+8,c.w-8,12,`TRM/${i}C${j}`,vals[j],9,e.status==='prohibited'&&j===0?600:400,tc,'left'));
      }
      vcx+=c.w;
    });
    try2+=28;
  });

  return{frameId,changes:ch};
}

// ── SCR-034: Continuum-Bausteine ─────────────────────────────────────────────
function sContinuum(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR034-Continuum`);
  const ch=[change];
  shell(ch,r,t,FW,P,'Enterprise Continuum  ·  4 Ebenen  ·  23 Bausteine','Continuum-Bausteine verwalten',
    [['+ Baustein',false],['Import',false],['Save',true]]);

  // 4 horizontal level bands
  const lvls=[
    {n:'Foundation Architecture',lbl:'Generische Konzepte (TOGAF, ArchiMate)',col:'#7C3AED',items:['Business Object','Actor','Interface','Role','Capability']},
    {n:'Common Systems Architecture',lbl:'Wiederverwendbare Bausteine (branchenübergreifend)',col:'#0284C7',items:['Application Component','Technology Component','Data Object']},
    {n:'Industry Architecture',lbl:'Branchenspezifische Referenzarchitektur',col:'#059669',items:['ERP-Modul','CRM-Integration','Compliance-Framework']},
    {n:'Organisation Architecture',lbl:'OEA-spezifische Bausteine',col:'#D97706',items:['Auth-Service','OEA-Data-Warehouse','Reporting-Mart'],sel:true},
  ];
  const BAND_H=Math.floor(MAIN_H/lvls.length);
  lvls.forEach((lv,i)=>{
    const by=MAIN_Y+i*BAND_H;
    ch.push(r(0,by,FW,BAND_H,`LV/${i}Bg`,lv.sel?P.selBg:P.panel,1,lv.col,lv.sel?1:0.5));
    // Level label (left)
    ch.push(r(0,by,180,BAND_H,`LV/${i}HL`,lv.col,lv.sel?0.12:0.06));
    ch.push(t(8,by+8,164,13,`LV/${i}N`,lv.n,10,700,lv.col,'left'));
    ch.push(t(8,by+22,164,11,`LV/${i}Sub`,lv.lbl,8,400,P.muted,'left'));
    ch.push(r(0,by+BAND_H-1,FW,1,`LV/${i}Sep`,lv.col,0.3));
    // Items
    lv.items.forEach((item,j)=>{
      const ix=188+j*180; const iy=by+12;
      if(ix+172>FW) return;
      ch.push(r(ix,iy,172,BAND_H-28,`IT/${i}_${j}Bg`,P.panel,1,lv.col,lv.sel?1.5:0.8));
      ch.push(r(ix,iy,172,6,`IT/${i}_${j}Bar`,lv.col));
      ch.push(t(ix+6,iy+12,160,12,`IT/${i}_${j}N`,item,10,600,P.text,'left'));
      ch.push(t(ix+6,iy+26,160,9,`IT/${i}_${j}S`,lv.n.split(' ')[0]+' level',7,400,P.muted,'left'));
      if(lv.sel&&j===0){
        ch.push(r(ix+160,iy+4,8,8,`IT/${i}_${j}Sel`,P.primary,1,P.primary,1));
      }
    });
    if(lv.sel){
      ch.push(r(FW-52,by+8,44,20,'LV/AddBtn',lv.col,0.15,lv.col,1));
      ch.push(t(FW-52,by+12,44,11,'LV/AddBtnT','+ Add',8,600,lv.col,'center'));
    }
  });

  return{frameId,changes:ch};
}

// ── SCR-035: Paket importieren ───────────────────────────────────────────────
function sPackageImport(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR035-PackageImport`);
  const ch=[change];
  shell(ch,r,t,FW,P,'Continuum-Paket importieren  ·  Schritt 2 von 4','Continuum-Paket importieren',
    [['← Zurück',false],['Weiter →',true]]);

  // Step indicator
  const STEP_Y=MAIN_Y+8; const steps=['1 Upload','2 Vorschau','3 Konflikte','4 Bestätigen'];
  const SW=(FW-32)/steps.length;
  steps.forEach((s,i)=>{
    const done=i<1; const active=i===1; const sx=16+i*SW;
    ch.push(r(sx,STEP_Y,SW-4,28,`ST/${i}Bg`,active?P.selBg:done?L.greenBg:P.panelAlt,1,active?P.primary:done?L.green:P.border,active?1.5:1));
    ch.push(t(sx,STEP_Y+7,SW-4,13,`ST/${i}L`,s,10,active?700:done?600:400,active?P.primary:done?L.green:P.muted,'center'));
    if(i<steps.length-1) ch.push(t(sx+SW-8,STEP_Y+7,12,13,`ST/${i}Arr`,'›',11,700,P.muted,'center'));
  });

  // Main content area: package preview
  const CY=MAIN_Y+44; const CX=16; const CW2=FW-32;
  ch.push(r(CX,CY,CW2,FH-CY-48,'CNT/Bg',P.panel,1,P.border,1));

  // Package header
  ch.push(r(CX,CY,CW2,40,'PKG/H',P.secBg,1,P.border,1));
  ch.push(t(CX+8,CY+8,CW2-160,14,'PKG/Name','togaf-foundation-v2.3.0.oea-pkg',12,700,P.text,'left'));
  ch.push(t(CX+8,CY+22,CW2-160,11,'PKG/Meta','JSON  ·  142 KB  ·  SHA256: a3f8c12d...  ·  Signiert: ✓ valid',9,400,P.muted,'left'));
  ch.push(r(CX+CW2-96,CY+8,88,24,'PKG/SigBadge',L.greenBg,1,L.green,1));
  ch.push(t(CX+CW2-96,CY+13,88,13,'PKG/SigBadgeT','✓ Signatur OK',9,600,L.green,'center'));

  // 3 sections side by side
  const SEC_Y=CY+44; const SEC_H=FH-SEC_Y-52; const SEC_W=Math.floor(CW2/3)-4;
  const sections=[
    {k:'new',    lbl:'Neu  (12)',          col:L.green,   items:['BusinessObject','Actor','Interface','Role','Capability','Technology Component','Data Object','ERP-Modul','CRM-Integration','Compliance-Framework','Application Component','Process']},
    {k:'update', lbl:'Aktualisiert  (4)',  col:L.amber,   items:['Application Component v1→v2','Actor (description)','Role (properties +2)','Capability (relations +3)']},
    {k:'conflict',lbl:'Konflikte  (2)',    col:L.red,     items:['⚠  Application Component [AC]: Name-Kollision mit lokalem Typ','⚠  Interface [IF]: Property-Typ inkompatibel (string→enum)']},
  ];
  sections.forEach((s,i)=>{
    const sx2=CX+i*(SEC_W+4);
    ch.push(r(sx2,SEC_Y,SEC_W,SEC_H,`SEC/${s.k}Bg`,P.panelAlt,1,s.col,0.8));
    ch.push(r(sx2,SEC_Y,SEC_W,24,`SEC/${s.k}H`,s.col,0.12,s.col,0.8));
    ch.push(t(sx2+6,SEC_Y+5,SEC_W-12,13,`SEC/${s.k}L`,s.lbl,10,700,s.col,'left'));
    s.items.forEach((item,j)=>{
      const iy=SEC_Y+28+j*20;
      if(iy+18>SEC_Y+SEC_H) return;
      const isWarn=item.startsWith('⚠');
      ch.push(r(sx2,iy,SEC_W,20,`SEC/${s.k}R${j}`,j%2===0?P.panel:P.panelAlt,0,P.border,0));
      ch.push(t(sx2+6,iy+4,SEC_W-12,11,`SEC/${s.k}I${j}`,item,8,isWarn?600:400,isWarn?L.red:P.text,'left'));
    });
  });

  ch.push(t(CX+8,FH-38,CW2-120,11,'CNT/Note','Konflikt-Auflösung im nächsten Schritt. Neue Bausteine werden in «Organisation Architecture»-Ebene eingeordnet.',9,400,P.muted,'left'));

  return{frameId,changes:ch};
}

// ── SCR-036: Conformance-Analyse ─────────────────────────────────────────────
function sConformance(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR036-Conformance`);
  const ch=[change];
  shell(ch,r,t,FW,P,'Conformance-Analyse  ·  24 Regeln  ·  14 Verletzungen','Conformance-Analyse',
    [['Neu analysieren',false],['Export Report',false]]);

  const LW=220, CX=LW+4, CW=FW-LW-4;

  // Left: severity summary
  ch.push(r(0,MAIN_Y,LW,MAIN_H,'SB/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LW,24,'SB/H',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+5,LW-16,13,'SB/HT','Zusammenfassung',10,600,P.text,'left'));
  let sy2=MAIN_Y+28;
  const summary=[{sev:'Critical',n:1,c:L.red},{sev:'High',n:3,c:L.amber},{sev:'Medium',n:7,c:'#D97706'},{sev:'Info',n:3,c:P.muted}];
  summary.forEach(s=>{
    ch.push(r(0,sy2,LW,36,`SUM/${s.sev}Bg`,P.panel));
    ch.push(r(0,sy2,4,36,`SUM/${s.sev}Bar`,s.c));
    ch.push(t(12,sy2+4,60,13,`SUM/${s.sev}N`,String(s.n),16,700,s.c,'left'));
    ch.push(t(12,sy2+20,LW-20,11,`SUM/${s.sev}L`,s.sev,9,500,P.text,'left'));
    sy2+=36;
  });
  ch.push(r(0,sy2+4,LW,1,'SB/Sep',P.border));
  sy2+=12;
  ch.push(t(8,sy2,LW-16,11,'SB/RulesHT','Regelkategorien',9,600,P.muted,'left')); sy2+=14;
  [['Metamodell-Konsistenz',8,2],['Layer-Regeln',6,5],['Datenqualität',6,4],['TRM-Compliance',4,3]].forEach(([cat,total,viol])=>{
    ch.push(t(8,sy2,LW-16,11,'SB/R'+cat.slice(0,5),`${cat}  (${viol}/${total})`,9,400,viol>0?L.amber:L.green,'left'));
    sy2+=16;
  });

  // Right: violations table
  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'VT/Bg',P.panel));
  // Filter
  ch.push(r(CX,MAIN_Y,CW,32,'VT/FB',P.secBg,1,P.border,1));
  ch.push(r(CX+8,MAIN_Y+5,180,22,'VT/Srch',P.inputBg,1,P.border,1));
  ch.push(t(CX+12,MAIN_Y+10,172,12,'VT/SrchT','Filter Verletzungen...',10,400,P.muted,'left'));
  ['All','Critical','High','Medium','Info'].forEach((sev,i)=>{
    const active=i===0; const sx2=CX+196+i*70;
    ch.push(r(sx2,MAIN_Y+5,66,22,`VT/SF${i}`,active?P.selBg:P.inputBg,1,active?P.primary:P.border,1));
    ch.push(t(sx2,MAIN_Y+10,66,12,`VT/SFL${i}`,sev,9,active?600:400,active?P.primary:P.muted,'center'));
  });

  // Table header
  const VTHDR_Y=MAIN_Y+32; const vtcols=[{k:'sev',w:80},{k:'rule',w:260},{k:'entity',w:200},{k:'cnt',w:80},{k:'action',w:120}];
  ch.push(r(CX,VTHDR_Y,CW,24,'VT/TH',P.secBg,1,P.border,1));
  let vcx=CX+8;
  ['Schwere','Regel','Betroffene Entität','Anzahl','Aktion'].forEach((h,i)=>{
    ch.push(t(vcx,VTHDR_Y+6,vtcols[i].w-8,12,`VT/CH${i}`,h,9,600,P.muted,'left'));
    vcx+=vtcols[i].w;
  });

  const violations=[
    {sev:'Critical',c:L.red,   rule:'Verbotene Technologie (Log4j 1.x) in Verwendung',entity:'Reporting-Engine [AC]',cnt:1},
    {sev:'High',    c:L.amber, rule:'Application Component ohne Owner',entity:'Multiple (3)',cnt:3},
    {sev:'High',    c:L.amber, rule:'Relation gegen Layer-Richtung verletzt',entity:'Auth-Service → DB [TC]',cnt:1},
    {sev:'High',    c:L.amber, rule:'Interface ohne realisierende Komponente',entity:'ITSM-Webhook [IF]',cnt:1},
    {sev:'Medium',  c:'#D97706',rule:'Pflichtfeld «lifecycle» fehlt',entity:'Multiple (6)',cnt:6},
    {sev:'Medium',  c:'#D97706',rule:'Deprecated TC noch in active AC referenziert',entity:'ERP-Adapter [AC]',cnt:1},
    {sev:'Info',    c:P.muted, rule:'Beschreibung fehlt (empfohlen)',entity:'Multiple (3)',cnt:3},
  ];
  let vty=VTHDR_Y+24;
  violations.forEach((v,i)=>{
    const bg=i%2===0?P.panel:P.panelAlt;
    ch.push(r(CX,vty,CW,30,`VL/${i}Bg`,bg,1,P.border,0.3));
    ch.push(r(CX,vty,4,30,`VL/${i}Bar`,v.c));
    let vvcx=CX+8+4;
    ch.push(r(vvcx,vty+8,64,14,`VL/${i}SB`,v.c,0.12,v.c,0.5));
    ch.push(t(vvcx+2,vty+9,62,10,`VL/${i}ST`,v.sev,8,600,v.c,'center'));vvcx+=vtcols[0].w;
    ch.push(t(vvcx,vty+9,vtcols[1].w-8,12,`VL/${i}Rule`,v.rule,9,400,P.text,'left'));vvcx+=vtcols[1].w;
    ch.push(t(vvcx,vty+9,vtcols[2].w-8,12,`VL/${i}Ent`,v.entity,9,400,P.muted,'left'));vvcx+=vtcols[2].w;
    ch.push(t(vvcx,vty+9,vtcols[3].w-8,12,`VL/${i}Cnt`,String(v.cnt),9,600,v.c,'center'));vvcx+=vtcols[3].w;
    ch.push(r(vvcx,vty+7,vtcols[4].w-8,16,`VL/${i}Act`,P.inputBg,1,P.border,1));
    ch.push(t(vvcx,vty+10,vtcols[4].w-8,11,`VL/${i}ActT`,'Ansehen →',8,500,P.primary,'center'));
    vty+=30;
  });

  return{frameId,changes:ch};
}

// ── SCR-037: Auth-Konfiguration ──────────────────────────────────────────────
function sAuthConfig(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR037-AuthConfig`);
  const ch=[change];
  shell(ch,r,t,FW,P,'Auth-Konfiguration  ·  OIDC ausgewählt  ·  ⚠ Nicht gespeichert','Auth-Konfiguration (Admin)',
    [['Test Connection',false],['Save',true]]);

  const LW=220, DIV=4, RW=240, CX=LW+DIV, CW=FW-LW-DIV*2-RW, RX=CX+CW+DIV;

  // Left: Provider list
  ch.push(r(0,MAIN_Y,LW,MAIN_H,'LP/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LW,24,'LP/H',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+5,LW-16,13,'LP/HT','Auth-Provider',11,600,P.text,'left'));
  const providers=[
    {n:'OIDC / OAuth 2.0',    sub:'Keycloak (configured)',   enabled:true,  sel:true,  col:'#2563EB'},
    {n:'SAML 2.0',            sub:'Not configured',          enabled:false, sel:false, col:'#7C3AED'},
    {n:'Passkey / WebAuthn',  sub:'Active — 3 users',        enabled:true,  sel:false, col:'#059669'},
    {n:'Local Accounts',      sub:'Fallback only',           enabled:true,  sel:false, col:'#D97706'},
  ];
  let ply=MAIN_Y+28;
  providers.forEach((p,i)=>{
    const bg=p.sel?P.selBg:P.panel;
    ch.push(r(0,ply,LW,40,`PRV/${i}Bg`,bg,1,p.sel?P.primary:P.border,p.sel?0:0.3));
    ch.push(r(6,ply+12,8,16,`PRV/${i}Dot`,p.col,p.enabled?1:0.3));
    ch.push(t(18,ply+8,LW-50,12,`PRV/${i}N`,p.n,10,p.sel?600:400,p.sel?P.primary:P.text,'left'));
    ch.push(t(18,ply+20,LW-50,9,`PRV/${i}S`,p.sub,8,400,P.muted,'left'));
    ch.push(r(LW-26,ply+12,20,16,`PRV/${i}TBg`,p.enabled?P.green||L.green:P.border));
    ch.push(r(LW-(p.enabled?10:20),ply+14,12,12,`PRV/${i}TD`,'#FFFFFF'));
    ply+=40;
  });

  // Center: OIDC config form
  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'CTR/Bg',P.panel));
  ch.push(r(CX,MAIN_Y,CW,28,'CTR/H',P.secBg,1,P.border,1));
  ch.push(r(CX+8,MAIN_Y+8,20,12,'CTR/Icon','#2563EB'));
  ch.push(t(CX+32,MAIN_Y+8,CW-80,13,'CTR/HN','OIDC / OAuth 2.0 — Keycloak',12,700,P.text,'left'));
  // Tabs
  const atabs=['Verbindung','Claims-Mapping','Gruppen-Sync','Advanced'];
  let atx=CX; const ATY=MAIN_Y+28;
  ch.push(r(CX,ATY,CW,26,'CTR/TBg',P.panelAlt,1,P.border,1));
  atabs.forEach((tab,i)=>{
    const tw=Math.round(CW/atabs.length); const act=i===0;
    ch.push(r(atx,ATY,tw,26,`CTR/AT${i}`,act?P.panel:P.panelAlt,1,act?P.primary:P.border,act?1.5:0.4));
    if(act) ch.push(r(atx,ATY+24,tw,2,`CTR/ATU${i}`,P.primary));
    ch.push(t(atx,ATY+6,tw,14,`CTR/ATL${i}`,tab,10,act?600:400,act?P.primary:P.muted,'center'));
    atx+=tw;
  });

  let afy=ATY+34;
  afy=fld(ch,r,t,P,CX+8,afy,CW-16,'Discovery URL','https://auth.example.com/realms/oea/.well-known/openid-configuration',true);
  afy=fld(ch,r,t,P,CX+8,afy,CW-16,'Client ID','oea-client',false);
  afy=fld(ch,r,t,P,CX+8,afy,CW-16,'Client Secret','••••••••••••••••••••••••••••',false);
  afy=fld(ch,r,t,P,CX+8,afy,CW-16,'Scopes','openid profile email groups',false);
  afy=fld(ch,r,t,P,CX+8,afy,CW-16,'Redirect URI (read-only)','https://oea.example.com/auth/callback',false);
  afy+=4;
  afy=toggle(ch,r,t,P,CX+8,afy,CW-16,'PKCE erzwingen',true,'Empfohlen für öffentliche Clients (RFC 7636)');
  afy=toggle(ch,r,t,P,CX+8,afy,CW-16,'HTTPS erzwingen',true,'Ablehnen bei HTTP-only-Discovery-URL');
  afy=toggle(ch,r,t,P,CX+8,afy,CW-16,'Auto-Provisioning',true,'Unbekannte User beim ersten Login anlegen');
  afy+=4;
  ch.push(r(CX+8,afy,CW-16,28,'WARN/Bg',L.amberBg,1,L.amber,1));
  ch.push(t(CX+12,afy+8,CW-24,11,'WARN/T','⚠  Änderungen noch nicht gespeichert. Aktive Sessions werden beim Speichern nicht beendet.',9,500,L.amber,'left'));

  // Right: test panel
  ch.push(r(RX,MAIN_Y,RW,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RX,MAIN_Y,RW,24,'RP/H',P.secBg,1,P.border,1));
  ch.push(t(RX+8,MAIN_Y+5,RW-16,13,'RP/HT','Verbindungstest',10,600,P.text,'left'));
  let rpy=MAIN_Y+28;
  const testSteps=[
    {s:'Discovery URL abrufbar',ok:true},
    {s:'JWKS Endpoint erreichbar',ok:true},
    {s:'Client-ID akzeptiert',ok:true},
    {s:'Token-Endpoint Test',ok:true},
    {s:'Claim «groups» vorhanden',ok:null},
  ];
  testSteps.forEach((ts,i)=>{
    ch.push(r(RX,rpy,RW,24,`TS/${i}Bg`,P.panel));
    const ic=ts.ok===true?'✓':ts.ok===false?'✕':'⟳';
    const ic2=ts.ok===true?L.green:ts.ok===false?L.red:P.muted;
    ch.push(t(RX+8,rpy+6,14,11,`TS/${i}I`,ic,9,700,ic2,'center'));
    ch.push(t(RX+24,rpy+6,RW-32,11,`TS/${i}L`,ts.s,9,400,P.text,'left'));
    rpy+=24;
  });
  rpy+=4;
  ch.push(r(RX+8,rpy,RW-16,28,'RP/RunBtn',P.primary));
  ch.push(t(RX+8,rpy+8,RW-16,13,'RP/RunBtnT','Verbindungstest starten',10,600,'#FFFFFF','center'));
  rpy+=36;
  ch.push(t(RX+8,rpy,RW-16,10,'RP/LastT','Letzter Test: 2026-06-29 06:00 — OK',8,400,P.muted,'center'));

  return{frameId,changes:ch};
}

// ── SCR-038: System-Einstellungen ────────────────────────────────────────────
function sSystemSettings(pid,row,P,m) {
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/SCR038-SystemSettings`);
  const ch=[change];
  shell(ch,r,t,FW,P,'System-Einstellungen  ·  OEA Instance','System-Einstellungen',
    [['Restore Defaults',false],['Save',true]]);

  const LW=180, CX=LW+4, CW=FW-LW-4;

  // Left: settings nav
  ch.push(r(0,MAIN_Y,LW,MAIN_H,'SN/Bg',P.panel));
  const navs=[
    {n:'Allgemein',     sel:true},
    {n:'SMTP / E-Mail', sel:false},
    {n:'Speicher',      sel:false},
    {n:'Lizenz',        sel:false},
    {n:'Backup',        sel:false},
    {n:'Logs & Audit',  sel:false},
    {n:'API-Tokens',    sel:false},
  ];
  let nly=MAIN_Y+4;
  navs.forEach((n,i)=>{
    const bg=n.sel?P.selBg:P.panel;
    ch.push(r(0,nly,LW,28,`SN/${i}Bg`,bg));
    if(n.sel) ch.push(r(0,nly,3,28,`SN/${i}Bar`,P.primary));
    ch.push(t(12,nly+7,LW-20,13,`SN/${i}L`,n.n,10,n.sel?600:400,n.sel?P.primary:P.text,'left'));
    nly+=28;
  });

  // Right: General settings form
  ch.push(r(CX,MAIN_Y,CW,MAIN_H,'SF/Bg',P.panel));
  let sfy=MAIN_Y+8;
  const SFW=Math.min(600,CW-32); const SFX=CX+16;

  sfy=sec(ch,r,t,P,CX,sfy,CW,'GEN','Allgemeine Konfiguration'); sfy+=4;
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Instanz-Name','OEA Internal — Example Corp',true);
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Basis-URL','https://oea.example.com',false);
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Standard-Sprache','Deutsch (de-CH)',false);
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Zeitzone','Europe/Zurich (UTC+2)',false);
  sfy+=8;

  sfy=sec(ch,r,t,P,CX,sfy,CW,'SEC','Sicherheit'); sfy+=4;
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Session-Timeout','8 Stunden  (28800 s)',false);
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Max. Upload-Grösse','50 MB',false);
  sfy=toggle(ch,r,t,P,SFX,sfy,SFW,'Wartungsmodus',false,'Alle Logins ausser Admin sperren');
  sfy=toggle(ch,r,t,P,SFX,sfy,SFW,'Registrierung erlaubt',false,'Selbstregistrierung für neue User');
  sfy+=8;

  sfy=sec(ch,r,t,P,CX,sfy,CW,'APP','Anwendung'); sfy+=4;
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Max. Entitäten pro Katalog','10 000',false);
  sfy=fld(ch,r,t,P,SFX,sfy,SFW,'Audit-Log Aufbewahrung','365 Tage',false);
  sfy=toggle(ch,r,t,P,SFX,sfy,SFW,'Telemetrie (anonym)',true,'Aggregierte Nutzungsdaten — keine personenbezogenen Daten');
  sfy+=8;

  sfy=sec(ch,r,t,P,CX,sfy,CW,'LIC','Lizenz'); sfy+=4;
  ch.push(r(SFX,sfy,SFW,40,'LIC/Box',L.greenBg,1,L.green,1));
  ch.push(t(SFX+8,sfy+6,SFW-16,13,'LIC/T','AGPL-3.0 Community Edition',11,700,L.green,'left'));
  ch.push(t(SFX+8,sfy+20,SFW-16,10,'LIC/S','Open Source  ·  Unbegrenzte Nutzer  ·  Keine Ablauf',9,400,L.green,'left'));

  return{frameId,changes:ch};
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const outDir=path.join(__dirname,'..','..','docs','screens');
  const hasPenpot=!!(process.env.PENPOT_API_URL&&process.env.PENPOT_ACCESS_TOKEN&&process.env.PENPOT_PROJECT_ID);
  const pid='00000000-0000-0000-0000-000000000001';
  const modes=[{P:L,m:'Light'},{P:D,m:'Dark'}];
  const screens=[
    {fn:sViewpoints,         name:'viewpoints',        scr:'SCR-031'},
    {fn:sPropertyVisibility, name:'property-visibility',scr:'SCR-032'},
    {fn:sTRM,                name:'trm-config',         scr:'SCR-033'},
    {fn:sContinuum,          name:'continuum',          scr:'SCR-034'},
    {fn:sPackageImport,      name:'package-import',     scr:'SCR-035'},
    {fn:sConformance,        name:'conformance',        scr:'SCR-036'},
    {fn:sAuthConfig,         name:'auth-config',        scr:'SCR-037'},
    {fn:sSystemSettings,     name:'system-settings',    scr:'SCR-038'},
  ];

  if(hasPenpot){
    const PID=process.env.PENPOT_PROJECT_ID, API=process.env.PENPOT_API_URL;
    try{
      const profile=await rpc('get-profile',{});
      console.log(`Penpot: ${profile.email}`);
      const files=await rpc('get-project-files',{project_id:PID});
      for(const f of files.filter(f=>f.name&&f.name.includes('Admin')))
        await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Admin Screens v0.1',project_id:PID});
      const all=[];
      screens.forEach((sc,si)=>{
        modes.forEach(({P:MP,m:MM},mi)=>{
          const rowIdx=si*2+mi;
          all.push(canvasText(f.data.pages[0],-160,sy(rowIdx)+FH/2-10,150,20,`Lbl${si}${MM}`,`${sc.scr} ${MM}`,10,600,'#64748B','right'));
          const{changes}=sc.fn(f.data.pages[0],rowIdx,MP,MM);
          all.push(...changes);
        });
      });
      await rpc('update-file',{id:f.id,'session-id':f.id,revn:0,vern:0,changes:all});
      console.log(`Penpot: ${all.length} shapes  |  ${API}dashboard/projects/${PID}`);
    }catch(e){console.warn(`Penpot failed: ${e.message}`);}
  }else console.log('(Penpot skipped)');

  console.log('\nSVG ...');
  for(const sc of screens){
    for(const{P:MP,m:MM}of modes){
      const{changes}=sc.fn(pid,0,MP,MM);
      generateLocalSVG(changes[0],changes.slice(1),
        path.join(outDir,`${sc.name}-${MM.toLowerCase()}.svg`));
      console.log(`  ${sc.name}-${MM.toLowerCase()}.svg`);
    }
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
