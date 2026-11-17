# DECISIONS LOG

Format: ID | date | decision | why | alternatives | status. "Proposed" means the board has not yet accepted it.

## Product and philosophy
- D-017 | 2026-11-15 | Stewardship of the neighborhood as an ecological unit, plus the seven community capitals, is the app's organizing philosophy | Founder direction | Feature list with no organizing idea | proposed
- D-021 | 2026-11-15 | "Our Ecosystem" curated section is part of the first wave | Founder direction | Later | proposed
- D-023 | 2026-11-16 | Public-read first: no account needed to read alerts, events, resources, ecosystem, numbers. Accounts only for interactive features | Reach; least-technical residents; Apple expects login only where needed | Everything behind sign-in | proposed
- D-024 | 2026-11-16 | No open feed, comments or direct messages in v1. Structured items only. Contact by accepted request. Two reports hide an item until reviewed. Three or more moderators | No staff to moderate; Apple's user-content rules; profiling risk | Open neighborhood feed | proposed
- D-035 | 2026-11-16 | Deliver in three waves: (1) read-only public content, (2) accounts and neighbor features, (3) invites, Flowers for Neighbors, polls, measures | Volunteer capacity; residents benefit sooner | One large v1 | proposed
- D-028 | 2026-11-16 | The web app built from the same code is an official channel and may launch before the store apps | Fallback for residents without smartphones; pilot without store approval | Stores only | proposed
- D-044 | 2026-11-16 | Add "Critter Club" (working name), a game for getting to know neighborhood pets and wildlife: field guide to collect, sightings, pet pages, mysteries, bingo, shared tally. It is the app's front door and needs no account to play | Founder direction; builds natural, social and human capital; gives every age a reason to open the app | No game | proposed
- D-045 | 2026-11-16 | Kids play with a grown-up on the grown-up's phone. No child accounts and no data about children. Ask an attorney whether kid-friendly content changes the app's duties under children's privacy law and the Texas app store law | Keeps D-008 (18+ accounts) while making the game fun for kids | Child accounts | proposed, needs attorney
- D-046 | 2026-11-16 | Sightings record a kind of place (yard, park, creek...), never an address or map pin. Photos have location data stripped | Protects where people live; consistent with D-014 | Map pins like other spotting games | proposed
- D-047 | 2026-11-16 | Photos shared with neighbors go through a moderator first. Animals only: no people, house numbers or license plates. In the first draft photos stay on the device | Photos are user content (D-024); children may be in frame | Post instantly | proposed
- D-048 | 2026-11-16 | A pet has a page only if its own family creates it. Stories from neighbors go to the family to approve. Stray animals' locations are never shown | Consent; the family moderates its own page; protects strays from harm | Anyone can add any animal | proposed
- D-049 | 2026-11-16 | The game is cooperative. One shared neighborhood total and personal badges. No scoreboard of people or streets | Matches the rule against ranking individuals or streets; kinder for kids | Leaderboards | proposed
- D-050 | 2026-11-16 | Points reward noticing and learning. Nothing rewards touching, feeding, chasing or getting closer. Animals that can hurt carry a warning | Wildlife and child safety | Points for close-up photos | proposed
- D-051 | 2026-11-16 | Every animal gets an original cartoon character drawn by the app from a list of traits. A pet's family builds its character by choosing color, ears and markings. No pet photos are uploaded and no AI image service is used | Founder asked for collectible-style characters based on the animals' pictures. Original designs avoid copying another game's characters; trait-built art needs no image files, no license and no outside service, and keeps family photos on the phone | Send photos to an AI image service (needs board approval, a contract and consent); hand-drawn art (later, via the kids' drawing contest) | proposed
- D-052 | 2026-11-16 | Mysteries become detective cases in the style of the classic geography detective games: case file, witnesses, travel between kinds of place, a 24-hour clock, a notebook that narrows the suspects, name the culprit at the last stop. Cases about pets use invented sample pets only | Founder direction. Teaches animal traits by deduction; no reading-heavy screens | Keep the three-clue quiz | proposed
- D-053 | 2026-11-16 | Sighting analytics show kind of place, time of day and month, plus how an animal's usual place changes through the day. Wildlife only. No street map and no pins. Nothing is claimed below 10 sightings | Founder asked for a map and movement patterns. A map of exact spots shows which yards report, and for pets or strays reveals a family's routine or leads people to an animal (keeps D-046, D-048). A coarse map of a few named areas can be added if the board approves | Pin map; per-street heat map | proposed, founder to confirm
- D-054 | 2026-11-16 | Real wildlife photos load from iNaturalist only when a person taps "Show a real photo". Only photos with a Creative Commons or CC0 license are shown, always with the photographer's credit and license. One request per animal per session | Founder asked for real photos to help identification. Tap-to-load keeps the rule that the app contacts no outside service by default; license filter and credit respect photographers. iNaturalist asks apps to stay under about 60 requests a minute and 10,000 a day (https://www.inaturalist.org/pages/developers) | Bundle photos now (could not download or check licenses from the build environment); hotlink without credit; link only | proposed. Not yet tested against the live site. Attorney or board to confirm non-commercial use
- D-055 | 2026-11-16 | Long-term photo plan: a naturalist-chosen set of permitted photos bundled in the app, plus neighbors' own moderated photos | No outside website contacted; works offline; reviewed for accuracy | Depend on a third-party site forever | proposed
- D-009 | 2026-11-15 | High-risk features deferred: babysitting (later, after legal review), property documents and home energy data (later, private vault design) | Child safety, privacy, liability | Build early | proposed
- D-014 | 2026-11-15 | "Neighborhood by the Numbers": neighborhood-wide statistics only, no street or home level, with margins of error and linked actions | A map invites stigma and fair-housing concerns | Equity map | proposed
- D-018 | 2026-11-15 | Comparison set: Heritage Hills vs Austin vs Texas vs United States | Founder direction | City only | proposed
- D-011 | 2026-11-15 | Curated resources show a source link and "last verified" date | Programs change often | Hard-coded amounts | proposed
- D-031 | 2026-11-16 | Flowers for Neighbors: recipients join only by their own consent. The app never stores a third person's details from a nomination. Details visible only to the program lead. Deliveries in pairs. No "elderly" labels | Privacy and dignity | Nomination lists | proposed
- D-032 | 2026-11-16 | Garden fees are shown as information only. No payments in the app | Founder direction; compliance | In-app payments | accepted by founder
- D-036 | 2026-11-16 | Garden feature starts as a project page (plan, progress, interest, roles, work days). Plot management when plots exist | Permit takes about a year | Plot management now | proposed
- D-030 | 2026-11-16 | English and Spanish at launch. Arabic next. Layouts are right-to-left ready from day one | Garden signage plan already names Arabic | Add later with a rebuild | proposed
- D-022 | 2026-11-15 | The app's visual style is developed as a proposed official neighborhood style | Founder direction | App-only style | proposed
- D-020 | 2026-11-15 | No AI image or video generator needed. Type, color, layout, icons, vector illustration, real photos with permission | Trust; cost | AI imagery | proposed

