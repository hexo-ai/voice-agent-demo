// Capture frames deterministically:  node record/capture.js --from 10 --to 88 --fps 30
// Writes out/frames/f000001.jpg ... ; each frame = window.__render(t).
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i > 0 ? Number(process.argv[i + 1]) : d; };
(async () => {
  const fps = arg("fps", 30), from = arg("from", 0);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", e => { console.error("PAGE ERROR:", e.message); process.exit(1); });
  const CUT = process.env.CUT || "";
  await page.goto("file://" + path.resolve(__dirname, "../prototype/index.html") + "?mode=capture" + (CUT ? "&cut=" + CUT : ""));
  await page.evaluate(() => document.fonts.ready);
  const to = arg("to", await page.evaluate(() => window.__total));
  const dir = path.resolve(__dirname, "../out/frames" + (CUT ? "_" + CUT : ""));
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round((to - from) * fps);
  const t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.__render(t), from + i / fps);
    await page.screenshot({ path: path.join(dir, `f${String(i + 1).padStart(6, "0")}.jpg`), type: "jpeg", quality: 92 });
    if (i % 300 === 0) console.log(`frame ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  fs.writeFileSync(path.join(dir, "range.json"), JSON.stringify({ from, to, fps, frames: n }));
  await browser.close();
  console.log(`captured ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
})();
