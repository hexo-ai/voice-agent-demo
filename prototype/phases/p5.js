/* Phase 5 — "Improve and fine-tune" as a search over versions of the agent.
 * Mocked product behaviour (the SIA paper itself runs one sequential loop, not a tree search).
 * Right: a tree. Each box is one version of the agent, scored on the 50 simulated calls; each branch is
 * one kind of change. It visibly repeats four steps: pick a promising version, try one change, score it,
 * pass the score up (good branches get thicker and are tried more). Fine-tuning is one possible move,
 * chosen where prompt changes stop helping. The best path lights up and ends at 47/50.
 * Left: plain-language results (versions tried, best so far, cost per call, what changed), then call 23
 * runs again and passes. */
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
  const W = 168, H = 58, HT = 74, ROW = 106;
  const top = n => 6 + n.row * ROW;
  const hOf = n => (n.tag ? HT : H);
  const pathUp = id => { const p = []; for (let n = N[id]; n; n = N[n.parent]) p.push(n.id); return p; }; // id … root

  // order the search tries them in; weight = share of time (slow first rounds, then fast, then fine-tuning)
  const EV = [
    [1, 1], [2, 1], [6, 1],
    ...[3, 5, 4, 9, 7, 10, 8, 11, 12, 13, 14].map(id => [id, 0.16]),
    ["stall", 0.35],
    [15, 0.75], [17, 0.35], [16, 0.6],
  ];

  // left-side bullets, unlocked when that best-path version is scored
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

  U.stepCard(3, U.end("narr_07") + 2.0 + 0.1);
  SCENES.add({
    render(t) {
      const a = U.end("narr_07") + 2.0, b = U.end("sys_07") + 2.5;
      const vis = U.fade(root, t, a, b + 0.5, 0.5);
      if (vis <= 0) return;
      CHROME.showTopbar = true;
      CHROME.step = 3;

      // ---- schedule: the search runs from just before narr_15 until shortly before call 23 re-runs ----
      const S0 = U.has("narr_15") ? U.start("narr_15") - 0.4 : a + 1.5;
      const S1 = U.start(RERUN) - 1.4, span = S1 - S0;
      const lo = S0 + span * 0.05, hi = S0 + span * 0.9;
      const totW = EV.reduce((s, e) => s + e[1], 0);
      let c = lo;
      const ev = EV.map(([id, w]) => { const ta = c; c += (w / totW) * (hi - lo); return { id, ta, tb: c, q: (c - ta) / 4 }; });
      const evOf = Object.fromEntries(ev.filter(e => e.id !== "stall").map(e => [e.id, e]));
      const scoredAt = id => (id === 0 ? -1e9 : evOf[id].ta + evOf[id].q * 3);
      const bestA = hi + span * 0.01, bestB = S1;
      const bestP = U.prog(t, bestA, bestB);
      CHROME.clock = 31 * 60 + U.prog(t, a, S1) * 130 * 60 + Math.max(0, t - S1) * 3;

      // current event and its sub-step (0 pick, 1 try, 2 score, 3 pass up)
      const cur = ev.find(e => e.id !== "stall" && t >= e.ta && t < e.tb);
      const sub = cur ? Math.min(3, Math.floor((t - cur.ta) / cur.q)) : -1;
      stepEls.forEach((li, i) => U.cls(li, "on", sub === i));

      // visits: 1 for itself + 1 for every descendant whose score has been passed up
      const visits = N.map(() => 0);
      ev.forEach(e => { if (e.id !== "stall" && t >= e.tb) pathUp(e.id).forEach(id => visits[id]++); });
      if (cur && sub === 3) { /* passing up now: shown by the pulse */ }

      let g = "";
      // edges
      const edge = (n, col, w, op = 1) => {
        const p = N[n.parent];
        const x1 = p.x, y1 = top(p) + hOf(p), x2 = n.x, y2 = top(n);
        const my = (y1 + y2) / 2;
        return `<path d="M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}" fill="none" stroke="${col}" stroke-width="${w.toFixed(2)}" opacity="${op}" stroke-linecap="round"/>`;
      };
      const shown = n => n.id === 0 || t >= evOf[n.id].ta + evOf[n.id].q;
      const nodeOp = n => (n.id === 0 ? 1 : U.prog(t, evOf[n.id].ta + evOf[n.id].q, evOf[n.id].ta + evOf[n.id].q * 1.8));
      const dim = n => (bestP > 0 && !BEST.includes(n.id) ? lerp(1, 0.45, Math.min(1, bestP * 2)) : 1);

      N.forEach(n => {
        if (n.id === 0) return;
        if (!shown(n)) {
          // first-level branches start as faint, labelled slots
          if (n.row === 1) g += edge(n, "#2A3B50", 1.2, 0.6);
          return;
        }
        const w = 1.0 + 1.7 * Math.sqrt(Math.max(1, visits[n.id]));
        g += edge(n, "#3A4C63", w, (nodeOp(n) * dim(n)).toFixed(3));
      });
      // pick: highlight the path to the version being expanded
      if (cur && sub === 0) {
        const p = pathUp(N[cur.id].parent);
        p.slice(0, -1).forEach(id => { g += edge(N[id], "#A9ABF0", 3.5, 0.9); });
      }
      // best path lights from the root down
      if (bestP > 0) {
        BEST.slice(1).forEach((id, i) => {
          const f = U.prog(bestP, i / 5, (i + 1) / 5);
          if (f > 0) g += edge(N[id], "#7B7FE8", 6, f.toFixed(3));
        });
      }

      // boxes
      N.forEach(n => {
        const x = n.x - W / 2, y = top(n), h = hOf(n);
        if (!shown(n)) {
          if (n.row === 1) {
            g += `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="10" fill="none" stroke="#2A3B50" stroke-dasharray="5 5"/>`;
            g += `<text x="${n.x}" y="${y + 35}" text-anchor="middle" font-size="15" fill="#5E6E82">${KIND[n.kind]}</text>`;
          }
          return;
        }
        const e = evOf[n.id], par = N[n.parent];
        const sF = n.id === 0 ? 1 : U.prog(t, e.ta + e.q * 2, e.ta + e.q * 3); // scoring progress
        const scored = sF >= 1;
        const better = n.id === 0 || n.score > par.score;
        const onBest = bestP > 0 && BEST.includes(n.id) && bestP >= Math.max(0, BEST.indexOf(n.id) - 0.5) / 5;
        const picked = cur && sub === 0 && n.id === N[cur.id].parent;
        const trying = cur && cur.id === n.id && sub <= 2;
        let fill = n.kind === "ft" ? "#272B63" : "#1E2B3B";
        let stroke = "#2A3B50", sw = 1.5;
        if (scored && n.id !== 0) stroke = better ? "#3FB68B" : "#3A4C63";
        if (trying) { stroke = "#A9ABF0"; sw = 2.5; }
        if (picked) { stroke = "#A9ABF0"; sw = 3; }
        if (onBest) { stroke = "#7B7FE8"; sw = 3; fill = n.kind === "ft" ? "#30358A" : "#262F5C"; }
        const op = (nodeOp(n) * dim(n) * (scored && !better && !onBest && n.id !== 0 ? 0.75 : 1)).toFixed(3);
        g += `<g opacity="${op}">`;
        g += `<rect x="${x}" y="${y}" width="${W}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
        // fine-tuning is a different kind of move: a second, inner outline
        if (n.kind === "ft") g += `<rect x="${x + 4}" y="${y + 4}" width="${W - 8}" height="${h - 8}" rx="7" fill="none" stroke="#9EA2F2" stroke-width="1.2" opacity="0.8"/>`;
        g += `<text x="${n.x}" y="${y + 21}" text-anchor="middle" font-size="15" fill="#D6DEE8">${KIND[n.kind]}</text>`;
        const shownScore = n.id === 0 ? n.score : Math.round(lerp(par.score, n.score, sF));
        const scoreTxt = sF > 0 ? `${shownScore}/50` : "…";
        g += `<text x="${n.x}" y="${y + 45}" text-anchor="middle" font-size="22" font-weight="700" fill="#fff">${scoreTxt}</text>`;
        // score bar along the bottom edge: the 50 simulated calls running
        if (n.id !== 0 && sF > 0) {
          const bw = (W - 24) * (shownScore / 50) * Math.min(1, sF * 1.2);
          g += `<rect x="${x + 12}" y="${y + 51}" width="${W - 24}" height="3" rx="1.5" fill="#2A3B50"/>`;
          g += `<rect x="${x + 12}" y="${y + 51}" width="${bw.toFixed(1)}" height="3" rx="1.5" fill="${!scored ? "#A9ABF0" : better ? "#3FB68B" : "#7D8DA1"}"/>`;
        }
        if (n.tag && scored && (n.id !== 16 || bestP >= 0.9)) {
          g += `<text x="${n.x}" y="${y + 69}" text-anchor="middle" font-size="13" font-weight="700" fill="${n.kind === "ft" ? "#C3C8F5" : "#7FE0B8"}">${esc(n.tag)}</text>`;
        }
        g += `</g>`;
      });

      // pass the score up: a pulse travels from the new version to the root
      if (cur && sub === 3) {
        const f = U.prog(t, cur.ta + cur.q * 3, cur.tb);
        const p = pathUp(cur.id); // child … root
        const segs = p.length - 1, k = Math.min(segs - 1, Math.floor(f * segs)), ff = f * segs - k;
        const n = N[p[k]], q = N[p[k + 1]];
        const x = lerp(n.x, q.x, ff), y = lerp(top(n), top(q) + hOf(q), ff);
        g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="#A9ABF0"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13" fill="#A9ABF0" opacity="0.25"/>`;
      }

      // "prompt changes stopped helping" callout beside the best branch
      const stall = ev.find(e => e.id === "stall");
      const so = U.prog(t, stall.ta, stall.ta + 0.3) * (bestP > 0 ? lerp(1, 0.4, Math.min(1, bestP * 2)) : 1);
      if (so > 0) {
        const n10 = N[10], y = top(n10) + 22;
        g += `<g opacity="${so.toFixed(3)}"><text x="490" y="${y}" text-anchor="end" font-size="15" font-weight="700" fill="#E8B04A">Prompt changes</text>`;
        g += `<text x="490" y="${y + 20}" text-anchor="end" font-size="15" font-weight="700" fill="#E8B04A">stopped helping</text>`;
        g += `<path d="M496,${y + 4} L${n10.x - W / 2 - 6},${y + 4}" stroke="#E8B04A" stroke-width="1.5" stroke-dasharray="3 3"/></g>`;
      }
      U.html($("p5-tree"), g);

      // ---- left: plain results ----
      const tried = N.filter(n => n.id !== 0 && t >= evOf[n.id].ta + evOf[n.id].q).length;
      const best = Math.max(...N.filter(n => t >= scoredAt(n.id)).map(n => n.score));
      U.html($("p5-tried"), String(1 + tried));
      U.html($("p5-best"), `${best}<small>of 50</small>`);
      U.cls($("p5-best").parentElement, "good", best >= 47);
      const ftF = U.prog(t, evOf[15].ta + evOf[15].q * 2, evOf[15].ta + evOf[15].q * 3);
      U.html($("p5-cost"), "$" + lerp(0.41, 0.19, ftF).toFixed(2) + (ftF >= 1 ? "<small>smaller model</small>" : ""));
      U.cls($("p5-cost").parentElement, "good", ftF >= 1);
      U.text($("p5-sub"), bestP >= 1 ? "Best path: 31 → 47 of 50 (94%)" : t >= lo ? "Repeats four steps:" : "Starts from your agent, version 1");

      changeEls.forEach((li, i) => {
        const at = scoredAt(CHANGES[i][0]);
        U.css(li, { opacity: U.prog(t, at, at + 0.35).toFixed(3), transform: `translateY(${(1 - U.ease(U.prog(t, at, at + 0.4))) * 10}px)` });
      });

      // call 23 runs again and passes
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
