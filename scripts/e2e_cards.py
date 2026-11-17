"""
End-to-end check of pet character cards (block 4) on the web build, with
sample data only. Runs at a small Android size and a large iPhone size, then
in Spanish with the largest text. Usage:
  EXPO_NO_BUNDLE_SPLITTING=1 npx expo export --platform web --output-dir /tmp/hh-web
  python3 scripts/serve_web.py /tmp/hh-web 8791 &
  python3 scripts/e2e_cards.py http://127.0.0.1:8791
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
CHROME = sys.argv[2] if len(sys.argv) > 2 else "/usr/bin/google-chrome"
SHOTS = os.environ.get("SHOTS")


def make_photo():
    """An invented test photo carrying a planted GPS tag (a made-up point), to prove the app removes it."""
    from PIL import Image
    path = "/tmp/hh-test-photo-with-gps.jpg"
    img = Image.new("RGB", (2000, 1500), (196, 150, 90))
    exif = Image.Exif()
    exif[0x0110] = "TestPhone 9"  # camera model
    gps = exif.get_ifd(0x8825)
    gps[1], gps[2], gps[3], gps[4] = "N", (30.0, 1.0, 2.0), "W", (97.0, 3.0, 4.0)
    img.save(path, "JPEG", exif=exif)
    raw = open(path, "rb").read()
    assert b"Exif" in raw and b"TestPhone" in raw, "test photo should start with hidden details"
    return path


PHOTO = make_photo()
results = []


def check(name, condition):
    results.append((name, bool(condition)))
    print(("PASS  " if condition else "FAIL  ") + name)


def run(p, width, height, tag):
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    page = browser.new_context(viewport={"width": width, "height": height}, is_mobile=True, has_touch=True).new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    wait = lambda ms=500: page.wait_for_timeout(ms)
    has = lambda text: page.get_by_text(text, exact=False).count() > 0
    btn = lambda name: page.get_by_role("button", name=name, exact=True)
    c = lambda name, cond: check(f"[{tag}] {name}", cond)
    shot = lambda name: page.screenshot(path=os.path.join(SHOTS, f"{tag}-{name}.png"), full_page=True) if SHOTS else None

    def go(path):
        """Moves inside the app without reloading it, the way a tap does. Photos live only in memory in the draft."""
        page.evaluate("p => { window.history.pushState({}, '', p); window.dispatchEvent(new PopStateEvent('popstate')); }", path)
        wait(900)

    def role(name):
        go("/more")
        page.get_by_role("radio", name=name).click(); wait(400)

    # 1. A visitor can look at the album and a card, but not give stickers.
    page.goto(BASE + "/critters/pets"); wait(1400)
    c("album shows pets and wild regulars", has("Neighborhood pets") and has("Wild regulars") and btn("Open Biscuit’s card. Yard Explorer").count() == 1)
    c("approved regulars are in the album", page.get_by_role("button", name="Open Old Blue’s card", exact=False).count() == 1)
    c("a suggestion waiting for a moderator is not shown to others", page.get_by_role("button", name="Open Professor Hoot’s card", exact=False).count() == 0)
    shot("album")
    btn("Open Biscuit’s card. Yard Explorer").click(); wait(1000)
    c("card shows class, stats, favorites, habits and special move", has("Class: Yard Explorer") and page.get_by_label("Snack Power: 5 of 5").count() == 1 and has("Walks · Sticks · Treats") and has("The Parade Trot"))
    c("card shows the top three stickers with counts", has("Goodest · 14") and has("Best hello · 11") and has("Funniest · 9"))
    c("card shows the two newest paw notes and a link to the rest", has("Biscuit walked my kids") and has("por saludar siempre") and not has("He sat so nicely") and btn("See all paw notes (3)").count() == 1)
    c("no real photo of a sample pet", page.get_by_role("img", name="Real photo of Biscuit").count() == 0)
    shot("card")
    btn("Give the Goodest sticker").click(); wait(800)
    c("a visitor giving a sticker is asked to join first", has("Join as a neighbor"))

    # 2. A neighbor gives stickers and writes a paw note.
    role("Neighbor")
    page.goto(BASE + "/critters/pet/pet-biscuit"); wait(1000)
    btn("Give the Goodest sticker").click(); wait(300)
    c("a sticker is given and counted", has("Goodest · 15") and btn("You gave the Goodest sticker").count() == 1)
    btn("You gave the Goodest sticker").click(); wait(300)
    c("tapping again takes it back", has("Goodest · 14"))
    note = page.get_by_label("Write a paw note for Biscuit")
    note.fill("So sweet! Call me at 512 555 0199"); btn("Send the paw note").click(); wait(400)
    c("a note with a phone number is stopped, in plain words", has("Please take out the phone number."))
    note.fill("www.example.com has more dog pics"); btn("Send the paw note").click(); wait(400)
    c("a note with a link is stopped", has("Please take out the link."))
    note.fill("Biscuit carried my newspaper to the door. What a helper!"); btn("Send the paw note").click(); wait(500)
    c("a kind note goes to the family, not straight onto the card", has("Sent to the family") and not has("“Biscuit carried my newspaper"))
    note.fill("One more for Biscuit, he is great"); btn("Send the paw note").click(); wait(400)
    c("one waiting note per pet at a time", has("still waiting for the family"))
    page.get_by_role("button", name="Report this paw note").first.click(); wait(500)
    c("a reported note is hidden from the reporter", not has("Biscuit walked my kids"))
    page.goto(BASE + "/critters/pet/notes?id=pet-biscuit"); wait(900)
    c("see-all lists the remaining notes", has("Paw notes for Biscuit") and has("He sat so nicely"))

    # 3. A family adds a pet, then fills in its card.
    page.goto(BASE + "/critters/pet/new"); wait(900)
    page.get_by_label("Pet’s name").fill("Nutmeg")
    page.get_by_label("About your pet").fill("A sleepy beagle who loves naps")
    page.get_by_role("button", name="Add my pet").last.click(); wait(1100)
    c("saving a new pet opens its card editor", has("Nutmeg’s card") and has("Pick a class"))
    page.get_by_role("radio", name="Snack Bandit").click()
    for _ in range(2):
        btn("More Snack Power").click(); wait(100)
    page.get_by_role("checkbox", name="Treats").click()
    page.get_by_role("checkbox", name="Naps").click()
    page.get_by_label("Habits").fill("Lives at 1234 Sample Drive")
    wait(300)
    c("an address in the card is caught and saving is blocked", has("Please take out anything that looks like an address") and btn("Save the card").is_disabled())
    page.get_by_label("Habits").fill("Sneezes when happy")
    page.get_by_label("Special move").fill("The Sneeze")
    shot("editor")
    btn("Save the card").click(); wait(1000)
    c("the family's choices are on the card", has("Class: Snack Bandit") and page.get_by_label("Snack Power: 5 of 5").count() == 1 and has("Treats · Naps") and has("The Sneeze"))
    c("a family cannot sticker or note its own pet", has("You cannot give your own") and page.get_by_label("Write a paw note for Nutmeg").count() == 0)
    c("the family sees notes waiting for a yes", has("Paw notes waiting for you (2)"))
    btn("Yes, show it").first.click(); wait(400)
    btn("Stop notes from this sender").first.click(); wait(400)
    c("a yes shows the note; a stop hides the other", has("Nutmeg siempre nos alegra") and not has("We love seeing Nutmeg") and not has("Paw notes waiting for you"))
    btn("Take this note down").click(); wait(400)
    c("the family can take an approved note down later", not has("Nutmeg siempre nos alegra"))

    # 4. The family adds a real photo and asks for a portrait.
    btn("Real photo and portrait").click(); wait(1000)
    c("the agreement screen says who sees the photo and names the service", has("portrait maker will see your photo") and has("not chosen yet") and has("must not use your photo to train"))
    c("asking needs a photo first", btn("Ask for a portrait").is_disabled() and has("Choose a photo first."))
    with page.expect_file_chooser() as fc:
        btn("Choose a photo").click()
    fc.value.set_files(PHOTO); wait(1200)
    c("the chosen photo shows to the family", page.get_by_role("img", name="Real photo of Nutmeg").count() == 1)
    kept = page.evaluate("""async () => {
        const img = document.querySelector('[aria-label="Real photo of Nutmeg"] img, img[alt="Real photo of Nutmeg"]')
          || [...document.querySelectorAll('[aria-label="Real photo of Nutmeg"]')].map(e => e.querySelector('img')).find(Boolean);
        const style = [...document.querySelectorAll('[aria-label="Real photo of Nutmeg"] div')].map(d => getComputedStyle(d).backgroundImage).find(b => b && b !== 'none');
        const src = img ? img.src : (style || '').slice(5, -2);
        const bytes = new Uint8Array(await (await fetch(src)).arrayBuffer());
        const text = Array.from(bytes.slice(0, 4096), b => String.fromCharCode(b)).join('');
        return { size: bytes.length, exif: text.includes('Exif'), model: text.includes('TestPhone'), width: src.length > 0 };
    }""")
    c("hidden details (location, phone model) are removed from the kept photo", kept["size"] > 1000 and not kept["exif"] and not kept["model"])
    c("the photo starts private", page.get_by_role("radio", name="Only my family").get_attribute("aria-checked") == "true")
    c("asking needs a yes on the agreement", btn("Ask for a portrait").is_disabled())
    page.get_by_role("checkbox", name="I agree. Send my request to the portrait maker.").click(); wait(200)
    shot("portrait-request")
    btn("Ask for a portrait").click(); wait(600)
    c("the request is sent and the weekly batch is explained", has("Request sent") and has("on Sundays") and btn("Stop the request").count() == 1)

    # 5. The portrait maker works the queue.
    role("Board")
    c("the board sees the portrait maker's page on More", page.get_by_role("button", name="Portrait requests and suggestions", exact=False).count() == 1)
    go("/portraits"); wait(300)
    c("the queue is oldest first, with the sample request on top", has("Waiting (2)") and page.get_by_text("Dog named Pepper").count() == 1 and page.get_by_text("Dog named Nutmeg").count() == 1)
    c("the maker sees the photo while the request is open", page.get_by_role("img", name="Photo sent for a portrait").count() == 1)
    ok = page.get_by_role("button", name="The photo is OK")
    c("the photo cannot pass until every check is ticked", ok.nth(1).is_disabled())
    for label in ["It shows the pet clearly", "No people, faces or reflections", "No house numbers, plates or signs", "Nothing that shows where the family lives"]:
        page.get_by_role("checkbox", name=label).nth(1).click(); wait(100)
    ok.nth(1).click(); wait(500)
    c("what is sent carries no name or place", has("What you send to the picture service") and has("Nothing else: no name, no family, no place"))
    c("only the association's own style samples", has("Never pictures from other games"))
    btn("One more try").click(); wait(200)
    c("tries are counted", has("Tries used: 2"))
    shot("maker")
    btn("Use a sample portrait (draft)").click(); wait(700)
    c("the portrait is added and the spend is recorded", has("Portrait added") and has("This month: $0.08 of $4.00"))
    page.get_by_role("button", name="Send back: There are people in the photo.").first.click(); wait(500)
    c("a photo can be sent back with a reason", has("The portrait maker sent your photo back"))
    c("one wild regular waits for a moderator", has("Wild regulars to check (1)") and has("Professor Hoot"))
    btn("Approve").click(); wait(500)
    c("approving clears the suggestion", has("Wild regulars to check (0)"))

    # 6. Back as the family: portrait on the card, private photo deleted.
    role("Neighbor")
    go("/critters/pets")
    c("the approved regular is now in the album", page.get_by_role("button", name="Open Professor Hoot’s card", exact=False).count() == 1)
    btn("Open Nutmeg’s card. Snack Bandit").click(); wait(1000)
    c("the card shows the portrait", has("Sample portrait") and page.get_by_role("img", name="Portrait of Nutmeg").count() >= 1)
    shot("card-portrait")
    btn("Real photo and portrait").click(); wait(900)
    c("the family is told the portrait is ready", has("Your portrait is ready"))
    c("the private photo was deleted when the portrait was done", page.get_by_role("img", name="Real photo of Nutmeg").count() == 0)

    # 6b. A family's card is for verified neighbors, and two reports hide a card.
    role("Visitor")
    go("/critters/pets")
    c("signed-out visitors do not see cards that families made", page.get_by_role("button", name="Open Nutmeg’s card", exact=False).count() == 0 and btn("Open Biscuit’s card. Yard Explorer").count() == 1)
    role("Neighbor")
    go("/critters/pet/pet-olive")
    btn("Report this card").click(); wait(500)
    c("reporting a card is acknowledged", has("Thank you for telling us"))
    go("/critters/pets")
    c("a card with two reports is hidden until a moderator checks it", page.get_by_role("button", name="Open Olive’s card", exact=False).count() == 0)

    # 7. A wild regular's card and a suggestion.
    page.goto(BASE + "/critters/regular/reg-oldblue"); wait(1000)
    c("a regular shows a shared place and a keep-your-distance note", has("Often seen at: The creek") and has("Look from a distance"))
    c("a regular has no paw notes and no real photo", page.get_by_label("Write a paw note for Old Blue").count() == 0 and not has("Real photo"))
    page.goto(BASE + "/critters/regular/new"); wait(1000)
    c("animals that can hurt are not on the list", page.get_by_role("radio", name="Texas coral snake").count() == 0 and page.get_by_role("radio", name="Raccoon").count() == 0)
    c("only shared places to pick", page.get_by_role("radio", name="A yard").count() == 0 and page.get_by_role("radio", name="The creek").count() == 1)
    page.get_by_role("radio", name="Northern cardinal").click()
    page.get_by_label("A friendly name").fill("Red Rocket")
    page.get_by_label("What is it like?").fill("Sings from the top of the park oak")
    page.get_by_role("radio", name="The park").click()
    btn("Send to a moderator").click(); wait(600)
    c("a suggestion goes to a moderator", has("Thank you!") and has("A moderator will check it"))

    # 8. Delete my information removes the family's card too.
    page.goto(BASE + "/privacy"); wait(900)
    btn("Delete my information").click(); wait(300)
    btn("Yes, delete it").click(); wait(800)
    page.goto(BASE + "/critters/pets"); wait(1000)
    c("after delete, the family's pet and suggestion are gone", page.get_by_role("button", name="Open Nutmeg’s card", exact=False).count() == 0 and page.get_by_role("button", name="Open Red Rocket’s card", exact=False).count() == 0)

    c("no page errors", not errors)
    if errors:
        print("\n".join(errors[:5]))
    browser.close()


def run_spanish(p):
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    page = browser.new_context(viewport={"width": 360, "height": 640}, is_mobile=True, has_touch=True).new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    wait = lambda ms=500: page.wait_for_timeout(ms)
    has = lambda text: page.get_by_text(text, exact=False).count() > 0
    c = lambda name, cond: check(f"[es-largest] {name}", cond)
    page.goto(BASE + "/settings"); wait(1000)
    page.get_by_role("radio", name="Español").click(); wait(400)
    page.get_by_role("radio", name="Muy grande").click(); wait(400)
    page.goto(BASE + "/critters/pet/pet-duke"); wait(1200)
    c("the card is in Spanish", has("Clase: Guardián del sofá") and page.get_by_label("Valentía: 5 de 5").count() == 1 and has("Notas de patita"))
    c("stickers are in Spanish", has("Pura ternura · 16"))
    if SHOTS:
        page.screenshot(path=os.path.join(SHOTS, "es-largest-card.png"), full_page=True)
    # Nothing on the card is wider than the screen at the largest text.
    # Only elements that hold words count; the app keeps empty, off-screen layers for page changes.
    spill = page.evaluate("() => [...document.querySelectorAll('div,span')].filter(e => (e.innerText || '').trim() && e.offsetParent !== null).filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).map(e => e.innerText.slice(0, 30))")
    c("no words spill off the side of a small screen", not spill)
    if spill:
        print(spill[:5])
    page.goto(BASE + "/critters/pets"); wait(1200)
    spill = page.evaluate("() => [...document.querySelectorAll('div,span')].filter(e => (e.innerText || '').trim() && e.offsetParent !== null).filter(e => e.getBoundingClientRect().right > window.innerWidth + 1).length")
    c("the album fits a small screen at the largest text", spill == 0)
    page.goto(BASE + "/critters/pet/portrait?id=pet-duke"); wait(900)
    c("a neighbor cannot open another family's photo page", has("Solo la familia de la mascota puede cambiar su tarjeta."))
    c("no page errors", not errors)
    browser.close()


with sync_playwright() as p:
    run(p, 360, 640, "360x640")
    run(p, 430, 932, "430x932")
    run_spanish(p)

failed = [n for n, ok in results if not ok]
print(f"\n{len(results) - len(failed)} of {len(results)} passed")
sys.exit(1 if failed else 0)
