#!/usr/bin/env node
/**
 * OEA Startfenster Wireframes v0.4
 * Screens: Bootstrap | Login | 2FA | Passkey | Auto-SSO  x  Light | Dark
 * Jeder Screen = eigenstaendiger Penpot-Frame -> je ein SVG in docs/screens/
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/create-penpot-mockups-startfenster.js
 */
const { createFrame, canvasText, uploadAndExport } = require('./penpot-shared');

const FW=1280, FH=800, GAP=100;
const sx = col => col*(FW+GAP);
const sy = row => row*(FH+GAP);

const L = {
  bg:'#F0F9FF', card:'#FFFFFF', primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC', selBg:'#E0F2FE', selBorder:'#0EA5E9',
  infoBg:'#E0F2FE', infoBorder:'#7DD3FC', warnBg:'#FEF3C7', warnBorder:'#FCD34D',
  warnText:'#92400E', tabBg:'#F1F5F9', divider:'#E2E8F0', placeholderBg:'#F1F5F9',
};
const D = {
  bg:'#0F172A', card:'#1E293B', primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0F172A', selBg:'#0C4A6E', selBorder:'#38BDF8',
  infoBg:'#082F49', infoBorder:'#0369A1', warnBg:'#451A03', warnBorder:'#B45309',
  warnText:'#FCD34D', tabBg:'#1E293B', divider:'#334155', placeholderBg:'#1E293B',
};

function sBootstrap(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/S1-Bootstrap`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,44,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,96,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(400,136,480,4,'PrTrack',P.border));
  ch.push(r(400,136,160,4,'PrFill',P.primary));
  ch.push(r(400,152,480,548,'Card',P.card,1,P.border,1));
  ch.push(t(432,184,416,30,'Title','Instanz einrichten',22,700,P.text,'left'));
  ch.push(t(432,218,416,20,'Step','Schritt 1 von 3 — Admin-Zugang einrichten',12,400,P.muted,'left'));
  ch.push(r(400,246,480,1,'Div',P.border));
  ch.push(r(432,262,416,100,'OptLokal',P.selBg,1,P.selBorder,2));
  ch.push(r(452,284,16,16,'RadioOn',P.primary));
  ch.push(t(480,280,340,22,'LokalL','Lokal',15,600,P.primary,'left'));
  ch.push(t(480,304,350,36,'LokalD','Setup-Token erscheint beim ersten Start im Container-Log. Admin-Passwort manuell festlegen.',12,400,P.muted,'left'));
  ch.push(r(432,376,416,80,'OptOIDC',P.inputBg,1,P.border,1));
  ch.push(r(452,396,16,16,'RadioOff',P.border));
  ch.push(t(480,392,340,22,'OIDCL','Via OIDC',15,600,P.text,'left'));
  ch.push(t(480,416,350,20,'OIDCD','Externer Identity Provider via OIDC',12,400,P.muted,'left'));
  ch.push(r(432,472,416,60,'Info',P.infoBg,1,P.infoBorder,1));
  ch.push(r(448,487,20,20,'InfoCircle',P.primary));
  ch.push(t(448,488,20,18,'InfoI','i',13,700,P.card,'center'));
  ch.push(t(476,483,356,40,'InfoTxt','Setup-Token einmalig gueltig. Sichtbarkeit betreiberseitig konfigurierbar (REQ-136).',12,400,P.muted,'left'));
  ch.push(r(432,552,416,48,'Btn',P.primary));
  ch.push(t(432,564,416,24,'BtnT','Weiter  →',15,600,P.card,'center'));
  ch.push(t(432,618,416,20,'Link','Bereits konfiguriert?  →  Zum Login',13,400,P.primary,'center'));
  return { frameId, changes: ch };
}

function sLogin(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/S2-Login`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,72,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,124,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(400,168,480,500,'Card',P.card,1,P.border,1));
  ch.push(t(432,200,416,30,'Title','Anmelden',22,700,P.text,'left'));
  ch.push(r(432,244,416,52,'SSOBtn',P.primary));
  ch.push(t(432,258,416,24,'SSOTxt','Via Unternehmens-SSO anmelden  (OIDC)',14,600,P.card,'center'));
  ch.push(r(432,316,170,1,'DivL',P.divider));
  ch.push(t(610,306,40,20,'Oder','oder',13,400,P.muted,'center'));
  ch.push(r(650,316,170,1,'DivR',P.divider));
  ch.push(t(432,340,200,20,'EML','E-Mail-Adresse',13,500,P.text,'left'));
  ch.push(r(432,360,416,44,'EMI',P.inputBg,1,P.border,1));
  ch.push(t(448,372,380,20,'EMP','max.muster@example.com',14,400,P.border,'left'));
  ch.push(t(432,420,200,20,'PWL','Passwort',13,500,P.text,'left'));
  ch.push(r(432,440,416,44,'PWI',P.inputBg,1,P.border,1));
  ch.push(t(448,452,220,20,'PWP','........',16,400,P.muted,'left'));
  ch.push(t(700,452,148,20,'PWF','Passwort vergessen?',12,400,P.primary,'right'));
  ch.push(r(432,504,416,48,'LBtn',P.primary));
  ch.push(t(432,516,416,24,'LTxt','Anmelden',15,600,P.card,'center'));
  ch.push(t(432,568,416,24,'PKL','Passkey verwenden  (passwortlos)',13,400,P.primary,'center'));
  return { frameId, changes: ch };
}

