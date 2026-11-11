# siavoice.com

One static page: `index.html` plus `fonts/`. No build step.

## Settings
- Demo videos: the `VIDEOS` table at the bottom of `index.html` (file, poster still, length, title for each of the four use cases).
- The MP4s and poster JPGs are **not in git** (no media in the repo). Before each deploy, put all four MP4s and four posters in the deploy folder next to `index.html` (pull the live copies from `https://siavoice.com/<file>` if you don't have them). A Pages deploy replaces the whole site, so a missing file disappears.
  - Make each MP4 stream-friendly first: `ffmpeg -i in.mp4 -c copy -movflags +faststart out.mp4`.
  - Poster: `ffmpeg -ss <sec> -i video.mp4 -frames:v 1 -vf scale=1280:-1 -q:v 4 poster-<id>.jpg`.
  - Use a new file name for each new cut (browser caching). Cloudflare Pages allows 25 MiB per file.

## Deploy (recommended: Cloudflare)
1. Buy siavoice.com with Cloudflare Registrar.
2. Cloudflare Pages → Create → Upload assets → upload this `website/` folder (or connect the repo, root directory `website`, no build command).
3. Pages project → Custom domains → add `siavoice.com` and `www.siavoice.com`. DNS and HTTPS set up automatically when the domain is in the same account.
4. Email: Cloudflare Email Routing to forward info@siavoice.com to your inbox. Add Google Workspace later to send from it.

## Rules (from the website brief)
- Keep the "Illustrative product concept" label on the video.
- The ICML paper and SIA code are real; everything in the demo is mocked. Never mix them.
- "Hours, not weeks" is a target. No invented customers, logos, testimonials or metrics.
