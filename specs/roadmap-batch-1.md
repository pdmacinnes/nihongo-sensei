# Roadmap Batch 1 — Anki audio+extra decks, Reader dashboard, grammar linking, listening/speaking, PWA polish

Five features, built and committed in this order: **(1+2) → (3) → (5) → (4) → (6)**. Each gets its own commit; grouped in one spec since they're small and were scoped together in one pass.

---

## 1. Native Anki TTS on exported cards

**Goal:** exported cards read the Japanese aloud in Anki, without us generating/bundling audio files.

**Reality check:** the app's TTS (`src/lib/tts.ts`) is the browser's `SpeechSynthesisUtterance` — it plays live through the speaker, it does not produce a capturable audio blob. Recording it would need `MediaRecorder` against system audio output, which is fragile, permission-gated, and not something to build for this. Anki already solves this: its card templates support `{{tts ja_JP:Japanese}}`, which calls the *user's own OS* Japanese TTS voice at review time — zero audio files, zero new dependencies.

**Change:** add `{{tts ja_JP:Japanese}}` (and optionally `{{tts ja_JP:SentenceJP}}` on the answer side) to the `qfmt`/`afmt` strings in `buildModelJson()` (`src/lib/anki-export.ts`). That's the entire change — no new export UI, no media map changes.