## Governance
- D-004 | 2026-11-15 | No DAO or token voting. Tamper-evident (hash-chained) decision log, roles tied to offices, two-approver rule | Bylaws and board stay the legal decision-makers; wallets exclude residents | Smart-contract governance | proposed
- D-005 | 2026-11-15 | Polls are non-binding until the bylaws are reviewed | Vote validity depends on bylaws | Binding e-votes now | proposed
- D-037 | 2026-11-16 | Alerts: board and named coordinators only. A neighborhood-wide urgent alert needs a second person to confirm | False alarms, misuse | Any board member alone | proposed

## Ownership and accounts
- D-003 | 2026-11-15 | The association owns all accounts through role emails | Transferable ownership | Personal accounts | proposed
- D-012 | 2026-11-15 | Plan A: association organization accounts on Apple and Google. Plan B: founder's individual accounts, then app transfer. Neutral bundle ID either way | Organization accounts skip Google's tester rule; transfers are supported | Individual forever | proposed
- D-033 | 2026-11-16 | Corrects Phase 0: the association may already be a legal entity under Texas law (unincorporated nonprofit association). Incorporation is recommended, not required. Ask an attorney | Tex. Bus. Orgs. Code ch. 252 | Treat incorporation as a legal precondition | proposed
- D-019 | 2026-11-15 | Code lives in a private repo on the founder's GitHub until an association organization exists, then transfers | Practical | Wait for the association | accepted by founder
- D-038 | 2026-11-16 | Confirm the association's exact legal name and current officers before opening any account in its name | Two names appear in public records | Assume | open question

