# Changelog

All notable changes to Nihongo Sensei are documented here.

## [1.2.0] — 2026-08-07

### UI
- Redesigned **Home** around a single next action (reviews / kana / chat) plus Chat & Reader shortcuts
- Reorganized sidebar into **Practice / Study / More**; mobile bottom nav now includes **Reader**
- Replaced emoji nav icons with a small SVG / JP-glyph set
- Switched English UI font to **Figtree**; kept **Noto Sans JP** for Japanese (slightly larger on study surfaces)
- Quieter **Chat** setup: JP-first scenario picker, cleaner chat surface
- Slimmer **Onboarding** welcome (brand + promise + CTA); feature overview on the last step
- Flattened **Progress** and **Guide** layouts (less card-in-card nesting)
- Dark mode polish for tags, nav, heatmap, and shared surfaces
- Trimmed looping decorative motion; kept intentional transitions (drawer, onboarding finish, corrections)

### Features & fixes
- **Daily study reminders** while the app is open (Settings); re-armed after refresh
- **Auto-TTS** preference for study flows
- More reliable Japanese **TTS** voice loading (waits for `voiceschanged`)
- Cloud sync no longer overwrites local progress that is ahead on XP; prompts to upload/download in Settings
- Streak / daily limits use **local calendar date** (not UTC)
- Vocab undo restores the **daily new-card slot** when undoing a new card
- API key persisted locally in Settings (still never uploaded in cloud sync payloads)
- Assorted Settings / Vocab / Reader / Kana polish from pre-release bugfix

### Repo
- Added `CHANGELOG.md`, `.env.example`, and agent guidance files (`AGENTS.md`, `CLAUDE.md`)

## [1.1.0] — 2026-08-05

- Offline JMdict + frequency dictionary for Reader word lookup
- Reader and Chat state survive tab switches; Capture Mode keeps polling in background
- Reading session history in Reader
- Recommended Path vocab step no longer shows done on fresh accounts
- Desktop Electron packaging and README download links

## [1.0.0] — earlier

- Initial public release: kana, vocab SRS, kanji, grammar, AI conversation, Electron desktop app
