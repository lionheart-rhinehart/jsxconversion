# Windows paths need explicit forward-slash normalization for URLs

**Date:** 2026-05-15
**Branch:** claude/competent-lewin-48c6f8
**Commit:** 792225f

## What happened

The first render attempt halted with:

```
[page error] Could not load http://127.0.0.1:50577/D%3A%5CClaude%20CODE%5C...%5Canimations.jsx
[page error] shipped runtime not detected
```

The local static server returned 404 for `animations.jsx` because the URL had the full absolute Windows path baked in (`D:\Claude CODE\...`), URL-encoded as `D%3A%5CClaude%20CODE%5C...`.

## Root cause

In `claude-design.mjs`, the `relativeToProject` helper computed a relative URL path with:

```js
function relativeToProject(absPath, projectDir) {
  const rel = absPath.startsWith(projectDir + "/")
    ? absPath.slice(projectDir.length + 1)
    : absPath;
  return rel;
}
```

The prefix check assumed `/` separators. On Windows, paths use `\`, so `projectDir + "/"` never matches the start of an absolute path that uses backslashes. The function fell through and returned the full absolute path. That got URL-encoded into the static-server fetch, which 404'd.

## The fix

```js
function relativeToProject(absPath, projectDir) {
  return relative(projectDir, absPath).split(sep).join("/");
}
```

Use Node's `path.relative` (handles OS separator naturally), then normalize backslashes to forward slashes for URL use.

## Broader pattern

Any time a Node path crosses into a URL (static-server fetch, file:// URI, sourcemap, anywhere a slash matters), explicitly normalize:

```js
const urlPath = relativePath.split(path.sep).join("/");
```

`path.sep` is `\` on Windows and `/` everywhere else. `path.posix.normalize` doesn't help if the input already has `\` in it — you need to split-and-join.

## How to recognize this in future

- "404 for a file I know exists" + URL contains `%5C` (encoded backslash) or `%3A` (encoded colon for drive letters) → Windows-path-in-URL bug.
- Cloud-session-authored scripts often have this bug because Linux-only testing won't surface it.

## References

- Fix commit: 893c7b5
- Affected file: `.claude/skills/jsx-to-mp4/scripts/claude-design.mjs:387` (`relativeToProject`)
- Similar pattern: `git-guardian.mjs` doesn't handle git worktrees (where `.git` is a file, not a directory). We worked around it in `light-deploy.mjs` by detecting worktrees and falling back to lightweight git-command checks.
