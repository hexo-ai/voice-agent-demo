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

  // end card: the product at the centre of its six-step loop (echoes the thumbnail)
  const EC = [600, 300], ER = 255;
  const ESTEPS = ["Collect requirements", "Build agent", "Run simulation", "Improve and fine-tune", "Expert review", "Live testing"];
  const epos = i => { const a = (-90 + i * 60) * Math.PI / 180; return [EC[0] + ER * 1.45 * Math.cos(a), EC[1] + ER * Math.sin(a)]; };
  document.getElementById("ec-loop").innerHTML =
    `<ellipse cx="${EC[0]}" cy="${EC[1]}" rx="${ER * 1.45}" ry="${ER}" fill="none" stroke="#3A4C63" stroke-width="3"/>
     <ellipse id="ec-arc" cx="${EC[0]}" cy="${EC[1]}" rx="${ER * 1.45}" ry="${ER}" fill="none" stroke="#7B7FE8" stroke-width="5" stroke-linecap="round" pathLength="100" stroke-dasharray="22 78"/>` +
    ESTEPS.map((s, i) => { const [x, y] = epos(i), w = s.length * 11 + 44;
      return `<g id="es${i}" opacity="0"><rect x="${x - w / 2}" y="${y - 23}" width="${w}" height="46" rx="23" fill="#1E2B3B" stroke="#3A4680" stroke-width="1.5"/><text x="${x}" y="${y + 7}" text-anchor="middle" font-size="19" fill="#D6DEE8">${s}</text></g>`; }).join("");

  const recap = U.has("narr_10"); // the short cut keeps the loop on screen without the spoken recap
  SCENES.add({
    render(t) {
      const a = U.end(U.has("nurse_09") ? "nurse_09" : "sys_05") + 1.9;
      const vis = U.fade(root, t, a, 1e9, 0.6);
      if (vis <= 0) return;
      if (vis < 0.5) CHROME.showTopbar = true;
      U.css(document.querySelector("#close .loop-wrap"), { display: recap ? "block" : "none" });
      // the highlight travels the loop, speeding up
      const tt = Math.max(0, t - a);
      const turns = 0.25 * tt + 0.012 * tt * tt;
      document.getElementById("loop-arc").setAttribute("stroke-dashoffset", (-(turns * 100) % 100).toFixed(2));
      NODES.forEach((n, i) => {
        const g = document.getElementById("ln" + i);
        const lit = n.src != null && t >= (recap ? U.at("narr_10", n.src) : a + 0.4 + n.src * 2.2);
        const r = g.querySelector("rect");
        r.setAttribute("stroke", lit ? "#7B7FE8" : "#2A3B50");
        r.setAttribute("fill", lit ? "#232E52" : "#1E2B3B");
        g.querySelector("text").setAttribute("fill", lit ? "#FFFFFF" : "#D6DEE8");
      });
      const n = Math.round(58 + (140 - 58) * U.ease(recap ? U.prog(t, U.at("narr_10", 0.6), U.end("narr_10")) : U.prog(t, a + 1.2, a + 2.6)));
      U.text(nEl, String(n));
      const dA = recap ? U.start("narr_14") - 0.5 : a; // short cut: straight to the domains, no silent loop
      U.fade(document.getElementById("domains"), t, dA, 1e9, 0.5);
      dms.forEach((d, i) => U.css(d, { opacity: U.prog(t, dA + 0.3 + i * 0.25, dA + 0.6 + i * 0.25).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, dA + 0.3 + i * 0.25, dA + 0.7 + i * 0.25))) * 14}px)` }));
      const cA = U.start("narr_11") - 0.3;
      U.fade(card, t, cA, 1e9, 0.6);
      ESTEPS.forEach((_, i) => document.getElementById("es" + i).setAttribute("opacity", U.prog(t, cA + 0.3 + i * 0.15, cA + 0.6 + i * 0.15).toFixed(3)));
      // an ellipse path starts at 3 o'clock; +25 moves the start to 12 o'clock, then travel clockwise
      document.getElementById("ec-arc").setAttribute("stroke-dashoffset", (25 - (Math.max(0, t - cA) * 108) % 100).toFixed(2));
    },
  });
})();
