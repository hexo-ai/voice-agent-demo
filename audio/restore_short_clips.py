"""Restore short-cut TTS clips that are still in git history, so they don't need regenerating.

Early short-cut clips were committed in 2df9970 (later untracked). A clip is restored only if its
text, voice and model match the current content/lines_short.json exactly (same signature that
generate_tts.py uses), so restored clips are identical to what generate_tts.py would keep.
Lines that don't match are left for generate_tts.py.

  CUT=short python3 audio/restore_short_clips.py
"""
import hashlib, json, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
COMMIT = "2df9970"


def main():
    cfg = json.loads((ROOT / "audio/voices.json").read_text())
    lines = json.loads((ROOT / "content/lines_short.json").read_text())["lines"]
    old = json.loads(subprocess.run(["git", "show", f"{COMMIT}:audio/tts_short/manifest.json"], cwd=ROOT,
                                    capture_output=True, text=True, check=True).stdout)
    out = ROOT / "audio/tts_short"
    out.mkdir(parents=True, exist_ok=True)
    mpath = out / "manifest.json"
    manifest = json.loads(mpath.read_text()) if mpath.exists() else {}
    restored, left = [], []
    for ln in lines:
        sig = hashlib.sha1(json.dumps([ln["text"], cfg["roles"][ln["voice"]], cfg["model_id"]]).encode()).hexdigest()
        if manifest.get(ln["id"]) == sig and (out / f"{ln['id']}.mp3").exists():
            continue
        if old.get(ln["id"]) == sig:
            data = subprocess.run(["git", "show", f"{COMMIT}:audio/tts_short/{ln['id']}.mp3"], cwd=ROOT,
                                  capture_output=True, check=True).stdout
            (out / f"{ln['id']}.mp3").write_bytes(data)
            manifest[ln["id"]] = sig
            restored.append(ln["id"])
        else:
            left.append(ln["id"])
    mpath.write_text(json.dumps(manifest, indent=2))
    print(f"restored {len(restored)}: {' '.join(restored)}")
    print(f"still to generate {len(left)}: {' '.join(left)}")


if __name__ == "__main__":
    main()
