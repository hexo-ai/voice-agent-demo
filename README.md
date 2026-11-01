# voice-agent-demo

Illustrative ~3-minute concept demo for Hexo Labs: **an agent that builds voice agents
for domain experts.** All product UI and numbers in the video are mocked and labeled as such.

See [`CLAUDE.md`](CLAUDE.md) for the project overview, rules and folder layout.

## Status
Skeleton only. Next: script (`content/script.md`).

## Quick start
```bash
cp .env.example .env   # add your ElevenLabs API key
./build.sh             # (coming soon) regenerates audio, records screens, assembles out/demo.mp4
```

## Swapping in your own voice
Record each line from `content/lines.json` as its own file named by line ID
(e.g. `recordings/nurse_02.wav`) and rebuild. Recorded lines replace the TTS versions,
and the video re-times automatically.
