# CLAUDE.md — voice-agent-demo

## What this project is
A ~3-minute **illustrative concept demo** (a "cooked" demo) for Hexo Labs' product idea:
**an agent that builds voice agents for domain experts.**

The product does not exist yet. Everything shown is scripted and mocked. The video must
say so on screen.

### Product in one paragraph
A voice agent demo is easy; production is hard. Production needs extensive testing and a long
feedback loop between the **domain expert** (who knows the rules of the domain) and the
**engineer** (who builds the agent) — that co-work is what takes weeks. SIA Voice takes the
engineer out of the loop so any domain expert whose work happens on the phone can build a
production agent directly. The nurse / hospital follow-up agent is **one example**, not the product's scope.
1. **Requirements** — the system interviews the expert and writes a spec.
2. **Evaluation** — it generates test scenarios (with edge cases); the expert reviews
   results in plain language.
3. **Self-improvement** — failures feed an optimization loop that improves the harness
   (prompts, tools, conversation logic) and fine-tunes the model.
North-star metric: time from use case to production-grade agent.

Research basis (real, not mocked): ICML-accepted paper https://arxiv.org/abs/2605.27276,
code https://github.com/hexo-ai/sia

## Non-negotiable rules
- **Label it illustrative.** An "Illustrative product concept" tag stays on screen for the
  whole video, not just the intro.
- **Keep mocked and real separate.** UI, dashboard numbers, scenarios and calls are mocked.
  Any real SIA research result must be labeled as a research result and never mixed into
  mocked dashboard numbers.
- **Never commit secrets.** API keys live in `.env` (gitignored). See `.env.example`.
- **Don't commit large generated media** (TTS clips, recordings of screens, MP4s). Commit
  the scripts that regenerate them. The user's own voice recordings in `recordings/` are
  the exception — commit those (they can't be regenerated).
- Plain, clear language in all on-screen text and narration.
- **Product name is a variable.** It lives in `content/config.json` (`product_name`, currently
  "SIA Voice"). Script and prototype use `{{product_name}}`; never hard-code the name.
- After editing `content/script.md`, run `python3 content/extract_lines.py` to refresh `lines.json`.

## Layout
| Path | Contents |
|---|---|
| `content/` | Source of truth for words: `script.md` (narration + shot list), `lines.json` (every spoken line with an ID), interview, spec, scenarios, results |
| `prototype/` | Clickable HTML prototype — every screen state hard-coded |
| `audio/` | TTS generation scripts; generated clips go to `audio/tts/` (gitignored) |
| `recordings/` | User's own voice recordings, one file per line ID (e.g. `nurse_02.wav`) |
| `record/` | Playwright scripts that click through the prototype and capture video |
| `edit/` | ffmpeg assembly steps for the final cut |
| `out/` | Build output (gitignored) |
| `build.sh` | One command to rebuild the whole video (to be written) |

## Audio design (swappable voices)
- Every spoken line has an ID: `narr_NN` (narrator), `nurse_NN` (the nurse — played by
  the user), `sys_NN` (the interviewing system), `agent_NN` / `patient_NN` (the demo call).
- For each line, the build uses `recordings/<id>.(wav|m4a|mp3)` if it exists, otherwise
  `audio/tts/<id>.mp3` (ElevenLabs).
- Video timing is derived from clip lengths, so swapping a recording re-times the video
  on rebuild. Never hard-code durations for spoken lines.

## Working across threads
Each chat thread / machine has its own workspace. Only two things are shared:
this **GitHub repo** and the claude.ai project doc **`claude/status.md`** (done / next / open
decisions). Push at the end of every working stage and update `claude/status.md`.

## Setup (local PC)
Requires Python 3.10+, Node 18+, ffmpeg.
```bash
cp .env.example .env        # add ELEVENLABS_API_KEY
npm i playwright && npx playwright install chromium
```
(Exact install steps will be finalized in README.md as the pipeline is built.)
