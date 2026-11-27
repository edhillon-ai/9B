import { THREE, scene, box, cyl, sph, mat, canvasTex, textPlane } from './core.js';
import { LOC, W, cookie } from './world.js';
LOC.gwin = new THREE.Vector3(1200, 0, 0);
const add = (p, o, x, y, z) => { o.position.set(x, y, z); p.add(o); return o; };
export function buildExtras3() {
  // recolor the sports car yellow (supercar)
  // bakery front wall with a big window (z = +9)
  const B = W.bakery;
  add(B, box(14, 12, 0.5, 0xf2c89a), -11, 6, 9); add(B, box(14, 12, 0.5, 0xf2c89a), 11, 6, 9);
  add(B, box(8, 3.2, 0.5, 0xf2c89a), 0, 1.6, 9); add(B, box(8, 3.0, 0.5, 0xf2c89a), 0, 10.5, 9);
  add(B, box(8.4, 0.35, 0.9, 0x7a3e1d), 0, 3.3, 9.2); add(B, box(0.25, 6, 0.6, 0x7a3e1d), 0, 6.1, 9);
  add(B, box(18, 1.4, 3, 0xd62d2d), 0, 12.2, 10.4);
  for (let i = 0; i < 9; i++) add(B, box(2, 1.0, 0.1, i % 2 ? 0xffffff : 0xd62d2d), -8 + i * 2, 11.2, 11.9);
  // grandma's table + cookie mountain
  W.gtable = new THREE.Group(); add(W.gtable, cyl(2.6, 2.6, 0.3, 0xf5e6c8, 32), 0, 3.0, 0); add(W.gtable, cyl(0.3, 0.3, 3, 0x8a5a33), 0, 1.5, 0); add(W.gtable, cyl(1.2, 1.2, 0.2, 0x8a5a33), 0, 0.1, 0);
  W.gtable.position.set(LOC.bakery.x - 1, 0.12, 4.2); scene.add(W.gtable);
  W.cookiePile = new THREE.Group(); let n = 0;
  for (let lay = 0; lay < 6; lay++) { const r = 1.9 - lay * 0.3; const cnt = Math.max(1, Math.round(8 - lay * 1.2)); for (let i = 0; i < cnt; i++) { const ck = cookie(); const a = i / cnt * Math.PI * 2 + lay; ck.position.set(Math.cos(a) * r * 0.7, 3.25 + lay * 0.22, Math.sin(a) * r * 0.7); ck.rotation.set((i % 3) * 0.2, a, (lay % 2) * 0.25); W.cookiePile.add(ck); n++; } }
  W.cookiePile.position.set(LOC.bakery.x - 1, 0.12, 4.2); scene.add(W.cookiePile);
  W.chairB = new THREE.Group(); add(W.chairB, box(2.2, 0.3, 2.2, 0x8a5a33), 0, 1.8, 0); add(W.chairB, box(2.2, 2.6, 0.3, 0x8a5a33), 0, 3.1, -1.0); for (const [x, z] of [[0.9, 0.9], [-0.9, 0.9], [0.9, -0.9], [-0.9, -0.9]]) add(W.chairB, box(0.2, 1.8, 0.2, 0x6a4020), x, 0.9, z);
  W.chairB.position.set(LOC.bakery.x - 1, 0.12, 0.6); scene.add(W.chairB);
  // mystery package (big) with flaps
  W.mpkg = new THREE.Group(); add(W.mpkg, box(2.4, 1.8, 1.8, 0xc8955a), 0, 0.9, 0); add(W.mpkg, box(2.42, 0.25, 1.82, 0xe8d6a8), 0, 0.9, 0);
  const q = textPlane('?', 1.2, 1.2, { bg: '#c8955a', fg: '#3a2210', font: '900 700px Inter' }); add(W.mpkg, q, 0, 0.95, 0.91);
  W.flapL = new THREE.Group(); W.flapL.position.set(-1.2, 1.8, 0); add(W.flapL, box(1.2, 0.08, 1.8, 0xb8854a), 0.6, 0, 0); W.mpkg.add(W.flapL);
  W.flapR = new THREE.Group(); W.flapR.position.set(1.2, 1.8, 0); add(W.flapR, box(1.2, 0.08, 1.8, 0xb8854a), -0.6, 0, 0); W.mpkg.add(W.flapR);
  W.pkgCookies = new THREE.Group(); for (let i = 0; i < 14; i++) { const ck = cookie(); ck.scale.setScalar(0.9); ck.position.set(-0.8 + (i % 5) * 0.4, 1.7 + Math.floor(i / 5) * 0.12, -0.5 + (i % 3) * 0.45); ck.rotation.set(0.3 * (i % 2), i, 0.2); W.pkgCookies.add(ck); } W.mpkg.add(W.pkgCookies);
  scene.add(W.mpkg);
  W.glow = new THREE.PointLight(0xffd36b, 0, 12, 1.5); scene.add(W.glow);
  // grandma's window facade (yellow house, matching town house)
  const Gw = new THREE.Group(); Gw.position.copy(LOC.gwin); scene.add(Gw); W.gwinG = Gw;
  const yw = 0xfff176;
  add(Gw, box(10, 14, 0.6, yw), -9, 7, 0); add(Gw, box(10, 14, 0.6, yw), 9, 7, 0); add(Gw, box(8, 3.5, 0.6, yw), 0, 1.75, 0); add(Gw, box(8, 5.5, 0.6, yw), 0, 11.25, 0);
  add(Gw, box(8.6, 0.4, 1.2, 0xffffff), 0, 3.6, 0.3); add(Gw, box(8.6, 0.4, 0.8, 0xffffff), 0, 8.6, 0.2); add(Gw, box(0.4, 5.4, 0.8, 0xffffff), -4.2, 6.1, 0.2); add(Gw, box(0.4, 5.4, 0.8, 0xffffff), 4.2, 6.1, 0.2);
  add(Gw, box(20, 14, 0.4, 0x5a3a5a), 0, 7, -8); add(Gw, box(20, 0.3, 8, 0x8a5a33), 0, 0.15, -4); add(Gw, box(0.4, 14, 8, 0x6a4a6a), -9.8, 7, -4); add(Gw, box(0.4, 14, 8, 0x6a4a6a), 9.8, 7, -4); add(Gw, box(20, 0.4, 8, 0x4a2a4a), 0, 14, -4);
  const pic = textPlane('♥', 2.4, 2.4, { bg: '#ffe0f0', fg: '#d62d6a', font: '900 600px Inter', border: '#8a5a33' }); add(Gw, pic, -3.5, 9.5, -7.7);
  W.gwinLight = new THREE.PointLight(0xffd8a0, 0, 20, 1.3); W.gwinLight.position.set(LOC.gwin.x, 9, -3); scene.add(W.gwinLight);
  const cm = new THREE.MeshStandardMaterial({ color: 0xc0303a, roughness: 0.8, side: THREE.DoubleSide });
  W.curL = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.4, 8, 1), cm); W.curR = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 5.4, 8, 1), cm);
  for (const c of [W.curL, W.curR]) { const p = c.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 4) * 0.12); c.geometry.computeVertexNormals(); c.castShadow = true; Gw.add(c); }
  add(Gw, box(9, 0.25, 0.25, 0x8a5a33), 0, 8.95, -0.5);
  add(Gw, box(30, 0.2, 12, 0x74c25a), 0, 0.05, 6);
  // briefcase + giant check
  W.brief = new THREE.Group(); add(W.brief, box(2.4, 1.7, 0.5, 0x2a2a2a, { metalness: 0.5, roughness: 0.3 }), 0, 0, 0); add(W.brief, box(0.9, 0.18, 0.18, 0x111111), 0, 0.95, 0);
  W.money = new THREE.Group(); for (let i = 0; i < 6; i++) add(W.money, box(0.95, 0.12, 0.4, 0x3ca24a), -0.55 + (i % 2) * 1.1, 0.88 + Math.floor(i / 2) * 0.13, 0); W.brief.add(W.money);
  W.briefLid = new THREE.Group(); W.briefLid.position.set(0, 0.85, -0.25); add(W.briefLid, box(2.4, 0.08, 0.5, 0x2a2a2a), 0, 0, 0.25); W.brief.add(W.briefLid);
  scene.add(W.brief);
  W.check = textPlane('$1,000,000', 7, 3, { bg: '#e9ffe9', fg: '#1a7f3a', font: '900 190px Inter', border: '#1a7f3a' }); scene.add(W.check);
  return W;
}
