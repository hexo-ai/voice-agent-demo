/* Phase 1 — voice interview.
 * Left: voice mode (orb + live captions). Right: the spec forming from what Vignesh says,
 * and the checklist of questions an engineer would ask. All timings hang off line IDs. */
(function () {
  const root = document.getElementById("p1");
  const $ = id => document.getElementById(id);
  const speakerEl = $("p1-speaker"), captionEl = $("p1-caption");
  const reqsEl = $("p1-reqs"), asksEl = $("p1-asks"), countEl = $("p1-count"), readyEl = $("p1-ready");
  const jump = $("jumpcut");
  const orb = $("orb"), ctx = orb.getContext("2d");

  const NAMES = { system: TIMELINE.config.product_name, nurse: "Vignesh" };
  const COLORS = { system: [91, 95, 214], nurse: [217, 147, 43], idle: [150, 163, 178] };

  // ---- the spec, as it forms (before the jump cut) ----
  const REQS = [
    { id: "R1", at: ["nurse_01", 0.42], rule: "Call <b>heart failure patients</b>", quote: "calls our heart failure patients" },
    { id: "R2", at: ["nurse_01", 0.62], rule: "Call <b>48 hours</b> after discharge", quote: "two days after discharge" },
    { id: "R3", at: ["nurse_01", 0.97], rule: "Check <b>symptoms, medications, follow-up visit</b>", quote: "Check symptoms, meds, and their follow-up visit" },
    { id: "", at: ["nurse_02", 0.9], until: ["nurse_03", 0.3], pending: true, rule: "Escalate on <b>breathing trouble or chest pain</b>", quote: "escalate right away" },
    { id: "R4", at: ["nurse_03", 0.3], rule: "Chest pain: <b>tell the patient to call 911</b>", quote: "Chest pain is always 911" },
    { id: "R5", at: ["nurse_03", 0.66], rule: "Breathing trouble: <b>transfer to the nurse line</b>", quote: "transfer to the nurse line" },
    { id: "R6", at: ["nurse_03", 0.97], rule: "After hours: <b>transfer to the on-call nurse</b>", quote: "After hours, the on-call nurse" },
    { id: "R7", at: ["nurse_04", 0.55], rule: "Family member answers: <b>discuss care only with listed caregivers</b>", quote: "Only if the patient listed them as a caregiver" },
    { id: "R8", at: ["nurse_04", 0.97], rule: "Otherwise: <b>ask for a good time to call back</b>", quote: "ask for a good time to call back" },
  ];
  // ---- after the jump cut: the whole spec, grouped (23 requirements, 6 escalation rules) ----
  const GROUPS = [
    { name: "Who and when", n: 3, hl: [0.12, 0.42] },
    { name: "What to check", n: 5 },
    { name: "Emergencies and escalation", n: 6, hl: [0.46, 0.84] },
    { name: "Family and caregivers", n: 2 },
    { name: "Identity check", n: 2 },
    { name: "Voicemail and retries", n: 3 },
    { name: "Tone and language", n: 2 },
  ];
  // ---- the interviewer's agenda ----
  const ASKS = [
    { q: "Who does the agent call?", done: ["nurse_01", 0.42] },
    { q: "When should it call?", done: ["nurse_01", 0.62] },
    { q: "What should it check on the call?", done: ["nurse_01", 0.97] },
    { q: "What counts as urgent?", now: "sys_01", done: ["nurse_02", 0.9] },
    { q: "How should it escalate, and after hours?", now: "sys_02", done: ["nurse_03", 0.97] },
    { q: "Who else might answer the phone?", now: "sys_03", done: ["nurse_04", 0.97] },
    { q: "What if it reaches voicemail?", after: true },
    { q: "How does it confirm it's the right person?", after: true },
    { q: "How many times should it try?", after: true },
    { q: "Which languages does it need?", after: true },
  ];

  // a shorter cut can drop lines: keep only items whose anchor lines exist
  const ok = x => [x.at, x.until, x.done].every(a => !a || U.has(a[0])) && (!x.now || U.has(x.now));
  for (const arr of [REQS, ASKS]) for (let i = arr.length - 1; i >= 0; i--) if (!ok(arr[i]) && !arr[i].after) arr.splice(i, 1);

  reqsEl.innerHTML = REQS.map(r =>
    `<li class="req${r.pending ? " pending" : ""}"><div class="rule">${r.id ? `<span class="rid">${r.id}</span>` : ""}${r.rule}${r.pending ? `<span class="flag">needs detail</span>` : ""}</div><div class="quote">“${r.quote}”</div></li>`).join("") +
    GROUPS.map(g => `<li class="req group"><span class="gname">${g.name}</span><span class="gcount">${g.n}</span></li>`).join("");
  asksEl.innerHTML = ASKS.map(a => `<li class="ask"><span class="box"></span><span>${a.q}</span></li>`).join("");
  const reqNodes = [...reqsEl.children].slice(0, REQS.length), groupNodes = [...reqsEl.children].slice(REQS.length);
  const askNodes = [...asksEl.children];

  const T = (a) => U.at(a[0], a[1]);
  let lastCaptionUid = null, words = [];

  U.stepCard(0, U.start("narr_03") - 2.4 + 0.1);
  SCENES.add({
    render(t) {
      const start = U.start("narr_03") - 2.4;
      const end = U.end("nurse_05") + 3.4;
      const vis = U.fade(root, t, start, end, 0.5);
      // overlays live outside this scene, so update them even when the scene is hidden
      const jumpA0 = U.end(U.has("nurse_04") ? "nurse_04" : "nurse_03") + 0.25, jumpB0 = U.start("sys_04") - 0.15;
      U.fade(jump, t, jumpA0, jumpB0, 0.35);
      U.fade(document.getElementById("intro"), t, start + 2.4, start + 5.6, 0.35);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 0;

      const jumpA = U.end(U.has("nurse_04") ? "nurse_04" : "nurse_03") + 0.25, jumpB = U.start("sys_04") - 0.15;
      const afterJump = t >= (jumpA + jumpB) / 2;

      U.text(jump, "12 minutes later");

      // clock: real time during the conversation, then the jump to 12 minutes
      const c0 = U.start("nurse_01");
      CHROME.clock = t < c0 ? 0 : !afterJump ? t - c0 : 12 * 60 + Math.max(0, t - jumpB);

      // ---------- voice side ----------
      const cur = U.active(t, l => l.voice === "system" || l.voice === "nurse");
      if (cur && cur.uid !== lastCaptionUid) {
        lastCaptionUid = cur.uid;
        words = cur.text.split(/\s+/);
        U.html(captionEl, words.map(w => `<span class="w">${w}</span>`).join(" "));
      }
      const capLine = lastCaptionUid && U.line(lastCaptionUid);
      if (t < c0 - 0.2) {
        U.html(speakerEl, `<span style="color:var(--ink-2)">Ready when you are</span>`);
        U.html(captionEl, `<span style="color:var(--ink-2)">Tell me about the agent you need.</span>`);
        lastCaptionUid = null;
      } else if (t > U.end("nurse_05") + 0.4) {
        U.html(speakerEl, `<span style="color:var(--sia)">${NAMES.system}</span>`);
        U.html(captionEl, `Building your agent…`);
        lastCaptionUid = null;
      } else if (capLine) {
        const col = capLine.voice === "system" ? "var(--sia)" : "var(--vig)";
        U.html(speakerEl, `<span class="dot" style="background:${col}"></span><span style="color:${col}">${NAMES[capLine.voice]}</span>`);
        const said = U.wordsSaid(capLine, t, words.length);
        [...captionEl.children].forEach((s, i) => U.cls(s, "said", i < said));
      }
      drawOrb(t, cur);

      // ---------- backend: spec ----------
      REQS.forEach((r, i) => {
        const a = T(r.at), b = r.until ? T(r.until) : (afterJump ? -1 : 1e9);
        const o = afterJump ? 0 : Math.min(U.prog(t, a, a + 0.35), r.until ? 1 - U.prog(t, b, b + 0.01) : 1);
        const node = reqNodes[i];
        U.css(node, { display: o > 0 ? "block" : "none", opacity: o.toFixed(3), transform: `translateY(${((1 - U.ease(U.prog(t, a, a + 0.35))) * 14).toFixed(1)}px)` });
        // keep the quote only on the most recent items so the list fits
        const newer = REQS.filter((x, j) => j > i && t >= T(x.at) && !(x.until && t >= T(x.until))).length;
        U.css(node.querySelector(".quote"), { display: newer < 3 ? "block" : "none" });
      });
      GROUPS.forEach((g, i) => {
        const node = groupNodes[i];
        const a = jumpB - 0.1 + i * 0.06;
        U.css(node, { display: afterJump ? "flex" : "none", opacity: U.prog(t, a, a + 0.3).toFixed(3) });
        const hl = g.hl && t >= U.at("sys_04", g.hl[0]) && t < U.at("sys_04", g.hl[1]);
        U.cls(node, "hl", hl);
      });
      const visibleReqs = REQS.filter(r => r.id && t >= T(r.at)).length;
      U.text(countEl, afterJump ? "23 requirements, 6 escalation rules" : visibleReqs ? `${visibleReqs} requirement${visibleReqs > 1 ? "s" : ""} so far` : "Listening");

      // ---------- backend: agenda ----------
      ASKS.forEach((a, i) => {
        const node = askNodes[i];
        U.css(node, { display: !a.after || afterJump ? "flex" : "none" });
        const done = a.after ? afterJump : t >= T(a.done);
        const now = !done && a.now && t >= U.start(a.now);
        U.cls(node, "done", done);
        U.cls(node, "now", now);
      });

      U.fade(readyEl, t, U.end("nurse_05") + 0.2, end + 1, 0.4);
      U.css(document.getElementById("p1-example"), { opacity: (t < U.start("nurse_01") + 4 ? 1 : 1 - U.prog(t, U.start("nurse_01") + 4, U.start("nurse_01") + 5)).toFixed(3) });
      U.html(readyEl, `<b>Spec ready.</b> 23 requirements, 6 escalation rules. Building the first version…`);
    },
  });

  // ---------- the orb ----------
  let lastVoice = "idle", lastVoiceEnd = -1;
  function drawOrb(t, cur) {
    if (cur) { lastVoice = cur.voice; lastVoiceEnd = cur.start + cur.dur; }
    const sinceEnd = cur ? 0 : t - lastVoiceEnd;
    const building = t > U.end("nurse_05") + 0.4;
    const voice = cur ? cur.voice : building ? "system" : sinceEnd < 0.6 ? lastVoice : "idle";
    const idle = t < U.start("nurse_01") - 0.2;
    // smoothed loudness
    let amp = 0;
    if (cur) { for (let k = -2; k <= 2; k++) amp += U.envAt(cur, t + k * 0.05); amp /= 5; }
    else if (building) amp = 0.25 + 0.2 * Math.sin(t * 6);
    const [r, g, b] = COLORS[idle ? "idle" : voice];
    const W = orb.width, C = W / 2;
    ctx.clearRect(0, 0, W, W);
    const breathe = Math.sin(t * 1.6) * 4;
    const base = (idle ? 110 : 128) + breathe;
    // rings
    for (let k = 3; k >= 1; k--) {
      const rad = base + 20 * k + amp * 30 * k + Math.sin(t * 2.3 + k) * 3;
      ctx.beginPath(); ctx.arc(C, C, rad, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.07 + amp * 0.06) / k})`;
      ctx.fill();
    }
    // core
    const coreR = base + amp * 26;
    const grad = ctx.createRadialGradient(C - coreR * 0.35, C - coreR * 0.4, coreR * 0.1, C, C, coreR);
    grad.addColorStop(0, `rgba(${Math.min(255, r + 70)},${Math.min(255, g + 70)},${Math.min(255, b + 70)},1)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},1)`);
    ctx.beginPath();
    // gently wobbling outline, driven by loudness
    const N = 96;
    for (let i = 0; i <= N; i++) {
      const th = (i / N) * Math.PI * 2;
      const wob = 1 + amp * 0.022 * Math.sin(th * 3 + t * 5) + amp * 0.012 * Math.sin(th * 5 - t * 7);
      const x = C + Math.cos(th) * coreR * wob, y = C + Math.sin(th) * coreR * wob;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.fillStyle = grad; ctx.globalAlpha = idle ? 0.55 : 1; ctx.fill(); ctx.globalAlpha = 1;
  }
})();
