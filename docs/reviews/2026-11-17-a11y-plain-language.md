# Heritage Hills app: accessibility, plain-language and Spanish review

Independent review of the frozen snapshot `/home/claude/review-snapshot` (commit 4d4a9e9, base app plus blocks 1 to 4).
Reviewer did not write this code. Date: 2026-11-17. Status: COMPLETE (two reviewer sessions; the first was stopped by a server restart).

Method: the project skill `hh-plain-language-a11y-review` plus the block-5 checklist. Code read by hand; rendered checks with Playwright on the web build at http://127.0.0.1:8791; scripts in `/home/claude/reviews/tools-a11y/`.

Scripts and raw results (all in `/home/claude/reviews/tools-a11y/`): `audit.py` -> `audit.json`, `audit-normal.json` (axe-core, target sizes, overflow; 22 routes x 4 setups: 360x640 light EN normal and 1.3x, 430x932 dark ES 1.3x, 360x640 dark ES 1.3x); `journeys2.py` -> `journeys2.json` (tap counts, focus, live regions); `kb.py` -> `kb.json` (keyboard, axe on 8 more routes light and dark, dark brawler); `zoom200.py` -> `zoom200-es.json` (about 200% text); `contrast.mts`, `contrast2.mts` (color pairs); `strings.mts` -> `strings.json`, `all-strings.tsv` (1,790 strings); screenshots in `shots/`.

## 1. Summary

| Severity | Accessibility (A) | Plain language (P) | Spanish (E) | Total |
|---|---|---|---|---|
| High | 3 | 2 | 0 | **5** |
| Medium | 13 | 5 | 2 | **20** |
| Low | 8 | 5 | 8 | **21** |

Verdicts. Plain language: PASS with fixes. Most text reads at grade 1 to 5; 45 of 1,790 strings score above grade 7, and most of those are rebate and garden facts. Accessibility: FAIL, with three High items. Navigation: PASS with fixes. Most tasks take 3 taps or fewer; logging a critter sighting takes 5 to 6. English and Spanish: PASS with fixes. Every string has a Spanish version, usted is used throughout, and no English is left in the Spanish text.

Severity note: the brief's rubric makes any A/AA failure on a main screen High. A-06 (tab labels cut off at 200%) and A-07 (tab role without a tab list) fit that rule, but I rated them Medium because people can still finish the task. The full name is still spoken and the icon is still shown. Raise them if you want the strict rule.

The five most important items, in plain words:
1. **A screen reader says nothing when you tap "I am going", "Report", "Send" or "Delete my information".** The button disappears and a thank-you box appears, but the screen reader loses its place. On iPhone the app never announces any change. (A-01)
2. **In dark mode, the "Paused" box in Critter Rescue hides two of its three buttons.** "Start the level over" and "Leave the game" are pale green on cream, at about 1.4 to 1. They need at least 4.5 to 1. (A-02)
3. **On the web, Spanish is read with an English voice.** The page always says its language is English, and every page has the same title. (A-03)
4. **The portrait agreement says the pet photo is deleted, but it is kept** if the family chose "Verified neighbors too". (P-01)
5. **The photo choice "Only my family" is not true.** The portrait maker, who today is the app's admin, can also see the photo. (P-02)

## 2. Findings

"Fixable now?": yes = fix in code now; device = needs a real phone to confirm or fix; human = needs a person (native speaker, board or attorney).

### Accessibility (A)

