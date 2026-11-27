import { THREE, scene, box, cyl, sph, mat, at, canvasTex, textPlane } from './core.js';

export const LOC = { town: new THREE.Vector3(0, 0, 0), court: new THREE.Vector3(300, 0, 0), bakery: new THREE.Vector3(500, 0, 0), garage: new THREE.Vector3(600, 0, 0), party: new THREE.Vector3(700, 0, 0), home: new THREE.Vector3(800, 0, 0), square: new THREE.Vector3(-200, 0, 0) };
export const W = {}; // named objects

const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
function add(parent, o, x, y, z) { o.position.set(x, y, z); parent.add(o); return o; }
function grp(at) { const g = new THREE.Group(); g.position.copy(at); scene.add(g); return g; }

// ---------- generic props ----------
export function tree(s = 1) {
  const g = new THREE.Group();
  add(g, box(0.9, 4, 0.9, 0x7a4f2a), 0, 2, 0);
  const c = [0x3f9e3a, 0x4bb043, 0x358a33][Math.floor(rnd() * 3)];
  add(g, box(4.2, 2.6, 4.2, c), 0, 4.8, 0); add(g, box(3, 1.6, 3, c), 0, 6.6, 0);
  g.scale.setScalar(s); return g;
}
export function house(color, roof, o = {}) {
  const g = new THREE.Group();
  const w = o.w || 12, d = o.d || 10, h = o.h || 7;
  add(g, box(w, h, d, color), 0, h / 2, 0);
  const r = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.78, 4.5, 4), mat(roof)); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); r.castShadow = true; add(g, r, 0, h + 2.25, 0);
  add(g, box(2.2, 4, 0.3, 0x6b4226), o.doorX ?? 0, 2, d / 2 + 0.1);
  add(g, sph(0.15, 0xffd34d), (o.doorX ?? 0) + 0.7, 2, d / 2 + 0.3);
  const wins = [];
  for (const x of o.winX || [-3.5, 3.5]) { add(g, box(2.6, 2.4, 0.4, 0xffffff), x, 4, d / 2); const wn = box(2.2, 2.0, 0.42, mat(0x9fd8ff, { roughness: 0.05, metalness: 0.3 })); add(g, wn, x, 4, d / 2 + 0.02); wins.push(wn); }
  g.userData.wins = wins;
  return g;
}
export function hoop(o = {}) { // rim center at local (0, 8.3, 0) facing -x (pole on +x side)
  const g = new THREE.Group();
  add(g, cyl(0.25, 0.25, 9.5, 0x666a70), 2.6, 4.75, 0);
  add(g, box(2.4, 0.25, 0.25, 0x666a70), 1.4, 9.4, 0);
  const bb = box(0.15, 3.4, 5.6, mat(0xffffff, { transparent: true, opacity: 0.9 })); add(g, bb, 0.85, 9.6, 0);
  add(g, box(0.17, 1.3, 1.8, mat(0xff4a2e)), 0.84, 9.0, 0).scale.set(1, 1, 1);
  add(g, box(0.18, 1.1, 1.5, 0xffffff), 0.84, 9.0, 0);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.07, 10, 32), mat(0xff5a1f, { metalness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.castShadow = true; add(g, rim, 0, 8.3, 0);
  const net = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.55, 1.3, 16, 3, true), new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true })); add(g, net, 0, 7.6, 0);
  g.userData.rim = rim; g.userData.net = net;
  return g;
}
function courtTex() {
  return canvasTex(2048, 1152, (g, Wd, Ht) => {
    g.fillStyle = '#2f6fb3'; g.fillRect(0, 0, Wd, Ht);
    g.fillStyle = '#3c8d4e'; g.fillRect(70, 70, Wd - 140, Ht - 140);
    g.fillStyle = '#c2482f'; g.fillRect(70, Ht / 2 - 170, 330, 340); g.fillRect(Wd - 400, Ht / 2 - 170, 330, 340);
    g.strokeStyle = '#ffffff'; g.lineWidth = 12;
    g.strokeRect(70, 70, Wd - 140, Ht - 140);
    g.beginPath(); g.moveTo(Wd / 2, 70); g.lineTo(Wd / 2, Ht - 70); g.stroke();
    g.beginPath(); g.arc(Wd / 2, Ht / 2, 150, 0, Math.PI * 2); g.stroke();
    for (const s of [0, 1]) {
      const x0 = s ? Wd - 70 : 70, dir = s ? -1 : 1;
      g.strokeRect(s ? Wd - 400 : 70, Ht / 2 - 170, 330, 340);
      g.beginPath(); g.arc(x0 + dir * 330, Ht / 2, 150, s ? Math.PI / 2 : -Math.PI / 2, s ? Math.PI * 1.5 : Math.PI / 2); g.stroke();
      g.beginPath(); g.moveTo(x0, 130); g.lineTo(x0 + dir * 300, 130); g.arc(x0 + dir * 120, Ht / 2, 450, s ? -Math.PI / 2 - 0.9 : -Math.PI / 2 + 0.9 - 0.9, 0, false); g.stroke();
    }
    // 3pt arcs (clean redraw)
    g.lineWidth = 12;
    for (const s of [0, 1]) {
      const cx = s ? Wd - 160 : 160; g.beginPath();
      if (!s) g.arc(cx, Ht / 2, 440, -Math.PI / 2 + 0.2, Math.PI / 2 - 0.2); else g.arc(cx, Ht / 2, 440, Math.PI / 2 + 0.2, Math.PI * 1.5 - 0.2);
      g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,0.85)'; g.font = '900 120px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.save(); g.translate(Wd / 2, Ht / 2); g.fillText('HOOPSVILLE', 0, 0); g.restore();
  });
}