function s2FA(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/S3-2FA`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,40,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,92,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(370,128,540,624,'Card',P.card,1,P.border,1));
  ch.push(t(402,160,476,30,'Title','Zweiten Faktor einrichten',22,700,P.text,'left'));
  ch.push(t(402,194,476,20,'Sub','Pflichtaktion — Zugang erst nach Abschluss moeglich',12,400,P.muted,'left'));
  ch.push(r(402,224,476,56,'Warn',P.warnBg,1,P.warnBorder,1));
  ch.push(t(420,234,440,36,'WarnT','!  Administrator hat 2FA aktiviert. Bitte richten Sie jetzt einen zweiten Faktor ein.',12,400,P.warnText,'left'));
  ch.push(r(402,294,476,40,'TabBar',P.tabBg,1,P.border,1));
  ch.push(r(402,294,238,40,'TabA',P.card,1,P.border,1));
  ch.push(t(402,304,238,20,'TabAT','TOTP  (Authenticator-App)',13,600,P.primary,'center'));
  ch.push(t(640,304,238,20,'TabBT','Passkey  (WebAuthn)',13,400,P.muted,'center'));
  ch.push(r(491,350,298,196,'QR',P.tabBg,1,P.border,1));
  ch.push(t(491,428,298,40,'QRT','QR-Code (otpauth://totp/...)',13,400,P.muted,'center'));
  ch.push(t(402,560,476,40,'Instr','1. Authenticator-App oeffnen  2. QR-Code scannen oder Code manuell eingeben',12,400,P.muted,'left'));
  ch.push(t(402,610,320,20,'CodeL','Bestaetigungscode  (6 Stellen)',13,500,P.text,'left'));
  for (let i=0;i<6;i++) {
    ch.push(r(402+i*76,636,64,56,`D${i}`,P.inputBg,1,P.border,2));
    ch.push(t(402+i*76,652,64,24,`D${i}T`,'–',20,400,P.muted,'center'));
  }
  ch.push(r(402,708,476,48,'CBtn',P.primary));
  ch.push(t(402,720,476,24,'CTxt','Bestaetigen',15,600,P.card,'center'));
  return { frameId, changes: ch };
}

function sPasskey(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/S4-Passkey`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,72,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,124,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(400,168,480,464,'Card',P.card,1,P.border,1));
  ch.push(t(432,200,416,30,'Title','Identitaet bestaetigen',22,700,P.text,'left'));
  ch.push(r(432,240,416,56,'Info',P.infoBg,1,P.infoBorder,1));
  ch.push(r(448,255,20,20,'InfoCircle',P.primary));
  ch.push(t(448,256,20,18,'InfoI','i',13,700,P.card,'center'));
  ch.push(t(476,251,356,36,'IT','Ihr Browser oder Betriebssystem oeffnet gleich einen Passkey-Dialog.',12,400,P.muted,'left'));
  ch.push(r(432,312,416,200,'BrBox',P.placeholderBg,1,P.border,1));
  ch.push(t(432,360,416,22,'BrT1','Browser / OS — nativer Passkey-Dialog',14,600,P.muted,'center'));
  ch.push(t(432,386,416,20,'BrT2','(systemgesteuert — kein OEA-UI)',13,400,P.muted,'center'));
  ch.push(t(432,528,416,24,'Wait','Warte auf Passkey-Bestaetigung  ...',14,400,P.muted,'center'));
  ch.push(r(432,564,416,1,'Div',P.divider));
  ch.push(t(432,576,416,20,'Back','Anderweitig anmelden  →',13,400,P.primary,'center'));
  return { frameId, changes: ch };
}

