#!/usr/bin/env node
/**
 * OEA Auth & Setup Screens v0.5
 * Covers: SCR-001 (Login, Auto-SSO), SCR-002 (Setup Bootstrap), SCR-003 (2FA, Passkey)
 *
 * 5 screens × Light + Dark = 10 SVGs in docs/screens/
 *   login-light/dark.svg
 *   login-autosso-light/dark.svg
 *   setup-bootstrap-light/dark.svg
 *   auth-2fa-light/dark.svg
 *   auth-passkey-light/dark.svg
 *
 * UC-01: Authenticate
 * UC-02: Initial Setup (Bootstrapping)
 * UC-03: Enroll Authentication Method
 */
'use strict';
const path = require('path');
const { createFrame, canvasText, generateLocalSVG, rpc } = require('./shared');

const FW = 1280, FH = 800, GAP = 100;
const sx = col => col * (FW + GAP);
const sy = row => row * (FH + GAP);

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

// ─── SCR-002 (partial): Setup Bootstrap ───────────────────────────────────────
function sSetupBootstrap(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/SCR-002-SetupBootstrap`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,44,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,96,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  // Progress bar
  ch.push(r(400,136,480,4,'PrTrack',P.border));
  ch.push(r(400,136,160,4,'PrFill',P.primary));
  ch.push(t(400,148,160,14,'PrLbl','Step 1 of 3',10,500,P.primary,'center'));
  // Card
  ch.push(r(400,168,480,548,'Card',P.card,1,P.border,1));
  ch.push(t(432,200,416,30,'Title','Set Up Instance',22,700,P.text,'left'));
  ch.push(t(432,234,416,20,'Sub','Step 1 of 3 — Set Up Admin Access',12,400,P.muted,'left'));
  ch.push(r(400,262,480,1,'Div',P.border));
  // Local option (selected)
  ch.push(r(432,278,416,100,'OptLocal',P.selBg,1,P.selBorder,2));
  ch.push(r(452,300,16,16,'RadioOn',P.primary));
  ch.push(t(480,296,340,22,'LocalL','Local',15,600,P.primary,'left'));
  ch.push(t(480,320,350,36,'LocalD','Setup token appears in container log on first startup. Set admin password manually.',12,400,P.muted,'left'));
  // OIDC option
  ch.push(r(432,392,416,80,'OptOIDC',P.inputBg,1,P.border,1));
  ch.push(r(452,412,16,16,'RadioOff',P.border));
  ch.push(t(480,408,340,22,'OIDCL','Via OIDC',15,600,P.text,'left'));
  ch.push(t(480,432,350,20,'OIDCD','External identity provider via OIDC',12,400,P.muted,'left'));
  // Info banner
  ch.push(r(432,488,416,60,'Info',P.infoBg,1,P.infoBorder,1));
  ch.push(r(448,503,20,20,'InfoCircle',P.primary));
  ch.push(t(448,504,20,18,'InfoI','i',13,700,P.card,'center'));
  ch.push(t(476,499,356,40,'InfoTxt','Setup token is single-use. Visibility configurable by operator (REQ-136).',12,400,P.muted,'left'));
  // Continue button
  ch.push(r(432,568,416,48,'Btn',P.primary));
  ch.push(t(432,580,416,24,'BtnT','Continue  →',15,600,P.card,'center'));
  ch.push(t(432,634,416,20,'Link','Already configured?  →  Sign in',13,400,P.primary,'center'));
  return { frameId, changes: ch };
}

// ─── SCR-001: Login ────────────────────────────────────────────────────────────
function sLogin(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/SCR-001-Login`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,72,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,124,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(400,168,480,500,'Card',P.card,1,P.border,1));
  ch.push(t(432,200,416,30,'Title','Sign In',22,700,P.text,'left'));
  // SSO button
  ch.push(r(432,244,416,52,'SSOBtn',P.primary));
  ch.push(t(432,258,416,24,'SSOTxt','Sign in via Corporate SSO  (OIDC)',14,600,P.card,'center'));
  // Divider
  ch.push(r(432,316,170,1,'DivL',P.divider));
  ch.push(t(610,306,40,20,'Or','or',13,400,P.muted,'center'));
  ch.push(r(650,316,170,1,'DivR',P.divider));
  // Email field
  ch.push(t(432,340,200,20,'EML','Email Address',13,500,P.text,'left'));
  ch.push(r(432,360,416,44,'EMI',P.inputBg,1,P.border,1));
  ch.push(t(448,372,380,20,'EMP','max.muster@example.com',14,400,P.border,'left'));
  // Password field
  ch.push(t(432,420,200,20,'PWL','Password',13,500,P.text,'left'));
  ch.push(r(432,440,416,44,'PWI',P.inputBg,1,P.border,1));
  ch.push(t(448,452,220,20,'PWP','........',16,400,P.muted,'left'));
  ch.push(t(700,452,148,20,'PWF','Forgot password?',12,400,P.primary,'right'));
  // Sign in button
  ch.push(r(432,504,416,48,'LBtn',P.primary));
  ch.push(t(432,516,416,24,'LTxt','Sign In',15,600,P.card,'center'));
  ch.push(t(432,568,416,24,'PKL','Use Passkey  (passwordless)',13,400,P.primary,'center'));
  return { frameId, changes: ch };
}

