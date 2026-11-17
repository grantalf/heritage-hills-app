"""
End-to-end check of the game workshop (block 1) on the web build.
Usage, after exporting and serving the web build as in e2e_web.py:
  python3 scripts/e2e_workshop.py http://127.0.0.1:8791 [chrome path] [screenshot dir]
Runs every journey at a small Android size and a large iPhone size.
"""
import json
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
CHROME = sys.argv[2] if len(sys.argv) > 2 else "/usr/bin/google-chrome"
SHOTS = sys.argv[3] if len(sys.argv) > 3 else None
SIZES = {"small-android": (360, 640), "large-iphone": (430, 932)}
results = []


def check(name, condition):
    results.append((name, bool(condition)))
    print(("PASS  " if condition else "FAIL  ") + name)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    for size, (width, height) in SIZES.items():
        ctx = browser.new_context(viewport={"width": width, "height": height}, is_mobile=True, has_touch=True, device_scale_factor=2)
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        wait = lambda ms=500: page.wait_for_timeout(ms)
        has = lambda text: page.get_by_text(text, exact=False).count() > 0
        shot = lambda name: SHOTS and page.screenshot(path=f"{SHOTS}/{size}-{name}.png")
        fits = lambda: page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")

        # 1. Reachable from the More tab in two taps.
        page.goto(BASE + "/"); wait(1200)
        page.get_by_role("tab", name="More").click(); wait()
        page.get_by_role("button", name="Game workshop").click(); wait(700)
        check(f"{size}: workshop opens from the More tab and is labeled a draft", has("Pick a look") and has("Test street") and has("Paper map sample") and has("Stand-in art"))

        # 2. Style sheets: four looks, a pick, and the line to send.
        page.goto(BASE + "/workshop/styles"); wait(1200)
        check(f"{size}: four looks are shown", all(has(f"Look {x}") for x in "ABCD"))
        check(f"{size}: style page fits the screen width", fits())
        page.get_by_role("button", name="Use this look below").nth(2).click(); wait()
        check(f"{size}: choosing look D writes the line to send", has("Style pick: outline thick, shading shaded."))
        page.get_by_role("tab", name="Pets").click(); wait()
        check(f"{size}: menu sample switches tabs", has("Zoomies") and has("Sample pet"))
        shot("styles")

        # 3. Paper map sample: real text labels.
        page.goto(BASE + "/workshop/map"); wait(1200)
        check(f"{size}: map labels are real text", has("The Mighty Bridge") and has("Hermitage Drive") and has("Here be armadillos"))
        check(f"{size}: map says it is not to scale", has("Not to scale"))
        check(f"{size}: map page fits the screen width", fits())
        shot("map")

        # 4. Test street: keyboard play, pause, and the holiday swap.
        page.goto(BASE + "/workshop/street"); wait(1000)
        page.get_by_role("radio", name="Winter example").click(); wait(200)
        check(f"{size}: holiday swap renames the zombie", has("Frosty Shambler"))
        page.get_by_role("radio", name="Everyday").click()
        page.get_by_role("button", name="Start").click(); wait(500)
        check(f"{size}: game starts with a status line", has("Walk right to begin."))
        page.keyboard.down("ArrowRight"); wait(2400); page.keyboard.up("ArrowRight")
        check(f"{size}: walking right starts the first wave", has("Monsters! Bonk them."))
        box = page.get_by_label("Game controls", exact=False).bounding_box()
        check(f"{size}: stage and controls fit on one screen without scrolling", box and box["y"] + box["height"] <= height + 1 and fits())
        shot("street")
        page.get_by_role("button", name="Pause").click(); wait(300)
        check(f"{size}: pause shows a paused card", has("Paused") and has("Start over"))
        page.get_by_role("button", name="Keep playing").first.click(); wait(300)

        # 5. Touch controls: hold a direction with one finger and bonk with another.
        cdp = ctx.new_cdp_session(page)
        mx, my = box["x"] + box["width"] * 0.25 - 40, box["y"] + box["height"] / 2
        bx, by = box["x"] + box["width"] * 0.75, box["y"] + box["height"] / 2
        cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": mx, "y": my, "id": 1}]}); wait(250)
        cdp.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": mx, "y": my, "id": 1}, {"x": bx, "y": by, "id": 2}]}); wait(150)
        shot("touch")
        both = page.evaluate("JSON.stringify([...document.querySelectorAll('[aria-label^=\"Game controls\"] div')].map(e => e.style.transform).filter(Boolean))")
        cdp.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []}); wait(200)
        moved = "translateX(-26px)" in both and "scale(0.94)" in both
        check(f"{size}: two fingers at once: move left and bonk together", moved)

        # 6. Watch it play: the story runs to the rescue without any button.
        page.goto(BASE + "/workshop/street"); wait(1000)
        page.get_by_role("checkbox", name="Watch it play").click()
        page.get_by_role("button", name="Start").click()
        seen = set()
        for _ in range(240):
            wait(500)
            for line in ("The statue is waking up", "is dizzy", "It is a statue again", "The cage is open"):
                if has(line): seen.add(line)
            if has("Thank you for rescuing us"): break
        check(f"{size}: self-play reaches the boss and the rescue", has("Thank you for rescuing us") and has("Fox squirrel") and "The statue is waking up" in seen)
        shot("won")
        check(f"{size}: no script errors", not errors)
        if errors: print(json.dumps(errors[:5], indent=1))

        # 7. Spanish with the largest text.
        page.evaluate("localStorage.setItem('hh.prefs.v1', JSON.stringify({language:'es', textScale:1.3, look:'neutral'}))")
        page.goto(BASE + "/workshop/styles"); wait(1200)
        check(f"{size}: Spanish style page", has("Elija un estilo") and has("Contorno fino, color plano") and fits())
        page.goto(BASE + "/workshop/map"); wait(1000)
        check(f"{size}: Spanish map labels", has("El Puente Poderoso") and has("Las Tierras de la Frontera"))
        shot("map-es")
        page.goto(BASE + "/workshop/street"); wait(1000)
        page.get_by_role("button", name="Empezar").click(); wait(600)
        box = page.get_by_label("Controles del juego", exact=False).bounding_box()
        check(f"{size}: Spanish game with largest text still fits on one screen", has("Camine a la derecha") and box and box["y"] + box["height"] <= height + 1)
        shot("street-es")
        ctx.close()
    browser.close()

failed = [name for name, ok in results if not ok]
print(f"\n{len(results) - len(failed)} of {len(results)} checks passed")
sys.exit(1 if failed else 0)
