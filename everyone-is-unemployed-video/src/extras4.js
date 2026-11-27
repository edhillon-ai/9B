import { THREE, scene, box, cyl, sph, mat, canvasTex, textPlane } from './core.js';
import { LOC, W, tree, house, sportsCar, cookie, loaf } from './world.js';
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
LOC.rich = V3(1400, 0, 0); LOC.pool = V3(1600, 0, 0); LOC.office = V3(1700, 0, 0); LOC.gm = V3(1900, 0, 0); LOC.lot = V3(2100, 0, 0); LOC.air = V3(2300, 0, 0); LOC.bex = V3(2500, 0, 0); LOC.lawn = V3(2700, 0, 0);
const add = (p, o, x, y, z) => { o.position.set(x, y, z); p.add(o); return o; };
const grp = (at) => { const g = new THREE.Group(); g.position.copy(at); scene.add(g); return g; };
const emis = (c, i = 1.5) => mat(c, { emissive: c, emissiveIntensity: i });
const GOLD = () => mat(0xffc629, { metalness: 0.9, roughness: 0.22 });
let s = 11; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;

export function palm(hh = 9) {
  const g = new THREE.Group(); let x = 0;
  for (let i = 0; i < 7; i++) { const c = cyl(0.42 - i * 0.03, 0.48 - i * 0.03, hh / 7 + 0.05, i % 2 ? 0x9a6a3a : 0x8a5a2e, 10); x += 0.12; add(g, c, x, hh / 7 * (i + 0.5), 0); }
  for (let i = 0; i < 7; i++) { const l = new THREE.Group(); const lf = box(4.2, 0.12, 1.1, [0x2f9e44, 0x3cb54f][i % 2]); lf.position.x = 2.0; lf.rotation.z = -0.35; l.add(lf); l.rotation.y = i / 7 * Math.PI * 2; add(g, l, x, hh, 0); }
  return g;
}
export function bushBall(r = 1.6, c = 0x3e9e3a) { const g = new THREE.Group(); for (let i = 0; i < 5; i++) add(g, sph(r * (0.6 + rnd() * 0.4), c, { roughness: 0.95 }, 12), (rnd() - 0.5) * r, r * 0.7 + rnd() * r * 0.4, (rnd() - 0.5) * r); return g; }
function prism(w, h, d, color) { const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, h); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }), typeof color === 'object' ? color : mat(color)); m.castShadow = true; return m; }
export function mansion(col, trim = 0xffffff, o = {}) {
  const g = new THREE.Group(); const w = o.w || 22, d = o.d || 14, h = o.h || 13; const gold = GOLD();
  add(g, box(w, h, d, col), 0, h / 2, 0);
  add(g, box(7, h * 0.7, d * 0.9, col), -w / 2 - 3.5, h * 0.35, -1); add(g, box(7, h * 0.7, d * 0.9, col), w / 2 + 3.5, h * 0.35, -1);
  for (const sx of [-1, 1]) add(g, box(7.6, 0.6, d * 0.9 + 0.6, trim), sx * (w / 2 + 3.5), h * 0.7 + 0.3, -1);
  add(g, box(w + 1, 0.8, d + 1, trim), 0, h + 0.4, 0);
  for (let i = 0; i < 14; i++) add(g, box(0.4, 1.2, 0.4, trim), -w / 2 + 1 + i * (w - 2) / 13, h + 1.4, d / 2);
  add(g, box(w + 1, 0.35, 0.5, trim), 0, h + 2.1, d / 2);
  for (let i = 0; i < 6; i++) add(g, cyl(0.55, 0.65, h - 1, trim, 16), -7.5 + i * 3, (h - 1) / 2, d / 2 + 3.2);
  add(g, box(19, 1, 4.6, trim), 0, h - 0.5, d / 2 + 2.3);
  const ped = prism(19, 3.4, 0.8, trim); add(g, ped, 0, h, d / 2 + 4.0);
  for (let i = 0; i < 3; i++) add(g, box(18 - i * 1.5, 0.4, 2 - i * 0.5, trim), 0, 0.2 + i * 0.4, d / 2 + 5.4 - i * 0.6);
  add(g, box(3.4, 6.2, 0.3, gold), 0, 3.1, d / 2 + 0.15); add(g, box(0.15, 6, 0.32, 0x7a5a10), 0, 3.1, d / 2 + 0.2);
  const wm = o.night ? emis(0xffd27a, 1.3) : mat(0x9fd8ff, { roughness: 0.05, metalness: 0.3 });
  const wins = [];
  for (const y of [3.6, 9.0]) for (const x of [-8.8, -4.6, 4.6, 8.8]) { add(g, box(2.8, 3.2, 0.3, trim), x, y, d / 2 + 0.02); wins.push(add(g, box(2.3, 2.7, 0.34, wm), x, y, d / 2 + 0.04)); }
  for (const sx of [-1, 1]) for (const x of [-1.7, 1.7]) { add(g, box(2.6, 3.0, 0.3, trim), sx * (w / 2 + 3.5) + x, 4.2, d * 0.45 - 1 + 0.02); wins.push(add(g, box(2.1, 2.5, 0.34, wm), sx * (w / 2 + 3.5) + x, 4.2, d * 0.45 - 1 + 0.04)); }
  for (let i = 0; i < 2; i++) { const p = palm(9 + i); p.position.set((i ? 1 : -1) * 12, 0, d / 2 + 8); g.add(p); }
  // fountain
  add(g, cyl(3.2, 3.4, 0.8, trim, 28), 0, 0.4, d / 2 + 13); add(g, cyl(2.8, 2.8, 0.2, mat(0x4fc3f7, { roughness: 0.05, metalness: 0.2 }), 28), 0, 0.82, d / 2 + 13); add(g, cyl(0.3, 0.4, 2.2, trim), 0, 1.6, d / 2 + 13); add(g, cyl(1.1, 0.4, 0.4, gold), 0, 2.8, d / 2 + 13);
  g.userData.wins = wins; return g;
}
export function bugatti(body = 0xffc629) {
  const c = sportsCar(); const gm = mat(body, { metalness: 0.95, roughness: 0.18 });
  c.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0xe01b24) o.material = gm; });
  add(c, box(0.25, 1.0, 1.2, 0x151515), 5.05, 1.6, 0); add(c, box(0.27, 0.8, 1.0, mat(0xdddddd, { metalness: 1, roughness: 0.2 })), 5.08, 1.6, 0);
  for (const z of [2.33, -2.33]) add(c, box(5.0, 0.22, 0.06, 0x101010), -0.2, 1.9, z);
  for (const z of [1.6, -1.6]) add(c, box(0.15, 0.25, 1.0, emis(0xffffff, 2)), 5.02, 1.9, z);
  return c;
}
export function recolorCar(c, color) { const m = mat(color, { roughness: 0.15, metalness: 0.5 }); c.traverse(o => { if (o.isMesh && o.material && o.material.color && o.material.color.getHex() === 0xe01b24) o.material = m; }); return c; }
function billTex() { return canvasTex(128, 64, (g) => { g.fillStyle = '#5fbf62'; g.fillRect(0, 0, 128, 64); g.strokeStyle = '#2d7a33'; g.lineWidth = 6; g.strokeRect(5, 5, 118, 54); g.fillStyle = '#2d7a33'; g.beginPath(); g.arc(64, 32, 17, 0, 7); g.fill(); g.fillStyle = '#c9f2c4'; g.font = '900 30px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('$', 64, 33); }); }
let BT; export function bill(sc = 1) { BT = BT || billTex(); const m = new THREE.Mesh(new THREE.PlaneGeometry(0.95 * sc, 0.48 * sc), new THREE.MeshStandardMaterial({ map: BT, side: THREE.DoubleSide, roughness: 0.7 })); m.castShadow = false; return m; }
export function cashCloud(n, spread, h) { // falling money
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const b = bill(1.2); b.userData = { x: (rnd() - 0.5) * spread, z: (rnd() - 0.5) * spread, y0: rnd() * h, sp: 1.2 + rnd() * 1.5, r: rnd() * 6, h }; g.add(b); }
  g.update = (t, burst = 0) => g.children.forEach(c => { const u = c.userData; const y = ((u.y0 - t * u.sp) % u.h + u.h) % u.h; const k = burst ? (1 + burst * 0.0) : 1; c.position.set((u.x + Math.sin(t * 2 + u.r) * 0.8) * k, y + 0.3, u.z * k + Math.cos(t * 1.7 + u.r) * 0.6); c.rotation.set(t * 3 + u.r, t * 2 + u.r, Math.sin(t * 4 + u.r)); });
  return g;
}
export function cashBurst(n) { const g = new THREE.Group(); for (let i = 0; i < n; i++) { const b = bill(1.1); const a = rnd() * Math.PI * 2, e = 0.4 + rnd() * 1.0; b.userData = { v: V3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)).multiplyScalar(8 + rnd() * 10), r: rnd() * 6 }; g.add(b); }
  g.update = (t) => g.children.forEach(c => { const u = c.userData; const tt = Math.min(t, 3); c.position.set(u.v.x * tt * 0.7, Math.max(0.2, u.v.y * tt - 6 * tt * tt + 1), u.v.z * tt * 0.7); c.rotation.set(t * 5 + u.r, t * 3, t * 4 + u.r); }); return g; }

