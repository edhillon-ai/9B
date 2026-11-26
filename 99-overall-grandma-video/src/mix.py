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
for k in range(16): put(sfx, bird(), 0.3 + k * 0.55 + rng.random() * 0.3, 0.6, rng.uniform(-0.7, 0.7))
# S1
for k in range(6): put(sfx, swish(), 0.5 + k * 0.4, 0.35, -0.4 + 0.15 * k)
for k in range(10): put(sfx, bounce(), 2.95 + k * 0.33, 0.5)
put(sfx, whoosh(1.0, 150, 1500), 7.0, 0.7); put(sfx, slam(), 7.7, 1.1); put(sfx, crowd(1.4, 'ooh'), 7.8, 0.7)
put(sfx, cricket(0.9), e0('stare'), 0.8)
# S2
put(sfx, crowd(2.0, 'cheer'), 12.6, 0.8); put(sfx, kaching(), 12.65, 1.0); put(sfx, pop(), 12.62, 0.6)
put(sfx, squeak(), 17.6, 1); put(sfx, squeak(), 17.75, 1); put(sfx, whoosh(0.5), 17.9, 0.8); put(sfx, thud(), 18.5, 0.9); put(sfx, tweet(), 18.6, 0.6)
for k in range(5): put(sfx, step(), e0('walkaway') + k * 0.3, 0.5); put(sfx, crunch(), e0('walkaway') + 0.2 + k * 0.25, 0.5)
# S3 (training montage)
for n in ['h1','h2','h3','h7','h8','h9']: put(sfx, boom(0.7, 50), e0(n), 0.55)
for n in ['h4','h5','h6']: put(sfx, whoosh(0.35), e0(n) + 0.15, 0.5); put(sfx, clang() * 0.7, e0(n) + 0.55, 0.8)
for k in range(8): put(sfx, step() * 1.5, e0('h10') - 0.1 + k * 0.24, 0.7)
put(sfx, engine(2.6) * 1.5, e0('lambo'), 0.9); put(sfx, whoosh(0.9, 200, 2500), e0('lambo') + 0.9, 0.9); put(sfx, honk(), e0('lambo') + 1.1, 0.8)
for k in range(3): put(sfx, crunch(), e0('lambo') + 1.7 + k * 0.3, 0.7)
put(sfx, cricket(0.8), e0('stare3'), 0.9)
# S4
for k in range(6): put(sfx, step() * 0.6, E['stare3'][1] + 0.2 + k * 0.35, 0.5)
for k in range(12): put(sfx, crunch(), 38.0 + k * 0.42, 0.45)
put(sfx, boom(0.6, 60), e0('zoom4'), 0.6)
# S5
for k in range(10): put(sfx, step(), e0('follow') + k * 0.2, 0.5)
put(sfx, thud() * 0.5, 52.5, 0.6); put(sfx, door(), 52.7, 0.6)
heartbeat(52.7, 53.3, 80, 0.5); put(sfx, shimmer(), 53.2, 1.2); put(sfx, boom(1.0, 45), 53.25, 0.7)
put(sfx, whoosh(1.4, 300, 2500), e0('curtain') + 0.4, 0.4); put(sfx, cricket(0.8), e0('curtain') + 0.9, 0.7)
# S6
put(sfx, crowd(1.6, 'cheer'), e0('crowd'), 0.8)
for n in ['h13','h14','h15']: put(sfx, boom(0.6, 55), e0(n), 0.55)
for k in range(4): put(sfx, bounce(), e0('gdunk') - 0.3 + k * 0.17, 0.5)
put(sfx, whoosh(0.4), e0('gdunk') + 0.4, 0.7); put(sfx, crowd(1.2, 'ooh'), e0('gdunk') + 0.6, 0.7); put(sfx, slam(), e0('gdunk') + 1.75, 1.1); put(sfx, crowd(1.6, 'cheer'), e0('gdunk') + 1.8, 0.8)
# S7
put(sfx, whoosh(0.8, 300, 2000), e0('drop') - 0.5, 0.6); put(sfx, thud() * 0.5, e0('drop') + 0.45, 0.8); put(sfx, click(), e0('drop') + 0.5, 1.0)
put(sfx, scratch(), e0('a_wait') - 0.3, 0.6); put(sfx, boom(1.2, 40), e0('cutrudy'), 0.9)
for k in range(14): put(sfx, click(), e0('r_square') + 0.1 + k * 0.1, 0.8)
put(sfx, beep(1400, 0.1), e0('reveal7') + 0.75, 0.7); put(sfx, beep(1900, 0.1), e0('reveal7') + 1.05, 0.7)
put(sfx, crowd(1.4, 'ooh'), e0('gasp'), 1.0)
# S8
put(sfx, whistle(0.7), E['gasp'][1] + 0.2, 0.9); put(sfx, err(), E['gasp'][1] + 1.2, 0.7)
put(sfx, kaching(), e0('brief') + 0.9, 1.0); put(sfx, crowd(1.2, 'cheer'), e0('brief') + 0.7, 0.6)
put(sfx, whoosh(0.5), e0('steal') + 0.1, 0.9); put(sfx, crowd(1.0, 'aww'), e0('steal') + 0.3, 0.6); put(sfx, door() * 0.6, e0('steal') + 0.75, 0.6)
put(sfx, engine(2.0) * 1.6, e0('g_party') - 0.1, 0.9); put(sfx, honk(), e0('g_party') + 1.7, 0.7)
put(sfx, cricket(0.8), e0('stare8'), 0.9)
# voices
for l in T['lines']:
    s, sr = sf.read(f"audio/lines/{l['id']}.wav")
    if s.ndim > 1: s = s.mean(1)
    n = int(len(s) * SR / sr); s = np.interp(np.linspace(0, len(s) - 1, n), np.arange(len(s)), s)
    s = s / (np.abs(s).max() + 1e-9) * (0.85 if l['id'] in ('hussL', 'g_small', 'j_hip', 'a_bro', 'a_wait', 'r_square') else 0.78)
    put(vox, s, l['start'])
venv = np.zeros(N)
for l in T['lines']: i = int(l['start'] * SR); venv[i:i + int(l['dur'] * SR)] = 1
k = int(0.12 * SR); venv = np.convolve(venv, np.ones(k) / k, 'same')
sfx *= (1 - 0.4 * venv)[:, None]
mix = sfx * 0.75 + vox[:, None]
mix[int(89.88 * SR):] *= np.linspace(1, 0, N - int(89.88 * SR))[:, None]
mix = np.tanh(mix * 1.05) / np.tanh(1.05)
pk = np.abs(mix).max(); mix = mix / pk * 0.93 if pk > 0.93 else mix
sf.write('audio/mix.wav', mix.astype(np.float32), SR, subtype='PCM_16'); print('ok', pk)
