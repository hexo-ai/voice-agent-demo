# SIA Scenarios demo (illustrative concept)

A ~3-minute illustrative video for SIA Scenarios (risk testing for voice agents). Self-contained;
separate from the SIA Voice pipeline (repo root) and the AgentLine demos.
Product concept and what's real vs mocked: `CONCEPT.md`.

- `./build.sh` → `out/sia_scenarios_demo.mp4` (TTS for changed lines → timeline → audio mix → frame capture → mp4; ~8 min).
- Words: `content/demo.json` (scenes, lines, cues). `{{product}}` comes from `config.json` (product name "SIA Scenarios", spoken "Seeya Scenarios").
- Voices: `voices.json` (narrator = Vignesh clone on eleven_v4; agent = Bella; caller = Bill; phone filter on call lines).
  Replace any line with your own recording: `recordings/<line id>.wav`.
- Screens: `web/` (`index.html` plays live in a browser after `python3 build.py timeline`; `?t=120` starts at 2:00).
  Stills: `node capture.js --stills 10,60,130`.
- Needs `ELEVENLABS_API_KEY` in the repo-root `.env`, ffmpeg, and Playwright (`npm i playwright` in the repo root).