function phoneN() { // phone with banking notifications
  const g = new THREE.Group(); add(g, box(1.0, 1.9, 0.12, 0x111111), 0, 0, 0);
  const tex = canvasTex(300, 570, () => {}); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.72), new THREE.MeshBasicMaterial({ map: tex })); scr.position.z = 0.07; g.add(scr);
  g.userData.draw = (mode, t = 0) => { const { g: c, canvas } = tex.userData; const Wd = canvas.width, Ht = canvas.height;
    const bgc = mode === 'off' || mode === 'on' ? '#1c1c22' : '#16213e'; c.fillStyle = bgc; c.fillRect(0, 0, Wd, Ht);
    const card = (y, big, small, col = '#34e07a') => { c.fillStyle = 'rgba(255,255,255,0.93)'; c.beginPath(); c.roundRect(14, y, Wd - 28, 86, 18); c.fill(); c.fillStyle = col; c.beginPath(); c.roundRect(26, y + 16, 54, 54, 12); c.fill(); c.fillStyle = '#fff'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('$', 53, y + 58); c.textAlign = 'left'; c.fillStyle = '#111'; c.font = '900 30px Inter'; c.fillText(big, 94, y + 44); c.fillStyle = '#666'; c.font = '700 18px Inter'; c.fillText(small, 94, y + 70); };
    if (mode === 'ding') { c.fillStyle = '#fff'; c.font = '700 64px Inter'; c.textAlign = 'center'; c.fillText('9:41', Wd / 2, 130); if (t > 0) { const y = 170 - Math.max(0, 1 - t * 4) * 120; card(y, '+$1,000,000', 'TOWN BANK · now'); } }
    else if (mode === 'off' || mode === 'on') { const on = mode === 'on' ? Math.min(1, t * 3) : 0; c.fillStyle = '#fff'; c.font = '900 34px Inter'; c.textAlign = 'left'; c.fillText('Notifications', 26, 90); c.fillStyle = '#2a2a33'; c.beginPath(); c.roundRect(14, 130, Wd - 28, 100, 20); c.fill(); c.fillStyle = '#fff'; c.font = '700 26px Inter'; c.fillText('Town Bank', 34, 190);
      c.fillStyle = on > 0.5 ? '#34c759' : '#55555f'; c.beginPath(); c.roundRect(Wd - 130, 158, 96, 46, 23); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(Wd - 107 + on * 50, 181, 19, 0, 7); c.fill(); }
    else if (mode === 'flood') { const off = (t * 520) % 100; for (let i = -1; i < 7; i++) card(30 + i * 100 + off, '+$1,000,000', 'MISSED PAYMENT'); c.fillStyle = 'rgba(22,33,62,0.92)'; c.fillRect(0, Ht - 130, Wd, 130); c.fillStyle = '#ffd60a'; c.font = '900 40px Inter'; c.textAlign = 'center'; c.fillText('$1,000,000,000', Wd / 2, Ht - 55); }
    tex.needsUpdate = true; };
  g.userData.draw('ding', 0); return g;
}
function mailTruck() { const g = new THREE.Group(); const wh = 0xf2f2f2;
  add(g, box(9, 5, 4.4, wh), -0.8, 3.0, 0); add(g, box(3, 3.4, 4.2, wh), 4.6, 2.2, 0); add(g, box(0.15, 1.6, 3.6, mat(0x334455, { roughness: 0.05, metalness: 0.7 })), 6.1, 3.0, 0);
  for (const z of [2.22, -2.22]) { add(g, box(12, 0.5, 0.06, 0x1d4ed8), 0.7, 2.0, z); add(g, box(12, 0.3, 0.06, 0xd62d2d), 0.7, 1.5, z); }
  for (const [x, z] of [[4.2, 2.1], [4.2, -2.1], [-3.5, 2.1], [-3.5, -2.1]]) { const w = cyl(0.95, 0.95, 0.7, 0x111111, 18); w.rotation.x = Math.PI / 2; add(g, w, x, 0.95, z); }
  for (let i = 0; i < 9; i++) add(g, sph(0.35 + rnd() * 0.4, mat(0x4d7a2a, { roughness: 1 }), null, 8), -4 + rnd() * 10, 0.6 + rnd() * 5, (rnd() > 0.5 ? 1 : -1) * 2.25);
  return g; }
