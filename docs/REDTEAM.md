# Red-team review of Phase 0

Written 2026-11-16 by a fresh reviewer (Claude Fable 5.2). It checks the Phase 0 plan for wrong assumptions, missing risks and things that will not survive contact with real residents. Nothing here is legal advice. "Ask an attorney" marks questions a lawyer should answer.

## Summary: what changes

| # | Finding | Severity | Change |
|---|---|---|---|
| 1 | Most of the app's value needs no account at all | High | Make the app **public-read first**. Accounts only for interactive features. |
| 2 | Open posting needs people to moderate it, and there is no staff | High | **No open feed, comments or chat in v1.** Structured posts only. Reported items hide themselves. |
| 3 | Texas's app-store age law is now in force | High | Add an age-signal check and an attorney question. Phase 0 missed it. |
| 4 | "The association must incorporate first" was too strong | Medium | It may already be a legal entity. Incorporating is still the clean route. |
| 5 | The free database tier pauses when idle | High | Budget for a paid tier or choose a different backend. Keep the backend swappable. |
| 6 | Text-message sign-in is not cheap or simple | Medium | Sign in with an emailed 6-digit code. Text messages wait. |
| 7 | Mailed postcards cost real money for a no-dues group | Medium | Door flyers with household codes, plus neighbor vouching. |
| 8 | Recurring costs have no funding source | High | Write a one-page budget and funding plan before the pilot. |
| 9 | "Flowers for Neighbors" sign-up collects other people's details | High | Recipients join only by their own consent. |
| 10 | Arabic is already a planned garden language | Medium | Build the layout to support right-to-left text from the start. |
| 11 | The planned v1 is too big for a volunteer project | High | Ship in three small waves. |
| 12 | A web version comes almost free and solves three problems | Medium | Treat the web app as an official channel. |
| 13 | Two association names appear in public records | Medium | Confirm the exact name and which body is current. |
| 14 | The community garden cannot open for about a year | Low | The garden feature starts as a project page, not plot management. |

## Findings in detail

### 1. Public-read first
Announcements, alerts, events, the meeting calendar, rebates, the ecosystem guide and neighborhood statistics contain nothing private. Requiring sign-up and address verification before a resident can read them would lose the very people the app is for. Apple also expects apps to work without login when account features are not essential.

**Change:** three levels of access.
- **Visitor** (no account): read everything public, choose a language, turn on alerts.
- **Neighbor** (signed in and verified): RSVP, lend and borrow, volunteer, join the garden list, private invites, polls.
- **Steward roles** (moderator, coordinator, board): post and manage.

