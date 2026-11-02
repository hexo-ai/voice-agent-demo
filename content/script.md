# Demo script — v1 draft

**Product:** agent that builds voice agents for domain experts (illustrative concept).
**Use case:** post-discharge follow-up calls for heart failure patients.
**Length target:** not a hard limit for now — we tighten later. Word count is ~450 spoken words (~2:55 of speech at a normal pace), which is tight — we trim after
the first TTS pass shows real timings.

## Cast
| Role | Line IDs | Voice (draft → final) |
|---|---|---|
| Narrator (Vignesh, first person) | `narr_NN` | Vignesh's ElevenLabs clone → his own recordings |
| Nurse Vignesh (builder; also role-plays a patient in phase 6) | `nurse_NN` | Vignesh's ElevenLabs clone → his own recordings |
| The system (interviewer / builder product) | `sys_NN` | ElevenLabs, calm and warm |
| Follow-up agent (the agent being built) | `agent_NN` | ElevenLabs, friendly, clearly "phone" |
| Simulated patient (phase 4–5) | `patient_NN` | ElevenLabs, older voice |

Fictional names: **Riverside General** (hospital), **Robert** (simulated patient, older man).
Product name: **{{product_name}}** — set in `content/config.json` (currently "SIA Voice"). Never type the name directly; always use the placeholder.

## Rules for every frame
- **Time-elapsed clock** in the top-left corner from phase 1 onward, so viewers can see the "hours, not weeks" claim build up (mocked timeline below).
- "Illustrative product concept" tag on screen the whole time (top-right corner).
- Phases 1–6 use the **dual panel**: left = what the nurse sees (plain language),
  right = what happens in the backend (engineering work done automatically).
- All numbers below are **mocked**. The only real claim is the research paper on the end card.

---

## 0:00–0:25 — Hook: the problem (full screen)
The problem is not building a demo. It is the weeks of testing and back-and-forth between the
domain expert (who knows the rules of the domain) and the engineer (who builds the agent).

Visual 1 (narr_01): two cards. "Demo: works in an afternoon" (ticked) next to "Production", with a
week counter running Week 1 → Week 6.

> **narr_01:** Building a voice agent demo takes an afternoon. Getting it into production takes weeks.

Visual 2 (narr_02): the expert ↔ engineer loop. Inside: "Domain expert, knows the rules" and
"Engineer, builds the agent". Around them: Requirements → Build → Test → Feedback → Fix, a highlight
travelling the loop; the week counter ticks each lap.

> **narr_02:** Production means testing every edge case, and a long back-and-forth between the expert who knows the rules of the domain and the engineer who builds the agent.

Visual 3 (narr_13): the engineer fades out; {{product_name}} takes their place. The loop speeds up and
the week counter becomes "Hours".

> **narr_13:** {{product_name}} takes the engineer out of that loop. The expert works with it directly.

Title card: **{{product_name}}** — *{{tagline}}*

---

## 0:25–1:10 — Phase 1: Requirements (voice interview)
On-screen tag at the start: "Example: a nurse building a hospital follow-up agent".
**Left:** voice-mode screen. Animated orb that pulses with whoever is speaking, live captions underneath. No buttons except mute and end.
**Right:** "Requirements captured" checklist filling in live as Vignesh speaks; a spec document assembling underneath.

> **narr_03:** Here's one example. I'm Vignesh, playing a nurse at Riverside General. I need an agent that calls patients after discharge. So I just talk to it.
>
> **nurse_01:** I want an agent that calls our heart failure patients two days after discharge. Check symptoms, meds, and their follow-up visit.
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

> **sys_04:** Here's what I heard: heart failure patients, 48 hours after discharge. Chest pain, 911. Breathing trouble, nurse line. Shall I build it?
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

## 1:30–2:00 — Phase 4: Simulations
**Right:** grid of 50 call tiles running at once, each with a live waveform; tiles turn green or red. One red tile expands with its transcript.
**Left:** "**31 of 50 passed.** 19 need fixes." with one-line reasons.

> **narr_06:** Then it runs them: fifty simulated calls at once, with simulated patients.

Zoom into a failing call (audio plays):

> **agent_01:** Is anything bothering you since you got home?
>
> **patient_01:** Not really. I get a little short of breath when I lie down, but that's just me getting old.
>
> **agent_02:** Glad to hear you're doing well. Let's go over your medications.

Call tile turns red. {{product_name}} reports to the nurse by voice (left panel: voice orb + captions).

> **sys_06:** Vignesh, 19 of 50 calls failed. In this one, the patient said he gets short of breath lying down, and the agent moved on. Your rule says to escalate.

**Right panel — {{product_name}} diagnosing it** (this is what makes "it found the mistake" visible):
1. *Judge:* requirement R5 "breathing trouble → transfer to the nurse line" **violated** at turn 4.
2. *Why:* patient described the symptom indirectly ("short of breath when I lie down"); agent only escalates on direct phrases like "trouble breathing".
3. *Fix planned:* detect indirect symptom descriptions; add a follow-up question before moving on.

> **narr_07:** {{product_name}} catches each failure, works out why it happened, and fixes it itself.

---

## 2:00–2:25 — Phase 5: Optimization loop
**Right:** the strongest backend moment. Prompt and conversation-logic diffs scrolling; a fine-tuning run that turns rules a prompt can't capture into training data (e.g. spotting symptoms described indirectly); round counter 1 → 4; **pass rate 62% → 94%**; **cost per call** dropping.
**Left:** calm summary — "Fixed 16 of 19 issues. Here's what changed:" then plain-language bullets, e.g. *"The agent now asks a follow-up question whenever a patient mentions breathing, even in passing."*

