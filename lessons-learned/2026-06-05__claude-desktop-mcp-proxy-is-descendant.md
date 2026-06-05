---
title: Claude Desktop's mcp-proxy is a DESCENDANT of the per-chat claude.exe renderer, not a sibling
date: 2026-06-05
branch: main
---

# Context

Built `/node-killer` (`~/.claude/scripts/kill-node.mjs` + `~/.claude/commands/node-killer.md`) + wired end-of-chat cleanup into `/full-deploy-light` (Step 5). The handoff doc (`~/.claude/node-killer-handoff.md`) was built from an earlier investigation that assumed `mcp-proxy.exe` is a **sibling** of the chat process — both parented to a single top-level `claude.exe` (Desktop). On that assumption, identifying "this chat's proxy" required a birth-time heuristic because you couldn't walk up from the chat to find it.

# What turned out to be true (this build of Claude Desktop, 2026-06-05)

Claude Desktop is an Electron app. The actual process tree is:

```
claude.exe (Electron main, PID 36552)
└── claude.exe (per-chat renderer, PID 9284)        ← THIS chat's renderer
    ├── mcp-proxy.exe (PID 26208)                   ← THIS chat's proxy
    │   ├── cmd.exe → npx.exe → node.exe (lazy-mcp)
    │   ├── cmd.exe → meta-ads-mcp.exe
    │   ├── cmd.exe → python.exe (Fathom MCP)
    │   ├── cmd.exe → node.exe (nano-banana-2)
    │   └── ... ~15 more MCP helpers
    └── bash.exe (one per tool call)
        └── node.exe (kill-node.mjs, sleep targets, etc.)
```

**The mcp-proxy is a descendant of the chat's claude.exe renderer.** Not a sibling. Walking up from the killer through ancestry, we DO eventually hit claude.exe — but it's the per-chat renderer, not Electron main. And `mcp-proxy.exe` is a child of that same renderer.

# Why it matters

For `/node-killer`, this means:
- The session root for descendant walks is **the nearest `claude.exe` ancestor** (the per-chat renderer), NOT a `node.exe` agent (which doesn't exist as a separate process in Desktop mode).
- Branch (a) "descendants of session root" would over-include — it catches the MCP proxy and its 15 helpers too, which would break the chat mid-session if killed.
- The fix: branch (a) requires a **dev/render signature match** (`dev.mjs`, `run-campaign`, etc.), so MCP infrastructure is preserved unless `--end-of-chat` is passed.
- `--end-of-chat` keeps **both** identification rules (descendant-of-session-root OR birth-time match ±60s) — works whether the proxy is a descendant (this build) or a sibling (the architecture the handoff assumed).

# Diagnostic that surfaced this

The first run of `kill-node.mjs --dry-run` failed with `session-root-unknown`. The stderr ancestor-chain dump showed no `node.exe` ancestor whose parent was `claude.exe` — only bash shells leading directly to claude.exe. That's how we learned the agent process isn't a node child of Desktop in this build; the chat's claude.exe renderer is the parent of tool-call shells directly.

# How to apply

When building any "scope to this chat" tooling on Windows:
1. The session root is `claude.exe` (per-chat renderer), found via `walkAncestors(killerPid).find(p => p.name === "claude.exe")`.
2. Plain descendants-of-session-root over-includes — you almost always want to additionally filter on signatures, name, or another criterion.
3. The MCP proxy and all its helpers are descendants of the chat renderer in current Desktop builds — killing them mid-chat breaks every tool call until the chat restarts. Only sweep them at end-of-session (the `--end-of-chat` flag pattern).
4. Don't assume architecture from prior handoffs without re-verifying with an actual ancestor-chain print. The cheapest diagnostic is a one-shot PowerShell:
   ```powershell
   Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -eq $PID } |
     ForEach-Object { while ($_) { "$($_.ProcessId) $($_.Name) -> $($_.ParentProcessId)"; $_ = Get-CimInstance Win32_Process -Filter "ProcessId = $($_.ParentProcessId)" } }
   ```
