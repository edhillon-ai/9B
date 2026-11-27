import { THREE, scene, Char, box, cyl, sph, mat, canvasTex, textPlane } from './core.js';
import { LOC, W, tree, sportsCar, loaf } from './world.js';
import { recolorCar, bushBall } from './extras4.js';
import { hairCap } from './cast.js';
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const add = (p, o, x, y, z) => { o.position.set(x, y, z); p.add(o); return o; };
const emis = (c, i = 1.5) => mat(c, { emissive: c, emissiveIntensity: i });
let s = 61; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
const stripes = (a, b, n = 8, vert = false) => canvasTex(256, 256, (g) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; if (vert) g.fillRect(i * 256 / n, 0, 256 / n + 1, 256); else g.fillRect(0, i * 256 / n, 256, 256 / n + 1); } });
function shirtTex(c, tex) { c.torso.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }); for (const a of [c.armL, c.armR]) a.children[0].material = c.torso.material; }
export function makeCast6() {
  const X = {};
  X.police = new Char({ name: 'Police', skin: 0xe8b890, shirt: 0x1b2f6b, sleeves: 0.9, pants: 0x101a3a, shortsLen: 1.55, shoe: 0x0a0a0a, face: { browColor: '#2a1a0a' }, decorate: (c) => {
    hairCap(c, 0x2a1a0a, {});
    const hat = cyl(0.7, 0.66, 0.36, 0x101a3a); hat.position.y = 0.68; c.head.add(hat);
    const band = cyl(0.705, 0.705, 0.12, 0x111111); band.position.y = 0.55; c.head.add(band);
    const brim = box(1.05, 0.07, 0.6, 0x0a0a0a, { roughness: 0.2 }); brim.position.set(0, 0.52, 0.72); c.head.add(brim);
    const hb = box(0.32, 0.32, 0.05, 0xffd54a, { metalness: 0.8, roughness: 0.25 }); hb.position.set(0, 0.72, 0.7); c.head.add(hb);
    const badge = box(0.36, 0.42, 0.05, 0xffd54a, { metalness: 0.8, roughness: 0.25 }); badge.position.set(0.5, 1.45, 0.53); c.body.add(badge);
    const belt = box(2.05, 0.28, 1.05, 0x111111); belt.position.set(0, 0.1, 0); c.body.add(belt);
    const radio = box(0.3, 0.45, 0.2, 0x222222); radio.position.set(-0.55, 1.5, 0.55); c.body.add(radio);
    const mu = box(0.62, 0.13, 0.1, 0x2a1a0a); mu.position.set(0, -0.12, 0.63); c.head.add(mu);
  } });
  X.robber = new Char({ name: 'Robber', skin: 0xd9a77c, shirt: 0x111111, sleeves: 1.6, pants: 0x1a1a1a, shortsLen: 1.55, shoe: 0x333333, face: { browColor: '#111' }, decorate: (c) => {
    const st = stripes('#f4f4f4', '#141414', 10); shirtTex(c, st);
    const beanie = cyl(0.68, 0.68, 0.55, 0x151515); beanie.position.y = 0.55; c.head.add(beanie); const bt = sph(0.68, 0x151515); bt.scale.y = 0.35; bt.position.y = 0.82; c.head.add(bt);
    const mask = new THREE.Mesh(new THREE.CylinderGeometry(0.635, 0.635, 0.3, 40, 1, true, -1.15, 2.3), mat(0x0a0a0a)); mask.position.y = 0.1; mask.material.side = THREE.DoubleSide; c.head.add(mask);
    const bag = new THREE.Group(); add(bag, sph(0.9, 0xd8c8a0, { roughness: 0.95 }), 0, 0, 0); bag.children[0].scale.set(1, 1.1, 0.9); add(bag, cyl(0.2, 0.35, 0.4, 0xb8a880), 0, 1.0, 0);
    const ds = textPlane('$', 0.9, 0.9, { bg: '#d8c8a0', fg: '#1a7f3a', font: '900 900px Inter', px: 256 }); add(bag, ds, 0, 0, -0.82); ds.rotation.y = Math.PI;
    bag.position.set(0, 1.1, -1.2); c.body.add(bag); c.bag = bag;
  } });
  X.customer = new Char({ name: 'Customer', skin: 0xf2c9a0, shirt: 0x8a5a2b, sleeves: 1.7, pants: 0x5a5a5a, shortsLen: 1.55, shoe: 0x4a2a10, face: { browColor: '#dddddd', lid: 0.35 }, decorate: (c) => {
    const side = new THREE.Mesh(new THREE.CylinderGeometry(0.665, 0.665, 0.6, 40, 1, true, Math.PI * 0.45, Math.PI * 1.1), mat(0xe6e6e6)); side.position.y = 0.25; side.material.side = THREE.DoubleSide; c.head.add(side);
    const beard = box(0.9, 0.3, 0.3, 0xf2f2f2); beard.position.set(0, -0.62, 0.5); c.head.add(beard);
    const gm = mat(0x8a6a2a, { roughness: 0.3, metalness: 0.5 }); for (const sx of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 24), gm); r.position.set(sx * 0.215, 0.09, 0.66); c.head.add(r); }
    const vest = box(1.4, 1.9, 0.05, 0xc9b48a); vest.position.set(0, 1.0, 0.505); c.body.add(vest);
    for (let i = 0; i < 3; i++) { const b = sph(0.07, 0x3a2414); b.position.set(0, 0.5 + i * 0.5, 0.54); c.body.add(b); }
    const cane = new THREE.Group(); add(cane, cyl(0.07, 0.07, 3.2, 0x5a3418), 0, -1.6, 0); const hk = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.07, 8, 16, Math.PI), mat(0x5a3418)); add(cane, hk, 0.25, 0, 0);
    cane.position.set(0, -1.9, 0.3); c.armR.add(cane); c.cane = cane;
  } });
  X.agent = new Char({ name: 'Agent', skin: 0xeec09a, shirt: 0x4a4f57, sleeves: 1.7, pants: 0x3e434a, shortsLen: 1.55, shoe: 0x0a0a0a, face: { browColor: '#2a1a0a' }, decorate: (c) => {
    hairCap(c, 0x2a1a0a, { slick: true, gloss: true });
    const sh = box(0.7, 1.95, 0.04, 0xffffff); sh.position.set(0, 1.0, 0.505); c.body.add(sh);
    const tie = box(0.24, 1.4, 0.06, 0x111111); tie.position.set(0, 1.15, 0.53); c.body.add(tie);
    for (const sx of [-1, 1]) { const lap = box(0.3, 1.2, 0.05, 0x3a3f46); lap.position.set(sx * 0.42, 1.3, 0.53); lap.rotation.z = sx * 0.25; c.body.add(lap); }
    const gm = mat(0x111111, { roughness: 0.3 }); for (const sx of [-1, 1]) { const r = box(0.4, 0.3, 0.05, gm); r.position.set(sx * 0.22, 0.09, 0.64); c.head.add(r); const ln = box(0.32, 0.22, 0.02, mat(0xbfe6ff, { transparent: true, opacity: 0.25 })); ln.position.set(sx * 0.22, 0.09, 0.665); c.head.add(ln); }
    const pin = box(0.2, 0.12, 0.05, 0xffd54a, { metalness: 0.8 }); pin.position.set(0.7, 1.55, 0.53); c.body.add(pin);
    const cb = new THREE.Group(); add(cb, box(1.0, 1.35, 0.06, 0x8a5a2b), 0, 0, 0); add(cb, box(0.85, 1.1, 0.02, 0xffffff), 0, -0.05, 0.04); add(cb, box(0.4, 0.15, 0.08, 0xc0c0c0, { metalness: 0.8 }), 0, 0.65, 0.04);
    for (let i = 0; i < 5; i++) add(cb, box(0.6, 0.04, 0.01, 0x333333), 0, 0.3 - i * 0.18, 0.06);
    cb.position.set(0, -1.9, 0.6); cb.rotation.x = -1.2; c.armL.add(cb); c.clip = cb;
  } });
  return X;
}
export function buildExtras6() {
  const T = W.town;
  // ---- black van ----
  const van = new THREE.Group(); const blk = mat(0x111214, { roughness: 0.25, metalness: 0.6 });
  add(van, box(11, 0.3, 5, blk), -0.5, 6.05, 0); add(van, box(11, 0.3, 5, blk), -0.5, 0.75, 0); add(van, box(11, 5.6, 0.2, blk), -0.5, 3.4, -2.4); add(van, box(0.2, 5.6, 5, blk), -5.9, 3.4, 0); add(van, box(0.2, 5.6, 5, blk), 4.9, 3.4, 0);
  add(van, box(2.2, 5.6, 0.2, blk), -4.9, 3.4, 2.4); add(van, box(4.4, 5.6, 0.2, blk), 2.8, 3.4, 2.4); add(van, box(4.4, 0.4, 0.2, blk), -1.6, 6.0, 2.4); add(van, box(3, 3.4, 4.9, blk), 5.9, 2.3, 0);
  add(van, box(10.6, 0.1, 4.6, 0x3a3d44), -0.5, 0.92, 0);
  const ws = box(0.2, 2.2, 4.4, mat(0x0a0d12, { roughness: 0.05, metalness: 0.9 })); ws.rotation.z = 0.35; add(van, ws, 5.0, 4.6, 0);
  for (const z of [2.51, -2.51]) { add(van, box(2.2, 1.6, 0.05, mat(0x0a0d12, { roughness: 0.05, metalness: 0.9 })), 3.6, 4.6, z); }
  for (const [x, z] of [[4.8, 2.3], [4.8, -2.3], [-3.6, 2.3], [-3.6, -2.3]]) { const w = cyl(1.05, 1.05, 0.7, 0x0a0a0a, 18); w.rotation.x = Math.PI / 2; add(van, w, x, 1.05, z); const hub = cyl(0.45, 0.45, 0.72, 0x555555, 12); hub.rotation.x = Math.PI / 2; add(van, hub, x, 1.05, z); }
  for (const z of [1.6, -1.6]) add(van, box(0.1, 0.5, 0.9, emis(0xfff6c0, 2)), 7.42, 2.6, z);
  add(van, box(0.3, 0.6, 4.7, 0x222222), 7.4, 1.3, 0);
  // interior (seen when door opens): bright, with a poster
  const poster = textPlane('TOWN\nDELIVERY\nSERVICE', 2.0, 2.2, { bg: '#ffd400', fg: '#111', font: '900 170px Inter', border: '#d62d2d' }); add(van, poster, -0.5, 3.9, -2.28);
  const p2 = textPlane('IF YOU\nCAN RUN,\nYOU\nDELIVER', 2.0, 2.2, { bg: '#ffffff', fg: '#d62d2d', font: '900 150px Inter', border: '#111' }); add(van, p2, -2.7, 3.9, -2.28);
  for (let i = 0; i < 6; i++) { const b = box(1.0, 0.8, 0.8, 0xc8955a); add(van, b, 2.0 + (i % 2) * 1.1, 1.4 + Math.floor(i / 2) * 0.85, -1.6); }
  W.vanLight = new THREE.PointLight(0xfff0d0, 0, 14, 1.4); add(van, W.vanLight, -1.5, 5.4, 0);
  const door = new THREE.Group(); add(door, box(4.2, 5.2, 0.15, blk), 0, 0, 0); add(door, box(0.5, 0.15, 0.1, 0x777777), 1.6, 0, 0.12); door.position.set(-1.6, 3.4, 2.56); van.add(door); W.vanDoor = door;
  scene.add(van); W.van = van;
  // ---- lamborghini ----
  W.lambo = recolorCar(sportsCar(), 0x7ed321); add(W.lambo, box(0.4, 0.15, 4.8, 0x111111), -4.9, 3.5, 0); for (const z of [1.8, -1.8]) add(W.lambo, box(0.3, 0.9, 0.2, 0x111111), -4.9, 3.0, z); scene.add(W.lambo);
  // ---- race banners ----
  const banner = (txt, bg, fg) => { const g = new THREE.Group(); for (const z of [-7, 7]) { add(g, cyl(0.25, 0.25, 11, 0xeeeeee), 0, 5.5, z); } const b = textPlane(txt, 14, 2.6, { bg, fg, font: '900 150px Inter' }); add(g, b, 0, 9.6, 0); b.rotation.y = Math.PI / 2; const b2 = b.clone(); add(g, b2, -0.02, 9.6, 0); b2.rotation.y = -Math.PI / 2; return g; };
  W.startB = banner('BIG RACE  $1,000,000', '#d62d2d', '#fff'); W.startB.position.set(LOC.town.x - 40, 0, 0); scene.add(W.startB);
  const chk = canvasTex(256, 32, (g) => { for (let i = 0; i < 32; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#111' : '#fff'; g.fillRect(i * 8, j * 8, 8, 8); } });
  W.finishB = banner('FINISH', '#111', '#fff'); W.finishB.position.set(LOC.town.x + 20, 0, 0); scene.add(W.finishB);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 9), new THREE.MeshStandardMaterial({ map: chk })); fl.rotation.set(-Math.PI / 2, 0, Math.PI / 2); fl.rotation.set(-Math.PI / 2, 0, 0); chk.rotation = Math.PI / 2; add(T, fl, 20, 0.1, 0);
  add(T, box(0.6, 0.12, 9, 0xffffff), -40, 0.1, 0);
  W.tapeL = box(0.08, 0.25, 4.6, 0xd62d2d); W.tapeR = box(0.08, 0.25, 4.6, 0xd62d2d); scene.add(W.tapeL); scene.add(W.tapeR);
  W.whistle = new THREE.Group(); add(W.whistle, box(0.35, 0.22, 0.22, 0xd8d8d8, { metalness: 0.9, roughness: 0.2 }), 0, 0, 0); scene.add(W.whistle);
  W.raceConf = null;
  // ---- bakery storefront (replaces a house) ----
  W.houses[8].visible = false; // x=-30 north side
  const sf = new THREE.Group(); add(sf, box(14, 9, 8, 0xffd6a5), 0, 4.5, 0); add(sf, box(14.4, 0.6, 8.4, 0x7a3e1d), 0, 9.2, 0);
  const sg = textPlane("BOB'S BAKERY", 10, 1.8, { bg: '#7a3e1d', fg: '#ffe9c7', font: '900 150px Inter' }); add(sf, sg, 0, 7.6, 4.05);
  const aw = new THREE.Mesh(new THREE.BoxGeometry(12, 0.2, 2.6), new THREE.MeshStandardMaterial({ map: stripes('#d62d2d', '#ffffff', 12, true) })); aw.rotation.x = 0.35; add(sf, aw, 0, 6.2, 5.0);
  for (const x of [-4, 4]) { add(sf, box(4, 3, 0.2, mat(0xcfefff, { roughness: 0.05, transparent: true, opacity: 0.6 })), x, 3.4, 4.05); for (let j = 0; j < 3; j++) { const l = loaf(); l.scale.setScalar(0.6); add(sf, l, x - 1.2 + j * 1.2, 2.3, 3.8); } }
  add(sf, box(2.2, 4.2, 0.2, 0x6b3b1e), 0, 2.1, 4.05);
  sf.position.set(-30, 0, -17); T.add(sf);
  W.drop = new THREE.Group(); for (let i = 0; i < 4; i++) { const l = loaf(); l.userData = { a: i * 1.7, v: 3 + i }; W.drop.add(l); } scene.add(W.drop);
  // trash can in front of bakery area
  W.can = new THREE.Group(); add(W.can, cyl(1.0, 0.85, 2.8, 0x5c6b73), 0, 1.4, 0); add(W.can, cyl(1.1, 1.1, 0.18, 0x48555c), 0, 2.85, 0); W.can.position.set(LOC.town.x - 24, 0.35, -7.2); scene.add(W.can);
  // ---- park (south side) ----
  W.houses[17].visible = false; W.houses[19].visible = false;
  const pk = new THREE.Group(); add(pk, box(34, 0.1, 18, 0x5fbf4a), 0, 0.05, 0);
  const path = box(34, 0.12, 3, 0xe6d3a8); add(pk, path, 0, 0.08, 0); const path2 = box(3, 0.12, 18, 0xe6d3a8); add(pk, path2, 0, 0.08, 0);
  add(pk, cyl(3.2, 3.4, 1.2, 0xbfc6cc), 0, 0.6, 0); add(pk, cyl(2.8, 2.8, 0.2, 0x4fc3f7), 0, 1.15, 0); add(pk, cyl(0.4, 0.5, 2.6, 0xbfc6cc), 0, 2, 0); add(pk, cyl(1.2, 0.3, 0.4, 0xbfc6cc), 0, 3.3, 0); W.fspray = add(pk, sph(0.7, mat(0x9fe3ff, { transparent: true, opacity: 0.6 })), 0, 3.9, 0);
  for (const [x, z] of [[-12, -5], [12, -5], [-12, 5], [12, 5]]) { const t = tree(1.1); t.position.set(x, 0, z); pk.add(t); }
  for (const [x, z] of [[-7, -2.2], [7, -2.2]]) { const b = new THREE.Group(); add(b, box(4, 0.3, 1.2, 0x8a5a33), 0, 1.3, 0); add(b, box(4, 1.2, 0.2, 0x8a5a33), 0, 2.0, -0.6); for (const sx of [-1.7, 1.7]) add(b, box(0.2, 1.3, 1.0, 0x333333), sx, 0.65, 0); b.position.set(x, 0, z); b.rotation.y = Math.PI; pk.add(b); }
  for (let i = 0; i < 14; i++) add(pk, sph(0.35, [0xff4d6d, 0xffd60a, 0xc77dff, 0xff9f1c][i % 4]), -15 + i * 2.2, 0.35, 8);
  const ps = textPlane('TOWN PARK', 5, 1.2, { bg: '#2e7d32', fg: '#fff', font: '900 150px Inter' }); add(pk, ps, -14, 2.6, -8.6); add(pk, cyl(0.12, 0.12, 2.2, 0x5a3418), -15.8, 1.1, -8.7); add(pk, cyl(0.12, 0.12, 2.2, 0x5a3418), -12.2, 1.1, -8.7);
  pk.position.set(37, 0, 18); T.add(pk);
  // ---- mayor sign on rich street mansion (x=26) ----
  const ms = textPlane("MAYOR'S MANSION", 8, 1.4, { bg: '#111', fg: '#ffd54a', font: '900 140px Inter', border: '#ffd54a' }); add(W.rich, ms, 26, 3.2, -14.5);
  add(W.rich, cyl(0.15, 0.15, 3, 0x222222), 22.5, 1.5, -14.6); add(W.rich, cyl(0.15, 0.15, 3, 0x222222), 29.5, 1.5, -14.6);
  // ---- laundry basket (gym, behind treadmill) ----
  const bs = canvasTex(128, 64, (g) => { g.fillStyle = '#e8f1ff'; g.fillRect(0, 0, 128, 64); g.fillStyle = '#9db8e0'; for (let i = 0; i < 8; i++) for (let j = 0; j < 3; j++) g.fillRect(6 + i * 16, 10 + j * 18, 8, 8); });
  W.basket = new THREE.Group(); const bk = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 1.7, 2.4, 24, 1, true), new THREE.MeshStandardMaterial({ map: bs, side: THREE.DoubleSide })); add(W.basket, bk, 0, 1.2, 0); add(W.basket, cyl(1.7, 1.7, 0.1, 0xd0ddef), 0, 0.05, 0);
  for (let i = 0; i < 9; i++) { const c = box(1.0, 0.25, 0.8, [0xff6b6b, 0xffd93d, 0x6bcBff, 0xffffff, 0xb06bff][i % 5]); c.rotation.set(rnd(), rnd() * 3, rnd()); add(W.basket, c, (rnd() - 0.5) * 2, 1.6 + rnd() * 0.6, (rnd() - 0.5) * 2); }
  scene.add(W.basket);
  W.socks = new THREE.Group(); for (let i = 0; i < 10; i++) { const c = box(0.7, 0.2, 0.4, [0xff6b6b, 0xffd93d, 0x6bcbff, 0xffffff][i % 4]); c.userData = { a: rnd() * 6.3, v: 4 + rnd() * 4, s: rnd() }; W.socks.add(c); } scene.add(W.socks);
  // ---- packages: mountain, falling boxes, carry stack ----
  const pkm = mat(0xc8955a, { roughness: 0.8 }), tpm = mat(0xe8d6a8);
  const pbox = (w, h, d) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), pkm); b.castShadow = true; g.add(b); add(g, new THREE.Mesh(new THREE.BoxGeometry(w * 0.25, h + 0.02, d + 0.02), tpm), 0, 0, 0); return g; };
  W.pbox = pbox;
  const n = 420; const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), pkm, n); im.castShadow = true; im.receiveShadow = true; const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
  for (let i = 0; i < n; i++) { const r = Math.sqrt(rnd()) * 9, a = rnd() * 6.28; const h = Math.max(0, 9 * (1 - r / 9)) * rnd() ** 0.5; const sz = 0.9 + rnd() * 0.9; e.set(rnd() * 0.6, rnd() * 3, rnd() * 0.6); q.setFromEuler(e); m4.compose(V3(Math.cos(a) * r, h + sz / 2, Math.sin(a) * r), q, V3(sz, sz * 0.8, sz)); im.setMatrixAt(i, m4); }
  W.pile = new THREE.Group(); W.pile.add(im); scene.add(W.pile);
  W.fall = []; for (let i = 0; i < 36; i++) { const b = pbox(1.3 + rnd() * 0.6, 1.0 + rnd() * 0.4, 1.1 + rnd() * 0.5); b.userData = { x: (rnd() - 0.5) * 10, z: (rnd() - 0.5) * 6, d: rnd(), r: rnd() * 6 }; scene.add(b); W.fall.push(b); }
  W.stack = new THREE.Group(); for (let i = 0; i < 16; i++) { const b = pbox(2.2 - (i % 3) * 0.25, 1.1, 1.8 - (i % 2) * 0.2); b.rotation.y = (rnd() - 0.5) * 0.4; b.position.set((rnd() - 0.5) * 0.4, 0.55 + i * 1.1, (rnd() - 0.5) * 0.3); b.userData = { y: 0.55 + i * 1.1, a: rnd() * 6.28, v: 2 + rnd() * 5 }; W.stack.add(b); } scene.add(W.stack);
  W.carryBox = pbox(1.6, 1.2, 1.2); scene.add(W.carryBox);
  // ---- iPhone 6 ----
  const scr = canvasTex(128, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#2b6de0'); gr.addColorStop(1, '#9b4be0'); g.fillStyle = gr; g.fillRect(0, 0, 128, 256); const cols = ['#4cd964', '#ff9500', '#ff3b30', '#5ac8fa', '#ffcc00', '#fff']; for (let i = 0; i < 16; i++) { g.fillStyle = cols[i % 6]; g.fillRect(12 + (i % 4) * 28, 24 + Math.floor(i / 4) * 34, 20, 20); } });
  W.ip6 = new THREE.Group(); add(W.ip6, box(0.7, 1.4, 0.08, mat(0xd8d8dc, { metalness: 0.8, roughness: 0.25 })), 0, 0, 0); add(W.ip6, box(0.62, 1.16, 0.09, 0xffffff), 0, 0, 0.005); const sp = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 1.0), new THREE.MeshBasicMaterial({ map: scr })); add(W.ip6, sp, 0, 0.02, 0.055); add(W.ip6, cyl(0.06, 0.06, 0.02, 0xcccccc), 0, -0.55, 0.05).rotation.x = Math.PI / 2; scene.add(W.ip6);
  W.ipGlow = new THREE.PointLight(0xb0d0ff, 0, 8, 1.5); scene.add(W.ipGlow);
  W.cobweb = new THREE.Group(); for (let i = 0; i < 6; i++) { const l = box(0.02, 0.02, 1.6, mat(0xffffff, { transparent: true, opacity: 0.7 })); l.rotation.y = i * 0.52; W.cobweb.add(l); } scene.add(W.cobweb);
  W.dust = new THREE.Group(); for (let i = 0; i < 20; i++) { const d = sph(0.25 + rnd() * 0.3, mat(0xc9b99a, { transparent: true, opacity: 0.6 }), null, 8); d.userData = { a: rnd() * 6.3, v: 1 + rnd() * 2, s: rnd() }; W.dust.add(d); } scene.add(W.dust);
  // ---- uniform pieces that fly off the mailman ----
  W.uniShirt = box(2.1, 2.1, 1.1, 0x2f5fb5); scene.add(W.uniShirt);
  W.uniCap = new THREE.Group(); add(W.uniCap, cyl(0.68, 0.68, 0.32, 0x2350a3), 0, 0, 0); add(W.uniCap, box(1.0, 0.07, 0.55, 0x1b3f85), 0, -0.12, 0.72); scene.add(W.uniCap);
  W.hawaii = new THREE.MeshStandardMaterial({ roughness: 0.6, map: canvasTex(256, 256, (g) => { g.fillStyle = '#ff7a45'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 18; i++) { const x = (i * 53) % 256, y = (i * 97) % 256; g.fillStyle = ['#ffe14d', '#2ed573', '#ffffff'][i % 3]; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + Math.cos(k * 1.256) * 10, y + Math.sin(k * 1.256) * 10, 8, 0, 7); g.fill(); } } }) });
  // ---- speed lines / dust puffs for running ----
  W.dpuff = new THREE.Group(); for (let i = 0; i < 10; i++) { const p = sph(0.5, mat(0xe8e0d0, { transparent: true, opacity: 0.7 }), null, 8); p.userData = { a: rnd() * 6.3, s: rnd() }; W.dpuff.add(p); } scene.add(W.dpuff);
  W.raceConf = null;
  W.walker = null;
}
