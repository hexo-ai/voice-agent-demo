"""Build the shared timeline: when each line starts, how long it lasts, its loudness envelope.

Inputs : content/lines.json, content/config.json, audio/timings.json, audio/envelopes.json,
         prototype/data/holds.json
Outputs: prototype/data/timeline.json   (read by edit/mix_audio.py)
         prototype/data/timeline.js     (same data, loadable from file:// by the prototype)
Run after any audio change:  python3 prototype/build_timeline.py
"""
import json, os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUT = os.environ.get("CUT", "")
SFX = f"_{CUT}" if CUT else ""
J = lambda p: json.loads((ROOT / p).read_text())


def main():
    lines = J(f"content/lines{SFX}.json")["lines"]
    cfg = J("content/config.json")
    # per-cut overrides (e.g. content/config_short.json); only the keys present are replaced
    over = ROOT / f"content/config{SFX}.json"
    if SFX and over.exists():
        cfg.update({k: v for k, v in json.loads(over.read_text()).items() if not k.startswith("_")})
    timings = {x["id"]: x for x in J(f"audio/timings{SFX}.json")}
    env = J(f"audio/envelopes{SFX}.json")
    holds = J(f"prototype/data/holds{SFX}.json")
    replays = {r["before"]: r for r in holds.get("replays", [])}
    byid = {l["id"]: l for l in lines}

    t, seq = holds.get("start_pad", 0.5), []

    def place(uid, src):
        nonlocal t
        if seq:
            t += holds["default_gap"]
        t += holds["before"].get(uid, 0)
        ln = byid[src]
        d = timings[src]["seconds"]
        seq.append({"uid": uid, "id": src, "voice": ln["voice"], "phase": ln["phase"], "text": ln["text"],
                    "start": round(t, 3), "dur": d, "file": timings[src]["file"], "env": env[src]})
        t += d + holds["after"].get(uid, 0)

    for ln in lines:
        if ln["id"] in replays:
            r = replays[ln["id"]]
            place(r["as"], r["clip"])
        place(ln["id"], ln["id"])

    # on-screen text uses the written product name, not the TTS spelling
    for s in seq:
        if cfg.get("product_name_spoken"):
            s["text"] = s["text"].replace(cfg["product_name_spoken"], cfg["product_name"])

    out = {"config": cfg, "total": round(t + 1.5, 3), "lines": seq}
    (ROOT / f"prototype/data/timeline{SFX}.json").write_text(json.dumps(out, indent=1) + "\n")
    (ROOT / f"prototype/data/timeline{SFX}.js").write_text("window.TIMELINE = " + json.dumps(out) + ";\n")
    print(f"{len(seq)} clips placed, total {out['total']:.1f}s")


if __name__ == "__main__":
    main()
