"""
End-to-end check of Critter Club's map game (block 3) on the web build.
Needs Python Playwright and Chrome. Usage:
  EXPO_NO_BUNDLE_SPLITTING=1 npx expo export --platform web --output-dir /tmp/hh-web
  python3 scripts/serve_web.py /tmp/hh-web 8791 &
  python3 scripts/e2e_world.py http://127.0.0.1:8791
Runs at a small Android size and a large iPhone size, then in Spanish with the
largest text, and once with reduced motion.
"""
import re
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
CHROME = sys.argv[2] if len(sys.argv) > 2 else "/usr/bin/google-chrome"
results = []


def check(name, condition):
    results.append((name, bool(condition)))
    print(("PASS  " if condition else "FAIL  ") + name)


def run(p, width, height, tag, motion="no-preference"):
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": width, "height": height}, is_mobile=True, has_touch=True, reduced_motion=motion)
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    wait = lambda ms=500: page.wait_for_timeout(ms)
    has = lambda text: page.get_by_text(text, exact=False).count() > 0
    btn = lambda name: page.get_by_role("button", name=name)
    c = lambda name, cond: check(f"[{tag}] {name}", cond)

    page.goto(BASE + "/critters"); wait(1500)
    c("title screen has the sign, the story and one big start button", has("A Heritage Hills adventure") and has("The story") and btn("Start the adventure").count() == 1)
    c("title screen has no menu bar", page.get_by_role("tab", name="Map").count() == 0)
    btn("Start the adventure").click(); wait(1500)
    c("the first time, Dilly says hello and gives the first quest", has("Dilly the Armadillo") and has("I am Dilly") and has("visit four places"))
    btn("Close").click(); wait(400)
    c("the map opens with places as buttons", btn("The Creek. Calm place").count() == 1 and btn("Frontier Trail. Rescue mission").count() == 1)
    c("the traveler starts at the statue", btn("The Iron Triceratops. Calm place. You are here").count() == 1)
    c("the map has a text description", page.get_by_role("img", name="Storybook map of Heritage Hills").count() == 1)
    c("the menu bar is there", page.get_by_role("tab", name="Field guide").count() == 1)

    # Travel to the creek: the token walks, then the card opens with the host.
    btn("The Creek. Calm place").click(); wait(300)
    if motion == "reduce":
        c("with reduced motion, travel is instant", has("Hazel the Heron"))
    else:
        c("the traveler walks along the roads first", has("Walking to The Creek") and not has("Hazel the Heron"))
        wait(2800)
    c("arriving opens the creek card with its host saying hello", has("Hazel the Heron") and has("I am Hazel") and has("What you can do here"))
    btn("Look around. Animals often seen at the creek").click(); wait(500)
    seen = page.get_by_role("button", name=re.compile(r"\. Seen (often|sometimes|rarely)"))
    c("look around lists animals seen at the creek", seen.count() >= 3)
    first = seen.first.get_attribute("aria-label").split(".")[0]
    seen.first.click(); wait(1200)
    c("the animal page starts with the creek picked", page.get_by_role("radio", name="The creek").get_attribute("aria-checked") == "true")
    btn("I spotted it!").click(); wait(600)
    page.goto(BASE + "/critters/world"); wait(1500)
    c("the hero is still at the creek after leaving", btn("The Creek. Calm place. You are here").count() == 1)
    btn("The Creek. Calm place. You are here").click(); wait(800)
    c("the heron's quest is done and has a reward", has("You were patient and quiet") and btn("Collect 15 points").count() == 1)
    btn("Collect 15 points").click(); wait(600)
    btn("Close").click(); wait(400)
    c("collecting the reward adds experience", has("You got 15 points!"))
    btn("The Creek. Calm place. You are here").click(); wait(600)
    c("the heron has nothing left to ask", has("You have done everything I asked"))
    btn("Close").click(); wait(300)

    # A rescue place opens the rescue game; a future one says so.
    btn("Frontier Trail. Rescue mission").click(); wait(3200)
    c("a rescue place explains the cartoon tone and starts the rescue", has("Cartoon bonks only") and btn("Start the rescue").count() == 1)
    btn("Start the rescue").click(); wait(1500)
    c("starting the rescue opens the Frontier Trail level", "/brawler" in page.url and "frontier-trail" in page.url)
    page.goto(BASE + "/critters/world"); wait(1500)
    btn("The Roaring Wall. Rescue mission").click(); wait(3200)
    c("a rescue place with no level yet says it is coming later", has("coming later") and btn("Start the rescue").count() == 0)
    btn("Close").click(); wait(300)
    btn("Hart Elementary. Landmark").click(); wait(3200)
    c("the school is a quiet landmark with nothing to do", has("quiet place") and has("Nothing to do here"))
    btn("Close").click(); wait(300)

    # Patterns on the map.
    page.get_by_role("radio", name="Birds").click(); wait(500)
    c("picking birds shows the creek count and the shares around the neighborhood", has("at the creek") and has("Around the neighborhood") and has("never shows them as spots"))
    c("patterns say wild animals only", has("Never pets"))

    # Zoom and the list.
    btn("Zoom in").click(); wait(600)
    c("zooming in shows street names", has("Loralinda Dr") or has("Hermitage Dr"))
    btn("Zoom out").click(); wait(400)
    page.get_by_role("radio", name="List").click(); wait(500)
    c("the list shows the same places", btn("The Mighty Bridge. Calm place").count() == 1 and btn("Garden site. Calm place").count() == 1)
    btn("The Mighty Bridge. Calm place").click(); wait(800)
    c("going from the list opens the place card at once", has("Mo the Mockingbird") and has("Detective cases"))
    btn("Close").click(); wait(300)

    # Quest log and menu bar.
    page.get_by_role("tab", name="Quests").click(); wait(1000)
    c("quest log shows the finished quest and the next ones", has("A creek sighting") and has("Finished") and has("Three bird songs"))
    c("quests not met yet stay a surprise", has("???") and has("to meet"))
    page.get_by_role("tab", name="Field guide").click(); wait(1000)
    c("field guide is an item grid with found and unknown slots", btn(f"{first}. Found").count() == 1 and btn("Gulf Coast toad. Not found yet").count() == 1)
    page.get_by_role("tab", name="More").click(); wait(800)
    c("every activity is reachable from a plain list", all(btn(n).count() >= 1 for n in ["Field guide. Every critter you can find", "Detective cases. Solve a mystery about an animal", "Backyard bingo. Find three in a row", "Neighborhood tally. What we have found together", "Patterns. Where and when animals are seen", "Pet pals. Meet the dogs, cats and other pets of the neighborhood", "How to play kindly. Look, do not touch. Photos of animals only."]))
    btn("Garden site. Calm place").click(); wait(1500)
    c("a place picked from the plain list opens on the map", has("Buzz the Bumblebee") and "/critters/world" in page.url)

    # Saved, and erased by "Delete my information".
    page.goto(BASE + "/critters/world"); wait(1500)
    c("the map game is saved on this phone", btn("Garden site. Calm place. You are here").count() == 1)
    page.goto(BASE + "/privacy"); wait(1000)
    btn("Show my information").click(); wait(600)
    c("show my information includes the map game", has('"mapGame"') and has('"visited"'))
    btn("Delete my information").click(); wait(300)
    btn("Yes, delete it").click(); wait(600)
    page.goto(BASE + "/critters/world"); wait(1500)
    c("delete also clears the map game", btn("The Iron Triceratops. Calm place. You are here").count() == 1 and has("0 points"))
    c("no page errors", len(errors) == 0)
    if errors:
        print(errors[:3])
    browser.close()


