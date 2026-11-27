// Core: renderer, materials, blocky R6-style characters, ball, props
import * as THREE from 'three';
export { THREE };

export const W = 1080, H = 1920;
export const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H);
renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);

export const scene = new THREE.Scene();
export const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 900);

// ---------- lighting ----------
export const sun = new THREE.DirectionalLight(0xfff4e0, 2.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0008;
sun.shadow.normalBias = 0.06;
const sc = sun.shadow.camera; sc.left = -40; sc.right = 40; sc.top = 40; sc.bottom = -40; sc.near = 1; sc.far = 200;
scene.add(sun); scene.add(sun.target);
export const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x6a8a4a, 1.1);
scene.add(hemi);
export function setLighting(o) {
  const c = Object.assign({ sky: 0x8fd3ff, sun: 2.6, sunColor: 0xfff4e0, hemi: 1.1, hemiSky: 0xcfe8ff, hemiGround: 0x6a8a4a, fog: null, exposure: 1.05, dir: [18, 30, 14] }, o);
  scene.background = new THREE.Color(c.sky);
  sun.intensity = c.sun; sun.color.set(c.sunColor);
  hemi.intensity = c.hemi; hemi.color.set(c.hemiSky); hemi.groundColor.set(c.hemiGround);
  scene.fog = c.fog ? new THREE.Fog(c.fog[0], c.fog[1], c.fog[2]) : null;
  renderer.toneMappingExposure = c.exposure;
  return c;
}
export function aimSun(target, dir = [18, 30, 14]) {
  sun.target.position.copy(target);
  sun.position.set(target.x + dir[0], target.y + dir[1], target.z + dir[2]);
  sun.target.updateMatrixWorld();
}

// ---------- materials ----------
const matCache = {};
export function mat(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (!matCache[key]) matCache[key] = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.42, metalness: 0.0 }, o));
  return matCache[key];
}
export function box(w, h, d, color, o) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof color === 'object' ? color : mat(color, o));
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function cyl(rt, rb, h, color, seg = 24, o) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), typeof color === 'object' ? color : mat(color, o));
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function sph(r, color, o, seg = 24) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.max(8, seg * 0.66 | 0)), typeof color === 'object' ? color : mat(color, o));
  m.castShadow = true; m.receiveShadow = true; return m;
}
export function at(o, x, y, z) { o.position.set(x, y, z); return o; }

export function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  t.userData = { canvas: c, g };
  return t;
}
export function textPlane(text, w, h, o = {}) {
  const cfg = Object.assign({ bg: '#ffffff', fg: '#222', font: '900 120px Inter', px: 1024 }, o);
  const ph = Math.round(cfg.px * h / w);
  const t = canvasTex(cfg.px, ph, (g, W, H) => {
    g.fillStyle = cfg.bg; g.fillRect(0, 0, W, H);
    if (cfg.border) { g.strokeStyle = cfg.border; g.lineWidth = 18; g.strokeRect(9, 9, W - 18, H - 18); }
    g.fillStyle = cfg.fg; g.font = cfg.font; g.textAlign = 'center'; g.textBaseline = 'middle';
    const lines = text.split('\n'); const lh = H / (lines.length + 0.4);
    lines.forEach((l, i) => g.fillText(l, W / 2, lh * (i + 0.7) + lh * 0.0));
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }));
  m.receiveShadow = true; return m;
}

