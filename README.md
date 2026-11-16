# Heritage Hills neighborhood app

A phone app (iPhone, Android and web from one codebase) for the Heritage Hills neighborhood in Austin, Texas. It helps neighbors care for their place and for each other.

**Status: first draft.** Everything runs on sample data on the device. Nothing is sent anywhere. Sign-in is simulated.

## See it on your phone or computer

You need [Node.js](https://nodejs.org) 20 or newer.

```bash
npm install
npx expo start
```

- **Phone:** install the free **Expo Go** app, then scan the QR code shown in the terminal. Your phone and computer must be on the same Wi-Fi. Expo Go must support Expo SDK 58. If the store version is older, the Expo terminal explains how to get a matching one.
- **Web browser:** press `w` in the terminal, or run `npx expo start --web`.

In the app, open **More** and use "See the app as…" to switch between Visitor, Neighbor and Board.

## Checks

```bash
npm run check        # type-check, lint and unit tests
```

End-to-end check of the main journeys on the web build (needs Python Playwright and Chrome):

```bash
EXPO_NO_BUNDLE_SPLITTING=1 npx expo export --platform web --output-dir /tmp/hh-web
python3 scripts/serve_web.py /tmp/hh-web 8791 &
python3 scripts/e2e_web.py http://127.0.0.1:8791
```

## Where things are

| Path | What it holds |
|---|---|
| `src/app/` | Screens. Each file is a page (Expo Router). `(tabs)/` holds the five main tabs. |
| `src/components/` | Shared building blocks: buttons, cards, rows. They enforce touch size, labels and text scaling. |
| `src/lib/i18n/` | Interface text in English (`en.ts`) and Spanish (`es.ts`). |
| `src/lib/data/` | The single doorway to data (`repository.ts`), the sample adapter (`sample.ts`) and first-draft content (`content.ts`). |
| `src/lib/audit.ts` | Tamper-evident decision record (hash chain). |
| `src/lib/rules.ts` | Safety rules: two reports hide an item, two-approver rule, consent ledger, small-count hiding. |
| `src/lib/theme.ts` | Neutral placeholder colors and sizes. The real style will replace these. |
| `tests/` | Unit tests for the record, the rules and the content. |
| `docs/` | Product spec, security design, red-team review and decisions log. |

## Rules for anyone working on this

1. **No real resident data** in code, samples, screenshots or prompts. Use invented data and label it `sample: true`.
2. **Sample data never ships** in a store build.
3. **Every interface string** goes in both `en.ts` and `es.ts`. The tests fail if they differ.
4. **Content with facts** needs a source link and a "last checked" date.
5. **Screens only talk to `Repository`.** A real backend later replaces `SampleRepository` without changing screens.
6. Use `start`/`end` in layouts, never `left`/`right`, so right-to-left languages work.
7. Read `AGENTS.md` before touching Expo APIs. They change every release.

## Decisions and plans

See `docs/DECISIONS.md`, `docs/SPEC.md`, `docs/SECURITY.md` and `docs/REDTEAM.md`. The same documents live in the Claude Project "Heritage Hills App", along with `STATUS.md`.

## Ownership

This code is held in a personal repository until the neighborhood association has its own GitHub organization. It is meant to belong to the association.
