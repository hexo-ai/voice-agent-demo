/* Phase 6 — live testing. A real person (Vignesh, role-playing a patient) takes a call and the
 * agent gets it right: it applies R24, the rule Vignesh taught it in the expert review.
 * No new mistake here on purpose: by now the agent should look production-ready. */
(function () {
  const root = document.getElementById("p7");
  const $ = id => document.getElementById(id);
  const BUB = [["agent_04", "agent", "Agent"], ["nurse_06", "me", "Vignesh, as the patient"], ["agent_05", "agent", "Agent"],
               ["nurse_07", "me", "Vignesh, as the patient"], ["agent_08", "agent", "Agent"], ["nurse_09", "me", "Vignesh, as the patient"]]
    .filter(([u]) => U.has(u));
  $("p7-bubbles").innerHTML = BUB.map(([u, c, who]) => `<div class="bub ${c}"><span class="who">${who}</span>${U.line(u).text}</div>`).join("");
  const bubs = [...$("p7-bubbles").children];
  const LAST = BUB[BUB.length - 1][0];

  // [label, when it ticks, optional tag]
  const R24 = "Rule R24 applied, from your expert review";
  const CHECKS = [
    ["Confirmed identity", () => U.start("agent_04") - 1.2],
    ["Asked about symptoms", () => U.start("agent_04") - 0.6],
    ["Asked about weight", () => U.start("agent_04") + 0.6],
    ...(U.has("agent_05")
      ? [["Weight up 3 lb overnight: asked about swelling", () => U.start("agent_05") + 0.8, R24],
         ["Flagged for the care team today", () => U.at("agent_08", 0.6)]]
      : [["Weight up 3 lb overnight: flagged for the care team today", () => U.at("agent_08", 0.55), R24]]),
  ];
  $("p7-checks").innerHTML = CHECKS.map(([c, , tag]) => `<li class="chk${tag ? " learned" : ""}"><span>${c}</span>${tag ? `<span class="tag">${tag}</span>` : ""}<span class="st"></span></li>`).join("");
  const chks = [...$("p7-checks").children];

  SCENES.add({
    render(t) {
      const a = U.end("sys_08") + 2.1, b = U.end(LAST) + 2.4;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 5;
      CHROME.clock = 10714 + U.prog(t, a, b) * (11760 - 10714); // ends exactly at 3:16:00, matching the end card

      const callA = U.start("agent_04") - 0.9, callEnd = U.end(LAST) + 0.4;
      U.text($("p7-state"), t < callA ? "Calling…" : t < callEnd ? "On call " + U.fmtClock(t - callA + 74).slice(2) : "Call ended");
      U.css($("p7-phone"), { opacity: U.prog(t, a + 1.7, a + 2.1).toFixed(3) });
      // keep the four most recent bubbles so the card never overflows
      const shown = BUB.map(([u], i) => t >= U.start(u) - 0.1 ? i : -1).filter(i => i >= 0);
      const keep = new Set(shown.slice(-4));
      bubs.forEach((el, i) => U.css(el, { display: keep.has(i) ? "block" : "none" }));
      U.text($("p7-sub"), t < callA ? "Dialing" : t < callEnd ? "Listening to the call" : "Call ended");

      CHECKS.forEach(([, when], i) => {
        const ta = when();
        U.css(chks[i], { opacity: U.prog(t, ta, ta + 0.3).toFixed(3) });
        U.cls(chks[i], "ok", t >= ta);
        U.text(chks[i].querySelector(".st"), "Done");
      });
      U.css($("p7-result"), { opacity: U.prog(t, callEnd + 0.2, callEnd + 0.6).toFixed(3) });
    },
  });
})();
