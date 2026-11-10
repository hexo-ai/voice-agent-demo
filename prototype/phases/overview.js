/* Overview — after the title card: the six steps in a row, each lighting up as narr_20 names it,
 * so viewers know the flow before the nurse example starts. Skipped if the cut has no narr_20. */
(function () {
  if (!U.has("narr_20")) return;
  const root = document.getElementById("overview");
  const DESC = [
    "The expert describes the job by voice.",
    "A working first version, from the spec.",
    "Tests every requirement on simulated calls.",
    "Tries many fixes. Fine-tunes when needed.",
    "The expert checks the calls it is least sure about.",
    "A real call with a real person.",
  ];
  // where each step is named in the line; it lights when the narrator gets there (even pace assumed)
  const CUES = ["collects requirements", "builds the agent", "simulated calls", "improves and fine-tunes", "reviews the hardest", "live call"];
  document.getElementById("ov-h").textContent = `How ${document.querySelector("[data-product-name]").textContent} works`;
  const row = document.getElementById("ov-row");
  row.innerHTML = U.STEPS.map((s, i) => `<li><div class="n">${i + 1}</div><div class="nm">${s}</div><div class="ds">${DESC[i]}</div></li>`).join("");
  const items = [...row.children];
  const line = U.line("narr_20");
  const text = line.text.toLowerCase();
  const at = CUES.map(c => line.start + line.dur * Math.max(0, text.indexOf(c)) / text.length - 0.15);

  SCENES.add({
    render(t) {
      const a = U.start("narr_20") - 0.6, b = U.end("narr_20") + 0.9;
      const vis = U.fade(root, t, a, b, 0.5);
      if (vis <= 0) return;
      items.forEach((li, i) => {
        U.cls(li, "on", t >= at[i]);
        const f = U.prog(t, a + 0.2 + i * 0.08, a + 0.6 + i * 0.08);
        U.css(li, { opacity: f.toFixed(3), transform: `translateY(${((1 - U.ease(f)) * 16).toFixed(1)}px)` });
      });
    },
  });
})();
