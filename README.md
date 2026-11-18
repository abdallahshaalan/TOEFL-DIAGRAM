# ABOOD TOEFL Companion

Offline-first vocabulary and study companion for TOEFL, Business English, and General English. Built with **Vite + React + JavaScript**. Progress lives in **IndexedDB** on your device (export/import backups; no cloud account required).

## Features

- Three libraries: TOEFL, Business, General
- Spaced repetition review (learning steps, daily new/review caps, undo / bury / suspend)
- Practice modes: flashcards, quiz, cloze, spelling, scenarios, writing
- Draft-quality gates (weak/template definitions hidden from study by default)
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
npm run annotate:business
npm run annotate:toefl
```

Do **not** rely on `npm run dev` in constrained environments; prefer `npm run build` + Vitest for verification.

## Offline / PWA notes

- After the first successful online load, the app shell works offline.
- Large vocabulary chunks are **runtime-cached** (not all precached on first install). Open each library once online so those chunks are available offline.
- Fonts ship via `@fontsource` (self-hosted), not Google Fonts CDN.

## Content quality

- Business and TOEFL entries may be tagged `quality: "ok" | "draft"`.
- Drafts are excluded from Practice / Review unless you enable **Include drafts** in Settings.
- IPA is filled only from verified maps — never invented. Missing pronunciation shows as unavailable.

## Data

- Progress, bookmarks, activity, and settings: IndexedDB (`toefl-companion`)
- Backup: Settings → Export / Import JSON
- Vocabulary IDs are stable — do not wipe banks without a migration plan

## Stack

- Vite 6.x, React 18, React Router, Tailwind, Vitest, Workbox PWA
