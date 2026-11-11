# SIA Scenarios: product concept

*Updated 2026-11-10 from Vignesh's direction. Supersedes the earlier "CallMap" coverage concept. "SIA" is said as one word, like the singer Sia (voice uses "Seeya Scenarios"). Not a Hexo Labs product.*

## 1. The product in one line
**SIA Scenarios finds the risky calls before your callers do.** You give it your voice agent's endpoint and its prompt. It calls the agent, explores scenarios with a Monte Carlo tree search the way a skilled human tester would, maps the zones where the agent is risky, and suggests prompt edits.

## 2. Problem (who, and what hurts)
- **Who:** teams that ship voice agents (voice-agent companies, enterprises running agents). They test before every launch and after every prompt change.
- **What hurts:** the dangerous failures hide in calls nobody thought to write down: a caller who changes an answer after the agent has moved on, asks too early, or pushes back. Good human testers find these by calling, watching and pushing harder where the agent slips, but that takes weeks per agent. Scripted test lists follow the easy path.

## 3. How it works
| Step | What happens |
|---|---|
| **1. Connect your agent** | The only inputs: the agent's endpoint (phone number, WebSocket or HTTP API) and its prompt. It reads the prompt to learn the agent's steps and rules, and marks the rules where a mistake could hurt someone (high risk). |
| **2. Explore with calls** | Monte Carlo tree search over scenarios. Each node is a scenario that was actually called. One iteration: pick a promising scenario → change one thing (a different answer, a late correction, pushback) → call the agent → score what happened. New or risky behaviour scores high; the score flows back up the tree, so the search digs where the agent slips and leaves behind branches that teach nothing. |
| **3. Map the risks** | Groups failing and inconsistent calls into **risky zones**, each with severity, failure rate and the calls that prove it. Risk by step of the call. Where the prompt is silent (agent behaves inconsistently and no rule decides), it sends the question to the domain expert instead of guessing. |
| **4. Fix and recheck** | Suggests a prompt edit per risky zone, based on the failed calls. Reruns the risky scenarios and everything that passed before, so a fix never quietly breaks something else. |

## 4. Versus Coval, Cekura, Hamming
Their pages (vendor-stated, via search snippets in the brief; recheck before using) describe scenario generation from an agent description, simulated calls with voices and noise, LLM judges, monitoring and CI. The intended difference:
1. **Adaptive exploration, not a fixed list.** The next scenario depends on what the last calls revealed (tree search with a reward for new or risky behaviour), like a human tester.
2. **Output is a risk map, not a pass rate:** risky zones with evidence calls and severity.
3. **Fixes, not just findings:** prompt edits per zone, verified by rerunning.
4. **Unclear rules go to the expert** instead of being counted as passes or failures.

## 5. What exists today vs what is mocked
- **Exists (scenario-gen-eval repo, internal):** building a map of decisions, caller answers and order breaks from requirements; measuring how much of it a scenario suite covers; a feedback agent that writes prompt edits for the *scenario generator*. Useful building blocks for steps 1, 3 and 4.
- **Not built:** placing calls to an agent endpoint, the tree search, judging calls, risky-zone clustering, prompt edits for the *agent*, rechecks. The MCTS page in the repo is a hand-made concept with made-up numbers.
- The video is an illustrative concept: tag on every frame, small print on the end card, all numbers mocked.

## 6. Demo (first SIA Scenarios cut, 3:00)
- Problem first (who / problem / human testers / scripted tests / what's needed), then title + 4-step overview, then a voiced card per step.
- Invented example: Northgate Pharmacy refill agent, phone number +1 (415) 555-0142 (fictional 555 number).
- Hero: call #118, "mentions the side effect late": agent books the pickup instead of transferring → failed, high risk → the search digs into that branch (3 more variants, all fail).
- Mocked numbers: 214 calls, 61 scenarios, tree shows 14; zones: side effect mentioned late 5/7 failed (high), dose questions 3/11 (high), refill exactly one week early inconsistent 3 allowed / 2 refused (medium, question to pharmacist), wrong DOB then corrected 1/9 (low), safe 0/96. After edits: 0/7, 0/11, 0/96 still passing.

## 7. Open questions
1. Endpoint types to show: phone number only, or phone + WebSocket + HTTP API (current)?
2. Does the user also give requirements/SOPs beyond the prompt, or only the prompt (current)?
3. Relation to SIA Voice: separate product, or the testing engine inside SIA Voice's "Run simulation" step?
4. May any real internal result ever appear publicly? (Currently none do.)
