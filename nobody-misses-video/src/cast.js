import { THREE, Char, box, cyl, sph, mat, at, canvasTex } from './core.js';

function hairCap(ch, color, o = {}) {
  const h = ch.head; const m = mat(color, { roughness: o.gloss ? 0.18 : 0.6 });
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.67, 0.67, 0.34, 40, 1, false, 0, Math.PI * 2), m); top.position.y = 0.48; top.castShadow = true; h.add(top);
  const dome = sph(0.67, m); dome.scale.y = 0.3; dome.position.y = 0.65; h.add(dome);
  // back of head
  const back = new THREE.Mesh(new THREE.CylinderGeometry(0.665, 0.665, o.backLen ?? 0.8, 40, 1, true, Math.PI * 0.62, Math.PI * 0.76), m); back.position.y = 0.3 - ((o.backLen ?? 0.8) - 0.8) / 2; back.material.side = THREE.DoubleSide; h.add(back);
  back.castShadow = true;
  if (o.spikes) for (let i = 0; i < 6; i++) { const s = box(0.3, 0.32, 0.3, color); s.position.set(-0.45 + i * 0.18, 0.82 + (i % 2) * 0.06, 0.25 - (i % 3) * 0.12); s.rotation.set(0.3 * (i % 2 ? 1 : -1), i, 0.4 * (i % 2 ? -1 : 1)); h.add(s); }
  if (o.fringe) { const f = box(1.05, 0.22, 0.25, color); f.position.set(0.1, 0.48, 0.52); f.rotation.z = -0.15; h.add(f); }
  if (o.slick) { const f = box(1.2, 0.28, 1.25, color, { roughness: 0.15 }); f.position.set(0, 0.62, -0.05); f.rotation.x = -0.12; h.add(f); }
  return top;
}