// ---------- vehicles ----------
export function suv() {
  const g = new THREE.Group(); const k = mat(0x0c0c10, { roughness: 0.15, metalness: 0.6 }); const gl = mat(0x1a2230, { roughness: 0.05, metalness: 0.8 });
  add(g, box(11, 2.6, 5.2, k), 0, 2.1, 0); add(g, box(7.6, 2.2, 4.9, k), -0.9, 4.4, 0);
  add(g, box(7.0, 1.7, 5.0, gl), -0.9, 4.5, 0); add(g, box(0.2, 1.6, 4.6, gl), 2.85, 4.5, 0);
  for (const [x, z] of [[3.6, 2.5], [3.6, -2.5], [-3.6, 2.5], [-3.6, -2.5]]) { const w = cyl(1.25, 1.25, 0.9, 0x111111, 24); w.rotation.x = Math.PI / 2; add(g, w, x, 1.25, z); const hc = cyl(0.6, 0.6, 0.95, mat(0xcccccc, { metalness: 0.9, roughness: 0.2 }), 16); hc.rotation.x = Math.PI / 2; add(g, hc, x, 1.25, z); }
  add(g, box(0.2, 0.6, 1.2, mat(0xffffee, { emissive: 0xffffcc, emissiveIntensity: 1 })), 5.5, 2.6, 1.8); add(g, box(0.2, 0.6, 1.2, mat(0xffffee, { emissive: 0xffffcc, emissiveIntensity: 1 })), 5.5, 2.6, -1.8);
  add(g, box(0.25, 1.0, 3.0, mat(0x333333, { metalness: 0.8 })), 5.55, 2.2, 0);
  const door = new THREE.Group(); door.position.set(-0.5, 0, 2.6); const dm = box(3.2, 4.2, 0.2, k); dm.position.set(-1.6, 3.2, 0); door.add(dm); g.add(door); g.userData.door = door;
  return g;
}
export function sportsCar() {
  const g = new THREE.Group(); const red = mat(0xe01b24, { roughness: 0.15, metalness: 0.5 });
  add(g, box(10, 1.4, 4.6, red), 0, 1.5, 0); add(g, box(3.6, 0.6, 4.4, red), 3.0, 2.4, 0); add(g, box(1.6, 0.8, 4.4, red), -4.2, 2.5, 0);
  const ws = box(0.2, 1.3, 4.0, mat(0x223344, { roughness: 0.05, metalness: 0.8 })); ws.rotation.z = 0.6; add(g, ws, 0.9, 2.8, 0);
  add(g, box(3.4, 0.5, 3.4, 0x222222), -1.5, 2.3, 0);
  add(g, box(0.4, 0.3, 4.8, 0x111111), -4.9, 3.0, 0);
  for (const [x, z] of [[3.3, 2.3], [3.3, -2.3], [-3.2, 2.3], [-3.2, -2.3]]) { const w = cyl(1.0, 1.0, 0.8, 0x111111, 24); w.rotation.x = Math.PI / 2; add(g, w, x, 1.0, z); const hc = cyl(0.5, 0.5, 0.85, mat(0xffd700, { metalness: 0.9, roughness: 0.2 }), 12); hc.rotation.x = Math.PI / 2; add(g, hc, x, 1.0, z); }
  return g;
}

