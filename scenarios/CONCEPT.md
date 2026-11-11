# CallMap: product concept (scenario generation and coverage for voice agents)

*Written 2026-11-10 from the scenario-generator brief (repo `scenario-gen-eval`, HEAD `dfa59cf`), its benchmark report and its prompt-comparison report. "CallMap" is a placeholder name (`scenarios/config.json`).*

## 1. The idea in one line
**CallMap maps every way a call can go, tests each path with a simulated call, and shows you what your voice agent was never tested on.**

## 2. Problem (who, and what hurts)
- **Who:** teams that ship voice agents: voice-agent companies (their QA leads, deployment and forward-deployed engineers) and enterprises running agents in production. They test before every launch and after every prompt change.
- **What hurts:** a suite can pass every test and still miss the calls that matter. Generated tests repeat the easy path: a caller who answers clearly, in order, the first time. Real callers change an answer after the agent has moved on, ask for an outcome too early, give a hedged answer right at a rule's limit, or push back on a decision. Those are the calls that break agents, and no tool tells you which of them were never tested. **Test count is not coverage.**
- **Evidence from our own work (real, internal, one run each; do not publish without approval):** on 3 healthcare use cases, a baseline generator prompt produced 31 scenarios that covered 29% of the benchmark's paths and **0 of 26 "changes the answer later" paths**. A better prompt produced 54 scenarios and reached 42%. A deliberately bad prompt scored 11%, so the meter is sensitive. Plain successful answers were over-covered (one item was hit by 11 scenarios).

## 3. What the product does (four steps)
| Step | What happens | Status today |
|---|---|---|
| **1. Map the call** | Reads the agent's requirements (SOP, prompt, call flow). Builds a **call map**: a workflow graph; one *dimension* per decision; every *condition* (distinct caller answer, incl. unclear, refused and borderline ones); every *order break* (jumps ahead, goes back, won't accept the outcome). Each path gets a priority (P0 = could cause harm) and **checks** (what the agent must do). Records **open questions**: things the requirements don't say. | **Built** as a benchmark builder (3 use cases; LLM-built, not yet expert-audited) |
| **2. Write the tests** | Measures the team's existing suite against the map. Then generates scenarios aimed at the gaps: one deviation per scenario, exact caller wording and timing ("never 'at some point'"); drops scenarios that add nothing. Coverage meter: covered paths / all paths, split by priority and type. | **Measuring: built** (mapping + coverage + feedback agent that rewrites the generator prompt). **Gap-targeted generation: planned** (today generation comes from an external builder's generator) |
| **3. Run and check** | Runs each scenario as a simulated call (voice or text) against the agent. Judges each call against the path's checks from step 1: pass/fail with the quote that decided it. | **Planned / mocked.** No simulator or judge in the repo |
| **4. Close the gaps** | Report: coverage *and* pass rate, before vs after. Open questions go to the domain expert instead of being guessed. Re-runs on every prompt change (regression gate). Optional: explores past the map, varying calls that revealed new behaviour (novelty search; the "MCTS" concept page). | **Planned / mocked.** Prompt-fix loop built; regression and exploration are concepts |

## 4. Why it's different from Coval, Cekura, Hamming
Their pages (vendor-stated, read via search snippets only; recheck before using) describe generating scenarios from an agent description, simulating calls with voices, accents and noise, LLM judges, monitoring and CI. They run calls; we don't yet. Where we can be different:
1. **Coverage against an independent, priority-weighted call map**, built from the requirements, not "number of tests" or "pass rate". We didn't find an equivalent on their pages (not proof it's absent).
2. **Order breaks and borderline answers as first-class paths.** Our data says generators rarely produce them.
3. **Open questions to the expert.** The map shows where the requirements are silent, so the agent's behaviour there is a product decision, not a test failure.
4. **A loop that closes gaps**: it writes the missing tests, and (built today) rewrites the generator prompt from measured gaps.

**Honest gaps:** no simulator, no judge, no audio realism, no monitoring, no integrations, no customers. A real product must build step 3 or partner for it (e.g. run calls through an existing simulator).

## 5. Demo plan (illustrative video, first draft 3:15)
- **Example:** an invented pharmacy prescription-refill agent (verify patient → check refill → side-effect check → pickup or delivery; transfer to a pharmacist on any side effect; never give medical advice). Invented on purpose: the real benchmark use cases and the agent builder they came from are internal.
- **Problem first:** who (teams shipping voice agents), what (50/50 tests pass; all follow the script), why it matters (real callers break order; nobody knows what wasn't tested).
- **Four steps**, each with a voiced step card. Hero moment: a late correction ("Actually, I've been dizzy since my dose went up") after the agent passed the side-effect question; the agent schedules the pickup instead of transferring. P0 fail. The team's old suite never had this call.
- **Mocked numbers:** map of 128 paths (41 high-risk); old suite 50 tests, 50 pass, 31% coverage, 0 late-correction tests; new suite 72 tests, 95% coverage; 72 calls → 65 pass, 7 fail (3 high-risk); 6 paths wait on 3 open questions (e.g. "Is a refill on day 23 of a 30-day supply too early?").
- **Real claims:** none. "Illustrative product concept" tag on every frame; small print says screens, calls and numbers are mocked. No Hexo, HAI, agent-builder, customer or colleague names. Competitors are not named on screen.

## 6. Open questions for Vignesh
1. Name: keep "CallMap" as placeholder? Domain?
2. Standalone product (this demo) or a module of SIA Voice (its "Run simulation" step)?
3. May any real result (29% → 42%, 0 of 26) ever be shown publicly? Needs approval from whoever owns the internal data.
4. Step 3 (simulate + judge): build ourselves, or partner?