function sAutoSSO(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/S5-AutoSSO`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,72,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,124,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(430,220,420,300,'Card',P.card,1,P.border,1));
  ch.push(t(430,256,420,28,'Title','Automatische Anmeldung',20,700,P.text,'center'));
  ch.push(r(490,296,300,44,'Prov',P.placeholderBg,1,P.border,1));
  ch.push(t(490,308,300,20,'ProvT','[Konfigurierter Identity Provider]',13,500,P.muted,'center'));
  ch.push(t(430,356,420,24,'Redir','Weiterleitung zu Ihrem Identity Provider  ...',14,400,P.muted,'center'));
  ch.push(r(566,392,16,16,'D1',P.primary));
  ch.push(r(592,392,16,16,'D2',P.primary,0.6));
  ch.push(r(618,392,16,16,'D3',P.primary,0.3));
  ch.push(r(430,460,420,1,'Div',P.divider));
  ch.push(t(430,472,420,20,'Esc','Abbrechen / Anderweitig anmelden  (?noredirect=1)',12,400,P.primary,'center'));
  ch.push(r(430,560,420,56,'Info',P.infoBg,1,P.infoBorder,1));
  ch.push(r(446,575,20,20,'InfoCircle',P.primary));
  ch.push(t(446,576,20,18,'InfoI','i',13,700,P.card,'center'));
  ch.push(t(474,571,356,36,'IT','Auto-SSO aktiv: nur OIDC konfiguriert. auth.autoSsoRedirect=true (REQ-137)',12,400,P.muted,'left'));
  return { frameId, changes: ch };
}

async function main() {
  const pid = 'PAGE';
  const defs = [
    { fn:sBootstrap, col:0, name:'S1-Bootstrap' },
    { fn:sLogin,     col:1, name:'S2-Login'     },
    { fn:s2FA,       col:2, name:'S3-2FA'       },
    { fn:sPasskey,   col:3, name:'S4-Passkey'   },
    { fn:sAutoSSO,   col:4, name:'S5-AutoSSO'   },
  ];
  const modes = [
    { row:0, P:L, m:'Light' },
    { row:1, P:D, m:'Dark'  },
  ];

  const allChanges = [];
  const frameRegistry = [];

  for (const { row, m } of modes)
    allChanges.push(canvasText(pid, -180, sy(row)+FH/2-10, 170, 20, `Lbl${m}`, `${m} Mode`, 13, 600, '#64748B', 'right'));

  for (const { row, P, m } of modes) {
    for (const { fn, col, name } of defs) {
      const { frameId, changes } = fn(pid, col, row, P, m);
      allChanges.push(...changes);
      allChanges.push(canvasText(pid, sx(col), sy(row)+FH+12, FW, 16, `Ann-${m}-${name}`, `${m} / ${name}`, 11, 400, '#94A3B8', 'center'));
      frameRegistry.push({ id:frameId, svgName:`startfenster-${m.toLowerCase()}-${name.toLowerCase()}`, children:changes.slice(1) });
    }
  }

  await uploadAndExport('OEA - Startfenster Wireframes v0.4', allChanges, frameRegistry);
}

main().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
