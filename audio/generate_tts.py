"""Generate one ElevenLabs clip per line in content/lines.json.

  python3 audio/generate_tts.py                 # generate missing / changed clips
  python3 audio/generate_tts.py --force         # regenerate everything
  python3 audio/generate_tts.py --only nurse_03 # one or more line IDs
  python3 audio/generate_tts.py --role nurse --voice vignesh_clone --out audio/tts_alt
                                                # try an alternate voice for one role

Clips go to audio/tts/<id>.mp3 (gitignored). A manifest records the text + voice used,
so a clip is regenerated automatically when its line or voice changes.
Needs ELEVENLABS_API_KEY in .env.
"""
import argparse, hashlib, json, os, re, subprocess, sys, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CUT = os.environ.get("CUT", "")
SFX = f"_{CUT}" if CUT else ""


def load_env():
    env = ROOT / ".env"
    if env.exists():
        for row in env.read_text().splitlines():
            if "=" in row and not row.lstrip().startswith("#"):
                k, v = row.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


def tts(text, voice, cfg, key):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice['voice_id']}?output_format={cfg['output_format']}"
    body = json.dumps({"text": text, "model_id": voice.get("model_id", cfg["model_id"]), "voice_settings": voice.get("settings", {})}).encode()
    req = urllib.request.Request(url, data=body, headers={"xi-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


# Takes that say the product name are transcribed and regenerated if the name comes out wrong
# (the voice model sometimes spells it out or says "Saya"). Accepted: "Sia" said as one word.
NAME_OK = re.compile(r"\b(sia|see ?a|seeya|sea)[ .,-]*(voice|build)", re.I)


def transcribe(path, key):
    out = subprocess.run(["curl", "-s", "-m", "90", "-H", f"xi-api-key: {key}", "-F", "model_id=scribe_v1",
                          "-F", f"file=@{path}", "https://api.elevenlabs.io/v1/speech-to-text"],
                         capture_output=True, text=True).stdout
    try:
        return json.loads(out).get("text", "")
    except ValueError:
        return ""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--only", nargs="*")
    ap.add_argument("--role", help="limit to one voice role")
    ap.add_argument("--voice", help="use an alternate voice from voices.json 'alternates'")
    ap.add_argument("--out", default=f"audio/tts{SFX}")
    a = ap.parse_args()

    load_env()
    key = os.environ.get("ELEVENLABS_API_KEY")
    if not key:
        sys.exit("ELEVENLABS_API_KEY missing (put it in .env)")
    cfg = json.loads((ROOT / "audio/voices.json").read_text())
    lines = json.loads((ROOT / f"content/lines{SFX}.json").read_text())["lines"]
    out = ROOT / a.out
    out.mkdir(parents=True, exist_ok=True)
    mpath = out / "manifest.json"
    manifest = json.loads(mpath.read_text()) if mpath.exists() else {}

    for ln in lines:
        if a.only and ln["id"] not in a.only:
            continue
        if a.role and ln["voice"] != a.role:
            continue
        voice = cfg["alternates"][a.voice] if a.voice else cfg["roles"][ln["voice"]]
        sig = hashlib.sha1(json.dumps([ln["text"], voice, cfg["model_id"]]).encode()).hexdigest()
        f = out / f"{ln['id']}.mp3"
        if f.exists() and manifest.get(ln["id"]) == sig and not a.force:
            continue
        # another cut may already have this exact clip: reuse it instead of paying for it again
        base = ROOT / "audio/tts"
        bman = json.loads((base / "manifest.json").read_text()) if (base / "manifest.json").exists() else {}
        if out != base and bman.get(ln["id"]) == sig and (base / f"{ln['id']}.mp3").exists() and not a.force:
            f.write_bytes((base / f"{ln['id']}.mp3").read_bytes())
            manifest[ln["id"]] = sig
            mpath.write_text(json.dumps(manifest, indent=2))
            continue
        print(f"  {ln['id']:<11} {voice['name'].split(' -')[0]:<8} {ln['text'][:60]}")
        spoken = json.loads((ROOT / "content/config.json").read_text()).get("product_name_spoken", "")
        for attempt in range(5):
            f.write_bytes(tts(ln["text"], voice, cfg, key))
            if not spoken or spoken not in ln["text"]:
                break
            heard = transcribe(f, key)
            # capital "SIA" / "S.I.A." in the transcript means it was spelled out letter by letter
            spelled = re.search(r"\bSIA\b|\bS\.? ?I\.? ?A\b", heard)
            if NAME_OK.search(heard) and not spelled:
                break
            print(f"    name mispronounced (heard: {heard[:40]!r}), retrying")
        manifest[ln["id"]] = sig
        mpath.write_text(json.dumps(manifest, indent=2))
    print("done")


if __name__ == "__main__":
    main()
