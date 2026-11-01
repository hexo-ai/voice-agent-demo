/* Shared engine. Every frame is a pure function of time t (seconds), so frame-by-frame
 * capture stays exactly in sync with the audio. Phases register with SCENES.add(). */
(function () {
  const TL = window.TIMELINE;
  const byUid = Object.fromEntries(TL.lines.map(l => [l.uid, l]));

  const U = {
    clamp: (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)),
    // 0→1 progress of t between a and b
    prog: (t, a, b) => U.clamp((t - a) / (b - a)),
    ease: x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    line: uid => byUid[uid],
    start: uid => byUid[uid].start,
    end: uid => byUid[uid].start + byUid[uid].dur,
    // time at a fraction of a line (0 = start, 1 = end)
    at: (uid, f = 1) => byUid[uid].start + byUid[uid].dur * f,
    active(t, filter) {
      return TL.lines.find(l => t >= l.start && t < l.start + l.dur && (!filter || filter(l)));
    },
    envAt(l, t) {
      if (!l) return 0;
      const i = Math.floor((t - l.start) * 20);
      return l.env[Math.max(0, Math.min(l.env.length - 1, i))] || 0;
    },
    // words spoken so far, assuming an even pace through the clip
    wordsSaid(l, t, nWords) {
      const f = U.clamp((t - l.start) / (l.dur * 0.94));
      return Math.round(f * nWords);
    },
    fmtClock(sec) {
      sec = Math.max(0, Math.floor(sec));
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    },
    // set style only when changed (keeps capture fast)
    css(el, props) { for (const k in props) { const v = String(props[k]); if (el.style[k] !== v) el.style[k] = v; } },
    cls(el, name, on) { if (el.classList.contains(name) !== !!on) el.classList.toggle(name, !!on); },
    text(el, s) { if (el.textContent !== s) el.textContent = s; },
    html(el, s) { if (el.__h !== s) { el.innerHTML = s; el.__h = s; } },
    fade(el, t, a, b, d = 0.4) {
      // visible from a to b with d-second fades
      const o = Math.min(U.prog(t, a, a + d), 1 - U.prog(t, b - d, b));
      U.css(el, { opacity: o.toFixed(3) });
      return o;
    },
  };

  const scenes = [];
  const SCENES = {
    add(s) { scenes.push(s); },
    render(t) {
      for (const s of scenes) s.render(t);
      renderChrome(t);
    },
  };

  /* ---------- chrome shared by all phases ---------- */
  const STEPS = ["Interview", "First version", "Tests", "Simulations", "Improve", "Expert review", "Live test"];
  const stepper = document.getElementById("stepper");
  stepper.innerHTML = STEPS.map((s, i) => `<li><span class="n">${i + 1}</span>${s}</li>`).join("");
  document.querySelectorAll("[data-product-name]").forEach(e => (e.textContent = TL.config.product_name));
  document.querySelectorAll("[data-tagline]").forEach(e => (e.textContent = TL.config.tagline));
  document.getElementById("tag").textContent = TL.config.illustrative_tag;

  const chrome = { step: -1, clock: null, showTopbar: false };
  const subtitle = document.getElementById("subtitle");
  const topbar = document.getElementById("topbar");

  function renderChrome(t) {
    U.css(topbar, { opacity: chrome.showTopbar ? 1 : 0 });
    [...stepper.children].forEach((li, i) => {
      U.cls(li, "on", i === chrome.step);
      U.cls(li, "done", i < chrome.step);
    });
    if (chrome.clock != null) U.text(document.getElementById("clock-value"), U.fmtClock(chrome.clock));

    // narrator subtitles, everywhere except the hook (hook shows its words full size)
    const n = U.active(t, l => l.voice === "narrator");
    if (n && !n.phase.startsWith("Hook")) {
      U.text(subtitle, n.text);
      U.fade(subtitle, t, n.start - 0.15, n.start + n.dur + 0.35, 0.25);
    } else U.css(subtitle, { opacity: 0 });
  }

  window.U = U;
  window.SCENES = SCENES;
  window.CHROME = chrome;
})();
