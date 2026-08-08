# Nihongo Sensei — Claude Code

Shared project context lives in **AGENTS.md** (run commands, layout, coding rules). Read that first.

## Which tool to use

Default: **one agent per task** — don’t run Claude Code and Cursor Agent on the same files at once.

| Use | Tool |
|---|---|
| UI / pages / components, visual diffs, Browser on `:5173` | **Cursor IDE** |
| Long terminal loops: `scripts/*.mjs` data jobs, bulk rebuilds, “keep going until build passes” | **Claude Code** (this CLI) |
| Cursor rules/MCP from a terminal without the IDE | Cursor `agent` CLI |

Habit: **Claude Code for `scripts/` and unattended shell work**; **Cursor for `src/` + Electron UI**.
