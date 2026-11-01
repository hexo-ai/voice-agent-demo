// Render still frames at given times:  node record/stills.js 14 27 44
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const times = process.argv.slice(2).map(Number);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  page.on("pageerror", e => console.error("PAGE ERROR:", e.message));
  await page.goto("file://" + path.resolve(__dirname, "../prototype/index.html") + "?mode=capture");
  await page.evaluate(() => document.fonts.ready);
  for (const t of times) {
    await page.evaluate(t => window.__render(t), t);
    const f = path.resolve(__dirname, `../out/stills/t${String(t).padStart(6, "0")}.png`);
    await page.screenshot({ path: f });
    console.log(f);
  }
  await browser.close();
})();
