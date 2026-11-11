# SIA Scenarios: product concept

*Updated 2026-11-10 from Vignesh's direction. Supersedes the earlier "CallMap" coverage concept. "SIA" is said as one word, like the singer Sia (voice uses "Seeya Scenarios"). Not a Hexo Labs product.*

## 1. The product in one line
**SIA Scenarios finds the risky calls before your callers do.** You give it your voice agent's endpoint and its prompt. It calls the agent, explores scenarios with a Monte Carlo tree search the way a skilled human tester would, maps the zones where the agent is risky, and suggests prompt edits.

## 2. Problem (who, and what hurts)
- **Who:** teams that ship voice agents (voice-agent companies, enterprises running agents). They test before every launch and after every prompt change.
- **What hurts:** the dangerous failures hide in calls nobody thought to write down: a caller who changes an answer after the agent has moved on, asks too early, or pushes back. Good human testers find these by calling, watching and pushing harder where the agent slips, but that takes weeks per agent. Scripted test lists follow the easy path.

## 3. How it works (six phases, mirroring SIA Voice)
| Step | What happens |
|---|---|
| **1. Connect** | Inputs: the agent's endpoint (phone number, WebSocket or HTTP API) and its prompt. Optional but powerful: **Jira** (real customer complaints) and the team's **manual test calls** (recordings). It learns the agent's rules from the prompt, clusters complaints into trouble spots real callers already hit, and turns manual test calls into starting scenarios for the search. |
| **2. Interview the expert** | A short voice interview with the domain expert (here, a pharmacist): which mistakes would worry you most, what must the agent never do. Answers become high-risk rules, cross-referenced with complaints, and the search spends most of its calls on them. |
| **3. Explore with calls** | Monte Carlo tree search over scenarios, seeded with complaints, test calls and interview rules. Each node is a scenario that was actually called. One iteration: pick a promising scenario → change one thing → call the agent → score what happened; new or risky behaviour scores high and the score flows back up the tree. |
| **4. Expert review** | When the judge isn't sure (a vague symptom, a rule the prompt doesn't cover), it asks the expert for a label instead of guessing. Each label becomes a rule; the search goes back to test it, and the judge's agreement with the expert's labels goes up. |
| **5. Map the risks** | Risky zones with severity, failure rate, the calls that prove them, and the Jira complaints they explain. |
| **6. Fix and recheck** | A fix per zone, based on the failed calls: usually a prompt edit; when a prompt edit isn't enough, a **model change** (fine-tune the agent's model on corrected turns from the failed calls, or switch model). Reruns the risky scenarios and everything that passed before **whenever the prompt or the model changes**. New Jira complaints keep turning into new scenarios, so the next prompt change is tested against them. |

## 4. Versus Coval, Cekura, Hamming
Their pages (vendor-stated, via search snippets in the brief; recheck before using) describe scenario generation from an agent description, simulated calls with voices and noise, LLM judges, monitoring and CI. The intended difference:
1. **Adaptive exploration, not a fixed list.** The next scenario depends on what the last calls revealed (tree search with a reward for new or risky behaviour), like a human tester.
2. **Output is a risk map, not a pass rate:** risky zones with evidence calls and severity.
3. **Fixes, not just findings:** prompt edits and model changes (fine-tuning) per zone, verified by rerunning on every prompt or model change.
4. **Unclear rules go to the expert** instead of being counted as passes or failures.

## 5. What exists today vs what is mocked
- **Exists (scenario-gen-eval repo, internal):** building a map of decisions, caller answers and order breaks from requirements; measuring how much of it a scenario suite covers; a feedback agent that writes prompt edits for the *scenario generator*. Useful building blocks for steps 1, 3 and 4.
- **Not built:** placing calls to an agent endpoint, the tree search, judging calls, risky-zone clustering, prompt edits for the *agent*, rechecks. The MCTS page in the repo is a hand-made concept with made-up numbers.
- The video is an illustrative concept: tag on every frame, small print on the end card, all numbers mocked.

## 6. Demo (six-phase cut, 4:48)
- Problem first, then title + six-step overview, then a voiced card per step.
- Invented example: Northgate Pharmacy refill agent, +1 (415) 555-0142 (fictional). Jira project "Refill line", 38 tickets; 12 manual test calls.
- Interview: SIA Scenarios (River voice) asks; Vignesh plays the pharmacist. Rules: any side effect at any point → pharmacist; never advise on doses.
- Hero: call #118, side effect mentioned late → agent books pickup → failed, high risk → the search digs in.
- Expert review: call #142 "feeling a bit off" → expert: yes, a side effect; refill exactly one week early → allowed. +14 scenarios queued; agreement with expert labels 82% → 96%.
- Mocked numbers: 268 calls, 75 scenarios; zones: late side effect 5/7 (explains 6 complaints), vague symptoms 4/9 (found after the label), dose questions 3/11, one week early refused 2/5 (explains 4 complaints), safe 0/96. Fixes: prompt edit for late side effects + vague symptoms; doses: prompt edit tried (still 2/11) → fine-tune on 41 corrected turns; prompt line for one week early. Recheck (prompt v15 + fine-tuned model): all 0. New Jira complaint PHM-231 → 3 scenarios queued.

## 7. Open questions
1. Endpoint types to show: phone number only, or phone + WebSocket + HTTP API (current)?
2. Does the user also give requirements/SOPs beyond the prompt, or only the prompt (current)?
3. Relation to SIA Voice: separate product, or the testing engine inside SIA Voice's "Run simulation" step?
4. May any real internal result ever appear publicly? (Currently none do.)
