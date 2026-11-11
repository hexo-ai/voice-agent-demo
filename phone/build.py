"""Build pipeline for the AgentPhone demos.

  python3 build.py demo1 tts        # ElevenLabs clips for changed lines (cached in tts/)
  python3 build.py demo1 timeline   # web/timeline_demo1.js from clip lengths
  python3 build.py demo1 mix        # out/demo1_audio.wav (voices, phone filter, sound effects)

Words live in content/<demo>.json (+ content/hook.json). {{product}} is replaced from config.json.
"""
import hashlib, json, os, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CFG = json.loads((ROOT / "config.json").read_text())
VOICES = json.loads((ROOT / "voices.json").read_text())
TTS = ROOT / "tts"
OUT = ROOT / "out"
GAP = 0.32  # default pause after a line


def sub(s, spoken=False):
    return s.replace("{{product}}", CFG["product_name_spoken" if spoken else "product_name"])


def steps(demo):
    src = json.loads((ROOT / f"content/{demo}.json").read_text())
    out = []
    for st in src["steps"]:
        if "include" in st:
            out += json.loads((ROOT / f"content/{st['include']}.json").read_text())
        else:
            out.append(st)
    return src, out


def key():
    env = ROOT.parent / ".env"
    for row in env.read_text().splitlines() if env.exists() else []:
        if row.startswith("ELEVENLABS_API_KEY="):
            return row.split("=", 1)[1].strip()
    return os.environ["ELEVENLABS_API_KEY"]


def dur(path):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)],
                                capture_output=True, text=True).stdout)


def tts(demo):
    TTS.mkdir(exist_ok=True)
    mpath = TTS / "manifest.json"
    man = json.loads(mpath.read_text()) if mpath.exists() else {}
    k = None
    for st in steps(demo)[1]:
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


def timeline(demo):
    src, sts = steps(demo)
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
            full = dur(TTS / f"{st['line']}.mp3")
            d = min(full, st.get("maxdur", 1e9))
            v = VOICES["roles"][st["role"]]
            lines.append({"id": st["line"], "role": st["role"], "who": sub(v["label"]), "phone": bool(v.get("phone")),
                          "text": sub(st["text"]), "start": round(t, 3), "dur": round(d, 3), "full": round(full, 3)})
            t += d + st.get("gap", GAP)
    tl = {"demo": demo, "title": src["title"], "total": round(t, 3), "cues": cues, "lines": lines, "scenes": scenes,
          "sfx": sfx, "config": CFG}
    (ROOT / f"web/timeline_{demo}.js").write_text("window.TL = " + json.dumps(tl, indent=1) + ";\n")
    print(f"  {demo}: {t:.1f} s, {len(lines)} lines")
    return tl


SFX_GEN = {  # name: (lavfi source, seconds)
    "ringback": ("sine=f=440:d=2[a];sine=f=480:d=2[b];[a][b]amix=2,volume=0.25,apad=pad_dur=0.4", None),
    "ring": ("sine=f=880:d=0.4[a];sine=f=1100:d=0.4[b];[a][b]amix=2,volume=0.2,apad=pad_dur=0.2[x];[x]asplit[p][q];[p][q]concat=n=2:v=0:a=1,apad=pad_dur=0.8", None),
    "hangup": ("sine=f=620:d=0.12,volume=0.2,apad=pad_dur=0.06[a];sine=f=480:d=0.18,volume=0.2[b];[a][b]concat=n=2:v=0:a=1", None),
    "ping": ("sine=f=1320:d=0.09,volume=0.18,apad=pad_dur=0.05[a];sine=f=1760:d=0.14,volume=0.15,afade=t=out:st=0.04:d=0.1[b];[a][b]concat=n=2:v=0:a=1", None),
}


def mix(demo):
    tl = json.loads((ROOT / f"web/timeline_{demo}.js").read_text().split("=", 1)[1].rstrip(";\n"))
    OUT.mkdir(exist_ok=True)
    sfxdir = OUT / "sfx"
    sfxdir.mkdir(exist_ok=True)
    for name, (graph, _) in SFX_GEN.items():
        f = sfxdir / f"{name}.wav"
        if not f.exists():
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-filter_complex", graph, "-ar", "44100", "-ac", "1", str(f)], check=True)
    inputs, chains = [], []
    events = [(l["start"], TTS / f"{l['id']}.mp3", l["phone"], l["dur"]) for l in tl["lines"]]
    events += [(s["t"], sfxdir / f"{s['name']}.wav", False, None) for s in tl["sfx"]]
    for i, (t, f, phone, d) in enumerate(events):
        inputs += ["-i", str(f)]
        cut = f"atrim=0:{d},afade=t=out:st={max(d - 0.25, 0)}:d=0.25," if d else ""
        filt = cut + ("highpass=f=300,lowpass=f=3400,acompressor=threshold=0.2:ratio=3,volume=1.1," if phone else "")
        chains.append(f"[{i}:a]aresample=44100,aformat=channel_layouts=mono,{filt}adelay={int(t * 1000)}:all=1[a{i}]")
    graph = ";".join(chains) + ";" + "".join(f"[a{i}]" for i in range(len(events))) + \
        f"amix=inputs={len(events)}:normalize=0,atrim=0:{tl['total']},alimiter=limit=0.89,apad=whole_dur={tl["total"]}[out]"
    subprocess.run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", graph, "-map", "[out]", "-ar", "44100", "-ac", "2",
                    str(OUT / f"{demo}_audio.wav")], check=True)
    print(f"  mixed {OUT / f'{demo}_audio.wav'}")


if __name__ == "__main__":
    demo, step = sys.argv[1], sys.argv[2]
    {"tts": tts, "timeline": timeline, "mix": mix}[step](demo)
