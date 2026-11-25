import { THREE, scene, camera, setLighting, aimSun, P, lerpPose, makeBall, ease, seg, clamp01, V, arc } from './core.js';
import { makeCast, npc, referee } from './cast.js';
import { buildWorld, LOC, W } from './world.js';

let E, ENV, C, teens = [], crowd = [], ref, cust, balls = [];
const PI = Math.PI, S = Math.sin, Cc = Math.cos;
const allChars = [];
const props = [];

export function setup(TL, env) {
  E = TL.ev; ENV = env;
  buildWorld();
  C = makeCast();
  for (const k in C) { scene.add(C[k].root); allChars.push(C[k]); }
  for (let i = 0; i < 6; i++) { const n = npc(i); teens.push(n); scene.add(n.root); allChars.push(n); }
  for (let i = 0; i < 16; i++) { const n = npc(i + 3); crowd.push(n); scene.add(n.root); allChars.push(n); }
  ref = referee(); scene.add(ref.root); allChars.push(ref);
  cust = npc(5, { shirt: 0xff9f43 }); scene.add(cust.root); allChars.push(cust);
  for (let i = 0; i < 6; i++) { const b = makeBall(); scene.add(b); balls.push(b); }
  props.push(W.pkg, W.loaf, W.cookie, W.trophy, W.phone, W.mascotHead, W.mascotHead2, W.mascotBody, W.contract, W.mic, W.stars, W.brush, W.tinyDB, W.suv, W.car, W.nightStars, W.moon, W.shards, ...balls);
  W.flyer = (() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.1), new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, map: (() => { const c = document.createElement('canvas'); c.width = 320; c.height = 420; const g = c.getContext('2d'); g.fillStyle = '#ff2d95'; g.fillRect(0, 0, 320, 420); g.fillStyle = '#fff'; g.font = '900 64px Inter'; g.textAlign = 'center'; g.fillText('PARTY', 160, 120); g.fillText('TONIGHT', 160, 200); g.font = '900 120px Inter'; g.fillText('🎉', 160, 360); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })() })); scene.add(m); return m; })();
  props.push(W.flyer);
}

// ---------- helpers ----------
const L = (loc, x, y, z) => V(LOC[loc].x + x, y, LOC[loc].z + z);
function cam(loc, p, l, fov = 40, roll = 0) {
  camera.position.copy(L(loc, ...p)); camera.up.set(Math.sin(roll), Math.cos(roll), 0); camera.lookAt(L(loc, ...l)); camera.fov = fov; camera.updateProjectionMatrix();
}
const face = (x0, z0, x1, z1) => Math.atan2(x1 - x0, z1 - z0);
const mix = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
function put(ch, loc, x, y, z, ry, pose, expr) {
  ch.root.visible = true; ch.place(LOC[loc].x + x, y, LOC[loc].z + z, ry); if (pose) ch.pose(pose); ch.cur = expr || {}; ch.setExpr(ch.cur); return ch;
}
function talk(ch, name, T) {
  const [a, b] = E[name]; if (T < a || T > b) return;
  const env = ENV[name]; const i = Math.floor((T - a) * 30);
  const o = env[Math.min(i, env.length - 1)] || 0;
  ch.setExpr(Object.assign({}, ch.cur, { open: o > 0.12 ? 0.25 + o * 0.75 : 0, mouth: ch.cur.mouth === 'shout' ? 'smile' : (ch.cur.mouth || 'smile') }));
}
function ballAt(b, p) { b.visible = true; b.position.copy(p); }
function dribble(b, ch, t, rate = 1, side = -1) {
  const p = t * 9 * rate; const y = 0.55 + 2.0 * Math.abs(Cc(p / 2));
  ch.root.updateMatrixWorld(true);
  const v = new THREE.Vector3(side * 1.5 / ch.root.scale.x, y / ch.root.scale.y, 1.3 / ch.root.scale.z);
  ballAt(b, ch.root.localToWorld(v)); b.rotation.x = p;
}
function holdBall(b, ch, side = 'R', off = [0, -0.3, 0.4]) { const h = ch.handWorld(side); ballAt(b, h.add(V(...off))); }
function lights(o) { const c = setLighting(o); return c; }
function sunAt(loc, x = 0, z = 0, dir) { aimSun(L(loc, x, 0, z), dir); }
const flr = { court: 0.1, town: 0.35, road: 0.08, bakery: 0.12, garage: 0.2, party: 0.12, home: 0.2, square: 0.2, stage: 2.15 };
const shake = (t, a = 0.08) => [S(t * 47) * a, S(t * 61 + 1) * a, 0];
function stars(ch, t) { W.stars.visible = true; const h = ch.headWorld(); W.stars.children.forEach((s, i) => { const a = t * 6 + i * 1.256; s.position.set(h.x + Math.cos(a) * 1.0, h.y + 0.9, h.z + Math.sin(a) * 1.0); s.rotation.y = t * 5; }); }
function crowdBleachers(T, mood = 'cheer') { // fill bleachers on court
  crowd.forEach((c, i) => { const row = i % 4, col = Math.floor(i / 4); const x = -18 + col * 9 + (row % 2) * 4, z = -21 - row * 2.2, seat = 1.05 + row * 1.2;
    if (mood === 'cheer') put(c, 'court', x, seat, z, 0, P.armsUp(T + i * 0.37), { mouth: 'grin' });
    else put(c, 'court', x, seat, z + 0.2, 0, P.sitChair(T + i, 0), mood === 'stare' ? { mouth: 'o', eyeScale: 1.3 } : { mouth: 'smile' });
  });
}
function partyLights(T, on = true) {
  W.partyLights.forEach((l, i) => { l.intensity = on ? 260 : 0; const a = T * 1.7 + i * PI / 2; l.position.set(LOC.party.x + Math.cos(a) * 11, 9, LOC.party.z + Math.sin(a) * 8); });
  W.disco.rotation.y = T * 2; W.rec1.rotation.y = T * 8; W['rec-1'].rotation.y = T * 8;
  for (const s of [-1, 1]) W['spk' + s].forEach(c => c.scale.setScalar(1 + Math.abs(S(T * 8 * PI / 2)) * 0.15));
  W.partyConfetti.update(T); W.partyConfetti.visible = true;
}
const dayLight = () => lights({});
function interior(o = {}) { return lights(Object.assign({ sky: 0x2a2a35, sun: 2.0, hemi: 0.9, hemiSky: 0xfff1e0, hemiGround: 0x8a7a6a }, o)); }
const nightLight = () => lights({ sky: 0x0b1233, sun: 1.1, sunColor: 0x9fb4ff, hemi: 0.55, hemiSky: 0x5a6ab0, hemiGround: 0x1a1a30, exposure: 1.1, dir: [-10, 25, 30] });

function resetAll() {
  for (const c of allChars) { c.reset(); c.root.visible = false; c.cur = {}; c.setExpr({}); if (c.headband) c.headband.visible = false; c.head.visible = true; }
  for (const p of props) { p.visible = false; p.rotation.set(0, 0, 0); p.scale.setScalar(1); }
  W.squareConfetti.visible = false; W.courtConfetti.visible = false; W.partyConfetti.visible = false;
  W.partyLights.forEach(l => l.intensity = 0); W.bulb.intensity = 0; W.bakeryLight.intensity = 0; W.lampLight.intensity = 0; W.homeLight.intensity = 0;
  W.tourney.visible = false; W.finalsBanner.visible = false; W.banner.visible = true;
  W.targetHouse.userData.wins[1].visible = true;
  W.suv.userData.door.rotation.y = 0;
  camera.up.set(0, 1, 0);
}
function tourney(finals = false) { W.tourney.visible = true; W.finalsBanner.visible = finals; W.banner.visible = !finals; }

// ---------- SHOTS ----------
// each: [startTime (abs or fn), fn(t, T, d, ov)] ; shot ends at next start
const SH = [];
const shot = (a, f) => SH.push({ a, f });

export function debugCam(p, l, fov) { camera.position.set(...p); camera.lookAt(...l); camera.fov = fov; camera.updateProjectionMatrix(); }
export function renderShot(T, ov) {
  resetAll();
  if (!SH.length) buildShots();
  let i = SH.length - 1; while (i > 0 && T < SH[i].a) i--;
  const s = SH[i], b = i + 1 < SH.length ? SH[i + 1].a : 90;
  s.f(T - s.a, T, b - s.a, ov);
}

