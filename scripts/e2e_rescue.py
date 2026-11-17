"""
End-to-end check of Critter Rescue (block 2) on the web build.
Usage, after exporting and serving the web build as in e2e_web.py:
  python3 scripts/e2e_rescue.py http://127.0.0.1:8791 [chrome path] [screenshot dir]
Runs at a small Android size and a large iPhone size, then in Spanish with the
largest text. Plays the whole level start to finish with "Watch it play".
"""
import json
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
CHROME = sys.argv[2] if len(sys.argv) > 2 else "/usr/bin/google-chrome"
SHOTS = sys.argv[3] if len(sys.argv) > 3 else None
SIZES = {"small-android": (360, 640), "large-iphone": (430, 932)}
results = []

# Counts the sounds the page makes, without changing how they play.
COUNT_SOUNDS = """
(() => {
  window.__sounds = 0;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const make = Ctx.prototype.createOscillator;
  Ctx.prototype.createOscillator = function () { window.__sounds += 1; return make.call(this); };
})();
"""


def check(name, condition):
    results.append((name, bool(condition)))
    print(("PASS  " if condition else "FAIL  ") + name)


def run(browser, label, width, height, prefs=None):
    ctx = browser.new_context(viewport={"width": width, "height": height}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(COUNT_SOUNDS)
    if prefs:
        ctx.add_init_script(f"localStorage.setItem('hh.prefs.v1', {json.dumps(json.dumps(prefs))});")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    wait = lambda ms=500: page.wait_for_timeout(ms)
    has = lambda text: page.get_by_text(text, exact=False).count() > 0
    shot = lambda name: SHOTS and page.screenshot(path=f"{SHOTS}/{label}-{name}.png")
    fits = lambda: page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
    return ctx, page, errors, wait, has, shot, fits


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox", "--autoplay-policy=no-user-gesture-required"])
    for size, (width, height) in SIZES.items():
        ctx, page, errors, wait, has, shot, fits = run(browser, size, width, height)

        # 1. Two taps from the More tab.
        page.goto(BASE + "/"); wait(1200)
        page.get_by_role("tab", name="More").click(); wait()
        page.get_by_role("button", name="Critter Rescue", exact=False).first.click(); wait(900)
        check(f"{size}: Critter Rescue opens from the More tab", has("The Frontier Trail") and has("Choose your hero") and has("How to play"))
        check(f"{size}: title says where the level is on the map", has("The Frontier Lands"))
        check(f"{size}: the cast and the stamps are shown", has("Shambler") and has("The Iron Triceratops") and has("No stamps yet"))
        check(f"{size}: title page fits the screen width", fits())
        shot("title")

        # 2. Choosing a hero is remembered.
        page.get_by_role("radio", name="Flor", exact=False).click(); wait(300)
        check(f"{size}: Flor can be chosen", page.get_by_role("radio", name="Flor", exact=False).get_attribute("aria-checked") == "true")
        page.reload(); wait(1500)
        check(f"{size}: the chosen hero is remembered after a reload", page.get_by_role("radio", name="Flor", exact=False).get_attribute("aria-checked") == "true")

        # 3. Playing by hand: keyboard, sounds, sound off, pause.
        page.get_by_role("button", name="Play", exact=True).click(); wait(600)
        check(f"{size}: the game starts with a status line and Flor's score bar", has("Walk right to begin.") and page.get_by_label("Flor. Health", exact=False).count() > 0)
        page.keyboard.down("ArrowRight"); wait(2600); page.keyboard.up("ArrowRight")
        check(f"{size}: walking right starts the first fight", has("Monsters! Bonk them."))
        for _ in range(6):
            page.keyboard.press(" "); wait(120)
        made = page.evaluate("window.__sounds")
        check(f"{size}: bonking makes sounds", made > 0)
        controls = page.get_by_label("Game controls", exact=False).bounding_box()
        check(f"{size}: score bar, stage and controls fit on one screen", controls and controls["y"] + controls["height"] <= height + 1 and fits())
        shot("play")
        page.get_by_role("switch", name="Sound").click(); wait(200)
        before = page.evaluate("window.__sounds")
        for _ in range(6):
            page.keyboard.press(" "); wait(120)
        check(f"{size}: with sound off the game is silent", page.evaluate("window.__sounds") == before)
        page.keyboard.press("p"); wait(300)
        check(f"{size}: P pauses, with a way out", has("Paused") and has("Leave the game") and has("Start the level over"))
        page.get_by_role("button", name="Leave the game").click(); wait(500)
        check(f"{size}: leaving goes back to the title", has("Choose your hero"))
        check(f"{size}: sound off was remembered", page.get_by_role("radio", name="Sound off").get_attribute("aria-checked") == "true")

        # 4. The whole level, start to finish, with "Watch it play".
        page.get_by_role("radio", name="Sound on").click()
        page.get_by_role("checkbox", name="Watch it play", exact=False).click(); wait(200)
        page.get_by_role("button", name="Play", exact=True).click(); wait(500)
        saw = {"boss": False, "thanks": False}
        for _ in range(240):
            wait(500)
            if not saw["boss"] and page.get_by_label("The Iron Triceratops.", exact=False).count() > 0:
                saw["boss"] = True
                shot("boss")
            if not saw["thanks"] and has("Thank you for rescuing us!"):
                saw["thanks"] = True
                shot("rescue")
            if has("Critters rescued!"):
                break
        check(f"{size}: the statue wakes and shows its health bar", saw["boss"])
        check(f"{size}: the critters say thank you", saw["thanks"])
        check(f"{size}: the level plays start to finish", has("Critters rescued!"))
        check(f"{size}: the rescue card shows a fact for each critter", has("Did you know?") and has("Armadillo") and has("Fox squirrel") and has("cottontail"))
        check(f"{size}: three new stamps", page.get_by_text("New stamp", exact=False).count() == 3)
        check(f"{size}: rescue card fits the screen width", fits())
        shot("end")
        page.get_by_role("button", name="Back to the start").click(); wait(600)
        check(f"{size}: the title now shows 3 of 3 stamps and a best score", has("3 of 3 critters rescued") and has("Best score"))

        # 5. A direct link, as block 3's map will use.
        page.goto(BASE + "/brawler?level=frontier-trail"); wait(1200)
        check(f"{size}: a direct link opens the level", has("The Frontier Trail"))
        check(f"{size}: no page errors", not errors)
        if errors:
            print("   ", errors[:3])
        ctx.close()

    # 6. Spanish with the largest text, small screen.
    ctx, page, errors, wait, has, shot, fits = run(browser, "es-large", 360, 640, {"language": "es", "textScale": 1.3, "look": "neutral"})
    page.goto(BASE + "/brawler"); wait(1500)
    check("es-large: title in Spanish", has("Rescate de Animalitos") and has("El Sendero de la Frontera") and has("Elija su héroe"))
    check("es-large: title fits the screen width", fits())
    shot("title")
    page.get_by_role("button", name="Jugar", exact=True).click(); wait(700)
    check("es-large: game in Spanish", has("Camine") or has("camine") or page.get_by_label("Controles", exact=False).count() > 0)
    controls = page.get_by_label("Controles", exact=False).bounding_box()
    check("es-large: game fits the screen width", fits())
    check("es-large: controls still on screen", controls is not None and controls["y"] < 640)
    shot("play")
    check("es-large: no page errors", not errors)
    ctx.close()
    browser.close()

passed = sum(1 for _, ok in results if ok)
print(f"\n{passed} of {len(results)} checks passed")
sys.exit(0 if passed == len(results) else 1)
