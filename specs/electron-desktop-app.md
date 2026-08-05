# Electron Desktop Packaging — Nihongo Sensei

## Requirements & Goals

Package the existing React/Vite web app as a standalone Electron desktop app that:
- Runs fully locally, no internet-dependent hosting required to launch the app
- Works for personal daily use (progress saved, API key entered once)
- Can be built into a distributable installer/portable `.exe` to show to future employers
- Requires **no rewrite** of existing app code — only wrapper/config additions

## Approach

Electron loads the existing Vite production build (`dist/index.html`) inside a `BrowserWindow` in production, and loads the live Vite dev server (`http://localhost:5173`) in development for hot reload. All existing React/TS source is untouched except two small compatibility fixes (below).

## Changes Required

1. **Routing fix (required for `file://` loading):** `src/App.tsx` currently uses `BrowserRouter`, which needs a real HTTP server with history-API fallback. Under Electron's `file://` protocol this breaks on refresh/deep nav. Swap to `HashRouter` (one-line import change) — works identically for the user, URLs just get a `#`. Also works fine if the site stays on Vercel.

2. **Asset path fix:** `vite.config.ts` needs `base: './'` so built asset paths are relative, not root-absolute (`/assets/...` doesn't resolve under `file://`).

3. **New `electron/` directory:**
   - `electron/main.cjs` — creates the `BrowserWindow`, loads dev server or `dist/index.html` depending on `NODE_ENV`, sets app icon/title.
   - `electron/preload.cjs` — empty/minimal preload with `contextIsolation: true`, `nodeIntegration: false` (secure defaults; the app doesn't need any Node/OS APIs, it's pure web tech).

4. **`package.json` changes:**
   - Add `"main": "electron/main.cjs"`
   - New devDependencies: `electron`, `electron-builder`, `concurrently`, `wait-on`
   - New scripts:
     - `electron:dev` — runs Vite dev server + Electron together, pointed at localhost
     - `electron:build` — `tsc && vite build` then `electron-builder` to produce a Windows installer (NSIS) + portable `.exe` in `release/`
   - `electron-builder` config block: `appId`, `productName: "Nihongo Sensei"`, `files` (dist + electron folder), `win.target: ["nsis", "portable"]`, icon path.

5. **App icon:** electron-builder needs a `.ico` for Windows. Will generate one from the existing `public/icon-512.png` if present, or use a placeholder if not — flag this so you can swap in real branding art later.

## Security Consideration (flagging per your standing instruction)

`VITE_ANTHROPIC_API_KEY` in `.env` gets **inlined into the built JS bundle** at build time (this is standard Vite behavior — anything prefixed `VITE_` ships in plaintext in `dist/assets/*.js`). That's fine for your personal local build, but:

- If you hand a built `.exe` to an employer as a demo, your real Anthropic key would be extractable from the bundle by opening the packaged app's resources.
- **Fix:** for any build you intend to share/distribute, build with `.env`'s `VITE_ANTHROPIC_API_KEY` blank/removed. The app already handles a missing key gracefully — it falls back to `''` and the Settings page lets the user (or interviewer) paste in their own key, stored only in local `localStorage`/Electron's local storage, never bundled.
- Your personal local build (for your own daily use) can keep using your real `.env` key as-is — the risk only applies to copies you give to other people.

No code changes needed for this — it's a build-hygiene note, not a bug. I'll call it out again if we get to the point of producing a "send to an employer" build.

## Acceptance Criteria

- [ ] `npm run electron:dev` launches the app in an Electron window with hot reload, identical behavior to `npm run dev` in browser
- [ ] `npm run electron:build` produces a working installer + portable `.exe` in `release/`
- [ ] Running the packaged `.exe` opens the app, all routes/pages navigate correctly (kana, vocab, reading, conversation, settings)
- [ ] Progress (SRS state, streaks, XP) persists across app restarts
- [ ] Existing `npm run dev` / `npm run build` (web/Vercel path) continue to work unchanged
- [ ] No secrets end up hardcoded in `electron/` files
