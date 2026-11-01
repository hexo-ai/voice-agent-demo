#!/usr/bin/env bash
# Encode captured frames + the matching slice of the mixed audio into an MP4.
#   edit/assemble.sh out/demo.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=${1:-out/demo.mp4}
SFX=${CUT:+_$CUT}
FR=out/frames$SFX
read FROM TO FPS < <(python3 -c "import json;r=json.load(open('$FR/range.json'));print(r['from'],r['to'],r['fps'])")
ffmpeg -y -v error -framerate "$FPS" -i $FR/f%06d.jpg \
  -ss "$FROM" -to "$TO" -i out/audio_full$SFX.wav \
  -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "$OUT"
echo "$OUT"
