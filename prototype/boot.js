/* Modes:
 *   index.html                 plays in real time with audio (click anywhere to start)
 *   index.html?t=40            starts at 40 s
 *   index.html?mode=capture    no clock; the recorder calls window.__render(t) per frame */
(function () {
  const q = new URLSearchParams(location.search);
  window.__render = t => SCENES.render(t);
  window.__total = TIMELINE.total;
  if (q.get("mode") === "capture") { SCENES.render(Number(q.get("t") || 0)); return; }

  let t0 = null, offset = Number(q.get("t") || 0), started = new Set();
  const clips = TIMELINE.lines.map(l => ({ l, a: new Audio("../" + l.file) }));
  SCENES.render(offset);

  function tick(now) {
    const t = offset + (now - t0) / 1000;
    for (const c of clips) {
      if (!started.has(c.l.uid) && t >= c.l.start && t < c.l.start + c.l.dur) {
        started.add(c.l.uid); c.a.currentTime = t - c.l.start; c.a.play().catch(() => {});
      }
    }
    SCENES.render(t);
    if (t < TIMELINE.total) requestAnimationFrame(tick);
  }
  document.addEventListener("click", () => { if (t0 === null) { t0 = performance.now(); requestAnimationFrame(tick); } }, { once: true });
})();
