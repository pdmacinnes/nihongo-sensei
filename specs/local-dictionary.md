# Local Dictionary Integration — offline word lookup for Reader

## Requirements & Goals

Right now, Reader's word popup (gloss, frequency, context-dependent flag) is almost entirely AI-gated: it checks the curated `VOCAB_DATA` (~1,450 words) first, then falls back to an Anthropic API call for everything else — which in practice is most real vocabulary encountered in a VN. Someone without an API key gets tokenization/furigana but not real definitions for the vast majority of words.

Goal: bundle an open, offline Japanese dictionary + frequency data so **word lookups work fully offline, for free, instantly**, for the vast majority of vocabulary — with AI kept only as a fallback for what the dictionary doesn't cover, and as an optional enhancement for context-nuance explanations.

This directly serves "people on their local machine who don't want to use the AI chat feature should be able to use the app to its maximum potential" — after this, that's true for word lookup specifically, not just tokenization/furigana.

## What "integrating Yomitan" actually means here

Yomitan itself is a browser extension that scans arbitrary web pages — it's not an embeddable library, so we can't pull it into the app directly. What makes it useful is the **open dictionary data it loads** (JMdict, frequency lists, pitch accent data). We bundle that same data ourselves and build our own (much simpler) lookup against it.

## Data Sources (researched, not assumed)

1. **[jmdict-simplified](https://github.com/scriptin/jmdict-simplified)** — JMdict converted to clean JSON, actively maintained (weekly releases), English-language variant available, plus a **"common-only" filtered version** (smaller, biased toward everyday vocabulary — good fit since VN slang/proper nouns that aren't in JMdict at all will hit the AI fallback regardless). Also includes Kanjidic (kanji dictionary) as a bonus we're not using yet but could later feed into KanjiStudy.
   - **License:** EDRDG License (JMdict/JMnedict) — permits redistribution with attribution. Kanjidic is CC-BY-SA 4.0. Both compatible with a public app; requires a visible credit, not a blocker.
2. **Frequency data** — a BCCWJ-based frequency list (Balanced Corpus of Contemporary Written Japanese, National Institute for Japanese Language and Linguistics), commonly distributed in the Yomitan dictionary ecosystem with clear attribution to NINJAL.
   - **Open question:** the version I found is packaged in Yomitan's own dictionary zip format, not raw JSON — need to either find NINJAL's raw published list directly, or write a small one-time conversion script from a Yomitan-format frequency dictionary. This is an implementation detail to resolve during the build, not a blocker to starting.

## Architecture

**Lookup priority when a word is clicked** (replaces today's local-VOCAB_DATA → AI-or-nothing flow):
1. `VOCAB_DATA` / `customWords` (existing curated data — already hand-tuned, checked first as today)
2. **Bundled JMdict** (new) — gloss + real JMdict part-of-speech tags
3. **Anthropic AI** (existing fallback) — only reached if the word isn't in either of the above (slang, VN-specific terms, proper nouns)

**Frequency badge:** looked up in the bundled frequency list regardless of where the gloss came from — no AI needed for this at all, for any word present in the list.

**Context-dependent flag:** split into two pieces —
- The **flag itself** (yes/no) computed locally as a heuristic: if JMdict lists 3+ meaningfully distinct senses for a word, flag it. Works with no API key.
- The **explanatory note** ("can mark contrast, emphasis, or topic depending on context") stays AI-only, since it requires actual reasoning about nuance that a static dictionary entry doesn't give you. Shown only when a key is present; the flag itself still shows without one.

**Loading:** same lazy-loading pattern already used for kuromoji's dictionary — only fetched when the Reader page is visited, parsed into an in-memory lookup structure once per session, not part of the main bundle.

## Attribution

Both JMdict (EDRDG) and the frequency data (NINJAL) require visible credit. Add a line to the Resources page (or a small "Data sources" note in Reader/Settings) — this is a real requirement to implement, not optional politeness.

## Edge Cases

- Word not in JMdict at all → falls through to AI exactly as today (or "no definition found" if no key)
- Multiple JMdict entries for the same surface form (homographs, e.g. 箸/橋/端 all read はし differently, or one reading with multiple kanji) → need to disambiguate by the token's actual reading from kuromoji, not just surface text, when picking which JMdict entry to show
- Dictionary fails to load (offline first run before caching, corrupted fetch) → fall back straight to AI path, same as kuromoji's existing error handling
- Bundle size: this is a real, one-time download cost added to the Reader page specifically (not the main app bundle) — will report actual size once the specific dataset is chosen (common-only vs full) and confirm it's justified before committing

## Out of scope for this spec

- **OCR/screenshot-to-text for manga** — flagged by the user as a future direction, explicitly deferred ("once we get to that point"). Different problem entirely (image text vs. hookable VN text) — noted in memory for continuity, not part of this work.
- Kanjidic → KanjiStudy integration — comes bundled with jmdict-simplified "for free" but is a separate feature decision, not pulled in now.

## Acceptance Criteria

- [ ] Clicking a word not in `VOCAB_DATA`/`customWords` shows a real definition from bundled JMdict with **no API key set** and **no network request**
- [ ] Frequency badge shows for any word in the bundled frequency list, with or without an API key
- [ ] Context-dependent flag shows locally (heuristic-based) without a key; the explanatory note still requires one
- [ ] Words genuinely absent from JMdict still fall back to AI lookup when a key is present, exactly as today
- [ ] Attribution for JMdict/EDRDG and the frequency source (NINJAL) is visible somewhere in the app
- [ ] Reader page load time / bundle size impact is reported and reasonable before calling this done
- [ ] Existing Reader functionality (tokenization, furigana, translation pairing, add-to-deck, capture mode) unaffected