export function makeCast() {
  const C = {};
  C.alex = new Char({ name: 'Alex', shirt: 0x2fae4a, pants: 0x161616, shoe: 0xffffff, decorate: (c) => {
    hairCap(c, 0x141414, { fringe: true, spikes: true });
    const stripe = box(1.1, 0.12, 1.28, 0x2fae4a); stripe.position.set(0, -1.62, 0.12); c.legL.add(stripe); const s2 = stripe.clone(); c.legR.add(s2);
    const num = canvasTex(256, 256, (g) => { g.fillStyle = '#2fae4a'; g.fillRect(0, 0, 256, 256); g.fillStyle = '#fff'; g.font = '900 150px Inter'; g.textAlign = 'center'; g.fillText('7', 128, 190); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.9), new THREE.MeshStandardMaterial({ map: num, transparent: false })); p.position.set(0, 1.05, 0.505); c.body.add(p);
    c.headband = box(1.3, 0.18, 1.3, 0xffffff); c.headband.position.y = 0.33; c.head.add(c.headband); c.headband.visible = false;
  } });
  C.grandma = new Char({ name: 'Grandma', skin: 0xf5d2b5, shirt: 0x7b3fb0, sleeves: 1.65, pants: 0x8d82a8, shortsLen: 1.5, shoe: 0xffffff, face: { browColor: '#8a8a8a', blush: true }, decorate: (c) => {
    hairCap(c, 0xb9b9be, {});
    const bun = sph(0.38, 0xc4c4c9); bun.position.set(0, 0.88, -0.25); c.head.add(bun);
    const gm = mat(0x262626, { roughness: 0.3, metalness: 0.4 });
    for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.035, 10, 32), gm); r.position.set(s * 0.215, 0.09, 0.66); r.castShadow = true; c.head.add(r);
      const lens = new THREE.Mesh(new THREE.CircleGeometry(0.2, 24), new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.22, roughness: 0.05 })); lens.position.set(s * 0.215, 0.09, 0.665); c.head.add(lens); }
    const br = box(0.06, 0.04, 0.04, gm); br.position.set(0, 0.11, 0.66); c.head.add(br);
    // cardigan buttons + open front
    const front = box(0.5, 1.95, 0.05, 0xf0e6ff); front.position.set(0, 1.0, 0.5); c.body.add(front);
    for (let i = 0; i < 4; i++) { const b = sph(0.07, 0xf2d04a); b.position.set(0.32, 0.4 + i * 0.42, 0.53); c.body.add(b); }
    const sneak = box(1.1, 0.12, 1.3, 0x9b59d0); sneak.position.set(0, -1.62, 0.12); c.legL.add(sneak); c.legR.add(sneak.clone());
  } });
  C.mailman = new Char({ name: 'Mailman', skin: 0xd9a77c, shirt: 0x2f5fb5, sleeves: 0.8, pants: 0x223f7a, shortsLen: 1.55, shoe: 0x1a1a1a, decorate: (c) => {
    hairCap(c, 0x3a2414, {});
    const cap = cyl(0.68, 0.68, 0.32, 0x2350a3); cap.position.y = 0.62; c.head.add(cap);
    const brim = box(1.0, 0.07, 0.55, 0x1b3f85); brim.position.set(0, 0.5, 0.72); c.head.add(brim);
    const badge = box(0.5, 0.3, 0.04, 0xffd94a); badge.position.set(0, 0.68, 0.36); badge.rotation.x = -0.1; c.head.add(badge);
    const bag = box(0.55, 1.1, 1.4, 0x8a5a2b); bag.position.set(1.3, 0.5, 0); c.body.add(bag);
    const strap = box(0.12, 2.6, 1.04, 0x6e4520); strap.position.set(0.2, 1.1, 0); strap.rotation.z = 0.75; c.body.add(strap);
  } });
  C.baker = new Char({ name: 'Baker', skin: 0xeec09a, shirt: 0xffffff, sleeves: 0.9, pants: 0x7a4d2a, shortsLen: 1.55, shoe: 0x3a2a1a, face: { browColor: '#5a3a20' }, decorate: (c) => {
    hairCap(c, 0x5a3a20, {});
    const hat = cyl(0.62, 0.55, 0.7, 0xffffff); hat.position.y = 0.88; c.head.add(hat);
    for (let i = 0; i < 6; i++) { const p = sph(0.34, 0xffffff); const a = i / 6 * Math.PI * 2; p.position.set(Math.cos(a) * 0.38, 1.3, Math.sin(a) * 0.38); c.head.add(p); }
    const top = sph(0.42, 0xffffff); top.position.y = 1.4; c.head.add(top);
    const apron = box(1.7, 2.6, 0.06, 0xf7f7f7); apron.position.set(0, 0.2, 0.52); c.body.add(apron);
    const pocket = box(0.8, 0.5, 0.04, 0xe9e9e9); pocket.position.set(0, -0.3, 0.56); c.body.add(pocket);
    // mustache
    const mu = box(0.6, 0.12, 0.1, 0x3a2414); mu.position.set(0, -0.12, 0.63); c.head.add(mu);
  } });
  C.mayor = new Char({ name: 'Mayor', skin: 0xf0c49c, shirt: 0x181820, sleeves: 1.7, pants: 0x181820, shortsLen: 1.55, shoe: 0x0b0b0b, decorate: (c) => {
    hairCap(c, 0x161210, { gloss: true, slick: true });
    const sh = box(0.7, 1.95, 0.04, 0xffffff); sh.position.set(0, 1.0, 0.505); c.body.add(sh);
    const tie = box(0.28, 1.4, 0.06, 0xd11a1a); tie.position.set(0, 1.15, 0.53); c.body.add(tie);
    const knot = box(0.34, 0.25, 0.08, 0xb01010); knot.position.set(0, 1.88, 0.53); c.body.add(knot);
    for (const s of [-1, 1]) { const lap = box(0.3, 1.2, 0.05, 0x101016); lap.position.set(s * 0.42, 1.3, 0.53); lap.rotation.z = s * 0.25; c.body.add(lap); }
    const pin = box(0.18, 0.18, 0.05, 0xffd700, { metalness: 0.8, roughness: 0.2 }); pin.position.set(0.7, 1.55, 0.53); c.body.add(pin);
  } });
  C.jake = new Char({ name: 'Jake', shirt: 0x2f6fd6, pants: 0x1a1a1a, shoe: 0xffffff, decorate: (c) => { hairCap(c, 0x7a4a24, { spikes: true, fringe: true }); } });
  C.coach = new Char({ name: 'Coach', skin: 0xe8b890, shirt: 0x161616, sleeves: 1.7, pants: 0x161616, shortsLen: 1.55, shoe: 0xf4f4f4, face: { lid: 0.3, browColor: '#4a2c14' }, decorate: (c) => {
    hairCap(c, 0x5a3418, {});
    for (const L of [c.armL, c.armR, c.legL, c.legR]) { const st = box(0.08, 1.8, 1.02, 0xffffff); st.position.set(L === c.armL || L === c.legL ? 0.5 : -0.5, -1.0, 0); L.add(st); }
    const zip = box(0.06, 1.9, 0.04, 0xbbbbbb); zip.position.set(0, 1.0, 0.505); c.body.add(zip);
    const lan = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.04, 6, 24, Math.PI), mat(0xd62d2d)); lan.rotation.z = Math.PI; lan.position.set(0, 1.95, 0.52); c.body.add(lan);
    const wh = box(0.32, 0.18, 0.18, 0xd8d8d8, { metalness: 0.8, roughness: 0.25 }); wh.position.set(0, 1.38, 0.6); c.body.add(wh);
    const sg = new THREE.Group(); for (const sx of [-1, 1]) { const l = box(0.42, 0.26, 0.06, 0x0a0a0a, { roughness: 0.1, metalness: 0.5 }); l.position.set(sx * 0.24, 0.1, 0.64); sg.add(l); } const br = box(0.12, 0.05, 0.05, 0x111111); br.position.set(0, 0.15, 0.64); sg.add(br); c.head.add(sg); c.shades = sg; sg.visible = false;
  } });
  // golden crown for the mayor
  { const g = new THREE.Group(); const gold = mat(0xffcc22, { metalness: 0.9, roughness: 0.22 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.32, 32, 1, true), gold); band.material.side = THREE.DoubleSide; band.castShadow = true; g.add(band);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const sp = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.42, 4), gold); sp.position.set(Math.sin(a) * 0.66, 0.34, Math.cos(a) * 0.66); sp.castShadow = true; g.add(sp); const j = sph(0.07, [0xff2b4a, 0x2bb3ff, 0x34e07a][i % 3], { metalness: 0.3, roughness: 0.1 }); j.position.set(Math.sin(a) * 0.73, 0.02, Math.cos(a) * 0.73); g.add(j); }
    g.position.y = 0.95; C.mayor.head.add(g); C.mayor.crown = g; }
  return C;
}

