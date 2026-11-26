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
# ambience
for k in range(14): put(sfx, bird(), 0.4 + k * 0.5 + rng.random() * 0.3, 0.6, rng.uniform(-0.7, 0.7))
# S1
for k in range(6): put(sfx, swish(), 0.6 + k * 0.6, 0.35, -0.4 + 0.15 * k)
put(sfx, whoosh(0.6), 2.85, 0.9); put(sfx, whoosh(1.6, 200, 2000), 3.2, 0.5); put(sfx, swish(), 4.85, 1.0); put(sfx, crowd(1.0, 'cheer'), 4.9, 0.4)
for k in range(4): put(sfx, crunch(), 5.3 + k * 0.4, 0.8)
put(sfx, shimmer(), 6.6, 0.8)
# S2
put(sfx, whoosh(0.5), E['s1end'][1] + 0.55, 0.8); put(sfx, thud(), E['s1end'][1] + 1.5, 0.6); put(sfx, pop(), E['s1end'][1] + 1.5, 0.6)
put(sfx, whoosh(0.5), 10.1, 0.8); put(sfx, thud(), 11.1, 0.5); put(sfx, pop(), 11.1, 0.6)
put(sfx, whoosh(1.0), 11.95, 0.7); put(sfx, swish(), 13.0, 1.0); put(sfx, crowd(1.4, 'cheer'), 13.0, 0.8); put(sfx, pop(), 13.0, 0.6)
# S3
for k in range(8): put(sfx, step(), E['s2end'][1] + 0.1 + k * 0.28, 0.6)
for k in range(6): put(sfx, bounce(), 16.7 + k * 0.33, 0.6)
put(sfx, clang(), e0('miss'), 1.4); put(sfx, bounce(), e0('miss') + 0.45, 0.6); put(sfx, bounce(), e0('miss') + 0.8, 0.4)
put(sfx, boom(0.8, 45), e0('miss') + 0.12, 0.8)
put(sfx, scratch(), e0('j_bro') - 0.35, 0.6)
for k in range(3): put(sfx, bounce() * 0.5, e0('panic') + 0.05 + k * 0.08, 0.6)
put(sfx, siren(1.8), e0('panic') + 0.4, 1.0)
# S4 intense workout hits (no music: rhythmic booms)
for k in range(10): put(sfx, kick() * 0.7, E['panic'][1] + 0.2 + k * 0.42, 0.45)
for n in ['h1', 'h2', 'h3']: put(sfx, boom(0.9, 48), e0(n), 0.75)
put(sfx, scratch(), e0('d4') + 0.0, 0.35)
put(sfx, whoosh(0.3), e0('btw4') - 0.2, 0.35)
# S5
put(sfx, squeak(), 33.85, 1); put(sfx, squeak(), 34.2, 1)
heartbeat(33.75, 34.6, 70, 0.6)
for n in ['h4', 'h5', 'h6']: put(sfx, bounce(), e0(n), 0.7); put(sfx, boom(0.6, 55), e0(n), 0.5)
put(sfx, whoosh(0.6, 300, 2500), e0('h6') + 0.2, 0.7); put(sfx, clang() * 0.6, e0('shot') - 0.02, 1.0)
put(sfx, bonk(), e0('shot') + 0.35, 1.2); put(sfx, boing(), e0('shot') + 0.4, 0.8); put(sfx, tweet(), e0('shot') + 0.7, 0.6)
put(sfx, cricket(0.8), e0('awk5'), 1.0)
# S6
for k in range(4): put(sfx, clang() * 0.7, E['awk5'][1] + 0.3 + k * 0.38, 0.7); put(sfx, bounce(), E['awk5'][1] + 0.5 + k * 0.38, 0.4)
put(sfx, crowd(1.0, 'aww'), 38.6, 0.5)
put(sfx, whoosh(0.5), 39.6, 0.6); put(sfx, thud() * 0.6, 40.2, 0.8); put(sfx, err(), 40.25, 1.0)
put(sfx, whoosh(1.2, 150, 900), 40.6, 0.5); put(sfx, cricket(0.7), 42.2, 0.8)
for n in ['h7', 'h8', 'h9']: put(sfx, boom(0.7, 55), e0(n), 0.55)
put(sfx, thud(), e0('collapse') + 0.1, 1.0)
# S7
for k in range(10): put(sfx, beep(2400, 0.05), 48.25 + k * 0.25, 0.8)
suspense(46.3, 52.4, 38, 0.18)
for n in ['h10', 'h11', 'h12']: put(sfx, boom(0.6, 60), e0(n), 0.45)
put(sfx, scratch(), e0('j_stop') - 0.2, 0.5)
# S8
for k in range(9): put(sfx, step(), E['s7end'][1] + 0.1 + k * 0.27, 0.5); put(sfx, beep(2400, 0.05), E['s7end'][1] + k * 0.5, 0.5)
suspense(55.7, 60.3, 36, 0.22); heartbeat(58.2, 60.3, 72, 0.5)
put(sfx, thud(), e0('h13') + 0.25, 1.1); put(sfx, bonk() * 0.7, e0('h13') + 0.28, 0.9)
put(sfx, door(), 61.45, 1.0); put(sfx, shimmer(), 61.8, 1.2); put(sfx, boom(1.6, 40), 61.9, 0.9)
# S9
suspense(62.0, 69.3, 43, 0.18)
for k in range(12): put(sfx, click(), 64.05 + k * 0.11, 0.7)
put(sfx, crunch(), 64.4, 0.7); put(sfx, crunch(), 65.1, 0.7)
put(sfx, zap(), 65.9, 0.8); put(sfx, beep(1500, 0.1), 66.2, 0.8); put(sfx, swish(), 66.7, 0.9)
put(sfx, snore(1.3), 67.6, 0.8); put(sfx, snore(1.3), 68.6, 0.6)
# S10
for k in range(7): put(sfx, step(), E['s9end'][1] + 0.1 + k * 0.29, 0.6)
put(sfx, err(), 72.3, 1.0)
put(sfx, cricket(0.9), e0('crown'), 0.8); put(sfx, sadbone(), e0('crown') + 0.1, 0.9)
# S11
put(sfx, click(), 79.4, 1.0); put(sfx, beep(1200, 0.12), 79.75, 0.9); put(sfx, beep(1800, 0.15), 79.9, 0.9); put(sfx, shimmer(), 79.8, 0.8)
put(sfx, whoosh(1.3, 200, 2000), 81.2, 0.7); put(sfx, swish(), 82.5, 1.0); put(sfx, crowd(2.0, 'cheer'), 82.5, 0.9); put(sfx, pop(), 83.2, 0.7)
for k in range(5): put(sfx, kick() * 0.7, 84.1 + k * 0.35, 0.5)
heartbeat(84.1, 85.8, 90, 0.5)
for n in ['h14', 'h15', 'h16']: put(sfx, boom(0.7, 50), e0(n), 0.6); put(sfx, bounce(), e0(n) + 0.05, 0.5)
put(sfx, clang(), e0('alexmiss') - 0.02, 1.3); put(sfx, scratch(), e0('alexmiss') + 0.05, 0.6)
for k in range(10): put(sfx, click(), e0('alexmiss') + 0.25 + k * 0.03, 0.9)
put(sfx, err(), e0('alexmiss') + 0.45, 0.9)
put(sfx, whoosh(0.3), e0('pull'), 0.4)
put(sfx, boom(0.5, 60), 89.8, 0.7)
# voices
for l in T['lines']:
    s, sr = sf.read(f"audio/lines/{l['id']}.wav")
    if s.ndim > 1: s = s.mean(1)
    n = int(len(s) * SR / sr); s = np.interp(np.linspace(0, len(s) - 1, n), np.arange(len(s)), s)
    s = s / (np.abs(s).max() + 1e-9) * (0.85 if l['id'] in ('hussL', 'j_stop', 'j_aimbot') else 0.78)
    if l['id'] == 'btw': s *= 0.85
    put(vox, s, l['start'])
venv = np.zeros(N)
for l in T['lines']: i = int(l['start'] * SR); venv[i:i + int(l['dur'] * SR)] = 1
k = int(0.12 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same')
sfx *= (1 - 0.4 * venv)[:, None]
mix = sfx * 0.75 + vox[:, None]
mix[int(89.92 * SR):] *= np.linspace(1, 0, N - int(89.92 * SR))[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
pk = np.abs(mix).max(); mix = mix / pk * 0.93 if pk > 0.93 else mix
sf.write('audio/mix.wav', mix.astype(np.float32), SR, subtype='PCM_16'); print('ok', pk)
