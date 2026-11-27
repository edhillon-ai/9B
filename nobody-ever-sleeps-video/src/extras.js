import { THREE, scene, box, cyl, sph, mat, canvasTex, textPlane } from './core.js';
import { LOC, W, hoop, house, tree } from './world.js';
LOC.gym = new THREE.Vector3(900, 0, 0); LOC.coach = new THREE.Vector3(1000, 0, 0); LOC.secret = new THREE.Vector3(1100, 0, 0);
const add = (p, o, x, y, z) => { o.position.set(x, y, z); p.add(o); return o; };
const grp = (v) => { const g = new THREE.Group(); g.position.copy(v); scene.add(g); return g; };
const emis = (c, k = 2) => mat(c, { emissive: c, emissiveIntensity: k });

export function controller() {
  const g = new THREE.Group(); const k = mat(0x1d1f26, { roughness: 0.35 });
  add(g, box(1.4, 0.32, 0.75, k), 0, 0, 0); for (const s of [-1, 1]) { const gr = box(0.45, 0.3, 0.9, k); gr.rotation.y = s * 0.35; add(g, gr, s * 0.62, -0.02, 0.32); }
  [[0.35, 0.12, 0xff3b30], [0.48, 0, 0x34c759], [0.22, 0, 0x0a84ff], [0.35, -0.12, 0xffd60a]].forEach(([x, z, c]) => add(g, cyl(0.06, 0.06, 0.08, c), x, 0.18, z));
  add(g, cyl(0.1, 0.1, 0.1, 0x333333), -0.35, 0.18, 0.05); add(g, box(0.3, 0.06, 0.1, 0x333333), -0.35, 0.17, -0.18); add(g, box(0.1, 0.06, 0.3, 0x333333), -0.35, 0.17, -0.18);
  g.userData.led = add(g, box(0.25, 0.05, 0.05, emis(0x30a0ff, 3)), 0, 0.17, -0.3);
  return g;
}
export function buildExtras() {
  // ===== GYM (indoor court) =====
  const G = grp(LOC.gym); W.gym = G;
  const wood = canvasTex(2048, 1152, (g, w, h) => { for (let i = 0; i < 48; i++) { g.fillStyle = i % 2 ? '#d9a35e' : '#cf9a55'; g.fillRect(0, i * h / 48, w, h / 48 + 1); } g.strokeStyle = '#fff'; g.lineWidth = 10; g.strokeRect(60, 60, w - 120, h - 120); g.beginPath(); g.moveTo(w / 2, 60); g.lineTo(w / 2, h - 60); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, 140, 0, 7); g.stroke(); g.fillStyle = '#1f5fbf'; g.fillRect(60, h / 2 - 160, 300, 320); g.fillRect(w - 360, h / 2 - 160, 300, 320); g.strokeRect(60, h / 2 - 160, 300, 320); g.strokeRect(w - 360, h / 2 - 160, 300, 320); for (const s of [0, 1]) { g.beginPath(); if (!s) g.arc(150, h / 2, 420, -1.37, 1.37); else g.arc(w - 150, h / 2, 420, Math.PI - 1.37, Math.PI + 1.37); g.stroke(); } });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(64, 36), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.25, metalness: 0.05 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; add(G, fl, 0, 0.1, 0);
  add(G, box(80, 0.1, 50, 0x8a6a48), 0, 0.03, 0);
  add(G, box(80, 22, 0.6, 0xe9e2d4), 0, 11, -22); add(G, box(0.6, 22, 50, 0xddd5c6), 36, 11, 0); add(G, box(0.6, 22, 50, 0xddd5c6), -36, 11, 0);
  add(G, box(80, 2, 0.7, 0x1f5fbf), 0, 5, -21.8);
  const ban = textPlane('HOOPSVILLE GYM', 26, 3.4, { bg: '#1f5fbf', fg: '#ffd60a', font: '900 120px Inter' }); add(G, ban, 0, 15, -21.6);
  W.gymHoopA = hoop(); W.gymHoopA.position.set(28, 0, 0); G.add(W.gymHoopA); const hb = hoop(); hb.position.set(-28, 0, 0); hb.rotation.y = Math.PI; G.add(hb);
  for (let r = 0; r < 4; r++) { add(G, box(50, 0.5, 2.2, 0x6e7b88), 0, 0.8 + r * 1.2, -15 - r * 2.2); add(G, box(50, 0.8 + r * 1.2, 0.4, 0x5b6773), 0, (0.8 + r * 1.2) / 2, -14 - r * 2.2); }
  // air conditioner on side wall
  const ac = new THREE.Group(); add(ac, box(6, 2.4, 1.6, 0xf2f2f2), 0, 0, 0); for (let i = 0; i < 6; i++) add(ac, box(5.4, 0.08, 0.1, 0xb0b0b0), 0, -0.9 + i * 0.3, 0.82); add(ac, box(0.5, 0.25, 0.1, emis(0x34c759, 2)), 2.4, 0.85, 0.82);
  ac.position.set(18, 12, -21.1); G.add(ac); W.ac = ac;
  W.acWind = new THREE.Group(); for (let i = 0; i < 4; i++) { const w = box(4, 0.06, 0.06, mat(0xaee6ff, { transparent: true, opacity: 0.6 })); w.castShadow = false; w.position.set(18, 11 - i * 0.5, -20); W.acWind.add(w); } scene.add(W.acWind); W.acWind.position.copy(LOC.gym);
  W.gymLight = new THREE.PointLight(0xfff4e0, 0, 80, 1.2); W.gymLight.position.set(LOC.gym.x, 20, 4); scene.add(W.gymLight);
  for (let i = -2; i <= 2; i++) add(G, box(6, 0.3, 1.2, emis(0xffffff, 1.5)), i * 13, 21.5, 0);
  W.trash = new THREE.Group(); add(W.trash, cyl(1.0, 0.85, 2.6, 0x4a6b3a), 0, 1.3, 0); add(W.trash, cyl(1.1, 1.1, 0.15, 0x3d5a30), 0, 2.65, 0); W.trash.position.set(LOC.gym.x - 17, 0, 12); scene.add(W.trash);

  // ===== COACH'S HOUSE + GARAGE (exterior) =====
  const K = grp(LOC.coach); W.coachYard = K;
  add(K, box(200, 0.1, 9, 0x4a4d55), 0, 0.03, 16); add(K, box(200, 0.35, 4, 0xd9d6cf), 0, 0.17, 9.5);
  const h = house(0x9fb7c9, 0x3c4a5a, { w: 14, d: 12, h: 8, winX: [-3.5] }); h.position.set(-8, 0, -6); K.add(h);
  // garage block
  const gar = new THREE.Group(); add(gar, box(12, 8, 12, 0xb9c6d2), 0, 4, 0); const gr = new THREE.Mesh(new THREE.ConeGeometry(9.5, 3.5, 4), mat(0x3c4a5a)); gr.rotation.y = Math.PI / 4; gr.scale.set(1, 1, 1); add(gar, gr, 0, 9.75, 0);
  const gdoor = box(9, 6.2, 0.3, 0xe8eef3); add(gar, gdoor, 0, 3.1, 6.05); for (let i = 1; i < 5; i++) add(gar, box(9, 0.08, 0.35, 0xc4ccd4), 0, i * 1.24, 6.06);
  const sign = textPlane('COACH', 4.5, 1.2, { bg: '#161616', fg: '#ffd60a', font: '900 200px Inter' }); add(gar, sign, 0, 7.2, 6.2);
  gar.position.set(9, 0, -6); K.add(gar);
  // side door (hinged) on the garage's right wall facing +x
  const dframe = box(0.4, 5.4, 3.2, 0x5a3418); add(K, dframe, 15.05, 2.7, -3.5);
  W.coachDoor = new THREE.Group(); W.coachDoor.position.set(LOC.coach.x + 15.3, 0, -2.05); const dm = box(0.22, 5.0, 2.8, 0x7a4a24); dm.position.set(0, 2.5, -1.4); W.coachDoor.add(dm); const knob = sph(0.16, 0xffd34d, { metalness: 0.8 }); knob.position.set(0.2, 2.5, -2.5); W.coachDoor.add(knob); scene.add(W.coachDoor);
  W.doorGlow = new THREE.PointLight(0x30d0ff, 0, 18, 1.5); W.doorGlow.position.set(LOC.coach.x + 17, 3, -3.5); scene.add(W.doorGlow);
  for (let i = 0; i < 6; i++) { const t = tree(1.2 + (i % 3) * 0.2); t.position.set(-40 + i * 16, 0, -22 - (i % 2) * 5); K.add(t); }
  const lamp = new THREE.Group(); add(lamp, cyl(0.2, 0.25, 11, 0x333333), 0, 5.5, 0); add(lamp, box(2.4, 0.4, 1, 0x333333), -1, 11, 0); lamp.position.set(-22, 0, 11.6); K.add(lamp);

  // ===== SECRET ROOM =====
  const R = grp(LOC.secret); W.secret = R;
  add(R, box(30, 0.2, 24, 0x1a1c22), 0, 0.1, 0); add(R, box(30, 16, 0.5, 0x15171d), 0, 8, -11); add(R, box(0.5, 16, 24, 0x121419), 15, 8, 0); add(R, box(0.5, 16, 24, 0x121419), -15, 8, 0);
  W.screens = [];
  const scrCol = ['#0b3d2e', '#0b2a4a', '#3a0b3d', '#3d2a0b'];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
    const tex = canvasTex(256, 160, () => {}); const m = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.8), new THREE.MeshBasicMaterial({ map: tex }));
    const x = -12 + c * 3.0, y = 3.2 + r * 2.05; add(R, box(3.05, 1.95, 0.2, 0x050505), x, y, -10.6); m.position.set(LOC.secret.x + x, y, -10.45); scene.add(m);
    m.userData = { tex, seed: r * 9 + c, bg: scrCol[(r + c) % 4] }; W.screens.push(m);
  }
  const names = ['GRANDMA', 'MAILMAN', 'BAKER', 'MAYOR', 'JAKE', 'ALEX'];
  W.drawScreens = (t, err = false) => W.screens.forEach((m) => { const { tex, seed, bg } = m.userData; const { g, canvas } = tex.userData; const w = canvas.width, hh = canvas.height;
    g.fillStyle = err ? '#3a0000' : bg; g.fillRect(0, 0, w, hh); g.strokeStyle = 'rgba(80,255,160,0.25)'; g.lineWidth = 1; for (let i = 0; i < w; i += 32) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, hh); g.stroke(); }
    const ph = (t * 0.6 + seed * 0.137) % 1; const bx = 30 + ph * 180, by = 120 - Math.sin(ph * Math.PI) * 90; g.strokeStyle = '#ffd60a'; g.setLineDash([6, 6]); g.beginPath(); g.moveTo(30, 120); g.quadraticCurveTo(120, -40, 210, 60); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#ff7a1a'; g.beginPath(); g.arc(bx, by, 10, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.strokeRect(195, 50, 30, 20);
    g.fillStyle = err ? '#ff3b30' : '#34e07a'; g.font = '900 22px Inter'; g.fillText(err ? 'NO SIGNAL' : 'AIM LOCK ✓', 10, 24); g.fillStyle = '#fff'; g.font = '700 18px Inter'; g.fillText(names[seed % 6], 10, 150); tex.needsUpdate = true; });
  W.drawScreens(0);
  // desk + gaming chair + chips
  add(R, box(12, 0.4, 4, 0x2a2d35), 0, 3, -7.5); for (const x of [-5.5, 5.5]) add(R, box(0.4, 3, 3.6, 0x22252c), x, 1.5, -7.5);
  add(R, box(11, 0.15, 0.2, emis(0xff2bd6, 2.5)), 0, 2.75, -5.6);
  W.gchair = new THREE.Group(); const red = mat(0x8a1010, { roughness: 0.5 }); add(W.gchair, box(3, 0.6, 3, red), 0, 2.2, 0); add(W.gchair, box(3, 4.2, 0.6, red), 0, 4.4, -1.4); add(W.gchair, box(2.2, 0.8, 0.5, 0x111111), 0, 6.2, -1.3); add(W.gchair, cyl(0.25, 0.25, 1.6, 0x333333), 0, 1.1, 0); add(W.gchair, box(3, 0.2, 0.3, 0x333333), 0, 0.3, 0); add(W.gchair, box(0.3, 0.2, 3, 0x333333), 0, 0.3, 0);
  W.gchair.position.set(LOC.secret.x, 0, -3.5); W.gchair.rotation.y = Math.PI; scene.add(W.gchair);
  W.chips = new THREE.Group(); add(W.chips, box(1.1, 1.5, 0.45, emis(0xffb000, 0.4)), 0, 0, 0); const ct = textPlane('CHIPS', 1.0, 0.45, { bg: '#d62d2d', fg: '#fff', font: '900 260px Inter' }); add(W.chips, ct, 0, 0.1, 0.24); scene.add(W.chips);
  W.secretLight = new THREE.PointLight(0x9fe4ff, 0, 60, 1.1); W.secretLight.position.set(LOC.secret.x, 8, 9); scene.add(W.secretLight);
  W.secretLight2 = new THREE.PointLight(0x5ad8ff, 0, 30, 1.3); W.secretLight2.position.set(LOC.secret.x, 6, -8.5); scene.add(W.secretLight2);

  // ===== props =====
  W.ctrl = controller(); scene.add(W.ctrl);
  W.charger = new THREE.Group(); add(W.charger, box(0.6, 0.5, 0.35, 0xf2f2f2), 0, 0, 0); const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.6, -0.8, 0.3), new THREE.Vector3(1.6, -0.6, 0.6), new THREE.Vector3(2.2, 0, 0.3)]), 20, 0.05, 6), mat(0x222222)); W.charger.add(cable); scene.add(W.charger);
  W.suitcase = new THREE.Group(); add(W.suitcase, box(1.8, 2.2, 0.8, 0x2a9d8f), 0, 1.1, 0); add(W.suitcase, box(0.8, 0.12, 0.12, 0x222222), 0, 2.45, 0); add(W.suitcase, box(1.82, 0.15, 0.82, 0x1f776c), 0, 1.1, 0); for (const x of [-0.6, 0.6]) add(W.suitcase, sph(0.12, 0x111111), x, 0.05, 0.3); scene.add(W.suitcase);
  W.siren = new THREE.Group(); add(W.siren, cyl(0.15, 0.15, 9, 0x666666), 0, 4.5, 0); W.sirenHead = add(W.siren, cyl(0.7, 0.8, 1.0, emis(0xff1a1a, 3)), 0, 9.5, 0); add(W.siren, box(1.8, 0.4, 0.4, 0x777777), 0, 9.0, 0);
  scene.add(W.siren); W.sirenLight = new THREE.SpotLight(0xff1010, 0, 70, 0.6, 0.5, 1); scene.add(W.sirenLight); scene.add(W.sirenLight.target);
  W.oven = new THREE.Group(); add(W.oven, box(5, 5, 3.5, 0x8a8f96, { metalness: 0.6, roughness: 0.3 }), 0, 2.5, 0); add(W.oven, box(3.6, 2.2, 0.2, emis(0xff7a1a, 1.6)), 0, 2.6, 1.72); add(W.oven, box(3.8, 0.25, 0.4, 0x333333), 0, 4.0, 1.9);
  W.oven.position.set(LOC.bakery.x - 13, 0, -6.5); W.oven.rotation.y = 0.5; scene.add(W.oven);
  W.blink = sph(0.12, emis(0xff2020, 4)); scene.add(W.blink);
  W.dumbL = W.tinyDB.clone(); scene.add(W.dumbL);
  W.cookies = []; for (let i = 0; i < 3; i++) { const c = W.cookie.clone(); scene.add(c); W.cookies.push(c); }
  // grandma's backyard hoop behind her house (house at town x=-15, z=-18 facing +z)
  W.backHoop = hoop(); W.backHoop.position.set(LOC.town.x - 15, 0, -38); W.backHoop.rotation.y = Math.PI / 2; scene.add(W.backHoop);
  return W;
}
