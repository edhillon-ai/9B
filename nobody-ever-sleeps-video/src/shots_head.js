import { THREE, scene, camera, setLighting, aimSun, P, lerpPose, makeBall, ease, seg, clamp01, V, arc } from './core.js';
import { makeCast, npc } from './cast.js';
import { buildWorld, LOC, W } from './world.js';
import { buildExtras } from './extras.js';
import { buildExtras3 } from './extras3.js';
import { buildExtras4 } from './extras4.js';
import { buildExtras5 } from './extras5.js';
import { renderer } from './core.js';

let E, ENV, C, teens = [], crowd = [], balls = [];
const PI = Math.PI, S = Math.sin, Cc = Math.cos;
const allChars = [], props = [];

export function setup(TL, env) {
  E = TL.ev; ENV = env;
  buildWorld(); buildExtras(); buildExtras3(); buildExtras4(); buildExtras5();
  C = makeCast();
  for (const k in C) { scene.add(C[k].root); allChars.push(C[k]); }
  for (let i = 0; i < 6; i++) { const n = npc(i); teens.push(n); scene.add(n.root); allChars.push(n); }
  for (let i = 0; i < 12; i++) { const n = npc(i + 3); crowd.push(n); scene.add(n.root); allChars.push(n); }
  for (let i = 0; i < 8; i++) { const b = makeBall(); scene.add(b); balls.push(b); }
  W.crownProp = C.mayor.crown.clone(); W.crownProp.position.set(0, 0, 0); scene.add(W.crownProp);
  for (const [lg, sx] of [[C.alex.legL, 1], [C.alex.legR, -1]]) for (const side of [-1, 1]) { const sw = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.1, 0.75), new THREE.MeshStandardMaterial({ color: 0x111111 })); sw.position.set(side * 0.545, -1.8, 0.1); sw.rotation.x = -0.35; lg.add(sw); }
  props.push(W.pkg, W.loaf, W.cookie, W.trophy, W.phone, W.mascotHead, W.mascotHead2, W.mascotBody, W.contract, W.mic, W.stars, W.brush, W.tinyDB, W.dumbL, W.suv, W.car, W.nightStars, W.moon, W.shards,
    W.ctrl, W.charger, W.crownProp, W.gtable, W.cookiePile, W.chairB, W.mpkg, W.brief, W.check, W.suitcase, W.siren, W.blink, W.chips, W.acWind, ...W.cookies, ...balls,
    W.bug, W.cash, W.burst, ...W.bills, W.phoneN, W.mower, W.grass, W.pizza, W.bucket, W.sponge, W.bubbles, W.boxes, W.bricks, W.shovel, W.dirtFly, W.bushSuit, W.stars2, W.moon2, ...W.richCars,
    W.dj, W.clock, W.streetConf, W.cbucket, W.cup, W.pzStack, ...W.pz, W.mshoes, W.puff, ...W.parcels, W.horn, W.waves, W.machine, W.board, W.cape, W.hairFly, W.handMirror, W.barbell, W.gxConf);
  setupHair();
}

