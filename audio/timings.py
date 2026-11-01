"""Measure every clip and write audio/timings.json; print per-phase totals.

For each line it uses recordings/<id>.(wav|m4a|mp3) if present, else audio/tts/<id>.mp3.
  python3 audio/timings.py
"""
import json, os, subprocess
from collections import OrderedDict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUT = os.environ.get("CUT", "")
SFX = f"_{CUT}" if CUT else ""


def clip_for(lid, tts_dir=f"audio/tts{SFX}"):
    # recordings are per cut: recordings/ for the long cut, recordings/<cut>/ for others
    for ext in ("wav", "m4a", "mp3"):
        p = ROOT / "recordings" / CUT / f"{lid}.{ext}"
        if p.exists():
            return p
    return ROOT / tts_dir / f"{lid}.mp3"


def duration(p):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
                         capture_output=True, text=True, check=True).stdout
    return float(out.strip())


def main():
    lines = json.loads((ROOT / f"content/lines{SFX}.json").read_text())["lines"]
    res, phases = [], OrderedDict()
    for ln in lines:
        p = clip_for(ln["id"])
        d = round(duration(p), 2)
        res.append({"id": ln["id"], "phase": ln["phase"], "file": str(p.relative_to(ROOT)), "seconds": d})
        phases[ln["phase"]] = phases.get(ln["phase"], 0) + d
    (ROOT / f"audio/timings{SFX}.json").write_text(json.dumps(res, indent=2) + "\n")
    for ph, s in phases.items():
        print(f"{s:6.1f}s  {ph}")
    print(f"{sum(phases.values()):6.1f}s  TOTAL speech")


if __name__ == "__main__":
    main()