def run_spanish(p):
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    page = browser.new_context(viewport={"width": 360, "height": 640}, is_mobile=True, has_touch=True).new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    wait = lambda ms=500: page.wait_for_timeout(ms)
    has = lambda text: page.get_by_text(text, exact=False).count() > 0
    page.goto(BASE + "/settings"); wait(1000)
    page.get_by_role("radio", name="Español").click(); wait(400)
    page.get_by_role("radio", name="Muy grande").click(); wait(400)
    page.goto(BASE + "/critters"); wait(1200)
    check("[es] title screen is in Spanish", has("Una aventura en Heritage Hills") and page.get_by_role("button", name="Empezar la aventura").count() == 1)
    page.get_by_role("button", name="Empezar la aventura").click(); wait(1500)
    check("[es] Dilly greets in Spanish", has("Dilly el Armadillo") and has("Soy Dilly"))
    page.get_by_role("button", name="Cerrar").click(); wait(400)
    check("[es] the map's places are in Spanish", page.get_by_role("button", name="El Arroyo. Lugar tranquilo").count() == 1 and page.get_by_role("tab", name="Guía de campo").count() == 1)
    page.get_by_role("button", name="El Arroyo. Lugar tranquilo").click(); wait(3200)
    check("[es] the host speaks Spanish", has("Hazel la Garza") and has("Qué puede hacer aquí"))
    # With the largest text, the card's close button and the menu still fit on screen.
    close = page.get_by_role("button", name="Cerrar").bounding_box()
    check("[es] the close button is on screen and big enough", close is not None and close["x"] + close["width"] <= 360 and close["height"] >= 44)
    check("[es] no page errors", len(errors) == 0)
    browser.close()


with sync_playwright() as p:
    run(p, 360, 640, "small Android")
    run(p, 430, 932, "large iPhone")
    run(p, 360, 640, "reduced motion", motion="reduce")
    run_spanish(p)

failed = [n for n, ok in results if not ok]
print(f"\n{len(results) - len(failed)} of {len(results)} passed")
sys.exit(1 if failed else 0)
