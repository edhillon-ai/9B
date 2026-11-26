function build() {
  const e0 = (n) => E[n][0], e1 = (n) => E[n][1];
  const R = 28; const rimC = L('court', R, 8.3, 0);
  const gx = -15; // grandma's house x in town (door at z -13)
  const sunset = () => lights({ sky: 0xffb070, sunColor: 0xffc27a, sun: 2.4, exposure: 1.0, dir: [30, 14, 10] });
  const ab = () => { C.alex.headband.visible = true; };
  const crowdBleach = (T, mood) => { tourney(); crowd.forEach((c, i) => { const row = i % 4, col = Math.floor(i / 4); const x = -14 + col * 10 + (row % 2) * 4, z = -21 - row * 2.2, seat = 1.05 + row * 1.2;
    if (mood === 'cheer') put(c, 'court', x, seat, z, 0, P.armsUp(T + i * 0.37), { mouth: 'grin' });
    else if (mood === 'gasp') put(c, 'court', x, seat, z, 0, lerpPose(P.idle(T), { armL: [-0.2, 0, 2.7], armR: [-0.2, 0, -2.7] }, 1), { mouth: 'o', eyeScale: 1.45 });
    else put(c, 'court', x, seat, z + 0.2, 0, P.sitChair(T + i, 0), { mouth: 'smile' }); }); };
  const tourney = () => { W.tourney.visible = true; W.finalsBanner.visible = false; W.banner.visible = true; };
  const carDrive = (pos, ry, t, expr, talkName, T) => { // grandma driving the yellow supercar
    W.car.visible = true; W.car.position.copy(pos); W.car.rotation.y = ry;
    put(C.grandma, 'town', 0, 0, 0, ry + PI / 2, P.sitChair(t, 1.4), expr); C.grandma.root.position.copy(pos).add(V(-1.4 * Math.cos(ry), 0, 1.4 * Math.sin(ry))); C.grandma.body.position.y = 2.0;
    C.grandma.pose({ armL: [-1.2, 0, 0.1], armR: [-1.9 + ((t % 0.7) < 0.3 ? 0.3 : 0), 0, 0.25] });
    if (talkName) talk(C.grandma, talkName, T);
  };
  // ================= SCENE 1 =================
  shot(0, (t, T, d, ov) => { // aerial town, everyone hooping
    day(); sunAt('town', 0, 0); const u = ease.io(t / d);
    cam('town', mix([-48, 36, 50], [-24, 16, 22], u), mix([-10, 0, -6], [-10, 4, -12], u), 42);
    [[-41.0, -13.6], [4.0, 13.6], [-26, -13.6]].forEach(([x, z], i) => { const k = teens[i]; const sd = z < 0 ? -1 : 1; put(k, 'town', x, 0.02, sd * 9.0, sd < 0 ? PI : 0, ((t + i * 0.5) % 1.2) < 0.4 ? P.shootRelease() : P.shootSet(), { mouth: 'grin' }); const ph = ((t + i * 0.5) % 1.2) / 1.2; ballAt(balls[i], arc(L('town', x, 6.5, sd * 9.4), L('town', x, 7.1, sd * 13.6), 3, Math.min(1, ph * 1.4))); });
    for (let i = 0; i < 2; i++) { const k = teens[3 + i]; put(k, 'town', -30 + i * 14 + t * 2.5, flr.walk, i ? 6.5 : -6.5, PI / 2, P.dribbleWalk(t + i, 1.2), { mouth: 'grin' }); dribble(balls[3 + i], k, t + i, 1.2); }
  });
  shot(2.9, (t, T, d, ov) => { // mystery baller walks on court (only legs/shadow), mayor waiting
    day(); sunAt('court', 12, 0);
    const x = 6 + t * 2.2;
    put(C.grandma, 'court', x, flr.court, 0, PI / 2, P.dribbleWalk(t, 0.9), { mouth: 'smirk', brow: 0.6 }); dribble(balls[0], C.grandma, t, 0.9);
    put(C.mayor, 'court', 22, flr.court, 0, -PI / 2, P.defend(t), { mouth: 'grin', brow: 0.5 }); C.mayor.crown.visible = false;
    cam('court', [x - 2.5, 0.6, 3.5], [x + 3, 1.6, 0], 50);
  });
  shot(4.4, (t, T, d, ov) => { // reveal: it's grandma (87!)
    day(); sunAt('court', 14, 0);
    put(C.grandma, 'court', 14, flr.court, 0, PI / 2 - 0.5, P.dribble(t, 0.7), { mouth: 'smirk', brow: 0.7 }); dribble(balls[0], C.grandma, t, 0.7);
    const z = ease.out(seg(t, 0, 0.6)); cam('court', mix([19, 3.0, 9], [16.2, 4.6, 3.6], z), [14, 4.4 - (1 - z) * 1.2, 0], 40);
  });
  shot(6.4, (t, T, d, ov) => { // dunk on the mayor
    day(); sunAt('court', 24, 0);
    const run = seg(t, 0, 0.6), jmp = seg(t, 0.6, 1.55);
    const x = 16 + run * 5 + jmp * 5.8;
    const y = jmp >= 1 ? 2.5 : flr.court + 4 * 6.0 * jmp * (1 - jmp) * (jmp < 0.5 ? 1 : 0) + (jmp >= 0.5 ? 6.0 - (jmp - 0.5) * 2 * 3.5 : 0);
    put(C.grandma, 'court', jmp >= 1 ? 26.8 : x, y, 0, PI / 2, jmp <= 0 ? P.run(t, 1.3) : jmp < 1 ? P.dunk(jmp) : P.hang(t), { mouth: 'grin', brow: 0.9 });
    if (jmp < 0.8) { if (jmp <= 0) dribble(balls[0], C.grandma, t, 1.5); else hold(balls[0], C.grandma, 'R', [0.3, 0.3, 0]); } else ballAt(balls[0], L('court', R, 8.2 - seg(t, 1.35, 1.75) * 7.6, 0));
    const sq = ease.out(seg(t, 1.3, 1.6));
    put(C.mayor, 'court', 24.8, flr.court, 0, -PI / 2, sq > 0 ? P.fallBack(sq) : lerpPose(P.defend(t), { armL: [0, 0, 2.8], armR: [0, 0, -2.8] }, 1), { mouth: 'o', eyeScale: 1.3 + sq * 0.3, look: [0, -1] }); C.mayor.crown.visible = false;
    const sh = t > 1.3 && t < 1.6 ? [S(t * 60) * 0.18, S(t * 70) * 0.18] : [0, 0];
    if (t < 1.1) cam('court', [16 + t * 1.5, 3, 17], [24, 5.5, 0], 44); else cam('court', [22 + sh[0], 3.4 + sh[1], 7], [25.8, 5.4, 0], 42);
    if (t > 1.3 && t < 1.42) ov.flash(0.5);
  });
  shot(() => e0('g_small') - 0.1, (t, T, d, ov) => { // TOO SMALL!
    day(); sunAt('court', 22, 0);
    put(C.grandma, 'court', 24, flr.court, 0, -PI / 2, lerpPose(P.idle(t), { armR: [-1.0, 0, 0.1], neck: [0.35, 0, 0] }, 1), { mouth: 'grin', brow: 1.0, look: [0, 1] });
    talk(C.grandma, 'g_small', T);
    put(C.mayor, 'court', 21.0, flr.court, 0, PI / 2, P.sitFloor(t), { mouth: 'o', eyeScale: 1.4, look: [0, -1] }); C.mayor.crown.visible = false;
    cam('court', [19.0, 3.8, 1.6], [24, 4.6, 0], 48);
  });
  shot(() => e0('stare'), (t, T, d, ov) => { // mayor disbelief zoom
    day(); sunAt('court', 20, 0);
    put(C.mayor, 'court', 21, flr.court, 0, PI / 2 - 0.9, P.sitFloor(t), { mouth: 'o', eyeScale: 1.5, look: [0.5, -0.6] }); C.mayor.crown.visible = false;
    const z = ease.out(seg(t, 0, 0.35)); cam('court', mix([24.5, 3.2, 6], [22.6, 2.9, 2.4], z), [21, 2.8, 0], 40);
  });
  // ================= SCENE 2 =================
  shot(() => E.stare[1], (t, T, d, ov) => { // mayor's announcement
    day(); sunAt('square', 0, -6);
    put(C.mayor, 'square', 0, 2.15, -10, 0, P.talkGesture(t * 1.2), { mouth: 'grin', brow: -0.2 }); C.mayor.crown.visible = false; C.mayor.pose({ armR: [-2.6 + S(t * 6) * 0.2, 0, -0.3] });
    crowd.slice(0, 7).forEach((c, i) => put(c, 'square', -9 + i * 3, 0.2, 4.5 + (i % 2) * 1.5, PI, P.idle(t + i * 0.3), {}));
    const u = ease.io(t / d); cam('square', mix([0, 9, 16], [0, 7, 3], u), [0, 6.2, -10], 40);
  });
  shot(12.6, (t, T, d, ov) => { // $1,000,000 check, crowd goes wild
    day(); sunAt('square', 0, -2); W.squareConfetti.visible = true; W.squareConfetti.update(t + 1);
    put(C.mayor, 'square', 0, 2.15, -10, 0, lerpPose(P.idle(t), { armL: [0, 0, 2.6], armR: [0, 0, -2.6] }, 1), { mouth: 'grin', brow: 0.4 }); C.mayor.crown.visible = false;
    W.check.visible = true; W.check.position.copy(L('square', 0, 9.6 + S(t * 4) * 0.15, -9.6));
    [C.alex, C.jake, C.baker, C.mailman].forEach((c, i) => put(c, 'square', -4.5 + i * 3, 0.2, -3 + (i % 2) * 1.2, 0, P.armsUp(t + i * 0.3), { mouth: 'grin', eyeScale: 1.2 })); ab();
    cam('square', [3, 4.5, 14], [0, 6.0, -5], 44);
  });
  shot(() => e0('j_bro') - 0.12, (t, T, d, ov) => { // Jake: she's literally somebody's grandma
    day(); sunAt('court', 8, 2);
    put(C.jake, 'court', 8, flr.court, 2, 0.35, lerpPose(P.idle(t), { armR: [-0.9, 0.3, -0.4] }, 1), { mouth: 'smirk', brow: -0.3 });
    talk(C.jake, 'j_bro', T); hold(balls[0], C.jake, 'L', [0, 0.2, 0.3]);
    put(C.grandma, 'court', 15, flr.court, -4, face(15, -4, 8, 2), Q.stretch(t), { mouth: 'smirk', brow: 0.6 });
    cam('court', [6.5, 4.6, 10], [9.2, 4.4, 1.2], 42);
  });
  shot(() => e0('cross'), (t, T, d, ov) => { // crossover, Jake spins and falls
    day(); sunAt('court', 8, 0);
    const cross = seg(t, 0.4, 0.8);
    put(C.grandma, 'court', 4 + t * 2.6, flr.court, -0.4 + S(cross * PI) * 1.6, PI / 2, lerpPose(P.dribble(t, 1.4), { body: [0.3, 0, (cross < 0.5 ? cross : 1 - cross) * 0.7] }, cross > 0 ? 0.8 : 0), { mouth: 'smirk', brow: 0.7 });
    dribble(balls[0], C.grandma, t, 1.4, t > 0.6 ? 1 : -1);
    const f = ease.out(seg(t, 0.7, 1.4));
    const jp = f > 0 ? lerpPose(P.defend(t), { body: [-0.4, 0, 1.3], bodyY: 0.9, legL: [-1.2, 0, 0.8], legR: [0.6, 0, -0.8], neck: [0, 0, 0.4] }, f) : P.defend(t);
    put(C.jake, 'court', 9.5, flr.court, 0, -PI / 2 + f * 6.3, jp, f > 0 ? { mouth: 'o', eyeScale: 1.45 } : { mouth: 'flat', brow: 0.8 });
    if (f > 0.6) stars(C.jake, t);
    const sh = f > 0 && f < 0.6 ? [S(t * 50) * 0.1, S(t * 61) * 0.1] : [0, 0];
    cam('court', [8 + sh[0], 3.2 + sh[1], 14], [8, 2.4, 0], 42);
  });
  shot(() => e0('j_hip') - 0.08, (t, T, d, ov) => { // MY HIP!
    day(); sunAt('court', 9.5, 0);
    put(C.jake, 'court', 9.5, flr.court, 0, 0.3, lerpPose(P.sitFloor(t), { armL: [-0.6, 0, 0.9], armR: [0.2, 0, -0.5], body: [-0.2, 0, 0.3] }, 1), { mouth: 'shout', brow: -1, eyeScale: 1.4, tear: true });
    talk(C.jake, 'j_hip', T); stars(C.jake, t);
    const z = ease.out(seg(t, 0, 0.25)); cam('court', mix([11, 3.4, 8], [10.3, 2.8, 4.4], z), [9.6, 2.5, 0], 40);
  });
  shot(() => e0('walkaway'), (t, T, d, ov) => { // grandma casually walks away
    day(); sunAt('court', 12, 0);
    const p = P.walk(t, 0.7); p.armR = [-1.9 + ((t % 0.8) < 0.3 ? 0.25 : 0), 0, 0.25];
    put(C.grandma, 'court', 13 + t * 1.6, flr.court, 3, PI / 2 + 0.3, p, { mouth: (t % 0.4) < 0.2 ? 'flat' : 'smile', eyeOpen: 0.2, blush: true });
    W.cookie.visible = true; W.cookie.position.copy(C.grandma.handWorld('R')).add(V(0, 0.3, 0.3)); W.cookie.rotation.x = PI / 2;
    put(C.jake, 'court', 9.5, flr.court, 0, 0.3, P.fallBack(1), { eyeOpen: 0.05, mouth: 'wavy' });
    ballAt(balls[0], L('court', 6, 0.65, 4));
    cam('court', [16, 3.6, 13], [12, 2.6, 1.5], 44);
  });
  // ================= SCENE 3 =================
  shot(() => E.walkaway[1], (t, T, d, ov) => { // Alex starts training (sunrise driveway)
    lights({ sky: 0xffc89a, sunColor: 0xffd0a0, sun: 2.2, dir: [-25, 12, 20] }); sunAt('town', -30, -9, [-25, 12, 20]);
    const walk = seg(t, 0, 1.1);
    put(C.alex, 'town', -30, 0.02, -12 + walk * 3, 0, walk < 1 ? P.walk(t, 0.9) : P.idle(t), { brow: 1, mouth: 'flat' }); ab();
    const u = ease.in(t / d); cam('town', mix([-28.8, 1.6, 2], [-29.6, 4.2, -4.5], u), [-30, 4.2, -9], 40);
  });
  const dbs = () => { for (const [db, s] of [[W.tinyDB, 'R'], [W.dumbL, 'L']]) { db.visible = true; db.scale.setScalar(2.6); db.position.copy(C.alex.handWorld(s)).add(V(0, 0.05, 0.1)); } };
  shot(() => e0('h1') - 0.12, (t, T, d, ov) => { // lifting weights
    garageL(); const names = ['h1', 'h2', 'h3']; const u = hussU(T, names, 0.5); const k = hussK(T, names);
    put(C.alex, 'garage', 0, flr.garage, 1, 0, Q.curl(T, u, 1), { brow: 1.1, mouth: 'grit', sweat: true, eyeOpen: 0.7 }); ab();
    for (const n of names) talk(C.alex, n, T); dbs();
    cam('garage', [0.4, 3.8, 11.5 - k * 1.8], [0, 3.4 + k * 0.25, 1], 40 - k * 2);
  });
  shot(() => e0('h4') - 0.12, (t, T, d, ov) => { // practicing jumpers (all clank)
    day(); sunAt('court', 18, 0); const names = ['h4', 'h5', 'h6'];
    let cur = -1; names.forEach((n, i) => { if (T >= e0(n) - 0.12) cur = i; });
    const ts = cur >= 0 ? T - (e0(names[cur]) - 0.12) : 0;
    put(C.alex, 'court', 18, flr.court + (ts > 0.1 && ts < 0.45 ? S((ts - 0.1) / 0.35 * PI) * 1.2 : 0), 1, PI / 2, ts < 0.18 ? P.shootSet() : P.shootRelease(), { brow: 1.1, mouth: 'grit', sweat: true }); ab();
    for (const n of names) talk(C.alex, n, T);
    if (ts < 0.18) hold(balls[0], C.alex, 'R', [0.2, 0.5, 0]); else { const u = seg(ts, 0.18, 0.62); const miss = [[0.4, 1.4], [-0.9, -1.2], [0.6, 0.9]][Math.max(0, cur)]; ballAt(balls[0], u < 1 ? arc(L('court', 18.6, 7.2, 1), L('court', R - 1 + miss[0], 8.6, miss[1] * 0.4), 3, u) : L('court', R - 1 + miss[0] - (ts - 0.62) * 8, Math.max(0.6, 8.6 + (ts - 0.62) * 3 - (ts - 0.62) ** 2 * 18), miss[1] * (1 + ts * 3))); }
    cam('court', [12 - (cur + 1) * 0.5, 3.4, 12 - (cur + 1) * 1.2], [21, 5, 0.5], 44);
  });
  shot(() => e0('h7') - 0.12, (t, T, d, ov) => { // push-ups
    garageL(); const names = ['h7', 'h8', 'h9']; const u = hussU(T, names, 0.45); const k = hussK(T, names);
    put(C.alex, 'garage', -2, flr.garage, 3.8, PI, P.pushup(T, u), { brow: 1.1, mouth: 'grit', sweat: true, eyeOpen: 0.6 }); ab();
    for (const n of names) talk(C.alex, n, T);
    cam('garage', mix([10, 2.6, 3.0], [5, 2.2, 0.8], k / 3), mix([-2, 1.4, 2.2], [-2, 1.4, 0.0], k / 3), 40 - k * 2);
  });
  shot(() => e0('h10') - 0.12, (t, T, d, ov) => { // running around town
    day(); sunAt('town', 10, 6); const names = ['h10', 'h11', 'h12'];
    const x = -6 + t * 7;
    put(C.alex, 'town', x, flr.walk, 6.5, PI / 2, P.run(t, 1.1), { brow: 1.1, mouth: 'grit', sweat: true }); ab();
    for (const n of names) talk(C.alex, n, T);
    cam('town', [x + 7, 4.2, 12.3], [x + 1, 3.6, 6.5], 42);
  });
  shot(() => e0('a_btw') - 0.25, (t, T, d, ov) => { // "While they're out partying, by the way."
    day(); sunAt('town', 9, 6);
    put(C.alex, 'town', 9, flr.walk, 6.5, 0.15, lerpPose(P.idle(t * 2), { body: [0.2, 0, 0], armL: [-0.5, 0, 0.3], armR: [-0.5, 0, -0.3] }, 1), { brow: 0.9, mouth: 'smile', sweat: true, lid: T > 32.2 ? 0.25 : 0 }); ab();
    talk(C.alex, 'a_btw', T);
    const z = ease.out(seg(T, 32.1, 32.4)); cam('town', [9.2, 4.6, 12.3 - z * 1.8], [9, 4.5, 6.5], 36 - z * 4);
  });
  shot(() => e0('lambo'), (t, T, d, ov) => { // grandma's supercar zooms past behind Alex
    day(); sunAt('town', 9, 4);
    const cx = -30 + t * 26;
    carDrive(L('town', cx, 0.08, 2.4), 0, t, { mouth: 'smile', eyeOpen: 0.25, blush: true });
    W.cookie.visible = true; W.cookie.position.copy(C.grandma.handWorld('R')).add(V(0, 0.3, 0.3)); W.cookie.rotation.x = PI / 2;
    put(C.alex, 'town', 9, flr.walk, 6.5, 0.15 + seg(t, 0.8, 1.3) * -1.2, P.idle(t), { mouth: 'flat', brow: 0.4, look: [-0.8, 0] }); ab();
    cam('town', [12, 3.6, 12.4], [3, 3.0, 3], 46);
  });
  shot(() => e0('lambo') + 1.6, (t, T, d, ov) => { // closeup: grandma driving, cookie, unbothered
    day(); sunAt('town', 20, 2);
    const cx = 12 + t * 10;
    carDrive(L('town', cx, 0.08, 2.4), 0, t, { mouth: (t % 0.4) < 0.2 ? 'flat' : 'smile', eyeOpen: 0.2, blush: true });
    W.cookie.visible = true; W.cookie.position.copy(C.grandma.handWorld('R')).add(V(0, 0.3, 0.3)); W.cookie.rotation.x = PI / 2;
    const h = C.grandma.headWorld(); camera.position.set(h.x + 3.6, h.y + 0.6, h.z + 5.2); camera.lookAt(h.x, h.y - 0.6, h.z); camera.fov = 44; camera.updateProjectionMatrix();
  });
  shot(() => e0('stare3'), (t, T, d, ov) => { // Alex stares, confused
    day(); sunAt('town', 9, 6);
    put(C.alex, 'town', 9, flr.walk, 6.5, 0.6, P.idle(t), { mouth: 'flat', eyeScale: 1.35, look: [0.8, 0], brow: -0.5, sweat: true }); ab();
    const z = ease.out(seg(t, 0, 0.3)); cam('town', mix([11.5, 4.6, 11.8], [10.3, 4.6, 9.4], z), [9, 4.6, 6.5], 38);
  });
  // ================= SCENE 4 =================
  const bakeL = () => { interior(); sunAt('bakery', 0, 4); W.bakeryLight.intensity = 90; };
  const gEat = (t, x = -1, z = 1.4, ex) => { const p = P.sitChair(t, 1.75); p.armR = [-1.9 + ((t % 0.6) < 0.25 ? 0.3 : 0), 0, 0.25]; p.armL = [-1.1, 0, -0.2];
    put(C.grandma, 'bakery', x, flr.bakery, z, 0, p, ex || { mouth: (t % 0.3) < 0.15 ? 'flat' : 'smile', eyeOpen: 0.2, blush: true }); W.cookie.visible = true; W.cookie.position.copy(C.grandma.handWorld('R')).add(V(0, 0.3, 0.3)); W.cookie.rotation.x = PI / 2; };
  shot(() => E.stare3[1], (t, T, d, ov) => { // Alex sneaks to the bakery window
    bakeL(); lights({ sun: 2.4 }); sunAt('bakery', 0, 10);
    const x = -9 + ease.out(seg(t, 0, 1.6)) * 7.5;
    put(C.alex, 'bakery', x, 0.02, 12.2, PI / 2, lerpPose(P.walk(t, 0.6), { body: [0.45, 0, 0], bodyY: 1.6 }, 1), { mouth: 'flat', brow: 0.8, look: [-0.7, 0] }); ab();
    W.gtable.visible = W.cookiePile.visible = W.chairB.visible = true; gEat(t);
    cam('bakery', [6, 4.4, 22], [-1, 4.2, 9], 44);
  });
  shot(() => e0('peek'), (t, T, d, ov) => { // through the window: grandma + cookie mountain
    bakeL(); W.gtable.visible = W.cookiePile.visible = W.chairB.visible = true; gEat(t);
    put(C.alex, 'bakery', -1.5, 0.02, 12.0, PI, P.idle(t), { mouth: 'flat', brow: 0.6 }); ab();
    cam('bakery', [-0.6, 5.6, 16.5], [-1, 3.8, 3.5], 40);
  });
  shot(() => e0('b_cookie') - 0.1, (t, T, d, ov) => { // baker: that's your 47th cookie
    bakeL(); W.gtable.visible = W.cookiePile.visible = W.chairB.visible = true; gEat(t);
    put(C.baker, 'bakery', 3.6, flr.bakery, 3.2, face(3.6, 3.2, -1, 1.4) + 0.5, lerpPose(P.idle(t), { armL: [-0.3, 0, 0.6], armR: [-1.4, 0.4, 0] }, 1), { mouth: 'flat', brow: -0.4, lid: 0.25 });
    talk(C.baker, 'b_cookie', T);
    cam('bakery', [6.6, 5.0, 9.2], [3.6, 4.8, 3.2], 40);
  });
  shot(() => e0('g_bulk') - 0.12, (t, T, d, ov) => { // grandma: I'm bulking (flex)
    bakeL(); W.gtable.visible = W.cookiePile.visible = W.chairB.visible = true;
    const p = P.sitChair(t, 1.75); p.armL = [0, 0, 2.2]; p.armR = [-1.6, 0, -0.3];
    put(C.grandma, 'bakery', -1, flr.bakery, 1.4, 0, p, { mouth: 'smirk', brow: 0.8, blush: true });
    C.grandma.armL.children.forEach(m => m.scale.set(1, 1, 1)); talk(C.grandma, 'g_bulk', T);
    cam('bakery', [-1.4, 5.0, 7.2], [-1, 4.6, 1.4], 40);
  });
  shot(() => e0('zoom4'), (t, T, d, ov) => { // Alex confused face at the window
    bakeL(); lights({ sun: 2.2 }); sunAt('bakery', 0, 10);
    put(C.alex, 'bakery', -1.5, 0.02, 12.0, PI, lerpPose(P.idle(t), { neck: [0, 0, 0.2] }, 1), { mouth: 'wavy', eyeScale: 1.4, brow: -0.7, look: [0, 0] }); ab();
    const z = ease.out(seg(t, 0, 0.35)); cam('bakery', [-1.5, 4.6, mix([3], [8.4], z)[0]], [-1.5, 4.6, 12], 40);
  });
  // ================= SCENE 5 =================
  shot(() => E.zoom4[1], (t, T, d, ov) => { // Alex asks the mailman
    day(); sunAt('town', 0, 6);
    put(C.mailman, 'town', 2, flr.walk, 6.5, -PI / 2 + 0.5, P.idle(t), { mouth: 'smile' });
    put(C.alex, 'town', -3 + ease.out(seg(t, 0, 0.8)) * 2.2, flr.walk, 6.5, PI / 2 - 0.4, seg(t, 0, 0.8) < 1 ? P.walk(t, 0.9) : P.talkGesture(t), { mouth: 'flat', brow: 0.6 }); ab();
    cam('town', [1.5, 4.4, 12.3], [0.2, 4.0, 6.5], 46);
  });
  shot(() => e0('m_pkg') - 0.1, (t, T, d, ov) => { // mailman: every morning... mysterious package
    day(); sunAt('town', 2, 6);
    put(C.mailman, 'town', 2, flr.walk, 6.5, -PI / 2 + 0.6, lerpPose(P.idle(t), { body: [0.25, 0, 0], neck: [0.1, -0.3, 0], armR: [-1.2, 0.3, 0.3] }, 1), { mouth: 'smirk', brow: -0.6, lid: 0.3, look: [-0.6, 0] });
    talk(C.mailman, 'm_pkg', T);
    cam('town', [3.6, 4.6, 11.6], [2, 4.6, 6.5], 38);
  });
  shot(() => e0('follow'), (t, T, d, ov) => { // Alex sneakily follows the mailman
    day(); sunAt('town', -8, -6);
    const mx = 4 - t * 4.2;
    put(C.mailman, 'town', mx, flr.walk, -6.5, -PI / 2, P.walk(t, 0.9), { mouth: 'smile' });
    W.mpkg.visible = true; W.mpkg.scale.setScalar(0.55); W.mpkg.position.copy(C.mailman.handWorld('R').lerp(C.mailman.handWorld('L'), 0.5)).add(V(0, -0.2, 0.6)); C.mailman.pose({ armL: [-1.2, 0, -0.2], armR: [-1.2, 0, 0.2] });
    const hide = (t % 1.4) > 0.7;
    put(C.alex, 'town', mx + 8, flr.walk, hide ? -8.6 : -6.5, -PI / 2, lerpPose(P.walk(t * 0.8, 0.7), { body: [0.5, 0, 0], bodyY: 1.5 }, 1), { mouth: 'flat', brow: 0.9, look: [-0.8, 0] }); ab();
    cam('town', [mx + 6, 4.6, 6.5], [mx + 2, 3.2, -7], 46);
  });
  shot(() => e0('n5b'), (t, T, d, ov) => { // package left at grandma's door, Alex peeks from behind mailbox
    day(); sunAt('town', gx, -12);
    W.mpkg.visible = true; W.mpkg.scale.setScalar(1); W.mpkg.position.copy(L('town', gx + 1.5, 0.02, -11.6));
    put(C.mailman, 'town', gx + 6 + t * 3, flr.walk, -6.5, PI / 2, P.walk(t, 0.9), { mouth: 'smile' });
    put(C.alex, 'town', gx - 6.2, 0.02, -8.2, face(gx - 6.2, -8.2, gx + 1.5, -11.6), lerpPose(P.crouch(t), { neck: [0, 0, 0] }, 1), { mouth: 'flat', brow: 1, eyeScale: 1.2 }); ab();
    cam('town', [gx - 9.5, 3.4, -2], [gx, 2.4, -11], 44);
  });
  shot(() => e0('open'), (t, T, d, ov) => { // grandma opens the mystery package... cookies
    day(); sunAt('town', gx, -12);
    const o = ease.io(seg(t, 0.2, 0.7));
    put(C.grandma, 'town', gx + 1.5, 0.02, -13.4, 0, lerpPose(P.crouch(t), { armL: [-1.4 + o * 0.2, 0, 0.6 + o * 1.2], armR: [-1.4 + o * 0.2, 0, -0.6 - o * 1.2] }, 1), { mouth: o > 0.8 ? 'grin' : 'flat', eyeScale: 1 + o * 0.3, blush: o > 0.8 });
    W.mpkg.visible = true; W.mpkg.position.copy(L('town', gx + 1.5, 0.02, -11.6)); W.flapL.rotation.z = o * 2.2; W.flapR.rotation.z = -o * 2.2;
    W.glow.intensity = o * 40; W.glow.position.copy(L('town', gx + 1.5, 3.2, -11.2));
    const z = ease.io(seg(t, 0.5, 1.4)); cam('town', mix([gx + 1.5, 6.2, -5.5], [gx + 1.5, 4.4, -8.6], z), [gx + 1.5, 1.8, -11.6], 44);
    if (o > 0.6 && o < 0.9) ov.flash(0.25);
  });
  shot(() => e0('a_bro') - 0.1, (t, T, d, ov) => { // BRO!
    day(); sunAt('town', gx - 6, -8);
    put(C.alex, 'town', gx - 6.2, 0.02, -8.2, face(gx - 6.2, -8.2, gx - 4, -1), lerpPose(P.idle(t), { armL: [-0.3, 0, 2.4], armR: [-0.3, 0, -2.4] }, 1), { mouth: 'shout', brow: 1.3, eyeScale: 1.35 }); ab();
    talk(C.alex, 'a_bro', T);
    const z = ease.out(seg(t, 0, 0.2)); cam('town', mix([gx - 3, 4.6, -1], [gx - 4.8, 4.6, -4.8], z), [gx - 6.2, 4.6, -8.2], 40);
  });
  shot(() => e1('a_bro') + 0.02, (t, T, d, ov) => { // grandma slowly closes the curtains
    interior({ sun: 1.6, hemi: 0.9 }); sunAt('gwin', 0, 0, [10, 20, 30]); W.gwinLight.intensity = 60;
    const c = ease.io(seg(t, 0.5, d - 0.15));
    put(C.grandma, 'gwin', 0, 0.3, -2.0, 0, lerpPose(P.idle(t), { armL: [-1.6, 0, 0.6 - c * 0.5], armR: [-1.6, 0, -0.6 + c * 0.5] }, 1), { mouth: 'flat', lid: 0.45, look: [0, 0] });
    W.curL.position.set(-3.4 + c * 1.4, 6.1, 0.1); W.curR.position.set(3.4 - c * 1.4, 6.1, 0.1);
    cam('gwin', [0, 5.6, 13 - t * 0.8], [0, 5.6, 0], 40);
  });
  // ================= SCENE 6 =================
  shot(() => E.curtain[1], (t, T, d, ov) => { // Alex challenges grandma
    sunset(); sunAt('court', 4, 0, [30, 14, 10]); crowdBleach(t, 'sit');
    put(C.alex, 'court', -2 + ease.out(seg(t, 0, 1)) * 4, flr.court, 2, PI / 2, seg(t, 0, 1) < 1 ? P.walk(t, 0.9) : P.point(t, 'R'), { brow: 1.1, mouth: 'flat' }); ab();
    put(C.grandma, 'court', 9, flr.court, 2, -PI / 2, P.idle(t), { mouth: 'smirk', brow: 0.4 });
    cam('court', [3.5, 4.0, 14], [4.5, 3.8, 1.5], 42);
  });
  const townRing = (t, mood) => { const ppl = [[C.jake, -6, 14], [C.mayor, -2.5, 15], [C.baker, 2, 15], [C.mailman, 6, 14]];
    ppl.forEach(([c, x, z], i) => put(c, 'court', x, flr.court, z, PI, mood === 'cheer' ? P.armsUp(t + i * 0.3) : mood === 'gasp' ? lerpPose(P.idle(t), { armL: [-0.2, 0, 2.7], armR: [-0.2, 0, -2.7] }, 1) : P.idle(t + i), mood === 'gasp' ? { mouth: 'o', eyeScale: 1.45 } : { mouth: 'grin' })); C.mayor.crown.visible = false; };
  shot(() => e0('crowd'), (t, T, d, ov) => { // whole town gathers
    sunset(); sunAt('court', 4, 0, [30, 14, 10]); crowdBleach(t, 'cheer'); townRing(t, 'cheer');
    put(C.alex, 'court', 2, flr.court, 2, PI / 2, P.idle(t), { brow: 1.1, mouth: 'flat' }); ab();
    put(C.grandma, 'court', 9, flr.court, 2, -PI / 2, P.idle(t), { mouth: 'smirk' });
    const u = ease.io(t / d); cam('court', mix([-14, 16, 34], [-8, 9, 28], u), [4, 2.5, 2], 44);
  });
  shot(() => e0('h13') - 0.1, (t, T, d, ov) => { // Alex aggressive warmup HUSS
    sunset(); sunAt('court', 4, 2, [30, 14, 10]); crowdBleach(t, 'sit');
    const names = ['h13', 'h14', 'h15']; const u = hussU(T, names, 0.45); const k = hussK(T, names);
    put(C.alex, 'court', 2, flr.court + u * 0.9, 2, 0.4, lerpPose(P.idle(t), { armL: [0, 0, 0.3 + u * 2.6], armR: [0, 0, -0.3 - u * 2.6], legL: [0, 0, u * 0.45], legR: [0, 0, -u * 0.45] }, 1), { brow: 1.2, mouth: 'grit', sweat: true }); ab();
    for (const n of names) talk(C.alex, n, T);
    cam('court', [2 + 5.5 * Math.sin(0.4), 3.8 + k * 0.25, 2 + (11 - k * 2.2) * Math.cos(0.4)], [2, 3.6 + k * 0.3, 2], 40);
  });
  shot(() => e0('yawn'), (t, T, d, ov) => { // grandma yawns
    sunset(); sunAt('court', 9, 2, [30, 14, 10]);
    put(C.grandma, 'court', 9, flr.court, 2, -0.2, lerpPose(P.idle(t), { armL: [-0.2, 0, 2.6], armR: [-2.3, 0, 0.3], neck: [-0.25, 0, 0] }, ease.io(seg(t, 0, 0.3))), { mouth: 'o', eyeOpen: 0.05 });
    cam('court', [8.4, 4.6, 7.4], [9, 4.7, 2], 40);
  });
  shot(() => e0('gdunk'), (t, T, d, ov) => { // between the legs + outrageous dunk
    sunset(); sunAt('court', 18, 0, [30, 14, 10]); crowdBleach(t, 'cheer');
    const ax = 17;
    const spin = ease.out(seg(t, 0.55, 1.0));
    put(C.alex, 'court', ax, flr.court, 0, -PI / 2 - spin * 3.2, spin > 0.5 ? lerpPose(P.defend(t), { body: [-0.3, 0, 0.9], bodyY: 1.2 }, spin) : P.defend(t), { mouth: spin > 0 ? 'o' : 'grit', eyeScale: 1 + spin * 0.4, brow: 1 }); ab();
    const run = seg(t, 0.35, 1.2), jmp = seg(t, 1.2, 1.9);
    const gxp = 12 + run * 9 + jmp * 5.8; const gy = jmp >= 1 ? 2.5 : flr.court + S(jmp * PI) * 6.5 * (jmp < 0.7 ? 1 : 0.7 + 0.3 * (1 - jmp));
    put(C.grandma, 'court', jmp >= 1 ? 26.8 : gxp, gy, run > 0 && run < 1 ? S(run * PI) * 2.2 : 0, PI / 2, jmp > 0 ? (jmp < 1 ? P.dunk(jmp) : P.hang(t)) : run > 0 ? P.run(t, 1.4) : P.dribble(t, 1.3), { mouth: 'grin', brow: 0.9 });
    if (t < 0.35) dribble(balls[0], C.grandma, t, 1.3);
    else if (t < 0.75) ballAt(balls[0], L('court', 13 + seg(t, 0.35, 0.75) * 8, 0.6 + Math.abs(S(seg(t, 0.35, 0.75) * PI * 2)) * 0.7, 0));
    else if (jmp < 0.85) hold(balls[0], C.grandma, 'R', [0.3, 0.3, 0]); else ballAt(balls[0], L('court', R, 8.2 - seg(t, 1.75, 2.05) * 7.6, 0));
    if (t > 1.72 && t < 1.82) ov.flash(0.45);
    if (t < 1.0) { cam('court', [ax + 0.5, 0.7, 5.5], [ax - 1, 1.2, 0], 46); ov.filter('saturate(1.25)'); } else cam('court', [18, 3.6, 13], [24, 6, 0], 44);
  });
  shot(() => e0('g_calc') - 0.1, (t, T, d, ov) => { // "Somebody get this child a calculator..."
    sunset(); sunAt('court', 20, 1, [30, 14, 10]); crowdBleach(t, 'cheer');
    put(C.grandma, 'court', 21, flr.court, 1.5, -PI / 2 + 0.5, lerpPose(P.talkGesture(t), { armR: [-1.7, 0, 0.2] }, 0.5), { mouth: 'grin', brow: 0.9, blush: true });
    talk(C.grandma, 'g_calc', T);
    put(C.alex, 'court', 18, flr.court, -1.5, 0.4, P.sitFloor(t), { mouth: 'flat', eyeScale: 1.3, look: [0.6, 0] }); ab();
    const u = ease.io(t / d); cam('court', mix([15.5, 4.4, 9.5], [17.6, 4.7, 6.8], u), [20.6, 4.6, 1.2], 42);
  });
  shot(() => e0('laugh'), (t, T, d, ov) => { // Jake laughing uncontrollably
    sunset(); sunAt('court', -4, 14, [30, 14, 10]); crowdBleach(t, 'sit');
    const b = Math.abs(S(t * 12));
    put(C.jake, 'court', -4, flr.court, 14, PI - 0.3, { body: [0.55 + b * 0.2, 0, S(t * 6) * 0.15], bodyY: 1.75 - b * 0.15, neck: [-0.4 + b * 0.25, 0, 0], armL: [-0.7, 0, 0.5], armR: [-0.6 - b * 0.5, 0, -0.4], legL: [-0.3, 0, 0.15], legR: [-0.3, 0, -0.15] }, { mouth: 'grin', eyeOpen: 0.05, tear: true, blush: true });
    put(C.mailman, 'court', 0, flr.court, 15, PI, P.idle(t), { mouth: 'grin' });
    cam('court', [-3.2, 3.8, 7.5], [-4, 3.2, 14], 42);
  });
  // ================= SCENE 7 =================
  shot(() => E.laugh[1], (t, T, d, ov) => { // grandma celebrates; something drops from her pocket
    sunset(); sunAt('court', 20, 1, [30, 14, 10]); crowdBleach(t, 'cheer');
    put(C.grandma, 'court', 20, flr.court, 2, 0.3, P.dance(t * 1.1, 0), { mouth: 'grin', brow: 0.6, blush: true });
    const fall = seg(T, e0('drop') - 0.6, e0('drop') + 0.1);
    if (fall > 0) { W.ctrl.visible = true; const hp = L('court', 20.6, 2.6, 2.6); W.ctrl.position.copy(hp).lerp(L('court', 21.2, 0.3, 4.2), fall); W.ctrl.position.y = 2.6 - 2.3 * fall * fall; W.ctrl.rotation.set(fall * 4, fall * 2, 0); }
    cam('court', [23.5, 4.2, 13], [20, 3.6, 2], 44);
  });
  shot(() => e0('drop') - 0.25, (t, T, d, ov) => { // slow-mo controller hits the court
    sunset(); sunAt('court', 21, 4, [30, 14, 10]);
    const u = seg(t, 0, 0.7); const y = u < 1 ? 1.9 - 1.6 * u * u : 0.3 + Math.abs(S((t - 0.7) * 9)) * 0.25 * Math.max(0, 1 - (t - 0.7) * 2);
    W.ctrl.visible = true; W.ctrl.position.copy(L('court', 21.2, y, 4.2)); W.ctrl.rotation.set(u * 2.5, 0.5, 0.2);
    put(C.grandma, 'court', 20, flr.court, 2, 0.3, P.dance(t * 0.3, 0), { mouth: 'grin' });
    cam('court', [23.2, 0.7, 7.4], [21.2, 0.6, 4.2], 38); ov.filter('saturate(1.2) contrast(1.05)');
  });
  shot(() => e0('a_wait') - 0.08, (t, T, d, ov) => { // WAIT A MINUTE!
    sunset(); sunAt('court', 21, 6, [30, 14, 10]);
    put(C.alex, 'court', 21.5, flr.court, 6, PI - 0.2, lerpPose(P.idle(t), { armR: [-2.2, 0, 0.2] }, 1), { mouth: 'shout', brow: 1.2, eyeScale: 1.4 }); ab();
    W.ctrl.visible = true; W.ctrl.position.copy(C.alex.handWorld('R')).add(V(0, 0.3, 0)); W.ctrl.rotation.x = 1.2;
    talk(C.alex, 'a_wait', T);
    const z = ease.out(seg(t, 0, 0.25)); cam('court', mix([21, 4.8, 1.5], [21.3, 4.8, 3.3], z), [21.5, 4.9, 6], 42);
  });
  const rudyRoom = (t, T, mash) => { secretL(); W.drawScreens(T); W.gchair.visible = true;
    const p = Q.pad(t, mash); p.bodyY = 2.4 / 1.8 + 1.0; p.legL = [-1.57, 0, 0.05]; p.legR = [-1.57, 0, -0.05];
    put(C.rudy, 'secret', 0, flr.secret, -3.0, PI, p, mash > 0.5 ? { mouth: 'grit', brow: 1.0, eyeScale: 1.15 } : { mouth: 'smirk', brow: 0.4 }); C.rudy.body.position.y = 1.15;
    W.ctrl.visible = true; W.ctrl.scale.setScalar(1.4); W.ctrl.position.copy(C.rudy.handWorld('R').lerp(C.rudy.handWorld('L'), 0.5)).add(V(0, 0.3, -0.4)); W.ctrl.rotation.z = S(t * 40) * 0.08 * mash; W.ctrl.rotation.y = PI; };
  shot(() => e0('cutrudy'), (t, T, d, ov) => { // reveal: Rudy controlling grandma
    rudyRoom(t, T, 0.4);
    const u = ease.io(t / Math.max(0.01, e0('r_square') - e0('cutrudy')));
    cam('secret', mix([0, 9, -9.6], [2.8, 7.4, -9.6], Math.min(u, 1)), [0, 6.6, -3], 46);
    talk(C.rudy, 'r_square', T); if (T >= e0('r_square')) { C.rudy.cur = { mouth: 'grit', brow: 1.2, eyeScale: 1.2 }; talk(C.rudy, 'r_square', T); }
  });
  shot(() => e0('reveal7'), (t, T, d, ov) => { // Rudy presses square -> grandma moves like a video game
    if (t < 0.75) { rudyRoom(t, T, 1); cam('secret', [3.6, 7.6, -9.8], [0, 6.0, -3], 40); }
    else { sunset(); sunAt('court', 12, 2, [30, 14, 10]); const tt = t - 0.75; const step = Math.floor(tt * 6) / 6;
      put(C.grandma, 'court', 12, flr.court + (step % 0.33 < 0.17 ? 0.6 : 0), 2, PI / 2 + step * 6.3, step % 0.33 < 0.17 ? P.armsUp(step) : P.dance(step, 1), { mouth: 'flat', eyeOpen: 1, look: [0, 0], brow: 0 });
      cam('court', [12, 4.6, 11], [12, 4.0, 2], 42); ov.filter('saturate(1.3) contrast(1.1)'); }
  });
  shot(() => e0('gasp'), (t, T, d, ov) => { // the whole town gasps
    sunset(); sunAt('court', 2, 12, [30, 14, 10]); crowdBleach(t, 'gasp'); townRing(t, 'gasp');
    put(C.alex, 'court', 2, flr.court, 9, PI, lerpPose(P.idle(t), { armR: [-2.0, 0, 0.2] }, 1), { mouth: 'o', eyeScale: 1.45 }); ab();
    W.ctrl.visible = true; W.ctrl.position.copy(C.alex.handWorld('R')).add(V(0, 0.3, 0)); W.ctrl.rotation.x = 1.2;
    const z = ease.out(seg(t, 0, 0.3)); cam('court', mix([0, 7, -6], [0, 5.5, 0], z), [0, 3.8, 14], 50);
  });
  // ================= SCENE 8 =================
  shot(() => E.gasp[1], (t, T, d, ov) => { // mayor disqualifies grandma
    sunset(); sunAt('court', 4, 4, [30, 14, 10]); crowdBleach(t, 'sit');
    put(C.mayor, 'court', 4, flr.court, 4, -0.6, lerpPose(P.idle(t), { armL: [-1.5, 0.6, 0.9], armR: [-1.5, -0.6, -0.9] }, ease.out(seg(t, 0.3, 0.6))), { mouth: 'flat', brow: 1.2 }); C.mayor.crown.visible = false;
    put(C.grandma, 'court', 0.5, flr.court, 6.5, face(0.5, 6.5, 4, 4), lerpPose(P.idle(t), { armL: [0, 0, 0.9], armR: [0, 0, -0.9] }, ease.out(seg(t, 1.0, 1.4))), { mouth: 'smirk', brow: -0.3, lid: 0.3 });
    cam('court', [6.5, 4.4, 13.5], [2.4, 3.8, 5], 42);
  });
  shot(() => e0('brief'), (t, T, d, ov) => { // mayor hands Alex the $1M briefcase
    sunset(); sunAt('court', 4, 4, [30, 14, 10]); crowdBleach(t, 'cheer');
    put(C.mayor, 'court', 4, flr.court, 4, -PI / 2, lerpPose(P.idle(t), { armR: [-1.4, 0, 0] }, 1 - seg(t, 0.6, 0.9)), { mouth: 'grin' }); C.mayor.crown.visible = false;
    const got = t > 0.6;
    put(C.alex, 'court', 0.8, flr.court, 4, PI / 2, lerpPose(P.idle(t), { armL: [-1.3, 0, -0.3], armR: [-1.3, 0, 0.3] }, 1), { mouth: got ? 'grin' : 'o', eyeScale: 1.3, blush: got }); ab();
    W.brief.visible = true; W.brief.rotation.y = PI / 2;
    W.brief.position.copy(got ? C.alex.handWorld('R').lerp(C.alex.handWorld('L'), 0.5).add(V(0.5, 0.5, 0)) : C.mayor.handWorld('R').add(V(-0.4, 0.3, 0)));
    W.briefLid.rotation.x = got ? -ease.out(seg(t, 0.8, 1.1)) * 1.8 : 0;
    cam('court', [2.4, 4.6, 10.5], [2.4, 4.0, 4], 42);
  });
  shot(() => e0('steal'), (t, T, d, ov) => { // grandma snatches it and jumps in her car
    sunset(); sunAt('court', 2, 10, [30, 14, 10]); crowdBleach(t, 'gasp');
    const run = seg(t, 0, 0.45);
    put(C.alex, 'court', 0.8, flr.court, 4, PI / 2 + run * 0.8, lerpPose(P.idle(t), { armL: [-1.3, 0, -0.3], armR: [-1.3, 0, 0.3] }, 1 - run), { mouth: 'o', eyeScale: 1.5 }); ab();
    const gpos = [-1 + run * 2.5, run < 0.5 ? 6 : 6 + (run - 0.5) * 2 * 14];
    if (t < 0.8) { put(C.grandma, 'court', gpos[0], flr.court, gpos[1], 0, P.run(t, 1.5), { mouth: 'grin', brow: 0.8 }); W.brief.visible = true; W.brief.position.copy(run < 0.4 ? C.alex.handWorld('R').lerp(C.alex.handWorld('L'), 0.5).add(V(0.5, 0.5, 0)) : C.grandma.handWorld('R').add(V(0, -0.2, 0.3))); }
    else { carDrive(L('court', 1 + (t - 0.8) * 4, 0.08, 24), 0, t, { mouth: 'grin', brow: 0.8 }); W.brief.visible = true; W.brief.position.copy(C.grandma.handWorld('L').add(V(0, 0.4, 0))); }
    if (t >= 0.8) { W.car.visible = true; } else { W.car.visible = true; W.car.position.copy(L('court', 1, 0.08, 24)); W.car.rotation.y = 0; }
    cam('court', [9, 5, 9], [1, 3.2, 14], 50);
  });
  shot(() => e0('g_party') - 0.1, (t, T, d, ov) => { // speeding away: "While they're out partying, by the way!"
    sunset(); sunAt('court', 10 + t * 14, 24, [30, 14, 10]);
    const cx = 4 + t * t * 7 + t * 4;
    carDrive(L('court', cx, 0.08, 24), 0, t, { mouth: 'grin', brow: 0.8, blush: true }, 'g_party', T);
    C.grandma.pose({ armR: [-0.3, 0, -2.8 + S(t * 14) * 0.3] });
    W.brief.visible = true; W.brief.position.copy(C.grandma.handWorld('R').add(V(0, 0.6, 0)));
    const h = C.grandma.headWorld(); camera.position.set(h.x + 4.2, h.y + 0.5, h.z + 5.6); camera.lookAt(h.x - 0.3, h.y - 0.4, h.z); camera.fov = 44; camera.updateProjectionMatrix();
  });
  shot(() => e0('stare8'), (t, T, d, ov) => { // Alex silently stares into the camera
    sunset(); sunAt('court', 2, 6, [30, 14, 10]);
    put(C.alex, 'court', 2, flr.court, 6, 0, P.idle(t), { mouth: 'flat', brow: -0.2, lid: 0.3 }); ab();
    cam('court', [2, 4.6, 11.2], [2, 4.6, 6], 36);
  });
  shot(() => e0('a_home') - 0.05, (t, T, d, ov) => { // "I should've stayed home."
    sunset(); sunAt('court', 2, 6, [30, 14, 10]);
    put(C.alex, 'court', 2, flr.court, 6, 0, P.idle(t), { mouth: 'flat', brow: -0.4, lid: 0.35 }); ab();
    talk(C.alex, 'a_home', T);
    cam('court', [2, 4.65, 9.6], [2, 4.65, 6], 34);
  });
  shot(() => 89.9, (t, T, d, ov) => { ov.black(1); day(); cam('town', [0, 5, 10], [0, 5, 0], 40); });

  SH.forEach(s => { if (typeof s.a === 'function') s.a = s.a(); });
  for (let i = 1; i < SH.length; i++) if (!(SH[i].a > SH[i - 1].a)) console.log('SHOT ORDER PROBLEM', i, SH[i - 1].a, SH[i].a);
  console.log('shots', SH.length);
}