> **narr_08:** It rewrites the prompts and conversation logic. Rules a prompt can't capture become training data, and it fine-tunes the model on them. Then it runs every test again.

Replay of the same call, now passing (reuse `patient_01` audio):

> **patient_01:** *(replayed)* …I get a little short of breath when I lie down, but that's just me getting old.
>
> **agent_03:** Short of breath when you lie down is important to check. I'm going to connect you with your nurse right now.

Tile turns green.

> **sys_07:** Fixed. The agent now follows up whenever a patient mentions breathing. 47 of 50 calls pass.

---

## 2:25–2:55 — Phase 5b: Expert reviews the simulations
The second kind of feedback. {{product_name}} can only catch mistakes its rules cover, so it also asks the expert. It picks the calls it is **least sure about**, including some that passed.
**Left:** "Review queue — 5 calls picked for you" with a play button on each; one is marked *Passed · low confidence*. Then the voice orb as Vignesh responds.
**Right:** why this call was queued — judge score **0.71 (pass, low confidence)**, "no requirement covers weight changes". After Vignesh's feedback: new requirement R24 added to the spec, 8 new scenario tiles appear, all 58 tests re-run.

> **narr_12:** {{product_name}} also picks the calls it's least sure about, and asks me to listen.

Vignesh plays a call that passed (audio plays):

> **agent_06:** Have you been weighing yourself every morning?
>
> **patient_02:** I have. I'm up about three pounds since yesterday.
>
> **agent_07:** Great job keeping track! Now, let's check on your follow-up appointment.

> **nurse_08:** This one passed, but it shouldn't have. Three pounds overnight can mean fluid building up. Ask about swelling, and flag it for the care team today.
>
> **sys_08:** Thanks. I've added a weight-gain rule and eight new test scenarios, and I'm re-running all 58 tests.

Right panel: tiles run; the weight-gain tiles turn green.

---

## 2:55–3:20 — Phase 6: Live test with a human
**Left:** phone-call screen ("Test call — Nurse Vignesh, role-playing a patient"); chat bubbles follow the call.
**Right:** live call checks ticking green as the agent does each thing.

> **narr_09:** Now a real person tests it. The agent calls me, and I play the patient.
>
> **agent_04:** Have you checked your weight this morning?
>
> **nurse_06:** *(as patient)* I have. I'm up about three pounds since yesterday.
>
> **agent_05:** Thanks for telling me. Have you noticed any swelling in your ankles or legs?
>
> **nurse_07:** *(as patient)* A little, yes.
>
> **agent_08:** Three pounds overnight with some swelling can mean fluid is building up. I'm flagging this for your care team today, and a nurse will call you this afternoon.
>
> **nurse_09:** *(as patient)* Okay, thank you.

The call ends cleanly. Right panel: every call check is green, including "Rule R24 applied, from your expert
review", then a "Call passed" result. Short pause, then the close. (Vignesh: no mistake in live testing —
by now the agent should look production-ready; three rounds of mistake-and-fix was too much.)

---

## 3:20–3:40 — The loop + close (full screen)
Visual: a circular loop diagram — Simulate → {{product_name}} self-review → Expert review → Fix → Live test → back to Simulate (three feedback sources highlighted) — spinning faster; test count growing (50 → 56 → 80 → 140).

> **narr_10:** Every mistake becomes a permanent test, whether {{product_name}} finds it, the expert hears it, or a live call reveals it. Simulate, fix, test with people, repeat.

Visual: the loop gives way to five experts the same loop works for — Nurses (post-discharge follow-up,
"this demo"), Claims adjusters (first notice of loss), Recruiters (candidate screening), Field-service
dispatchers (appointment scheduling), Loan officers (document follow-up).

> **narr_14:** The same loop works for any expert whose work happens on the phone.
>
> **narr_11:** No engineer in the loop. From use case to production in hours, not weeks.

End card:
- **{{product_name}}** — *{{tagline}}*
- **Use case to production-grade agent: hours, not weeks.**
- "Built on our research accepted at ICML" + arXiv 2605.27276 *(real — the only non-mocked claim)*
- Small print: "Illustrative product concept. Product UI, calls and numbers are mocked."

---

## Mocked vs real
| Item | Status |
|---|---|
| UI, scenarios, calls, transcripts, judge scores | Mocked |
| 31/50 → 47/50 (94%) pass rate, 16 of 19 fixed, cost per call drop, "12 minutes" | Mocked, illustrative only |
| "Weeks" of FDE work per agent | Company's view of the market — not a measured figure |
| "Hours, not weeks" and the elapsed-time clock | Product target, shown on a mocked timeline — not a measured result |
| ICML acceptance, arXiv paper, SIA code | Real |

## Mocked timeline (elapsed-time clock)
| End of phase | Clock shows | Mocked step duration |
|---|---|---|
| 1. Interview | 0h 12m | 12 min conversation |
| 2. v1 generated | 0h 13m | ~1 min |
| 3. Scenarios | 0h 16m | ~3 min |
| 4. Simulations | 0h 31m | ~15 min for 50 calls in parallel |
| 5. Optimization (4 rounds incl. fine-tune) | 2h 41m | ~2h 10m |
| 5b. Expert review + re-run | 2h 56m | ~15 min |
| 6. Live test + feedback | 3h 16m | ~20 min |
| Close | **3h 16m** → "Hours, not weeks." | — |

## Open questions for review
None right now.
