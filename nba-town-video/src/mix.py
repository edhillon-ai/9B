# Original procedural music + SFX + voice mix -> audio/mix.wav (48 kHz stereo, exactly 90.0 s)
import json, numpy as np, soundfile as sf
SR = 48000; DUR = 90.0; N = int(SR * DUR)
T = json.load(open('timeline.json')); E = T['ev']
rng = np.random.default_rng(3)
music = np.zeros((N, 2)); sfx = np.zeros((N, 2)); vox = np.zeros(N)

def tt(d): return np.arange(int(d * SR)) / SR
def env_adsr(n, a=0.005, r=0.1):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def put(buf, x, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[: N - i]
    if buf.ndim == 2:
        l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
        buf[i:i + len(x), 0] += x * gain * l * 1.4; buf[i:i + len(x), 1] += x * gain * r * 1.4
    else: buf[i:i + len(x)] += x * gain
def lp(x, a):  # one-pole lowpass, a in (0,1)
    y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s += a * (x[i] - s); y[i] = s
    return y
def lp_fast(x, cutoff):
    # FFT brickwall-ish lowpass
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f > cutoff] *= np.exp(-(f[f > cutoff] - cutoff) / (cutoff * 0.3)); return np.fft.irfft(X, len(x))
def hp_fast(x, cutoff):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[f < cutoff] *= (f[f < cutoff] / cutoff) ** 2; return np.fft.irfft(X, len(x))
def bp(x, lo, hi): return hp_fast(lp_fast(x, hi), lo)
noise = lambda d: rng.standard_normal(int(d * SR))
midi = lambda m: 440 * 2 ** ((m - 69) / 12)

# ---------- instruments ----------
def kick(): t = tt(0.35); f = 50 + 120 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def snare(): t = tt(0.2); return (bp(noise(0.2), 1500, 7000) * 0.7 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 22)
def hat(o=False): t = tt(0.25 if o else 0.05); return hp_fast(noise(len(t) / SR), 7000) * np.exp(-t * (12 if o else 80)) * 0.5
def clap(): t = tt(0.18); n = bp(noise(0.18), 900, 5000); e = np.exp(-t * 25) + 0.6 * np.exp(-np.maximum(0, t - 0.012) * 40) * (t > 0.012); return n * e * 0.8
def pluck(m, d=0.25, bright=1.0):
    t = tt(d); f = midi(m); x = sum(np.sin(2 * np.pi * f * k * t) / k ** (1.6 / bright) for k in range(1, 7)); return x * np.exp(-t * 7) * env_adsr(len(t), 0.003, 0.05) * 0.35
def bass(m, d=0.25):
    t = tt(d); f = midi(m); x = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t); return x * env_adsr(len(t), 0.004, 0.04) * 0.55
def saw(m, d, detune=0.0):
    t = tt(d); f = midi(m); x = 2 * ((f * (1 + detune) * t) % 1) - 1; return x
def pad(ms, d):
    x = sum(lp_fast(saw(m, d, 0.003) + saw(m, d, -0.004), 1800) for m in ms) / len(ms); return x * env_adsr(int(d * SR), 0.3, 0.6) * 0.18
def stab(ms, d=0.18):
    x = sum(saw(m, d) + saw(m + 12, d, 0.002) for m in ms) / len(ms); return lp_fast(x, 3500) * env_adsr(int(d * SR), 0.005, 0.08) * 0.22
def brass(m, d):
    t = tt(d); f = midi(m); x = sum(np.sin(2 * np.pi * f * k * t) * (0.9 ** k) for k in range(1, 10)); return x * env_adsr(len(t), 0.03, 0.12) * 0.12
def piano(m, d=1.0):
    t = tt(d); f = midi(m); x = sum(np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k)) * np.exp(-t * (2 + k)) / k for k in range(1, 6)); return x * 0.35

