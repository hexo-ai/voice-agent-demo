/* Phase 2 — first version generated.
 * Left: a calm "ready to test" card in plain language.
 * Right: the agent blueprint assembling: instructions, tools, conversation flow.
 * The blueprint parts are domain-general; only their contents are healthcare-specific. */
(function () {
  const root = document.getElementById("p2");
  const $ = id => document.getElementById(id);
  const card = $("p2-card"), code = $("p2-code"), toolsEl = $("p2-tools"), flow = $("p2-flow"), sub = $("p2-sub");

  const CODE = `# Role
You are the follow-up line for Riverside General.
Call patients 48 hours after discharge.

# Every call
1. Confirm you are speaking with the patient.
2. Ask about symptoms, then medications.
3. Confirm the follow-up visit is booked.

# Escalation (R4 to R6)
- Chest pain: tell them to call 911.
- Breathing trouble: transfer_call("nurse_line")
- After hours: transfer_call("on_call")

# Never
- Give medical advice.
- Discuss care with anyone not listed.`;

  const TOOLS = [
    ["lookup_patient", "Discharge date, meds, contacts"],
    ["transfer_call", "Nurse line, on-call nurse"],
    ["book_follow_up", "Clinic calendar"],
    ["flag_for_care_team", "Same-day task for nurses"],
  ];
  toolsEl.innerHTML = TOOLS.map(([n, d]) => `<li class="tool"><span class="tn">${n}</span><span class="td">${d}</span><span class="st"></span></li>`).join("");
  const toolNodes = [...toolsEl.children];

  // conversation flow: main path down the left, branches to the right
  const NODES = [
    { id: "greet", x: 10, y: 20, label: "Greet" },
    { id: "id", x: 10, y: 115, label: "Confirm identity" },
    { id: "sym", x: 10, y: 210, label: "Symptoms" },
    { id: "med", x: 10, y: 305, label: "Medications" },
    { id: "fu", x: 10, y: 400, label: "Follow-up visit" },
    { id: "end", x: 10, y: 495, label: "Wrap up" },
    { id: "cb", x: 250, y: 115, label: "Ask for callback", side: true },
    { id: "esc", x: 250, y: 210, label: "Escalate", side: true, alert: true },
    { id: "flag", x: 250, y: 305, label: "Flag for nurses", side: true },
  ];
  const EDGES = [["greet", "id"], ["id", "sym"], ["sym", "med"], ["med", "fu"], ["fu", "end"], ["id", "cb"], ["sym", "esc"], ["med", "flag"]];
  const W = 160, H = 56, byId = Object.fromEntries(NODES.map(n => [n.id, n]));
  const edgePath = ([a, b]) => {
    const A = byId[a], B = byId[b];
    if (B.side) return `M${A.x + W} ${A.y + H / 2} L${B.x} ${B.y + H / 2}`;
    return `M${A.x + W / 2} ${A.y + H} L${B.x + W / 2} ${B.y}`;
  };
  flow.innerHTML =
    EDGES.map((e, i) => `<path id="e${i}" d="${edgePath(e)}" stroke="#4A5D76" stroke-width="2.5" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`).join("") +
    NODES.map(n => `<g id="n-${n.id}" opacity="0"><rect x="${n.x}" y="${n.y}" width="${W}" height="${H}" rx="12"
        fill="${n.alert ? "#3A2028" : n.side ? "#1E2B3B" : "#232E52"}" stroke="${n.alert ? "#E5484D" : n.side ? "#2A3B50" : "#5B5FD6"}" stroke-width="1.5"/>
        <text x="${n.x + W / 2}" y="${n.y + H / 2 + 6}" text-anchor="middle" font-size="17" fill="#fff">${n.label}</text></g>`).join("");

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  function codeHtml(txt, typing) {
    const out = txt.split("\n").map(l => {
      if (l.startsWith("#")) return `<span class="k">${esc(l)}</span>`;
      return esc(l).replace(/(transfer_call)/g, `<span class="k">$1</span>`);
    }).join("\n");
    return out + (typing ? `<span class="cursor"></span>` : "");
  }

  U.stepCard(1, U.end("nurse_05") + 2.9 + 0.1, "narr_22");
  SCENES.add({
    render(t) {
      const a = U.end("nurse_05") + 2.9, b = U.has("narr_23") ? U.start("narr_23") - 0.5 : U.start("narr_05") - 1.3;
      // compress the build-up if the cut gives this phase less time than the long version
      // the step card covers the first ~2 s, so the build-up starts after it
      const a0 = Math.max(a + 1.5, U.cardEnd(1) + 0.2), k = Math.min(1, (b - a0 - 0.4) / 7.4), T = x => a0 + (x - a) * k;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 1;
      CHROME.clock = 12 * 60 + 20 + (t - a) * 5;

      // left: ready card
      U.css(card, { opacity: U.prog(t, T(a + 0.6), T(a + 1.1)).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, T(a + 0.6), T(a + 1.2)))) * 18}px)` });
      [...card.querySelectorAll(".rc-does li")].forEach((li, i) => U.css(li, { opacity: U.prog(t, T(a + 1.6) + i * 0.5, T(a + 2) + i * 0.5).toFixed(3) }));
      U.css(card.querySelector(".rc-next"), { opacity: U.prog(t, T(a + 5.5), T(a + 6)).toFixed(3) });

      // right: instructions typed out
      const p = U.prog(t, T(a + 0.3), T(a + 6.5));
      const n = Math.round(p * CODE.length);
      U.html(code, codeHtml(CODE.slice(0, n), p < 1));

      // tools connect one by one
      toolNodes.forEach((node, i) => {
        const ta = T(a + 1.4) + i * 0.7;
        U.css(node, { opacity: U.prog(t, ta, ta + 0.3).toFixed(3) });
        const ok = t >= ta + 0.9;
        U.cls(node, "ok", ok);
        U.text(node.querySelector(".st"), t < ta + 0.9 ? "Connecting" : "Connected");
      });

      // flow graph draws itself
      NODES.forEach((nd, i) => {
        const ta = T(a + 2.2) + (nd.side ? 1.2 + i * 0.25 : i * 0.42);
        const g = document.getElementById("n-" + nd.id);
        g.setAttribute("opacity", U.prog(t, ta, ta + 0.3).toFixed(3));
      });
      EDGES.forEach((e, i) => {
        const B = byId[e[1]], j = NODES.indexOf(B);
        const ta = T(a + 2.2) + (B.side ? 1.2 + j * 0.25 : j * 0.42) - 0.3;
        document.getElementById("e" + i).setAttribute("stroke-dashoffset", (1 - U.prog(t, ta, ta + 0.35)).toFixed(3));
      });

      U.text(sub, t < T(a + 7) ? "Version 1, building from 23 requirements" : "Version 1, ready");
    },
  });
})();