const NPC_COLORS = [[0xf2a03d, 0x2b3a67], [0x37b5c9, 0x1a1a1a], [0xf5d342, 0x333333], [0xe85d9e, 0x1f2a44], [0x8e5cd9, 0x222222], [0xff7a45, 0x2d4a2d], [0x4caf50, 0x263238], [0x29b6f6, 0x37474f]];
const SKINS = [0xf2c9a0, 0xd9a77c, 0x8d5a3b, 0xf5d2b5, 0xb67b53, 0x6b4028];
const HAIRS = [0x141414, 0x6e4220, 0xd9b44a, 0x2b1b10, 0x8a3a1a];
export function npc(i, o = {}) {
  const [sh, pa] = NPC_COLORS[i % NPC_COLORS.length];
  const c = new Char(Object.assign({ shirt: sh, pants: pa, skin: SKINS[i % SKINS.length], shoe: [0xffffff, 0x222222, 0xff4444][i % 3] }, o));
  hairCap(c, HAIRS[i % HAIRS.length], { spikes: i % 2 === 0 });
  return c;
}
export function referee() {
  const tex = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#111' : '#fff'; g.fillRect(i * 32, 0, 32, 256); } });
  const c = new Char({ shirt: 0xffffff, pants: 0x111111, shortsLen: 1.55, shoe: 0x111111, skin: 0xd9a77c, shirtTex: tex });
  c.torso.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 });
  hairCap(c, 0x222222, {});
  const wh = box(0.12, 0.12, 0.3, 0xdddddd, { metalness: 0.8 }); wh.position.set(0, -0.28, 0.72); c.head.add(wh); c.whistle = wh;
  return c;
}
