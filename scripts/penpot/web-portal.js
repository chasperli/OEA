#!/usr/bin/env node
/**
 * OEA Web Portal — Read-only Publication (SCR-050 to SCR-054)
 * UC-06: Architektur-Katalog durchsuchen (read-only browser view)
 *
 * Screens per run:
 *   SCR-050 Portal-Startseite / Katalog-Übersicht
 *   SCR-051 Entity-Detailansicht (read-only)
 *   SCR-052 Diagramm-Viewer (read-only)
 *
 * The Web Portal is a Vue 3 SPA (ADR-009) optimised for browsers.
 * No sidebar Explorer — top navigation, breadcrumb, search-centered layout.
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280,FH=800,GAP=120;
const sy=row=>row*(FH+GAP);

// Portal colours (distinct from CA — lighter, more consumer-ish)
const L={
  bg:'#F8FAFC',panel:'#FFFFFF',
  topBar:'#0F172A',topText:'#F8FAFC',topMuted:'#94A3B8',
  primary:'#0EA5E9',primaryDark:'#0284C7',
  text:'#0F172A',muted:'#64748B',subtle:'#94A3B8',
  border:'#E2E8F0',card:'#FFFFFF',cardH:'#F0F9FF',
  badge:'#DBEAFE',badgeT:'#1D4ED8',
  tag:'#F1F5F9',tagT:'#475569',
  hero:'#0F172A',heroSub:'#CBD5E1',
  link:'#0284C7',
  statusText:'#94A3B8',
  gridH:'#CBD5E1',
  kpiBlue:'#2563EB',kpiGreen:'#059669',kpiAmber:'#D97706',kpiRed:'#DC2626',
};
const D={
  bg:'#0A1525',panel:'#1E293B',
  topBar:'#020617',topText:'#F8FAFC',topMuted:'#64748B',
  primary:'#38BDF8',primaryDark:'#7DD3FC',
  text:'#F1F5F9',muted:'#94A3B8',subtle:'#64748B',
  border:'#334155',card:'#1E293B',cardH:'#0C2845',
  badge:'#1E3A5F',badgeT:'#93C5FD',
  tag:'#1E293B',tagT:'#94A3B8',
  hero:'#F1F5F9',heroSub:'#94A3B8',
  link:'#38BDF8',
  statusText:'#64748B',
  gridH:'#334155',
  kpiBlue:'#60A5FA',kpiGreen:'#34D399',kpiAmber:'#FBBF24',kpiRed:'#F87171',
};

// ─── SCR-050: Portal-Startseite / Katalog-Übersicht ─────────────────────────
function sPortalHome(pid,rowBase,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(rowBase),FW,FH,`${m}/SCR050-PortalHome`);
  const ch=[change];

  // ── TOP BAR ──
  const TB_H=56;
  ch.push(r(0,0,FW,TB_H,'TB/Bg',P.topBar));
  // Logo + brand
  ch.push(r(16,14,28,28,'TB/Logo',P.primary));
  ch.push(t(16,16,28,24,'TB/LogoT','OEA',10,700,'#FFFFFF','center'));
  ch.push(t(50,18,80,14,'TB/Brand','Open EA',12,700,P.topText,'left'));
  ch.push(t(50,32,100,11,'TB/Instance','Internal Portal',9,400,P.topMuted,'left'));
  // Nav links
  [['Catalog',170],['Diagrams',248],['Dashboards',326],['Audit Log',424]].forEach(([l,x])=>
    ch.push(t(x,20,74,16,`TB/N${l}`,l,12,400,l==='Catalog'?P.primary:P.topMuted,'center')));
  ch.push(r(170,51,74,2,'TB/NA',P.primary));
  // Search
  ch.push(r(520,12,380,32,'TB/Srch',P.topBar,1,'#334155',1.5));
  ch.push(t(534,20,360,16,'TB/SrchT','Search entities, diagrams, catalogs...',11,400,'#475569','left'));
  ch.push(r(FW-56,12,44,32,'TB/SrchBtn',P.primary));
  ch.push(t(FW-56,20,44,16,'TB/SrchBtnT','⌕',14,700,'#FFFFFF','center'));
  // User avatar
  ch.push(r(FW-112,16,28,28,'TB/AvBg','#475569'));
  ch.push(t(FW-112,18,28,24,'TB/AvT','LM',9,700,'#FFFFFF','center'));
  ch.push(t(FW-80,19,60,12,'TB/AvN','L. Mathis',10,500,P.topText,'left'));
  ch.push(t(FW-80,31,60,11,'TB/AvR','Architect',9,400,P.topMuted,'left'));

  // ── BREADCRUMB ──
  ch.push(r(0,TB_H,FW,32,'BC/Bg',P.panel,1,P.border,0.5));
  ch.push(t(16,TB_H+8,400,16,'BC/T','Architecture Catalog  ·  OEA Solution  (47 entities)',11,400,P.muted,'left'));
  // Filter chips
  [['All types ▾',0],['Status: Active ✕',110],['Layer: Application ✕',230]].forEach(([l,x])=>{
    const active=l.includes('✕');
    ch.push(r(FW-340+x,TB_H+6,active?l.length*6+12:100,20,`BC/C${x}`,active?P.badge:P.tag,1,active?P.primary:P.border,1));
    ch.push(t(FW-336+x,TB_H+9,active?l.length*6+4:96,11,`BC/CT${x}`,l,9,500,active?P.badgeT:P.tagT,'center'));
  });

  const CONTENT_Y=TB_H+32;
  const CONTENT_H=FH-CONTENT_Y-32; // leave room for footer

  // ── MAIN CONTENT ──
  ch.push(r(0,CONTENT_Y,FW,CONTENT_H,'Cnt/Bg',P.bg));

  // Left filter sidebar (200px)
  const SB_W=200;
  ch.push(r(0,CONTENT_Y,SB_W,CONTENT_H,'SB/Bg',P.panel,1,P.border,0.5));
  ch.push(r(0,CONTENT_Y,SB_W,24,'SB/HBg',P.bg,1,P.border,0.5));
  ch.push(t(8,CONTENT_Y+5,SB_W-16,13,'SB/HT','Filter',11,600,P.text,'left'));
  let sly=CONTENT_Y+28;
  const sbSec=(k,l)=>{ch.push(r(0,sly,SB_W,20,'SB/S'+k,P.bg));ch.push(t(8,sly+3,SB_W-16,13,'SB/SL'+k,l,9,600,P.muted,'left'));sly+=20;};
  const sbChk=(k,l,chkd,cnt)=>{
    ch.push(r(8,sly+3,12,12,`SB/${k}CB`,chkd?P.primary:P.panel,1,chkd?P.primary:P.border,1));
    if(chkd)ch.push(t(8,sly+4,12,10,`SB/${k}CBT`,'✓',7,700,'#FFFFFF','center'));
    ch.push(t(26,sly+1,SB_W-56,13,`SB/${k}L`,l,9,chkd?600:400,P.text,'left'));
    ch.push(r(SB_W-34,sly+3,26,14,`SB/${k}Cnt`,P.tag,1,P.border,0.5));
    ch.push(t(SB_W-34,sly+4,26,10,`SB/${k}CntT`,String(cnt),8,500,P.muted,'center'));
    sly+=22;
  };
  sbSec('Layer','Layer');
  sbChk('AppL','Application',true,20);
  sbChk('TechL','Technology',false,14);
  sbChk('IntL','Integration',false,7);
  sbChk('BizL','Business',false,6);
  sbSec('Status','Status');
  sbChk('StA','Active',true,38);
  sbChk('StP','Planned',false,5);
  sbChk('StD','Deprecated',false,3);
  sbSec('MT','Meta-Type');
  sbChk('MApp','Application Component [AC]',false,20);
  sbChk('MTec','Technology Component [TC]',false,14);
  sbChk('MInt','Interface [IF]',false,7);

  // Entity card grid (right side)
  const GRID_X=SB_W+12;
  const GRID_W=FW-GRID_X-12;
  const CARD_W=228,CARD_H=138,CARD_GAP=12;
  const CARDS_PER_ROW=Math.floor((GRID_W+CARD_GAP)/(CARD_W+CARD_GAP)); // 5

  // Stats bar
  ch.push(r(GRID_X,CONTENT_Y,GRID_W,32,'GR/StatBg',P.bg));
  ch.push(t(GRID_X,CONTENT_Y+8,280,14,'GR/StatT','Showing 20 of 47 entities  ·  sorted by Last Modified',10,400,P.muted,'left'));
  ch.push(r(GRID_X+GRID_W-68,CONTENT_Y+4,64,24,'GR/ViewBtn',P.panel,1,P.border,1));
  ch.push(t(GRID_X+GRID_W-68,CONTENT_Y+8,64,16,'GR/ViewBtnT','⊞ Grid',10,400,P.muted,'center'));

  const entities=[
    {id:'#AC-001',name:'Portal-Frontend',   type:'AC',layer:'Application',status:'active',  ver:'3.2.1',mod:'today'},
    {id:'#AC-002',name:'Auth-Service',       type:'AC',layer:'Application',status:'active',  ver:'2.5.0',mod:'today'},
    {id:'#AC-003',name:'Catalog-Service',    type:'AC',layer:'Application',status:'active',  ver:'1.8.4',mod:'Jun 28'},
    {id:'#AC-004',name:'ETL-Sync-Service',   type:'AC',layer:'Application',status:'active',  ver:'2.0.0',mod:'Jun 29'},
    {id:'#TC-001',name:'PostgreSQL-Prod',    type:'TC',layer:'Technology', status:'active',  ver:'15.4', mod:'Jun 20'},
    {id:'#IF-001',name:'OEA REST API',       type:'IF',layer:'Integration',status:'active',  ver:'v1',   mod:'Jun 15'},
    {id:'#AC-005',name:'Reporting-Engine',   type:'AC',layer:'Application',status:'deprecated',ver:'1.2.0',mod:'Jun 28'},
    {id:'#TC-002',name:'Kubernetes Cluster', type:'TC',layer:'Technology', status:'active',  ver:'1.29', mod:'Jun 10'},
    {id:'#AC-006',name:'BPMN-Editor',        type:'AC',layer:'Application',status:'planned', ver:'—',    mod:'Jun 05'},
    {id:'#IF-002',name:'ITSM-Webhook',       type:'IF',layer:'Integration',status:'active',  ver:'v2',   mod:'Jun 01'},
  ];
  const typeCol={'AC':'#2563EB','TC':'#0891B2','IF':'#7C3AED','DO':'#6D28D9','BO':'#D97706'};
  const stCol={'active':L.kpiGreen,'planned':L.kpiAmber,'deprecated':L.kpiRed};
  const dstCol={'active':D.kpiGreen,'planned':D.kpiAmber,'deprecated':D.kpiRed};

  entities.forEach((e,i)=>{
    const col=Math.floor(i%(CARDS_PER_ROW));
    const row2=Math.floor(i/CARDS_PER_ROW);
    const cx=GRID_X+(CARD_W+CARD_GAP)*col;
    const cy=CONTENT_Y+36+(CARD_H+CARD_GAP)*row2;
    const sel=i===0;
    ch.push(r(cx,cy,CARD_W,CARD_H,`EC/${e.id}Bg`,sel?P.cardH:P.card,1,sel?P.primary:P.border,sel?1.5:1));
    // Top color bar
    const tc=typeCol[e.type]||P.muted;
    ch.push(r(cx,cy,CARD_W,4,`EC/${e.id}Bar`,tc));
    // Type badge
    ch.push(r(cx+8,cy+12,28,16,`EC/${e.id}TBg`,tc,0.15,tc,0.6));
    ch.push(t(cx+8,cy+13,28,11,`EC/${e.id}TT`,'['+e.type+']',8,600,tc,'center'));
    // Layer tag
    ch.push(r(cx+42,cy+12,CARD_W-50,16,`EC/${e.id}LayBg`,P.tag,1,P.border,0.5));
    ch.push(t(cx+46,cy+13,CARD_W-54,11,`EC/${e.id}LayT`,e.layer,8,400,P.tagT,'left'));
    // Entity name
    ch.push(t(cx+8,cy+34,CARD_W-16,14,`EC/${e.id}Name`,e.name,12,700,P.text,'left'));
    ch.push(t(cx+8,cy+49,CARD_W-16,11,`EC/${e.id}ID`,e.id,9,400,P.muted,'left'));
    // Status + version
    const sc=m==='Light'?stCol[e.status]:dstCol[e.status];
    ch.push(r(cx+8,cy+66,52,14,`EC/${e.id}StBg`,sc,0.12,sc,0.5));
    ch.push(t(cx+10,cy+67,50,10,`EC/${e.id}StT`,e.status,8,500,sc,'left'));
    ch.push(t(cx+66,cy+66,CARD_W-74,10,`EC/${e.id}Ver`,'v'+e.ver,8,400,P.muted,'left'));
    // Footer
    ch.push(r(cx,cy+CARD_H-28,CARD_W,1,`EC/${e.id}Sep`,P.border,0.5));
    ch.push(t(cx+8,cy+CARD_H-20,CARD_W/2,11,`EC/${e.id}Mod`,'Modified '+e.mod,8,400,P.muted,'left'));
    ch.push(t(cx+CARD_W-56,cy+CARD_H-20,50,11,`EC/${e.id}View`,'View ↗',8,600,P.link,'right'));
  });

  // ── FOOTER ──
  ch.push(r(0,FH-32,FW,32,'Foot/Bg',P.panel,1,P.border,0.5));
  ch.push(t(16,FH-22,400,12,'Foot/L','OEA Open Enterprise Architecture  ·  v0.1.0-SNAPSHOT  ·  AGPL-3.0',10,400,P.muted,'left'));
  ch.push(t(FW-200,FH-22,192,12,'Foot/R','Read-only portal  ·  Last sync 06:00',10,400,P.muted,'right'));
  return{frameId,changes:ch};
}

// ─── SCR-051: Entity-Detailansicht (read-only) ──────────────────────────────
function sEntityDetail(pid,rowBase,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(rowBase),FW,FH,`${m}/SCR051-EntityDetail`);
  const ch=[change];

  // ── TOP BAR (same pattern) ──
  const TB_H=56;
  ch.push(r(0,0,FW,TB_H,'TB/Bg',P.topBar));
  ch.push(r(16,14,28,28,'TB/Logo',P.primary));
  ch.push(t(16,16,28,24,'TB/LogoT','OEA',10,700,'#FFFFFF','center'));
  ch.push(t(50,18,80,14,'TB/Brand','Open EA',12,700,P.topText,'left'));
  ch.push(t(50,32,100,11,'TB/Instance','Internal Portal',9,400,P.topMuted,'left'));
  [['Catalog',170],['Diagrams',248],['Dashboards',326],['Audit Log',424]].forEach(([l,x])=>
    ch.push(t(x,20,74,16,`TB/N${l}`,l,12,400,l==='Catalog'?P.primary:P.topMuted,'center')));
  ch.push(r(170,51,74,2,'TB/NA',P.primary));
  ch.push(r(520,12,380,32,'TB/Srch',P.topBar,1,'#334155',1.5));
  ch.push(t(534,20,360,16,'TB/SrchT','Search entities, diagrams, catalogs...',11,400,'#475569','left'));
  ch.push(r(FW-56,12,44,32,'TB/SrchBtn',P.primary));
  ch.push(t(FW-56,20,44,16,'TB/SrchBtnT','⌕',14,700,'#FFFFFF','center'));
  ch.push(r(FW-112,16,28,28,'TB/AvBg','#475569'));
  ch.push(t(FW-112,18,28,24,'TB/AvT','LM',9,700,'#FFFFFF','center'));
  ch.push(t(FW-80,19,60,12,'TB/AvN','L. Mathis',10,500,P.topText,'left'));

  // ── BREADCRUMB ──
  ch.push(r(0,TB_H,FW,32,'BC/Bg',P.panel,1,P.border,0.5));
  ch.push(t(16,TB_H+8,600,14,'BC/T','Catalog  ›  Application Layer  ›  Auth-Service [AC]',11,400,P.muted,'left'));
  ch.push(t(FW-120,TB_H+8,112,14,'BC/Back','← Back to Catalog',11,400,P.link,'right'));

  const CONTENT_Y=TB_H+32;
  ch.push(r(0,CONTENT_Y,FW,FH-CONTENT_Y-32,'Cnt/Bg',P.bg));

  // ── Entity Hero section ──
  const HERO_H=100;
  ch.push(r(0,CONTENT_Y,FW,HERO_H,'Hero/Bg',P.panel,1,P.border,0.5));
  ch.push(r(16,CONTENT_Y+20,36,36,'Hero/Icon','#2563EB',0.15,'#2563EB',1.5));
  ch.push(t(16,CONTENT_Y+24,36,28,'Hero/IconT','AC',11,700,'#2563EB','center'));
  ch.push(t(60,CONTENT_Y+22,500,20,'Hero/Name','Auth-Service',18,700,P.text,'left'));
  ch.push(t(60,CONTENT_Y+45,300,14,'Hero/ID','#AC-002  ·  Application Component  ·  Application Layer',11,400,P.muted,'left'));
  // Status badge
  ch.push(r(60,CONTENT_Y+63,56,18,'Hero/StBg',L.kpiGreen,0.12,L.kpiGreen,0.6));
  ch.push(t(64,CONTENT_Y+64,52,12,'Hero/StT','● active',9,600,L.kpiGreen,'left'));
  ch.push(t(124,CONTENT_Y+65,80,11,'Hero/Ver','v2.5.0',9,400,P.muted,'left'));
  ch.push(t(210,CONTENT_Y+65,100,11,'Hero/Mod','Modified 2026-06-29',9,400,P.muted,'left'));
  // Actions (read-only markers)
  ch.push(r(FW-220,CONTENT_Y+30,86,28,'Hero/OpenBtn',P.primary));
  ch.push(t(FW-220,CONTENT_Y+37,86,14,'Hero/OpenBtnT','Open in App ↗',10,600,'#FFFFFF','center'));
  ch.push(r(FW-126,CONTENT_Y+30,86,28,'Hero/ExportBtn',P.panel,1,P.primary,1));
  ch.push(t(FW-126,CONTENT_Y+37,86,14,'Hero/ExportBtnT','Export ⤒',10,600,P.primary,'center'));
  ch.push(r(FW-32,CONTENT_Y+30,24,28,'Hero/Share',P.panel,1,P.border,1));
  ch.push(t(FW-32,CONTENT_Y+37,24,14,'Hero/ShareT','⋯',11,600,P.muted,'center'));

  // ── Two-column layout ──
  const COL_Y=CONTENT_Y+HERO_H+8;
  const LEFT_CW=500,RIGHT_CW=FW-LEFT_CW-40;

  // LEFT: Properties + Relations
  ch.push(r(12,COL_Y,LEFT_CW,FH-COL_Y-44,'Left/Bg',P.panel,1,P.border,0.5));
  // Tab bar
  ch.push(r(12,COL_Y,LEFT_CW,28,'Left/TabBg',P.bg,1,P.border,0.5));
  [['Properties',0,true],['Relations',88,false],['Lineage',164,false],['History',232,false]].forEach(([l,dx,a])=>{
    const tw=l==='Properties'?86:l==='History'?60:74;
    ch.push(t(12+dx,COL_Y+6,tw,16,`Left/T${l}`,l,10,a?600:400,a?P.primary:P.muted,'center'));
    if(a)ch.push(r(12+dx,COL_Y+26,tw,2,`Left/TU${l}`,P.primary));
  });

  // Properties list
  const propEntries=[
    {k:'name',          v:'Auth-Service'},
    {k:'version',       v:'2.5.0'},
    {k:'lifecycle',     v:'active',    chip:true, chipCol:L.kpiGreen},
    {k:'owner',         v:'Platform Team'},
    {k:'environment',   v:'production',chip:true, chipCol:'#0891B2'},
    {k:'criticality',   v:'high',      chip:true, chipCol:L.kpiRed},
    {k:'description',   v:'Central authentication and authorization service. Supports OIDC, SAML 2.0, and Passkey.', long:true},
    {k:'repositoryUrl', v:'git@github.com:example/auth-service.git', link:true},
  ];
  let pepy=COL_Y+32;
  propEntries.forEach((pe,i)=>{
    const rowH=pe.long?52:28;
    ch.push(r(12,pepy,LEFT_CW,rowH,`PE/${pe.k}Bg`,i%2===0?P.panel:P.bg,0,P.border,0));
    ch.push(t(16,pepy+6,130,12,`PE/${pe.k}L`,pe.k,9,600,P.muted,'left'));
    if(pe.chip){
      ch.push(r(156,pepy+8,84,14,`PE/${pe.k}ChBg`,pe.chipCol,0.12,pe.chipCol,0.5));
      ch.push(t(160,pepy+9,80,10,`PE/${pe.k}ChT`,pe.v,8,600,pe.chipCol,'left'));
    } else if(pe.link){
      ch.push(t(156,pepy+6,LEFT_CW-164,12,`PE/${pe.k}V`,pe.v,9,400,P.link,'left'));
    } else {
      ch.push(t(156,pepy+6,LEFT_CW-164,12,`PE/${pe.k}V`,pe.v,pe.long?9:10,400,P.text,'left'));
    }
    pepy+=rowH;
  });

  // RIGHT: Relations + Diagrams
  ch.push(r(LEFT_CW+28,COL_Y,RIGHT_CW,FH-COL_Y-44,'Right/Bg',P.panel,1,P.border,0.5));
  ch.push(r(LEFT_CW+28,COL_Y,RIGHT_CW,24,'Right/HBg',P.bg,1,P.border,0.5));
  ch.push(t(LEFT_CW+36,COL_Y+5,160,13,'Right/HT','Connections  (6)',11,600,P.text,'left'));

  const rels=[
    {dir:'serves →',   target:'Portal-Frontend',   type:'AC', trel:'uses'},
    {dir:'serves →',   target:'BPMN-Editor',        type:'AC', trel:'calls'},
    {dir:'realizes →', target:'OEA REST API',        type:'IF', trel:''},
    {dir:'← depends',  target:'PostgreSQL-Prod',    type:'TC', trel:'stores'},
    {dir:'← depends',  target:'Kubernetes Cluster', type:'TC', trel:'hosted on'},
    {dir:'triggers →', target:'Audit-Log-Service',  type:'AC', trel:''},
  ];
  const relTypeCol={'AC':'#2563EB','TC':'#0891B2','IF':'#7C3AED'};
  let rely=COL_Y+28;
  rels.forEach((rel,i)=>{
    ch.push(r(LEFT_CW+28,rely,RIGHT_CW,32,`RL/${i}Bg`,i%2===0?P.panel:P.bg,0,P.border,0));
    ch.push(t(LEFT_CW+36,rely+4,68,11,`RL/${i}Dir`,rel.dir,8,500,P.muted,'left'));
    const tc=relTypeCol[rel.type]||P.muted;
    ch.push(r(LEFT_CW+108,rely+8,24,14,`RL/${i}TB`,tc,0.12,tc,0.6));
    ch.push(t(LEFT_CW+108,rely+9,24,10,`RL/${i}TT`,rel.type,7,600,tc,'center'));
    ch.push(t(LEFT_CW+138,rely+4,RIGHT_CW-120,11,`RL/${i}T`,rel.target,10,500,P.link,'left'));
    if(rel.trel)ch.push(t(LEFT_CW+36,rely+18,RIGHT_CW-44,9,`RL/${i}Sub`,rel.trel,8,400,P.muted,'left'));
    rely+=32;
  });

  // Diagrams section in right
  rely+=8;
  ch.push(r(LEFT_CW+28,rely,RIGHT_CW,24,'Right/DH',P.bg,1,P.border,0.5));
  ch.push(t(LEFT_CW+36,rely+5,160,13,'Right/DHT','Appears in  (3 Diagrams)',11,600,P.text,'left'));
  rely+=28;
  ['Solution Context Overview','Application Layer Landscape','Auth Data Flow'].forEach((dn,i)=>{
    ch.push(r(LEFT_CW+28,rely,RIGHT_CW,28,`DG/${i}Bg`,i%2===0?P.panel:P.bg,0,P.border,0));
    ch.push(r(LEFT_CW+36,rely+8,12,12,`DG/${i}Icon`,'#0891B2'));
    ch.push(t(LEFT_CW+54,rely+7,RIGHT_CW-70,13,`DG/${i}L`,dn,10,500,P.link,'left'));
    ch.push(t(LEFT_CW+36,rely+20,RIGHT_CW-44,9,`DG/${i}Sub`,'ArchiMate · last modified Jun 28',8,400,P.muted,'left'));
    rely+=30;
  });

  // ── FOOTER ──
  ch.push(r(0,FH-32,FW,32,'Foot/Bg',P.panel,1,P.border,0.5));
  ch.push(t(16,FH-22,400,12,'Foot/L','OEA Open Enterprise Architecture  ·  v0.1.0-SNAPSHOT  ·  AGPL-3.0',10,400,P.muted,'left'));
  ch.push(t(FW-200,FH-22,192,12,'Foot/R','Read-only portal  ·  Last sync 06:00',10,400,P.muted,'right'));
  return{frameId,changes:ch};
}

// ─── SCR-052: Diagramm-Viewer (read-only) ───────────────────────────────────
function sDiagramViewer(pid,rowBase,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(rowBase),FW,FH,`${m}/SCR052-DiagramViewer`);
  const ch=[change];

  const TB_H=56;
  ch.push(r(0,0,FW,TB_H,'TB/Bg',P.topBar));
  ch.push(r(16,14,28,28,'TB/Logo',P.primary));
  ch.push(t(16,16,28,24,'TB/LogoT','OEA',10,700,'#FFFFFF','center'));
  ch.push(t(50,18,80,14,'TB/Brand','Open EA',12,700,P.topText,'left'));
  ch.push(t(50,32,100,11,'TB/Instance','Internal Portal',9,400,P.topMuted,'left'));
  [['Catalog',170],['Diagrams',248],['Dashboards',326],['Audit Log',424]].forEach(([l,x])=>
    ch.push(t(x,20,74,16,`TB/N${l}`,l,12,400,l==='Diagrams'?P.primary:P.topMuted,'center')));
  ch.push(r(248,51,74,2,'TB/NA',P.primary));
  ch.push(r(520,12,380,32,'TB/Srch',P.topBar,1,'#334155',1.5));
  ch.push(t(534,20,360,16,'TB/SrchT','Search entities, diagrams, catalogs...',11,400,'#475569','left'));
  ch.push(r(FW-56,12,44,32,'TB/SrchBtn',P.primary));
  ch.push(t(FW-56,20,44,16,'TB/SrchBtnT','⌕',14,700,'#FFFFFF','center'));
  ch.push(r(FW-112,16,28,28,'TB/AvBg','#475569'));
  ch.push(t(FW-112,18,28,24,'TB/AvT','LM',9,700,'#FFFFFF','center'));

  // ── Viewer toolbar ──
  const VTB_Y=TB_H;
  ch.push(r(0,VTB_Y,FW,40,'VTB/Bg',P.panel,1,P.border,1));
  ch.push(t(12,VTB_Y+8,400,14,'VTB/Title','Solution Context Overview  ·  ArchiMate 3.1',12,700,P.text,'left'));
  ch.push(t(12,VTB_Y+22,300,11,'VTB/Sub','Last modified: 2026-06-28  ·  by L. Mathis',9,400,P.muted,'left'));
  // Viewer controls (read-only)
  [['−',0],['75%',20],['＋',62],[' ',90],['Fit',100],['Full ⛶',134]].forEach(([l,dx])=>{
    if(l===' '){ch.push(r(FW-216+dx,VTB_Y+10,1,20,`VTB/Sep${dx}`,P.border));return;}
    const isVal=l.includes('%');
    ch.push(r(FW-216+dx,VTB_Y+10,isVal?38:28,20,`VTB/B${dx}`,P.inputBg,1,P.border,1));
    ch.push(t(FW-216+dx,VTB_Y+14,isVal?38:28,12,`VTB/BT${dx}`,l,9,500,P.muted,'center'));
  });
  ch.push(r(FW-72,VTB_Y+8,64,24,'VTB/OpenBtn',P.primary));
  ch.push(t(FW-72,VTB_Y+14,64,12,'VTB/OpenBtnT','Open in App ↗',9,600,'#FFFFFF','center'));

  // ── Read-only badge ──
  const RO_Y=VTB_Y+40;
  ch.push(r(0,RO_Y,FW,28,'RO/Bg','#FEF9C3',1,'#D97706',0.5));
  ch.push(t(FW/2-200,RO_Y+7,400,13,'RO/T','👁  Read-only view  ·  Login with an Architect role to edit this diagram',10,500,'#92400E','center'));

  // ── Diagram canvas ──
  const CANVAS_Y=RO_Y+28;
  const CANVAS_H=FH-CANVAS_Y-100;

  // Right info panel
  const INFO_W=260;
  const VIEWER_W=FW-INFO_W-4;
  ch.push(r(0,CANVAS_Y,VIEWER_W,CANVAS_H,'CV/Bg',P.bg));

  // Grid background
  const GAP2=20;
  const gaO=m==='Dark'?0.35:0.2;
  for(let gx=0;gx<VIEWER_W;gx+=GAP2)ch.push(r(gx,CANVAS_Y,1,CANVAS_H,`CV/GV${gx}`,P.gridH||P.border,gaO));
  for(let gy=CANVAS_Y;gy<CANVAS_Y+CANVAS_H;gy+=GAP2)ch.push(r(0,gy,VIEWER_W,1,`CV/GH${gy}`,P.gridH||P.border,gaO));

  // Diagram nodes (simplified ArchiMate view — Solution Context)
  const dvNode=(x,y,w,h,key,typeId,label,sub,tc,sel)=>{
    if(sel){ch.push(r(x-2,y-2,w+4,h+4,`${key}/SelR`,P.badge,1,P.primary,2));}
    ch.push(r(x,y,w,h,`${key}/Bg`,P.panel,1,sel?P.primary:tc,sel?2:1));
    ch.push(r(x,y,w,12,`${key}/HBg`,tc,0.12));
    ch.push(r(x+2,y+1,22,10,`${key}/TBg`,tc));
    ch.push(t(x+2,y+2,22,8,`${key}/TT`,typeId,6,700,'#FFFFFF','center'));
    ch.push(t(x+4,y+16,w-8,14,`${key}/L`,label,10,sel?700:600,sel?P.primary:P.text,'center'));
    if(sub)ch.push(t(x+4,y+32,w-8,10,`${key}/S`,sub,8,400,P.muted,'center'));
  };
  const dvLine=(x1,y1,x2,y2,k,lbl)=>{
    const mx=Math.min(x1,x2),my=Math.min(y1,y2),mw=Math.abs(x2-x1)||2,mh=Math.abs(y2-y1)||2;
    ch.push(r(mx,my,mw||2,mh||2,`${k}/L`,P.muted,0.6));
    if(lbl)ch.push(t((x1+x2)/2-24,Math.min(y1,y2)-14,48,10,`${k}/Lbl`,lbl,7,400,P.muted,'center'));
  };

  const cx0=VIEWER_W/2;
  const CY2=CANVAS_Y+20;

  // Business layer
  dvNode(cx0-180,CY2+20,180,50,'N_User',  'ACT', 'Enterprise Architect','(user)',  '#D97706',false);
  dvNode(cx0+60, CY2+20,180,50,'N_Stk',   'ACT', 'Stakeholder','(consumer)',       '#D97706',false);

  // Application layer
  dvNode(cx0-270,CY2+120,156,50,'N_Auth',   'AC','Auth-Service','v2.5.0',   '#2563EB',true);
  dvNode(cx0-100,CY2+120,156,50,'N_Portal', 'AC','Portal-Frontend','v3.2.1','#2563EB',false);
  dvNode(cx0+80, CY2+120,156,50,'N_Cat',    'AC','Catalog-Service','v1.8.4', '#2563EB',false);
  dvNode(cx0+250,CY2+120,156,50,'N_ETL',    'AC','ETL-Sync-Service','v2.0.0','#2563EB',false);

  // Infrastructure layer
  dvNode(cx0-240,CY2+230,140,44,'N_K8S',   'TC','Kubernetes','Cluster', '#0891B2',false);
  dvNode(cx0-80, CY2+230,140,44,'N_PG',    'TC','PostgreSQL','v15.4',   '#0891B2',false);
  dvNode(cx0+90, CY2+230,140,44,'N_KAF',   'TC','Kafka','Broker',       '#0891B2',false);

  // Lines
  dvLine(cx0-100,CY2+70,cx0-190,CY2+120,'L1','uses');
  dvLine(cx0+150,CY2+70,cx0+160,CY2+120,'L2','views');
  dvLine(cx0-200,CY2+170,cx0-100,CY2+120,'L3','auth');
  dvLine(cx0-20, CY2+170,cx0+80, CY2+120,'L4','calls');
  dvLine(cx0+160,CY2+170,cx0+250,CY2+120,'L5','syncs');
  dvLine(cx0-190,CY2+170,cx0-170,CY2+230,'L6');
  dvLine(cx0-20, CY2+170,cx0-10, CY2+230,'L7','stores');
  dvLine(cx0+160,CY2+170,cx0+160,CY2+230,'L8','streams');

  // Legend
  ch.push(r(12,CANVAS_Y+CANVAS_H-60,200,52,'CV/Leg',P.panel,0.9,P.border,1));
  ch.push(t(20,CANVAS_Y+CANVAS_H-56,192,12,'CV/LegT','Legend',9,600,P.muted,'left'));
  [['ACT — Actor','#D97706'],['AC — Application Component','#2563EB'],['TC — Technology Component','#0891B2']].forEach(([l,c],i)=>{
    ch.push(r(20,CANVAS_Y+CANVAS_H-42+i*12,8,8,`CV/LI${i}`,c));
    ch.push(t(32,CANVAS_Y+CANVAS_H-42+i*12,170,8,`CV/LL${i}`,l,7,400,P.muted,'left'));
  });

  // ── Info side panel ──
  ch.push(r(VIEWER_W+4,CANVAS_Y,INFO_W,CANVAS_H,'IP/Bg',P.panel,1,P.border,1));
  ch.push(r(VIEWER_W+4,CANVAS_Y,INFO_W,24,'IP/HBg',P.bg,1,P.border,0.5));
  ch.push(t(VIEWER_W+12,CANVAS_Y+5,INFO_W-16,13,'IP/HT','Selected: Auth-Service [AC]',10,700,P.primary,'left'));
  let ipy=CANVAS_Y+28;
  const ipRow=(k,v,link)=>{
    ch.push(t(VIEWER_W+12,ipy,88,10,`IP/${k}L`,k,8,500,P.muted,'left'));
    ch.push(t(VIEWER_W+104,ipy,INFO_W-112,10,`IP/${k}V`,v,8,link?400:400,link?P.link:P.text,'left'));
    ipy+=18;
  };
  ipRow('Name','Auth-Service');ipRow('ID','#AC-002');ipRow('Type','Application Component');
  ipRow('Status','active  ·  v2.5.0');ipRow('Owner','Platform Team');
  ipy+=4;
  ch.push(r(VIEWER_W+4,ipy,INFO_W,1,'IP/Sep1',P.border));ipy+=8;
  ch.push(t(VIEWER_W+12,ipy,INFO_W-16,11,'IP/RelH','Relations (6)',9,600,P.muted,'left'));ipy+=16;
  ['serves Portal-Frontend','realizes OEA REST API','← uses PostgreSQL'].forEach((rl,i)=>{
    ch.push(t(VIEWER_W+14,ipy,INFO_W-20,10,`IP/RL${i}`,rl,8,400,P.muted,'left'));ipy+=14;
  });
  ipy+=4;
  ch.push(r(VIEWER_W+4,ipy,INFO_W,1,'IP/Sep2',P.border));ipy+=8;
  ch.push(t(VIEWER_W+12,ipy,INFO_W-16,11,'IP/AH','Appears in',9,600,P.muted,'left'));ipy+=16;
  ch.push(t(VIEWER_W+14,ipy,INFO_W-20,10,'IP/A1','↗  Solution Context Overview',8,400,P.link,'left'));ipy+=14;
  ch.push(t(VIEWER_W+14,ipy,INFO_W-20,10,'IP/A2','↗  Auth Data Flow',8,400,P.link,'left'));ipy+=20;
  ch.push(r(VIEWER_W+12,ipy,INFO_W-24,24,'IP/OABtn',P.primary));
  ch.push(t(VIEWER_W+12,ipy+6,INFO_W-24,11,'IP/OABtnT','View Entity Detail →',9,600,'#FFFFFF','center'));

  // ── BOTTOM: Diagram list ──
  const BOT_Y=CANVAS_Y+CANVAS_H;
  ch.push(r(0,BOT_Y,FW,FH-BOT_Y-32,'Bot/Bg',P.panel,1,P.border,0.5));
  ch.push(t(12,BOT_Y+8,200,13,'Bot/HT','Other Diagrams in this Solution',10,600,P.text,'left'));
  ['Application Layer Landscape','Auth Data Flow','ERP Integration Context'].forEach((dn,i)=>{
    ch.push(r(12+i*260,BOT_Y+28,248,36,`Bot/D${i}Bg`,P.bg,1,P.border,1));
    ch.push(t(20+i*260,BOT_Y+34,230,12,`Bot/D${i}T`,dn,10,500,P.link,'left'));
    ch.push(t(20+i*260,BOT_Y+46,230,9,`Bot/D${i}S`,'ArchiMate  ·  modified Jun 28',8,400,P.muted,'left'));
  });

  // ── FOOTER ──
  ch.push(r(0,FH-32,FW,32,'Foot/Bg',P.panel,1,P.border,0.5));
  ch.push(t(16,FH-22,400,12,'Foot/L','OEA Open Enterprise Architecture  ·  v0.1.0-SNAPSHOT  ·  AGPL-3.0',10,400,P.muted,'left'));
  ch.push(t(FW-200,FH-22,192,12,'Foot/R','Read-only portal  ·  Last sync 06:00',10,400,P.muted,'right'));
  return{frameId,changes:ch};
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function main(){
  const outDir=path.join(__dirname,'..','..','docs','screens');
  const hasPenpot=!!(process.env.PENPOT_API_URL&&process.env.PENPOT_ACCESS_TOKEN&&process.env.PENPOT_PROJECT_ID);
  const pid='00000000-0000-0000-0000-000000000001';
  const modes=[{P:L,m:'Light'},{P:D,m:'Dark'}];
  const screens=[
    {fn:sPortalHome,  name:'portal-home',   scr:'SCR050', row:0},
    {fn:sEntityDetail,name:'entity-detail', scr:'SCR051', row:2},
    {fn:sDiagramViewer,name:'diagram-viewer',scr:'SCR052',row:4},
  ];

  if(hasPenpot){
    const PID=process.env.PENPOT_PROJECT_ID,API=process.env.PENPOT_API_URL;
    try{
      const profile=await rpc('get-profile',{});console.log(`Penpot: ${profile.email}`);
      const files=await rpc('get-project-files',{project_id:PID});
      for(const f of files.filter(f=>f.name&&f.name.includes('Web Portal')))await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Web Portal v0.1',project_id:PID});
      const all=[];
      for(const sc of screens)for(const{P,m}of modes){
        all.push(canvasText(f.data.pages[0],-160,sy(sc.row+(m==='Dark'?1:0))+FH/2-10,150,20,`Lbl${sc.scr}${m}`,`${sc.scr} ${m}`,10,600,'#64748B','right'));
        const{changes}=sc.fn(f.data.pages[0],sc.row+(m==='Dark'?1:0),P,m);
        all.push(...changes);
      }
      await rpc('update-file',{id:f.id,'session-id':f.id,revn:0,vern:0,changes:all});
      console.log(`Penpot: ${all.length} shapes  |  ${API}dashboard/projects/${PID}`);
    }catch(e){console.warn(`Penpot failed: ${e.message}`);}
  }else console.log('(Penpot skipped)');

  console.log('\nSVG ...');
  for(const sc of screens){
    for(const{P,m}of modes){
      const{changes}=sc.fn(pid,0,P,m);
      generateLocalSVG(changes[0],changes.slice(1),path.join(outDir,`${sc.name}-${m.toLowerCase()}.svg`));
      console.log(`  ${sc.name}-${m.toLowerCase()}.svg`);
    }
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
