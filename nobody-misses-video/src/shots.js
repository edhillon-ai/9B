import { THREE, scene, camera, setLighting, aimSun, P, lerpPose, makeBall, ease, seg, clamp01, V, arc } from './core.js';
import { makeCast, npc } from './cast.js';
import { buildWorld, LOC, W } from './world.js';
import { buildExtras } from './extras.js';

let E, ENV, C, teens = [], crowd = [], balls = [];
const PI = Math.PI, S = Math.sin, Cc = Math.cos;
const allChars = [], props = [];

export function setup(TL, env) {
  E = TL.ev; ENV = env;
  buildWorld(); buildExtras();
  C = makeCast();
  for (const k in C) { if (k === 'rudy') continue; scene.add(C[k].root); allChars.push(C[k]); }
  for (let i = 0; i < 6; i++) { const n = npc(i); teens.push(n); scene.add(n.root); allChars.push(n); }
  for (let i = 0; i < 10; i++) { const n = npc(i + 3); crowd.push(n); scene.add(n.root); allChars.push(n); }
  for (let i = 0; i < 8; i++) { const b = makeBall(); scene.add(b); balls.push(b); }
  W.crownProp = C.mayor.crown.clone(); W.crownProp.position.set(0, 0, 0); scene.add(W.crownProp);
  props.push(W.pkg, W.loaf, W.cookie, W.trophy, W.phone, W.mascotHead, W.mascotHead2, W.mascotBody, W.contract, W.mic, W.stars, W.brush, W.tinyDB, W.dumbL, W.suv, W.car, W.nightStars, W.moon, W.shards,
    W.ctrl, W.charger, W.crownProp, W.suitcase, W.siren, W.blink, W.chips, W.acWind, ...W.cookies, ...balls);
}