function jet() { const g = new THREE.Group(); const wh = mat(0xf7f7f7, { roughness: 0.25, metalness: 0.3 }); const gold = GOLD();
  const f = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 22, 28), wh); f.rotation.z = Math.PI / 2; f.castShadow = true; add(g, f, 0, 4, 0);
  const n = new THREE.Mesh(new THREE.SphereGeometry(1.9, 24, 16), wh); n.scale.set(2.2, 1, 1); add(g, n, 11, 4, 0);
  const tl = new THREE.Mesh(new THREE.ConeGeometry(1.9, 6, 24), wh); tl.rotation.z = Math.PI / 2; add(g, tl, -14, 4.3, 0);
  add(g, box(5, 0.35, 22, wh), 0, 3.0, 0); add(g, box(3.5, 5, 0.35, gold), -14.5, 7.5, 0); add(g, box(2.5, 0.3, 7, wh), -15, 5.2, 0);
  for (const z of [1.92, -1.92]) { add(g, box(20, 0.35, 0.05, gold), 0, 3.4, z); for (let i = 0; i < 8; i++) add(g, box(0.7, 0.7, 0.06, 0x223344), -8 + i * 2.3, 4.6, z); }
  for (const z of [4, -4]) { const e = cyl(0.9, 0.9, 3.5, 0xcccccc, 16); e.rotation.z = Math.PI / 2; add(g, e, 0.5, 2.4, z); }
  for (const [x, z] of [[8, 0], [-2, 1.8], [-2, -1.8]]) { add(g, cyl(0.12, 0.12, 1.6, 0x333333), x, 1.2, z); const w = cyl(0.5, 0.5, 0.4, 0x111111, 14); w.rotation.x = Math.PI / 2; add(g, w, x, 0.5, z); }
  add(g, box(2, 0.1, 3, 0x333333), 7, 2.0, 2.6); // stairs-ish
  return g; }
function adminScreens() { // 6 monitors at grandma's desk
  W.adm = [];
  const kinds = ['list', 'map', 'cmd', 'list2', 'money', 'cam'];
  W.drawAdmin = (t, send = 0) => W.adm.forEach(m => { const { tex, k } = m.userData; const { g, canvas } = tex.userData; const w = canvas.width, h = canvas.height;
    g.fillStyle = '#0d1020'; g.fillRect(0, 0, w, h); g.fillStyle = '#7c3aed'; g.fillRect(0, 0, w, 34); g.fillStyle = '#fff'; g.font = '900 22px Inter'; g.textAlign = 'left'; g.fillText(k === 'cmd' ? 'ADMIN CONSOLE' : k === 'map' ? 'TOWN MAP' : k === 'money' ? 'BANK' : k === 'cam' ? 'CAM 3' : 'PLAYERS', 12, 25);
    if (k === 'list' || k === 'list2') { const names = k === 'list' ? ['JAKE', 'BAKER', 'MAILMAN', 'MAYOR'] : ['MAYOR', 'COACH', 'ALEX', 'JAKE'];
      names.forEach((n, i) => { const y = 58 + i * 46; g.fillStyle = n === 'ALEX' ? '#3a0f14' : '#161b33'; g.fillRect(8, y, w - 16, 38); g.fillStyle = '#fff'; g.font = '700 20px Inter'; g.fillText(n, 18, y + 26);
        const ok = n !== 'ALEX'; g.fillStyle = ok ? (send > 0.2 ? '#34e07a' : '#888') : '#ff3b30'; g.font = '900 18px Inter'; g.textAlign = 'right'; g.fillText(ok ? (send > 0.2 ? '+$1,000,000 ✓' : '$0') : 'NOTIFS OFF', w - 16, y + 26); g.textAlign = 'left'; }); }
    else if (k === 'cmd') { g.fillStyle = '#34e07a'; g.font = '700 21px monospace'; const L = ['> login grandma', '> admin: TRUE', '> /give all $1000000']; const n = Math.floor(t * 18); let cnt = 0; L.forEach((l, i) => { const s2 = l.slice(0, Math.max(0, n - cnt)); cnt += l.length; g.fillText(s2, 14, 70 + i * 34); }); if (send > 0.2) { g.fillStyle = '#ffd60a'; g.fillText('SENT ✓', 14, 190); } if (Math.floor(t * 3) % 2) { g.fillRect(14 + 0, 205, 12, 4); } }
    else if (k === 'map') { g.fillStyle = '#1f5130'; g.fillRect(8, 42, w - 16, h - 50); g.fillStyle = '#555'; g.fillRect(8, 120, w - 16, 18); for (let i = 0; i < 8; i++) { g.fillStyle = '#ffd60a'; g.fillRect(24 + i * 30, i % 2 ? 80 : 150, 20, 20); if (send > 0.2) { g.fillStyle = '#34e07a'; g.font = '900 20px Inter'; g.fillText('$', 28 + i * 30, (i % 2 ? 72 : 196) - ((t * 40 + i * 9) % 20)); } } g.fillStyle = '#ff3b30'; g.fillRect(140, 150, 14, 14); }
    else if (k === 'money') { g.fillStyle = '#ffd60a'; g.font = '900 38px Inter'; g.fillText('$' + (999000000 + Math.floor(t * 7777)).toLocaleString(), 14, 110); g.fillStyle = '#34e07a'; for (let i = 0; i < 10; i++) { const hh = 20 + ((i * 37 + Math.floor(t * 4) * 13) % 70); g.fillRect(18 + i * 23, 230 - hh, 16, hh); } }
    else { g.fillStyle = '#0a0a0a'; g.fillRect(8, 42, w - 16, h - 50); g.fillStyle = '#334'; g.fillRect(60, 120, 60, 90); g.fillRect(150, 100, 70, 110); g.fillStyle = '#ff3b30'; g.beginPath(); g.arc(w - 24, 56, 8, 0, 7); if (Math.floor(t * 2) % 2) g.fill(); }
    tex.needsUpdate = true; });
  return kinds;
}

