# Demo script — v1 draft

**Product:** agent that builds voice agents for domain experts (illustrative concept).
**Use case:** post-discharge follow-up calls for heart failure patients.
**Length target:** ~3:00. Word count is ~450 spoken words (~2:55 of speech at a normal pace), which is tight — we trim after
the first TTS pass shows real timings.

## Cast
| Role | Line IDs | Voice (draft → final) |
|---|---|---|
| Narrator | `narr_NN` | ElevenLabs → Vignesh |
| Nurse Vignesh (builder; also role-plays a patient in phase 6) | `nurse_NN` | ElevenLabs → Vignesh |
| The system (interviewer / builder product) | `sys_NN` | ElevenLabs, calm and warm |
| Follow-up agent (the agent being built) | `agent_NN` | ElevenLabs, friendly, clearly "phone" |
| Simulated patient (phase 4–5) | `patient_NN` | ElevenLabs, older voice |

Fictional names: **Riverside General** (hospital), **Margaret** (simulated patient).
Product name on screen: **Hexo** (placeholder — confirm).

## Rules for every frame
- "Illustrative product concept" tag on screen the whole time (top-right corner).
- Phases 1–6 use the **dual panel**: left = what the nurse sees (plain language),
  right = what happens in the backend (engineering work done automatically).
- All numbers below are **mocked**. The only real claim is the research paper on the end card.

---

## 0:00–0:15 — Hook (full screen)
Visual: dark screen, simple animation: use case → engineer → weeks of back-and-forth (calendar pages flipping).

> **narr_01:** Voice agents can now do real clinical work. But each one still takes weeks of engineering to reach production.
>
> **narr_02:** What if the nurse could just build it?

Title card: **Hexo** — *An agent that builds voice agents.*

---

## 0:15–1:00 — Phase 1: Requirements (voice interview)
**Left:** voice-mode screen. Animated orb that pulses with whoever is speaking, live captions underneath. No buttons except mute and end.
**Right:** "Requirements captured" checklist filling in live as Vignesh speaks; a spec document assembling underneath.

> **narr_03:** Meet Vignesh, a nurse at Riverside General. He needs an agent that calls patients after discharge. He just talks to it.
>
> **nurse_01:** I want an agent that calls our heart failure patients two days after discharge. Check symptoms, meds, and that their follow-up visit is booked.
>
> **sys_01:** Got it. If a patient reports a symptom, what should the agent do?
>
> **nurse_02:** If they have trouble breathing or chest pain, escalate right away.
>
> **sys_02:** Should I transfer them live to the nurse line, or tell them to call 911? And what about after hours —
>
> **nurse_03:** *(interrupting)* Chest pain is always 911. Breathing trouble, transfer to the nurse line. After hours, the on-call nurse.
>
> **sys_03:** Understood. What if a family member answers? Can the agent discuss medications with them?
>
> **nurse_04:** Only if the patient listed them as a caregiver. Otherwise, just ask for a good time to call back.

Right panel ticks as each answer lands:
✓ Patients: heart failure, 48 h after discharge · ✓ Check: symptoms, medications, follow-up visit ·
✓ Chest pain → 911 · ✓ Breathing trouble → nurse line (after hours: on-call) · ✓ Only listed caregivers

Jump cut, caption: **"12 minutes later"**. Checklist now long; counter reads *23 requirements · 6 escalation rules*.

> **sys_04:** Here's what I heard. Heart failure patients, 48 hours after discharge. Symptoms, meds, follow-up visit. Chest pain: 911. Breathing trouble: nurse line. Shall I build it?
>
> **nurse_05:** Yes, go ahead.

---

## 1:00–1:10 — Phase 2: First version generated
**Left:** one card — "Your agent v1 is ready. Next: testing."
**Right:** fast build animation — system prompt being written, tools connecting (patient record lookup, call transfer, appointment scheduling), a conversation-flow graph drawing itself.

> **narr_04:** In seconds, the spec becomes a first working agent.

---

## 1:10–1:30 — Phase 3: Test scenarios
**Left:** plain-language list growing to **50 test scenarios** — "Patient's daughter answers", "Patient hasn't picked up meds", "Patient mentions a symptom in passing", "Wrong number", "Patient is hard of hearing"…
**Right:** coverage map — requirements down the side, scenarios across the top, cells filling in until every requirement is covered.

