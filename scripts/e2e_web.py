"""
End-to-end check of the main journeys on the web build.
Needs Python Playwright and Chrome. Usage:
  EXPO_NO_BUNDLE_SPLITTING=1 npx expo export --platform web --output-dir /tmp/hh-web
  python3 scripts/serve_web.py /tmp/hh-web 8791 &
  python3 scripts/e2e_web.py http://127.0.0.1:8791
"""
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1]
CHROME = sys.argv[2] if len(sys.argv) > 2 else "/usr/bin/google-chrome"
results = []


def check(name, condition):
    results.append((name, bool(condition)))
    print(("PASS  " if condition else "FAIL  ") + name)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    page = browser.new_context(viewport={"width": 360, "height": 740}, is_mobile=True, has_touch=True).new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    wait = lambda ms=500: page.wait_for_timeout(ms)
    has = lambda text: page.get_by_text(text, exact=False).count() > 0

    # 1. A visitor can read public content with no account.
    page.goto(BASE + "/"); wait(1200)
    check("home shows alerts and events to a visitor", has("Creek trail closed") and has("Coming up"))
    check("draft banner is visible", has("First draft"))
    page.goto(BASE + "/resources"); wait(800)
    check("resources show a checked date and official link", has("Last checked") and has("Open the official page"))
    page.goto(BASE + "/ecosystem/creek"); wait(800)
    check("ecosystem article is labeled a draft", has("This page is a draft"))

    # 2. Tabs work.
    page.goto(BASE + "/"); wait(800)
    page.get_by_role("tab", name="Nature").click(); wait()
    check("nature tab opens", has("We are stewards of this place"))
    page.get_by_role("tab", name="Events").click(); wait()
    check("events tab opens", has("Gatherings and association meetings"))

    # 2b. Critter Club: a visitor can play with no account.
    page.goto(BASE + "/"); wait(1000)
    page.get_by_role("button", name="Start exploring").click(); wait(800)
    check("game title screen opens for a visitor", has("A Heritage Hills adventure") and page.get_by_role("button", name="Start the adventure").count() == 1)
    page.get_by_role("button", name="Start the adventure").click(); wait(1200)
    check("the map opens with the first rank", has("Curious Neighbor") and has("0 points"))
    page.goto(BASE + "/critters/guide"); wait(800)
    page.get_by_role("button", name="Fox squirrel. Not found yet").click(); wait(800)
    check("animal page shows a fact and a draft label", has("Did you know?") and has("Draft"))
    page.get_by_role("radio", name="The park").click()
    page.get_by_role("button", name="I spotted it!").click(); wait()
    check("first sighting is a new find worth 25 points", has("New find!") and has("You earned 25 points."))
    page.get_by_role("button", name="I spotted it!").click(); wait()
    check("second sighting is a repeat worth 5 points", has("Spotted again") and has("You earned 5 points."))
    page.goto(BASE + "/critters/coralsnake"); wait(800)
    check("dangerous animals carry a warning", has("Look, do not touch") and has("Venomous"))
    page.goto(BASE + "/critters/pet/pet-biscuit"); wait(800)
    check("pet page shows how to say hello", has("How to say hello"))
    page.get_by_role("button", name="I met Biscuit!").click(); wait()
    check("meeting a pet is recorded", has("You met Biscuit!"))
    page.get_by_label("Write a paw note for Biscuit").fill("Biscuit carried my newspaper to the door.")
    page.get_by_role("button", name="Send the paw note").click(); wait(800)
    check("sending a paw note needs sign-in", has("Join as a neighbor"))
    # Detective case, played the old-school way: witnesses, travel, notebook, name the culprit.
    page.goto(BASE + "/critters/case/case-porch"); wait(800)
    check("a case opens with a case file and a deadline", has("CASE FILE") and has("You have 24 hours"))
    page.get_by_role("button", name="Take the case").click(); wait()
    check("the clock starts Saturday at 8", has("Saturday, 8:00") and has("24 hours left"))
    check("travel is locked until a witness is asked", page.get_by_role("button", name="Go to: Street trees").is_disabled())
    page.get_by_role("button", name="Ask: A nervous moth").click(); wait()
    check("a witness gives a clue and costs an hour", has("It only comes out after dark") and has("23 hours left"))
    page.get_by_role("button", name="Go to: The creek").click(); wait()
    check("a wrong turn costs four hours", has("No sign of it there") and has("19 hours left"))
    page.goto(BASE + "/critters/case/case-holes"); wait(800)
    page.get_by_role("button", name="Take the case").click(); wait()
    page.get_by_role("button", name="Ask: Pepper the dog").click(); wait()
    page.get_by_role("button", name="Go to: The park").click(); wait()
    check("the right way moves to the next stop", has("STOP 2 OF 3") and has("21 hours left"))
    page.get_by_role("button", name="Ask: A screech-owl").click(); wait()
    page.get_by_role("button", name="Go to: The creek").click(); wait()
    page.get_by_role("button", name="Ask: A leopard frog").click(); wait()
    check("the last stop asks who it was", has("STOP 3 OF 3") and has("Who was it?"))
    page.get_by_role("button", name="Name the culprit").click(); wait()
    check("too many suspects sends the detective back to the notebook", has("suspects is too many"))
    page.get_by_role("radiogroup", name="Kind of animal").get_by_role("radio", name="Mammals").click(); wait(200)
    page.get_by_role("radiogroup", name="Awake during").get_by_role("radio", name="The night").click(); wait(200)
    page.get_by_role("radiogroup", name="Size").get_by_role("radio", name="Up to cat size").click(); wait(300)
    check("the notebook narrows the suspects", not has("suspects is too many") and page.get_by_role("button", name="Armadillo").count() == 1)
    page.get_by_role("button", name="Armadillo").click(); wait()
    check("a quick solve earns 30 points", has("CASE SOLVED") and has("Case closed!") and has("You earned 30 points."))
    page.goto(BASE + "/critters/patterns"); wait(800)
    check("patterns page shows where and when, with its limits", has("Where it is seen") and has("Time of day") and has("not a science study"))
    check("patterns are about wild animals only", has("Wild animals only") and has("never record addresses"))
    page.get_by_role("radio", name="Raccoon").click(); wait()
    check("an animal's day path is shown", has("Through the day") and has("different places as the day goes on"))
    page.goto(BASE + "/critters/armadillo"); wait(800)
    check("an animal page links to real photos", has("See real photos") and has("Dasypus novemcinctus"))
    check("a real photo is only loaded when asked", has("Show a real photo") and has("iNaturalist.org"))
    page.get_by_role("button", name="Show a real photo").click(); wait(2500)
    # The test machine has no route to the photo site, so this checks the safe fallback.
    check("without the photo site, the page explains and keeps the link", (has("could not be loaded") or has("No free-to-share photo") or page.get_by_role("img", name="Real photo of").count() == 1) and has("See real photos"))
    page.goto(BASE + "/critters/bingo"); wait(800)
    boxes = page.get_by_role("checkbox")
    for i in range(3):
        boxes.nth(i).click(); wait(200)
    check("three in a row is a bingo", has("Bingo! Lines finished: 1"))
    page.goto(BASE + "/critters/tally"); wait(800)
    check("neighborhood tally adds my two sightings to the shared total", has("424"))
    check("tally has no scoreboard of people", has("We count animals, not people"))
    page.goto(BASE + "/critters/quests"); wait(1000)
    # 30 sightings + 10 pet + 30 case + 15 squares + 25 line = 110 (no quest rewards collected yet)
    check("points add up and the rank rises", has("110 points") and has("Trail Scout"))
    check("badges are earned", page.get_by_label("First Find. Earned").count() == 1 and page.get_by_label("Case Closed. Earned").count() == 1)
    page.reload(); wait(1200)
    check("game progress survives a reload", has("110 points"))

    # 3. RSVP as a visitor leads to sign-in; after sign-in the RSVP works.
    page.goto(BASE + "/event/e-creek"); wait(800)
    page.get_by_role("button", name="I am going").click(); wait(800)
    check("visitor is sent to sign-in", has("Join as a neighbor"))
    check("send-code is disabled until email and age are given", page.get_by_role("button", name="Send my code").is_disabled())
    page.get_by_label("Your email address").fill("sample@example.org")
    page.get_by_role("checkbox", name="I am 18 or older").click()
    page.get_by_role("button", name="Send my code").click(); wait()
    page.get_by_label("6-digit code").fill("123456")
    page.get_by_role("button", name="Continue").click(); wait()
    page.get_by_label("Household code").fill("AB12")
    page.get_by_role("button", name="Confirm my household").click(); wait()
    check("sign-in finishes", has("Welcome, neighbor"))
    page.get_by_role("button", name="Continue").click(); wait(800)
    page.get_by_role("button", name="I am going").click(); wait()
    check("neighbor can RSVP", has("You are going"))
    check("going count went up by one", has("12 neighbors are going"))
    page.get_by_role("button", name="Change my answer").click(); wait()
    check("RSVP can be undone", page.get_by_role("button", name="I am going").count() == 1)

    # 4. Share shelf: borrow request is accepted, then a report hides an item.
    page.goto(BASE + "/share/s-drill"); wait(800)
    page.get_by_role("button", name="Ask to borrow").click(); wait(300)
    check("borrow request is sent", has("Request sent"))
    wait(3000)
    check("owner acceptance reveals chosen contact only", has("The owner said yes"))
    page.goto(BASE + "/share/s-blocks"); wait(800)
    page.get_by_role("button", name="Report this item").click(); wait()
    check("report is acknowledged", has("Thank you for telling us"))
    page.goto(BASE + "/share"); wait(800)
    check("item with two reports is hidden from the shelf", not has("Wooden building blocks"))

    # 5. Lend an item.
    page.get_by_role("button", name="Lend something").click(); wait(800)
    page.get_by_label("What is it?").fill("Hand saw")
    page.get_by_role("button", name="Add to the shelf").click(); wait(800)
    check("new item appears on the shelf as yours", has("Hand saw") and has("Yours"))

    # 6. Garden interest list.
    page.goto(BASE + "/garden"); wait(800)
    check("garden is labeled a proposal", has("This is a proposal"))
    page.get_by_role("checkbox", name="I can help build").click()
    page.get_by_role("button", name="Join the interest list").click(); wait()
    check("garden interest is saved", has("You are on the interest list"))

    # 7. Poll vote and decision record.
    page.goto(BASE + "/association"); wait(800)
    page.get_by_role("button", name="Creek cleanup").click(); wait()
    check("poll shows totals after voting", has("your choice"))
    page.goto(BASE + "/decisions"); wait(800)
    page.get_by_role("button", name="Check the record").click(); wait()
    check("decision record verifies", has("No entry was changed (entries 1 to 3)"))

    # 8. Privacy: default is nobody, can change, can delete.
    page.goto(BASE + "/privacy"); wait(800)
    first = page.get_by_role("radiogroup", name="My first name")
    check("sharing defaults to nobody", first.get_by_role("radio", name="Nobody").get_attribute("aria-checked") == "true")
    first.get_by_role("radio", name="Verified neighbors").click(); wait()
    check("privacy choice is recorded", has("Privacy choices you have made: 1"))
    page.reload(); wait(1200)
    check("choices survive a reload", has("Privacy choices you have made: 1"))
    page.get_by_role("button", name="Delete my information").click(); wait(300)
    page.get_by_role("button", name="Yes, delete it").click(); wait()
    check("delete returns the person to visitor", has("The app knows nothing about you"))
    page.goto(BASE + "/critters/quests"); wait(1000)
    check("delete also clears game progress", has("0 points"))

    # 9. Board: two-approver rule.
    page.goto(BASE + "/more"); wait(800)
    page.get_by_role("radio", name="Board").click(); wait()
    page.get_by_role("button", name="Board tools").click(); wait(800)
    page.get_by_label("Title").fill("Park cleanup moved to Sunday")
    page.get_by_label("Message").fill("Rain is expected Saturday. Meet Sunday at 9 instead.")
    page.get_by_role("button", name="Ask a second officer to confirm").click(); wait()
    page.get_by_role("button", name="Try to confirm it myself").click(); wait()
    check("an officer cannot confirm their own alert", has("You cannot confirm your own alert"))
    page.get_by_role("button", name="Confirm as a second officer (demo)").click(); wait()
    check("a second officer can confirm", has("The alert was posted"))
    page.goto(BASE + "/alerts"); wait(800)
    check("posted alert appears in alerts", has("Park cleanup moved to Sunday"))

    # 10. Language switch.
    page.goto(BASE + "/settings"); wait(800)
    page.get_by_role("radio", name="Español").click(); wait()
    check("interface switches to Spanish", has("Idioma y tamaño de letra"))
    page.goto(BASE + "/"); wait(1000)
    check("content switches to Spanish", has("Sendero del arroyo cerrado") and has("Inicio"))
    page.reload(); wait(1200)
    check("language choice survives a reload", has("Inicio"))

    check("no page errors", not errors)
    if errors:
        print(errors[:5])
    browser.close()

failed = [name for name, ok in results if not ok]
print(f"\n{len(results) - len(failed)} of {len(results)} passed")
sys.exit(1 if failed else 0)
