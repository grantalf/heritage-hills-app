# Handover: how a fresh session continues this project

Written 2026-11-17 by the block 5 session (Fable 5.2). For the founder, and for any later Claude session on Opus or Sonnet. Read this after STATUS.md.

**If you are a new session:** read STATUS.md, DECISIONS.md, this file, then REVIEW_BLOCK5.md. Then do the first task below that is not ticked. Each task brief stands on its own.

## 1. What happened on the last Fable night

Five sessions (blocks 1 to 5 of FABLE_PLAN.md) were started within two minutes of each other on 2026-11-16, all from the same commit of `main` (`03841e0`). The Fable 5.2 limit was reached around 2 AM, and blocks 3, 4 and 5 were finished on Opus 5.5 on 2026-11-17. It sorted itself out well:

- Each block rebuilt itself **on top of the one before**, so the branches form one chain. Nothing is in `main` yet.
- There is **one side-scroller engine** (`src/lib/arcade/`). Block 2 dropped its own.
- Each block logged its decisions in its own status file as `D-B1-..` to `D-B5-..`, to be renumbered when merged.
- Block 5 (this review) ran two independent reviewers on block 4's code, which contains everything. The fixes are on `block-5-review`, on top of block 4.

## 2. State of the branches (2026-11-17)

| Order | Branch | Pull request | What it adds | Status file |
|---|---|---|---|---|
| 1 | `block-1-engine-art` | #1 | Engine, skin packs, pixel art in four looks, Game workshop | BLOCK1_STATUS.md |
| 2 | `block-2-brawler` | #2 (on #1) | Critter Rescue: Frontier Trail, Bo and Flor, the Iron Triceratops, sounds | BLOCK2_STATUS.md |
| 3 | `block-3-critter-club` | #3 (on #2) | Critter Club as a game: title, storybook map, travel, hosts, quests | BLOCK3_STATUS.md |
| 4 | `block-4-pet-cards` | #4 (on #3) | Pet character cards, stickers, paw notes, portrait requests | BLOCK4_STATUS.md |
| 5 | `block-5-review` | #5 (on #4) | Fixes from the independent review, REVIEW_BLOCK5.md, this file | BLOCK5_STATUS.md |

Merge them in that order. Each one already contains the ones before it.

## 3. Facts checked on 2026-11-17 (re-check before relying on them)

