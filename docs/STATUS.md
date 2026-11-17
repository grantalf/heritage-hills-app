# STATUS (read first every session)

Last updated: 2026-11-16, 7:30 PM Central, fourth work window.

## Where things stand
**First draft of the app exists, runs, and is pushed.** Repository: `grantalf/heritage-hills-app`, branch `main`. A private web preview is published at https://claude.ai/artifact/EKgQGrPRdNUZncBEsncH6v.

## Done
- Red-team review of Phase 0 (REDTEAM.md). Fourteen findings. Main changes: public-read first, no open feed in v1, three delivery waves, Texas age law added, backend decision reopened.
- Product spec (SPEC.md), security and data design (SECURITY.md), decisions D-001 to D-050 (DECISIONS.md), game design (GAME.md).
- App, Expo SDK 58 + TypeScript:
  - Five tabs: Home, Events, Neighbors, Nature, More. About 25 screens.
  - English and Spanish everywhere. Text size control. Light and dark.
  - Visitor / Neighbor / Board switch under More (stands in for real sign-in).
  - Alerts, events with online option and RSVP, share shelf with request and report, volunteering, private invites, Flowers for Neighbors, garden project page with interest list, ecosystem articles and monthly tips, rebates and resources, By the Numbers (no made-up values), community capital, association page with advisory poll, tamper-evident decision record with "Check the record", privacy controls with consent history, show and delete my information, board alert with two-person rule.
  - Three style directions to try under More > Language and text size > "Try a look".
  - **Critter Club game** (GAME.md): 47-animal field guide, each animal with its own original cartoon character; "I spotted it" with kind of place and optional photo; pet pages made by families (they build the pet's character from color, ears and markings); detective cases in the old-school style (witnesses, travel, 24-hour clock, notebook, name the culprit); a Patterns page (where, when, which months, through the day; wildlife only, no street map); a "Show a real photo" button that loads a licensed iNaturalist photo with credit; seasonal bingo; ranks and badges; shared tally; rules for playing kindly. Playable with no account.
- Checks that pass: type-check, lint, 85 unit tests (record, safety rules, game rules, detective cases, patterns, photo rules, content in both languages, color contrast for all four looks), and a 63-step journey check on the web build.
- Bugs found by checking and fixed: values not updating on screen (experimental compiler, now off), saved choices not reloading after restart, crash when opening a page directly.

## Not verified. Read before trusting the draft
- **Not run on a real iPhone or Android phone.** Only the web build was exercised, at small-Android and large-iPhone screen sizes. Native behavior (safe areas, keyboard, back gesture, TalkBack and VoiceOver) is untested.
- **The preview link was not checked inside Claude's viewer.** If it opens blank or navigation fails there, run it locally (README.md) and tell Claude.
- **Spanish was written by Claude.** A native speaker from the neighborhood should review it.
- **Ecosystem articles are drafts** with general Central Texas guidance. No local expert has checked them. They are labeled "Draft" in the app.
- **Resource amounts** were checked against official pages on Nov 15-16, 2026. Re-check before launch.
- No formal security, accessibility or plain-language review by a separate reviewer yet.
- **Field guide facts are a draft** written from general knowledge of Central Texas animals. A local naturalist should confirm each entry for Heritage Hills. Characters are cartoon drawings made from traits; a naturalist should check they do not mislead.
- **Real photos were not tested against the live iNaturalist site.** The build environment could not reach it, so the loader was tested only on invented sample answers. It falls back to a link. Photo license terms (many are non-commercial) need a board or attorney check (D-054).
- **Pet characters, cases and patterns use sample data.** The pattern numbers are invented.
- **The camera was not tested.** Photo choosing uses the phone's picker and could only be exercised on real devices.

## Next, in order
1. **Founder: open the preview, try the three looks, and say what you like and dislike.** Then Claude refines one into a short brand guide (colors, type, icons, tone) for the board.
2. Play Critter Club with your kids and say what was fun and what was confusing. Say whether the characters feel right, whether the detective cases are fun, and whether the "kinds of places" patterns are enough or you want a coarse area map (D-053).
3. Run the three reviewers on the draft as separate agents: security (`hh-privacy-security-review`), accessibility and plain language (`hh-plain-language-a11y-review`). Fix what they find.
4. Try it on real phones with Expo Go (README.md). Fix native-only problems.
5. Public facts pack: boundary, districts, schools, parks, transit, and Census figures for By the Numbers (Heritage Hills vs Austin vs Texas vs United States, with margins of error).
6. Verify the ecosystem articles against City and Texas sources. Add sources and dates. Find a local reviewer (for example a Master Naturalist or Watershed Protection contact).
7. Draft privacy policy, terms, community guidelines and moderation policy for attorney review.
8. One-page budget and funding plan (REDTEAM.md finding 8), then choose the backend (D-027).
9. Wave 1 for real: replace sample content with board-approved content, add push alerts, publish the web app on the association's domain.
10. Arabic and right-to-left check.

## Blocked on a human
- Confirm the association's exact name and current officers (two names appear in public records).
- Is the association incorporated? Get the bylaws.
- Board approval of scope, privacy principles and who moderates.
- Who pays recurring costs (about $415 a year: Apple $99, non-pausing database about $300, domain about $15).
- Attorney questions listed at the end of REDTEAM.md.
- Attorney: does a kid-friendly game change the app's duties under children's privacy law and the Texas app store law (D-045)?
- A local naturalist to check the field guide.
- A native Spanish reviewer.
- See CHECKLIST.md for accounts to create.

## How to run it
See README.md in the repository. Short version: `npm install`, then `npx expo start`, then scan the QR code with Expo Go, or press `w` for the browser. `npm run check` runs all checks.

## Notes for the next session
- Sample data only. Never put real resident data in the repository.
- Repository instructions for Expo are in AGENTS.md: check the versioned docs, do not trust memory.
- `npx expo install` cannot reach Expo's servers from the cloud workspace. Use versions from `node_modules/expo/bundledNativeModules.json` with `npm install`.
- To republish the preview: export with `EXPO_NO_BUNDLE_SPLITTING=1`, run `scripts/build_preview.py`, publish the single file to the same artifact.
- Texas Wildflower and Clean Civic currently look alike (both blue). If the founder leans toward Wildflower, push it further: meadow green as the main color with bluebonnet as the accent.
