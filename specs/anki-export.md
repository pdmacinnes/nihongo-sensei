# Anki Export — .apkg export of vocab cards

## Requirements & Goals

Nihongo Sensei's SRS (`src/lib/srs.ts`) is the app's own review engine — vocab cards live and die inside `vocabCards`/`customWords` in the Zustand store, with no path out. Anki is the tool most Japanese learners already have on their phone for on-the-go review, and a lot of the value in a mined word (sentence context, frequency, context note) is wasted if it's stuck in one app.

Goal: let the user export their vocab deck as a real **.apkg** file that Anki can import directly (double-click / File > Import), carrying the Japanese word, reading, English meaning, and example sentence onto the card — no manual field mapping required on the Anki side.

This is **export only**. Nihongo Sensei's own SRS state (`VocabCardState` — interval, ease, due date, lapses) stays the source of truth for review scheduling here; the Anki copy is a snapshot for cross-device/offline review, not a two-way sync. No import path back into the app in this pass.

## Inputs, Outputs & Behavior

**Input:** the user's current vocab deck — `vocabCards: VocabCardState[]` in the store, each resolved against `VOCAB_DATA` (`src/lib/vocab-data.ts`) or `customWords` (`src/store/index.ts`) by `wordId` to get the actual word data (`japanese`, `reading`, `english`, `sentenceJp`, `sentenceEn`, `pos`, `frequency`, `contextNote`).

**Trigger:** new "Export to Anki" button in Settings, next to the existing JSON backup export (`Settings.tsx` ~line 139-165) — same pattern, new handler.

**Output:** a downloaded `nihongo-sensei-<date>.apkg` file — a zip containing:
- `collection.anki2`: SQLite database (built client-side with `sql.js`, new dependency) defining one deck ("Nihongo Sensei") and one note type ("Nihongo Sensei Vocab") with fields Japanese / Reading / English / Sentence (JP) / Sentence (EN), and a simple two-sided card template (front: Japanese + reading furigana-style, back: English + sentence pair).
- `media`: empty JSON map (`{}`) — no audio/images in this pass.

**Behavior:** one card is generated per vocab entry currently in `vocabCards` (i.e. words the user has actually added to their deck — not the full `VOCAB_DATA` catalog). Each Anki note carries all five fields regardless of whether `frequency`/`contextNote` are set. Clicking the button generates and downloads the file synchronously (in-browser, no network call) — consistent with the app's client-only architecture.

## Edge Cases & Error Handling

- **Empty deck** (`vocabCards.length === 0`): disable the button (or toast "Add some words first") rather than exporting an empty, useless .apkg.
- **Word data missing** (a `vocabCards` entry whose `wordId` no longer resolves in `VOCAB_DATA`/`customWords` — shouldn't happen but the JSON-backup code already treats this defensively): skip that card, don't crash the export.
- **Special characters in Japanese text** (quotes, HTML-sensitive characters `<`, `&`): Anki fields are HTML — escape `&`, `<`, `>` when writing field values so a sentence containing those characters doesn't break rendering in Anki.
- **sql.js WASM load failure** (blocked by an ad-blocker, offline first load before caching, etc.): catch and toast a clear error rather than a silent failure; this mirrors the existing kuromoji/dictionary lazy-load error handling pattern.
- **Electron vs web download**: use the same `Blob` + `<a download>` pattern already used for the JSON backup export (`Settings.tsx` line 161-165) so it works identically in both — no Electron-specific file-save code needed.
- **Large decks** (hundreds/thousands of cards): sql.js building an in-memory SQLite DB and zipping it should stay well under a second for realistic deck sizes (low hundreds of words); no pagination/chunking needed for v1.

## Architecture Notes

- New dependency: `sql.js` (WASM SQLite build) to construct `collection.anki2`. Needs the `.wasm` asset served correctly — check whether it needs the same `vite.config.ts` treatment as other bundled binary assets, or ships fine as a normal npm dependency's asset import. A zip step is also needed for the final `.apkg` container — check whether a minimal zip writer is already reachable via an existing dependency before adding a second new package for just that.
- New file: `src/lib/anki-export.ts` — pure function(s) taking resolved vocab cards in, returning a `Blob` out. Keeps the SQLite schema/note-type logic isolated from `Settings.tsx`, which just wires up the button and triggers the download (mirrors how `src/lib/dictionary.ts` and `src/lib/tokenizer.ts` are kept separate from the pages that use them).
- Anki's SQLite schema for `collection.anki2` (cards/notes/decks/models tables, JSON-encoded `col.models`/`col.decks`) is undocumented-but-stable and needs to be gotten right for Anki to accept the file — this is the actual implementation risk in this spec, worth a quick throwaway import test against a real Anki install before considering this done.
- Lazy-load `sql.js` (dynamic import) only when the export button is clicked, not in the main bundle — consistent with how kuromoji/JMdict are already kept out of the initial load.

## Out of Scope for this spec

- Import path (Anki → Nihongo Sensei) — explicitly deferred, may be a future spec.
- Audio on cards (TTS-generated pronunciation) — natural follow-up once export works, not part of this pass.
- Exporting kanji/grammar decks — vocab only for v1; same approach could extend to `KanjiStudy`/`GrammarStudy` later if this proves useful.
- Carrying Nihongo Sensei's own SRS scheduling (interval/ease/due date) into Anki's scheduling fields — the export is a fresh Anki deck (all cards "new" on the Anki side), not a scheduling migration.

## Acceptance Criteria

- [ ] "Export to Anki" button in Settings generates and downloads a `.apkg` file containing one note per current `vocabCards` entry
- [ ] The exported file opens successfully in a real Anki install (File > Import or double-click) with Japanese / Reading / English / Sentence fields populated and mapped correctly — verified against an actual Anki install, not just "the zip looks right"
- [ ] Front/back card template shows Japanese (+ reading) on front, English + sentence pair on back
- [ ] Empty deck is handled gracefully (disabled button or clear toast), not a broken export
- [ ] HTML-sensitive characters in Japanese/English text don't break card rendering in Anki
- [ ] `sql.js` (and any zip dependency) is lazy-loaded on button click, not added to the main app bundle
- [ ] Export works identically in web (`npm run dev`) and Electron (`npm run electron:dev`) builds
- [ ] No changes to existing JSON backup export or any other Settings functionality
