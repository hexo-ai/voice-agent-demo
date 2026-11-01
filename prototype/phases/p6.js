/* Phase 5b — expert review.
 * SIA Voice queues the calls it is least sure about. Vignesh hears one that passed but
 * shouldn't have; his spoken feedback becomes requirement R24 and 8 new tests. */
(function () {
  const root = document.getElementById("p6");
  const $ = id => document.getElementById(id);
  const Q = [
    ["Call 08", "Patient asks about a new diet", "Passed, unsure"],
    ["Call 14", "Patient's son answers", "Passed, unsure"],
    ["Call 31", "Patient mentions their weight", "Passed, unsure"],
    ["Call 40", "Patient speaks very quietly", "Passed, unsure"],
    ["Call 46", "Lots of background noise", "Failed, unsure"],
  ];
  const PLAY = 2;
  $("p6-queue").innerHTML = Q.map(([c, d, s]) =>
    `<li class="q"><span class="play"></span><span class="qt">${d}<span class="qs">${c}</span></span><span class="chip">${s}</span><span class="prog"><i></i></span></li>`).join("");
  const rows = [...$("p6-queue").children];

  const TURNS = [["agent_06", "Agent"], ["patient_02", "Patient"], ["agent_07", "Agent"]];
  $("p6-turns").innerHTML = TURNS.map(([u, who]) => `<div class="turn"><span class="sp">${who}</span><span class="tx">${U.line(u).text}</span></div>`).join("");
  const turnEls = [...$("p6-turns").children];

  $("p6-req").innerHTML = `<div class="nr-k">New requirement R24, from Vignesh's review</div>
    <div class="rule">Weight up 3 lb or more overnight: <b>ask about swelling, flag for the care team today</b></div>
    <div class="quote">“Three pounds overnight can mean fluid building up.”</div>`;

  // suite before review: 47 pass, 3 fail (same 3 still open from the optimization loop)
  const OPEN = new Set([11, 29, 44]);

  SCENES.add({
    render(t) {
      const a = U.end("sys_07") + 2.0, b = U.end("sys_08") + 2.6;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 4;
      CHROME.clock = (2 * 60 + 41) * 60 + 54 + (t - a) * 25;

      rows.forEach((r, i) => U.css(r, { opacity: U.prog(t, a + 0.5 + i * 0.25, a + 0.8 + i * 0.25).toFixed(3) }));
      const p0 = U.start("agent_06") - 0.6, p1 = U.end("agent_07");
      const row = rows[PLAY];
      U.cls(row, "playing", t >= p0 && t < p1 + 0.3);
      U.cls(row, "heard", t >= p1 + 0.3);
      U.css(row.querySelector(".prog i"), { width: (U.prog(t, p0, p1) * 100).toFixed(1) + "%" });

      U.css($("p6-conf"), { opacity: U.prog(t, a + 1.2, a + 1.6).toFixed(3) });
      U.text($("p6-sub"), "Call 31, picked for review");
      TURNS.forEach(([u], i) => {
        const l = U.line(u), el = turnEls[i];
        U.cls(el, "now", t >= l.start && t < l.start + l.dur);
        U.cls(el, "done", t >= l.start + l.dur);
        U.css(el, { opacity: t >= l.start - 0.2 ? 1 : 0 });
      });
      U.cls(turnEls[2], "bad", t >= U.at("nurse_08", 0.25));

      const rq = U.at("nurse_08", 0.6);
      U.css($("p6-req"), { opacity: U.prog(t, rq, rq + 0.4).toFixed(3) });

      // test suite: 8 new tests join, then everything re-runs
      const s0 = U.start("sys_08");
      U.css($("p6-tests"), { opacity: U.prog(t, rq + 0.6, rq + 1.0).toFixed(3) });
      const added = t >= U.at("sys_08", 0.3);
      const sweepA = U.at("sys_08", 0.55), sweepB = U.end("sys_08") + 1.2;
      const ran = Math.floor(U.prog(t, sweepA, sweepB) * 58);
      const cells = [];
      for (let i = 0; i < (added ? 58 : 50); i++) {
        const isNew = i >= 50;
        let state = isNew ? "idle" : OPEN.has(i) ? "fail" : "pass";
        if (t >= sweepA) state = i < ran ? (OPEN.has(i) ? "fail" : "pass") : "idle";
        cells.push({ state, isNew });
      }
      U.suite($("p6-mini"), cells);
      U.text($("p6-tc"), !added ? "47 of 50 passed" : ran < 58 ? `58 tests, re-running` : "55 of 58 passed");

      U.voiceBar($("p6-vbar"), t, ["nurse_08", "sys_08"]);
    },
  });
})();
