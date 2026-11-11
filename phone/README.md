# AgentPhone demos (illustrative concept)

Two short demos for the idea "a real voice and a phone number for every text agent".
Self-contained; separate from the SIA Voice pipeline in the repo root.

- `./build.sh demo1` → `out/demo1.mp4` — I call my cloud coding agent; it calls me back with a question.
- `./build.sh demo2` → `out/demo2.mp4` — a developer gives a text assistant a voice and a phone number; a customer calls it.

Words: `content/hook.json` (shared opening), `content/demo1.json`, `content/demo2.json`.
Product name: `config.json` (`product_name`; "AgentPhone" is a placeholder). Voices: `voices.json`.
Screens: `web/` (`index.html?demo=demo1` plays in a browser). Stills: `node capture.js demo1 --stills 10,50`.
Needs `ELEVENLABS_API_KEY` in the repo-root `.env`, ffmpeg, and Playwright (`npm i playwright` in the repo root).