// ---------- face texture ----------
const SKIN = 0xf2c9a0;
function drawFace(g, W, H, e, skin) {
  g.fillStyle = skin; g.fillRect(0, 0, W, H);
  const cx = W / 2, ey = H * 0.38;
  const sx = e.eyeScale || 1;
  const eyeW = 60 * sx, eyeH = 78 * sx * (e.eyeOpen ?? 1);
  const dx = 90;
  for (const s of [-1, 1]) {
    const x = cx + s * dx;
    if ((e.eyeOpen ?? 1) < 0.15) { // closed
      g.strokeStyle = '#1a1a1a'; g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.arc(x, ey + 4, 28, Math.PI * 1.15, Math.PI * 1.85, false); g.stroke();
    } else {
      g.fillStyle = '#fff'; g.strokeStyle = '#1a1a1a'; g.lineWidth = 6;
      g.beginPath(); g.ellipse(x, ey, eyeW, eyeH, 0, 0, Math.PI * 2); g.fill(); g.stroke();
      const pr = (e.pupil || 1) * 30 * Math.min(1, sx);
      const px = x + (e.look ? e.look[0] : 0) * 14, py = ey + 6 + (e.look ? e.look[1] : 0) * 14;
      g.fillStyle = '#141414'; g.beginPath(); g.ellipse(px, py, pr, Math.min(pr * 1.15, eyeH - 6), 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(px - pr * 0.35, py - pr * 0.4, pr * 0.32, 0, Math.PI * 2); g.fill();
      if (e.lid) { // heavy upper lid (tired / unimpressed)
        g.fillStyle = skin; g.fillRect(x - eyeW - 6, ey - eyeH - 6, eyeW * 2 + 12, eyeH * e.lid * 2 + 6);
        g.strokeStyle = '#1a1a1a'; g.lineWidth = 7; g.beginPath(); g.moveTo(x - eyeW, ey - eyeH + eyeH * e.lid * 2); g.lineTo(x + eyeW, ey - eyeH + eyeH * e.lid * 2); g.stroke();
      }
    }
    // brows
    const b = e.brow || 0; // + angry, - sad
    const by = ey - eyeH - 22 - (e.browUp || 0) * 18;
    g.strokeStyle = e.browColor || '#2a1a10'; g.lineWidth = 13; g.lineCap = 'round';
    g.beginPath();
    // inner end lower when angry
    const inner = x - s * 36, outer = x + s * 40;
    g.moveTo(outer, by - (b > 0 ? 6 : 0) + (b < 0 ? 10 : 0));
    g.lineTo(inner, by + b * 16);
    g.stroke();
  }
  // cheeks
  if (e.blush) { g.fillStyle = 'rgba(255,90,90,0.35)'; for (const s of [-1, 1]) { g.beginPath(); g.ellipse(cx + s * 110, ey + 70, 30, 16, 0, 0, Math.PI * 2); g.fill(); } }
  // mouth
  const my = H * 0.74, open = e.open || 0;
  g.strokeStyle = '#1a1a1a'; g.lineWidth = 9; g.lineCap = 'round'; g.fillStyle = '#5a1414';
  const m = e.mouth || 'smile';
  if (open > 0.08 || m === 'o' || m === 'shout') {
    const ow = m === 'o' ? 26 : (m === 'shout' ? 56 : 40 + open * 12), oh = m === 'o' ? 30 : (m === 'shout' ? 40 : 6 + open * 34);
    g.beginPath(); g.ellipse(cx, my, ow, oh, 0, 0, Math.PI * 2); g.fill(); g.stroke();
    if (oh > 14) { g.fillStyle = '#e86a6a'; g.beginPath(); g.ellipse(cx, my + oh * 0.5, ow * 0.6, oh * 0.35, 0, 0, Math.PI * 2); g.fill(); }
    if (m === 'shout' || (open > 0.4 && m !== 'o')) { g.fillStyle = '#fff'; g.fillRect(cx - ow * 0.7, my - oh + 4, ow * 1.4, Math.min(12, oh * 0.3)); }
  } else if (m === 'smile') { g.beginPath(); g.arc(cx, my - 26, 40, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); }
  else if (m === 'grin') {
    g.fillStyle = '#fff'; g.beginPath(); g.moveTo(cx - 58, my - 12); g.quadraticCurveTo(cx, my + 50, cx + 58, my - 12); g.closePath(); g.fill(); g.stroke();
    g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 52, my + 2); g.lineTo(cx + 52, my + 2); g.stroke();
  }
  else if (m === 'frown') { g.beginPath(); g.arc(cx, my + 34, 36, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); }
  else if (m === 'flat') { g.beginPath(); g.moveTo(cx - 30, my); g.lineTo(cx + 30, my); g.stroke(); }
  else if (m === 'smirk') { g.beginPath(); g.moveTo(cx - 30, my + 4); g.quadraticCurveTo(cx + 10, my + 8, cx + 38, my - 12); g.stroke(); }
  else if (m === 'grit') {
    g.fillStyle = '#fff'; g.fillRect(cx - 50, my - 16, 100, 32); g.strokeRect(cx - 50, my - 16, 100, 32);
    g.lineWidth = 4; g.beginPath(); for (let i = -2; i <= 2; i++) { g.moveTo(cx + i * 20, my - 16); g.lineTo(cx + i * 20, my + 16); } g.moveTo(cx - 50, my); g.lineTo(cx + 50, my); g.stroke();
  }
  else if (m === 'wavy') { g.beginPath(); g.moveTo(cx - 40, my); for (let i = 0; i <= 8; i++) g.lineTo(cx - 40 + i * 10, my + (i % 2 ? -8 : 8)); g.stroke(); }
  if (e.beard) { g.fillStyle = e.beard; g.globalAlpha = 0.9; g.beginPath(); g.moveTo(cx - 150, H * 0.55); g.quadraticCurveTo(cx, H * 1.15, cx + 150, H * 0.55); g.lineTo(cx + 150, H); g.lineTo(cx - 150, H); g.fill(); g.globalAlpha = 1;
    if (!(open > 0.08)) { g.strokeStyle = '#1a1a1a'; g.lineWidth = 9; g.beginPath(); g.moveTo(cx - 30, my); g.lineTo(cx + 30, my); g.stroke(); } }
  if (e.sweat) { g.fillStyle = '#7fd0ff'; g.strokeStyle = '#2a7fb8'; g.lineWidth = 3; for (const [x, y] of [[cx + 150, ey - 50], [cx - 160, ey - 10]]) { g.beginPath(); g.moveTo(x, y - 22); g.quadraticCurveTo(x + 16, y + 6, x, y + 12); g.quadraticCurveTo(x - 16, y + 6, x, y - 22); g.fill(); g.stroke(); } }
  if (e.tear) { g.fillStyle = '#7fd0ff'; g.fillRect(cx - dx - 8, ey + 40, 14, 60); g.fillRect(cx + dx - 6, ey + 40, 14, 60); }
}

