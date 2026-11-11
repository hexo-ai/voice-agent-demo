# SIA Risk video

**Current cut:** `sia-risk-demo-2026-11-11.mp4` (SIA Risk, 4:53, 1920×1080, 12.4 MB, faststart).
sha256 `4e15b0af63ad9beb01891d80ccae78c31bc91df1057aa28c922ccce58b936025`

**Previous cut:** `sia-scenarios-demo-2026-11-10.mp4` (named SIA Scenarios, 4:48). It is superseded; don't use it on the website.

Both were committed on Vignesh's request so other threads, such as the website thread, can fetch them. This is an exception to the repo's "no generated media" rule. `*.mp4` is gitignored, so add files with `git add -f`.
Rebuild with `cd scenarios && ./build.sh` → `out/sia_risk_demo.mp4`. The voice takes are regenerated, so a rebuild won't be byte-identical.
Use a new file name for each new cut (browser caching on siavoice.com).