// ─── SCR-003 (partial): 2FA Enrollment ────────────────────────────────────────
function s2FA(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/SCR-003-2FA-Enrollment`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,40,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,92,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(370,128,540,624,'Card',P.card,1,P.border,1));
  ch.push(t(402,160,476,30,'Title','Set Up Second Factor',22,700,P.text,'left'));
  ch.push(t(402,194,476,20,'Sub','Required action — access granted after completion',12,400,P.muted,'left'));
  // Warning
  ch.push(r(402,224,476,56,'Warn',P.warnBg,1,P.warnBorder,1));
  ch.push(t(420,234,440,36,'WarnT','!  Administrator has enabled 2FA. Please set up a second factor now.',12,400,P.warnText,'left'));
  // Tabs
  ch.push(r(402,294,476,40,'TabBar',P.tabBg,1,P.border,1));
  ch.push(r(402,294,238,40,'TabA',P.card,1,P.border,1));
  ch.push(t(402,304,238,20,'TabAT','TOTP  (Authenticator App)',13,600,P.primary,'center'));
  ch.push(t(640,304,238,20,'TabBT','Passkey  (WebAuthn)',13,400,P.muted,'center'));
  // QR placeholder
  ch.push(r(491,350,298,196,'QR',P.tabBg,1,P.border,1));
  ch.push(t(491,428,298,40,'QRT','QR Code  (otpauth://totp/...)',13,400,P.muted,'center'));
  // Instructions
  ch.push(t(402,560,476,40,'Instr','1. Open authenticator app  2. Scan QR code or enter key manually',12,400,P.muted,'left'));
  // Code input boxes
  ch.push(t(402,610,320,20,'CodeL','Verification Code  (6 digits)',13,500,P.text,'left'));
  for (let i = 0; i < 6; i++) {
    ch.push(r(402+i*76, 636, 64, 56, `D${i}`, P.inputBg, 1, P.border, 2));
    ch.push(t(402+i*76, 652, 64, 24, `D${i}T`, '–', 20, 400, P.muted, 'center'));
  }
  // Confirm button
  ch.push(r(402,708,476,48,'CBtn',P.primary));
  ch.push(t(402,720,476,24,'CTxt','Confirm',15,600,P.card,'center'));
  return { frameId, changes: ch };
}

// ─── SCR-003 (partial): Passkey Enrollment ────────────────────────────────────
function sPasskey(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/SCR-003-Passkey-Enrollment`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,72,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,124,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(400,168,480,464,'Card',P.card,1,P.border,1));
  ch.push(t(432,200,416,30,'Title','Confirm Identity',22,700,P.text,'left'));
  // Info banner
  ch.push(r(432,240,416,56,'Info',P.infoBg,1,P.infoBorder,1));
  ch.push(r(448,255,20,20,'InfoCircle',P.primary));
  ch.push(t(448,256,20,18,'InfoI','i',13,700,P.card,'center'));
  ch.push(t(476,251,356,36,'IT','Your browser or OS will open a Passkey dialog shortly.',12,400,P.muted,'left'));
  // Browser dialog placeholder
  ch.push(r(432,312,416,200,'BrBox',P.placeholderBg,1,P.border,1));
  ch.push(t(432,360,416,22,'BrT1','Browser / OS — native Passkey dialog',14,600,P.muted,'center'));
  ch.push(t(432,386,416,20,'BrT2','(system-controlled — no OEA UI)',13,400,P.muted,'center'));
  ch.push(t(432,528,416,24,'Wait','Waiting for Passkey confirmation  ...',14,400,P.muted,'center'));
  ch.push(r(432,564,416,1,'Div',P.divider));
  ch.push(t(432,576,416,20,'Back','Use another sign-in method  →',13,400,P.primary,'center'));
  return { frameId, changes: ch };
}

