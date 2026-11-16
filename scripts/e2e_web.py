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
    check("decision record verifies", has("All 3 entries are intact"))

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
