#!/usr/bin/env node
/**
 * OEA Startfenster Wireframes v0.3
 * Columns: UC-02 Bootstrap | UC-01 Login | UC-03 2FA | UC-01 Passkey | UC-01 Auto-SSO
 * Rows: Light Mode | Dark Mode
 * Run: NODE_TLS_REJECT_UNAUTHORIZED=0 node scripts/create-penpot-mockups-startfenster.js
 */

const { v4: uuidv4 } = require('uuid');
const API   = process.env.PENPOT_API_URL;
const TOKEN = process.env.PENPOT_ACCESS_TOKEN;
const PID   = process.env.PENPOT_PROJECT_ID;
const ROOT  = '00000000-0000-0000-0000-000000000000';

async function rpc(command, body = {}) {
  const res = await fetch(`${API}api/rpc/command/${command}`, {
    method: 'POST',
    headers: { 'Authorization': `Token ${TOKEN}`, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${command} (${res.status}): ${text.slice(0, 500)}`);
  return JSON.parse(text);
}

function geo(x, y, w, h) {
  return {
    x, y, width: w, height: h, rotation: 0,
    selrect: { x, y, width: w, height: h, x1: x, y1: y, x2: x+w, y2: y+h },
    points: [{ x, y }, { x: x+w, y }, { x: x+w, y: y+h }, { x, y: y+h }],
    transform: { a:1,b:0,c:0,d:1,e:0,f:0 }, transformInverse: { a:1,b:0,c:0,d:1,e:0,f:0 },
    flipX: null, flipY: null, proportion: 1, proportionLock: false, r1:0, r2:0, r3:0, r4:0,
  };
}

function R(pid, x, y, w, h, name, fill='#FFF', fo=1, sc=null, sw=1) {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: { id, name, type: 'rect', parentId: ROOT, frameId: ROOT, ...geo(x,y,w,h),
      fills: [{ fillColor: fill, fillOpacity: fo }],
      strokes: sc ? [{ 'stroke-color': sc, 'stroke-opacity': 1, 'stroke-width': sw }] : [],
      shapes: [] },
  };
}

function T(pid, x, y, w, h, name, text, size=14, weight=400, color='#0F172A', align='left') {
  const id = uuidv4();
  return {
    type: 'add-obj', id, 'page-id': pid, 'parent-id': ROOT, 'frame-id': ROOT,
    obj: { id, name, type: 'text', parentId: ROOT, frameId: ROOT, ...geo(x,y,w,h),
      fills: [], strokes: [],
      content: { type: 'root', children: [{ type: 'paragraph-set', children: [{
        type: 'paragraph', 'text-align': align,
        children: [{ text, 'font-size': String(size), 'font-weight': String(weight),
          fills: [{ 'fill-color': color, 'fill-opacity': 1 }] }],
      }]}]} },
  };
}

// ── Palettes ──────────────────────────────────────────────────────────────────

const L = {
  bg:'#F0F9FF', card:'#FFFFFF', primary:'#0EA5E9', text:'#0F172A', muted:'#64748B',
  border:'#E2E8F0', inputBg:'#F8FAFC', selBg:'#E0F2FE', selBorder:'#0EA5E9',
  infoBg:'#E0F2FE', infoBorder:'#7DD3FC', warnBg:'#FEF3C7', warnBorder:'#FCD34D',
  warnText:'#92400E', tabBg:'#F1F5F9', radioOn:'#0EA5E9', radioOff:'#CBD5E1',
  divider:'#E2E8F0', placeholderBg:'#F1F5F9',
};
const D = {
  bg:'#0F172A', card:'#1E293B', primary:'#38BDF8', text:'#F1F5F9', muted:'#94A3B8',
  border:'#334155', inputBg:'#0F172A', selBg:'#0C4A6E', selBorder:'#38BDF8',
  infoBg:'#082F49', infoBorder:'#0369A1', warnBg:'#451A03', warnBorder:'#B45309',
  warnText:'#FCD34D', tabBg:'#1E293B', radioOn:'#38BDF8', radioOff:'#475569',
  divider:'#334155', placeholderBg:'#1E293B',
};

// ── Layout ────────────────────────────────────────────────────────────────────

const FW=1280, FH=800, CG=80, RG=100;
const ox = col => col*(FW+CG);
const oy = row => row*(FH+RG);

// ── Screen 1: UC-02 Bootstrapping ────────────────────────────────────────────

function sBootstrap(pid, col, row, P, m) {
  const x=ox(col), y=oy(row);
  return [
    R(pid,x,y,FW,FH,`${m}/S1/BG`,P.bg),
    T(pid,x+490,y+44,300,48,`${m}/S1/Logo`,'OEA',38,700,P.primary,'center'),
    T(pid,x+360,y+96,560,22,`${m}/S1/Tag`,'Open Enterprise Architecture',14,400,P.muted,'center'),
    // Progress
    R(pid,x+400,y+136,480,4,`${m}/S1/PrTrack`,P.border),
    R(pid,x+400,y+136,160,4,`${m}/S1/PrFill`,P.primary),
    // Card
    R(pid,x+400,y+152,480,548,`${m}/S1/Card`,P.card,1,P.border,1),
    T(pid,x+432,y+184,416,30,`${m}/S1/Title`,'Instanz einrichten',22,700,P.text,'left'),
    T(pid,x+432,y+218,416,20,`${m}/S1/Step`,'Schritt 1 von 3 — Admin-Zugang einrichten',12,400,P.muted,'left'),
    R(pid,x+400,y+246,480,1,`${m}/S1/Div`,P.border),
    // Option Lokal (ohne "empfohlen" — REQ-136)
    R(pid,x+432,y+262,416,100,`${m}/S1/OptLokal`,P.selBg,1,P.selBorder,2),
    R(pid,x+452,y+284,16,16,`${m}/S1/OptLokalR`,P.radioOn),
    T(pid,x+480,y+280,340,22,`${m}/S1/OptLokalL`,'Lokal',15,600,P.primary,'left'),
    T(pid,x+480,y+304,350,36,`${m}/S1/OptLokalD`,'Setup-Token erscheint beim ersten Start im Container-Log.  Admin-Passwort manuell festlegen.',12,400,P.muted,'left'),
    // Option OIDC
    R(pid,x+432,y+376,416,80,`${m}/S1/OptOIDC`,P.inputBg,1,P.border,1),
    R(pid,x+452,y+396,16,16,`${m}/S1/OptOIDCR`,P.radioOff),
    T(pid,x+480,y+392,340,22,`${m}/S1/OptOIDCL`,'Via OIDC',15,600,P.text,'left'),
    T(pid,x+480,y+416,350,20,`${m}/S1/OptOIDCD`,'Externer Identity Provider via OIDC',12,400,P.muted,'left'),
    // Info mit ℹ Icon (REQ-136: Sichtbarkeit betreibergesteuert)
    R(pid,x+432,y+472,416,60,`${m}/S1/Info`,P.infoBg,1,P.infoBorder,1),
    // ℹ-Kreis
    R(pid,x+448,y+487,20,20,`${m}/S1/InfoIcon`,P.primary,1,P.primary,0),
    T(pid,x+448,y+488,20,18,`${m}/S1/InfoI`,'i',13,700,P.card,'center'),
    T(pid,x+476,y+483,356,40,`${m}/S1/InfoTxt`,'Setup-Token ist einmalig gültig. Nach erstem Login automatisch ungültig.\nSichtbarkeit dieser Optionen ist betreiberseitig konfigurierbar.',12,400,P.muted,'left'),
    // Button
    R(pid,x+432,y+552,416,48,`${m}/S1/Btn`,P.primary),
    T(pid,x+432,y+564,416,24,`${m}/S1/BtnT`,'Weiter  →',15,600,P.card,'center'),
    T(pid,x+432,y+618,416,20,`${m}/S1/Link`,'Bereits konfiguriert?  →  Zum Login',13,400,P.primary,'center'),
    T(pid,x+400,y+FH+12,480,18,`${m}/S1/UC`,'UC-02: System-Admin-Bootstrapping  |  REQ-136',11,400,P.muted,'center'),
  ];
}

// ── Screen 2: UC-01 Login ────────────────────────────────────────────────────

function sLogin(pid, col, row, P, m) {
  const x=ox(col), y=oy(row);
  return [
    R(pid,x,y,FW,FH,`${m}/S2/BG`,P.bg),
    T(pid,x+490,y+72,300,48,`${m}/S2/Logo`,'OEA',38,700,P.primary,'center'),
    T(pid,x+360,y+124,560,22,`${m}/S2/Tag`,'Open Enterprise Architecture',14,400,P.muted,'center'),
    R(pid,x+400,y+168,480,500,`${m}/S2/Card`,P.card,1,P.border,1),
    T(pid,x+432,y+200,416,30,`${m}/S2/Title`,'Anmelden',22,700,P.text,'left'),
    // SSO
    R(pid,x+432,y+244,416,52,`${m}/S2/SSOBtn`,P.primary),
    T(pid,x+432,y+258,416,24,`${m}/S2/SSOTxt`,'Via Unternehmens-SSO anmelden  (OIDC)',14,600,P.card,'center'),
    // Divider
    R(pid,x+432,y+316,170,1,`${m}/S2/DivL`,P.divider),
    T(pid,x+610,y+306,40,20,`${m}/S2/Oder`,'oder',13,400,P.muted,'center'),
    R(pid,x+650,y+316,170,1,`${m}/S2/DivR`,P.divider),
    // E-Mail
    T(pid,x+432,y+340,200,20,`${m}/S2/EML`,'E-Mail-Adresse',13,500,P.text,'left'),
    R(pid,x+432,y+360,416,44,`${m}/S2/EMI`,P.inputBg,1,P.border,1),
    T(pid,x+448,y+372,380,20,`${m}/S2/EMP`,'max.muster@example.com',14,400,P.border,'left'),
    // Passwort
    T(pid,x+432,y+420,200,20,`${m}/S2/PWL`,'Passwort',13,500,P.text,'left'),
    R(pid,x+432,y+440,416,44,`${m}/S2/PWI`,P.inputBg,1,P.border,1),
    T(pid,x+448,y+452,220,20,`${m}/S2/PWP`,'••••••••',16,400,P.muted,'left'),
    T(pid,x+700,y+452,148,20,`${m}/S2/PWF`,'Passwort vergessen?',12,400,P.primary,'right'),
    // Anmelden
    R(pid,x+432,y+504,416,48,`${m}/S2/LBtn`,P.primary),
    T(pid,x+432,y+516,416,24,`${m}/S2/LTxt`,'Anmelden',15,600,P.card,'center'),
    T(pid,x+432,y+568,416,24,`${m}/S2/PKL`,'Passkey verwenden  (passwortlos)  🔑',13,400,P.primary,'center'),
    T(pid,x+400,y+FH+12,480,18,`${m}/S2/UC`,'UC-01: Login  (A3 Passkey / A4 TOTP / A5 Username+PW)  |  REQ-136/137',11,400,P.muted,'center'),
  ];
}

// ── Screen 3: UC-03 2FA-Enrollment ───────────────────────────────────────────

function s2FA(pid, col, row, P, m) {
  const x=ox(col), y=oy(row);
  const ch = [
    R(pid,x,y,FW,FH,`${m}/S3/BG`,P.bg),
    T(pid,x+490,y+40,300,48,`${m}/S3/Logo`,'OEA',38,700,P.primary,'center'),
    T(pid,x+360,y+92,560,22,`${m}/S3/Tag`,'Open Enterprise Architecture',14,400,P.muted,'center'),
    R(pid,x+370,y+128,540,624,`${m}/S3/Card`,P.card,1,P.border,1),
    T(pid,x+402,y+160,476,30,`${m}/S3/Title`,'Zweiten Faktor einrichten',22,700,P.text,'left'),
    T(pid,x+402,y+194,476,20,`${m}/S3/Sub`,'Pflichtaktion — Zugang erst nach Abschluss möglich',12,400,P.muted,'left'),
    R(pid,x+402,y+224,476,56,`${m}/S3/Warn`,P.warnBg,1,P.warnBorder,1),
    T(pid,x+420,y+234,440,36,`${m}/S3/WarnT`,'!  Ihr Administrator hat 2FA aktiviert. Bitte richten Sie jetzt einen zweiten Faktor ein.',12,400,P.warnText,'left'),
    R(pid,x+402,y+294,476,40,`${m}/S3/TabBar`,P.tabBg,1,P.border,1),
    R(pid,x+402,y+294,238,40,`${m}/S3/TabA`,P.card,1,P.border,1),
    T(pid,x+402,y+304,238,20,`${m}/S3/TabAT`,'TOTP  (Authenticator-App)',13,600,P.primary,'center'),
    T(pid,x+640,y+304,238,20,`${m}/S3/TabBT`,'Passkey  (WebAuthn)',13,400,P.muted,'center'),
    R(pid,x+491,y+350,298,196,`${m}/S3/QR`,P.tabBg,1,P.border,1),
    T(pid,x+491,y+428,298,40,`${m}/S3/QRT`,'QR-Code\n(otpauth://totp/...)',13,400,P.muted,'center'),
    T(pid,x+402,y+560,476,40,`${m}/S3/Instr`,'1. Authenticator-App öffnen  (z. B. Aegis, Google Authenticator)\n2. QR-Code scannen oder Code manuell eingeben',12,400,P.muted,'left'),
    T(pid,x+402,y+610,320,20,`${m}/S3/CodeL`,'Bestätigungscode  (6 Stellen)',13,500,P.text,'left'),
  ];
  for (let i=0; i<6; i++) {
    const dx = x+402+i*76;
    ch.push(R(pid,dx,y+636,64,56,`${m}/S3/D${i+1}`,P.inputBg,1,P.border,2));
    ch.push(T(pid,dx,y+652,64,24,`${m}/S3/D${i+1}T`,'–',20,400,P.muted,'center'));
  }
  ch.push(
    R(pid,x+402,y+708,476,48,`${m}/S3/CBtn`,P.primary),
    T(pid,x+402,y+720,476,24,`${m}/S3/CTxt`,'Bestätigen',15,600,P.card,'center'),
    T(pid,x+400,y+FH+12,480,18,`${m}/S3/UC`,'UC-03: 2FA-Enrollment  (Required Action beim ersten Login)',11,400,P.muted,'center'),
  );
  return ch;
}

// ── Screen 4: Passkey-Flow ───────────────────────────────────────────────────

function sPasskey(pid, col, row, P, m) {
  const x=ox(col), y=oy(row);
  return [
    R(pid,x,y,FW,FH,`${m}/S4/BG`,P.bg),
    T(pid,x+490,y+72,300,48,`${m}/S4/Logo`,'OEA',38,700,P.primary,'center'),
    T(pid,x+360,y+124,560,22,`${m}/S4/Tag`,'Open Enterprise Architecture',14,400,P.muted,'center'),
    R(pid,x+400,y+168,480,464,`${m}/S4/Card`,P.card,1,P.border,1),
    T(pid,x+432,y+200,416,30,`${m}/S4/Title`,'Identität bestätigen',22,700,P.text,'left'),
    // Info-Banner mit ℹ-Kreis
    R(pid,x+432,y+240,416,56,`${m}/S4/Info`,P.infoBg,1,P.infoBorder,1),
    R(pid,x+448,y+255,20,20,`${m}/S4/IIcon`,P.primary,1,P.primary,0),
    T(pid,x+448,y+256,20,18,`${m}/S4/II`,'i',13,700,P.card,'center'),
    T(pid,x+476,y+251,356,36,`${m}/S4/IT`,'Ihr Browser oder Betriebssystem öffnet gleich einen Passkey-Dialog. Bitte folgen Sie den Anweisungen Ihres Geräts.',12,400,P.muted,'left'),
    // Browser-Dialog Platzhalter
    R(pid,x+432,y+312,416,200,`${m}/S4/BrBox`,P.placeholderBg,1,P.border,1),
    T(pid,x+432,y+360,416,22,`${m}/S4/BrT1`,'Browser / OS – nativer Passkey-Dialog',14,600,P.muted,'center'),
    T(pid,x+432,y+386,416,20,`${m}/S4/BrT2`,'(systemgesteuert – kein OEA-UI)',13,400,P.muted,'center'),
    // Warteindikator
    T(pid,x+432,y+528,416,24,`${m}/S4/Wait`,'Warte auf Passkey-Bestätigung  …',14,400,P.muted,'center'),
    // Divider + Link
    R(pid,x+432,y+564,416,1,`${m}/S4/Div`,P.divider),
    T(pid,x+432,y+576,416,20,`${m}/S4/Back`,'Anderweitig anmelden  →',13,400,P.primary,'center'),
    T(pid,x+400,y+FH+12,480,18,`${m}/S4/UC`,'UC-01 A3: Passkey-Login  (WebAuthn / FIDO2)',11,400,P.muted,'center'),
  ];
}

// ── Screen 5: Auto-SSO Redirect ──────────────────────────────────────────────

function sAutoSSO(pid, col, row, P, m) {
  const x=ox(col), y=oy(row);
  return [
    R(pid,x,y,FW,FH,`${m}/S5/BG`,P.bg),
    T(pid,x+490,y+72,300,48,`${m}/S5/Logo`,'OEA',38,700,P.primary,'center'),
    T(pid,x+360,y+124,560,22,`${m}/S5/Tag`,'Open Enterprise Architecture',14,400,P.muted,'center'),
    R(pid,x+430,y+220,420,300,`${m}/S5/Card`,P.card,1,P.border,1),
    T(pid,x+430,y+256,420,28,`${m}/S5/Title`,'Automatische Anmeldung',20,700,P.text,'center'),
    // Provider-Name Platzhalter
    R(pid,x+490,y+296,300,44,`${m}/S5/Prov`,P.placeholderBg,1,P.border,1),
    T(pid,x+490,y+308,300,20,`${m}/S5/ProvT`,'[Konfigurierter Identity Provider]',13,500,P.muted,'center'),
    // Weiterleitung Text
    T(pid,x+430,y+356,420,24,`${m}/S5/Redir`,'Weiterleitung zu Ihrem Identity Provider  …',14,400,P.muted,'center'),
    // Ladeindikator (3 Punkte)
    R(pid,x+566,y+392,16,16,`${m}/S5/D1`,P.primary),
    R(pid,x+592,y+392,16,16,`${m}/S5/D2`,P.primary,0.6),
    R(pid,x+618,y+392,16,16,`${m}/S5/D3`,P.primary,0.3),
    // Divider + Escape
    R(pid,x+430,y+460,420,1,`${m}/S5/Div`,P.divider),
    T(pid,x+430,y+472,420,20,`${m}/S5/Esc`,'Abbrechen / Anderweitig anmelden  (?noredirect=1)',12,400,P.primary,'center'),
    // Info mit ℹ-Kreis
    R(pid,x+430,y+560,420,56,`${m}/S5/Info`,P.infoBg,1,P.infoBorder,1),
    R(pid,x+446,y+575,20,20,`${m}/S5/IIcon`,P.primary,1,P.primary,0),
    T(pid,x+446,y+576,20,18,`${m}/S5/II`,'i',13,700,P.card,'center'),
    T(pid,x+474,y+571,356,36,`${m}/S5/IT`,'Auto-SSO ist aktiv, weil nur OIDC konfiguriert ist.\nBetreiber-Konfiguration:  auth.autoSsoRedirect = true  (REQ-137)',12,400,P.muted,'left'),
    T(pid,x+400,y+FH+12,480,18,`${m}/S5/UC`,'UC-01: Auto-SSO-Redirect  |  REQ-137',11,400,P.muted,'center'),
  ];
}

// ── Row label ─────────────────────────────────────────────────────────────────

function rowLabel(pid, row, label, P) {
  return T(pid,-200,oy(row)+FH/2-10,180,24,`RowLabel-${label}`,label,13,600,P.muted,'right');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Verbinde …');
  const p = await rpc('get-profile', {});
  console.log(`✓ ${p.email}`);

  const f = await rpc('create-file', { name: 'OEA – Startfenster Wireframes v0.3', project_id: PID });
  const fileId=f.id, pageId=f.data.pages[0];
  console.log(`✓ Datei: ${fileId}`);

  const changes = [
    rowLabel(pageId, 0, 'Light Mode', L),
    rowLabel(pageId, 1, 'Dark Mode',  D),
    ...sBootstrap(pageId,0,0,L,'Light'), ...sLogin(pageId,1,0,L,'Light'),
    ...s2FA(pageId,2,0,L,'Light'),       ...sPasskey(pageId,3,0,L,'Light'),
    ...sAutoSSO(pageId,4,0,L,'Light'),
    ...sBootstrap(pageId,0,1,D,'Dark'),  ...sLogin(pageId,1,1,D,'Dark'),
    ...s2FA(pageId,2,1,D,'Dark'),        ...sPasskey(pageId,3,1,D,'Dark'),
    ...sAutoSSO(pageId,4,1,D,'Dark'),
  ];

  console.log(`  ${changes.length} Shapes …`);
  await rpc('update-file', { id:fileId, 'session-id':fileId, revn:0, vern:0, changes });

  console.log('\n✓ Wireframes v0.3 erstellt!');
  console.log('  5 Screens × 2 Modi: Bootstrap | Login | 2FA | Passkey | Auto-SSO');
  console.log(`  Datei-ID : ${fileId}`);
  console.log(`  Penpot   : ${API}dashboard/projects/${PID}`);
}

main().catch(e => { console.error('Fehler:', e.message); process.exit(1); });
