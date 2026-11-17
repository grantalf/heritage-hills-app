# Critter Club: the neighborhood animal game

Version 0.2, 2026-11-16. "Critter Club" is a working name. Status: first draft built with sample data, proposed for board review.

## Why it exists
It is the app's front door. A neighbor who would never open an app for meeting minutes will open one to find out which dog is called Biscuit or what dug holes in the lawn. Along the way they meet neighbors, learn what lives here, and add to a shared record of the neighborhood's wildlife.

It builds three kinds of community capital: natural (knowing and protecting what lives here), social (pets are the easiest introduction between neighbors) and human (kids and adults learning to observe).

## How it plays

| Part | What you do | Borrowed from |
|---|---|---|
| **Field guide** | 47 local animals in six groups, each with its own cartoon character. Each starts faded and lights up when you find it. Every animal has one surprising fact, where to look, its scientific name, and a real photo you can ask for. | Sticker albums and museum-collection games: the pull of an album with empty spaces |
| **"I spotted it!"** | Pick the animal, pick a kind of place, add a photo if you like. A first find earns more than a repeat. Rarer animals earn more. | Creature-spotting walk games, without the map pins |
| **Pet pals** | Each pet has a page made by its own family: a character they build (color, ears, markings), what it loves, how to say hello, stories. Tap "I met Biscuit!" to collect a paw stamp. | Getting-to-know-you card collecting |
| **Detective cases** | You get a case file and 24 hours on the clock. Question witnesses (a dog, a mockingbird, a set of tracks) for clues. Some clues say what the culprit is like; some say where it went. Travel to the next place; a wrong turn costs hours. Mark what you learn in your notebook to narrow 47 suspects to a few, then name the culprit at the last stop. Faster solves earn more. Running out of time still teaches the answer and one thing you can do. | The classic 1980s and 90s geography detective games: witnesses, travel, a ticking clock, a notebook that narrows the suspects |
| **Patterns** | Charts of where, when and in which months each wild animal is seen, and how its usual place changes from dawn to night. | Community science projects |
| **Backyard bingo** | A seasonal card of nine things to notice. Three in a row is a bingo. | Bingo and lotería, nature scavenger hunts |
| **Neighborhood tally** | Everyone's finds add to one shared total and a list of which animals have been seen. | Community science counts and bioblitz events |
| **Ranks and badges** | Curious Neighbor, Trail Scout, Creek Detective, Neighborhood Naturalist, Guardian of the Hills. Nine badges such as Night Owl and Pollinator Friend. | Scout badges |

No account is needed to play. Progress is saved on the phone. Sign-in is needed only to add a pet page or send a story.

## Rules built into the design

1. **Cooperative, not competitive.** There is one shared neighborhood total and a shared goal. There is no scoreboard of people or streets, which keeps the earlier rule against ranking neighbors.
2. **Look, do not touch.** Points reward noticing and learning. Nothing rewards getting closer, touching, feeding or chasing. Animals that can hurt (coral snake, scorpion, fire ant, bat, coyote, skunk, raccoon) carry a warning.
3. **A kind of place, never an address.** Sightings record "a yard", "the creek" or "the sky". No map pins. Photo location data is stripped.
4. **Pets belong to their families.** A pet has a page only if its family made one. They choose what to share and they approve any story before it shows.
5. **Strays stay safe.** The app never shows where stray animals are. It explains ear-tipped community cats and what to do about a lost-looking pet.
6. **Photos are of animals only.** No people, never children, no house numbers or license plates. In the finished app a moderator checks every photo before neighbors see it.
7. **Kids play with a grown-up.** On the grown-up's phone. No child accounts and nothing stored about children.
8. **No private yards.** "Look from where you are. Never go into someone else's yard."

## Characters, real photos and patterns (added in 0.2)

**Characters.** Every animal has an original cartoon character in one friendly, collectible style: big head, big eyes, bold outline. They are drawn by the app from a short list of traits (colors, ears, tail, wings, markings), so there are no image files to license and they stay sharp at any size. They are our own designs. They are not copies of any existing game's characters, and should stay that way.

A pet's family builds its character by picking a color, ears and markings. **No pet photo is uploaded and no AI image service is used**, so nothing about the family leaves the phone. Turning real photos into characters automatically would mean sending neighbors' photos to an outside company; that is a board decision, not a default (D-051).

**Real photos.** The character helps you remember an animal; a photo helps you identify it. Each animal page has a "Show a real photo" button. It loads one photo from iNaturalist (a nonprofit nature site), and only if the photographer chose a license that allows sharing. The photographer's credit and the license are always shown. Nothing loads until the person asks, because loading it means their phone contacts another website (D-054). A second button opens more photos on that site.

