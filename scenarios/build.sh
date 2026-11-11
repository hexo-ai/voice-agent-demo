#!/usr/bin/env bash
# ./build.sh  ->  out/sia_scenarios_demo.mp4
set -euo pipefail
cd "$(dirname "$0")"
python3 build.py tts
python3 build.py timeline
python3 build.py mix
node capture.js --fps 30
ffmpeg -y -v error -framerate 30 -i out/frames/f%06d.jpg -i out/audio.wav -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/sia_scenarios_demo.mp4
echo "built out/sia_scenarios_demo.mp4"
