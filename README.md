# voice-agent-demo

Illustrative ~3-minute concept demo for Hexo Labs: **an agent that builds voice agents
for domain experts.** All product UI and numbers in the video are mocked and labeled as such.

See [`CLAUDE.md`](CLAUDE.md) for the project overview, rules and folder layout.

## Status
Script, audio and phase 1 screens are done. Phases 2–6 screens in progress.

## Quick start
```bash
cp .env.example .env   # add your ElevenLabs API key
./build.sh             # regenerates audio, records screens, assembles out/demo.mp4
./build.sh 0 86        # just a time range (here: hook + phase 1)
```

## Swapping in your own voice
Record each line from `content/lines.json` as its own file named by line ID
(e.g. `recordings/nurse_02.wav`) and rebuild. Recorded lines replace the TTS versions,
and the video re-times automatically.

## Preview the prototype by hand
Open `prototype/index.html` in Chrome and click anywhere: it plays in real time with audio
(needs the generated clips in `audio/tts/`). Add `?t=40` to start at 40 seconds.

## Setup on a new machine
```bash
pip install numpy                      # Python 3.10+
npm i playwright && npx playwright install chromium
# ffmpeg must be on PATH
cp .env.example .env                   # add ELEVENLABS_API_KEY
```
