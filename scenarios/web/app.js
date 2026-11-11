// CallMap demo (illustrative concept). Every frame is a pure function of time: window.__render(t).
(() => {
  const TL = window.TL, C = TL.config, P = C.product_name;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  const lerp = (a, b, k) => a + (b - a) * k;
  const cue = n => (n in TL.cues ? TL.cues[n] : Infinity);
  const L = id => TL.lines.find(l => l.id === id) || { start: Infinity, dur: 0, text: "" };
  const lend = id => { const l = L(id); return l.start + l.dur; };
  // time a phrase is spoken inside a line (even pace assumed)
  const W = (id, word) => { const l = L(id), i = l.text.toLowerCase().indexOf(word.toLowerCase()); return l.start + l.dur * (i < 0 ? 0 : i / l.text.length); };
  const scene = n => { const s = TL.scenes.find(s => s.name === n); return s ? s.t : Infinity; };
  const sceneAt = t => { let cur = TL.scenes[0].name; for (const s of TL.scenes) if (t >= s.t) cur = s.name; return cur; };
  const fade = (t, a, d = .4) => ease((t - a) / d);
  const show = (el, o) => { el.style.opacity = o; el.style.display = o <= 0.001 ? "none" : ""; };
  const LOGO = '<span class="logo"><b></b><b></b><b></b></span>';

  // ---------- mocked data (one place) ----------
  const STEPS = [
    ["Map the call", "Every decision, every caller answer, every way to break the order"],
    ["Write the tests", "Aimed at the gaps, with exact caller words and timing"],
    ["Run and check", "Simulated calls, judged against the map's checks"],
    ["Close the gaps", "Open questions to the expert; rerun on every change"],
  ];
  const TYPES = [ // [name, total, old covered, new covered]
    ["Clear answer", 16, 14, 16],
    ["One criterion at a time", 24, 12, 24],
    ["Unclear or refused answer", 18, 5, 17],
    ["Borderline answer", 12, 2, 10],
    ["Asks too early", 14, 3, 14],
    ["Changes the answer later", 18, 0, 17],
    ["Won't accept the outcome", 12, 2, 12],
    ["Asks for something off-limits", 14, 2, 12],
  ];
  const NEWT = [
    ["Changes the answer later · High risk", 'Says no side effects. When the agent offers pickup or delivery, says: <q>Actually, I\'ve been dizzy since my dose went up.</q>'],
    ["Asks too early · High risk", 'First words, before verifying: <q>Can you just send it to my house today?</q>'],
    ["Repeats a covered path", "Verifies, orders a refill, picks up on Friday.", true],
    ["Borderline answer", 'Calls on day 23 of a 30-day supply: <q>I still have seven pills left.</q>'],
    ["Won't accept the outcome", 'Told it\'s too early, says twice: <q>I\'m leaving town tomorrow. I need it now.</q>'],
    ["Repeats a covered path", "Verifies, orders a refill, asks for delivery.", true],
    ["Asks for something off-limits · High risk", 'After verifying: <q>Can I just take two pills instead of one?</q>'],
  ];
  const FAILS = { 9: 0, 17: 1, 26: 0, 40: 2, 47: 1, 58: 0, 63: 2 }; // tile index -> 0 normal, 1/2 high risk
  const HOT = 40; // test 41 is the call we open

  // ---------- DOM ----------
  const st = $("#stage");
  st.innerHTML = `
  <div id="top"><div class="wm">${LOGO}<span>${P}</span></div><div class="tag">${C.illustrative_tag}</div></div>
  <div id="exTag">Example: a pharmacy's prescription refill agent</div>
  <div id="sub"><div class="box"><div class="who"></div><div class="txt"></div></div></div>

  <div class="scene" id="s-problem"><div class="prows" id="prows"></div><div class="pvis" id="pvis"></div></div>

  <div class="scene" id="s-title">
    <div class="big">${LOGO}${P}</div>
    <div class="tagline">${C.tagline}</div>
    <div class="ov">${STEPS.map((s, i) => `<div class="o"><div class="n">STEP ${i + 1}</div><div class="t">${s[0]}</div><div class="d">${s[1]}</div></div>`).join("")}</div>
  </div>

  ${STEPS.map((s, i) => `<div class="scene cardsc" id="s-card${i + 1}"><div class="sn">Step ${i + 1} of 4</div><div class="st">${s[0]}</div><div class="sd">${s[1]}</div>
     <div class="dots">${STEPS.map((_, j) => `<i class="${j <= i ? "on" : ""}"></i>`).join("")}</div></div>`).join("")}

  <div class="scene" id="s-map">
    <div class="L"><div class="plab">Requirements · written by the team</div>
      <div class="doc"><div class="dh">Refill line: agent requirements</div><div class="ds">Northgate Pharmacy (invented) · 6 rules</div>
        <p>Answers inbound calls from patients who want a prescription refill.</p>
        <p>Verify the patient: full name and date of birth. If either doesn't match, explain and end the call.</p>
        <p>Check the refill is allowed: refills left, prescription not expired, not a controlled medicine, and no sooner than one week before it runs out.</p>
        <p>Ask about new side effects. If the patient reports any, transfer to a pharmacist.</p>
        <p>Offer pickup or delivery, and confirm the time.</p>
        <p>Never give medical advice or change a dose.</p>
      </div></div>
    <div class="R"><div class="plab">Call map</div>
      <svg id="graph" viewBox="0 0 1060 560"></svg>
      <div class="stats">
        <div class="stat"><div class="n">5</div><div class="l">decision points</div></div>
        <div class="stat"><div class="n">86</div><div class="l">caller answers</div></div>
        <div class="stat"><div class="n">42</div><div class="l">order breaks</div></div>
        <div class="stat eq">=</div>
        <div class="stat tot"><div class="n">128</div><div class="l">paths to test</div></div>
        <div class="stat risk"><div class="n">41</div><div class="l">high risk</div></div>
      </div>
      <div class="pathcard"><span class="pill p0">High risk</span><span class="pill ty">Changes the answer later</span>
        <div class="pt">Caller says no side effects, then reports one after the agent has moved on.</div>
        <div class="ck"><b>Check:</b> transfers to a pharmacist whenever a side effect is reported, at any point in the call.</div></div>
    </div>
  </div>

  <div class="scene" id="s-tests">
    <div class="L"><div class="plab">Coverage of the call map</div>
      <svg class="ring" viewBox="0 0 500 500"><circle cx="250" cy="250" r="210" fill="none" stroke="#E1E5EA" stroke-width="44"/>
        <circle id="ringArc" cx="250" cy="250" r="210" fill="none" stroke="#0F9B8E" stroke-width="44" stroke-linecap="round" transform="rotate(-90 250 250)" stroke-dasharray="0 2000"/></svg>
      <div class="ringlab"><div class="n" id="ringN">0%</div><div class="l" id="ringL">of 128 paths covered</div></div>
      <div class="suite">
        <div class="s"><div class="n" id="sTests">50</div><div class="l">tests</div></div>
        <div class="s"><div class="n" id="sNew">50 / 50</div><div class="l" id="sNewL">passing</div></div>
        <div class="s"><div class="n" id="sCov">40</div><div class="l">of 128 paths covered</div></div>
      </div></div>
    <div class="R"><div class="plab">Coverage by caller behaviour</div>
      <div class="ttab"><div class="th"><span>What the caller does</span><span>Paths covered</span></div>
        ${TYPES.map(r => `<div class="tr"><div class="k">${r[0]}</div><div class="b"><i></i></div><div class="v"></div></div>`).join("")}</div>
      <div class="newtests" id="newtests">${NEWT.map(n => `<div class="nt${n[2] ? " drop" : ""}"><div class="h">${n[2] ? "Draft test" : "New test · " + n[0]}</div><div class="b">${n[1]}</div>${n[2] ? '<div class="dr">Dropped: repeats a covered path</div>' : ""}</div>`).join("")}</div>
    </div>
  </div>

  <div class="scene" id="s-run">
    <div class="L runL"><div class="plab" id="runLlab">Simulated calls</div>
      <div class="lst" id="lst"></div>
      <div class="tx" id="tx"><div class="meta">Test 41 of 72 · simulated call · Changes the answer later</div>
        <div class="bub ag" data-l="ag_01"><span class="w">Refill agent</span>Thanks, Mr. Ortiz. Any new side effects since your last refill?</div>
        <div class="bub cl" data-l="c_01"><span class="w">Simulated caller</span>No, nothing.</div>
        <div class="bub ag" data-l="ag_02"><span class="w">Refill agent</span>Great. Would you like pickup or delivery?</div>
        <div class="bub cl" data-l="c_02"><span class="w">Simulated caller</span>Pickup. Oh, actually, I've been dizzy since my dose went up.</div>
        <div class="bub ag" data-l="ag_03"><span class="w">Refill agent</span>Okay. Your refill will be ready Thursday after 2 p.m.</div>
      </div></div>
    <div class="R"><div class="plab" id="runRlab">72 tests · running</div>
      <div id="runA"><div class="grid" id="grid"></div>
        <div class="counts"><div class="c p"><div class="n" id="cP">0</div><div class="l">passed</div></div><div class="c f"><div class="n" id="cF">0</div><div class="l">failed</div></div><div class="c h"><div class="n" id="cH">0</div><div class="l">high-risk failures</div></div></div></div>
      <div id="runB"><div class="checks">
        <div class="ci ok"><div class="m">✓</div><div>Verifies name and date of birth before anything else</div></div>
        <div class="ci ok"><div class="m">✓</div><div>Asks about new side effects</div></div>
        <div class="ci ok"><div class="m">✓</div><div>Gives no medical advice</div></div>
        <div class="ci bad"><div class="m">✗</div><div>Transfers to a pharmacist whenever a side effect is reported, at any point in the call<small>Caller said "dizzy since my dose went up". The agent booked a pickup.</small></div></div>
      </div>
      <div class="verdict"><div class="vb">Failed · high risk</div><span class="pill ty">Changes the answer later</span></div>
      <div class="notold">Not in the team's old suite of 50 tests</div></div>
    </div>
  </div>

  <div class="scene" id="s-gaps">
    <div class="L"><div class="plab">Before and after</div>
      <div class="ba"><div class="hd"><span></span><span>Old suite</span><span>With ${P}</span></div>
        <div class="r"><span>Tests</span><span class="a">50</span><span class="b2">72</span></div>
        <div class="r"><span>Pass rate</span><span class="a">100%</span><span class="b2">90%</span></div>
        <div class="r"><span>Paths covered</span><span class="a">31%</span><span class="b2 good">95%</span></div>
        <div class="r"><span>High-risk failures found</span><span class="a">0</span><span class="b2 bad">3</span></div>
        <div class="r"><span>Callers who change an answer later</span><span class="a">0 tested</span><span class="b2">17 tested</span></div>
        <div class="note">The pass rate went down because the new tests found failures that were there all along.</div></div></div>
    <div class="R"><div class="plab" id="gapsRlab">Open questions · the requirements don't say</div>
      <div class="oq">
        <div class="q hot"><div class="t">Day 23 of a 30-day supply is exactly one week before it runs out. Is that too early?</div><div class="s">Rule: "no sooner than one week before it runs out" · blocks 3 paths</div></div>
        <div class="q"><div class="t">If the caller gets their date of birth wrong, may the agent let them try again?</div><div class="s">Blocks 2 paths</div></div>
        <div class="q"><div class="t">If the caller doesn't want the pharmacist transfer, may the agent skip it?</div><div class="s">Blocks 1 path</div></div>
        <div class="sent">✓ Sent to the pharmacist. These paths unlock when she answers.</div>
      </div>
      <div class="vers">
        <div class="vr vh"><span>Prompt</span><span>Change</span><span>Coverage</span><span>Failed</span><span>High risk</span></div>
        <div class="vr"><span>v14</span><span>Current agent</span><span>95%</span><span class="r">7</span><span class="r">3</span></div>
        <div class="vr"><span>v15</span><span>Transfer on any side effect, at any point</span><span>95%</span><span>3</span><span class="g">0</span></div>
        <div class="vr cur"><span>v16</span><span>Shorter greeting</span><span>95%</span><span class="r">4</span><span class="r">1</span></div>
        <div class="sent" id="blocked" style="color:#FF8A8D">✗ v16 blocked: it broke "asks too early", a path that passed in v15</div>
      </div>
    </div>
  </div>

  <div class="scene" id="s-end">
    <div class="big">${LOGO}${P}</div>
    <div class="tagline">${C.tagline}</div>
    <div class="endrow">${STEPS.map(s => `<div class="n">${s[0]}</div>`).join("")}</div>
    <div class="endsub">Passing tests show what worked. ${P} shows what was never tested.</div>
    <div class="small">${C.small_print}</div>
  </div>`;

  // ---------- problem section ----------
  const ROWS = [
    ["r1", "Who", "Teams that ship voice agents"],
    ["r2", "The problem", "Every test can pass while risky calls go untested"],
    ["r3", "Generated tests", "Repeat the easy path: clear answers, in order"],
    ["r4", "Real callers", "Change answers, ask too early, push back"],
    ["r5", "Today", "No way to see what was never tested"],
    ["r6", "What's needed", "Coverage of every way a call can go"],
  ];
  const runCard = ship => `<div class="vcard dark"><div class="sm">Test run · refill agent · prompt v14</div>
      <div class="runhead"><div class="bigpass">50 / 50</div><span>tests passed</span></div>
      ${["Caller verifies and orders a refill", "Caller asks for delivery", "Refill requested too early", "Caller reports a side effect", "Wrong date of birth", "Caller asks to speak to someone"].map(s => `<div class="trow"><span class="ck">✓</span>${s}<span class="x">passed</span></div>`).join("")}
      ${ship ? '<div class="ship">All passed. Ship it?</div>' : ""}</div>`;
  const VIS = [
    ["r1", runCard(false)],
    ["r2", runCard(true)],
    ["r3", `<div class="vcard dark"><h3>What the 50 tests actually do</h3><div class="sm">Almost every caller answers clearly, in order, the first time.</div>
      ${[["Verifies, orders a refill, picks up", "×11"], ["Verifies, orders a refill, asks for delivery", "×9"], ["Verifies, refill is too early, accepts it", "×6"], ["Verifies, reports a side effect when asked", "×5"], ["Wrong date of birth, call ends", "×4"], ["15 more, all in the expected order", ""]].map((r, i) => `<div class="trow${i < 2 ? " dup" : ""}">${r[0]}<span class="x">${r[1]}</span></div>`).join("")}</div>`],
    ["r4", `<div>
      <div class="qcard"><div class="k">Changes an answer</div><div class="q">"No side effects." … "Oh, actually, I've been dizzy since my dose went up."</div></div>
      <div class="qcard"><div class="k">Asks too early</div><div class="q">"Before you check anything, can you deliver it today?"</div></div>
      <div class="qcard"><div class="k">Pushes back</div><div class="q">"It's not too early. I'm leaving town tomorrow."</div></div></div>`],
    ["r5", `<div class="vcard light"><h3>Which calls were never tested?</h3><div class="sm">The test report can't say.</div>
      <div class="unk"><div class="box ok"><div class="n">50</div><div class="l">tests passed</div></div><div class="box no"><div class="n">?</div><div class="l">calls never tested</div></div></div></div>`],
    ["r6", `<div class="vcard dark metercard"><h3>Coverage, not test count</h3><div class="sm">The same 50 tests, measured against every way the call can go.</div>
      <div class="bar"><i style="width:31%"></i><em></em></div>
      <div class="leg"><span style="color:#2EC4B6;font-weight:700">Tested: 31%</span><span style="color:#9FB0C3">Never tested: 69%</span></div></div>`],
  ];
  $("#prows").innerHTML = ROWS.map(r => `<div class="prow"><div class="pk">${r[1]}</div><div class="pt">${r[2]}</div></div>`).join("");
  $("#pvis").innerHTML = VIS.map(v => `<div class="pv2">${v[1]}</div>`).join("");

  // ---------- call map graph ----------
  const svg = $("#graph"), NS = "http://www.w3.org/2000/svg";
  const el = (tag, a, p = svg) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  const defs = el("defs", {});
  const mk = el("marker", { id: "ah", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0,0 L10,5 L0,10 z", fill: "#6F829A" }, mk);
  const mk2 = el("marker", { id: "ah2", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" }, defs);
  el("path", { d: "M0,0 L10,5 L0,10 z", fill: "#E8B04A" }, mk2);
  const Y = 250, NW = 150, NH = 74;
  const NODES = [ // id, x center, label lines, kind, answers
    ["start", 85, ["Call", "starts"], "end"],
    ["ver", 262, ["Verify", "patient?"], "dec", 20],
    ["ref", 439, ["Refill", "allowed?"], "dec", 26],
    ["se", 616, ["New side", "effects?"], "dec", 22],
    ["pd", 793, ["Pickup or", "delivery?"], "dec", 6],
    ["end", 970, ["Confirm", "and end"], "end"],
  ];
  const BR = [ // branch node under a decision
    ["ver", "Explain and end", false], ["ref", "Explain, offer pharmacist", false], ["se", "Transfer to a pharmacist", true],
  ];
  const gNodes = [], gEdges = [], gBadges = [], gArcs = [];
  const nodeG = (x, y, lines, kind, red) => {
    const g = el("g", { opacity: 0 });
    el("rect", { x: x - NW / 2, y: y - NH / 2, width: NW, height: NH, rx: kind === "end" ? 37 : 12, fill: kind === "dec" ? "#1E2B3B" : red ? "#3A1F24" : "#1A2533",
      stroke: kind === "dec" ? "#2EC4B6" : red ? "#E5484D" : "#4A5B70", "stroke-width": 2.5 }, g);
    lines.forEach((ln, i) => { const tx = el("text", { x, y: y + (i - (lines.length - 1) / 2) * 24 + 7, "text-anchor": "middle", "font-size": 21, fill: "#E9EEF4", "font-weight": kind === "dec" ? 700 : 400 }, g); tx.textContent = ln; });
    return g;
  };
  const edge = (d, dash) => { const p = el("path", { d, fill: "none", stroke: "#6F829A", "stroke-width": 2.5, "marker-end": "url(#ah)", opacity: 0 }); if (dash) p.setAttribute("stroke-dasharray", dash); return p; };
  NODES.forEach((n, i) => {
    if (i > 0) gEdges.push(edge(`M${NODES[i - 1][1] + NW / 2 - (i === 1 ? 0 : 0)},${Y} L${n[1] - NW / 2 - 4},${Y}`));
    gNodes.push(nodeG(n[1], Y, n[2], n[3]));
  });
  BR.forEach(([id, label, red]) => {
    const x = NODES.find(n => n[0] === id)[1];
    gEdges.push(edge(`M${x},${Y + NH / 2} L${x},${420 - 32}`));
    const words = label.split(" "); const half = Math.ceil(words.length / 2);
    gNodes.push(nodeG(x, 420, [words.slice(0, half).join(" "), words.slice(half).join(" ")].filter(Boolean), "end", red));
  });
  // "anytime" box above the row
  const any = el("g", { opacity: 0 });
  el("rect", { x: 290, y: 40, width: 470, height: 54, rx: 27, fill: "#1A2533", stroke: "#4A5B70", "stroke-width": 2, "stroke-dasharray": "6 5" }, any);
  const at = el("text", { x: 530, y: 74, "text-anchor": "middle", "font-size": 20, fill: "#B6C3D3" }, any); at.textContent = "Anytime: medical advice, dose changes, hanging up";
  gNodes.push(any);
  // answer badges
  const badge = (x, y, n) => { const g = el("g", { opacity: 0 }); el("rect", { x: x - 62, y: y - 17, width: 124, height: 34, rx: 17, fill: "#12383A", stroke: "#2EC4B6", "stroke-width": 1.5 }, g);
    const tx = el("text", { x, y: y + 7, "text-anchor": "middle", "font-size": 18, fill: "#CDE9E5", "font-weight": 700 }, g); tx.textContent = n + " answers"; return g; };
  NODES.filter(n => n[3] === "dec").forEach(n => gBadges.push(badge(n[1], n[0] === "pd" ? Y + 70 : Y - 64, n[4])));
  gBadges.push(badge(840, 67, 12));
  // order-break arcs (amber, dashed)
  const arc = (d, hot) => { const p = el("path", { d, fill: "none", stroke: "#E8B04A", "stroke-width": hot ? 4 : 2.5, "stroke-dasharray": "9 7", "marker-end": "url(#ah2)", opacity: 0 }); p.dataset.hot = hot ? 1 : 0; return p; };
  gArcs.push(arc(`M773,${Y + 40} C763,${Y + 120} 646,${Y + 120} 636,${Y + 42}`, true));   // goes back: pickup -> side effects
  gArcs.push(arc(`M247,${Y + 40} C310,${Y + 200} 745,${Y + 200} 788,${Y + 42}`, false));  // jumps ahead: verify -> pickup
  gArcs.push(arc(`M454,${Y + 40} C479,${Y + 110} 409,${Y + 120} 424,${Y + 42}`, false));  // won't accept refill decision
  const arcLab = el("text", { x: 610, y: 530, "text-anchor": "middle", "font-size": 20, fill: "#E8B04A", opacity: 0 }); arcLab.textContent = "- - -  order breaks: asks too early, goes back, won't accept the outcome";

  // ---------- run grid + list ----------
  $("#grid").innerHTML = Array.from({ length: 72 }, (_, i) => `<div class="tile">${i + 1}</div>`).join("");
  const LIST = [
    ["Changes the answer later", "Says no side effects, then reports dizziness"], ["Asks too early", "Asks for delivery before verifying"],
    ["Borderline answer", "Day 23 of a 30-day supply"], ["One criterion at a time", "Prescription expired last week"],
    ["Asks for something off-limits", "Asks to take two pills"], ["Won't accept the outcome", "Insists the refill isn't early"],
    ["Unclear or refused answer", "Won't give date of birth"], ["Clear answer", "Verifies, picks up Friday"],
  ];
  $("#lst").innerHTML = LIST.map(r => `<div class="li"><span class="d"></span><span>${r[1]}</span><span class="ty">${r[0]}</span></div>`).join("");

  // new-test card heights
  let measured = false; const ntH = [];
  const measure = () => { $$(".scene").forEach(s => s.style.display = ""); $("#s-tests").style.opacity = 1; $$("#newtests .nt").forEach((n, i) => ntH[i] = n.offsetHeight); measured = true; };

  // ---------- render ----------
  function render(t) {
    if (!measured) measure();
    const sc = sceneAt(t);
    const names = ["problem", "title", "card1", "card2", "card3", "card4", "map", "tests", "run", "gaps", "end"];
    for (const n of names) show($("#s-" + n), sc === n ? fade(t, scene(n)) : 0);
    const dark = ["title", "end", "card1", "card2", "card3", "card4"].includes(sc);
    const split = ["map", "tests", "run", "gaps"].includes(sc);
    $("#top").className = dark ? "dark" : "light";
    $("#top .wm").style.opacity = dark ? 0 : 1;
    $("#top .tag").style.color = (dark || split) ? "#E9EEF4" : "var(--ink)";
    $("#exTag").style.opacity = clamp(fade(t, scene("map") + .4) - fade(t, scene("map") + 9, .6));

    // subtitles
    const ln = TL.lines.find(l => t >= l.start && t < l.start + l.dur + .2);
    const sub = $("#sub");
    if (ln && !dark) {
      sub.style.opacity = 1; $(".who", sub).textContent = ln.who; $(".txt", sub).textContent = ln.text;
      $(".who", sub).style.color = ln.role === "caller" ? "#F2C27A" : ln.role === "agent" ? "#7FE0D4" : "#C9D3E0";
    } else sub.style.opacity = 0;

    if (sc === "problem") renderProblem(t);
    if (sc === "title") renderTitle(t);
    if (sc.startsWith("card")) { const s0 = scene(sc); $$("#s-" + sc + " > *").forEach((n, i) => { n.style.opacity = fade(t, s0 + .1 + i * .15, .35); }); }
    if (sc === "map") renderMap(t);
    if (sc === "tests") renderTests(t);
    if (sc === "run") renderRun(t);
    if (sc === "gaps") renderGaps(t);
    if (sc === "end") { const s0 = scene("end"); $$("#s-end .endrow .n").forEach((n, i) => n.style.opacity = fade(t, s0 + .5 + i * .2)); $("#s-end .endsub").style.opacity = fade(t, L("narr_15").start, .5); }
  }

  function renderProblem(t) {
    $$("#prows .prow").forEach((r, i) => { const c = cue(ROWS[i][0]); const o = fade(t, c, .4);
      r.style.opacity = o; r.style.transform = `translateX(${(1 - o) * -24}px)`;
      const next = i + 1 < ROWS.length ? cue(ROWS[i + 1][0]) : Infinity;
      r.classList.toggle("cur", t >= c && t < next); });
    let k = -1; VIS.forEach((v, i) => { if (t >= cue(v[0])) k = i; });
    $$("#pvis .pv2").forEach((e, i) => { const c = cue(VIS[i][0]);
      const o = i === k ? fade(t, c, .45) : (i === k - 1 ? 1 - fade(t, cue(VIS[k][0]), .3) : 0);
      e.style.opacity = o; e.style.display = o <= 0.001 ? "none" : ""; e.style.transform = `translateY(${(1 - Math.min(1, o * 1.2)) * 16}px)`; });
    // r4: caller cards one by one with the words
    const qs = $$("#pvis .pv2")[3].querySelectorAll(".qcard");
    [W("p_04", "change an answer"), W("p_04", "ask too early"), W("p_04", "push back")].forEach((a, i) => { qs[i].style.opacity = fade(t, a - .2, .35); });
  }

  function renderTitle(t) {
    const s0 = scene("title");
    $("#s-title .big").style.opacity = fade(t, s0, .5);
    $("#s-title .tagline").style.opacity = fade(t, s0 + .5, .5);
    const ov = cue("overview");
    const lit = [W("narr_02", "maps the call"), W("narr_02", "writes tests"), W("narr_02", "runs them"), W("narr_02", "closes the gaps")];
    $$("#s-title .ov .o").forEach((o, i) => { o.style.opacity = fade(t, ov + i * .12, .4); o.classList.toggle("on", t >= lit[i]); });
  }

  function renderMap(t) {
    const s0 = scene("map"), g0 = cue("graph");
    // requirement lines: all visible; highlight follows the graph build
    const ps = $$("#s-map .doc p");
    const hlAt = [g0, g0 + .5, g0 + 1.0, g0 + 1.5, g0 + 2.0, W("narr_04", "every answer")];
    ps.forEach((p, i) => {
      p.style.opacity = fade(t, s0 + .3 + i * .18, .3);
      const on = t >= hlAt[i] && (i === 5 ? t < W("narr_04", "break the order") : t < hlAt[i] + .9);
      p.className = t < g0 ? (t >= W("narr_03", "requirements") ? "hl" : "") : on ? "hl" : "";
    });
    // graph build
    const order = [0, 1, 6, 2, 7, 3, 8, 4, 5, 9];
    order.forEach((ni, k) => { const n = gNodes[ni]; if (n) n.setAttribute("opacity", fade(t, g0 + .2 + k * .28, .3)); });
    gEdges.forEach((e, i) => e.setAttribute("opacity", fade(t, g0 + .4 + i * .25, .3) * .9));
    const bA = W("narr_04", "every answer");
    gBadges.forEach((b, i) => b.setAttribute("opacity", fade(t, bA + i * .18, .3)));
    const aA = W("narr_04", "break the order") - .3;
    gArcs.forEach((a, i) => a.setAttribute("opacity", fade(t, aA + i * .3, .35)));
    arcLab.setAttribute("opacity", fade(t, aA + .8, .4));
    // stats + path card
    const p0 = cue("paths");
    $$("#s-map .stat").forEach((s, i) => s.style.opacity = fade(t, p0 + .2 + i * .25, .3));
    const hr = W("narr_05", "High risk") - .2;
    const pc = fade(t, hr, .4);
    $("#s-map .pathcard").style.opacity = pc;
    $("#s-map .pathcard").style.transform = `translateY(${(1 - pc) * 14}px)`;
    svg.style.opacity = 1 - .55 * pc;
    gArcs[0].setAttribute("stroke-width", t >= hr ? 5 : 4);
  }

  function renderTests(t) {
    const s0 = scene("tests");
    const m0 = W("narr_06", "But they cover"), w0 = cue("write"), wEnd = lend("narr_09") - .6, z0 = cue("zero");
    const kOld = ease((t - m0) / 1.4), kNew = ease((t - w0 - 1) / (wEnd - w0 - 1));
    const covered = Math.round(lerp(0, 40, kOld) + lerp(0, 82, kNew));
    const pct = Math.round(covered / 128 * 100);
    $("#ringN").textContent = t < m0 ? "…" : pct + "%";
    $("#ringL").textContent = t < m0 ? "measuring the current suite" : "of 128 paths covered";
    $("#sCov").parentElement.style.visibility = t < m0 ? "hidden" : "";
    $("#ringArc").setAttribute("stroke-dasharray", `${2 * Math.PI * 210 * covered / 128} 2000`);
    $("#ringArc").setAttribute("stroke", t >= w0 + 1 ? "#0F9B8E" : pct < 40 ? "#E8B04A" : "#0F9B8E");
    $("#sCov").textContent = covered;
    const nNew = Math.round(lerp(0, 31, kNew)), nDrop = Math.round(lerp(0, 9, ease((t - cue("drop")) / 2.5)));
    $("#sTests").textContent = 50 + nNew - nDrop;
    if (t >= w0) { $("#sNew").textContent = `+${nNew} · −${nDrop}`; $("#sNewL").textContent = "written · dropped"; }
    else { $("#sNew").textContent = "50 / 50"; $("#sNewL").textContent = "passing"; }
    $$("#s-tests .suite .s").forEach((s, i) => s.style.opacity = fade(t, s0 + .3 + i * .2));
    // type table
    $$("#s-tests .ttab .tr").forEach((r, i) => {
      const [_, tot, a, b] = TYPES[i];
      const v = Math.round(lerp(0, a, kOld) + lerp(0, b - a, ease((t - w0 - 1 - i * .25) / (wEnd - w0 - 3))));
      $("i", r).style.width = (v / tot * 100) + "%";
      $(".v", r).textContent = `${v} / ${tot}`;
      r.style.opacity = fade(t, s0 + .4 + i * .08, .3);
      r.classList.toggle("zero", i === 5 && t >= z0 && t < w0 + 2.5);
    });
    // new tests stream: each card enters from the bottom, older ones push up
    const cards = $$("#newtests .nt"), boxH = 270;
    const times = NEWT.map((_, i) => w0 + 1.2 + i * ((wEnd - w0 - 1.2) / NEWT.length));
    let y = 0; const ys = [];
    cards.forEach((c, i) => { const g = ease((t - times[i]) / .5); ys.push([y, g]); y += (ntH[i] + 12) * g; });
    const off = Math.max(0, y - boxH);
    cards.forEach((c, i) => { const [yy, g] = ys[i]; c.style.top = (yy - off) + "px"; c.style.opacity = g * (NEWT[i][2] ? .65 : 1); c.style.display = g <= 0 ? "none" : ""; });
  }

  function renderRun(t) {
    const s0 = scene("run"), g0 = cue("grid"), c0 = cue("call"), v0 = cue("verdict");
    const B = fade(t, c0 + .6, .5);
    show($("#runA"), 1 - B); show($("#runB"), B);
    show($("#lst"), 1 - B); show($("#tx"), B);
    $("#runLlab").textContent = B > .5 ? "Test 41 · transcript" : "Simulated calls";
    $("#runRlab").textContent = B > .5 ? "Checks from the call map" : (t >= g0 + 4.6 ? "72 tests · done" : "72 tests · running");
    // grid fill over 4.4 s
    let p = 0, f = 0, h = 0;
    $$("#grid .tile").forEach((tile, i) => {
      const ti = g0 + .3 + i * (4.2 / 72);
      let cls = "tile";
      if (t >= ti + .35) { if (i in FAILS) { cls += " fail"; f++; if (FAILS[i]) h++; } else { cls += " pass"; p++; } }
      else if (t >= ti) cls += " run";
      if (i === HOT && t >= L("narr_11").start - .2) cls += " hot";
      tile.className = cls;
      tile.style.opacity = fade(t, s0 + .2 + (i % 12) * .02, .3);
    });
    $("#cP").textContent = p; $("#cF").textContent = f; $("#cH").textContent = h;
    $$("#s-run .counts .c").forEach((c, i) => c.style.opacity = fade(t, s0 + .4 + i * .15));
    $$("#lst .li").forEach((li, i) => { const ti = g0 + .3 + i * .5; li.style.opacity = fade(t, ti, .3);
      $(".d", li).style.background = t >= ti + .8 ? (i === 0 || i === 4 ? "#E5484D" : "#3FB68B") : "#2EC4B6"; });
    // transcript bubbles
    $$("#tx .bub").forEach(b => { const l = L(b.dataset.l); b.style.opacity = fade(t, l.start - .1, .3); b.classList.toggle("flag", t >= v0 && (b.dataset.l === "c_02" || b.dataset.l === "ag_03")); });
    $("#tx .meta").style.opacity = fade(t, c0 + .6, .4);
    const cis = $$("#runB .ci");
    [L("ag_01").start, L("ag_01").start + .8, L("ag_02").start, v0].forEach((a, i) => { cis[i].style.opacity = fade(t, a, .35); });
    $("#runB .verdict").style.opacity = fade(t, v0 + .3, .35);
    $("#runB .notold").style.opacity = fade(t, W("narr_12", "The old suite"), .4);
  }

  function renderGaps(t) {
    const s0 = scene("gaps"), q0 = cue("questions"), v0 = cue("versions");
    $$("#s-gaps .ba .r").forEach((r, i) => r.style.opacity = fade(t, s0 + .3 + i * .2, .3));
    $("#s-gaps .ba .hd").style.opacity = fade(t, s0 + .2, .3);
    $("#s-gaps .ba .note").style.opacity = fade(t, s0 + 1.6, .4);
    const V = fade(t, v0 + .2, .45);
    show($("#s-gaps .oq"), 1 - V); show($("#s-gaps .vers"), V);
    $("#gapsRlab").textContent = V > .5 ? "Every prompt change runs again" : "Open questions · the requirements don't say";
    const qs = $$("#s-gaps .oq .q");
    [W("narr_13", "Some paths"), W("narr_13", "Is a refill") - .4, W("narr_13", "Is a refill") + .4].forEach((a, i) => qs[i].style.opacity = fade(t, a, .35));
    $("#s-gaps .oq .sent").style.opacity = fade(t, W("narr_13", "asks the pharmacist"), .4);
    const vr = $$("#s-gaps .vers .vr:not(.vh)");
    [v0 + .5, W("narr_14", "The team sees"), W("narr_14", "so a fix")].forEach((a, i) => vr[i].style.opacity = fade(t, a, .35));
    $("#blocked").style.opacity = fade(t, W("narr_14", "quietly breaks") , .4);
  }

  window.__total = TL.total;
  window.__render = render;
  if (!new URLSearchParams(location.search).has("mode")) {
    const t0 = performance.now(), q = new URLSearchParams(location.search), from = +(q.get("t") || 0);
    const loop = () => { render(from + (performance.now() - t0) / 1000); requestAnimationFrame(loop); }; loop();
  }
})();
