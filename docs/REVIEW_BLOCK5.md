# Block 5 review: what the independent reviewers found and what was fixed

2026-11-17. For the board, the founder and the next Claude session. Nothing here is legal advice.

## In one minute

Two separate reviewers, who did not write the code, checked everything built so far: the base app plus blocks 1 to 4 (Critter Rescue, the storybook map game, pet character cards and portrait requests). They looked at:

- **Security and privacy:** 3 High, 12 Medium, 12 Low, 4 notes.
- **Accessibility, plain language and Spanish:** 5 High, 20 Medium, 21 Low.

**All 8 High findings are fixed, along with most of the Mediums.** The rules themselves were mostly right. The problems were places where a screen forgot to use a rule, or where the draft pretends to be a second person.

What changed, in plain words:

1. **Pet photos.** Once the portrait maker has checked a photo, the family can't swap it for a different one. A photo sent back because it shows people is deleted. The portrait maker's finished picture is cleaned of hidden location data too. The portrait maker no longer sees the pet's name.
2. **What people type.** Pet names, "about my pet", "how to say hello" and share shelf items now go through the same check as paw notes. The check also catches the usual tricks (spelled-out phone numbers, "dot com", look-alike letters) and names of our own streets.
3. **Patterns.** Animals with fewer than 10 sightings no longer show any numbers.
4. **Share shelf.** It's for signed-in neighbors only. A hidden item stays hidden even from a saved link.
5. **"Show my information"** now holds only your own things, not other people's IDs.
6. **One demo switch.** Everything pretend (choosing a role, any sign-in code, the pretend second officer, the pretend second report, the Game workshop) is tied to one setting. A build with demo turned off refuses to start until the real backend exists, so the draft can't reach residents by accident.
7. **Screen readers.** Confirmations after an RSVP, a report, a sent note or a deletion are now spoken. The game can be played with screen-reader actions. On the web, each page says its language and has its own title.
8. **Consent wording** now matches what the app actually does, and is plainer. "Only my family" was not true, because the portrait maker also sees the photo during a request.

## Checks after the fixes

- `npm run check`: type-check, lint, **246 unit tests pass** (15 new: word-check tricks, photo lock, sent-back deletion, export contents, demo switch, safe links, pack dates, plurals).
- Browser checks on the web build, all passing: `e2e_web.py` 64, `e2e_workshop.py` 40, `e2e_rescue.py` 52, `e2e_world.py` 105, `e2e_cards.py` 118 (new: the portrait maker does not see pet names).
- The full reviewer reports are in `docs/reviews/2026-11-17-security-privacy.md` and `docs/reviews/2026-11-17-a11y-plain-language.md`. They name each file and line.

## Fixed

| ID | What was wrong | Fix |
|---|---|---|
| S-01 (High) | A family could change the photo after the portrait maker checked it | Photo is locked while a request is open, except when it was sent back (`canChangePhoto`) |
| S-02 (High) | Pet name, about, hello and share item text had no word check | `petTextProblems`, `shareTextProblems` on the forms and in the store |
| S-03 (High) | The portrait maker's upload kept hidden location data | Cleaned with `stripPhoto` |
| S-04 (Medium) | More than 20 ways around the word check | `normalizeForCheck` plus street names, handles, more web endings. 3 known gaps remain (below) |
| S-05 | Patterns showed counts for animals with 1 to 9 sightings | Only animals with 10 or more are listed, on the patterns page and the map |
| S-06 | Export included other people's IDs and the spending log | Export is built from the person's own things only |
| S-07, S-08 | Hidden share items opened by link; visitors saw the shelf | Both fixed; visitors see a sign-in prompt |
| S-09, S-10, S-11, S-25 | Pretend second reporter, pretend second officer, role picker, any sign-in code, workshop, with no switch | One switch, `expo.extra.demo` (`src/lib/demo.ts`). Off means the app refuses to start until the real backend exists |
| S-12 | The portrait maker saw the pet's name | Requests no longer store it; the maker sees a request code |
| S-13 | A sent-back photo was kept and still visible | Deleted on send-back; the maker can't see it |
| S-14 | "Check the record" claimed more than it proves | Wording now says what it checks and asks people to compare the code with the board minutes |
| S-15 | Photo permission text didn't mention pet portraits | English text updated (Spanish prompts: open, A-15) |
| S-16, S-17 | Settings missing from the export; promised consent history not shown | Settings listed; history shown. Delete keeps language and text size, and says so (D-B5-07) |
| S-18 | Any link could open | Only https, phone and email links open (`src/lib/links.ts`) |
| S-20, S-23, S-24, S-27 | Preview builder escaping; repeated photo requests after a failure; spending log; half-dated skin packs | Fixed |
| A-01 (High) | Confirmations after actions weren't spoken | `Notice announce`, on 12 action results |
| A-02 (High) | Pause box buttons nearly invisible in dark mode | Parchment always uses the zone's tested colors |
| A-03 (High) | Web page language stayed English; every page had the same title | Both set from the app |
| P-01, P-02 (High) | Consent text said things the app doesn't do | Rewritten to match the code |
| A-04 | Screen-reader and switch users couldn't play | Named actions: forward, back, up, down, bonk (needs a real-phone check) |
| A-05, A-07, A-06, A-24 | Quest points not spoken on the map; tab bar role; tab labels cut off | Fixed |
| A-08, A-09, A-10, A-11, A-13, A-20, A-22 | Faint "you are here" ring; faded stamps; picture-only buttons; stat values; bingo rows; check marks; "purple places" | Fixed |
| A-12, A-14 (part) | Paw note counter and errors; removing a pet with one tap | Spoken; removing a pet now asks first |
| P-03, P-04, P-05, P-07, P-08, P-10 | Consent jargon; checkbox wording; "1 neighbors"; vague privacy lines | Rewritten; one/other plural forms added |
| E-01 to E-04, E-10 | Two names for bingo; masculine-only phrasing; grammar; mixed terms; "Derribado" | Fixed. "Bingo del jardín" is used everywhere for now; a native speaker may choose "Lotería" |