## Security, privacy, law
- D-008 | 2026-11-15 | App accounts are 18+ only | Children's privacy laws | Teen accounts | proposed
- D-029 | 2026-11-16 | Texas SB 2420 is in force. Add an age-signal check and an attorney review before store submission | Law took effect in 2026 | Ignore | proposed
- D-025 | 2026-11-16 | Sign-in: email address plus a 6-digit code typed into the app. Passkeys later. Text messages deferred | Carrier registration needs an EIN, fees and a website | SMS codes; magic links; passwords | proposed
- D-026 | 2026-11-16 | Verification: household code on a door flyer, then two-neighbor vouching, mailed code on request. House number not kept after verification | Cost; works without a standing admin | Mailed postcards to all | proposed
- D-039 | 2026-11-16 | No analytics software in the app. Server-side totals only | Privacy | Analytics SDK | proposed
- D-013 | 2026-11-15 | Sample data is clearly labeled, lives in a demo mode, and never ships in a store build | Trust; store rules | Unlabeled placeholders | proposed

## Technology
- D-001 | 2026-11-15 | React Native + Expo + TypeScript, one codebase for iOS, Android and web | Reach, cloud builds | Native per platform; Flutter | proposed
- D-034 | 2026-11-16 | Expo SDK 58 (current). Expo Router. Own small i18n module. Lucide icons with react-native-svg | Store Expo Go runs only the newest SDK; few dependencies | Older SDK | accepted
- D-027 | 2026-11-16 | All data access goes through one interface. First draft uses a local sample adapter. Backend (Supabase paid tier vs another service) decided with the funding plan | Supabase's free tier pauses after a week idle; swappable backend avoids lock-in | Commit to Supabase now | proposed. Supersedes D-002
- D-040 | 2026-11-16 | Turn off the experimental React Compiler | It cached values read from the data store, so RSVPs, sign-ups and role changes never appeared on screen. Found by the end-to-end check | Keep it on and restructure every data read | accepted
- D-041 | 2026-11-16 | Three style directions (Warm Community, Clean Civic, Texas Wildflower) live inside the app under Settings, so they can be judged on real screens. Every palette must pass the contrast tests | Faster and more honest than static mockups | Separate design mockups | proposed, awaiting founder's pick
- D-042 | 2026-11-16 | A single-file web preview is published privately after each milestone so the draft can be opened from a link with no setup | Lowest effort way for the founder and board to see progress | Phone-only previews | accepted
- D-043 | 2026-11-16 | Unknown addresses redirect to Home | Old or mistyped links should never show an error page | Error screen | accepted
- D-006 | 2026-11-15 | No social login | Tracking; Apple's Sign in with Apple rule | Google or Facebook login | proposed
- D-015 | 2026-11-15 | Strongest model time goes to red-team, spec, security and architecture first | Limited access | Even spread | done
- D-016 | 2026-11-15 | Reusable review skills saved to the founder's account | Same checks every milestone | Re-explain each time | done

## Retired
- D-002 (Supabase as the committed backend): replaced by D-027.
- D-007 (mailed postcards as the default): replaced by D-026.
- D-010 (equity map): replaced by D-014.
