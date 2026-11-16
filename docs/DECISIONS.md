# DECISIONS LOG

Format: ID | date | decision | why | alternatives | status. "Proposed" means the board has not yet accepted it.

## Product and philosophy
- D-017 | 2026-11-15 | Stewardship of the neighborhood as an ecological unit, plus the seven community capitals, is the app's organizing philosophy | Founder direction | Feature list with no organizing idea | proposed
- D-021 | 2026-11-15 | "Our Ecosystem" curated section is part of the first wave | Founder direction | Later | proposed
- D-023 | 2026-11-16 | Public-read first: no account needed to read alerts, events, resources, ecosystem, numbers. Accounts only for interactive features | Reach; least-technical residents; Apple expects login only where needed | Everything behind sign-in | proposed
- D-024 | 2026-11-16 | No open feed, comments or direct messages in v1. Structured items only. Contact by accepted request. Two reports hide an item until reviewed. Three or more moderators | No staff to moderate; Apple's user-content rules; profiling risk | Open neighborhood feed | proposed
- D-035 | 2026-11-16 | Deliver in three waves: (1) read-only public content, (2) accounts and neighbor features, (3) invites, Flowers for Neighbors, polls, measures | Volunteer capacity; residents benefit sooner | One large v1 | proposed
- D-028 | 2026-11-16 | The web app built from the same code is an official channel and may launch before the store apps | Fallback for residents without smartphones; pilot without store approval | Stores only | proposed
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
- D-006 | 2026-11-15 | No social login | Tracking; Apple's Sign in with Apple rule | Google or Facebook login | proposed
- D-015 | 2026-11-15 | Strongest model time goes to red-team, spec, security and architecture first | Limited access | Even spread | done
- D-016 | 2026-11-15 | Reusable review skills saved to the founder's account | Same checks every milestone | Re-explain each time | done

## Retired
- D-002 (Supabase as the committed backend): replaced by D-027.
- D-007 (mailed postcards as the default): replaced by D-026.
- D-010 (equity map): replaced by D-014.
