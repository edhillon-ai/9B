# Voices + sound effects only (no background music) -> audio/mix.wav, 48 kHz stereo, exactly 90.0 s
import json, numpy as np, soundfile as sf, re
src = open('../prod/mix.py').read()
lib = src[src.index('def tt(d)'):src.index('# ---------- music sections ----------')] + src[src.index('# ---------- SFX ----------'):src.index('e0 = lambda n: E[n][0]')]
SR = 48000; DUR = 90.0; N = int(SR * DUR); rng = np.random.default_rng(5)
T = json.load(open('timeline.json')); E = T['ev']
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vox = np.zeros(N)
exec(lib)
e0 = lambda n: E[n][0]
def heartbeat(t0, t1, bpm=70, g=0.9):
    t = t0
    while t < t1: put(sfx, kick() * 0.9, t, g); put(sfx, kick() * 0.6, t + 0.22, g); t += 60 / bpm
def siren(d):
    t = tt(d); f = 700 + 350 * np.sin(2 * np.pi * 1.3 * t); return np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.13 * env_adsr(len(t), 0.05, 0.2)
def err(): t = tt(0.5); return (np.sin(2 * np.pi * 440 * t) * (t < 0.18) + np.sin(2 * np.pi * 330 * t) * (t > 0.22)) * env_adsr(len(t), 0.005, 0.05) * 0.18
def beep(f=1800, d=0.08): t = tt(d); return np.sin(2 * np.pi * f * t) * env_adsr(len(t), 0.003, 0.02) * 0.12
def click(): t = tt(0.04); return bp(noise(0.04), 2000, 8000) * np.exp(-t * 120) * 0.6
def bird(): t = tt(0.35); return np.sin(2 * np.pi * np.cumsum(3200 + 900 * np.sin(2 * np.pi * 14 * t)) / SR) * env_adsr(len(t), 0.02, 0.1) * 0.05
def step(): return lp_fast(noise(0.08), 900) * np.exp(-tt(0.08) * 50) * 0.35
def door(): t = tt(0.8); return lp_fast(noise(0.8), 1200) * np.exp(-t * 4) * 0.25 + np.sin(2 * np.pi * np.cumsum(500 + 300 * np.sin(t * 9)) / SR) * env_adsr(len(t), 0.05, 0.2) * 0.05
def thud(): return boom(0.4, 70) * 0.8
def zap(): t = tt(0.35); return np.sin(2 * np.pi * np.cumsum(1200 - 900 * t / 0.35) / SR) * env_adsr(len(t), 0.005, 0.05) * 0.15
def snore(d=1.2): t = tt(d); return lp_fast(noise(d), 400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.9 * t - 1.5)) ** 2 * 0.35
def shimmer(): t = tt(1.2); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 3) for f in [1568, 2093, 2637, 3136]) * 0.04
def sadbone():
    out = []
    for m, d in [(52, 0.35), (51, 0.35), (50, 0.9)]:
        t = tt(d); f = midi(m) * (1 - 0.03 * t / d); x = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) * 0.8 ** k for k in range(1, 8)); out.append(lp_fast(x, 1600) * env_adsr(len(t), 0.03, 0.08) * 0.2)
    return np.concatenate(out)
def suspense(t0, t1, root=40, g=0.25):
    d = t1 - t0; t = tt(d); x = np.sin(2 * np.pi * midi(root) * t) + 0.5 * np.sin(2 * np.pi * midi(root + 1) * t) + 0.3 * lp_fast(noise(d), 300)
    put(sfx, x * env_adsr(len(t), 0.6, 0.4) * g, t0)
def mower(d):
    t = tt(d); x = np.sin(2 * np.pi * np.cumsum(55 + 6 * np.sin(2 * np.pi * 9 * t)) / SR); x = np.sign(x) * np.abs(x) ** 0.5
    return lp_fast(x + 0.4 * noise(d), 1400) * env_adsr(len(t), 0.05, 0.1) * 0.12
