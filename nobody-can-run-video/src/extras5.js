import { THREE, scene, renderer, box, cyl, sph, mat, canvasTex, textPlane } from './core.js';
import { LOC, W, tree, sportsCar } from './world.js';
import { palm, bushBall } from './extras4.js';
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
LOC.wgym = V3(3300, 0, 0); LOC.gymx = V3(3500, 0, 0); LOC.bed = V3(3700, 0, 0); LOC.booth = V3(3900, 0, 0);
const add = (p, o, x, y, z) => { o.position.set(x, y, z); p.add(o); return o; };
const grp = (at) => { const g = new THREE.Group(); g.position.copy(at); scene.add(g); return g; };
const emis = (c, i = 1.5) => mat(c, { emissive: c, emissiveIntensity: i });
let s = 23; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
function confetti(n, spread) {
  const g = new THREE.Group(); const cols = [0xff4757, 0xffd32a, 0x2ed573, 0x1e90ff, 0xff6bcb];
  for (let i = 0; i < n; i++) { const c = box(0.25, 0.04, 0.12, cols[i % 5]); c.castShadow = false; c.userData = { x: (rnd() - 0.5) * spread, z: (rnd() - 0.5) * spread, y0: 6 + rnd() * 8, sp: 1 + rnd() * 2, r: rnd() * 6 }; g.add(c); }
  g.update = (t) => g.children.forEach(c => { const u = c.userData; c.position.set(u.x + Math.sin(t * 2 + u.r) * 0.5, ((u.y0 - t * u.sp) % 14 + 14) % 14, u.z); c.rotation.set(t * 3 + u.r, t * 2, u.r); });
  return g;
}
function speaker() { const g = new THREE.Group(); add(g, box(2.2, 4.4, 2, 0x111111), 0, 2.2, 0); for (const y of [1.3, 3.2]) { const c = cyl(0.75, 0.75, 0.1, 0x333333, 20); c.rotation.x = Math.PI / 2; add(g, c, 0, y, 1.02); add(g, sph(0.25, 0x555555), 0, y, 1.1); } return g; }
export function buildExtras5() {
  // ===== 4 AM street party on the rich street =====
  const R = W.rich;
  W.dj = new THREE.Group(); add(W.dj, box(7, 3, 2.6, 0x111111), 0, 1.5, 0); add(W.dj, box(7.1, 0.35, 2.7, emis(0xff2bd6, 2)), 0, 2.9, 0); for (const sx of [-1, 1]) { add(W.dj, cyl(0.9, 0.9, 0.15, 0x222222), sx * 1.8, 3.1, 0); add(W.dj, speaker(), sx * 5.5, 0, 0); }
  W.dj.position.set(LOC.rich.x + 12, 0.35, -9.5); scene.add(W.dj);
  W.clock = new THREE.Group(); add(W.clock, cyl(0.25, 0.3, 9, 0x222222), 0, 4.5, 0); const ct = canvasTex(256, 128, (g) => { g.fillStyle = '#0b0b0b'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#ff3030'; g.font = '900 78px monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('4:00', 128, 56); g.font = '900 30px monospace'; g.fillText('AM', 128, 106); });
  add(W.clock, box(3.6, 2.0, 0.6, 0x222222), 0, 9.8, 0); const cp = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 1.7), new THREE.MeshBasicMaterial({ map: ct })); add(W.clock, cp, 0, 9.8, 0.31); const cp2 = cp.clone(); cp2.rotation.y = Math.PI; add(W.clock, cp2, 0, 9.8, -0.31);
  W.clock.position.set(LOC.rich.x - 7, 0.35, -8.6); scene.add(W.clock);
  W.streetConf = confetti(160, 40); scene.add(W.streetConf);
  W.streetLights = [0xff2d95, 0x00e5ff, 0xffe600, 0x7c4dff].map(c => { const l = new THREE.PointLight(c, 0, 45, 1.1); scene.add(l); return l; });
  // ===== WEIGHT GYM =====
  const G = grp(LOC.wgym); const rub = canvasTex(256, 256, (g) => { g.fillStyle = '#26282d'; g.fillRect(0, 0, 256, 256); g.strokeStyle = '#1a1b1f'; g.lineWidth = 4; for (let i = 0; i <= 256; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); } }); rub.wrapS = rub.wrapT = THREE.RepeatWrapping; rub.repeat.set(8, 6);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(50, 36), new THREE.MeshStandardMaterial({ map: rub, roughness: 0.9 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; add(G, fl, 0, 0.1, 0);
  add(G, box(50, 16, 0.5, 0xe8e8ec), 0, 8, -18); add(G, box(0.5, 16, 36, 0xd6d6dc), 25, 8, 0); add(G, box(0.5, 16, 36, 0xd6d6dc), -25, 8, 0); add(G, box(50, 2.2, 0.6, 0xff3b30), 0, 4.5, -17.7);
  add(G, box(30, 8, 0.15, mat(0xcfe8f5, { metalness: 0.9, roughness: 0.05 })), 6, 7, -17.6);
  add(G, textPlane('NO DAYS OFF', 14, 2.4, { bg: '#111', fg: '#ff3b30', font: '900 150px Inter' }), -13, 12.5, -17.7);
  add(G, textPlane('SLEEP = WEAK', 6, 6, { bg: '#ffd60a', fg: '#111', font: '900 150px Inter' }), -24.7, 8, -6).rotation.y = Math.PI / 2;
  for (let i = -2; i <= 2; i++) add(G, box(6, 0.3, 1.2, emis(0xffffff, 1.5)), i * 10, 15.8, 0);
  W.wgymLight = new THREE.PointLight(0xfff4e0, 0, 70, 1.2); W.wgymLight.position.set(LOC.wgym.x, 14, 4); scene.add(W.wgymLight);
  // treadmill (faces +z, belt along z)
  W.beltTex = canvasTex(64, 256, (g) => { g.fillStyle = '#151515'; g.fillRect(0, 0, 64, 256); g.fillStyle = '#2b2b2b'; for (let i = 0; i < 256; i += 32) g.fillRect(0, i, 64, 8); }); W.beltTex.wrapS = W.beltTex.wrapT = THREE.RepeatWrapping;
  const T = new THREE.Group(); add(T, box(3.2, 0.7, 8, 0x3a3d44), 0, 0.35, 0); const belt = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.1, 7.6), new THREE.MeshStandardMaterial({ map: W.beltTex, roughness: 0.8 })); add(T, belt, 0, 0.75, 0);
  for (const sx of [-1, 1]) { add(T, box(0.2, 4.2, 0.2, 0x8a8f96), sx * 1.5, 2.6, 3.4); add(T, box(0.15, 0.15, 2.4, 0x8a8f96), sx * 1.5, 4.0, 2.4); }
  add(T, box(3.3, 1.3, 0.6, 0x222222), 0, 4.8, 3.6); W.treadScr = add(T, box(2.4, 0.8, 0.05, emis(0x34e07a, 1.2)), 0, 4.85, 3.28);
  T.position.set(LOC.wgym.x - 8, 0.1, -6); T.rotation.y = Math.PI; scene.add(T); W.tread = T; // faces -z? we rotate so runner faces +z... runner faces -z (toward console at -z)
  W.mats = new THREE.Group(); for (let i = 0; i < 5; i++) { const m = box(4.2, 0.6, 3.2, [0x1f5fbf, 0xff3b30, 0x1f5fbf, 0xffd60a, 0x1f5fbf][i]); m.rotation.y = (rnd() - 0.5) * 0.4; add(W.mats, m, (rnd() - 0.5) * 0.6, 0.3 + i * 0.6, (rnd() - 0.5) * 0.5); } W.mats.position.set(LOC.wgym.x - 8, 0.1, 2.8); scene.add(W.mats);
  // bench + barbell + rack + dumbbells
  W.bench = new THREE.Group(); add(W.bench, box(1.6, 0.5, 6, 0x111111), 0, 2.2, 0); add(W.bench, box(0.3, 2, 0.3, 0x8a8f96), 0, 1, 2.3); add(W.bench, box(0.3, 2, 0.3, 0x8a8f96), 0, 1, -2.3);
  for (const sx of [-1, 1]) add(W.bench, box(0.25, 5, 0.25, 0x8a8f96), sx * 2.6, 2.5, -2.6);
  W.bench.position.set(LOC.wgym.x + 8, 0.1, -4); scene.add(W.bench);
  W.barbell = new THREE.Group(); const bar = cyl(0.08, 0.08, 7.5, 0xbbbbbb, 10, { metalness: 0.9, roughness: 0.2 }); bar.rotation.z = Math.PI / 2; W.barbell.add(bar);
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { const p = cyl(1.1 - i * 0.15, 1.1 - i * 0.15, 0.3, [0xff3b30, 0x1f5fbf, 0xffd60a][i], 24); p.rotation.z = Math.PI / 2; add(W.barbell, p, sx * (2.6 + i * 0.32), 0, 0); }
  scene.add(W.barbell);
  for (let i = 0; i < 6; i++) { const db = new THREE.Group(); const h = cyl(0.1, 0.1, 1.1, 0x999999, 8); h.rotation.z = Math.PI / 2; db.add(h); for (const sx of [-1, 1]) { const w = box(0.5, 0.8, 0.8, 0x222222); add(db, w, sx * 0.5, 0, 0); } add(G, db, 14 + (i % 3) * 1.6, 1.0 + Math.floor(i / 3) * 1.2, -15); }
  add(G, box(6, 0.2, 1.6, 0x444444), 15.5, 0.8, -15); add(G, box(6, 0.2, 1.6, 0x444444), 15.5, 2.0, -15);
  // ===== gym exterior (party outside) =====
  const X = grp(LOC.gymx); add(X, box(300, 0.1, 10, 0x3f4249), 0, 0.04, 14); add(X, box(300, 0.35, 6, 0xe9e4da), 0, 0.17, 8);
  add(X, box(34, 14, 6, 0x3a3d44), 0, 7, -3); add(X, textPlane('24/7 GYM', 16, 3, { bg: '#111', fg: '#ff3b30', font: '900 200px Inter' }), 0, 11.5, 0.05);
  for (const x of [-9, 9]) add(X, box(10, 6, 0.2, emis(0xfff2c0, 0.9)), x, 4.5, 0.05); add(X, box(3.6, 6, 0.2, 0x111111), 0, 3, 0.05);
  W.gxSpk = speaker(); add(X, W.gxSpk, -6, 0.35, 7);
  for (const x of [-25, 25]) { const p = palm(9); p.position.set(x, 0, 6); X.add(p); }
  W.gxConf = confetti(100, 24); W.gxConf.position.copy(LOC.gymx).add(V3(0, 0, 8)); scene.add(W.gxConf);
  // ===== BAKERY extras =====
  W.cbucket = new THREE.Group(); add(W.cbucket, cyl(1.6, 1.2, 2.8, 0xd9d9d9, 28, { metalness: 0.5, roughness: 0.3 }), 0, 0, 0); add(W.cbucket, cyl(1.5, 1.5, 0.08, 0x4a2a12, 28), 0, 1.3, 0); const hd = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.06, 6, 24, Math.PI), mat(0x777777)); add(W.cbucket, hd, 0, 1.3, 0); scene.add(W.cbucket);
  W.cup = new THREE.Group(); add(W.cup, cyl(0.28, 0.22, 0.55, 0xffffff, 14), 0, 0, 0); add(W.cup, cyl(0.25, 0.25, 0.03, 0x4a2a12, 14), 0, 0.26, 0); scene.add(W.cup);
  W.poven = new THREE.Group(); add(W.poven, box(6, 5, 4, 0xb5442a), 0, 2.5, 0); add(W.poven, sph(3.1, mat(0xb5442a), null, 16), 0, 5, 0).scale.set(1, 0.6, 0.7); W.ovenFire = add(W.poven, box(3, 1.6, 0.2, emis(0xff7a1a, 2.5)), 0, 2.4, 2.0); W.poven.position.set(LOC.bakery.x + 13, 0.12, -5.5); W.poven.rotation.y = -0.6; scene.add(W.poven);
  W.ovenLight = new THREE.PointLight(0xff8a3a, 0, 20, 1.5); W.ovenLight.position.set(LOC.bakery.x + 11, 3, -2.5); scene.add(W.ovenLight);
  const pzT = canvasTex(128, 128, (g) => { g.fillStyle = '#e8b25a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.fillStyle = '#d94a2a'; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.fill(); g.fillStyle = '#ffe08a'; for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(30 + (i * 37) % 70, 30 + (i * 53) % 70, 9, 0, 7); g.fill(); } g.fillStyle = '#8a1a1a'; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(40 + (i * 29) % 50, 35 + (i * 41) % 60, 7, 0, 7); g.fill(); } });
  W.pz = []; for (let i = 0; i < 40; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.12, 20), [mat(0xd9a050), new THREE.MeshStandardMaterial({ map: pzT, roughness: 0.7 }), mat(0xd9a050)]); p.castShadow = true; scene.add(p); W.pz.push(p); }
  W.pzStack = new THREE.Group(); for (let i = 0; i < 18; i++) { add(W.pzStack, box(1.9, 0.26, 1.9, 0xf2efe6), 0, i * 0.28, 0); } scene.add(W.pzStack);
  // ===== mailman extras =====
  W.mshoes = new THREE.Group(); for (const x of [-0.55, 0.55]) add(W.mshoes, box(1.08, 0.42, 1.25, 0x1a1a1a), x, 0.21, 0.12); scene.add(W.mshoes);
  W.puff = new THREE.Group(); for (let i = 0; i < 10; i++) { const p = sph(0.6 + rnd() * 0.5, mat(0xeeeeee, { transparent: true, opacity: 0.85, roughness: 1 }), null, 10); p.userData = { a: rnd() * 6, s: rnd() }; W.puff.add(p); } scene.add(W.puff);
  W.parcels = []; for (let i = 0; i < 8; i++) { const b = new THREE.Group(); add(b, box(1.2, 0.9, 0.9, 0xc8955a), 0, 0, 0); add(b, box(1.22, 0.18, 0.92, 0xe8d6a8), 0, 0, 0); scene.add(b); W.parcels.push(b); }
  // ===== office extras: air horn =====
  W.horn = new THREE.Group(); add(W.horn, cyl(0.35, 0.35, 1.2, 0xd62d2d, 14), 0, 0, 0); add(W.horn, cyl(0.12, 0.12, 0.3, 0x222222), 0, 0.75, 0); const cone = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.2, 16, 1, true), mat(0xffffff, { side: THREE.DoubleSide })); cone.rotation.z = Math.PI / 2; add(W.horn, cone, 0.75, 0.9, 0); scene.add(W.horn);
  W.waves = new THREE.Group(); for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 6, 32, Math.PI * 0.7), mat(0xffffff, { transparent: true, opacity: 0.8 })); r.rotation.z = -Math.PI * 0.35; W.waves.add(r); } scene.add(W.waves);
  // ===== BEDROOM =====
  const B = grp(LOC.bed); const wd = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#a0703f' : '#b07d48'; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, i * 32, 256, 2); } }); wd.wrapS = wd.wrapT = THREE.RepeatWrapping; wd.repeat.set(3, 3);
  const bf = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), new THREE.MeshStandardMaterial({ map: wd, roughness: 0.6 })); bf.rotation.x = -Math.PI / 2; bf.receiveShadow = true; add(B, bf, 0, 0.1, 0);
  const wallC = 0x5b7fc7; add(B, box(30, 14, 0.5, wallC), 0, 7, -12); add(B, box(0.5, 14, 24, 0x5274b8), -15, 7, 0); add(B, box(0.5, 14, 14.6, 0x5274b8), 15, 7, -4.7); add(B, box(0.5, 14, 5.4, 0x5274b8), 15, 7, 9.3); add(B, box(0.5, 5.4, 4.2, 0x5274b8), 15, 11.3, 4.6); add(B, box(10, 0.2, 6, 0xb07d48), 20, 0.1, 4.6); add(B, box(0.5, 14, 6, 0xe0c090), 25, 7, 4.6);
  // window with moon
  add(B, box(6, 5, 0.2, 0x0b1030), -6, 8, -11.7); add(B, sph(0.9, mat(0xfff6d8, { emissive: 0xfff6d8, emissiveIntensity: 1.5 })), -4.5, 9.2, -11.6); add(B, box(6.4, 0.3, 0.4, 0xffffff), -6, 5.4, -11.6); add(B, box(0.3, 5, 0.4, 0xffffff), -6, 8, -11.6);
  // bed (head at -z), mattress top y ~3
  const bed = new THREE.Group(); add(bed, box(6.4, 1.6, 11, 0x6b3b1e), 0, 0.8, 0); add(bed, box(6.0, 1.0, 10.6, 0xf2f2f2), 0, 2.1, 0); add(bed, box(6.6, 5, 0.6, 0x6b3b1e), 0, 2.5, -5.6); add(bed, box(3.6, 0.8, 1.8, 0xffffff), 0, 3.0, -4.3);
  W.blanket = add(bed, box(6.2, 0.5, 6.2, 0xd62d6a), 0, 3.7, 2.0); bed.position.set(4, 0.1, -5.5); B.add(bed);
  const ns = new THREE.Group(); add(ns, box(2.4, 2.6, 2.2, 0x8a5a33), 0, 1.3, 0); add(ns, cyl(0.5, 0.7, 0.3, 0x333333), 0, 2.75, 0); add(ns, cyl(0.06, 0.06, 1.4, 0x333333), 0, 3.5, 0); add(ns, cyl(0.6, 0.9, 1.0, emis(0xfff0c0, 0.8)), 0, 4.4, 0); ns.position.set(9.3, 0.1, -9.8); B.add(ns);
  W.lampB = new THREE.PointLight(0xffd9a0, 0, 25, 1.4); W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); scene.add(W.lampB);
  // closet (on left wall area, faces +x)
  const cl = new THREE.Group(); add(cl, box(4, 11, 0.4, 0x8a5a33), 0, 5.5, -3.5); add(cl, box(4, 11, 0.4, 0x8a5a33), 0, 5.5, 3.5); add(cl, box(4, 0.5, 7.4, 0x8a5a33), 0, 11, 0); add(cl, box(0.3, 11, 7.4, 0x2a1a10), -2, 5.5, 0);
  W.slats = new THREE.Group(); for (const zz of [-1.7, 1.7]) { for (let i = 0; i < 22; i++) { const sl = box(0.12, 0.22, 3.2, 0xb07d48); sl.rotation.z = 0.5; add(W.slats, sl, 0, 0.6 + i * 0.47, zz); } add(W.slats, box(0.2, 10.4, 0.2, 0x8a5a33), 0, 5.4, zz - 1.65); add(W.slats, box(0.2, 10.4, 0.2, 0x8a5a33), 0, 5.4, zz + 1.65); }
  add(cl, W.slats, 2, 0, 0); cl.position.set(-12.8, 0.1, -3); B.add(cl); W.closet = cl;
  // door (right wall, near front) + hallway light
  W.bdoor = new THREE.Group(); W.bdoor.position.set(LOC.bed.x + 14.7, 0.1, 6.5); const dm = box(0.25, 8.5, 3.8, 0xf2f2f2); dm.position.set(0, 4.25, -1.9); W.bdoor.add(dm); add(W.bdoor, sph(0.18, 0xffd34d), -0.2, 4.2, -3.4); scene.add(W.bdoor);
  W.hallLight = new THREE.SpotLight(0xffe2b0, 0, 40, 0.6, 0.6, 1); W.hallLight.position.set(LOC.bed.x + 17, 7, 4.6); W.hallLight.target.position.set(LOC.bed.x + 4, 0, 0); scene.add(W.hallLight); scene.add(W.hallLight.target);
  // mirror on the right wall facing -x
  W.mirrorF = new THREE.Group(); add(W.mirrorF, box(0.3, 6, 4, 0xffc629), 0, 0, 0); add(W.mirrorF, box(0.32, 5.4, 3.4, mat(0xd8eef8, { metalness: 1, roughness: 0.03 })), -0.02, 0, 0); W.mirrorF.position.set(LOC.bed.x + 14.6, 6.5, -4); scene.add(W.mirrorF);
  for (const [x, c] of [[2, '#ff3b30'], [-2.5, '#ffd60a']]) { const pst = textPlane(c === '#ff3b30' ? '★' : '♥', 3, 4, { bg: c, fg: '#111', font: '900 500px Inter' }); add(B, pst, x + 8, 9, -11.7); }
  add(B, cyl(5, 5, 0.05, 0x7c4dff, 32), 2, 0.14, 4);
  // ===== the mysterious machine =====
  const M = new THREE.Group(); W.machine = M;
  add(M, box(3.4, 0.4, 2.6, 0x333333), 0, 0.9, 0); for (const [x, z] of [[1.4, 1.1], [-1.4, 1.1], [1.4, -1.1], [-1.4, -1.1]]) add(M, sph(0.35, 0x111111), x, 0.35, z);
  add(M, box(3.0, 3.2, 2.2, mat(0x2b2f3a, { metalness: 0.6, roughness: 0.35 })), 0, 2.7, 0);
  W.mLights = []; for (let i = 0; i < 5; i++) W.mLights.push(add(M, sph(0.14, emis([0xff2020, 0x20ff60, 0xffd020, 0x20a0ff, 0xff20d0][i], 3)), -1.0 + i * 0.5, 3.8, 1.12));
  add(M, box(1.8, 0.9, 0.06, emis(0x103a20, 1)), 0, 2.4, 1.12); add(M, cyl(0.04, 0.04, 1.6, 0x888888), 1.2, 5.0, -0.6); W.mAnt = add(M, sph(0.18, emis(0xff2020, 3)), 1.2, 5.85, -0.6);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V3(-1.5, 3.4, 0), V3(-2.3, 3.0, 0.6), V3(-2.0, 1.6, 1.0), V3(-1.5, 1.4, 0.4)]), 20, 0.08, 6), mat(0x111111)); M.add(tube);
  W.mLid = new THREE.Group(); W.mLid.position.set(0, 4.3, -1.1); add(W.mLid, box(3.1, 0.25, 2.3, mat(0x2b2f3a, { metalness: 0.6, roughness: 0.35 })), 0, 0, 1.1); M.add(W.mLid);
  // barber pole (rises from the machine)
  W.poleTex = canvasTex(64, 256, (g) => { g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 256); for (let i = -8; i < 16; i++) { g.fillStyle = i % 2 ? '#d62d2d' : '#1f5fbf'; g.beginPath(); g.moveTo(0, i * 24); g.lineTo(64, i * 24 - 40); g.lineTo(64, i * 24 - 28); g.lineTo(0, i * 24 + 12); g.fill(); } }); W.poleTex.wrapT = THREE.RepeatWrapping;
  W.pole = new THREE.Group(); add(W.pole, new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 3, 20), new THREE.MeshStandardMaterial({ map: W.poleTex, roughness: 0.3 })), 0, 0, 0); add(W.pole, sph(0.5, mat(0xffc629, { metalness: 0.8, roughness: 0.2 })), 0, 1.6, 0); add(W.pole, cyl(0.5, 0.5, 0.2, 0xffc629), 0, -1.55, 0); add(M, W.pole, 0, 3.0, 0);
  // clipper arm
  W.clip = new THREE.Group(); add(W.clip, box(0.2, 0.2, 2.6, 0x888888), 0, 0, 1.3); W.clipHead = add(W.clip, box(0.7, 0.5, 0.9, 0x111111), 0, 0, 2.8); add(W.clip, box(0.75, 0.15, 0.2, 0xdddddd, { metalness: 0.9 }), 0, -0.15, 3.25); W.clip.position.set(1.3, 3.6, 0.6); M.add(W.clip);
  // photo board (flips up behind the machine)
  W.board = new THREE.Group(); add(W.board, box(7.4, 3.4, 0.2, 0x6b3b1e), 0, 0, 0); add(W.board, box(7.0, 3.0, 0.22, 0xc9a06a), 0, 0, 0);
  W.photoRT = []; for (let i = 0; i < 3; i++) { const rt = new THREE.WebGLRenderTarget(360, 450); W.photoRT.push(rt); add(W.board, box(2.1, 2.6, 0.08, 0xffffff), -2.3 + i * 2.3, 0, 0.14); const ph = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.25), new THREE.MeshBasicMaterial({ map: rt.texture })); add(W.board, ph, -2.3 + i * 2.3, 0.08, 0.2); add(W.board, sph(0.1, 0xd62d2d), -2.3 + i * 2.3, 1.2, 0.22); }
  scene.add(W.board);
  scene.add(M);
  W.cape = new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.6, 24, 1, true), mat(0xffffff, { side: THREE.DoubleSide })); scene.add(W.cape);
  W.hairFly = new THREE.Group(); for (let i = 0; i < 40; i++) { const h = box(0.16, 0.08, 0.16, 0x7a4a24); h.userData = { a: rnd() * 6, v: 2 + rnd() * 4, s: rnd() }; W.hairFly.add(h); } scene.add(W.hairFly);
  W.handMirror = new THREE.Group(); add(W.handMirror, cyl(0.6, 0.6, 0.1, 0xffc629, 20), 0, 0, 0).rotation.x = Math.PI / 2; add(W.handMirror, cyl(0.52, 0.52, 0.12, mat(0xd8eef8, { metalness: 1, roughness: 0.03 }), 20), 0, 0, 0.01).rotation.x = Math.PI / 2; add(W.handMirror, box(0.15, 0.9, 0.1, 0xffc629), 0, -1.0, 0); scene.add(W.handMirror);
  W.moneyHand = new THREE.Group(); scene.add(W.moneyHand);
  // ===== photo booth (renders the "previous victims" photos) =====
  const PB = grp(LOC.booth); add(PB, box(14, 12, 0.3, 0x9fd8ff), 0, 6, -4); add(PB, box(14, 0.2, 10, 0xdddddd), 0, 0.1, 0);
  W.photoCam = new THREE.PerspectiveCamera(30, 360 / 450, 0.1, 100);
  W.boothLight = new THREE.PointLight(0xffffff, 0, 30, 1.2); W.boothLight.position.set(LOC.booth.x, 7, 6); scene.add(W.boothLight);
  return W;
}
