#!/usr/bin/env bash
# Rebuild the demo video from scratch.
#   ./build.sh                 full video  -> out/demo.mp4
#   ./build.sh 0 86            a time range (seconds)
#   CUT=short ./build.sh       the ~3 min cut (content/script_short.md) -> out/demo_short.mp4
# Steps: refresh lines -> TTS (only changed lines) -> timings -> envelopes -> timeline -> audio mix -> frames -> mp4
set -euo pipefail
cd "$(dirname "$0")"
python3 content/extract_lines.py
# short cut: reuse clips still in git history before paying for new ones
if [ "${CUT:-}" = short ]; then python3 audio/restore_short_clips.py; fi
python3 audio/generate_tts.py
python3 audio/timings.py
(cd audio && python3 envelopes.py)
python3 prototype/build_timeline.py
python3 edit/mix_audio.py
if [ $# -ge 2 ]; then node record/capture.js --from "$1" --to "$2" --fps 30; else node record/capture.js --fps 30; fi
edit/assemble.sh out/demo${CUT:+_$CUT}.mp4
