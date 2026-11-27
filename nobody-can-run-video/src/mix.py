# Voices + sound effects only (no background music) -> audio/mix.wav, 48 kHz stereo, exactly 90.0 s
import json, numpy as np, soundfile as sf, re
src = open('../prod/mix.py').read()
lib = src[src.index('def tt(d)'):src.index('# ---------- music sections ----------')] + src[src.index('# ---------- SFX ----------'):src.index('e0 = lambda n: E[n][0]')]
SR = 48000; DUR = 90.0; N = int(SR * DUR); rng = np.random.default_rng(5)
T = json.load(open('timeline.json')); E = T['ev']
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vox = np.zeros(N)
exec(lib)
e0 = lambda n: E[n][0]
e1 = lambda n: E[n][1]
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
def steps(t0, t1, every, g=0.5):
    t = t0
    while t < t1: put(sfx, step(), t, g, rng.uniform(-0.3, 0.3)); t += every
def vanhum(d): t = tt(d); return lp_fast(saw(26, d) * (1 + 0.2 * np.sin(2 * np.pi * 3 * t)), 500) * env_adsr(len(t), 0.4, 0.3) * 0.5
def tear(): return bp(noise(0.35), 1200, 6000) * np.exp(-tt(0.35) * 8) * 0.5
def thud(): return boom(0.4, 70) * 0.8
def huss_hit(n): put(sfx, boom(0.6, 52), E[n][0], 0.55); put(sfx, whoosh(0.3), E[n][0] - 0.1, 0.4)
# S1 (slow chase)
for k in range(5): put(sfx, bird(), 0.3 + k * 1.9, 0.5, rng.uniform(-0.6, 0.6))
put(sfx, siren(3.0) * 0.6, 0.0, 0.35); steps(0.0, 10.0, 0.75, 0.35)
put(sfx, boom(0.5, 60), e0('p_stop'), 0.4); put(sfx, cricket(1.2), e0('same') + 0.4, 0.6)
put(sfx, boom(1.0, 40), e0('stare') + 0.6, 0.5)
# S2 (race)
put(sfx, crowd(3.5, 'cheer'), e0('n2') + 1.0, 0.45); put(sfx, whistle(0.7), e0('whistle') + 0.15, 0.8)
put(sfx, crowd(1.2, 'cheer'), e0('whistle') + 0.5, 0.5); steps(e0('slow'), e1('g_mouth'), 0.9, 0.4)
put(sfx, cricket(1.0), e0('slow') + 0.3, 0.6); put(sfx, kaching(), e0('win') + 1.3, 0.6); put(sfx, crowd(1.2, 'cheer'), e0('win') + 1.1, 0.6); put(sfx, pop(), e0('win') + 1.1, 0.7)
# S3 (grind)
put(sfx, boom(1.0, 45), e0('n3') + 1.4, 0.6); steps(e0('n3') + 1.6, e1('n3'), 0.18, 0.4)
for n in ['h1', 'h2', 'h3']: huss_hit(n)
put(sfx, clang(), e0('h2') + 0.28, 0.6)
party_thump(e0('party'), e1('party'), 0.7); put(sfx, crowd(1.1, 'cheer'), e0('party'), 0.5)
put(sfx, beep(1500, 0.08), e0('fly') + 0.25, 0.7); put(sfx, whoosh(0.8, 200, 3000), e0('fly') + 0.4, 0.6); put(sfx, whoosh(0.6, 600, 5000), e0('fly') + 0.75, 0.8)
put(sfx, thud(), e0('fly') + 1.25, 1.0); put(sfx, boing(), e0('fly') + 1.28, 0.7); put(sfx, cricket(0.8), e1('a_part'), 0.4)
# S4 (mailman)
for k in range(4): put(sfx, bird(), e0('n4') + 0.2 + k * 1.6, 0.4)
steps(e0('n4'), e1('m_2014'), 1.2, 0.35); put(sfx, cricket(0.9), e0('slowmail') + 0.2, 0.5)
put(sfx, rustle(0.5), e0('open') + 0.3, 0.8); put(sfx, shimmer(), e0('open') + 0.75, 1.3); put(sfx, crowd(0.9, 'ooh'), e0('open') + 0.8, 0.4)
put(sfx, boom(0.6, 50), e0('c_fin'), 0.5); put(sfx, sadbone(), e0('shake') + 0.1, 0.5)
# S5 (running through town)
steps(e0('n5'), e1('ignore'), 0.13, 0.35)
for k in range(6): put(sfx, whoosh(0.3, 500, 4000), e0('n5') + 0.3 + k * 0.42, 0.35)
put(sfx, crowd(2.0, 'ooh'), e0('n5') + 0.8, 0.5); put(sfx, whoosh(0.4, 400, 4000), e0('bread') + 0.25, 0.7)
for k in range(4): put(sfx, thud() * 0.5, e0('bread') + 0.5 + k * 0.07, 0.6)
put(sfx, clang() * 0.6, e0('trash') + 0.5, 0.6); put(sfx, squeak(), e0('trash') + 0.2, 0.6)
for n in ['h4', 'h5', 'h6']: huss_hit(n)
put(sfx, engine(4.0) * 1.4, e0('pullup') - 0.3, 0.8); put(sfx, honk(), e0('pullup') + 0.6, 0.6)
# S6 (something strange)
suspense(e0('n6'), e1('door') + 2.2, 38, 0.22); heartbeat(e0('n6') + 0.3, e1('door'), 90, 0.45)
put(sfx, vanhum(3.4), e0('van'), 0.9); put(sfx, vanhum(8.0), e0('accel'), 0.6)
steps(e0('accel'), e1('h9'), 0.12, 0.3)
for n in ['h7', 'h8', 'h9']: huss_hit(n)
put(sfx, scratch(), e0('catch') + 0.85, 0.7); put(sfx, creak(1.3), e0('door') + 0.2, 0.9)
# S7 (plot twist)
put(sfx, click(), e0('n7') + 1.4, 0.9); put(sfx, boom(1.4, 38), e0('n7') + 1.5, 0.7)
put(sfx, shimmer(), e0('manout'), 0.8); put(sfx, crowd(1.0, 'cheer'), e0('v_cong') + 0.1, 0.3)
put(sfx, boom(0.8, 42), e0('a_what'), 0.8); put(sfx, boom(1.0, 40), e0('recruit'), 0.6)
for k in range(14): put(sfx, thud() * 0.6, e0('dump') + 0.1 + k * 0.12, 0.5, rng.uniform(-0.6, 0.6))
put(sfx, tear(), e0('lambo') + 0.25, 1.0); put(sfx, whoosh(0.5), e0('lambo') + 0.3, 0.6); put(sfx, engine(1.4) * 1.6, e0('lambo') + 0.9, 1.0); put(sfx, whoosh(0.6, 300, 3000), e0('lambo') + 1.2, 0.6)
# S8 (ending)
steps(e0('n8'), e1('h12'), 0.45, 0.4); put(sfx, sadbone(), e0('n8') + 2.2, 0.45)
for n in ['h10', 'h11', 'h12']: huss_hit(n)
put(sfx, engine(2.4) * 1.5, e0('g_party') - 0.3, 0.8); party_thump(e0('g_party'), e1('g_party'), 0.5); put(sfx, honk(), e0('g_party') + 1.5, 0.6)
for k in range(10): put(sfx, thud() * 0.5, e0('drop') + 0.25 + k * 0.05, 0.6, rng.uniform(-0.6, 0.6))
put(sfx, cricket(0.8), e0('a_unemp') - 0.2, 0.5)
# voices
for l in T['lines']:
    s, sr = sf.read(f"audio/lines/{l['id']}.wav")
    if s.ndim > 1: s = s.mean(1)
    n = int(len(s) * SR / sr); s = np.interp(np.linspace(0, len(s) - 1, n), np.arange(len(s)), s)
    s = s / (np.abs(s).max() + 1e-9) * (0.85 if l['id'] in ('hussL', 'p_stop', 'a_retire', 'c_fin', 'j_slow', 'g_speed', 'a_why', 'a_what', 'g_party') else 0.78)
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
