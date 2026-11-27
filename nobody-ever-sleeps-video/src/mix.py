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
def airhorn(d=0.9):
    t = tt(d); x = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in [466, 587, 698]); return lp_fast(x, 3500) * env_adsr(len(t), 0.01, 0.1) * 0.12
def buzz(d): t = tt(d); x = np.sign(np.sin(2 * np.pi * 120 * t)) * 0.5 + np.sin(2 * np.pi * 240 * t); return bp(x + 0.3 * noise(d), 200, 4000) * env_adsr(len(t), 0.02, 0.05) * 0.18
def shutter(): return np.concatenate([click() * 1.2, np.zeros(int(0.05 * SR)), click()])
def creak(d=1.4): t = tt(d); return np.sin(2 * np.pi * np.cumsum(180 + 90 * np.sin(2 * np.pi * 1.3 * t) + 40 * noise(d)) / SR) * env_adsr(len(t), 0.1, 0.3) * 0.08
def thunder(): return lp_fast(noise(1.6), 300) * np.exp(-tt(1.6) * 1.8) * 0.9
def party_thump(t0, t1, g=0.6):
    t = t0
    while t < t1: put(sfx, kick() * 0.8, t, g); put(sfx, hat(), t + 0.25, g * 0.6); t += 0.5
# S1 (4 AM party)
party_thump(0.0, 4.0, 0.5); put(sfx, crowd(3.6, 'cheer'), 0.1, 0.4); put(sfx, owl(), 1.9, 0.5)
suspense(2.6, 4.5, 38, 0.2); put(sfx, thunder(), e0('pushup') - 0.3, 0.8); put(sfx, scratch(), e0('pushup'), 0.5)
for k in range(10): put(sfx, thud() * 0.4, e0('pushup') + k * 0.35, 0.5)
for k in range(3): put(sfx, snore(0.6) * 0.8, e0('sleepy') + k * 0.5, 0.5)
put(sfx, boing(), e0('sleepy') + 1.25, 0.6)
# S2 (gym)
put(sfx, boom(0.8, 50), e0('n2') + 0.4, 0.5)
for n in ['h1', 'h2', 'h3']: put(sfx, boom(0.6, 52), E[n][0], 0.55); put(sfx, whoosh(0.3), E[n][0] - 0.1, 0.4)
put(sfx, clang(), e0('h3') + 0.3, 0.7)
party_thump(e0('party2'), E['party2'][1], 0.7); put(sfx, crowd(1.3, 'cheer'), e0('party2'), 0.6)
put(sfx, snore(0.8), e0('doze') + 0.2, 0.7); put(sfx, whoosh(0.6, 200, 2000), e0('doze') + 0.6, 0.6); put(sfx, thud(), e0('doze') + 1.15, 1.0); put(sfx, boing(), e0('doze') + 1.2, 0.7)
# S3 (bakery)
for k in range(8): put(sfx, lp_fast(noise(0.15), 600) * 0.6, e0('n3') + 0.8 + k * 0.32, 0.7)
put(sfx, cricket(0.5), E['b_yes'][1], 0.7)
for k in range(16): put(sfx, swish(), e0('pizzas') + k * 0.12, 0.35, rng.uniform(-0.5, 0.5))
for k in range(6): put(sfx, pop(), e0('pizzas') + 0.1 + k * 0.3, 0.4)
put(sfx, lp_fast(noise(0.3), 800) * 0.5, e0('sip') + 0.3, 0.6); put(sfx, boing(), e0('sip') + 0.9, 0.7)
put(sfx, buzz(2.6) * 0.8, e0('f1'), 0.5)
# S4 (mailman)
for k in range(14): put(sfx, step() * 1.3, E['vibe'][1] + k * 0.1, 0.6)
for k in range(6): put(sfx, whoosh(0.25, 500, 4000), E['vibe'][1] + 0.2 + k * 0.4, 0.4)
for k in range(10): put(sfx, whoosh(0.2, 500, 4000), e0('n4') + 1.5 + k * 0.15, 0.3)
put(sfx, scratch(), e0('sprint') + 0.35, 0.6)
put(sfx, boom(0.6, 45), e0('a_bro'), 0.6)
put(sfx, whoosh(0.5, 600, 5000), e0('shoes') + 0.1, 0.9); put(sfx, pop(), e0('shoes') + 0.12, 0.7); put(sfx, cricket(0.8), e0('shoes') + 0.6, 0.7)
# S5 (mayor)
for k in range(6): put(sfx, step(), E['shoes'][1] + k * 0.32, 0.5)
put(sfx, boom(1.0, 40), e0('bags'), 0.6); suspense(e0('my_talk'), E['my_talk'][1] + 0.3, 40, 0.18)
put(sfx, snore(1.2), e0('doze2') + 0.2, 0.7)
put(sfx, airhorn(0.9), e0('horn'), 1.0)
for n in ['m1', 'm2', 'm3']: put(sfx, boom(0.6, 52), E[n][0], 0.5)
for k in range(5): put(sfx, step() * 0.5, e0('backout') + k * 0.25, 0.5)
# S6 (bedroom)
for k in range(4): put(sfx, cricket(1.2), E['backout'][1] + k * 1.5, 0.3, rng.uniform(-0.5, 0.5))
put(sfx, door() * 0.6, e0('n6') + 1.6, 0.5)
put(sfx, click(), e0('sleep') + 0.7, 0.9); put(sfx, snore(1.6), e0('sleep') + 0.6, 0.6)
put(sfx, creak(1.6), e0('enter'), 0.9); heartbeat(e0('enter') + 0.8, E['approach'][1], 70, 0.5)
for k in range(4): put(sfx, snore(1.0) * 0.5, e0('enter') + 0.5 + k * 1.3, 0.4)
suspense(e0('horror'), E['approach'][1] + 1.5, 37, 0.22)
for k in range(10): put(sfx, beep(1200 + (k % 3) * 300, 0.06), e0('approach') + k * 0.2, 0.25)
# S7 (reveal)
put(sfx, door() * 0.4, E['approach'][1] + 0.8, 0.6); put(sfx, boom(1.2, 38), E['approach'][1] + 1.6, 0.6)
put(sfx, boom(1.4, 38), e0('reveal'), 0.9); put(sfx, shimmer(), e0('reveal'), 1.2); put(sfx, crowd(1.0, 'ooh'), e0('reveal') + 0.4, 0.5)
put(sfx, buzz(1.4), e0('shave'), 1.0); put(sfx, pop(), e0('shave') + 1.35, 0.9); put(sfx, boing(), e0('shave') + 1.4, 0.7)
put(sfx, boom(0.8, 40), e0('mirror') + 0.3, 0.6); put(sfx, kaching(), e0('g_fifty') + 1.0, 0.6)
for k in [0, 0.75, 1.5]: put(sfx, shutter(), e0('photos') + k, 1.0)
put(sfx, sadbone(), e0('photos') + 1.6, 0.7)
# S8
put(sfx, boom(0.8, 50), e0('n8') + 0.3, 0.5)
for n in ['h4', 'h5', 'h6']: put(sfx, boom(0.6, 52), E[n][0], 0.55); put(sfx, whoosh(0.3), E[n][0] - 0.1, 0.4)
put(sfx, snore(1.1), e0('asleep') + 0.3, 0.8)
put(sfx, buzz(0.5) * 0.6, e0('asleep') + 1.0, 0.4)
for k in range(3): put(sfx, bird(), e0('morning') + k * 0.3, 0.8); put(sfx, cricket(0.6), e0('morning') + 0.3, 0.5)
put(sfx, engine(2.2) * 1.6, e0('g_money') - 0.3, 0.9); put(sfx, honk(), e0('g_money') + 1.0, 0.7); put(sfx, cricket(0.6), e0('look'), 0.8)
# voices
for l in T['lines']:
    s, sr = sf.read(f"audio/lines/{l['id']}.wav")
    if s.ndim > 1: s = s.mean(1)
    n = int(len(s) * SR / sr); s = np.interp(np.linspace(0, len(s) - 1, n), np.arange(len(s)), s)
    s = s / (np.abs(s).max() + 1e-9) * (0.85 if l['id'] in ('hussL', 'hussF', 'g_sleep', 'g_money', 'a_bro', 'a_awake', 'my_hussL', 'j_hair') else 0.78)
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
