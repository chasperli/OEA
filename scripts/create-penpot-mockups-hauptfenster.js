#!/usr/bin/env node
/**
 * OEA Hauptfenster Wireframes v0.2 — Native Client
 * Explorer: Solution-zentrisch (REQ-138/139/140/141/142, ADR-020/021)
 * Jeder Screen = eigenstaendiger Penpot-Frame -> SVG in docs/screens/
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/create-penpot-mockups-hauptfenster.js
 */
const { createFrame, canvasText, uploadAndExport } = require('./penpot-shared');

const FW=1280, FH=800, GAP=100;
const sy = row => row*(FH+GAP);

// ── Layout ────────────────────────────────────────────────────────────────────
const MENU_H=28, TOOL_H=36, MAIN_Y=64, MAIN_H=520;
const LEFT_W=260, DIV_W=4, CENTER_W=716, RIGHT_W=296;
const CENTER_X=LEFT_W+DIV_W;
const RIGHT_X=CENTER_X+CENTER_W+DIV_W;
const BOTTOM_Y=MAIN_Y+MAIN_H;
const BOTTOM_H=192, STATUS_Y=776, STATUS_H=24;

// ── Palettes ──────────────────────────────────────────────────────────────────
const L = {
  bg:'#F1F5F9', panel:'#FFFFFF', panelAlt:'#F8FAFC',
  menuBg:'#1E293B', menuText:'#E2E8F0',
  primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC',
  selBg:'#E0F2FE', secBg:'#F1F5F9', statusText:'#94A3B8',
};
const D = {
  bg:'#0F172A', panel:'#1E293B', panelAlt:'#172030',
  menuBg:'#020617', menuText:'#CBD5E1',
  primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0B1829',
  selBg:'#0C4A6E', secBg:'#162030', statusText:'#64748B',
};

// ArchiMate type badge colors
const C = { AC:'#2563EB', AS:'#0284C7', BP:'#D97706', BR:'#B45309', FBB:'#7C3AED', SBB:'#059669', KAT:'#DC2626', DIA:'#0891B2' };

