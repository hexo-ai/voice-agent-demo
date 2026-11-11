"""Build pipeline for the SIA Scenarios demo (illustrative concept).

  python3 build.py tts        # ElevenLabs clips for changed lines (cached in tts/)
  python3 build.py timeline   # web/timeline.js from clip lengths
  python3 build.py mix        # out/audio.wav (voices, phone filter, sound effects)

Words live in content/demo.json. {{product}} is replaced from config.json.
A line can be replaced by your own recording: recordings/<line id>.wav (or .mp3/.m4a).
"""
import hashlib, json, os, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CFG = json.loads((ROOT / "config.json").read_text())
VOICES = json.loads((ROOT / "voices.json").read_text())
TTS = ROOT / "tts"
REC = ROOT / "recordings"
OUT = ROOT / "out"
GAP = 0.32  # default pause after a line


def sub(s, spoken=False):
    return s.replace("{{product}}", CFG["product_name_spoken" if spoken else "product_name"])


def steps():
    src = json.loads((ROOT / "content/demo.json").read_text())
    return src, src["steps"]


def key():
    env = ROOT.parent / ".env"
    for row in env.read_text().splitlines() if env.exists() else []:
        if row.startswith("ELEVENLABS_API_KEY="):
            return row.split("=", 1)[1].strip()
    return os.environ["ELEVENLABS_API_KEY"]


def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                                capture_output=True, text=True).stdout)


def clip(line_id):
    for ext in ("wav", "mp3", "m4a"):
        f = REC / f"{line_id}.{ext}"
        if f.exists():
            return f
    return TTS / f"{line_id}.mp3"


def tts():
    TTS.mkdir(exist_ok=True)
    mpath = TTS / "manifest.json"
    man = json.loads(mpath.read_text()) if mpath.exists() else {}
    k = None
    for st in steps()[1]:
        if "line" not in st:
            continue
        v = VOICES["roles"][st["role"]]
        text = sub(st["text"], spoken=True)
        model = v.get("model_id", VOICES["model_id"])
        sig = hashlib.sha1(json.dumps([text, v["voice_id"], model, v["settings"]]).encode()).hexdigest()
        f = TTS / f"{st['line']}.mp3"
        if f.exists() and man.get(st["line"]) == sig:
            continue
        k = k or key()
        print(f"  tts {st['line']:<8} {text[:60]}")
        body = json.dumps({"text": text, "model_id": model, "voice_settings": v["settings"]}).encode()
        req = urllib.request.Request(
            f"https://api.elevenlabs.io/v1/text-to-speech/{v['voice_id']}?output_format={VOICES['output_format']}",
            data=body, headers={"xi-api-key": k, "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=180) as r:
            f.write_bytes(r.read())
        man[st["line"]] = sig
        mpath.write_text(json.dumps(man, indent=2))


def timeline():
    src, sts = steps()
    t, cues, lines, scenes, sfx = 0.0, {}, [], [], []
    for st in sts:
        if "scene" in st:
            scenes.append({"name": st["scene"], "t": round(t, 3)})
        elif "hold" in st:
            t += st["hold"]
        elif "cue" in st:
            at = t
            if "at" in st:  # cue pinned to the start of an earlier line
                at = next(l["start"] for l in lines if l["id"] == st["at"])
            cues[st["cue"]] = round(at, 3)
            if "sfx" in st:
                sfx.append({"name": st["sfx"], "t": round(at, 3)})
        elif "line" in st:
            full = dur(clip(st["line"]))
            d = min(full, st.get("maxdur", 1e9))
            v = VOICES["roles"][st["role"]]
            lines.append({"id": st["line"], "role": st["role"], "who": sub(v["label"]), "phone": bool(v.get("phone")),
                          "text": sub(st["text"]), "start": round(t, 3), "dur": round(d, 3), "full": round(full, 3)})
            t += d + st.get("gap", GAP)
    tl = {"title": src["title"], "total": round(t, 3), "cues": cues, "lines": lines, "scenes": scenes,
          "sfx": sfx, "config": CFG}
    (ROOT / "web/timeline.js").write_text("window.TL = " + json.dumps(tl, indent=1) + ";\n")
    print(f"  timeline: {t:.1f} s, {len(lines)} lines")
    return tl


SFX_GEN = {  # name: lavfi graph
    "fail": "sine=f=330:d=0.16,volume=0.16,apad=pad_dur=0.05[a];sine=f=247:d=0.3,volume=0.16,afade=t=out:st=0.15:d=0.15[b];[a][b]concat=n=2:v=0:a=1",
}


def mix():
    tl = json.loads((ROOT / "web/timeline.js").read_text().split("=", 1)[1].rstrip(";\n"))
    OUT.mkdir(exist_ok=True)
    sfxdir = OUT / "sfx"
    sfxdir.mkdir(exist_ok=True)
    for name, graph in SFX_GEN.items():
        f = sfxdir / f"{name}.wav"
        if not f.exists():
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-filter_complex", graph, "-ar", "44100", "-ac", "1", str(f)], check=True)
    inputs, chains = [], []
    events = [(l["start"], clip(l["id"]), l["phone"], l["dur"]) for l in tl["lines"]]
    events += [(s["t"], sfxdir / f"{s['name']}.wav", False, None) for s in tl["sfx"]]
    for i, (t, f, phone, d) in enumerate(events):
        inputs += ["-i", str(f)]
        cut = f"atrim=0:{d},afade=t=out:st={max(d - 0.25, 0)}:d=0.25," if d else ""
        filt = cut + ("highpass=f=300,lowpass=f=3400,acompressor=threshold=0.2:ratio=3,volume=1.1," if phone else "")
        chains.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=mono,{filt}adelay={int(t * 1000)}:all=1[a{i}]")
    graph = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(len(events))) + \
        f"amix=inputs={len(events)}:normalize=0,atrim=0:{tl['total']},alimiter=limit=0.89,apad=whole_dur={tl['total']}[out]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", graph, "-map", "[out]", "-ar", "44100", "-ac", "2",
                    str(OUT / "audio.wav")], check=True)
    print(f"  mixed {OUT / 'audio.wav'}")


if __name__ == "__main__":
    {"tts": tts, "timeline": timeline, "mix": mix}[sys.argv[1]]()