### 2. Moderation without staff
Apple requires apps with user content to filter objectionable material, offer a way to report it with timely responses, let users block abusive users, and publish contact details ([App Review Guidelines 1.2](https://developer.apple.com/app-store/review/guidelines/)). "Timely response" is a staffing promise. A free-form feed is also where neighborhood apps turn into arguments and profiling.

**Change:**
- v1 has no open feed, no comments and no direct messages.
- Residents create only structured items: a share listing, a volunteer offer, an RSVP, a poll answer.
- Contact between neighbors happens by a request the owner accepts, which then reveals the contact method the owner chose.
- An item reported by two different neighbors is hidden automatically until a moderator looks at it.
- At least three moderators, and any two can act.

### 3. Texas App Store Accountability Act (SB 2420)
Phase 0 did not mention it. A federal judge blocked the law in December 2025, the Fifth Circuit lifted that block on May 28, 2026, and the Supreme Court declined to step in on July 6, 2026 ([Lexology summary](https://www.lexology.com/library/detail.aspx?g=60cfedda-77a9-4539-b439-a68c4f42b52a)). Apple applied it to new Apple Accounts in Texas from June 4, 2026 ([Apple notice](https://developer.apple.com/news/?id=sg176nne)). The law puts age checks and parental consent on app stores and adds duties for developers, including handling the age information the store passes along.

**Change:** keep the app 18+, add a task to read the stores' age signal and refuse accounts for minors, and ask an attorney what else a small free nonprofit app must do. VERIFY the developer duties against the current Apple and Google guidance before the first store submission.

### 4. Legal entity
Phase 0 said an unincorporated group cannot hold an organization developer account. Texas law treats an unincorporated nonprofit association (three or more members joined for a common nonprofit purpose) as a legal entity separate from its members ([Business Organizations Code ch. 252](https://tcss.legis.texas.gov/resources/BO/htm/BO.252.htm); [UT Law clinic guide](https://law.utexas.edu/wp-content/uploads/sites/11/2019/09/2019-ECDC-Working-with-Grassroots-Groups.pdf)). So the association may already be one.

What is still uncertain: whether Dun and Bradstreet and Apple will accept an unincorporated association without formation papers. Apple's fee waiver also needs "status as a nonprofit organization" ([Apple fee waiver](https://developer.apple.com/help/account/membership/fee-waivers/)); whether that means IRS recognition is unclear. VERIFY.

**Change:** incorporation (Form 202, $25) stays the recommended route because it produces the paperwork every outside party asks for. It is no longer described as legally required. Ask an attorney about liability differences between the two forms.

Related: the City's community garden program requires a sponsoring 501(c)(3) nonprofit with a written agreement and liability insurance, which Austin Parks Foundation can provide for gardens on city land ([City guide](https://www.austintexas.gov/parks-and-recreation/apply-start-community-garden-guide)). The garden's sponsor and the app's owner may end up being different bodies. Decide that on purpose.

### 5. Backend cost and the "no admin" goal
Supabase's free plan pauses a project after one week without activity, and the paid plan starts at $25 a month ([Supabase pricing](https://supabase.com/pricing)). A paused database in a quiet week means the app is down until someone logs in to restore it. That is the opposite of "secure and running without an administrator".

**Change:**
- Production needs a tier that never pauses. Budget about $300 a year, or pick a backend whose free tier does not pause (VERIFY Firebase's current terms before deciding).
- All data access goes through one interface in the code, so the backend can be swapped. The first draft uses a local sample-data adapter behind that interface.
- The backend decision waits for the funding decision.

### 6. Sign-in
Text-message sign-in needs carrier registration (A2P 10DLC): an EIN, a live website with a privacy policy, a one-time fee, a monthly fee and a per-message charge ([registration guide](https://www.messagedesk.com/blog/a2p-10dlc)). That is too much for wave 1.

**Change:** sign in with an email address and a 6-digit code typed into the app. No passwords and no links to tap (links break when the mail app opens a different browser). Passkeys later. Text messages are revisited once the entity and a budget exist. Residents without email can still use everything public, and a neighbor or family member can help them join later.

### 7. Verification
Mailed postcards to every household would likely cost over a thousand dollars in printing and postage, and need a list of addresses. VERIFY the household count and current postage.

**Change, in order of use:**
1. **Household code on a door flyer**, delivered by block captains. One code per address, used once.
2. **Two-neighbor vouching** for anyone who missed the flyer.
3. **Mailed code on request** for people who prefer it.
Verified status is stored as "verified household on this block". The house number is not kept after verification unless the resident chooses to share it.

### 8. Money
Likely recurring costs: Apple membership ($99 a year unless waived), a database tier that never pauses (about $300 a year), a domain (about $15 a year), email sending (free tiers exist), and one-time attorney review. Phase 0 listed costs but no source of funds, and the association collects no dues.

**Change:** before the pilot, the board adopts a one-page budget naming who pays. Options: a line in the association budget, a small sponsor, a grant, or donations collected outside the app.

### 9. Flowers for Neighbors
The garden sign-up sheet has a column for "Elderly neighbor who'd like flowers (name / address)". Writing down a third person's name and address on a shared sheet, linked to their age, exposes them without their knowledge.

**Change:**
- In the app, a neighbor can only say "I know someone who might like flowers". The app stores nothing about that person. It gives the neighbor a printable card to hand over.
- A recipient is added only when they (or a family member acting for them, with their agreement) sign up themselves.
- Recipient details are visible only to the Flowers for Neighbors lead. Deliveries are made in pairs.
- The program is called "Flowers for Neighbors", open to anyone who would enjoy a visit. The app never labels people as elderly.
- Suggested for the paper sheet too: replace that column with "I know a neighbor who might like flowers (we will give you a card for them)".

### 10. Languages
The garden budget already plans signs in English, Spanish and Arabic. Arabic reads right to left.

**Change:** English and Spanish at launch, Arabic next. Layouts use start and end instead of left and right from day one so right-to-left works without a rebuild. Ask the board which other languages matter. Resident-written text is shown as written, with a translate button considered later.

### 11. Scope
Phase 0's v1 had about a dozen features. For one volunteer lead, that is a year of work before anyone benefits.

**Change:** three waves.
- **Wave 1 (read-only, no accounts):** alerts and announcements, events and meetings with virtual links, Our Ecosystem, rebates and resources, garden project page, Neighborhood by the Numbers, association page. English and Spanish. This can go live on the web first.
- **Wave 2 (accounts):** sign-in, verification, RSVP, volunteer sign-up, garden interest list, neighbor share, reports and moderation, board posting tools.
- **Wave 3:** private invites, Flowers for Neighbors scheduling, polls with the tamper-evident log, capital measures.
The first draft built tonight shows all three waves with sample data so the board can react to the whole picture.

### 12. Web version
Expo builds a web app from the same code. That gives a fallback for residents without a smartphone, a way to pilot before the stores approve anything, and a link the board can open in a meeting.

**Change:** the web app is an official channel. Store apps follow.

### 13. Names
The City's community registry lists a "Heritage Hills-Woodbridge Neighborhood Association" with its own website, and a separate site describes a "Heritage Hills Neighborhood Association" that was reactivating in 2026. These may be the same body, a rename, or two groups.

**Change:** confirm the exact legal name, which body is current, and who its officers are before any account is opened in the association's name. The app's internal identifiers stay neutral.

### 14. Garden timing
The City says the garden permit process takes about a year on average and requires at least four leaders from different households, public access at least monthly, and sustainable practices ([City permit steps](https://www.austintexas.gov/page/steps-getting-community-garden-permit)).

**Change:** the garden feature begins as a project page: the plan, progress, interest sign-up, leadership roles, work days and letters of support. Plot management comes when there are plots. Plot fees ($0 to $60 sliding scale or work-trade in the current plan) are shown as information only. The app takes no payments.

## Smaller corrections
- Phase 0 called the DAO bill's status unknown. It stays unverified and does not affect the plan.
- Phase 0 said alerts would use "push, email, SMS fallback". Wave 1 uses push and the in-app list only. Email digests come with accounts.
- Alerts need a sender rule: board and designated coordinators only, with a second person confirming any neighborhood-wide urgent alert.
- App reviewers need a way past resident verification. Provide a reviewer demo mode with sample data.
- Sample data cannot ship in a store build. Apple rejects placeholder content.
- No analytics software in the app. Count activity on the server as totals only.
- Push notification tokens are personal data. List them in the privacy policy.
- Expo Go from the app stores currently runs only the newest Expo version (SDK 58), so the project uses SDK 58 ([Expo upgrade notes](https://expo.dev/blog/how-to-upgrade-to-sdk-58)).

## Questions for an attorney
1. Unincorporated association or nonprofit corporation: liability, contracts, and what app stores accept.
2. SB 2420 duties for a free, 18+, no-purchase nonprofit app.
3. Privacy policy and terms, including push tokens, verification data and deletion.
4. Liability and insurance for tool lending, volunteer visits and garden work, and what a waiver should say.
5. Fair housing and defamation risk in resident posts, and what the moderation policy should promise.
6. Whether Texas privacy law applies to a small nonprofit, and what follows if it does.
7. Bylaws: who is a member, whether electronic votes and meetings are valid, how to amend.

## What was right in Phase 0 and stays
Association ownership of every account, role emails and a transfer runbook. No ads, no data sales. No payments in the app. No crypto wallets for residents; a tamper-evident record instead. High-risk features (babysitting, property documents) deferred. Statistics instead of a map. Clearly labeled sample data.
