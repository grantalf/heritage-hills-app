# Pet character cards, stickers, paw notes and portraits (block 4)

Plain-language guide first, technical notes after. Last updated 2026-11-17.

## In one minute
- Every pet in Critter Club has a **character card**, like a video game character: a framed picture, a class ("Nap Wizard"), five stats (Fluff, Zoomies, Snack Power, Bravery, Volume), favorite things, habits, a special move, and how to say hello.
- **Only a pet's own family** makes or changes its card. **Wild regulars** (the heron at the creek) are suggested by neighbors and approved by a moderator.
- Neighbors can give **stickers** (preset, like "Goodest" or "Best hello"; one of each per person) and write short **paw notes** (140 letters). A paw note shows only after the pet's family says yes. Nobody sees who wrote a note.
- A family can add a **real photo** and ask for a **portrait**. A volunteer called the **portrait maker** checks the photo, makes the portrait with an outside picture service, and uploads it. The app itself never contacts the picture service.
- Nothing ranks pets. The album starts on a different card each day and never sorts by stickers.

Everything here runs on sample data on the phone. Nothing is sent anywhere.

## Where to find it
- **Pets** in the Critter Club menu bar opens the album (two taps from Home).
- A family adds a pet with **Add my pet**, then fills in the card. Their card has **Edit the card** and **Real photo and portrait**.
- The portrait maker opens **More > Portrait requests and suggestions** (in the draft, switch to Board under More).

## The rules, in plain words
| Rule | Why |
|---|---|
| Only the pet's family makes its card. | Consent; the family moderates its own page (D-048). |
| Cards families make are for verified neighbors only. Signed-out visitors see sample pets. | A pet's name and habits can help someone find a home. |
| Wild regulars: wild field guide animals only, at the creek, the park or the sky. No animal that can hurt people. Never a cat or dog on its own. | No yards or streets; nobody goes looking for a dangerous animal; showing where a stray is can get it hurt (D-046, D-048, D-050). |
| Stickers are preset. One of each per person per card. Counts only, never who. | Fun with nothing to moderate (D-065). |
| Paw notes: up to 140 letters, no links, emails, phone numbers or addresses, 3 a day, one waiting per pet. Shown only after the family says yes. The family can take a note down later or quietly stop notes from a sender. | A narrow exception to "no open comments" (D-024) that the family controls. |
| Anyone signed in can report a card or a note. Two reports hide it until a moderator checks. | Store rules (Apple 1.2, Google Play user content) and D-024. |
| The real photo is private to the family by default. The family can choose "verified neighbors too". Visitors never see it. | Opt-in for anything neighbors see. |
| A portrait request needs the family's yes on an agreement screen that names the picture service. | Apple guideline 5.1.2(i) on sharing personal data with third-party AI. |
| The portrait maker sees the photo only while the request is open. The photo is deleted when the portrait is done, when the family stops the request, or after 30 days, unless the family chose to show the photo to neighbors. | Keep photos only as long as needed. |
| Only the photo and the kind of animal go to the picture service, under a random file name. No pet name, family or place. | Data minimization. |
| Every chosen photo is drawn again as a new picture before it is kept, which removes hidden details like GPS location and phone model. | The picker's `exif: false` setting does **not** clean the file (see "Finding" below). |
| Limits: 4 tries a request, 2 open requests per household, one redo per pet, $4 a month and $50 a year. | The budget the founder suggested (D-059). Also set a hard monthly limit on the service account. |
| Requests are done in a weekly batch, on Sundays. | Keeps the portrait maker's time small. |

## Handing on the portrait maker role
Any moderator can hold it. To hand it on: the board grants the role to the new person (two approvers, like every role change), the outgoing person signs out of the picture service, and the service account's password and recovery codes move with the other association credentials (transfer runbook). The service account belongs to the association's role email, never a person's own account.

## Finding during this block: photo location data
Earlier code said `exif: false` in the image picker "leaves out the location". It does not: it only leaves the details out of what the picker reports, and the file keeps them. Block 4 adds `src/lib/strip-photo.ts`, which draws the photo again as a new JPEG. It is now used for pet photos and for sighting photos. The browser check proves a test photo with a planted GPS tag comes out clean on the web build. **Check it on a real iPhone and Android phone before any photo is uploaded.**

## For developers
| Path | What it holds |
|---|---|
| `src/lib/petcards.ts` | All rules as plain functions: stats, favorites, word check, stickers, notes, who sees a photo, album order, regulars, portrait requests, spending, what is sent out. |
| `src/lib/data/petcard-repository.ts` | The interface screens use (`repo.cards`). A real backend implements the same methods. |
| `src/lib/data/petcard-sample.ts` | The sample adapter. Saves card data and request records on the phone; photos and uploaded portraits live in memory only. |
| `src/lib/data/petcard-content.ts` | Invented sample cards, stickers, notes, regulars and one sample request. |
| `src/lib/strip-photo.ts` | Removes hidden photo details. |
| `src/components/pet-card.tsx` | Card pieces: frame, portrait, stat bars and steppers, stickers, tiles, note card. |
| `src/app/critters/pets.tsx` | The album. |
| `src/app/critters/pet/[id].tsx`, `edit.tsx`, `portrait.tsx`, `notes.tsx` | Card, editor, photo and portrait, all notes. |
| `src/app/critters/regular/[id].tsx`, `new.tsx` | Wild regular card and suggestion form. |
| `src/app/portraits.tsx` | The portrait maker's page. |
| `src/lib/i18n/cards.en.ts`, `cards.es.ts` | All words, English and Spanish. |
| `tests/petcards.test.ts` | 36 rule and store tests, plus color contrast. |
| `scripts/e2e_cards.py` | 116 browser steps at 360x640, 430x932, and Spanish with the largest text. |

### What the real backend must enforce (not just the app)
- `pet_cards`: write only by the pet's household. Read: verified neighbors; visitors never.
- `pet_photos` (storage): read by the household; by verified neighbors only if the household chose it; by a portrait maker only while that pet has an open request. Delete on request end, cancel, 30 days, or pet removal.
- `paw_notes`: insert by verified neighbors, not the pet's household; rate limits (3 a day, one waiting per pet); the word check runs again on the server. Read `shown` notes: verified neighbors. Read `waiting`: the household only. `author_id` is never returned to anyone but moderators.
- `note_blocks`: owner only. Blocked senders' notes are accepted and never delivered.
- `stickers`: one row per (person, card, sticker). Only counts are readable.
- `regulars`: insert by verified neighbors with status `suggested`; status changes by moderators only; the place must be creek, park or sky; the animal must be a field guide animal with no caution.
- `portrait_requests`: insert by the household after the agreement (store version and time); state changes as in `advance()`; the spend log is append-only. Every time a portrait maker opens a photo, write an audit entry.
- `PORTRAIT_SERVICE.approved` stays false until the board approves a service and its terms are checked. While false, real requests are refused.

### Retention (proposed, for the board and attorney)
- Photos: as above, 30 days at most unless shown to neighbors by choice.
- Request records (with the agreement): 1 year, as proof of consent.
- Declined notes: 30 days, for moderation. Shown notes: until the family takes them down or removes the pet.
- Spend log: 2 years, with the association's other records.
