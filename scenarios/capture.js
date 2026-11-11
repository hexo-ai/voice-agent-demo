// node capture.js [--fps 30] [--stills 10,50,90]
const { chromium } = require("playwright");
const fs = require("fs"), path = require("path");
const arg = k => { const i = process.argv.indexOf("--" + k); return i > 0 ? process.argv[i + 1] : null; };
(async () => {
  const fps = Number(arg("fps") || 30), stills = arg("stills");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", e => { console.error("PAGE ERROR:", e.message); process.exit(1); });
  await page.goto("file://" + path.resolve(__dirname, "web/index.html") + "?mode=capture");
  await page.evaluate(() => document.fonts.ready);
  if (stills) {
    fs.mkdirSync(path.resolve(__dirname, "out/stills"), { recursive: true });
    for (const t of stills.split(",").map(Number)) {
      await page.evaluate(t => window.__render(t), t);
      const f = path.resolve(__dirname, `out/stills/s_${String(t).padStart(6, "0")}.png`);
      await page.screenshot({ path: f }); console.log(f);
    }
    return browser.close();
  }
  const total = await page.evaluate(() => window.__total);
  const dir = path.resolve(__dirname, "out/frames");
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(total * fps), t0 = Date.now();
  for (let i = 0; i < n; i++) {
    await page.evaluate(t => window.__render(t), i / fps);
    await page.screenshot({ path: path.join(dir, `f${String(i + 1).padStart(6, "0")}.jpg`), type: "jpeg", quality: 90 });
    if (i % 600 === 0) console.log(`frame ${i}/${n} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
})();
