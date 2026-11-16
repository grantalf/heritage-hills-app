# Critter Club: the neighborhood animal game

Version 0.1, 2026-11-16. "Critter Club" is a working name. Status: first draft built with sample data, proposed for board review.

## Why it exists
It is the app's front door. A neighbor who would never open an app for meeting minutes will open one to find out which dog is called Biscuit or what dug holes in the lawn. Along the way they meet neighbors, learn what lives here, and add to a shared record of the neighborhood's wildlife.

It builds three kinds of community capital: natural (knowing and protecting what lives here), social (pets are the easiest introduction between neighbors) and human (kids and adults learning to observe).

## How it plays

| Part | What you do | Borrowed from |
|---|---|---|
| **Field guide** | 47 local animals in six groups. Each starts faded and lights up when you find it. Every animal has one surprising fact and where to look. | Sticker albums and museum-collection games: the pull of an album with empty spaces |
| **"I spotted it!"** | Pick the animal, pick a kind of place, add a photo if you like. A first find earns more than a repeat. Rarer animals earn more. | Creature-spotting walk games, without the map pins |
| **Pet pals** | Each pet has a page made by its own family: what it loves, how to say hello, stories. Tap "I met Biscuit!" to collect a paw stamp. | Getting-to-know-you card collecting |
| **Mysteries** | A short case with three clues. Guess who did it. Fewer clues, more points. A wrong guess still teaches the answer and one thing you can do. Some cases feature neighborhood pets, with clues hidden in their pages. | Geography detective games: clue, deduce, learn |
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

## What needs a human before this is real

| Item | Why |
|---|---|
| **Attorney question** | A game that appeals to children may change the app's duties under children's privacy law and the Texas app store law, even with adult-only accounts. Ask before launch. |
| **A local naturalist** | The field guide was written from general knowledge of Central Texas animals. Each entry needs checking for Heritage Hills, including which animals are really here and how often they are seen. Good contacts: a Texas Master Naturalist chapter, Travis Audubon, the City's wildlife staff. |
| **Photo moderation** | Sharing photos means someone reviews them. This adds to the moderators' work described in the red-team review. |
| **Real pictures** | The emoji are stand-ins and a few show the wrong animal. See the drawing contest idea below. |
| **Spanish animal names** | Common names vary by country. A native speaker from the neighborhood should confirm them. |
| **The name** | Check that "Critter Club" does not clash with an existing product before it is used publicly. |

## Ideas for later, roughly in order of value

1. **Kids' drawing contest for the field guide.** Neighborhood children draw the 47 animals. The winning drawings become the pictures in the app, with the artist's first name if the family agrees. This solves the placeholder art, gives families a reason to join, and makes the guide ours.
2. **Lost and found pets.** A family marks their pet as missing and verified neighbors get an alert with its page. This may be the single most useful feature for pet owners.
3. **Seasonal events.** Firefly watch in late spring, monarch week in fall, a winter bird count weekend, a bat-watching evening. Each is a neighborhood event and a limited-time badge.
4. **Share counts with science.** With the board's approval, send the tally to a community science project so researchers can use it.
5. **Paper version.** Print the bingo card and the mysteries for the association meeting and for neighbors without phones.
6. **Paw posts.** A sign at the garden or park with a code. Scan it to collect a stamp and read this month's mystery.
7. **Pet parade.** A yearly event where neighbors collect paw stamps in person.
8. **Sound clues.** "Who is singing?" mysteries using recorded calls of local birds and frogs.
9. **Memory match.** A simple card-matching game using the field guide, for the youngest players.
10. **Stewardship quests.** Finding a monarch unlocks "plant milkweed"; finding a firefly unlocks "turn off a porch light". The game hands players to the Nature section.
11. **Neighborhood unlocks.** When the shared total reaches a goal, something real happens, such as planting a pollinator bed at the garden.

## Where it lives in the code
- Content: `src/lib/data/game-content.ts` (animals, sample pets, mysteries, bingo cards)
- Rules: `src/lib/game.ts` (points, ranks, badges, bingo lines, tally), tested in `tests/game.test.ts`
- Screens: `src/app/critters/`
- Data doorway: the Critter Club section of `src/lib/data/repository.ts`
