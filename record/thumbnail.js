// Render the video thumbnail (1280x720 PNG):  node record/thumbnail.js  -> out/thumbnail.png
// SIA Voice at the centre, inside the loop it runs: interview, build, test, improve, live test.
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const cfg = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../content/config.json"), "utf8"));
const fonts = "file://" + path.resolve(__dirname, "../prototype/fonts");

const W = 1280, H = 720, C = [640, 350], R = 262;
const STEPS = ["Interview", "Build", "Test", "Improve", "Live test"];
const pos = i => { const a = (-90 + i * 72) * Math.PI / 180; return [C[0] + R * Math.cos(a), C[1] + R * Math.sin(a)]; };
const pills = STEPS.map((s, i) => {
  const [x, y] = pos(i), w = s.length * 11.5 + 44;
  return `<g><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="44" rx="22" fill="#1E2B3B" stroke="#33465E" stroke-width="1.5"/>
    <text x="${x}" y="${y + 7}" text-anchor="middle" font-size="19" fill="#D6DEE8">${s}</text></g>`;
}).join("");

const html = `<!doctype html><html><head><style>
@font-face { font-family: A; src: url(${fonts}/atkinson-hyperlegible-latin-400-normal.woff2); font-weight: 400; }
@font-face { font-family: A; src: url(${fonts}/atkinson-hyperlegible-latin-700-normal.woff2); font-weight: 700; }
* { margin: 0; } body { width: ${W}px; height: ${H}px; background: #16212E; font-family: A; overflow: hidden; }
svg text { font-family: A; }
.mark { position: absolute; left: 0; right: 0; top: ${C[1] - 46}px; text-align: center; color: #fff; font-weight: 700; font-size: 74px; letter-spacing: -0.01em; }
.mark::before { content: ""; display: inline-block; width: 30px; height: 30px; border-radius: 50%; background: #5B5FD6; box-shadow: 0 0 0 9px rgba(91,95,214,.28); margin-right: 22px; vertical-align: 7px; }
.sub { position: absolute; left: 0; right: 0; top: ${C[1] + 42}px; text-align: center; color: #A9B6C6; font-size: 21px; }
.tag { position: absolute; right: 22px; bottom: 18px; font-size: 15px; color: #fff; border: 1px solid rgba(255,255,255,.25); border-radius: 999px; padding: 5px 13px; background: rgba(22,33,46,.8); }
</style></head><body>
<svg width="${W}" height="${H}" style="position:absolute;inset:0">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7B7FE8"/><stop offset="1" stop-color="#5B5FD6"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#5B5FD6" stop-opacity=".22"/><stop offset="1" stop-color="#5B5FD6" stop-opacity="0"/></radialGradient></defs>
  <circle cx="${C[0]}" cy="${C[1]}" r="${R + 60}" fill="url(#glow)"/>
  <circle cx="${C[0]}" cy="${C[1]}" r="${R}" fill="none" stroke="#2A3B50" stroke-width="3"/>
  <circle cx="${C[0]}" cy="${C[1]}" r="${R}" fill="none" stroke="url(#g)" stroke-width="5" stroke-linecap="round"
    pathLength="100" stroke-dasharray="62 38" transform="rotate(-90 ${C[0]} ${C[1]})"/>
  ${pills}
</svg>
<div class="mark">${cfg.product_name}</div>
<div class="sub">${cfg.tagline}</div>
<div class="tag">${cfg.illustrative_tag}</div>
</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const tmp = path.resolve(__dirname, "../out/thumbnail.html");
  fs.writeFileSync(tmp, html);
  await p.goto("file://" + tmp);
  await p.evaluate(() => document.fonts.ready);
  const out = path.resolve(__dirname, "../out/thumbnail.png");
  await p.screenshot({ path: out });
  await b.close();
  console.log(out);
})();
