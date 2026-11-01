/* Phase 4 — simulations.
 * Right: 50 simulated calls run in parallel; call 23 fails and opens up; SIA Voice's
 * diagnosis (verdict -> why -> fix) appears while it explains the failure by voice.
 * Left: plain-language results and what went wrong. */
(function () {
  const root = document.getElementById("p4");
  const $ = id => document.getElementById(id);
  const N = 50, FOCUS = 22; // call 23
  const tilesEl = $("p4-tiles");

  tilesEl.innerHTML = Array.from({ length: N }, (_, j) =>
    `<div class="tile"><span class="tid">${String(j + 1).padStart(2, "0")}</span><div class="wv">${"<i></i>".repeat(5)}</div></div>`).join("");
  const tiles = [...tilesEl.children];

  // 19 failing calls, always including call 23
  const order = Array.from({ length: N }, (_, j) => j).filter(j => j !== FOCUS).sort((x, y) => U.hash(x + 100) - U.hash(y + 100));
  const FAIL = new Set([FOCUS, ...order.slice(0, 18)]);

  const WRONG = [
    ["Missed a breathing symptom mentioned in passing", 4],
    ["Didn't leave a callback number on voicemail", 5],
    ["Spoke too fast for a hard-of-hearing caller", 3],
    ["Asked for date of birth twice", 2],
    ["Other small issues", 5],
  ];
  $("p4-wlist").innerHTML = WRONG.map(([w, n]) => `<li><span>${w}</span><span class="n">${n} calls</span></li>`).join("");
  const wrongItems = [...$("p4-wlist").children];

  const TURNS = [["agent_01", "Agent"], ["patient_01", "Robert"], ["agent_02", "Agent"]];
  $("p4-turns").innerHTML = TURNS.map(([u, who]) => `<div class="turn"><span class="sp">${who}</span><span class="tx">${U.line(u).text}</span></div>`).join("");
  const turnEls = [...$("p4-turns").children];

  const DIAG = [
    ["verdict", 0.12, "Judge", `Broke rule <b>R5</b>: breathing trouble must go to the nurse line.`],
    ["why", 0.45, "Why it happened", `Robert said it indirectly: “short of breath when I lie down.” The agent only reacts to direct phrases like “trouble breathing.”`],
    ["fix", 0.8, "Fix planned", `Recognize symptoms described indirectly. Ask one follow-up before moving on.`],
  ];
  $("p4-diag").innerHTML = DIAG.map(([c, , k, txt]) => `<div class="dstep ${c}"><span class="dk">${k}</span>${txt}</div>`).join("");
  const diagEls = [...$("p4-diag").children];

  SCENES.add({
    render(t) {
      const a = U.start("narr_06") - 0.9, b = U.end("narr_07") + 2.5;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 2;
      const run0 = a + 0.6, runEnd = U.start("agent_01") - 1.6;
      CHROME.clock = 16 * 60 + U.prog(t, a, runEnd) * 15 * 60 + Math.max(0, t - runEnd) * 2;

      // tiles run and finish at staggered times
      let pass = 0, fail = 0;
      tiles.forEach((tile, j) => {
        const fin = run0 + (0.25 + 0.75 * U.hash(j)) * (runEnd - run0);
        const done = t >= fin, bad = FAIL.has(j);
        if (done) bad ? fail++ : pass++;
        U.cls(tile, "pass", done && !bad);
        U.cls(tile, "fail", done && bad);
        U.cls(tile, "focus", j === FOCUS && t >= runEnd + 0.3);
        [...tile.querySelectorAll("i")].forEach((bar, k) => {
          const h = t < run0 ? 4 : done ? 4 + 6 * U.hash(j * 7 + k) : 4 + 18 * Math.abs(Math.sin(t * 7 + j * 1.3 + k * 2.1));
          U.css(bar, { height: h.toFixed(1) + "px" });
        });
      });

      // left: progress and tally
      const finished = pass + fail;
      U.css($("p4-fill"), { width: (finished / N * 100).toFixed(1) + "%" });
      U.text($("p4-pass"), String(pass));
      U.text($("p4-fail"), String(fail));
      U.text($("p4-title"), finished < N ? `Running 50 simulated calls` : `31 of 50 passed`);
      U.css($("p4-wrong"), { opacity: U.prog(t, runEnd + 0.2, runEnd + 0.6).toFixed(3) });
      wrongItems.forEach((li, i) => U.cls(li, "hl", i === 0 && t >= runEnd + 0.3));
      U.text($("p4-sub"), finished < N ? `50 calls in parallel, ${finished} finished` : `50 calls finished`);

      // right: call 23 opens up, transcript follows the audio
      U.css($("p4-detail"), { opacity: U.prog(t, runEnd + 0.4, runEnd + 0.9).toFixed(3) });
      TURNS.forEach(([u], i) => {
        const l = U.line(u), el = turnEls[i];
        U.cls(el, "now", t >= l.start && t < l.start + l.dur);
        U.cls(el, "done", t >= l.start + l.dur);
        U.css(el, { opacity: t >= l.start - 0.2 ? 1 : 0 });
      });
      U.cls(turnEls[2], "bad", t >= U.end("agent_02") + 0.2);
      DIAG.forEach(([, f], i) => {
        const ta = U.at("sys_06", f);
        U.css(diagEls[i], { opacity: U.prog(t, ta, ta + 0.35).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, ta, ta + 0.4))) * 12}px)` });
      });

      U.voiceBar($("p4-vbar"), t, ["sys_06"]);
    },
  });
})();
