# Critter Club as a game: the storybook map (block 3)

2026-11-17. Plain-language summary first, technical notes after.

## What it is
Critter Club now feels like entering a game. It has its own title screen with a wooden sign, its own wood-and-parchment colors, pixel critters and its own menu bar. Its world is the storybook map of Heritage Hills.

1. **Title screen.** The sign, a row of pixel critters, the story, how to play, a sound switch, and one big button: "Start the adventure". The first time, Dilly the Armadillo says hello at the statue and gives the first quest.
2. **The map.** Tap a place. The traveler walks there along the roads by itself (no joystick). Then the place's card opens.
3. **Places.**

| Place | Kind | Host | What you can do |
|---|---|---|---|
| The Iron Triceratops (statue) | Calm, real | Dilly the Armadillo | Rescue stamps |
| The Creek | Calm, real | Hazel the Heron | Look around, patterns |
| Garden site | Calm, real | Buzz the Bumblebee | Look around, bingo |
| The Mighty Bridge | Calm, real | Mo the Mockingbird | Detective cases, tally, look around |
| Lookout Hill | Calm, made up | Ollie the Owl | Patterns, field guide |
| To the Big City (sign) | Calm, made up | Cotton the Cottontail | Look around, tally |
| Hart Elementary | Landmark, real | none | Nothing: a quiet place |
| Frontier Trail | Rescue, made up | none | Opens Critter Rescue (block 2) |
| The Roaring Wall | Rescue, made up | none | "Coming later" (a future level) |

4. **Hosts and quests.** Each host critter gives quests: visit places, spot real animals (birds, pollinators, night animals, one of each kind), solve a case, get a bingo line, meet pets, free the Frontier critters. Quests use only what the game already records. Finished quests give points.
5. **Points and ranks.** The experience bar shows points and rank. Points are the game's existing points plus quest rewards.
6. **Patterns on the map.** Six round buttons under the map, one per kind of animal. Pick one: the map shows how many were seen at the creek, and a note gives the shares for yards, gardens, streets and sky. Those are never drawn as spots on the map.
7. **No map needed.** "List" shows the same places. "More" lists every activity and every place. Every map action can be reached without the map.

## Rules kept
- **No fights at the school, homes or the garden** (D-073). Rescue places are only made-up lands at the map's edges. The school is a landmark with nothing to do.
- **The traveler is made up.** The game never uses the phone's location.
- **The map shows roads and public places only.** No houses, lots, house numbers or pins. Not to scale.
- **Wildlife only in patterns; nothing below 10 sightings** (D-053). The large named regions from the plan are not built: they need board approval.
- **Look, do not touch** (D-050). Quests reward noticing. The creek and night quests say "with a grown-up".
- **Kept on this phone only.** The map game saves where the traveler is, places visited, hosts met, rewards collected and the sound switch. "Show my information" includes it, and "Delete my information" erases it.

## The map picture is a stand-in
The founder chose painted artwork for the map (D-075, D-076). The picture drawn in code is plain on purpose. What stays when the painted art arrives: the road layout, the places and their buttons, the text labels, and travel along the roads.

**How to add the painted art:** the map is 780 x 900 "map units". Paint at that size or a whole multiple of it. Put each piece in `MAP_PIECES` in `src/components/quest/paper-map.tsx` with its position and size in map units. Pieces are drawn above the stand-in. Remove the stand-in parts a piece replaces.

## Where things are
| Path | What it holds |
|---|---|
| `src/lib/quest/map.ts` | Roads, creek and garden outline, in the sketch photo's own pixels (IMG_4460.jpeg). The road network and shortest route. |
| `src/lib/quest/places.ts` | The places, their kind, host and activities. Travel routes and times. |
| `src/lib/quest/quests.ts` | Quests, quest status, points and rank. |
| `src/lib/quest/state.ts`, `store.ts` | What is saved on the phone (`hh.world.v1`), read defensively. |
| `src/lib/quest/levels.ts` | Which rescue level a rescue place opens. `RESCUE_IN_APP` turns rescue places off if the game ships outside the app (D-061). |
| `src/lib/quest/map-patterns.ts` | Patterns shown on the map, safely. |
| `src/lib/quest/critter-puppet.ts` | Pixel critters drawn from each animal's traits, with block 1's pixel tools. |
| `scripts/make_critter_sprites.mts` | `npm run critters`: makes the critter sprite sheet (look D only). |
| `src/lib/quest/palette.ts` | The zone's colors (contrast tested). |
| `src/components/quest/` | The map, pixel critters, dialog box, experience bar, menu bar. |
| `src/app/critters/` | Title (`index`), map (`world`), quest log (`quests`), cases, More. `_layout.tsx` gives every Critter Club screen the zone look. |
| `tests/quest-world.test.ts` | 39 tests. |
| `scripts/e2e_world.py` | 105 browser checks: small Android, large iPhone, reduced motion, Spanish with the largest text. |

## How to
- **Add a place:** add it to `PLACES` (sketch pixels), add `place.<id>.name` and `.about` in `quest.en.ts` and `quest.es.ts`, and pick its label side in `paper-map.tsx`. The tests check it can be reached by road.
- **Add a quest:** add it to `QUESTS` with a rule over existing game data, then add the title, ask and done text in both languages. The tests check the wording does not reward touching, feeding or chasing.
- **Connect a new rescue level:** give the place `{ kind: 'rescue', level: '<level id>' }`. Once that id exists in block 2's `LEVELS`, the place opens it.
- **Change a pixel critter:** change its traits in `src/lib/data/game-art.ts` (the cartoon changes too), then run `npm run critters`. To use an artist's sheet, put `critters.png` in `art/overrides/critters/`.

## Not verified
- Not run on a real phone. Walking animation speed, the place card as a phone sheet, and the two-way scroll when zoomed in need a real-phone check.
- Map labels grow only a little with the text-size setting (the picture cannot reflow). The list view has full-size text.
- Right-to-left layout of the map is not handled.
- Spanish written by Claude. Check host names and quest text with a native speaker.
- Host names, quest names and made-up place names are working names for the founder to change.
