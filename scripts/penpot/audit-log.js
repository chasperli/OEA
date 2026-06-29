#!/usr/bin/env node
/**
 * OEA Audit Log (SCR-026) + Restore Entity (SCR-027)
 * Light + Dark mode each, stacked: row0=Light/SCR-026, row1=Dark/SCR-026,
 *                                   row2=Light/SCR-027, row3=Dark/SCR-027
 *
 * SCR-026: Audit Log — table with Timestamp, User, Metatyp, Entität,
 *          Changed Properties, Changed Relations + inline Diff/Restore panel
 * SCR-027: Restore Deleted Entity — diff view + impact analysis + confirm
 *
 * UC-14: View Audit History
 * UC-15: Restore Entity from History
 * UC-16: Restore Deleted Entity
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280, FH=800, GAP=100;
const sy=row=>row*(FH+GAP);
const MENU_H=28, TOOL_H=36, MAIN_Y=64;
const STATUS_Y=776, STATUS_H=24;
const MAIN_H=FH-MAIN_Y-STATUS_H; // 712

const L={
  panel:'#FFFFFF', panelAlt:'#F8FAFC', menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC', selBg:'#E0F2FE', secBg:'#F1F5F9',
  addBg:'#DCFCE7', addText:'#166534',
  remBg:'#FEE2E2', remText:'#991B1B',
  warnBg:'#FEF3C7', warnBorder:'#D97706', warnText:'#92400E',
  statusText:'#94A3B8', overlay:'#FFFFFF', hoverBg:'#F0F9FF',
};
const D={
  panel:'#1E293B', panelAlt:'#172030', menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0B1829', selBg:'#0C4A6E', secBg:'#162030',
  addBg:'#14532D', addText:'#86EFAC',
  remBg:'#450A0A', remText:'#FCA5A5',
  warnBg:'#78350F', warnBorder:'#D97706', warnText:'#FDE68A',
  statusText:'#64748B', overlay:'#1E293B', hoverBg:'#0C2845',
};

// Metatyp badge colors
const TYPE_COL={
  AC:'#2563EB', AS:'#0284C7', TB:'#7C3AED',
  UC:'#D97706', PR:'#059669', RE:'#DC2626',
};

// ─────────────────────────────────────────────────────────────────────────────
// SCR-026: Audit Log
// Layout: Filter Sidebar (260) | Table (720) | Diff/Restore Panel (296)
// ─────────────────────────────────────────────────────────────────────────────
function auditLog(pid, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, 0, sy(row), FW, FH, `${m}/AuditLog`);
  const ch = [change];

  const LEFT_W=260, DIV_W=4, RIGHT_W=296;
  const TABLE_X=LEFT_W+DIV_W;                   // 264
  const TABLE_W=FW-TABLE_X-DIV_W-RIGHT_W;       // 716
  const RIGHT_X=TABLE_X+TABLE_W+DIV_W;          // 984
  const TABLE_Y=MAIN_Y;

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['View',54],['Audit',100],['Help',148]].forEach(([l,x])=>
    ch.push(t(x,6,50,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,60,14,'TBC1','Audit',12,400,P.muted,'left'));
  ch.push(t(70,MENU_H+11,12,14,'TBC2','›',12,400,P.muted,'center'));
  ch.push(t(84,MENU_H+11,240,14,'TBC3','Audit Log — OEA Solution',12,600,P.text,'left'));
  // stats
  ch.push(r(380,MENU_H+7,80,22,'Stat1',P.secBg,1,P.border,1));
  ch.push(t(380,MENU_H+11,80,14,'Stat1T','2,847 changes',10,400,P.muted,'center'));
  ch.push(r(468,MENU_H+7,70,22,'Stat2',P.secBg,1,P.border,1));
  ch.push(t(468,MENU_H+11,70,14,'Stat2T','12 deleted',10,400,P.muted,'center'));
  ch.push(r(FW-80,MENU_H+7,72,22,'BtnExp',P.inputBg,1,P.border,1));
  ch.push(t(FW-80,MENU_H+11,72,14,'BtnExpT','⤓ Export',11,500,P.muted,'center'));

  // ── DIVIDERS ──
  ch.push(r(LEFT_W,TABLE_Y,DIV_W,MAIN_H,'DivL',P.border));
  ch.push(r(RIGHT_X-DIV_W,TABLE_Y,DIV_W,MAIN_H,'DivR',P.border));

  // ══════════════════════════════════════════════════════
  // LEFT PANEL — Filters
  // ══════════════════════════════════════════════════════
  ch.push(r(0,TABLE_Y,LEFT_W,MAIN_H,'FP/Bg',P.panel));
  ch.push(r(0,TABLE_Y,LEFT_W,28,'FP/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,TABLE_Y+7,LEFT_W-16,14,'FP/HT','Filters',12,600,P.text,'left'));
  ch.push(r(LEFT_W-28,TABLE_Y+5,22,18,'FP/RstBtn',P.inputBg,1,P.border,1));
  ch.push(t(LEFT_W-28,TABLE_Y+7,22,14,'FP/RstT','✕',10,400,P.muted,'center'));

  let fy=TABLE_Y+36;
  const filterField=(k,label,val)=>{
    ch.push(t(8,fy+1,LEFT_W-16,11,`FF/${k}L`,label,9,500,P.muted,'left'));fy+=12;
    ch.push(r(8,fy,LEFT_W-16,22,`FF/${k}F`,P.inputBg,1,P.border,1));
    ch.push(t(12,fy+4,LEFT_W-24,13,`FF/${k}V`,val,11,400,val===''?P.muted:P.text,'left'));
    fy+=26;
  };
  filterField('Date','Date Range','2026-06-28  →  today');
  filterField('User','User','All users');
  filterField('Type','Metatyp','All types');
  filterField('Ent','Entity (contains)','');
  filterField('Chg','Change Type','All changes');

  fy+=4;
  ch.push(r(8,fy,LEFT_W-16,26,'BtnFilter',P.primary));
  ch.push(t(8,fy+6,LEFT_W-16,14,'BtnFilterT','Apply Filters',12,600,'#FFFFFF','center'));
  fy+=34;

  // Saved filters section
  ch.push(r(0,fy,LEFT_W,20,'SF/Sec',P.secBg));
  ch.push(t(8,fy+3,LEFT_W-16,13,'SF/SecT','Saved Filters',10,600,P.muted,'left'));
  fy+=20;
  [['Today\'s changes','#16A34A'],['Deleted entities','#DC2626'],['My changes','#0EA5E9']].forEach(([l,c],i)=>{
    ch.push(r(4,fy+2,LEFT_W-8,20,`SF/I${i}`,P.inputBg,1,P.border,1));
    ch.push(r(8,fy+7,8,8,`SF/D${i}`,c));
    ch.push(t(20,fy+4,LEFT_W-32,12,`SF/L${i}`,l,10,400,P.text,'left'));
    fy+=22;
  });

  // ══════════════════════════════════════════════════════
  // TABLE HEADER
  // ══════════════════════════════════════════════════════
  const ROW_H=38, HDR_H=32, IF_H=26; // IF_H = inline filter row height (REQ-143)
  const tx=TABLE_X, ty0=TABLE_Y;

  // Column widths summing to TABLE_W=716
  const COLS=[
    {key:'ts',  label:'Timestamp',          ph:'Filter date…',      w:132},
    {key:'usr', label:'User',                ph:'Filter user…',      w:88},
    {key:'mt',  label:'Metatyp',             ph:'Filter type…',      w:108},
    {key:'ent', label:'Entität',             ph:'Filter entity…',    w:148},
    {key:'prop',label:'Changed Properties',  ph:'Filter property…',  w:132},
    {key:'rel', label:'Changed Relations',   ph:'Filter relation…',  w:108},
  ]; // total=716

  // ── Column header row ──
  ch.push(r(tx,ty0,TABLE_W,HDR_H,'TH/Bg',P.secBg,1,P.border,1));
  let cx2=tx;
  COLS.forEach((c,i)=>{
    ch.push(t(cx2+6,ty0+9,c.w-8,14,`TH/${c.key}`,c.label,11,700,P.muted,'left'));
    if(i<COLS.length-1) ch.push(r(cx2+c.w-1,ty0+4,1,HDR_H-8,'TH/Div'+i,P.border));
    cx2+=c.w;
  });
  // Sort indicator on Timestamp
  ch.push(t(tx+106,ty0+9,16,14,'TH/Sort','↓',11,700,P.primary,'left'));

  // ── Inline filter row (REQ-143: per-column full-text, AND-combined) ──
  const IFY=ty0+HDR_H;
  ch.push(r(tx,IFY,TABLE_W,IF_H,'IF/Bg',P.inputBg,1,P.border,1));
  let ifx=tx;
  COLS.forEach((c,i)=>{
    // Typed value in Entität column as example; others empty
    const hasVal=c.key==='ent';
    ch.push(r(ifx+3,IFY+3,c.w-6,IF_H-6,`IF/${c.key}`,P.panel,1,hasVal?P.primary:P.border,hasVal?1.5:1));
    ch.push(t(ifx+7,IFY+7,c.w-14,IF_H-12,`IF/${c.key}T`,hasVal?'Catalog-Service':c.ph,9,400,hasVal?P.text:P.muted,'left'));
    if(hasVal){
      // Clear icon
      ch.push(r(ifx+c.w-18,IFY+7,12,12,`IF/${c.key}Clr`,P.selBg,1,P.primary,1));
      ch.push(t(ifx+c.w-18,IFY+8,12,10,`IF/${c.key}ClrT`,'×',8,700,P.primary,'center'));
    }
    if(i<COLS.length-1) ch.push(r(ifx+c.w-1,IFY+4,1,IF_H-8,'IF/Div'+i,P.border));
    ifx+=c.w;
  });
  // AND badge (right side — shows filters are AND-combined)
  ch.push(r(tx+TABLE_W-36,IFY+6,32,IF_H-12,'IF/And',P.selBg,1,P.primary,1));
  ch.push(t(tx+TABLE_W-36,IFY+8,32,IF_H-14,'IF/AndT','AND',8,700,P.primary,'center'));

  // ── TABLE ROWS ──
  const auditRows=[
    {ts:'2026-06-28 14:32',usr:'lukas',mt:'AC',ent:'Catalog-Service',    prop:'status',                rel:'+1 connection', del:false,sel:true},
    {ts:'2026-06-28 14:28',usr:'lukas',mt:'AC',ent:'Auth-Service',        prop:'description, version',  rel:'—',             del:false,sel:false},
    {ts:'2026-06-28 13:15',usr:'admin',mt:'AS',ent:'REST-API (Facade)',   prop:'status',                rel:'+2 connections',del:false,sel:false},
    {ts:'2026-06-28 12:44',usr:'lukas',mt:'AC',ent:'Reporting-Engine',   prop:'name',                  rel:'—',             del:true, sel:false},
    {ts:'2026-06-28 11:02',usr:'admin',mt:'TB',ent:'PostgreSQL-DB',       prop:'version, host',         rel:'—',             del:false,sel:false},
    {ts:'2026-06-27 17:55',usr:'lukas',mt:'UC',ent:'UC-06 Catalog Browse',prop:'status → accepted',    rel:'+3 REQs',       del:false,sel:false},
    {ts:'2026-06-27 16:30',usr:'admin',mt:'RE',ent:'REQ-147',             prop:'priority',             rel:'—',             del:false,sel:false},
    {ts:'2026-06-27 15:12',usr:'lukas',mt:'AC',ent:'Portal-Frontend',    prop:'name, status',          rel:'+1 connection', del:false,sel:false},
  ];

  let ry=ty0+HDR_H+IF_H;
  auditRows.forEach((row,ri)=>{
    const bg=row.sel?P.selBg:row.del?P.remBg:ri%2===0?P.panel:P.panelAlt;
    ch.push(r(tx,ry,TABLE_W,ROW_H,'TR/Bg'+ri,bg,1,P.border,0.5));
    let cx3=tx;

    // Timestamp
    ch.push(t(cx3+6,ry+12,COLS[0].w-10,14,'TR/TS'+ri,row.ts,10,400,P.muted,'left'));
    cx3+=COLS[0].w;
    // User
    ch.push(r(cx3+4,ry+11,14,14,'TR/Av'+ri,row.sel?P.primary:P.border));
    ch.push(t(cx3+4,ry+12,14,12,'TR/AvT'+ri,row.usr[0].toUpperCase(),8,700,'#FFFFFF','center'));
    ch.push(t(cx3+22,ry+12,COLS[1].w-26,14,'TR/Usr'+ri,row.usr,10,400,P.text,'left'));
    cx3+=COLS[1].w;
    // Metatyp badge
    const mc=TYPE_COL[row.mt]||P.muted;
    ch.push(r(cx3+6,ry+11,24,16,'TR/MTBg'+ri,mc,0.15,mc,1));
    ch.push(t(cx3+6,ry+13,24,11,'TR/MT'+ri,row.mt,9,700,mc,'center'));
    cx3+=COLS[2].w;
    // Entity name
    const entCol=row.del?P.remText:row.sel?P.primary:P.text;
    const entDeco=row.del?'line-through':'';
    ch.push(t(cx3+6,ry+12,COLS[3].w-10,14,'TR/Ent'+ri,row.del?'⚠ '+row.ent:row.ent,10,row.sel||row.del?600:400,entCol,'left'));
    if(row.del){
      ch.push(r(cx3+COLS[3].w-40,ry+13,34,12,'TR/DelBg'+ri,P.remBg,1,P.remText||'#DC2626',1));
      ch.push(t(cx3+COLS[3].w-40,ry+15,34,9,'TR/DelT'+ri,'DELETED',7,700,P.remText,'center'));
    }
    cx3+=COLS[3].w;
    // Changed Properties
    ch.push(t(cx3+6,ry+12,COLS[4].w-10,14,'TR/Prop'+ri,row.prop,10,400,P.text,'left'));
    cx3+=COLS[4].w;
    // Changed Relations
    const relCol=row.rel==='—'?P.muted:row.rel.startsWith('+')?P.addText||'#166534':P.remText||'#991B1B';
    ch.push(t(cx3+6,ry+12,COLS[5].w-10,14,'TR/Rel'+ri,row.rel,10,400,relCol,'left'));
    ry+=ROW_H;
  });

  // Pagination bar
  ch.push(r(tx,ry,TABLE_W,32,'Pag/Bg',P.secBg,1,P.border,1));
  ch.push(t(tx+8,ry+8,200,14,'Pag/Info','Showing 1–8 of 2,847 changes',10,400,P.muted,'left'));
  [['«',0],['‹',28],['1',56],['2',84],['3',112],['›',140],['»',168]].forEach(([l,dx])=>{
    const isActive=l==='1';
    ch.push(r(tx+TABLE_W-200+dx,ry+6,22,20,`Pag/B${l}`,isActive?P.primary:P.inputBg,1,isActive?P.primary:P.border,1));
    ch.push(t(tx+TABLE_W-200+dx,ry+9,22,12,`Pag/BT${l}`,l,10,isActive?700:400,isActive?'#FFFFFF':P.muted,'center'));
  });

  // ══════════════════════════════════════════════════════
  // RIGHT PANEL — Change Detail (row 0 selected: Catalog-Service status change)
  // ══════════════════════════════════════════════════════
  const rp=RIGHT_W-16, rpx=RIGHT_X+8;
  ch.push(r(RIGHT_X,TABLE_Y,RIGHT_W,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RIGHT_X,TABLE_Y,RIGHT_W,28,'RP/HBg',P.secBg,1,P.border,1));
  ch.push(t(rpx,TABLE_Y+7,rp,14,'RP/HT','Change Detail',12,600,P.text,'left'));
  ch.push(r(RIGHT_X+RIGHT_W-26,TABLE_Y+5,20,18,'RP/CloseBtn',P.inputBg,1,P.border,1));
  ch.push(t(RIGHT_X+RIGHT_W-26,TABLE_Y+7,20,14,'RP/CloseBT','×',11,500,P.muted,'center'));

  let dp=TABLE_Y+36;
  const dSec=(k,l)=>{ch.push(r(RIGHT_X,dp,RIGHT_W,20,`DP/${k}S`,P.secBg));ch.push(t(rpx,dp+3,rp,12,`DP/${k}SL`,l,10,600,P.muted,'left'));dp+=20;};

  dSec('Meta','Metadata');
  [['Entity','Catalog-Service'],['Type','ApplicationComponent'],['Changed by','lukas'],['Timestamp','2026-06-28 14:32:11']].forEach(([l,v],i)=>{
    ch.push(t(rpx,dp+2,80,11,`DP/ML${i}`,l+':',9,500,P.muted,'left'));
    ch.push(t(rpx+84,dp+2,rp-84,11,`DP/MV${i}`,v,10,400,P.text,'left'));
    dp+=16;
  });
  dp+=6;

  dSec('Diff','Property Changes');
  // Before/After diff table
  ch.push(r(rpx,dp,rp,16,'DP/DiffH',P.secBg,1,P.border,1));
  ch.push(t(rpx+4,dp+2,76,12,'DP/DH1','Field',9,600,P.muted,'left'));
  ch.push(t(rpx+84,dp+2,60,12,'DP/DH2','Before',9,600,P.muted,'left'));
  ch.push(t(rpx+148,dp+2,60,12,'DP/DH3','After',9,600,P.muted,'left'));
  dp+=16;

  // Diff rows
  const diffs=[
    {field:'status',before:'active',after:'deprecated',changed:true},
    {field:'name',before:'Catalog-Service',after:'Catalog-Service',changed:false},
  ];
  diffs.forEach((d,i)=>{
    const bg=d.changed?(i%2===0?P.warnBg:P.warnBg):i%2===0?P.panel:P.panelAlt;
    ch.push(r(rpx,dp,rp,20,`DP/DR${i}`,bg,d.changed?0.4:1,P.border,0.5));
    ch.push(t(rpx+4,dp+4,76,12,`DP/DF${i}`,d.field,9,d.changed?600:400,P.muted,'left'));
    // Before value (red if changed)
    if(d.changed){
      ch.push(r(rpx+82,dp+3,60,14,`DP/DBg${i}`,P.remBg||'#FEE2E2',0.6));
      ch.push(t(rpx+84,dp+5,58,10,`DP/DB${i}`,d.before,9,400,P.remText||'#991B1B','left'));
    } else {
      ch.push(t(rpx+84,dp+5,58,10,`DP/DB${i}`,d.before,9,400,P.muted,'left'));
    }
    // After value (green if changed)
    if(d.changed){
      ch.push(r(rpx+146,dp+3,60,14,`DP/ABg${i}`,P.addBg||'#DCFCE7',0.6));
      ch.push(t(rpx+148,dp+5,58,10,`DP/DA${i}`,d.after,9,600,P.addText||'#166534','left'));
    } else {
      ch.push(t(rpx+148,dp+5,58,10,`DP/DA${i}`,d.after,9,400,P.muted,'left'));
    }
    dp+=20;
  });
  dp+=6;

  dSec('Rel','Relation Changes');
  // New connection added
  ch.push(r(rpx,dp,rp,20,'DP/RelR',P.addBg||'#DCFCE7',0.5,P.addText||'#166534',1));
  ch.push(t(rpx+4,dp+4,12,12,'DP/RelSym','+',10,700,P.addText||'#166534','center'));
  ch.push(t(rpx+18,dp+4,rp-22,12,'DP/RelTxt','→ Auth-Service  [uses]',10,400,P.text,'left'));
  dp+=22+4;

  dSec('Act','Actions');
  // Restore to this state button
  ch.push(r(rpx,dp,rp,28,'DP/RestBtn',P.warnBg,1,P.warnBorder||'#D97706',1.5));
  ch.push(t(rpx,dp+7,rp,14,'DP/RestBtnT','↩  Restore to this state',11,600,P.warnText,'center'));
  dp+=32;
  ch.push(r(rpx,dp,rp,26,'DP/ViewBtn',P.inputBg,1,P.border,1));
  ch.push(t(rpx,dp+6,rp,14,'DP/ViewBtnT','View full entity snapshot',11,500,P.muted,'center'));

  // ── STATUS BAR ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,480,12,'St/L','Audit Log  ·  OEA Solution  ·  2,847 changes  ·  12 deleted entities',10,400,P.statusText,'left'));
  ch.push(t(FW-192,STATUS_Y+6,184,12,'St/R','Connected  ·  OEA 0.1.0-SNAPSHOT',10,400,P.statusText,'right'));

  return { frameId, changes: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCR-027: Restore Deleted Entity
// Full-screen view: entity snapshot (left) + impact + restore confirm (right)
// ─────────────────────────────────────────────────────────────────────────────
function restoreEntity(pid, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, 0, sy(row), FW, FH, `${m}/RestoreEntity`);
  const ch = [change];

  // Layout: Left 560px (entity snapshot) | Divider 4 | Right 716px (impact + restore)
  const SNAP_W=560, DIV_W=4, ACT_W=FW-SNAP_W-DIV_W; // 716
  const ACT_X=SNAP_W+DIV_W;

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['View',54],['Audit',100],['Help',148]].forEach(([l,x])=>
    ch.push(t(x,6,50,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR (breadcrumb) ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,60,14,'TBC0','Audit',12,400,P.muted,'left'));
  ch.push(t(70,MENU_H+11,8,14,'TBC1','›',12,400,P.muted,'center'));
  ch.push(t(80,MENU_H+11,120,14,'TBC2','Audit Log',12,400,P.muted,'left'));
  ch.push(t(202,MENU_H+11,8,14,'TBC3','›',12,400,P.muted,'center'));
  ch.push(t(212,MENU_H+11,240,14,'TBC4','Restore: Reporting-Engine',12,600,P.text,'left'));

  // Danger warning banner
  ch.push(r(0,MAIN_Y,FW,36,'WarnBar',P.warnBg,1,P.warnBorder||'#D97706',1));
  ch.push(t(12,MAIN_Y+10,FW-160,16,'WarnT',
    '⚠  This entity was soft-deleted on 2026-06-28 14:44 by lukas.  Restoring will make it visible in all affected diagrams again.',
    11,500,P.warnText,'left'));

  const CONTENT_Y=MAIN_Y+36;
  const CONTENT_H=FH-CONTENT_Y-STATUS_H-24; // remaining

  // ── LEFT PANEL: Entity Snapshot ──
  ch.push(r(0,CONTENT_Y,SNAP_W,CONTENT_H,'SN/Bg',P.panel));
  ch.push(r(0,CONTENT_Y,SNAP_W,28,'SN/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,CONTENT_Y+7,SNAP_W-16,14,'SN/HT','Entity Snapshot  —  as of deletion',12,600,P.text,'left'));
  // Entity header card
  ch.push(r(8,CONTENT_Y+36,SNAP_W-16,56,'SN/Card',P.selBg||'#E0F2FE',1,P.primary,1.5));
  ch.push(r(14,CONTENT_Y+46,32,32,'SN/CardBdg','#2563EB'));
  ch.push(t(14,CONTENT_Y+53,32,18,'SN/CardBT','AC',10,700,'#FFFFFF','center'));
  ch.push(t(52,CONTENT_Y+42,SNAP_W-68,16,'SN/CardName','Reporting-Engine',14,700,P.text,'left'));
  ch.push(t(52,CONTENT_Y+60,SNAP_W-68,12,'SN/CardType','ApplicationComponent',10,400,P.muted,'left'));
  ch.push(r(SNAP_W-70,CONTENT_Y+44,56,20,'SN/DelTag',P.remBg||'#FEE2E2',1,P.remText||'#DC2626',1));
  ch.push(t(SNAP_W-70,CONTENT_Y+47,56,14,'SN/DelTagT','DELETED',9,700,P.remText||'#DC2626','center'));

  // Properties
  ch.push(r(0,CONTENT_Y+100,SNAP_W,20,'SN/PropS',P.secBg));
  ch.push(t(8,CONTENT_Y+103,SNAP_W-16,13,'SN/PropST','Properties',10,600,P.muted,'left'));
  const snapProps=[
    ['ID','#AC-2801'],['Name','Reporting-Engine'],['Status','active'],
    ['Layer','Application'],['Version','2.3.1'],['Owner','Platform Team'],
    ['Description','Handles all report generation and scheduling tasks.'],
    ['Logical','true'],['Deleted at','2026-06-28 14:44:02'],['Deleted by','lukas'],
    ['Deletion reason','Decommissioned — replaced by Analytics-Service'],
  ];
  let spy=CONTENT_Y+120;
  snapProps.forEach(([k,v],i)=>{
    const bg=i%2===0?P.panel:P.panelAlt;
    ch.push(r(0,spy,SNAP_W,18,'SN/PR'+i,bg));
    ch.push(t(8,spy+3,130,12,'SN/PK'+i,k+':',9,500,P.muted,'left'));
    const isRed=k.includes('Deleted')||k.includes('reason');
    ch.push(t(142,spy+3,SNAP_W-150,12,'SN/PV'+i,v,10,400,isRed?P.remText:P.text,'left'));
    spy+=18;
  });

  // Relations snapshot
  ch.push(r(0,spy+4,SNAP_W,20,'SN/RelS',P.secBg));
  ch.push(t(8,spy+7,SNAP_W-16,13,'SN/RelST','Relations at time of deletion',10,600,P.muted,'left'));
  spy+=24;
  [
    {dir:'→',name:'Portal-Frontend',type:'AC',rel:'uses'},
    {dir:'←',name:'PostgreSQL-DB',  type:'TB',rel:'reads/writes'},
    {dir:'→',name:'REST-API',       type:'AS',rel:'exposes via'},
  ].forEach((rel,i)=>{
    const mc=TYPE_COL[rel.type]||P.muted;
    ch.push(r(0,spy,SNAP_W,22,'SN/RelR'+i,i%2===0?P.panel:P.panelAlt));
    ch.push(t(8,spy+4,16,14,'SN/RelDir'+i,rel.dir,11,700,P.muted,'center'));
    ch.push(r(28,spy+6,24,10,'SN/RelBdg'+i,mc,0.15,mc,1));
    ch.push(t(28,spy+7,24,8,'SN/RelBT'+i,rel.type,7,700,mc,'center'));
    ch.push(t(56,spy+4,SNAP_W-100,14,'SN/RelName'+i,rel.name,10,400,P.text,'left'));
    ch.push(t(SNAP_W-72,spy+4,64,14,'SN/RelType'+i,'['+rel.rel+']',9,400,P.muted,'right'));
    spy+=22;
  });

  // ── DIVIDER ──
  ch.push(r(SNAP_W,CONTENT_Y,DIV_W,CONTENT_H,'Div',P.border));

  // ── RIGHT PANEL: Impact + Restore ──
  ch.push(r(ACT_X,CONTENT_Y,ACT_W,CONTENT_H,'ACT/Bg',P.panel));
  ch.push(r(ACT_X,CONTENT_Y,ACT_W,28,'ACT/HBg',P.secBg,1,P.border,1));
  ch.push(t(ACT_X+8,CONTENT_Y+7,ACT_W-16,14,'ACT/HT','Impact Analysis & Restore',12,600,P.text,'left'));

  let ap=CONTENT_Y+36;
  const aSec=(k,l)=>{ch.push(r(ACT_X,ap,ACT_W,20,`ACT/${k}S`,P.secBg));ch.push(t(ACT_X+8,ap+3,ACT_W-16,13,`ACT/${k}SL`,l,10,600,P.muted,'left'));ap+=20;};

  aSec('Diag','Affected Diagrams  (3)');
  [
    {name:'OEA Architecture Overview',status:'active',shapes:1},
    {name:'AS-IS Application Map 2026',status:'active',shapes:2},
    {name:'Platform Decommission Plan',status:'archived',shapes:1},
  ].forEach((d,i)=>{
    ch.push(r(ACT_X+8,ap+2,ACT_W-16,32,'ACT/DR'+i,P.panelAlt,1,P.border,1));
    ch.push(r(ACT_X+12,ap+8,8,8,'ACT/DC'+i,'#0891B2'));
    ch.push(t(ACT_X+24,ap+6,ACT_W-100,14,'ACT/DN'+i,d.name,10,500,P.text,'left'));
    const stC=d.status==='active'?'#059669':'#64748B';
    ch.push(r(ACT_X+ACT_W-96,ap+8,60,16,'ACT/DSBg'+i,stC,0.12,stC,1));
    ch.push(t(ACT_X+ACT_W-96,ap+11,60,10,'ACT/DST'+i,d.status,8,500,stC,'center'));
    ch.push(t(ACT_X+24,ap+20,ACT_W-100,11,'ACT/DShp'+i,`${d.shapes} shape${d.shapes>1?'s':''} referencing this entity`,9,400,P.muted,'left'));
    ap+=34;
  });
  ap+=4;

  aSec('Opt','Restore Options');
  // Option 1: Restore entity only
  ch.push(r(ACT_X+8,ap+2,ACT_W-16,44,'ACT/O1',P.panel,1,P.primary,1.5));
  ch.push(r(ACT_X+12,ap+14,16,16,'ACT/O1Radio',P.selBg||'#E0F2FE',1,P.primary,2));
  ch.push(r(ACT_X+14,ap+16,12,12,'ACT/O1Dot',P.primary));
  ch.push(t(ACT_X+34,ap+7,ACT_W-50,14,'ACT/O1T','Restore entity only',11,600,P.text,'left'));
  ch.push(t(ACT_X+34,ap+22,ACT_W-50,12,'ACT/O1D','Entity becomes active again. Diagrams show a "restored" indicator on the shape.',9,400,P.muted,'left'));
  ap+=48;
  // Option 2: Restore + add back to diagrams
  ch.push(r(ACT_X+8,ap+2,ACT_W-16,44,'ACT/O2',P.panelAlt,1,P.border,1));
  ch.push(r(ACT_X+12,ap+14,16,16,'ACT/O2Radio',P.panelAlt,1,P.border,1));
  ch.push(t(ACT_X+34,ap+7,ACT_W-50,14,'ACT/O2T','Restore entity + re-add to all affected diagrams',11,400,P.text,'left'));
  ch.push(t(ACT_X+34,ap+22,ACT_W-50,12,'ACT/O2D','Shape is re-inserted in 3 diagrams at original position.',9,400,P.muted,'left'));
  ap+=50;

  aSec('Rsn','Restore Reason (optional)');
  ch.push(r(ACT_X+8,ap,ACT_W-16,32,'ACT/RsnF',P.inputBg,1,P.border,1));
  ch.push(t(ACT_X+12,ap+8,ACT_W-24,16,'ACT/RsnV','Restored: requirements re-scoped, entity still needed.',10,400,P.text,'left'));
  ap+=36+8;

  // Confirmation buttons
  ch.push(r(ACT_X+8,ap,ACT_W-16,36,'ACT/RestBtn',P.primary));
  ch.push(t(ACT_X+8,ap+10,ACT_W-16,16,'ACT/RestBtnT','↩  Restore Entity',13,700,'#FFFFFF','center'));
  ap+=40;
  ch.push(r(ACT_X+8,ap,ACT_W-16,30,'ACT/CancelBtn',P.inputBg,1,P.border,1));
  ch.push(t(ACT_X+8,ap+8,ACT_W-16,14,'ACT/CancelBtnT','Cancel',12,500,P.muted,'center'));
  ap+=34;

  // Audit trail note
  ch.push(r(ACT_X+8,ap,ACT_W-16,24,'ACT/AuditNote',P.secBg,1,P.border,1));
  ch.push(t(ACT_X+12,ap+6,ACT_W-24,12,'ACT/AuditNoteT',
    'ℹ  This restore action will be recorded in the audit log.',9,400,P.muted,'left'));

  // ── STATUS BAR ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,480,12,'St/L','Restore Entity  ·  Reporting-Engine  ·  3 affected diagrams',10,400,P.statusText,'left'));
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
      for(const f of files.filter(f=>f.name&&(f.name.includes('Audit Log')||f.name.includes('Restore Entity'))))
        await rpc('delete-file',{id:f.id});
      // SCR-026
      const f26=await rpc('create-file',{name:'OEA - Audit Log v0.1',project_id:PID});
      const all26=[];
      for(const{row,m}of modes) all26.push(canvasText(f26.data.pages[0],-160,sy(row)+FH/2-10,150,20,`Lbl${m}`,`${m} Mode`,13,600,'#64748B','right'));
      for(const{row,P,m}of modes){const{changes}=auditLog(f26.data.pages[0],row,P,m);all26.push(...changes);}
      await rpc('update-file',{id:f26.id,'session-id':f26.id,revn:0,vern:0,changes:all26});
      console.log(`Penpot SCR-026: ${all26.length} shapes`);
      // SCR-027
      const f27=await rpc('create-file',{name:'OEA - Restore Entity v0.1',project_id:PID});
      const all27=[];
      for(const{row,m}of modes) all27.push(canvasText(f27.data.pages[0],-160,sy(row)+FH/2-10,150,20,`Lbl${m}`,`${m} Mode`,13,600,'#64748B','right'));
      for(const{row,P,m}of modes){const{changes}=restoreEntity(f27.data.pages[0],row,P,m);all27.push(...changes);}
      await rpc('update-file',{id:f27.id,'session-id':f27.id,revn:0,vern:0,changes:all27});
      console.log(`Penpot SCR-027: ${all27.length} shapes`);
      console.log(`URL: ${API}dashboard/projects/${PID}`);
    }catch(e){console.warn(`Penpot failed: ${e.message}`);}
  } else console.log('(Penpot skipped)');

  console.log('\nSVG ...');
  for(const{row,P,m}of modes){
    const{changes:c26}=auditLog(pid,row,P,m);
    generateLocalSVG(c26[0],c26.slice(1),path.join(outDir,`audit-log-${m.toLowerCase()}.svg`));
    const{changes:c27}=restoreEntity(pid,row,P,m);
    generateLocalSVG(c27[0],c27.slice(1),path.join(outDir,`restore-entity-${m.toLowerCase()}.svg`));
    console.log(`  audit-log-${m.toLowerCase()}.svg`);
    console.log(`  restore-entity-${m.toLowerCase()}.svg`);
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