| ID | Sev | WCAG / rule | Where | What | Suggested fix | Fixable now? |
|---|---|---|---|---|---|---|
| A-01 | High | 4.1.3 Status Messages; 2.4.3 Focus Order | `components/ui.tsx:335-360` (Notice); `app/event/[id].tsx:57-64` (RSVP); `app/share/[id].tsx:40-41,71` (report); `app/critters/pet/[id].tsx:38,197,238` (note sent, report); `app/privacy.tsx` (delete); `app/critters/pet/portrait.tsx:62,94-98` (errors) | On web, after RSVP, report and delete, focus falls to `BODY` and nothing is announced (`journeys2.json`: `live: []`, `focus: "BODY"`). Notice has no live region and no role. The code never calls `AccessibilityInfo.announceForAccessibility`. `accessibilityLiveRegion` works only on Android, so on iPhone none of the app's 4 live regions speak. | Give Notice a `status` prop that sets `accessibilityLiveRegion="polite"` and `role="status"` (web `aria-live="polite"`). On iOS, call `AccessibilityInfo.announceForAccessibility(title + ' ' + body)` when it mounts. When an action removes the button that was pressed, move focus to the new Notice: `AccessibilityInfo.setAccessibilityFocus(findNodeHandle(ref))` on native, or `ref.focus()` with `tabIndex={-1}` on web. | yes (device to confirm) |
| A-02 | High | 1.4.3 Contrast; 1.4.11 Non-text Contrast | `app/brawler/index.tsx:472-483` (Paused / Knocked down box), `:557-558`; `/brawler` in dark mode | The `secondary` and `quiet` Btn use the app's dark-mode primary on fixed parchment. Text and border contrast: 1.35 (Plain), 1.62 (Warm), 1.43 (Civic), 1.48 (Wildflower) to 1. Screenshot `shots/brawler-paused-dark.png`: "Start the level over" and "Leave the game" are barely visible. | Wrap the overlay and rescue cards in a menu-palette provider (like `ZoneColors`), or give these buttons `MENU.ink` text and border (10.69:1 on parchment). Add a test: "app Btn on MENU.parchment, all looks, light and dark". | yes |
| A-03 | High | 3.1.1 Language of Page (A); 2.4.2 Page Titled (A) | Web build, every route. No code sets them (grep for `documentElement.lang` and `document.title` finds nothing) | With Spanish chosen, `<html lang>` stays `en` on all 66 audited pages, and every title is "Heritage Hills". Screen readers read Spanish with English rules, and tabs and history all look alike. | In root `app/_layout.tsx`, on web: `useEffect(() => { document.documentElement.lang = language; }, [language])`. Set a title per screen with expo-router `<Head><title>{screenTitle} · Heritage Hills</title></Head>`. | yes |
| A-04 | Medium | 2.1.1 Keyboard; switch and screen-reader play | `components/arcade/pad.tsx:55-70`; used in `app/brawler/index.tsx`, `app/workshop/street.tsx` | The pad is one `accessible` View with a label but no role and no actions. On phones, VoiceOver, TalkBack and switch users cannot move or bonk. Keys work only in the web build (`brawler/index.tsx:379`). "Watch it play" is the only alternative. This is a game, not a core task, so Medium. | Add `accessibilityActions` (left, right, up, down, bonk) with `onAccessibilityAction` that steps once or bonks once. When `AccessibilityInfo.isScreenReaderEnabled()` is true, also show separate on-screen buttons. | device |
| A-05 | Medium | 4.1.3 Status Messages | `app/critters/world.tsx:197,219,283-287,303-315` | When a quest is claimed in the place card, "You got N points! New rank: …" goes to a live region inside the map ScrollView. That region is `aria-hidden` while the card is open. A toast also appears, but behind the modal. Confirmed on web: `{"text": "You are at The Creek.", "hidden": true}`. Arrival itself works: the card opens and focus moves to "Close". | Show the claim result inside the PlaceCard as a status Notice (see A-01), or call `announceForAccessibility`. | yes |
| A-06 | Medium | 1.4.4 Resize Text | `app/(tabs)/_layout.tsx:74-77` | At about 200% text (Extra large x 1.54 page zoom, 360 px, Spanish), the bottom tabs read "Even…", "Veci…", "Natu…" (`shots/z200-es_.png`). The label is fixed at 13 px, one line, with `maxFontSizeMultiplier` 1.3. | Use `numberOfLines={2}` and let the tab bar grow taller. Use `fs('small')` for the size. | yes (device to confirm) |
| A-07 | Medium | 4.1.2 Name, Role, Value; 1.3.1 | Bottom tab bar on `/`, `/events`, `/neighbors`, `/nature`, `/more` | axe `aria-required-parent` x5 on each main screen: `<a role="tab">` has no `tablist` parent. Screen readers do not say "tab 2 of 5". | Give the tab bar container `accessibilityRole="tablist"` (custom `tabBar`), as `ZoneMenu` already does (`components/quest/zone.tsx:96`). | yes |
| A-08 | Medium | 1.4.11 Non-text Contrast | `components/quest/paper-map.tsx:239`, `app/critters/world.tsx:395` ("you are here" ring); `world.tsx:271` (selected pattern) | Gold `#E6B84F` is 1.29 to 1.36:1 against the map paper, and the selected pattern border is 1.45:1. The "here" marker loses its dark outline. Screen readers hear "You are here", so sighted users are the ones affected. | Keep the ink ring and add gold as an outer second ring, or use `ZONE_EXTRA.woodDark` for the selected state. Add a small "You are here" pin label. | yes |
| A-09 | Medium | 1.4.3 Contrast | `app/brawler/index.tsx:292` (stamps on the game title screen) | Stamps not yet earned use `opacity: 0.6`: label 2.80:1, name 3.55:1 on parchment. | Remove the opacity. Show "not yet" with the dashed border plus a word, in `MENU.inkSoft` at full strength (6.90:1). | yes |
| A-10 | Medium | Project rule: icon + label | `app/critters/world.tsx:260-275` ("Who is seen where" pattern buttons) | The buttons show only a pixel animal face. Screen readers get a name, but sighted users must guess the group. | Add the group word under each face (`t('critters.group.' + g)`), allowing 2 lines. | yes |
| A-11 | Medium | 4.1.2 (value) | `components/pet-card.tsx:107-137` (StatStepper) | The minus and plus buttons do not say the new value. | Make the row one `accessibilityRole="adjustable"` element with `accessibilityValue={{ min, max, now: value, text: stat + ': ' + value }}` and increment/decrement actions. Keep the visible buttons. | yes |
| A-12 | Medium | 4.1.3; 3.3.1 Error Identification | `app/critters/pet/[id].tsx:188-197` | "N letters left", the problem messages and "Note sent" are not announced, and the errors are not linked to the text box. | Show problems in a status Notice (A-01). Announce the letter count only at 20, 10 and 0 left. | yes |
| A-13 | Medium | 1.3.1 Info and Relationships | `app/critters/bingo.tsx:30-36` | The 9 squares are checkboxes labeled only with the animal. A screen-reader user cannot tell rows from columns, so cannot aim for three in a row. | Label each square like "Row 1, column 2: Cardinal" (`t('critters.bingoSquare', { row, col, text })`). | yes |
| A-14 | Medium | Project rule (confirm before deleting) | `app/critters/pet/[id].tsx:225-233` (remove pet); `app/share/[id].tsx:42-49` (remove item); `app/critters/pet/portrait.tsx` (remove photo) | One tap deletes, with no confirmation and no undo. | Reuse the "Delete my information" confirm pattern: "Remove Biscuit's card? This cannot be undone." / "Yes, remove" / "Keep it". | yes |
| A-15 | Medium | Project rule: Spanish everywhere | `app.json` (no `locales`) | The iOS camera and photo permission prompts will be English only. | Add `"locales": { "es": "./locales/es.json" }` with Spanish `NSCameraUsageDescription` and `NSPhotoLibraryUsageDescription`. | device |
| A-16 | Medium | Project rule: max 3 taps | `journeys2.json` | Log a critter sighting takes 6 taps the first time and 5 after. Give a sticker takes 4. Travel to the creek takes 4 the first time. | Add "I spotted an animal" to the Home game card and the map screen, opening a quick picker. Show pets inline on Neighbors. | yes |
| A-17 | Low | 1.4.11 | `components/quest/zone.tsx:69-70` | The points bar fill against its track is 2.98:1 (3 is needed). The points are also shown as text. | Lighten `ZONE_EXTRA.xp` slightly (for example `#46A065`) and re-test. | yes |
| A-18 | Low | 2.5.3 Label in Name | RowLink and event rows on `/events`, `/neighbors`, `/nature`, `/more`, `/critters/guide`, `/critters/more`, `/workshop` | axe `label-content-name-mismatch`. Names are "Title. Subtitle", and the spoken date differs from the visible one ("Fri NOV 20" vs the date tile). Names start with the visible title, so voice control mostly works. | Build the label from exactly the visible strings in the same order. | yes |
| A-19 | Low | 4.1.2 | `/critters` ("Some of the critters you can meet") | axe `aria-prohibited-attr`: `aria-label` on a plain div. | Add `accessibilityRole="image"` or remove the label. | yes |
| A-20 | Low | 1.1.1 | `app/brawler/index.tsx:291` | The stamp label "Raccoon: ✓" / "Raccoon: —" is read as "check mark" or "dash", or not read at all. | Use the new keys `rescue.stampEarned` "{name}: rescued" and `rescue.stampNotYet` "{name}: not yet". | yes |
| A-21 | Low | 2.4.6 Headings and Labels | `app/critters/pet/[id].tsx` (two "Report this paw note"); `/brawler` paused ("Keep playing" twice) | Different controls have the same name. | "Report the note that starts '{first words}'". Hide the header "Keep playing" while the overlay is open. | yes |
| A-22 | Low | 1.3.3 Sensory Characteristics | string `zone.how4` | "Purple places are rescue missions" relies on color. | Rewrite #26. | yes |
| A-23 | Low | 2.3.3 (AAA); project rule "motion can be reduced" | `app/critters/world.tsx:85`, `app/workshop/styles.tsx:26`; brawler | Reduce Motion is read once and never re-checked. The brawler has no reduced-motion path. Its hurt blink is 3 per second on a small sprite, which is at the 2.3.1 limit and passes. | Listen for `reduceMotionChanged`. In the brawler, skip the blink and the boss shake when Reduce Motion is on. | yes |
| A-24 | Low | 1.4.4; project rule | `app/(tabs)/_layout.tsx:76`; `components/quest/zone.tsx:92` | Tab labels are fixed at 13 px, and the zone menu label is 12 px at Normal size. | Use `fs('small')` (15 px) for both. | yes |

