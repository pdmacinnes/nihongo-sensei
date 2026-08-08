# Nihongo Sensei (日本語先生)

Japanese learning app: React + Vite + TypeScript + Tailwind, optional Electron desktop shell. Repo folder on this machine may be named `TranslationTool`; package name is `nihongo-sensei`.

## Run

```bash
npm install
npm run dev              # web → http://localhost:5173
npm run electron:dev     # desktop window + Vite HMR
npm run build            # tsc + vite build
npm run electron:build   # installer + portable exe → release/
```

Anthropic key for Sakura chat: Settings page, or `VITE_ANTHROPIC_API_KEY` in `.env`. Firebase cloud sync uses `VITE_FIREBASE_*` (optional).

## Layout

- `src/pages/` — routes (Dashboard, Conversation, Reader, Kana/Kanji/Grammar/Vocab, etc.)
- `src/lib/` — SRS, tokenizer, dictionary helpers, Firebase, TTS
- `src/store/` — Zustand app state (progress, API key, reader capture)
- `electron/` — Electron main/preload
- `scripts/` — data integration / rebuild helpers (not required for `npm run dev`)
- `specs/` — feature notes

## Which tool to use

Default: **one agent per task** — don’t run Cursor Agent and Claude Code on the same files at once.

| Use | Tool |
|---|---|
| UI / pages / components, visual diffs, Browser check on `:5173`, Tab + inline edits | **Cursor IDE** (`Ctrl+I` / Ask / Plan / Debug) |
| Same Cursor rules/MCP but already in a terminal | **Cursor `agent` CLI** |
| Long terminal loops: `scripts/*.mjs` data jobs, bulk rebuilds, “keep going until build/tests pass” | **Claude Code** (`claude`) |
| Burned Cursor Claude quota but still have Claude Code quota (or want Claude-only) | **Claude Code** |

Quick habit: **Cursor for `src/` + Electron UI**; **Claude Code for `scripts/` and long unattended shell work**.

## Agent rules

- Prefer minimal diffs; match existing React/TS/Tailwind style.
- Do not commit `.env`, API keys, or Firebase secrets. Never bake a real `VITE_ANTHROPIC_API_KEY` into a shared `electron:build`.
- Do not regenerate or commit huge `scripts/data/` dumps unless explicitly asked.
- Ignore `dist/`, `release/`, `node_modules/` — build artifacts only.
- Reader/kuromoji are heavy; keep Reader lazy-loaded unless there is a strong reason not to.
