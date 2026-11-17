# Security, privacy and data design

Version 0.1, 2026-11-16. Status: proposed. This is a defensive design document. Nothing here is legal advice.

## 1. Goals
1. A resident's private information is never visible to anyone they did not choose.
2. The app keeps running safely when no one is actively administering it.
3. No single person can quietly change records, grant themselves power or walk away with the keys.
4. Leadership can change hands in one sitting.
5. If something goes wrong, the damage is small and visible.

## 2. What we protect
| Asset | Why it matters |
|---|---|
| Identity and contact details (email, optional phone, name) | Harassment, scams |
| Household verification (block, verified status) | Proves residency; links a person to a place |
| Program lists (garden interest, Flowers for Neighbors recipients, volunteers) | Reveals who is home, who lives alone, who is away |
| Private invites | Reveals relationships and who was left out |
| Consent choices | The record of what each person agreed to |
| Decision record and poll results | Trust in the association |
| Admin access (roles, alerts, exports) | Everything else depends on it |

## 3. Who might cause harm
| Actor | What they want | Likelihood |
|---|---|---|
| Outsider posing as a resident | Scam neighbors, case homes, harvest contacts | Medium |
| A resident in conflict with another | Find, harass or expose a neighbor | Medium |
| Someone with a personal safety threat against a resident (for example an abusive ex-partner) | Locate that person | Low, severe |
| A careless or departing volunteer admin | Leaves with access, or leaks a list by accident | High |
| A compromised board account | Send false alerts, export data | Medium |
| Automated bots | Spam, fake sign-ups | Medium |
| A service provider outage or shutdown | Not malicious, but breaks the app | Medium |

## 4. Threats and how the design answers them

| # | Threat | Design answer |
|---|---|---|
| T1 | Fake resident accounts | Household code or two-neighbor vouching before any neighbor feature. Codes are single use and expire. Vouchers are rate-limited and recorded. |
| T2 | Finding where a person lives | No directory in v1. Profiles show first name and block at most, both off by default. House numbers are not stored after verification. No location tracking. |
| T3 | Learning who lives alone or is away | Flowers for Neighbors and RSVP name lists are restricted to the program lead. Public views show totals only. |
| T4 | Harassment through messages | No direct messages. Contact is revealed only after the owner accepts a request, and only the method they chose. Blocking hides both people from each other. |
| T5 | Profiling and hostile posts | No open feed. Structured items only. Two reports hide an item. Guidelines forbid describing people by appearance or guessing at intent. |
| T6 | False urgent alerts | Only offices and named coordinators can draft. A second person must confirm a neighborhood-wide urgent alert. Every alert is in the audit log. |
| T7 | Board account takeover | Two-step sign-in required for any role. Sensitive actions need two approvers. Sessions for roles are short. New-device sign-ins notify the other key holders. |
| T8 | One admin changes records quietly | Database rules, not app code, decide who can read and write. The audit log is append-only and hash-chained. Role changes, exports and bulk deletes need a second approver. |
| T9 | A volunteer leaves with the keys | Accounts belong to role emails. Each service has at least two owners. Recovery codes are sealed with the secretary. The transfer runbook lists every credential and is rehearsed yearly. |
| T10 | Bulk export of resident data | No export of personal data exists except "my own information". Program lists can be viewed but exporting needs two approvers and is logged. |
| T11 | Lost or stolen phone | Short-lived sessions for roles. "Sign out everywhere" in settings. Nothing sensitive cached on the device for neighbors beyond their own data. |
| T12 | Leaked secrets in code | No secrets in the repository. Only public keys ship in the app. Secret scanning on the repository. Access rules assume the public key is known to everyone. |
| T13 | Supply-chain problems in dependencies | Few dependencies, pinned versions, automated update alerts, lockfile committed, builds from tagged commits. |
| T14 | Provider outage or shutdown | Data access sits behind one interface. Nightly encrypted backups to a second location. A restore is tested twice a year. Public content is cached in the app for offline reading. |
| T15 | Scraping public content | Public content holds no personal data by design. |
| T16 | Minors creating accounts | 18+ statement at sign-up, store age signal checked where available, no features aimed at children. |
| T17 | Sample or test data mistaken for real | Sample mode shows a banner on every screen and is excluded from store builds. |
| T18 | Spam sign-ups | Email code sign-in with rate limits per address and per device. No neighbor features until verified. |

## 5. Data model
Names are indicative. "RLS" means a row-level security rule enforced by the database.

### Public content (anyone can read; only roles can write)
| Table | Key fields | Write access |
|---|---|---|
| `alerts` | type, title, body (per language), starts, expires, confirmed_by | Offices and coordinators; urgent needs second confirmer |
| `events` | title, summary, starts, ends, place, category, online_link, open_to_all | Offices and coordinators |
| `articles` | section, title, body, source_url, verified_on, status | Content editors |
| `resources` | title, provider, who_qualifies, url, verified_on | Content editors |
| `stats` | measure, place, value, margin, year, source_url | Content editors |
| `decisions` | date, summary, outcome, prev_hash, hash | Board offices; append-only |
| `offices` | title, holder_display_name (with consent) | Two approvers |

