# Game art, engine and skin packs (block 1)

Written 2026-11-17. For the board in plain language first, then for whoever works on the code next.

## What this is, in plain words
- **The art is drawn by code.** Each character is a jointed puppet made of simple shapes. The code shrinks it to a small grid of pixels, picks from a short list of colors, and adds an outline. It costs nothing and every design is our own.
- **Four looks to choose from.** The same characters are drawn with a thin or thick outline, and with flat or shaded color. The founder picks one. See `docs/art/style-sheet-block1.png`, or More > Game workshop > Pick a look in the app.
- **The art can be replaced later.** Sprites are saved as standard sprite sheets (a picture plus a list of frames). Art from an artist or a sprite tool drops in with no code change.
- **The game rules are separate from the drawing.** The rules are tested on their own. A self-playing hero proves the test street can be finished.
- **Holiday swaps.** Every character is a role. Its picture, name and sounds come from a pack. A pack can have dates, so a holiday pack turns on and off by itself.
- **Tone.** Hits are bonks. Beaten monsters turn into a puff of dust and stars. The Triceratops goes back to being a statue. Rescued critters cannot be hurt: the rules have no way to hit them, and a test checks this.

This is stand-in art and one test street. The real first level is block 2.

## Where things are
| Path | What it holds |
|---|---|
| `src/lib/pixel/raster.ts` | Shapes to pixels: color ramps, shading, outline. Four looks. |
| `src/lib/pixel/puppets.ts` | Every character, prop and effect, as numbers. The color list is at the top. |
| `src/lib/pixel/sheet.ts` | Packs frames into a sheet. |
| `scripts/make_sprites.mts` | Draws everything. Run with `npm run sprites`. |
| `assets/game/<look>/<sheet>.png` and `.json` | The sheets, stored 3 times larger so phones never blur them. For artists and tools. |
| `src/lib/arcade/atlas.generated.ts`, `sheets.generated.ts` | The same sheets packed into the app. Never edit by hand. |
| `src/lib/arcade/rules.ts` | Side-scroller rules: movement, three-bonk combo, three enemy kinds, waves that hold the camera, boss, rescue, try again. |
| `src/lib/arcade/levels.ts` | Levels as plain data. |
| `src/lib/arcade/skins.ts` | Skin packs and dates. |
| `src/lib/arcade/scene.ts` | Turns the game into a flat list of things to draw. |
| `src/lib/arcade/session.ts` | One game in progress, stepped at a fixed rate. |
| `src/lib/arcade/autoplay.ts` | The self-playing hero ("Watch it play", and tests). |
| `src/components/arcade/` | The painter (`stage.tsx`), sprites, touch controls, and the paper map sample. |
| `src/app/workshop/` | The four workshop screens. |
| `tests/pixel-art.test.ts`, `tests/arcade-*.test.ts` | 35 tests. |
| `scripts/e2e_workshop.py` | 38 checks on the web build at two phone sizes, in English and Spanish. |

## How to
**Change a character.** Edit its numbers in `puppets.ts`, run `npm run sprites`, run `npm run check`. A test fails if a frame no longer fits its cell.

**Replace a character with outside art.** Save a PNG as `art/overrides/<look>/<sheet>.png` with the same cell size and frame order as `assets/game/<look>/<sheet>.json`, stored 3 times larger. Run `npm run sprites`. No code changes.

**Add a holiday pack.** Add the new sheets, then one entry in `PACKS` in `skins.ts` with `from` and `to` dates and the roles it changes. Roles it does not name keep their everyday look. A test fails if a skin is missing an animation its role needs. Example packs (`example: true`) never turn on by date.

**Add a level.** Copy `WORKSHOP_LEVEL` in `levels.ts` and change the numbers. Every level ends with a cage and a rescue. No level is set at the school, at homes or at the garden (D-073).

**Add an enemy kind.** Add its numbers to `ENEMY` in `rules.ts`, its behavior in `stepEnemy`, its role in `skins.ts`, and its puppet.

## Not verified. Read before trusting
- **Not run on a real phone.** The painter uses plain views and images, about 20 on screen, repainted every frame. This was smooth in a desktop browser at phone sizes. A cheap Android phone may be slower. If it is, replace only `components/arcade/stage.tsx` with a faster painter; rules, art and screens stay.
- **Touch controls were tested in a browser with two fingers, not on a phone.**
- **Right-to-left layout is not handled** for the stage, the controls or the map. They are forced left-to-right in the browser; check on a phone during the Arabic work.
- **No sound yet.** Packs have named sound slots. Playback is block 2.
- **Very large system text.** The game screen does not scroll, so its header, status line and control captions stop growing at 1.6 times. The status line is still read aloud.
- **Spanish was written by Claude.** A native speaker should review it.
- **The Triceratops is our own drawing of a cartoon dinosaur as a metal sculpture.** No photo of the real sculpture was used. The artist or owner has not been asked (D-062).

## Decisions made in block 1
See `BLOCK1_STATUS.md` in the Claude Project (D-B1-01 to D-B1-09).
