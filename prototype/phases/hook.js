/* Hook: the problem. (1) Demo in an afternoon vs weeks to production. (2) The expert <-> engineer
 * loop that takes those weeks. (3) SIA Voice replaces the engineer; weeks become hours. Then title. */
(function () {
  const el = document.getElementById("hook");
  const $ = id => document.getElementById(id);
  const svg = $("hook-loop"), C = [550, 450], RAD = 385;
  const STEPS = ["Requirements", "Build", "Test", "Feedback", "Fix"];
  const pos = i => { const a = (-90 + i * 72) * Math.PI / 180; return [C[0] + RAD * Math.cos(a), C[1] + RAD * Math.sin(a)]; };
  svg.innerHTML = `<circle cx="${C[0]}" cy="${C[1]}" r="${RAD}" fill="none" stroke="#2A3B50" stroke-width="3"/>
    <circle id="hook-arc" cx="${C[0]}" cy="${C[1]}" r="${RAD}" fill="none" stroke="#E8B04A" stroke-width="4" stroke-linecap="round" pathLength="100" stroke-dasharray="10 90" transform="rotate(-90 ${C[0]} ${C[1]})"/>` +
    STEPS.map((s, i) => { const [x, y] = pos(i); return `<g><rect x="${x - 105}" y="${y - 30}" width="210" height="60" rx="30" fill="#1E2B3B" stroke="#2A3B50" stroke-width="2"/><text x="${x}" y="${y + 8}" text-anchor="middle" font-size="22" fill="#D6DEE8">${s}</text></g>`; }).join("");

  SCENES.add({
    render(t) {
      const end = U.start("narr_03") - 1.9;
      const vis = U.fade(el, t, -1, end, 0.6);
      if (vis <= 0) return;

      // (1) demo vs production
      const b1 = U.start("narr_02") - 0.3;
      U.fade($("hook-1"), t, -1, b1, 0.4);
      const wk = 1 + Math.floor(U.prog(t, U.at("narr_01", 0.45), U.end("narr_01")) * 5);
      U.text($("hook-weeks"), "Week " + wk);

      // (2) the loop; (3) SIA Voice swaps in for the engineer
      const a2 = U.start("narr_02") - 0.3, swap = U.start("narr_13") + 0.3, titleA = U.end("narr_13") + 0.4;
      U.fade($("hook-2"), t, a2, titleA + 0.4, 0.4);
      const tt = Math.max(0, t - a2), fast = Math.max(0, t - swap);
      const turns = 0.18 * tt + 0.9 * fast;               // lap speed jumps once the engineer is gone
      const arc = $("hook-arc");
      arc.setAttribute("stroke-dashoffset", (-(turns * 100) % 100).toFixed(2));
      arc.setAttribute("stroke", t >= swap ? "#7B7FE8" : "#E8B04A");
      const sw = U.prog(t, swap, swap + 0.6);
      U.css($("hook-eng"), { opacity: (1 - sw).toFixed(3) });
      U.css($("hook-sia"), { opacity: sw.toFixed(3) });
      const cal = $("hook-cal");
      if (t < swap) { U.text(cal, "Week " + Math.min(6, 1 + Math.floor(U.prog(t, a2 + 0.5, swap - 0.3) * 6))); U.css(cal, { color: "var(--unsure)" }); }
      else { U.text(cal, "Hours"); U.css(cal, { color: "#A9ABF0" }); }

      // title card
      U.fade($("title-card"), t, titleA, end + 1, 0.5);
    },
  });
})();
