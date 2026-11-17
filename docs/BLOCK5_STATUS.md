# Block 5 status (independent reviews and handover)

Finished 2026-11-17, evening Central. Started on Fable 5.2 at 11:38 PM on 2026-11-16; the Fable limit stopped the first two reviewers early, so the work was finished on Opus 5.5. This file is owned by the block 5 session.

## Result
**Block 5 is done.** It met the plan's test: no open High findings, and a fresh session can continue alone (HANDOVER.md).

- **Code:** branch `block-5-review`, draft pull request https://github.com/grantalf/heritage-hills-app/pull/5, **stacked on block 4**. Merge #1, #2, #3, #4, then #5.
- **For the board:** `REVIEW_BLOCK5.md` (what was found, fixed and left open, in plain words).
- **For later sessions:** `HANDOVER.md` (branch state, facts checked today, 17 task briefs with what to type, rules to keep).
- **Full reviewer reports** (file and line for every finding): `docs/reviews/2026-11-17-security-privacy.md` and `docs/reviews/2026-11-17-a11y-plain-language.md` on the branch.

## What was done
1. Re-checked the legal and store facts the handover relies on, with live sources (HANDOVER.md section 3): Texas SB 2420 is enforceable since June 4, 2026, with the appeal still open; the amended children's privacy rule has applied since April 22, 2026; Apple's five age levels (frequent cartoon violence means 13+); Google Play's 12-tester rule for new personal accounts.
2. Ran two independent reviewers as separate agents, on a frozen copy of block 4's code (which contains blocks 1 to 3 and the base app). One covered security and privacy, the other accessibility, plain language and Spanish. Each loaded the project's own review skill and an 18-point checklist.
3. Fixed all 8 High findings and most Mediums (REVIEW_BLOCK5.md, "Fixed").
4. Wrote the handover briefs and updated SECURITY.md section 10 (the portrait maker's picture service).

## Checks run
- `npm run check`: type-check, lint, **246 unit tests pass** (15 new).
- Browser checks on the web build: `e2e_web.py` 64/64, `e2e_workshop.py` 40/40, `e2e_rescue.py` 52/52, `e2e_world.py` 105/105, `e2e_cards.py` 118/118.
- The fixes themselves were not re-reviewed by a third agent. The next review (HANDOVER.md T-02) should start from the open list.

## Not verified
- Real phones: the game's new screen-reader actions, spoken confirmations on iPhone, the bigger tab labels at the largest system text, and photo cleaning.
- Spanish changes are Claude's, following the reviewer's suggestions. A native speaker should still read the shortened list.
- The "Bingo del jardín" name was chosen over "Lotería" for now. A native speaker may switch it back in all five places.

## For the session that merges the branches
- Merge #5 last. It changes many shared files (text files, `ui.tsx`, the pet card store), but only on top of block 4, so there should be no conflicts.
- The demo switch is new: keep `expo.extra.demo: true` in app.json for previews. Export with `--clear` after any app.json change.
- Copy D-B5-01 to D-B5-11 below into DECISIONS.md with new numbers.

## Block 5 decisions
- D-B5-01 | 2026-11-17 | Review block 4's branch, the tip of the chain, from a frozen copy. Fixes go on `block-5-review`, stacked on block 4, pull request #5. Do not merge into `main` in this block | Blocks 1 to 4 finished as one chain; a frozen copy keeps the reviewers' line numbers true while fixes land; the merge is its own session (STATUS.md) | Review `main` only; merge first | done
- D-B5-02 | 2026-11-17 | While a portrait request is open, the family can't change or remove the photo, except after the portrait maker sends it back. A sent-back photo is deleted (unless shown to neighbors) and hidden from the portrait maker | The checked photo must be the photo that goes out; a photo rejected for showing people should not be kept (S-01, S-13) | Move the request back to waiting on any new photo | accepted
- D-B5-03 | 2026-11-17 | Portrait requests no longer hold the pet's name. The portrait maker sees the kind of animal and a request code (from the file name) | Data minimization; in a small neighborhood, a name plus a photo identifies a family (S-12) | Show the name | accepted
- D-B5-04 | 2026-11-17 | The word check undoes common tricks before checking, and catches our own street names: rare ones alone, common-word ones (Wisteria, Weeping Willow, Valley Forge) only with a number or street word. It covers pet names, "about", "hello" and share items, on the form and in the store. Known gaps (a split phone number, a routine, a child's name) are left to the family's approval, reports and the server | Text neighbors read could point to a home (S-02, S-04); blocking "wisteria" would stop ordinary pet words | Block every street word alone; rely on approval only | accepted
- D-B5-05 | 2026-11-17 | The share shelf is for signed-in neighbors only, and a hidden item is hidden from its direct link too | SECURITY.md says so; a saved link went around the report rule (S-07, S-08) | Public shelf | accepted
- D-B5-06 | 2026-11-17 | One demo switch, `expo.extra.demo` (strictly true). It gates the sample data, the role picker, the pretend second officer and the Game workshop. With it off, the app refuses to start until a real repository exists | The draft's stand-ins must never reach residents, and there was no switch at all (S-09 to S-11, S-25) | Separate flags; rely on people remembering | accepted
- D-B5-07 | 2026-11-17 | "Show my information" lists only the person's own things (no other people's IDs, no spending log) plus the settings on the phone. "Delete my information" keeps language and text size, and the confirm text says so | Exports must not reveal who wrote or was blocked (S-06); resetting a Spanish reader to English after a delete would be unkind; the settings are not about the person | Delete settings too (the reviewer's suggestion) | proposed, attorney to confirm with the privacy policy
- D-B5-08 | 2026-11-17 | Only https, phone and email links open from the app | Board-entered links later could otherwise open anything (S-18) | Trust stored links | accepted
- D-B5-09 | 2026-11-17 | Notices that follow an action announce themselves to screen readers (`Notice announce`); everything on parchment uses the zone's tested colors; one and other plural forms in English and Spanish | WCAG 4.1.3 and 1.4.3 (A-01, A-02); "1 neighbors" (P-05) | Fix each screen by hand | accepted
- D-B5-10 | 2026-11-17 | "Check the record" says only what it proves (no entry was changed up to number N) and asks people to compare the check code with the one in the board minutes. The board publishes the code with each set of minutes | A cut-off tail passed as "intact" (S-14) | Keep the stronger claim | proposed, needs board process
- D-B5-11 | 2026-11-17 | Animals with fewer than 10 sightings don't appear on the patterns page or the map card, and "all animals" combines only the animals that do | D-053, D-067: some screens showed counts below 10 (S-05) | Only hide the summary sentence | accepted
