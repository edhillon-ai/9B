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

function build() {
  const e0 = (n) => E[n][0], e1 = (n) => E[n][1];
  const night = () => lights({ sky: 0x0b1030, sun: 0.5, sunColor: 0x8899ff, hemi: 0.65, hemiSky: 0x5a78c8, hemiGround: 0x151525, exposure: 1.15 });
  const morning = () => lights({ sky: 0xbfe6ff, sunColor: 0xfff0d0, sun: 2.4, hemi: 1.15 });
  const rel = (ch, x, y, z) => { ch.root.updateMatrixWorld(true); return ch.root.localToWorld(V(x, y, z)); };
  const dutch = (a) => camera.rotateZ(a);
  const shake = (t, a = 0.15, f = 60) => { camera.position.x += S(t * f) * a; camera.position.y += S(t * f * 1.3) * a; };
  const AB = (on = true) => { C.alex.headband.visible = on; };
  const nightSky = (loc, x = 0, z = 0) => { W.stars2.visible = true; W.stars2.position.copy(L(loc, x, 0, z)); W.moon2.visible = true; W.moon2.position.copy(L(loc, x - 60, 110, z - 180)); };
  function drive(ch, car, pos, ry, t, expr) { car.visible = true; car.position.copy(pos); car.rotation.y = ry;
    put(ch, 'town', 0, 0, 0, ry + PI / 2, P.sitChair(t, 1.4), expr); ch.root.position.copy(pos).add(V(-1.4 * Cc(ry), 0, 1.4 * S(ry))); ch.body.position.y = 2.0;
    ch.pose({ armL: [-1.2, 0, 0.1], armR: [-1.2, 0, -0.1] }); }
  const lieDown = (ch, loc, x, y, z, expr, pose) => { put(ch, loc, x, y, z, 0, Object.assign(P.idle(0), { armL: [0, 0, 0.1], armR: [0, 0, -0.1], neck: [0, 0, 0] }, pose || {}), expr); ch.root.rotation.x = -PI / 2; };
  // 4 AM party
  function party(T, o = {}) {
    W.streetConf.visible = true; W.streetConf.position.copy(L('rich', o.cx ?? 0, 0, o.cz ?? 0)); W.streetConf.update(T);
    W.streetLights.forEach((l, i) => { l.intensity = 320; const a = T * 1.6 + i * PI / 2; l.position.copy(L('rich', (o.cx ?? 0) + Cc(a) * 12, 9, (o.cz ?? 0) + S(a) * 8)); });
    W.dj.visible = true; W.clock.visible = true; W.richCars.forEach(c => c.visible = true);
    const spots = o.spots || [[-20, -8.8], [-14, -9.2], [-8, 3], [-3, -2], [4, 2], [9, -3], [16, 8.8], [22, 9], [-26, 9], [28, -8.8], [0, 6], [-12, 6]];
    spots.forEach(([x, z], i) => { if (i >= crowd.length) return; put(crowd[i], 'rich', x, Math.abs(z) > 6 ? flr.walk : 0.05, z, face(x, z, o.cx ?? 0, 0) * 0.3 + (i % 3) * 0.5, P.dance(T + i * 0.37, i % 4), { mouth: 'grin', eyeScale: 1.15 }); });
    put(teens[0], 'rich', 12, 3.9, -9.6, 0, P.dance(T, 1), { mouth: 'grin' }); // DJ
  }
  const gymL = () => { interior({ sun: 1.2, hemi: 1.05, hemiSky: 0xfff6ec }); sunAt('wgym', 0, 0); W.wgymLight.intensity = 320; };
  const tread = (T, sp = 1) => { W.beltTex.offset.y = -T * 3 * sp; };
  const TX = -8, TZ = -5.6, TY = 0.9; // treadmill runner spot (gym local)
  // ================= SCENE 1 =================
  shot(0, (t, T, d, ov) => { // the whole town partying at 4 AM
    night(); sunAt('rich', 0, 0, [-20, 30, 20]); nightSky('rich'); party(T);
    const u = ease.io(t / d); cam('rich', mix([-38, 30, 34], [-20, 14, 20], u), mix([4, 2, -6], [4, 4, -4], u), 46);
  });
  shot(() => E.n1[1] + 0.05, (t, T, d, ov) => { // 4:00 AM clock, dancers
    night(); sunAt('rich', -7, -6, [-20, 30, 20]); nightSky('rich'); party(T, { cx: -8, cz: -4 });
    const u = ease.out(seg(t, 0, d)); cam('rich', mix([-3, 6, 4], [-4.5, 8.5, -1], u), [-7, 9.4, -8.6], 48);
  });
  shot(() => e0('n1b') + 1.2, (t, T, d, ov) => { // something terrible... (ominous window)
    night(); sunAt('gm', 0, 0, [-20, 30, 20]); nightSky('gm'); W.gmLight.intensity = 60;
    const u = ease.in(seg(t, 0, d)); cam('gm', mix([0, 6, 24], [0, 9, 4], u), [0, 9, -13], 44 - u * 10);
    if (t > d - 0.25) ov.flash(0.35 * seg(t, d - 0.25, d));
  });
  const plank = (ch, loc, x, y, z, ry, u, expr) => { const a = 0.2 + 0.25 * u; put(ch, loc, x, y, z, ry, Object.assign(P.idle(0), { armL: [-PI / 2 + a - 0.6 * (1 - u), 0, 0.15], armR: [-PI / 2 + a - 0.6 * (1 - u), 0, -0.15], legL: [0, 0, 0.05], legR: [0, 0, -0.05], neck: [-0.7, 0, 0], body: [0, 0, 0], bodyY: 2 }), expr); ch.root.rotation.order = 'YXZ'; ch.root.rotation.x = PI / 2 - a; };
  const pushG = (t, T, expr) => plank(C.grandma, 'gm', 0, 0.5, 9.5, 0, (S(t * 9) + 1) / 2, expr);
  shot(() => e0('pushup'), (t, T, d, ov) => { // grandma doing push-ups outside her mansion
    night(); sunAt('gm', 0, 12, [-20, 30, 20]); nightSky('gm'); W.gmLight.intensity = 260; W.gmLight2.intensity = 180;
    pushG(t, T, { mouth: 'grit', brow: 0.9 }); talk(C.grandma, 'g_sleep', T);
    const u = ease.out(seg(t, 0, 0.5)); cam('gm', mix([14, 3.5, 13], [12.5, 2.8, 12.5], u), [0, 1.8, 12], 42);
  });
  shot(() => e0('g_sleep') + 1.0, (t, T, d, ov) => { // SLEEP IS FOR THE UNEMPLOYED (close)
    night(); sunAt('gm', 0, 12, [-20, 30, 20]); nightSky('gm'); W.gmLight.intensity = 260; W.gmLight2.intensity = 180;
    pushG(t * 1.3, T, { mouth: 'grit', brow: 0.9 }); talk(C.grandma, 'g_sleep', T);
    const h = C.grandma.headWorld(); camera.position.set(h.x + 2.2, h.y - 0.3, h.z + 2.6); camera.lookAt(h); camera.fov = 42; camera.updateProjectionMatrix(); dutch(-0.15);
  });
  shot(() => e0('sleepy'), (t, T, d, ov) => { // Alex can barely keep his eyes open
    night(); sunAt('rich', 0, -10, [-20, 30, 20]); nightSky('rich'); party(T, { spots: [[-6, -3], [6, -2], [-10, 4], [9, 5]] });
    const nod = Math.max(0, S(t * 2.4)) ; const snap = t > 1.25 && t < 1.45;
    put(C.alex, 'rich', 0, flr.walk, -9, 0.1, lerpPose(P.idle(t), { neck: [nod * 0.5, 0, 0], body: [nod * 0.1, 0, 0] }, 1), { mouth: 'flat', eyeOpen: snap ? 1.2 : 1 - nod * 0.9, lid: snap ? 0 : 0.5, eyeScale: snap ? 1.5 : 1 });
    const u = ease.io(t / d); cam('rich', mix([0, 4.9, -3.5], [0, 4.8, -5.2], u), [0, 4.5, -9], 40);
  });
  // ================= SCENE 2 =================
  shot(() => E.sleepy[1], (t, T, d, ov) => { // gym: training to never sleep again
    gymL(); tread(T, 0.6); put(C.alex, 'wgym', TX, TY, TZ, PI, P.run(t, 0.8), { mouth: 'flat', brow: 0.8 }); AB();
    const u = ease.io(t / d); cam('wgym', mix([8, 8, 10], [2, 6, 4], u), [TX, 4, TZ], 46);
  });
  shot(() => e0('h1') - 0.1, (t, T, d, ov) => { // HUSS - treadmill sprint
    gymL(); tread(T, 2.5); put(C.alex, 'wgym', TX, TY, TZ, PI, P.run(t, 2.2), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h1', T);
    cam('wgym', [TX - 2, 1.4, TZ - 5.5], [TX, 4.5, TZ], 54); dutch(0.22); shake(t, 0.06 * hussU(T, ['h1']));
  });
  shot(() => e0('h2') - 0.06, (t, T, d, ov) => { // HUSS - push-ups
    gymL(); plank(C.alex, 'wgym', -2, 0.5, 4, PI / 2, (S(t * 16) + 1) / 2, { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h2', T);
    cam('wgym', [1, 1.2, 10], [1, 2, 4], 50); dutch(-0.15);
  });
  shot(() => e0('h3') - 0.06, (t, T, d, ov) => { // HUSS - barbell press
    gymL(); const u = clamp01(t / 0.35); put(C.alex, 'wgym', 8, 0.1, 6, 0, Object.assign(Q.squat(t, 0.4 * (1 - u)), { armL: [-PI + 0.15 - (1 - u) * 1.2, 0, 0.35], armR: [-PI + 0.15 - (1 - u) * 1.2, 0, -0.35] }), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h3', T);
    W.barbell.visible = true; const a = C.alex.handWorld('L'), b = C.alex.handWorld('R'); W.barbell.position.copy(a.add(b).multiplyScalar(0.5));
    cam('wgym', [8.6, 1.2, 14], [8, 6, 6], 54); if (t > 0.3 && t < 0.38) ov.flash(0.35); dutch(0.12);
  });
  shot(() => e0('a_btw') - 0.15, (t, T, d, ov) => { // while they're out partying, by the way
    gymL(); tread(T, 0.9); put(C.alex, 'wgym', TX, TY, TZ, PI, Object.assign(P.run(t, 0.9), { neck: [0, -0.7, 0] }), { mouth: 'flat', lid: 0.3, sweat: true }); AB(); talk(C.alex, 'a_btw', T);
    cam('wgym', [TX + 3.6, 5.6, TZ + 3.4], [TX, 5.2, TZ], 40);
  });
  shot(() => e0('party2'), (t, T, d, ov) => { // Jake partying outside the gym
    night(); sunAt('gymx', 0, 6, [-20, 30, 20]); nightSky('gymx'); W.gxConf.visible = true; W.gxConf.update(T);
    W.streetLights.forEach((l, i) => { l.intensity = 260; const a = T * 1.6 + i * PI / 2; l.position.copy(L('gymx', Cc(a) * 9, 8, 8 + S(a) * 5)); });
    put(C.jake, 'gymx', 0, flr.walk, 8, 0.2, P.dance(t, 0), { mouth: 'grin', eyeScale: 1.1 });
    [[-4, 7], [4, 7.5], [-7, 9], [7, 9.5]].forEach(([x, z], i) => put(teens[i + 1], 'gymx', x, flr.walk, z, face(x, z, 0, 14) * 0.5, P.dance(T + i * 0.6, (i + 1) % 4), { mouth: 'grin' }));
    const u = ease.io(t / d); cam('gymx', mix([3, 4, 22], [1.5, 5, 16], u), [0, 5, 6], 50);
  });
  shot(() => e0('doze'), (t, T, d, ov) => { // falls asleep on the treadmill, slides into the mats
    gymL(); const k = seg(t, 0.55, 1.15), land = t >= 1.15; tread(T, 1);
    const ex = { mouth: 'flat', eyeOpen: t < 0.5 ? 1 - t * 1.8 : 0.05 };
    if (k <= 0) put(C.alex, 'wgym', TX, TY, TZ, PI, lerpPose(P.run(t, 0.9 - t), { neck: [t * 0.9, 0, 0] }, 1), ex);
    else if (!land) { put(C.alex, 'wgym', TX, TY + 0.2 - k * 0.4, TZ + k * 6.5, PI, P.fallBack(Math.min(1, k * 2)), ex); }
    else put(C.alex, 'wgym', TX, 2.4, TZ + 7.5, PI, P.fallBack(1), { mouth: 'flat', eyeOpen: 0.05 });
    AB(); if (land && t < 1.3) shake(t, 0.05);
    cam('wgym', [TX + 8, 3.6, TZ + 4], [TX, 2.4, TZ + 3], 48);
  });
  shot(() => e0('a_awake'), (t, T, d, ov) => { // I'M AWAKE!
    gymL(); put(C.alex, 'wgym', TX, 3.1, TZ + 7.5, PI - 0.6, Q.panic(t), { mouth: 'shout', eyeScale: 1.6, brow: -0.5, sweat: true }); AB(); talk(C.alex, 'a_awake', T);
    const z = ease.out(seg(t, 0, 0.2)); cam('wgym', mix([TX + 5, 8, TZ + 16], [TX + 3, 8, TZ + 13.5], z), [TX, 7.4, TZ + 7.5], 44); shake(t, 0.03);
  });
  // ================= SCENE 3 =================
  const bakeL = () => { interior({ sun: 1.4, hemi: 1.05, hemiSky: 0xfff1d8 }); sunAt('bakery', 0, 0); W.bakeryLight.intensity = 220; W.ovenLight.intensity = 120; };
  const BKX = 6, BKZ = 2.5; // baker spot
  const baker = (t, expr, pose) => put(C.baker, 'bakery', BKX, 0.12, BKZ, -0.4, pose || P.idle(t), expr);
  const bucketTo = (t, u) => { W.cbucket.visible = true; const h = C.baker.headWorld(); W.cbucket.position.copy(h.clone().add(V(-0.3 * u, -0.6 + u * 0.6, 2.0 - u * 0.4))); W.cbucket.rotation.set(u * 1.2, -0.4, 0); };
  shot(() => e0('n3') - 0.1, (t, T, d, ov) => { // bakery: baker chugging an enormous bucket of coffee
    bakeL(); const u = ease.io(seg(t, 0.4, 1.0)); baker(t, { mouth: 'flat', eyeOpen: 0.05 }, lerpPose(P.idle(t), { armL: [-2.2 * u - 0.6, 0, 0.3], armR: [-2.2 * u - 0.6, 0, -0.3], neck: [-0.5 * u, 0, 0] }, 1)); bucketTo(t, u);
    put(C.alex, 'bakery', 0, 0.12, 6, face(0, 6, BKX, BKZ), P.walk(t, 0.5), { mouth: 'flat', eyeScale: 1.2 }); AB(); C.alex.root.position.x += Math.min(t, 1) * 1.2 - 1.2;
    const k = ease.io(t / d); cam('bakery', mix([13, 7, 8.5], [11, 6, 8.2], k), [BKX - 1, 4.5, BKZ], 46);
  });
  shot(() => e0('n3') + 1.8, (t, T, d, ov) => { // close: glug glug
    bakeL(); baker(t, { mouth: 'flat', eyeOpen: 0.05 }, lerpPose(P.idle(t), { armL: [-2.8, 0, 0.3], armR: [-2.8, 0, -0.3], neck: [-0.5, 0, 0] }, 1)); bucketTo(t, 1);
    W.cbucket.rotation.x = 1.2 + S(t * 6) * 0.08;
    camera.position.copy(L('bakery', BKX + 4, 6, BKZ + 6.5)); camera.lookAt(L('bakery', BKX - 0.5, 5.2, BKZ + 0.5)); camera.fov = 44; camera.updateProjectionMatrix();
  });
  const alexBk = (t, expr, pose) => { put(C.alex, 'bakery', 1.4, 0.12, 6, face(1.4, 6, BKX, BKZ), pose || P.idle(t), expr); AB(); };
  shot(() => e0('a_coffee') - 0.05, (t, T, d, ov) => { // how much coffee do you drink?
    bakeL(); baker(t, { mouth: 'smirk', lid: 0.3 }, lerpPose(P.idle(t), { armL: [-0.6, 0, 0.4] }, 1)); W.cbucket.visible = true; W.cbucket.position.copy(rel(C.baker, 1.9, 1.4, 0.6)); W.cbucket.rotation.set(0, 0, 0);
    alexBk(t, { mouth: 'smile', brow: 0.3 }, P.talkGesture(t)); talk(C.alex, 'a_coffee', T);
    cam('bakery', [BKX + 2.2, 6.2, BKZ - 2.6], [1.4, 4.6, 6], 40);
  });
  shot(() => E.a_coffee[1], (t, T, d, ov) => { // Yes.
    bakeL(); baker(t, { mouth: 'flat', lid: 0.35, eyeScale: 1.1 }, lerpPose(P.idle(t), { armL: [-0.6, 0, 0.4] }, 1)); talk(C.baker, 'b_yes', T); W.cbucket.visible = true; W.cbucket.position.copy(rel(C.baker, 1.9, 1.4, 0.6));
    alexBk(t, { mouth: 'flat' });
    const z = ease.out(seg(t, 0, 0.25)); const h = C.baker.headWorld(); camera.position.set(h.x - 1.6 + z * 0.4, h.y + 0.2, h.z + 3.8 - z * 1.0); camera.lookAt(h); camera.fov = 40; camera.updateProjectionMatrix();
  });
  const pizzaParty = (t, T, n) => { // pizzas flying from oven to stack
    const o = L('bakery', 10.5, 2.5, -3.2), s = L('bakery', 9.5, 0.12, 4.5); W.pzStack.visible = true; W.pzStack.position.copy(s);
    const cnt = Math.min(18, Math.floor(n)); W.pzStack.children.forEach((c, i) => c.visible = i < cnt);
    W.pz.forEach((p, i) => { const k = ((t * 3.2) + i / W.pz.length * 4) % 1; if (i > 14) { p.visible = false; return; } p.visible = true; p.position.copy(arc(o, s.clone().add(V(0, cnt * 0.28 + 0.3, 0)), 2.5, k)); p.rotation.set(k * 6, k * 4, 0); }); };
  shot(() => e0('pizzas'), (t, T, d, ov) => { // 100 pizzas at ridiculous speed
    bakeL(); const blur = (a) => [-1.4 + S(T * 47 + a) * 0.9, S(T * 31 + a) * 0.6, S(T * 43 + a) * 0.5];
    put(C.baker, 'bakery', 9.5, 0.12, 0.5, PI / 2 + 0.5, Object.assign(P.idle(t), { armL: blur(0), armR: blur(2), body: [0.1, S(T * 20) * 0.15, 0] }), { mouth: 'grit', brow: 0.6, sweat: false }); pizzaParty(t, T, 3 + t * 8);
    W.ovenFire.material.emissiveIntensity = 2 + S(T * 20);
    if (t < 1.0) cam('bakery', [6, 4.6, 6.5], [10, 3, 0], 46); else { alexBk(t, { mouth: 'flat', eyeScale: 1.55 }); cam('bakery', [-2, 7.5, 11], [7, 3.5, 1], 48); }
  });
  shot(() => e0('sip'), (t, T, d, ov) => { // Alex tries one sip
    bakeL(); const u = ease.io(seg(t, 0.1, 0.45)) * (1 - seg(t, 0.75, 0.95));
    alexBk(t, { mouth: 'flat', eyeOpen: u > 0.6 ? 0.1 : 1, eyeScale: t > 0.9 ? 1.6 : 1 }, lerpPose(P.idle(t), { armR: [-1.0 - u * 1.25, 0, -0.35 + u * 0.1], neck: [-0.3 * u, 0, 0] }, 1));
    W.cup.visible = true; W.cup.position.copy(C.alex.handWorld('R').add(V(0, 0.4, 0))); W.cup.rotation.set(0, 0, u * -1.2);
    const h = C.alex.headWorld(); const z = ease.in(seg(t, 0.85, 1.1)); camera.position.copy(h.clone().add(V(2.9 - z * 1.0, 0.3, -0.9 + z * 0.3))); camera.lookAt(h); camera.fov = 42; camera.updateProjectionMatrix();
  });
  const vib = (t, a = 0.18) => { C.alex.root.position.x += S(t * 97) * a; C.alex.root.position.z += S(t * 83) * a; C.alex.root.rotation.y += S(t * 71) * 0.12; };
  shot(() => e0('f1') - 0.05, (t, T, d, ov) => { // HUSS x5 vibrating
    bakeL(); alexBk(t, { mouth: 'grit', eyeScale: 1.7, brow: 1, pupil: 0.5 }, Q.panic(t * 3)); talk(C.alex, ['f1', 'f2', 'f3', 'f4', 'f5'].find(n => T >= E[n][0] && T <= E[n][1]) || 'f1', T); vib(T);
    W.cup.visible = true; W.cup.position.copy(C.alex.handWorld('R').add(V(0, 0.4, 0)));
    const h = C.alex.headWorld(); camera.position.copy(h.clone().add(V(3.0, 0.3, -1.0))); camera.lookAt(h); camera.fov = 46; camera.updateProjectionMatrix(); shake(T, 0.08, 90); dutch(S(T * 9) * 0.15);
  });
  shot(() => e0('f4') - 0.05, (t, T, d, ov) => { // wide: still vibrating, baker unbothered
    bakeL(); alexBk(t, { mouth: 'grit', eyeScale: 1.7, brow: 1 }, Q.panic(t * 3)); for (const n of ['f4', 'f5']) talk(C.alex, n, T); vib(T, 0.3);
    baker(t, { mouth: 'flat', lid: 0.4 }, lerpPose(P.idle(t), { armL: [-0.6, 0, 0.4] }, 1)); W.cbucket.visible = true; W.cbucket.position.copy(rel(C.baker, 1.9, 1.4, 0.6));
    cam('bakery', [7.5, 6, 8.3], [2.5, 4, 4.5], 52); shake(T, 0.05, 90);
  });
  // ================= SCENE 4 =================
  const parcelsFly = (T, x0, dir) => W.parcels.forEach((p, i) => { const k = ((T * 2.2) + i / 8) % 1; const sx = x0 + dir * (i * 9 - 30); p.visible = true; p.position.copy(arc(L('rich', sx, 3, 8.6), L('rich', sx + dir * 4, 0.8, 24), 4, k)); p.rotation.set(k * 5, k * 3, 0); });
  shot(() => E.vibe[1], (t, T, d, ov) => { // mailman sprinting around town delivering at incredible speed
    day(); sunAt('rich', 0, 10); parcelsFly(T, 0, 1);
    const x = -40 + t * 55; put(C.mailman, 'rich', x, flr.walk, 8.6, PI / 2, P.run(t, 3), { mouth: 'grit', brow: 0.8, eyeScale: 1.25 });
    W.puff.visible = true; W.puff.children.forEach((p, i) => { const u = p.userData; const k = (t * 3 + u.s) % 1; p.position.copy(L('rich', x - 1 - k * 6, 0.6 + k * 0.8, 8.6 + Cc(u.a) * 0.8)); p.scale.setScalar(0.4 + k); });
    cam('rich', [x - 4, 2.5, -2], [x + 4, 3, 10], 52);
  });
  shot(() => e0('n4') + 1.45, (t, T, d, ov) => { // zips around Alex, screeches to a stop
    day(); sunAt('rich', 0, -8);
    put(C.alex, 'rich', 0, flr.walk, -9, 0.3, P.idle(t), { mouth: 'flat', eyeScale: 1.2, look: [S(t * 8), 0] }); AB();
    const stop = 1.55, k = Math.min(t, stop); const a = k * 9; const r = 3.2;
    if (t < stop) put(C.mailman, 'rich', Cc(a) * r, flr.walk, -9 + S(a) * r, -a, P.run(t, 3), { mouth: 'grit', eyeScale: 1.3 });
    else put(C.mailman, 'rich', 2.8, flr.walk, -6.6, face(2.8, -6.6, 0, -9), lerpPose(P.idle(t), { body: [-0.3, 0, 0] }, 1), { mouth: 'grit', eyeScale: 1.3 });
    W.puff.visible = t > stop - 0.1; W.puff.children.forEach((p, i) => { const u = p.userData; const k2 = clamp01((t - stop) * 1.5 + u.s * 0.2); p.position.copy(L('rich', 2.8 + Cc(u.a) * (0.5 + k2 * 2), 0.6 + k2, -6.6 + S(u.a) * (0.5 + k2 * 2))); p.scale.setScalar(1 - k2 * 0.7); });
    cam('rich', [4, 6, 3], [0.8, 3.5, -8], 50);
  });
  const mailIdle = (t) => lerpPose(P.idle(t), { bodyY: 2 + Math.abs(S(t * 14)) * 0.25, armL: [-0.3 + S(t * 14) * 0.3, 0, 0.2], armR: [-0.3 - S(t * 14) * 0.3, 0, -0.2] }, 1);
  shot(() => e0('a_slept'), (t, T, d, ov) => { // when was the last time you slept?
    day(); sunAt('rich', 0, -8);
    put(C.mailman, 'rich', 2.8, flr.walk, -6.6, face(2.8, -6.6, 0, -9), mailIdle(t), { mouth: 'grin', eyeScale: 1.35, lid: 0 });
    put(C.alex, 'rich', 0, flr.walk, -9, face(0, -9, 2.8, -6.6), P.talkGesture(t), { mouth: 'smile', brow: 0.3 }); AB(); talk(C.alex, 'a_slept', T);
    cam('rich', [5.2, 5.4, -10.4], [0.4, 4.6, -8.6], 40);
  });
  shot(() => E.a_slept[1], (t, T, d, ov) => { // before GTA 5 came out
    day(); sunAt('rich', 0, -8);
    put(C.mailman, 'rich', 2.8, flr.walk, -6.6, face(2.8, -6.6, 0, -9), mailIdle(t), { mouth: 'grin', eyeScale: 1.35, brow: S(t * 20) > 0.6 ? 0.8 : 0.2 }); talk(C.mailman, 'm_gta', T);
    put(C.alex, 'rich', 0, flr.walk, -9, face(0, -9, 2.8, -6.6), P.idle(t), { mouth: 'flat', eyeScale: 1.1 }); AB();
    const h = C.mailman.headWorld(); const z = ease.io(seg(t, 0, d)); camera.position.set(h.x - 2.4 + z * 0.6, h.y + 0.4, h.z - 3.4 + z * 1.0); camera.lookAt(h); camera.fov = 40; camera.updateProjectionMatrix(); shake(t, 0.015, 80);
  });
  shot(() => e0('a_bro') - 0.05, (t, T, d, ov) => { // BRO!
    day(); sunAt('rich', 0, -8);
    put(C.alex, 'rich', 0, flr.walk, -9, face(0, -9, 2.8, -6.6), lerpPose(P.idle(t), { armL: [-0.7, 0, 0.9], armR: [-0.7, 0, -0.9], neck: [-0.15, 0, 0] }, 1), { mouth: 'shout', brow: -0.5, eyeScale: 1.5 }); AB(); talk(C.alex, 'a_bro', T);
    const h = C.alex.headWorld(); const z = ease.out(seg(t, 0, 0.15)); camera.position.copy(h.clone().add(V(2.8 - z * 0.8, 0.2, 2.8 - z * 0.8))); camera.lookAt(h); camera.fov = 40; camera.updateProjectionMatrix(); shake(t, 0.04);
  });
  shot(() => e0('shoes'), (t, T, d, ov) => { // runs away so fast his shoes stay behind
    day(); sunAt('rich', 6, -6);
    W.mshoes.visible = true; W.mshoes.position.copy(L('rich', 2.8, flr.walk, -6.6)); W.mshoes.rotation.y = face(2.8, -6.6, 0, -9);
    if (t > 0.12) { C.mailman.legL.children[2].visible = false; C.mailman.legR.children[2].visible = false; }
    const x = 2.8 + Math.max(0, t - 0.1) * 40; put(C.mailman, 'rich', x, flr.walk, -6.6, PI / 2, t < 0.1 ? mailIdle(t) : P.run(t, 3.5), { mouth: 'grit', eyeScale: 1.3 });
    W.puff.visible = true; W.puff.children.forEach((p, i) => { const u = p.userData; const k2 = clamp01(t * 1.2 + u.s * 0.2); p.position.copy(L('rich', 2.8 + Cc(u.a) * (0.4 + k2 * 2), 0.6 + k2 * 1.2, -6.6 + S(u.a) * (0.4 + k2 * 1.5))); p.scale.setScalar(Math.max(0.01, 1.1 - k2)); });
    put(C.alex, 'rich', 0, flr.walk, -9, face(0, -9, 2.8, -6.6), P.idle(t), { mouth: 'flat', eyeScale: 1.4 }); AB();
    cam('rich', [1.0, 1.3, -1.2], [2.8, 0.6, -6.6], 48);
  });
  // ================= SCENE 5 =================
  shot(() => E.shoes[1], (t, T, d, ov) => { // walking to the mayor's office
    day(); sunAt('rich', 0, -8);
    put(C.alex, 'rich', -12 + t * 3.2, flr.walk, -8.6, PI / 2, P.walk(t), { mouth: 'flat', brow: 0.6 }); AB();
    W.mshoes.visible = true; W.mshoes.position.copy(L('rich', 2.8, flr.walk, -6.6));
    const u = ease.io(t / d); cam('rich', mix([-16, 4, 2], [-8, 4.5, 1], u), [-10 + t * 3.2, 4, -8.6], 46);
  });
  const offL = () => { interior({ sun: 1.1, hemi: 0.95, hemiSky: 0xfff0dd }); sunAt('office', 0, 0); W.officeLight.intensity = 180; };
  const mayorSit = (t, expr, pose) => { put(C.mayor, 'office', 0, 0, -6.2, 0, Object.assign(P.sitChair(t, 1.75), { armL: [-1.2, 0, 0.1], armR: [-1.2, 0, -0.1] }, pose || {}), Object.assign({ bags: true }, expr)); W.mchair.visible = true; };
  const assistant = (t, pose, expr) => put(crowd[0], 'office', 4.2, 0.2, -6.8, -0.6, pose || P.idle(t), expr || { mouth: 'flat' });
  shot(() => e0('n5') + 1.9, (t, T, d, ov) => { // office: mayor with enormous eye bags
    offL(); mayorSit(t, { mouth: 'flat', lid: 0.45 }); assistant(t);
    put(C.alex, 'office', 9 - seg(t, 0, 1.2) * 5.2, 0.2, 3.6, -PI / 2, P.walk(t), { mouth: 'flat' }); AB();
    const u = ease.io(t / d); cam('office', mix([9, 8, 11], [5, 6.5, 8], u), [0, 4.5, -4], 46);
  });
  shot(() => e0('bags'), (t, T, d, ov) => { // zoom on the eye bags
    offL(); mayorSit(t, { mouth: 'flat', lid: 0.45 }); assistant(t);
    const h = C.mayor.headWorld(); const z = ease.out(seg(t, 0, 0.3)); camera.position.copy(h.clone().add(V(0.3, 0.1, 4.5 - z * 1.8))); camera.lookAt(h); camera.fov = 40; camera.updateProjectionMatrix();
  });
  shot(() => e0('a_what'), (t, T, d, ov) => { // what happens if I fall asleep?
    offL(); mayorSit(t, { mouth: 'flat', lid: 0.45 }); assistant(t);
    put(C.alex, 'office', 3.0, 0.2, 3.8, face(3, 3.8, 0, -5), P.talkGesture(t), { mouth: 'smile', brow: 0.2 }); AB(); talk(C.alex, 'a_what', T);
    cam('office', [-2.4, 6.2, -2.6], [3, 4.6, 3.8], 40);
  });
  shot(() => e0('my_talk') - 0.05, (t, T, d, ov) => { // we don't talk about that.
    offL(); mayorSit(t, { mouth: 'flat', lid: 0.35, brow: 0.6 }, { body: [0.25, 0, 0], armL: [-1.5, 0, 0.2], armR: [-1.5, 0, -0.2] }); talk(C.mayor, 'my_talk', T); assistant(t);
    put(C.alex, 'office', 3.0, 0.2, 3.8, face(3, 3.8, 0, -5), P.idle(t), { mouth: 'flat', eyeScale: 1.2 }); AB();
    const h = C.mayor.headWorld(); const z = ease.io(seg(t, 0, d)); camera.position.copy(h.clone().add(V(0.6, 0.2, 4.0 - z * 1.4))); camera.lookAt(h); camera.fov = 40; camera.updateProjectionMatrix();
    suspenseTint(ov, z);
  });
  function suspenseTint(ov, z) { ov.vig(1 + z * 0.6); }
  shot(() => e0('doze2'), (t, T, d, ov) => { // the mayor starts falling asleep
    offL(); const nod = ease.io(seg(t, 0.1, d)); mayorSit(t, { mouth: 'flat', eyeOpen: 1 - nod, lid: 0.45 }, { neck: [nod * 0.7, 0, 0], body: [nod * 0.35, 0, 0] });
    assistant(t, lerpPose(P.idle(t), { neck: [0, 0.4 * seg(t, 0.6, 1.0), 0] }, 1), { mouth: 'flat', eyeScale: 1.1 + seg(t, 0.6, 1.0) * 0.4 });
    put(C.alex, 'office', 3.0, 0.2, 3.8, face(3, 3.8, 0, -5), P.idle(t), { mouth: 'flat', eyeScale: 1.2 }); AB();
    cam('office', [7, 6, 4], [1.5, 4.2, -5.5], 44);
  });
  shot(() => e0('horn'), (t, T, d, ov) => { // AIR HORN
    offL(); mayorSit(t, { mouth: 'flat', eyeOpen: 0.05 }, { neck: [0.7, 0, 0], body: [0.35, 0, 0] });
    assistant(t, lerpPose(P.idle(t), { armR: [-2.0, 0, 0.3], body: [0.2, 0, 0] }, 1), { mouth: 'grit', brow: 0.8 }); crowd[0].root.position.copy(L('office', 1.8, 0.2, -5.6));
    W.horn.visible = true; W.horn.position.copy(crowd[0].handWorld('R').add(V(0, 0.4, 0))); W.horn.rotation.y = PI * 0.9;
    W.waves.visible = true; W.waves.position.copy(W.horn.position).add(V(-1, 0.9, 0)); W.waves.children.forEach((w, i) => { const k = (t * 3 + i / 4) % 1; w.scale.setScalar(0.3 + k * 1.2); w.position.set(-k * 2, 0, 0); w.rotation.y = PI / 2; w.material.opacity = 1 - k; });
    const h = C.mayor.headWorld(); camera.position.copy(h.clone().add(V(-2.2, 0.8, 3.4))); camera.lookAt(h.clone().add(V(0.8, 0.2, 0))); camera.fov = 48; camera.updateProjectionMatrix(); shake(t, 0.1); if (t < 0.12) ov.flash(0.4);
  });
  const mayorUp = (t, i) => { const p = Q.panic(t * 1.3); put(C.mayor, 'office', 0, 0.3 + Math.abs(S(t * 9)) * 0.6, -5.4, 0.3 * (i - 1), p, { mouth: 'grit', eyeScale: 1.7, brow: -0.4, bags: true }); W.mchair.visible = true; };
  shot(() => e0('m1') - 0.05, (t, T, d, ov) => { // HUSS - low angle
    offL(); mayorUp(t, 0); talk(C.mayor, 'm1', T); assistant(t, P.idle(t), { mouth: 'flat', eyeScale: 1.3 });
    cam('office', [1, 1.0, -0.5], [0, 5.5, -5.4], 56); dutch(0.22); shake(t, 0.05);
  });
  shot(() => e0('m2') - 0.05, (t, T, d, ov) => { // HUSS - side
    offL(); mayorUp(t, 1); talk(C.mayor, 'm2', T); assistant(t, P.idle(t), { mouth: 'flat', eyeScale: 1.3 });
    cam('office', [-6, 5, -2], [0, 4.8, -5.4], 44); dutch(-0.18);
  });
  shot(() => e0('m3') - 0.05, (t, T, d, ov) => { // HUSS - top
    offL(); mayorUp(t, 2); talk(C.mayor, 'm3', T); assistant(t, P.idle(t), { mouth: 'flat', eyeScale: 1.3 });
    const h = C.mayor.headWorld(); camera.position.copy(h.clone().add(V(0.4, 3.0, 3.2))); camera.lookAt(h); camera.fov = 50; camera.updateProjectionMatrix(); shake(t, 0.05);
  });
  shot(() => e0('backout'), (t, T, d, ov) => { // Alex slowly backs out
    offL(); mayorUp(t, 1); assistant(t, P.idle(t), { mouth: 'flat', eyeScale: 1.3 });
    put(C.alex, 'office', 3.0 + t * 2.6, 0.2, 3.8 + t * 1.6, face(3, 3.8, 0, -5), Object.assign(P.walk(t, -0.6), { armL: [-0.2, 0, 0.3], armR: [-0.2, 0, -0.3] }), { mouth: 'flat', eyeScale: 1.25, look: [-0.5, 0] }); AB();
    cam('office', [12, 7.5, 10], [2, 4, -1], 48);
  });
  // ================= SCENE 6 (bedroom) =================
  const bedL = (lamp = 1) => { lights({ sky: 0x0b1030, sun: 0.4, sunColor: 0x8899ff, hemi: 0.9, hemiSky: 0x7f98e0, hemiGround: 0x302840, exposure: 1.3 }); sunAt('bed', 0, 0, [-20, 30, 20]); W.lampB.intensity = 120 * lamp; };
  const JX = 4, JY = 3.25, JZ = -3.8; // Jake lying in bed (root)
  const jakeBed = (t, expr, pose) => { lieDown(C.jake, 'bed', JX, JY, JZ, expr, pose); };
  const alexCloset = (t, expr, pose) => { put(C.alex, 'bed', -13.2, 0.1, -3, PI / 2, pose || P.idle(t), expr); AB(false); };
  shot(() => E.backout[1], (t, T, d, ov) => { // that night: Jake in bed, Alex sneaks into the closet
    bedL(); jakeBed(t, { mouth: 'flat', look: [0, -0.5] });
    const k = ease.io(seg(t, 0.2, 1.6)); put(C.alex, 'bed', -6 - k * 7.2, 0.1, 2 - k * 5, -PI / 2 - 0.6 * (1 - k), k < 1 ? Object.assign(P.walk(t, 0.7), { body: [0.4, 0, 0] }) : P.idle(t), { mouth: 'flat', brow: 0.5 }); AB(false);
    const u = ease.io(t / d); cam('bed', mix([10, 11, 12], [8, 9, 11], u), [-2, 2.5, -4], 48);
  });
  shot(() => e0('n6') + 1.9, (t, T, d, ov) => { // POV through closet slats
    bedL(); jakeBed(t, { mouth: 'flat', look: [0, -0.5] }); alexCloset(t, { mouth: 'flat' });
    cam('bed', [-11.6, 4.7, -3.2], [4, 3.2, -6.5], 50);
  });
  shot(() => e0('j_delete') - 0.05, (t, T, d, ov) => { // if I disappear, delete my search history
    bedL(); jakeBed(t, { mouth: 'flat', brow: -0.4, look: [0, 0] }); talk(C.jake, 'j_delete', T);
    const h = C.jake.headWorld(); camera.position.copy(h.clone().add(V(-0.8, 3.2, 2.2))); camera.lookAt(h); camera.fov = 42; camera.updateProjectionMatrix();
  });
  shot(() => e0('sleep'), (t, T, d, ov) => { // Jake falls asleep; lamp off
    const off = seg(t, 0.7, 0.8); bedL(1 - off); jakeBed(t, { mouth: 'flat', eyeOpen: 1 - seg(t, 0.1, 0.6) });
    const u = ease.io(t / d); cam('bed', mix([12, 9, 4], [10, 8, 1], u), [JX, 3, -8], 44);
  });
  const machineAt = (x, z, ry, t) => { W.machine.visible = true; W.machine.position.copy(L('bed', x, 0.1, z)); W.machine.rotation.y = ry; W.mLights.forEach((l, i) => l.visible = ((Math.floor(t * 6) + i) % 3) !== 0); W.mAnt.visible = Math.floor(t * 4) % 2 === 0; };
  const granPush = (t, x, z, ry, walk = true, expr = { mouth: 'flat', brow: 0.6, lid: 0.3 }) => { put(C.grandma, 'bed', x, 0.1, z, ry, walk ? Object.assign(P.walk(t, 0.45), { body: [0.25, 0, 0], armL: [-1.3, 0, 0.1], armR: [-1.3, 0, -0.1] }) : P.idle(t), expr); };
  const granPath = (k) => [16 - k * 8.5, 4.6 - k * 4.4]; // from door to bedside
  shot(() => e0('enter'), (t, T, d, ov) => { // door creaks open, grandma enters with a mysterious machine
    bedL(0); W.hallLight.intensity = 260 * seg(t, 0, 0.5); W.bdoor.rotation.y = -1.6 * ease.io(seg(t, 0, 0.7));
    jakeBed(t, { mouth: 'flat', eyeOpen: 0.05 });
    const k = 0.35 * ease.io(seg(t, 0.6, d)); const [gx, gz] = granPath(k); granPush(t, gx + 2.6, gz, -PI / 2 - 0.2); machineAt(gx, gz, -0.2 + PI, t);
    cam('bed', [-2, 2.2, 8], [12, 3.5, 3], 48);
  });
  shot(() => e0('horror'), (t, T, d, ov) => { // Alex watches in horror (inside closet)
    bedL(0); W.hallLight.intensity = 260; W.bdoor.rotation.y = -1.6;
    alexCloset(t, { mouth: 'wavy', eyeScale: 1.7, sweat: true, brow: -0.8 }, lerpPose(P.idle(t), { armL: [-2.4, 0, -0.5], armR: [-2.4, 0, 0.5] }, 0.8));
    const h = C.alex.headWorld(); const z = ease.out(seg(t, 0, 0.4)); camera.position.copy(h.clone().add(V(2.0, 0.1, 0.3))); camera.lookAt(h); camera.fov = 54 - z * 6; camera.updateProjectionMatrix();
    W.lampB.intensity = 0; W.lampB.position.copy(h.clone().add(V(2.5, 0.8, 0)));
  });
  shot(() => e0('approach'), (t, T, d, ov) => { // grandma slowly approaches Jake
    bedL(0); W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.hallLight.intensity = 260; W.bdoor.rotation.y = -1.6;
    jakeBed(t, { mouth: 'flat', eyeOpen: 0.05 });
    const k = 0.35 + 0.65 * ease.io(seg(t, 0, d - 0.5)); const [gx, gz] = granPath(k); granPush(t, gx + 2.6, gz, -PI / 2 - 0.2, k < 1, { mouth: 'smirk', brow: 0.7, lid: 0.35 }); machineAt(gx, gz, -0.2 + PI, t);
    if (t < d - 0.55) cam('bed', mix([JX - 2, 5.5, -11], [JX - 1.5, 5.2, -10.5], t / d), [gx + 1, 4, gz], 46);
    else { const h = C.grandma.headWorld(); camera.position.copy(h.clone().add(V(-2.4, 0.1, -0.4))); camera.lookAt(h); camera.fov = 36; camera.updateProjectionMatrix(); }
  });
  // ================= SCENE 7 (reveal) =================
  const GX = 7.5 + 2.6, GZ = 0.2 + 0.8; // grandma bedside
  const granBed = (t, pose, expr) => put(C.grandma, 'bed', 9.2, 0.1, -4.5, -PI / 2, pose || P.idle(t), expr || { mouth: 'smirk', brow: 0.7, lid: 0.3 });
  const machBed = (t) => machineAt(9.6, -0.8, PI - 0.5, t);
  shot(() => E.approach[1], (t, T, d, ov) => { // the machine lid opens...
    bedL(0); W.hallLight.intensity = 260; W.bdoor.rotation.y = -1.6; W.lampB.intensity = 60;
    jakeBed(t, { mouth: 'flat', eyeOpen: 0.05 }); granBed(t, lerpPose(P.idle(t), { armL: [-1.6, 0, 0.2] }, 1)); machBed(t);
    W.mLid.rotation.x = -1.9 * ease.out(seg(t, 0.8, 1.6));
    const u = ease.io(t / d); cam('bed', mix([12.5, 8, 6], [11.5, 7.5, 3.4], u), [9.6, 4, -0.8], 46);
    if (t > 1.6 && t < 1.75) ov.flash(0.3);
  });
  shot(() => e0('n7') + 2.0, (t, T, d, ov) => { // Alex in the closet: zoom
    bedL(0); W.hallLight.intensity = 260; W.bdoor.rotation.y = -1.6;
    alexCloset(t, { mouth: 'wavy', eyeScale: 1.8, sweat: true, brow: -0.8 }, lerpPose(P.idle(t), { armL: [-2.4, 0, -0.5], armR: [-2.4, 0, 0.5] }, 0.8));
    const h = C.alex.headWorld(); const z = ease.in(seg(t, 0, 0.5)); camera.position.copy(h.clone().add(V(2.0, 0.1, 0.3))); camera.lookAt(h); camera.fov = 58 - z * 18; camera.updateProjectionMatrix();
    W.lampB.intensity = 0;
  });
  const reveal = (t, T, k) => { W.pole.visible = true; W.pole.position.y = 3.0 + 3.2 * k; W.poleTex.offset.y = T * 1.5; W.mLid.rotation.x = -1.9; W.cape.visible = true; const h = C.jake.headWorld(); W.cape.position.copy(h.clone().add(V(0, -1.0, 2.0))); W.cape.rotation.set(PI / 2, 0, 0); W.cape.scale.setScalar(Math.max(0.01, ease.back(clamp01(k)))); };
  shot(() => e0('reveal'), (t, T, d, ov) => { // REVEAL: grandma is a barber
    bedL(0); W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.lampB.intensity = 200; W.hallLight.intensity = 260; W.bdoor.rotation.y = -1.6;
    jakeBed(t, { mouth: 'flat', eyeOpen: 0.05 }); machBed(t); reveal(t, T, ease.out(seg(t, 0.05, 0.6)));
    granBed(t, lerpPose(P.idle(t), { armL: [0, 0, 2.6 * seg(t, 0.4, 0.7)], armR: [0, 0, -2.6 * seg(t, 0.4, 0.7)] }, 1), { mouth: 'grin', brow: 0.6 });
    const u = ease.out(seg(t, 0, 0.5)); cam('bed', mix([16, 6, 9], [14.5, 5.5, 5], u), [7.5, 4.6, -3], 48); if (t < 0.1) ov.flash(0.5);
  });
  shot(() => e0('shave'), (t, T, d, ov) => { // the haircut
    bedL(0); W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.lampB.intensity = 200; W.hallLight.intensity = 260; W.bdoor.rotation.y = -1.6;
    const done = t > 1.35; jakeBed(t, { mouth: 'flat', eyeOpen: 0.05 }); machBed(t); reveal(t, T, 1);
    if (done) { hair(C.jake, false); W.cutJake.visible = true; W.cutJake.scale.setScalar(Math.max(0.01, ease.back(seg(t, 1.35, 1.6)))); }
    granBed(t, lerpPose(P.idle(t), { armR: [-1.6 + S(t * 25) * 0.15, 0, 0.3], armL: [-1.2, 0, 0.2], body: [0.25, 0, 0] }, 1), { mouth: 'grin', brow: 0.8, lid: 0.2 });
    const h = C.jake.headWorld(); W.clip.visible = !done; W.clip.position.set(1.3, 3.6, 0.6); W.clip.rotation.set(0, S(t * 30) * 0.1, 0);
    if (!done) { W.clip.visible = false; W.handMirror.visible = false; W.clipHead.visible = true; }
    W.hairFly.visible = !done; W.hairFly.children.forEach((c, i) => { const u = c.userData; const k = (t * 2 + u.s) % 1; c.position.copy(h.clone().add(V(Cc(u.a) * k * 2.5, u.v * k - 5 * k * k + 0.4, S(u.a) * k * 2.5))); c.rotation.set(t * 9 + i, i, 0); });
    // clipper in grandma's hand
    W.barbell.visible = false; W.horn.visible = false;
    if (!done) { W.clip.visible = true; W.clip.position.set(0, 0, 0); W.machine.updateMatrixWorld(); const hw = C.grandma.handWorld('R'); W.clip.parent.worldToLocal(hw); W.clip.position.copy(hw); W.clip.rotation.set(0, PI / 2 + S(t * 30) * 0.15, 0); }
    if (!done) { camera.position.copy(h.clone().add(V(2.6, 2.6, 1.6))); camera.lookAt(h); camera.fov = 44; camera.updateProjectionMatrix(); shake(t, 0.02, 90); }
    else { camera.position.copy(h.clone().add(V(3.4, 1.6, -1.0))); camera.lookAt(h.clone().add(V(0, 0.3, -1.0))); camera.fov = 42; camera.updateProjectionMatrix(); if (t < 1.42) ov.flash(0.3); }
  });
  const jakeMirror = (t, expr, pose) => { put(C.jake, 'bed', 11.2, 0.1, -4, PI / 2, pose || P.idle(t), expr); hair(C.jake, false); W.cutJake.visible = true; };
  shot(() => e0('mirror'), (t, T, d, ov) => { // wakes up, looks in the mirror (mirror POV)
    bedL(0); W.lampB.intensity = 200; W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.hallLight.intensity = 200;
    jakeMirror(t, { mouth: 'flat', eyeScale: 1 + seg(t, 0.2, 0.6) * 0.6, look: [0, -0.4] });
    cam('bed', [14.2, 5.0, -4], [11.2, 5.2, -4], 46);
  });
  shot(() => e0('j_hair'), (t, T, d, ov) => { // MY HAIRLINE!
    bedL(0); W.lampB.intensity = 200; W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.hallLight.intensity = 200;
    jakeMirror(t, { mouth: 'shout', eyeScale: 1.7, brow: -0.8, tear: true }, Q.panic(t)); talk(C.jake, 'j_hair', T);
    const z = ease.out(seg(t, 0, 0.2)); cam('bed', [14.4 - z * 0.3, 5.8, -4], [11.2, 5.4, -4], 62 - z * 4); shake(t, 0.05);
  });
  shot(() => E.j_hair[1], (t, T, d, ov) => { // that'll be 50 dollars, yo
    bedL(0); W.lampB.intensity = 200; W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.hallLight.intensity = 200; W.bdoor.rotation.y = -1.6;
    machBed(t); W.pole.visible = true; W.pole.position.y = 6.2; W.poleTex.offset.y = T * 1.5; W.mLid.rotation.x = -1.9;
    put(C.grandma, 'bed', 8.4, 0.1, -1.6, face(8.4, -1.6, 11.2, -4) , lerpPose(P.idle(t), { armR: [-1.5, 0, -0.1] }, 1), { mouth: 'smirk', brow: 0.5, lid: 0.3 }); talk(C.grandma, 'g_fifty', T);
    jakeMirror(t, { mouth: 'flat', eyeScale: 1.4, tear: true }); C.jake.root.rotation.y = face(11.2, -4, 8.4, -1.6);
    const h = C.grandma.headWorld(); camera.position.copy(h.clone().add(V(2.4, 0.4, 3.0))); camera.lookAt(h); camera.fov = 42; camera.updateProjectionMatrix();
  });
  // photos of previous victims (render targets from the photo booth)
  const shootPhotos = () => {
    const prev = renderer.getRenderTarget(); W.boothLight.intensity = 110;
    [[C.mayor, W.cutMayor], [C.baker, W.cutBaker], [C.mailman, W.cutMail]].forEach(([ch, cut], i) => {
      put(ch, 'booth', 0, 0.2, 0, 0, P.idle(0.5), { mouth: 'frown', brow: -0.7, tear: true, eyeScale: 1.1, bags: ch === C.mayor }); hair(ch, false); cut.visible = true;
      const h = ch.headWorld(); W.photoCam.position.copy(h.clone().add(V(0, 1.0, 9.0))); W.photoCam.lookAt(h.clone().add(V(0, 0.7, 0))); W.photoCam.updateProjectionMatrix();
      renderer.setRenderTarget(W.photoRT[i]); renderer.render(scene, W.photoCam); ch.root.visible = false; cut.visible = false; hair(ch, true);
    });
    renderer.setRenderTarget(prev); W.boothLight.intensity = 0;
  };
  shot(() => e0('photos'), (t, T, d, ov) => { // the wall of shame
    bedL(0); W.lampB.intensity = 200; W.lampB.position.set(LOC.bed.x + 9.3, 4.6, -9.5); W.hallLight.intensity = 200;
    shootPhotos();
    put(C.grandma, 'bed', 8.4, 0.1, -1.6, 2.6, lerpPose(P.idle(t), { armL: [-1.4, 0, -0.3], armR: [-1.4, 0, 0.3] }, 1), { mouth: 'smirk', brow: 0.5 });
    W.board.visible = true; const a = C.grandma.handWorld('L'), b = C.grandma.handWorld('R'); W.board.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, 1.5, 0)); W.board.rotation.set(0, 2.6, 0);
    const f = W.board.position; const dir = V(S(2.6), 0, Cc(2.6));
    const pi = t < 0.75 ? -1 : t < 1.5 ? 0 : t < 2.2 ? 1 : 9;
    const tgt = pi === 9 ? f.clone() : f.clone().add(V(Cc(2.6) * 2.3 * pi, 0.08, -S(2.6) * 2.3 * pi));
    const dist = pi === 9 ? 6.5 : 3.0; camera.position.copy(tgt.clone().add(dir.clone().multiplyScalar(dist))); camera.lookAt(tgt); camera.fov = 40; camera.updateProjectionMatrix();
    for (const k of [0, 0.75, 1.5]) if (t > k && t < k + 0.08) ov.flash(0.5);
  });
  // ================= SCENE 8 =================
  shot(() => E.photos[1], (t, T, d, ov) => { // never sleeping again: training
    gymL(); put(C.alex, 'wgym', 8, 0.1, 6, 0, Object.assign(Q.squat(t, (S(t * 5) + 1) / 2), { armL: [-PI + 0.3, 0, 0.35], armR: [-PI + 0.3, 0, -0.35] }), { mouth: 'grit', brow: 1, sweat: true }); AB();
    W.barbell.visible = true; const a = C.alex.handWorld('L'), b = C.alex.handWorld('R'); W.barbell.position.copy(a.add(b).multiplyScalar(0.5));
    const u = ease.io(t / d); cam('wgym', mix([16, 7, 16], [12, 5.5, 12], u), [8, 4, 6], 46);
  });
  const benchPress = (t, k) => { lieDown(C.alex, 'wgym', 8, 3.05, -1.7, { mouth: 'grit', brow: 1, sweat: true }, { armL: [-PI / 2 - 0, 0, 0.3], armR: [-PI / 2, 0, -0.3] }); C.alex.armL.rotation.x = -PI / 2 + k * 0.6; C.alex.armR.rotation.x = -PI / 2 + k * 0.6; AB();
    W.barbell.visible = true; const a = C.alex.handWorld('L'), b = C.alex.handWorld('R'); W.barbell.position.copy(a.add(b).multiplyScalar(0.5)); };
  shot(() => e0('h4') - 0.1, (t, T, d, ov) => { // HUSS - bench press
    gymL(); benchPress(t, (S(t * 14) + 1) / 2); talk(C.alex, 'h4', T);
    cam('wgym', [12.5, 4.0, -3], [8, 3.5, -4.5], 50); dutch(0.2);
  });
  shot(() => e0('h5') - 0.06, (t, T, d, ov) => { // HUSS - treadmill
    gymL(); tread(T, 3); put(C.alex, 'wgym', TX, TY, TZ, PI, P.run(t, 2.4), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h5', T);
    cam('wgym', [TX + 2.5, 1.3, TZ - 5.5], [TX, 4.5, TZ], 54); dutch(-0.22);
  });
  shot(() => e0('h6') - 0.06, (t, T, d, ov) => { // HUSS - barbell overhead
    gymL(); put(C.alex, 'wgym', 8, 0.1, 6, 0, Object.assign(Q.squat(t, 0), { armL: [-PI + 0.15, 0, 0.35], armR: [-PI + 0.15, 0, -0.35] }), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h6', T);
    W.barbell.visible = true; const a = C.alex.handWorld('L'), b = C.alex.handWorld('R'); W.barbell.position.copy(a.add(b).multiplyScalar(0.5));
    cam('wgym', [7.2, 0.5, 11], [8, 7, 6], 60); if (t < 0.08) ov.flash(0.35);
  });
  shot(() => e0('asleep'), (t, T, d, ov) => { // falls asleep on the bench
    gymL(); W.wgymLight.intensity = 320 - 220 * seg(t, 0.6, d); const e = seg(t, 0.1, 0.7);
    lieDown(C.alex, 'wgym', 8, 3.05, -1.7, { mouth: 'flat', eyeOpen: 1 - e, sweat: true }); AB();
    W.barbell.visible = true; W.barbell.position.copy(L('wgym', 8, 5.2, -6.6));
    const h = C.alex.headWorld(); const u = ease.io(t / d); camera.position.copy(h.clone().add(V(3.5 - u * 1.2, 4.2 - u * 1.2, 1.0))); camera.lookAt(h); camera.fov = 44; camera.updateProjectionMatrix();
    if (t > d - 0.2) ov.black(seg(t, d - 0.2, d));
  });
  const baldAlex = () => { hair(C.alex, false); C.alex.headband.visible = false; W.cutAlex.visible = true; };
  shot(() => e0('morning'), (t, T, d, ov) => { // next morning: bald, one tiny hair
    morning(); sunAt('rich', 0, -8);
    put(C.alex, 'rich', 0, flr.walk, -9, 0, P.idle(t), { mouth: 'flat', lid: 0.45, brow: -0.3 }); baldAlex();
    const u = ease.out(seg(t, 0, d)); cam('rich', mix([0.5, 9.5, -4.5], [0.3, 6.2, -5.2], u), [0, 5.0, -9], 40);
  });
  const bugX = (T) => -55 + (T - e0('g_money') + 0.4) * 22;
  shot(() => e0('g_money'), (t, T, d, ov) => { // grandma drives past in her Bugatti
    morning(); sunAt('rich', 0, -6);
    const x = bugX(T); drive(C.grandma, W.bug, L('rich', x, 0, -2.6), 0, t, { mouth: 'grin', brow: 0.9 }); C.grandma.pose({ neck: [0, 0.85, 0], armR: [-2.6 + S(t * 9) * 0.3, 0, 0.3] }); talk(C.grandma, 'g_money', T);
    put(C.alex, 'rich', 0, flr.walk, -9, face(0, -9, x, -2.6), P.idle(t), { mouth: 'flat', lid: 0.45 }); baldAlex();
    if (t < 1.1) cam('rich', [x + 6.0, 5.6, -7.6], [x - 1.2, 4.4, -2.6], 40); else cam('rich', [-4, 4.2, -14], [2, 3.6, -5], 48);
  });
  shot(() => e0('look'), (t, T, d, ov) => { // Alex looks directly at the camera
    morning(); sunAt('rich', 0, -8); W.bug.visible = true; W.bug.position.copy(L('rich', bugX(T), 0, -2.6));
    const turn = ease.io(seg(t, 0.05, 0.5)); put(C.alex, 'rich', 0, flr.walk, -9, 1.2 * (1 - turn), P.idle(t), { mouth: 'flat', lid: 0.45 }); baldAlex();
    cam('rich', [0, 5.0, -4.6], [0, 4.9, -9], 40);
  });
  shot(() => e0('a_moving'), (t, T, d, ov) => { // I'm moving towns.
    morning(); sunAt('rich', 0, -8);
    put(C.alex, 'rich', 0, flr.walk, -9, 0, P.idle(t), { mouth: 'flat', lid: 0.45 }); baldAlex(); talk(C.alex, 'a_moving', T);
    const z = ease.io(seg(t, 0, d)); cam('rich', [0, 5.0, -4.6 - z * 0.8], [0, 4.9, -9], 40);
  });
  SH.forEach(s => { if (typeof s.a === 'function') s.a = s.a(); });
  for (let i = 1; i < SH.length; i++) if (!(SH[i].a > SH[i - 1].a)) console.log('SHOT ORDER PROBLEM', i, SH[i - 1].a, SH[i].a);
  console.log('shots', SH.length);
}
