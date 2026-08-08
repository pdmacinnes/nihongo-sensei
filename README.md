<p align="center">
  <img src="public/icon-512.png" width="120" alt="Nihongo Sensei icon" />
</p>

<h1 align="center">日本語先生 — Nihongo Sensei</h1>

<p align="center">Practice real Japanese with Sakura — AI conversation, immersion reading, SRS vocab, kana/kanji/grammar, and progress tracking.</p>

<p align="center"><strong><a href="https://github.com/pdmacinnes/nihongo-sensei/releases/latest">⬇ Download the desktop app</a></strong> — Windows installer or portable .exe, no build required</p>

<p align="center"><a href="CHANGELOG.md">Changelog</a> · Latest release: <strong>v1.3.0</strong></p>

## Quick Start

```
npm install
npm run dev
```

Then open http://localhost:5173

Copy `.env.example` to `.env` if you want, or set your Anthropic API key in **Settings** (required for AI conversation with Sakura).

## Features

| Feature | Description |
|---|---|
| 会話 AI Conversation | Chat with Sakura — scenarios, N5–N1 difficulty, streaming replies, corrections, sentence mining |
| 読解 Reader | Immersion reading — furigana, offline dictionary lookup, frequency badges, VN capture (desktop) |
| 単語 Vocabulary SRS | Sentence-first spaced repetition (SM-2), daily new-card limit, undo |
| かな Kana | Hiragana & katakana chart + drills with mastery tracking |
| 漢字 Kanji | Kanji study and practice by JLPT level |
| 文法 Grammar | Browse patterns and cloze drills (N5–N4 focus) |
| 読書 Reading practice | Graded reading exercises |
| 進捗 Progress | Streaks, XP, SRS maturity, activity charts, achievements |
| 設定 Settings | API key, dark mode, auto-TTS, daily reminders, cloud sync, Anki .apkg export |

Home highlights **what to do next** (due reviews, kana, or chat) with quick links to Chat and Reader.

## AI Conversation

- Pick a **setting** (自由会話, レストラン, 買い物, etc.) and **JLPT level** N5–N1
- Sakura replies in Japanese (furigana for harder kanji at lower levels)
- Collapsible **English translation** and a **corrections** panel after each turn
- Quick phrases for learners; **+ Add** chips mine words into your SRS deck
- In-progress chats resume if you switch tabs

## Reader (Immersion Reading)

Paste Japanese text — or capture it live from a visual novel — for an instant reading aid:

- Client-side tokenization (kuromoji) with **furigana** over kanji
- Tap a word for reading, part of speech, and gloss: **your deck → offline JMdict** (bundled), with **AI fallback** only when needed
- **Frequency badge** (very common → rare) and notes when a word is context-dependent
- **+ Add to deck** saves the word into SRS with the sentence as context
- Session stats and **reading history**; Capture Mode keeps running across tabs

**Capture Mode** (desktop app only): pairs with [Textractor](https://github.com/Artikash/Textractor). Enable Textractor’s Clipboard extension and Nihongo Sensei pulls new lines as you play. If the VN has a translation patch and both languages are hooked, English attaches automatically. Setup tips are on the Reader page.

## Desktop App (Electron)

Standalone Windows app — no browser required. Download from the [latest release](https://github.com/pdmacinnes/nihongo-sensei/releases/latest), or build:

```
npm run electron:dev      # desktop window + Vite HMR
npm run electron:build    # installer + portable exe → release/
```

Produces:
- `release/Nihongo Sensei Setup <version>.exe` — installer
- `release/Nihongo Sensei <version>.exe` — portable

Same React/Vite codebase as the web app.

> **Note:** `electron:build` can bake `VITE_ANTHROPIC_API_KEY` from a local `.env` into the package. For a build you share, clear that key first — recipients can add their own in Settings.

## Tips

- Enable your OS Japanese IME to type in hiragana/katakana
- Beginners: start with **Kana**, then vocab reviews, then **N5 Free Chat**
- Progress is saved locally (browser storage or on disk in the desktop app)
- Optional **cloud sync** via a sync code in Settings — upload/download carefully if local XP is ahead
- See **ガイド / Guide** in the app for the learning method and a sample daily schedule