### Personal data (RLS: owner only, unless stated)
| Table | Key fields | Who else can read |
|---|---|---|
| `profiles` | user_id, first_name, language, text_size | Nobody. A separate public view exposes only fields the owner switched on. |
| `households` | id, block_label, verified_at, method | Nobody. Members see only their own. |
| `household_members` | household_id, user_id | Own row only |
| `verification_codes` | code_hash, block_label, used_at, expires_at | Nobody (server functions only) |
| `vouches` | voucher_id, new_user_id, created_at | Moderators, for abuse review |
| `consents` | user_id, field, audience, granted_at, revoked_at | Owner only. Append-only. |
| `rsvps` | event_id, user_id, answer, show_name | Event coordinator sees names only where show_name is true; everyone sees totals through a counting function |
| `share_items` | owner_id, category, title, condition, status | All verified neighbors (owner shown as first name only if consented, else "A neighbor") |
| `share_requests` | item_id, requester_id, status, contact_shared | Owner and requester only |
| `volunteer_signups` | opportunity_id, user_id | Opportunity coordinator |
| `garden_interest` | user_id, wants_plot, help_build, role_interest, deliver_flowers, materials_note | Garden coordinators |
| `flower_recipients` | user_id, preferences, paused | Flowers lead only; assigned pair on delivery day through a time-limited view |
| `invites`, `invite_recipients` | host_id, details; invite_id, user_id, answer | Host and that recipient only. No one can list non-recipients. |
| `reports` | item_type, item_id, reporter_id, reason | Moderators. Reporter identity hidden from the reported person. |
| `blocks` | blocker_id, blocked_id | Owner only |
| `push_tokens` | user_id or device_id, token, topics | Server only |

### Control tables
| Table | Purpose |
|---|---|
| `role_grants` | office_or_program, user_id, granted_by, approved_by, starts, ends. Needs two different approvers. |
| `pending_actions` | A sensitive action waiting for a second approver. Expires after 72 hours. |
| `audit_log` | actor_role, action, target, at, prev_hash, hash. Append-only. No updates or deletes for anyone, including the service owner in normal operation. |

### Example rules (illustrative, to be tested before use)
```sql
-- Anyone may read public alerts that are current.
create policy alerts_read on alerts for select
  using (starts <= now() and expires > now());

-- A person reads only their own profile.
create policy profiles_own on profiles for select
  using (user_id = auth.uid());

-- Share requests: only the two people involved.
create policy share_requests_parties on share_requests for select
  using (requester_id = auth.uid()
         or exists (select 1 from share_items i
                    where i.id = item_id and i.owner_id = auth.uid()));

-- Flower recipients: only the program lead.
create policy flowers_lead on flower_recipients for select
  using (user_id = auth.uid() or has_role('flowers_lead'));

-- Audit log: insert only, through a server function. No update or delete policies exist.
```
Every table gets a test that signs in as another resident and confirms the data cannot be read.

## 6. Consent ledger
- Each shareable field (first name, block, contact method, RSVP name) has an audience: nobody, program coordinator, verified neighbors.
- Default is nobody.
- Each change adds a row to `consents`. Rows are never edited, so the history is the proof.
- "My privacy" reads this ledger and shows it in plain words: "Your first name is visible to verified neighbors since March 3."
- Turning a switch off takes effect immediately everywhere, because public views read the ledger.

## 7. Tamper-evident record (the DAO goals without a blockchain)
- Each entry in `decisions` and `audit_log` stores a fingerprint (SHA-256) of its own content plus the previous entry's fingerprint.
- Changing or removing any past entry breaks every fingerprint after it, and anyone can check the chain in the app ("Verify record").
- Once a week the latest fingerprint is published somewhere the association does not control alone (for example the public website and an email to all key holders). This makes silent rewrites detectable even by the database owner.
- The implementation is in `src/lib/audit.ts` with tests.

## 8. Two-approver rule
Sensitive actions create a `pending_action`. A second, different person holding an eligible role must approve within 72 hours.
Covered actions: granting or removing a role, changing an office holder, sending a neighborhood-wide urgent alert, exporting any list, bulk deletion, changing verification settings, starting an ownership transfer.
If only one eligible person exists, the action is blocked and the app says so. This is deliberate: it forces the board to keep at least two key holders.

## 9. Changing leadership
1. Outgoing and incoming officers open "Change of officers" together.
2. The incoming officer signs in and sets up two-step sign-in.
3. A second officer approves.
4. The role moves. The outgoing officer's role sessions end at once.
5. The runbook checklist walks through the outside accounts (store accounts, domain, repository, backend) and the sealed recovery envelope.
6. The whole change is one entry in the audit log.

## 10. Privacy rules for the build
- Collect only what a feature needs. No birth dates, no government IDs, no payment data, no photos of people required.
- No third-party analytics, ads or trackers.
- Personal data is deleted on account deletion, except audit entries, which keep the role and action but not the person's name.
- Retention: verification codes 30 days; reports one year after closing; RSVPs 90 days after the event; logs two years.
- Real resident data never enters prompts, samples, screenshots or the repository.

### Outside services the app contacts
By default: none. One exception, and only when the person asks: tapping "Show a real photo" on an animal page makes the phone request one photo from iNaturalist (`api.inaturalist.org` for the lookup, its photo storage for the image). That site sees what any website sees (network address, device type) and which species was asked for. It receives nothing about the person, their account or their sightings. The button says so before it is tapped. The app shows a photo only from an expected https address and only with a sharing license and a credit (D-054). List this in the privacy policy.

## 11. Before any real data is collected
- [ ] Attorney review of privacy policy, terms and guidelines
- [ ] Access-rule tests pass for every table
- [ ] Two-step sign-in works for roles
- [ ] Backups run and one restore has been tested
- [ ] At least two key holders and three moderators named
- [ ] Transfer runbook filled in
- [ ] Age and store-policy checks done (see `hh-store-release-checklist`)
