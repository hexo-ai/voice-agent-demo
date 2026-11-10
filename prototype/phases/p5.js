/* Phase 5 — "Improve and fine-tune" as a search over versions of the agent.
 * Mocked product behaviour (the SIA paper itself runs one sequential loop, not a tree search).
 * Right: a tree. Each box is one version of the agent, scored on the 50 simulated calls; each branch is
 * one kind of change. It visibly repeats four steps: pick a promising version, try one change, score it,
 * pass the score up (good branches get thicker and are tried more). Under the tree, an inspector shows
 * what the version being tried actually changes: a prompt diff for prompt changes; training data ->
 * training -> a new, smaller model for fine-tuning. The best path ends at 47/50 and combines both.
 * Timing: prompt changes play under narr_15, fine-tuning under narr_16.
 * Left: plain-language results, then call 23 runs again and passes. */
(function () {
  const root = document.getElementById("p5");
  const $ = id => document.getElementById(id);

  const KIND = {
    root: "Agent v1", esc: "Escalation rules", follow: "Follow-up questions", flow: "Conversation flow",
    tool: "Tool-use instructions", pace: "Pacing and tone", ft: "Fine-tune model",
  };
  // id, parent, kind, score (of 50), x centre, row, tag shown once scored
  const N = [
    [0, -1, "root", 31, 488, 0],
    [1, 0, "esc", 38, 488, 1, "Call 23 fixed"],
    [2, 0, "pace", 33, 100, 1],
    [3, 0, "tool", 35, 294, 1],
    [4, 0, "flow", 34, 876, 1],
    [5, 0, "follow", 36, 682, 1],
    [6, 1, "follow", 42, 585, 2],
    [7, 3, "pace", 36, 200, 2],
    [8, 4, "flow", 32, 876, 2],
    [9, 1, "pace", 39, 390, 2],
    [10, 6, "flow", 43, 585, 3],
    [11, 6, "tool", 41, 780, 3],
    [12, 9, "follow", 40, 195, 3],
    [13, 10, "esc", 43, 390, 4],
    [14, 10, "follow", 42, 780, 4],
    [15, 10, "ft", 46, 585, 4, "Smaller model"],
    [16, 15, "pace", 47, 585, 5, "Best version"],
    [17, 15, "tool", 45, 780, 5],
  ].map(([id, parent, kind, score, x, row, tag]) => ({ id, parent, kind, score, x, row, tag }));
  const BEST = [0, 1, 6, 10, 15, 16];
  const W = 168, H = 52, HT = 66, ROW = 82;
  const top = n => 6 + n.row * ROW;
  const hOf = n => (n.tag ? HT : H);
  const pathUp = id => { const p = []; for (let n = N[id]; n; n = N[n.parent]) p.push(n.id); return p; }; // id … root

  // what each prompt change edits (mocked agent prompt). ctx = section heading, del/add = lines.
  const DIFF = {
    1: { ctx: "## Escalation rules", del: "Transfer to the nurse if the patient reports trouble breathing.",
         add: "Transfer to the nurse for any breathing symptom, even one mentioned in passing." },
    2: { ctx: "## Voice and pace", add: "Speak a little slower than normal." },
    6: { ctx: "## Symptoms", add: "After any symptom, ask one follow-up question before moving on." },
    16: { ctx: "## Voice and pace", add: "If the caller asks you to repeat, slow down and use shorter sentences.", onFt: true },
  };
  const TYPE = n => (n.kind === "ft" ? "fine-tuning" : "prompt change");

  // two groups of rounds: prompt changes under narr_15, fine-tuning under narr_16. weight = share of time.
  // optional f = where the sub-steps start inside a round: [try, score, pass up] as fractions (pick starts at 0)
  const A = [[1, 1.05], [2, 0.75], [6, 1.0], ...[3, 5, 4, 9, 7, 10, 8, 11, 12, 13, 14].map(id => [id, 0.13])];
  const B = [["stall", 0.11], [15, 0.56, [0.06, 0.74, 0.9]], [17, 0.08], [16, 0.25]];

  const CHANGES = [
    [1, "Transfers any breathing symptom to the nurse, even one mentioned in passing"],
    [6, "Asks one follow-up question before moving on"],
    [10, "Asks for date of birth only once"],
    [15, "Fine-tuned on 1,240 corrected call turns: spots symptoms described indirectly"],
    [16, "Speaks slower for hard-of-hearing callers"],
  ];
  $("p5-changes").innerHTML = CHANGES.map(([, c]) => `<li>${c}</li>`).join("");
  const changeEls = [...$("p5-changes").children];
  const stepEls = [...$("p5-steps").children];

  const TURNS = [["patient_01_replay", "Robert"], ["agent_03", "Agent"]].filter(([u]) => U.has(u));
  const RERUN = TURNS[0][0];
  $("p5-turns").innerHTML = TURNS.map(([u, who]) => `<div class="turn"><span class="sp">${who}</span><span class="tx">${U.line(u).text}</span></div>`).join("");
  const turnEls = [...$("p5-turns").children];

  const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const lerp = (a, b, f) => a + (b - a) * f;

  // lay out one group of rounds inside [t0, t1]
  const layout = (group, t0, t1) => {
    const tot = group.reduce((s, e) => s + e[1], 0);
    let c = t0;
    return group.map(([id, w, f]) => {
      const ta = c; c += (w / tot) * (t1 - t0);
      const d = c - ta, fr = f || [0.25, 0.5, 0.75];
      return { id, ta, tb: c, tTry: ta + d * fr[0], tScore: ta + d * fr[1], tUp: ta + d * fr[2] };
    });
  };

  U.stepCard(3, U.end("narr_07") + 2.0 + 0.1);
  SCENES.add({
    render(t) {
      const a = U.end("narr_07") + 2.0, b = U.end("sys_07") + 2.5;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 3;
      CHROME.subLeft = true; // subtitles over the expert side, so the inspector stays readable

      // ---- schedule ----
      const hasB = U.has("narr_16");
      const A0 = U.start("narr_15") - 0.2;
      const A1 = hasB ? U.start("narr_16") - 0.15 : U.at("narr_15", 0.6);
      const B0 = A1, B1 = hasB ? U.end("narr_16") + 0.5 : U.end("narr_15") + 1.5;
      const ev = [...layout(A, A0, A1), ...layout(B, B0, B1)];
      const evOf = Object.fromEntries(ev.filter(e => e.id !== "stall").map(e => [e.id, e]));
      const stall = ev.find(e => e.id === "stall");
      const scoredAt = id => (id === 0 ? -1e9 : evOf[id].tUp);
      const shownAt = id => (id === 0 ? -1e9 : evOf[id].tTry);
      const bestA = B1, bestB = B1 + 1.0;            // best path lights quickly
      const bestP = U.prog(t, bestA, bestB);
      const S1 = U.start(RERUN) - 0.6;
      CHROME.clock = 31 * 60 + U.prog(t, a, S1) * 130 * 60 + Math.max(0, t - S1) * 3;

      // current round and its sub-step (0 pick, 1 try, 2 score, 3 pass up)
      const cur = ev.find(e => e.id !== "stall" && t >= e.ta && t < e.tb);
      const sub = !cur ? -1 : t < cur.tTry ? 0 : t < cur.tScore ? 1 : t < cur.tUp ? 2 : 3;
      stepEls.forEach((li, i) => U.cls(li, "on", sub === i));

      const visits = N.map(() => 0);
      ev.forEach(e => { if (e.id !== "stall" && t >= e.tb) pathUp(e.id).forEach(id => visits[id]++); });

      let g = "";
      const edge = (n, col, w, op = 1) => {
        const p = N[n.parent];
        const x1 = p.x, y1 = top(p) + hOf(p), x2 = n.x, y2 = top(n);
        const my = (y1 + y2) / 2;
        return `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none" stroke="${col}" stroke-width="${w.toFixed(2)}" opacity="${op}" stroke-linecap="round"/>`;
      };
      const shown = n => t >= shownAt(n.id);
      const nodeOp = n => (n.id === 0 ? 1 : U.prog(t, shownAt(n.id), shownAt(n.id) + 0.25));
      const dim = n => (bestP > 0 && !BEST.includes(n.id) ? lerp(1, 0.45, Math.min(1, bestP * 2)) : 1);

      N.forEach(n => {
        if (n.id === 0) return;
        if (!shown(n)) { if (n.row === 1) g += edge(n, "#2A3B50", 1.2, 0.6); return; }
        const w = 1.0 + 1.7 * Math.sqrt(Math.max(1, visits[n.id]));
        g += edge(n, "#3A4C63", w, (nodeOp(n) * dim(n)).toFixed(3));
      });
      if (cur && sub === 0) pathUp(N[cur.id].parent).slice(0, -1).forEach(id => { g += edge(N[id], "#A9ABF0", 3.5, 0.9); });
      if (bestP > 0) {
        BEST.slice(1).forEach((id, i) => {
          const f = U.prog(bestP, i / 5, (i + 1) / 5);
          if (f > 0) g += edge(N[id], "#7B7FE8", 6, f.toFixed(3));
        });
      }

      N.forEach(n => {
        const x = n.x - W / 2, y = top(n), h = hOf(n);
        if (!shown(n)) {
          if (n.row === 1) {
            g += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="10" fill="none" stroke="#2A3B50" stroke-dasharray="5 5"/>`;
            g += `<text x="${n.x}" y="${y + 31}" text-anchor="middle" font-size="14" fill="#5E6E82">${KIND[n.kind]}</text>`;
          }
          return;
        }
        const e = evOf[n.id], par = N[n.parent];
        const sF = n.id === 0 ? 1 : U.prog(t, e.tScore, e.tUp);
        const scored = sF >= 1;
        const better = n.id === 0 || n.score > par.score;
        const onBest = bestP > 0 && BEST.includes(n.id) && bestP >= Math.max(0, BEST.indexOf(n.id) - 0.5) / 5;
        const picked = cur && sub === 0 && n.id === N[cur.id].parent;
        const trying = cur && cur.id === n.id && sub >= 1 && sub <= 2;
        let fill = n.kind === "ft" ? "#272B63" : "#1E2B3B";
        let stroke = "#2A3B50", sw = 1.5;
        if (scored && n.id !== 0) stroke = better ? "#3FB68B" : "#3A4C63";
        if (trying) { stroke = "#A9ABF0"; sw = 2.5; }
        if (picked) { stroke = "#A9ABF0"; sw = 3; }
        if (onBest) { stroke = "#7B7FE8"; sw = 3; fill = n.kind === "ft" ? "#30358A" : "#262F5C"; }
        const op = (nodeOp(n) * dim(n) * (scored && !better && !onBest && n.id !== 0 ? 0.75 : 1)).toFixed(3);
        g += `<g opacity="${op}">`;
        g += `<rect x="${x}" y="${y}" width="${W}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        if (n.kind === "ft") g += `<rect x="${x + 4}" y="${y + 4}" width="${W - 8}" height="${h - 8}" rx="7" fill="none" stroke="#9EA2F2" stroke-width="1.2" opacity="0.8"/>`;
        g += `<text x="${n.x}" y="${y + 19}" text-anchor="middle" font-size="14" fill="#D6DEE8">${KIND[n.kind]}</text>`;
        const shownScore = n.id === 0 ? n.score : Math.round(lerp(par.score, n.score, sF));
        g += `<text x="${n.x}" y="${y + 41}" text-anchor="middle" font-size="20" font-weight="700" fill="#fff">${sF > 0 ? `${shownScore}/50` : "…"}</text>`;
        if (n.id !== 0 && sF > 0) {
          const bw = (W - 24) * (shownScore / 50) * Math.min(1, sF * 1.2);
          g += `<rect x="${x + 12}" y="${y + 46}" width="${W - 24}" height="3" rx="1.5" fill="#2A3B50"/>`;
          g += `<rect x="${x + 12}" y="${y + 46}" width="${bw.toFixed(1)}" height="3" rx="1.5" fill="${!scored ? "#A9ABF0" : better ? "#3FB68B" : "#7D8DA1"}"/>`;
        }
        if (n.tag && scored && (n.id !== 16 || bestP >= 0.9)) {
          g += `<text x="${n.x}" y="${y + 61}" text-anchor="middle" font-size="12" font-weight="700" fill="${n.kind === "ft" ? "#C3C8F5" : "#7FE0B8"}">${esc(n.tag)}</text>`;
        }
        g += `</g>`;
      });

      // pass the score up: a pulse travels from the new version to the root
      if (cur && sub === 3) {
        const f = U.prog(t, cur.tUp, cur.tb);
        const p = pathUp(cur.id);
        const segs = p.length - 1, k = Math.min(segs - 1, Math.floor(f * segs)), ff = f * segs - k;
        const n = N[p[k]], q = N[p[k + 1]];
        const x = lerp(n.x, q.x, ff), y = lerp(top(n), top(q) + hOf(q), ff);
        g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#A9ABF0"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="#A9ABF0" opacity="0.25"/>`;
      }

      const so = U.prog(t, stall.ta, stall.ta + 0.3) * (bestP > 0 ? lerp(1, 0.4, Math.min(1, bestP * 2)) : 1);
      if (so > 0) {
        const n10 = N[10], y = top(n10) + 18;
        g += `<g opacity="${so.toFixed(3)}"><text x="490" y="${y}" text-anchor="end" font-size="15" font-weight="700" fill="#E8B04A">Prompt changes</text>`;
        g += `<text x="490" y="${y + 19}" text-anchor="end" font-size="15" font-weight="700" fill="#E8B04A">stopped helping</text>`;
        g += `<path d="M496,${y + 4} L${n10.x - W / 2 - 6},${y + 4}" stroke="#E8B04A" stroke-width="1.5" stroke-dasharray="3 3"/></g>`;
      }
      U.html($("p5-tree"), g);

      // ---- inspector: what the version being tried changes ----
      const scoreHtml = id => {
        const n = N[id], e = evOf[id], par = N[n.parent];
        const sF = U.prog(t, e.tScore, e.tUp);
        if (sF <= 0) return `<span class="i-sc" style="font-weight:400;color:#9AA8B8">${t >= e.tTry ? "" : ""}</span>`;
        const v = Math.round(lerp(par.score, n.score, sF)), d = n.score - par.score;
        return `<span class="i-sc">${v}/50${sF >= 1 ? `<span class="${d > 0 ? "i-up" : "i-dn"}">${d > 0 ? "▲ +" + d : d === 0 ? "no gain" : "▼ " + d}</span>` : ""}</span>`;
      };
      let ins = "";
      const focus = [...ev].reverse().find(e => t >= e.ta);
      if (bestP > 0) {
        const f = U.prog(t, bestA + 0.2, bestA + 0.6);
        ins = `<div style="opacity:${f.toFixed(3)}"><div class="i-h"><span class="i-pill">BEST VERSION</span><b>Prompt changes + a fine-tuned model</b><span class="i-sc">47/50 <span class="i-up">94%</span></span></div>
          <div class="i-both"><div class="i-box"><div class="i-t">4 PROMPT CHANGES</div><div>Escalation: any breathing symptom goes to the nurse</div><div>Follow-up: one question after any symptom</div><div>Flow: date of birth once</div><div>Pace: slower when asked to repeat</div></div>
          <div class="i-box"><div class="i-t">FINE-TUNED MODEL</div><div>Learned from 1,240 corrected call turns</div><div>Spots symptoms described indirectly</div><div class="i-chip">Smaller model · $0.19 per call</div></div></div></div>`;
      } else if (!focus) {
        ins = `<div class="i-h"><span class="i-pill i-mute">START</span><b>Agent v1</b><span class="i-sc">31/50</span></div><div class="i-warn" style="color:#9AA8B8">Each new version changes one thing: its prompt, or the model itself.</div>`;
      } else if (focus.id === "stall") {
        ins = `<div class="i-h"><span class="i-pill i-mute">STUCK AT 43/50</span><b>Prompt changes stopped helping</b></div>
          <div class="i-warn">Some rules are hard to write down as a prompt, like spotting symptoms people describe indirectly. Next move: fine-tune the model on corrected calls.</div>`;
      } else if (N[focus.id].kind === "ft") {
        const e = focus, tp = U.prog(t, e.tTry, e.tScore);
        const dataOp = U.prog(tp, 0, 0.12), trainF = U.prog(tp, 0.18, 0.85), modelOp = U.prog(tp, 0.85, 1);
        ins = `<div class="i-h"><span class="i-pill i-ft">FINE-TUNING</span><b>Trains the model on corrected calls</b>${scoreHtml(15)}</div>
          <div class="i-ftrow">
            <div class="i-box" style="opacity:${dataOp.toFixed(3)}"><div class="i-t">TRAINING DATA · 1,240 CORRECTED TURNS</div><div class="i-q">Patient: “I sleep propped up on pillows now.”</div><div class="i-a">Agent should: ask about breathing, then transfer to the nurse.</div></div>
            <div class="i-arrow" style="opacity:${dataOp.toFixed(3)}">→</div>
            <div class="i-box" style="opacity:${U.prog(tp, 0.12, 0.2).toFixed(3)}"><div class="i-t">TRAINING</div><div>${trainF >= 1 ? "Done" : "Updating the model…"}</div><div class="i-bar"><i style="width:${(trainF * 100).toFixed(1)}%"></i></div><div>${Math.round(trainF * 1240).toLocaleString("en-US")} / 1,240 turns</div></div>
            <div class="i-arrow" style="opacity:${modelOp.toFixed(3)}">→</div>
            <div class="i-box" style="opacity:${modelOp.toFixed(3)}"><div class="i-t">NEW MODEL</div><div class="i-chip">Agent model v2</div><div style="margin-top:8px">Smaller · $0.19 per call</div></div>
          </div>`;
      } else if (DIFF[focus.id]) {
        const d = DIFF[focus.id], e = focus;
        const lineOp = U.prog(t, e.tTry, e.tTry + 0.3);
        ins = `<div class="i-h"><span class="i-pill">PROMPT CHANGE</span><b>${KIND[N[focus.id].kind]}</b>${d.onFt ? `<span style="color:#9AA8B8;font-size:16px">on the fine-tuned model</span>` : ""}${scoreHtml(focus.id)}</div>
          <div class="i-code"><div class="i-ctx">${esc(d.ctx)}</div>${d.del ? `<div class="i-del">− ${esc(d.del)}</div>` : ""}<div class="i-add" style="opacity:${lineOp.toFixed(3)}">+ ${esc(d.add)}</div>${d.del ? "" : `<div class="i-ctx">…</div>`}</div>`;
      } else {
        // fast rounds: a ticker of the latest tries
        const done = ev.filter(e => e.id !== "stall" && !DIFF[e.id] && N[e.id].kind !== "ft" && t >= e.ta).slice(-4).reverse();
        ins = `<div class="i-h"><span class="i-pill">PROMPT CHANGES</span><b>Many quick tries</b></div><div class="i-tick">` +
          done.map(e => { const n = N[e.id], par = N[n.parent], ok = t >= e.tUp;
            return `<div><span class="i-k">${KIND[n.kind]}</span><span style="color:#9AA8B8">${TYPE(n)}</span><span class="i-s" style="color:${!ok ? "#A9ABF0" : n.score > par.score ? "#3FB68B" : "#9AA8B8"}">${ok ? n.score + "/50" : "scoring…"}</span></div>`; }).join("") + `</div>`;
      }
      U.html($("p5-insp"), ins);

      // ---- left: plain results ----
      const tried = N.filter(n => n.id !== 0 && t >= shownAt(n.id)).length;
      const best = Math.max(...N.filter(n => t >= scoredAt(n.id)).map(n => n.score));
      U.html($("p5-tried"), String(1 + tried));
      U.html($("p5-best"), `${best}<small>of 50</small>`);
      U.cls($("p5-best").parentElement, "good", best >= 47);
      const ftF = U.prog(t, evOf[15].tScore, evOf[15].tUp);
      U.html($("p5-cost"), "$" + lerp(0.41, 0.19, ftF).toFixed(2) + (ftF >= 1 ? "<small>smaller model</small>" : ""));
      U.cls($("p5-cost").parentElement, "good", ftF >= 1);
      U.text($("p5-sub"), bestP >= 1 ? "Best path: 31 → 47 of 50 (94%)" : t >= A0 ? "Repeats four steps:" : "Starts from your agent, version 1");

      changeEls.forEach((li, i) => {
        const at = scoredAt(CHANGES[i][0]);
        U.css(li, { opacity: U.prog(t, at, at + 0.35).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, at, at + 0.4))) * 10}px)` });
      });

      const rpA = U.start(RERUN) - 0.6;
      U.css($("p5-replay"), { opacity: U.prog(t, rpA, rpA + 0.4).toFixed(3) });
      TURNS.forEach(([u], i) => {
        const l = U.line(u), el = turnEls[i];
        U.cls(el, "now", t >= l.start && t < l.start + l.dur);
        U.cls(el, "done", t >= l.start + l.dur);
        U.css(el, { opacity: t >= l.start - 0.2 ? 1 : 0.25 });
      });
      const passed = t >= U.end("agent_03") + 0.1;
      U.cls(turnEls[turnEls.length - 1], "good", passed);
      const badge = $("p5-badge");
      U.text(badge, passed ? "Passed" : "Running");
      U.cls(badge, "pass", passed); U.cls(badge, "run", !passed);

      U.voiceBar($("p5-vbar"), t, ["sys_07"]);
    },
  });
})();
