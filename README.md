# ABOOD TOEFL Companion

Offline-first vocabulary and study companion for TOEFL, Business English, Everyday English (CEFR), and General English. Built with **Vite 6 + React + JavaScript**. Progress lives in **IndexedDB** on your device (export/import backups; no cloud account required).

## Features

- Four libraries: **TOEFL**, **Business**, **Everyday English** (CEFR A1–B1 themes), **General**
- Spaced repetition review (learning steps, daily new/review caps, undo / bury / suspend)
- Practice modes: flashcards, quiz, cloze, spelling, scenarios, writing
- Draft-quality gates (weak/template definitions hidden from study by default)
- Study tools (Guide, Study Plan, Topics, Affixes, Academic Topics) reskinned to match the vocab library UI, with bilingual EN/AR chrome
- PWA install + offline shell; EN / AR UI

## Scripts

```bash
npm install
npm run build      # production build → dist/
npm test           # Vitest (jsdom + fake-indexeddb)
npm run lint
npm run preview    # preview production build
npm run verify:business
npm run verify:toefl
npm run verify:everyday
npm run annotate:business
npm run annotate:toefl
npm run annotate:everyday
```

Do **not** rely on `npm run dev` in constrained environments; prefer `npm run build` + Vitest for verification.

## Offline / PWA notes

- After the first successful online load, the app shell works offline.
- Large vocabulary chunks are **runtime-cached** (not all precached on first install). **Open each library once online** (TOEFL, Business, Everyday, General) so those chunks are available offline.
- Fonts ship via `@fontsource` (self-hosted), not Google Fonts CDN.

## Everyday English

- Route: `/vocab/everyday`
- Original CEFR-style study entries (travel, food, work, health, home, news, relationships, shopping, nature, study)
- **Not affiliated with Duolingo.** No scraped Duo or third-party dictionary verbatim paste.
- IPA is left `null` until a verified map exists — never invented.

## Content quality

- Business, TOEFL, and Everyday entries may be tagged `quality: "ok" | "draft"`.
- Drafts are excluded from Practice / Review unless you enable **Include drafts** in Settings.
- Exam packs use study-ok words only.
- IPA is filled only from verified maps — never invented. Missing pronunciation shows as unavailable.

## Data

- Progress, bookmarks, activity, and settings: IndexedDB (`toefl-companion`)
- Backup: Settings → Export / Import JSON
- Vocabulary IDs are stable — do not wipe banks without a migration plan
- Tool favorites / plan keys preserved: `lovedVocabs2`, `lovedAffixes_v2`, `toeflPlan_v3`

## Stack

- Vite 6.x, React 18, React Router, Tailwind, Vitest, Workbox PWA
