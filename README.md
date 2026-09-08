# Leela — Stories of Krishna

A responsive Next.js experience with little Krishna stories and simplified Bhagavad Gita wisdom in clear, welcoming English.

## Features

- Two hundred interactive Krishna stories with gentle life lessons
- Ask Leela chat guide with story and Gita-based responses
- Simplified Bhagavad Gita reflections organized by theme
- Read-aloud support through the browser's speech engine
- A kid-friendly story corner and quiz
- Saved reflections and responsive mobile navigation

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify before publishing

```bash
npm run check
```

This runs linting, TypeScript validation, and a production build.

## Notes

Adult accounts and saved journeys use Supabase Auth and Postgres. Complete
[Supabase setup](docs/SUPABASE_SETUP.md) before enabling real signups.
Without configuration, public stories and the demo still work; account operations
fail clearly rather than writing temporary files.

The Gita text is presented as approachable educational paraphrase, not literal Sanskrit translation. Leela should keep this distinction visible anywhere Gita content is surfaced.

## Verse of the Day

- The 700-entry editorial library lives in `app/data/bhagavadGita.ts`. Wording,
  repeated reflections, ordering, and chapter numbering are preserved from
  `Leela_Bhagavad_Gita_Daily_Wisdom.docx`; introductory examples are excluded.
- These are thematic **Gita-inspired reflections**, not literal translations of
  the numbered verses. Sanskrit and sourced translations have separate optional
  fields, alongside transliteration, audio, explanation, and themes.
- `app/lib/getDailyVerse.ts` selects by the visitor's **local calendar day** modulo
  700. The date does not use localStorage, randomness, or elapsed 24-hour periods.
- `app/lib/useDailyVerse.ts` uses a hydration-safe placeholder, updates at local
  midnight, and rechecks on focus/visibility and clock changes.
- `app/components/VerseOfTheDay.tsx` is shared by the home page and
  `/verse-of-the-day`. Existing journey storage saves stable entry IDs; saved
  reflections reopen independently of the daily rotation.
- Run `npm run test:daily` for dataset, timezone, DST, leap-day, and rotation tests.
  Run `npm run check` for lint, TypeScript, and the production build.

## Artwork

The interface uses human-made historical paintings and devotional prints. See [ARTWORK_CREDITS.md](ARTWORK_CREDITS.md) for sources and licenses.
