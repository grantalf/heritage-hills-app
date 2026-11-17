"""
Packs a one-bundle web export into a single self-contained HTML file for previews.
Usage:
  EXPO_NO_BUNDLE_SPLITTING=1 npx expo export --platform web --output-dir /tmp/hh-web
  python3 scripts/build_preview.py /tmp/hh-web /tmp/hh-preview/index.html [start page] [title]
The start page defaults to Home ("/"). Example: /brawler opens Critter Rescue.
"""
import glob
import os
import sys

src, out = sys.argv[1], sys.argv[2]
start = sys.argv[3] if len(sys.argv) > 3 else "/"
title = sys.argv[4] if len(sys.argv) > 4 else "Heritage Hills app: first draft preview"
if not start.startswith("/") or any(ch in start for ch in "\"'<>"):
    sys.exit("start page must be a path like /brawler")
bundles = glob.glob(os.path.join(src, "_expo/static/js/web/*.js"))
if len(bundles) != 1:
    sys.exit(f"expected exactly one bundle, found {len(bundles)}; export with EXPO_NO_BUNDLE_SPLITTING=1")
js = open(bundles[0], encoding="utf8").read().replace("</script", "<\\/script")

html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<style>
  html, body {{ height: 100%; margin: 0; }}
  body {{ overflow: hidden; background: #ffffff; }}
  #root {{ display: flex; height: 100%; flex: 1; }}
  @media (prefers-color-scheme: dark) {{ body {{ background: #101512; }} }}
</style>
</head>
<body>
<noscript>This preview needs JavaScript.</noscript>
<div id="root"></div>
<script>
  // Previews are opened at an address the app does not know. Start at the chosen page.
  try {{ history.replaceState(null, "", "{start}"); }} catch (e) {{}}
</script>
<script>
{js}
</script>
</body>
</html>
"""
os.makedirs(os.path.dirname(out), exist_ok=True)
open(out, "w", encoding="utf8").write(html)
print(out, round(len(html) / 1e6, 2), "MB")
