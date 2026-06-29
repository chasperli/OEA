#!/usr/bin/env node
/**
 * OEA Metamodell-Konfiguration (SCR-030) — UC-04: Metamodell konfigurieren
 * Layout: MetaType-List (260) | Properties-Editor (716) | Property-Detail (296)
 * Shows: MetaType «Application Component [AC]» selected, lifecycle property in edit
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW=1280,FH=800,GAP=100;
const sy=row=>row*(FH+GAP);
const MENU_H=28,TOOL_H=36,MAIN_Y=64,MAIN_H=712;
const LEFT_W=260,DIV_W=4,RIGHT_W=296;
const CTR_X=LEFT_W+DIV_W,CTR_W=FW-LEFT_W-DIV_W*2-RIGHT_W; // 716
const RIGHT_X=CTR_X+CTR_W+DIV_W;                            // 984
const STATUS_Y=776,STATUS_H=24;

const L={
  panel:'#FFFFFF',panelAlt:'#F8FAFC',menuBg:'#1E293B',menuText:'#E2E8F0',
  primary:'#0EA5E9',text:'#0F172A',muted:'#64748B',
  border:'#E2E8F0',inputBg:'#F8FAFC',selBg:'#E0F2FE',secBg:'#F1F5F9',
  statusText:'#94A3B8',overlay:'#FFFFFF',
  tabActive:'#FFFFFF',tabInact:'#F1F5F9',
  enumChip:'#EDE9FE',enumChipT:'#6D28D9',
  lock:'#94A3B8',warn:'#D97706',warnBg:'#FEF9C3',
};
const D={
  panel:'#1E293B',panelAlt:'#172030',menuBg:'#020617',menuText:'#CBD5E1',
  primary:'#38BDF8',text:'#F1F5F9',muted:'#94A3B8',
  border:'#334155',inputBg:'#0B1829',selBg:'#0C4A6E',secBg:'#162030',
  statusText:'#64748B',overlay:'#1E293B',
  tabActive:'#1E293B',tabInact:'#162030',
  enumChip:'#2E1065',enumChipT:'#A78BFA',
  lock:'#475569',warn:'#FBBF24',warnBg:'#431407',
};

// MetaTypes
const METATYPES=[
  {id:'AC', lbl:'Application Component', col:'#2563EB', props:8, rels:6, sel:true},
  {id:'TC', lbl:'Technology Component',  col:'#0891B2', props:7, rels:4},
  {id:'BO', lbl:'Business Object',       col:'#D97706', props:6, rels:3},
  {id:'ACT',lbl:'Actor',                 col:'#059669', props:5, rels:5},
  {id:'IF', lbl:'Interface',             col:'#7C3AED', props:6, rels:4},
  {id:'DO', lbl:'Data Object',           col:'#6D28D9', props:7, rels:3},
  {id:'CAP',lbl:'Capability',            col:'#DC2626', props:4, rels:2},
  {id:'BP', lbl:'Business Process',      col:'#0F172A', props:5, rels:3},
];

// Property rows for Application Component
const PROPS=[
  {k:'name',        type:'string',           req:true,  def:'',           vis:'always',   lock:true},
  {k:'version',     type:'string',           req:false, def:'',           vis:'default'},
  {k:'lifecycle',   type:'enum',             req:true,  def:'planned',    vis:'default',  sel:true},
  {k:'owner',       type:'string',           req:false, def:'',           vis:'default'},
  {k:'description', type:'text',             req:false, def:'',           vis:'collapsed'},
  {k:'status',      type:'rel → StatusType', req:false, def:'',           vis:'default'},
  {k:'environment', type:'enum',             req:false, def:'production', vis:'admin'},
  {k:'criticality', type:'enum',             req:false, def:'medium',     vis:'default'},
];

// Column widths for the properties table
const COL={drag:20,name:160,type:155,req:62,def:118,vis:106,act:79};
// sum = 20+160+155+62+118+106+79 = 700 (fits in 716px)

function screen(pid,row,P,m){
  const{frameId,change,r,t}=createFrame(pid,0,sy(row),FW,FH,`${m}/MetamodelConfig`);
  const ch=[change];

  // ── MENU ──
  ch.push(r(0,0,FW,MENU_H,'MBg',P.menuBg));
  [['File',8],['Edit',54],['View',100],['Metamodel',148],['Help',240]].forEach(([l,x])=>ch.push(t(x,6,62,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-120,6,112,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  ch.push(t(8,MENU_H+11,80,14,'TBC1','Metamodell',12,400,P.muted,'left'));
  ch.push(t(90,MENU_H+11,8,14,'TBC2','›',12,400,P.muted));
  ch.push(t(100,MENU_H+11,220,14,'TBC3','Application Component [AC]',12,600,P.text,'left'));
  // Buttons
  ch.push(r(FW-328,MENU_H+6,76,22,'TBImport',P.inputBg,1,P.border,1));
  ch.push(t(FW-328,MENU_H+10,76,14,'TBImportT','⤓ Import',10,400,P.muted,'center'));
  ch.push(r(FW-244,MENU_H+6,76,22,'TBExport',P.inputBg,1,P.border,1));
  ch.push(t(FW-244,MENU_H+10,76,14,'TBExportT','⤒ Export',10,400,P.muted,'center'));
  ch.push(r(FW-160,MENU_H+6,82,22,'TBValid',P.inputBg,1,P.border,1));
  ch.push(t(FW-160,MENU_H+10,82,14,'TBValidT','✓ Validate',10,400,P.muted,'center'));
  ch.push(r(FW-70,MENU_H+6,62,22,'TBSave',P.primary));
  ch.push(t(FW-70,MENU_H+10,62,14,'TBSaveT','Save',10,600,'#FFFFFF','center'));

  // ── DIVIDERS ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,MAIN_H,'DivLC',P.border));
  ch.push(r(RIGHT_X-DIV_W,MAIN_Y,DIV_W,MAIN_H,'DivCR',P.border));

  // ══════════════════════════════════════════════════════════════
  // LEFT: MetaType List
  // ══════════════════════════════════════════════════════════════
  ch.push(r(0,MAIN_Y,LEFT_W,MAIN_H,'LP/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LEFT_W,28,'LP/HBg',P.secBg,1,P.border,1));
  ch.push(t(8,MAIN_Y+7,LEFT_W-56,14,'LP/HT','MetaTypen  (8)',12,600,P.text,'left'));
  ch.push(r(LEFT_W-48,MAIN_Y+5,40,18,'LP/AddBtn',P.inputBg,1,P.primary,1));
  ch.push(t(LEFT_W-48,MAIN_Y+7,40,14,'LP/AddBtnT','+ Neu',9,600,P.primary,'center'));

  ch.push(r(8,MAIN_Y+36,LEFT_W-16,24,'LP/Srch',P.inputBg,1,P.border,1));
  ch.push(t(14,MAIN_Y+42,LEFT_W-28,12,'LP/SrchT','Suche...',11,400,P.muted,'left'));

  let ly=MAIN_Y+68;
  METATYPES.forEach((mt,i)=>{
    const bg=mt.sel?P.selBg:i%2===0?P.panel:P.panelAlt;
    ch.push(r(0,ly,LEFT_W,28,`MT/${mt.id}Bg`,bg,1,mt.sel?P.primary:P.border,mt.sel?0:0.3));
    // MetaType icon box
    ch.push(r(6,ly+6,22,16,`MT/${mt.id}Icon`,mt.col,mt.sel?1:0.15));
    ch.push(t(6,ly+7,22,12,`MT/${mt.id}IconT`,mt.id,8,700,mt.sel?'#FFFFFF':mt.col,'center'));
    // Label
    ch.push(t(32,ly+6,LEFT_W-76,14,`MT/${mt.id}Lbl`,mt.lbl,10,mt.sel?600:400,mt.sel?P.primary:P.text,'left'));
    // Badge
    ch.push(r(LEFT_W-38,ly+8,30,12,`MT/${mt.id}Badge`,P.secBg,1,P.border,1));
    ch.push(t(LEFT_W-38,ly+9,30,10,`MT/${mt.id}BadgeT`,`${mt.props}p`,8,500,P.muted,'center'));
    ly+=28;
  });

  // Inheritance hint
  ch.push(r(0,ly+4,LEFT_W,36,'LP/InhBg',P.warnBg||P.secBg,1,P.warn||P.border,0.5));
  ch.push(t(8,ly+8,LEFT_W-16,12,'LP/InhT1','⬆  Erbt von: Component (abstract)',9,500,P.warn||P.muted,'left'));
  ch.push(t(8,ly+20,LEFT_W-16,11,'LP/InhT2','Gemeinsame Properties: name, description',8,400,P.muted,'left'));

  // ══════════════════════════════════════════════════════════════
  // CENTER: Properties Editor
  // ══════════════════════════════════════════════════════════════
  ch.push(r(CTR_X,MAIN_Y,CTR_W,MAIN_H,'CTR/Bg',P.panel));

  // MetaType header
  ch.push(r(CTR_X,MAIN_Y,CTR_W,40,'CTR/MTH',P.secBg,1,P.border,1));
  ch.push(r(CTR_X+8,MAIN_Y+10,24,20,'CTR/MTIcon','#2563EB'));
  ch.push(t(CTR_X+8,MAIN_Y+11,24,16,'CTR/MTIconT','AC',9,700,'#FFFFFF','center'));
  ch.push(t(CTR_X+36,MAIN_Y+8,300,12,'CTR/MTName','Application Component',13,700,P.text,'left'));
  ch.push(t(CTR_X+36,MAIN_Y+22,300,12,'CTR/MTSub','ID: AC  ·  8 Properties  ·  6 Relation Types  ·  0 Validation Errors',9,400,P.muted,'left'));
  ch.push(r(CTR_X+CTR_W-68,MAIN_Y+10,60,20,'CTR/DelBtn','#FEE2E2',1,'#DC2626',1));
  ch.push(t(CTR_X+CTR_W-68,MAIN_Y+13,60,13,'CTR/DelBtnT','Delete type',8,500,'#DC2626','center'));

  // Tab bar
  const TABS=['Properties  (8)','Relations  (6)','Validation','Import / Export'];
  const TAB_Y=MAIN_Y+40;
  ch.push(r(CTR_X,TAB_Y,CTR_W,32,'CTR/TabBg',P.tabInact,1,P.border,1));
  let tx=CTR_X;
  TABS.forEach((tab,i)=>{
    const tw=i===0?140:i===1?116:i===2?90:120;
    const act=i===0;
    ch.push(r(tx,TAB_Y,tw,32,`CTR/Tab${i}`,act?P.tabActive:P.tabInact,1,act?P.primary:P.border,act?1.5:0.5));
    if(act) ch.push(r(tx,TAB_Y+30,tw,2,`CTR/TabU${i}`,P.primary));
    ch.push(t(tx,TAB_Y+8,tw,16,`CTR/TabT${i}`,tab,10,act?600:400,act?P.primary:P.muted,'center'));
    tx+=tw;
  });

  // Properties table
  const TBL_Y=TAB_Y+32;
  // Column header
  ch.push(r(CTR_X,TBL_Y,CTR_W,26,'CTR/TH',P.secBg,1,P.border,1));
  const cols=[
    {k:'drag',w:COL.drag,l:''},
    {k:'name',w:COL.name,l:'Property Name'},
    {k:'type',w:COL.type,l:'Data Type'},
    {k:'req', w:COL.req, l:'Required'},
    {k:'def', w:COL.def, l:'Default'},
    {k:'vis', w:COL.vis, l:'Visibility'},
    {k:'act', w:COL.act, l:''},
  ];
  let colX=CTR_X;
  cols.forEach(c=>{
    if(c.l) ch.push(t(colX+4,TBL_Y+7,c.w-8,12,`CTR/CH${c.k}`,c.l,9,600,P.muted,'left'));
    colX+=c.w;
  });

  // Property rows
  let pry=TBL_Y+26;
  const ROW_PH=30;
  PROPS.forEach((p,i)=>{
    const bg=p.sel?P.selBg:i%2===0?P.panel:P.panelAlt;
    ch.push(r(CTR_X,pry,CTR_W,ROW_PH,`PR/${p.k}Bg`,bg,1,p.sel?P.primary:P.border,p.sel?1:0.3));
    let cx=CTR_X;
    // Drag handle
    ch.push(t(cx+4,pry+9,COL.drag-4,12,`PR/${p.k}DH`,'⠿',9,400,P.muted,'center'));cx+=COL.drag;
    // Lock icon (inherited / core)
    const nameLabel=p.lock?`🔒 ${p.k}`:p.k;
    ch.push(t(cx+4,pry+9,COL.name-8,12,`PR/${p.k}N`,p.k,10,p.sel?600:p.lock?500:400,p.sel?P.primary:p.lock?P.lock:P.text,'left'));
    if(p.lock) ch.push(t(cx+4,pry+19,COL.name-8,9,`PR/${p.k}NL`,'inherited',8,400,P.muted,'left'));
    cx+=COL.name;
    // Type chip
    const typeCol=p.type.startsWith('rel')?'#7C3AED':p.type==='enum'?'#D97706':p.type==='text'?'#0891B2':'#059669';
    const typeBg=p.type.startsWith('rel')?P.enumChip:p.type==='enum'?'#FEF9C3':p.type==='text'?'#CFFAFE':'#DCFCE7';
    ch.push(r(cx+4,pry+8,COL.type-8,14,`PR/${p.k}TB`,typeBg,1,typeCol,0.6));
    ch.push(t(cx+7,pry+9,COL.type-12,10,`PR/${p.k}TT`,p.type,8,500,typeCol,'left'));
    cx+=COL.type;
    // Required checkbox
    if(p.req){ch.push(r(cx+22,pry+9,14,14,`PR/${p.k}RCB`,P.primary,1,P.primary,1));ch.push(t(cx+22,pry+10,14,12,`PR/${p.k}RCBT`,'✓',8,700,'#FFFFFF','center'));}
    else      {ch.push(r(cx+22,pry+9,14,14,`PR/${p.k}RCB`,P.inputBg,1,P.border,1));}
    cx+=COL.req;
    // Default value
    ch.push(t(cx+4,pry+9,COL.def-8,12,`PR/${p.k}DV`,p.def||'—',10,400,p.def?P.text:P.muted,'left'));
    cx+=COL.def;
    // Visibility badge
    const visBg=p.vis==='always'?P.selBg:p.vis==='admin'?'#FEF9C3':P.panelAlt;
    const visCol=p.vis==='always'?P.primary:p.vis==='admin'?'#D97706':P.muted;
    ch.push(r(cx+4,pry+9,COL.vis-8,14,`PR/${p.k}VB`,visBg,1,visCol,0.5));
    ch.push(t(cx+6,pry+10,COL.vis-12,10,`PR/${p.k}VT`,p.vis,8,500,visCol,'left'));
    cx+=COL.vis;
    // Action buttons
    ch.push(t(cx+6,pry+9,24,12,`PR/${p.k}Edit`,p.lock?'':p.sel?'✎':'✎',9,400,p.lock?P.border:P.muted,'center'));
    if(!p.lock)ch.push(t(cx+32,pry+9,24,12,`PR/${p.k}Del`,'✕',9,400,'#DC2626','center'));
    pry+=ROW_PH;
  });

  // Add property button
  ch.push(r(CTR_X,pry,CTR_W,32,'CTR/AddProp',P.panelAlt,1,P.border,0.5));
  ch.push(t(CTR_X+CTR_W/2-60,pry+9,120,14,'CTR/AddPropT','+ Property hinzufügen',11,500,P.primary,'center'));
  pry+=36;

  // Inheritance note
  ch.push(r(CTR_X+8,pry+4,CTR_W-16,28,'CTR/InhNote',P.warnBg||P.selBg,1,P.warn||P.border,1));
  ch.push(t(CTR_X+12,pry+8,CTR_W-24,11,'CTR/InhNoteT','ℹ  2 Properties (name, description) werden von «Component (abstract)» geerbt und hier schreibgeschützt angezeigt.',9,400,P.muted,'left'));

  // ══════════════════════════════════════════════════════════════
  // RIGHT: Property Detail Panel (lifecycle selected)
  // ══════════════════════════════════════════════════════════════
  const rp=RIGHT_X,rpw=RIGHT_W-16,rpxb=RIGHT_X+8;
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,28,'RP/HBg',P.secBg,1,P.border,1));
  ch.push(t(RIGHT_X+8,MAIN_Y+7,RIGHT_W-16,14,'RP/HT','Property bearbeiten',12,600,P.primary,'left'));

  let rpy=MAIN_Y+36;
  const rSec=(k,l)=>{ch.push(r(RIGHT_X,rpy,RIGHT_W,20,`RP/S${k}`,P.secBg));ch.push(t(rpxb,rpy+3,rpw,12,`RP/SL${k}`,l,10,600,P.muted,'left'));rpy+=20;};
  const rFld=(k,l,v,hl,sub)=>{
    ch.push(t(rpxb,rpy+1,rpw,11,`RP/${k}FL`,l,9,500,P.muted,'left'));rpy+=12;
    ch.push(r(rpxb,rpy,rpw,22,`RP/${k}FF`,P.inputBg,1,hl?P.primary:P.border,hl?1.5:1));
    ch.push(t(rpxb+4,rpy+4,rpw-8,13,`RP/${k}FV`,v,11,hl?600:400,hl?P.primary:P.text,'left'));
    rpy+=24;
    if(sub){ch.push(t(rpxb,rpy,rpw,10,`RP/${k}FS`,sub,8,400,P.muted,'left'));rpy+=12;}
  };
  const rToggle=(k,l,on,sub)=>{
    ch.push(t(rpxb,rpy+4,rpw-44,12,`RP/${k}TL`,l,10,400,P.text,'left'));
    ch.push(r(RIGHT_X+RIGHT_W-42,rpy+2,34,18,`RP/${k}TBg`,on?P.primary:P.border));
    ch.push(r(RIGHT_X+RIGHT_W-(on?12:26),rpy+4,14,14,`RP/${k}TDot`,'#FFFFFF'));
    rpy+=24;
    if(sub){ch.push(t(rpxb,rpy,rpw,10,`RP/${k}TS`,sub,8,400,P.muted,'left'));rpy+=12;}
  };

  rSec('Gen','Allgemein');
  rFld('ID','Property-Key','lifecycle',true,'Wird als JSON-Key und API-Feldname verwendet');
  rFld('Label','Anzeige-Label','Lifecycle',false);
  rFld('Type','Datentyp','enum',true);

  rSec('Enum','Enum-Werte');
  ch.push(t(rpxb,rpy+2,rpw,11,'RP/EnumSub','Erlaubte Werte (Reihenfolge per Drag):', 9,500,P.muted,'left'));rpy+=16;
  const enumVals=['planned','active','deprecated','retired'];
  enumVals.forEach((v,i)=>{
    ch.push(r(rpxb,rpy,rpw,22,`RP/EV${i}`,P.enumChip||P.selBg,1,P.border,0.5));
    ch.push(t(rpxb+4,rpy+4,10,13,`RP/EVH${i}`,'⠿',8,400,P.muted,'left'));
    ch.push(t(rpxb+16,rpy+5,rpw-40,11,`RP/EVL${i}`,v,10,400,P.enumChipT||P.primary,'left'));
    ch.push(t(rpxb+rpw-16,rpy+4,12,13,`RP/EVX${i}`,'✕',8,400,'#DC2626','center'));
    rpy+=26;
  });
  ch.push(r(rpxb,rpy,rpw,22,'RP/EVAdd',P.inputBg,1,P.border,1));
  ch.push(t(rpxb+4,rpy+5,rpw-8,11,'RP/EVAddT','+ Wert hinzufügen',9,400,P.muted,'left'));
  rpy+=28;

  rSec('Con','Constraints');
  rToggle('Req','Pflichtfeld',true,'Wert muss beim Speichern gesetzt sein');
  rFld('Def','Standardwert','planned',false,'Wird verwendet wenn kein Wert angegeben');
  rFld('Vis','Sichtbarkeit','default',false);

  rSec('I18n','Internationalisierung');
  ch.push(t(rpxb,rpy+2,rpw,11,'RP/I18nSub','Label-Übersetzungen:',9,500,P.muted,'left'));rpy+=16;
  [['de','Lebenszyklus'],['en','Lifecycle'],['fr','Cycle de vie']].forEach(([lang,val],i)=>{
    ch.push(r(rpxb,rpy,36,20,`RP/IL${i}Bg`,P.secBg,1,P.border,1));
    ch.push(t(rpxb+2,rpy+4,32,11,`RP/IL${i}T`,lang,9,600,P.muted,'center'));
    ch.push(r(rpxb+40,rpy,rpw-40,20,`RP/ILV${i}`,P.inputBg,1,P.border,1));
    ch.push(t(rpxb+44,rpy+4,rpw-50,11,`RP/ILVT${i}`,val,10,400,P.text,'left'));
    rpy+=24;
  });

  // ── STATUS ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+6,600,12,'St/L','Metamodell  ·  Application Component [AC]  ·  8 Properties  ·  6 Relation-Typen  ·  0 Konflikte',10,400,P.statusText,'left'));
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
      for(const f of files.filter(f=>f.name&&f.name.includes('Metamodell')))await rpc('delete-file',{id:f.id});
      const f=await rpc('create-file',{name:'OEA - Metamodell-Config v0.1',project_id:PID});
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
    generateLocalSVG(changes[0],changes.slice(1),path.join(outDir,`metamodel-config-${m.toLowerCase()}.svg`));
    console.log(`  metamodel-config-${m.toLowerCase()}.svg`);
  }
  console.log('done.');
}
main().catch(e=>{console.error(e.message);process.exit(1);});
