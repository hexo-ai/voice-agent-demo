# siavoice.com

One static page: `index.html` plus `fonts/`. No build step.

## Before launch: two settings
At the bottom of `index.html`:
- `YOUTUBE_ID`: the ID from the unlisted YouTube link (the part after `v=`). Empty shows "Video coming soon".
- `FORM_ENDPOINT`: the form service URL (e.g. Formspree `https://formspree.io/f/xxxx`). Empty = preview mode (shows the thank-you message, sends nothing).
  - Web3Forms also needs a hidden field: `<input type="hidden" name="access_key" value="...">` inside the form.

## Deploy (recommended: Cloudflare)
1. Buy siavoice.com with Cloudflare Registrar.
2. Cloudflare Pages → Create → Upload assets → upload this `website/` folder (or connect the repo, root directory `website`, no build command).
3. Pages project → Custom domains → add `siavoice.com` and `www.siavoice.com`. DNS and HTTPS set up automatically when the domain is in the same account.
4. Email: Cloudflare Email Routing to forward info@siavoice.com to your inbox. Add Google Workspace later to send from it.

## Rules (from the website brief)
- Keep the "Illustrative product concept" label on the video.
- The ICML paper and SIA code are real; everything in the demo is mocked. Never mix them.
- "Hours, not weeks" is a target. No invented customers, logos, testimonials or metrics.
