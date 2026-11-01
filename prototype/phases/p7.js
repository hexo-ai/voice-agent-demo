/* Phase 6 — live test with a human.
 * The agent calls Vignesh, who role-plays a patient. The gap it reveals becomes
 * requirement R25 and 6 new tests, from Vignesh's spoken feedback. */
(function () {
  const root = document.getElementById("p7");
  const $ = id => document.getElementById(id);
  const BUB = [["agent_04", "agent", "Agent"], ["nurse_06", "me", "Vignesh, as the patient"], ["agent_05", "agent", "Agent"]];
  $("p7-bubbles").innerHTML = BUB.map(([u, c, who]) => `<div class="bub ${c}"><span class="who">${who}</span>${U.line(u).text}</div>`).join("");
  const bubs = [...$("p7-bubbles").children];

  const CHECKS = [
    ["Confirmed identity", "ok"],
    ["Asked about symptoms", "ok"],
    ["Asked about medications", "ok"],
    ["Patient stopped a medication", "gap"],
  ];
  $("p7-checks").innerHTML = CHECKS.map(([c]) => `<li class="chk"><span>${c}</span><span class="st"></span></li>`).join("");
  const chks = [...$("p7-checks").children];

  $("p7-req").innerHTML = `<div class="nr-k">New requirement R25, from Vignesh's live test</div>
    <div class="rule">Patient stopped a medication on their own: <b>ask why, flag for the care team the same day</b></div>
    <div class="quote">“If a patient stops a medication on their own, ask why.”</div>`;
  const OPEN = new Set([11, 29, 44]);

  SCENES.add({
    render(t) {
      const a = U.end("sys_08") + 2.1, b = U.end("sys_05") + 2.2;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 5;
      CHROME.clock = (2 * 3600 + 58 * 60 + 34) + (t - a) * 27;

      const callA = U.start("agent_04") - 0.9, callEnd = U.end("agent_05") + 0.6;
      const st = t < callA ? "Calling…" : t < callEnd ? "On call " + U.fmtClock(t - callA + 74).slice(2) : "Call ended";
      U.text($("p7-state"), st);
      U.css($("p7-phone"), { opacity: U.prog(t, a + 0.4, a + 0.8).toFixed(3) });
      BUB.forEach(([u], i) => U.css(bubs[i], { display: t >= U.start(u) - 0.1 ? "block" : "none" }));
      U.text($("p7-sub"), t < callA ? "Dialing" : t < callEnd ? "Listening to the call" : "Call ended");

      // checks tick through the call; the gap shows after the patient's answer
      const tA = [callA - 0.5, callA, U.start("agent_04") + 0.5, U.end("nurse_06") + 0.2];
      chks.forEach((c, i) => {
        U.css(c, { opacity: U.prog(t, tA[i], tA[i] + 0.3).toFixed(3) });
        const fixed = i === 3 && t >= U.at("nurse_07", 0.6);
        U.cls(c, "ok", CHECKS[i][1] === "ok" || fixed);
        U.cls(c, "gap", CHECKS[i][1] === "gap" && !fixed);
        U.text(c.querySelector(".st"), CHECKS[i][1] === "ok" ? "Done" : fixed ? "Rule added" : "No rule for this");
      });

      const rq = U.at("nurse_07", 0.6);
      U.css($("p7-req"), { opacity: U.prog(t, rq, rq + 0.4).toFixed(3) });
      U.css($("p7-tests"), { opacity: U.prog(t, rq + 0.6, rq + 1.0).toFixed(3) });
      const added = t >= U.at("sys_05", 0.25);
      const runA = U.at("sys_05", 0.45), runB = U.end("sys_05");
      const ran = Math.floor(U.prog(t, runA, runB) * 6);
      const cells = [];
      for (let i = 0; i < (added ? 64 : 58); i++) {
        const isNew = i >= 58;
        cells.push({ state: isNew ? (i - 58 < ran ? "pass" : "idle") : OPEN.has(i) ? "fail" : "pass", isNew });
      }
      U.suite($("p7-mini"), cells);
      U.text($("p7-tc"), !added ? "55 of 58 passed" : ran < 6 ? "6 new tests running" : "All 6 new tests pass. 61 of 64 overall");

      U.voiceBar($("p7-vbar"), t, ["nurse_07", "sys_05"]);
    },
  });
})();
