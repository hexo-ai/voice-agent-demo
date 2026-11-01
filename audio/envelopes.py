"""Compute a loudness envelope (20 values per second, 0..1) for every clip.

The prototype uses these to animate the voice orb, so frames stay in sync with
the audio even though the browser is recorded silently.
  python3 audio/envelopes.py   ->  audio/envelopes.json
"""
import json, subprocess
import numpy as np
from pathlib import Path
from timings import clip_for, ROOT, SFX

RATE, HOP = 16000, 800  # 50 ms windows


def envelope(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(RATE), "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
    n = len(x) // HOP
    rms = np.sqrt((x[: n * HOP].reshape(n, HOP) ** 2).mean(axis=1) + 1e-9)
    db = 20 * np.log10(rms)
    v = np.clip((db + 50) / 40, 0, 1)  # -50 dB -> 0, -10 dB -> 1
    return [round(float(a), 2) for a in v]


def main():
    lines = json.loads((ROOT / f"content/lines{SFX}.json").read_text())["lines"]
    out = {ln["id"]: envelope(clip_for(ln["id"])) for ln in lines}
    (ROOT / f"audio/envelopes{SFX}.json").write_text(json.dumps(out, separators=(",", ":")) + "\n")
    print(f"{len(out)} envelopes")


if __name__ == "__main__":
    main()
