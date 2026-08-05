<p align="center">
  <img src="public/icon-512.png" width="120" alt="Nihongo Sensei icon" />
</p>

<h1 align="center">日本語先生 — Nihongo Sensei</h1>

<p align="center">A Japanese learning app with AI conversation practice, vocab SRS, kana drills, and progress tracking.</p>

<p align="center"><strong><a href="https://github.com/pdmacinnes/nihongo-sensei/releases/latest">⬇ Download the desktop app</a></strong> — Windows installer or portable .exe, no build required</p>

## Quick Start

```
npm install
npm run dev
```

Then open http://localhost:5173

Set your Anthropic API key in the Settings page (required for AI conversation with Sakura).

## Features

| Feature | Description |
|---|---|
| 💬 AI Conversation | Chat with Sakura, your AI tutor — streaming, corrections, scenarios |
| 読解 Reader | Immersion reading — tokenized text with furigana, per-word lookup, and live VN capture |
| 字 Kana Study | Interactive hiragana/katakana drill with progress tracking |
| 📚 Vocabulary SRS | Spaced repetition flashcards (SM-2 algorithm) |
| 🔥 Streaks & XP | Daily streaks and experience points |
| 📊 Progress | Stats, SRS maturity, achievements |

## AI Conversation (Main Feature)

- Choose a **scenario**: free chat, restaurant, shopping, directions, etc.
- Choose **difficulty**: N5 (beginner) through N2 (upper intermediate)
- Sakura responds in Japanese with furigana for hard kanji
- Every response includes an **English translation** (collapsible)
- **Corrections panel** shows grammar/vocabulary feedback after each exchange
- Quick-phrase buttons for common learner phrases

## Reader (Immersion Reading)

Paste any Japanese text — or capture it live from a visual novel — and get an instant reading aid:

- Text is tokenized client-side (kuromoji.js) with **furigana** shown above kanji
- Tap any word for its reading, part of speech, and an English gloss (checks your own deck first, falls back to AI lookup)
- Each word lookup also shows a **frequency badge** (very common → rare) and flags when a word is **context-dependent**, with a short note on what changes
- **+ Add to deck** saves a word straight into the same SRS system as the rest of the app, with the sentence it came from as context
- Newest text appears at the top, so you're not scrolling down as you read
- Live session stats: characters read, unique words, new words added, reading speed

**Capture Mode** (desktop app only): pairs with [Textractor](https://github.com/Artikash/Textractor) (free, open-source VN text hooker). Enable Textractor's Clipboard extension and Nihongo Sensei will auto-pull new lines as you play — no copy-paste needed. If the VN has a translation patch and Textractor is hooked to both languages, the English attaches automatically as each line's translation. Capture keeps running even if you switch to another tab. In-app setup instructions are on the Reader page.

## Desktop App (Electron)

The app also runs as a standalone Windows desktop app — no browser or hosting required. Grab a pre-built copy from the [latest release](https://github.com/pdmacinnes/nihongo-sensei/releases/latest), or build it yourself:

```
npm run electron:dev      # run in a desktop window with hot reload
npm run electron:build    # build an installer + portable .exe into release/
```

`electron:build` produces:
- `release/Nihongo Sensei Setup <version>.exe` — installer
- `release/Nihongo Sensei <version>.exe` — portable, no install needed

The desktop build uses the same React/Vite source as the web app — no separate codebase to maintain.

> **Note:** `npm run electron:build` bakes whatever `VITE_ANTHROPIC_API_KEY` is in your local `.env` into the packaged app. That's fine for a build you run yourself, but don't hand a build with your real key to anyone else — clear the key from `.env` before building a copy to share, and the recipient can add their own key from the Settings page instead.

## Tips

- Enable your OS Japanese IME to type in hiragana/katakana
- If you're a beginner, start with **Kana Study** to learn hiragana first
- The **N5 Free Chat** scenario is perfect for absolute beginners
- All progress is saved locally in your browser (or locally on disk in the desktop app)
