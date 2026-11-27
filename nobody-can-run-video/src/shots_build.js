function build() {
  const e0 = (n) => E[n][0], e1 = (n) => E[n][1];
  const morning = () => lights({ sky: 0xbfe6ff, sunColor: 0xfff0d0, sun: 2.4, hemi: 1.15 });
  const sunset = () => lights({ sky: 0xffb784, sunColor: 0xffb070, sun: 2.2, hemi: 1.05, hemiSky: 0xffd8b0, hemiGround: 0x7a6a4a });
  const rel = (ch, x, y, z) => { ch.root.updateMatrixWorld(true); return ch.root.localToWorld(V(x, y, z)); };
  const dutch = (a) => camera.rotateZ(a);
  const shake = (t, a = 0.15, f = 60) => { camera.position.x += S(t * f) * a; camera.position.y += S(t * f * 1.3) * a; };
  const AB = (on = true) => { C.alex.headband.visible = on; };
  const camAt = (p, l, fov, up = [0, 1, 0]) => { camera.position.copy(p); camera.up.set(...up); camera.lookAt(l); camera.fov = fov; camera.updateProjectionMatrix(); };
  const headCam = (ch, off, fov = 40, look = [0, 0, 0]) => { const h = ch.headWorld(); const ry = ch.root.rotation.y; const f = V(S(ry), 0, Cc(ry)), r = V(Cc(ry), 0, -S(ry)); const at = (o) => h.clone().add(r.clone().multiplyScalar(o[0])).add(V(0, o[1], 0)).add(f.clone().multiplyScalar(o[2])); camAt(at(off), at(look), fov); };
  function drive(ch, car, pos, ry, t, expr) { car.visible = true; car.position.copy(pos); car.rotation.y = ry;
    put(ch, 'town', 0, 0, 0, ry + PI / 2, P.sitChair(t, 1.4), expr); ch.root.position.copy(pos).add(V(-1.4 * Cc(ry), 0, 1.4 * S(ry))); ch.body.position.y = 2.0;
    ch.pose({ armL: [-1.2, 0, 0.1], armR: [-1.2, 0, -0.1] }); }
  const gymL = () => { interior({ sun: 1.2, hemi: 1.05, hemiSky: 0xfff6ec }); sunAt('wgym', 0, 0); W.wgymLight.intensity = 320; };
  const tread = (T, sp = 1) => { W.beltTex.offset.y = -T * 3 * sp; };
  const TX = -8, TZ = -5.6, TY = 0.9;
  W.mats.visible = false; W.houses[14].visible = false;
  C.mailman.capParts = C.mailman.head.children.filter(c => (Math.abs(c.position.y - 0.62) < 0.01 && Math.abs(c.position.z) < 0.01) || (Math.abs(c.position.y - 0.5) < 0.01 && c.position.z > 0.7) || (Math.abs(c.position.y - 0.68) < 0.01 && c.position.z > 0.3));
  const RD = 0.1, SW = flr.town; // road / sidewalk heights
  const walkPose = (t, sp, extra) => Object.assign(P.walk(t, sp), extra || {});
  const sprint = (t, sp = 2.4) => Object.assign(P.run(t, sp), { body: [0.45, 0, 0], neck: [-0.35, 0, 0] });
  const puffs = (ch, t, back = 1) => { W.dpuff.visible = true; const p0 = ch.root.position; const ry = ch.root.rotation.y; const bx = -S(ry), bz = -Cc(ry); W.dpuff.children.forEach((p) => { const u = p.userData; const k = (t * 3 + u.s) % 1; p.position.set(p0.x + bx * (1 + k * 5 * back) + Cc(u.a) * 0.6, 0.5 + k * 1.2, p0.z + bz * (1 + k * 5 * back) + S(u.a) * 0.6); p.scale.setScalar(0.5 + k * 1.3); }); };
  // background townsfolk on the town street (everyone strolls, nobody runs)
  const folk = (T, cx, mode = 'stroll', skip = []) => {
    [[-16, -7, 1], [-7, 7, -1], [5, -7, -1], [13, 7, 1], [22, -6.6, 1], [-25, 6.8, -1]].forEach(([dx, z, dir], i) => { if (skip.includes(i)) return; const ch = crowd[6 + i % 6];
      const x = cx + dx + dir * ((T * 0.7) % 8);
      if (mode === 'panic') put(ch, 'town', x, SW + Math.abs(S(T * 9 + i)) * 0.8, z, face(x, z, cx, 0) + PI, Q.panic(T + i), { mouth: 'flat', eyeScale: 1.6, brow: -0.6 });
      else if (i === 1) put(ch, 'town', x, SW, z, dir > 0 ? PI / 2 : -PI / 2, walkPose(T, 0.45, { armL: [S(T * 3.2) * 1.4, 0, 0.1], armR: [-S(T * 3.2) * 1.4, 0, -0.1], body: [0.1, 0, 0] }), { mouth: 'grit', brow: 0.6 }); // intense power-walker
      else if (i === 3) { put(ch, 'town', cx + dx, SW, z, 0.4, lerpPose(P.idle(T), { armR: [-2.3, 0, 0.5], neck: [0.3, 0, 0] }, 1), { mouth: 'smile', look: [0, -0.5] }); } // on phone
      else put(ch, 'town', x, SW, z, dir > 0 ? PI / 2 : -PI / 2, P.walk(T + i * 0.4, 0.35), { mouth: 'smile' });
    }); };
  // ================= SCENE 1: nobody runs =================
  const RX0 = -14, RV = 1.3; const rx = (T) => RX0 + T * RV; // robber x
  const robber = (T, expr, pose) => { put(C.robber, 'town', rx(T), RD, 0.8, PI / 2, pose || P.walk(T, 0.4), expr || { mouth: 'smirk', lid: 0.4 }); };
  const cop = (T, expr, pose) => { put(C.police, 'town', rx(T) - 6.5, RD, 0.2, PI / 2, pose || P.walk(T, 0.4), expr || { mouth: 'grit', brow: 0.7 }); };
  shot(0, (t, T, d, ov) => { // wide establishing: a slow chase down the colorful street
    day(); sunAt('town', 0, 0); robber(T); cop(T); folk(T, -6);
    const u = ease.io(t / d); camAt(V(-36 + u * 10, 24 - u * 10, 9 - u * 2), V(rx(T) - 2, 2, 0), 44);
  });
  shot(() => e0('n1b'), (t, T, d, ov) => { // side tracking: police "chasing" the robber
    day(); sunAt('town', rx(T), 0); robber(T); cop(T); folk(T, rx(T));
    camAt(V(rx(T) - 3, 3.2, 12.5), V(rx(T) - 3.4, 3.4, 0), 44);
  });
  shot(() => e0('p_stop') - 0.05, (t, T, d, ov) => { // STOP RIGHT THERE!
    day(); sunAt('town', rx(T), 0); robber(T); cop(T, { mouth: 'shout', brow: 0.9, eyeScale: 1.2 }, walkPose(T, 0.4, { armR: [-1.57 + S(T * 6) * 0.1, 0, 0], neck: [-0.1, 0, 0] })); talk(C.police, 'p_stop', T);
    const z = ease.out(seg(t, 0, 0.2)); headCam(C.police, [1.0, 0.0, 3.4 - z * 0.9], 42, [0, -0.3, 0]); shake(t, 0.02);
  });
  shot(() => e0('r_nah') - 0.12, (t, T, d, ov) => { // Nah.
    day(); sunAt('town', rx(T), 0); cop(T); robber(T, { mouth: 'flat', lid: 0.5, look: [-0.3, 0] }, walkPose(T, 0.4, { neck: [0, 0.9 * ease.out(seg(t, 0, 0.3)), 0] })); talk(C.robber, 'r_nah', T);
    headCam(C.robber, [2.0, 0.1, 2.6], 40, [0, -0.2, 0]);
  });
  shot(() => e0('same'), (t, T, d, ov) => { // both walking at exactly the same speed
    day(); sunAt('town', rx(T), 0); robber(T); cop(T); folk(T, rx(T), 'stroll', [0, 4]);
    // a snail-paced jogger passes them going the other way
    put(crowd[0], 'town', rx(T) + 14 - t * 1.5, RD, -2.6, -PI / 2, P.walk(T, 0.35), { mouth: 'smile' });
    if (t < d * 0.55) { const u = t / (d * 0.55); camAt(V(rx(T) + 9, 1.6, 6 - u * 2), V(rx(T) - 3, 3.6, 0.5), 46); }
    else { const u = ease.io(seg(t, d * 0.55, d)); camAt(V(rx(T) - 3.3, 24 - u * 3, 0.5), V(rx(T) - 3.3, 0, 0.5), 46, [1, 0, 0]); }
  });
  shot(() => e0('stare'), (t, T, d, ov) => { // Alex stares at the camera in confusion
    day(); sunAt('town', -1, 0); robber(T); cop(T);
    const tn = ease.io(seg(t, 0.2, 0.7));
    put(C.alex, 'town', -1, SW, 6.6, -PI / 2 + tn * PI / 2, lerpPose(P.idle(t), { neck: [0, 0, 0.18 * tn] }, 1), { mouth: 'wavy', eyeScale: 1 + tn * 0.35, brow: -0.4 * tn, look: [0, 0] });
    const z = ease.io(seg(t, 0.6, d)); camAt(V(-1, 5.0, 14), V(-1, 4.6, 4), 34 - z * 12);
  });
  // ================= SCENE 2: the race =================
  const SX = -42; // start line (town x)
  const racers = () => [[C.alex, 1.2], [C.grandma, -1.2], [C.jake, 3.4], [C.baker, -3.4], [C.police, -2.3, 1], [C.robber, 2.3, 1], [C.customer, 0, 1], [C.mailman, 4.0, 1], [crowd[0], -4, 2], [crowd[1], -1.3, 2], [crowd[2], 1.3, 2], [crowd[3], 4, 2]];
  const lineUp = (T, prog, o = {}) => racers().forEach(([ch, z, row = 0], i) => { if (o.skip && o.skip.includes(ch)) return;
    const x = SX - row * 3 + prog(i); const moving = o.moving; const pose = moving ? walkPose(T + i * 0.3, 0.22, { body: [0.2, 0, 0], armL: [S((T + i) * 1.5) * 1.1, 0, 0.1], armR: [-S((T + i) * 1.5) * 1.1, 0, -0.1] }) : (o.crouch ? P.crouch(T) : P.idle(T + i));
    put(ch, 'town', x, RD, z, PI / 2, pose, o.expr ? o.expr(ch) : { mouth: moving ? 'grit' : 'smile', brow: moving ? 0.8 : 0, sweat: moving && i % 2 === 0 }); if (ch === C.alex) AB(false); });
  const raceSet = () => { W.startB.visible = true; W.finishB.visible = true; W.tapeL.visible = true; W.tapeR.visible = true; W.tapeL.position.copy(L('town', 20, 3.2, -2.3)); W.tapeR.position.copy(L('town', 20, 3.2, 2.3)); };
  const mayorStart = (t, expr, pose) => put(C.mayor, 'town', SX + 4, SW, -6.8, -0.5, pose || P.talkGesture(t), expr || { mouth: 'smile', brow: 0.3 });
  shot(() => E.stare[1], (t, T, d, ov) => { // mayor announces the race
    day(); sunAt('town', SX, 0); raceSet(); mayorStart(t, { mouth: 'grin', brow: 0.4 }, lerpPose(P.idle(t), { armL: [0, 0, 2.5], armR: [0, 0, -2.5] }, 1));
    lineUp(T, (i) => -10 + Math.min(10, t * 4 + i * 0.6));
    const u = ease.io(t / d); camAt(V(SX + 15 - u * 3, 2.0 + u * 3, -2), V(SX + 1, 7, -1), 50);
  });
  shot(() => e0('gather'), (t, T, d, ov) => { // the whole town at the starting line
    day(); sunAt('town', SX, 0); raceSet(); mayorStart(t, { mouth: 'grin' }, P.idle(t)); lineUp(T, () => 0, { crouch: true }); folk(T, SX, 'stroll', [0, 1, 2]);
    const u = ease.io(t / d); camAt(V(SX + 16 - u * 4, 6 - u * 1.5, 2), V(SX - 2, 3, 0), 46);
  });
  shot(() => e0('whistle'), (t, T, d, ov) => { // mayor blows the whistle
    day(); sunAt('town', SX, 0); raceSet(); mayorStart(t, { mouth: 'flat', eyeOpen: 0.15, brow: 0.8 }, lerpPose(P.idle(t), { armR: [-2.6, 0, 0.6], neck: [-0.15, 0, 0] }, 1)); lineUp(T, () => 0, { crouch: true });
    W.whistle.visible = true; W.whistle.position.copy(rel(C.mayor, 0, 4.55, 0.75)); W.whistle.rotation.y = C.mayor.root.rotation.y;
    const z = ease.out(seg(t, 0, 0.25)); headCam(C.mayor, [0.6, 0.2, 4.2 - z * 0.8], 40, [0, -0.3, 0]); if (t > 0.15 && t < 0.3) ov.flash(0.4); shake(t, t > 0.15 ? 0.04 : 0);
  });
  const slowX = (T) => (T - e0('slow')) * 0.55; // racers creep forward
  shot(() => e0('slow'), (t, T, d, ov) => { // everyone starts walking extremely slowly (intense!)
    day(); sunAt('town', SX, 0); raceSet(); mayorStart(t, { mouth: 'flat', eyeScale: 1.2 }, P.idle(t)); lineUp(T, (i) => slowX(T) - (i % 3) * 0.3, { moving: true });
    if (t < d * 0.5) camAt(V(SX + 7 + slowX(T), 1.0, 2.5), V(SX + slowX(T), 4.2, 0), 52); else { camAt(V(SX + 5 + slowX(T), 0.6, -4), V(SX + slowX(T), 1.2, -1), 40); }
  });
  shot(() => e0('a_retire') - 0.05, (t, T, d, ov) => { // BRO, IS THIS A RETIREMENT HOME?
    day(); sunAt('town', SX, 0); raceSet(); lineUp(T, (i) => slowX(T) - (i % 3) * 0.3, { moving: true, skip: [C.alex] });
    put(C.alex, 'town', SX + slowX(T) + 1.2, RD, 1.2, PI / 2 + 0.9, lerpPose(P.idle(t), { armL: [-0.7, 0, 0.9], armR: [-0.7, 0, -0.9] }, 1), { mouth: 'shout', brow: -0.5, eyeScale: 1.4 }); AB(false); talk(C.alex, 'a_retire', T);
    const z = ease.out(seg(t, 0, 0.2)); headCam(C.alex, [0.4, 0.3, 3.2 - z * 0.7], 44, [0, -0.4, 0]); shake(t, 0.02);
  });
  shot(() => e0('g_mouth') - 0.05, (t, T, d, ov) => { // watch your mouth, yo
    day(); sunAt('town', SX, 0); raceSet(); lineUp(T, (i) => slowX(T) - (i % 3) * 0.3, { moving: true, skip: [C.alex], expr: (ch) => ch === C.grandma ? { mouth: 'smirk', lid: 0.35, brow: 0.7, look: [0.5, 0] } : { mouth: 'grit', brow: 0.8 } });
    C.grandma.pose({ neck: [0, -0.5, 0] }); talk(C.grandma, 'g_mouth', T);
    put(C.alex, 'town', SX + slowX(T) + 1.2, RD, 1.2, PI / 2 + 0.9, P.idle(t), { mouth: 'flat' }); AB(false);
    headCam(C.grandma, [-1.4, 0.2, 3.0], 40, [0, -0.2, 0]);
  });
  shot(() => e0('win'), (t, T, d, ov) => { // Alex casually walks past everyone and wins
    day(); raceSet();
    if (t < d * 0.42) { sunAt('town', SX, 0); lineUp(T, (i) => slowX(T) - (i % 3) * 0.3, { moving: true, skip: [C.alex] }); const ax = SX + slowX(T) - 2 + t * 5.5;
      put(C.alex, 'town', ax, RD, 0.2, PI / 2, P.walk(t, 1.0), { mouth: 'smile', lid: 0.3 }); AB(false); camAt(V(ax - 8, 8, 9), V(ax + 3, 3, 0), 48); }
    else { sunAt('town', 20, 0); const k = t - d * 0.42; const ax = 16 + k * 4; const broke = ax > 19.6;
      put(C.alex, 'town', ax, RD, 0.2, PI / 2, broke ? lerpPose(P.walk(k, 1), { armL: [0, 0, 2.6], armR: [0, 0, -2.6] }, 1) : P.walk(k, 1), { mouth: broke ? 'grin' : 'smile', lid: broke ? 0 : 0.3, eyeScale: broke ? 1.2 : 1 }); AB(false);
      if (broke) { const s2 = ease.out(seg(ax, 19.6, 21)); W.tapeL.position.copy(L('town', 20 + s2 * 0.6, 3.2 - s2 * 2.6, -2.6 - s2 * 1.4)); W.tapeR.position.copy(L('town', 20 + s2 * 0.6, 3.2 - s2 * 2.6, 2.6 + s2 * 1.4)); W.tapeL.rotation.x = -s2; W.tapeR.rotation.x = s2;
        W.streetConf.visible = true; W.streetConf.position.copy(L('town', 20, 0, 0)); W.streetConf.update(T); }
      lineUp(T, (i) => slowX(T) - (i % 3) * 0.3 + 34, { moving: true, skip: [C.alex] });
      camAt(V(27, 3.8, 9), V(18, 4.2, 0), 46); }
  });
  // ================= SCENE 3: the grind =================
  shot(() => E.win[1], (t, T, d, ov) => { // Alex ties his headband: dramatic zoom
    morning(); sunAt('lawn', 0, 0);
    const tie = t < 1.4; put(C.alex, 'lawn', 0, 0.03, 0, 0.2, tie ? lerpPose(P.idle(t), { armL: [-3.0, 0, -0.35 + S(t * 14) * 0.1], armR: [-3.0, 0, 0.35 - S(t * 14) * 0.1] }, 1) : P.idle(t), { mouth: tie ? 'flat' : 'grit', brow: 0.8, lid: 0.25 }); AB(true);
    if (t < 1.6) { const z = ease.in(seg(t, 0, 1.6)); headCam(C.alex, [0, 0.2, 6 - z * 3.5], 40, [0, -0.3, 0]); if (t > 1.45) ov.flash(0.3 * seg(t, 1.45, 1.6)); }
    else { const k = t - 1.6, a = k * 3.2; put(C.alex, 'lawn', -6 + Cc(a) * 7, 0.03, -4 + S(a) * 5, -a, sprint(k, 2.2), { mouth: 'grit', brow: 1, sweat: true }); AB(true); puffs(C.alex, k); cam('lawn', [-6, 13, 9], [-6, 1, -4], 52); }
  });
  shot(() => e0('h1') - 0.1, (t, T, d, ov) => { // HUSS: treadmill
    gymL(); tread(T, 2.5); put(C.alex, 'wgym', TX, TY, TZ, PI, P.run(t, 2.2), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h1', T);
    cam('wgym', [TX - 2, 1.4, TZ - 5.5], [TX, 4.5, TZ], 54); dutch(0.22); shake(t, 0.06 * hussU(T, ['h1'])); if (t > 0.08 && t < 0.15) ov.flash(0.25);
  });
  shot(() => e0('h2') - 0.06, (t, T, d, ov) => { // HUSS: barbell overhead
    gymL(); const u = clamp01(t / 0.3); put(C.alex, 'wgym', 8, 0.1, 6, 0, Object.assign(Q.squat(t, 0.4 * (1 - u)), { armL: [-PI + 0.15 - (1 - u) * 1.2, 0, 0.35], armR: [-PI + 0.15 - (1 - u) * 1.2, 0, -0.35] }), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h2', T);
    W.barbell.visible = true; const a = C.alex.handWorld('L'), b = C.alex.handWorld('R'); W.barbell.position.copy(a.add(b).multiplyScalar(0.5));
    cam('wgym', [7.2, 0.5, 12], [8, 7, 6], 60); dutch(-0.15); if (t > 0.25 && t < 0.32) ov.flash(0.35);
  });
  shot(() => e0('h3') - 0.06, (t, T, d, ov) => { // HUSS: sprinting around the yard, low angle
    morning(); sunAt('lawn', 0, 0); const a = 1.2 + t * 3.2; put(C.alex, 'lawn', -6 + Cc(a) * 7, 0.03, -4 + S(a) * 5, -a, sprint(t, 2.4), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h3', T); puffs(C.alex, t);
    const p = C.alex.root.position; camAt(V(p.x + S(-a) * 5, 0.8, p.z + Cc(-a) * 5), V(p.x, 4, p.z), 54); dutch(0.25); shake(t, 0.05);
  });
  shot(() => e0('a_btw') - 0.15, (t, T, d, ov) => { // while they're out partying, by the way
    gymL(); tread(T, 0.9); put(C.alex, 'wgym', TX, TY, TZ, PI, Object.assign(P.run(t, 0.9), { neck: [0, -0.7, 0] }), { mouth: 'flat', lid: 0.3, sweat: true }); AB(); talk(C.alex, 'a_btw', T);
    cam('wgym', [TX + 3.6, 5.6, TZ + 3.4], [TX, 5.2, TZ], 40);
  });
  shot(() => e0('party'), (t, T, d, ov) => { // Jake partying with the mayor
    partyL(T); put(C.jake, 'party', -2, 0.12, 0, 0.3, P.dance(T, 0), { mouth: 'grin', eyeScale: 1.1 }); put(C.mayor, 'party', 2.2, 0.12, 0.3, -0.3, P.dance(T + 0.4, 2), { mouth: 'grin', brow: 0.4 });
    [[-7, -4], [6, -5], [-9, 3], [9, 2]].forEach(([x, z], i) => put(teens[i + 1], 'party', x, 0.12, z, face(x, z, 0, 8) * 0.5, P.dance(T + i * 0.6, (i + 1) % 4), { mouth: 'grin' }));
    const u = ease.io(t / d); cam('party', mix([2, 5, 14], [0.5, 5.5, 10], u), [0, 4.5, 0], 50);
  });
  const BX = TX, BZ = TZ + 8.5; // laundry basket spot (gym local)
  const basketAt = () => { W.basket.visible = true; W.basket.position.copy(L('wgym', BX, 0.1, BZ)); };
  shot(() => e0('fly'), (t, T, d, ov) => { // cranks the speed, flies backwards into the laundry basket
    gymL(); basketAt(); const push = t < 0.35, k = seg(t, 0.75, 1.25), land = t >= 1.25; tread(T, t < 0.35 ? 1 : 1 + (t - 0.35) * 25);
    if (push) put(C.alex, 'wgym', TX, TY, TZ, PI, Object.assign(P.run(t, 1), { armR: [-1.6, 0, 0.2] }), { mouth: 'grin', brow: 0.8 });
    else if (k <= 0) put(C.alex, 'wgym', TX, TY, TZ, PI, P.run(t, 6), { mouth: 'grit', eyeScale: 1.7, brow: -0.6, sweat: true });
    else if (!land) { const p = arc(L('wgym', TX, TY, TZ), L('wgym', BX, 0.3, BZ), 4.5, k); put(C.alex, 'wgym', 0, 0, 0, PI, P.fallBack(1), { mouth: 'flat', eyeScale: 1.7 }); C.alex.root.position.copy(p); C.alex.root.rotation.x = -k * 3; }
    else { put(C.alex, 'wgym', BX, -1.2, BZ, PI - 0.3, Object.assign(P.fallBack(0.4), { legL: [-2.6, 0, 0.3], legR: [-2.4, 0, -0.3] }), { mouth: 'flat', eyeScale: 1.4 }); }
    AB(); if (land) { W.socks.visible = true; W.socks.children.forEach((c) => { const u = c.userData; const kk = t - 1.25; c.position.copy(L('wgym', BX + Cc(u.a) * kk * 2, 2.6 + u.v * kk - 9 * kk * kk, BZ + S(u.a) * kk * 2)); c.rotation.set(kk * 9 * u.s, kk * 5, 0); }); if (t < 1.4) shake(t, 0.1); }
    if (t < 0.4) { cam('wgym', [TX + 2.5, 3.2, TZ - 4], [TX + 0.6, 3.6, TZ - 1.5], 44); if (t > 0.22 && t < 0.3) ov.flash(0.2); }
    else cam('wgym', [TX + 11, 4.5, TZ + 4], [TX, 3, TZ + 4.5], 50);
  });
  const sockHat = () => { W.socks.visible = true; W.socks.children.forEach((c, i) => c.visible = i === 0); const h = C.alex.headWorld(); W.socks.children[0].position.copy(h.clone().add(V(0.1, 0.75, 0))); W.socks.children[0].rotation.set(0, 0.4, 0.3); };
  shot(() => e0('a_part'), (t, T, d, ov) => { // that was part of the workout
    gymL(); basketAt(); tread(T, 8); put(C.alex, 'wgym', BX, -0.7, BZ, PI - 0.3, Object.assign(P.idle(t), { legL: [-2.6, 0, 0.3], legR: [-2.4, 0, -0.3], armL: [0, 0, 1.2], armR: [0, 0, -1.2] }), { mouth: 'flat', lid: 0.45, brow: -0.2 }); AB(); sockHat(); talk(C.alex, 'a_part', T);
    headCam(C.alex, [0.3, 0.4, 3.4], 42, [0, -0.6, 0]);
  });
  // ================= SCENE 4: the mailman =================
  const MX = (T) => -8 + (T - e0('n4')) * 0.35; // mailman creeping along north sidewalk
  const mailCarry = (T, expr, x) => { const mx = x ?? MX(T); put(C.mailman, 'town', mx, SW, -6.8, PI / 2, walkPose(T, 0.22, { armL: [-1.3, 0, 0.25], armR: [-1.3, 0, -0.25] }), expr || { mouth: 'smile', lid: 0.3 });
    W.mpkg.visible = true; W.mpkg.scale.setScalar(0.55); W.pkgCookies.visible = false; W.mpkg.position.copy(rel(C.mailman, 0, 2.2, 1.7)); W.mpkg.rotation.y = PI / 2;
    W.cobweb.visible = true; W.cobweb.position.copy(W.mpkg.position).add(V(0.4, 1.05, 0)); };
  shot(() => E.s3x[1], (t, T, d, ov) => { // mailman slowly delivering a package
    day(); sunAt('town', 0, -6); mailCarry(T); folk(T, 0, 'stroll', [2]);
    const u = ease.io(t / d); camAt(V(MX(T) + 10 - u * 2, 5 - u, 4), V(MX(T), 3.5, -6.8), 46);
  });
  shot(() => e0('slowmail'), (t, T, d, ov) => { // a snail-slow close: Alex walks up beside him
    day(); sunAt('town', 0, -6); mailCarry(T);
    put(C.alex, 'town', MX(T) - 4 + Math.min(t, 1.2) * 3.2, SW, -5.0, PI / 2, t < 1.2 ? P.walk(t) : P.idle(t), { mouth: 'flat', brow: 0.3 }); AB(false);
    camAt(V(MX(T) + 7, 3.6, -2), V(MX(T) - 1, 3.6, -6), 44);
  });
  shot(() => e0('a_run') - 0.05, (t, T, d, ov) => { // why don't you just run?
    day(); sunAt('town', 0, -6); mailCarry(T); put(C.alex, 'town', MX(T) + 0.4, SW, -3.4, face(0, -3.4, 0, -6.8) + 0.6, P.talkGesture(t), { mouth: 'smile', brow: 0.4 }); AB(false); talk(C.alex, 'a_run', T);
    headCam(C.alex, [0.6, 0.6, 3.4], 42, [0, -0.5, 0]);
  });
  shot(() => e0('m_2014') - 0.1, (t, T, d, ov) => { // this package was supposed to arrive in 2014
    day(); sunAt('town', 0, -6); mailCarry(T, { mouth: 'smile', lid: 0.2, brow: 0.4 }); C.mailman.pose({ neck: [0, -0.5, 0] }); talk(C.mailman, 'm_2014', T);
    put(C.alex, 'town', MX(T) + 0.4, SW, -3.4, face(0, -3.4, 0, -6.8) + 0.6, P.idle(t), { mouth: 'flat', eyeScale: 1.1 }); AB(false);
    const z = ease.io(seg(t, 0, d)); headCam(C.mailman, [-1.6, 0.4, 3.2 - z * 0.8], 40, [0, -0.3, 0]);
  });
  // the customer's house: north side x=15? (hidden) -> use the house at x=0 (front at z=-13)
  const CX = 1.5, CZ = -11.6;
  shot(() => e0('open'), (t, T, d, ov) => { // elderly customer opens it: a brand-new iPhone 6
    day(); sunAt('town', 0, -8);
    put(C.customer, 'town', CX, SW, CZ, 0, lerpPose(P.idle(t), { armL: [-1.25, 0, 0.25], armR: [-1.25, 0, -0.25], body: [0.15, 0, 0] }, 1), { mouth: 'flat', lid: 0.3, eyeScale: 1 + seg(t, 0.6, 0.9) * 0.6 }); C.customer.cane.visible = false;
    W.mpkg.visible = true; W.pkgCookies.visible = false; W.mpkg.scale.setScalar(0.55); W.mpkg.position.copy(rel(C.customer, 0, 2.0, 1.9)); W.mpkg.rotation.y = 0;
    const o = ease.out(seg(t, 0.3, 0.7)); W.flapL.rotation.z = o * 2.2; W.flapR.rotation.z = -o * 2.2;
    W.dust.visible = t > 0.3; W.dust.children.forEach((p) => { const u = p.userData; const k = clamp01((t - 0.3) * 0.9 + u.s * 0.15); p.position.copy(W.mpkg.position).add(V(Cc(u.a) * k * 2.5, 1 + k * u.v * 1.5, S(u.a) * k * 2.5)); p.scale.setScalar(0.5 + k); p.material.opacity = 0.6 * (1 - k); });
    const up = ease.out(seg(t, 0.75, 1.2)); W.ip6.visible = t > 0.6; W.ip6.position.copy(W.mpkg.position).add(V(0, 0.8 + up * 1.4, 0.2)); W.ip6.rotation.set(0, S(t * 3) * 0.3, 0); W.ipGlow.intensity = 30 * up; W.ipGlow.position.copy(W.ip6.position).add(V(0, 0, 1));
    put(C.mailman, 'town', CX - 3.4, SW, CZ + 2.2, face(-3.4, 0, 0, -2.2), P.idle(t), { mouth: 'smile', lid: 0.2 });
    if (t < 0.7) camAt(V(CX + 5, 5.5, CZ + 8), V(CX, 3.6, CZ), 44); else { const h = C.customer.headWorld(); camAt(h.clone().add(V(0.6, 0.0, 4.2)), W.ip6.position.clone().add(V(0, -0.3, 0)), 40); if (t < 0.78) ov.flash(0.3); }
  });
  shot(() => e0('c_fin') - 0.05, (t, T, d, ov) => { // FINALLY!
    day(); sunAt('town', 0, -8);
    put(C.customer, 'town', CX, SW + Math.abs(S(t * 10)) * 0.25, CZ, 0, lerpPose(P.idle(t), { armR: [-2.9, 0, 0.2], armL: [0, 0, 1.6] }, 1), { mouth: 'shout', eyeScale: 1.5, brow: -0.3, tear: true }); C.customer.cane.visible = false; talk(C.customer, 'c_fin', T);
    W.ip6.visible = true; W.ip6.position.copy(C.customer.handWorld('R').add(V(0, 0.8, 0))); W.ip6.rotation.set(0, 0, 0); W.ipGlow.intensity = 25; W.ipGlow.position.copy(W.ip6.position).add(V(0, 0, 1));
    const z = ease.out(seg(t, 0, 0.2)); headCam(C.customer, [0.4, 0.8, 4.6 - z * 1.2], 46, [0, 0.4, 0]); shake(t, 0.03);
  });
  shot(() => e0('shake'), (t, T, d, ov) => { // Alex shakes his head in disbelief
    day(); sunAt('town', 0, -6); put(C.alex, 'town', 6, SW, -4.8, -0.5, lerpPose(P.idle(t), { neck: [0.1, S(t * 9) * 0.45, 0] }, 1), { mouth: 'flat', lid: 0.55, brow: -0.3 }); AB(false);
    headCam(C.alex, [0, 0.2, 3.4], 40, [0, -0.2, 0]);
  });
  // ================= SCENE 5: running through town =================
  const AX = (T) => -60 + (T - e0('n5')) * 13; // Alex sprinting +x along the road
  const alexRun = (T, z = 1.5, expr, sp = 2.6) => { put(C.alex, 'town', AX(T), RD, z, PI / 2, sprint(T, sp), expr || { mouth: 'grit', brow: 1, sweat: true }); AB(); puffs(C.alex, T); };
  shot(() => E.shake[1], (t, T, d, ov) => { // Alex sprints down the street, everyone panics
    day(); sunAt('town', AX(T), 0); alexRun(T); folk(T, AX(T) + 6, 'panic');
    if (t < 1.3) camAt(V(AX(T) - 1, 2.4, 11), V(AX(T) + 2, 3.2, 0), 50); else { camAt(V(AX(T) + 14, 1.2, 2.5), V(AX(T), 3.5, 1.5), 46); }
  });
  shot(() => e0('bread'), (t, T, d, ov) => { // the baker drops his bread
    day(); sunAt('town', -30, -8); const x = -36 + t * 22; put(C.alex, 'town', x, RD, 1.5, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1 }); AB(); puffs(C.alex, t);
    const drop = t > 0.35; put(C.baker, 'town', -30, SW, -7.4, 0.2, drop ? Q.panic(t) : lerpPose(P.idle(t), { armL: [-1.3, 0, 0.3], armR: [-1.3, 0, -0.3] }, 1), { mouth: 'flat', eyeScale: drop ? 1.7 : 1, brow: drop ? -0.6 : 0 });
    W.drop.visible = true; W.drop.children.forEach((l, i) => { const k = Math.max(0, t - 0.35); const p0 = rel(C.baker, (i - 1.5) * 0.5, 2.9, 1.4); l.position.copy(p0.add(V(Cc(l.userData.a) * k * 1.5, l.userData.v * k - 12 * k * k, S(l.userData.a) * k))); if (l.position.y < 0.7) l.position.y = 0.7; l.rotation.set(k * 6, l.userData.a, k * 4); });
    camAt(V(-24, 3.5, 7), V(-30, 3.6, -6), 46);
  });
  shot(() => e0('trash'), (t, T, d, ov) => { // the mayor jumps behind a trash can
    day(); sunAt('town', -24, -8); const k = ease.out(seg(t, 0.15, 0.6)); W.can.visible = true;
    const p = arc(L('town', -21, SW, -5.6), L('town', -24, SW, -9.2), 3.2, k); put(C.mayor, 'town', 0, 0, 0, -PI / 2 - 0.4, k < 1 ? Object.assign(P.fallBack(0), { body: [1.0 * k, 0, 0], armL: [-2.8, 0, 0.3], armR: [-2.8, 0, -0.3], legL: [0.6, 0, 0], legR: [0.8, 0, 0] }) : P.crouch(t), { mouth: 'flat', eyeScale: 1.7, brow: -0.6 }); C.mayor.root.position.copy(p);
    if (k >= 1) { C.mayor.root.rotation.y = 0.3; C.mayor.pose({ neck: [0, 0, 0] }); C.mayor.root.position.y = SW - 0.3; }
    const x = -40 + t * 22; put(C.alex, 'town', x, RD, 1.5, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1 }); AB();
    camAt(V(-15, 4, 4), V(-23.5, 3, -7.5), 44); if (k >= 1 && t < 0.72) shake(t, 0.06);
  });
  shot(() => e0('j_slow') - 0.05, (t, T, d, ov) => { // BRO, SLOW DOWN!
    day(); sunAt('town', 0, 6); put(C.jake, 'town', 4, SW, 6.8, face(4, 6.8, 10, 1.5), lerpPose(P.idle(t), { armL: [-0.4, 0, 2.4 + S(t * 14) * 0.3], armR: [-0.4, 0, -2.4 - S(t * 14) * 0.3] }, 1), { mouth: 'shout', eyeScale: 1.5, brow: -0.5 }); talk(C.jake, 'j_slow', T);
    put(C.alex, 'town', -10 + t * 24, RD, 1.5, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1 }); AB();
    headCam(C.jake, [0.6, 0.3, 3.6], 42, [0, -0.3, 0]);
  });
  const hussRun = (T, n, z = 1.5, xf = AX) => { put(C.alex, 'town', xf(T), RD, z, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1, sweat: true, eyeScale: 1.2 }); AB(); if (E[n]) talk(C.alex, n, T); puffs(C.alex, T); };
  const AX6 = (T) => -50 + (T - e0('n6')) * 9;
  shot(() => e0('h4') - 0.08, (t, T, d, ov) => { // HUSS: low front, dutch
    day(); sunAt('town', AX(T), 0); hussRun(T, 'h4'); folk(T, AX(T) + 8, 'panic', [1, 3, 5]);
    camAt(V(AX(T) + 6, 0.6, 2.2), V(AX(T), 4.5, 1.5), 58); dutch(0.25); shake(t, 0.06); if (t > 0.08 && t < 0.15) ov.flash(0.3);
  });
  shot(() => e0('h5') - 0.06, (t, T, d, ov) => { // HUSS: side whip
    day(); sunAt('town', AX(T), 0); hussRun(T, 'h5'); headCam(C.alex, [3.2, 0.2, 1.6], 46, [0, -0.6, 0]); dutch(-0.2); shake(t, 0.05);
  });
  shot(() => e0('h6') - 0.06, (t, T, d, ov) => { // HUSS: overhead spin
    day(); sunAt('town', AX(T), 0); hussRun(T, 'h6'); folk(T, AX(T), 'panic');
    camAt(V(AX(T), 16 - t * 6, 1.5), V(AX(T), 0, 1.5), 50, [1, 0, 0]); camera.rotateZ(t * 3); if (t > 0.08 && t < 0.15) ov.flash(0.3);
  });
  const bugAt = (T, x, expr, pose) => { drive(C.grandma, W.bug, L('town', x, 0, -2.4), 0, T, expr || { mouth: 'grin', brow: 0.8, lid: 0.2 }); if (pose) C.grandma.pose(pose); };
  shot(() => e0('pullup'), (t, T, d, ov) => { // grandma pulls up in her golden Bugatti
    day(); sunAt('town', AX(T), 0); hussRun(T, 'none');
    const bx = AX(T) - 12 + ease.out(seg(t, 0, d)) * 11.6; bugAt(T, bx, { mouth: 'smirk', brow: 0.8, lid: 0.25 }, { neck: [0, -0.8 * seg(t, 0.4, 0.8), 0] });
    camAt(V(AX(T) + 13, 2.2, 0), V(AX(T) - 2, 2.8, -0.5), 44);
  });
  shot(() => e0('g_speed') - 0.05, (t, T, d, ov) => { // GET YOUR MONEY UP, NOT YOUR SPEED UP, YO!
    day(); sunAt('town', AX(T), 0); hussRun(T, 'none'); bugAt(T, AX(T) - 0.4, { mouth: 'grin', brow: 0.9 }, { neck: [0, -0.85, 0], armL: [-2.6 + S(t * 9) * 0.3, 0, -0.3] }); talk(C.grandma, 'g_speed', T);
    if (t < d * 0.55) headCam(C.grandma, [-2.4, 0.6, 2.6], 42, [0, -0.3, 0]); else camAt(V(AX(T) + 7, 3.2, 6), V(AX(T) - 1, 3.4, 0), 44);
  });
  shot(() => e0('ignore'), (t, T, d, ov) => { // Alex ignores everyone and keeps running
    day(); sunAt('town', AX(T), 0); hussRun(T, 'none'); const bx = AX(e0('ignore')) - 0.4 + t * 2; bugAt(T, bx, { mouth: 'flat', lid: 0.4 }, { neck: [0, -0.4, 0], armL: [-0.4, 0, 1.3], armR: [-0.4, 0, -1.3] });
    camAt(V(AX(e0('ignore')) - 6, 4, 4), V(AX(T), 3.4, 1.5), 46);
  });
  // ================= SCENE 6: something strange =================
  const vanAt = (x, z, ry, y = 0) => { W.van.visible = true; W.van.position.copy(L('town', x, y, z)); W.van.rotation.y = ry; };
  shot(() => E.ignore[1], (t, T, d, ov) => { // Alex notices something following him
    day(); sunAt('town', AX6(T), 0); hussRun(T, 'none', 1.5, AX6); C.alex.pose({ neck: [0, 1.2 * ease.io(seg(t, 0.4, 0.9)), 0] }); C.alex.setExpr({ mouth: 'flat', eyeScale: 1.4, brow: -0.5, sweat: true });
    headCam(C.alex, [0.6, 0.3, 3.6], 44, [0, -0.3, 0]); ov.vig(1.3);
  });
  shot(() => e0('van'), (t, T, d, ov) => { // mysterious black van emerges from behind a building
    day(); lights({ sky: 0x8fb8d8, sun: 1.6, hemi: 0.85 }); sunAt('town', 15, -10); const k = ease.io(seg(t, 0.2, d)); vanAt(15, -30 + k * 22, -PI / 2);
    camAt(V(5, 1.4, 3), V(15, 3.6, -16 + k * 6), 44 - k * 6); ov.vig(1.4);
  });
  const VX = (T) => AX(T) - 16 + Math.max(0, T - e0('accel')) * 1.2; // van trails Alex
  shot(() => e0('accel'), (t, T, d, ov) => { // every time he speeds up, the van speeds up
    day(); sunAt('town', AX6(T), 0); const boost = Math.max(0, t - 0.6) * 6; const ax = AX6(T) + boost * t * 0.5;
    put(C.alex, 'town', ax, RD, 2.4, PI / 2, sprint(t, 3 + boost * 0.3), { mouth: 'grit', brow: -0.4, eyeScale: 1.4, sweat: true }); AB(); puffs(C.alex, T);
    vanAt(ax - 13 + boost * 0.3, -1.4, 0);
    camAt(V(ax - 5, 3.4, 11.5), V(ax - 6, 3, 0), 50); ov.vig(1.2);
  });
  shot(() => e0('a_why') - 0.05, (t, T, d, ov) => { // WHY IS IT FOLLOWING ME?
    day(); sunAt('town', AX6(T), 0); put(C.alex, 'town', AX6(T), RD, 2.4, PI / 2, Object.assign(sprint(T, 3.2), { neck: [0, 0.8, 0] }), { mouth: 'shout', eyeScale: 1.6, brow: -0.6, sweat: true }); AB(); talk(C.alex, 'a_why', T); puffs(C.alex, T);
    vanAt(AX6(T) - 11, -0.5, 0);
    headCam(C.alex, [0.8, 0.6, 3.4], 50, [0, -0.6, 0]); shake(t, 0.03);
  });
  shot(() => e0('montage'), (t, T, d, ov) => { // park, around the bakery, past the mayor's mansion
    const k = t / d; day();
    if (k < 0.34) { sunAt('town', 37, 12); const x = 26 + t * 14; put(C.alex, 'town', x, 0.12, 18, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1, sweat: true }); AB(); puffs(C.alex, t); vanAt(x - 10, 2, 0); W.fspray.scale.setScalar(1 + S(T * 9) * 0.15);
      put(crowd[6], 'town', 30, 0.1, 15.8, PI, P.sitChair(T, 1.0), { mouth: 'smile', lid: 0.4 }); camAt(V(x + 8, 4, 28), V(x - 2, 3, 16), 48); }
    else if (k < 0.67) { sunAt('town', -30, -8); const tt = t - d * 0.34; const x = -38 + tt * 16; put(C.alex, 'town', x, SW, -7.2, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1, sweat: true }); AB(); puffs(C.alex, tt); vanAt(x - 11, -1.4, 0);
      put(C.baker, 'town', -30, SW, -11.6, 0, P.idle(T), { mouth: 'flat', eyeScale: 1.5 }); camAt(V(x + 7, 3, 3), V(x - 3, 4, -8), 50); }
    else { morning(); sunAt('rich', 26, -8); const tt = t - d * 0.67; const x = 18 + tt * 16; put(C.alex, 'rich', x, 0.35, -8.2, PI / 2, sprint(T, 3), { mouth: 'grit', brow: 1, sweat: true }); AB(); puffs(C.alex, tt);
      W.van.visible = true; W.van.position.copy(L('rich', x - 12, 0, -2)); W.van.rotation.y = 0; camAt(L('rich', x + 9, 3, 4), L('rich', x - 1, 4.5, -12), 48); }
  });
  shot(() => e0('h7') - 0.08, (t, T, d, ov) => { // HUSS: low front, van looming
    day(); sunAt('town', AX6(T), 0); hussRun(T, 'h7', 2.4, AX6); vanAt(AX6(T) - 9, 0.6, 0);
    camAt(V(AX6(T) + 5.5, 0.7, 3.6), V(AX6(T) - 2, 4.6, 1.4), 58); dutch(0.22); shake(t, 0.06); if (t > 0.08 && t < 0.15) ov.flash(0.3);
  });
  shot(() => e0('h8') - 0.06, (t, T, d, ov) => { // HUSS: side close, van behind
    day(); sunAt('town', AX6(T), 0); hussRun(T, 'h8', 2.4, AX6); vanAt(AX6(T) - 8, -1.2, 0);
    headCam(C.alex, [2.2, 0.4, 3.2], 52, [0, -0.6, 0]); dutch(-0.2); shake(t, 0.05);
  });
  shot(() => e0('h9') - 0.06, (t, T, d, ov) => { // HUSS: overhead
    day(); sunAt('town', AX6(T), 0); hussRun(T, 'h9', 2.4, AX6); vanAt(AX6(T) - 8, -1.2, 0);
    camAt(V(AX6(T) - 3, 22 - t * 6, 0.8), V(AX6(T) - 3, 0, 0.8), 52, [1, 0, 0]); camera.rotateZ(t * 1.5); if (t > 0.08 && t < 0.15) ov.flash(0.3);
  });
  const KX = 70; // catch spot (town x)
  const alexTired = (t, expr) => { put(C.alex, 'town', KX + 1.2, RD, 4.6, PI, Object.assign(P.idle(t), { body: [0.55 + S(t * 8) * 0.05, 0, 0], bodyY: 1.85, armL: [-0.9, 0, 0.25], armR: [-0.9, 0, -0.25], neck: [-0.6, 0, 0], legL: [-0.4, 0, 0.1], legR: [-0.4, 0, -0.1] }), expr || { mouth: 'flat', sweat: true, lid: 0.3, eyeScale: 1.2 }); AB(); };
  shot(() => e0('catch'), (t, T, d, ov) => { // the van catches up and stops beside him
    day(); sunAt('town', KX, 0); const k = ease.out(seg(t, 0, d * 0.8));
    const ax = KX - 6 + k * 7.2; if (k < 1) { put(C.alex, 'town', ax, RD, 4.6, PI / 2, sprint(t, 3 * (1 - k) + 0.4), { mouth: 'grit', sweat: true }); AB(); } else alexTired(t);
    vanAt(KX - 14 + k * 14, -0.4, 0); if (k > 0.98) shake(t, 0.03);
    camAt(V(KX + 12, 3.2, 12), V(KX - 1, 3.2, 1), 46); ov.vig(1.3);
  });
  shot(() => e0('door'), (t, T, d, ov) => { // the door slowly opens
    day(); sunAt('town', KX, 0); alexTired(t, { mouth: 'flat', eyeScale: 1.5, sweat: true }); C.alex.pose({ body: [0.1, 0, 0], neck: [0, 0, 0] }); C.alex.root.rotation.y = PI + 0.2;
    vanAt(KX, -0.4, 0); W.vanDoor.position.x = -1.6 - 4.4 * ease.io(seg(t, 0.2, d));
    camAt(V(KX + 9, 4.5, 8.5), V(KX - 1.5, 3.6, 0), 40 - t * 2); ov.vig(1.5);
  });
  // ================= SCENE 7: the plot twist =================
  const vanOpen = () => { vanAt(KX, -0.4, 0); W.vanDoor.position.x = -6.0; };
  const agentAt = (t, x, z, expr, pose) => { put(C.agent, 'town', x, RD, z, 0.15, pose || P.idle(t), expr || { mouth: 'smile', brow: 0.3 }); };
  shot(() => E.door[1], (t, T, d, ov) => { // dark doorway, light flicks on
    day(); sunAt('town', KX, 0); vanOpen(); alexTired(t, { mouth: 'flat', eyeScale: 1.6, sweat: true }); C.alex.pose({ body: [0.1, 0, 0], neck: [0, 0, 0] }); C.alex.root.rotation.y = PI;
    const on = t > d * 0.6 && !(t > d * 0.68 && t < d * 0.72); W.vanLight.intensity = on ? 45 : 0;
    put(C.agent, 'town', KX - 1.6, 0.9, -0.6, 0, P.idle(t), { mouth: 'flat' });
    const z = ease.in(seg(t, 0, d)); camAt(V(KX - 0.6, 4.2, 12 - z * 4), V(KX - 1.6, 3.8, 0), 40); ov.vig(1.5);
  });
  shot(() => e0('manout'), (t, T, d, ov) => { // a professional-looking man steps out with a clipboard
    day(); sunAt('town', KX, 0); vanOpen(); W.vanLight.intensity = 45; const k = ease.io(seg(t, 0, d * 0.8));
    agentAt(t, KX - 1.6, -0.4 + k * 3.4, { mouth: 'smile', brow: 0.3 }, k < 1 ? P.walk(t, 0.6) : P.idle(t)); C.agent.root.position.y = 0.9 - k * 0.8;
    alexTired(t, { mouth: 'flat', eyeScale: 1.6 }); C.alex.pose({ body: [0.05, 0, 0], neck: [0, 0, 0] });
    camAt(V(KX - 4.5, 1.0, 9), V(KX - 1.6, 4.2, 1), 46);
  });
  const AGX = KX - 1.6, AGZ = 3.0;
  shot(() => e0('v_cong') - 0.05, (t, T, d, ov) => { // congratulations! you've been selected for the town's delivery service
    day(); sunAt('town', KX, 0); vanOpen(); W.vanLight.intensity = 45;
    agentAt(t, AGX, AGZ, { mouth: 'smile', brow: 0.4 }, lerpPose(P.idle(t), { armR: [-0.4 + S(t * 3) * 0.2, 0, -0.6] }, 1)); talk(C.agent, 'v_cong', T);
    put(C.alex, 'town', KX + 3.5, RD, 6.0, PI + 0.6, P.idle(t), { mouth: 'flat', eyeScale: 1.3 }); AB();
    if (t < d * 0.5) headCam(C.agent, [0.6, 0.4, 3.8], 40, [0, -0.3, 0]); else { const u = ease.io(seg(t, d * 0.5, d)); headCam(C.agent, [-1.6 + u * 0.4, 0.9, 6.2 - u * 1.2], 44, [0, -0.6, -2.5]); }
  });
  shot(() => e0('a_what') - 0.06, (t, T, d, ov) => { // WHAT?
    day(); sunAt('town', KX, 0); vanOpen(); put(C.alex, 'town', KX + 1.2, RD, 6.8, PI + 0.4, lerpPose(P.idle(t), { armL: [-0.6, 0, 1.0], armR: [-0.6, 0, -1.0] }, 1), { mouth: 'shout', eyeScale: 1.8, brow: -0.7 }); AB(); talk(C.alex, 'a_what', T);
    const z = ease.out(seg(t, 0, 0.18)); headCam(C.alex, [-2.0, 0.2, 3.4 - z * 0.9], 40, [0, -0.1, 0]); shake(t, 0.05); if (t < 0.08) ov.flash(0.3);
  });
  shot(() => e0('recruit'), (t, T, d, ov) => { // if you can run, you deliver
    day(); sunAt('town', KX, 0); vanOpen(); W.vanLight.intensity = 50; agentAt(t, AGX, AGZ, { mouth: 'grin' }, lerpPose(P.idle(t), { armL: [-1.4, 0, -0.4] }, 1));
    const z = ease.out(seg(t, 0, d)); W.van.updateMatrixWorld(true); const pp = W.van.localToWorld(V(-2.7, 3.9, -2.2)); camAt(pp.clone().add(V(0.6, 0.2, 7.5 - z * 2.6)), pp, 40); if (t < 0.08) ov.flash(0.4);
  });
  // package mountain
  const PX = KX + 4, PZ = 9.5;
  const tossers = (t, T, ph) => [[C.grandma, 9, 2], [C.jake, 11, 6.5], [C.mayor, 6, 12.5], [C.baker, 11.5, 11]].forEach(([ch, dx, z], i) => { const x = KX + dx; const k = ((t + i * 0.3) * 1.6) % 1;
    put(ch, 'town', x, ch === C.grandma ? RD : SW, z, face(x, z, PX, PZ), Object.assign(P.idle(t), { armL: [-1.3 - S(k * PI) * 1.4, 0, 0.2], armR: [-1.3 - S(k * PI) * 1.4, 0, -0.2], body: [-0.2 * S(k * PI), 0, 0] }), { mouth: 'grin', brow: 0.4 });
    const b = W.fall[30 + i]; b.visible = true; const hp = ch.headWorld(); b.position.copy(arc(hp.clone().add(V(0, 0.6, 0)), L('town', PX, 4 + ph * 4, PZ), 3, k)); b.rotation.set(k * 4, k * 3, 0); });
  const pileAt = (g) => { W.pile.visible = true; W.pile.position.copy(L('town', PX, 0.1, PZ)); W.pile.scale.set(0.55 * g + 0.02, 0.9 * g + 0.02, 0.55 * g + 0.02); };
  shot(() => e0('dump'), (t, T, d, ov) => { // everyone dumps thousands of undelivered packages
    day(); sunAt('town', KX, 4); vanOpen(); const g = ease.out(seg(t, 0, d)); pileAt(0.15 + g * 0.85); tossers(t, T, g);
    W.fall.slice(0, 30).forEach((b, i) => { const u = b.userData; const k = ((t * 0.9 + u.d) % 1); b.visible = true; b.position.copy(L('town', PX + u.x * 0.8, 22 - k * 18, PZ + u.z * 0.6)); b.rotation.set(k * 5 + u.r, u.r, k * 3); });
    put(C.alex, 'town', KX + 1.2, RD, 4.0, 0.6, Q.panic(t), { mouth: 'flat', eyeScale: 1.8, brow: -0.7, sweat: true }); AB();
    agentAt(t, AGX, AGZ, { mouth: 'grin' });
    camAt(V(KX - 10, 12, 11), V(PX, 3, 6), 50); if (t > d * 0.5) shake(t, 0.02);
  });
  shot(() => e0('m_12') - 0.05, (t, T, d, ov) => { // I've been waiting 12 years for this moment
    day(); sunAt('town', KX, 4); vanOpen(); pileAt(1);
    put(C.mailman, 'town', KX - 6, RD, 5.4, PI / 2 + 0.5, lerpPose(P.idle(t), { armL: [-1.2, 0, -0.5], neck: [-0.1, 0, 0] }, 1), { mouth: 'smile', tear: true, brow: 0.6, eyeScale: 1.1 }); talk(C.mailman, 'm_12', T);
    const z = ease.io(seg(t, 0, d)); headCam(C.mailman, [1.0, 0.3, 3.6 - z * 0.8], 40, [0, -0.25, 0]);
  });
  const LBX = KX - 18;
  shot(() => e0('lambo'), (t, T, d, ov) => { // tears off the uniform, jumps in a Lamborghini, drives away
    day(); sunAt('town', KX - 10, 4); vanOpen(); pileAt(1);
    const rip = t > 0.25; const mx = KX - 6, mz = 5.4;
    if (rip) { C.mailman.torso.material = W.hawaii; C.mailman.armL.children[0].material = W.hawaii; C.mailman.armR.children[0].material = W.hawaii; C.mailman.body.children.slice(-2).forEach(c => c.visible = false); }
    const run = seg(t, 0.55, 1.05), go = Math.max(0, t - 1.05);
    W.lambo.visible = true; W.lambo.position.copy(L('town', LBX - go * go * 16, 0, -1.6)); W.lambo.rotation.y = PI;
    if (go <= 0) { put(C.mailman, 'town', mx + (LBX - 0.4 - mx) * run, RD + S(run * PI) * 1.5, mz - (mz + 1.6 - 0.3) * run, run > 0 ? -PI / 2 - 0.3 : PI / 2 + 0.5, run > 0 ? P.run(t, 2.4) : (rip ? P.armsUp(t) : P.idle(t)), { mouth: 'grin', eyeScale: 1.2, brow: 0.6 }); }
    else { drive(C.mailman, W.lambo, L('town', LBX - go * go * 16, 0, -1.6), PI, t, { mouth: 'grin', brow: 0.7 }); C.mailman.pose({ armR: [-2.8, 0, 0.3] }); }
    if (rip) for (const c of C.mailman.capParts) c.visible = false;
    const fk = Math.max(0, t - 0.25); W.uniShirt.visible = rip; W.uniShirt.position.copy(L('town', mx + fk * 2, 5 + fk * 9 - 9 * fk * fk, mz + fk * 3)); W.uniShirt.rotation.set(fk * 7, fk * 5, 0); W.uniCap.visible = rip; W.uniCap.position.copy(L('town', mx - fk, 6 + fk * 11 - 9 * fk * fk, mz - fk)); W.uniCap.rotation.set(fk * 9, 0, fk * 4);
    put(C.alex, 'town', KX + 1.2, RD, 4.0, -PI / 2 - 0.5, P.idle(t), { mouth: 'flat', eyeScale: 1.5 }); AB();
    if (t < 0.6) headCam(C.mailman, [1.0, 0.3, 4.8], 46, [0, -0.6, 0]); else camAt(V(KX - 6, 5, 10.5), V(LBX - go * 6, 2.5, 0), 50);
    if (t > 0.25 && t < 0.32) ov.flash(0.35);
  });
  // ================= SCENE 8: the ending =================
  const carry = (T, x, z, expr, sway = 1) => { put(C.alex, 'town', x, RD, z, PI / 2, Object.assign(P.walk(T, 0.9), { armL: [-1.45, 0, 0.1], armR: [-1.45, 0, -0.1], body: [-0.12, 0, S(T * 4) * 0.04 * sway] }), expr || { mouth: 'grit', brow: 1, sweat: true }); AB();
    W.stack.visible = true; W.stack.position.copy(rel(C.alex, 0, 2.6, 1.6)); W.stack.rotation.set(0, PI / 2, S(T * 4) * 0.05 * sway); W.stack.children.forEach((b, i) => { b.position.x = S(T * 4 + i * 0.3) * i * 0.03 * sway; }); };
  const CRX = (T) => -30 + (T - e0('n8')) * 2.6;
  shot(() => E.lambo[1], (t, T, d, ov) => { // the town's only delivery worker
    sunset(); sunAt('town', CRX(T), 0); carry(T, CRX(T), 1.5); folk(T, CRX(T), 'stroll', [4]);
    const u = ease.io(t / d); camAt(V(CRX(T) + 8 + u * 4, 4 + u * 9, 7 + u * 3), V(CRX(T), 5 + u * 6, 1.5), 50);
  });
  shot(() => e0('h10') - 0.08, (t, T, d, ov) => { // HUSS: low angle with the tower
    sunset(); sunAt('town', CRX(T), 0); carry(T, CRX(T), 1.5, { mouth: 'grit', brow: 1, sweat: true }); talk(C.alex, 'h10', T);
    camAt(V(CRX(T) + 5, 0.6, 3.5), V(CRX(T), 9, 1.5), 62); dutch(0.22); shake(t, 0.05); if (t > 0.08 && t < 0.15) ov.flash(0.3);
  });
  shot(() => e0('h11') - 0.06, (t, T, d, ov) => { // HUSS: close
    sunset(); sunAt('town', CRX(T), 0); carry(T, CRX(T), 1.5); talk(C.alex, 'h11', T);
    headCam(C.alex, [3.6, 0.6, 0.8], 48, [0, -0.2, 0]); dutch(-0.2); shake(t, 0.05);
  });
  shot(() => e0('h12') - 0.06, (t, T, d, ov) => { // HUSS: high wide, wobbling tower
    sunset(); sunAt('town', CRX(T), 0); carry(T, CRX(T), 1.5, null, 3); talk(C.alex, 'h12', T);
    camAt(V(CRX(T) - 6, 14, 14), V(CRX(T), 8, 1.5), 52); dutch(0.15); if (t > 0.08 && t < 0.15) ov.flash(0.3);
  });
  const partyCar = (T, x) => { bugAt(T, x, { mouth: 'grin', brow: 0.9 }, { neck: [0, -0.8, 0], armL: [-2.8 + S(T * 10) * 0.3, 0, -0.4], armR: [-1.2, 0, -0.1] });
    W.bug.updateMatrixWorld(true); const p = W.bug.localToWorld(V(-3.2, 2.3, 0)); put(C.jake, 'town', 0, 0, 0, PI / 2, P.dance(T, 1), { mouth: 'grin' }); C.jake.root.position.copy(p).add(V(0, 0, -0.9)); put(C.mayor, 'town', 0, 0, 0, PI / 2, P.dance(T + 0.3, 2), { mouth: 'grin' }); C.mayor.root.position.copy(p).add(V(0, 0, 1.0));
    W.streetConf.visible = true; W.streetConf.position.copy(W.bug.position); W.streetConf.update(T);
    W.streetLights.forEach((l, i) => { l.intensity = 160; const a = T * 2 + i * PI / 2; l.position.copy(W.bug.position).add(V(Cc(a) * 5, 6, S(a) * 5)); }); };
  const BGX = (T) => CRX(T) - 22 + (T - e0('g_party') + 0.3) * 12;
  shot(() => e0('g_party') - 0.2, (t, T, d, ov) => { // grandma drives past: while we're out partying, by the way!
    sunset(); sunAt('town', CRX(T), 0); carry(T, CRX(T), 3.0, { mouth: 'flat', lid: 0.4, sweat: true }); C.alex.root.position.x = CRX(e0('g_party')); partyCar(T, BGX(T)); talk(C.grandma, 'g_party', T);
    if (t < d * 0.55) headCam(C.grandma, [-2.6, 0.8, 2.6], 46, [0, -0.3, 0]); else camAt(V(CRX(e0('g_party')) + 4, 3.5, 13), V(CRX(e0('g_party')) + 2, 3.6, 0), 48);
  });
  shot(() => e0('drop'), (t, T, d, ov) => { // Alex drops all the packages
    sunset(); const ax = CRX(e0('g_party')); sunAt('town', ax, 0); put(C.alex, 'town', ax, RD, 3.0, PI / 2 - (PI / 2 - 0.3) * ease.io(seg(t, 0.1, d)), lerpPose(P.idle(t), { armL: [-1.45 * (1 - seg(t, 0, 0.15)), 0, 0.1], armR: [-1.45 * (1 - seg(t, 0, 0.15)), 0, -0.1] }, 1), { mouth: 'flat', lid: 0.45 }); AB();
    W.stack.visible = true; W.stack.position.copy(L('town', ax + 1.6, 2.6 + RD, 3.0)); W.stack.rotation.set(0, PI / 2, 0);
    W.stack.children.forEach((b, i) => { const u = b.userData; const k = t; b.position.set(Cc(u.a) * k * (1 + i * 0.2), Math.max(-2.0 + 0.5 * (i % 3), u.y - 9 * k * k * (1 + i * 0.05)), S(u.a) * k * (1 + i * 0.2)); b.rotation.set(k * u.v, 0, k * u.v * 0.6); });
    camAt(V(ax + 5, 6, 10), V(ax + 1, 3.5, 2), 50); if (t > 0.3 && t < 0.45) shake(t, 0.06);
  });
  shot(() => e0('a_unemp'), (t, T, d, ov) => { // looks into the camera: I should've stayed unemployed
    sunset(); const ax = CRX(e0('g_party')); sunAt('town', ax, 0); put(C.alex, 'town', ax, RD, 3.0, 0.3, P.idle(t), { mouth: 'flat', lid: 0.45, brow: -0.3 }); AB(); talk(C.alex, 'a_unemp', T);
    W.stack.visible = true; W.stack.position.copy(L('town', ax + 1.6, 2.6 + RD, 3.0)); W.stack.children.forEach((b, i) => { const u = b.userData; const k = e1('drop') - e0('drop'); b.position.set(Cc(u.a) * k * (1 + i * 0.2), Math.max(-2.0 + 0.5 * (i % 3), u.y - 9 * k * k * (1 + i * 0.05)), S(u.a) * k * (1 + i * 0.2)); b.rotation.set(k * u.v, 0, k * u.v * 0.6); });
    const z = ease.io(seg(t, 0, d)); const h = C.alex.headWorld(); const dir = V(S(0.3), 0, Cc(0.3)); camAt(h.clone().add(dir.multiplyScalar(4.4 - z * 1.2)).add(V(0, 0.2, 0)), h.clone().add(V(0, -0.25, 0)), 40);
  });
  SH.forEach(s => { if (typeof s.a === 'function') s.a = s.a(); });
  for (let i = 1; i < SH.length; i++) if (!(SH[i].a > SH[i - 1].a)) console.log('SHOT ORDER PROBLEM', i, SH[i - 1].a, SH[i].a);
  console.log('shots', SH.length);
}