// ─── SCR-001 (variant): Auto-SSO redirect ─────────────────────────────────────
function sAutoSSO(pid, col, row, P, m) {
  const { frameId, change, r, t } = createFrame(pid, sx(col), sy(row), FW, FH, `${m}/SCR-001-AutoSSO`);
  const ch = [change];
  ch.push(r(0,0,FW,FH,'BG',P.bg));
  ch.push(t(490,72,300,48,'Logo','OEA',38,700,P.primary,'center'));
  ch.push(t(360,124,560,22,'Tag','Open Enterprise Architecture',14,400,P.muted,'center'));
  ch.push(r(430,220,420,300,'Card',P.card,1,P.border,1));
  ch.push(t(430,256,420,28,'Title','Automatic Sign-In',20,700,P.text,'center'));
  // Provider placeholder
  ch.push(r(490,296,300,44,'Prov',P.placeholderBg,1,P.border,1));
  ch.push(t(490,308,300,20,'ProvT','[Configured Identity Provider]',13,500,P.muted,'center'));
  ch.push(t(430,356,420,24,'Redir','Redirecting to your identity provider  ...',14,400,P.muted,'center'));
  // Loading dots
  ch.push(r(566,392,16,16,'D1',P.primary));
  ch.push(r(592,392,16,16,'D2',P.primary,0.6));
  ch.push(r(618,392,16,16,'D3',P.primary,0.3));
  ch.push(r(430,460,420,1,'Div',P.divider));
  ch.push(t(430,472,420,20,'Esc','Cancel / Use another method  (?noredirect=1)',12,400,P.primary,'center'));
  // Info note
  ch.push(r(430,560,420,56,'Info',P.infoBg,1,P.infoBorder,1));
  ch.push(r(446,575,20,20,'InfoCircle',P.primary));
  ch.push(t(446,576,20,18,'InfoI','i',13,700,P.card,'center'));
  ch.push(t(474,571,356,36,'IT','Auto-SSO active: only OIDC configured.  auth.autoSsoRedirect=true  (REQ-137)',12,400,P.muted,'left'));
  return { frameId, changes: ch };
}

// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  const outDir = path.join(__dirname, '..', '..', 'docs', 'screens');
  const hasPenpot = !!(process.env.PENPOT_API_URL && process.env.PENPOT_ACCESS_TOKEN && process.env.PENPOT_PROJECT_ID);
  const pid = '00000000-0000-0000-0000-000000000001';

  // 5 screens × 2 modes = 10 SVGs
  const screens = [
    { fn: sSetupBootstrap, col: 0, svgBase: 'setup-bootstrap', scr: 'SCR-002' },
    { fn: sLogin,          col: 1, svgBase: 'login',           scr: 'SCR-001' },
    { fn: s2FA,            col: 2, svgBase: 'auth-2fa',        scr: 'SCR-003' },
    { fn: sPasskey,        col: 3, svgBase: 'auth-passkey',    scr: 'SCR-003' },
    { fn: sAutoSSO,        col: 4, svgBase: 'login-autosso',   scr: 'SCR-001' },
  ];
  const modes = [{ row: 0, P: L, m: 'Light' }, { row: 1, P: D, m: 'Dark' }];

  if (hasPenpot) {
    const PID = process.env.PENPOT_PROJECT_ID, API = process.env.PENPOT_API_URL;
    try {
      const profile = await rpc('get-profile', {});
      console.log(`Penpot: ${profile.email}`);
      const files = await rpc('get-project-files', { project_id: PID });
      for (const f of files.filter(f => f.name && f.name.includes('Auth & Setup')))
        await rpc('delete-file', { id: f.id });
      const f = await rpc('create-file', { name: 'OEA - Auth & Setup v0.5', project_id: PID });
      const fileId = f.id, pageId = f.data.pages[0];
      const all = [];
      for (const { row, m } of modes)
        all.push(canvasText(pageId, -180, sy(row)+FH/2-10, 170, 20, `Lbl${m}`, `${m} Mode`, 13, 600, '#64748B', 'right'));
      for (const { row, P, m } of modes) {
        for (const { fn, col, svgBase } of screens) {
          const { changes } = fn(pageId, col, row, P, m);
          all.push(...changes);
          all.push(canvasText(pageId, sx(col), sy(row)+FH+12, FW, 16,
            `Ann-${m}-${svgBase}`, `${m} / ${svgBase}`, 11, 400, '#94A3B8', 'center'));
        }
      }
      await rpc('update-file', { id: fileId, 'session-id': fileId, revn: 0, vern: 0, changes: all });
      console.log(`Penpot: ${all.length} shapes  |  ${API}dashboard/projects/${PID}`);
    } catch(e) { console.warn(`Penpot failed: ${e.message}`); }
  } else {
    console.log('(Penpot skipped)');
  }

  // Generate one SVG per screen per mode
  console.log('\nSVG export (one per screen) ...');
  for (const { row, P, m } of modes) {
    for (const { fn, svgBase } of screens) {
      const { changes } = fn(pid, 0, row, P, m); // col=0 → frame at sx(0)=0 for SVG
      const outPath = path.join(outDir, `${svgBase}-${m.toLowerCase()}.svg`);
      generateLocalSVG(changes[0], changes.slice(1), outPath);
      console.log(`  ${svgBase}-${m.toLowerCase()}.svg`);
    }
  }
  console.log('\ndone.');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