// ---------- character ----------
export class Char {
  constructor(o) {
    this.o = o = Object.assign({ skin: SKIN, shirt: 0x3cb043, pants: 0x1c1c1c, shoe: 0xf2f2f2, hair: 0x111111, scale: 1, sleeves: 0.7 }, o);
    this.root = new THREE.Group();
    this.body = new THREE.Group(); this.root.add(this.body); // hips pivot
    this.body.position.y = 2;
    const skin = o.skin;
    this.torso = box(2, 2, 1, o.shirt); this.torso.position.y = 1; this.body.add(this.torso);
    if (o.shirtTex) this.torso.material = [mat(o.shirt), mat(o.shirt), mat(o.shirt), mat(o.shirt), new THREE.MeshStandardMaterial({ map: o.shirtTex, roughness: 0.45 }), mat(o.shirt)];
    // head
    this.neck = new THREE.Group(); this.neck.position.y = 2; this.body.add(this.neck);
    this.faceTex = canvasTex(1024, 320, () => {});
    const sideMat = new THREE.MeshStandardMaterial({ map: this.faceTex, roughness: 0.38 });
    const capMat = mat(skin, { roughness: 0.38 });
    const hg = new THREE.CylinderGeometry(0.62, 0.62, 1.15, 40, 1, false, Math.PI, Math.PI * 2);
    this.head = new THREE.Mesh(hg, [sideMat, capMat, capMat]); this.head.castShadow = true;
    this.head.position.y = 0.62; this.neck.add(this.head);
    const capTop = sph(0.62, capMat); capTop.scale.y = 0.22; capTop.position.y = 0.575; this.head.add(capTop);
    // limbs
    const mkLimb = (x, y, parts) => { const gr = new THREE.Group(); gr.position.set(x, y, 0); let yy = 0; for (const [h, c, extra] of parts) { const b = box(extra?.w || 1, h, extra?.d || 1, c); b.position.set(0, -yy - h / 2, extra?.z || 0); gr.add(b); yy += h; } this.body.add(gr); return gr; };
    const sl = o.sleeves;
    this.armL = mkLimb(1.5, 1.9, [[sl, o.shirt], [2 - sl, o.armSkin ?? skin]]); this.armL.children.forEach(c => c.position.y += 0.1);
    this.armR = mkLimb(-1.5, 1.9, [[sl, o.shirt], [2 - sl, o.armSkin ?? skin]]); this.armR.children.forEach(c => c.position.y += 0.1);
    const legParts = [[o.shortsLen ?? 1.0, o.pants], [2 - (o.shortsLen ?? 1.0) - 0.42, o.legSkin ?? skin], [0.42, o.shoe, { w: 1.08, d: 1.25, z: 0.12 }]];
    this.legL = mkLimb(0.5, 0, legParts);
    this.legR = mkLimb(-0.5, 0, legParts);
    this.root.scale.setScalar(o.scale);
    this.expr = { mouth: 'smile' }; this._exprKey = '';
    this.setExpr({});
    if (o.decorate) o.decorate(this);
    this.reset();
  }
  setExpr(e) {
    const ex = Object.assign({ mouth: 'smile' }, this.o.face || {}, e);
    if (ex.open) ex.open = Math.round(ex.open * 6) / 6;
    const k = JSON.stringify(ex);
    if (k === this._exprKey) return;
    this._exprKey = k;
    const { g, canvas } = this.faceTex.userData;
    const skinHex = '#' + new THREE.Color(this.o.skin).getHexString();
    drawFace(g, canvas.width, canvas.height, ex, skinHex);
    this.faceTex.needsUpdate = true;
  }
  reset() {
    for (const p of [this.body, this.neck, this.armL, this.armR, this.legL, this.legR, this.root]) p.rotation.set(0, 0, 0);
    this.body.position.set(0, 2, 0);
    this.root.visible = true;
  }
  place(x, y, z, ry = 0) { this.root.position.set(x, y, z); this.root.rotation.set(0, ry, 0); return this; }
  pose(p) { // p: {body:[x,y,z], bodyY, neck:[..], armL:[..], armR, legL, legR}
    const s = (obj, v) => { if (v) obj.rotation.set(v[0] || 0, v[1] || 0, v[2] || 0); };
    s(this.body, p.body); s(this.neck, p.neck); s(this.armL, p.armL); s(this.armR, p.armR); s(this.legL, p.legL); s(this.legR, p.legR);
    if (p.bodyY !== undefined) this.body.position.y = p.bodyY;
    if (p.bodyZ !== undefined) this.body.position.z = p.bodyZ;
  }
  handWorld(side = 'R', out = new THREE.Vector3()) {
    const a = side === 'R' ? this.armR : this.armL;
    this.root.updateMatrixWorld(true);
    return a.localToWorld(out.set(0, -2.0, 0.0));
  }
  headWorld(out = new THREE.Vector3()) { this.root.updateMatrixWorld(true); return this.head.localToWorld(out.set(0, 0, 0)); }
}