# ---------- music sections ----------
def groove(t0, t1, bpm, prog, style='bounce', gain=1.0):
    beat = 60 / bpm; bar = beat * 4; nb = int(np.ceil((t1 - t0) / bar))
    seg = np.zeros((int((t1 - t0) * SR) + SR * 2, 2))
    def P(x, at, g=1, pan=0):
        i = int(at * SR)
        if 0 <= at and i < len(seg) - len(x) and at < t1 - t0: seg[i:i + len(x), 0] += x * g * (1 - pan) ; seg[i:i + len(x), 1] += x * g * (1 + pan)
    for b in range(nb):
        root, chord = prog[b % len(prog)]; base = b * bar
        for k in range(4):
            bt = base + k * beat
            if style in ('bounce', 'sport', 'edm', 'hiphop'): P(kick(), bt if style == 'edm' or k in (0, 2) else -99, 0.9)
            if style == 'hiphop' and k == 2: P(kick(), bt + beat / 2, 0.7)
            if k in (1, 3): P(clap() if style in ('edm', 'hiphop') else snare(), bt, 0.55)
            for h in range(2): P(hat(style == 'edm' and h == 1), bt + h * beat / 2, 0.25 if style != 'lofi' else 0.12, 0.3)
            if style == 'lofi' and k in (0, 2): P(kick() * 0.6, bt, 0.6)
            if style == 'lofi' and k in (1, 3): P(snare() * 0.4, bt, 0.4)
            # bass
            bn = root - 24 + (0 if k % 2 == 0 else (7 if style != 'edm' else 0))
            P(bass(bn, beat * 0.9), bt, 0.7 if style != 'edm' else 0.8)
            if style == 'edm': P(bass(root - 12, beat * 0.4), bt + beat / 2, 0.5)
            # melody/harmony
            if style == 'bounce':
                for j, iv in enumerate([0, 4, 7, 12][k:k + 1] + [chord[(k + 1) % len(chord)]]):
                    P(pluck(root + iv, beat * 0.5), bt + j * beat / 2, 0.55, -0.3 + 0.6 * j)
            elif style == 'sport':
                if k == 0: P(brass(root + 12, beat * 0.6), bt, 1.0); P(brass(root + 16, beat * 0.6), bt, 0.8)
                if k == 2: P(stab([root + c for c in chord], beat * 0.4), bt + beat / 2, 1.0)
            elif style == 'edm':
                P(stab([root + 12 + c for c in chord], beat * 0.35), bt + beat / 2, 1.1)
            elif style == 'hiphop':
                if k in (0, 2): P(pluck(root + 12 + chord[k // 2 % len(chord)], beat * 0.9, 0.6), bt, 0.7)
            elif style == 'lofi':
                P(piano(root + chord[k % len(chord)], beat * 1.5) * 0.7, bt, 0.6)
        if style in ('bounce', 'lofi', 'sport'): P(pad([root + c for c in chord], bar), base, 0.7)
    seg = seg[: int((t1 - t0) * SR)]
    fade = min(len(seg), int(0.05 * SR)); seg[-fade:] *= np.linspace(1, 0, fade)[:, None]
    i0 = int(t0 * SR); music[i0:i0 + len(seg)] += seg * gain

C, F, G, Am, D = 60, 65, 67, 57, 62
MAJ, MIN = [0, 4, 7], [0, 3, 7]
groove(0.0, E['s4end'][1], 112, [(C, MAJ), (F, MAJ), (Am + 12, MIN), (G, MAJ)], 'bounce', 0.55)
groove(E['s4end'][1], E['dumb'][0], 124, [(Am + 12, MIN), (F, MAJ), (C, MAJ), (G, MAJ)], 'edm', 0.9)
groove(E['awk5'][1], 40.45, 96, [(D, MIN), (Am + 12, MIN), (F, MAJ), (G, MAJ)], 'hiphop', 0.6)
groove(40.45, E['s6end'][1], 75, [(F, MAJ), (Am + 12, MIN)], 'lofi', 0.45)
groove(E['s6end'][1], E['s8'][1] if 's8' in E else 58.68, 128, [(C, MAJ), (G, MAJ), (Am + 12, MIN), (F, MAJ)], 'sport', 0.55)
# finals: tense drone + heartbeat
def drone(t0, t1, root=45, g=0.25):
    d = t1 - t0; t = tt(d); x = (np.sin(2 * np.pi * midi(root) * t) + 0.5 * np.sin(2 * np.pi * midi(root + 7) * t * 1.001) + 0.3 * lp_fast(saw(root + 12, d), 600)) * env_adsr(len(t), 1.0, 0.5)
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.25 * t) ** 2; put(music, x * g, t0)
drone(58.68, 67.24, 45, 0.3); drone(67.24, 73.70, 46, 0.35)
def heartbeat(t0, t1, bpm=70, g=0.9):
    t = t0
    while t < t1: put(sfx, kick() * 0.9, t, g); put(sfx, kick() * 0.6, t + 0.22, g); t += 60 / bpm
heartbeat(61.1, 66.0, 66, 0.7); heartbeat(67.3, 73.6, 84, 0.9)
# party muffled during flashback
groove(80.75, 81.8, 124, [(Am + 12, MIN), (F, MAJ)], 'edm', 0.0)  # placeholder (no-op)
fb = np.zeros(int(1.05 * SR))
seg0 = int(E['s4end'][1] * SR); fb_src = music[seg0:seg0 + len(fb), 0].copy()
put(music, lp_fast(fb_src, 700) * 1.2, 80.75)
# ending sad piano
for i, m in enumerate([64, 62, 60, 59, 57]): put(music, piano(m, 1.6), 86.93 + i * 0.45, 0.45)

# ---------- SFX ----------
def whoosh(d=0.5, lo=300, hi=3000):
    x = bp(noise(d), lo, hi); t = tt(d); return x * np.sin(np.pi * t / d) ** 2 * 0.6
def boom(d=1.2, f0=55):
    t = tt(d); f = f0 * (1 + 1.5 * np.exp(-t * 8)); return (np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.3 * lp_fast(noise(d), 200)) * np.exp(-t * 3.2) * 0.9
def bounce(): t = tt(0.12); return np.sin(2 * np.pi * (90 + 60 * np.exp(-t * 40)) * t) * np.exp(-t * 35) * 0.8 + bp(noise(0.12), 800, 3000) * np.exp(-t * 60) * 0.15
def crash():
    d = 1.0; t = tt(d); return sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * np.exp(-t * rng.uniform(4, 9)) for f in rng.uniform(2500, 7000, 18)) * 0.08 + hp_fast(noise(d), 3000) * np.exp(-t * 7) * 0.5
def bonk(): t = tt(0.3); return np.sin(2 * np.pi * (600 * np.exp(-t * 6)) * t) * np.exp(-t * 14) * 0.8
def boing(): t = tt(0.6); return np.sin(2 * np.pi * np.cumsum(300 + 200 * np.sin(2 * np.pi * 12 * t)) / SR) * np.exp(-t * 4) * 0.35
def tweet(): t = tt(0.9); return np.sin(2 * np.pi * np.cumsum(2400 + 500 * np.sin(2 * np.pi * 9 * t)) / SR) * (np.sin(2 * np.pi * 4.5 * t) > 0) * 0.12
def crowd(d, mood='cheer'):
    t = tt(d); x = np.zeros(len(t))
    for k in range(10):
        f0 = rng.uniform(180, 420) if mood != 'ooh' else rng.uniform(150, 260)
        vib = f0 * (1 + 0.03 * np.sin(2 * np.pi * rng.uniform(3, 6) * t + k))
        if mood == 'aww': vib *= np.linspace(1.15, 0.8, len(t))
        if mood == 'ooh': vib *= 1 + 0.25 * np.sin(np.pi * t / d)
        v = sum(np.sin(2 * np.pi * np.cumsum(vib * h) / SR) / h ** 1.3 for h in range(1, 6))
        x += v * (0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(0.3, 1.2) * t + k))
    x = lp_fast(x, 2500) / 10 + bp(noise(d), 500, 4000) * (0.25 if mood == 'cheer' else 0.08)
    return x * env_adsr(len(t), 0.15, min(0.6, d / 2)) * 0.5
