// AgentLine demos. Every frame is a pure function of time: window.__render(t).
(() => {
  const TL = window.TL, C = TL.config, P = C.product_name, D = TL.demo;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const ease = x => { x = clamp(x); return x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; };
  const cue = n => (n in TL.cues ? TL.cues[n] : Infinity);
  const L = id => TL.lines.find(l => l.id === id) || { start: Infinity, dur: 0, text: "" };
  const W = (id, word) => { const l = L(id), i = l.text.toLowerCase().indexOf(word.toLowerCase()); return l.start + l.dur * (i < 0 ? 0 : i / l.text.length); };
  const scene = n => { const s = TL.scenes.find(s => s.name === n); return s ? s.t : Infinity; };
  const sceneAt = t => { let cur = TL.scenes[0].name; for (const s of TL.scenes) if (t >= s.t) cur = s.name; return cur; };
  const fade = (t, a, d = .4) => ease((t - a) / d);
  const show = (el, o) => { el.style.opacity = o; el.style.display = o <= 0.001 ? "none" : ""; };
  const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const isD1 = D === "demo1";
  const AGENT = isD1 ? "Claude Code" : "Fixit";
  const NUM = isD1 ? "+1 (650) 555-0142" : "+1 (415) 555-0137";
  const LOGO = (s = 28) => `<svg viewBox="0 0 32 32" width="${s}" height="${s}"><rect width="32" height="32" rx="8" fill="#17A673"/><path d="M4 16h5l2.5-6 4 12 3-8 1.8 2H28" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const CALL = '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z"/></svg>';
  const tokenize = md => md.split(/(\s+)/).map(w => /\s/.test(w) ? w : `<span class="tok">${w.replace(/</g, "&lt;")}</span>`).join("");
  const lined = (a, b) => `<div class="lined"><div class="end">${a}</div><div class="seg"><b></b><em>voice · phone</em></div><div class="mid">${LOGO(28)}${P}</div><div class="seg"><b></b><em>text</em></div><div class="end">${b}</div></div>`;

  // ---------- hook content ----------
  const MD1 = `## Test results
- 212 passed, 2 failed
### Failed tests
- \`test_checkout_currency\` (line 42)
  AssertionError: expected 19.99, got 19.98
- \`test_checkout_tax_rounding\` (line 88)
  AssertionError: expected 4.13, got 4.12
... 1,831 more lines`;
  const MD2 = `**E24 is a drain error.** Try these steps:
1. Turn off the dishwasher.
2. Remove the bottom rack.
3. Twist the filter counterclockwise and lift it out.
4. Rinse the filter under the tap.
5. Refit the filter and run a rinse cycle.
6. If E24 comes back, book a technician.
_Warranty: covered until March 2027._`;
  const TERM = [
    ["h1", 0.3, '<span class="pr">~/shop-app $</span> claude'],
    ["h1", 1.0, '<span class="dim">&gt;</span> Refactor the payments module and update the checkout tests'],
    ["h1", 1.8, '  <span class="dim">Reading 42 files…</span>'],
    ["h1", 2.6, '  <span class="ok">✓</span> Refactored payments/currency.py'],
    ["h1", 3.3, '  <span class="ok">✓</span> Updated tests/checkout/test_checkout.py'],
    ["h1", 4.0, '  <span class="dim">Running 214 tests…</span>  <span class="ok">212 passed</span>'],
    ["h2", 1.6, '  <span class="q">?</span> Refunds use the same rounding code.'],
    ["h2", 1.6, '    Fix them too? <span class="dim">(y/n)</span> <span class="cur">▌</span>'],
  ];
  const readScreen = md => `<div class="rs"><div class="lab">VOICE MODE · READING ALOUD</div><div class="md2 mono">${tokenize(md)}</div>
    <div class="bars">${"<b></b>".repeat(16)}</div><div class="x">✕ Stopped listening</div></div>`;
  const hookHTML = isD1 ? `
    <div class="term"><div class="tb"><i></i><i></i><i></i><span>Terminal · shop-app · cloud session</span><div class="tbadge" id="tbadge"></div></div>
      <div class="body mono" id="termBody"></div></div>
    <div class="bigclock" id="bigclock"></div>
    <div class="hline" id="hline"><div class="bar"></div><div class="pill">${LOGO(22)}${P}</div></div>
    <div class="hright">
      <div class="hv" id="hvMe"><div class="mecard" id="mecard"><div class="av">V</div><div><div class="t1" id="meT1">Me, at my desk</div><div class="t2" id="meT2">Watching the agent work</div></div></div></div>
      <div class="hv" id="hvPhone"><div class="hphone"><div class="scr">
        <div class="sbar"><span>9:41</span><span>●●● 5G</span></div>
        <div id="hRead">${readScreen(MD1)}</div>
        <div id="hCall" class="cs" style="opacity:0"><div class="av">C</div><div class="nm">Claude Code</div><div class="st">calling via ${P}…</div>
          <div class="btns"><div class="btn r" style="transform:rotate(135deg)">${CALL}</div><div class="btn g" id="hAns">${CALL}</div></div></div>
      </div></div></div>
    </div>` : `
    <div class="chatw"><div class="tb"><i></i><i></i><i></i><span>Fixit · home appliance help · my text assistant</span></div>
      <div class="chat"><div class="q">My dishwasher stopped mid-cycle. It shows E24.</div><div class="a" id="chatA">${MD2.replace(/\*\*|_/g, "")}</div></div></div>
    <div class="hright">
      <div class="hv" id="hvMaya"><div class="mecard"><div class="av">M</div><div><div class="t1">Maya, at her dishwasher</div><div class="t2">Hands wet. Can't scroll six steps.<br>She wants to call, not type.</div></div></div></div>
      <div class="hv" id="hvBuild"><div class="buildc"><h3>A phone version, built by hand</h3><div class="sm">A second product to build and run:</div>
        <div class="it">Speech in and out</div><div class="it">Phone numbers and calls</div><div class="it">Turn-taking and interruptions</div><div class="it">Answers rewritten for the ear</div>
        <div class="weeks" id="weeks">Week 1</div></div></div>
      <div class="hv" id="hvPhone"><div class="hphone"><div class="scr"><div class="sbar"><span>6:12</span><span>●●● 5G</span></div>${readScreen(MD2)}</div></div></div>
    </div>`;

  // ---------- code typed in demo 2 ----------
  const CODE = [
    ['<span class="k">from</span> agentline <span class="k">import</span> Voice', "from agentline import Voice"],
    ["", ""],
    ['<span class="c"># my existing agent, unchanged</span>', "# my existing agent, unchanged"],
    ['voice = <span class="f">Voice</span>(agent=fixit_agent)', "voice = Voice(agent=fixit_agent)"],
    ['voice.<span class="f">publish</span>(phone=<span class="k">True</span>)', "voice.publish(phone=True)"],
  ];
  const codeLen = CODE.reduce((a, c) => a + c[1].length, 0);

  // ---------- behind-the-scenes feed ----------
  const AL = P;
  const LOG = Array.from({ length: 40 }, (_, i) => {
    const pool = ["PASS tests/cart/test_totals.py::test_sum", "PASS tests/api/test_orders.py::test_create", "PASS tests/auth/test_login.py::test_token_refresh",
      "FAIL tests/checkout/test_checkout.py::test_checkout_currency", "PASS tests/search/test_rank.py::test_sort_by_price", "  AssertionError: expected 19.99, got 19.98",
      "PASS tests/payments/test_cards.py::test_decline", "FAIL tests/checkout/test_checkout.py::test_checkout_tax_rounding", "PASS tests/users/test_profile.py::test_update"];
    return pool[(i * 7) % pool.length];
  }).join("\n");
  const FEED = isD1 ? [
    { at: "ask_agent", cls: "out", h: `${AL} → Claude Code`, b: "Get the results of last night's test run." },
    { at: "agent_log", cls: "in term2", h: `Claude Code → ${AL} · 1,840 lines`, log: true },
    { at: "compress", cls: "stat", b: "1,840 lines → 3 spoken sentences", s: "Kept short for a phone call. Ends with a question." },
    { at: "task", cls: "out", h: `${AL} → Claude Code · new task`, b: "Fix the 2 failing checkout tests. Open a pull request.", pin: "Rule from the call: do not merge" },
    { at: "hangup", cls: "sys", b: "Call ended. Claude Code keeps working in the cloud." },
    { at: "work", cls: "in term2", h: "Claude Code · working", items: [["Reading the two failures", 0.4], ["Found a rounding bug in currency.py", 1.6], ["Fixed the rounding: both tests pass", 3.0], ["Checking other code that uses it", 4.4, "run"]] },
    { at: "question", cls: "in term2", h: `Claude Code → ${AL} · question`, b: "Refunds use the same rounding code. Fix them too? (y/n)" },
    { at: "question", dt: 0.9, cls: "dec", h: AL + " · decision", b: "This needs Vignesh. Call him now." },
    { at: "approve", cls: "out", h: `${AL} → Claude Code`, b: "y. Fix refunds too." },
    { at: "approve", dt: 0.5, cls: "in term2", h: "Claude Code · working", items: [["Fixed refunds", 0.3], ["214 of 214 tests pass", 1.4], ["Opened pull request #482 (not merged)", 2.6]] },
    { at: "sms", cls: "sys", b: "Texted the pull request link to Vignesh." },
  ] : [
    { at: "lookup", cls: "out", h: `${AL} → Fixit assistant`, b: "Customer: dishwasher stopped mid-cycle, error E24." },
    { at: "answer_text", cls: "in", h: "Fixit assistant → " + AL + " · text answer", txt: "E24 is a drain error. 1. Turn off the dishwasher. 2. Remove the bottom rack. 3. Twist the filter counterclockwise and lift it out. 4. Rinse the filter. 5. Refit it and run a rinse cycle. 6. If E24 comes back, book a technician." },
    { at: "onestep", cls: "stat", b: "6 steps at once → spoken one step at a time", s: "Asks a question first, then waits for the caller after each step.", dots: true },
    { at: "warranty", cls: "out", h: `${AL} → Fixit assistant · check_warranty`, b: "Covered until March 2027." },
    { at: "hangup", cls: "sys", b: "Call ended. Fixed on the call, no technician needed." },
  ];

  // ---------- DOM ----------
  const OV = [
    ["listens", "Listens", "Understands you, even mid-sentence."],
    ["short", "Keeps it short", isD1 ? "1,840 lines of output become three sentences." : "Six steps become one at a time."],
    ["asks", "Asks before it acts", "Decisions come to you. No guessing."],
    ["calls back", "Calls back", "When the work is done, or when it's stuck."],
  ];
  const st = $("#stage");
  st.innerHTML = `
  <div id="top"><div class="wm">${LOGO(28)}<span>${P}</span></div><div class="tag">${C.illustrative_tag}</div></div>
  <div id="exTag"></div>
  <div id="sub"><div class="box"><div class="who"></div><div class="txt"></div></div></div>
  <div class="scene" id="s-hook">${hookHTML}</div>
  <div class="scene" id="s-title">
    <div class="big">${LOGO(96)}${P}</div>
    <div class="tagline">${C.tagline}</div>
    <div class="sub2">${C.subtag}</div>
    ${lined("You", "Any text agent")}
  </div>
  <div class="scene" id="s-overview">
    <h2>How ${P} works</h2>
    ${lined(isD1 ? "Me" : "Customers", isD1 ? "Claude Code" : "My text agent")}
    <div class="ovc">${OV.map(o => `<div data-w="${o[0]}"><i>${o[1] === "Listens" ? "1" : o[1] === "Keeps it short" ? "2" : o[1] === "Asks before it acts" ? "3" : "4"}</i><b>${o[1]}</b><span>${o[2]}</span></div>`).join("")}</div>
  </div>
  <div class="scene" id="s-setup">
    <div class="L"><div class="plab" style="top:160px">My text assistant</div>
      <div class="win" id="chatWin"><div class="tb"><i></i><i></i><i></i><span>Fixit · home appliance help</span></div>
        <div class="chat"><div class="q">My dishwasher shows E24</div><div class="a">${MD2.replace(/\*\*|_/g, "")}</div></div></div>
      <div class="win" id="codeWin" style="top:260px"><div class="tb"><i></i><i></i><i></i><span>fixit/app.py</span></div><div class="code mono" id="code"></div></div>
    </div>
    <div class="R"><div class="plab" style="top:160px">${P} setup</div>
      <div class="setlist">
        <div class="row"><div class="ck">✓</div><div>Connected to my agent<small>No changes to its code</small></div></div>
        <div class="row"><div class="ck">✓</div><div>Read what it can do<div class="tools"><span>lookup_manual</span><span>check_warranty</span><span>book_technician</span></div></div></div>
        <div class="row"><div class="ck">✓</div><div>Voice set up<small>Friendly, short answers, one step at a time</small></div></div>
        <div class="row"><div class="ck">✓</div><div>Phone number<small style="font-size:30px;color:#fff;font-weight:700">${NUM}</small></div></div>
        <div class="live"><i></i>Live: anyone can call</div>
      </div>
    </div>
  </div>
  <div class="scene" id="s-call">
    <div class="L"><div class="plab">${isD1 ? "My phone" : "Maya's phone"}</div>
      <div class="phone"><div class="scr">
        <div class="sbar"><span id="clk">9:41</span><span>●●● 5G</span></div>
        <div class="pv home" id="pvHome"><div class="card"><div class="k">${isD1 ? "Contact" : "Fixit appliance help"}</div><div class="v">${AGENT}</div><div class="p">${NUM}</div></div>
          <div class="btns" style="gap:0"><div class="btn g">${CALL}</div></div></div>
        <div class="pv" id="pvCall"><div class="av">${AGENT[0]}</div><div class="nm">${AGENT}</div><div class="st" id="callSt">Calling…</div>
          <div class="orb" id="orb"></div><div class="btns"><div class="btn r" style="transform:rotate(135deg)">${CALL}</div></div></div>
        <div class="pv" id="pvEnd"><div class="av">${AGENT[0]}</div><div class="nm">${AGENT}</div><div class="st" id="endSt">Call ended</div></div>
        <div class="pv" id="pvIn"><div class="av">${AGENT[0]}</div><div class="nm">${AGENT}</div><div class="st">calling via ${P}</div>
          <div class="btns"><div class="btn r" style="transform:rotate(135deg)">${CALL}</div><div class="btn g" id="ansBtn">${CALL}</div></div></div>
        <div class="notif" id="notif"><b>MESSAGES · Claude Code via ${P}</b>Pull request #482 is open: "Fix currency rounding in checkout and refunds". 214 of 214 tests pass. Not merged.</div>
      </div></div>
      <div class="where" id="where"></div>
    </div>
    <div class="R"><div class="plab">Behind the scenes</div>
      <div class="chain">
        <div class="n">${isD1 ? "Me" : "Maya"}<small>on the phone</small></div><div class="lk" id="lk1"><b></b><em>voice</em></div>
        <div class="n al">${P}<small>the voice</small></div><div class="lk" id="lk2"><b></b><em>text</em></div>
        <div class="n">${isD1 ? "Claude Code" : "Fixit assistant"}<small>${isD1 ? "running in the cloud" : "text agent, unchanged"}</small></div>
      </div>
      <div class="feed" id="feed"></div>
    </div>
  </div>
  <div class="scene" id="s-end">
    <div class="big">${LOGO(96)}${P}</div>
    <div class="tagline">${C.tagline}</div>
    <div class="sub2">${C.subtag}</div>
    ${lined("You", isD1 ? "Claude Code, or any agent" : "Any text agent")}
    <div class="endsub">${isD1 ? "Call your agents. Let them call you." : "Three lines of code. Your agent stays the same."}</div>
    <div class="small">${C.small_print}</div>
  </div>`;

  const feed = $("#feed");
  FEED.forEach(f => {
    const wrap = document.createElement("div"); wrap.className = "fi";
    let inner = `<div class="fc ${f.cls}">${f.h ? `<div class="h">${f.h}</div>` : ""}`;
    if (f.b) inner += `<div class="b">${f.b}</div>`;
    if (f.s) inner += `<div class="s">${f.s}</div>`;
    if (f.log) inner += `<div class="log mono">${LOG}</div>`;
    if (f.txt) inner += `<div class="txtans">${f.txt}</div>`;
    if (f.pin) inner += `<div class="pin">${f.pin}</div>`;
    if (f.items) inner += `<div class="items">${f.items.map(i => `<div>${i[0]}</div>`).join("")}</div>`;
    if (f.dots) inner += `<div class="dots">${["Water?", "Off", "Rack", "Filter", "Rinse", "Run"].map(s => `<span>${s}</span>`).join("")}</div>`;
    wrap.innerHTML = inner + "</div>";
    feed.appendChild(wrap);
    f.el = wrap; f.t0 = cue(f.at) + (f.dt || 0);
  });
  const heights = () => FEED.forEach(f => { f.h0 = f.el.firstChild.offsetHeight; });
  const robot = TL.lines.find(l => l.role === "robot");
  let measured = false;

  // ---------- render ----------
  function render(t) {
    window.__t = t;
    if (!measured) { $$(".scene").forEach(s => s.style.display = ""); $("#s-call").style.opacity = 1; heights(); measured = true; }
    const sc = sceneAt(t), callScene = isD1 ? "call1" : "call2";
    const vis = { hook: sc === "hook", title: sc === "title", overview: sc === "overview", setup: sc === "setup", call: sc === callScene, end: sc === "end" };
    for (const k in vis) show($("#s-" + k), vis[k] ? fade(t, scene(k === "call" ? callScene : k)) : 0);
    const dark = sc === "title" || sc === "end" || sc === "overview", split = sc === callScene || sc === "setup";
    $("#top").className = dark ? "dark" : "light";
    $("#top .wm").style.opacity = (sc === "title" || sc === "end") ? 0 : 1;
    $("#top .wm span").style.color = sc === "overview" ? "#E9EEF4" : "var(--ink)";
    $("#top .tag").style.color = (dark || split) ? "#E9EEF4" : "var(--ink)";

    const exStart = isD1 ? scene("call1") : scene("setup");
    $("#exTag").textContent = isD1 ? "Example 1: I call my Claude Code" : "Example 2: a developer gives a text assistant a voice";
    $("#exTag").style.opacity = clamp(fade(t, exStart + .3) - fade(t, exStart + 7.5, .6));

    const ln = TL.lines.find(l => t >= l.start && t < l.start + l.dur + .2);
    const sub = $("#sub");
    if (ln && sc !== "title" && sc !== "end") {
      sub.style.opacity = 1; $(".who", sub).textContent = ln.who;
      $(".txt", sub).textContent = ln.full > ln.dur + .05 ? ln.text.slice(0, Math.round(ln.text.length * clamp((t - ln.start) / ln.full))).replace(/\s\S*$/, "") + "…" : ln.text;
      $(".who", sub).style.color = ln.role === "vignesh" || ln.role === "maya" ? "#F2C27A" : ln.role === "narrator" ? "#C9D3E0" : ln.role === "robot" ? "#AAB4C0" : "#A8EBCB";
    } else sub.style.opacity = 0;

    if (vis.hook) renderHook(t);
    if (vis.title || vis.end) renderLined(t, vis.title ? "#s-title" : "#s-end", scene(vis.title ? "title" : "end"));
    if (vis.overview) { renderLined(t, "#s-overview", scene("overview")); $$(".ovc div").forEach(d => d.classList.toggle("on", t >= W("ov_01", d.dataset.w))); }
    if (vis.setup) renderSetup(t);
    if (vis.call) renderCall(t);
  }

  function renderLined(t, root, s0) {
    const el = $(root + " .lined"); el.style.opacity = fade(t, s0 + .6, .5);
    $$(".seg b", el).forEach((b, i) => { b.style.left = (((t - s0) * 0.7 + i * .5) % 1) * 100 + "%"; b.style.opacity = t > s0 + 1 ? 1 : 0; });
  }

  function tokens(el, line, cut) {
    const toks = $$(".tok", el), p = clamp((t0 => (t0 - line.start) / line.full)(window.__t));
    const n = Math.floor(p * toks.length * 1.05);
    toks.forEach((tk, i) => { tk.className = "tok" + (window.__t < line.start ? "" : i < n ? " done" : i === n && window.__t < cut ? " on" : ""); });
    const reading = window.__t >= line.start && window.__t < cut;
    $$(".bars b", el).forEach((b, i) => { b.style.height = (reading ? 8 + 34 * Math.abs(Math.sin(window.__t * 9 + i * 1.7)) * (0.5 + 0.5 * Math.sin(window.__t * 3.1 + i)) : 6) + "px"; });
    $(".x", el).style.opacity = fade(window.__t, cut, .3);
  }

  function renderHook(t) {
    const h1 = cue("h1"), h2 = cue("h2"), h3 = cue("h3"), h4 = cue("h4"), cut = cue("read_cut");
    if (isD1) {
      $("#termBody").innerHTML = TERM.filter(r => t >= cue(r[0]) + r[1]).map(r => r[2]).join("\n").replace('<span class="cur">▌</span>', Math.floor(t * 2) % 2 ? "▌" : " ");
      const b = $("#tbadge"), clk = $("#bigclock");
      const waitT0 = h2 + 1.6, waitEnd = h3;
      if (t < waitT0) { b.className = "tbadge ok"; b.textContent = "Working · 2 h " + (14 + Math.floor(clamp((t - h1) / 6) * 3)) + " min"; clk.style.opacity = 0; }
      else if (t < h4 + 1.2) {
        const w = clamp((t - waitT0) / (waitEnd - waitT0)); const mins = ease(w) * 47.2;
        b.className = "tbadge warn"; b.textContent = "Waiting for you"; clk.style.opacity = fade(t, waitT0, .3) * (1 - fade(t, h4 + .8, .4));
        clk.innerHTML = `Waiting for you: ${Math.floor(mins)} min <span>The agent can't continue without an answer.</span>`;
      } else { b.className = "tbadge ok"; b.textContent = "Calling you via " + P; clk.style.opacity = 0; }
      show($("#hvMe"), 1 - fade(t, h3, .35));
      const away = t >= h2 + .3; $("#mecard").classList.toggle("away", away);
      $("#meT1").textContent = away ? "Me, away from my desk" : "Me, at my desk"; $("#meT2").textContent = away ? "Walking, driving, in a meeting" : "Watching the agent work";
      show($("#hvPhone"), fade(t, h3, .4));
      const rd = $("#hRead"); rd.style.opacity = 1 - fade(t, h4 + .6, .35); tokens(rd, robot, cut);
      $("#hCall").style.opacity = fade(t, h4 + .6, .35);
      $("#hAns").style.transform = `scale(${1 + .08 * Math.sin(t * 8)})`;
      const hl = $("#hline"); hl.style.opacity = fade(t, h4 + 1.0, .5);
      $(".bar", hl).style.background = `linear-gradient(90deg, #3FD39A ${((t * 80) % 100)}%, #A8EBCB ${((t * 80) % 100) + 8}%, #3FD39A ${((t * 80) % 100) + 16}%)`;
    } else {
      $(".chatw").style.opacity = fade(t, h1, .4);
      $("#chatA").style.background = t >= h2 ? "#FDF1DC" : "";
      show($("#hvMaya"), fade(t, h2, .4) * (1 - fade(t, h3, .35)));
      show($("#hvBuild"), fade(t, h3, .4) * (1 - fade(t, h4, .35)));
      const its = $$("#hvBuild .it"), l3 = L("h2_03");
      its.forEach((it, i) => it.style.opacity = fade(t, l3.start + .6 + i * (l3.dur * .55 / 4), .3));
      const wk = 1 + Math.floor(clamp((t - l3.start - .4) / (l3.dur * .9)) * 5);
      $("#weeks").innerHTML = `Week ${wk}<span>and counting</span>`;
      show($("#hvPhone"), fade(t, h4, .4));
      tokens($("#hvPhone"), robot, cut);
    }
  }
  function renderSetup(t) {
    const c0 = cue("code"), cn = cue("connect");
    show($("#chatWin"), 1 - fade(t, c0 + .2));
    show($("#codeWin"), fade(t, c0 + .2));
    // type the code over ~3.6 s
    let n = Math.floor(clamp((t - c0 - .6) / 3.6) * codeLen), html = [];
    for (const [h, raw] of CODE) {
      if (n >= raw.length) { html.push(h); n -= raw.length; }
      else { html.push(raw.slice(0, n).replace(/</g, "&lt;") + '<span class="cursor"></span>'); n = -1; break; }
      if (n === 0 && html.length < CODE.length) { /* line done */ }
    }
    if (n >= 0) html[html.length - 1] += (Math.floor(t * 2) % 2 ? '<span class="cursor"></span>' : "");
    $("#code").innerHTML = html.join("\n");
    $$(".setlist .row").forEach((r, i) => { const o = fade(t, cn + i * .7, .35); r.style.opacity = o; r.style.transform = `translateX(${(1 - o) * 30}px)`; });
    $(".live").style.opacity = fade(t, cn + 2.9, .4);
  }

  function renderCall(t) {
    const dial = cue("dial"), con = cue("connected"), hang = cue("hangup"), inc = cue("incoming"), ans = cue("answered"), hang2 = cue("hangup2");
    // which phone view
    let view = "home";
    if (t >= dial) view = "call";
    if (t >= hang) view = "end";
    if (t >= inc) view = "in";
    if (t >= ans) view = "call";
    if (t >= hang2) view = "end";
    const vt = { home: 0, call: t >= ans ? ans : dial, end: t >= hang2 ? hang2 : hang, in: inc }[view];
    ["home", "call", "end", "in"].forEach(v => show($("#pv" + v[0].toUpperCase() + v.slice(1)), v === view ? fade(t, vt, .3) : 0));
    const live0 = t >= ans ? ans : con;
    $("#callSt").textContent = t < con ? "Calling…" : mmss(t - live0);
    $("#endSt").textContent = "Call ended · " + mmss((t >= hang2 ? hang2 - ans : hang - con));
    $("#ansBtn").style.transform = `scale(${1 + .08 * Math.sin(t * 8)})`;
    // orb pulses with whoever speaks on the phone
    const ln = TL.lines.find(l => l.phone && t >= l.start && t < l.start + l.dur);
    const amp = ln ? .5 + .5 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 2.9 + 1)) : 0;
    const human = ln && (ln.role === "vignesh" || ln.role === "maya");
    const orb = $("#orb");
    orb.style.transform = `scale(${1 + .12 * amp})`;
    orb.style.background = human ? "radial-gradient(circle at 40% 35%, #F2C27A, #D9932B 60%, #9A6418)" : "";
    orb.style.boxShadow = `0 0 0 ${18 * amp}px ${human ? "rgba(217,147,43,.25)" : "rgba(123,127,232,.28)"}`;
    // phone clock: time passes while the agent works
    $("#clk").textContent = isD1 ? (t >= cue("question") ? "9:48" : t >= cue("work") + 1.5 ? "9:45" : "9:41") : "6:12";
    if (isD1) show($("#notif"), fade(t, cue("sms"), .35));
    else $("#notif").style.display = "none";
    const where = isD1 ? (t >= hang && t < inc ? "I'm still walking. The agent is still working." : "") : (t < hang ? "Maya is at home, hands busy." : "");
    $("#where").textContent = where;

    // link activity in the chain
    const pulse = (el, on, ph) => { const b = $("b", el); b.style.opacity = on ? 1 : 0; b.style.left = ((t * 0.9 + ph) % 1) * 80 + "%"; };
    const humanOn = !!ln;
    const agentOn = FEED.some(f => (f.cls === "out" || f.cls === "in") && t >= f.t0 && t < f.t0 + 1.4) || (isD1 && t >= cue("work") && t < cue("question") + 1);
    pulse($("#lk1"), humanOn, 0); pulse($("#lk2"), agentOn, .4);

    // feed
    const avail = feed.clientHeight; let y = 0; const pos = [];
    FEED.forEach(f => { const g = ease((t - f.t0) / .45); const h = (f.h0 + 16) * g; pos.push([y, g]); y += h; });
    const off = Math.max(0, y - avail);
    FEED.forEach((f, i) => {
      const [yy, g] = pos[i];
      f.el.style.top = (yy - off) + "px"; f.el.style.opacity = g; f.el.style.height = (f.h0 * g) + "px";
      f.el.style.display = g <= 0 ? "none" : "";
      if (f.log) { const lg = $(".log", f.el); lg.scrollTop = 0; lg.style.transform = ""; $(".log", f.el).firstChild && ($(".log", f.el).style.textIndent = 0);
        const k = clamp((t - f.t0) / 1.2); lg.innerHTML = LOG.split("\n").slice(Math.floor(k * 30), Math.floor(k * 30) + 8).join("\n"); }
      if (f.items) $$(".items div", f.el).forEach((d, j) => { const [_, dt, kind] = f.items[j]; const on = t >= f.t0 + dt; d.className = on ? (kind === "run" ? "run" : "on") : ""; d.style.opacity = on ? 1 : 0.35; });
      if (f.dots) { const s1 = cue("step1"), s2 = cue("step2"), hu = cue("hangup");
        $$(".dots span", f.el).forEach((d, j) => {
          const cur = t >= hu ? -1 : t >= s2 ? (j >= 4) : t >= s1 ? (j >= 1 && j <= 3) : j === 0;
          const done = t >= hu ? true : t >= s2 ? j < 4 : t >= s1 ? j < 1 : false;
          d.className = cur === true ? "on" : done ? "done" : ""; }); }
    });
  }

  window.__total = TL.total;
  window.__render = render;
  if (!new URLSearchParams(location.search).has("mode")) {
    const t0 = performance.now(), q = new URLSearchParams(location.search), from = +(q.get("t") || 0);
    const loop = () => { render(from + (performance.now() - t0) / 1000); requestAnimationFrame(loop); }; loop();
  }
})();
