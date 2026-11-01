/* Hook: full-screen statement, then the title card. Placeholder visuals — to be enriched. */
(function () {
  const el = document.getElementById("hook");
  const line = document.getElementById("hook-1");
  const card = document.getElementById("title-card");

  SCENES.add({
    render(t) {
      const end = U.start("narr_03") - 0.6;
      const vis = U.fade(el, t, -1, end, 0.6);
      if (vis <= 0) return;
      const n1 = U.line("narr_01"), n2 = U.line("narr_02");
      const cur = t < n2.start - 0.2 ? n1 : n2;
      U.text(line, cur.text);
      U.css(line, { opacity: Math.min(U.prog(t, cur.start - 0.3, cur.start + 0.2), 1 - U.prog(t, U.end("narr_02") + 0.1, U.end("narr_02") + 0.4)).toFixed(3) });
      U.fade(card, t, U.end("narr_02") + 0.55, end + 1, 0.5);
    },
  });
})();
