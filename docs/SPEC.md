# Product spec: Heritage Hills app

Version 0.1, 2026-11-16. Read with NORTH_STAR.md (why), REDTEAM.md (what changed) and SECURITY.md (how it is protected). Status: proposed, for board review.

## 1. Purpose
Help the people of Heritage Hills care for their place and for each other. The neighborhood is treated as one ecological unit and one community. Every feature builds at least one kind of community capital: natural, social, human, cultural, built, financial or civic.

## 2. Who it is for
Sample people used to test every screen. They are invented.

| Person | Situation | What must work for them |
|---|---|---|
| Rosa, 72 | Lives alone, uses large text, no email, phone from her daughter | Read alerts and events with no sign-up. Text stays readable at the largest size. |
| Marisol, 38 | Spanish first, two kids, low-cost Android, prepaid data | Everything in natural Spanish. Small downloads. Works on a small screen. |
| Dante, 29 | Renter in an apartment, new to the area | Feels welcome as a renter. Finds one way to get involved in under a minute. |
| Amira, 45 | Arabic first, keen gardener | Garden information now. Arabic later without a redesign. |
| Sam | Volunteer garden coordinator | Posts work days, sees who is interested, never handles private data carelessly. |
| Pat | Board secretary | Posts a meeting and minutes in two minutes. Hands the role to a successor in one sitting. |

## 3. Access levels
| Level | How you get it | What you can do |
|---|---|---|
| Visitor | Open the app | Read all public content, choose language and text size, get alerts |
| Neighbor | Sign in with email code, then verify your household | RSVP, share items, volunteer, garden list, invites, polls |
| Coordinator | Named by the board for one program | Manage that program's posts and lists |
| Moderator | Named by the board, at least three | Review reported items |
| Board office | Holds an office (President, Secretary, Treasurer...) | Post announcements, meetings, decisions; send alerts |

Roles belong to offices and programs, not to people. Changing an officer moves the role.

## 4. Navigation
Five tabs, each with an icon and a word. Any core task takes three taps or fewer.

| Tab | Spanish | Holds |
|---|---|---|
| Home | Inicio | Alerts, what is next, shortcuts |
| Events | Eventos | Community events and association meetings |
| Neighbors | Vecinos | Share shelf, volunteering, invites, Flowers for Neighbors |
| Nature | Naturaleza | Our Ecosystem, this month's stewardship tips, garden, wildflower lawns |
| More | Más | Association, resources and rebates, By the Numbers, community capital, settings, safety, about |

Rules for every screen:
- One main idea per screen. One main button.
- Sixth-grade reading level. Buttons are verbs.
- Touch targets at least 48 by 48. Text scales with the phone's setting and the in-app size control.
- Color is never the only signal. Contrast at least 4.5 to 1.
- Layout uses start and end, never left and right, so Arabic can be added.
- Every list has a friendly empty state that says what to do next.
- Sample content carries a visible "Sample" label.

## 5. Features and acceptance criteria

Wave 1 is read-only. Wave 2 adds accounts. Wave 3 adds the sensitive programs. Each item names the capital it builds.

### 5.1 Alerts and announcements (Wave 1; social, civic)
- A visitor sees current alerts at the top of Home without signing in.
- Each alert has a type (urgent, notice, good news), a date, a plain title and a short body in both languages.
- Urgent alerts show the line "For emergencies call 911. For city services call 311."
- Only board offices and named coordinators can post. An urgent neighborhood-wide alert needs a second person to confirm before it sends.
- Alerts expire on a set date and move to an archive.

### 5.2 Events and meetings (Wave 1 read, Wave 2 RSVP; social, cultural, civic)
- Events list in date order with date, time, place, a one-line summary and a category.
- Association meetings show an "Online option" with a join link and a phone number when one exists.
- "Add to my calendar" works without an account.
- A neighbor can RSVP "Going" or "Maybe" and undo it. Counts are shown as totals. Names are shown only if the person opted in.
- Events marked "open to everyone" say so in words.

### 5.3 Our Ecosystem (Wave 1; natural, human)
- Topics: our creek and watershed, native plants, trees and shade, pollinators and wildlife, water, soil and compost, yard practices.
- "This month" shows three to five stewardship actions for the current month.
- Every article shows its source and "last verified" date. Unverified drafts are labeled.
- Each article ends with one thing the reader can do this week.