> **narr_05:** Before any patient hears it, the system writes the tests: every requirement, plus the edge cases an engineer would worry about.

---

## 1:30–1:55 — Phase 4: Simulations
**Right:** grid of 50 call tiles running at once, each with a live waveform; tiles turn green or red. One red tile expands with its transcript.
**Left:** "**31 of 50 passed.** 19 need fixes." with one-line reasons.

> **narr_06:** Then it runs them: fifty simulated calls at once, with simulated patients.

Zoom into the failing call (audio plays):

> **agent_01:** Is anything bothering you since you got home?
>
> **patient_01:** Not really. I get a little short of breath when I lie down, but that's just me getting old.
>
> **agent_02:** Glad to hear you're doing well. Let's go over your medications.

> **narr_07:** This one failed. Breathlessness when lying down is a heart failure warning sign, and the agent missed it.

Left panel highlights the reason: *"Patient mentioned breathing trouble indirectly. Agent did not escalate."*

---

## 1:55–2:20 — Phase 5: Optimization loop
**Right:** the strongest backend moment. Prompt and conversation-logic diffs scrolling; a fine-tuning run with a loss curve; round counter 1 → 4; **pass rate 62% → 94%**; **cost per call** dropping.
**Left:** calm summary — "We fixed 16 issues. Here's what changed:" then plain-language bullets, e.g. *"The agent now asks a follow-up question whenever a patient mentions breathing, even in passing."*

> **narr_08:** Every failure feeds the optimization loop. It rewrites prompts and conversation logic, fine-tunes the model, and tests again.

Replay of the same call, now passing (reuse `patient_01` audio):

> **patient_01:** *(replayed)* …I get a little short of breath when I lie down, but that's just me getting old.
>
> **agent_03:** Short of breath when you lie down is important to check. I'm going to connect you with your nurse right now.

Tile turns green.

---

## 2:20–2:45 — Phase 6: Live test with a human
**Left:** phone-call screen ("Test call — Nurse Vignesh, role-playing a patient"), then voice-mode orb for feedback.
**Right:** live transcript of the call; then the feedback turning into a new rule plus new scenarios added to the test suite.

> **narr_09:** Now a real person tests it. Vignesh has the agent call him, and plays a tricky patient.
>
> **agent_04:** Are you taking your furosemide, the water pill, every morning?
>
> **nurse_06:** *(as patient)* I stopped. It makes me run to the bathroom all day.
>
> **agent_05:** Okay, I'll make a note of that. Next, let's confirm your follow-up visit.

Call ends. Voice mode opens.

> **nurse_07:** That wasn't enough. If a patient stops a medication on their own, ask why, and flag it for the care team the same day.
>
> **sys_05:** Got it. I've added that rule and created six new test scenarios for it.

Right panel: new rule appears in the spec; six new tiles join the simulation grid and run.

---

## 2:45–3:00 — The loop + close (full screen)
Visual: a circular loop diagram — Simulate → Fix → Live test → Feedback → back to Simulate — spinning faster; test count growing (50 → 56 → 80 → 140).

> **narr_10:** Every live call makes the test suite stronger. Simulate, fix, test with people, repeat.
>
> **narr_11:** Built by the person who knows the work best. No engineer required.

End card:
- **Hexo** — *An agent that builds voice agents.*
- "Built on our research accepted at ICML" + arXiv 2605.27276 *(real — the only non-mocked claim)*
- Small print: "Illustrative product concept. Product UI, calls and numbers are mocked."

---

## Mocked vs real
| Item | Status |
|---|---|
| UI, scenarios, calls, transcripts | Mocked |
| 31/50 → 94% pass rate, 16 fixes, cost per call drop, "12 minutes" | Mocked, illustrative only |
| "Weeks" of FDE work per agent | Company's view of the market — not a measured figure; kept vague on purpose |
| ICML acceptance, arXiv paper, SIA code | Real |

## Open questions for review
1. Product name on screen: "Hexo" or something else?
2. Do we want a specific time claim in the close (e.g. "days, not weeks")? Only if we're comfortable defending it as a target.
3. Clinical check: worth having a real nurse sanity-check the heart failure details (orthopnea as a warning sign, furosemide adherence) before we record.