// ── Screen builder ────────────────────────────────────────────────────────────
function screen(pid, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, 0, sy(row), FW, FH, `${m}/Hauptfenster`);
  const ch = [change];

  // ── MENU BAR ──
  ch.push(r(0,0,FW,MENU_H,'MenuBg',P.menuBg));
  [['Datei',8],['Bearbeiten',54],['Ansicht',126],['Modell',190],['Werkzeuge',246],['Hilfe',322]].forEach(([l,x]) =>
    ch.push(t(x,6,66,16,`M/${l}`,l,12,400,P.menuText,'left')));
  ch.push(t(FW-112,6,104,16,'MV','OEA 0.1.0-SNAPSHOT',11,400,P.statusText,'right'));

  // ── TOOLBAR ──
  ch.push(r(0,MENU_H,FW,TOOL_H,'TBg',P.panel,1,P.border,1));
  const iy=MENU_H+8;
  [[8,'N'],[30,'Oe'],[52,'Sp']].forEach(([x,n])=>ch.push(r(x,iy,20,20,`Ti/${n}`,P.border)));
  ch.push(r(78,iy,1,20,'TS0',P.border));
  [[84,'Ax'],[106,'Ko'],[128,'Ei']].forEach(([x,n])=>ch.push(r(x,iy,20,20,`Ti/${n}`,P.border)));
  ch.push(r(154,iy,1,20,'TS1',P.border));
  [[160,'Ru'],[182,'Wh']].forEach(([x,n])=>ch.push(r(x,iy,20,20,`Ti/${n}`,P.border)));
  ch.push(r(208,iy,1,20,'TS2',P.border));
  ch.push(r(214,iy,20,20,'TiVa',P.border));
  ch.push(t(FW-208,MENU_H+11,62,14,'PlLbl','Plateau:',12,500,P.muted,'right'));
  ch.push(r(FW-140,MENU_H+6,132,24,'PlDd',P.inputBg,1,P.border,1));
  ch.push(t(FW-135,MENU_H+12,98,14,'PlVal','IST (aktuell)',12,500,P.text,'left'));
  ch.push(t(FW-24,MENU_H+12,16,14,'PlArr','▾',11,400,P.muted,'center'));

  // ── PANEL DIVIDERS ──
  ch.push(r(LEFT_W,MAIN_Y,DIV_W,MAIN_H,'DivLC',P.border));
  ch.push(r(RIGHT_X-DIV_W,MAIN_Y,DIV_W,MAIN_H,'DivCR',P.border));

  // ── LEFT PANEL — Browser (Solution-zentrisch, REQ-138) ──
  ch.push(r(0,MAIN_Y,LEFT_W,MAIN_H,'LP/Bg',P.panel));
  ch.push(r(0,MAIN_Y,LEFT_W,28,'LP/TBg',P.secBg,1,P.border,1));
  ch.push(r(0,MAIN_Y,84,28,'LP/TA',P.panel,1,P.border,1));
  ch.push(t(0,MAIN_Y+6,84,16,'LP/TAT','Browser',12,600,P.primary,'center'));
  ch.push(t(84,MAIN_Y+6,92,16,'LP/TBT','Diagramme',12,400,P.muted,'center'));

  // Suchfeld
  ch.push(r(8,MAIN_Y+36,LEFT_W-16,26,'LP/Srch',P.inputBg,1,P.border,1));
  ch.push(t(14,MAIN_Y+42,LEFT_W-28,14,'LP/SrchT','Suchen ...',12,400,P.muted,'left'));

  // Solution-Tree: REQ-138/139/140/141/142
  // cat=true -> category/solution header; indent = nesting level
  // abbr = type badge text; sel = selected state
  const tree = [
    { cat:true,  indent:0, label:'Aktueller Stand  (IST)',     color:P.primary,  open:true,  special:true  },
      // REQ-139: 6 Grundkategorien auto-generiert pro Solution
      { cat:false, indent:1, abbr:'AC', label:'Komponenten  (14)',  color:C.AC  },
      { cat:false, indent:1, abbr:'→',  label:'Verbindungen  (38)', color:C.AS  },
      { cat:false, indent:1, abbr:'KT', label:'Kataloge  (5)',      color:C.KAT },
      { cat:false, indent:1, abbr:'FB', label:'Functional BBs  (9)',color:C.FBB },
      { cat:false, indent:1, abbr:'SB', label:'Solution BBs  (12)',color:C.SBB  },
      { cat:false, indent:1, abbr:'DI', label:'Diagramme  (6)',     color:C.DIA },
    // Plateau-gebundene Solution
    { cat:true,  indent:0, label:'Cloud-Migration 2027',        color:'#7C3AED', open:true               },
      { cat:true,  indent:1, label:'IST -> SOLL',               color:'#6D28D9', open:true               },
        // REQ-139: Grundstruktur auch innerhalb der Solution
        { cat:false, indent:2, abbr:'AC', label:'Komponenten  (6)',  color:C.AC                          },
          // REQ-141: hierarchische Verschachtelung; REQ-142: implizite Composition
          { cat:false, indent:3, abbr:'AC', label:'Katalog-Service', color:C.AC,  sel:true               },
          { cat:false, indent:3, abbr:'AC', label:'Portal-Frontend', color:C.AC                          },
        { cat:false, indent:2, abbr:'→',  label:'Verbindungen  (8)', color:C.AS                          },
        { cat:false, indent:2, abbr:'KT', label:'Kataloge  (2)',      color:C.KAT                        },
        { cat:false, indent:2, abbr:'FB', label:'Functional BBs  (3)',color:C.FBB                        },
        { cat:false, indent:2, abbr:'SB', label:'Solution BBs  (4)', color:C.SBB                         },
        { cat:false, indent:2, abbr:'DI', label:'Diagramme  (2)',     color:C.DIA                        },
    // REQ-140: Projekt-Modus Solution (kein Plateau) — nur im Aktueller Stand sichtbar
    { cat:true,  indent:0, label:'ERP-Einfuehrung  (Projekt-Modus)', color:'#94A3B8', open:false, dim:true },
  ];

  let ty=MAIN_Y+70;
  tree.forEach((item,i)=>{
    const n=`LP/T${i}`;
    const ix=item.indent*14;
    const rowH=item.cat?22:20;
    if(item.cat){
      if(item.indent===0) ch.push(r(0,ty,LEFT_W,rowH,`${n}/Bg`,P.secBg));
      ch.push(t(4+ix,ty+3,12,14,`${n}/Arr`,item.open?'▼':'▶',9,700,item.dim?P.muted:P.muted,'center'));
      ch.push(r(16+ix,ty+7,8,8,`${n}/Dot`,item.color));
      const lc=item.special?P.primary:item.dim?P.muted:P.text;
      ch.push(t(28+ix,ty+3,LEFT_W-36-ix,14,`${n}/Lbl`,item.label,11,600,lc,'left'));
      ty+=rowH;
    } else {
      if(item.sel) ch.push(r(0,ty,LEFT_W,rowH,`${n}/Sel`,P.selBg));
      ch.push(r(16+ix,ty+3,14,12,`${n}/IBg`,item.color));
      ch.push(t(16+ix,ty+4,14,10,`${n}/IT`,item.abbr,7,700,'#FFFFFF','center'));
      const lc=item.sel?P.primary:P.text;
      ch.push(t(34+ix,ty+2,LEFT_W-42-ix,14,`${n}/Lbl`,item.label,11,item.sel?600:400,lc,'left'));
      ty+=rowH;
    }
  });

  // ADR-021: Hinweis am unteren Rand des Panels
  ch.push(r(0,MAIN_Y+MAIN_H-28,LEFT_W,28,'LP/HintBg',P.secBg,1,P.border,1));
  ch.push(t(6,MAIN_Y+MAIN_H-22,LEFT_W-12,16,'LP/HintT','[Ordner] = Strukturhilfe, keine implizite Verbindung',9,400,P.muted,'left'));

  // ── CENTER PANEL — Arbeitsfenster (initial leer) ──
  ch.push(r(CENTER_X,MAIN_Y,CENTER_W,MAIN_H,'CP/Bg',P.panelAlt));
  ch.push(r(CENTER_X,MAIN_Y,CENTER_W,28,'CP/TBg',P.secBg,1,P.border,1));
  ch.push(t(CENTER_X+10,MAIN_Y+6,340,16,'CP/TH','Arbeitsfenster  —  kein Objekt geoffnet',12,400,P.muted,'left'));
  ch.push(r(CENTER_X+CENTER_W-76,MAIN_Y+4,68,20,'CP/NBtn',P.primary));
  ch.push(t(CENTER_X+CENTER_W-76,MAIN_Y+8,68,12,'CP/NBtnT','+ Neu',12,600,'#FFFFFF','center'));
  const emX=CENTER_X+CENTER_W/2, emY=MAIN_Y+MAIN_H/2;
  ch.push(r(emX-36,emY-52,72,56,'CP/EIcon',P.border));
  ch.push(t(CENTER_X,emY+12,CENTER_W,22,'CP/ET1','Kein Objekt geoffnet',16,600,P.muted,'center'));
  ch.push(t(CENTER_X,emY+36,CENTER_W,16,'CP/ET2','Doppelklick im Browser oder + Neu',12,400,P.muted,'center'));

  // ── RIGHT PANEL — Eigenschaften ──
  const pw=RIGHT_W-16, pxb=RIGHT_X+8;
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,MAIN_H,'RP/Bg',P.panel));
  ch.push(r(RIGHT_X,MAIN_Y,RIGHT_W,28,'RP/TBg',P.secBg,1,P.border,1));
  ch.push(r(RIGHT_X,MAIN_Y,112,28,'RP/TA',P.panel,1,P.border,1));
  ch.push(t(RIGHT_X,MAIN_Y+6,112,16,'RP/TAT','Eigenschaften',12,600,P.primary,'center'));
  ch.push(t(RIGHT_X+112,MAIN_Y+6,100,16,'RP/TBT','Beziehungen',12,400,P.muted,'center'));

  let py=MAIN_Y+36;
  const sec=(k,l)=>{
    ch.push(r(RIGHT_X,py,RIGHT_W,20,`RP/${k}Bg`,P.secBg));
    ch.push(t(pxb,py+3,pw,13,`RP/${k}Lbl`,l,10,600,P.muted,'left'));
    py+=20;
  };
  // compact field: 9px label + 22px input = 38px total
  const cfld=(k,l,v)=>{
    ch.push(t(pxb,py+1,pw,11,`RP/${k}L`,l,9,500,P.muted,'left')); py+=12;
    ch.push(r(pxb,py,pw,22,`RP/${k}F`,P.inputBg,1,P.border,1));
    ch.push(t(pxb+4,py+4,pw-8,13,`RP/${k}V`,v,11,400,P.text,'left')); py+=26;
  };

  // ── Allgemein — General-Kategorie aus entity.md (systemdefiniert, gesperrt) ──
  sec('SA','Allgemein');
  // id — systemvergeben, nicht editierbar
  ch.push(t(pxb,py+2,20,11,'RP/IDL','ID',9,600,P.muted,'left'));
  ch.push(t(pxb+24,py+2,pw-60,11,'RP/IDV','#2847',10,400,P.muted,'left'));
  ch.push(t(pxb+pw-32,py+2,32,10,'RP/IDRo','(System)',8,400,P.muted,'right'));
  py+=18;
  // name — editierbar
  cfld('Name','Name','Katalog-Service');
  // entityTypeId — Typ mit ArchiMate-Badge, nicht editierbar nach Anlage
  ch.push(t(pxb,py+1,pw,11,'RP/TypL','Typ',9,500,P.muted,'left')); py+=12;
  ch.push(r(pxb,py,pw,22,'RP/TypF',P.inputBg,1,P.border,1));
  ch.push(r(pxb+4,py+5,16,12,'RP/TIBg',C.AC));
  ch.push(t(pxb+4,py+6,16,10,'RP/TIT','AC',7,700,'#FFFFFF','center'));
  ch.push(t(pxb+23,py+4,pw-30,13,'RP/TypV','Application Component',11,400,P.text,'left')); py+=26;
  // isLogical — boolean toggle, editierbar
  ch.push(r(pxb,py+2,16,16,'RP/LogBox',P.primary,1,P.primary,1));
  ch.push(t(pxb+1,py+3,14,12,'RP/LogChk','✓',9,700,'#FFFFFF','center'));
  ch.push(t(pxb+22,py+3,pw-22,12,'RP/LogLbl','Logisch  (logisch / konzeptionell)',10,400,P.text,'left'));
  py+=22;
  // parentEntityId — optionaler FK auf ArchitectureEntity (REQ-141, ADR-021)
  cfld('Par','Elternelement','—');

  py+=4;
  // ── Beschreibung — description aus General, eigene Sektion wegen DocCollection ──
  sec('SB','Beschreibung');
  ch.push(r(pxb,py,pw,50,'RP/DescF',P.inputBg,1,P.border,1));
  ch.push(t(pxb+4,py+4,pw-8,44,'RP/DescV','Zentrale Anwendungskomponente des OEA-Katalogs.',11,400,P.muted,'left'));
  py+=54;
  // DocumentationCollection — oeffnen im Arbeitsfenster
  ch.push(r(pxb,py,pw,22,'RP/DB1',P.inputBg,1,P.primary,1));
  ch.push(t(pxb+4,py+4,pw-8,13,'RP/DB1T','Betriebshandbuch  -> Arbeitsfenster',10,400,P.primary,'left'));
  py+=26;
  ch.push(r(pxb,py,pw,22,'RP/DB2',P.inputBg,1,P.primary,1));
  ch.push(t(pxb+4,py+4,pw-8,13,'RP/DB2T','Architekturdokumentation  -> Arbeitsfenster',10,400,P.primary,'left'));
  py+=28;

  // ── Klassifizierung — Custom-Properties aus EntityTypeDefinition ──
  sec('SC','Klassifizierung');
  cfld('Sch','Schicht','Anwendungsschicht');
  cfld('Sol','Solution','Cloud-Migration 2027');
  // Plateau — Dropdown
  ch.push(t(pxb,py+1,pw,11,'RP/PlL','Plateau',9,500,P.muted,'left')); py+=12;
  ch.push(r(pxb,py,pw,22,'RP/PlF',P.inputBg,1,P.border,1));
  ch.push(t(pxb+4,py+4,pw-16,13,'RP/PlV','IST (aktuell)',11,400,P.text,'left'));
  ch.push(t(pxb+pw-12,py+4,10,13,'RP/PlArr','▾',9,400,P.muted,'center')); py+=26;
  cfld('Asp','Aspekt','Passive Structure');

  // ── BOTTOM PANEL — Letzte Aenderungen (Default-Tab) ──
  ch.push(r(0,BOTTOM_Y,FW,BOTTOM_H,'Bot/Bg',P.panel,1,P.border,1));
  ch.push(r(0,BOTTOM_Y,FW,28,'Bot/TBg',P.secBg,1,P.border,1));
  ch.push(t(8,BOTTOM_Y+6,44,16,'Bot/TLog','Log',12,400,P.muted,'left'));
  ch.push(r(44,BOTTOM_Y,152,28,'Bot/TA',P.panel,1,P.border,1));
  ch.push(t(44,BOTTOM_Y+6,152,16,'Bot/TAT','Letzte Aenderungen',12,600,P.primary,'center'));
  ch.push(t(204,BOTTOM_Y+6,80,16,'Bot/TVal','Validation',12,400,P.muted,'left'));

  const hY=BOTTOM_Y+36;
  ch.push(r(0,hY,FW,20,'Bot/HBg',P.secBg));
  [[8,'Zeit',118],[134,'Objekt / Typ',240],[382,'Aenderung',540],[930,'Solution',180],[1118,'Benutzer',100]].forEach(([x,l,w])=>
    ch.push(t(x,hY+3,w,14,`Bot/H/${l}`,l,11,600,P.muted,'left')));

  const rows=[
    {z:'Heute 14:32', o:'Katalog-Service [AC]', a:"Attribut 'version' geaendert",   s:'Cloud-Migration', u:'Lukas'},
    {z:'Heute 11:15', o:'Portal-Frontend [AC]', a:'Komposition unter Katalog-Service',s:'Cloud-Migration', u:'Lukas'},
    {z:'Heute 09:04', o:'Katalog-API [AS]',     a:'Beschreibung aktualisiert',        s:'Aktueller Stand', u:'Lukas'},
    {z:'Gestern',     o:'Auth-Service [AS]',     a:'Erstellt',                         s:'Cloud-Migration', u:'Lukas'},
    {z:'Gestern',     o:'ERP-Einfuehrung',       a:'Solution angelegt (Projekt-Modus)',s:'Aktueller Stand', u:'Lukas'},
  ];
  let bry=hY+20;
  rows.forEach((row,i)=>{
    if(i%2===0) ch.push(r(0,bry,FW,24,`Bot/RBg${i}`,P.panelAlt));
    ch.push(t(8,   bry+5,118,14,`Bot/Rz${i}`,row.z,11,400,P.muted,'left'));
    ch.push(t(134, bry+5,240,14,`Bot/Ro${i}`,row.o,12,500,P.primary,'left'));
    ch.push(t(382, bry+5,540,14,`Bot/Ra${i}`,row.a,11,400,P.text,'left'));
    ch.push(t(930, bry+5,180,14,`Bot/Rs${i}`,row.s,11,400,P.muted,'left'));
    ch.push(t(1118,bry+5,100,14,`Bot/Ru${i}`,row.u,11,400,P.muted,'left'));
    bry+=24;
  });

  // ── STATUS BAR ──
  ch.push(r(0,STATUS_Y,FW,STATUS_H,'St/Bg',P.menuBg));
  ch.push(t(8,STATUS_Y+5,120,14,'St/L','Bereit',12,400,P.statusText,'left'));
  ch.push(t(FW/2-80,STATUS_Y+5,160,14,'St/C','21 Objekte  |  4 Diagramme  |  2 Solutions',12,400,P.statusText,'center'));
  ch.push(t(FW-168,STATUS_Y+5,160,14,'St/R','IST-Plateau  |  Lukas',12,400,P.statusText,'right'));

  return { frameId, changes: ch };
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  const pid='PAGE';
  const modes=[{row:0,P:L,m:'Light'},{row:1,P:D,m:'Dark'}];
  const allChanges=[], frames=[];

  for(const {row,m} of modes)
    allChanges.push(canvasText(pid,-180,sy(row)+FH/2-10,170,20,`Lbl${m}`,`${m} Mode`,13,600,'#64748B','right'));

  for(const {row,P,m} of modes){
    const {frameId,changes}=screen(pid,row,P,m);
    allChanges.push(...changes);
    allChanges.push(canvasText(pid,0,sy(row)+FH+12,FW,16,`Ann${m}`,`${m} / Hauptfenster — Solution-Browser (REQ-138/139/140/141/142 | ADR-020/021)`,11,400,'#94A3B8','center'));
    frames.push({id:frameId,svgName:`hauptfenster-${m.toLowerCase()}`,children:changes.slice(1)});
  }

  await uploadAndExport('OEA - Hauptfenster Wireframes v0.2',allChanges,frames);
}

main().catch(e=>{console.error('Fehler:',e.message);process.exit(1);});
