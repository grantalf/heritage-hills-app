# How to add to Critter Rescue

For whoever works on the game next, including a volunteer or a later Claude session. Each section is a short recipe. Run `npm run check` at the end of every recipe; the tests catch most mistakes.

## Add a level
1. In `src/lib/arcade/levels.ts`, copy `FRONTIER_TRAIL` and give it a new `id` (lowercase, dashes).
2. Fill in `title`, `story` and `place` in English and Spanish. One or two short sentences, sixth-grade words.
3. **Place rules (D-073):** never at the school, at homes or at the garden. Joke about traffic and construction, not about where people live. A test checks the level's words for school, home, house, garden and yard.
4. Set `length`. The screen shows about 180 art pixels at a time; the Frontier Trail is 1060 long.
5. Add `waves`. Each wave starts when the hero reaches `atX` and holds the camera until every monster is gone. Start easy (two Shamblers), then mix. `snack: true` drops a watermelon after the wave. Space waves at least 150 apart.
6. Set `boss` (where the statue stands) at least 100 past the last wave, and the `cage` just after it. Leave `boss` out for a level with no boss: the level ends when the hero reaches the cage.
7. `cage.critters` must be field guide ids (`src/lib/data/game-content.ts`) of **wild** animals that have a picture (a sheet in `skins.ts`). Never pets. A test checks this.
8. `scenery`: pick a `mood` (colors, in `MOODS` in `src/components/arcade/stage.tsx`) and a `backdrop` (a sheet with `far` and `near` frames). To add new scenery, see "Add scenery" below.
9. Add the level to `LEVELS`. To let block 3's map open it, add it to the map's level registry (`src/lib/quest/levels.ts` on block 3's branch) with `/brawler?level=<id>`.
10. Add a test to `tests/rescue.test.ts` like the Frontier Trail ones: copy the "can finish" test so a self-playing hero proves the level can be finished on both settings.

**Tuning feel.** Monster numbers are in `ENEMY` and `TUNING` in `src/lib/arcade/rules.ts`. Gentle should be finishable by a first-time player. Keep `attackers` at 1 for Gentle so only one monster winds up at a time.

## Add a hero
1. Draw the puppet in `src/lib/pixel/puppets.ts`: copy `FLOR` and `florSheet()`. Give the hero a **very different outline** from the others (height, hat, hair) and a household item, never a weapon. Every hero needs the animations `idle, walk, attack1, attack2, attack3, hurt, down, cheer`.
2. Add the sheet to `allSheets()` and run `npm run sprites`. A test fails if a frame touches the edge of its cell: make the cell (`cw`, `ch`) bigger.
3. In `src/lib/arcade/rules.ts`, add the id to `HeroId`, `HEROES` and `HERO_IDS`. Keep health equal for every hero; change reach, speed and the last swing.
4. In `src/lib/arcade/skins.ts`, add a skin role, its `REQUIRED_ANIMS`, a skin in `BASE_PACK`, and extend `heroRole()`.
5. Add the face position to `FACE` in `src/components/arcade/hud.tsx` so the portrait shows the face.
6. Add `rescue.hero.<id>` and `rescue.hero.<id>.about` to `rescue.en.ts` and `rescue.es.ts`.

## Add a holiday pack
A pack swaps pictures, names and sounds for some roles between two dates each year. Rules and screens do not change.
1. Draw the new sheets (often a recolor: see `shamblerFrost` in `allSheets()`, which uses `recolor`). Run `npm run sprites`.
2. In `src/lib/arcade/skins.ts`, add a pack to `PACKS` with `from` and `to` as `'MM-DD'` (a range may cross New Year), and only the roles it changes. Roles it leaves out keep their everyday look.
3. Give any sound a different recipe name if you like (`sounds: { poof: 'jingle' }`). A test checks every name exists.
4. **Example packs** (`example: true`) never turn on by date. Remove `example` only when the board has seen the pack.
5. Holiday ideas that stay kind: a scarf and earmuffs in winter, pumpkins on monsters in October, flowers in spring. Avoid religious figures and anything scary for small children.
6. The style brief suggests a short silly bonus round between levels as the place for holiday content. It is not built yet.

## Add or change a sound
1. In `src/lib/arcade/sound.ts`, add a recipe to `SOUNDS`: a list of tones (`square`, `triangle`, `sawtooth` or `noise`; start pitch, optional end pitch, length in seconds, volume).
2. Keep it under a second and soft: a test fails if any sound is longer than a second or peaks above 0.6.
3. To play it for a game event, map the event in `soundsFor()`.
4. Run `npm run sounds` to make the phone's WAV files. The web plays the recipe live.

## Add scenery
1. Copy `frontierSheet()` in `src/lib/pixel/puppets.ts`. A backdrop sheet has two frames, `far` (a quiet tree line) and `near` (props), each 128 wide, and repeats sideways. Keep it quieter than the characters.
2. Add its colors to `PALETTE`, add the sheet to `allSheets()`, and give it a skin role in `skins.ts` with animations `far` and `near`.
3. Add a mood (sky, glow, ground colors) to `MOODS` in `src/components/arcade/stage.tsx`.
4. A test checks that backdrop tiles line up at their edges.

## Replace code-drawn art with real art
See `docs/ART_PIPELINE.md`. Save the new picture as `art/overrides/<look>/<sheet>.png` with the same cell size and frame order, stored three times larger. Run `npm run sprites`. No code changes.
