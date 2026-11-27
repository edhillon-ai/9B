# In This Town — Nobody Ever Sleeps

`In_This_Town_Nobody_Ever_Sleeps.mp4`: 90 s, 1080×1920 (9:16), 30 fps, H.264 + AAC. No captions or watermark.

- Narrated by Alex. The opening line is in the present tense and the rest is in the past tense.
- Each character has a pitched-up voice made with Kokoro TTS and rubberband. Only the speaking character's mouth moves.
- 8 scenes, following the script: 4 AM party, gym, bakery, mailman, mayor, bedroom stakeout, barber reveal, bald ending.
- Grandma is not shown as a barber before Scene 7.

## Not included
- **Music:** "Numbers" by TEMPOREX is not included because no legally usable copy of the file was available. Add it in your editor.
- **Resolution:** 1080p instead of 4K, because of rendering limits in this environment.

## Source
`src/` holds the Three.js scene and shot list (`shots_head.js` + `shots_build.js`) and the frame renderer (`frames.js`, Playwright). It also holds the voice lines (`lines.py`), the timeline (`timeline.py`), the lip-sync envelopes (`env.py`) and the audio mix with sound effects (`mix.py`).
