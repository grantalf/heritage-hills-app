# Critter Rescue: the first real level (block 2)

Written 2026-11-17. Plain language first, for the board and the founder. Then the art guide, the checks, and what is not verified.

## What it is
**Critter Rescue** is a short arcade game in the app, in the spirit of early-90s cartoon arcade games. Ghouls have caged the neighborhood's wild critters out in the Frontier Lands. You walk the trail, bonk goofy monsters, calm the Iron Triceratops statue, and open the cage. The critters run out cheering "Thank you for rescuing us!" Each one you free gives a stamp and a fact about the real animal.

- **Where to find it:** More > Critter Rescue (two taps). Also from the Game workshop. Block 3's storybook map can open it directly at `/brawler?level=frontier-trail`.
- **Two heroes.** **Bo** is quick on his feet and swings a pool noodle. **Flor** is tall, reaches further and swings a garden rake. Both are equally tough, so choosing is about how you like to play.
- **Two settings.** **Gentle** (the default: more health, slower monsters) and **Classic**.
- **One level, about one to five minutes:** four fights, two watermelon snacks, the Iron Triceratops, three caged critters (armadillo, fox squirrel, cottontail).
- **Sound effects,** made by code, with an on/off switch. Sound remembers your choice.
- **"Watch it play"** lets the game play itself, for anyone who cannot use the buttons.
- **English and Spanish.** Text grows with the app's text-size setting.

## Tone and safety, built into the rules
- Hits are bonks. Beaten monsters turn into a puff of dust and stars. Nobody bleeds.
- No human enemies and no real animals as enemies. The monsters are made-up characters.
- Caged critters are always shown unharmed and happy. The rules have no way to hit them.
- The Triceratops is a statue under a spell. Beaten, it walks back to its base and is a statue again.
- The level is set in the Frontier Lands (the scrub forest edge of the map): not at the school, at homes or at the garden (D-073).
- Only wild critters are in the cage, never pets.
- A rescue stamp is **not** a field guide sighting. The field guide still needs a real "I spotted it" (D-072).

## Privacy
- The game collects nothing about the player, needs no account, and contacts no outside service.
- It keeps four things on this phone only: rescue stamps, best score, chosen hero and setting, sound on or off. "Delete my information" (More > Privacy) erases them too.
- Phone sounds use expo-audio for playback only. The app does not ask for the microphone: expo-audio's setup plugin is left out on purpose because it would add a microphone permission.

## Art guide
The art follows the style brief: one pixel look (D-069), look **D, thick outline and shaded color** (D-074).

| Piece | Rule |
|---|---|
| **Heroes** | Stocky, big head, hands and feet. Each hero has a very different outline: Bo is short with a wide straw hat; Flor is tall with a visor and a high ponytail. Each carries a household item, never a weapon. |
| **Monsters** | Goofy, not scary: bulging eyes, floppy arms. Each kind has a clear warning pose (arms up, crouch, wind-up) before it attacks. |
| **The Iron Triceratops** | Our own cartoon Triceratops built as a welded metal sculpture: plates, rivets, a little rust. Not a copy of the real sculpture. |
| **Critters** | Small, round, happy. Shown only cheering and running free. |
| **Scenery** | Quieter than the characters, so the action reads. One strong color mood per level. The Frontier Trail is golden hour over scrub forest: dusty caliche trail, prickly pear, rocks, cedar posts. |
| **Effects** | Big and simple: a white star for a bonk, a puff for a poof, stars for dizzy. Nothing flashes more than three times a second. |
| **Menus** | Wood and parchment: a hand-built wooden sign for the title, parchment panels in plank frames. Words are real text, never painted into pictures. |
| **Score bar** | Across the top: hero portrait, segmented health, score; the boss's bar appears when it wakes. Every bar has words for screen readers. |

**Colors.** Menu text pairs are checked for contrast in `tests/arcade-skins.test.ts` (`MENU_TEXT_PAIRS`). Teal is used only for borders on parchment, because teal text on parchment is too faint (3.8 to 1). White on teal is 4.8 to 1.

