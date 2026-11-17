# STATUS (read first every session)

Last updated: 2026-11-17, evening Central, after block 5 finished (on Opus 5.5).

## Where things stand
**First draft of the app exists, runs, and is pushed.** Repository: `grantalf/heritage-hills-app`. A private web preview of `main` is published at https://claude.ai/artifact/EKgQGrPRdNUZncBEsncH6v (it shows `main`, which does not have blocks 1 to 5 yet).

**All five Fable plan blocks are done, each on its own branch, stacked in order. Nothing is merged into `main` yet.** Read `HANDOVER.md` next: it lists the branches and has a task brief for every next step, starting with the merge (T-01). Each block's details are in its status file: `BLOCK1_STATUS.md` to `BLOCK5_STATUS.md`.

| Order | Branch | Pull request | Preview |
|---|---|---|---|
| 1 | `block-1-engine-art` | https://github.com/grantalf/heritage-hills-app/pull/1 | https://claude.ai/artifact/8qaz23FeFqpVcpT71CtPbQ |
| 2 | `block-2-brawler` | https://github.com/grantalf/heritage-hills-app/pull/2 | https://claude.ai/artifact/UZcQkKBGmXWCGsenmdGUru |
| 3 | `block-3-critter-club` | https://github.com/grantalf/heritage-hills-app/pull/3 | https://claude.ai/artifact/8YvyS4gC8TqG2sx8QY4Esd |
| 4 | `block-4-pet-cards` | https://github.com/grantalf/heritage-hills-app/pull/4 | https://claude.ai/artifact/K6RBn27sTP4YTuRAFxFUjF |
| 5 | `block-5-review` | https://github.com/grantalf/heritage-hills-app/pull/5 | none (use block 4's, or the merged preview after T-01) |

- **Block 1** (engine, skin packs, style sheets). Details: `BLOCK1_STATUS.md`, `docs/ART_PIPELINE.md`.
- **Block 2** (Critter Rescue, the first playable level): heroes Bo and Flor, the Frontier Trail, the Iron Triceratops, sound, rescue stamps. Details: `BLOCK2_STATUS.md`, `docs/BRAWLER.md`, `docs/BRAWLER_HOWTO.md`.
- **Block 3** (Critter Club as a game): title screen, storybook map with tap-to-travel, six hosts, ten quests, patterns on the map, pixel critters, the wood-and-parchment look. The map picture is a stand-in until the painted art arrives. Details: `BLOCK3_STATUS.md`, `CRITTER_WORLD.md`.
- **Block 4** (pet character cards, stickers, paw notes, portrait requests). **Board decision sheet:** https://claude.ai/artifact/F2BS2mu7isFijWTGPt8LZp. Details: `BLOCK4_STATUS.md`, `PETCARDS.md`.
- **Block 5** (independent reviews and handover). Two separate reviewers checked blocks 1 to 4 and the base app: 8 High findings, all fixed, plus most Mediums. Report for the board: `REVIEW_BLOCK5.md`. Task briefs for later sessions: `HANDOVER.md`. Details: `BLOCK5_STATUS.md`.

## Founder's answers after block 1 (2026-11-17)
- **Style pick: look D. Thick outline, shaded color** (D-074). Block 2's game and block 3's pixel critters use look D only. The merge (T-01) removes looks A to C.
- **The paper map will be real painted artwork** (D-075). The image tool paints separate pieces, and code places them on the real layout (D-076). Details: `docs/MAP_ART_TEST.md`. **Blocked:** the founder needs to export the four test pictures from Figma as PNGs into the Project files before about 2026-11-24. Until then, any code-drawn map is a stand-in for layout and behavior only.

