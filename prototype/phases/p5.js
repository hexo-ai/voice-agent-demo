/* Phase 5 — optimization loop.
 * Right: harness diff, pass-rate and cost-per-call charts (one series each, no dual axis),
 * fine-tuning a smaller model. Left: plain-language changes, then call 23 re-run and passing. */
(function () {
  const root = document.getElementById("p5");
  const $ = id => document.getElementById(id);

  const CHANGES = [
    "Asks a follow-up whenever a patient mentions breathing, even in passing",
    "Leaves a callback number on voicemail, with no health details",
    "Speaks slower and repeats key points for hard-of-hearing callers",
    "Asks for date of birth only once",
  ];
  $("p5-changes").innerHTML = CHANGES.map(c => `<li>${c}</li>`).join("");
  const changeEls = [...$("p5-changes").children];

  const DIFF = [
    [" ", "# Escalation", 0],
    ["-", `Breathing trouble: transfer_call("nurse_line")`, 0],
    ["+", "Any breathing symptom, even mentioned in passing", 0],
    ["+", `(e.g. "short of breath when I lie down"):`, 0],
    ["+", `  ask one follow-up, then transfer_call("nurse_line")`, 0],
    [" ", "# Voicemail", 1],
    ["+", "Leave the callback number. Never leave health details.", 1],
  ];
  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const PASS = [62, 72, 84, 90, 94];
  const COST = [0.41, 0.40, 0.39, 0.21, 0.19];

  const TURNS = [["patient_01_replay", "Robert"], ["agent_03", "Agent"]];
  $("p5-turns").innerHTML = TURNS.map(([u, who]) => `<div class="turn"><span class="sp">${who}</span><span class="tx">${U.line(u).text}</span></div>`).join("");
  const turnEls = [...$("p5-turns").children];

  // ---- small single-series line chart ----
  function chart(svg, vals, upto, yMin, yMax, ticks, fmt) {
    const W = 460, H = 190, L = 50, R = 412, T = 14, B = 156;
    const x = i => L + (i / (vals.length - 1)) * (R - L);
    const y = v => B - ((v - yMin) / (yMax - yMin)) * (B - T);
    let g = "";
    ticks.forEach(v => { g += `<line x1="${L}" x2="${R}" y1="${y(v)}" y2="${y(v)}" stroke="#2A3B50" stroke-width="1"/><text x="${L - 8}" y="${y(v) + 5}" text-anchor="end">${fmt(v)}</text>`; });
    ["Start", "1", "2", "3", "4"].forEach((s, i) => { g += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle">${i ? "Round " + s : s}</text>`; });
    // line up to a fractional index
    const k = Math.floor(upto), f = upto - k;
    const pts = [];
    for (let i = 0; i <= Math.min(k, vals.length - 1); i++) pts.push([x(i), y(vals[i])]);
    if (k < vals.length - 1 && f > 0) pts.push([x(k) + (x(k + 1) - x(k)) * f, y(vals[k] + (vals[k + 1] - vals[k]) * f)]);
    if (pts.length > 1) g += `<polyline points="${pts.map(p => p.join(",")).join(" ")}" fill="none" stroke="#7B7FE8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`;
    for (let i = 0; i <= Math.min(k, vals.length - 1); i++) g += `<circle cx="${x(i)}" cy="${y(vals[i])}" r="5" fill="#7B7FE8" stroke="#1E2B3B" stroke-width="2"/>`;
    if (svg.__g !== g) { svg.innerHTML = g; svg.__g = g; }
    const cur = k >= vals.length - 1 ? vals[vals.length - 1] : vals[k] + (vals[k + 1] - vals[k]) * f;
    return cur;
  }

  SCENES.add({
    render(t) {
      const a = U.end("narr_07") + 2.0, b = U.end("sys_07") + 2.5;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 3;

      const r0 = a + 0.6, R = [a + 3.2, a + 6.2, a + 9.6, a + 12.6];
      const doneRounds = R.filter(x => t >= x).length;
      CHROME.clock = 31 * 60 + U.prog(t, a, R[3]) * 130 * 60 + Math.max(0, t - R[3]) * 3;

      // progress through rounds as a fractional index into the series
      let upto = 0;
      if (t >= r0) {
        const starts = [r0, ...R];
        for (let i = 0; i < 4; i++) if (t >= starts[i]) upto = i + U.prog(t, starts[i], starts[i + 1]);
      }
      U.text($("p5-title"), doneRounds < 4 ? `Round ${Math.min(4, doneRounds + 1)} of 4` : "Fixed 16 of 19 issues");
      U.text($("p5-sub"), doneRounds < 4 ? `Round ${Math.min(4, doneRounds + 1)} of 4: simulate, find failures, fix, repeat` : "4 rounds done");

      changeEls.forEach((li, i) => U.css(li, { opacity: U.prog(t, R[i] - 0.2, R[i] + 0.2).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, R[i] - 0.2, R[i] + 0.25))) * 10}px)` }));

      // diff: round-0 lines type in during round 1, round-1 lines during round 2
      const html = DIFF.map(([op, txt, rd], i) => {
        const ta = rd === 0 ? r0 + 0.3 + i * 0.4 : R[0] + 0.5 + (i - 5) * 0.5;
        if (t < ta) return "";
        const cls = op === "-" ? "del" : op === "+" ? "add" : "c";
        return `<span class="${cls}">${op} ${esc(txt)}</span>`;
      }).filter(Boolean).join("\n");
      U.html($("p5-diff"), html);

      const pr = chart($("p5-c1"), PASS, upto, 50, 100, [50, 75, 100], v => v + "%");
      const cs = chart($("p5-c2"), COST, upto, 0, 0.5, [0, 0.25, 0.5], v => "$" + v.toFixed(2));
      U.text($("p5-pr"), Math.round(pr) + "%");
      U.text($("p5-cost"), "$" + cs.toFixed(2));

      // fine-tuning happens during round 3
      U.css($("p5-ft"), { opacity: U.prog(t, R[1] - 0.2, R[1] + 0.2).toFixed(3) });
      const fp = U.prog(t, R[1], R[2] - 0.2);
      U.css($("p5-ftfill"), { width: (fp * 100).toFixed(1) + "%" });
      U.text($("p5-fts"), fp < 1 ? `Training on 1,240 corrected call turns` : "Done");
      U.html($("p5-ftnote"), t >= R[2] - 0.1 ? `<b>Same pass rate, 54% cheaper per call.</b> The smaller model now runs the agent.` : "");

      // call 23 runs again and passes
      const rpA = U.start("patient_01_replay") - 0.6;
      U.css($("p5-replay"), { opacity: U.prog(t, rpA, rpA + 0.4).toFixed(3) });
      TURNS.forEach(([u], i) => {
        const l = U.line(u), el = turnEls[i];
        U.cls(el, "now", t >= l.start && t < l.start + l.dur);
        U.cls(el, "done", t >= l.start + l.dur);
        U.css(el, { opacity: t >= l.start - 0.2 ? 1 : 0.25 });
      });
      const passed = t >= U.end("agent_03") + 0.1;
      U.cls(turnEls[1], "good", passed);
      const badge = $("p5-badge");
      U.text(badge, passed ? "Passed" : "Running");
      U.cls(badge, "pass", passed); U.cls(badge, "run", !passed);

      U.voiceBar($("p5-vbar"), t, ["sys_07"]);
    },
  });
})();
