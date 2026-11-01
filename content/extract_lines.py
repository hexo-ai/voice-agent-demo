"""Extract every spoken line from content/script.md into content/lines.json.

Run after editing the script:  python3 content/extract_lines.py
Placeholders like {{product_name}} are filled from content/config.json.
"""
import json, os, re
from pathlib import Path

HERE = Path(__file__).parent
CUT = os.environ.get("CUT", "")
SFX = f"_{CUT}" if CUT else ""
ROLES = {"narr": "narrator", "nurse": "nurse", "sys": "system", "agent": "agent", "patient": "patient"}


def fill(text, cfg):
    return re.sub(r"\{\{(\w+)\}\}", lambda m: cfg[m.group(1)], text)


def main():
    cfg = json.loads((HERE / "config.json").read_text())
    # spoken lines use the pronunciation spelling, if one is set
    cfg["product_name"] = cfg.get("product_name_spoken", cfg["product_name"])
    lines, phase = [], None
    for row in (HERE / f"script{SFX}.md").read_text().splitlines():
        m = re.match(r"## (\d:\d\d–\d:\d\d) — (.+)", row)
        if m:
            phase = m.group(2)
            continue
        m = re.match(r"> \*\*(\w+_\d+):\*\* (.*)", row)
        if not m:
            continue
        lid, text = m.groups()
        direction = None
        d = re.match(r"\*\((.+?)\)\*\s*(.*)", text)
        if d:
            direction, text = d.groups()
        if direction == "replayed":  # reuses an earlier clip
            continue
        entry = {"id": lid, "voice": ROLES[lid.split("_")[0]], "phase": phase, "text": fill(text.strip(), cfg)}
        if direction:
            entry["direction"] = direction
        lines.append(entry)
    ids = [l["id"] for l in lines]
    assert len(ids) == len(set(ids)), "duplicate line IDs"
    out = {"version": 1, "source": f"content/script{SFX}.md", "lines": lines}
    (HERE / f"lines{SFX}.json").write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
    words = sum(len(l["text"].split()) for l in lines)
    print(f"{len(lines)} lines, {words} words, ~{round(words / 155 * 60)} s of speech")


if __name__ == "__main__":
    main()