**Patterns.** The page shows, for all wildlife or one animal: the share of sightings in each kind of place, by time of day, and by month, plus "through the day" (where it is usually seen at dawn, daytime, dusk and night). It says nothing until there are at least 10 sightings, and it names a season only when one clearly stands out.

Two honest limits are shown on the page itself:
1. It is a neighborhood notebook, not a science study. Places and hours when more people are outside get more sightings.
2. **It is not a street map, on purpose** (D-053). The request was for sightings on a map. A map of exact spots would also be a map of which yards people report from, and for pets and strays it would show a family's daily routine or lead someone to an animal. So the "map" is six kinds of place, and pets and strays are never included. A coarse map (for example four or five named areas such as "near the creek", each with enough homes that no one is singled out) could be added later if the board wants it.

## What needs a human before this is real

| Item | Why |
|---|---|
| **Attorney question** | A game that appeals to children may change the app's duties under children's privacy law and the Texas app store law, even with adult-only accounts. Ask before launch. |
| **A local naturalist** | The field guide was written from general knowledge of Central Texas animals. Each entry needs checking for Heritage Hills, including which animals are really here and how often they are seen. Good contacts: a Texas Master Naturalist chapter, Travis Audubon, the City's wildlife staff. |
| **Photo moderation** | Sharing photos means someone reviews them. This adds to the moderators' work described in the red-team review. |
| **Photo source and license** | Real photos come from iNaturalist at the moment a person asks. Many photographers there allow non-commercial use only. A no-dues volunteer association is very likely non-commercial, but an attorney or the board should confirm. The safer long-term choice is a fixed set of photos chosen by a naturalist, with permission, bundled in the app (no outside website contacted). Not yet tested against the live site. |
| **Character review** | A naturalist should check that each character's colors and features do not mislead (the character is not an identification aid, the photo is). |
| **Case facts** | The clues state animal facts (armor plates, sticky toes, night habits). Check them with the field guide. |
| **Spanish animal names** | Common names vary by country. A native speaker from the neighborhood should confirm them. |
| **The name** | Check that "Critter Club" does not clash with an existing product before it is used publicly. |

## Ideas for later, roughly in order of value

1. **Kids' drawing contest for the field guide.** Neighborhood children draw the 47 animals. The drawings appear in the app beside the characters, with the artist's first name if the family agrees. It gives families a reason to join and makes the guide ours.
1. **More cases, and promotions.** A new case each month written from the season (who is eating the tomatoes, who sings at 3 a.m.). Detective ranks earned by cases solved, as in the classic games. A printed case for the association meeting.
2. **Lost and found pets.** A family marks their pet as missing and verified neighbors get an alert with its page. This may be the single most useful feature for pet owners.
3. **Seasonal events.** Firefly watch in late spring, monarch week in fall, a winter bird count weekend, a bat-watching evening. Each is a neighborhood event and a limited-time badge.
4. **Share counts with science.** With the board's approval, send the tally to a community science project so researchers can use it.
5. **Paper version.** Print the bingo card and the cases for the association meeting and for neighbors without phones.
6. **Paw posts.** A sign at the garden or park with a code. Scan it to collect a stamp and read this month's case.
7. **Pet parade.** A yearly event where neighbors collect paw stamps in person.
8. **Sound clues.** "Who is singing?" mysteries using recorded calls of local birds and frogs.
9. **Memory match.** A simple card-matching game using the field guide, for the youngest players.
10. **Stewardship quests.** Finding a monarch unlocks "plant milkweed"; finding a firefly unlocks "turn off a porch light". The game hands players to the Nature section.
11. **Neighborhood unlocks.** When the shared total reaches a goal, something real happens, such as planting a pollinator bed at the garden.

## The game shell (block 3)
Since block 3, Critter Club opens on its own title screen and its world is the storybook map: tap a place, the traveler walks there, critter hosts give quests, rescue places open Critter Rescue. See `docs/CRITTER_WORLD.md`.

## Where it lives in the code
- Content: `src/lib/data/game-content.ts` (animals, sample pets, cases, sample habits, bingo cards)
- Characters: `src/components/critter-art.tsx` (the drawing), `src/lib/data/game-art.ts` (each animal's traits, pet maker choices, scientific names, sizes)
- Rules: `src/lib/game.ts` (points, ranks, badges, bingo lines, tally), `src/lib/cases.ts` (clock, travel, notebook, naming), `src/lib/patterns.ts` (counts and patterns), `src/lib/real-photo.ts` (which photo may be shown)
- Tests: `tests/game.test.ts`, `tests/cases.test.ts`, `tests/patterns.test.ts`, `tests/real-photo.test.ts`
- Screens: `src/app/critters/` (cases in `case/`, patterns in `patterns.tsx`); place drawings in `src/components/zone-scene.tsx`
- Data doorway: the Critter Club section of `src/lib/data/repository.ts`