**Making art.** Characters are drawn in code as jointed puppets in `src/lib/pixel/puppets.ts`, shrunk to pixels with an outline, and saved as standard sprite sheets (`npm run sprites`). Art from an artist or a sprite tool can replace any sheet with no code change: see `docs/ART_PIPELINE.md`.

**Sounds.** Each sound is a short recipe of chip-style tones in `src/lib/arcade/sound.ts`. Short, soft, under a second. The web plays the recipes live; phones play WAV files made from the same recipes (`npm run sounds`).

## Where things are
| Path | What it holds |
|---|---|
| `src/app/brawler/index.tsx` | The screen: title, game, rescue card. |
| `src/lib/arcade/levels.ts` | `FRONTIER_TRAIL` and the list of levels. |
| `src/lib/arcade/rules.ts` | Game rules (block 1), plus block 2's two heroes (`HEROES`) and the angry statue (`ANGRY`). |
| `src/lib/arcade/skins.ts` | Skin packs. Block 2 added Flor and the Frontier scenery. |
| `src/lib/arcade/sound.ts` | Sound recipes and which game event plays which sound. |
| `src/lib/arcade/progress.ts` | Stamps, best score and settings, and how they are read safely. |
| `src/components/arcade/hud.tsx`, `menu.tsx` | Score bar; wooden sign and parchment panels. |
| `src/components/arcade/sfx.ts`, `sfx.native.ts` | Sound players for the web and for phones. |
| `src/lib/i18n/rescue.en.ts`, `rescue.es.ts` | The game's words. |
| `tests/rescue.test.ts` | 20 tests for this block. |
| `scripts/e2e_rescue.py` | 52 checks in a real browser at two phone sizes and in Spanish with large text. |

## Checks run (2026-11-17)
- `npm run check`: type-check, lint, **140 unit tests pass** (20 new). New tests cover: the level's shape and place rules; only field-guide wild critters in the cage, each with a fact in both languages; the two heroes' different reach and speed with equal health; **a self-playing Bo and Flor each finish the Frontier Trail on Gentle and Classic**, seeing every fight, the angry statue and the rescue; the statue gets angry exactly once and then winds up faster; every game event has a sound; the statue clangs; a holiday pack can swap a sound; no more than three sounds at once; sounds are short, soft and do not clip; stamps are given once; a lost level records nothing; broken or tampered saved progress falls back safely; progress holds nothing personal; every word is in English and Spanish.
- `scripts/e2e_rescue.py`: **52 of 52** on the web build at 360x640 and 430x932, and in Spanish with the largest text. Includes: two taps from More, hero choice remembered after reload, keyboard play, sounds made and silenced, pause and leave, **the whole level played start to finish** with "Watch it play", three stamps and three facts on the rescue card, a direct link.
- `scripts/e2e_workshop.py`: 40 of 40 (one check updated because look D is now the default). `scripts/e2e_web.py`: 63 of 63.
- A self-playing hero takes about 50 to 60 seconds. People will take a few minutes.
- Self-review with the project's privacy and security checklist and the accessibility and plain-language checklist. Fixed: "Delete my information" now also erases game stamps; teal text on parchment replaced with dark ink; small pictures redrawn at whole-number sizes. An independent review is block 5's job.

## Not verified. Read before trusting
- **Not run on a real phone.** Drawing speed, touch controls and **phone sounds** were never tried on a device. The phone sound player (`sfx.native.ts`) was checked against expo-audio 58's type definitions only. If sounds fail on a phone, the game still plays silently.
- **Sounds were checked by numbers, not by ear.** Someone should listen and say if any are annoying.
- **Robot runs prove the level can be finished, not that it is fun or fair for a 7-year-old.** Try it with real players on Gentle and adjust `TUNING` in `rules.ts`.
- **Spanish was written by Claude.** A native speaker should review it.
- **Right-to-left layout** of the stage and controls is not handled (same as block 1).
- **Store age rating:** a brawler is likely "frequent cartoon violence" on Apple's questionnaire, which would raise the whole app's rating (D-061). The game is one route, so it can ship inside the app, on the web only, or in a companion app.
- **The Triceratops sculpture's artist or owner has not been asked** (D-062).

## Decisions made in block 2
See `BLOCK2_STATUS.md` in the Claude Project (D-B2-01 to D-B2-10).