### 5.4 Community garden (Wave 1 project page, Wave 2 interest list, later plots; natural, social)
- Shows the plan in plain words: location, 12 plots including two wheelchair-height plots, rain-fed water, Flower Commons anyone may pick from, native restoration phases.
- Shows status as steps: interest, sponsor, city permit, build, open.
- A neighbor can join the interest list and tick: want a plot, help build, leadership role, flower deliveries, materials to donate.
- Contact details on the list are visible only to garden coordinators.
- Fees are shown as information ("sliding scale or work-trade"). The app takes no money.
- Work days appear as events.

### 5.5 Resources: rebates, giveaways, how to help (Wave 1; financial, human)
- Each resource card has: what it is, who offers it, who qualifies in one line, a link to the official page, and a "last verified" date.
- No dollar amount is shown without a source and date.
- "How to help your neighbor" lists small concrete actions grouped by time needed.

### 5.6 Neighborhood by the Numbers (Wave 1; all capitals)
- Compares Heritage Hills with Austin, Texas and the United States.
- Neighborhood-wide figures only. No street, block or home level.
- Each figure shows source, year and margin of error, and links to one resource or action.
- Small counts are hidden.

### 5.7 Association (Wave 1 read, Wave 2 tools; civic)
- Shows offices and who holds them (names only, with their consent), meeting schedule, how to join, and documents such as bylaws and minutes.
- A decision record lists each board decision with date, plain summary and outcome. Entries cannot be edited after posting. Corrections are added as new entries.
- Polls are labeled "advisory". Results show totals only.

### 5.8 Neighbor share: tools, books, toys and puzzles (Wave 2; social, financial)
- One shelf with three categories.
- A neighbor lists an item with a name, category, condition and optional photo. No address.
- Another neighbor sends a borrow request. The owner accepts or declines. On accept, each sees the contact method the other chose to share.
- A return reminder goes to the borrower on the agreed day.
- Tool listings show a short safety note and "use at your own risk". Final wording needs attorney review.
- Any item can be reported. Two reports hide it until reviewed.

### 5.9 Volunteering (Wave 2; social, human)
- Opportunities list what, when, how long and who to expect.
- A neighbor signs up or withdraws with one tap. The coordinator sees the list.
- Hours offered are counted toward the neighborhood total only.

### 5.10 Private invites (Wave 3; social, cultural)
- A neighbor creates an invite (for example a playdate or the Yule Crawl) and picks who receives it.
- Only invited people can see it. Nobody can see who was not invited.
- Invitees answer yes, no or maybe.

### 5.11 Flowers for Neighbors (Wave 3; social)
- Anyone can sign themselves up to receive flowers or a visit. A family member may do it with the person's agreement.
- "I know someone" gives a printable card. The app stores nothing about the other person.
- Volunteers pick delivery slots in pairs. Recipient details are visible only to the program lead and the assigned pair on the day.
- A recipient can pause or leave at any time.

### 5.12 Community capital (Wave 3; all capitals)
- Shows neighborhood totals and trends: events held, items lent, volunteer hours offered, garden steps completed, meetings held.
- Never shows or ranks individuals, households or streets.
- Each measure links to a way to help it grow.

### 5.13 Settings, privacy and safety (Wave 1 basics, Wave 2 account)
- Language: English or Spanish, changed in one tap, remembered.
- Text size: normal, large, extra large, on top of the phone's own setting.
- "My privacy" lists every piece of information the app holds about you, who can see each one, and a switch for each. Everything visible to neighbors starts off.
- "Download my information" and "Delete my account" are in the app and work without contacting anyone.
- Safety page: 911, 311, how to report a post, community guidelines in plain words.

## 6. Not in scope
Babysitting marketplace, property documents and home energy data, payments, open discussion feed, comments, direct messages, maps of areas inside the neighborhood, binding votes. Each has a reason in DECISIONS.md.

## 7. Content style
- Short sentences. Common words. Active voice. "You" and "we".
- Spanish is written for Texas readers, with "usted" in instructions, and is never a word-for-word copy.
- Dates and times follow the chosen language.
- Never blame the user in an error. Say what happened and what to do next.
- Names for things: "Neighbors" not "users". "Share shelf" not "marketplace". "Flowers for Neighbors" not "elder outreach".

## 8. First draft (built 2026-11-16)
Shows all three waves with sample data so the board can react to the whole picture. Sign-in and verification are simulated. Nothing is sent anywhere. See README.md for how to open it.

## 9. Open questions
1. Exact association name, officers and bylaws.
2. Which languages after Spanish and Arabic.
3. Who the three moderators and the program coordinators will be.
4. Who pays the recurring costs.
5. The visual style (three directions will be shown).
6. Whether renters and owners have the same standing in association polls (a bylaws question).
