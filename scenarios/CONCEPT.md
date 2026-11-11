# SIA Risk — product concept (illustrative)

**SIA Risk finds the risks in your voice agent before your callers do.**

The product is not built yet. The demo video is scripted and mocked: screens, calls and numbers are invented, and the pharmacy and caller in it are fictional.

## The one idea
SIA Risk explores a voice agent the way a rigorous human tester would, but at machine speed. A Monte Carlo tree search makes real calls to the agent and is rewarded for **one thing: finding risk**. Branches where the agent slips get more calls, and safe branches get fewer. The output is a **risk report**: every risk, its severity, and the calls that prove it.

A risk is a risk. It doesn't matter whether a customer already complained about it. The job is to discover more risk.

## What the user gives it
- The agent's phone number (endpoint).
- The agent's prompt.
- Optional: an expert for a short voice interview, Jira complaints and manual test calls. These are only seeds for where to start looking.

## The six steps (as shown in the video)
1. **Connect** — endpoint and prompt; optional seeds (Jira, test calls).
2. **Interview the expert** — a short voice interview captures the rules of the domain (e.g. any symptom → transfer to a pharmacist).
3. **Hunt with calls** — Monte Carlo tree search: pick the branch most likely to hide a risk → change one thing → call the agent → score it (finding a risk scores high; the score flows up the tree). Repeat hundreds of times.
4. **Expert review** — when it's unsure whether a behaviour is a risk, it asks the expert in plain language. The answer becomes a new rule and new branches to explore.
5. **Risk report** — every risk, with its severity and the calls that prove it. Demo: 268 calls, 75 scenarios, 4 risks, 3 high severity.
6. **Fix and recheck** — suggested fixes are prompt edits, or a model change (fine-tuning on the failed calls) when a prompt edit isn't enough. Every change triggers a rerun of the risky calls plus everything that passed before, so a fix never quietly breaks something else.

## Pricing (context only, not in the video)
Outcome-based. Finding a high-severity risk is the value delivered, so it should be rewarded, not refunded.

## Research basis (real)
SIA — ICML-accepted paper https://arxiv.org/abs/2605.27276, code https://github.com/hexo-ai/sia. No research result is mixed into the mocked numbers.