def whistle(d=0.5): t = tt(d); return np.sin(2 * np.pi * 2900 * t * (1 + 0.02 * np.sin(2 * np.pi * 45 * t))) * env_adsr(len(t), 0.01, 0.06) * 0.25
def swish(): return bp(noise(0.35), 2000, 9000) * np.exp(-tt(0.35) * 10) * 0.6
def clang(): t = tt(0.8); return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * 5) for f in [420, 1130, 1870, 2650]) * 0.12
def scratch():
    d = 0.55; t = tt(d); f = 400 + 1800 * np.abs(np.sin(2 * np.pi * 3.2 * t)); return bp(noise(d), 300, 4000) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.25 * env_adsr(len(t), 0.01, 0.1)
def cricket(d=0.6): t = tt(d); return np.sin(2 * np.pi * 4500 * t) * ((np.sin(2 * np.pi * 30 * t) > 0) * (np.sin(2 * np.pi * 2.2 * t) > 0.2)) * 0.08
def owl(): t = tt(1.2); return np.sin(2 * np.pi * np.cumsum(np.where(t < 0.4, 380, 340) * (1 - 0.05 * t)) / SR) * (np.sin(np.pi * np.clip(t / 0.4, 0, 1)) * (t < 0.4) + np.sin(np.pi * np.clip((t - 0.55) / 0.6, 0, 1)) * (t > 0.55)) * 0.2
def crunch(): return bp(noise(0.15), 1500, 6000) * np.exp(-tt(0.15) * 25) * (rng.random(int(0.15 * SR)) > 0.6) * 0.8
def kaching(): t = tt(0.9); return (sum(np.sin(2 * np.pi * f * t) for f in [2093, 2637, 3136]) * np.exp(-t * 4) * 0.12) + bp(noise(0.9), 3000, 8000) * np.exp(-t * 12) * 0.2
def honk(): t = tt(0.45); return lp_fast((2 * ((415 * t) % 1) - 1) + (2 * ((440 * t) % 1) - 1), 2500) * env_adsr(len(t), 0.01, 0.05) * 0.18
def engine(d): t = tt(d); return lp_fast(saw(30, d) * (1 + 0.3 * np.sin(2 * np.pi * 18 * t)), 600) * 0.25 * env_adsr(len(t), 0.2, 0.3)
def squeak(): t = tt(0.12); return np.sin(2 * np.pi * np.cumsum(2200 + 800 * np.sin(2 * np.pi * 30 * t)) / SR) * env_adsr(len(t), 0.005, 0.03) * 0.12
def pop(): t = tt(0.12); return np.sin(2 * np.pi * (900 * np.exp(-t * 20)) * t) * np.exp(-t * 30) * 0.5
def wahwah():
    out = []
    for m, d in [(55, 0.32), (54, 0.32), (53, 0.32), (52, 1.1)]:
        t = tt(d); f = midi(m) * (1 + (0.02 * np.sin(2 * np.pi * 6 * t) if d > 1 else 0)); f = f * (1 - 0.03 * t / d)
        x = sum(np.sin(2 * np.pi * np.cumsum(f * k) / SR) * (0.8 ** k) for k in range(1, 9))
        wah = 0.5 + 0.5 * np.sin(np.pi * np.clip(t / d, 0, 1)); out.append(lp_fast(x * wah, 1800) * env_adsr(len(t), 0.03, 0.08) * 0.22)
    return np.concatenate(out)
