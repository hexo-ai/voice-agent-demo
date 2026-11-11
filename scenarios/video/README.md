# SIA Scenarios video

`sia-scenarios-demo-2026-11-10.mp4`: the approved cut (4:48, 1920×1080, 12.3 MB, faststart), committed on Vignesh's request (2026-11-10) so other threads, such as the website thread, can fetch it. This is an exception to the repo's "no generated media" rule. `*.mp4` is gitignored, so the file was added with `git add -f`.
Rebuild with `cd scenarios && ./build.sh` → `out/sia_scenarios_demo.mp4`. The voice takes are regenerated, so a rebuild won't be byte-identical.
Use a new file name for each new cut (browser caching on siavoice.com).