def notif(): t = tt(0.35); return (np.sin(2 * np.pi * 1318 * t) * (t < 0.14) + np.sin(2 * np.pi * 1976 * t) * (t > 0.12)) * np.exp(-t * 8) * 0.22
def splash(): return lp_fast(noise(0.9), 3000) * np.exp(-tt(0.9) * 4) * 0.4
def rustle(d=0.4): return bp(noise(d), 1500, 6000) * env_adsr(int(d * SR), 0.03, 0.15) * 0.25
def jet(d): t = tt(d); return (lp_fast(noise(d), 900) * 0.5 + 0.2 * np.sin(2 * np.pi * np.cumsum(300 + 400 * t / d) / SR)) * env_adsr(len(t), 0.4, 0.3) * 0.45
# ambience: birds by day
for k in range(14): put(sfx, bird(), 0.3 + k * 0.6 + rng.random() * 0.3, 0.6, rng.uniform(-0.7, 0.7))
# S1
for k in range(10): put(sfx, rustle(0.3), 0.4 + k * 0.35, 0.4, rng.uniform(-0.6, 0.6))
put(sfx, crowd(3.0, 'cheer'), 0.4, 0.35); put(sfx, engine(1.5) * 1.3, 2.3, 0.8); put(sfx, whoosh(0.7, 200, 2500), 3.0, 0.7)
put(sfx, sadbone(), e0('n1b') + 0.1, 0.8)
put(sfx, engine(2.2) * 1.6, e0('bug') - 0.3, 0.9); put(sfx, honk(), e0('bug') + 0.6, 0.8)
for k in range(5): put(sfx, kaching() * 0.5, e0('g_money') + 0.2 + k * 0.45, 0.5)
put(sfx, cricket(1.0), e0('speechless'), 0.9); put(sfx, whoosh(0.5, 400, 3000), e0('speechless') + 0.5, 0.4)
# S2
put(sfx, boom(0.8, 50), e0('n2') + 0.6, 0.5); put(sfx, shimmer(), e0('n2') + 0.8, 0.8)
put(sfx, mower(3.6), e0('n2') + 1.55, 0.7)
for n in ['h1','h2','h3','h4','h5','h6']: put(sfx, boom(0.6, 52), E[n][0], 0.55); put(sfx, whoosh(0.3), E[n][0] - 0.1, 0.4)
for k in range(5): put(sfx, step() * 1.3, e0('h3') + k * 0.13, 0.6)
for k in range(10): put(sfx, squeak() * 0.5, e0('h4') + k * 0.11, 0.35)
put(sfx, thud(), e0('h6') + 0.3, 0.6)
put(sfx, scratch(), e0('party') - 0.05, 0.6)
for k in range(6): put(sfx, kick() * 0.8, e0('party') + k * 0.25, 0.7); put(sfx, hat(), e0('party') + 0.125 + k * 0.25, 0.5)
put(sfx, crowd(1.4, 'cheer'), e0('party'), 0.5)
put(sfx, wahwah(), e0('pay') + 0.6, 0.7); put(sfx, boom(0.6, 45), e0('a_bro'), 0.6)
# S3
for k in range(6): put(sfx, step(), e0('n3') + k * 0.35, 0.5)
put(sfx, shimmer(), e0('n3') + 1.9, 1.2)
put(sfx, cricket(0.4), E['b_zero'][1], 0.7)
put(sfx, door(), e0('ferrari') + 0.1, 0.5); put(sfx, engine(2.0) * 1.7, e0('ferrari') + 0.8, 0.95); put(sfx, whoosh(0.9, 200, 2500), e0('ferrari') + 1.4, 0.8)
put(sfx, boing(), e0('confused') + 0.1, 0.6)
# S4
put(sfx, shimmer(), e0('n4') + 0.3, 0.8)
put(sfx, bonk() * 0.5, E['m_none'][1] - 0.2, 0.5); put(sfx, splash(), e0('pool') + 0.1, 0.6); put(sfx, cricket(0.8), e0('pool') + 0.7, 0.6)
put(sfx, notif(), e0('ding') + 0.25, 1.0); put(sfx, kaching(), e0('ding') + 0.45, 0.9)
put(sfx, whoosh(0.4), e0('a_teach') + 0.05, 0.6)
for k in range(8): put(sfx, step() * 1.3, e0('runaway') + k * 0.14, 0.6)
put(sfx, thud(), e0('runaway') + 0.05, 0.6)
# S5
suspense(e0('n5'), e0('office'), 40, 0.15)
for k in range(30): put(sfx, click() * 0.6, e0('office') + k * 0.12, 0.5)
put(sfx, engine(1.0) * 0.4, e0('office'), 0.4)
put(sfx, rewind(), e0('cut5') - 0.05, 0.6)
put(sfx, crunch(), e0('h7') + 0.05, 0.8); put(sfx, crunch(), e0('h7') + 0.3, 0.8)
put(sfx, clang() * 0.6, e0('h8') + 0.2, 0.6); put(sfx, boom(0.8, 45), e0('h9') + 0.05, 0.8)
for n in ['h7','h8','h9']: put(sfx, whoosh(0.3), E[n][0] - 0.1, 0.4)
put(sfx, wahwah(), e0('pay2') + 0.2, 0.7)
put(sfx, thud(), e0('a_done') + 0.7, 0.9); put(sfx, crash() * 0.4, e0('a_done') + 0.72, 0.4)
# S6 (night)
for k in range(5): put(sfx, cricket(1.2), E['donehold'][1] + k * 2.2, 0.35, rng.uniform(-0.5, 0.5))
put(sfx, owl(), E['donehold'][1] + 0.8, 0.6)
for k in range(10): put(sfx, step() * 0.6, e0('n6b') + k * 0.22, 0.4)
for k in range(5): put(sfx, rustle(0.25), e0('bush') + k * 0.36, 0.7)
for k in range(3): put(sfx, rustle(0.25), e0('pass') + k * 0.28, 0.7)
put(sfx, scratch(), e0('freeze'), 0.5); heartbeat(e0('freeze') + 0.1, E['freeze'][1], 110, 0.5)
put(sfx, rustle(0.6), e0('shrug') + 0.6, 0.5); put(sfx, door() * 0.6, e0('shrug') + 1.0, 0.5)
# S7
for k in range(4): put(sfx, rustle(0.3), e0('n7') + k * 0.45, 0.6)
suspense(e0('n7') + 0.5, e0('peek'), 38, 0.2)
put(sfx, boom(1.4, 38), e0('peek'), 0.9); put(sfx, shimmer(), e0('peek') + 0.05, 1.0)
for k in range(16): put(sfx, click(), e0('admin') + k * 0.06, 0.7)
put(sfx, beep(1600, 0.12), e0('admin') + 0.9, 0.8); put(sfx, zap(), e0('admin') + 0.95, 0.8)
put(sfx, crowd(1.2, 'cheer'), e0('admin') + 1.05, 0.7); [put(sfx, notif(), e0('admin') + 1.1 + k * 0.17, 0.5, rng.uniform(-0.6, 0.6)) for k in range(5)]
put(sfx, slam(), e0('burst') + 0.08, 1.0)
put(sfx, boom(1.2, 40), e0('zoomface'), 0.9); put(sfx, whoosh(0.5, 300, 3000), e0('zoomface'), 0.7); put(sfx, sadbone(), e0('zoomface') + 0.4, 0.6)
# S8
put(sfx, click(), E['zoomface'][1] + 1.2, 1.0); put(sfx, pop(), E['zoomface'][1] + 1.22, 0.8)
for k in range(14): put(sfx, notif(), e0('billion') + k * 0.075, 0.55, rng.uniform(-0.5, 0.5))
put(sfx, boom(1.0, 45), e0('billion') + 0.6, 0.9); for_k = [put(sfx, kaching(), e0('billion') + 0.62 + k * 0.2, 0.6) for k in range(3)]
put(sfx, crowd(1.0, 'cheer'), e0('buy'), 0.6); put(sfx, kaching(), e0('buy') + 0.05, 0.8); put(sfx, engine(0.7) * 1.4, e0('buy') + 0.6, 0.8); put(sfx, jet(0.9), e0('buy') + 1.2, 0.9)
put(sfx, mower(2.4), E['buy'][1], 0.6)
for n in ['j1','j2','j3']: put(sfx, boom(0.6, 52), E[n][0], 0.5)
put(sfx, engine(1.6) * 1.5, e0('a_final') - 0.2, 0.7); put(sfx, honk(), E['a_final'][1] - 0.2, 0.5)
# voices
for l in T['lines']:
    s, sr = sf.read(f"audio/lines/{l['id']}.wav")
    if s.ndim > 1: s = s.mean(1)
    n = int(len(s) * SR / sr); s = np.interp(np.linspace(0, len(s) - 1, n), np.arange(len(s)), s)
    s = s / (np.abs(s).max() + 1e-9) * (0.85 if l['id'] in ('hussL', 'j_hussL', 'g_money', 'a_bro', 'a_teach', 'a_done', 'a_why') else 0.78)
    put(vox, s, l['start'])
venv = np.zeros(N)
for l in T['lines']: i = int(l['start'] * SR); venv[i:i + int(l['dur'] * SR)] = 1
k = int(0.12 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same')
sfx *= (1 - 0.4 * venv)[:, None]
mix = sfx * 0.75 + vox[:, None]
mix[int(89.94 * SR):] *= np.linspace(1, 0, N - int(89.94 * SR))[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
pk = np.abs(mix).max(); mix = mix / pk * 0.93 if pk > 0.93 else mix
sf.write('audio/mix.wav', mix.astype(np.float32), SR, subtype='PCM_16'); print('ok', pk)
