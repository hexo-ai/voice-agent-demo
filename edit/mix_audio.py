"""Mix every clip into one audio track at its timeline position.

Phone-call voices (agent, patient) get a telephone band filter so calls sound like calls.
  python3 edit/mix_audio.py            -> out/audio_full.wav
"""
import json, os, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUT = os.environ.get("CUT", "")
SFX = f"_{CUT}" if CUT else ""
PHONE = "highpass=f=320,lowpass=f=3300,acompressor=threshold=-20dB:ratio=3,volume=1.15"
GAIN = {"narrator": 1.0, "nurse": 1.0, "system": 0.95, "agent": 1.0, "patient": 1.0}


def main():
    tl = json.loads((ROOT / f"prototype/data/timeline{SFX}.json").read_text())
    args, flt = [], []
    for i, l in enumerate(tl["lines"]):
        args += ["-i", str(ROOT / l["file"])]
        chain = [f"aresample=44100", "aformat=channel_layouts=stereo"]
        if l["voice"] in ("agent", "patient"):
            chain.append(PHONE)
        chain += [f"volume={GAIN[l['voice']]}", f"adelay={int(l['start'] * 1000)}:all=1"]
        flt.append(f"[{i}:a]{','.join(chain)}[a{i}]")
    n = len(tl["lines"])
    flt.append("".join(f"[a{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad=whole_dur={tl['total']}[o]")
    out = ROOT / f"out/audio_full{SFX}.wav"
    out.parent.mkdir(exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", *args, "-filter_complex", ";".join(flt), "-map", "[o]",
                    "-t", str(tl["total"]), str(out)], check=True)
    print(out)


if __name__ == "__main__":
    main()
