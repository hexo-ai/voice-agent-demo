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
    has: uid => !!byUid[uid],
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

  // ---- small voice bar (orb + speaker + live caption) used on the expert side ----
  const VB_COL = { system: [91, 95, 214], nurse: [217, 147, 43] };
  const VB_NAME = () => ({ system: TL.config.product_name, nurse: "Vignesh" });
  U.voiceBar = function (el, t, uids, a = null, b = null) {
    const lines = uids.map(u => byUid[u]);
    const first = lines[0], last = lines[lines.length - 1];
    const A = a ?? first.start - 0.4, B = b ?? last.start + last.dur + 0.8;
    const o = U.fade(el, t, A, B, 0.3);
    if (o <= 0) return;
    // current or most recent line
    let cur = lines[0];
    for (const l of lines) if (t >= l.start - 0.05) cur = l;
    const words = cur.text.split(/\s+/);
    if (el.__uid !== cur.uid) {
      el.__uid = cur.uid;
      el.querySelector(".vb-cap").innerHTML = words.map(w => `<span class="w">${w}</span>`).join(" ");
      const col = cur.voice === "system" ? "var(--sia)" : "var(--vig)";
      el.querySelector(".vb-who").innerHTML = `<span style="color:${col}">${VB_NAME()[cur.voice]}</span>`;
    }
    const said = t < cur.start ? 0 : U.wordsSaid(cur, t, words.length);
    [...el.querySelectorAll(".vb-cap .w")].forEach((w, i) => U.cls(w, "said", i < said));
    // orb
    const cv = el.querySelector("canvas"), ctx = cv.getContext("2d"), W = cv.width, C = W / 2;
    const speaking = t >= cur.start && t < cur.start + cur.dur;
    let amp = 0;
    if (speaking) { for (let k = -2; k <= 2; k++) amp += U.envAt(cur, t + k * 0.05); amp /= 5; }
    const [r, g, bb] = VB_COL[cur.voice] || [150, 163, 178];
    ctx.clearRect(0, 0, W, W);
    const base = 26 + Math.sin(t * 1.6) * 1.2;
    for (let k = 2; k >= 1; k--) {
      ctx.beginPath(); ctx.arc(C, C, base + 7 * k + amp * 8 * k, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${bb},${(0.1 + amp * 0.08) / k})`; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(C, C, base + amp * 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgb(${r},${g},${bb})`; ctx.fill();
  };

  // deterministic pseudo-random in [0,1) from an integer
  U.hash = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // test-suite strip: cells = [{state:"pass"|"fail"|"idle", isNew:bool}]
  U.suite = function (el, cells) {
    while (el.children.length < cells.length) el.appendChild(document.createElement("i"));
    [...el.children].forEach((c, i) => {
      const d = cells[i];
      U.css(c, { display: d ? "block" : "none" });
      if (!d) return;
      U.cls(c, "pass", d.state === "pass"); U.cls(c, "fail", d.state === "fail"); U.cls(c, "new", !!d.isNew);
    });
  };

  // step transition cards: phases register when their step starts
  const STEP_DESC = [
    "The expert describes the job by voice. SIA_NAME asks what an engineer would ask.",
    "SIA_NAME turns the spec into a working first version.",
    "Tests for every requirement and edge case, run as simulated calls.",
    "Tries many fixes and keeps what works. Fine-tunes where prompts fall short.",
    "The expert listens to the calls SIA_NAME is least sure about.",
    "A real call with a real person. Feedback becomes new tests.",
  ];
  const cards = [];
  U.stepCard = (step, at) => cards.push({ step, at });

  const scenes = [];
  const SCENES = {
    add(s) { scenes.push(s); },
    render(t) {
      chrome.showTopbar = false;
      for (const s of scenes) s.render(t);
      // Dual-panel scenes: keep the backdrop steady and dip the content (out, then in)
      // instead of cross-dissolving two busy layouts on top of each other.
      let bg = 0;
      const vis = [...document.querySelectorAll(".scene.dual")].map(el => ({ el, o: Number(el.style.opacity || 0) })).filter(v => v.o > 0);
      vis.forEach(v => { bg = Math.max(bg, v.o); });
      if (vis.length >= 2) {
        bg = 1;
        // transition driven by the incoming scene: first half fades the old one out, second half fades the new one in
        const w = vis[vis.length - 1].o;
        vis.forEach((v, i) => U.css(v.el, { opacity: i === vis.length - 1 ? U.clamp(2 * w - 1).toFixed(3) : i === vis.length - 2 ? U.clamp(1 - 2 * w).toFixed(3) : "0" }));
      }
      U.css(document.getElementById("bgdual"), { opacity: bg.toFixed(3) });
      renderCard(t);
      renderChrome(t);
    },
  };

  /* ---------- chrome shared by all phases ---------- */
  const STEPS = ["Collect requirements", "Build agent", "Run simulation", "Improve and fine-tune", "Expert review", "Live testing"];
  const stepper = document.getElementById("stepper");
  stepper.innerHTML = STEPS.map((s, i) => `<li><span class="n">${i + 1}</span>${s}</li>`).join("");
  document.querySelectorAll("[data-product-name]").forEach(e => (e.textContent = TL.config.product_name));
  document.querySelectorAll("[data-tagline]").forEach(e => (e.textContent = TL.config.tagline));
  document.getElementById("tag").textContent = TL.config.illustrative_tag;

  const chrome = { step: -1, clock: null, showTopbar: false };
  const subtitle = document.getElementById("subtitle");
  const topbar = document.getElementById("topbar");

  const pc = document.getElementById("phasecard");
  const pcSteps = document.getElementById("pc-steps");
  pcSteps.innerHTML = STEPS.map((s, i) => `<li>${i ? '<span class="bar"></span>' : ""}<span class="dot">${i + 1}</span></li>`).join("");
  function renderCard(t) {
    const c = cards.find(c => t >= c.at - 0.3 && t < c.at + 1.8);
    if (!c) { U.css(pc, { opacity: 0 }); return; }
    U.fade(pc, t, c.at, c.at + 1.5, 0.25);   // cards last 1.5 s
    [...pcSteps.children].forEach((li, i) => { U.cls(li, "on", i === c.step); U.cls(li, "done", i < c.step); });
    U.html(document.getElementById("pc-title"), `<span>Step ${c.step + 1} of ${STEPS.length}</span>${STEPS[c.step]}`);
    U.text(document.getElementById("pc-desc"), STEP_DESC[c.step].replace(/SIA_NAME/g, TL.config.product_name));
  }

  function renderChrome(t) {
    U.css(topbar, { opacity: chrome.showTopbar ? 1 : 0 });
    [...stepper.children].forEach((li, i) => {
      U.cls(li, "on", i === chrome.step);
      U.cls(li, "done", i < chrome.step);
    });
    if (chrome.clock != null) U.text(document.getElementById("clock-value"), U.fmtClock(chrome.clock));

    // narrator subtitles, everywhere except the hook (hook shows its words full size)
    const n = U.active(t, l => l.voice === "narrator");
    if (n) {
      U.text(subtitle, n.text);
      U.fade(subtitle, t, n.start - 0.15, n.start + n.dur + 0.35, 0.25);
    } else U.css(subtitle, { opacity: 0 });
  }

  window.U = U;
  window.SCENES = SCENES;
  window.CHROME = chrome;
})();
