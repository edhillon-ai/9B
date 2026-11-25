# In This Town, Everyone Wants to Make the NBA

90-second vertical (1080×1920, 30 fps) animated comedy short in a blocky R6-style look.

`In_This_Town_Everyone_Wants_To_Make_The_NBA.mp4` is the final video (H.264 + AAC, playable on iPhone).

## How it was made (all free/local, no paid APIs)
- **Voices**: Kokoro-82M open TTS (`am_puck` for Alex, `bf_lily` pitched down for Grandma) — `src/lines.py`
- **Timing**: `src/timeline.py` lays out every line + comedic beat to exactly 90.0 s
- **Lip-sync**: `src/env.py` builds per-frame mouth envelopes (only the speaker's mouth moves)
- **3D**: Three.js — reusable characters/faces/poses (`core.js`, `cast.js`), environments (`world.js`), 57 shots (`shots.js`), captions/overlays (`film.html`)
- **Render**: headless Chromium via Playwright (`frames.js`), encoded with FFmpeg
- **Music & SFX**: procedurally synthesized originals in `src/mix.py`

## Rebuild
```
cd src && npm i three@0.170.0 && python3 -m http.server 8765 &
python3 lines.py ../audio/lines && python3 timeline.py && python3 env.py && python3 mix.py
node frames.js frames --range 0 2700
ffmpeg -framerate 30 -i frames/f%05d.jpg -i audio/mix.wav -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out.mp4
```
