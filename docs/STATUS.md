# STATUS (read first every session)

Last updated: 2026-11-17, 1:05 AM Central, by the block 1 session, after the founder's style pick.

## Where things stand
**First draft of the app exists, runs, and is pushed.** Repository: `grantalf/heritage-hills-app`, branch `main`. A private web preview of `main` is published at https://claude.ai/artifact/EKgQGrPRdNUZncBEsncH6v.

**Five block sessions were started at the same time on 2026-11-16 (11:36 to 11:38 PM), all from the same commit.** Each works on its own branch, with its own preview link and its own status file, and none pushes to `main`. **Read the block status files before anything else:** `BLOCK1_STATUS.md`, `BLOCK2_STATUS.md`, `BLOCK3_STATUS.md`, and any for blocks 4 and 5. This file does not repeat them.

**Block 1 is done** (engine, skin packs, style sheets): branch `block-1-engine-art`, draft pull request https://github.com/grantalf/heritage-hills-app/pull/1, preview https://claude.ai/artifact/8qaz23FeFqpVcpT71CtPbQ. Details, checks and open points are in `BLOCK1_STATUS.md`.

## Founder's answers after block 1 (2026-11-17)
- **Style pick: look D. Thick outline, shaded color** (D-074). It is now the default on the block 1 branch. The block 1 preview link was not republished, so it still opens on look B; choose D on the Pick a look page.
- **The paper map sample was not good enough.** The founder wants the map much more detailed and artistic, in the styles of his three references. A map drawn by code will not get there. The map's picture will be real painted artwork, with code drawing only what must be exact: labels as real text, tap targets, and road paths for travel (D-075). **The founder has not yet chosen where the artwork comes from:** an illustrator, or painted pieces from an image tool that code puts together. Until then, treat any code-drawn map (block 1's sample, block 3's world map) as a stand-in for layout and behavior only. Do not spend more time polishing code-drawn map art.

## Current focus: the remaining Fable 5.2 time
Read `FABLE_PLAN.md` (version 3) and `STYLE_BRIEF.md`. **Where they differ, STYLE_BRIEF.md wins.** The founder's access to Fable 5.2 ends soon. He wants that time spent on the hardest work, with sign-ups and deployment left for Opus and Sonnet. Blocks:
1. Side-scroller engine, skin packs, and style sheets. **Done, on its branch.**
2. Brawler playable level in the chosen look: heroes, zombies and ghouls, Triceratops boss. Running (see `BLOCK2_STATUS.md`).
3. Critter Club rebuilt as a game on the paper map. Running (see `BLOCK3_STATUS.md`).
4. Pet character cards, stickers and paw notes, portrait request queue (may slip to Opus).
5. Independent reviews and handover briefs.

**Next single session, before more building: merge the branches.** Start with `Continue from STATUS.md. Merge the block branches into main. Work unattended.` Steps: merge block 1 first, then the others; keep one side-scroller engine (`src/lib/arcade/` from block 1 or `src/lib/brawler/` from block 2) and delete the other; keep only look D (remove the other three from `LOOK_IDS` in `src/lib/pixel/sheet.ts`, run `npm run sprites`); renumber the `D-B1-`, `D-B2-`, `D-B3-` decisions into DECISIONS.md; fold STYLE_BRIEF.md into FABLE_PLAN.md as version 4; republish the main preview; rewrite this file.

**Helpful from the founder, not blocking:** a photo of the Triceratops sculpture, answers to the open questions at the end of STYLE_BRIEF.md, and a real-phone try with Expo Go.