## Open findings, with who does what

"T-" numbers are task briefs in HANDOVER.md.

| ID | Severity | What is left | Who / when |
|---|---|---|---|
| S-04 rest | Medium | The word check still misses: a phone number split up by words, a daily routine ("alone in the yard 3 to 5"), and a child's name. Families approve notes, and anyone can report. | The server must run the check again (T-10). Board: moderation guide (T-08) |
| S-09, S-10, S-11 | Medium | Real reporting, a real second officer, real sign-in and roles | T-10 (backend) |
| S-14 rest | Medium | Publish the record's check code in each set of board minutes, and keep a second copy | Board process plus T-10 |
| S-19 | Low | Security headers for a hosted web version | T-11 |
| S-21 | Low | `npm audit` reports issues in build tools only (not in the app) | Watch Expo updates; do not run `npm audit fix --force` |
| S-22, S-24 rest | Low | Rare text in the record hash; monthly limits use UTC, not Austin time | T-03 |
| S-26 | Low | The photo-cleaning test covers pet photos on the web only | T-04 (real phones) and T-03 |
| S-28 to S-31 | Note | Sample pets' "where" field; SECURITY.md T16 vs the kid-friendly game; portrait viewer check; a separate portrait maker role | T-10 and the attorney |
| A-14 rest | Medium | Removing a share item or a photo takes one tap (both can be added again) | T-03 |
| A-15 | Medium | iOS permission prompts in Spanish (`locales` in app.json) | T-12 |
| A-16 | Medium | A sighting takes 5 or 6 taps; a sticker takes 4 (goal: 3) | T-03; design choice for the founder |
| A-17, A-18, A-19, A-21, A-23 | Low | Points bar contrast 2.98:1; spoken names a bit longer than visible ones; one stray label; two identical button names; Reduce Motion read once | T-03 |
| E-05 to E-09 | Low | "¡Pum!" vs "Golpecito"; "Reportar"; class names; text growth at 200%; event times follow the phone's time zone | Native speaker (T-16), T-03 |
| P-06 | Medium | Rebate summaries read at grade 9 to 18. Rewrites are in the reviewer report, section 4. | T-07, after re-checking the facts |
| P-09, P-11, P-12 | Low | Explain "moderator"; "at your own risk" on tools; a glossary for translators | T-03, attorney |

## What only a person can check

- **Real phones:** VoiceOver and TalkBack reading the game's named actions, the map, the cards and the spoken confirmations; photo cleaning on iPhone and Android (block 4's finding); the bottom tabs at the largest system text size. See T-04, and section 6 of each reviewer report.
- **Real children** playing Critter Rescue on Gentle.
- **A native Spanish speaker:** the shortened list in the accessibility report, section 4.
- **An attorney:** the questions in the security report, section 5 (children's privacy law, Texas SB 2420, the Texas SCOPE Act, the portrait service agreement, Property Code ch. 209, liability for notes and pages).

## Backend requirements

The security report, section 4, lists 23 testable rules (B-1 to B-23) that the real server must enforce: roles from the server only; reports counted from different verified people; a second officer for alerts; the word check run again; author IDs never exported; the maker sees only the checked photo; scheduled photo deletion; server-side photo cleaning; no coordinates on sightings; 10-sighting minimum in every count; an export allow-list; complete deletion; an append-only record with a published check code. **T-10 is done when each has a passing test.**

## How the reviews were run (to repeat them)

Two agents, each started fresh with no access to the work being reviewed beyond the code, on a frozen copy of the code (a `git worktree` at the commit under review). One loaded the `hh-privacy-security-review` skill; the other loaded `hh-plain-language-a11y-review`. Each got an 18-point checklist and a fixed report format (findings table with file and line, things that are fine, requirements, could-not-check). Both could probe the running web build with Playwright and were told not to change files. The full instructions are in the block 5 chat of 2026-11-17. Re-run them after the backend (T-10), after the painted map lands, and before the store release.