def rewind(): d = 0.6; t = tt(d); return np.sin(2 * np.pi * np.cumsum(1500 - 1300 * t / d + 300 * np.sin(2 * np.pi * 20 * t)) / SR) * 0.15 + whoosh(d, 800, 5000) * 0.5
def slam(): b = boom(0.9, 45); c = clang(); b[:len(c)] += c[:len(b)] * 1.4; return b

e0 = lambda n: E[n][0]
# scene 1
for k in range(0, 7): put(sfx, bounce(), 0.3 + k * 0.33, 0.25, -0.4)
for k in range(0, 6): put(sfx, bounce(), 2.4 + k * 0.23, 0.5)
put(sfx, squeak(), 2.95, 1); put(sfx, whoosh(0.3), 2.95, 0.6); put(sfx, crowd(1.2, 'ooh'), 3.2, 0.8); put(sfx, tweet(), 3.4, 0.6)
put(sfx, whoosh(0.5), 4.6, 0.8); put(sfx, slam(), 5.15, 1.0); put(sfx, crowd(1.5, 'cheer'), 5.2, 0.8)
# scene 2
put(sfx, whoosh(0.4), 8.62, 0.8); put(sfx, crash(), e0('crash'), 1.1); put(sfx, boom(0.4, 70), e0('crash'), 0.4)
put(sfx, whoosh(0.45), 10.1, 0.8); put(sfx, bonk(), e0('bonk'), 1.0); put(sfx, boing(), e0('bonk') + 0.05, 0.8); put(sfx, tweet(), e0('bonk') + 0.3, 0.7)
# scene 3
put(sfx, crowd(1.7, 'cheer'), 13.5, 1.0); put(sfx, pop(), 13.52, 0.8)
put(sfx, engine(1.6), 15.1, 0.9); put(sfx, squeak() * 2, 16.5, 0.6); put(sfx, boom(1.6, 40), e0('rudyTall') + 0.1, 1.0)
# scene 4
put(sfx, whoosh(0.6, 200, 1500), 17.76, 0.7); put(sfx, pop(), 19.9, 0.6)
for n in ['h1', 'h2', 'h3']: put(sfx, boom(0.9, 50), e0(n), 0.85)
put(sfx, whoosh(0.3), E['btw4'][0] - 0.25, 0.4)
# scene 5
for n in ['h4', 'h5', 'h6']: put(sfx, boom(0.7, 60), e0(n), 0.6)
put(sfx, cricket(0.6), e0('awk5'), 1.0)
# scene 6
for t0, t1, r in [(35.04, 37.2, 0.19), (37.2, 38.35, 0.22), (38.35, 39.2, 0.21), (39.2, 40.45, 0.39), (40.45, 42.85, 0.29)]:
    k = t0 + 0.05
    while k < t1: put(sfx, bounce(), k, 0.45 if t0 < 40 else 0.3); k += r
