/* Close — the loop (three feedback sources lit as the narrator names them), then the end card. */
(function () {
  const root = document.getElementById("close");
  const svg = document.getElementById("loop"), nEl = document.getElementById("loop-n"), card = document.getElementById("endcard");
  const C = 450, RAD = 330;
  const NODES = [
    { label: "Run simulation", ang: -90 },
    { label: "SIA Voice finds mistakes", ang: -18, src: 0.18 },
    { label: "Expert review", ang: 54, src: 0.34 },
    { label: "Improve and fine-tune", ang: 126 },
    { label: "Live testing", ang: 198, src: 0.5 },
  ];
  NODES.forEach(n => { n.label = n.label.replace("SIA Voice", TIMELINE.config.product_name); });
  const pos = ang => [C + RAD * Math.cos(ang * Math.PI / 180), C + RAD * Math.sin(ang * Math.PI / 180)];
  svg.innerHTML = `<circle cx="${C}" cy="${C}" r="${RAD}" fill="none" stroke="#2A3B50" stroke-width="3"/>
    <circle id="loop-arc" cx="${C}" cy="${C}" r="${RAD}" fill="none" stroke="#7B7FE8" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="12 88" transform="rotate(-90 ${C} ${C})"/>` +
    NODES.map((n, i) => { const [x, y] = pos(n.ang); return `<g id="ln${i}"><rect x="${x - 175}" y="${y - 34}" width="350" height="68" rx="34" fill="#1E2B3B" stroke="#2A3B50" stroke-width="2"/>
      <text x="${x}" y="${y + 8}" text-anchor="middle" font-size="23" fill="#D6DEE8">${n.label}</text></g>`; }).join("");

  const DOMAINS = [
    ["Nurses", "Post-discharge follow-up calls", "This demo"],
    ["Claims adjusters", "First notice of loss calls", ""],
    ["Recruiters", "Candidate screening calls", ""],
    ["Field-service dispatchers", "Appointment scheduling calls", ""],
    ["Loan officers", "Document follow-up calls", ""],
  ];
  const grid = document.getElementById("dm-grid");
  grid.innerHTML = DOMAINS.map(([r, c, tag]) => `<div class="dm${tag ? " this" : ""}"><span class="dm-r">${r}</span><span class="dm-c">${c}</span><span class="dm-t">${tag}</span></div>`).join("");
  const dms = [...grid.children];

  SCENES.add({
    render(t) {
      const a = U.end("sys_05") + 1.7;
      const vis = U.fade(root, t, a, 1e9, 0.6);
      if (vis <= 0) return;
      if (vis < 0.5) CHROME.showTopbar = true;
      // the highlight travels the loop, speeding up
      const tt = Math.max(0, t - a);
      const turns = 0.25 * tt + 0.012 * tt * tt;
      document.getElementById("loop-arc").setAttribute("stroke-dashoffset", (-(turns * 100) % 100).toFixed(2));
      NODES.forEach((n, i) => {
        const g = document.getElementById("ln" + i);
        const lit = n.src != null && t >= U.at("narr_10", n.src);
        const r = g.querySelector("rect");
        r.setAttribute("stroke", lit ? "#7B7FE8" : "#2A3B50");
        r.setAttribute("fill", lit ? "#232E52" : "#1E2B3B");
        g.querySelector("text").setAttribute("fill", lit ? "#FFFFFF" : "#D6DEE8");
      });
      const n = Math.round(64 + (140 - 64) * U.ease(U.prog(t, U.at("narr_10", 0.6), U.end("narr_10"))));
      U.text(nEl, String(n));
      const dA = U.start("narr_14") - 0.5;
      U.fade(document.getElementById("domains"), t, dA, 1e9, 0.5);
      dms.forEach((d, i) => U.css(d, { opacity: U.prog(t, dA + 0.3 + i * 0.25, dA + 0.6 + i * 0.25).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, dA + 0.3 + i * 0.25, dA + 0.7 + i * 0.25))) * 14}px)` }));
      U.fade(card, t, U.start("narr_11") - 0.3, 1e9, 0.6);
    },
  });
})();
