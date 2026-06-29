#!/usr/bin/env node
/**
 * OEA Data-Lineage-Editor (SCR-023) — UC-08: Model Data Lineage
 * Layout: Explorer (260) | Palette (180) | Canvas (532) | Properties (296)
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280,FH=800,GAP=100;
const sy=row=>row*(FH+GAP);
const MENU_H=28,TOOL_H=36,MAIN_Y=64,MAIN_H=520;
const LEFT_W=260,DIV_W=4,RIGHT_W=296;
const PALETTE_W=180,PALETTE_X=LEFT_W+DIV_W;      // 264
const CANVAS_X=PALETTE_X+PALETTE_W+DIV_W;         // 448
const CANVAS_W=FW-CANVAS_X-DIV_W-RIGHT_W;         // 532
const RIGHT_X=CANVAS_X+CANVAS_W+DIV_W;            // 984
const DIAG_TOOL_H=34,CANVAS_Y=MAIN_Y+DIAG_TOOL_H; // 98
const CANVAS_H=MAIN_H-DIAG_TOOL_H;
const BOTTOM_Y=MAIN_Y+MAIN_H,BOTTOM_H=192,STATUS_Y=776,STATUS_H=24;

// Lineage node type colors
const NC={
  source:{col:'#059669',bg:'#DCFCE7',icon:'DB'},
  apiin :{col:'#0284C7',bg:'#DBEAFE',icon:'AP'},
  file  :{col:'#7C3AED',bg:'#EDE9FE',icon:'FL'},
  etl   :{col:'#D97706',bg:'#FEF9C3',icon:'ET'},
  stream:{col:'#EA580C',bg:'#FFEDD5',icon:'SK'},
  dw    :{col:'#0F172A',bg:'#F1F5F9',icon:'DW'},
  mart  :{col:'#6D28D9',bg:'#EDE9FE',icon:'DM'},
};

const L={
  panel:'#FFFFFF',panelAlt:'#F8FAFC',menuBg:'#1E293B',menuText:'#E2E8F0',
  primary:'#0EA5E9',text:'#0F172A',muted:'#64748B',
  border:'#E2E8F0',inputBg:'#F8FAFC',selBg:'#E0F2FE',secBg:'#F1F5F9',
  canvas:'#FAFCFF',overlay:'#FFFFFF',grid:'#94A3B8',statusText:'#94A3B8',
};
const D={
  panel:'#1E293B',panelAlt:'#172030',menuBg:'#020617',menuText:'#CBD5E1',
  primary:'#38BDF8',text:'#F1F5F9',muted:'#94A3B8',
  border:'#334155',inputBg:'#0B1829',selBg:'#0C4A6E',secBg:'#162030',
  canvas:'#0D1B2E',overlay:'#1E293B',grid:'#1E3A5A',statusText:'#64748B',
};

function screen(pid,row,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/DataLineage`);
  const ch=[change];
  const cR=(cx,cy,w,h,n,fill,fo=1,sc,sw)=>ch.push(r(CANVAS_X+cx,CANVAS_Y+cy,w,h,n,fill,fo,sc,sw));
  const cT=(cx,cy,w,h,n,txt,sz,wt,col,al)=>ch.push(t(CANVAS_X+cx,CANVAS_Y+cy,w,h,n,txt,sz,wt,col,al));
  const pR=(px,py,w,h,n,fill,fo=1,sc,sw)=>ch.push(r(PALETTE_X+px,MAIN_Y+py,w,h,n,fill,fo,sc,sw));
  const pT=(px,py,w,h,n,txt,sz,wt,col,al)=>ch.push(t(PALETTE_X+px,MAIN_Y+py,w,h,n,txt,sz,wt,col,al));

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['Edit',54],['View',100],['Lineage',148],['Help',210]].forEach(([l,x])=>ch.push(t(x,6,50,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,60,14,'TBC1','Lineage',12,400,P.muted,'left'));
  ch.push(t(70,MENU_H+11,8,14,'TBC2','›',12,400,P.muted,'center'));
  ch.push(t(80,MENU_H+11,240,14,'TBC3','OEA Analytics Pipeline',12,600,P.text,'left'));
  ch.push(r(FW-102,MENU_H+7,76,22,'BtnSave',P.primary));
  ch.push(t(FW-102,MENU_H+11,76,14,'BtnSaveT','Save',11,600,'#FFFFFF','center'));

  // ── DIVIDERS ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,MAIN_H,'DivLPal',P.border));
  ch.push(r(PALETTE_X+PALETTE_W,MAIN_Y,DIV_W,MAIN_H,'DivPalC',P.border));
  ch.push(r(RIGHT_X-DIV_W,MAIN_Y,DIV_W,MAIN_H,'DivCR',P.border));

  // ── EXPLORER ──
  ch.push(r(0,MAIN_Y,LEFT_W,MAIN_H,'LP/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LEFT_W,28,'LP/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+7,LEFT_W-16,14,'LP/HT','Explorer',12,600,P.text,'left'));
  ch.push(r(8,MAIN_Y+36,LEFT_W-16,24,'LP/Srch',P.inputBg,1,P.border,1));
  ch.push(t(14,MAIN_Y+42,LEFT_W-28,12,'LP/SrchT','Search...',11,400,P.muted,'left'));
  let ly=MAIN_Y+68;
  [
    {l:'OEA Solution',dot:'#0F172A',exp:true},
    {l:'  Lineage Graphs  (3)',dot:'#059669',exp:true,i:true},
    {l:'    OEA Analytics Pipeline',dot:'#0284C7',exp:false,i2:true,sel:true},
    {l:'    ERP Data Sync',dot:'#0284C7',exp:false,i2:true},
    {l:'  Catalogs  (5)',dot:'#D97706',exp:false,i:true},
  ].forEach((n,i)=>{
    const ind=n.i2?28:n.i?14:4;
    const bg=n.sel?P.selBg:P.panel;
    ch.push(r(0,ly,LEFT_W,20,`LP/R${i}`,bg));
    ch.push(t(ind,ly+3,10,13,`LP/A${i}`,n.exp?'▼':'▶',9,700,P.muted,'left'));
    ch.push(r(ind+12,ly+7,8,8,`LP/D${i}`,n.dot));
    ch.push(t(ind+22,ly+3,LEFT_W-ind-30,13,`LP/L${i}`,n.l.trim(),10,n.sel?600:400,n.sel?P.primary:P.text,'left'));
    ly+=22;
  });

  // ── SHAPE PALETTE ──
  pR(0,0,PALETTE_W,MAIN_H,'PAL/Bg',P.panelAlt);
  pR(0,0,PALETTE_W,28,'PAL/HBg',P.secBg,1,P.border,1);
  pT(8,7,PALETTE_W-36,14,'PAL/HT','Lineage Shapes',11,600,P.text,'left');
  let py=28;
  const palSec=(label,items)=>{
    pR(0,py,PALETTE_W,20,'PAL/S'+py,P.secBg);
    pT(6,py+3,PALETTE_W-12,13,'PAL/SL'+py,label,10,600,P.muted,'left');
    py+=20;
    items.forEach(it=>{
      const nc=NC[it.type]||{col:P.muted,bg:P.panelAlt,icon:'??'};
      pR(6,py+2,PALETTE_W-12,28,'PAL/I'+py,P.panel,1,P.border,1);
      pR(10,py+6,20,16,'PAL/IB'+py,nc.col,0.15);
      pT(10,py+8,20,11,'PAL/IT'+py,nc.icon,7,700,nc.col,'center');
      pT(34,py+8,PALETTE_W-42,12,'PAL/IL'+py,it.label,9,400,P.text,'left');
      py+=30;
    });
    py+=4;
  };
  palSec('Source',[
    {type:'source',label:'Database / Table'},
    {type:'apiin', label:'API Endpoint'},
    {type:'file',  label:'File / Object Store'},
  ]);
  palSec('Transform',[
    {type:'etl',   label:'ETL Job'},
    {type:'stream',label:'Stream Processor'},
    {type:'etl',   label:'Script / Function'},
  ]);
  palSec('Target',[
    {type:'dw',    label:'Data Warehouse'},
    {type:'mart',  label:'Data Mart / View'},
    {type:'apiin', label:'API Sink'},
  ]);

  // ── DIAGRAM TOOLBAR ──
  ch.push(r(PALETTE_X+PALETTE_W+DIV_W,MAIN_Y,CANVAS_W,DIAG_TOOL_H,'DT/Bg',P.panel,1,P.border,1));
  [['▷ Select',0,true],['⌒ Connect',68,false],['✋ Pan',138,false]].forEach(([l,dx,a])=>{
    ch.push(r(CANVAS_X+4+dx,MAIN_Y+5,62,24,`DT/T${dx}`,a?P.selBg:P.inputBg,1,a?P.primary:P.border,1));
    ch.push(t(CANVAS_X+4+dx,MAIN_Y+10,62,14,`DT/TT${dx}`,l,10,a?600:400,a?P.primary:P.muted,'center'));
  });
  ch.push(r(CANVAS_X+206,MAIN_Y+8,1,18,'DT/Sep1',P.border));
  ch.push(r(CANVAS_X+214,MAIN_Y+5,72,24,'DT/ImpBtn',P.inputBg,1,P.border,1));
  ch.push(t(CANVAS_X+214,MAIN_Y+10,72,14,'DT/ImpBtnT','⤓ Import',10,400,P.muted,'center'));
  ch.push(r(CANVAS_X+294,MAIN_Y+5,76,24,'DT/AutoBtn',P.inputBg,1,P.border,1));
  ch.push(t(CANVAS_X+294,MAIN_Y+10,76,14,'DT/AutoBtnT','⚙ Auto-layout',10,400,P.muted,'center'));
  ch.push(r(CANVAS_X+378,MAIN_Y+8,1,18,'DT/Sep2',P.border));
  ch.push(r(CANVAS_X+386,MAIN_Y+5,68,24,'DT/ZBg',P.inputBg,1,P.border,1));
  ch.push(t(CANVAS_X+388,MAIN_Y+10,12,14,'DT/ZMin','−',11,400,P.muted,'center'));
  ch.push(t(CANVAS_X+402,MAIN_Y+10,36,14,'DT/ZVal','80%',11,500,P.text,'center'));
  ch.push(t(CANVAS_X+440,MAIN_Y+10,12,14,'DT/ZPls','+',11,400,P.muted,'center'));

  // ── CANVAS ──
  cR(0,0,CANVAS_W,CANVAS_H,'CV/Bg',P.canvas);
  const GA=m==='Dark'?0.45:0.25;
  for(let gx=0;gx<=CANVAS_W;gx+=20) cR(gx,0,1,CANVAS_H,`CV/GV${gx}`,P.grid,GA);
  for(let gy=0;gy<=CANVAS_H;gy+=20) cR(0,gy,CANVAS_W,1,`CV/GH${gy}`,P.grid,GA);

  // ── Data Lineage Node helper ──
  const node=(cx,cy,w,h,key,ntype,typeLabel,name,sel)=>{
    const nc=NC[ntype]||{col:P.muted,bg:P.panelAlt,icon:'??'};
    const HDR=20;
    if(sel){cR(cx-3,cy-3,w+6,h+6,`${key}/Sel`,P.selBg,1,P.primary,2);}
    cR(cx,cy,w,h,`${key}/Bg`,P.panel,1,sel?P.primary:nc.col,sel?2:1.5);
    cR(cx,cy,w,HDR,`${key}/HBg`,nc.col,0.14);
    cR(cx+4,cy+4,14,12,`${key}/IBg`,nc.col);
    cT(cx+4,cy+5,14,10,`${key}/IT`,nc.icon,7,700,'#FFFFFF','center');
    cT(cx+20,cy+4,w-24,12,`${key}/TL`,typeLabel,8,400,nc.col,'left');
    cT(cx+4,cy+HDR+5,w-8,h-HDR-8,`${key}/Name`,name,10,600,P.text,'center');
    if(sel){
      [[0,0],[w-6,0],[0,h-6],[w-6,h-6]].forEach(([hx,hy],i)=>
        cR(cx+hx,cy+hy,6,6,`${key}/H${i}`,P.panel,1,P.primary,1.5));
    }
  };

  // Flow line helpers
  const hF=(x,y,w,k)=>{cR(x,y,w,2,`${k}/L`,'#64748B',0.5);cT(x+w-7,y-5,10,10,`${k}/A`,'►',8,700,'#64748B','center');};
  const vF=(x,y,h,k)=>{cR(x,y,2,h,`${k}/L`,'#64748B',0.5);cT(x-5,y+h-4,10,10,`${k}/A`,'▼',8,700,'#64748B','center');};
  const fLbl=(cx,cy,w,k,txt)=>cT(cx,cy,w,11,k,txt,8,500,'#64748B','center');

  // ── Canvas content: OEA Analytics Pipeline ──
  // Sources (left, canvas-local)
  node(10,  40, 130, 56,'N_DB',  'source','Database / Table','PostgreSQL-Prod',false);
  node(10, 140, 130, 56,'N_API', 'apiin', 'API Endpoint',    'Catalog-REST-API',false);
  node(10, 240, 130, 56,'N_EVT', 'apiin', 'API Endpoint',    'ITSM-Webhook',  false);

  // Transforms (center)
  node(200, 60,  136, 56,'N_ETL', 'etl',   'ETL Job',         'ETL-Sync-Service',true); // selected
  node(200, 170, 136, 56,'N_KAF', 'stream','Stream Processor', 'Kafka-Processor',false);

  // Targets (right)
  node(400, 90,  118, 56,'N_DW',  'dw',    'Data Warehouse',   'OEA-Data-Warehouse',false);
  node(400, 210, 118, 56,'N_RPT', 'mart',  'Data Mart',        'Reporting-Mart',false);

  // Flows
  hF(140,68,60,'F1'); fLbl(150,57,40,'F1L','reads');
  hF(140,168,60,'F2'); fLbl(150,157,40,'F2L','events');
  hF(140,268,60,'F3'); cT(160,257,60,11,'F3L','triggers →',8,400,'#64748B','left');

  // ETL → DW
  hF(336,118,64,'F4'); fLbl(348,107,40,'F4L','loads');
  // Kafka → DW
  cR(264,198,2,60,'F5/V','#64748B',0.5);
  cR(264,198,136,2,'F5/H','#64748B',0.5);
  cT(395,191,12,10,'F5/A','►',8,700,'#64748B','center');
  fLbl(308,187,60,'F5L','streams');
  // DW → Reporting
  vF(459,146,64,'F6'); fLbl(468,167,60,'F6L','feeds');

  // Column labels
  cT(40,8,100,12,'CL1','Sources',10,600,P.muted,'center');
  cT(218,8,120,12,'CL2','Transforms',10,600,P.muted,'center');
  cT(420,8,100,12,'CL3','Targets',10,600,P.muted,'center');
  // Column separator lines
  cR(188,0,1,CANVAS_H,'CL_S1',P.border,0.4);
  cR(390,0,1,CANVAS_H,'CL_S2',P.border,0.4);

  // Data volume annotations
  cR(120,85,64,14,'ANN1',P.panelAlt,1,P.border,1);
  cT(122,87,60,10,'ANN1T','~50k rows/run',8,400,P.muted,'left');
  cR(120,185,64,14,'ANN2',P.panelAlt,1,P.border,1);
  cT(122,187,60,10,'ANN2T','~1.2k events/s',8,400,P.muted,'left');

  // ── RIGHT PANEL — Properties (ETL-Sync-Service selected) ──
  const pw=RIGHT_W-16,pxb=RIGHT_X+8;
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,28,'RP/TabBg',P.secBg,1,P.border,1));
  ch.push(r(RIGHT_X,MAIN_Y,100,28,'RP/TabA',P.panel,1,P.border,1));
  ch.push(t(RIGHT_X,MAIN_Y+6,100,16,'RP/TabAT','Properties',12,600,P.primary,'center'));
  ch.push(t(RIGHT_X+100,MAIN_Y+6,80,16,'RP/TabBT','Lineage',12,400,P.muted,'center'));
  let rpy=MAIN_Y+36;
  const rSec=(k,l)=>{ch.push(r(RIGHT_X,rpy,RIGHT_W,20,`RP/${k}S`,P.secBg));ch.push(t(pxb,rpy+3,pw,12,`RP/${k}SL`,l,10,600,P.muted,'left'));rpy+=20;};
  const rFld=(k,l,v,hl)=>{
    ch.push(t(pxb,rpy+1,pw,11,`RP/${k}FL`,l,9,500,P.muted,'left'));rpy+=12;
    ch.push(r(pxb,rpy,pw,22,`RP/${k}FF`,P.inputBg,1,hl?P.primary:P.border,hl?1.5:1));
    ch.push(t(pxb+4,rpy+4,pw-8,13,`RP/${k}FV`,v,11,400,P.text,'left'));rpy+=26;
  };
  rSec('Gen','General');
  ch.push(t(pxb,rpy+2,40,11,'RP/IdL','ID:',9,500,P.muted,'left'));
  ch.push(t(pxb+44,rpy+2,pw-44,11,'RP/IdV','#LIN-ETL-001',10,400,P.primary,'left'));rpy+=18;
  rFld('Name','Name','ETL-Sync-Service',true);
  rFld('Type','Node Type','ETL Job',false);
  rFld('Src','Source','PostgreSQL-Prod → 3 tables',false);
  rFld('Tgt','Target','OEA-Data-Warehouse',false);
  rSec('Run','Execution');
  rFld('Sched','Schedule','Every 15 min  (cron: */15 * * * *)',false);
  rFld('Last','Last Run','2026-06-29 06:00  ·  ✓ OK',false);
  rFld('Rows','Rows Processed','49,284  (last run)',false);
  rSec('Meta','Lineage Metadata');
  rFld('Owner','Owner Team','Data Engineering',false);
  rFld('SLA','SLA','< 30 min lag',false);

  // ── BOTTOM ──
  ch.push(r(0,BOTTOM_Y,FW,BOTTOM_H,'Bot/Bg',P.panel,1,P.border,1));
  ch.push(r(0,BOTTOM_Y,FW,28,'Bot/TabBg',P.secBg,1,P.border,1));
  ch.push(r(0,BOTTOM_Y,96,28,'Bot/TabA',P.panel,1,P.border,1));
  ch.push(t(0,BOTTOM_Y+6,96,16,'Bot/TabAT','Lineage Log',12,600,P.primary,'center'));
  ch.push(t(8,BOTTOM_Y+38,FW-16,14,'Bot/OK','✓  6 nodes  ·  6 flows  ·  0 cycles detected  ·  Last run: 2026-06-29 06:00',11,400,'#059669','left'));
  ['[INFO]   Pipeline «OEA Analytics Pipeline» loaded  ·  UC-08',
   '[INFO]   ETL-Sync-Service: 49,284 rows loaded to OEA-Data-Warehouse in 4m12s',
   '[INFO]   Kafka-Processor: 1.2k events/s  ·  lag < 500ms',
  ].forEach((l,i)=>ch.push(t(8,BOTTOM_Y+58+i*18,FW-16,12,`Bot/L${i}`,l,10,400,P.muted,'left')));
  // ── STATUS ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,480,12,'St/L','Data Lineage  ·  OEA Analytics Pipeline  ·  6 nodes  ·  6 flows',10,400,P.statusText,'left'));
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
      for(const f of files.filter(f=>f.name&&f.name.includes('Data Lineage')))await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Data Lineage v0.1',project_id:PID});
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
    generateLocalSVG(changes[0],changes.slice(1),path.join(outDir,`data-lineage-${m.toLowerCase()}.svg`));
    console.log(`  data-lineage-${m.toLowerCase()}.svg`);
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
