# VN/Immersion Reader — "Migaku-style" text capture, translation, and SRS pipeline

## Requirements & Goals

An all-in-one immersion reading tool inside Nihongo Sensei that:
1. Captures Japanese text from visual novels as you play
2. Displays it with furigana, tokenized word breakdown, and translation (Migaku-style)
3. Shows reading stats (chars read, unique words, new words, reading speed, session time)
4. Lets you save any word straight into the existing SRS vocab deck with one click
5. Helps you find VN/LN/manga at an appropriate difficulty via jpdb.io

## The one big architectural call — read this first

**We are not building a VN text scraper from scratch.** Extracting text from arbitrary Windows game engines (hooking DirectX/GDI text draws) is what **[Textractor](https://github.com/Artikash/Textractor)** already does — it's the free, open-source, actively-maintained standard tool the entire Japanese-immersion community uses (this is the same engine Migaku, ChiiTrans, and every VN-reading workflow is built on). Reimplementing that is months of native Windows hooking work and is a different project entirely.

**Nihongo Sensei's job is to be the best *destination* for that text, not the extractor.** Concretely:

- You run Textractor (separate, existing, free tool) alongside your VN as you already would
- Textractor has a built-in **Clipboard extension** — when enabled, every extracted line gets copied to the OS clipboard automatically
- Nihongo Sensei (Electron build only — needs OS clipboard access, which a browser tab can't do continuously) polls the clipboard for new text while "Capture Mode" is on, and pulls each new line into the Reader

This is a couple hundred lines of integration code instead of a native hooking engine, and it works with every VN Textractor already supports (hundreds of engines/games) on day one.

## Phases

Building this in three phases so you get value fast and the riskiest/most-external-dependent part (jpdb) doesn't block everything else.

### Phase 1 — Reader core (manual text in, works today, no external tool needed)
- New page: **Reader** (`/reader`), added to nav
- A text box where you paste/type any Japanese text (works standalone — also the fallback for the web/Vercel build, which can't do clipboard capture)
- Text is tokenized client-side and rendered word-by-word with furigana
- Click any word → popup with reading, dictionary form, part of speech, English gloss
- "Translate line" button → full-sentence English translation
- "+ Add to deck" button on the word popup → saves it as a `CustomVocabWord` into your existing SRS system (reuses `addCustomWord`, exact same pipeline as every other card in the app — shows up in Vocab Review, Dashboard stats, everything, for free)
- Session stats panel: characters read, unique words seen, new words added, session duration, reading speed (chars/min)

### Phase 2 — Textractor clipboard capture (Electron only)
- "Capture Mode" toggle in the Reader
- When on, Electron's main process polls `clipboard.readText()` (~500ms) and pushes new, changed text to the renderer via a preload-exposed bridge (`window.electronAPI.onCaptureText`)
- New lines auto-append to the Reader feed (same tokenize/translate/save pipeline as Phase 1 — no duplicate logic)
- Setup instructions panel in-app: "Install Textractor → enable Clipboard extension → hook your VN → turn on Capture Mode here"
- Capture Mode UI element is hidden entirely in the web build (feature-detects `window.electronAPI`)

### Phase 3 — jpdb.io integration (VN/LN/manga difficulty browser)
- A "Find something to read" panel: search by title, see jpdb's difficulty rating so you can pick something at your actual level instead of diving into something too hard
- **Open question before I build this (see below) — jpdb doesn't have a documented public API for third-party apps as far as I know from training data, which may be stale.** Need to check their current terms/API situation before scraping or calling anything. Proposed safe default for v1 regardless of what we find: a search box that deep-links out to `jpdb.io`'s search/list pages in the user's browser — zero scraping, zero ToS risk, still solves "help me find VN/LN/manga at my level." If jpdb turns out to have a real sanctioned API/extension mechanism, Phase 3b can pull ratings inline.

## Data Model Changes

New fields/types in `src/store/index.ts`:
```ts
interface ReaderSession {
  id: string
  startedAt: number
  source: 'manual' | 'capture'
  sourceTitle?: string       // optional, user-labeled (e.g. VN name)
  linesRead: number
  charsRead: number
  uniqueWordIds: string[]
  newWordsAdded: number
}
```
Stored as `readerSessions: ReaderSession[]` in the existing persisted store (same `persist` config, no new storage mechanism). Aggregate stats (lifetime chars read, etc.) are derived from this array, not separately stored.

No changes needed to `CustomVocabWord` — VN-sourced words save through the exact same shape, with `sentenceJp` populated from the captured line and `category: 'vn-reader'` (or the VN title if provided) so they're distinguishable in the deck later if you want to filter by source.

## Tokenization & Translation — technical approach

- **Tokenizer: [kuromoji.js](https://github.com/takuyaa/kuromoji.js)** — pure JS morphological analyzer, runs fully client-side (no network call needed just to segment words), ships a ~15MB dictionary loaded once and cached. This is what gives word boundaries, readings, and part-of-speech — needed before you can even click on individual words in unsegmented Japanese text. Chosen over MeCab because MeCab needs a native binary (extra Electron packaging complexity for zero benefit here) and over calling Claude for every tokenization (slower, costs tokens, needs network — bad fit for something that should feel instant as you click through words).
- **Translation: reuse the existing Anthropic client pattern** from `Conversation.tsx` (`new Anthropic({ apiKey, dangerouslyAllowBrowser: true })`) for line-level English translation and for the per-word gloss when kuromoji's dictionary entry isn't enough context (e.g. slang, VN-specific phrasing). Same API key already in Settings — no new key/config needed.

## Edge Cases & Error Handling

- No API key set → translation button disabled with the same "no key" messaging pattern Settings/Conversation already use; tokenization/furigana/word-save still work with no key since those are local-only
- Clipboard capture picks up non-Japanese text (e.g. you copied something else while Capture Mode is on) → filter: only accept clipboard changes containing Japanese characters (kana/kanji regex check) before pushing to the feed
- Same line captured twice in a row (common with Textractor on repeated/looping text) → dedupe against the immediately-previous captured line
- Word already exists in the deck → `addCustomWord`/`addVocabCard` already no-ops on duplicate `wordId` (existing behavior in the store), so re-clicking "+ Add" on a word you already have is harmless
- kuromoji dictionary fails to load (offline first run, etc.) → fall back to ungrouped character display with an inline error toast rather than a blank page
- Very long pasted text (someone dumps a whole chapter) → cap initial tokenization to a reasonable chunk (e.g. first 2000 characters) with a "load more" action, so the UI doesn't lock up tokenizing a novel in one pass

## Acceptance Criteria

**Phase 1**
- [ ] `/reader` page reachable from nav
- [ ] Pasted Japanese text renders tokenized with furigana
- [ ] Clicking a word shows reading/POS/gloss popup with a working "+ Add to deck" button
- [ ] Added words appear in Vocab Review same as any other card
- [ ] "Translate line" produces an English translation via the existing Anthropic integration
- [ ] Session stats panel updates live as you read

**Phase 2**
- [ ] Capture Mode toggle only appears in the Electron build
- [ ] New clipboard text (while Textractor's clipboard extension is active) appears in the Reader feed within ~1s, deduped against repeats
- [ ] Non-Japanese clipboard content is ignored
- [ ] Web/Vercel build is completely unaffected (no clipboard polling, no capture UI)

**Phase 3**
- [ ] jpdb search/browse panel, difficulty rating visible per title
- [ ] No scraping/API calls to jpdb until their API/ToS situation is confirmed; v1 ships as safe deep-links regardless

## Open Questions (need your input before or during the work)

1. **jpdb.io API/ToS** — I don't have confirmed current info on whether jpdb offers a sanctioned API or extension hooks for third-party tools. I'll research this as part of Phase 3, but flagging now: if there's no clean sanctioned path, I'll ship the safe deep-link version and stop there rather than scrape their site. Fine to proceed on that basis?
2. **Do you already have Textractor installed and know how to hook a VN with it?** If not, Phase 2's acceptance criteria assumes it's set up correctly outside our app — I'm not planning to auto-install or manage Textractor itself, just consume its clipboard output. Confirm that split of responsibility is what you want.
3. **Scope for one sitting** — Phase 1 alone is a substantial page (tokenizer integration + word popup + translation + stats + SRS hookup). I'd plan to build Phase 1 fully, then Phase 2, then pause before Phase 3 (research-dependent) rather than trying to do all three blind. OK to proceed that way?