export function buildExtras4() {
  // ===== RICH STREET =====
  const R = grp(LOC.rich); W.rich = R;
  add(R, box(400, 0.1, 10, 0x3f4249, { roughness: 0.9 }), 0, 0.04, 0); for (let x = -190; x < 200; x += 8) add(R, box(3.5, 0.12, 0.35, 0xffffff), x, 0.07, 0);
  for (const z of [-7.5, 7.5]) add(R, box(400, 0.35, 5, 0xe9e4da), 0, 0.17, z);
  const cols = [[0xfff4e0, 0xffffff], [0xf7d9e8, 0xffffff], [0xdff1ff, 0xffffff], [0xfff3b0, 0xffffff], [0xe9ffe9, 0xffffff], [0xf0e4ff, 0xffffff]];
  W.mans = [];
  [-114, -70, -26, 26, 70, 114].forEach((x, i) => { const m = mansion(cols[i][0], cols[i][1]); m.position.set(x, 0, -34); R.add(m); W.mans.push(m); });
  [-88, -44, 0, 44, 88].forEach((x, i) => { const m = mansion(cols[(i + 3) % 6][0], 0xffffff); m.position.set(x, 0, 36); m.rotation.y = Math.PI; R.add(m); W.mans.push(m); });
  const near = (px, xs) => xs.some(mx => Math.abs(px - mx) < 6);
  for (let x = -120; x <= 120; x += 12) { if (!near(x + 3, [-114, -70, -26, 26, 70, 114, 0])) { const p = palm(8 + (Math.abs(x) % 3)); p.position.set(x + 3, 0, -11); R.add(p); } if (!near(x - 3, [-88, -44, 0, 44, 88])) { const p2 = palm(8.5); p2.position.set(x - 3, 0, 11); R.add(p2); } }
    // Alex's tiny wooden house (between mansions)
  const th = new THREE.Group(); const plank = canvasTex(128, 128, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#8a5a32' : '#9a6a3e'; g.fillRect(0, i * 16, 128, 16); g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, i * 16, 128, 2); } });
  const pm = new THREE.MeshStandardMaterial({ map: plank, roughness: 0.9 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(5, 4.2, 5), pm); body.castShadow = true; body.receiveShadow = true; add(th, body, 0, 2.1, 0);
  const rf = prism(6.4, 2.4, 6, 0x6b3b1e); add(th, rf, 0, 4.2, -3); rf.rotation.z = 0.06;
  add(th, box(1.4, 2.6, 0.2, 0x5a3418), -0.9, 1.3, 2.55); add(th, box(1.2, 1.0, 0.2, 0x9fd8ff), 1.3, 2.6, 2.55); add(th, box(1.2, 0.1, 0.25, 0x5a3418), 1.3, 2.6, 2.57); add(th, box(0.1, 1.0, 0.25, 0x5a3418), 1.3, 2.6, 2.57);
  add(th, box(0.5, 0.5, 0.05, 0x5a3418), 0.3, 3.6, 2.56); add(th, box(0.15, 1.3, 0.15, 0x777777), 2.2, 4.8, -1);
  const mb = new THREE.Group(); add(mb, box(0.15, 1.6, 0.15, 0x6b3b1e), 0, 0.8, 0); add(mb, box(0.6, 0.5, 0.9, 0x888888), 0, 1.8, 0); add(th, mb, 2.7, 0, 3.6);
  th.position.set(0, 0, -15); R.add(th); W.tiny = th;
  W.richCars = [0x1e3a8a, 0x111111, 0xffffff, 0x8e24aa, 0x00b894].map((c, i) => { const car = recolorCar(sportsCar(), c); car.position.set(LOC.rich.x + [-60, -34, -16, 28, 54][i], 0, i % 2 ? 7.2 : -7.2); car.rotation.y = i % 2 ? Math.PI : 0; scene.add(car); return car; });
  W.cash = cashCloud(160, 34, 16); scene.add(W.cash);
  W.burst = cashBurst(120); scene.add(W.burst);
  W.bug = bugatti(); scene.add(W.bug);
  W.bills = [bill(1), bill(1), bill(1)]; W.bills.forEach(b => scene.add(b));
  W.phoneN = phoneN(); scene.add(W.phoneN);
  // work props
  W.mower = new THREE.Group(); add(W.mower, box(2.6, 0.7, 2.2, 0xd62d2d), 0, 0.8, 0); add(W.mower, cyl(0.5, 0.6, 0.7, 0x333333), 0, 1.5, 0); for (const [x, z] of [[1, 1.1], [1, -1.1], [-1, 1.1], [-1, -1.1]]) { const w = cyl(0.4, 0.4, 0.3, 0x111111, 12); w.rotation.x = Math.PI / 2; add(W.mower, w, x, 0.4, z); }
  const hdl = box(0.15, 3.2, 0.15, 0x222222); hdl.rotation.z = 0.75; for (const z of [0.8, -0.8]) { const h2 = hdl.clone(); add(W.mower, h2, -2.0, 2.0, z); } add(W.mower, box(0.15, 0.15, 1.8, 0x222222), -3.15, 3.15, 0); scene.add(W.mower);
  W.grass = new THREE.Group(); for (let i = 0; i < 40; i++) add(W.grass, box(0.12, 0.12, 0.12, 0x5fbf3a), 0, 0, 0); W.grass.children.forEach((c, i) => c.userData = { a: rnd() * 6, s: 2 + rnd() * 3, o: rnd() }); scene.add(W.grass);
  W.pizza = new THREE.Group(); for (let i = 0; i < 4; i++) { add(W.pizza, box(1.8, 0.28, 1.8, 0xf2efe6), 0, i * 0.3, 0); add(W.pizza, box(0.8, 0.02, 0.8, 0xd62d2d), 0, i * 0.3 + 0.15, 0); } scene.add(W.pizza);
  W.bucket = new THREE.Group(); add(W.bucket, cyl(0.7, 0.55, 1.2, 0x1e90ff), 0, 0.6, 0); add(W.bucket, cyl(0.62, 0.62, 0.05, 0xffffff), 0, 1.15, 0); scene.add(W.bucket);
  W.sponge = box(0.8, 0.45, 0.5, 0xffe14d); scene.add(W.sponge);
  W.bubbles = new THREE.Group(); for (let i = 0; i < 26; i++) { const b = sph(0.2 + rnd() * 0.25, mat(0xffffff, { transparent: true, opacity: 0.7, roughness: 0.05 }), null, 10); b.userData = { x: rnd(), y: rnd(), z: rnd(), s: rnd() }; W.bubbles.add(b); } scene.add(W.bubbles);
  W.boxes = new THREE.Group(); for (let i = 0; i < 3; i++) { const b = new THREE.Group(); add(b, box(1.9, 1.3, 1.5, 0xc8955a), 0, 0, 0); add(b, box(1.92, 0.25, 1.52, 0xe8d6a8), 0, 0, 0); add(W.boxes, b, (i % 2) * 0.15, i * 1.32, 0); } scene.add(W.boxes);
  W.bricks = new THREE.Group(); for (let i = 0; i < 6; i++) add(W.bricks, box(1.1, 0.45, 0.55, 0xb5442a), (i % 2) * 0.55 - 0.27, Math.floor(i / 2) * 0.47, (i % 3) * 0.05); scene.add(W.bricks);
  W.shovel = new THREE.Group(); add(W.shovel, box(0.15, 3.6, 0.15, 0x8a5a2e), 0, 1.8, 0); add(W.shovel, box(0.9, 1.1, 0.12, 0x9a9a9a, { metalness: 0.7, roughness: 0.3 }), 0, -0.3, 0); scene.add(W.shovel);
  W.dirtFly = new THREE.Group(); for (let i = 0; i < 18; i++) add(W.dirtFly, box(0.35, 0.3, 0.35, 0x6b4426), 0, 0, 0); W.dirtFly.children.forEach(c => c.userData = { a: rnd() * 6, v: 4 + rnd() * 4, s: rnd() }); scene.add(W.dirtFly);
  // ===== WORK LOT (dig) =====
  const Lt = grp(LOC.lot); add(Lt, box(60, 0.15, 40, 0x8a6a45), 0, 0.07, 0); const hole = cyl(4, 4, 0.2, 0x2a1a0e, 32); add(Lt, hole, 0, 0.16, 0); W.hole = hole;
  add(Lt, cyl(5, 2, 2.5, 0x7a5232, 24), 9, 1.25, -4); add(Lt, cyl(3, 1.5, 1.5, 0x7a5232, 24), -9, 0.75, -6);
  for (let i = 0; i < 3; i++) { const p = new THREE.Group(); for (let j = 0; j < 12; j++) add(p, box(1.1, 0.45, 0.55, 0xb5442a), (j % 3) * 1.15 - 1.15, Math.floor(j / 3) * 0.47 + 0.4, 0); add(p, box(3.6, 0.3, 1.4, 0x8a6a45), 0, 0.15, 0); p.position.set(-14 + i * 4, 0, -8); Lt.add(p); }
  for (let i = 0; i < 4; i++) { const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 12), mat(0xff7a1a)); add(Lt, cone, -18 + i * 12, 0.7, 10); }
  for (const m of [0, 1]) { const mm = mansion(m ? 0xdff1ff : 0xf7d9e8, 0xffffff); mm.position.set(m ? 40 : -40, 0, -50); Lt.add(mm); }
  // ===== POOL BACKYARD =====
  const Pl = grp(LOC.pool); const tile = mat(0xf5f1ea, { roughness: 0.6 });
  add(Pl, box(50, 4, 9, tile), 0, 2, -15.5); add(Pl, box(50, 4, 9, tile), 0, 2, 15.5); add(Pl, box(13, 4, 22, tile), -18.5, 2, 0); add(Pl, box(13, 4, 22, tile), 18.5, 2, 0);
  add(Pl, box(24, 0.2, 22, 0x2f8fd0), 0, 0.15, 0); for (const z of [-11, 11]) add(Pl, box(24, 4, 0.2, 0x4fb3e8), 0, 2, z); for (const x of [-12, 12]) add(Pl, box(0.2, 4, 22, 0x4fb3e8), x, 2, 0);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(24, 22), new THREE.MeshStandardMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.33, roughness: 0.05, metalness: 0.1 })); water.rotation.x = -Math.PI / 2; add(Pl, water, 0, 3.6, 0); W.water = water;
  const mt = mailTruck(); mt.scale.setScalar(0.62); mt.rotation.set(0.05, 0.5, 0.08); add(Pl, mt, -2, 0.25, 1); W.mailTruck = mt;
  const back = mansion(0xfff4e0, 0xffffff); back.rotation.y = Math.PI; back.position.set(0, 4, -32); Pl.add(back);
  for (const x of [-20, 20]) { const p = palm(9); p.position.set(x, 4, -14); Pl.add(p); }
  for (let i = 0; i < 3; i++) { const lc = new THREE.Group(); add(lc, box(2, 0.4, 5, 0xffffff), 0, 0.9, 0); add(lc, box(2, 1.8, 0.4, 0xffffff), 0, 1.6, -2.4); add(lc, box(1.8, 0.2, 4.6, 0xffb3c6), 0, 1.15, 0); lc.position.set(-6 + i * 6, 4, 14); Pl.add(lc); }
  const umb = new THREE.Group(); add(umb, cyl(0.1, 0.1, 5, 0x888888), 0, 2.5, 0); const can = new THREE.Mesh(new THREE.ConeGeometry(3, 1.2, 8), mat(0xff6b6b)); add(umb, can, 0, 5.3, 0); umb.position.set(14, 4, 14); Pl.add(umb);
  // ===== MAYOR OFFICE =====
  const O = grp(LOC.office); const wood = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#6b3b1e' : '#7a4524'; g.fillRect(i * 32, 0, 32, 256); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(i * 32, 0, 2, 256); } }); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 1);
  add(O, box(30, 0.2, 24, 0x8e1b2a), 0, 0.1, 0); const bw = new THREE.Mesh(new THREE.BoxGeometry(30, 14, 0.5), new THREE.MeshStandardMaterial({ map: wood })); bw.receiveShadow = true; add(O, bw, 0, 7, -11);
  add(O, box(0.5, 14, 24, 0x6b3b1e), -15, 7, 0); add(O, box(0.5, 14, 24, 0x6b3b1e), 15, 7, 0);
  add(O, box(10, 7, 0.2, 0x9fd8ff), 9, 7.5, -10.7); add(O, box(10.4, 0.4, 0.4, 0xffffff), 9, 4, -10.6); add(O, box(10.4, 0.4, 0.4, 0xffffff), 9, 11, -10.6);
  for (const x of [-13.8]) { add(O, box(0.2, 7, 2.5, 0x1d4ed8), x + 0.3, 7, -9); }
  const flag = new THREE.Group(); add(flag, cyl(0.08, 0.08, 9, 0xffd700), 0, 4.5, 0); add(flag, box(0.05, 2.6, 3.6, 0x1d4ed8), 0, 7.4, 1.8); add(flag, box(0.06, 0.8, 0.8, 0xffd700), 0, 7.4, 1.8); flag.position.set(-11, 0, -9); O.add(flag);
  const portrait = textPlane('★', 4, 5, { bg: '#1d4ed8', fg: '#ffd700', font: '900 600px Inter', border: '#ffd700' }); add(O, portrait, -4, 9, -10.7);
  const desk = new THREE.Group(); add(desk, box(10, 0.5, 4.5, 0x5a2e14), 0, 3.4, 0); add(desk, box(10, 3.2, 0.4, 0x4a240f), 0, 1.6, 2.1); for (const x of [-4.6, 4.6]) add(desk, box(0.8, 3.2, 4.2, 0x4a240f), x, 1.6, 0);
  add(desk, box(1.4, 0.15, 1.8, 0xf5f5f5), -2.5, 3.72, 0.4); add(desk, cyl(0.35, 0.3, 0.6, 0xffffff), 3, 3.95, -0.8); add(desk, box(2.2, 0.5, 0.6, 0xffd700, { metalness: 0.8, roughness: 0.3 }), 0, 3.9, 1.6);
  desk.position.set(0, 0, -1); O.add(desk);
  W.mchair = new THREE.Group(); add(W.mchair, box(3, 0.7, 3, 0x2a0f08), 0, 2.2, 0); add(W.mchair, box(3, 5.5, 0.7, 0x2a0f08), 0, 4.6, -1.5); add(W.mchair, cyl(0.25, 0.25, 1.8, 0x333333), 0, 1.0, 0); W.mchair.position.set(LOC.office.x, 0, -6.5); scene.add(W.mchair);
  W.tvTex = canvasTex(480, 270, () => {}); const tv = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.06), new THREE.MeshBasicMaterial({ map: W.tvTex })); add(O, box(9.4, 5.4, 0.4, 0x0a0a0a), -6, 8.6, 11.6); tv.rotation.y = Math.PI; add(O, tv, -6, 8.6, 11.35); add(O, box(0.5, 14, 0.4, 0x6b3b1e), -6, 7, 11.9);
  add(O, box(30, 14, 0.5, 0x6b3b1e), 0, 7, 12.2);
  W.drawTV = (t) => { const { g, canvas } = W.tvTex.userData; const w = canvas.width, h = canvas.height; g.fillStyle = '#6ec6ff'; g.fillRect(0, 0, w, h); g.fillStyle = '#3cb54f'; g.fillRect(0, h * 0.62, w, h); g.fillStyle = '#555'; g.beginPath(); g.moveTo(w * 0.42, h * 0.62); g.lineTo(w * 0.58, h * 0.62); g.lineTo(w * 0.95, h); g.lineTo(w * 0.05, h); g.fill();
    g.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { const y = h * 0.62 + ((t * 120 + i * 30) % 110); g.fillRect(w / 2 - 3, y, 6, 10 + (y - h * 0.62) * 0.2); }
    const x = w / 2 + Math.sin(t * 2.3) * 60; g.fillStyle = '#d62d2d'; g.fillRect(x - 40, h * 0.8, 80, 30); g.fillStyle = '#111'; g.fillRect(x - 45, h * 0.88, 18, 14); g.fillRect(x + 27, h * 0.88, 18, 14);
    g.fillStyle = '#ffd60a'; g.font = '900 30px Inter'; g.textAlign = 'left'; g.fillText('LAP 3/3', 14, 36); tex2(); };
  const tex2 = () => { W.tvTex.needsUpdate = true; };
  W.officeLight = new THREE.PointLight(0xffe2b0, 0, 50, 1.4); W.officeLight.position.set(LOC.office.x, 11, 2); scene.add(W.officeLight);
  // ===== GRANDMA'S MANSION (night) =====
  const G = grp(LOC.gm); const gmn = mansion(0xfff176, 0xffffff, { night: true }); gmn.position.set(0, 0, -20); G.add(gmn); W.gmMansion = gmn;
  add(G, box(6, 0.2, 40, 0xd8cfc0), 0, 0.1, 6); add(G, box(200, 0.1, 10, 0x3f4249), 0, 0.05, 30);
  W.gmLamps = []; for (const z of [-2, 10, 20]) for (const sx of [-1, 1]) { const lp = new THREE.Group(); add(lp, cyl(0.15, 0.2, 5, 0x222222), 0, 2.5, 0); add(lp, sph(0.45, emis(0xffe9a8, 2.5)), 0, 5.2, 0); lp.position.set(sx * 4.5, 0, z); G.add(lp); }
  for (const z of [-6, 2, 8, 14, 22]) for (const sx of [-1, 1]) { const b = bushBall(1.5); b.position.set(sx * 7, 0, z); G.add(b); }
  for (const x of [-30, 30]) { const p = palm(10); p.position.set(x, 0, 0); G.add(p); }
  W.gmLight = new THREE.PointLight(0xffd27a, 0, 60, 1.2); W.gmLight.position.set(LOC.gm.x, 9, 2); scene.add(W.gmLight);
  W.gmLight2 = new THREE.PointLight(0xffd27a, 0, 40, 1.3); W.gmLight2.position.set(LOC.gm.x, 5, 18); scene.add(W.gmLight2);
  W.stars2 = new THREE.Group(); for (let i = 0; i < 220; i++) { const st = new THREE.Mesh(new THREE.SphereGeometry(0.35 + rnd() * 0.4, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); const a = rnd() * Math.PI - Math.PI / 2, e = 0.12 + rnd() * 1.2; st.position.set(Math.sin(a) * 240 * Math.cos(e), 240 * Math.sin(e), -Math.cos(a) * 240 * Math.cos(e)); W.stars2.add(st); } scene.add(W.stars2);
  W.moon2 = new THREE.Mesh(new THREE.SphereGeometry(10, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); scene.add(W.moon2);
  // bush disguise
  W.bushSuit = new THREE.Group(); for (let i = 0; i < 12; i++) { const b = sph(1.0 + rnd() * 0.5, mat([0x3e9e3a, 0x4bb043, 0x358a33][i % 3], { roughness: 0.95 }), null, 12); const a = i / 12 * Math.PI * 2; b.position.set(Math.cos(a) * 1.3, 2.6 + (i % 4) * 1.0, Math.sin(a) * 1.1); W.bushSuit.add(b); } add(W.bushSuit, sph(1.6, mat(0x3e9e3a, { roughness: 0.95 }), null, 12), 0, 7.0, 0); scene.add(W.bushSuit);
  for (let i = 0; i < 6; i++) { const l = box(0.6, 0.1, 0.3, 0x2f7a2a); l.position.set(Math.cos(i) * 1.8, 7.8 + (i % 2) * 0.4, Math.sin(i) * 1.6); l.rotation.set(i, i * 2, 0.5); W.bushSuit.add(l); }
  // ===== ADMIN ROOM (inside grandma's window facade at LOC.gwin) =====
  const A = W.gwinG; const kinds = adminScreens();
  add(A, box(13, 0.4, 3.4, 0x1a1a22), 0, 3.0, -6.0); for (const x of [-6, 6]) add(A, box(0.4, 3, 3, 0x14141a), x, 1.5, -6.0);
  add(A, box(12.5, 0.12, 0.15, emis(0xb04cff, 2.5)), 0, 2.75, -4.35);
  kinds.forEach((k, i) => { const x = (i % 3 - 1) * 4.1, y = 5.3 + Math.floor(i / 3) * 2.5; add(A, box(4.0, 2.4, 0.25, 0x050505), x, y, -6.9); const tex = canvasTex(300, 180, () => {}); const m = new THREE.Mesh(new THREE.PlaneGeometry(3.75, 2.2), new THREE.MeshBasicMaterial({ map: tex })); add(A, m, x, y, -6.76); m.userData = { tex, k }; W.adm.push(m); });
  add(A, box(0.3, 3.4, 0.3, 0x222222), 0, 4.6, -7.4);
  add(A, box(3.6, 0.1, 1.3, 0x222222), 0, 3.25, -5.2); W.kbGlow = add(A, box(3.4, 0.04, 1.1, emis(0x00e5ff, 1.2)), 0, 3.32, -5.2);
  W.achair = new THREE.Group(); const pur = mat(0x7b3fb0, { roughness: 0.5 }); add(W.achair, box(3, 0.6, 3, pur), 0, 2.2, 0); add(W.achair, box(3, 2.4, 0.6, pur), 0, 3.6, -1.4); add(W.achair, box(2.2, 0.4, 0.5, 0xffc629), 0, 4.9, -1.3); add(W.achair, cyl(0.25, 0.25, 1.6, 0x333333), 0, 1.1, 0); add(W.achair, box(3, 0.2, 0.3, 0x333333), 0, 0.3, 0);
  W.achair.position.set(LOC.gwin.x, 0.3, -2.4); scene.add(W.achair);
  W.adoor = new THREE.Group(); W.adoor.position.set(LOC.gwin.x - 9.6, 0.3, -0.6); const dm = box(0.25, 6.5, 3.2, 0x7a4a24); dm.position.set(0, 3.25, -1.6); W.adoor.add(dm); scene.add(W.adoor);
  W.admLight = new THREE.PointLight(0x9a7aff, 0, 30, 1.2); W.admLight.position.set(LOC.gwin.x, 6, -3.5); scene.add(W.admLight);
  // ===== AIRFIELD + new mansion =====
  const Ai = grp(LOC.air); add(Ai, box(120, 0.12, 30, 0x55585f), 0, 0.06, 0); for (let x = -50; x < 60; x += 10) add(Ai, box(5, 0.14, 0.6, 0xffffff), x, 0.08, 0);
  W.jet = jet(); W.jet.position.set(LOC.air.x, 0, -2); scene.add(W.jet);
  const mm = mansion(0xfff176, 0xffffff); mm.position.set(-20, 0, -60); Ai.add(mm);
  // ===== BAKERY: luxury upgrade + exterior =====
  const B = W.bakery; const gold = GOLD();
  for (const x of [-10, 10]) { const ch = new THREE.Group(); add(ch, cyl(0.05, 0.05, 2, 0xffc629), 0, 1, 0); add(ch, cyl(1.6, 0.6, 0.8, gold), 0, -0.2, 0); for (let i = 0; i < 6; i++) add(ch, sph(0.22, emis(0xfff2c0, 2.5)), Math.cos(i) * 1.4, 0.2, Math.sin(i) * 1.4); add(B, ch, x, 10.2, 2); }
  for (const x of [-12, -5]) { const tb = new THREE.Group(); add(tb, cyl(1.5, 1.5, 0.2, gold, 24), 0, 2.8, 0); add(tb, cyl(0.25, 0.4, 2.8, gold), 0, 1.4, 0); for (const sx of [-1, 1]) { add(tb, box(1.4, 0.3, 1.4, gold), sx * 2.3, 1.7, 0); add(tb, box(1.4, 2.0, 0.25, gold), sx * 2.3, 2.8, sx * -0.0 - 0.6); } add(B, tb, x, 0.12, 4); }
  add(B, box(14.3, 0.35, 3.3, gold), 4, 3.5, -2); add(B, box(36, 0.5, 0.3, gold), 0, 11.5, -8.6);
  W.throne = new THREE.Group(); add(W.throne, box(3.2, 0.7, 3, gold), 0, 1.8, 0); add(W.throne, box(3.2, 6, 0.6, gold), 0, 4.3, -1.3); add(W.throne, box(0.5, 1.6, 3, gold), 1.6, 2.6, 0); add(W.throne, box(0.5, 1.6, 3, gold), -1.6, 2.6, 0); add(W.throne, box(2.4, 0.3, 2.4, 0xd62d2d), 0, 2.2, 0); add(W.throne, sph(0.4, mat(0xd62d2d)), 0, 7.4, -1.3); W.throne.position.set(LOC.bakery.x - 6, 0.12, -4); W.throne.rotation.y = 0.45; scene.add(W.throne);
  const BX = grp(LOC.bex); add(BX, box(300, 0.1, 10, 0x3f4249), 0, 0.04, 16); add(BX, box(300, 0.35, 6, 0xe9e4da), 0, 0.17, 8);
  add(BX, box(30, 14, 4, 0xffe3c2), 0, 7, -2); add(BX, box(30.5, 1.2, 4.5, 0xffc629, { metalness: 0.8, roughness: 0.3 }), 0, 14.4, -2);
  const aw = prism(16, 2, 0.5, 0xd62d2d); aw.rotation.x = -Math.PI / 2; for (let i = 0; i < 2; i++) { const a2 = box(13, 0.4, 3.5, i ? 0xffffff : 0xd62d2d); a2.rotation.x = 0.35; add(BX, a2, i ? 7 : -7, 9.4, 1.4); }
  add(BX, textPlane("BOB'S BAKERY", 16, 2.6, { bg: '#7a3e1d', fg: '#ffd700', font: '900 140px Inter' }), 0, 11.8, 0.05);
  add(BX, box(3.4, 6.2, 0.3, 0xffc629, { metalness: 0.8, roughness: 0.3 }), 0, 3.1, 0.05); for (const x of [-9, 9]) { add(BX, box(7, 5, 0.2, 0x9fd8ff), x, 4.4, 0.05); add(BX, box(7.4, 0.4, 0.5, 0xffffff), x, 1.8, 0.2); for (let j = 0; j < 4; j++) { const l = loaf(); l.scale.setScalar(0.7); add(BX, l, x - 2.4 + j * 1.6, 2.4, 0.5); } }
  for (const x of [-22, 22]) { const m = mansion(0xf0e4ff, 0xffffff); m.position.set(x * 2.2, 0, -16); m.scale.setScalar(0.9); BX.add(m); }
  for (const x of [-14, 14]) { const p = palm(9); p.position.set(x + 2, 0, 6); BX.add(p); }
  // ===== LAWN (work montage) =====
  const Lw = grp(LOC.lawn); const lm = mansion(0xf7d9e8, 0xffffff); lm.position.set(0, 0, -34); Lw.add(lm);
  add(Lw, box(300, 0.1, 10, 0x3f4249), 0, 0.04, 14); for (let x = -140; x < 150; x += 8) add(Lw, box(3.5, 0.12, 0.35, 0xffffff), x, 0.07, 14); add(Lw, box(300, 0.35, 5, 0xe9e4da), 0, 0.17, 7);
  add(Lw, box(8, 0.2, 26, 0xbdb7ad), 22, 0.1, -8);
  const stripe = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#6cc04f' : '#7fd35e'; g.fillRect(i * 32, 0, 32, 256); } }); stripe.wrapS = stripe.wrapT = THREE.RepeatWrapping; stripe.repeat.set(3, 1);
  const lawnM = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), new THREE.MeshStandardMaterial({ map: stripe, roughness: 0.95 })); lawnM.rotation.x = -Math.PI / 2; lawnM.receiveShadow = true; add(Lw, lawnM, -6, 0.03, -4);
  for (let i = 0; i < 6; i++) { const h = box(5, 1.5, 1.5, 0x2f8a35); add(Lw, h, -28 + i * 6, 0.75, 4.2); }
  for (const x of [-34, 34]) { const p = palm(9); p.position.set(x, 0, 2); Lw.add(p); }
  for (const x of [-60, 60]) { const m = mansion(x > 0 ? 0xdff1ff : 0xfff4e0, 0xffffff); m.position.set(x, 0, -34); Lw.add(m); }
  for (const x of [-30, 30]) { const m = mansion(0xe9ffe9, 0xffffff); m.position.set(x, 0, 44); m.rotation.y = Math.PI; Lw.add(m); }
  return W;
}