## Done
- Red-team review of Phase 0 (REDTEAM.md). Fourteen findings. Main changes: public-read first, no open feed in v1, three delivery waves, Texas age law added, backend decision reopened.
- Product spec (SPEC.md), security and data design (SECURITY.md), decisions D-001 to D-075 (DECISIONS.md), game design (GAME.md).
- App, Expo SDK 58 + TypeScript:
  - Five tabs: Home, Events, Neighbors, Nature, More. About 25 screens.
  - English and Spanish everywhere. Text size control. Light and dark.
  - Visitor / Neighbor / Board switch under More (stands in for real sign-in).
  - Alerts, events with online option and RSVP, share shelf with request and report, volunteering, private invites, Flowers for Neighbors, garden project page with interest list, ecosystem articles and monthly tips, rebates and resources, By the Numbers (no made-up values), community capital, association page with advisory poll, tamper-evident decision record with "Check the record", privacy controls with consent history, show and delete my information, board alert with two-person rule.
  - Three style directions to try under More > Language and text size > "Try a look".
  - **Critter Club game** (GAME.md): 47-animal field guide, each animal with its own original cartoon character; "I spotted it" with kind of place and optional photo; pet pages made by families (they build the pet's character from color, ears and markings); detective cases in the old-school style (witnesses, travel, 24-hour clock, notebook, name the culprit); a Patterns page (where, when, which months, through the day; wildlife only, no street map); a "Show a real photo" button that loads a licensed iNaturalist photo with credit; seasonal bingo; ranks and badges; shared tally; rules for playing kindly. Playable with no account.
- Checks that pass on `main`: type-check, lint, 85 unit tests (record, safety rules, game rules, detective cases, patterns, photo rules, content in both languages, color contrast for all four looks), and a 63-step journey check on the web build.
- Bugs found by checking and fixed: values not updating on screen (experimental compiler, now off), saved choices not reloading after restart, crash when opening a page directly.
- Plan for the remaining Fable 5.2 time (FABLE_PLAN.md version 3, STYLE_BRIEF.md), with prices and store rules checked on 2026-11-16.
- **Block 1, on its branch (2026-11-17):** game art drawn in code as pixel sprites in four looks; side-scroller rules with waves, the Triceratops boss and the rescue ending; skin packs with dates; Game workshop screens (pick a look, playable test street, paper map sample) in English and Spanish. 120 unit tests and 38 web checks pass on that branch. See `BLOCK1_STATUS.md` and `docs/ART_PIPELINE.md`.

## Not verified. Read before trusting the draft
- **Not run on a real iPhone or Android phone.** Only the web build was exercised, at small-Android and large-iPhone screen sizes. Native behavior (safe areas, keyboard, back gesture, TalkBack and VoiceOver) is untested. **This now matters more: the side-scroller's drawing and touch controls depend on real-phone speed** (block 1 tested them in a desktop browser only).
- **The preview links were not checked inside Claude's viewer.** If one opens blank or navigation fails there, run it locally (README.md) and tell Claude.
- **Spanish was written by Claude.** A native speaker from the neighborhood should review it.
- **Ecosystem articles are drafts** with general Central Texas guidance. No local expert has checked them. They are labeled "Draft" in the app.
- **Resource amounts** were checked against official pages on Nov 15-16, 2026. Re-check before launch.
- No formal security, accessibility or plain-language review by a separate reviewer yet. Block 1 was self-reviewed with the two project checklists.
- **Field guide facts are a draft** written from general knowledge of Central Texas animals. A local naturalist should confirm each entry for Heritage Hills. Characters are cartoon drawings made from traits; a naturalist should check they do not mislead.
- **Real photos were not tested against the live iNaturalist site.** The build environment could not reach it, so the loader was tested only on invented sample answers. It falls back to a link. Photo license terms (many are non-commercial) need a board or attorney check (D-054).
- **Pet characters, cases and patterns use sample data.** The pattern numbers are invented.
- **The camera was not tested.** Photo choosing uses the phone's picker and could only be exercised on real devices.
- **The Triceratops sculpture** is known only from the founder's description. No photo seen; artist and owner unknown. The game's Triceratops is our own drawing.
- **Whether an image tool can paint map pieces good enough for the founder has not been tried.** D-075 names it as one option; test it on a few pieces before promising it.
- More block 1 limits (no sound yet, right-to-left layout, very large text on the game screen) are listed in `BLOCK1_STATUS.md`.

## Next, in order
**While Fable 5.2 is available:** finish blocks 2 to 5, then the merge session described above. What to type is in COMMANDS.md.

**After, with Opus or Sonnet:**
1. Founder: open the preview, try the three looks, and say what you like and dislike. Then Claude refines one into a short brand guide (colors, type, icons, tone) for the board.
2. Run the three reviewers on the rest of the draft as separate agents: security (`hh-privacy-security-review`), accessibility and plain language (`hh-plain-language-a11y-review`). Fix what they find.
3. Fix native-only problems found on real phones.
4. **Paper map artwork (D-075).** Once the founder chooses the source: get the painted artwork, lay it under the real-text labels and tap targets, and line the travel paths up with it.
5. Public facts pack: boundary, districts, schools, parks, transit, and Census figures for By the Numbers (Heritage Hills vs Austin vs Texas vs United States, with margins of error).
6. Verify the ecosystem articles against City and Texas sources. Add sources and dates. Find a local reviewer (for example a Master Naturalist or Watershed Protection contact).
7. Draft privacy policy, terms, community guidelines and moderation policy for attorney review.
8. One-page budget and funding plan (REDTEAM.md finding 8), then choose the backend (D-027).
9. Wave 1 for real: replace sample content with board-approved content, add push alerts, publish the web app on the association's domain.
10. Image service account with a hard monthly limit, for the portrait maker (only if the board approves D-059).
11. More brawler levels, heroes and holiday skin packs, following `docs/ART_PIPELINE.md` and the how-to from block 2.
12. Arabic and right-to-left check, including the game stage, controls and map.

## Blocked on a human
- **Founder: where the paper map artwork comes from** (an illustrator, or painted pieces from an image tool). See D-075.
- Confirm the association's exact name and current officers (two names appear in public records).
- Is the association incorporated? Get the bylaws.
- Board approval of scope, privacy principles and who moderates.
- Board approval of pet portraits through an outside image service, and about $50 a year for it (D-059).
- Board view on a brawler with cartoon violence inside the association's app, and on the store age rating it brings (D-056, D-061).
- Blessing from the Triceratops sculpture's artist or owner (D-062).
- Who pays recurring costs (about $415 a year: Apple $99, non-pausing database about $300, domain about $15; plus up to about $50 for portraits).
- Attorney questions listed at the end of REDTEAM.md.
- Attorney: does a kid-friendly game zone change the app's duties under children's privacy law and the Texas app store law (D-045)? Now also: pet photos sent to an outside AI service, and rights in style samples.
- A local naturalist to check the field guide.
- A native Spanish reviewer.
- See CHECKLIST.md for accounts to create.

## How to run it
See README.md in the repository. Short version: `npm install`, then `npx expo start`, then scan the QR code with Expo Go, or press `w` for the browser. `npm run check` runs all checks. To see block 1's work, check out branch `block-1-engine-art` first.

## Notes for the next session
- Sample data only. Never put real resident data in the repository.
- Repository instructions for Expo are in AGENTS.md: check the versioned docs, do not trust memory.
- `npx expo install` cannot reach Expo's servers from the cloud workspace. Use versions from `node_modules/expo/bundledNativeModules.json` with `npm install`.
- To republish the preview: export with `EXPO_NO_BUNDLE_SPLITTING=1`, run `scripts/build_preview.py`, publish the single file to the same artifact.
- Texas Wildflower and Clean Civic currently look alike (both blue). If the founder leans toward Wildflower, push it further: meadow green as the main color with bluebonnet as the accent.
- Image service model names and prices change month to month. Re-check when the account is opened.
- Reference pictures the founder shares are for discussion only. Never ship them or feed them to an image service as style samples (D-060).
- Do not start several block sessions at once again unless each is told its branch. One at a time is simpler: later blocks build on earlier ones.
- `docs/STATUS.md` and `docs/DECISIONS.md` on the block 1 branch match the Project copies as of this update.
