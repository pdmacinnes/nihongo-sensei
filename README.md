<p align="center">
  <img src="public/icon-512.png" width="120" alt="Nihongo Sensei icon" />
</p>

<h1 align="center">日本語先生 — Nihongo Sensei</h1>

<p align="center">A Japanese learning app with AI conversation practice, vocab SRS, kana drills, and progress tracking.</p>

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

## Desktop App (Electron)

The app also runs as a standalone Windows desktop app — no browser or hosting required.

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
