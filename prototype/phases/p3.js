/* Phase 3 — test scenarios.
 * Left: the scenarios in plain language, sorted into general categories.
 * Right: coverage map (requirement groups x 50 scenarios) and the simulated callers. */
(function () {
  const root = document.getElementById("p3");
  const $ = id => document.getElementById(id);
  const list = $("p3-list"), count = $("p3-count"), cov = $("p3-cov"), legend = $("p3-legend"), personasEl = $("p3-personas"), sub = $("p3-sub");

  const CATS = { everyday: "Everyday", edge: "Edge case", emergency: "Emergency", difficult: "Difficult caller" };
  const SCEN = [
    ["Patient feels well and is taking their meds", "everyday"],
    ["Patient hasn't picked up a new prescription", "everyday"],
    ["Patient's daughter answers the phone", "edge"],
    ["Patient mentions chest pain halfway through", "emergency"],
    ["Patient says they get short of breath at night", "emergency"],
    ["Patient is hard of hearing", "difficult"],
    ["Call reaches voicemail", "edge"],
    ["Patient is confused about which pills to take", "difficult"],
    ["Patient wants to move the follow-up visit", "everyday"],
    ["Wrong number", "edge"],
  ];
  const GROUPS = ["Who and when", "What to check", "Emergencies and escalation", "Family and caregivers", "Identity check", "Voicemail and retries", "Tone and language"];
  const PERSONAS = ["Hard of hearing", "Confused", "In a hurry", "Caregiver answers", "Speaks Spanish", "Upset", "Very quiet", "Background noise", "Talks a lot", "Hangs up early", "Off-topic questions", "Wrong number"];
  const N = 50;

  // deterministic coverage: each scenario touches 2–4 groups; emergency row highlighted
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const COVER = Array.from({ length: N }, (_, j) => {
    const set = new Set([j % GROUPS.length]);
    const want = 2 + Math.floor(rnd() * 2);
    while (set.size < want) set.add(Math.floor(rnd() * GROUPS.length));
    return set;
  });

  list.innerHTML = SCEN.map(([s, c]) => `<li class="sc"><span class="txt">${s}</span><span class="cat ${c}">${CATS[c]}</span></li>`).join("");
  const scNodes = [...list.children];
  cov.innerHTML = GROUPS.map((g, r) =>
    `<div class="rl">${g}<span class="ok"></span></div><div class="cells">${Array.from({ length: N }, (_, j) =>
      `<span class="cell${r === 2 ? " emergency" : ""}" data-j="${j}"></span>`).join("")}</div>`).join("");
  const rows = GROUPS.map((_, r) => [...cov.querySelectorAll(".cells")[r].children]);
  const okDots = [...cov.querySelectorAll(".rl .ok")];
  personasEl.innerHTML = PERSONAS.map(p => `<span class="persona">${p}</span>`).join("");
  const personaNodes = [...personasEl.children];

  U.stepCard(2, U.start("narr_05") - 2.3 + 0.1);
  SCENES.add({
    render(t) {
      const a = U.start("narr_05") - 2.3, b = U.start("narr_06") - 0.6;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 2;
      CHROME.clock = 13 * 60 + 10 + (t - a) * 12;

      const genA = a + 2.2, genB = Math.min(a + 10, b - 1.2);               // all 50 written in ~9 s
      const made = Math.floor(U.prog(t, genA, genB) * N);
      U.text(count, `${made} test scenario${made === 1 ? "" : "s"}`);
      scNodes.forEach((n, i) => {
        const ta = genA + i * Math.min(0.55, (genB - genA) / 11);
        U.css(n, { opacity: U.prog(t, ta, ta + 0.3).toFixed(3), transform: `translateX(${(1 - U.ease(U.prog(t, ta, ta + 0.35))) * -16}px)` });
      });

      rows.forEach((cells, r) => {
        let hits = 0;
        cells.forEach((c, j) => { const on = j < made && COVER[j].has(r); if (on) hits++; U.cls(c, "on", on); });
        U.cls(okDots[r], "on", hits >= 3);
      });
      U.text(sub, `${made} of ${N} scenarios written`);
      const done = t >= genB + 0.3;
      U.html(legend, done ? `<b>All 23 requirements covered.</b> Each one is tested by at least 3 scenarios.` : "");
      U.css(legend, { opacity: U.prog(t, genB + 0.3, genB + 0.7).toFixed(3) });

      personaNodes.forEach((n, i) => { const ta = genA + 2 + i * 0.25; U.css(n, { opacity: U.prog(t, ta, ta + 0.3).toFixed(3) }); });
    },
  });
})();