function buildShots() {
  const e0 = (n) => E[n][0], e1 = (n) => E[n][1];
  const R = 28; // hoop x on court
  // ================= SCENE 1 =================
  shot(0, (t, T, d, ov) => { // aerial town
    dayLight(); sunAt('town', 0, 0);
    const u = ease.io(t / d);
    cam('town', mix([-38, 34, 46], [-14, 16, 26], u), mix([0, 0, -4], [0, 2, 0], u), 42);
    teens.slice(0, 4).forEach((k, i) => { const x = -18 + i * 9 + t * (i % 2 ? 2.5 : -2.5); put(k, 'town', x, flr.town, i % 2 ? 6.5 : -6.5, i % 2 ? PI / 2 : -PI / 2, P.dribbleWalk(t + i, 1.2), { mouth: 'grin' }); dribble(balls[i], k, t + i, 1.2); });
    put(C.mailman, 'town', 4, flr.town, -6.5, PI / 2, P.dribbleWalk(t, 1), {}); dribble(balls[4], C.mailman, t, 1);
    ov.stamp('<span style="color:#ffe14d">HOOPSVILLE</span><br><span style="font-size:44px">POP. 312 · ALL BALLERS</span>');
  });
  shot(() => e1('n1') + 0.05, (t, T, d, ov) => { // grandma ankle-breaker
    dayLight(); sunAt('court', 5, 0);
    const gx = 2 + t * 4.2, cross = seg(t, 0.55, 0.9);
    const gp = t < 0.55 ? P.dribble(t, 1.4) : lerpPose(P.dribble(t, 1.4), { body: [0.3, 0, (cross < 0.5 ? cross : 1 - cross) * 0.6] }, 0.6);
    put(C.grandma, 'court', gx, flr.court, -0.5 + S(cross * PI) * 1.4, PI / 2, gp, { mouth: 'smirk', brow: 0.6 });
    dribble(balls[0], C.grandma, t, 1.4, t > 0.72 ? 1 : -1);
    const fall = ease.out(seg(t, 0.8, 1.3));
    const tp = fall > 0 ? P.fallBack(fall) : P.defend(t);
    put(teens[0], 'court', 9.5, flr.court, 0.2, -PI / 2 + fall * 2.5, tp, fall > 0 ? { mouth: 'o', eyeScale: 1.35 } : { brow: 0.7, mouth: 'flat' });
    if (fall > 0) stars(teens[0], t);
    put(teens[1], 'court', 14, flr.court, 4, -PI / 2 - 0.4, P.idle(t), { mouth: 'o', eyeScale: 1.3 });
    const sh = shake(t, fall > 0 && fall < 0.6 ? 0.12 : 0);
    cam('court', [gx + 5 + sh[0], 3.4 + sh[1], 14], [gx + 3, 2.6, 0], 42);
  });
  shot(4.3, (t, T, d, ov) => { // grandma dunk
    dayLight(); sunAt('court', 20, 0);
    const run = seg(t, 0, 0.45), jump = seg(t, 0.45, 0.85);
    let x = 17 + run * 6 + jump * 3.6, y = flr.court + 4 * 5.2 * jump * (1 - jump) * (jump < 0.5 ? 1 : 0) + (jump >= 0.5 ? 5.2 - (jump - 0.5) * 2 * 2.6 : 0);
    if (jump >= 1) { x = 26.8; y = 2.5; }
    const pose = jump <= 0 ? P.run(t, 1.3) : jump < 1 ? P.dunk(jump) : P.hang(t);
    put(C.grandma, 'court', x, y, 0, PI / 2, pose, { mouth: 'grin', brow: 0.8 });
    if (jump < 0.75) { if (jump <= 0) dribble(balls[0], C.grandma, t, 1.6); else holdBall(balls[0], C.grandma, 'R', [0.3, 0.2, 0]); }
    else { const fu = seg(t, 0.62, 1.3); ballAt(balls[0], L('court', R, 8.3 - fu * 7.8, 0)); }
    put(teens[2], 'court', 21, flr.court, -4, face(21, -4, 14, 14), P.idle(t), { mouth: 'o', eyeScale: 1.3 });
    put(teens[3], 'court', 24, flr.court, -5.5, face(24, -5.5, 14, 14), P.idle(t + 1), { mouth: 'o', eyeScale: 1.3 });
    const flash = seg(t, 0.85, 0.9) - seg(t, 0.9, 1.05); ov.flash(flash * 0.6);
    W.hoopA.rotation.z = jump >= 0.95 ? S(t * 30) * 0.02 * (1 - seg(t, 1, 1.3)) : 0;
    cam('court', [14, 1.5, 14], [24, 6, 0], 46);
  });
  shot(() => 5.6, (t, T, d, ov) => { // hanging + teens shocked + zoom
    dayLight(); sunAt('court', 25, 0);
    put(C.grandma, 'court', 26.8, 2.5, 0, -PI / 2, P.hang(t + 1), { mouth: 'grin', brow: 0.8 });
    put(teens[2], 'court', 21.5, flr.court, -3, face(21.5, -3, 26.8, 0), lerpPose(P.idle(t), { armL: [0, 0, 0.3], armR: [-2.2, 0, -0.3], neck: [-0.4, 0, 0] }, 1), { mouth: 'o', eyeScale: 1.4, look: [0, -1] });
    put(teens[3], 'court', 23.8, flr.court, -3.8, face(23.8, -3.8, 26.8, 0), lerpPose(P.idle(t), { neck: [-0.45, 0, 0] }, 1), { mouth: 'o', eyeScale: 1.4, look: [0, -1] });
    ballAt(balls[0], L('court', 26, 0.55 + Math.abs(S(t * 6)) * 1.2 * (1 - t / d), 1.5));
    const z = t > 0.45 ? 1 : 0;
    if (!z) cam('court', [20.5, 2.4, 6], [25.5, 5.5, 0], 50);
    else cam('court', [22.6 + t * 0.3, 7.0, 1.2], [26.8, 7.0, 0], 34);
  });
  // ================= SCENE 2 =================
  shot(() => E.s1end[1], (t, T, d, ov) => { // mailman wind-up
    dayLight(); sunAt('town', 0, -6);
    const walk = seg(t, 0, 0.9), w = ease.out(walk);
    const x = -9 + w * 6.5;
    const pose = walk < 1 ? P.walk(t, 1.1) : lerpPose(P.idle(t), P.shootSet(), ease.io(seg(t, 1.0, 1.5)));
    put(C.mailman, 'town', x, flr.town, -6.5, walk < 1 ? PI / 2 : PI - 0.25, pose, { mouth: 'smirk', brow: 0.5 });
    W.pkg.visible = true;
    if (walk < 1) { const h = C.mailman.handWorld('L'); W.pkg.position.copy(h).add(V(0, 0.2, 0.4)); }
    else { const h = C.mailman.handWorld('R').lerp(C.mailman.handWorld('L'), 0.5); W.pkg.position.copy(h).add(V(0, 0.5, 0)); }
    put(teens[4], 'town', 8, flr.town, 6.5, -PI / 2, P.dribbleWalk(t, 1), {}); dribble(balls[1], teens[4], t);
    cam('town', [x + 3.5, 3.9, -12.2], [x, 3.5, -6.5], 44);
  });
  shot(8.6, (t, T, d, ov) => { // package flies through window
    dayLight(); sunAt('town', 0, -10);
    const tHit = e0('crash') - 8.6, u = clamp01(t / tHit);
    put(C.mailman, 'town', -2.5, flr.town, -6.5, PI - 0.25, t < 0.15 ? P.shootSet() : P.shootRelease(), { mouth: 'grin' });
    const win = W.targetHouse.userData.wins[1];
    const p0 = L('town', -2.4, 6.8, -7), p1 = L('town', 3.5, 4, -13);
    if (u < 1) { W.pkg.visible = true; W.pkg.position.copy(arc(p0, p1, 2.2, u)); W.pkg.rotation.set(u * 9, u * 4, 0); }
    else { win.visible = false; W.shards.visible = true; const st = t - tHit; W.shards.children.forEach((s, i) => { const v = s.userData.v; s.position.set(3.5 + v.x * st * 0.5, Math.max(0.4, 4 + v.y * st - 9 * st * st), -13 + 0.6 + v.z * st * 0.6); s.rotation.set(st * v.x + s.userData.r, st * 5, 0); }); }
    const sh = u >= 1 ? shake(t, 0.18 * (1 - seg(t, tHit, tHit + 0.4))) : [0, 0, 0];
    cam('town', [9 + sh[0], 4.5 + sh[1], -5], [3.5, 4.2, -12.5], 50);
  });
  shot(9.6, (t, T, d, ov) => { // baker shoots loaf (behind)
    interior(); sunAt('bakery', 0, 0); W.bakeryLight.intensity = 80;
    const rel = 0.5;
    put(C.baker, 'bakery', 11, flr.bakery, 2, -PI / 2, t < rel ? lerpPose(P.idle(t), P.shootSet(), ease.io(seg(t, 0, 0.35))) : P.shootRelease(), { mouth: 'smirk', brow: 0.7 });
    put(cust, 'bakery', -12, flr.bakery, 2.5, PI / 2, P.walk(t, 0.8), { mouth: 'smile' }); cust.root.position.x = LOC.bakery.x - 14 + t * 1.6;
    W.loaf.visible = true;
    if (t < rel) { const h = C.baker.handWorld('R'); W.loaf.position.copy(h).add(V(0, 0.4, 0)); }
    else { const u = seg(T, 9.6 + rel, e0('bonk')); W.loaf.position.copy(arc(L('bakery', 10.5, 6.6, 2), L('bakery', -12.4, 4.7, 2.5), 3.2, u)); W.loaf.rotation.set(0, 0, u * 12); }
    cam('bakery', [6.5, 4.6, 11], [11, 4.8, 2], 40);
  });
  shot(10.55, (t, T, d, ov) => { // bonk
    interior(); sunAt('bakery', -8, 0); W.bakeryLight.intensity = 80;
    const tb = e0('bonk') - 10.55; const hit = t >= tb;
    const fall = ease.out(seg(t, tb, tb + 0.35));
    put(cust, 'bakery', -12.4 + T * 0 - 1.6 * 0 + (10.55 - 9.6) * 0, flr.bakery, 2.5, PI / 2, hit ? P.fallBack(fall * 0.55) : P.walk(t + 1, 0.8), hit ? { eyeOpen: 0.05, mouth: 'wavy' } : { mouth: 'smile' });
    cust.root.position.x = LOC.bakery.x - 14 + Math.min(T - 9.6, e0('bonk') - 9.6) * 1.6;
    if (hit) stars(cust, t);
    W.loaf.visible = true;
    if (!hit) { const u = seg(T, 10.1, e0('bonk')); W.loaf.position.copy(arc(L('bakery', 10.5, 6.6, 2), L('bakery', -12.4, 4.7, 2.5), 3.2, u)); W.loaf.rotation.set(0, 0, u * 12); }
    else { const st = t - tb; W.loaf.position.copy(L('bakery', -11.8 + st * 2, Math.max(0.5, 4.8 + 4 * st - 14 * st * st), 2.5)); W.loaf.rotation.z = st * 10; }
    put(C.baker, 'bakery', 11, flr.bakery, 2, -PI / 2, hit ? P.armsUp(t) : P.shootRelease(), { mouth: hit ? 'o' : 'smirk', eyeScale: hit ? 1.3 : 1 });
    if (hit && t > tb + 0.25) { const h = cust.headWorld(); cam('bakery', [-8.0, 5.0, 5.5], [h.x - LOC.bakery.x, h.y, h.z], 34); }
    else cam('bakery', [-8, 4.2, 12], [-12, 3.6, 2.5], 40);
  });
  // ================= SCENE 3 =================
  shot(() => E.bonk[1], (t, T, d, ov) => { // mayor on stage
    dayLight(); sunAt('square', 0, -6);
    put(C.mayor, 'square', 0, flr.stage, -10, 0, P.talkGesture(t * 1.2), { mouth: 'grin', brow: -0.2 });
    C.mayor.pose({ armR: [-2.6 + S(t * 6) * 0.2, 0, -0.3] });
    crowd.slice(0, 6).forEach((c, i) => put(c, 'square', -9 + i * 3.5, flr.square, 4.5, PI, P.idle(t + i * 0.3), {}));
    const u = ease.io(t / d);
    cam('square', mix([0, 9, 16], [0, 7, 2], u), [0, 6.2, -10], 40);
  });
  shot(13.5, (t, T, d, ov) => { // crowd celebrates
    dayLight(); sunAt('square', 0, 2);
    W.squareConfetti.visible = true; W.squareConfetti.update(t + 1);
    [C.alex, C.ben, C.baker, C.mailman, C.grandma].forEach((c, i) => put(c, 'square', -6 + i * 3, flr.square, 0.5 + (i % 2) * 1.5, 0.15 * (i - 2), i === 1 ? P.dance(t, 0) : P.armsUp(t + i * 0.21), { mouth: 'grin', eyeScale: 1.1 }));
    crowd.slice(0, 7).forEach((c, i) => put(c, 'square', -10 + i * 3.4, flr.square, -3.2, 0, P.armsUp(t + i * 0.33), { mouth: 'grin' }));
    put(C.mayor, 'square', 0, flr.stage, -10, PI, P.armsUp(t), { mouth: 'grin' });
    cam('square', mix([13, 4.5, 15], [10, 4.2, 15], t / d), [0, 3.2, 0], 40);
  });
  shot(15.1, (t, T, d, ov) => { // SUV arrives
    dayLight(); sunAt('square', 0, 14);
    const u = ease.out(seg(t, 0, d)); W.suv.visible = true; W.suv.position.copy(L('square', -55 + u * 55, 0.05, 14)); W.suv.rotation.y = 0;
    crowd.slice(0, 5).forEach((c, i) => put(c, 'square', -6 + i * 3, flr.square, 7.5, PI / 2 + 0.6, P.idle(t), { mouth: 'o', eyeScale: 1.25 }));
    put(C.alex, 'square', 7, flr.square, 8.5, -PI / 2 - 0.4, P.idle(t), { mouth: 'o', eyeScale: 1.3 });
    cam('square', [14, 1.2, 22], mix([-30, 2.6, 14], [-2, 2.6, 14], u), 40);
  });
  shot(() => e0('rudyTall'), (t, T, d, ov) => { // Rudy steps out, tilt up
    lights({ dir: [-8, 22, -25] }); sunAt('square', 0, 10, [-8, 22, -25]);
    W.suv.visible = true; W.suv.position.copy(L('square', 0, 0.05, 14)); W.suv.userData.door.rotation.y = 1.4;
    put(C.rudy, 'square', 0, flr.square, 9.2, PI, P.idle(t), { mouth: 'flat', brow: 0.2 });
    put(C.mayor, 'square', -4.2, flr.square, 7.2, PI / 2, lerpPose(P.idle(t), { neck: [-0.55, 0, 0], armR: [-1.6, 0.0, 0.4] }, 1), { mouth: 'grin', look: [0.4, -1] });
    put(C.alex, 'square', 4.2, flr.square, 7.8, -PI / 2, lerpPose(P.idle(t), { neck: [-0.6, 0, 0] }, 1), { mouth: 'o', eyeScale: 1.35, look: [-0.4, -1] });
    const u = ease.io(seg(t, 0.1, d - 0.15));
    cam('square', [0.4, 0.8 + u * 0.6, 1.0], mix([0, 0.8, 9.2], [0, 9.0, 9.2], u), 58);
  });
  // ================= SCENE 4 =================
  shot(() => E.s3 ? 0 : E.rudyTall[1], (t, T, d, ov) => { // Alex dramatic
    dayLight(); sunAt('town', -30, -8);
    put(C.alex, 'town', -30, flr.town, -7, 0.15, lerpPose(P.idle(t), t < 0.6 ? { armL: [-2.6, 0, -0.6], armR: [-2.6, 0, 0.6] } : {}, t < 0.6 ? 1 - seg(t, 0.35, 0.6) : 0), { brow: 1, mouth: 'flat' });
    C.alex.headband.visible = t > 0.4;
    const u = ease.in(seg(t, 0, d));
    cam('town', mix([-28.6, 2.0, 2], [-29.6, 4.0, -3.6], u), [-30, 4.0 + (1 - u) * 0.5, -7], 40);
  });
  shot(() => e0('n4b'), (t, T, d, ov) => { // Ben invites
    dayLight(); sunAt('town', -30, -8);
    put(C.alex, 'town', -31.5, flr.town, -7, 0.9, P.idle(t), { brow: 1, mouth: 'flat' }); C.alex.headband.visible = true;
    const bx = -22 - ease.out(seg(t, 0, 0.8)) * 6.5;
    put(C.ben, 'town', bx, flr.town, -6.5, -PI / 2 + 0.4, t < 0.8 ? P.dance(t, 0) : lerpPose(P.dance(t, 0), { armR: [-1.5, 0.3, 0] }, 1), { mouth: 'grin', blush: true });
    W.flyer.visible = true; const h = C.ben.handWorld('R'); W.flyer.position.copy(h).add(V(-0.2, 0.6, 0.3)); W.flyer.rotation.y = 0.5;
    cam('town', [-27.5, 4.2, 8.5], [-30, 3.6, -6.8], 42);
  });
  shot(21.1, (t, T, d, ov) => { // Alex refuses, Ben shrugs and dances away
    dayLight(); sunAt('town', -30, -8);
    put(C.alex, 'town', -31.5, flr.town, -7, 0.9 + ease.io(seg(t, 0.6, 1.1)) * 2.1, lerpPose(P.idle(t), { neck: [0, S(t * 9) * 0.45 * (1 - seg(t, 0.4, 0.6)), 0], armL: [-0.3, 0, 0.1] }, 1), { brow: 1, mouth: 'frown', eyeOpen: 0.75 });
    C.alex.headband.visible = true;
    const away = seg(t, 0.7, d);
    put(C.ben, 'town', -28.5 + away * 7, flr.town, -6.5, away > 0 ? PI / 2 : -PI / 2 + 0.4, away > 0 ? P.dance(t, 2) : lerpPose(P.idle(t), { armL: [0, 0, 1.0], armR: [0, 0, -1.0] }, 1), { mouth: away > 0 ? 'grin' : 'flat' });
    cam('town', [-33, 4.4, 4], [-30, 3.6, -6.8], 40);
  });
  const pushU = (T) => { // depth from huss timings
    let u = 0.15; for (const n of ['h1', 'h2', 'h3']) { const a = e0(n); const k = (T - a + 0.12) / 0.45; if (k > 0 && k < 1) u = Math.max(u, S(k * PI)); }
    return u;
  };
  shot(() => e0('garage'), (t, T, d, ov) => { // push-ups HUSS
    interior({ sun: 1.3, hemi: 0.95, hemiSky: 0xfff0dd }); sunAt('garage', 0, 0); W.bulb.intensity = 160;
    put(C.alex, 'garage', -2, flr.garage, 3.8, PI, P.pushup(T, pushU(T)), { brow: 1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    C.alex.root.rotation.y = PI;
    for (const n of ['h1', 'h2', 'h3']) talk(C.alex, n, T);
    let k = 0; for (const n of ['h1', 'h2', 'h3']) if (T >= e0(n)) k++;
    const z = [0, 0.18, 0.36, 0.54][k];
    cam('garage', mix([10, 2.6, 3.0], [3.5, 2.2, 0.2], z / 0.54), mix([-2, 1.4, 2.2], [-2, 1.6, -0.6], z / 0.54), 42 - k * 3);
  });
  shot(() => E.h3[1] + 0.12, (t, T, d, ov) => { // d4 to camera
    interior({ sun: 1.3, hemi: 0.95, hemiSky: 0xfff0dd }); sunAt('garage', 0, 0); W.bulb.intensity = 160;
    const btw = T >= e0('btw4') - 0.05;
    put(C.alex, 'garage', 0, flr.garage, 1, btw ? 0.12 : 0, btw ? lerpPose(P.idle(t), { neck: [0, 0, 0.15] }, 1) : P.talkGesture(t), btw ? { brow: -0.3, browUp: 0.8, mouth: 'flat', lid: 0.25, sweat: true } : { brow: 0.9, mouth: 'smile', sweat: true });
    C.alex.headband.visible = true;
    talk(C.alex, 'd4', T); talk(C.alex, 'btw4', T);
    if (!btw) cam('garage', mix([1.5, 4.4, 9.5], [0.8, 4.4, 8], t / 2), [0, 4.1, 1], 36);
    else cam('garage', [0.2, 4.6, 5.2], [0, 4.6, 1], 32);
  });
  // ================= SCENE 5 =================
  const partyCrowd = (t, n = 10) => crowd.slice(0, n).forEach((c, i) => { const a = i / n * PI * 2; put(c, 'party', Math.cos(a) * 9, flr.party, Math.sin(a) * 5 + 1, -a - PI / 2, P.dance(t + i * 0.3, i % 4), { mouth: 'grin' }); });
  shot(() => E.s4end[1], (t, T, d, ov) => { // party wide
    interior({ sun: 0.25, hemi: 0.45, hemiSky: 0xb36bff, hemiGround: 0x301040 }); sunAt('party', 0, 0); partyLights(T);
    partyCrowd(t, 12);
    put(C.mayor, 'party', 0, flr.party, -12, 0, lerpPose(P.dance(t, 1), { armL: [-1.2, 0, 0.3 + S(t * 12) * 0.2], armR: [-1.2, 0, -0.3] }, 0.7), { mouth: 'grin', brow: -0.2 });
    put(C.ben, 'party', -2, flr.party, 2, 0.2, P.dance(t, 0), { mouth: 'grin', blush: true });
    put(C.grandma, 'party', 2.5, flr.party, 1, -0.3, P.dance(t, 3), { mouth: 'grin' });
    put(C.mailman, 'party', -5, flr.party, -2, 0.3, P.dance(t + 0.5, 1), { mouth: 'grin' });
    put(C.baker, 'party', 5.5, flr.party, -2.5, -0.4, P.dance(t + 0.2, 2), { mouth: 'grin' });
    cam('party', mix([-12, 9, 22], [-4, 7, 17], ease.io(t / d)), [0, 3.5, -3], 46);
  });
  shot(29.9, (t, T, d, ov) => { // grandma headspin
    interior({ sun: 0.25, hemi: 0.45, hemiSky: 0xb36bff, hemiGround: 0x301040 }); sunAt('party', 0, 0); partyLights(T);
    put(C.grandma, 'party', 0, flr.party, 0, 0, P.headspin(t), { mouth: 'grin', brow: 0.4 });
    C.grandma.body.position.y = 3.65; C.grandma.body.rotation.set(PI, t * 14, 0);
    [C.ben, C.mailman, C.baker, ...crowd.slice(0, 5)].forEach((c, i) => { const a = i / 8 * PI * 2; put(c, 'party', Math.cos(a) * 5.5, flr.party, Math.sin(a) * 5.5, -a - PI / 2, i % 2 ? P.armsUp(t + i) : P.dance(t + i, 1), { mouth: 'o', eyeScale: 1.25 }); });
    cam('party', [S(t * 0.6) * 6, 6.0, 11.5], [0, 2.2, 0], 44);
  });
  shot(31.2, (t, T, d, ov) => { // mailman & baker sprinkler, Ben close
    interior({ sun: 0.25, hemi: 0.45, hemiSky: 0xb36bff, hemiGround: 0x301040 }); sunAt('party', 0, 0); partyLights(T);
    put(C.ben, 'party', 0, flr.party, 4, 0, P.dance(t * 1.2, 1), { mouth: 'grin', blush: true });
    put(C.mailman, 'party', -3.4, flr.party, 0, 0.3, P.dance(t, 3), { mouth: 'grin' });
    put(C.baker, 'party', 3.4, flr.party, 0, -0.3, P.dance(t + 0.4, 3), { mouth: 'grin' });
    put(C.mayor, 'party', 0, flr.party, -12, 0, lerpPose(P.dance(t, 1), { armR: [-1.2, 0, -0.3] }, 0.7), { mouth: 'grin' });
    partyCrowd(t, 6); crowd.slice(0, 6).forEach(c => { c.root.position.z -= 8; });
    cam('party', [0, 4.5, 17], [0, 3.6, 2], 40);
  });
  shot(() => e0('dumb'), (t, T, d, ov) => { // tiny dumbbell HUSS
    interior({ sun: 1.3, hemi: 0.95, hemiSky: 0xfff0dd }); sunAt('garage', 0, 0); W.bulb.intensity = 150;
    const k = ['h4', 'h5', 'h6'].filter(n => T >= e0(n)).length;
    let lift = 0; for (const n of ['h4', 'h5', 'h6']) { const a = e0(n), kk = (T - a + 0.05) / 0.5; if (kk > 0 && kk < 1) lift = Math.max(lift, S(kk * PI)); }
    const p = P.liftTiny(T); p.armR = [-0.2 - lift * 1.0 + S(T * 45) * 0.06, 0, -0.15];
    put(C.alex, 'garage', 0, flr.garage, 1, 0, p, { brow: 1, mouth: 'grit', sweat: true, eyeOpen: 0.7 }); C.alex.headband.visible = true;
    for (const n of ['h4', 'h5', 'h6']) talk(C.alex, n, T);
    W.tinyDB.visible = true; W.tinyDB.position.copy(C.alex.handWorld('R')).add(V(0, 0.05, 0.05)); W.tinyDB.scale.setScalar(2.6);
    cam('garage', [1.2 - k * 0.3, 3.8, 12.5 - k * 2.0], [-1.1, 3.0 + k * 0.2, 1], 36);
  });
  shot(() => e0('awk5'), (t, T, d, ov) => { // awkward silence closeup
    interior({ sun: 1.3, hemi: 0.95, hemiSky: 0xfff0dd }); sunAt('garage', 0, 0); W.bulb.intensity = 150;
    const p = P.liftTiny(0); p.armR = [-1.1, 0, -0.15];
    put(C.alex, 'garage', 0, flr.garage, 1, 0, p, { mouth: 'flat', sweat: true, eyeOpen: 1, look: [-1, 0.5], brow: -0.4 }); C.alex.headband.visible = true;
    W.tinyDB.visible = true; W.tinyDB.scale.setScalar(2.6); W.tinyDB.position.copy(C.alex.handWorld('R')).add(V(0, 0.05, 0.05));
    cam('garage', [-0.9, 3.7, 6.5], [-0.9, 3.4, 1], 36);
  });
  // ================= SCENE 6 =================
  shot(() => E.awk5[1], (t, T, d, ov) => { // furious driveway dribbling
    dayLight(); sunAt('town', -26, -12);
    put(C.alex, 'town', -26, 0.08, -11, 0.4 + S(t * 3) * 0.6, P.dribble(t, 1.8), { brow: 1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    dribble(balls[0], C.alex, t, 1.8);
    const a = t * 1.1;
    cam('town', [-26 + S(a) * 10, 3.6, -11 + Cc(a) * 10], [-26, 3.2, -11], 42);
  });
  shot(37.2, (t, T, d, ov) => { // brushing teeth
    interior({ sun: 1.2, hemi: 1.0 }); sunAt('home', 0, 0); W.homeLight.intensity = 60; W.homeLight.position.copy(L('home', 0, 9, 3));
    put(C.alex, 'home', 0, flr.home, -3.0, 0, P.brush(t), { mouth: 'grin', brow: 0.6 }); C.alex.headband.visible = true;
    C.alex.pose({ armR: [-0.55 - Cc(t * 9 * 1.6) * 0.35, 0, -0.15] });
    dribble(balls[0], C.alex, t, 1.6);
    W.brush.visible = true; W.brush.position.copy(C.alex.handWorld('L')).add(V(0, 0.4, 0)); W.brush.rotation.z = PI / 2;
    cam('home', [-4.2, 4.4, 3.5], [0, 3.6, -3], 42);
  });
  shot(38.35, (t, T, d, ov) => { // breakfast
    interior({ sun: 1.4, hemi: 1.0 }); sunAt('home', 30, 0); W.homeLight.intensity = 60; W.homeLight.position.copy(L('home', 30, 9, 3));
    const p = P.sitChair(t, 2.4 - 0.5); p.armL = [-1.4 - Math.abs(S(t * 9)) * 0.5, 0, 0.2]; p.armR = [-0.55 - Cc(t * 15) * 0.35, 0, -0.35];
    put(C.alex, 'home', 30, flr.home, -4.6, 0, p, { mouth: t % 0.3 < 0.15 ? 'flat' : 'smile', brow: 0.7 }); C.alex.headband.visible = true;
    ballAt(balls[0], L('home', 28.3, 0.55 + Math.abs(Cc(t * 15 / 2)) * 1.7, -3.4));
    cam('home', [31, 5.0, 8.5], [30, 3.4, -2.5], 42);
  });
  shot(39.2, (t, T, d, ov) => { // bathroom (toilet) dribbling between legs
    interior({ sun: 1.2, hemi: 1.0 }); sunAt('home', 60, 0); W.homeLight.intensity = 60; W.homeLight.position.copy(L('home', 60, 9, 3));
    const p = P.sitChair(t, 1.85); p.armR = [-0.8 - Cc(t * 16) * 0.3, 0, 0.25]; p.armL = [-0.6, 0, 0.2];
    put(C.alex, 'home', 60, flr.home, -4.2, 0, p, { mouth: 'flat', brow: 0.6, look: [0, 0] }); C.alex.headband.visible = true;
    ballAt(balls[0], L('home', 60, 0.55 + Math.abs(Cc(t * 8)) * 1.4, -2.2));
    cam('home', [60.5, 4.6, 6.5], [60, 3.0, -4], 40);
  });
  shot(() => e0('d6') - 0.15, (t, T, d, ov) => { // 3AM night court
    nightLight(); sunAt('court', 18, -14, [-10, 25, 30]); W.lampLight.intensity = 1500; W.nightStars.visible = true; W.moon.visible = true;
    const btw = T >= e0('btw6') - 0.05;
    put(C.alex, 'court', 17, flr.court, -14, 0.1, btw ? P.idle(t) : P.dribble(t, 1.2), btw ? { mouth: 'flat', browUp: 0.8, brow: -0.3, lid: 0.3, sweat: true } : { brow: 0.9, mouth: 'smile', sweat: true });
    C.alex.headband.visible = true;
    if (!btw) dribble(balls[0], C.alex, t, 1.2); else holdBall(balls[0], C.alex, 'R', [0.3, 0.3, 0.3]);
    talk(C.alex, 'd6', T); talk(C.alex, 'btw6', T);
    ov.stamp('🌙 3:00 AM');
    if (!btw) cam('court', mix([11, 3.8, 0], [14, 4.2, -2.5], t / 2.2), [17, 3.6, -14], 40);
    else cam('court', [17.4, 4.6, -9.0], [17, 4.6, -14], 36);
  });
  // ================= SCENE 7 =================
  shot(() => E.s6end[1], (t, T, d, ov) => { // tournament establishing
    dayLight(); sunAt('court', 0, -10); tourney(); crowdBleachers(t, 'cheer');
    put(C.rudy, 'court', 10, 0, -19.5, 0, P.sitChair(t, 1.5), { mouth: 'flat' }); C.rudy.body.position.y = 1.2;
    W.chair.visible = true;
    put(ref, 'court', 0, flr.court, 3, 0, P.idle(t), {});
    put(C.ben, 'court', -6, flr.court, -14, 0, P.dance(t, 0), { mouth: 'grin' });
    const u = ease.io(t / d);
    cam('court', mix([-20, 22, 34], [-8, 7, 24], u), [2, 3, -10], 44);
    ov.stamp('🏆 TOURNAMENT DAY');
  });
  shot(45.25, (t, T, d, ov) => { // mailman ankles broken
    dayLight(); sunAt('court', 5, 0); tourney(); crowdBleachers(t, 'cheer');
    const cross = seg(t, 0.35, 0.65);
    put(teens[1], 'court', 4 + t * 3, flr.court, -1 + S(cross * PI) * 1.6, PI / 2, P.dribble(t, 1.5), { mouth: 'smirk', brow: 0.6 });
    dribble(balls[0], teens[1], t, 1.5, t > 0.5 ? 1 : -1);
    const f = ease.out(seg(t, 0.6, 1.1));
    const mp = f > 0 ? lerpPose(P.defend(t), { body: [-0.4, 0, 1.2], bodyY: 0.9, legL: [-1.2, 0, 0.8], legR: [0.6, 0, -0.8], neck: [0, 0, 0.4] }, f) : P.defend(t);
    put(C.mailman, 'court', 9, flr.court, 0, -PI / 2 + f * 5.0, mp, f > 0 ? { mouth: 'o', eyeScale: 1.4 } : { mouth: 'flat', brow: 0.8 });
    if (f > 0.5) stars(C.mailman, t);
    const sh = shake(t, f > 0 && f < 0.7 ? 0.1 : 0);
    cam('court', [8 + sh[0], 3.2 + sh[1], 15], [8, 2.4, 0], 40);
  });
  shot(46.85, (t, T, d, ov) => { // baker airball layup
    dayLight(); sunAt('court', 22, 0); tourney(); crowdBleachers(t, 'cheer');
    const run = seg(t, 0, 0.45), jmp = seg(t, 0.45, 0.85);
    const x = 17 + run * 5 + jmp * 2.5, y = flr.court + 4 * 2.2 * jmp * (1 - jmp);
    put(C.baker, 'court', x, y, 1.5, PI / 2, jmp > 0 ? P.shootRelease() : P.run(t, 1.2), { mouth: jmp > 0.5 ? 'o' : 'grit', brow: 0.7 });
    if (jmp < 0.4) { if (jmp <= 0) dribble(balls[0], C.baker, t, 1.4); else holdBall(balls[0], C.baker, 'R', [0, 0.4, 0]); }
    else { const u = seg(t, 0.62, d); ballAt(balls[0], arc(L('court', 23, 8, 1.5), L('court', 36, 0.6, 9), 6, u)); }
    cam('court', [33, 3, 8], [24, 5.5, 1], 48);
  });
  shot(48.05, (t, T, d, ov) => { // mayor fouls himself
    dayLight(); sunAt('court', 5, 0); tourney(); crowdBleachers(t, 'cheer');
    const trip = seg(t, 0.4, 0.75), fall = ease.out(seg(t, 0.55, 0.95));
    let p = P.dribbleWalk(t, 1.3);
    if (trip > 0) p = lerpPose(p, { armL: [-1.8, 0, -1.3], neck: [0.2, 0.6, 0], legL: [-0.8, 0, -0.5], legR: [0.9, 0, 0.5] }, trip);
    if (fall > 0) p = lerpPose(p, { body: [1.2, 0, 0], bodyY: 1.0, armL: [-2.6, 0, 0.6], armR: [-2.6, 0, -0.6], legL: [0.4, 0, 0], legR: [0.6, 0, 0] }, fall);
    put(C.mayor, 'court', 4 + Math.min(t, 0.75) * 3, flr.court, 0, PI / 2, p, fall > 0 ? { mouth: 'o', eyeScale: 1.4 } : { mouth: 'grin' });
    if (trip <= 0) dribble(balls[0], C.mayor, t, 1.3); else ballAt(balls[0], L('court', 8 + (t - 0.4) * 5, 0.55 + Math.abs(S(t * 9)) * (1.6 - t), 2));
    const wh = t > 1.0;
    put(ref, 'court', 12, flr.court, 3, -PI / 2 - 0.4, wh ? lerpPose(P.idle(t), { armR: [-1.6, 0.6, 0], armL: [-3.0, 0, 0.2] }, 1) : P.idle(t), wh ? { mouth: 'o', brow: 0.9 } : {});
    if (wh) ov.badge('<div style="font:900 86px Inter;color:#fff;background:#e0201b;border:8px solid #000;padding:10px 30px;border-radius:20px;transform:rotate(-6deg)">FOUL?! 🤨</div>', 1 + Math.max(0, 0.3 - (t - 1.0)) * 1.5);
    cam('court', [5, 4, 16], [8.5, 2.4, 0], 42);
  });
  shot(() => e0('rudySad') - 0.15, (t, T, d, ov) => { // Rudy facepalm
    dayLight(); sunAt('court', 10, -19); tourney(); crowdBleachers(t, 'sit');
    W.chair.visible = true;
    put(C.rudy, 'court', 10, 0.1, -19.5, 0, t > 0.35 ? P.facepalm(t) : P.sitChair(t, 1.2), { mouth: 'frown', brow: -0.8, lid: 0.45 });
    C.rudy.body.position.y = 1.2;
    const u = ease.io(t / d);
    cam('court', mix([10, 7, -6], [10, 7.3, -10.5], u), [10, 6.6, -19.5], 40);
  });
  // ================= SCENE 8 =================
  shot(() => E.rudySad[1], (t, T, d, ov) => { // grandma crossovers, 99 OVR
    dayLight(); sunAt('court', 5, 0); tourney(); crowdBleachers(t, 'cheer');
    const side = S(t * 7);
    put(C.grandma, 'court', 2 + t * 3.6, flr.court, side * 0.9, PI / 2, lerpPose(P.dribble(t, 2), { body: [0.3, 0, side * 0.35] }, 1), { mouth: 'smirk', brow: 0.7 });
    dribble(balls[0], C.grandma, t, 2, side > 0 ? 1 : -1);
    [teens[4], teens[5]].forEach((k, i) => { const f = ease.out(seg(t, 0.5 + i * 0.35, 0.9 + i * 0.35)); put(k, 'court', 6 + i * 3.5, flr.court, i ? -2 : 2, -PI / 2 + f * (i ? 3 : -3), f > 0 ? P.fallBack(f) : P.defend(t), f > 0 ? { mouth: 'o', eyeScale: 1.4 } : { brow: 0.7, mouth: 'flat' }); });
    cam('court', [4 + t * 3.6, 3.2, 15], [7 + t * 3.6, 2.6, 0], 42);
    const pop = ease.back(seg(t, 0.15, 0.45));
    ov.badge('<div style="width:300px;background:linear-gradient(160deg,#ffe066,#c79100);border:8px solid #000;border-radius:24px;padding:16px;text-align:center;font-family:Inter"><div style="font:900 130px Inter;color:#1a1a1a;line-height:1">99</div><div style="font:900 44px Inter;color:#1a1a1a">OVR</div><div style="font:900 38px Inter;color:#fff;background:#7b3fb0;border-radius:10px;margin-top:8px">GRANDMA</div></div>', pop);
  });
  shot(52.3, (t, T, d, ov) => { // deep three
    dayLight(); sunAt('court', 10, 0); tourney(); crowdBleachers(t, 'cheer');
    const rel = 0.35;
    put(C.grandma, 'court', 0, flr.court + (t > rel && t < rel + 0.4 ? S((t - rel) / 0.4 * PI) * 0.8 : 0), 0, PI / 2, t < rel ? P.shootSet() : P.shootRelease(), { mouth: 'smirk', brow: 0.5 });
    if (t < rel) holdBall(balls[0], C.grandma, 'R', [0.2, 0.5, 0]);
    else { const u = seg(t, rel, d - 0.1); ballAt(balls[0], u < 1 ? arc(L('court', 0.8, 7.2, 0), L('court', R, 8.4, 0), 6, u) : L('court', R, 7.2, 0)); }
    const u = ease.io(seg(t, 0.3, d));
    cam('court', mix([-7, 4.5, 6], [8, 8, 9], u), [0, 0, 0], 44);
    const tgt = t < rel ? L('court', 1, 4.5, 0) : balls[0].position.clone().lerp(L('court', R, 8, 0), 0.25 * u);
    camera.lookAt(tgt);
    if (t > d - 0.25) ov.badge('<div style="font:900 96px Inter;color:#ffe14d;-webkit-text-stroke:12px #000;paint-order:stroke fill">SWISH!</div>');
  });
  shot(53.6, (t, T, d, ov) => { // dunk on mayor
    dayLight(); sunAt('court', 24, 0); tourney(); crowdBleachers(t, 'cheer');
    const run = seg(t, 0, 0.8), jmp = seg(t, 0.8, 2.3); // slow-mo jump
    const x = 14 + run * 7 + jmp * 5.8;
    const y = jmp >= 1 ? 2.5 : flr.court + 4 * 6.0 * jmp * (1 - jmp) * (jmp < 0.5 ? 1 : 0) + (jmp >= 0.5 ? 6.0 - (jmp - 0.5) * 2 * 3.5 : 0);
    put(C.grandma, 'court', jmp >= 1 ? 26.8 : x, y, 0, PI / 2, jmp <= 0 ? P.run(t, 1.3) : jmp < 1 ? P.dunk(jmp) : P.hang(t), { mouth: 'grin', brow: 0.9 });
    if (jmp < 0.8) { if (jmp <= 0) dribble(balls[0], C.grandma, t, 1.5); else holdBall(balls[0], C.grandma, 'R', [0.3, 0.3, 0]); }
    else ballAt(balls[0], L('court', R, 8.2 - seg(t, 2.05, 2.5) * 7.6, 0));
    const squash = ease.out(seg(t, 1.9, 2.4));
    put(C.mayor, 'court', 24.8, flr.court, 0, -PI / 2, squash > 0 ? P.fallBack(squash) : lerpPose(P.defend(t), { armL: [0, 0, 2.8], armR: [0, 0, -2.8] }, 1), squash > 0 ? { mouth: 'o', eyeScale: 1.5 } : { mouth: 'o', eyeScale: 1.2, look: [0, -1] });
    if (squash > 0.6) stars(C.mayor, t);
    const sh = shake(t, t > 2.0 && t < 2.4 ? 0.2 : 0);
    if (t < 1.9) cam('court', [16 + t * 0.8, 3, 17], [24, 6, 0], 44);
    else cam('court', [22 + sh[0], 3.4 + sh[1], 6.5], [25.8, 5.2, 0], 40);
  });
  shot(() => e0('g8') - 0.1, (t, T, d, ov) => { // "Too small!"
    dayLight(); sunAt('court', 22, 0); tourney(); crowdBleachers(t, 'cheer');
    put(C.grandma, 'court', 24, flr.court, 0, -PI / 2, lerpPose(P.idle(t), { armR: [-1.0, 0, 0.1], neck: [0.35, 0, 0] }, 1), { mouth: 'grin', brow: 0.9, look: [0, 1] });
    talk(C.grandma, 'g8', T);
    put(C.mayor, 'court', 21.0, flr.court, 0, PI / 2, P.sitFloor(t), { mouth: 'o', eyeScale: 1.4, look: [0, -1] });
    cam('court', [19.0, 3.8, 1.6], [24, 4.6, 0], 48);
  });
  shot(() => e0('mayorFloor'), (t, T, d, ov) => { // mayor questions life
    dayLight(); sunAt('court', 20, 0); tourney(); crowdBleachers(t, 'sit');
    put(C.mayor, 'court', 21, flr.court, 0, PI / 2 - 0.9, P.sitFloor(t), { mouth: 'flat', lid: 0.35, eyeOpen: 1, look: [0.6, 0.2], tear: true });
    const u = ease.io(t / d);
    cam('court', mix([23.5, 3.0, 5], [22.4, 2.6, 2.4], u), [21, 2.3, 0], 40);
  });
  // ================= SCENE 9 =================
  shot(() => E.s8 ? 0 : E.mayorFloor[1], (t, T, d, ov) => { // finals wide
    dayLight({}); lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 0, 0, [30, 14, 10]); tourney(true); crowdBleachers(t, 'cheer');
    put(C.alex, 'court', -2.5, flr.court, 0, PI / 2, P.idle(t), { brow: 1, mouth: 'flat' }); C.alex.headband.visible = true;
    put(C.grandma, 'court', 2.5, flr.court, 0, -PI / 2, P.idle(t), { mouth: 'smile' });
    put(C.rudy, 'court', 10, 0.1, -19.5, 0, P.sitChair(t, 1.2), { mouth: 'flat' }); C.rudy.body.position.y = 1.2; W.chair.visible = true;
    ballAt(balls[0], L('court', 0, 0.65, 0));
    const u = ease.io(t / d);
    cam('court', mix([12, 5, 22], [8, 3.6, 13], u), [0, 3.4, 0], 42);
    ov.stamp('🔥 THE FINALS 🔥');
  });
  shot(61.1, (t, T, d, ov) => { // tying shoes
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', -10, 18, [30, 14, 10]); tourney(true);
    put(C.alex, 'court', -12, flr.court, 19.8, 0.3, P.tieShoe(t), { brow: 1, mouth: 'flat', eyeOpen: 0.6 }); C.alex.headband.visible = true;
    const u = ease.io(t / d);
    cam('court', mix([-9.5, 1.2, 27.3], [-10, 2.4, 26.5], u), mix([-12, 1.0, 20.8], [-12, 2.6, 20.3], u), 38);
  });
  shot(() => e0('q1') - 0.25, (t, T, d, ov) => { // quiet huss ECU
    lights({ sky: 0x22140a, sunColor: 0xff9a4a, sun: 1.8, hemi: 0.55, exposure: 1.0, dir: [20, 14, 25] }); sunAt('court', -4, 0, [30, 14, 10]); tourney(true);
    put(C.alex, 'court', -4, flr.court, 0, 0, P.idle(t), { brow: 1.1, mouth: 'flat', eyeOpen: 0.7 }); C.alex.headband.visible = true;
    for (const n of ['q1', 'q2', 'q3']) talk(C.alex, n, T);
    const k = ['q1', 'q2', 'q3'].filter(n => T >= e0(n)).length;
    cam('court', [-4, 4.5, 7.0 - k * 1.0], [-4, 4.4, 0], 34);
    ov.vig(1); ov.tint('radial-gradient(ellipse at center,rgba(0,0,0,0) 30%,rgba(0,0,0,.5) 100%)');
  });
  shot(() => e0('cookie'), (t, T, d, ov) => { // grandma cookie
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 12, 19, [30, 14, 10]); tourney(true);
    const stand = ease.io(seg(t, 0.7, 1.1));
    const p = lerpPose(P.sitChair(t, 1.4), P.idle(t), stand); p.armR = [-1.9 + (t % 0.5 < 0.2 ? 0.2 : 0), 0, 0.25];
    put(C.grandma, 'court', 12, flr.court, 19.8, -0.4, p, { mouth: 'smile', eyeOpen: 0.15 });
    if (stand < 0.5) { C.grandma.body.position.y = 1.9 - (1 - stand) * 0.0; C.grandma.body.position.y = p.bodyY; }
    C.grandma.setExpr({ mouth: t % 0.36 < 0.18 ? 'flat' : 'smile', eyeOpen: 0.15, blush: true });
    W.cookie.visible = t < 0.85; W.cookie.position.copy(C.grandma.handWorld('R')).add(V(0, 0.3, 0.3)); W.cookie.rotation.x = PI / 2;
    add3bench();
    cam('court', [9.5, 3.8, 29.3], [12, 3.2, 19.8], 38);
  });
  function add3bench() { }
  // ================= SCENE 10 =================
  shot(() => E.cookie[1], (t, T, d, ov) => { // scoreboard -> Alex w/ ball
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 10, 0, [30, 14, 10]); tourney(true); crowdBleachers(t, 'sit');
    W.setScore(20, 20, '0:03');
    put(C.alex, 'court', 8, flr.court, 0, PI / 2, P.dribble(t, 0.9), { brow: 1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true; dribble(balls[0], C.alex, t, 0.9);
    put(C.grandma, 'court', 12.5, flr.court, 0, -PI / 2, P.defend(t), { mouth: 'smirk', brow: 0.6 });
    if (t < 0.95) cam('court', [-30, 11.5, -15], [-30, 12, -26.2], 32 - t * 3);
    else cam('court', mix([3, 3.8, 13], [5, 3.6, 10], seg(t, 0.95, d)), [10.5, 3.0, 0], 42);
  });
  shot(69.6, (t, T, d, ov) => { // slow-mo crossover past grandma
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 14, 0, [30, 14, 10]); tourney(true); crowdBleachers(0.3, 'cheer');
    const ts = t * 0.35; // slow motion
    const side = S(ts * 7 + 1);
    put(C.alex, 'court', 9 + t * 2.2, flr.court, side * 0.5 + 0.6 * seg(t, 0.6, 1.2), PI / 2, lerpPose(P.dribble(ts, 1.4), { body: [0.35, 0, side * 0.3] }, 1), { brow: 1, mouth: 'grit', sweat: true }); C.alex.headband.visible = true;
    dribble(balls[0], C.alex, ts, 1.4, side > 0 ? 1 : -1);
    const stumble = seg(t, 0.6, 1.4);
    put(C.grandma, 'court', 12.5, flr.court, -0.5 * stumble, -PI / 2 - stumble * 1.2, lerpPose(P.defend(ts), { body: [0.4, 0, -0.5] }, stumble), { mouth: 'o', eyeScale: 1.3 });
    cam('court', [9 + t * 2.2, 3.2, 14], [12 + t * 2.2, 2.8, 0], 42);
    ov.filter('saturate(1.25) contrast(1.05)');
  });
  shot(71.3, (t, T, d, ov) => { // Alex leaps slow-mo
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 22, 0, [30, 14, 10]); tourney(true); crowdBleachers(0.3, 'cheer');
    const u = t / d, jmp = seg(u, 0.25, 1);
    const x = 18 + u * 5.5, y = flr.court + S(jmp * PI * 0.55) * 3.6;
    put(C.alex, 'court', x, y, 0.3, PI / 2, jmp > 0 ? lerpPose(P.run(0.1), P.dunk(0.1), 1) : P.run(t * 0.4, 1), { brow: 0.6, mouth: jmp > 0.5 ? 'grin' : 'grit', eyeScale: 1.1 }); C.alex.headband.visible = true;
    if (jmp > 0) holdBall(balls[0], C.alex, 'R', [0.3, 0.4, 0]); else dribble(balls[0], C.alex, t * 0.4, 1);
    cam('court', mix([27, 1.0, 6], [26.5, 2.0, 5], u), [x, y + 3.5, 0.3], 44);
    ov.filter('saturate(1.3) brightness(1.05)');
  });
  shot(() => e0('block'), (t, T, d, ov) => { // grandma block toward Rudy
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 20, -6, [30, 14, 10]); tourney(true); crowdBleachers(t, 'stare');
    put(C.alex, 'court', 23.5, flr.court + 3.6 * (1 - seg(t, 0.2, 0.6)), 0.3, PI / 2, P.dunk(0.1), { mouth: 'o', eyeScale: 1.4 }); C.alex.headband.visible = true;
    const gj = seg(t, 0, 0.3);
    put(C.grandma, 'court', 21 + gj * 3, flr.court + S(Math.min(gj, 1) * PI * 0.5) * 8.5 - seg(t, 0.4, 0.7) * 6, -0.3, PI / 2, lerpPose(P.dunk(0.0), { armR: [-3.0, 0, 0.6] }, 1), { mouth: 'shout', brow: 1 });
    const hit = 0.28;
    if (t < hit) holdBall(balls[0], C.alex, 'R', [0.3, 0.4, 0]);
    else { const u = seg(t, hit, d + 0.15); ballAt(balls[0], arc(L('court', 24.5, 9.6, 0.3), L('court', 10.6, 8.0, -18.6), 2, u)); }
    ov.flash(seg(t, hit, hit + 0.04) - seg(t, hit + 0.04, hit + 0.2));
    put(C.rudy, 'court', 10, 0.1, -19.5, 0.6, lerpPose(P.sitChair(t, 1.2), { armR: [-2.6, 0, -0.5] }, seg(t, 0.4, 0.6)), { mouth: 'flat', brow: 0.2 }); C.rudy.body.position.y = 1.2; W.chair.visible = true;
    const sh = shake(t, t > hit && t < hit + 0.3 ? 0.25 : 0);
    cam('court', [17 + sh[0], 4 + sh[1], 13], [23, 8, 0], 50);
  });
  shot(() => e0('g10'), (t, T, d, ov) => { // "Not in my house!"
    lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] }); sunAt('court', 16, -8, [30, 14, 10]); tourney(true); crowdBleachers(t, 'stare');
    put(C.grandma, 'court', 20, flr.court, 2, 0.435, lerpPose(P.idle(t), { armR: [-1.6, 0, 0.0], armL: [0, 0, 0.6], neck: [0.05, 0, 0] }, 1), { mouth: 'grin', brow: 1 });
    C.grandma.armR.rotation.x = -1.6 + S(t * 14) * 0.15;
    talk(C.grandma, 'g10', T);
    put(C.alex, 'court', 24, flr.court, -3, -0.6, P.sitFloor(t), { mouth: 'o', eyeScale: 1.3 }); C.alex.headband.visible = true;
    put(C.rudy, 'court', 10, 0.1, -19.5, 0.6, lerpPose(P.sitChair(t, 1.2), { armR: [-2.9, 0, -0.4] }, 1), { mouth: 'flat', brow: 0.3 }); C.rudy.body.position.y = 1.2; W.chair.visible = true;
    const catchU = seg(t, 0, 0.18);
    if (catchU < 1) ballAt(balls[0], L('court', 10.6 + (1 - catchU) * 2, 8.0 + (1 - catchU) * 1, -18.6 + (1 - catchU) * 3));
    else holdBall(balls[0], C.rudy, 'R', [0, 0.6, 0]);
    cam('court', [23.2, 5.0, 9.6], [15.5, 5.6, -7], 42);
  });
  // ================= SCENE 11 =================
  shot(() => E.s10end[1], (t, T, d, ov) => { // Rudy announces
    dayLight(); sunAt('court', 0, 0); tourney(true); crowdBleachers(t, 'sit');
    put(C.rudy, 'court', 0, flr.court, 0, 0, lerpPose(P.idle(t), { armR: [-2.0, 0, 0.3] }, 1), { mouth: 'flat', brow: 0.2 });
    W.mic.visible = true; W.mic.position.copy(C.rudy.handWorld('R')).add(V(0, 0.4, 0.5)); W.mic.rotation.x = -0.6;
    put(C.alex, 'court', -4.2, flr.court, 1.5, 0.4, lerpPose(P.idle(t), { neck: [-0.5, 0, 0], armL: [-0.2, 0, 0.2] }, 1), { mouth: 'grin', eyeScale: 1.2, look: [0.5, -1] }); C.alex.headband.visible = true;
    put(C.grandma, 'court', 4.4, flr.court, 1.5, -0.4, lerpPose(P.idle(t), { neck: [-0.5, 0, 0] }, 1), { mouth: 'smirk', look: [-0.5, -1] });
    const u = ease.io(t / d);
    cam('court', mix([0, 1.5, 15], [0, 2.0, 12], u), [0, 7.0, 0], 54);
  });
  shot(78.6, (t, T, d, ov) => { // passes over Alex & Grandma
    dayLight(); sunAt('court', 0, 0); tourney(true); crowdBleachers(t, 'sit');
    const drop = seg(t, 0.6, 1.0);
    put(C.alex, 'court', -2, flr.court, 2, 0.3, lerpPose(P.idle(t), { neck: [-0.4, 0, 0] }, 1), drop > 0 ? { mouth: 'o', eyeScale: 1.5, look: [0.3, -0.5] } : { mouth: 'grin', eyeScale: 1.2, look: [0.3, -1] }); C.alex.headband.visible = true;
    put(C.grandma, 'court', 2, flr.court, 2, -0.3, lerpPose(P.idle(t), { neck: [-0.4, 0, 0] }, 1), drop > 0 ? { mouth: 'o', eyeScale: 1.4, look: [-0.3, -0.5] } : { mouth: 'smirk', look: [-0.3, -1] });
    put(C.rudy, 'court', 0, flr.court, -2.5, 0, lerpPose(P.idle(t), { neck: [0, S(t * 8) * 0.45 * drop, 0] }, 1), { mouth: 'flat' });
    cam('court', [0, 3.0, 13], [0, 6.2, 0], 48);
  });
  shot(79.9, (t, T, d, ov) => { // He chose Ben
    dayLight(); sunAt('court', -6, -14); tourney(true); crowdBleachers(t, 'stare');
    put(C.ben, 'court', -6, 0.1, -16, 0, P.idle(t), { mouth: 'o', eyeScale: 1.4, blush: true });
    put(C.rudy, 'court', -2, flr.court, -4, -2.8, P.point(t, 'R'), { mouth: 'smile' });
    const z = ease.out(seg(t, 0.15, 0.4));
    cam('court', mix([-6, 4.8, -2], [-6, 4.6, -10.5], z), [-6, 4.4, -16], 40);
    ov.flash(Math.max(0, 0.5 - t * 2));
  });
  shot(80.75, (t, T, d, ov) => { // flashback: Ben dancing at party
    interior({ sun: 0.3, hemi: 0.5, hemiSky: 0xb36bff, hemiGround: 0x301040 }); sunAt('party', 0, 0); partyLights(T);
    put(C.ben, 'party', 0, flr.party, 8, 0, P.dance(t * 1.4, t % 1 < 0.5 ? 0 : 1), { mouth: 'grin', blush: true });
    partyCrowd(t, 8);
    const ph = crowd[0]; put(ph, 'party', 4.5, flr.party, 9, -PI / 2 - 0.3, lerpPose(P.idle(t), { armR: [-1.6, 0, 0] }, 1), { mouth: 'grin' });
    W.phone.visible = true; W.phone.position.copy(ph.handWorld('R')).add(V(0, 0.5, 0)); W.phone.rotation.y = -PI / 2 - 0.3;
    cam('party', [0, 4.6, 18], [0, 3.6, 8], 42);
    ov.filter('sepia(0.75) saturate(1.2) contrast(1.05)'); ov.stamp('⏪ FLASHBACK');
  });
  shot(81.8, (t, T, d, ov) => { // flashback: Rudy watching viral video
    dayLight(); sunAt('square', 20, 14);
    put(C.rudy, 'square', 20, flr.square, 0, 0, lerpPose(P.idle(t), { armR: [-1.1, 0.5, 0], armL: [-1.1, -0.5, 0], neck: [0.25, 0, 0] }, 1), { mouth: t > 0.6 ? 'grin' : 'flat', look: [0, 1], eyeScale: t > 0.6 ? 1.2 : 1 });
    W.phone.visible = true; W.phone.userData.draw(T); W.phone.scale.setScalar(1.3);
    W.phone.position.copy(L('square', 20, 7.0, 2.6)); W.phone.scale.setScalar(1.7);
    cam('square', [21.2, 8.4, 10.5], [20, 7.9, 0], 40);
    ov.filter('sepia(0.75) saturate(1.2) contrast(1.05)'); ov.stamp('⏪ FLASHBACK');
  });
  shot(82.9, (t, T, d, ov) => { // mascot + contract handoff
    dayLight(); sunAt('court', 0, 0); tourney(true); crowdBleachers(t, 'stare');
    put(C.rudy, 'court', 2.5, flr.court, 0, -PI / 2, lerpPose(P.idle(t), { armR: [-1.4, 0, 0], armL: [-1.3, 0, 0.0] }, 1), { mouth: 'smile' });
    put(C.ben, 'court', -2, flr.court, 0, PI / 2, lerpPose(P.idle(t), { armL: [-1.4, 0, 0], armR: [-1.4, 0, 0] }, 1), { mouth: 'grin', eyeScale: 1.3, blush: true });
    W.mascotHead.visible = true; W.mascotHead.position.copy(C.rudy.handWorld('R')).add(V(-1.0, 0.5, 0)); W.mascotHead.rotation.y = -PI / 2;
    W.contract.visible = true; W.contract.position.copy(C.rudy.handWorld('L')).add(V(-1.2, 0.6, 0)); W.contract.rotation.y = -PI / 2 + 0.3;
    if (t > 0.6) ov.badge('<div style="font:900 92px Inter;color:#3cff6b;-webkit-text-stroke:14px #000;paint-order:stroke fill;transform:rotate(-8deg)">$100,000</div>', ease.back(seg(t, 0.6, 0.85)));
    cam('court', [-1.0, 6.0, 15], [0.2, 5.6, 0], 42);
  });
  shot(84.2, (t, T, d, ov) => { // town stares in disbelief
    dayLight(); sunAt('court', 0, 6); tourney(true);
    const town = [C.alex, C.grandma, C.mayor, C.baker, C.mailman, ...crowd.slice(0, 6)];
    town.forEach((c, i) => put(c, 'court', -10 + i * 2.1, flr.court, 4 + (i % 2) * 1.6, 0, P.idle(0), { mouth: 'o', eyeScale: 1.35, look: [0, 0] }));
    C.alex.headband.visible = true;
    cam('court', [0, 4.2, 22 - t * 1.5], [0, 3.6, 4], 40);
  });
  // ================= SCENE 12 =================
  shot(() => E.s11end[1], (t, T, d, ov) => { // Ben drives past in mascot costume
    dayLight(); sunAt('town', -57, 6);
    const u = t / d; W.car.visible = true; W.car.position.copy(L('town', -75 + u * 35, 0.08, 2.2)); W.car.rotation.y = 0;
    put(C.ben, 'town', 0, 0, 0, PI / 2, P.sitChair(t, 1.4), {}); C.ben.root.position.copy(W.car.position).add(V(-1.4, 0.0, 0)); C.ben.body.position.y = 2.0; C.ben.head.visible = false;
    C.ben.pose({ armL: [-2.7, 0, 0.5 + S(t * 16) * 0.3] });
    W.mascotHead2.visible = true; C.ben.root.updateMatrixWorld(true); W.mascotHead2.position.copy(C.ben.headWorld()).add(V(0, 0.4, 0)); W.mascotHead2.rotation.y = PI / 2;
    W.mascotBody.visible = true; W.mascotBody.position.copy(C.ben.root.position).add(V(0, 2.0, 0)); W.mascotBody.rotation.y = PI / 2;
    put(C.alex, 'town', -57, flr.town, 6.8, face(-57, 6.8, -51, 12.5), P.sitFloor(t), { mouth: 'o', eyeScale: 1.3, look: [-0.8, 0] }); C.alex.headband.visible = true;
    cam('town', [-51, 2.2, 12.5], [-57, 2.4, 4], 46);
  });
  shot(86.2, (t, T, d, ov) => { // grandma trophy
    dayLight(); sunAt('court', 0, 0); tourney(true); W.courtConfetti.visible = true; W.courtConfetti.update(t + 2); crowdBleachers(t, 'cheer');
    put(C.grandma, 'court', 0, flr.court, 2, 0.1, lerpPose(P.idle(t), { armR: [0, 0, -2.9], armL: [0, 0, 2.9] }, 1), { mouth: 'grin', brow: 0.4, blush: true });
    W.trophy.visible = true; const a = C.grandma.handWorld('R').lerp(C.grandma.handWorld('L'), 0.5); W.trophy.position.copy(a).add(V(0, -0.2, 0)); W.trophy.scale.setScalar(0.9);
    cam('court', [0.5, 3.5, 11 - t], [0, 5.8, 2], 46);
  });
  shot(() => e0('d12') - 0.1, (t, T, d, ov) => { // Alex alone on sidewalk
    lights({ sky: 0xff9a6a, sunColor: 0xffa060, sun: 2.0, exposure: 0.95, dir: [-30, 10, 10] }); sunAt('town', -57, 6, [-30, 10, 10]);
    put(C.alex, 'town', -57, flr.town, 6.8, 0, lerpPose(P.sitFloor(t), { neck: [0.25, 0, 0], body: [0.25, 0, 0], armL: [-0.6, 0, 0.1], armR: [-0.6, 0, -0.1] }, 1), { mouth: 'frown', lid: 0.35, sweat: true, brow: -0.6 });
    C.alex.headband.visible = true;
    talk(C.alex, 'd12', T); talk(C.alex, 'btw12', T);
    ballAt(balls[0], L('town', -54.5, 0.9, 7.6));
    const u = ease.io(t / d);
    cam('town', mix([-56.0, 2.7, 12.4], [-56.6, 2.9, 10.8], u), [-57, 2.3, 6.8], 40);
    ov.black(seg(T, 89.2, 89.3));
  });
  shot(() => e0('black'), (t, T, d, ov) => { ov.black(1); dayLight(); cam('town', [0, 5, 10], [0, 5, 0], 40); ov.hideCap = true; });

  // resolve function starts
  SH.forEach(s => { if (typeof s.a === 'function') s.a = s.a(); });
  for (let i = 1; i < SH.length; i++) if (!(SH[i].a > SH[i - 1].a)) console.log('SHOT ORDER PROBLEM', i, SH[i - 1].a, SH[i].a);
  console.log('shots', SH.length);
}