// ---------- poses (functions of time) ----------
const S = Math.sin, C = Math.cos, PI = Math.PI;
export const P = {
  idle: (t) => ({ body: [0, 0, 0], bodyY: 2 + S(t * 2) * 0.03, neck: [S(t * 0.7) * 0.03, S(t * 0.5) * 0.08, 0], armL: [0, 0, 0.06 + S(t * 2) * 0.02], armR: [0, 0, -0.06 - S(t * 2) * 0.02], legL: [0, 0, 0], legR: [0, 0, 0] }),
  walk: (t, sp = 1) => { const p = t * 7 * sp; return { body: [0.04, 0, 0], bodyY: 2 + Math.abs(S(p)) * 0.12, neck: [0, 0, 0], armL: [S(p) * 0.7, 0, 0.05], armR: [-S(p) * 0.7, 0, -0.05], legL: [-S(p) * 0.7, 0, 0], legR: [S(p) * 0.7, 0, 0] }; },
  run: (t, sp = 1) => { const p = t * 11 * sp; return { body: [0.25, 0, 0], bodyY: 2 + Math.abs(S(p)) * 0.3, neck: [-0.15, 0, 0], armL: [S(p) * 1.2, 0, 0.1], armR: [-S(p) * 1.2, 0, -0.1], legL: [-S(p) * 1.1, 0, 0], legR: [S(p) * 1.1, 0, 0] }; },
  dribble: (t, rate = 1) => { const p = t * 9 * rate; return { body: [0.18, 0, 0], bodyY: 1.85 + S(p) * 0.04, neck: [-0.1, 0, 0], armL: [-0.3, 0, 0.25], armR: [-0.55 - C(p) * 0.35, 0, -0.15], legL: [-0.35, 0, 0.05], legR: [0.25, 0, -0.05] }; },
  dribbleWalk: (t, rate = 1) => { const w = P.walk(t, 1.1); const d = P.dribble(t, rate); return Object.assign(w, { armR: d.armR, body: [0.15, 0, 0] }); },
  crouch: (t) => ({ body: [0.35, 0, 0], bodyY: 1.6, neck: [-0.3, 0, 0], armL: [-0.6, 0, 0.6], armR: [-0.6, 0, -0.6], legL: [-0.7, 0, 0.15], legR: [-0.7, 0, -0.15] }),
  defend: (t) => ({ body: [0.3, 0, 0], bodyY: 1.65 + S(t * 8) * 0.05, neck: [-0.25, 0, 0], armL: [-0.3, 0, 1.2 + S(t * 6) * 0.15], armR: [-0.3, 0, -1.2 - S(t * 6) * 0.15], legL: [-0.6, 0, 0.3], legR: [-0.6, 0, -0.3] }),
  shootSet: () => ({ body: [0, 0, 0], bodyY: 1.8, neck: [-0.15, 0, 0], armL: [-2.4, 0, -0.35], armR: [-2.6, 0, 0.25], legL: [-0.3, 0, 0], legR: [-0.3, 0, 0] }),
  shootRelease: () => ({ body: [-0.05, 0, 0], bodyY: 2.2, neck: [-0.25, 0, 0], armL: [-2.6, 0, -0.2], armR: [-3.05, 0, 0.1], legL: [0.1, 0, 0], legR: [0.1, 0, 0] }),
  armsUp: (t) => ({ body: [-0.05, 0, 0], bodyY: 2 + Math.abs(S(t * 8)) * 0.35, neck: [-0.2, 0, 0], armL: [-0.2, 0, 2.6 + S(t * 12) * 0.15], armR: [-0.2, 0, -2.6 - S(t * 12) * 0.15], legL: [0, 0, 0.1], legR: [0, 0, -0.1] }),
  hang: (t) => ({ body: [S(t * 4) * 0.25, 0, 0], bodyY: 2, neck: [-0.2, 0, 0], armL: [-3.1, 0, 0.2], armR: [-3.1, 0, -0.2], legL: [0.3 + S(t * 4) * 0.3, 0, 0.15], legR: [0.3 + S(t * 4 + 1) * 0.3, 0, -0.15] }),
  dunk: (u) => ({ body: [-0.2 + u * 0.5, 0, 0], bodyY: 2, neck: [-0.3, 0, 0], armL: [-2.9 + u * 1.2, 0, 0.1], armR: [-3.0 + u * 1.2, 0, -0.1], legL: [0.5, 0, 0.1], legR: [-0.6, 0, -0.1] }),
  fallBack: (u) => ({ body: [-u * 1.45, 0, 0], bodyY: 2 - u * 1.4, neck: [-u * 0.3, 0, 0], armL: [-u * 2.2, 0, 0.6 * u], armR: [-u * 2.2, 0, -0.6 * u], legL: [-u * 1.3, 0, 0.2], legR: [-u * 0.6, 0, -0.2] }),
  sitFloor: (t) => ({ body: [0, 0, 0], bodyY: 0.55, neck: [0.1 + S(t) * 0.03, 0, 0], armL: [-0.2, 0, 0.35], armR: [-0.2, 0, -0.35], legL: [-1.55, 0, 0.12], legR: [-1.55, 0, -0.12] }),
  sitChair: (t, h = 1.5) => ({ body: [0, 0, 0], bodyY: h + 0.5, neck: [0, 0, 0], armL: [-0.9, 0, 0.1], armR: [-0.9, 0, -0.1], legL: [-1.57, 0, 0.05], legR: [-1.57, 0, -0.05] }),
  talkGesture: (t) => ({ body: [0, S(t * 1.5) * 0.08, 0], bodyY: 2, neck: [S(t * 3) * 0.05, 0, 0], armL: [-0.6 + S(t * 4) * 0.25, 0, 0.3], armR: [-1.1 + S(t * 3.3) * 0.35, 0, -0.35], legL: [0, 0, 0], legR: [0, 0, 0] }),
  point: (t, side = 'R') => { const b = P.idle(t); if (side === 'R') b.armR = [-1.57, 0, 0]; else b.armL = [-1.57, 0, 0]; return b; },
  dance: (t, style = 0) => {
    const b = t * 8;
    if (style === 0) return { body: [0, S(b * 0.5) * 0.4, S(b) * 0.12], bodyY: 2 + Math.abs(S(b)) * 0.25, neck: [0, S(b * 0.5) * 0.3, S(b) * 0.2], armL: [-1.2 + S(b) * 0.9, 0, 0.6 + C(b) * 0.4], armR: [-1.2 - S(b) * 0.9, 0, -0.6 + C(b) * 0.4], legL: [S(b) * 0.4, 0, 0.12], legR: [-S(b) * 0.4, 0, -0.12] };
    if (style === 1) return { body: [0, 0, S(b * 0.5) * 0.25], bodyY: 2 + Math.abs(S(b)) * 0.2, neck: [S(b) * 0.25, 0, 0], armL: [0, 0, 2.8 + S(b) * 0.3], armR: [0, 0, -2.8 + S(b) * 0.3], legL: [S(b) * 0.3, 0, 0.1], legR: [-S(b) * 0.3, 0, -0.1] }; // raise the roof
    if (style === 2) return { body: [0.1, 0, 0], bodyY: 2 + Math.abs(S(b)) * 0.15, neck: [S(b * 2) * 0.35, 0, 0], armL: [-1.4, 0, -0.9 + S(b) * 0.2], armR: [-1.4, 0, 0.9 - S(b) * 0.2], legL: [S(b) * 0.5, 0, 0.1], legR: [0, 0, -0.1] }; // chicken
    return { body: [0, 0, S(b * 0.5) * 0.35], bodyY: 2 + S(b) * 0.12, neck: [0, 0, -S(b * 0.5) * 0.3], armL: [-0.4 + S(b), 0, 1.4], armR: [-0.4 - S(b), 0, -1.4], legL: [-S(b) * 0.6, 0, 0.3], legR: [S(b) * 0.6, 0, -0.3] }; // sprinkler-ish
  },
  pushup: (t, u) => ({ body: [PI / 2 - 0.3 + u * 0.12, 0, 0], bodyY: 1.6 - u * 0.5, neck: [-0.9, 0, 0], armL: [-(PI / 2 - 0.3) - u * 0.65, 0, 0.1], armR: [-(PI / 2 - 0.3) - u * 0.65, 0, -0.1], legL: [-0.6 + u * 0.25, 0, 0.04], legR: [-0.6 + u * 0.25, 0, -0.04] }),
  tieShoe: (t) => ({ body: [0.95, 0, 0], bodyY: 1.1, neck: [-0.4, 0, 0], armL: [-1.0 + S(t * 9) * 0.12, 0, 0.1], armR: [-1.0 - S(t * 9) * 0.12, 0, -0.1], legL: [-1.6, 0, 0.1], legR: [0.7, 0, -0.1] }),
  facepalm: (t) => { const b = P.sitChair(t, 1.2); b.armR = [-2.2, 0.0, 0.55]; b.neck = [0.35, 0, 0]; return b; },
  brush: (t) => { const d = P.dribble(t); d.armL = [-2.0, 0, -0.7 + S(t * 20) * 0.12]; d.body = [0.05, 0, 0]; d.neck = [0, 0, 0]; return d; },
  liftTiny: (t) => ({ body: [0.05, 0, S(t * 30) * 0.02], bodyY: 1.75, neck: [0.1, 0, S(t * 25) * 0.04], armL: [0, 0, 0.1], armR: [-0.3 - (0.5 + 0.5 * S(t * 3)) * 0.7 + S(t * 40) * 0.05, 0, -0.1], legL: [-0.35, 0, 0.25], legR: [-0.35, 0, -0.25] }),
  headspin: (t) => ({ body: [PI, t * 14, 0], bodyY: 3.6, neck: [0, 0, 0], armL: [0, 0, 0.7], armR: [0, 0, -0.7], legL: [0, 0, 0.55 + S(t * 6) * 0.2], legR: [0, 0, -0.55 - S(t * 6) * 0.2] }),
};
export function lerpPose(a, b, u) {
  const out = {};
  for (const k of Object.keys(a)) {
    if (Array.isArray(a[k])) out[k] = a[k].map((v, i) => v + ((b[k] || a[k])[i] - v) * u);
    else out[k] = a[k] + ((b[k] ?? a[k]) - a[k]) * u;
  }
  return out;
}

// ---------- ball ----------
export function makeBall(r = 0.55) {
  const t = canvasTex(512, 256, (g, W, H) => {
    g.fillStyle = '#e8711c'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#2a1206'; g.lineWidth = 6;
    g.beginPath(); g.moveTo(0, H / 2); g.lineTo(W, H / 2); g.stroke();
    for (const x of [W * 0.25, W * 0.75]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (const x of [0, W * 0.5, W]) { g.beginPath(); g.ellipse(x, H / 2, W * 0.12, H * 0.5, 0, 0, PI * 2); g.stroke(); }
  });
  const m = sph(r, new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), null, 32);
  return m;
}
export const ease = {
  io: (u) => u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2,
  out: (u) => 1 - Math.pow(1 - u, 3),
  in: (u) => u * u * u,
  back: (u) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};
export const clamp01 = (x) => Math.max(0, Math.min(1, x));
export const seg = (t, a, b) => clamp01((t - a) / (b - a));
export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export function arc(p0, p1, h, u) { // parabolic arc between points
  const v = p0.clone().lerp(p1, u); v.y += 4 * h * u * (1 - u); return v;
}