| Topic | What is true today | Source |
|---|---|---|
| Texas app store law (SB 2420) | Enforceable since June 4, 2026. A district court blocked it in December 2025, the Fifth Circuit paused that block (May 28 and June 4, 2026), and the U.S. Supreme Court declined to step in on July 6, 2026. The appeal is not decided, so this can change. | [Lexology, July 2026](https://www.lexology.com/library/detail.aspx?g=60cfedda-77a9-4539-b439-a68c4f42b52a), [CCIA case page](https://ccianet.org/litigation/ccia-v-paxton-w-d-tex/), [StackGo tracker, Nov 5, 2026](https://stackgo.io/regulations/us-state-age-verification-laws/) |
| What SB 2420 asks of an app maker | Give each store an age rating for the app using four age groups (under 13, 13 to 15, 16 to 17, 18 and over), tell the store about significant changes, and read the age group and parent-consent signal the store passes to the app. On iPhone that is Apple's Declared Age Range API. On Android it is the Play Age Signals API. | [Ashurst Perkins Coie, July 2026](https://www.ashurstperkinscoie.com/en/insights/supreme-court-green-lights-the-texas-age-verification-law-for-app-stores/), [MacRumors, June 2026](https://www.macrumors.com/2026/06/03/apple-app-store-texas-sb-2420/) |
| Texas SCOPE Act (HB 18) | A second Texas children's law. It covers services whose main job is letting users interact socially, make a profile and post content. It exempts small businesses as the federal Small Business Administration defines them. Whether a volunteer association's app is covered is an attorney question. | [Texas bill analysis](https://capitol.texas.gov/tlodocs/88R/analysis/html/HB00018H.htm), [Texas Data Law, Oct 2026](https://texasdatalaw.com/insights/scope-and-app-stores-have-different-litigation-histories/) |
| Federal children's privacy rule (COPPA) | The updated rule has applied in full since April 22, 2026. It defines a "mixed audience" service: one that appeals to children but is not mainly for them. A game zone drawn for kids makes this question real for us. | [Federal Register](https://www.federalregister.gov/documents/2025/04/22/2025-05904/childrens-online-privacy-protection-rule), [Davis Polk, April 2026](https://www.davispolk.com/insights/client-update/ftc-prioritizes-coppa-enforcement-new-compliance-obligations-take-effect) |
| Apple age ratings | Five levels: 4+, 9+, 13+, 16+, 18+. Apple works out the level from a questionnaire. Cartoon or fantasy violence: infrequent gives 9+, frequent gives 13+. The rating covers the whole app. | [Apple reference](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions/), [Newly, 2026](https://newly.app/how-to/app-store-age-rating) |
| Google Play testing rule | A new personal developer account must run a closed test with 12 testers for 14 days in a row before going public. Organization accounts are exempt but need a D-U-N-S number. | [Google Play help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en) |

None of this is legal advice. The attorney questions are collected in REVIEW_BLOCK5.md.

## 4. Task briefs, in order

Each brief has: what to type, what to read, steps, and how to know it is done. "Model" is the least capable model that should do the job well.

### T-01. Merge the five branches into `main` (do this first)
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-01. Work unattended.`
- **Model:** Opus.
- **Read:** section 2 of this file; BLOCK1_STATUS.md to BLOCK5_STATUS.md; the "For the session that merges" part of each.
- **Steps:**
  1. Merge pull requests #1, #2, #3, #4, #5 in that order (on GitHub, or `git merge` of each branch into `main`, then push). Run `npm install` and `npm run check` after each. Each branch already contains the ones before it, so there should be no conflicts.
  2. Run all five browser checks on the web build (README.md): `e2e_web.py`, `e2e_workshop.py`, `e2e_rescue.py`, `e2e_world.py`, `e2e_cards.py`.
  3. Keep only look D: remove looks A to C from `LOOK_IDS` in `src/lib/pixel/sheet.ts`, then `npm run sprites`. Fix any test or check that named the other looks.
  4. **Decisions.** Copy `D-B1-01`..`D-B1-10`, `D-B2-01`..`D-B2-11`, `D-B3-01`..`D-B3-14`, `D-B4-01`..`D-B4-10`, `D-B5-01`.. from the status files into DECISIONS.md as D-077 and up, in block order. Add one line to each status file mapping old numbers to new.
  5. Fold STYLE_BRIEF.md into FABLE_PLAN.md as version 4 (it already wins where they differ).
  6. Rewrite STATUS.md as one file. Mark each BLOCK*_STATUS.md "merged into STATUS.md on (date)".
  7. Republish the main preview (https://claude.ai/artifact/EKgQGrPRdNUZncBEsncH6v) from the merged `main`.
- **Done when:** `main` passes `npm run check` and all five browser checks; one look; one decision list with no duplicate numbers; one STATUS.md; the preview shows the map, Critter Rescue and a pet card.
- **Do not:** delete the block branches until the founder has seen the merged preview.

### T-02. Re-run the reviewers after the next big change
- **When:** after the real backend (T-10), after the painted map lands, and before the store release.
- **Model:** Opus. Run each reviewer as a separate agent so the work does not grade itself.
- **How:** copy the reviewer instructions from REVIEW_BLOCK5.md section 7 ("How the reviews were run"). Give them the open findings and the backend requirements as the test list.
- **Done when:** no open High finding; every backend requirement has a passing test.

### T-03. Finish the open findings from the block 5 review
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-03. Work unattended.`
- **Model:** Sonnet for wording and labels; Opus for anything marked "needs backend".
- **Read:** REVIEW_BLOCK5.md, "Open findings".
- **Done when:** each open finding is fixed, or has a decision in DECISIONS.md saying why not.

### T-04. Try it on real phones, then fix what breaks
- **Needs the founder first:** install Expo Go on an iPhone and on a low-cost Android phone, run the app (README.md), and tell Claude: did it open; was Critter Rescue smooth, with sound; did the map traveler walk smoothly; did anything overlap or get cut off; did the back gesture work; did VoiceOver or TalkBack read the buttons. **Photo check (needed before any upload):** pick a photo taken with location on, add it to a pretend pet card, then ask Claude how to confirm the saved copy has no location (block 4's finding, D-B4-09).
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-04. Here is what I saw on my phones: (your notes).`
- **Model:** Sonnet. Opus if the game is slow, because that may mean changing how it draws.
- **Done when:** the founder's notes are each fixed or logged; REVIEW_BLOCK5.md "Could not check" items for real devices are ticked.

### T-05. Pick the app's look and write the brand guide
- **Already picked:** the game look (D, thick outline, shaded; D-074).
- **Needs the founder first:** a favourite of the three app looks (More > Language and text size > Try a look: Warm Community, Clean Civic, Texas Wildflower).
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-05. My picks: (your picks).`
- **Model:** Sonnet.
- **Steps:** make the picked look the default, remove the other two, and write a two-page brand guide for the board: colors with contrast numbers, type, icons, tone of voice, the game's look, do and do not.
- **Done when:** the contrast tests pass for the one look; the guide is in the Project.

### T-05b. Paper map artwork (D-075, D-076)
- **Needs the founder first:** export the four test pictures from the Figma file "Heritage Hills paper map - image tool test" as PNGs into the Project files (figma.com is not reachable from Claude's workspace).
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-05b. Work unattended.`
- **Model:** Opus.
- **Steps:** follow `docs/MAP_ART_TEST.md`: assemble one corner, show the founder, then make the full set of pieces and list them in `MAP_PIECES` (`docs/CRITTER_WORLD.md`). Labels stay real text. No houses, lots, numbers or pins.
- **Done when:** the founder approves the corner, then the whole map.

### T-06. Public facts pack
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-06. Work unattended.`
- **Model:** Sonnet with web search.
- **Steps:** gather the boundary, council and county districts, schools, parks, transit, and Census figures for By the Numbers (Heritage Hills against Austin, Texas and the United States, with margins of error). Every number gets a source link and a "last checked" date. Neighborhood-wide figures only (D-014). No named individuals.
- **Done when:** By the Numbers shows real, sourced figures and the "sample" labels are gone from that page only.

### T-07. Check the nature articles and the field guide
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-07. Work unattended.`
- **Model:** Sonnet with web search.
- **Steps:** check each ecosystem article and each of the 47 field-guide entries against City of Austin, Texas Parks and Wildlife and Texas A&M AgriLife sources. Add sources and dates. List what a local naturalist still needs to confirm.
- **Needs a human:** a local reviewer (for example a Texas Master Naturalist).
- **Done when:** every article and entry has a source and date, or is marked for the naturalist.

### T-08. Drafts for the attorney
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-08. Work unattended.`
- **Model:** Opus.
- **Steps:** draft a privacy policy, terms of use, community guidelines, a moderation policy, and the photo and portrait consent wording, in plain English and Spanish. Put the attorney questions from REVIEW_BLOCK5.md and REDTEAM.md into one list, most important first. Mark every draft "Draft for attorney review. Not legal advice."
- **Needs a human:** an attorney. Board approval.
- **Done when:** the drafts and the question list are in the Project as documents the board can read.

### T-09. Budget, funding and the backend choice
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-09. Work unattended.`
- **Model:** Opus. Check every price on the provider's own page that day.
- **Steps:** one page for the board: yearly costs, who could pay, what happens if nobody pays. Then compare backends against D-027 (Supabase paid tier, Firebase, others) on cost, pausing when idle, row-level security, export, and handover to a new volunteer. Recommend one. Log it.
- **Needs a human:** the board decides who pays.

### T-10. Build the real backend (accounts, verification, rules)
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-10. Work unattended.`
- **Model:** Opus. This is the highest-risk build left.
- **Before starting:** T-09 decided, the association's accounts exist (CHECKLIST.md), and the board has approved the privacy principles.
- **Steps:** follow SECURITY.md. Write the access rules first, with a test for each rule that proves the wrong person is refused. Email code sign-in (D-025). Household code verification (D-026). Consent ledger. Export and delete. Two-person rule enforced on the server. Sample data kept out of the store build (D-013). Then run T-02's security reviewer again on the backend.
- **Done when:** every "needs backend" finding in REVIEW_BLOCK5.md is closed and every rule in SECURITY.md has a passing test.
- **Stop for the human:** creating accounts, anything that costs money, loading any real resident data.

### T-11. Wave 1 for real
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-11. Work unattended.`
- **Model:** Sonnet.
- **Steps:** replace sample content with board-approved content, add push alerts, publish the web app on the association's domain.
- **Needs a human:** board-approved content; the domain.

### T-12. Store release
- **Type:** `Continue from STATUS.md. Do HANDOVER.md task T-12.`
- **Model:** Opus, with the `hh-store-release-checklist` skill. It re-checks the store rules that day.
- **Decide first (board):** where the brawler ships (D-061). Inside the app it likely makes the whole app 13+ on Apple. On the web it has no store rating.
- **Texas law:** read the age group signal from each store (section 3) and record what the app does with it. Attorney review before submitting (D-029).
- **Stop for the human:** every sign-in, payment and legal agreement.

### T-13. Portrait maker tool (only if the board approves D-059)
- **Model:** Sonnet for the queue screens; Opus for the privacy review of the image service terms.
- **Already built (block 4):** the request flow, agreement screen, queue, photo checks and limits, with `PORTRAIT_SERVICE.approved` set to false in `src/lib/petcards.ts`, so nothing can go out.
- **Steps:** open an image service account with a hard monthly limit, on a paid tier that does not train on uploads (verify on the provider's own terms page that day). Fill in `PORTRAIT_SERVICE` and set `approved` only after the board's written yes. Check the "portrait" lines of the backend requirements in REVIEW_BLOCK5.md.

### T-14. More levels, heroes and holiday packs
- **Model:** Sonnet. Follow the brawler how-to written in block 2. No real people, no real animals as enemies, no fights at the school, homes or the garden (D-073).

### T-15. Arabic and right-to-left
- **Model:** Sonnet, plus a native reviewer.

### T-16. Take in the human reviews
- When the native Spanish reviewer, the naturalist, the attorney or a board member sends notes, type: `Add these review notes and fix what they cover: (notes).`
- **Model:** Sonnet.

### T-17. Ownership handover runbook
- **Model:** Sonnet.
- **Steps:** one document that lets a new volunteer take over: every account, who holds it, how to move it, where recovery codes are, how to run and release the app, who to call. Names only for roles, no personal phone numbers.
- **Needs a human:** the founder fills in names.

## 5. Rules every later session must keep

1. No real resident data in code, samples, prompts or screenshots.
2. Sightings record a kind of place. Never an address, a pin or the phone's location.
3. No fights at the school, homes or the garden. No human enemies. No real animals as enemies.
4. Nothing shown below 10 sightings. Wildlife only on the map. Never pets or strays.
5. Every string in English and Spanish. Readable body font. Text size setting always works.
6. The app calls no outside service unless the person taps to ask for it.
7. Reference pictures are for discussion only. Never ship them or give them to an image service.
8. Add to STATUS.md and DECISIONS.md. Read them again right before writing, because another session may have changed them.
9. Stop for: accounts, payments, legal sign-off, board approval, anything that cannot be undone.
