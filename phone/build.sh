#!/usr/bin/env bash
# ./build.sh demo1   ->  out/demo1.mp4   (also: demo2)
set -euo pipefail
cd "$(dirname "$0")"
D=${1:-demo1}
python3 build.py $D tts
python3 build.py $D timeline
python3 build.py $D mix
node capture.js $D --fps 30
ffmpeg -y -v error -framerate 30 -i out/frames_$D/f%06d.jpg -i out/${D}_audio.wav -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart out/$D.mp4
echo "built out/$D.mp4"