function setupHair() {
  for (const k of ['alex', 'jake', 'mayor', 'baker', 'mailman']) C[k].hairParts = C[k].head.children.filter(c => c.position.y > 0.25);
  const mk = (ch, build) => { const g = new THREE.Group(); build(g); ch.head.add(g); g.visible = false; return g; };
  const B = (g, o, x, y, z) => { o.position.set(x, y, z); g.add(o); return o; };
  const M = (c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.7 });
  const bx = (w, h, d, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c)); m.castShadow = true; return m; };
  const sp = (r, c) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), M(c)); m.castShadow = true; return m; };
  W.cutJake = mk(C.jake, (g) => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.9, 14), M(0x7a4a24)); B(g, st, 0, 0.95, 0); for (let i = 0; i < 11; i++) { const a = i / 11 * Math.PI * 2, r = i < 8 ? 0.62 : 0.25; B(g, sp(i < 8 ? 0.42 : 0.5, i % 2 ? 0x6e4220 : 0x7a4a24), Math.cos(a) * r, i < 8 ? 1.55 : 1.95, Math.sin(a) * r); } });
  W.cutAlex = mk(C.alex, (g) => { B(g, bx(0.04, 0.55, 0.04, 0x141414), 0, 0.85, 0.05); const tip = B(g, bx(0.04, 0.22, 0.04, 0x141414), 0.07, 1.15, 0.05); tip.rotation.z = -0.8; });
  W.cutMayor = mk(C.mayor, (g) => { B(g, bx(1.3, 1.8, 1.3, 0x161210), 0, 1.3, 0); });
  W.cutBaker = mk(C.baker, (g) => { for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.28, 1.7 + (i % 2) * 0.4, 8), M(0x5a3a20)); B(g, c, 0, 1.3 + (i % 2) * 0.2, -0.55 + i * 0.22); } });
  W.cutMail = mk(C.mailman, (g) => { B(g, bx(0.62, 0.3, 1.25, 0x3a2414), 0.33, 0.6, 0); for (let i = 0; i < 3; i++) B(g, sp(0.16, 0x3a2414), -0.35, 0.65, -0.4 + i * 0.4); });
}
const hair = (ch, on) => ch.hairParts.forEach(p => p.visible = on);
// ---------- helpers ----------
const L = (loc, x, y, z) => V(LOC[loc].x + x, y, LOC[loc].z + z);
function cam(loc, p, l, fov = 40) { camera.position.copy(L(loc, ...p)); camera.up.set(0, 1, 0); camera.lookAt(L(loc, ...l)); camera.fov = fov; camera.updateProjectionMatrix(); }
const face = (x0, z0, x1, z1) => Math.atan2(x1 - x0, z1 - z0);
const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
function put(ch, loc, x, y, z, ry, pose, expr) { if (expr && (expr.mouth === 'shout' || expr.mouth === 'o')) expr = Object.assign({}, expr, { mouth: 'flat' }); ch.root.visible = true; ch.place(LOC[loc].x + x, y, LOC[loc].z + z, ry); if (pose) ch.pose(pose); ch.cur = expr || {}; ch.setExpr(ch.cur); return ch; }
function talk(ch, name, T) {
  const [a, b] = E[name]; if (T < a || T > b) return;
  const env = ENV[name]; const o = env[Math.min(Math.floor((T - a) * 30), env.length - 1)] || 0;
  const m = ch.cur.mouth; ch.setExpr(Object.assign({}, ch.cur, { open: o > 0.12 ? 0.25 + o * 0.75 : 0, mouth: (m === 'shout' || m === 'o') ? 'smile' : (m || 'smile') }));
}
const hussU = (T, names, w = 0.45) => { let u = 0; for (const n of names) { const k = (T - E[n][0] + 0.08) / w; if (k > 0 && k < 1) u = Math.max(u, S(k * PI)); } return u; };
const hussK = (T, names) => names.filter(n => T >= E[n][0]).length;
const ballAt = (b, p) => { b.visible = true; b.position.copy(p); };
function dribble(b, ch, t, rate = 1, side = -1) { const p = t * 9 * rate; ch.root.updateMatrixWorld(true); ballAt(b, ch.root.localToWorld(V(side * 1.5, 0.55 + 2.0 * Math.abs(Cc(p / 2)), 1.3))); b.rotation.x = p; }
function hold(b, ch, side = 'R', off = [0, -0.3, 0.4]) { ballAt(b, ch.handWorld(side).add(V(...off))); }
const lights = (o) => setLighting(o);
const sunAt = (loc, x = 0, z = 0, dir) => aimSun(L(loc, x, 0, z), dir);
const flr = { court: 0.1, town: 0.35, lawn: 0.02, garage: 0.2, party: 0.12, bakery: 0.12, gym: 0.1, yard: 0.02, walk: 0.35, secret: 0.2 };
const day = () => lights({});
const interior = (o = {}) => lights(Object.assign({ sky: 0x2a2a35, sun: 1.6, hemi: 0.95, hemiSky: 0xfff1e0, hemiGround: 0x8a7a6a }, o));
const garageL = () => { interior({ sun: 1.3, hemi: 0.95, hemiSky: 0xfff0dd }); sunAt('garage', 0, 0); W.bulb.intensity = 160; };
const gymL = () => { interior({ sun: 1.5, hemi: 1.1, hemiSky: 0xfff8ee, hemiGround: 0xb08a60 }); sunAt('gym', 0, 0, [8, 30, 12]); W.gymLight.intensity = 400; };
const secretL = () => { lights({ sky: 0x05060a, sun: 0.5, sunColor: 0x88aaff, hemi: 0.75, hemiSky: 0x6080c0, hemiGround: 0x202030, exposure: 1.15 }); sunAt('secret', 0, 0); W.secretLight.intensity = 240; W.secretLight2.intensity = 160; };
const partyL = (T) => { interior({ sun: 0.3, hemi: 0.5, hemiSky: 0xb36bff, hemiGround: 0x301040 }); sunAt('party', 0, 0); W.partyLights.forEach((l, i) => { l.intensity = 260; const a = T * 1.7 + i * PI / 2; l.position.set(LOC.party.x + Math.cos(a) * 11, 9, Math.sin(a) * 8); }); W.disco.rotation.y = T * 2; W.partyConfetti.visible = true; W.partyConfetti.update(T); };
function stars(ch, t) { W.stars.visible = true; const h = ch.headWorld(); W.stars.children.forEach((s, i) => { const a = t * 6 + i * 1.256; s.position.set(h.x + Math.cos(a), h.y + 0.9, h.z + Math.sin(a)); s.rotation.y = t * 5; }); }
// extra poses
const Q = {
  curl: (t, u, shake = 0) => ({ body: [0.08, 0, S(t * 40) * 0.02 * shake], bodyY: 1.85, neck: [0.15, 0, S(t * 33) * 0.05 * shake], armL: [-0.15 - u * 1.9 + S(t * 47) * 0.06 * shake, 0, 0.12], armR: [-0.15 - u * 1.9 + S(t * 51) * 0.06 * shake, 0, -0.12], legL: [-0.3, 0, 0.22], legR: [-0.3, 0, -0.22] }),
  squat: (t, u) => ({ body: [0.25 * u, 0, 0], bodyY: 2 - u * 1.25, neck: [-0.1, 0, 0], armL: [-1.57 * Math.max(u, 0.4), 0, 0.05], armR: [-1.57 * Math.max(u, 0.4), 0, -0.05], legL: [-u * 1.45, 0, 0.12], legR: [-u * 1.45, 0, -0.12] }),
  stretch: (t) => ({ body: [0, 0, S(t * 3) * 0.45], bodyY: 2, neck: [0, 0, S(t * 3) * 0.2], armL: [0, 0, 2.9], armR: [0, 0, -2.9], legL: [0, 0, 0.3], legR: [0, 0, -0.3] }),
  kick: (u) => ({ body: [-0.35 * u, 0, 0], bodyY: 2, neck: [0.1, 0, 0], armL: [-0.8, 0, 0.9], armR: [-0.4, 0, -1.2], legL: [0, 0, 0], legR: [-1.6 * u, 0, 0] }),
  hop: (t) => ({ body: [0.15, 0, S(t * 14) * 0.15], bodyY: 2 + Math.abs(S(t * 9)) * 0.8, neck: [-0.3, 0, S(t * 9) * 0.2], armL: [-2.8, 0, 0.6 + S(t * 20) * 0.3], armR: [-0.9, 0, -0.4], legL: [0, 0, 0], legR: [0.9, 0, -0.2] }),
  panic: (t) => ({ body: [0, S(t * 9) * 0.3, 0], bodyY: 2 + Math.abs(S(t * 12)) * 0.3, neck: [0, S(t * 13) * 0.4, 0], armL: [-0.3, 0, 2.6 + S(t * 25) * 0.4], armR: [-0.3, 0, -2.6 - S(t * 25) * 0.4], legL: [S(t * 12) * 0.5, 0, 0.1], legR: [-S(t * 12) * 0.5, 0, -0.1] }),
  pad: (t, mash = 0) => ({ body: [0.12, 0, 0], bodyY: 2, neck: [0.25, 0, 0], armL: [-1.15 + S(t * 37) * 0.12 * mash, 0, -0.35], armR: [-1.15 + S(t * 41) * 0.12 * mash, 0, 0.35], legL: [0, 0, 0], legR: [0, 0, 0] }),
  layup: (u) => ({ body: [-0.1, 0, 0], bodyY: 2, neck: [-0.4, 0, 0], armL: [-0.6, 0, 0.3], armR: [-2.9 * Math.min(1, u * 1.3), 0, 0], legL: [-1.2 * S(u * PI), 0, 0], legR: [0.3, 0, 0] }),
  backThrow: (u) => ({ body: [-0.5 * u, 0, 0], bodyY: 2, neck: [-0.6 * u, 0, 0], armL: [-3.1 * u, 0, -0.2], armR: [-3.1 * u - 0.4 * u, 0, 0.2], legL: [0.1, 0, 0], legR: [-0.1, 0, 0] }),
};
function resetAll() {
  for (const c of allChars) { c.reset(); c.root.visible = false; c.cur = {}; c.setExpr({}); if (c.headband) c.headband.visible = false; c.head.visible = true; }
  for (const p of props) { if (!p) continue; p.visible = false; p.rotation.set(0, 0, 0); p.scale.setScalar(1); }
  C.mayor.crown.visible = true; C.coach.shades.visible = false;
  W.squareConfetti.visible = false; W.courtConfetti.visible = false; W.partyConfetti.visible = false;
  W.partyLights.forEach(l => l.intensity = 0); for (const k of ['bulb', 'bakeryLight', 'lampLight', 'homeLight', 'gymLight', 'secretLight', 'secretLight2', 'doorGlow', 'sirenLight', 'glow', 'gwinLight', 'officeLight', 'gmLight', 'gmLight2', 'admLight']) W[k].intensity = 0; W.flapL.rotation.z = 0; W.flapR.rotation.z = 0; W.pkgCookies.visible = true; W.money.visible = true; W.briefLid.rotation.x = 0; W.curL.position.set(-2.2, 6.1, 0.1); W.curR.position.set(2.2, 6.1, 0.1);
  W.tourney.visible = false; W.adoor.rotation.y = 0; W.bushSuit.children.forEach(c => c.visible = true); W.richCars.forEach((c, i) => { c.userData.p0 = c.userData.p0 || c.position.clone(); c.position.copy(c.userData.p0); c.rotation.y = i % 2 ? PI : 0; }); C.mayor.crown.visible = false; W.car.rotation.set(0, 0, 0);
  for (const k of ['alex', 'jake', 'mayor', 'baker', 'mailman']) hair(C[k], true); C.alex.headband.visible = false; C.mayor.crown.visible = false; for (const k of ['cutJake', 'cutAlex', 'cutMayor', 'cutBaker', 'cutMail']) W[k].visible = false;
  C.mailman.legL.children[2].visible = true; C.mailman.legR.children[2].visible = true; W.mLid.rotation.x = 0; W.pole.position.y = 3.0; W.pole.visible = false; W.clip.rotation.set(0, 0, 0); W.clip.visible = false; W.bdoor.rotation.y = 0;
  for (const k of ['wgymLight', 'ovenLight', 'lampB', 'hallLight', 'boothLight']) W[k].intensity = 0; W.streetLights.forEach(l => l.intensity = 0); for (const c of allChars) c.root.rotation.x = 0; W.gchair.visible = true; W.coachDoor.rotation.y = 0; W.ctrl.userData.led.material = W.ctrl.userData.led.material; W.ctrl.userData.led.visible = true;
}
const SH = []; const shot = (a, f) => SH.push({ a, f });
export function debugCam(p, l, fov) { camera.position.set(...p); camera.lookAt(...l); camera.fov = fov; camera.updateProjectionMatrix(); }
export function renderShot(T, ov) {
  resetAll(); if (!SH.length) build();
  let i = SH.length - 1; while (i > 0 && T < SH[i].a) i--;
  const s = SH[i], b = i + 1 < SH.length ? SH[i + 1].a : 90; s.f(T - s.a, T, b - s.a, ov);
}