// ---------- small props ----------
export function pkg() { const g = new THREE.Group(); add(g, box(1.4, 1.0, 1.0, 0xc8955a), 0, 0, 0); add(g, box(1.42, 0.2, 1.02, 0xe8d6a8), 0, 0, 0); add(g, box(0.4, 1.02, 1.02, 0xe8d6a8), 0, 0, 0); return g; }
export function loaf() { const g = new THREE.Group(); const b = sph(0.6, 0xd99a45, { roughness: 0.6 }); b.scale.set(1.9, 0.75, 0.9); g.add(b); for (let i = -1; i <= 1; i++) { const c = box(0.12, 0.1, 0.7, 0xf3d29a); c.position.set(i * 0.45, 0.4, 0); c.rotation.y = 0.5; g.add(c); } return g; }
export function cookie() { const g = new THREE.Group(); const c = cyl(0.42, 0.42, 0.12, 0xc98b4a, 20); g.add(c); for (let i = 0; i < 6; i++) { const ch = box(0.1, 0.06, 0.1, 0x3a1f0e); ch.position.set(Math.cos(i * 1.1) * 0.25, 0.07, Math.sin(i * 1.1) * 0.25); g.add(ch); } return g; }
export function dumbbell() { const g = new THREE.Group(); const h = cyl(0.05, 0.05, 0.55, 0x999999, 10); h.rotation.z = Math.PI / 2; g.add(h); for (const s of [-1, 1]) { const w = cyl(0.13, 0.13, 0.12, 0xff6fb5, 14); w.rotation.z = Math.PI / 2; w.position.x = s * 0.25; g.add(w); } return g; }
export function trophy() { const g = new THREE.Group(); const gold = mat(0xffcc33, { metalness: 0.85, roughness: 0.25 }); add(g, box(1.2, 0.5, 1.2, 0x3a2a1a), 0, 0.25, 0); add(g, cyl(0.15, 0.3, 0.9, gold), 0, 0.95, 0); add(g, cyl(0.85, 0.35, 1.4, gold, 24), 0, 2.1, 0); for (const s of [-1, 1]) { const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.08, 8, 20), gold); hdl.position.set(s * 0.9, 2.2, 0); hdl.rotation.y = 0; g.add(hdl); } add(g, sph(0.35, gold), 0, 3.0, 0); return g; }
export function phone() {
  const g = new THREE.Group(); add(g, box(0.9, 1.7, 0.1, 0x111111), 0, 0, 0);
  const tex = canvasTex(256, 480, () => {}); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.55), new THREE.MeshBasicMaterial({ map: tex })); scr.position.z = 0.06; g.add(scr);
  g.userData.draw = (t) => { const { g: c, canvas } = tex.userData; const Wd = canvas.width, Ht = canvas.height;
    c.fillStyle = '#5a2a8a'; c.fillRect(0, 0, Wd, Ht); c.fillStyle = '#ff4fa0'; for (let i = 0; i < 6; i++) { c.globalAlpha = 0.3; c.beginPath(); c.arc((i * 60 + t * 200) % Wd, 80 + i * 50, 30, 0, 7); c.fill(); } c.globalAlpha = 1;
    const x = Wd / 2, y = 260, b = t * 8; c.fillStyle = '#d62d2d'; c.save(); c.translate(x, y); c.rotate(Math.sin(b) * 0.25); c.fillRect(-30, -40, 60, 70); c.fillStyle = '#f2c9a0'; c.fillRect(-22, -82, 44, 40);
    c.fillStyle = '#d62d2d'; c.save(); c.translate(-30, -36); c.rotate(-2 + Math.sin(b) * 0.9); c.fillRect(-10, 0, 20, 55); c.restore(); c.save(); c.translate(30, -36); c.rotate(2 - Math.sin(b) * 0.9); c.fillRect(-10, 0, 20, 55); c.restore();
    c.fillStyle = '#1a1a1a'; c.fillRect(-30, 30, 26, 60 + Math.sin(b) * 8); c.fillRect(4, 30, 26, 60 - Math.sin(b) * 8); c.restore();
    c.fillStyle = '#fff'; c.font = '900 34px Inter'; c.textAlign = 'center'; c.fillText('BEN DANCING', Wd / 2, 400); c.font = '700 30px Inter'; c.fillStyle = '#ffd34d'; c.fillText('12.4M views', Wd / 2, 440); tex.needsUpdate = true; };
  g.userData.draw(0); return g;
}
export function mascotHead() {
  const g = new THREE.Group(); const y = mat(0xffcf2e, { roughness: 0.9 });
  const h = sph(1.25, y); h.scale.set(1, 1.05, 1); g.add(h);
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 12), y); ear.position.set(s * 0.8, 1.15, 0); ear.rotation.z = -s * 0.4; ear.castShadow = true; g.add(ear);
    const e = sph(0.38, 0xffffff); e.position.set(s * 0.45, 0.25, 1.0); g.add(e); const p = sph(0.18, 0x111111); p.position.set(s * 0.45, 0.25, 1.33); g.add(p); }
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.8, 12), mat(0xff7a1a)); beak.rotation.x = Math.PI / 2; beak.position.set(0, -0.2, 1.4); g.add(beak);
  const sm = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.07, 8, 20, Math.PI), mat(0x7a2a10)); sm.rotation.z = Math.PI; sm.position.set(0, -0.55, 1.15); g.add(sm);
  return g;
}
export function mascotBody() { const g = new THREE.Group(); const y = mat(0xffcf2e, { roughness: 0.9 }); const b = box(2.3, 2.2, 1.3, y); b.position.y = 1; g.add(b); const bel = box(1.4, 1.5, 0.1, 0xfff2b0); bel.position.set(0, 0.9, 0.66); g.add(bel); return g; }
export function contract() { return textPlane('CONTRACT\n$100,000\nMASCOT', 1.6, 2.1, { bg: '#fffdf2', fg: '#1a1a1a', font: '900 130px Inter', border: '#1a7f3a' }); }
function confetti(n, spread) {
  const g = new THREE.Group(); const cols = [0xff4757, 0xffd32a, 0x2ed573, 0x1e90ff, 0xff6bcb];
  for (let i = 0; i < n; i++) { const c = box(0.25, 0.04, 0.12, cols[i % 5]); c.castShadow = false; c.userData = { x: (rnd() - 0.5) * spread, z: (rnd() - 0.5) * spread, y0: 6 + rnd() * 8, sp: 1 + rnd() * 2, r: rnd() * 6 }; g.add(c); }
  g.update = g.userData.update = (t) => g.children.forEach(c => { const u = c.userData; c.position.set(u.x + Math.sin(t * 2 + u.r) * 0.5, ((u.y0 - t * u.sp) % 14 + 14) % 14, u.z); c.rotation.set(t * 3 + u.r, t * 2, u.r); });
  return g;
}

