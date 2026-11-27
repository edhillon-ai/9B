function build() {
  const e0 = (n) => E[n][0], e1 = (n) => E[n][1];
  const night = () => lights({ sky: 0x0b1030, sun: 0.5, sunColor: 0x8899ff, hemi: 0.6, hemiSky: 0x5a78c8, hemiGround: 0x151525, exposure: 1.15 });
  const sunset = () => lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.3, exposure: 1.0 });
  const morning = () => lights({ sky: 0xbfe6ff, sunColor: 0xfff0d0, sun: 2.4, hemi: 1.15 });
  const rel = (ch, x, y, z) => { ch.root.updateMatrixWorld(true); return ch.root.localToWorld(V(x, y, z)); };
  const dutch = (a) => camera.rotateZ(a);
  const shake = (t, a = 0.15, f = 60) => { camera.position.x += S(t * f) * a; camera.position.y += S(t * f * 1.3) * a; };
  const AB = (on = true) => { C.alex.headband.visible = on; };
  const nightSky = (loc, x = 0, z = 0) => { W.stars2.visible = true; W.stars2.position.copy(L(loc, x, 0, z)); W.moon2.visible = true; W.moon2.position.copy(L(loc, x - 60, 110, z - 180)); };
  function drive(ch, car, pos, ry, t, expr) { car.visible = true; car.position.copy(pos); car.rotation.y = ry;
    put(ch, 'town', 0, 0, 0, ry + PI / 2, P.sitChair(t, 1.4), expr); ch.root.position.copy(pos).add(V(-1.4 * Cc(ry), 0, 1.4 * S(ry))); ch.body.position.y = 2.0;
    ch.pose({ armL: [-1.2, 0, 0.1], armR: [-1.2, 0, -0.1] }); }
  function billAt(i, p, t, rx = 0) { const b = W.bills[i]; b.visible = true; b.position.copy(p); b.rotation.set(rx, t, 0.2); }
  function richLife(T, o = {}) { // background life on the rich street
    W.richCars.forEach(c => c.visible = true);
    const c0 = W.richCars[0], c1 = W.richCars[1];
    c0.position.set(LOC.rich.x - 90 + ((T * 22) % 180), 0, -2.6); c0.rotation.y = 0;
    c1.position.set(LOC.rich.x + 90 - ((T * 18 + 60) % 180), 0, 2.6); c1.rotation.y = PI;
    if (o.cash !== false) { W.cash.visible = true; W.cash.position.copy(L('rich', o.cx ?? 0, 0, o.cz ?? 0)); W.cash.update(T); }
    const spots = o.spots || [[-36, -9], [-16, -8.6], [16, -9], [36, -8.6], [-30, 9], [-10, 8.8], [12, 9], [30, 8.8]];
    spots.forEach(([x, z], i) => { if (i >= crowd.length) return; put(crowd[i], 'rich', x, flr.walk, z, z < 0 ? 0 : PI, i % 3 === 2 ? P.dance(T + i, i % 4) : P.armsUp(T * 0.8 + i * 0.4), { mouth: 'grin', eyeScale: 1.1 }); });
  }
  const tinyAlex = (t, pose, expr, ry = 0) => put(C.alex, 'rich', 0, flr.walk, -9, ry, pose, expr);
  const holdPose = (t) => lerpPose(P.idle(t), { armR: [-1.25, 0, 0.15] }, 1);
  const lawnL = () => { day(); sunAt('lawn', -10, -4); };
  // ================= SCENE 1 (hook) =================
  shot(0, (t, T, d, ov) => { // aerial: mansions, supercars, money everywhere
    day(); sunAt('rich', 0, -10); const u = ease.io(t / d);
    richLife(T, { cx: 0, cz: -4 });
    cam('rich', mix([-46, 42, 44], [-22, 17, 24], u), mix([10, 2, -26], [4, 5, -18], u), 44);
    tinyAlex(t, holdPose(t), { mouth: 'frown' });
  });
  shot(2.05, (t, T, d, ov) => { // ground level: people throwing money, supercar whooshes past
    day(); sunAt('rich', -24, -10);
    richLife(T, { cx: -24, cz: -8, spots: [[-28, -9], [-21, -8.6], [-33, -8.8], [-14, -9.2], [-25, 9], [-18, 8.8]] });
    const c = W.richCars[2]; c.position.copy(L('rich', -50 + t * 34, 0, -2.6)); c.rotation.y = 0;
    cam('rich', [-18 + t * 0.8, 3.0, 5.5], [-27, 5.6, -16], 46);
  });
  shot(() => e0('n1b') - 0.08, (t, T, d, ov) => { // everyone except me: tiny house between mansions
    day(); sunAt('rich', 0, -12);
    richLife(T, { cash: false, spots: [[-30, -9], [26, -9], [-14, 9], [16, 9]] });
    tinyAlex(t, holdPose(t), { mouth: 'frown', brow: -0.7, look: [0, 0.2] });
    const h = C.alex.handWorld('R'); billAt(0, h.add(V(0, 0.1, 0.5)), 0, 0);
    const u = ease.out(seg(t, 0, d)); cam('rich', mix([0, 6, 12], [0, 4.6, 3.5], u), mix([0, 7, -22], [0, 4.4, -12], u), 46);
  });
  const bugX = (T) => { const a = e0('bug'), b = e0('g_money'); if (T < b) return -70 + 66 * ease.out(seg(T, a, b)); return -4 + (T - b) * 1.1; };
  shot(() => e0('bug'), (t, T, d, ov) => { // golden Bugatti rolls in
    day(); sunAt('rich', -10, -4); richLife(T, { cash: false, spots: [[-30, -9], [-14, 9]] });
    const x = bugX(T); drive(C.grandma, W.bug, L('rich', x, 0, -2.6), 0, t, { mouth: 'smirk', brow: 0.7 });
    tinyAlex(t, holdPose(t), { mouth: 'flat', eyeScale: 1.2, look: [-0.8, 0] }, -0.7); billAt(0, C.alex.handWorld('R').add(V(0, 0.1, 0.5)), 0);
    cam('rich', [9, 1.3, -7.5], [-12, 2.2, -2.6], 44);
  });
  shot(() => e0('g_money'), (t, T, d, ov) => { // GET YOUR MONEY UP
    day(); sunAt('rich', 0, -4); richLife(T, { cash: false, spots: [[-24, 9], [14, 9]] });
    const x = bugX(T); drive(C.grandma, W.bug, L('rich', x, 0, -2.6), 0, t, { mouth: 'grin', brow: 0.9 });
    C.grandma.pose({ neck: [0, 0.85, 0], armR: [-2.6 + S(t * 9) * 0.3, 0, 0.3] }); talk(C.grandma, 'g_money', T);
    for (let i = 0; i < 3; i++) { const k = ((t * 1.3 + i * 0.33) % 1); billAt(i, C.grandma.handWorld('R').add(V(k * 1.5, 0.4 + k * 2 - k * k * 3.5, -k * 5)), t * 6 + i, t * 5); }
    tinyAlex(t, holdPose(t), { mouth: 'flat', eyeScale: 1.25 }, 0.2);
    cam('rich', [x + 6.0, 5.6, -7.6], [x - 1.2, 4.4, -2.6], 40);
  });
  shot(() => e0('speechless'), (t, T, d, ov) => { // speechless turn to camera; his dollar blows away
    day(); sunAt('rich', 0, -10);
    const turn = ease.io(seg(t, 0.15, 0.8));
    tinyAlex(t, lerpPose(P.idle(t), { armR: [-1.25 * (1 - seg(t, 0.4, 0.6)), 0, 0.15] }, 1), { mouth: 'flat', eyeScale: 1.3, lid: 0.25 }, 1.3 * (1 - turn));
    if (t < 0.5) billAt(0, C.alex.handWorld('R').add(V(0, 0.1, 0.5)), 0); else { const k = t - 0.5; billAt(0, rel(C.alex, -1.2 - k * 5, 4.2 + S(k * 6) * 0.6 + k * 1.5, 1 + k * 1.5), k * 8, k * 6); }
    W.bug.visible = true; W.bug.position.copy(L('rich', 30 + t * 30, 0, -2.6));
    const z = ease.out(seg(t, 0.8, 1.05)); cam('rich', mix([0, 4.9, -1.8], [0, 4.8, -4.2], z), [0, 4.65, -9], 40);
  });
  // ================= SCENE 2 (the grind) =================
  shot(() => E.speechless[1], (t, T, d, ov) => { // determined: headband on
    morning(); sunAt('rich', 0, -10); richLife(T, { cash: false, spots: [[-24, 9], [18, -9]] });
    const u = seg(t, 0.4, 1.0); AB(t > 0.8);
    tinyAlex(t, lerpPose(P.idle(t), { armL: [-2.7 * S(u * PI), 0, 0.5], armR: [-2.7 * S(u * PI), 0, -0.5] }, 1), { mouth: 'flat', brow: 0.9, eyeScale: 1.05 });
    const z = ease.out(seg(t, 0, d)); cam('rich', mix([1.5, 1.2, 1], [0.8, 2.8, -3.6], z), [0, 4.9, -9], 42);
  });
  const mowAt = (T, t, x, z, ry, sp = 1.5) => { put(C.alex, 'lawn', x, 0.03, z, ry, Object.assign(P.run(t, sp), { armL: [-1.25, 0, 0.1], armR: [-1.25, 0, -0.1], body: [0.35, 0, 0] }), { mouth: 'grit', brow: 1, sweat: true }); AB();
    W.mower.visible = true; W.mower.position.copy(rel(C.alex, 0, 0, 3.6)); W.mower.rotation.y = ry - PI / 2; W.mower.position.y = 0;
    W.grass.visible = true; const g0 = rel(C.alex, 0, 0.6, 4.8); W.grass.children.forEach((c, i) => { const u = c.userData; const k = (T * u.s + u.o) % 1; c.position.set(g0.x + Cc(u.a) * k * 3, g0.y + k * 2.4 - k * k * 2, g0.z + S(u.a) * k * 3); c.rotation.set(T * 9 + i, i, 0); }); };
  shot(() => e0('n2') + 1.55, (t, T, d, ov) => { // wide: mowing a mansion lawn
    lawnL(); mowAt(T, t, -22 + t * 5, -4, PI / 2, 1.2);
    put(crowd[0], 'lawn', 6, 0.03, -10, -0.6, P.sitChair(t, 0.3), { mouth: 'smirk' });
    cam('lawn', [-30, 7, 16], [-14, 2, -6], 40);
  });
  shot(() => e0('h1') - 0.05, (t, T, d, ov) => { // HUSS 1 - low front, dutch
    lawnL(); mowAt(T, t, -16, 2 - t * 6, PI, 1.8); talk(C.alex, 'h1', T);
    cam('lawn', [-15.0, 0.9, -8.5], [-16, 3.8, 0], 52); dutch(0.22); shake(t, 0.06 * hussU(T, ['h1']));
  });
  shot(() => e0('h2') - 0.05, (t, T, d, ov) => { // HUSS 2 - side tracking
    lawnL(); const x = -22 + t * 9; mowAt(T, t, x, -2, PI / 2, 2); talk(C.alex, 'h2', T);
    cam('lawn', [x + 1, 3.2, 8], [x + 1.5, 3.2, -2], 46); dutch(-0.12);
  });
  shot(() => e0('h3') - 0.05, (t, T, d, ov) => { // HUSS 3 - pizza sprint to mansion door
    lawnL(); const z = 0 - t * 9; put(C.alex, 'lawn', 0.5, 0.03, z, PI, Object.assign(P.run(t, 1.8), { armL: [-1.45, 0, 0.15], armR: [-1.45, 0, -0.15] }), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h3', T);
    W.pizza.visible = true; W.pizza.position.copy(rel(C.alex, 0, 3.6, 1.7)); W.pizza.rotation.y = PI;
    put(crowd[1], 'lawn', 0, 0.9, -17.2, 0, P.idle(t), { mouth: 'smirk' });
    cam('lawn', [3, 1.6, z + 6.5], [0, 4, z - 4], 50); dutch(0.15);
  });
  const washPose = (t) => Object.assign(P.idle(t), { body: [0.25, 0, 0], armR: [-1.6 + S(t * 30) * 0.45, 0, S(t * 24) * 0.35], armL: [-1.2 + S(t * 26 + 1) * 0.4, 0, 0.3] });
  const washSet = (T) => { W.suv.visible = true; W.suv.position.copy(L('lawn', 22, 0.2, -8)); W.suv.rotation.y = PI / 2; W.bucket.visible = true; W.bucket.position.copy(L('lawn', 18.2, 0.2, -3)); W.bubbles.visible = true;
    W.bubbles.children.forEach((b, i) => { const u = b.userData; b.position.copy(L('lawn', 19.2 + u.x * 0.5, 1.5 + u.y * 3.5 + ((T * 0.4 * (0.5 + u.s)) % 1) * 1.5, -12 + u.z * 8)); }); };
  shot(() => e0('h4') - 0.05, (t, T, d, ov) => { // HUSS 4 - car wash scrubbing
    lawnL(); washSet(T); put(C.alex, 'lawn', 17.4, 0.2, -7, PI / 2, washPose(t), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h4', T);
    W.sponge.visible = true; W.sponge.position.copy(C.alex.handWorld('R'));
    cam('lawn', [12.5, 5.2, -1.6], [18.5, 4, -8], 46); dutch(-0.18);
  });
  shot(() => e0('h5') - 0.05, (t, T, d, ov) => { // HUSS 5 - top down on the roof
    lawnL(); washSet(T); put(C.alex, 'lawn', 17.4, 0.2, -11, PI / 2 + 0.3, washPose(t * 1.2), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h5', T);
    W.sponge.visible = true; W.sponge.position.copy(C.alex.handWorld('R'));
    cam('lawn', [13, 2.0, -15.5], [18, 4.5, -10], 50); dutch(0.15);
  });
  const boxPose = (t, wob = 1) => Object.assign(P.walk(t, 0.6), { armL: [-3.0, 0, -0.25], armR: [-3.0, 0, 0.25], body: [0, 0, S(t * 9) * 0.06 * wob] });
  const boxesOn = (ch) => { W.boxes.visible = true; W.boxes.position.copy(rel(ch, 0, 7.2, 0.2)); W.boxes.rotation.y = ch.root.rotation.y; W.boxes.rotation.z = S(T0 * 9) * 0.06; };
  let T0 = 0;
  shot(() => e0('h6') - 0.05, (t, T, d, ov) => { // HUSS 6 - boxes overhead, extreme low angle
    lawnL(); T0 = T; put(C.alex, 'lawn', 4 + t * 2, 0.03, -2, PI / 2, boxPose(t), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h6', T); boxesOn(C.alex);
    cam('lawn', [6.5 + t * 2, 0.5, 2.5], [4 + t * 2, 6, -2], 58); dutch(0.25);
  });
  shot(() => e0('a_btw') - 0.1, (t, T, d, ov) => { // while they're out partying, by the way
    lawnL(); T0 = T; put(C.alex, 'lawn', 6, 0.03, -2, 0.25, lerpPose(boxPose(t, 0.6), { legL: [0, 0, 0.1], legR: [0, 0, -0.1], bodyY: 2 }, 1), { mouth: 'flat', brow: 0.3, lid: 0.3, sweat: true }); AB(); talk(C.alex, 'a_btw', T); boxesOn(C.alex);
    cam('lawn', [7.2, 6.4, 6.0], [6.1, 5.6, -2], 42);
  });
  shot(() => e0('party'), (t, T, d, ov) => { // Jake partying inside an enormous mansion
    partyL(T); W.cash.visible = true; W.cash.position.copy(L('party', 0, 0, -2)); W.cash.update(T);
    put(C.jake, 'party', 0, flr.party, -2, 0, P.dance(t, 1), { mouth: 'grin', eyeScale: 1.1 });
    [[-5, -5], [5, -5], [-8, 0], [8, 0], [-3, 3], [3, 3.5]].forEach(([x, z], i) => put(teens[i], 'party', x, flr.party, z, face(x, z, 0, -2) * 0.3, P.dance(T + i * 0.7, i % 4), { mouth: 'grin' }));
    const u = ease.io(t / d); cam('party', mix([0, 4, 14], [0, 5.5, 6], u), [0, 4.2, -3], 46);
  });
  shot(() => e0('pay'), (t, T, d, ov) => { // sunset: paid two dollars
    sunset(); sunAt('lawn', 0, 0);
    put(C.alex, 'lawn', -2, 0.03, 0, 0.6, lerpPose(P.idle(t), { armR: [-1.3, 0, 0.1], body: [0.12, 0, 0], neck: [0.25, 0, 0] }, 1), { mouth: 'flat', lid: 0.45, sweat: true, look: [0, 0.5] }); AB();
    put(crowd[2], 'lawn', 1.6, 0.03, 2.6, face(1.6, 2.6, -2, 0), lerpPose(P.idle(t), { armR: [-1.2 + seg(t, 0.2, 0.5) * 0.1, 0, -0.1] }, 1), { mouth: 'smirk', lid: 0.3 });
    const k = ease.io(seg(t, 0.25, 0.7)); const h0 = crowd[2].handWorld('R'), h1 = C.alex.handWorld('R');
    for (let i = 0; i < 2; i++) billAt(i, h0.clone().lerp(h1, k).add(V(i * 0.25, 0.15 + i * 0.12, 0.3)), 0.3 + i * 0.3, -0.4);
    const z = ease.out(seg(t, 0.6, 1.2)); cam('lawn', mix([3.5, 5.2, 7.5], [-0.2, 4.6, 3.8], z), mix([-0.2, 3.6, 0.8], [-1.6, 3.9, 0.6], z), 42);
  });
  shot(() => e0('a_bro'), (t, T, d, ov) => { // BRO, WHAT?
    sunset(); sunAt('lawn', 0, 0);
    put(C.alex, 'lawn', -2, 0.03, 0, 0.3, lerpPose(P.idle(t), { armR: [-1.6, 0, 0.3], armL: [-1.0, 0, 0.6], neck: [-0.15, 0, 0] }, 1), { mouth: 'shout', brow: -0.4, eyeScale: 1.5, sweat: true }); AB(); talk(C.alex, 'a_bro', T);
    for (let i = 0; i < 2; i++) billAt(i, C.alex.handWorld('R').add(V(i * 0.3, 0.2 + i * 0.12, 0.3)), 0.2 + i * 0.4, -0.3);
    const z = ease.out(seg(t, 0, 0.18)); cam('lawn', mix([-0.6, 4.9, 6.5], [-1.4, 4.8, 3.2], z), [-2, 4.6, 0], 40); shake(t, 0.05 * (t < 0.5 ? 1 : 0));
  });
  // ================= SCENE 3 (the baker) =================
  shot(() => e0('n3') - 0.1, (t, T, d, ov) => { // bakery exterior, golden door
    day(); sunAt('bex', 0, 4);
    put(C.alex, 'bex', -14 + t * 6, flr.walk, 7.5, PI / 2 - 0.3 * seg(t, 0.8, 1.6), P.walk(t), { mouth: 'flat', brow: 0.4, look: [0.3, -0.6] }); AB();
    W.car.visible = true; W.car.position.copy(L('bex', 9, 0, 12.6)); W.car.rotation.y = 0;
    put(crowd[3], 'bex', 18, flr.walk, 8, -PI / 2, P.walk(t), { mouth: 'grin' }); crowd[3].root.position.x -= t * 3;
    const u = ease.io(t / d); cam('bex', mix([-6, 2.5, 26], [-2, 3.4, 20], u), mix([-4, 7, 0], [-2, 6, 0], u), 50);
  });
  const bakeL = () => { interior({ sun: 1.4, hemi: 1.05, hemiSky: 0xfff1d8 }); sunAt('bakery', 0, 0); W.bakeryLight.intensity = 220; };
  const bakerThrone = (t, expr, pose) => { put(C.baker, 'bakery', -6, 0.12, -4, 0.45, Object.assign(P.sitChair(t, 1.75), pose || {}), expr); W.loaf.visible = true; W.loaf.scale.setScalar(0.55); W.loaf.position.copy(C.baker.handWorld('R').add(V(0, 0.3, 0.2))); };
  const alexBak = (t, expr, pose) => { put(C.alex, 'bakery', -2.6, 0.12, 2.8, face(-2.6, 2.8, -6, -4), pose || P.idle(t), expr); AB(); };
  shot(() => e0('n3') + 1.85, (t, T, d, ov) => { // luxurious interior reveal
    bakeL(); bakerThrone(t, { mouth: 'smirk', lid: 0.35 });
    const u = ease.io(seg(t, 0, d)); put(C.alex, 'bakery', mix([2], [-2.4], u)[0], 0.12, mix([8], [3.2], u)[0], face(0, 8, -6, -4), P.walk(t, 0.9), { mouth: 'flat', eyeScale: 1.35, look: [0, -0.8] }); AB();
    cam('bakery', mix([12, 9, 7.5], [8, 7, 7.8], u), [-4, 4, -2], 50);
  });
  shot(() => e0('a_cust') - 0.05, (t, T, d, ov) => { // how many customers?
    bakeL(); bakerThrone(t, { mouth: 'smirk', lid: 0.35, look: [0.5, 0] }); alexBak(t, { mouth: 'smile', brow: 0.2 }, P.talkGesture(t)); talk(C.alex, 'a_cust', T);
    cam('bakery', [-7.8, 6.3, -0.8], [-2.6, 4.6, 2.8], 40);
  });
  shot(() => E.a_cust[1], (t, T, d, ov) => { // Zero.
    bakeL(); bakerThrone(t, { mouth: 'smirk', lid: 0.4, look: [0.3, 0] }, { armR: [-1.6, 0, 0.1] }); talk(C.baker, 'b_zero', T);
    alexBak(t, { mouth: 'flat' });
    const z = ease.out(seg(t, 0.1, 0.4)); cam('bakery', mix([-3.4, 5.4, 2.2], [-4.0, 5.2, 0.6], z), [-6, 4.6, -4], 40);
  });
  shot(() => e0('a_how') - 0.1, (t, T, d, ov) => { // then how are you rich?
    bakeL(); bakerThrone(t, { mouth: 'smirk', lid: 0.35 }); alexBak(t, { mouth: 'smile', brow: -0.6, eyeScale: 1.2 }, lerpPose(P.idle(t), { armL: [-0.8, 0, 0.9], armR: [-0.8, 0, -0.9] }, 1)); talk(C.alex, 'a_how', T);
    cam('bakery', [-4.9, 5.0, -0.4], [-2.6, 4.7, 2.8], 38);
  });
  shot(() => e0('b_good') - 0.1, (t, T, d, ov) => { // good question. (shrug)
    bakeL(); const sh = S(seg(t, 0.1, 0.8) * PI);
    bakerThrone(t, { mouth: 'smirk', brow: -0.2, lid: 0.3, browUp: 1 }, { armL: [-0.4, 0, 0.6 + sh * 0.6], armR: [-1.6, 0, -0.2], neck: [0, 0, sh * 0.2] }); talk(C.baker, 'b_good', T);
    alexBak(t, { mouth: 'flat', eyeScale: 1.2 });
    cam('bakery', [-3.0, 5.6, 1.4], [-6, 4.6, -4], 42);
  });
  shot(() => e0('ferrari'), (t, T, d, ov) => { // baker strolls out into a Ferrari
    day(); sunAt('bex', 4, 8);
    if (t < 0.75) { put(C.baker, 'bex', 0 + t * 7, flr.walk, 2 + t * 10, 0.6, P.walk(t, 1.1), { mouth: 'smirk', lid: 0.3 }); W.car.visible = true; W.car.position.copy(L('bex', 9, 0, 12.6)); W.car.rotation.y = 0; }
    else drive(C.baker, W.car, L('bex', 9 + Math.pow(Math.max(0, t - 0.95), 2) * 30, 0, 12.6), 0, t, { mouth: 'smirk', lid: 0.3 });
    put(C.alex, 'bex', -1.0, flr.walk, 1.6, 0.4, P.idle(t), { mouth: 'flat', eyeScale: 1.3 }); AB();
    cam('bex', [-9, 4.5, 26], [4, 3, 8], 46);
  });
  shot(() => e0('ferrari') + 1.2, (t, T, d, ov) => { // vroom
    day(); sunAt('bex', 10, 8);
    drive(C.baker, W.car, L('bex', 13 + t * t * 26 + t * 6, 0, 12.6), 0, t, { mouth: 'grin', lid: 0.3 });
    put(C.alex, 'bex', 0, flr.walk, 3, PI / 2 - 0.2, P.idle(t), { mouth: 'flat', eyeScale: 1.3, look: [0.5, 0] }); AB();
    cam('bex', [-2.5, 2.2, 9.5], [10, 3, 11], 48);
  });
  shot(() => e0('confused'), (t, T, d, ov) => { // confused
    day(); sunAt('bex', 0, 8);
    put(C.alex, 'bex', 0, flr.walk, 3, 0.15, lerpPose(P.idle(t), { neck: [0, S(t * 4) * 0.2, 0.28], armR: [-2.4, 0, 0.6] }, 1), { mouth: 'wavy', brow: -0.5, eyeScale: 1.25, look: [S(t * 5), 0] }); AB();
    cam('bex', [0.6, 4.9, 7.6], [0, 4.7, 3], 40);
  });
  // ================= SCENE 4 (the mailman) =================
  shot(() => E.confused[1], (t, T, d, ov) => { // pan across the mailman's mansions
    day(); sunAt('rich', -40, 20); richLife(T, { cash: false, spots: [[-70, 9], [-40, 9]] });
    const u = ease.io(seg(t, 0, d)); cam('rich', [-110 + u * 80, 7, -3], [-104 + u * 80, 9, 36], 52);
  });
  const mailSpot = (t, pose, expr) => put(C.mailman, 'rich', 0, flr.walk, 8.6, PI, pose, expr);
  shot(() => e0('n4') + 1.7, (t, T, d, ov) => { // the mailman, proud of his mansions; Alex walks up
    day(); sunAt('rich', 0, 10); richLife(T, { cash: false, spots: [[-20, 9], [18, -9]] });
    mailSpot(t, lerpPose(P.idle(t), { armL: [0, 0, 1.3], armR: [0, 0, -1.3] }, 1), { mouth: 'grin' });
    put(C.alex, 'rich', -10 + t * 4.5, flr.walk, 6.2, PI / 2, P.walk(t), { mouth: 'flat' }); AB();
    cam('rich', [-2, 4, -6], [0, 5, 14], 50);
  });
  shot(() => e0('a_pkgs') - 0.03, (t, T, d, ov) => { // how many packages?
    day(); sunAt('rich', 0, 10); mailSpot(t, P.idle(t), { mouth: 'smile', lid: 0.2 });
    put(C.alex, 'rich', -3.2, flr.walk, 6.8, face(-3.2, 6.8, 0, 8.6), P.talkGesture(t), { mouth: 'smile', brow: 0.2 }); AB(); talk(C.alex, 'a_pkgs', T);
    cam('rich', [-7.5, 5.4, 1.8], [-1.4, 4.6, 7.8], 42);
  });
  shot(() => E.a_pkgs[1], (t, T, d, ov) => { // None. I lost the mail truck...
    day(); sunAt('rich', 0, 10); const sh = S(seg(t, 1.2, 2.0) * PI);
    mailSpot(t, lerpPose(P.talkGesture(t), { armL: [-0.4, 0, 0.5 + sh * 0.7], armR: [-0.4, 0, -0.5 - sh * 0.7] }, 0.6), { mouth: 'smile', lid: 0.25 }); C.mailman.root.rotation.y = PI + 0.35; talk(C.mailman, 'm_none', T);
    put(C.alex, 'rich', -3.2, flr.walk, 6.8, face(-3.2, 6.8, 0, 8.6), P.idle(t), { mouth: 'flat', eyeScale: 1.15 }); AB();
    const z = ease.io(seg(t, 0, d)); cam('rich', mix([-2.4, 5.4, 3.6], [-1.4, 5.2, 4.9], z), [0, 4.7, 8.6], 40);
  });
  shot(() => e0('pool'), (t, T, d, ov) => { // mail truck at the bottom of a swimming pool
    day(); sunAt('pool', 0, 0); const u = ease.io(t / d);
    put(crowd[4], 'pool', -6, 4.6, 14, PI, P.sitChair(t, 0.3), { mouth: 'smirk' }); crowd[4].pose({ body: [-0.9, 0, 0], bodyY: 1.4 });
    cam('pool', mix([9, 19, 15], [2.5, 11.5, 6], u), mix([-1, 1, 1], [-2, 0.6, 0.8], u), 46);
  });
  shot(() => e0('ding'), (t, T, d, ov) => { // phone: +$1,000,000
    day(); sunAt('rich', 0, 10); mailSpot(t, lerpPose(P.idle(t), { armR: [-1.4, 0, 0.35], neck: [0.4, 0, 0] }, 1), { mouth: 'smile', look: [0, 1] });
    W.phoneN.visible = true; const h = C.mailman.handWorld('R'); W.phoneN.position.copy(h.add(V(0.3, 0.6, -0.3))); W.phoneN.rotation.set(-0.3, PI + 0.3, 0); W.phoneN.userData.draw('ding', t - 0.25);
    const p = W.phoneN.position; camera.position.set(p.x - 0.3, p.y + 0.4, p.z - 2.3); camera.lookAt(p); camera.fov = 40; camera.updateProjectionMatrix();
    if (t > 0.25 && t < 0.33) ov.flash(0.3);
  });
  shot(() => e0('ding') + 0.75, (t, T, d, ov) => { // mailman grins; Alex stunned
    day(); sunAt('rich', 0, 10); mailSpot(t, lerpPose(P.idle(t), { armR: [-1.4, 0, 0.35] }, 1), { mouth: 'grin', brow: 0.4 });
    W.phoneN.visible = true; W.phoneN.position.copy(C.mailman.handWorld('R').add(V(0.3, 0.6, -0.3))); W.phoneN.rotation.set(-0.3, PI + 0.3, 0); W.phoneN.userData.draw('ding', 1);
    put(C.alex, 'rich', -3.2, flr.walk, 6.8, face(-3.2, 6.8, 0, 8.6), P.idle(t), { mouth: 'flat', eyeScale: 1.55, look: [0.6, 0] }); AB();
    cam('rich', [-0.8, 4.9, 1.6], [-1.4, 4.6, 7.6], 44);
  });
  shot(() => e0('a_teach'), (t, T, d, ov) => { // TEACH ME YOUR WAYS!
    day(); sunAt('rich', 0, 10); const u = ease.out(seg(t, 0, 0.5));
    mailSpot(t, lerpPose(P.idle(t), { armL: [0, 0, 1.4], armR: [0, 0, -1.4] }, 1), { mouth: 'flat', eyeScale: 1.4 });
    put(C.alex, 'rich', -3.2 + u * 1.2, flr.walk + S(u * PI) * 0.8, 6.8 + u * 0.6, face(-3.2, 6.8, 0, 8.6), lerpPose(P.idle(t), { armL: [-1.7, 0, -0.15], armR: [-1.7, 0, 0.15], body: [0.3, 0, 0], legL: [0.5, 0, 0], legR: [-0.4, 0, 0] }, u), { mouth: 'shout', brow: -0.6, eyeScale: 1.4, tear: true }); AB(); talk(C.alex, 'a_teach', T);
    cam('rich', [-6.5, 2.0, 2.0], [-1.5, 4.6, 7.6], 46); dutch(-0.12);
  });
  shot(() => e0('runaway'), (t, T, d, ov) => { // mailman runs away
    day(); sunAt('rich', 6, 8);
    put(C.mailman, 'rich', 1 + t * 15, flr.walk, 8.6, PI / 2, P.run(t, 1.6), { mouth: 'grit', eyeScale: 1.3 });
    put(C.alex, 'rich', -2.6, 0.6, 7.6, PI / 2, { body: [1.45, 0, 0], bodyY: 0.9, neck: [-1.0, 0, 0], armL: [-3.0, 0, 0.2], armR: [-3.0, 0, -0.2], legL: [0.2, 0, 0], legR: [0.1, 0, 0] }, { mouth: 'frown', brow: -0.8, tear: true }); AB();
    cam('rich', [-9, 2.2, 6.2], [6, 2.4, 8.4], 44);
  });
  // ================= SCENE 5 (the mayor) =================
  shot(() => E.runaway[1], (t, T, d, ov) => { // detective squint
    day(); sunAt('rich', 0, -10); richLife(T, { cash: false, spots: [[-22, 9], [20, -9], [-12, -9]] });
    tinyAlex(t, lerpPose(P.idle(t), { armR: [-2.2, 0, 0.75], armL: [-0.6, 0, -0.5], neck: [0, 0, 0.1] }, 1), { mouth: 'smirk', brow: 0.8, lid: 0.45, look: [0.6, 0] }, 0.2); AB();
    const z = ease.io(seg(t, 0, d)); cam('rich', mix([1.5, 5.2, -2.5], [0.6, 4.9, -5.0], z), [0, 4.7, -9], 40);
  });
  const offL = () => { interior({ sun: 1.2, hemi: 1.0, hemiSky: 0xfff0dd }); sunAt('office', 0, 0); W.officeLight.intensity = 200; };
  const mayorDesk = (t, T, expr, mash = 1) => { put(C.mayor, 'office', 0, 0, -6.2, 0, { body: [-0.45, 0, 0], bodyY: 2.6, neck: [0.35, 0, 0], armL: [-1.25 + S(t * 37) * 0.1 * mash, 0, -0.35], armR: [-1.25 + S(t * 41) * 0.1 * mash, 0, 0.35], legL: [-1.85, 0, 0.12], legR: [-1.85, 0, -0.12] }, expr); W.mchair.visible = true;
    W.ctrl.visible = true; const a = C.mayor.handWorld('L'), b = C.mayor.handWorld('R'); W.ctrl.position.copy(a.add(b).multiplyScalar(0.5)).add(V(0, 0.2, 0.1)); W.ctrl.rotation.set(-0.6, 0, 0); W.drawTV(T); };
  shot(() => e0('office'), (t, T, d, ov) => { // TV: mayor's racing game
    offL(); mayorDesk(t, T, { mouth: 'smirk', lid: 0.35, look: [0, -0.3] });
    cam('office', [-3.5, 8.2, 5.5], [-6, 8.4, 11.4], 44);
  });
  shot(() => e0('office') + 0.5, (t, T, d, ov) => { // mayor reveal: feet on desk
    offL(); mayorDesk(t, T, { mouth: 'smirk', lid: 0.35, look: [-0.2, -0.3] });
    put(C.alex, 'office', 9 - seg(t, 0, 0.6) * 5, 0.2, 3.5, -PI / 2, P.walk(t), { mouth: 'flat', brow: 0.5 }); AB();
    const u = ease.out(seg(t, 0, d)); cam('office', mix([7, 6.5, 10], [5, 6.2, 8], u), [0, 4, -4], 48);
  });
  shot(() => e0('a_howall'), (t, T, d, ov) => { // how does everyone have so much money?
    offL(); mayorDesk(t, T, { mouth: 'smirk', lid: 0.35, look: [-0.2, -0.3] });
    put(C.alex, 'office', 3.8, 0.2, 3.6, face(3.8, 3.6, 0, -5), lerpPose(P.talkGesture(t), { armL: [-0.8, 0, 0.9] }, 0.5), { mouth: 'smile', brow: 0.5 }); AB(); talk(C.alex, 'a_howall', T);
    cam('office', [-2.6, 6.0, -2.2], [3.8, 4.6, 3.6], 40);
  });
  shot(() => E.a_howall[1], (t, T, d, ov) => { // have you tried working harder?
    offL(); mayorDesk(t, T, { mouth: 'smirk', lid: 0.5, look: [0, -0.4] }); talk(C.mayor, 'my_hard', T);
    put(C.alex, 'office', 3.8, 0.2, 3.6, face(3.8, 3.6, 0, -5), P.idle(t), { mouth: 'flat', eyeScale: 1.2 }); AB();
    const z = ease.io(seg(t, 0, d)); cam('office', mix([2.2, 6.6, -1.4], [1.4, 6.2, -2.9], z), [0, 5.0, -5.8], 40);
  });
  const lotL = () => { day(); sunAt('lot', 0, 0); };
  const digPose = (t) => { const k = S(t * 16); return { body: [0.55 + k * 0.2, 0, 0], bodyY: 1.7, neck: [-0.4, 0, 0], armL: [-1.0 - k * 0.6, 0, -0.3], armR: [-0.7 - k * 0.6, 0, 0.3], legL: [-0.5, 0, 0.3], legR: [0.2, 0, -0.3] }; };
  shot(() => e0('h7') - 0.26, (t, T, d, ov) => { // HUSS 7 - digging a massive hole (camera in the hole)
    lotL(); put(C.alex, 'lot', 0, 0.16, -3.2, 0, digPose(t), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h7', T);
    W.shovel.visible = true; const a = C.alex.handWorld('L'), b = C.alex.handWorld('R'); W.shovel.position.copy(a.add(b).multiplyScalar(0.5)); W.shovel.rotation.set(0.8 + S(t * 16) * 0.4, 0, 0);
    W.dirtFly.visible = true; W.dirtFly.children.forEach((c, i) => { const u = c.userData; const k = (t * 1.6 + u.s) % 1; c.position.copy(L('lot', Cc(u.a) * k * 5, 0.5 + u.v * k - 9 * k * k, -1 + S(u.a) * k * 2)); });
    cam('lot', [0.4, 0.4, 1.0], [0, 5.6, -3.2], 62); dutch(0.2); shake(t, 0.08 * hussU(T, ['h7']));
  });
  shot(() => e0('h8') - 0.08, (t, T, d, ov) => { // HUSS 8 - bricks
    lotL(); const x = -10 + t * 7; put(C.alex, 'lot', x, 0.16, 4, PI / 2, Object.assign(P.run(t, 1.4), { armL: [-1.5, 0, -0.1], armR: [-1.5, 0, 0.1] }), { mouth: 'grit', brow: 1, sweat: true }); AB(); talk(C.alex, 'h8', T);
    W.bricks.visible = true; W.bricks.position.copy(rel(C.alex, 0, 3.6, 1.7)); W.bricks.rotation.y = PI / 2;
    cam('lot', [x + 2.5, 2.0, 11], [x + 1, 4.2, 4], 46); dutch(-0.2);
  });
  shot(() => e0('h9') - 0.1, (t, T, d, ov) => { // HUSS 9 - heavy boxes overhead
    lotL(); T0 = T; put(C.alex, 'lot', 6, 0.16, 2, -0.3, boxPose(t * 0.3, 1.5), { mouth: 'grit', brow: 1, sweat: true, eyeScale: 1.1 }); AB(); talk(C.alex, 'h9', T); boxesOn(C.alex);
    const z = ease.out(seg(t, 0, 0.3)); cam('lot', mix([4, 0.6, 9], [5, 0.5, 6.5], z), [6, 7, 2], 60); dutch(0.18);
    if (t > 0.05 && t < 0.13) ov.flash(0.35);
  });
  shot(() => e0('pay2'), (t, T, d, ov) => { // another dollar
    sunset(); sunAt('lot', 0, 0);
    put(C.alex, 'lot', 6, 0.16, 2, -0.3, lerpPose(P.idle(t), { armR: [-1.3, 0, 0.1], body: [0.15, 0, 0] }, 1), { mouth: 'flat', lid: 0.5, sweat: true, look: [0, 0.6] }); AB();
    put(crowd[5], 'lot', 9, 0.16, 5, face(9, 5, 6, 2), lerpPose(P.idle(t), { armR: [-1.5, 0, 0] }, 1), { mouth: 'smirk', lid: 0.35 });
    const k = seg(t, 0.15, 0.85); const h0 = crowd[5].handWorld('R'), h1 = C.alex.handWorld('R');
    billAt(0, h0.clone().lerp(h1, k).add(V(S(k * 12) * 0.5, 0.25 + S(k * PI) * 0.8, 0.3)), k * 9, S(k * 10) * 0.6);
    cam('lot', [2.0, 5.2, 8.6], [7, 4.2, 2.6], 44);
  });
  shot(() => e0('a_done'), (t, T, d, ov) => { // I'M DONE! (flops backwards into the dirt)
    sunset(); sunAt('lot', 0, 0); const f = ease.in(seg(t, 0.35, 0.75));
    put(C.alex, 'lot', 6, 0.16, 2, -0.3, f > 0 ? P.fallBack(f) : lerpPose(P.idle(t), { armL: [0, 0, 2.6], armR: [0, 0, -2.6] }, 1), { mouth: 'shout', brow: -0.7, eyeScale: 1.3, tear: true }); AB(); talk(C.alex, 'a_done', T);
    if (t > 0.78) put(C.alex, 'lot', 6, 0.16, 2, -0.3, P.fallBack(1), { mouth: 'wavy', eyeOpen: 0.05 });
    billAt(0, rel(C.alex, 0.5 + t * 0.5, 2 + 4 * t - 3 * t * t, 1), t * 10, t * 7);
    cam('lot', [7.5, 9.5, 7.5], [6.2, 2, 1], 50);
  });
  // ================= SCENE 6 (midnight mystery) =================
  const gmNight = (T) => { night(); sunAt('gm', 0, 0, [-20, 30, 20]); W.gmLight.intensity = 260; W.gmLight2.intensity = 140; nightSky('gm', 0, 0); };
  shot(() => E.donehold[1], (t, T, d, ov) => { // that night: rich street, Alex notices
    night(); sunAt('rich', 0, -10, [-20, 30, 20]); nightSky('rich', 0, 0); W.homeLight.intensity = 140; W.homeLight.position.copy(L('rich', 2, 6, -5));
    tinyAlex(t, lerpPose(P.idle(t), { neck: [0, 0.5 * seg(t, 0.6, 1.0), 0] }, 1), { mouth: 'flat', brow: 0.5, eyeScale: 1.15, look: [0.8 * seg(t, 0.6, 1), 0] }, 1.0); AB(false);
    [C.jake, C.baker, C.mailman, C.mayor].forEach((c, i) => put(c, 'rich', 22 + i * 3.2 - t * 5, flr.walk, 8.6, -PI / 2, Object.assign(P.walk(t + i * 0.3, 0.7), { body: [0.4, 0, 0] }), { mouth: 'flat', look: [0, -0.3] }));
    const u = ease.io(t / d); cam('rich', mix([-7, 5.5, -14], [-6, 5.2, -13], u), mix([5, 4.2, 0], [8, 4.2, 2], u), 52);
  });
  const sneakers = (t, k) => [C.jake, C.baker, C.mailman, C.mayor].forEach((c, i) => { const ang = (i - 1.5) * 0.62; const a = [(i % 2 ? 1 : -1) * 0.9, 24 + i * 3], b = [S(ang) * 5.4, Cc(ang) * 5.4];
    const kk = clamp01(k * 1.15 - i * 0.05); const p = [a[0] + (b[0] - a[0]) * kk, a[1] + (b[1] - a[1]) * kk]; const done = kk >= 1;
    put(c, 'gm', p[0], 0.2, p[1], done ? face(p[0], p[1], 0, 0) : face(a[0], a[1], b[0], b[1]), done ? lerpPose(P.idle(t + i), { armR: [-1.2, 0, 0.2], neck: [0.35, 0, 0] }, 1) : Object.assign(P.walk(t + i * 0.3, 0.6), { body: [0.45, 0, 0], armL: [-0.6, 0, 0.3], armR: [-0.6, 0, -0.3] }), { mouth: 'flat', look: [0, done ? 0.8 : -0.3] }); });
  shot(() => e0('n6b') - 0.2, (t, T, d, ov) => { // everyone gathering outside grandma's house
    gmNight(T); const k = ease.io(seg(t, 0, d - 0.4)); sneakers(t, k);
    const u = ease.io(t / d); cam('gm', mix([10, 6, 34], [6, 7, 28], u), [0, 5, 2], 48);
  });
  const alexBush = (t, x, z, ry, walk = true, extra = {}) => { put(C.alex, 'gm', x, 0.2, z, ry, walk ? Object.assign(P.walk(t, 0.8), { body: [0.1, 0, 0] }) : P.idle(0), Object.assign({ mouth: 'flat', eyeScale: 1.2 }, extra)); AB(false);
    W.bushSuit.visible = true; W.bushSuit.position.copy(C.alex.root.position); W.bushSuit.position.y += walk ? Math.abs(S(t * 5.6)) * 0.15 : 0; W.bushSuit.rotation.y = ry; };
  shot(() => e0('bush'), (t, T, d, ov) => { // the bush follows
    gmNight(T); sneakers(t, 1);
    const z = 26 - t * 6, x = 5.5; const stop = (t % 0.9) > 0.6;
    alexBush(t, x, z, PI - 0.2, !stop);
    cam('gm', [17, 3.2, z - 13], [x, 3.5, z], 46);
  });
  shot(() => e0('pass'), (t, T, d, ov) => { // walks right past grandma: close on the shoes
    gmNight(T); sneakers(t, 1);
    put(C.grandma, 'gm', 0.6, 0.2, 9.5, PI / 2 + 0.3, P.idle(t), { mouth: 'flat', look: [0, 0.8] });
    alexBush(t, 4.2 - t * 2.2, 11, -PI / 2);
    cam('gm', [3.2, 0.7, 14.5], [3, 0.8, 10.5], 40);
  });
  shot(() => e0('g_nike'), (t, T, d, ov) => { // since when do bushes wear Nike?
    gmNight(T); sneakers(t, 1);
    put(C.grandma, 'gm', 0.6, 0.2, 9.5, PI / 2 + 0.3, lerpPose(P.idle(t), { neck: [0.45, 0, 0.12], armL: [-0.4, 0, 0.6], armR: [-2.4, 0, 0.5] }, 1), { mouth: 'smirk', brow: 0.5, browUp: 1, look: [0.3, 0.8] }); talk(C.grandma, 'g_nike', T);
    alexBush(t, 2.6, 11, -PI / 2, false);
    cam('gm', [3.4, 3.6, 5.6], [0.6, 4.8, 9.5], 42);
  });
  shot(() => e0('freeze'), (t, T, d, ov) => { // bush freezes (eyes peek out)
    gmNight(T); put(C.grandma, 'gm', 0.6, 0.2, 9.5, PI / 2 + 0.3, P.idle(t), { mouth: 'smirk', brow: 0.5, look: [0.3, 0.6] });
    alexBush(t, 2.6, 11, -PI / 2 + 1.2, false, { mouth: 'flat', eyeScale: 1.6, sweat: true, look: [-0.7, 0] }); W.bushSuit.children[3].visible = false; W.bushSuit.children[2].visible = false;
    const z = ease.out(seg(t, 0, 0.3)); const p = C.alex.headWorld(); camera.position.set(p.x + 3.6 - z * 1.4, p.y + 0.4, p.z + 3.3 - z * 1.4); camera.lookAt(p); camera.fov = 40; camera.updateProjectionMatrix();
  });
  shot(() => e0('shrug'), (t, T, d, ov) => { // grandma shrugs, walks inside
    gmNight(T); sneakers(t, 1); const sh = S(seg(t, 0, 0.6) * PI);
    const w = seg(t, 0.55, d); put(C.grandma, 'gm', 0.6 - w * 0.6, 0.2, 9.5 - w * 9, w > 0 ? PI : PI / 2 + 0.3, w > 0 ? P.walk(t) : lerpPose(P.idle(t), { armL: [-0.3, 0, 1.0 * sh], armR: [-0.3, 0, -1.0 * sh], neck: [0, 0, sh * 0.25] }, 1), { mouth: 'smirk', brow: -0.2 });
    alexBush(t, 2.6, 11, -PI / 2 + 1.2, false, { eyeScale: 1.2 }); W.bushSuit.position.y -= seg(t, 0.4, 0.8) * 0.4;
    cam('gm', [-6, 5, 17], [1, 3.5, 8], 48);
  });
  // ================= SCENE 7 (the plot twist) =================
  const winNight = (inside = 0) => { if (inside) interior({ sun: 0.3, hemi: 0.7, hemiSky: 0x9d8aff, hemiGround: 0x3a2a50, exposure: 1.15 }); else night(); sunAt('gwin', 0, 4, [-20, 30, 20]); W.gwinLight.intensity = inside ? 150 : 160; W.admLight.intensity = inside ? 260 : 300; nightSky('gwin', 0, 0); W.curL.position.x = -6.4; W.curR.position.x = 6.4; W.drawAdmin(T0); };
  const adminGran = (t, T, ry = PI, expr = { mouth: 'smirk', lid: 0.2 }, type = 1) => { T0 = T; W.achair.visible = true; W.achair.rotation.y = ry; put(C.grandma, 'gwin', 0, 0.3, -2.4, ry, P.sitChair(t, 1.85), expr);
    if (type) C.grandma.pose({ armL: [-1.3 + S(t * 31) * 0.12, 0, -0.25], armR: [-1.3 + S(t * 37) * 0.12, 0, 0.25] }); };
  shot(() => e0('n7'), (t, T, d, ov) => { // creeping to the glowing window
    T0 = T; winNight(); adminGran(t, T); W.drawAdmin(T, 0);
    const k = ease.io(seg(t, 0, 1.8)); alexBush(t, -6 + k * 5.5, 9 - k * 6.5, PI - 0.6 * (1 - k), k < 1); C.alex.root.position.x = LOC.gwin.x - 6 + k * 5.5; C.alex.root.position.z = 9 - k * 6.5; W.bushSuit.position.copy(C.alex.root.position);
    if (k >= 1) { W.bushSuit.visible = false; C.alex.pose({ neck: [0.1, 0, 0] }); C.alex.setExpr({ mouth: 'flat', eyeScale: 1.3 }); }
    cam('gwin', [8, 3.5, 12], [-1, 4.5, 2], 46);
  });
  shot(() => e0('peek'), (t, T, d, ov) => { // REVEAL: grandma at a six-monitor gaming setup
    winNight(); adminGran(t, T); W.drawAdmin(T, 0);
    const u = ease.io(t / d); cam('gwin', mix([-2.8, 7.8, 3.5], [-1.8, 7.4, 0.6], u), [1.4, 5.0, -6.5], 46);
    if (t < 0.08) ov.flash(0.25);
  });
  shot(() => e0('admin'), (t, T, d, ov) => { // types the admin command
    winNight(1); adminGran(t, T, PI, { mouth: 'smirk', brow: 0.6, lid: 0.25 }); W.drawAdmin(t * 1.4, t > 0.85 ? 1 : 0);
    if (t > 0.85) C.grandma.pose({ armR: [-1.0, 0, 0.25] });
    cam('gwin', [2.6, 5.6, -5.2], [0, 4.9, -2.4], 42);
  });
  shot(() => e0('admin') + 1.05, (t, T, d, ov) => { // money rains on the whole town
    gmNight(T); sneakers(t, 1); [C.jake, C.baker, C.mailman, C.mayor].forEach((c, i) => c.pose(P.armsUp(t + i * 0.3))); [C.jake, C.baker, C.mailman, C.mayor].forEach(c => c.setExpr({ mouth: 'grin', eyeScale: 1.2 }));
    W.cash.visible = true; W.cash.position.copy(L('gm', 0, 0, 6)); W.cash.update(T * 1.4);
    const u = ease.io(t / d); cam('gm', mix([0, 5, 22], [0, 7, 18], u), [0, 5.5, 4], 50);
  });
  shot(() => e0('burst'), (t, T, d, ov) => { // Alex bursts through the door
    winNight(1); W.admLight.intensity = 160; adminGran(t, T, PI + seg(t, 0.2, 0.5) * 0.5, { mouth: 'flat', eyeScale: 1.2 }, 0); W.drawAdmin(T, 1);
    W.adoor.rotation.y = -ease.out(seg(t, 0.05, 0.25)) * 1.8;
    const k = ease.out(seg(t, 0.1, 0.5)); put(C.alex, 'gwin', -12 + k * 6, 0.3, -2.2, PI / 2, P.run(t, 1.3), { mouth: 'grit', brow: 1, eyeScale: 1.2 }); AB(false);
    cam('gwin', [2.5, 6.5, -6.4], [-8, 4, -1.2], 50); if (t > 0.05 && t < 0.15) { ov.flash(0.3); shake(t, 0.12); }
  });
  shot(() => e0('a_why'), (t, T, d, ov) => { // WHY AM I NOT GETTING ANY MONEY?
    winNight(1); adminGran(t, T, PI + 0.5, { mouth: 'flat', lid: 0.3 }, 0); W.drawAdmin(T, 1); W.adoor.rotation.y = -1.8;
    put(C.alex, 'gwin', -6, 0.3, -2.2, PI / 2, lerpPose(P.idle(t), { armL: [-0.6, 0, 1.4 + S(t * 6) * 0.2], armR: [-0.6, 0, -1.4 - S(t * 6) * 0.2] }, 1), { mouth: 'shout', brow: -0.8, eyeScale: 1.4 }); AB(false); talk(C.alex, 'a_why', T);
    cam('gwin', [-1.0, 5.2, 1.4], [-6, 4.6, -2.2], 42); dutch(0.06);
  });
  shot(() => E.a_why[1], (t, T, d, ov) => { // grandma spins around: you turned your notifications off
    winNight(1); const sp = ease.out(seg(t, 0, 0.35)); adminGran(t, T, PI + 0.5 + sp * 1.07, { mouth: 'smirk', lid: 0.35, brow: -0.1 }, 0); W.drawAdmin(T, 1); W.adoor.rotation.y = -1.8; talk(C.grandma, 'g_notif', T);
    C.grandma.pose({ armR: [-0.9, 0, 0.6], armL: [-0.9, 0, -0.2] });
    put(C.alex, 'gwin', -6, 0.3, -2.2, PI / 2, P.idle(t), { mouth: 'flat', eyeScale: 1.2 }); AB(false);
    cam('gwin', [-3.4, 5.4, -0.2], [0, 4.4, -2.4], 40);
  });
  shot(() => e0('zoomface'), (t, T, d, ov) => { // dramatic zoom into Alex's horrified face
    winNight(1); W.drawAdmin(T, 1); W.adoor.rotation.y = -1.8;
    put(C.alex, 'gwin', -6, 0.3, -2.2, PI / 2, lerpPose(P.idle(t), { armL: [-0.3, 0, 0.3], armR: [-2.6, 0, 0.7] }, 1), { mouth: 'wavy', eyeScale: 1.75, brow: -0.9, sweat: true, tear: t > 0.6 }); AB(false);
    const z = ease.in(seg(t, 0, 0.45)); const p = C.alex.headWorld(); camera.position.set(p.x + 7 - z * 2.8, p.y + 0.15, p.z + 0.4); camera.lookAt(p); camera.fov = 44 - z * 4; camera.updateProjectionMatrix();
    if (t > 0.45) shake(t, 0.03);
  });
  // ================= SCENE 8 (the ending) =================
  shot(() => E.zoomface[1], (t, T, d, ov) => { // notifications back ON
    day(); sunAt('rich', 0, -10);
    tinyAlex(t, lerpPose(P.idle(t), { armR: [-1.4, 0, 0.35], neck: [0.4, 0, 0] }, 1), { mouth: 'flat', look: [0, 1] }); AB(false);
    W.phoneN.visible = true; W.phoneN.position.copy(C.alex.handWorld('R').add(V(-0.3, 0.6, 0.3))); W.phoneN.rotation.set(-0.3, -0.3, 0);
    W.phoneN.userData.draw(t < 1.2 ? 'off' : 'on', t - 1.2);
    const p = W.phoneN.position; camera.position.set(p.x + 0.4, p.y + 0.45, p.z + 2.4); camera.lookAt(p); camera.fov = 42; camera.updateProjectionMatrix();
  });
  shot(() => e0('billion'), (t, T, d, ov) => { // the flood of missed payments
    day(); sunAt('rich', 0, -10);
    tinyAlex(t, lerpPose(P.idle(t), { armR: [-1.4, 0, 0.35], neck: [0.4, 0, 0] }, 1), { mouth: 'flat', look: [0, 1] }); AB(false);
    W.phoneN.visible = true; W.phoneN.position.copy(C.alex.handWorld('R').add(V(-0.3, 0.6, 0.3))); W.phoneN.rotation.set(-0.3, -0.3, 0); W.phoneN.userData.draw('flood', t);
    const p = W.phoneN.position; camera.position.set(p.x + 0.3, p.y + 0.3, p.z + 1.9 - t * 0.4); camera.lookAt(p); camera.fov = 42; camera.updateProjectionMatrix(); shake(t, 0.015);
  });
  shot(() => e0('billion') + 0.6, (t, T, d, ov) => { // money explosion
    day(); sunAt('rich', 0, -10); richLife(T, { cash: false, spots: [[-14, 9], [16, 9]] });
    tinyAlex(t, P.armsUp(t), { mouth: 'grin', eyeScale: 1.4 }); AB(false); C.alex.root.position.y += Math.abs(S(t * 7)) * 0.8;
    W.burst.visible = true; W.burst.position.copy(L('rich', 0, 2, -9)); W.burst.update(t + 0.15);
    cam('rich', [0, 4, 3.5 + t * 3], [0, 5, -9], 56); if (t < 0.1) ov.flash(0.5);
  });
  shot(() => e0('buy'), (t, T, d, ov) => { // bought a mansion
    day(); sunAt('air', -20, -40);
    put(C.alex, 'air', -20, 0.12, -36, 0, P.armsUp(t), { mouth: 'grin', eyeScale: 1.2 });
    W.cash.visible = true; W.cash.position.copy(L('air', -20, 0, -38)); W.cash.update(T);
    const u = ease.out(seg(t, 0, d)); cam('air', mix([-20, 3, -22], [-20, 6, -18], u), [-20, 8, -50], 52);
  });
  shot(() => e0('buy') + 0.6, (t, T, d, ov) => { // a golden Bugatti
    day(); sunAt('air', 10, 8);
    W.bug.visible = true; W.bug.position.copy(L('air', 10, 0.12, 9)); W.bug.rotation.y = 0.4;
    put(C.alex, 'air', 8.0, 0.12, 13.4, 0.3, lerpPose(P.idle(t), { armR: [-0.4, 0, 0.9], armL: [-2.6, 0, 0.6] }, 1), { mouth: 'grin', brow: 0.4 });
    const u = ease.io(t / d); cam('air', mix([22, 3.5, 20], [18, 3.2, 22], u), [9, 3, 10], 44);
  });
  shot(() => e0('buy') + 1.2, (t, T, d, ov) => { // and a private jet
    day(); sunAt('air', 0, 0);
    put(C.alex, 'air', 7, 0.12, 7, 0.5, P.armsUp(t), { mouth: 'grin', eyeScale: 1.2 });
    const u = ease.io(t / d); cam('air', mix([22, 4, 26], [18, 6, 22], u), [0, 5, 0], 50);
  });
  const jakeMow = (T, t, x, z, ry, sp = 1.4) => { put(C.jake, 'lawn', x, 0.03, z, ry, Object.assign(P.run(t, sp), { armL: [-1.25, 0, 0.1], armR: [-1.25, 0, -0.1], body: [0.35, 0, 0] }), { mouth: 'grit', brow: 1, sweat: true });
    W.mower.visible = true; W.mower.position.copy(rel(C.jake, 0, 0, 3.6)); W.mower.rotation.y = ry - PI / 2; W.mower.position.y = 0;
    W.grass.visible = true; const g0 = rel(C.jake, 0, 0.6, 4.8); W.grass.children.forEach((c, i) => { const u = c.userData; const k = (T * u.s + u.o) % 1; c.position.set(g0.x + Cc(u.a) * k * 3, g0.y + k * 2.4 - k * k * 2, g0.z + S(u.a) * k * 3); c.rotation.set(T * 9 + i, i, 0); }); };
  shot(() => E.buy[1], (t, T, d, ov) => { // next morning: Jake mowing - HUSS
    morning(); sunAt('lawn', -10, -4); jakeMow(T, t, -14, -1 - t * 4, PI, 1.8); talk(C.jake, 'j1', T);
    cam('lawn', [-13.2, 1.0, -9.5], [-14, 4, -1], 52); dutch(0.2);
  });
  shot(() => e0('j2') - 0.05, (t, T, d, ov) => { // HUSS
    morning(); sunAt('lawn', -10, -4); const x = -20 + t * 9; jakeMow(T, t, x, -2, PI / 2, 2); talk(C.jake, 'j2', T);
    cam('lawn', [x + 1, 3.2, 7.5], [x + 1.5, 3.2, -2], 46); dutch(-0.15);
  });
  shot(() => e0('j3') - 0.05, (t, T, d, ov) => { // HUSS - top down
    morning(); sunAt('lawn', -10, -4); const x = -10 + t * 6; jakeMow(T, t, x, -4, PI / 2, 2); talk(C.jake, 'j3', T);
    cam('lawn', [x + 0.5, 14, -1], [x + 1, 1, -4], 50);
  });
  shot(() => e0('a_final') - 0.12, (t, T, d, ov) => { // Alex cruises past in his golden Bugatti
    morning(); sunAt('lawn', -6, 4);
    const x = -12 + t * 5.5; drive(C.alex, W.bug, L('lawn', x, 0, 11.6), 0, t, { mouth: 'grin', brow: 0.5, lid: 0.2 }); C.alex.pose({ neck: [0, 0.75, 0], armR: [-0.2, 0, -1.2] }); talk(C.alex, 'a_final', T); AB(false);
    jakeMow(T, t, -14 + t * 0.6, -1, PI / 2, 0.5); C.jake.root.rotation.y = PI / 2 + 0.6 * seg(t, 0.3, 0.8); C.jake.setExpr({ mouth: 'flat', sweat: true, eyeScale: 1.2, look: [0, 0] });
    cam('lawn', [x + 4.5, 4.4, 18.5], [x - 1, 3.2, 10.5], 46);
  });
  SH.forEach(s => { if (typeof s.a === 'function') s.a = s.a(); });
  for (let i = 1; i < SH.length; i++) if (!(SH[i].a > SH[i - 1].a)) console.log('SHOT ORDER PROBLEM', i, SH[i - 1].a, SH[i].a);
  console.log('shots', SH.length);
}