// ---------- helpers ----------
const L = (loc, x, y, z) => V(LOC[loc].x + x, y, LOC[loc].z + z);
function cam(loc, p, l, fov = 40) { camera.position.copy(L(loc, ...p)); camera.up.set(0, 1, 0); camera.lookAt(L(loc, ...l)); camera.fov = fov; camera.updateProjectionMatrix(); }
const face = (x0, z0, x1, z1) => Math.atan2(x1 - x0, z1 - z0);
const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
function put(ch, loc, x, y, z, ry, pose, expr) { ch.root.visible = true; ch.place(LOC[loc].x + x, y, LOC[loc].z + z, ry); if (pose) ch.pose(pose); ch.cur = expr || {}; ch.setExpr(ch.cur); return ch; }
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
  W.partyLights.forEach(l => l.intensity = 0); for (const k of ['bulb', 'bakeryLight', 'lampLight', 'homeLight', 'gymLight', 'secretLight', 'secretLight2', 'doorGlow', 'sirenLight']) W[k].intensity = 0;
  W.tourney.visible = false; W.gchair.visible = true; W.coachDoor.rotation.y = 0; W.ctrl.userData.led.material = W.ctrl.userData.led.material; W.ctrl.userData.led.visible = true;
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
  const R = 28;
  const rimC = L('court', R, 8.3, 0), rimG = L('gym', R, 8.3, 0);
  const ledOn = (on, col = 0x30a0ff) => { W.ctrl.userData.led.material = new THREE.MeshStandardMaterial({ color: on ? col : 0x222222, emissive: on ? col : 0x000000, emissiveIntensity: on ? 3 : 0 }); };
  // ================= SCENE 1 =================
  shot(0, (t, T, d, ov) => { // aerial town, kids swishing
    day(); sunAt('town', 0, 0); const u = ease.io(t / d);
    cam('town', mix([-48, 36, 50], [-30, 18, 20], u), mix([-10, 0, -6], [-15, 4, -14], u), 42);
    [[-41.0, -13.6], [4.0, 13.6]].forEach(([x, z], i) => { const k = teens[i]; const sd = z < 0 ? -1 : 1; put(k, 'town', x, 0.02, sd * 9.0, sd < 0 ? PI : 0, ((t + i * 0.5) % 1.2) < 0.4 ? P.shootRelease() : P.shootSet(), { mouth: 'grin' }); const ph = ((t + i * 0.5) % 1.2) / 1.2; ballAt(balls[i], arc(L('town', x, 6.5, sd * 9.4), L('town', x, 7.1, sd * 13.6 - sd * 0.0), 3, Math.min(1, ph * 1.4))); });
    ov.stamp('<span style="color:#ffe14d">HOOPSVILLE</span><br><span style="font-size:44px">SHOOTING: 100%</span>');
  });
  const gx = -15, gz = -10.5; // grandma front yard
  shot(2.0, (t, T, d, ov) => { // grandma backward throw
    day(); sunAt('town', gx, gz);
    const u = ease.io(seg(t, 0.3, 0.9));
    put(C.grandma, 'town', gx, 0.02, gz, 0, Q.backThrow(u), { mouth: 'smirk', brow: 0.6 });
    if (t < 0.85) hold(balls[0], C.grandma, 'R', [0.3, 0.3, -0.2]); else ballAt(balls[0], arc(L('town', gx, 9.5, gz - 0.6), L('town', gx, 8.3, -38), 13, seg(T, 2.85, 4.85)));
    put(teens[2], 'town', gx + 5, 0.35, -6.0, face(gx + 5, -6, gx, gz), P.idle(t), { mouth: 'o', eyeScale: 1.2 });
    cam('town', [gx + 5, 3.4, gz + 13], [gx, 4.8 + u * 1.5, gz], 42);
  });
  shot(3.4, (t, T, d, ov) => { // follow ball over the roof
    day(); sunAt('town', gx, -25);
    const u = seg(T, 2.85, 4.85); const p = arc(L('town', gx, 9.5, gz - 0.6), L('town', gx, 8.3, -38), 13, Math.min(u, 1));
    if (u < 1) ballAt(balls[0], p); else ballAt(balls[0], L('town', gx, 8.2 - (T - 4.85) * 9, -38)); balls[0].rotation.x = T * 8;
    const bp = balls[0].position;
    camera.position.set(bp.x + 14, Math.max(4, bp.y - 1), bp.z + 4 - u * 2); camera.lookAt(bp.x, bp.y - 0.5, bp.z - 2); camera.fov = 44; camera.updateProjectionMatrix();
    W.backHoop.userData.net.scale.y = T > 4.85 && T < 5.1 ? 1.25 : 1;
  });
  shot(5.0, (t, T, d, ov) => { // grandma cookie
    day(); sunAt('town', gx, gz);
    const p = P.idle(t); p.armR = [-1.9 + ((t % 0.8) < 0.3 ? 0.25 : 0), 0, 0.25];
    put(C.grandma, 'town', gx, 0.02, gz, 0.25, p, { mouth: (t % 0.4) < 0.2 ? 'flat' : 'smile', eyeOpen: 0.15, blush: true });
    if (T > e0('btw1')) C.grandma.setExpr({ mouth: 'smirk', eyeOpen: 1, brow: 0.6, blush: true, look: [0.3, 0] });
    W.cookie.visible = true; W.cookie.position.copy(C.grandma.handWorld('R')).add(V(0, 0.3, 0.3)); W.cookie.rotation.x = PI / 2;
    cam('town', mix([gx + 2.5, 4.6, gz + 8.5], [gx + 1.5, 4.7, gz + 6], ease.io(t / d)), [gx + 0.3, 4.2, gz], 40);
  });
  // ================= SCENE 2 =================
  shot(() => E.s1end[1], (t, T, d, ov) => { // mailman half-court package into mailbox
    day(); sunAt('town', -14, -7);
    const rel = 0.55, mx = -24;
    put(C.mailman, 'town', mx, flr.walk, -6.2, PI / 2 - 0.3, t < rel ? lerpPose(P.idle(t), P.shootSet(), seg(t, 0, rel)) : P.shootRelease(), { mouth: 'grin', brow: 0.5 });
    W.pkg.visible = true; W.pkg.scale.setScalar(0.4);
    const mb = L('town', -5, 2.75, -9);
    const u = seg(t, rel, 1.5);
    if (t < rel) W.pkg.position.copy(C.mailman.handWorld('R')).add(V(0, 0.5, 0)); else W.pkg.position.copy(arc(L('town', mx + 0.5, 7, -6.4), mb, 6, u)), W.pkg.rotation.set(u * 8, u * 3, 0);
    const look = W.pkg.position.clone();
    camera.position.set(look.x - 4 + u * 2, 4.2 + (look.y - 4) * 0.3, 6.5); camera.lookAt(look.x + 2, Math.max(3, look.y * 0.7), -7); camera.fov = 46; camera.updateProjectionMatrix();
    if (t > 1.5) ov.badge('<div style="font:900 80px Inter;color:#ffe14d;-webkit-text-stroke:12px #000;paint-order:stroke fill">DELIVERED ✓</div>');
  });
  shot(9.6, (t, T, d, ov) => { // baker bread into oven
    interior(); sunAt('bakery', 0, 0); W.bakeryLight.intensity = 80; W.oven.visible = true;
    const rel = 0.5;
    put(C.baker, 'bakery', 9, flr.bakery, 2.5, face(9, 2.5, -12.2, -5), t < rel ? lerpPose(P.idle(t), P.shootSet(), seg(t, 0, rel)) : P.shootRelease(), { mouth: 'smirk', brow: 0.7 });
    W.loaf.visible = true;
    if (t < rel) W.loaf.position.copy(C.baker.handWorld('R')).add(V(0, 0.4, 0)); else { const u = seg(t, rel, 1.5); W.loaf.position.copy(arc(L('bakery', 8.6, 6.8, 2.3), L('bakery', -12.2, 2.6, -4.96), 3.5, u)); W.loaf.rotation.set(0, u * 2, u * 10); W.loaf.visible = u < 1; }
    { const lp = t < rel ? C.baker.handWorld('R') : W.loaf.position; const tx = Math.max(LOC.bakery.x - 9, Math.min(LOC.bakery.x + 8, lp.x)); camera.position.set(tx + 2.5, 5.5, 12); camera.lookAt(tx - 1, 3.8, -1); camera.fov = 46; camera.updateProjectionMatrix(); }
    if (t > 1.5) ov.badge('<div style="font:900 90px Inter;color:#ff9f1a;-webkit-text-stroke:12px #000;paint-order:stroke fill">+3 🥖</div>');
  });
  shot(11.6, (t, T, d, ov) => { // mayor full-court
    day(); sunAt('court', 0, 0);
    const rel = 0.35;
    put(C.mayor, 'court', -26, flr.court, 0, PI / 2, t < rel ? P.shootSet() : P.shootRelease(), { mouth: 'grin', brow: 0.6 });
    if (t < rel) hold(balls[0], C.mayor, 'R', [0.2, 0.5, 0]); else { const u = seg(t, rel, 1.4); ballAt(balls[0], u < 1 ? arc(L('court', -25.4, 7, 0), rimC.clone().sub(LOC.court).add(LOC.court), 14, u) : L('court', R, 8.3 - (t - 1.4) * 9, 0)); }
    const b = balls[0].position;
    camera.position.set(b.x - 10, Math.max(4, b.y - 2), 15); camera.lookAt(b.x + 2, b.y, 0); camera.fov = 46; camera.updateProjectionMatrix();
  });
  shot(13.0, (t, T, d, ov) => { // mayor celebrates LeBron
    day(); sunAt('court', -20, 0); W.courtConfetti.visible = true; W.courtConfetti.update(t); W.courtConfetti.position.set(-22, 0, 0);
    put(C.mayor, 'court', -22, flr.court, 0, 0.2, P.armsUp(t), { mouth: 'grin', brow: 0.8, eyeOpen: 0.15 });
    cam('court', [-21, 3.4 + t * 0.3, 9.5 - t * 1.2], [-22, 5, 0], 42);
    ov.badge('<div style="font:900 74px Inter;color:#fff;-webkit-text-stroke:12px #000;paint-order:stroke fill">👑 KING</div>', 0.9 + 0.1 * S(t * 10));
  });
  // ================= SCENE 3 =================
  shot(() => E.s2end[1], (t, T, d, ov) => { // coach leaves on vacation
    day(); sunAt('town', 30, 6);
    const x = 26 + t * 3.0;
    put(C.coach, 'town', x, 0.08, 2.5, PI / 2, P.walk(t, 0.9), { mouth: 'smile', lid: 0.3 }); C.coach.shades.visible = true;
    C.coach.pose({ armL: [0, 0, 0.35] }); C.coach.armR.rotation.x = -0.3 + S(t * 8) * 0.6; C.coach.armR.rotation.z = -2.4;
    W.suitcase.visible = true; W.suitcase.position.copy(C.coach.handWorld('L')).add(V(0, -2.4, 0)); W.suitcase.position.y = 0.08; W.suitcase.rotation.y = PI / 2;
    cam('town', [x + 6, 3.8, 11.8], [x + 1, 3.6, 2.5], 42);
    ov.badge('<div style="font:900 64px Inter;color:#fff;background:#2a9d8f;border:7px solid #000;border-radius:18px;padding:8px 22px">🌴 ON VACATION</div>');
  });
  shot(16.6, (t, T, d, ov) => { // Jake wide-open layup... misses
    day(); sunAt('court', 22, 0);
    const tl = e0('miss') - 16.6; // ball hits rim
    const run = seg(t, 0, tl - 0.8), up = seg(t, tl - 0.8, tl - 0.2);
    const jx = 16 + run * 7 + up * 2.5;
    put(C.jake, 'court', jx, flr.court + S(up * PI) * 2.0, 0.6, PI / 2, up > 0 ? Q.layup(up) : P.dribbleWalk(t, 1), { mouth: 'smile', brow: 0.2 });
    if (up <= 0) dribble(balls[0], C.jake, t, 1); else if (t < tl - 0.35) hold(balls[0], C.jake, 'R', [0, 0.4, 0]);
    else { const v = t - tl; if (v < 0) ballAt(balls[0], L('court', R - 0.9 + (v + 0.35) / 0.35 * 0.0, 8.5 + (-v) * 2, 0.4)); else ballAt(balls[0], L('court', R - 0.9 - v * 7, Math.max(0.55, 8.6 + v * 5 - v * v * 14), 0.4 + v * 3)); }
    const z = clamp01((t - 0.3) / 2);
    cam('court', mix([12, 3.5, 15], [17, 5, 12], z), [24, 5.2, 0], 42);
  });
  shot(() => e0('miss') + 0.12, (t, T, d, ov) => { // confused Jake zoom + Bro?
    day(); sunAt('court', 24, 0);
    put(C.jake, 'court', 25.5, flr.court, 0.6, -0.4, lerpPose(P.idle(t), { armL: [0, 0, 0.6], armR: [0, 0, -0.6] }, 1), { mouth: 'flat', brow: -0.5, eyeScale: 1.25, look: [0, -0.4] });
    talk(C.jake, 'j_bro', T);
    ballAt(balls[0], L('court', 21 - t * 2, 0.55 + Math.abs(S(t * 7)) * 1.0 * Math.max(0, 1 - t), 4));
    const z = ease.out(seg(t, 0, 0.35));
    cam('court', mix([24, 4.6, 9], [25.2, 4.6, 4.6], z), [25.6, 4.5, 0.6], 40 - z * 6);
  });
  shot(() => e0('panic'), (t, T, d, ov) => { // grandma drops cookies + mayor alarm
    day();
    if (t < 0.45) { sunAt('town', gx, gz); put(C.grandma, 'town', gx, 0.02, gz, 0.2, lerpPose(P.idle(t), { armR: [-0.8 + t * 1.5, 0, 0.3], armL: [-0.8 + t * 1.5, 0, -0.1] }, 1), { mouth: 'o', eyeScale: 1.5 });
      W.cookies.forEach((c, i) => { c.visible = true; c.position.copy(L('town', gx - 0.6 + i * 0.6, Math.max(0.1, 3.0 - t * t * 25), gz + 2.0)); c.rotation.set(t * 9 + i, i, 0); });
      cam('town', [gx + 1.2, 4.0, gz + 6.5], [gx, 3.6, gz], 42); }
    else { sunAt('square', 0, 0); put(C.mayor, 'square', 0, 0.2, 2, 0, Q.panic(t), { mouth: 'o', eyeScale: 1.5, sweat: true });
      W.siren.visible = true; W.siren.position.copy(L('square', 4, 0, 0)); W.sirenHead.rotation.y = t * 12;
      W.sirenLight.intensity = 800; W.sirenLight.position.copy(L('square', 4, 9.5, 0)); W.sirenLight.target.position.copy(L('square', 4 + Math.cos(t * 12) * 10, 0, Math.sin(t * 12) * 10)); W.sirenLight.target.updateMatrixWorld();
      lights({ sky: 0x8a2020, exposure: 0.9 }); cam('square', [2.0, 5.0, 10.5], [2.0, 6.2, 0], 50);
      ov.flash((Math.floor(t * 8) % 2) * 0.12); ov.tint('rgba(255,0,0,0.18)'); }
  });
  // ================= SCENE 4 =================
  shot(() => E.panic[1], (t, T, d, ov) => { // Alex picks up tiny dumbbells, dramatic
    garageL();
    const pick = ease.io(seg(t, 0.8, 1.6));
    put(C.alex, 'garage', 0, flr.garage, 1, 0, lerpPose(P.idle(t), { body: [0.9, 0, 0], bodyY: 1.4, armL: [-1.4, 0, 0.1], armR: [-1.4, 0, -0.1] }, 1 - pick), { brow: 1, mouth: 'flat' });
    C.alex.headband.visible = true;
    for (const [db, s] of [[W.tinyDB, 'R'], [W.dumbL, 'L']]) { db.visible = true; db.scale.setScalar(2.6); db.position.copy(C.alex.handWorld(s)).add(V(0, 0.05, 0.1)); }
    const u = ease.in(t / d); cam('garage', mix([0, 1.0, 13], [0, 2.8, 8], u), [0, 3.4, 1], 40);
  });
  shot(23.6, (t, T, d, ov) => { // closeup: dumbbells + intense face
    garageL();
    put(C.alex, 'garage', 0, flr.garage, 1, 0, Q.curl(t, 0.2), { brow: 1.1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    for (const [db, s] of [[W.tinyDB, 'R'], [W.dumbL, 'L']]) { db.visible = true; db.scale.setScalar(2.6); db.position.copy(C.alex.handWorld(s)).add(V(0, 0.05, 0.1)); }
    if (t < 1.0) cam('garage', [-0.8, 2.6, 4.5], [-1.2, 2.2, 1.5], 34); else cam('garage', [0, 4.6, 4.8 - (t - 1) * 0.6], [0, 4.6, 1], 34);
  });
  const lift = (t, T, names, ov, zoom = true) => {
    garageL(); const u = hussU(T, names, 0.5); const k = hussK(T, names);
    put(C.alex, 'garage', 0, flr.garage, 1, 0, Q.curl(T, u, 1), { brow: 1.1, mouth: 'grit', sweat: true, eyeOpen: 0.7 }); C.alex.headband.visible = true;
    for (const n of names) talk(C.alex, n, T);
    for (const [db, s] of [[W.tinyDB, 'R'], [W.dumbL, 'L']]) { db.visible = true; db.scale.setScalar(2.6); db.position.copy(C.alex.handWorld(s)).add(V(0, 0.05, 0.1)); }
    const z = zoom ? k : 0; cam('garage', [0.4, 3.8, 11.5 - z * 1.8], [0, 3.4 + z * 0.25, 1], 40 - z * 2);
  };
  shot(() => e0('h1') - 0.1, (t, T, d, ov) => lift(t, T, ['h1', 'h2', 'h3'], ov));
  shot(() => e0('d4') + 0.05, (t, T, d, ov) => { // party cut
    partyL(T);
    put(C.jake, 'party', -1.5, flr.party, 5, 0.2, P.dance(t, 0), { mouth: 'grin', blush: true });
    put(C.grandma, 'party', 2.6, flr.party, 3.5, -0.3, P.dance(t + 0.3, 1), { mouth: 'grin' });
    put(C.baker, 'party', -4.6, flr.party, 1, 0.4, P.dance(t + 0.6, 3), { mouth: 'grin' });
    put(C.mailman, 'party', 5.4, flr.party, 0.5, -0.4, P.dance(t + 0.2, 2), { mouth: 'grin' });
    crowd.slice(0, 6).forEach((c, i) => put(c, 'party', -8 + i * 3.2, flr.party, -4, 0, P.dance(t + i * 0.3, i % 4), { mouth: 'grin' }));
    cam('party', mix([-2, 5, 20], [1, 4.6, 17], t / d), [0, 3.6, 2], 42);
  });
  shot(() => e0('d4') + 1.2, (t, T, d, ov) => { // back to Alex: "grinding, by the way"
    garageL(); const btw = T >= e0('btw4') - 0.05;
    put(C.alex, 'garage', 0, flr.garage, 1, btw ? 0.1 : 0, Q.curl(T, 0.5 + 0.4 * S(T * 5), 1), btw ? { brow: -0.3, browUp: 0.8, mouth: 'flat', lid: 0.25, sweat: true } : { brow: 1, mouth: 'smile', sweat: true });
    C.alex.headband.visible = true; talk(C.alex, 'd4', T); talk(C.alex, 'btw4', T);
    for (const [db, s] of [[W.tinyDB, 'R'], [W.dumbL, 'L']]) { db.visible = true; db.scale.setScalar(2.6); db.position.copy(C.alex.handWorld(s)).add(V(0, 0.05, 0.1)); }
    if (!btw) cam('garage', [1.2, 4.4, 8.5], [0, 4.0, 1], 38); else cam('garage', [0.2, 4.6, 5.4], [0, 4.6, 1], 32);
  });
  // ================= SCENE 5 =================
  const sunset = () => lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] });
  shot(() => E.s4end[1], (t, T, d, ov) => { // dramatic stretching
    sunset(); sunAt('court', 14, 0, [30, 14, 10]);
    put(C.alex, 'court', 14, flr.court, 0, 0.3, Q.stretch(t), { brow: 1, mouth: 'flat', eyeOpen: 0.6 }); C.alex.headband.visible = true;
    ballAt(balls[0], L('court', 16, 0.65, 1.5));
    cam('court', [14 + S(t * 0.5) * 9, 3.2, 9 * Cc(t * 0.5) + 0], [14, 3.6, 0], 44);
  });
  shot(32.2, (t, T, d, ov) => { // tightening shoes
    sunset(); sunAt('court', 14, 0, [30, 14, 10]);
    put(C.alex, 'court', 14, flr.court, 0, 0.3, P.tieShoe(t * 1.3), { brow: 1, mouth: 'flat', eyeOpen: 0.6 }); C.alex.headband.visible = true;
    const u = ease.io(t / d); cam('court', mix([15.8, 0.6, 4.4], [16.2, 1.4, 5.4], u), mix([14.6, 0.5, 2.2], [14.4, 1.2, 1.6], u), 50);
  });
  shot(33.8, (t, T, d, ov) => { // ECU eyes, then ball
    sunset(); sunAt('court', 14, 0, [30, 14, 10]);
    put(C.alex, 'court', 14, flr.court, 0, 0, P.idle(t), { brow: 1.2, mouth: 'flat', eyeOpen: 0.55 }); C.alex.headband.visible = true;
    if (t < 0.45) cam('court', [14, 4.75, 2.6 - t], [14, 4.75, 0], 30);
    else { hold(balls[0], C.alex, 'R', [0.4, 1.4, 0.6]); C.alex.pose({ armR: [-1.4, 0, 0] }); const b = balls[0].position; camera.position.set(b.x + 0.4, b.y + 0.3, b.z + 2.4 - (t - 0.45) * 1.2); camera.lookAt(b); camera.fov = 34; camera.updateProjectionMatrix(); }
  });
  shot(() => e0('h4') - 0.05, (t, T, d, ov) => { // huss dribbles, HUSS jumper
    sunset(); sunAt('court', 18, 0, [30, 14, 10]);
    const tj = e0('h6') - (e0('h4') - 0.05); const jmp = seg(t, tj - 0.05, tj + 0.5);
    const p = jmp > 0 ? (jmp < 0.5 ? P.shootSet() : P.shootRelease()) : P.dribble(t, 1.1);
    put(C.alex, 'court', 16, flr.court + S(jmp * PI) * 1.6, 0, PI / 2, p, { brow: 1.1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    for (const n of ['h4', 'h5', 'h6']) talk(C.alex, n, T);
    if (jmp <= 0) dribble(balls[0], C.alex, t, 1.1); else if (jmp < 0.5) hold(balls[0], C.alex, 'R', [0.2, 0.5, 0]);
    else { const u = seg(T, e0('h6') + 0.2, e0('shot')); ballAt(balls[0], arc(L('court', 16.6, 7.3, 0), L('court', 28.7, 9.8, 0), 3.5, u)); }
    const k = hussK(T, ['h4', 'h5', 'h6']);
    if (jmp < 0.5) cam('court', [10 - k * 0.6, 3.0, 9 - k * 1.2], [16, 3.4, 0], 44); else cam('court', [11, 2.2, 10], [21, 7, 0], 44);
    if (jmp > 0.2) ov.filter('saturate(1.3) contrast(1.05)');
  });
  shot(() => e0('shot'), (t, T, d, ov) => { // off backboard into his face
    sunset(); sunAt('court', 18, 0, [30, 14, 10]);
    const th = 0.35; const hit = t > th;
    const fall = ease.out(seg(t, th, th + 0.4));
    put(C.alex, 'court', 16, flr.court, 0, PI / 2, hit ? P.fallBack(fall) : P.shootRelease(), hit ? { eyeOpen: 0.05, mouth: 'wavy' } : { mouth: 'grin', brow: 0.6 }); C.alex.headband.visible = true;
    if (!hit) { ballAt(balls[0], arc(L('court', 28.7, 9.8, 0), L('court', 17.2, 4.8, 0), 0.4, t / th)); } else { const v = t - th; ballAt(balls[0], L('court', 17.6 + v * 4, Math.max(0.55, 4.8 + v * 3 - v * v * 16), v * 2)); if (fall > 0.5) stars(C.alex, t); }
    const sh = hit && t < th + 0.25 ? [S(t * 60) * 0.12, S(t * 71) * 0.12] : [0, 0];
    cam('court', [22 + sh[0], 4.5 + sh[1], 11], [18.5, 5, 0], 44);
  });
  shot(() => e0('awk5'), (t, T, d, ov) => { // awkward silence
    sunset(); sunAt('court', 16, 0, [30, 14, 10]);
    put(C.alex, 'court', 16, flr.court, 0, PI / 2, P.fallBack(1), { eyeOpen: 1, mouth: 'flat', look: [0, 1], brow: -0.3 }); C.alex.headband.visible = true;
    ballAt(balls[0], L('court', 20 + t * 1.2, 0.65, 3 + t)); balls[0].rotation.z = -t * 3;
    cam('court', [16.5, 9.5, 2.5], [16.4, 0.3, 0.6], 40);
  });
  // ================= SCENE 6 =================
  shot(() => E.awk5[1], (t, T, d, ov) => { // grandma 0/30
    gymL();
    const cyc = 0.38; const k = Math.floor(t / cyc), ph = (t % cyc) / cyc;
    put(C.grandma, 'gym', 14, flr.gym, 0, PI / 2, ph < 0.3 ? P.shootSet() : P.shootRelease(), { mouth: 'o', eyeScale: 1.2 + k * 0.05, sweat: k > 2 });
    for (let i = 0; i <= Math.min(k, 6); i++) { const pp = i === k ? ph : 1; const miss = [[1, 3], [-2, -4], [3, -1], [-1, 5], [2, 2], [-3, -2], [1, -5]][i % 7];
      ballAt(balls[i], pp < 1 ? arc(L('gym', 14.5, 7, 0), L('gym', R + miss[0] * 0.7, 8.6, miss[1] * 0.5), 3, Math.min(1, pp * 1.4)) : L('gym', R - 3 - i * 1.5 + miss[0], 0.65, miss[1] * 1.4)); }
    cam('gym', [8, 4.5, 12], [17, 5.5, 0], 50);
    ov.badge(`<div style="font:900 96px Inter;color:#ff3b30;-webkit-text-stroke:14px #000;paint-order:stroke fill">0 / ${Math.min(30, 3 + k * 4)}</div>`);
  });
  shot(39.3, (t, T, d, ov) => { // mailman package into trash -> fired
    gymL(); W.trash.visible = true;
    const rel = 0.3;
    put(C.mailman, 'gym', -10, flr.gym, 6, face(-10, 6, -17, 12), t < rel ? P.shootSet() : P.shootRelease(), { mouth: t > 0.9 ? 'o' : 'grin', eyeScale: t > 0.9 ? 1.4 : 1 });
    W.pkg.visible = true; W.pkg.scale.setScalar(0.5);
    if (t < rel) W.pkg.position.copy(C.mailman.handWorld('R')).add(V(0, 0.5, 0)); else { const u = seg(t, rel, 0.9); W.pkg.position.copy(arc(L('gym', -10.6, 6.8, 6.6), L('gym', -17, 2.4, 12), 3, u)); W.pkg.rotation.set(u * 7, u * 2, 0); }
    cam('gym', [0, 6, -2], [-15, 2.5, 11], 46);
    if (t > 0.95) ov.badge('<div style="font:900 110px Inter;color:#ff3b30;border:12px solid #ff3b30;padding:4px 26px;border-radius:14px;transform:rotate(-12deg);background:rgba(255,255,255,0.85)">FIRED</div>', ease.back(seg(t, 0.95, 1.15)));
  });
  shot(40.6, (t, T, d, ov) => { // mayor blames the wind (AC)
    gymL(); W.acWind.visible = true; W.acWind.children.forEach((w, i) => { w.position.x = 18 + ((t * 3 + i * 0.7) % 3) - 1.5; });
    put(C.mayor, 'gym', 12, flr.gym, -12, face(12, -12, 18, -21), lerpPose(P.point(t, 'R'), { armR: [-2.2, 0, 0.0], body: [0, 0, S(t * 20) * 0.04] }, 1), { mouth: 'shout', brow: 1.2, eyeScale: 1.1 });
    cam('gym', [6, 5, 0], [15, 8, -18], 44);
  });
  shot(42.0, (t, T, d, ov) => { // reveal: indoors
    gymL(); W.acWind.visible = true;
    put(C.mayor, 'gym', 12, flr.gym, -12, face(12, -12, 18, -21), P.point(t, 'R'), { mouth: 'shout', brow: 1.2 });
    C.mayor.armR.rotation.set(-2.2, 0, 0);
    const u = ease.io(t / d); cam('gym', mix([9, 4, -4], [-6, 14, 18], u), mix([14, 6, -16], [8, 11, -10], u), 46);
  });
  shot(() => e0('h7') - 0.15, (t, T, d, ov) => { // one push-up, collapse
    garageL();
    const k = hussK(T, ['h7', 'h8', 'h9']); const col = seg(T, e0('collapse'), e0('collapse') + 0.2);
    let u = k === 0 ? 0 : k === 1 ? Math.min(1, (T - e0('h7')) * 3) : 1 - Math.min(0.35, (T - e0('h8')) * 0.6);
    const p = P.pushup(T, u); if (k >= 2) { p.body[2] = S(T * 40) * 0.04; }
    if (col > 0) { p.bodyY = 1.6 - 0.5 - col * 0.55; p.armL = [-PI / 2 - 1.2, 0, 1.2]; p.armR = [-PI / 2 - 1.2, 0, -1.2]; p.legL = [-0.25, 0, 0]; p.legR = [-0.25, 0, 0]; p.body[0] = PI / 2 - 0.12; }
    put(C.alex, 'garage', -2, flr.garage, 3.8, PI, p, col > 0 ? { eyeOpen: 0.05, mouth: 'wavy', sweat: true } : { brow: 1.1, mouth: 'grit', sweat: true, eyeOpen: 0.6 }); C.alex.headband.visible = true;
    for (const n of ['h7', 'h8', 'h9']) talk(C.alex, n, T);
    cam('garage', mix([10, 2.6, 3.0], [5, 2.2, 0.8], k / 3), mix([-2, 1.4, 2.2], [-2, 1.4, 0.0], k / 3), 40 - k * 2);
  });
  // ================= SCENE 7 =================
  const evening = () => lights({ sky: 0xffa070, sunColor: 0xffb070, sun: 2.0, exposure: 1.0, dir: [-25, 16, 18] });
  shot(() => E.collapse[1], (t, T, d, ov) => { // Jake examines ball, Alex squats in bg
    evening(); sunAt('court', -10, 6, [-25, 16, 18]);
    put(C.jake, 'court', -10, flr.court, 6, 0.4, lerpPose(P.idle(t), { armL: [-1.3, 0, -0.3], armR: [-1.3, 0, 0.3], neck: [0.35, 0, 0] }, 1), { mouth: 'flat', brow: -0.3, look: [0, 1] });
    ballAt(balls[0], C.jake.handWorld('R').lerp(C.jake.handWorld('L'), 0.5).add(V(0, 0.4, 0.3))); balls[0].rotation.set(t * 2, t * 3, 0);
    put(C.alex, 'court', -16, flr.court, -2, 0.6, Q.squat(t, 0.5 + 0.5 * S(t * 4)), { brow: 1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    cam('court', [-6, 4, 15], [-11, 3.4, 4], 42);
  });
  shot(48.2, (t, T, d, ov) => { // ECU blinking light
    evening(); sunAt('court', -10, 6, [-25, 16, 18]);
    put(C.jake, 'court', -10, flr.court, 6, 0.4, lerpPose(P.idle(t), { armL: [-1.6, 0, -0.3], armR: [-1.6, 0, 0.3], neck: [0.4, 0, 0] }, 1), { mouth: 'o', eyeScale: 1.3, look: [0, 1] });
    const bp = C.jake.handWorld('R').lerp(C.jake.handWorld('L'), 0.5).add(V(0, 0.75, 0.3)); ballAt(balls[0], bp); balls[0].rotation.set(PI, 0, 0);
    W.blink.visible = Math.floor(t * 4) % 2 === 0; W.blink.position.copy(bp).add(V(0, -0.55, 0));
    const z = ease.io(seg(t, 0.2, d)); camera.position.copy(bp).add(V(mix([3, 0], [0.9, 0], z)[0], -1.6 + z * 0.4, 4 - z * 2.6)); camera.lookAt(bp.clone().add(V(0, -0.45, 0))); camera.fov = 40; camera.updateProjectionMatrix();
  });
  shot(() => e0('j_wifi') - 0.1, (t, T, d, ov) => { // Jake "why does my basketball need wifi?"
    evening(); sunAt('court', -10, 6, [-25, 16, 18]);
    put(C.jake, 'court', -10, flr.court, 6, 0.3, lerpPose(P.idle(t), { armR: [-2.6, 0, 0.2] }, 1), { mouth: 'smile', brow: -0.6, eyeScale: 1.15 });
    hold(balls[0], C.jake, 'R', [0, 0.7, 0]); W.blink.visible = Math.floor(t * 4) % 2 === 0; W.blink.position.copy(balls[0].position).add(V(0, -0.55, 0));
    talk(C.jake, 'j_wifi', T);
    put(C.alex, 'court', -16, flr.court, -2, 0.6, Q.squat(t, 0.5 + 0.5 * S(t * 4)), { brow: 1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    cam('court', [-8.2, 4.8, 13], [-10.8, 4.4, 4], 40);
  });
  shot(() => e0('h10') - 0.1, (t, T, d, ov) => { // HUSS squats, Jake annoyed in fg
    evening(); sunAt('court', -14, 2, [-25, 16, 18]);
    const u = hussU(T, ['h10', 'h11', 'h12'], 0.5);
    put(C.alex, 'court', -16, flr.court, -2, 0.6, Q.squat(T, u), { brow: 1.2, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    for (const n of ['h10', 'h11', 'h12']) talk(C.alex, n, T);
    const k = hussK(T, ['h10', 'h11', 'h12']);
    put(C.jake, 'court', -6.5, flr.court, 3, face(-6.5, 3, -16, -2) + 0.5, lerpPose(P.idle(t), { neck: [0, -0.3, 0] }, 1), { mouth: 'frown', brow: 0.4 + k * 0.3, eyeOpen: 1 - k * 0.15, lid: 0.15 * k });
    hold(balls[0], C.jake, 'R', [0, 0.2, 0.3]);
    cam('court', [-4, 4.5, 10], [-10.5, 3.6, 0], 55);
  });
  shot(() => e0('j_stop') - 0.05, (t, T, d, ov) => { // BRO, STOP!
    evening(); sunAt('court', -12, 4, [-25, 16, 18]);
    put(C.jake, 'court', -11.5, flr.court, 4.5, 0.4, lerpPose(P.idle(t), { armL: [-0.4, 0, 1.0], armR: [-0.4, 0, -1.0] }, 1), { mouth: 'shout', brow: 1.4, eyeScale: 1.1, sweat: false });
    talk(C.jake, 'j_stop', T);
    const z = ease.out(seg(t, 0, 0.25)); const sh = t < 0.6 ? [S(t * 50) * 0.05, S(t * 63) * 0.05] : [0, 0];
    cam('court', [-11.5 + Math.sin(0.4) * (7 - z * 3.6) + sh[0], 4.6 + sh[1], 4.5 + Math.cos(0.4) * (7 - z * 3.6)], [-11.5, 4.6, 4.5], 38);
  });
  // ================= SCENE 8 =================
  const dusk = () => lights({ sky: 0x7a6ab0, sunColor: 0xffb890, sun: 1.6, hemi: 0.9, hemiSky: 0xb0a0ff, exposure: 1.05, dir: [-20, 20, 25] });
  shot(() => E.s7end[1], (t, T, d, ov) => { // following the signal to coach's garage
    dusk(); sunAt('coach', 10, 4, [-20, 20, 25]);
    const x = -14 + t * 5.5;
    put(C.jake, 'coach', x, flr.walk, 9.5, PI / 2, lerpPose(P.walk(t, 0.9), { armR: [-1.5, 0, 0] }, 1), { mouth: 'flat', brow: 0.3 });
    hold(balls[0], C.jake, 'R', [0, 0.6, 0]); W.blink.visible = Math.floor(t * 4) % 2 === 0; W.blink.position.copy(balls[0].position).add(V(0, -0.55, 0));
    put(C.alex, 'coach', x - 3.5, flr.walk, 10.5, PI / 2, P.walk(t + 0.3, 0.9), { brow: 1, mouth: 'flat' }); C.alex.headband.visible = true;
    cam('coach', [x + 8, 4.5, 24], [x + 1, 3.5, 9.5], 44);
  });
  shot(58.0, (t, T, d, ov) => { // at the side door: Alex winds up dramatically
    dusk(); sunAt('coach', 16, -3, [-20, 20, 25]);
    put(C.alex, 'coach', 19.2, 0.02, -3.5, -PI / 2, lerpPose(P.idle(t), Q.kick(0.2), ease.io(seg(t, 0.8, 2))), { brow: 1.2, mouth: 'grit' }); C.alex.headband.visible = true;
    put(C.jake, 'coach', 21, 0.02, -7.5, face(21, -7.5, 19.2, -3.5), lerpPose(P.idle(t), { armL: [0, 0, 0.3] }, 1), { mouth: 'flat', lid: 0.3 });
    hold(balls[0], C.jake, 'R', [0, 0.2, 0.3]);
    cam('coach', mix([21.5, 4.2, 6], [21, 4.2, 5], ease.io(t / d)), [17.5, 3.8, -3.5], 46);
  });
  shot(() => e0('h13') - 0.1, (t, T, d, ov) => { // HUSS kick -> hurts foot, hops
    dusk(); sunAt('coach', 16, -3, [-20, 20, 25]);
    const tk = 0.18; const kicked = t > tk + 0.12;
    const p = !kicked ? Q.kick(clamp01(t / tk)) : Q.hop(t);
    put(C.alex, 'coach', kicked ? 19.6 + S(t * 3) * 0.6 : 18.4, 0.02, -3.5 + (kicked ? S(t * 4) * 0.8 : 0), -PI / 2 + (kicked ? S(t * 5) * 0.6 : 0), p, kicked ? { mouth: 'o', eyeScale: 1.5, tear: true, sweat: true } : { brow: 1.2, mouth: 'grit' });
    C.alex.headband.visible = true; talk(C.alex, 'h13', T);
    if (kicked && t < tk + 0.35) ov.flash(0.25 * (1 - (t - tk - 0.12) / 0.23));
    put(C.jake, 'coach', 21.5, 0.02, -7.5, face(21.5, -7.5, 19, -3.5), P.idle(t), { mouth: 'flat', lid: 0.4 });
    const sh = kicked && t < tk + 0.3 ? [S(t * 60) * 0.1, S(t * 70) * 0.1] : [0, 0];
    cam('coach', [21.5 + sh[0], 4.2 + sh[1], 6.5], [18, 3.4, -3.5], 48);
  });
  shot(61.3, (t, T, d, ov) => { // Jake opens via handle; blue glow
    dusk(); sunAt('coach', 16, -3, [-20, 20, 25]);
    const op = ease.io(seg(t, 0.15, 0.6)); W.coachDoor.rotation.y = -1.6 * op; W.doorGlow.intensity = 60 * op;
    put(C.jake, 'coach', 17.4, 0.02, -1.2, -PI / 2 - 0.4, lerpPose(P.idle(t), { armR: [-1.5, 0.3, 0] }, 1 - op * 0.3), { mouth: 'flat', lid: 0.35 });
    put(C.alex, 'coach', 20.2, 0.02, -5, -PI / 2 + 0.3, Q.hop(t + 1), { mouth: 'o', eyeScale: 1.3, tear: true }); C.alex.headband.visible = true;
    cam('coach', [28, 4.5, 4], [17, 3.6, -3], 44);
  });
  // ================= SCENE 9 =================
  shot(() => 61.9, (t, T, d, ov) => { // secret room reveal (backs)
    secretL(); W.drawScreens(T);
    put(C.alex, 'secret', -4, flr.secret, 5.5, PI, P.idle(t), { mouth: 'o', eyeScale: 1.4 }); C.alex.headband.visible = true;
    put(C.jake, 'secret', 4, flr.secret, 5.5, PI, P.idle(t), { mouth: 'o', eyeScale: 1.4 });
    W.ctrl.visible = true; W.ctrl.position.copy(L('secret', 0.5, 3.4, -7.5)); W.chips.visible = true; W.chips.position.copy(L('secret', -2.5, 3.95, -7.8));
    const u = ease.io(t / d); cam('secret', mix([0, 8.5, 16], [0, 7.5, 11], u), [0, 5.6, -10], 50);
  });
  shot(63.0, (t, T, d, ov) => { // reaction front
    secretL(); W.drawScreens(T);
    put(C.alex, 'secret', -1.6, flr.secret, 5.5, 0.15, P.idle(t), { mouth: 'o', eyeScale: 1.45, look: [0, -0.4] }); C.alex.headband.visible = true;
    put(C.jake, 'secret', 1.6, flr.secret, 5.5, -0.15, P.idle(t), { mouth: 'o', eyeScale: 1.45, look: [0, -0.4] }); W.gchair.visible = false;
    cam('secret', [0, 4.4, 14.5 - t * 1.2], [0, 4.3, 5.5], 40);
  });
  const fbTint = (ov) => { ov.filter('sepia(0.55) saturate(1.3) hue-rotate(-10deg)'); ov.stamp('⏪ FLASHBACK'); };
  shot(64.0, (t, T, d, ov) => { // coach in gaming chair, chips + controller
    secretL(); W.drawScreens(T); W.gchair.visible = true;
    const p = P.sitChair(t, 1.9); const chip = (t % 0.9) < 0.35; p.armL = chip ? [-2.4, 0, -0.5] : [-1.15, 0, -0.35]; p.armR = [-1.15 + S(t * 30) * 0.08, 0, 0.35];
    put(C.coach, 'secret', 0, flr.secret, -3.0, PI, p, { mouth: chip ? 'flat' : 'smile', lid: 0.35 });
    W.ctrl.visible = true; W.ctrl.position.copy(C.coach.handWorld('R').lerp(C.coach.handWorld('L'), chip ? 0 : 0.5)).add(V(0, 0.2, -0.3)); if (chip) W.ctrl.position.copy(C.coach.handWorld('R')).add(V(0.4, 0.2, -0.3));
    W.chips.visible = true; W.chips.position.copy(L('secret', 2.2, 3.95, -7.6));
    cam('secret', [2.6, 5.4, -9.4], [0, 4.4, -3], 44); fbTint(ov);
  });
  shot(65.4, (t, T, d, ov) => { // aimbot curving shots: grandma
    day(); sunAt('court', 10, 0);
    const rel = 0.2;
    put(C.grandma, 'court', -4, flr.court, 4, PI / 2 - 0.5, t < rel ? P.shootSet() : P.shootRelease(), { mouth: 'grin', brow: 0.6 });
    const u = seg(t, rel, 1.3);
    let p;
    if (u < 0.45) p = arc(L('court', -3.5, 7, 4), L('court', 6, 14, 18), 3, u / 0.45); // flying wildly off
    else { const v = (u - 0.45) / 0.55; p = arc(L('court', 6, 14, 18), rimC, 4, v); }
    if (t < rel) hold(balls[0], C.grandma, 'R', [0.2, 0.5, 0]); else ballAt(balls[0], u < 1 ? p : L('court', R, 8.3 - (t - 1.3) * 9, 0));
    cam('court', [4, 7, 34], [10, 8, 6], 58); fbTint(ov);
    if (u > 0.4 && u < 0.6) ov.badge('<div style="font:900 70px Inter;color:#34e07a;-webkit-text-stroke:10px #000;paint-order:stroke fill">🎯 AIM LOCK</div>');
  });
  shot(66.8, (t, T, d, ov) => { // coach falls asleep holding controller
    secretL(); W.drawScreens(T); W.gchair.visible = true;
    const sl = ease.io(seg(t, 0.2, 0.9));
    const p = P.sitChair(t, 1.9); p.armL = [-1.15 + sl * 0.5, 0, -0.35]; p.armR = [-1.15 + sl * 0.5, 0, 0.35]; p.neck = [0.1 + sl * 0.3, 0, sl * 0.55];
    put(C.coach, 'secret', 0, flr.secret, -3.0, PI, p, { eyeOpen: 1 - sl, mouth: sl > 0.5 ? 'o' : 'flat', lid: 0.35 });
    W.ctrl.visible = true; W.ctrl.position.copy(C.coach.handWorld('R').lerp(C.coach.handWorld('L'), 0.5)).add(V(0, 0.2, -0.3));
    cam('secret', [-3.5, 4.8, -9], [0, 4.6, -3], 46); fbTint(ov);
    if (sl > 0.6) ov.badge(`<div style="font:900 ${70 + 20 * S(t * 3)}px Inter;color:#fff;-webkit-text-stroke:10px #000;paint-order:stroke fill">Z z z</div>`);
  });
  // ================= SCENE 10 =================
  shot(() => E.s9end[1], (t, T, d, ov) => { // coach returns
    day(); sunAt('town', 10, 6);
    const x = 38 - t * 2.4;
    put(C.coach, 'town', x, flr.walk, 6.5, -PI / 2, P.walk(t, 0.9), { mouth: 'smile', lid: 0.3 }); C.coach.shades.visible = true; C.coach.pose({ armR: [0, 0, -0.35] });
    W.suitcase.visible = true; W.suitcase.position.copy(C.coach.handWorld('R')).add(V(0, -2.4, 0)); W.suitcase.position.y = flr.walk; W.suitcase.rotation.y = PI / 2;
    [C.alex, C.jake, C.grandma, C.mailman, C.baker, C.mayor].forEach((c, i) => put(c, 'town', 21 + i * 1.6, flr.walk, 6.5 - (i % 2) * 1.6, face(21 + i * 1.6, 6.5, x, 6.5) + 0.2, P.idle(t + i), { mouth: 'flat', brow: 0.4 }));
    C.alex.headband.visible = true;
    cam('town', [x + 1, 5, 12.4], [x - 6, 3.4, 5.5], 46);
    ov.badge('<div style="font:900 60px Inter;color:#fff;background:#2a9d8f;border:7px solid #000;border-radius:18px;padding:8px 22px">🌴 BACK FROM VACATION</div>');
  });
  shot(71.4, (t, T, d, ov) => { // surrounded, dead controller
    day(); sunAt('town', 14, 6);
    const cx = 14, cz = 4;
    put(C.coach, 'town', cx, flr.walk, cz, 0, lerpPose(P.idle(t), { armR: [-2.4, 0, 0.2] }, 1), { mouth: 'flat', lid: 0.4 }); C.coach.shades.visible = t < 0.8;
    W.ctrl.visible = true; W.ctrl.position.copy(C.coach.handWorld('R')).add(V(0, 0.5, 0.3)); W.ctrl.rotation.x = 1.2; ledOn(false);
    const ring = [C.alex, C.jake, C.grandma, C.mailman, C.baker, C.mayor];
    ring.forEach((c, i) => { const a = PI * 1.12 + i / (ring.length - 1) * PI * 0.76; const x = cx + Math.cos(a) * 5.5, z = cz + Math.sin(a) * 4.5; put(c, 'town', x, flr.walk, z, face(x, z, cx, cz), P.idle(t + i), { mouth: 'o', eyeScale: 1.25, look: [0, -0.3] }); });
    C.alex.headband.visible = true;
    cam('town', [cx + 1, 7.5 - t * 0.6, 12.4], [cx, 4.0, cz - 1], 46);
    if (t > 0.9) ov.badge('<div style="font:900 90px Inter">🪫</div><div style="font:900 50px Inter;color:#ff3b30;-webkit-text-stroke:8px #000;paint-order:stroke fill">0%</div>');
  });
  shot(() => e0('m_lebron') - 0.1, (t, T, d, ov) => { // mayor panics
    day(); sunAt('town', 14, 6);
    put(C.mayor, 'town', 18.5, flr.walk, 6.5, face(18.5, 6.5, 16, 11.8), lerpPose(Q.panic(t * 0.6), { bodyY: 2 }, 0.5), { mouth: 'o', eyeScale: 1.45, sweat: true, brow: -0.8, tear: t > 1.2 });
    talk(C.mayor, 'm_lebron', T);
    cam('town', [16, 4.7, 11.8], [18.5, 4.6, 6.5], 40);
  });
  shot(() => e0('c_dribble') - 0.15, (t, T, d, ov) => { // coach deadpan
    day(); sunAt('town', 14, 6);
    put(C.coach, 'town', 14, flr.walk, 4, 0.5, lerpPose(P.idle(t), { armR: [-0.3, 0, 0.1] }, 1), { mouth: 'flat', lid: 0.45, brow: -0.1 });
    talk(C.coach, 'c_dribble', T);
    cam('town', [16.6, 4.8, 9.8], [14, 4.6, 4], 38);
  });
  shot(() => e0('crown'), (t, T, d, ov) => { // mayor removes crown, sad
    day(); sunAt('town', 18, 8);
    const u = ease.io(seg(t, 0.1, 0.8));
    put(C.mayor, 'town', 18.5, flr.walk, 6.5, face(18.5, 6.5, 17, 12.2), lerpPose(P.idle(t), { armL: [-2.8 + u * 1.6, 0, -0.5], armR: [-2.8 + u * 1.6, 0, 0.5], neck: [0.3 * u, 0, 0] }, 1), { mouth: 'frown', brow: -1, eyeOpen: 1, tear: true });
    C.mayor.crown.visible = false; const cr = W.crownProp; cr.visible = true;
    const h = C.mayor.handWorld('R').lerp(C.mayor.handWorld('L'), 0.5); cr.position.copy(h).add(V(0, 0.2 + (1 - u) * 0.3, 0));
    cam('town', [17.0, 4.7, 12.2], [18.4, 4.7, 6.5], 38);
    ov.vig(1);
  });
  // ================= SCENE 11 =================
  shot(() => E.crown[1], (t, T, d, ov) => { // plug in charger, LED green, screens back
    interior({ sun: 0.8, hemi: 0.8 }); sunAt('secret', 0, 0); W.secretLight.intensity = 120;
    const plug = seg(t, 0.4, 0.8);
    W.ctrl.visible = true; W.ctrl.position.copy(L('secret', 0, 3.4, -6.8)); ledOn(t > 0.85, 0x34e07a);
    W.charger.visible = true; W.charger.position.copy(L('secret', 2.4 - plug * 1.6 + 0.0, 3.45, -7.1)); W.charger.rotation.y = PI;
    put(C.coach, 'secret', 0.5, flr.secret, -3.4, PI, lerpPose(P.idle(t), { armR: [-1.3 + 0.2 * plug, -0.4, 0], neck: [0.5, 0, 0] }, 1), { mouth: 'smile', lid: 0.35 });
    W.drawScreens(T, t < 0.85);
    cam('secret', [2.6, 5.0, -1.8], [0.6, 3.4, -6.8], 40);
    if (t > 0.85) ov.badge('<div style="font:900 70px Inter;color:#34e07a;-webkit-text-stroke:10px #000;paint-order:stroke fill">🔋 AIMBOT: ON</div>', ease.back(seg(t, 0.85, 1.1)));
  });
  shot(80.9, (t, T, d, ov) => { // grandma full-court swish
    day(); sunAt('court', 0, 0);
    const rel = 0.3;
    put(C.grandma, 'court', -26, flr.court, 2, PI / 2, t < rel ? P.shootSet() : P.shootRelease(), { mouth: 'smirk', brow: 0.7 });
    if (t < rel) hold(balls[0], C.grandma, 'R', [0.2, 0.5, 0]); else { const u = seg(t, rel, 1.6); ballAt(balls[0], u < 1 ? arc(L('court', -25.4, 7, 2), rimC, 16, u) : L('court', R, 8.3 - (t - 1.6) * 9, 0)); }
    const b = balls[0].position; camera.position.set(b.x - 9, Math.max(4, b.y - 1), 17); camera.lookAt(b.x + 2, b.y, 1); camera.fov = 46; camera.updateProjectionMatrix();
  });
  shot(() => e0('fullcourt'), (t, T, d, ov) => { // everyone celebrates
    day(); sunAt('court', 0, 0); W.courtConfetti.visible = true; W.courtConfetti.position.set(0, 0, 0); W.courtConfetti.update(t + 1);
    [C.grandma, C.mailman, C.baker, C.mayor, C.jake, C.coach].forEach((c, i) => put(c, 'court', -6 + i * 2.4, flr.court, (i % 2) * 2, 0.2 * (2.5 - i) * 0.4, P.armsUp(t + i * 0.3), { mouth: 'grin', eyeOpen: 0.2 }));
    cam('court', [9, 4.2, 16], [-0.5, 3.6, 0.5], 42);
  });
  shot(() => e0('h14') - 0.05, (t, T, d, ov) => { // Alex layup prep HUSS -> misses
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 22, 0, [30, 14, 10]);
    const tj = e0('h16') - (e0('h14') - 0.05); const jmp = seg(t, tj, tj + 0.45);
    const p = jmp > 0 ? Q.layup(jmp) : lerpPose(P.crouch(t), P.dribble(t, 0.8), 0.5);
    put(C.alex, 'court', 23.6 + jmp * 2.5, flr.court + S(jmp * PI) * 1.8, 0.8, PI / 2, p, { brow: 1.2, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    for (const n of ['h14', 'h15', 'h16']) talk(C.alex, n, T);
    if (jmp <= 0) dribble(balls[0], C.alex, t, 0.8); else if (jmp < 0.6) hold(balls[0], C.alex, 'R', [0, 0.4, 0]);
    else { const v = (jmp - 0.6) / 0.4 * 0.18 + Math.max(0, t - tj - 0.45); ballAt(balls[0], L('court', R - 1.0 - v * 9, Math.max(0.55, 8.0 + v * 7 - v * v * 18), 0.8 + v * 10)); }
    const k = hussK(T, ['h14', 'h15', 'h16']);
    if (jmp <= 0) cam('court', [30 - k * 0.6, 3.0, 7 - k * 1.0], [24, 3.6, 0.8], 42 - k * 2); else cam('court', [19, 2.4, 11], [25.5, 6.5, 0.5], 46);
    ov.filter(jmp > 0 && jmp < 0.7 ? 'saturate(1.35) contrast(1.06)' : '');
  });
  shot(() => e0('alexmiss') + 0.22, (t, T, d, ov) => { // coach mashing buttons
    secretL(); W.drawScreens(T); W.gchair.visible = true;
    const p = Q.pad(t, 1); p.bodyY = 2.4; p.legL = [-1.57, 0, 0.05]; p.legR = [-1.57, 0, -0.05];
    put(C.coach, 'secret', 0, flr.secret, -3.0, PI, p, { mouth: 'o', eyeScale: 1.4, brow: -0.6, sweat: true });
    W.ctrl.visible = true; W.ctrl.position.copy(C.coach.handWorld('R').lerp(C.coach.handWorld('L'), 0.5)).add(V(0, 0.2, -0.3)); ledOn(true, 0x34e07a); W.ctrl.rotation.z = S(t * 40) * 0.1;
    cam('secret', [-3.5, 5.2, -9.8], [0, 4.2, -3], 46);
  });
  shot(() => e0('j_aimbot') - 0.02, (t, T, d, ov) => { // Jake screaming
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 20, 4, [30, 14, 10]);
    put(C.jake, 'court', 20, flr.court, 4, 0.2, lerpPose(Q.panic(t), { bodyY: 2 }, 0.6), { mouth: 'shout', brow: 1.3, eyeScale: 1.35 });
    talk(C.jake, 'j_aimbot', T);
    const z = ease.out(seg(t, 0, 0.3)); cam('court', [20.6, 4.7, 4 + 8 - z * 3.5], [20, 4.6, 4], 40);
  });
  shot(() => e0('pull') - 0.05, (t, T, d, ov) => { // Alex pulls out tiny dumbbells: "Still grinding, by the way."
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 18, 2, [30, 14, 10]);
    const btw = T >= e0('btw11') - 0.05;
    put(C.alex, 'court', 18, flr.court, 2, 0, Q.curl(T, 0.5 + 0.45 * S(T * 6), 1), btw ? { brow: 1.2, mouth: 'flat', eyeOpen: 0.75 } : { brow: 1.1, mouth: 'flat', sweat: true });
    C.alex.headband.visible = true; talk(C.alex, 'd11', T); talk(C.alex, 'btw11', T);
    for (const [db, s] of [[W.tinyDB, 'R'], [W.dumbL, 'L']]) { db.visible = true; db.scale.setScalar(2.6); db.position.copy(C.alex.handWorld(s)).add(V(0, 0.05, 0.1)); }
    if (!btw) cam('court', [18.6, 4.2, 10], [18, 3.8, 2], 40);
    else { const z = ease.out(seg(T, e0('btw11'), e0('btw11') + 0.3)); cam('court', [18.1, 4.7, 7.5 - z * 2.6], [18, 4.7, 2], 34); }
    ov.black(T >= 89.78 ? 1 : 0);
  });
  shot(() => 89.8, (t, T, d, ov) => { ov.black(1); day(); cam('town', [0, 5, 10], [0, 5, 0], 40); ov.hideCap = true; });

  SH.forEach(s => { if (typeof s.a === 'function') s.a = s.a(); });
  for (let i = 1; i < SH.length; i++) if (!(SH[i].a > SH[i - 1].a)) console.log('SHOT ORDER PROBLEM', i, SH[i - 1].a, SH[i].a);
  console.log('shots', SH.length);
}