// ---------- build everything ----------
export function buildWorld() {
  // global ground
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), mat(0x74c25a, { roughness: 0.9 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // ===== TOWN =====
  const T = grp(LOC.town); W.town = T;
  const road = box(400, 0.1, 9, 0x4a4d55, { roughness: 0.9 }); add(T, road, 0, 0.03, 0); road.castShadow = false;
  for (let x = -190; x < 200; x += 8) { const l = box(3.5, 0.12, 0.35, 0xf5e26b); l.castShadow = false; add(T, l, x, 0.06, 0); }
  for (const z of [-6.5, 6.5]) { const sw = box(400, 0.35, 4, 0xd9d6cf, { roughness: 0.85 }); sw.castShadow = false; add(T, sw, 0, 0.17, z); }
  const HC = [[0xff8a80, 0x8e3b3b], [0x80d8ff, 0x2c5e8a], [0xfff176, 0xa0522d], [0xa5d6a7, 0x3e6b3f], [0xce93d8, 0x5b2f6b], [0xffcc80, 0x8a4b20], [0x90caf9, 0x37474f], [0xf48fb1, 0x7b2d4b]];
  W.houses = [];
  for (let i = 0; i < 14; i++) for (const side of [-1, 1]) {
    const x = -90 + i * 15, [c, r] = HC[(i * 2 + (side > 0 ? 1 : 0)) % HC.length];
    const h = house(c, r, {}); h.position.set(x, 0, side * 18); h.rotation.y = side > 0 ? Math.PI : 0; T.add(h); W.houses.push(h);
    add(T, box(3.5, 0.12, 8, 0xc9c5bd), x + 4, 0.06, side * 10.5);
    if ((i + (side > 0)) % 3 === 0) { const hp = hoop(); hp.scale.setScalar(0.85); hp.position.set(x + 4, 0, side * 13.6); hp.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2; T.add(hp); }
    if (i % 2) { const t = tree(0.9 + rnd() * 0.3); t.position.set(x + 7, 0, side * 9.5); T.add(t); }
    const mb = new THREE.Group(); add(mb, box(0.2, 2.4, 0.2, 0x555555), 0, 1.2, 0); add(mb, box(0.7, 0.6, 1.1, 0x2a62c9), 0, 2.6, 0); mb.position.set(x - 5, 0, side * 9); T.add(mb);
  }
  W.targetHouse = W.houses[2 * 6]; // i=6 side -1 at x=0,z=-18
  for (let i = 0; i < 26; i++) { const t = tree(1.3 + rnd()); t.position.set(-120 + rnd() * 240, 0, -34 - rnd() * 40); T.add(t); const t2 = tree(1.3 + rnd()); t2.position.set(-120 + rnd() * 240, 0, 34 + rnd() * 40); T.add(t2); }
  for (let i = 0; i < 9; i++) { const h = sph(30 + rnd() * 20, mat(0x5fae4a, { roughness: 1 }), null, 24); h.scale.y = 0.45; h.position.set(-200 + i * 50, -4, -110 - rnd() * 30); T.add(h); h.castShadow = false; }
  for (let i = 0; i < 6; i++) { const h = sph(30 + rnd() * 20, mat(0x5fae4a, { roughness: 1 }), null, 24); h.scale.y = 0.45; h.position.set(-150 + i * 60, -4, 120 + rnd() * 20); T.add(h); h.castShadow = false; }
  // glass shards (hidden until crash)
  W.shards = new THREE.Group(); T.add(W.shards);
  for (let i = 0; i < 26; i++) { const s = box(0.2 + rnd() * 0.3, 0.2 + rnd() * 0.3, 0.05, mat(0xbfe9ff, { roughness: 0.05, metalness: 0.5, transparent: true, opacity: 0.8 })); s.userData = { v: new THREE.Vector3((rnd() - 0.5) * 6, rnd() * 6, (rnd() - 0.2) * 5), r: rnd() * 10 }; W.shards.add(s); }

  // ===== COURT =====
  const K = grp(LOC.court); W.court = K;
  const asphalt = box(90, 0.1, 60, 0x55585e, { roughness: 0.95 }); asphalt.castShadow = false; add(K, asphalt, 0, 0.04, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(64, 36), new THREE.MeshStandardMaterial({ map: courtTex(), roughness: 0.55 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; add(K, floor, 0, 0.1, 0);
  W.hoopA = hoop(); W.hoopA.position.set(28, 0, 0); K.add(W.hoopA); // rim center world: court + (28,8.3,0)
  W.hoopB = hoop(); W.hoopB.position.set(-28, 0, 0); W.hoopB.rotation.y = Math.PI; K.add(W.hoopB);
  // fence
  const fenceTex = canvasTex(256, 256, (g) => { g.clearRect(0, 0, 256, 256); g.strokeStyle = '#c8ccd2'; g.lineWidth = 5; for (let i = -256; i < 512; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 256, 256); g.stroke(); g.beginPath(); g.moveTo(i + 256, 0); g.lineTo(i, 256); g.stroke(); } });
  fenceTex.wrapS = fenceTex.wrapT = THREE.RepeatWrapping; fenceTex.repeat.set(30, 4);
  const fm = new THREE.MeshStandardMaterial({ map: fenceTex, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
  for (const [x, z, ry, len] of [[0, -27, 0, 88], [44, 0, Math.PI / 2, 54], [-44, 0, Math.PI / 2, 54]]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(len, 9), fm); f.position.set(x, 4.5, z); f.rotation.y = ry; K.add(f); }
  for (let x = -44; x <= 44; x += 11) add(K, cyl(0.15, 0.15, 9, 0x8a8f96), x, 4.5, -27);
  // tournament dressing
  W.tourney = new THREE.Group(); K.add(W.tourney);
  for (let r = 0; r < 4; r++) { const b = box(50, 0.5, 2.2, 0x9aa3ad); b.position.set(0, 0.8 + r * 1.2, -21 - r * 2.2); W.tourney.add(b); const bk = box(50, 0.8 + r * 1.2, 0.4, 0x7d8590); bk.position.set(0, (0.8 + r * 1.2) / 2, -20 - r * 2.2); W.tourney.add(bk); }
  W.banner = textPlane('HOOPSVILLE TOURNAMENT', 30, 4, { bg: '#ffcf2e', fg: '#1b1b1b', font: '900 104px Inter', border: '#e0452b' }); W.banner.position.set(0, 13, -26.5); W.tourney.add(W.banner);
  add(W.tourney, box(0.4, 13, 0.4, 0x555555), -15, 6.5, -26.7); add(W.tourney, box(0.4, 13, 0.4, 0x555555), 15, 6.5, -26.7);
  W.finalsBanner = textPlane('THE FINALS', 20, 4, { bg: '#1b1b1b', fg: '#ffd700', font: '900 150px Inter', border: '#ffd700' }); W.finalsBanner.position.set(0, 13, -26.4); W.tourney.add(W.finalsBanner);
  // scoreboard
  W.scoreTex = canvasTex(640, 320, () => {}); const sb = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), new THREE.MeshBasicMaterial({ map: W.scoreTex })); sb.position.set(-30, 12, -26.2); W.tourney.add(sb);
  add(W.tourney, box(8.6, 4.6, 0.4, 0x111111), -30, 12, -26.5); add(W.tourney, box(0.4, 10, 0.4, 0x333333), -30, 5, -26.6);
  W.setScore = (a, b, clock, lbl = 'ALEX  GRANDMA') => { const { g, canvas } = W.scoreTex.userData; g.fillStyle = '#0a0a0a'; g.fillRect(0, 0, 640, 320); g.textAlign = 'center'; g.fillStyle = '#ff3b30'; g.font = '900 130px Inter'; g.fillText(a, 150, 200); g.fillText(b, 490, 200); g.fillStyle = '#ffd60a'; g.font = '900 90px Inter'; g.fillText(clock, 320, 190); g.fillStyle = '#fff'; g.font = '800 40px Inter'; g.fillText('ALEX', 150, 290); g.fillText('GRANDMA', 490, 290); W.scoreTex.needsUpdate = true; };
  W.setScore(20, 20, '0:03');
  // Rudy's chair & table
  W.chair = new THREE.Group(); add(W.chair, box(1.8, 0.25, 1.8, 0x222222), 0, 1.5, 0); for (const [x, z] of [[0.8, 0.8], [-0.8, 0.8], [0.8, -0.8], [-0.8, -0.8]]) add(W.chair, box(0.15, 1.5, 0.15, 0x888888), x, 0.75, z); add(W.chair, box(1.8, 1.8, 0.2, 0x222222), 0, 2.5, -0.9);
  W.chair.position.set(10, 0, -19.5); K.add(W.chair);
  const tbl = new THREE.Group(); add(tbl, box(5, 0.3, 2, 0xffffff), 0, 2.4, 0); add(tbl, box(5, 2.2, 0.1, 0x1d4ed8), 0, 1.25, 0.95); tbl.position.set(10, 0, -16.6); W.tourney.add(tbl);
  for (const [bx, bz] of [[12, 20.0], [-12, 20.0]]) { const bn = new THREE.Group(); add(bn, box(7, 0.35, 1.6, 0x2a5bd7), 0, 1.35, 0); for (const lx of [-3, 3]) add(bn, box(0.3, 1.3, 1.2, 0x555555), lx, 0.65, 0); bn.position.set(bx, 0, bz - 0.6); W.tourney.add(bn); }
  W.lamp = new THREE.Group(); add(W.lamp, cyl(0.2, 0.25, 14, 0x333333), 0, 7, 0); add(W.lamp, box(2.5, 0.4, 1, 0x333333), -1, 14, 0); const bulb = box(1.4, 0.2, 0.7, mat(0xfff3c4, { emissive: 0xfff0b0, emissiveIntensity: 3 })); add(W.lamp, bulb, -1.6, 13.75, 0);
  W.lamp.position.set(18, 0, -24); K.add(W.lamp);
  W.lampLight = new THREE.SpotLight(0xffe6a8, 0, 60, 0.75, 0.5, 1.2); W.lampLight.position.set(LOC.court.x + 16.4, 13.5, -24); W.lampLight.target.position.set(LOC.court.x + 18, 0, -6); W.lampLight.castShadow = true; W.lampLight.shadow.mapSize.set(1024, 1024); scene.add(W.lampLight); scene.add(W.lampLight.target);
  W.courtConfetti = confetti(160, 26); W.courtConfetti.position.set(0, 0, 0); K.add(W.courtConfetti); W.courtConfetti.visible = false;
  for (let i = 0; i < 10; i++) { const t = tree(1.4 + rnd() * 0.5); t.position.set(-50 + i * 11, 0, -36 - rnd() * 6); K.add(t); }

  // ===== BAKERY =====
  const B = grp(LOC.bakery); W.bakery = B;
  const tile = canvasTex(512, 512, (g) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { g.fillStyle = (i + j) % 2 ? '#f4efe6' : '#d9534f'; g.fillRect(i * 64, j * 64, 64, 64); } }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(4, 2);
  const bf = new THREE.Mesh(new THREE.PlaneGeometry(36, 18), new THREE.MeshStandardMaterial({ map: tile, roughness: 0.35 })); bf.rotation.x = -Math.PI / 2; bf.receiveShadow = true; add(B, bf, 0, 0.12, 0);
  add(B, box(36, 12, 0.5, 0xffe3c2), 0, 6, -9); add(B, box(0.5, 12, 18, 0xffd6a5), 18, 6, 0); add(B, box(0.5, 12, 18, 0xffd6a5), -18, 6, 0);
  const sign = textPlane("BOB'S BAKERY", 14, 2.4, { bg: '#7a3e1d', fg: '#ffe9c7', font: '900 140px Inter' }); add(B, sign, 0, 9.5, -8.7);
  for (let i = 0; i < 3; i++) { add(B, box(10, 0.3, 1.6, 0x8a5a33), -9, 3 + i * 2.2, -8.1); for (let j = 0; j < 5; j++) { const l = loaf(); l.scale.setScalar(0.7); add(B, l, -12.6 + j * 1.8, 3.55 + i * 2.2, -8.1); } }
  for (let i = 0; i < 3; i++) { add(B, box(10, 0.3, 1.6, 0x8a5a33), 9, 3 + i * 2.2, -8.1); for (let j = 0; j < 7; j++) add(B, cookie(), 5.4 + j * 1.2, 3.25 + i * 2.2, -8.1); }
  const counter = box(14, 3.2, 3, 0xffffff); add(B, counter, 4, 1.6, -2); add(B, box(14.2, 0.3, 3.2, 0x8a5a33), 4, 3.3, -2);
  const glass = box(13, 1.6, 0.1, mat(0xcfefff, { transparent: true, opacity: 0.35, roughness: 0.05 })); add(B, glass, 4, 2.0, -0.45);
  for (let j = 0; j < 6; j++) { const l = loaf(); l.scale.setScalar(0.6); add(B, l, -1 + j * 2, 1.7, -2); }
  W.bakeryLight = new THREE.PointLight(0xffe2b0, 0, 50, 1.5); W.bakeryLight.position.set(LOC.bakery.x, 10, 2); scene.add(W.bakeryLight);

  // ===== GARAGE =====
  const G = grp(LOC.garage); W.garage = G;
  const cf = box(26, 0.2, 20, 0x9a9a95, { roughness: 0.95 }); add(G, cf, 0, 0.1, 0);
  add(G, box(26, 12, 0.5, 0x8d9aa3), 0, 6, -10); add(G, box(0.5, 12, 20, 0x7d8a93), 13, 6, 0); add(G, box(0.5, 12, 20, 0x7d8a93), -13, 6, 0);
  for (let i = 0; i < 4; i++) add(G, box(0.3, 0.3, 20, 0x6d7a83), -12.8, 2 + i * 2.5, 0);
  const poster = textPlane('NO DAYS\nOFF', 5, 6, { bg: '#111', fg: '#ff3b30', font: '900 220px Inter', border: '#ff3b30' }); add(G, poster, -5, 6.5, -9.7);
  const poster2 = textPlane('NBA\nOR\nBUST', 4, 5.5, { bg: '#ffd60a', fg: '#111', font: '900 200px Inter' }); add(G, poster2, 6, 6.5, -9.7);
  const ghoop = hoop(); ghoop.scale.setScalar(0.55); ghoop.rotation.y = Math.PI / 2; ghoop.position.set(0.5, 1.5, -8.7); G.add(ghoop);
  add(G, box(6, 3, 2.5, 0x7a4f2a), 9, 1.5, -8.3); add(G, box(2.5, 0.3, 1.5, 0xcc3333), 8, 3.2, -8.3);
  for (let i = 0; i < 3; i++) { const t = cyl(1.1, 1.1, 0.8, 0x1c1c1c); t.rotation.x = Math.PI / 2; add(G, t, -10, 1.1 + i * 0.85, -7); t.rotation.set(0, 0, 0); t.position.y = 0.4 + i * 0.82; }
  add(G, box(3, 0.15, 6, 0x2a3a8a), -2, 0.25, 1); // mat
  W.bulb = new THREE.PointLight(0xffd48a, 0, 40, 1.4); W.bulb.position.set(LOC.garage.x, 10, 2); W.bulb.castShadow = false; scene.add(W.bulb);
  add(G, sph(0.4, mat(0xfff2c0, { emissive: 0xffe7a0, emissiveIntensity: 3 })), 0, 10.5, 2); add(G, cyl(0.03, 0.03, 1.5, 0x111111), 0, 11.5, 2);
  W.tinyDB = dumbbell(); scene.add(W.tinyDB);

  // ===== PARTY =====
  const Pa = grp(LOC.party); W.party = Pa;
  const wood = canvasTex(512, 512, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#7b4a2a' : '#8b5a34'; g.fillRect(0, i * 64, 512, 64); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, i * 64, 512, 3); } }); wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(4, 4);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(44, 30), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.4 })); pf.rotation.x = -Math.PI / 2; pf.receiveShadow = true; add(Pa, pf, 0, 0.12, 0);
  add(Pa, box(44, 14, 0.5, 0x3b1f5c), 0, 7, -15); add(Pa, box(0.5, 14, 30, 0x30184d), 22, 7, 0); add(Pa, box(0.5, 14, 30, 0x30184d), -22, 7, 0);
  const pb = textPlane('PARTY!!!', 16, 3, { bg: '#ff2d95', fg: '#fff', font: '900 200px Inter' }); add(Pa, pb, 0, 11, -14.7);
  const dj = new THREE.Group(); add(dj, box(8, 3.2, 3, 0x111111), 0, 1.6, 0); add(dj, box(8.1, 0.4, 3.1, 0x00e5ff), 0, 3.0, 0);
  for (const s of [-1, 1]) { const tt = cyl(1, 1, 0.2, 0x222222); add(dj, tt, s * 2, 3.3, 0); const rec = cyl(0.8, 0.8, 0.05, 0x050505); add(dj, rec, s * 2, 3.42, 0); W['rec' + s] = rec; add(dj, box(2.4, 5.5, 2.4, 0x1a1a1a), s * 6, 2.75, -0.5); const cone = cyl(0.9, 0.9, 0.2, 0x444444); cone.rotation.x = Math.PI / 2; add(dj, cone, s * 6, 3.8, 0.75); const cone2 = cyl(0.5, 0.5, 0.2, 0x444444); cone2.rotation.x = Math.PI / 2; add(dj, cone2, s * 6, 1.6, 0.75); W['spk' + s] = [cone, cone2]; }
  dj.position.set(0, 0, -10); Pa.add(dj);
  W.disco = sph(1.3, mat(0xdddddd, { metalness: 1, roughness: 0.15 }), null, 16); add(Pa, W.disco, 0, 12, -2); add(Pa, cyl(0.04, 0.04, 2, 0x111111), 0, 13.6, -2);
  W.partyLights = [0xff2d95, 0x00e5ff, 0xffe600, 0x7c4dff].map((c, i) => { const l = new THREE.PointLight(c, 0, 40, 1.2); scene.add(l); return l; });
  for (let i = 0; i < 14; i++) { const b = sph(0.6, [0xff2d95, 0x00e5ff, 0xffe600, 0x7c4dff][i % 4], { roughness: 0.2 }); add(Pa, b, -20 + rnd() * 40, 9 + rnd() * 4, -14 + rnd() * 2); }
  W.partyConfetti = confetti(120, 30); Pa.add(W.partyConfetti);

  // ===== HOME (bathroom / kitchen / toilet) =====
  const Hm = grp(LOC.home); W.home = Hm;
  const btile = canvasTex(256, 256, (g) => { g.fillStyle = '#e9f4fb'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#b8d4e6'; g.lineWidth = 4; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } }); btile.wrapS = btile.wrapT = THREE.RepeatWrapping; btile.repeat.set(6, 3);
  // bathroom at x 0..
  add(Hm, box(16, 0.2, 14, 0xd7e3ea), 0, 0.1, 0); const bw = new THREE.Mesh(new THREE.BoxGeometry(16, 12, 0.5), new THREE.MeshStandardMaterial({ map: btile })); bw.receiveShadow = true; add(Hm, bw, 0, 6, -7);
  add(Hm, box(4.5, 3.2, 2.2, 0xffffff), 0, 1.6, -5.8); add(Hm, box(4.6, 0.3, 2.3, 0xf0f0f0), 0, 3.3, -5.8); add(Hm, cyl(0.1, 0.1, 0.8, 0xbbbbbb), 0, 3.8, -6.5);
  const mirror = box(4.5, 4.2, 0.15, mat(0xcfe8f5, { metalness: 0.9, roughness: 0.05 })); add(Hm, mirror, 0, 7.2, -6.7); add(Hm, box(4.9, 4.6, 0.1, 0xffffff), 0, 7.2, -6.78);
  W.brush = new THREE.Group(); add(W.brush, box(0.12, 0.9, 0.12, 0x2ab0ff), 0, 0, 0); add(W.brush, box(0.14, 0.22, 0.2, 0xffffff), 0, 0.5, 0.08); scene.add(W.brush);
  // kitchen at x 30
  add(Hm, box(18, 0.2, 14, 0xe8d9b5), 30, 0.1, 0); add(Hm, box(18, 12, 0.5, 0xfff3c9), 30, 6, -7);
  add(Hm, box(6, 0.3, 4, 0xa86a3c), 30, 3, -1.5); for (const [x, z] of [[-2.7, -1.7], [2.7, -1.7], [-2.7, 1.7], [2.7, 1.7]]) add(Hm, box(0.3, 3, 0.3, 0x8a5530), 30 + x, 1.5, -1.5 + z);
  const bowl = cyl(0.6, 0.4, 0.5, 0xffffff); add(Hm, bowl, 29, 3.4, -1); add(Hm, cyl(0.55, 0.55, 0.05, 0xf3d27a), 29, 3.62, -1);
  add(Hm, box(2, 2.6, 0.8, 0xffcc00), 32.5, 4.4, -2.9); const cb = textPlane('HOOP\nO\'S', 1.9, 2.4, { bg: '#ffcc00', fg: '#d62d2d', font: '900 180px Inter' }); add(Hm, cb, 32.5, 4.4, -2.49);
  add(Hm, box(4, 9, 3, 0xf2f2f2), 37, 4.5, -5); add(Hm, box(0.2, 2.5, 0.2, 0x999999), 35.3, 5.5, -3.4);
  add(Hm, box(3, 2.4, 3, 0x8a5530), 30, 1.2, 2.8); // chair seat
  // toilet room at x 60
  add(Hm, box(14, 0.2, 14, 0xd7e3ea), 60, 0.1, 0); const bw2 = bw.clone(); bw2.position.set(60, 6, -7); Hm.add(bw2);
  add(Hm, box(2.6, 2.2, 3, 0xffffff), 60, 1.1, -4.4); add(Hm, box(2.8, 0.25, 3.2, 0xf4f4f4), 60, 2.3, -4.2); add(Hm, box(2.8, 3.4, 1.2, 0xffffff), 60, 3.5, -6.2);
  const tp = cyl(0.5, 0.5, 0.9, 0xffffff); tp.rotation.z = Math.PI / 2; add(Hm, tp, 63, 3, -6.6);
  W.homeLight = new THREE.PointLight(0xfff0d8, 0, 40, 1.3); scene.add(W.homeLight);

  // ===== TOWN SQUARE / STAGE =====
  const Q = grp(LOC.square); W.square = Q;
  add(Q, box(120, 0.12, 9, 0x4a4d55), 0, 0.04, 14);
  const plaza = box(60, 0.2, 26, 0xd8cfc0); add(Q, plaza, 0, 0.1, -4);
  const hall = new THREE.Group(); add(hall, box(34, 16, 10, 0xf1e7d0), 0, 8, 0); add(hall, box(36, 1.2, 11, 0xffffff), 0, 16.5, 0);
  const pd = new THREE.Mesh(new THREE.ConeGeometry(14, 5, 4), mat(0x9e3b2f)); pd.rotation.y = Math.PI / 4; pd.scale.set(1.25, 1, 0.45); add(hall, pd, 0, 19.6, 0);
  for (let i = 0; i < 6; i++) add(hall, cyl(0.7, 0.7, 14, 0xffffff), -12.5 + i * 5, 7, 5.6);
  const th = textPlane('TOWN HALL', 14, 2, { bg: '#f1e7d0', fg: '#3a2a1a', font: '900 160px Inter' }); add(hall, th, 0, 15, 6.4);
  hall.position.set(0, 0, -20); Q.add(hall);
  const stage = box(18, 2, 8, 0x6b3f22); add(Q, stage, 0, 1, -9); add(Q, box(18.2, 0.2, 8.2, 0x8a5530), 0, 2.05, -9);
  const pod = new THREE.Group(); add(pod, box(2.4, 3.4, 1.6, 0x1d4ed8), 0, 1.7, 0); add(pod, box(2.6, 0.3, 1.9, 0x163a9e), 0, 3.5, 0); add(pod, cyl(0.04, 0.04, 1.2, 0x222222), 0, 4.2, 0.3); add(pod, sph(0.18, 0x222222), 0, 4.85, 0.38);
  const seal = textPlane('★', 1.4, 1.4, { bg: '#1d4ed8', fg: '#ffd700', font: '900 700px Inter' }); add(pod, seal, 0, 2.0, 0.81); pod.position.set(0, 2.1, -8.2); Q.add(pod);
  const ann = textPlane('BIG ANNOUNCEMENT!', 20, 3, { bg: '#d62d2d', fg: '#fff', font: '900 120px Inter' }); add(Q, ann, 0, 11, -13.5); add(Q, box(0.4, 12, 0.4, 0x444444), -10, 6, -13.7); add(Q, box(0.4, 12, 0.4, 0x444444), 10, 6, -13.7);
  for (let i = 0; i < 18; i++) { const fl = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.9, 3), mat([0xff4757, 0xffd32a, 0x1e90ff][i % 3])); fl.rotation.x = Math.PI; add(Q, fl, -9 + i * 1.06, 12.6 - Math.sin(i / 17 * Math.PI) * 0.0, -13.4); }
  for (let i = 0; i < 8; i++) { const t = tree(1.3); t.position.set(-45 + i * 13 + (i > 3 ? 8 : -8), 0, -24 - rnd() * 6); Q.add(t); }
  W.squareConfetti = confetti(140, 30); W.squareConfetti.position.set(0, 0, -2); Q.add(W.squareConfetti);
  W.suv = suv(); scene.add(W.suv);
  W.car = sportsCar(); scene.add(W.car);

  // shared props
  W.ball = null; // created in main
  W.pkg = pkg(); scene.add(W.pkg);
  W.loaf = loaf(); scene.add(W.loaf);
  W.cookie = cookie(); scene.add(W.cookie);
  W.trophy = trophy(); scene.add(W.trophy);
  W.phone = phone(); scene.add(W.phone);
  W.mascotHead = mascotHead(); scene.add(W.mascotHead);
  W.mascotHead2 = mascotHead(); scene.add(W.mascotHead2);
  W.mascotBody = mascotBody(); scene.add(W.mascotBody);
  W.contract = contract(); scene.add(W.contract);
  W.mic = new THREE.Group(); add(W.mic, cyl(0.12, 0.08, 0.9, 0x222222), 0, 0, 0); add(W.mic, sph(0.2, 0x888888), 0, 0.5, 0); scene.add(W.mic);
  W.stars = new THREE.Group(); for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.25), mat(0xffe14d, { emissive: 0xffd000, emissiveIntensity: 0.8 })); W.stars.add(s); } scene.add(W.stars);
  W.nightStars = new THREE.Group(); for (let i = 0; i < 160; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.5, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); const a = rnd() * Math.PI - Math.PI, e = 0.15 + rnd() * 0.9; s.position.set(Math.cos(a) * 250 * Math.cos(e), 250 * Math.sin(e), Math.sin(a) * 250 * Math.cos(e)); W.nightStars.add(s); } W.nightStars.position.copy(LOC.court); scene.add(W.nightStars);
  W.moon = new THREE.Mesh(new THREE.SphereGeometry(12, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff6d8 })); W.moon.position.set(LOC.court.x - 80, 120, -200); scene.add(W.moon);
  return W;
}