## Next
**The next session merges the five branches.** Type: `Continue from STATUS.md. Do HANDOVER.md task T-01. Work unattended.` After that, follow the task briefs in `HANDOVER.md` in order (T-03 open review findings, T-04 real phones, T-05 the app's look, T-05b map art, T-06 facts pack, T-07 nature checks, T-08 attorney drafts, T-09 budget and backend, T-10 the real backend, T-11 Wave 1, T-12 store release, and the rest). What to type is also in `COMMANDS.md`.

**Helpful from the founder, not blocking:** a photo of the Triceratops sculpture; answers to the open questions at the end of STYLE_BRIEF.md; a real-phone try with Expo Go (with sound on); a line on the working names (Bo, Flor, the Frontier Trail; Dilly, Hazel, Buzz, Mo, Ollie, Cotton; Lookout Hill; the Roaring Wall; the pet card classes, stats and stickers).

## Done
- Red-team review of Phase 0 (REDTEAM.md); product spec (SPEC.md); security and data design (SECURITY.md); decisions D-001 to D-076 (DECISIONS.md) plus each block's D-B1- to D-B5- decisions in their status files; game design (GAME.md).
- App on `main`, Expo SDK 58 + TypeScript: five tabs, about 25 screens, English and Spanish, text size, light and dark, Visitor / Neighbor / Board switch (draft only), alerts, events and RSVP, share shelf, volunteering, invites, Flowers for Neighbors, garden page, ecosystem articles, resources, By the Numbers, community capital, association page with poll, tamper-evident decision record, privacy controls with export and delete, board alert with the two-person rule, three app looks to try, and the first Critter Club game.
- Blocks 1 to 4 on their branches (see the table above).
- **Block 5, on its branch (2026-11-17):** independent security and privacy review (3 High, 12 Medium, 12 Low, 4 notes) and accessibility, plain-language and Spanish review (5 High, 20 Medium, 21 Low). Fixed all 8 Highs and most Mediums, including: photos locked once checked and cleaned everywhere, a tougher word check on everything neighbors read, the 10-sighting minimum on every screen, a share shelf for neighbors only, an export with only the person's own data, one demo switch that keeps the draft's stand-ins out of store builds, spoken confirmations, page language and titles on the web, game controls for screen readers, readable dark-mode game menus, and consent text that matches what the app does. Handover briefs for every next step. Legal and store facts re-checked on 2026-11-17 (HANDOVER.md section 3).
- **Checks on `block-5-review` (the tip of the chain):** type-check, lint, 246 unit tests; browser checks `e2e_web` 64, `e2e_workshop` 40, `e2e_rescue` 52, `e2e_world` 105, `e2e_cards` 118. All pass.

## Not verified. Read before trusting the draft
- **Not run on a real iPhone or Android phone.** Only the web build was tested, at small-Android and large-iPhone sizes. Untested: native behavior (safe areas, keyboard, back gesture, VoiceOver, TalkBack), the game's drawing speed, touch controls and sound, the map's walking and scrolling, the game's new screen-reader actions, and spoken confirmations on iPhone.
- **Photo location data.** The image picker's `exif: false` option does not remove location; block 4's fix (`src/lib/strip-photo.ts`) is now used for sightings, pet photos and the portrait maker's upload, but it is proven on the web build only. Check on real phones before any photo is uploaded.
- **The word check is not perfect.** It still misses a phone number split up by words, a daily routine, and a child's name (REVIEW_BLOCK5.md). Families approve notes, anyone can report, and the real server must check again.
- **The preview links were not checked inside Claude's viewer.** If one opens blank, run the branch locally (README.md).
- **Spanish was written by Claude.** The accessibility reviewer shortened the list for a native speaker (its report, section 4).
- **Ecosystem articles and field guide facts are drafts.** No local expert has checked them.
- **Resource amounts** were checked against official pages on Nov 15-16, 2026. Re-check before launch. Their summaries still read above a 6th-grade level (P-06).
- **Real photos were not tested against the live iNaturalist site.** Photo license terms need a board or attorney check (D-054).
- **All pets, cards, notes, cases and patterns are sample data.** The pattern numbers are invented.
- **The camera was not tested.**
- **The Triceratops sculpture** is known only from the founder's description.
- **The map art test was judged from small previews only** (`docs/MAP_ART_TEST.md`).
- **Game sounds were checked by numbers, not by ear;** difficulty by a robot, not a child.
- Right-to-left layout of the games and cards is not handled.

## Blocked on a human
- **Founder: export the four map test pictures** from Figma as PNGs into the Project files, before about 2026-11-24.
- Confirm the association's exact name and current officers (two names appear in public records).
- Is the association incorporated? Get the bylaws.
- Board approval of scope, privacy principles and who moderates.
- **Board decisions on pet cards and portraits** (D-059, D-064, D-065, block 4's limits): https://claude.ai/artifact/F2BS2mu7isFijWTGPt8LZp.
- Board view on the brawler and the store age rating it brings (D-056, D-061). Checked 2026-11-17: on Apple, frequent cartoon violence means 13+ for the whole app.
- Board view on sighting patterns by large named regions (D-067).
- **Board process (new):** publish the decision record's check code in each set of minutes, so "Check the record" can catch a cut-off tail (S-14).
- Blessing from the Triceratops sculpture's artist or owner (D-062).
- Who pays recurring costs (about $415 a year, plus up to about $50 for portraits).
- **Attorney:** the questions at the end of REDTEAM.md, in the board decision sheet, and in `docs/reviews/2026-11-17-security-privacy.md` section 5 (children's privacy rule, Texas SB 2420, which is enforceable since June 2026, the Texas SCOPE Act, the portrait service agreement, Property Code ch. 209, liability for notes and pages).
- A local naturalist to check the field guide. A native Spanish reviewer.
- See CHECKLIST.md for accounts to create.

## How to run it
See README.md in the repository. Short version: `npm install`, then `npx expo start`, then scan the QR code with Expo Go, or press `w` for the browser. `npm run check` runs all checks. Branch `block-5-review` contains everything; earlier branches contain the blocks up to their own.

## Notes for the next session
- Sample data only. Never put real resident data in the repository.
- **Demo switch:** `expo.extra.demo` in app.json must be `true` for previews. With it off, the app stops at start-up on purpose until the real backend exists (`src/lib/demo.ts`).
- **After changing app.json, export with `--clear`,** or the web build keeps the old settings.
- Repository instructions for Expo are in AGENTS.md: check the versioned docs, do not trust memory. docs.expo.dev is not reachable from the cloud workspace; check the installed packages' type definitions instead.
- `npx expo install` cannot reach Expo's servers from the cloud workspace. Use versions from `node_modules/expo/bundledNativeModules.json` with `npm install`.
- `gh pr create` fails from the cloud workspace. Use `gh api repos/grantalf/heritage-hills-app/pulls --method POST --input pr.json`.
- To republish a preview: export with `EXPO_NO_BUNDLE_SPLITTING=1`, run `scripts/build_preview.py <export dir> <out file> [start page] [title]`, publish the single file to the same artifact.
- Browser checks: `e2e_web.py`, `e2e_workshop.py`, `e2e_rescue.py`, `e2e_world.py`, `e2e_cards.py`, each with `http://127.0.0.1:8791` after the export and server steps in README.md. `e2e_cards.py` takes about 8 minutes.
- Photos and uploaded portraits live in memory only in the draft. A full page reload forgets them.
- Reference pictures the founder shares are for discussion only. Never ship them or feed them to an image service (D-060).
- **Run one block session at a time.** Five at once worked out this time only because each session moved onto the previous block's branch.
