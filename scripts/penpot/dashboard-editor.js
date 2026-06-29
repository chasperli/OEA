#!/usr/bin/env node
/**
 * OEA Dashboard-Editor (SCR-024) — UC-07: Architecture Dashboard erstellen
 * Layout: Widget-Palette (260) | Canvas (720) | Properties (296)
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280,FH=800,GAP=100;
const sy=row=>row*(FH+GAP);
const MENU_H=28,TOOL_H=36,MAIN_Y=64,MAIN_H=712;
const LEFT_W=260,DIV_W=4,RIGHT_W=296;
const CANVAS_X=LEFT_W+DIV_W,CANVAS_W=FW-LEFT_W-DIV_W*2-RIGHT_W; // 720
const RIGHT_X=CANVAS_X+CANVAS_W+DIV_W;
const STATUS_Y=776,STATUS_H=24;

const L={
  panel:'#FFFFFF',panelAlt:'#F8FAFC',menuBg:'#1E293B',menuText:'#E2E8F0',
  primary:'#0EA5E9',text:'#0F172A',muted:'#64748B',
  border:'#E2E8F0',inputBg:'#F8FAFC',selBg:'#E0F2FE',secBg:'#F1F5F9',
  canvas:'#F0F4F8',overlay:'#FFFFFF',statusText:'#94A3B8',
  kpiGreen:'#059669',kpiRed:'#DC2626',kpiAmber:'#D97706',kpiBlue:'#2563EB',
  barFill:'#0EA5E9',barAlt:'#7C3AED',bar3:'#059669',
};
const D={
  panel:'#1E293B',panelAlt:'#172030',menuBg:'#020617',menuText:'#CBD5E1',
  primary:'#38BDF8',text:'#F1F5F9',muted:'#94A3B8',
  border:'#334155',inputBg:'#0B1829',selBg:'#0C4A6E',secBg:'#162030',
  canvas:'#0A1525',overlay:'#1E293B',statusText:'#64748B',
  kpiGreen:'#10B981',kpiRed:'#F87171',kpiAmber:'#FBBF24',kpiBlue:'#60A5FA',
  barFill:'#38BDF8',barAlt:'#A78BFA',bar3:'#34D399',
};

function screen(pid,row,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/DashboardEditor`);
  const ch=[change];

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['Edit',54],['View',100],['Dashboard',148],['Help',228]].forEach(([l,x])=>ch.push(t(x,6,58,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,60,14,'TBC1','Dashboards',12,400,P.muted,'left'));
  ch.push(t(70,MENU_H+11,8,14,'TBC2','›',12,400,P.muted,'center'));
  ch.push(t(80,MENU_H+11,220,14,'TBC3','Architecture Overview Q2-2026',12,600,P.text,'left'));
  // Edit / Preview tabs
  ch.push(r(320,MENU_H+6,56,22,'TBEditTab',P.selBg,1,P.primary,1));
  ch.push(t(320,MENU_H+10,56,14,'TBEditTabT','✏ Edit',10,600,P.primary,'center'));
  ch.push(r(378,MENU_H+6,62,22,'TBPrevTab',P.inputBg,1,P.border,1));
  ch.push(t(378,MENU_H+10,62,14,'TBPrevTabT','▷ Preview',10,400,P.muted,'center'));
  ch.push(r(448,MENU_H+8,1,18,'TBSep',P.border));
  ch.push(r(456,MENU_H+6,56,22,'TBGridTab',P.inputBg,1,P.border,1));
  ch.push(t(456,MENU_H+10,56,14,'TBGridTabT','⊞ Grid',10,400,P.muted,'center'));
  ch.push(r(FW-196,MENU_H+6,84,22,'TBAddBtn',P.inputBg,1,P.primary,1));
  ch.push(t(FW-196,MENU_H+10,84,14,'TBAddBtnT','+ Add Widget',10,600,P.primary,'center'));
  ch.push(r(FW-104,MENU_H+6,64,22,'TBSaveBtn',P.primary));
  ch.push(t(FW-104,MENU_H+10,64,14,'TBSaveBtnT','Publish',10,600,'#FFFFFF','center'));

  // ── DIVIDERS ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,MAIN_H,'DivLC',P.border));
  ch.push(r(RIGHT_X-DIV_W,MAIN_Y,DIV_W,MAIN_H,'DivCR',P.border));

  // ══════════════════════════════════════════════════════════════
  // WIDGET PALETTE (left)
  // ══════════════════════════════════════════════════════════════
  ch.push(r(0,MAIN_Y,LEFT_W,MAIN_H,'PAL/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LEFT_W,28,'PAL/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+7,LEFT_W-16,14,'PAL/HT','Widget-Palette',11,600,P.text,'left'));

  let ply=MAIN_Y+28;
  const palSec=(k,lbl)=>{
    ch.push(r(0,ply,LEFT_W,20,'PAL/S'+k,P.secBg));
    ch.push(t(6,ply+3,LEFT_W-12,13,'PAL/SL'+k,lbl,10,600,P.muted,'left'));
    ply+=20;
  };
  const palItem=(k,icon,lbl,sub)=>{
    ch.push(r(6,ply+2,LEFT_W-12,36,'PAL/I'+k,P.panelAlt,1,P.border,1));
    ch.push(r(10,ply+6,32,28,'PAL/IB'+k,P.selBg,1,P.border,1));
    ch.push(t(10,ply+12,32,16,'PAL/IT'+k,icon,13,700,P.primary,'center'));
    ch.push(t(46,ply+8,LEFT_W-56,13,'PAL/IL'+k,lbl,10,500,P.text,'left'));
    ch.push(t(46,ply+22,LEFT_W-56,11,'PAL/IS'+k,sub,9,400,P.muted,'left'));
    ply+=40;
  };
  palSec('A','Kennzahlen');
  palItem('KPI','#','KPI-Karte','Einzelwert mit Trend');
  palItem('TBL','≡','Tabelle','Filterbarer Datensatz');
  palSec('B','Visualisierung');
  palItem('BAR','∎','Balkendiagramm','Horizontal oder vertikal');
  palItem('LINE','~','Liniendiagramm','Zeitreihe');
  palItem('PIE','◔','Kreisdiagramm','Anteilsverteilung');
  palSec('C','EA-spezifisch');
  palItem('DIA','⬡','Diagramm-Embed','ArchiMate / BPMN');
  palItem('MAT','⊞','Heatmap / Matrix','Capability × Readiness');
  palItem('TML','→','Timeline / Roadmap','Plateaus, Meilensteine');
  palSec('D','Layout');
  palItem('TXT','T','Text-Block','Markdown, Überschriften');
  palItem('DIV','—','Trennlinie / Bereich','Gliederungselement');

  // ══════════════════════════════════════════════════════════════
  // DASHBOARD CANVAS
  // ══════════════════════════════════════════════════════════════
  const CX=CANVAS_X,CY=MAIN_Y;
  const CW=CANVAS_W,CH=MAIN_H;

  ch.push(r(CX,CY,CW,CH,'CV/Bg',P.canvas));
  // Grid dots
  for(let gx=20;gx<CW;gx+=20) for(let gy=20;gy<CH;gy+=20)
    ch.push(r(CX+gx,CY+gy,2,2,`CV/D${gx}_${gy}`,P.border,0.5));

  const W=(x,y,w,h,key,sel)=>{
    if(sel){ch.push(r(CX+x-2,CY+y-2,w+4,h+4,`${key}/SelR`,P.selBg,1,P.primary,2));}
    ch.push(r(CX+x,CY+y,w,h,`${key}/Bg`,P.panel,1,sel?P.primary:P.border,sel?1.5:1));
    if(sel){
      [[-2,-2],[w-4,-2],[-2,h-4],[w-4,h-4]].forEach(([hx,hy],i)=>
        ch.push(r(CX+x+hx,CY+y+hy,6,6,`${key}/H${i}`,P.panel,1,P.primary,1.5)));
    }
    return{wx:CX+x,wy:CY+y,ww:w,wh:h};
  };

  // ── Row 1: KPI Cards (y=12, h=82) ──
  const kpiW=220,kpiH=82,kpiY=12,kpiGap=12;
  const kpis=[
    {val:'47',lbl:'Active Components',delta:'+3',ddir:'up',  col:P.kpiGreen},
    {val:'8', lbl:'Open Risk Items',   delta:'+2',ddir:'up',  col:P.kpiRed},
    {val:'94%',lbl:'Compliance Score', delta:'→ stable',ddir:'flat',col:P.kpiBlue},
    {val:'12', lbl:'Pending Reviews',  delta:'−4',ddir:'down',col:P.kpiAmber},
  ];
  const totalKpiW=kpis.length*(kpiW+kpiGap)-kpiGap;
  const kpiStartX=Math.round((CW-totalKpiW)/2);
  kpis.forEach((k,i)=>{
    const sel=i===1;
    const{wx,wy}=W(kpiStartX+i*(kpiW+kpiGap),kpiY,kpiW,kpiH,`KPI${i}`,sel);
    ch.push(t(wx+8,wy+6,kpiW-16,11,`KPI${i}/L`,k.lbl,9,500,P.muted,'left'));
    ch.push(t(wx+8,wy+20,80,32,`KPI${i}/V`,k.val,28,700,P.text,'left'));
    // Delta badge
    const dc=k.ddir==='up'?(k.col===P.kpiRed?P.kpiRed:P.kpiGreen):k.ddir==='down'?P.kpiGreen:P.kpiBlue;
    ch.push(r(wx+8,wy+58,kpiW-16,16,`KPI${i}/DBg`,dc,0.12,dc,0.4));
    ch.push(t(wx+12,wy+59,kpiW-24,13,`KPI${i}/DT`,`${k.ddir==='up'?'↑':k.ddir==='down'?'↓':''}  ${k.delta}  vs last month`,9,500,dc,'left'));
  });

  // ── Row 2: Bar chart + Pie chart (y=106, h=230) ──
  const r2y=106, r2h=230;
  const barW=340, pieW=340;
  const r2gap=CW-barW-pieW-24;
  const bar_x=12, pie_x=bar_x+barW+r2gap;

  // Bar chart (selected)
  W(bar_x,r2y,barW,r2h,'BAR',true);
  const bx=CX+bar_x,by=CY+r2y;
  ch.push(t(bx+8,by+8,barW-16,14,'BAR/T','Components by Layer',11,700,P.text,'left'));
  ch.push(t(bx+8,by+22,barW-16,11,'BAR/Sub','Source: /api/v1/entities?groupBy=layer',9,400,P.muted,'left'));
  // Horizontal bars
  const bars=[
    {lbl:'Application',  pct:42,col:P.barFill},
    {lbl:'Technology',   pct:31,col:P.barAlt},
    {lbl:'Integration',  pct:15,col:P.bar3},
    {lbl:'Business',     pct:8, col:P.kpiAmber},
    {lbl:'Data',         pct:4, col:P.kpiRed},
  ];
  const BAR_AREA_W=barW-90,BAR_X0=70;
  bars.forEach((b,i)=>{
    const barY=by+44+i*34;
    const barPx=Math.round(BAR_AREA_W*b.pct/100);
    ch.push(t(bx+6,barY+4,60,13,'BAR/L'+i,b.lbl,9,400,P.muted,'right'));
    ch.push(r(bx+BAR_X0,barY,BAR_AREA_W,20,'BAR/BG'+i,P.panelAlt));
    ch.push(r(bx+BAR_X0,barY,barPx,20,'BAR/B'+i,b.col,0.8));
    ch.push(t(bx+BAR_X0+barPx+4,barY+3,30,13,'BAR/V'+i,`${b.pct}%`,9,500,P.muted,'left'));
  });

  // Pie chart (simplified donut with legend)
  W(pie_x,r2y,pieW,r2h,'PIE',false);
  const px=CX+pie_x,py=CY+r2y;
  ch.push(t(px+8,py+8,pieW-16,14,'PIE/T','Entity Status Distribution',11,700,P.text,'left'));
  ch.push(t(px+8,py+22,pieW-16,11,'PIE/Sub','Source: /api/v1/entities?groupBy=status',9,400,P.muted,'left'));
  // Donut approximation: stacked rings
  const DON_CX=px+100,DON_CY=py+r2h/2+10,DON_R=64;
  ch.push(r(DON_CX-DON_R,DON_CY-DON_R,DON_R*2,DON_R*2,'PIE/Ring',P.border,0,P.kpiGreen,8));
  ch.push(r(DON_CX-DON_R+8,DON_CY-DON_R+8,DON_R*2-16,DON_R*2-16,'PIE/Inner',P.panel,0,P.kpiAmber,8));
  ch.push(r(DON_CX-DON_R+16,DON_CY-DON_R+16,DON_R*2-32,DON_R*2-32,'PIE/Core',P.panel,0,P.kpiBlue,6));
  ch.push(r(DON_CX-24,DON_CY-20,48,40,'PIE/Hole',P.panel));
  ch.push(t(DON_CX-24,DON_CY-14,48,14,'PIE/HT','47',16,700,P.text,'center'));
  ch.push(t(DON_CX-24,DON_CY+4,48,11,'PIE/HS','total',9,400,P.muted,'center'));
  // Legend
  const pieLeg=[
    {col:P.kpiGreen, lbl:'Active',     n:'20',pct:'43%'},
    {col:P.kpiAmber, lbl:'Planned',    n:'14',pct:'30%'},
    {col:P.kpiBlue,  lbl:'Deprecated', n:'8', pct:'17%'},
    {col:P.kpiRed,   lbl:'Retired',    n:'5', pct:'10%'},
  ];
  pieLeg.forEach((l,i)=>{
    const lgy=py+52+i*36;
    ch.push(r(px+204,lgy,12,12,'PIE/LD'+i,l.col));
    ch.push(t(px+222,lgy-1,60,13,'PIE/LL'+i,l.lbl,10,500,P.text,'left'));
    ch.push(t(px+284,lgy-1,24,13,'PIE/LN'+i,l.n,10,600,P.text,'center'));
    ch.push(t(px+310,lgy-1,24,13,'PIE/LP'+i,l.pct,9,400,P.muted,'left'));
  });

  // ── Row 3: Table (y=348, h=220) ──
  const tblY=348,tblH=220,tblX=12,tblW=CW-24;
  W(tblX,tblY,tblW,tblH,'TBL',false);
  const tx=CX+tblX,ty=CY+tblY;
  ch.push(t(tx+8,ty+8,tblW-80,14,'TBL/T','Recently Changed Entities',11,700,P.text,'left'));
  ch.push(r(tx+tblW-76,ty+5,68,22,'TBL/RefBtn',P.inputBg,1,P.border,1));
  ch.push(t(tx+tblW-76,ty+9,68,13,'TBL/RefBtnT','⟳ Refresh',9,400,P.muted,'center'));
  // Column headers
  const cols=[
    {k:'ts',  w:132,l:'Timestamp'},
    {k:'ent', w:180,l:'Entity'},
    {k:'mt',  w:100,l:'Meta-Type'},
    {k:'prop',w:140,l:'Changed Properties'},
    {k:'usr', w:80, l:'Changed by'},
    {k:'src', w:74, l:'Source'},
  ];
  ch.push(r(tx,ty+30,tblW,20,'TBL/HBg',P.secBg,1,P.border,0.5));
  let colX=tx;
  cols.forEach(c=>{ch.push(t(colX+4,ty+33,c.w-8,12,`TBL/CH${c.k}`,c.l,9,600,P.muted,'left'));colX+=c.w;});
  const rows=[
    ['2026-06-29 06:15','ETL-Sync-Service [AC]','Application','status → active','etl-bot','API'],
    ['2026-06-29 04:31','OEA-Data-Warehouse [DW]','Data','added 3 schemas','m.mueller','UI'],
    ['2026-06-28 17:44','Auth-Service [AC]','Application','version 2.4.1 → 2.5.0','l.baum','API'],
    ['2026-06-28 14:12','Portal-Frontend [AC]','Application','lifecycle: planned → active','admin','UI'],
    ['2026-06-28 11:03','Reporting-Engine [AC]','Application','deleted (soft)','system','Job'],
  ];
  rows.forEach((row,i)=>{
    const ry=ty+50+i*30;
    const isDel=row[5]==='Job'&&row[4]==='system';
    ch.push(r(tx,ry,tblW,30,`TBL/R${i}Bg`,isDel?'#FEE2E2':i%2===0?P.panel:P.panelAlt,isDel?0.5:1,P.border,0.3));
    let cx=tx;
    row.forEach((cell,j)=>{
      const tc=isDel?P.kpiRed:j===2?P.primary:P.text;
      ch.push(t(cx+4,ry+9,cols[j].w-8,12,`TBL/R${i}C${j}`,cell,9,isDel?500:400,tc,'left'));
      cx+=cols[j].w;
    });
  });
  ch.push(t(tx+8,ty+tblH-14,200,12,'TBL/Foot','5 of 134 entries  ·  sorted by timestamp desc',9,400,P.muted,'left'));
  ch.push(r(tx+tblW-86,ty+tblH-18,78,14,'TBL/PgBtn',P.inputBg,1,P.border,1));
  ch.push(t(tx+tblW-86,ty+tblH-17,78,11,'TBL/PgBtnT','1  2  3  ›  last',8,400,P.muted,'center'));

  // ── Row 4: Diagram Embed (y=580, h=120) ──
  const embY=580,embH=120,embX=12,embW=CW-24;
  W(embX,embY,embW,embH,'EMB',false);
  const ex=CX+embX,ey=CY+embY;
  ch.push(t(ex+8,ey+8,200,14,'EMB/T','Embedded Diagram: «Solution Context»',11,700,P.text,'left'));
  ch.push(r(ex+tblW-68,ey+5,60,22,'EMB/OpenBtn',P.inputBg,1,P.primary,1));
  ch.push(t(ex+tblW-68,ey+9,60,13,'EMB/OpenBtnT','Open ↗',9,600,P.primary,'center'));
  ch.push(r(ex+8,ey+28,embW-16,76,'EMB/Prev',P.canvas,1,P.border,0.5));
  ch.push(t(ex+embW/2-80,ey+56,160,14,'EMB/PrevT','[Diagram preview — click to open in editor]',10,400,P.muted,'center'));

  // ══════════════════════════════════════════════════════════════
  // RIGHT PROPERTIES PANEL (selected: Balkendiagramm "By Layer")
  // ══════════════════════════════════════════════════════════════
  const rp=RIGHT_X,rpw=RIGHT_W-16,rpxb=RIGHT_X+8;
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,28,'RP/TabBg',P.secBg,1,P.border,1));
  ch.push(r(RIGHT_X,MAIN_Y,100,28,'RP/TabA',P.panel,1,P.border,1));
  ch.push(t(RIGHT_X,MAIN_Y+6,100,16,'RP/TabAT','Widget',12,600,P.primary,'center'));
  ch.push(t(RIGHT_X+100,MAIN_Y+6,80,16,'RP/TabBT','Data',12,400,P.muted,'center'));
  let rpy=MAIN_Y+36;
  const rSec=(k,l)=>{ch.push(r(RIGHT_X,rpy,RIGHT_W,20,`RP/S${k}`,P.secBg));ch.push(t(rpxb,rpy+3,rpw,12,`RP/SL${k}`,l,10,600,P.muted,'left'));rpy+=20;};
  const rFld=(k,l,v,hl)=>{
    ch.push(t(rpxb,rpy+1,rpw,11,`RP/${k}FL`,l,9,500,P.muted,'left'));rpy+=12;
    ch.push(r(rpxb,rpy,rpw,22,`RP/${k}FF`,P.inputBg,1,hl?P.primary:P.border,1));
    ch.push(t(rpxb+4,rpy+4,rpw-8,13,`RP/${k}FV`,v,11,400,P.text,'left'));rpy+=26;
  };
  const rToggle=(k,l,on)=>{
    ch.push(t(rpxb,rpy+4,rpw-44,12,`RP/${k}TL`,l,10,400,P.text,'left'));
    ch.push(r(RIGHT_X+RIGHT_W-42,rpy+2,34,18,`RP/${k}TBg`,on?P.primary:P.border));
    ch.push(r(RIGHT_X+RIGHT_W-(on?12:26),rpy+4,14,14,`RP/${k}TDot`,'#FFFFFF'));
    rpy+=24;
  };
  rSec('Gen','General');
  rFld('Title','Widget Title','Components by Layer',true);
  rFld('Desc','Description / Subtitle','Grouped by EA layer',false);
  rSec('Data','Data Source');
  rFld('URL','API Endpoint','/api/v1/entities?groupBy=layer',false);
  rFld('Ref','Refresh Interval','Every 5 minutes',false);
  rFld('Fltr','Filter','status=active,deprecated',false);
  rSec('Chart','Chart Options');
  rFld('Type','Chart Type','Horizontal Bar',false);
  rFld('Sort','Sort By','Value (descending)',false);
  rToggle('Vals','Show Values',true);
  rToggle('Lgnd','Show Legend',false);
  rSec('Sty','Layout & Style');
  rFld('W','Width (grid columns)','6 / 12  (50%)',false);
  rFld('H','Height (rows)','3 rows (230px)',false);

  // Delete widget button
  ch.push(r(rpxb,rpy+8,rpw,28,'RP/DelBtn','#FEE2E2',1,'#DC2626',1));
  ch.push(t(rpxb,rpy+14,rpw,14,'RP/DelBtnT','Remove Widget',11,600,'#DC2626','center'));

  // ── STATUS ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,480,12,'St/L','Dashboard  ·  Architecture Overview Q2-2026  ·  5 widgets  ·  Edit mode',10,400,P.statusText,'left'));
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
      for(const f of files.filter(f=>f.name&&f.name.includes('Dashboard')))await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Dashboard v0.1',project_id:PID});
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
    generateLocalSVG(changes[0],changes.slice(1),path.join(outDir,`dashboard-editor-${m.toLowerCase()}.svg`));
    console.log(`  dashboard-editor-${m.toLowerCase()}.svg`);
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