put(sfx, owl(), 42.9, 0.9)
# scene 7
put(sfx, whistle(0.6), 43.92, 1.0); put(sfx, crowd(6.9, 'cheer'), 43.88, 0.45)
put(sfx, squeak(), 45.6, 1); put(sfx, squeak(), 45.8, 1); put(sfx, crowd(1.2, 'ooh'), 45.95, 0.9)
put(sfx, crowd(1.2, 'aww'), 47.6, 0.9)
put(sfx, whistle(0.7), 49.05, 1.0); put(sfx, boom(0.4, 80), 48.6, 0.5)
put(sfx, cricket(0.8), 49.9, 0.8)
# scene 8
put(sfx, crowd(7.9, 'cheer'), 50.78, 0.45)
for k in range(10): put(sfx, squeak() if k % 3 == 0 else bounce(), 50.8 + k * 0.15, 0.6)
put(sfx, pop(), 50.95, 0.9); put(sfx, swish(), 53.45, 1.0); put(sfx, crowd(1.2, 'cheer'), 53.5, 0.7)
put(sfx, whoosh(1.4, 150, 1200), 54.4, 0.7); put(sfx, slam(), 55.6, 1.1); put(sfx, crowd(1.6, 'ooh'), 55.7, 0.9)
put(sfx, cricket(0.7), 57.95, 0.8)
# scene 9
put(sfx, boom(1.5, 40), 58.7, 0.9); put(sfx, crowd(2.3, 'cheer'), 58.7, 0.5)
for n in ['q1', 'q2', 'q3']: put(sfx, boom(0.6, 45), e0(n), 0.4)
put(sfx, crunch(), 66.1, 1); put(sfx, crunch(), 66.42, 1); put(sfx, crunch(), 66.75, 0.8)
# scene 10
put(sfx, whoosh(1.6, 100, 900), 69.6, 0.6); put(sfx, whoosh(2.2, 100, 700), 71.4, 0.6)
put(sfx, slam(), 73.98, 1.2); put(sfx, whoosh(0.4), 73.98, 0.8); put(sfx, bonk() * 0.6, 74.55, 0.8); put(sfx, crowd(1.6, 'ooh'), 74.1, 0.9)
# scene 11
put(sfx, scratch(), e0('n11') + 3.35 if False else 79.88, 1.0)
put(sfx, rewind(), 80.7, 1.0); put(sfx, kaching(), 83.5, 1.0); put(sfx, cricket(0.9), 84.25, 0.8)
# scene 12
put(sfx, engine(1.0) * 1.5, 85.23, 0.8); put(sfx, whoosh(0.6, 200, 2000), 85.5, 0.9); put(sfx, honk(), 85.65, 1.0); put(sfx, honk(), 85.95, 0.8)
put(sfx, crowd(0.8, 'cheer'), 86.2, 0.7); put(sfx, pop(), 86.22, 0.6)
put(sfx, wahwah(), 88.9, 1.0)

# ---------- voices ----------
from math import gcd
voice_env = np.zeros(N)
for l in T['lines']:
    s, sr = sf.read(f"audio/lines/{l['id']}.wav")
    if s.ndim > 1: s = s.mean(1)
    rate = sr * (0.93 if l['speaker'] == 'grandma' else 1.0)
    n = int(len(s) * SR / rate); s = np.interp(np.linspace(0, len(s) - 1, n), np.arange(len(s)), s)
    s = s / (np.abs(s).max() + 1e-9) * (0.80 if l['name'] not in ('q1', 'q2', 'q3') else 0.42)
    if l['id'] == 'btw': s *= 0.85
    put(vox, s, l['start'])
    i = int(l['start'] * SR); voice_env[i:i + len(s)] = 1
# smooth duck envelope
k = int(0.15 * SR); voice_env = np.convolve(voice_env, np.ones(k) / k, 'same')
duck = 1 - 0.55 * voice_env
music *= duck[:, None]; sfx *= (1 - 0.25 * voice_env)[:, None]
mix = music * 0.55 + sfx * 0.8 + vox[:, None] * 1.0
# fade at very end (after black)
mix[int(89.9 * SR):] *= np.linspace(1, 0, N - int(89.9 * SR))[:, None]
mix = np.tanh(mix * 1.1) / np.tanh(1.1) * 0.92
pk = np.abs(mix).max(); mix = mix / pk * 0.95 if pk > 0.95 else mix
sf.write('audio/mix.wav', mix.astype(np.float32), SR, subtype='PCM_16')
print('wrote', mix.shape, 'peak', np.abs(mix).max())