**Edge case:** users without a Japanese OS TTS voice installed just get a silent tts tag (Anki shows a small warning icon, doesn't break the card) — acceptable, matches how Anki behaves everywhere else.

**Acceptance:** re-import the deck into the Anki install already set up on this machine, confirm the card autoplays/offers Japanese audio on the front.

---

## 2. Export Kanji + Grammar decks to Anki

**Goal:** extend the existing Settings "Export to Anki" section with two more buttons, reusing `buildAnkiApkg`'s schema builder generically instead of hardcoding one note type.

**Data selection (the real design question — no existing "kanji/grammar deck" concept to reuse):**
- **Kanji**: `KANJI_DATA` entries that have a `kanjiProgress[kanji]` entry (i.e. anything the user has actually practiced in KanjiStudy), not the full N5–N3 catalog. Fields: Kanji / Meanings / Onyomi / Kunyomi / Example word+reading+meaning.
- **Grammar**: there is **no per-point progress tracking today** (`GrammarStudy.tsx` only logs wrong answers to `wrongAnswerLog`, no "mastered" or "studied" set exists). Reasonable proxy: export `GRAMMAR_DATA` points referenced in `wrongAnswerLog` (`type === 'grammar'`) — i.e. points the user has actually been quizzed on. This under-covers points always answered correctly on the first try, but it's the only real signal available without adding new tracking. Flagging this now; can revisit with a proper "studied grammar points" store field later if it proves too sparse in practice.

**Architecture:** generalize `anki-export.ts` — the model/deck builder currently hardcodes one note type. Refactor to accept a `{ modelId, deckId, deckName, modelName, fieldNames, template, rows }` shape so Vocab/Kanji/Grammar are three callers of the same core, not three copies. Each gets its own fixed `MODEL_ID`/`DECK_ID` constant (three separate decks in Anki, like today's single one).

**Acceptance:**
- Kanji export button produces a deck with only kanji that have `kanjiProgress` entries; empty state handled like vocab's.
- Grammar export button produces a deck from `wrongAnswerLog`-referenced grammar points; empty state handled.
- Both verified via the same real-Anki-import check used for vocab.
- Existing vocab export unchanged in behavior.

---

## 3. Reader immersion dashboard

**Goal:** surface `readerSessions` (already logged, `src/store/index.ts`) as trends instead of just the raw history list Reader currently shows.

**Behavior:** new section (Reader page or a `Progress` page tab — `ProgressPage.tsx` already exists as the natural home) showing:
- Reading volume over time (chars/lines read per day/week, derived from `updatedAt - startedAt` and `charsRead`)
- Words mined per session/source (`newWordsAdded`, grouped by `sourceTitle`)
- Manual vs. Capture-mode split (`source` field)
- Simple streak-style "days read" count, consistent with the existing XP streak treatment elsewhere in the app

**Edge cases:** zero sessions (new user) → empty state, not a broken chart; very short sessions (a few seconds, e.g. accidental open) shouldn't dominate a "time spent" stat — clamp or note but don't over-engineer a filter for this.

**Acceptance:** dashboard renders correctly with 0, 1, and many sessions; numbers cross-checked by hand against a couple of real `readerSessions` entries from the store.

---

## 5. Grammar-pattern linking in Reader

**Goal:** when a captured/pasted sentence in Reader uses a pattern from `GRAMMAR_DATA`, surface a link back to that GrammarStudy entry instead of Reader and Grammar being disconnected.

**Approach:** lightweight substring/heuristic match, not real grammatical parsing — for each `GrammarPoint`, check whether its `pattern` (stripped of `〜` placeholder markers) appears as a substring of the sentence being viewed. This will have false negatives (conjugated/inflected forms won't always match the dictionary-form pattern string) and rare false positives, but is consistent with the app's existing "heuristic, not exhaustive" approach (e.g. local-dictionary's context-dependent flag).

**Behavior:** in Reader's sentence/word popup, show a small "Grammar: 〜は〜です" chip when a match is found, linking to `#/grammar` (ideally scrolled/filtered to that point — check what `GrammarStudy.tsx` already supports for deep-linking before building new state for it).

**Edge cases:** multiple matching patterns in one sentence → show all matches, not just the first; no match → no chip, not an empty placeholder.

**Acceptance:** tested against a handful of real Reader sentences (existing `sentenceJp` values in `vocab-data.ts` work as good test input) with known grammar points, confirms correct matches and no crash on sentences with zero matches.

---

## 4. Listening/speaking practice

**Goal:** round out Vocab review with a listening-recall mode, and add speech input to Conversation — the two skills the app doesn't currently exercise.

**Listening mode (VocabReview.tsx):** a review variant that plays the card's audio (`speak()`) first and asks for recall before showing Japanese text, reusing the existing `SRSCard`/`reviewVocabCard` pipeline — same cards, same scheduling, different presentation order. Toggle, not a replacement for the current mode.

**Speech input (Conversation.tsx):** add a mic button using the Web Speech API's `SpeechRecognition` (`webkitSpeechRecognition` in Chrome/Edge) to transcribe spoken Japanese into the existing message input, instead of typing. No new dependency — same browser-native approach as `tts.ts`.

**Edge cases:** `SpeechRecognition` isn't available in all browsers (notably Firefox) — feature-detect like `isTTSAvailable()` does, hide the mic button rather than erroring; recognition of Japanese requires `lang = 'ja-JP'` on the recognizer, mirroring `tts.ts`'s language handling; permission denial (mic blocked) → clear toast, not a silent failure.

**Acceptance:** listening mode playable end-to-end for a due card without breaking existing SRS state; mic button transcribes a spoken Japanese phrase into the input in a real browser test; both degrade gracefully (hidden/disabled) where the underlying browser API is unavailable.

---

## 6. PWA / mobile install polish

**Goal:** `vite-plugin-pwa` is already configured (`vite.config.ts`) with a manifest and icons (`icon-192.png`, `icon-512.png` already in `public/`) — this is an audit-and-fix pass, not new infrastructure.

**Behavior:** verify actual installability (Chrome's install prompt / Android "Add to Home Screen" / iOS Safari "Add to Home Screen") on a real mobile browser or Chrome's Lighthouse PWA audit; fix whatever's missing (commonly: maskable icon coverage, `apple-touch-icon` for iOS since iOS ignores the manifest icons, viewport meta tuning for standalone mode).

**Edge case:** Reader's heavy dictionaries (~25MB) are already excluded from the precache (`globPatterns` in `vite.config.ts`) and cached on first use via runtime caching — confirm this still holds and doesn't regress; don't precache them.

**Acceptance:** Lighthouse PWA audit passes (or documented list of what doesn't and why); app installs and opens standalone on at least one real mobile browser, confirmed by the user since I can't test iOS/Android install prompts from this machine.

---

## Out of scope for this batch

- Kanjidic-based stroke-order audio, grammar point mastery tracking as a first-class store field (noted as a possible follow-up under #2), full speech-to-text grading/pronunciation scoring (just transcription-to-input for now).