### Plain language (P)

| ID | Sev | Rule | Where | What | Suggested fix | Fixable now? |
|---|---|---|---|---|---|---|
| P-01 | High | Consent text must be true | `cards.agree5`; behavior `lib/data/petcard-sample.ts:265,305` | It says "The photo is deleted when the portrait is done or after 30 days." The code keeps the photo when the audience is "Verified neighbors too", and `maker.doneBody` says so as well. | Rewrite #1 (EN and ES). Attorney to review it with the privacy policy. | yes + human |
| P-02 | High | Consent and privacy wording | `cards.photoWho.maker` "Only my family"; `lib/petcards.ts:207` | The portrait maker can also see the photo during a request. | Rewrite #2. | yes |
| P-03 | Medium | No jargon on a consent screen | `cards.agree1`, `cards.agree2`, `cards.agree4` | Uses "admin", "outside picture service", "AI" and "train its AI". | Rewrites #3 to #5. | yes |
| P-04 | Medium | One idea per control | `cards.agreeCheck` "I agree. Send my request to the portrait maker." | The checkbox sounds like it sends the request, but sending is the button below it. | Rewrite #6. | yes |
| P-05 | Medium | Plurals (EN and ES) | `lib/i18n/index.tsx` has no plural support; 22 `{count}` strings | Produces "1 neighbors are going", "See all 1 alerts", "1 invites for you", "1 critters rescued", "1 sightings", "All 1 entries are intact", "1 suspects is too many", and in Spanish "1 vecinos van a ir". | Add `Intl.PluralRules(locale)` and `_one`/`_other` keys (rewrites #24, #25). | yes |
| P-06 | Medium | About 6th-grade level | `content:resources[0..6]` (grade 8.8 to 18.5) | Uses "rebates averaging", "0% financing", "customers who qualify" and "qualifying system". | Rewrites #7 to #13. Facts are unchanged; check them against the program pages. | yes + human |
| P-07 | Medium | Clear privacy wording | `critters.photoLoadNote` | "Nothing about you is sent except what any website sees" is vague. | Rewrite #16. | yes |
| P-08 | Low | Jargon | `decisions.footnote`, `decisions.okTitle`, `decisions.okBody` | Uses "fingerprint" and "entries are intact". | Rewrites #17 to #19. | yes |
| P-09 | Low | Jargon | `role.neighbor.can` ("RSVP"); "moderator" in 10+ strings | "RSVP" has no hint, and "moderator" is never explained. | Rewrite #20. Add to Safety: "Moderators are neighbors who volunteer to check reports." | yes |
| P-10 | Low | Jargon | `about.version` | "Ecosystem pages are unverified drafts". | Rewrite #21. | yes |
| P-11 | Low | Legal-sounding text | `share.toolSafetyBody` ("at your own risk") | A legal phrase that may not say what an attorney intends. | Rewrite #27, then attorney review. | human |
| P-12 | Low | Idioms | `street.*`, `rescue.*` ("bonk", "ghouls", "go poof", "Knocked down") | Fine for children in English, but hard to translate (E-05, E-10). | Keep them, and give translators a short glossary. | yes |

### Spanish (E)

| ID | Sev | Rule | Where | What | Suggested fix | Fixable now? |
|---|---|---|---|---|---|---|
| E-01 | Medium | Same thing, same name | `act.bingo` "Lotería del patio"; `critters.bingo` "Lotería del jardín"; `critters.badge.bingo`; `quest.bingoLine.*` | One game has two names. "Lotería" is also the name of a different Mexican card game. | Use one name everywhere. Suggested: "Bingo del jardín" and "¡Bingo!" (native speaker to confirm). | yes + human |
| E-02 | Medium | Inclusive usted (the player can be anyone) | `hello.statue`, `host.allDone`, `cards.stickersNone`, `cards.waitingTitle`, `critters.realPhotosBody`, `signIn.vouchBody`, `zone.how1` | These use masculine forms to address the user. | See the Spanish corrections table in section 4. | yes |
| E-03 | Low | Grammar | `hello.bridge` | "cualquier canto que oigo" should use the subjunctive. | "cualquier canto que oiga" | yes |
| E-04 | Low | Consistent terms | `styles.stat.snack` vs `cards.stat.snack`; `zone.soundOn/Off` vs `rescue.soundOn/Off`; `street.tryAgain` vs `rescue.tryAgain` | "Poder de botana" / "Poder botana"; "Sonido sí/no" / "Sonido encendido/apagado"; "Intentar de nuevo" / "Intentar otra vez". | Use "Poder de botana", "Sonido encendido/apagado" and "Intentar otra vez" everywhere. | yes |
| E-05 | Low | Natural wording; fits pixel menus | `street.bonk` "Golpecito"; `street.padLabel` | "Golpecito" is long and odd as a button noun. The verb uses ("Dé golpecitos") are fine. | Button "¡Pum!"; pad label "…El lado derecho es el botón de golpe." | yes + human |
| E-06 | Low | Natural wording | `share.report`, `cards.noteReport`, card report ("Reportar…") | "Reportar" is a common anglicism, and it is widely understood in Texas. | A native speaker chooses between "Reportar" and "Avisar de un problema con…". | human |
| E-07 | Low | Natural wording | `cards.class.lapChampion` "Campeón de regazos"; `cards.class.windowWatcher` "Observador de ventana" | Word-for-word and stiff. | "Campeón del regazo"; "Vigía de la ventana" (then rename `porchSentinel` to "Guardián del porche"). | yes + human |
| E-08 | Low | Text expansion | zone menu "Guía de campo"; brawler header "Sonido encendido"; pet card "Clase: Explorador del jardín" | At about 200% text these are clipped or run past the edge (`zoom200-es.json`). Nothing clips at the in-app 1.3x size. | Let zone menu cells grow in height. Use "Sonido" with an on/off state in the brawler header. | device |
| E-09 | Low | Dates follow the locale | `lib/dates.ts:5-8` | The locale is right (`es-US`), but times follow the phone's time zone, so a traveling resident sees shifted event times. | Add `timeZone: 'America/Chicago'` to the format options. | yes |
| E-10 | Low | Gender of hero | `rescue.lostTitle` "Derribado" | Masculine, but the hero can be Flor. | "¡Al suelo!" | yes |

## 3. Tap counts

Counted from app open (Home) as a signed-in Neighbor, on the 360x640 web build (`journeys2.py`, `journeys2.json`).

| Task | Taps | Path | 3 or fewer? |
|---|---|---|---|
| Read an alert | 0 | Alerts are at the top of Home ("See all 3 alerts" is 1 tap) | yes |
| RSVP an event | 2 | Event row on Home, "I am going" | yes (silent, A-01) |
| Find a resource | 1 | "Rebates and resources" | yes |
| Report a share item | 3 | Share shelf, item, "Report this item" | yes (silent, A-01) |
| Log a critter sighting | 6 first time, 5 after | Start exploring, Start the adventure, Close (first time only), Field guide, animal, "I spotted it!" | **no** (A-16) |
| Open the map and travel to the creek | 4 first time, 3 after | Start exploring, Start the adventure, Close (first time only), The Creek | no the first time |
| Give a sticker to a pet | 4 | Neighbors tab, Pet pals, Biscuit, "Give the Goodest sticker" | **no** (A-16) |
| Change language | 3 | More tab, Language and text size, Español | yes |
| Change text size | 3 | More tab, Language and text size, Extra large | yes |
| Delete my information | 4 | More tab, My privacy, Delete my information, "Yes, delete it" | yes (the 4th tap is the safety confirmation) |

Keyboard (web, 430x932, `kb.json`): the Home Tab order follows the screen and every stop shows the browser focus ring. On the map, The Creek is 6 Tab presses in. Enter opens its card with focus on "Close", and Escape closes the card and returns focus to the marker.

## 4. Rewrites

### Worst 30 English strings

Spanish versions of rewrites 1 to 6 follow the table, because those are consent text. Facts in the rebate rewrites are unchanged and must be re-checked against the program pages before shipping.

| # | Key | Current | Suggested |
|---|---|---|---|
| 1 | `cards.agree5` | The photo is deleted when the portrait is done or after 30 days. You can stop the request at any time. | If only your family can see the photo, we delete it when the portrait is done or after 30 days. If you chose "Verified neighbors too," the photo stays on the card until you remove it. You can stop the request at any time. |
| 2 | `cards.photoWho.maker` | Only my family | My family (and the portrait maker during a request) |
| 3 | `cards.agree1` | A volunteer called the portrait maker will see your photo. Today that is the app's admin. | A neighbor who volunteers as the "portrait maker" will see your photo. Right now, that is the person who runs the app. |
| 4 | `cards.agree2` | They will send the photo to an outside picture service: {service}. The service makes the portrait with AI. | They send the photo to {service}, a company outside the app. The company uses a computer program (AI) to draw the portrait. |
| 5 | `cards.agree4` | The service must not use your photo to train its AI. | The company must not use your photo to teach its computer program. |
| 6 | `cards.agreeCheck` | I agree. Send my request to the portrait maker. | I read this and I agree. |
| 7 | `content:resources[0].summary` | Rebates averaging $3,000 and 0% financing for whole-home energy improvements. | Get money back (about $3,000 on average) and a loan with no interest to help your whole home use less energy. |
| 8 | `content:resources[2].summary` | Free home energy improvements for customers who qualify. | Free changes that help your home use less energy, if you meet the program's rules. |
| 9 | `content:resources[4].summary` | A rebate for installing energy-saving solar screens on your windows. | Get money back when you put sun-blocking screens on your windows. |
| 10 | `content:resources[3].who` | Homeowners who install a qualifying system. See the announcement for rules. | Homeowners who put in a solar system that meets the rules. See the announcement for the rules. |
| 11 | `content:resources[3].summary` | $4,000 rebate per project for home solar systems larger than 3 kilowatts, since July 1, 2026. | Get $4,000 back for a home solar system bigger than 3 kilowatts, for systems put in on or after July 1, 2026. |
| 12 | `content:resources[1].summary` | A lower-cost option with rebates averaging $1,500 to help your home use less energy. | A lower-cost choice. Get about $1,500 back on average to help your home use less energy. |
| 13 | `content:resources[6].who` | Groups with at least four volunteer leaders from different households and a nonprofit sponsor. | Groups with at least four volunteer leaders from different homes, and a nonprofit partner. |
| 14 | `content:gardenSteps[1].note` | The sponsor provides liability insurance for the garden. | The sponsor gives the garden insurance in case someone gets hurt. |
| 15 | `share.reportedBody` | When two neighbors report an item, it is hidden until a moderator reviews it. | If two neighbors report an item, we hide it until a volunteer checks it. |
| 16 | `critters.photoLoadNote` | This loads one photo from iNaturalist.org, a nature site run by a nonprofit. Nothing about you is sent except what any website sees. | This photo comes from iNaturalist.org, a nonprofit nature website. Like any website, it can see your internet address. Nothing else about you is sent. |
| 17 | `decisions.footnote` | How it works: each entry carries a fingerprint of its words and of the entry before it. Changing any entry breaks every fingerprint after it. | How it works: each entry has a check code made from its words and the entry before it. If anyone changes an entry, the codes after it stop matching. |
| 18 | `decisions.okTitle` | All {count} entries are intact | Nothing was changed. We checked every entry. |
| 19 | `decisions.okBody` | Nothing has been changed or removed. This is the record's current fingerprint: | No entry was changed or removed. This is the record's check code: |
| 20 | `role.neighbor.can` | Neighbors have signed in and verified their household. They can RSVP, share, volunteer and answer polls. | Neighbors have signed in and shown they live here. They can say they are coming to events, share, volunteer and answer polls. |
| 21 | `about.version` | Draft 1 · November 2026 · Ecosystem pages are unverified drafts · Spanish needs review by a native speaker | Draft 1 · November 2026 · Nature pages are not checked yet · A native speaker still needs to check the Spanish |
| 22 | `share.contactPrivacy` | Your contact details are shared only after a request is accepted, and only the method you chose. | We share how to reach you only after you say yes to a request, and only the way you picked. |
| 23 | `critters.tallyScience` | Later, with the board's approval, these counts could be shared with a community science project so scientists can use them too. | Later, if the board agrees, we may share these counts with scientists who study animals. |
| 24 | `events.going` | {count} neighbors are going | one: "1 neighbor is going" / other: "{count} neighbors are going" |
| 25 | `home.allAlerts` | See all {count} alerts | See all alerts ({count}) |
| 26 | `zone.how4` | Purple places are rescue missions. | Places with a ghost are rescue missions. |
| 27 | `share.toolSafetyBody` | Check the tool before you use it. Wear eye protection. You borrow and use it at your own risk. | Check the tool before you use it. Wear eye protection. If you borrow it, you are responsible for using it safely. (attorney review) |
| 28 | `cards.photoWhoHint` | The portrait maker sees it only while a portrait request is open. Visitors who are not signed in never see a real photo. | The portrait maker sees it only while your request is open. People who are not signed in never see a real photo. |
| 29 | `privacy.whoSeesNote` | Everything starts as "Nobody". Changes take effect right away. | At first, nobody can see anything. When you change a choice, it changes right away. |
| 30 | `content:sampleDecisions[2].content.summary` | Adopt privacy principles for the neighborhood app: opt-in sharing, no selling of data. | Agree on privacy rules for the app: you choose what to share, and we never sell data. |

Spanish for the consent rewrites (native speaker to confirm):
- #1 `cards.agree5`: "Si solo su familia puede ver la foto, la borramos cuando el retrato esté listo o a los 30 días. Si eligió «También los vecinos verificados», la foto se queda en la tarjeta hasta que usted la quite. Puede detener la solicitud cuando quiera."
- #2 `cards.photoWho.maker`: "Mi familia (y quien hace los retratos mientras haya una solicitud)"
- #3 `cards.agree1`: "Una persona del vecindario que hace los retratos como voluntaria verá su foto. Por ahora es la persona que maneja la aplicación."
- #4 `cards.agree2`: "Esa persona envía la foto a {service}, una empresa de afuera. La empresa usa un programa de computadora (IA) para dibujar el retrato."
- #5 `cards.agree4`: "La empresa no debe usar su foto para enseñarle a su programa."
- #6 `cards.agreeCheck`: "Leí esto y estoy de acuerdo."

### Spanish corrections

| Key | Current | Suggested |
|---|---|---|
| `act.bingo` | Lotería del patio | Bingo del jardín |
| `critters.bingo` | Lotería del jardín | Bingo del jardín |
| `critters.badge.bingo` / `critters.bingoLine` / `quest.bingoLine.done` | Lotería / ¡Lotería! … | Bingo / ¡Bingo! … (if the native speaker prefers "Lotería", use it in all five keys) |
| `quest.bingoLine.ask` | Complete una línea en la lotería del patio. | Complete una línea en el bingo del jardín. |
| `hello.statue` | ¡Oh! ¡Un viajero! Soy Dilly… | ¡Oh! ¡Alguien viene de viaje! Soy Dilly… |
| `hello.bridge` | …cualquier canto que oigo… | …cualquier canto que oiga… |
| `host.allDone` | Hizo todo lo que le pedí. ¡Gracias, amigo! | Hizo todo lo que le pedí. ¡Mil gracias! |
| `cards.stickersNone` | Aún no hay calcomanías. ¡Sea el primero! | Aún no hay calcomanías. ¡Dé la primera! |
| `cards.waitingTitle` | Notas de patita esperándolo ({count}) | Notas de patita por revisar ({count}) |
| `critters.realPhotosBody` | …Una foto real le ayuda a estar seguro… | …Una foto real le ayuda a confirmar cuál es… |
| `signIn.vouchBody` | Dos vecinos que ya se unieron pueden confirmarlo… | Dos vecinos que ya se unieron pueden confirmar que usted vive aquí… |
| `zone.how1` | Toque un lugar del mapa. Su viajero camina hasta allí. | Toque un lugar del mapa. Su personaje camina hasta allí. |
| `rescue.lostTitle` | Derribado | ¡Al suelo! |
| `cards.stat.snack` | Poder botana | Poder de botana |
| `zone.soundOn` / `zone.soundOff` | Sonido sí / Sonido no | Sonido encendido / Sonido apagado |
| `street.tryAgain` | Intentar de nuevo | Intentar otra vez |
| `street.bonk` | Golpecito | ¡Pum! |
| `street.padLabel` | …El lado derecho es el botón de golpecito. | …El lado derecho es el botón de golpe. |
| `cards.class.lapChampion` | Campeón de regazos | Campeón del regazo |
| `cards.class.windowWatcher` | Observador de ventana | Vigía de la ventana (and `cards.class.porchSentinel` becomes "Guardián del porche") |
| `events.going` | {count} vecinos van a ir | one: "1 vecino va a ir" / other: "{count} vecinos van a ir" |

Shortened list for the native speaker (everything else can ship after the fixes above): (1) Bingo or Lotería (E-01); (2) "¡Pum!" vs "Golpecito" (E-05); (3) "Reportar" vs "Avisar de un problema" (E-06); (4) pet class names (E-07); (5) "Notas de patita". It is understandable; keep it unless they have a warmer term. (6) The six consent sentences above; (7) a tone read of the six `hello.*` lines. Checked and fine for Texas Spanish: "botana", "Cenzontle", "Tecolote", "Garza", "alberca", "Mesa directiva", "calcomanías", and the sticker names ("Corazón de oro", "Pura risa", and so on).

## 5. Checked and fine

- **Target sizes:** on all 22 routes x 4 setups (`audit.json`, `audit-normal.json`), no button, link, tab, switch, radio or checkbox is under 44 CSS px (none under 24). `MIN_TOUCH` + 8 is used in game controls.
- **Reflow at 1.3x in-app text:** no page scrolls sideways at 360 or 430 px, in light or dark, English or Spanish. The script found no clipped or overflowing text.
- **axe-core:** 0 violations on `/settings`, `/privacy`, `/resources`, `/alerts`, `/safety`, `/critters/world`, `/critters/pets`, `/critters/quests`, `/critters/bingo`, `/critters/pet/pet-biscuit`, `/brawler`, `/board`, `/share/share-1`, `/portraits`, `/sign-in`, `/event/evt-1`, `/flowers`, `/invites` (light and dark). Only the items in A-07, A-18 and A-19 appear elsewhere.
- **Contrast:** 144 of 162 app-palette pairs pass (`contrast.mts`) in all 5 looks, light and dark. That covers placeholders 8.2 to 11.2, input borders 3.5 to 5.2 (3 needed), tab labels, danger buttons, notices, tags and the draft banner. Map lettering on the parchment map passes everywhere, including at the dark edge (ink 11.7 to 12.2, red 6.0 to 6.3). Zone header, menu and dialog boxes pass (6.5 to 13.8). Focus color against the background passes (6.8 to 10.7). Game health and boss bars pass (4.7 to 6.1).
- **Keyboard and focus (web):** the order is logical, the browser focus ring shows on every stop, the map place card behaves like a dialog (focus goes to "Close", Escape closes it, focus returns), and the map is hidden from screen readers while the card is open (`world.tsx:197`).
- **Map access:** "Use a list instead of the map" exists (`/critters`). The game has a sound on/off switch, and no information depends on sound alone.
- **Brawler:** no time limit (in-game "time" is game hours, `cases.ts:71`). It pauses when you leave the screen or the app (`brawler/index.tsx:373-376`). The default difficulty is "Gentle" (slower monsters, more health, `rules.ts:109,145`), and "Watch it play" is available, so you can finish without fast inputs. Movement is position-based with no swipe paths (2.5.1 and 2.5.7 pass). Bonk is a single tap; the triple-tap big bonk is optional. The hurt blink is 3 per second on a small sprite (2.3.1 passes). The map walk honors Reduce Motion (`world.tsx:148`).
- **Strings:** 1,790 strings (1,216 i18n keys plus content) with full EN/ES key parity, no empty or missing Spanish, no English left in Spanish, and no hard-coded English in JSX. All 116 "tú" detector hits were read by hand and are third-person verbs or nouns ("se ve", "da", "juega"), so **usted is consistent across all game blocks**. Dates use `Intl.DateTimeFormat` with `en-US` / `es-US`.
- **Plain language:** group reading grades are mostly 0 to 5. Privacy 3.9, safety 3.9, sign-in 1.8, alerts 1.5, settings 1.9, portrait consent about 3 to 5. Buttons are verbs ("Ask to borrow", "Delete my information"), errors say what to do ("Choose a photo first", "Try again tomorrow"), and 911/311 wording is clear. "Delete my information" has a clear confirmation and says it cannot be undone.
- **Consent screen in dark mode:** by code, `/critters/*` uses the fixed light zone palette (`critters/_layout.tsx:17`), so consent bullets use zone text on parchment. Rendering it was **unverified** because the sample data has no pet owned by the user.
- **RTL readiness:** shared components use start/end (`ui.tsx`, `borderStartWidth`). The touch pad and XP bar force `direction: 'ltr'` on purpose, which is correct for a game pad and a progress bar.

## 6. Could not check

| What | Why | How a person should check it |
|---|---|---|
| VoiceOver (iPhone) | No native build or device here | On a large iPhone with VoiceOver on: RSVP an event, report a share item, send a paw note, and delete my information. Each time, confirm that you hear the result and that focus lands on it (A-01). Open the map, travel to The Creek, claim a quest, and listen for the points (A-05). Swipe through the bingo card and the stat steppers (A-11, A-13). |
| TalkBack (small Android) | Same | Same steps on a small Android phone (about 360 dp wide). Also check that the tab bar says "tab, 1 of 5" after A-07 is fixed. |
| Switch Control / Switch Access | Same | Set one switch to "select" and scan Home, Events, a pet card and the brawler. Every control must be reachable, and the brawler is expected to fail until A-04 is fixed. |
| System text size at maximum | The web build only approximates it | iOS: Settings > Accessibility > Display & Text Size > Larger Text, set to max; Android: Font size and Display size at max. Combine with in-app "Extra large". Check the tab bar (A-06), zone menu, brawler header and pet card (E-08) for cut-off or overlapping text. |
| iOS permission prompts in Spanish | Needs a device build | With the phone language set to Spanish, tap "Tomar una foto" and confirm that the camera prompt is in Spanish (A-15). |
| Reduce Motion on device | Needs a device | Turn on Reduce Motion, open the map and travel (it should jump, not walk), then turn it off while the app is open (A-23). |
| Real children | Needs people | Watch 2 or 3 children aged 6 to 10 play on a grown-up's phone with a grown-up nearby. Can they start, pause, leave the game and find "Watch it play" without reading help? Note every word they ask about. |
| Older and low-literacy residents | Needs people | Ask 3 residents, including one Spanish speaker and one over 70, to RSVP, find a rebate and delete their information. Count taps and questions. |
| Portrait consent in dark mode | Sample data has no pet owned by the user | Add a pet, open "Real photo and portrait" in dark mode, and screenshot the agreement box. |
| Native Spanish review | Needs a person | Use the shortened list at the end of section 4. |
| Legal wording | Needs an attorney | Review P-01 (photo retention), P-11 ("at your own risk") and the six consent sentences together with the privacy policy. |

---
## Working notes (code review, confirmed; folded into the tables below when final)
- ui.tsx: Btn/RowLink/CheckRow/Choices/Field have roles, labels, states, 48+ min heights, start/end layout. Headings: Txt display/title -> header.
- Tabs: fixed 13px label, maxFontSizeMultiplier 1.3, numberOfLines 1 ((tabs)/_layout.tsx:74-77). Zone menu label 12px at normal size (zone.tsx:120).
- html lang fixed "en" and title "Heritage Hills" in served build; no code sets lang/title (grep: none).
- app.json has no `locales`: iOS permission prompts English only.
- world.tsx:198/219/313: live region inside ScrollView that is aria-hidden while place card open -> arrival/claim not announced (to verify in browser).
- world.tsx:260-275 pattern buttons: picture only, no visible word.
- pad.tsx:56-75: one accessible View, label, no role, no actions -> screen reader / switch users cannot play except "Watch it play".
- brawler/index.tsx:468-483, 557: app-palette Btn secondary/quiet on fixed parchment -> dark-mode contrast (to compute).
- brawler Stamp a11y label "name: ✓" / "name: —" (index.tsx:291).
- pet-card.tsx:107-137 StatStepper: new value not announced.
- pet/[id].tsx:188-197: letters-left counter, errors, sent notice not live; 225-233 remove pet: no confirm/undo.
- portrait: agree5 omits "unless you chose neighbors" (petcard-sample.ts:265,305 keep the photo when audience is neighbors); "Only my family" label while portrait maker can see it (petcards.ts:207).
- bingo.tsx:30-36: squares with no row/column position.
- i18n/index.tsx: no plural support ("1 critters rescued", quest.en.ts:84; "1 neighbors are going", en.ts:73).
- Strings: 1790 (1216 i18n keys + content), full key parity, no English left in Spanish, no hardcoded English in JSX; usted consistent.
- Cases "time" is in-game hours (cases.ts:71), not a real clock: 2.2.1 not applicable.
- Hurt blink = 3 cycles/s on a small sprite (scene.ts:39,84): at the 2.3.1 limit, passes.

### Session 2 notes (continuing reviewer, confirmed)
- audit.json (1.3x text; 360 light EN, 430 dark ES, 360 dark ES) + audit-normal.json: 22 routes x 4 configs: no document horizontal scroll, no clipped/overflowing text found by script, 0 targets < 44 CSS px. html lang stays "en" with Spanish selected.
- axe: aria-required-parent x5 on every main tab screen (bottom tab bar `<a role=tab>` without a tablist parent); label-content-name-mismatch (RowLink buttons with title+subtitle; /events, /neighbors, /nature, /more, /critters/guide, /critters/more, /workshop); aria-prohibited-attr on /critters (aria-label on a plain div "Some of the critters you can meet").
- contrast.mts: map labels all pass (6.0-12.2). FAIL: brawler pause/lost/rescue buttons in dark mode (all 5 looks) c.primary on parchment 1.35-1.62, c.text bullets 1.13-1.17 (brawler/index.tsx:472-483, 557-558); "you are here" gold ring 1.29-1.36 (paper-map.tsx:239, world.tsx:395); selected pattern border 1.45 (world.tsx:271); XP fill vs track 2.98 (zone.tsx:69-70); unearned stamp text at opacity 0.6: 2.80/3.55 (brawler/index.tsx:292). contrast2.mts: zone header gold 6.47, menu 6.66, dialog 7.97+, focus ring 6.8+: pass.
- No AccessibilityInfo.announceForAccessibility anywhere (grep). accessibilityLiveRegion is Android-only, so iOS VoiceOver hears none of the 4 live regions.
- Notice (ui.tsx:335-360) has no live region/role: RSVP (event/[id].tsx:57-64), share report (share/[id].tsx:40-41,71), pet note sent (pet/[id].tsx:197), pet report (pet/[id].tsx:38,238): the pressed button disappears and a silent Notice appears; focus is lost.
- Quest claim (world.tsx:303-315): status goes to live region inside the ScrollView aria-hidden while the Modal is open (world.tsx:197,219) and a toast Notice behind the modal: not announced.
- Reduce Motion: read once at mount, no change listener (world.tsx:85, styles.tsx:26); brawler has no reduce-motion path (grep). AppState pause in brawler: yes (brawler/index.tsx:375).
- Spanish: tú detector hits are all 3rd-person verbs: usted consistent in all game blocks. Same thing named differently: "Lotería del patio" (act.bingo) vs "Lotería del jardín" (critters.bingo); "Poder de botana" vs "Poder botana"; "Intentar de nuevo" vs "Intentar otra vez". Masculine defaults to the player: hello.statue "¡Un viajero!", host.allDone "Gracias, amigo", cards.stickersNone "Sea el primero", cards.waitingTitle "esperándolo", critters.realPhotosBody "estar seguro". Grammar: hello.bridge "cualquier canto que oigo" -> "que oiga".
