# Audio picker + preview server — start-point selection against video

**Date:** 2026-05-21
**Branch:** main
**Commit:** 071dad3

## What we built

A side-by-side audio/video tool for picking music start points and verifying
them against the actual creative before render. Lives at
`templates/audio-picker/` for reuse, currently deployed in
`Andromeda 1 - noblesville test/`.

The picker shows, per track:

- The full waveform (red bars on dark canvas), drawn from ffmpeg-decoded
  peaks fetched as JSON
- Click + drag anywhere on the waveform to seek; a chrome dashed line shows
  the marked start, a white line + handle dot shows the live playhead
- An inline `<audio>` element with play/pause + step buttons
- A volume slider that drives the picker audio in real time and bakes into
  the snippet
- A clickable song title that opens a dropdown of every track in the music
  library — click a track and the picker copies it into the project's
  `audio/` folder, swaps to the new waveform, and resets the marker
- A side-by-side iframe of the matching creative (`creative-X.html`) that
  reloads with `?musicStartAt=N&musicVolume=N&musicMute=1` so the real
  video plays with the proposed configuration

Play/pause in the picker drives the iframe; pause in the iframe pauses the
picker. The picker is the audio source during preview; the iframe is
muted so two simultaneous audio streams don't create a phase-offset
"reverb."

## Architecture pieces worth remembering

### 1. Server-side waveform pre-decoding via ffmpeg

The bottleneck was the client-side Web Audio decode. Decoding a 3-minute
MP3 in `AudioContext.decodeAudioData()` takes ~1–3s of UI freeze, and
that compounds when cycling through tracks.

Fix: pre-decode peaks once with ffmpeg, cache as small JSON
(`<project>/.peaks-cache/<filename>.json`, ~10–30KB each), serve via
`GET /peaks/<filename>.json`. The picker fetches that first and only
falls back to Web Audio decoding on cache miss.

Decode pipeline:

```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 X.mp3
ffmpeg -v error -i X.mp3 -ac 1 -ar 4000 -f s16le -
```

Mono 4 kHz 16-bit PCM is small enough that pure-Python binning into 1200
peak values stays under a second per track. `audioop.max(chunk, 2)` does
the per-chunk max-abs in C (deprecated in 3.13; pure-Python fallback in
place).

A background `threading.Thread` consumes a queue and writes JSONs
atomically (`tmp` + `os.replace`). On every `/api/library` call the server
re-scans `~/Downloads`, `<repo>/music-library/`, and `<project>/audio/`
and queues anything not already cached. Picker also POSTs browser-decoded
peaks to `/api/save-peaks` as a write-through cache — covers the case
where ffmpeg failed or a track appears mid-session.

### 2. HTTP Range support is mandatory for `<audio>` seeking

Python's `SimpleHTTPRequestHandler` returns 200 + full file regardless of
the `Range` header. With `Cache-Control: no-store` (which we set for
JSX/CSS), the browser refetches on every seek — and if the user seeks past
the buffered region, the seek fails and `currentTime` snaps to 0.

Fix: implement `_serve_with_range` that parses `Range: bytes=START-END`,
opens the file, seeks, reads `length` bytes, returns 206 Partial Content
with `Content-Range: bytes START-END/TOTAL`. Also bump
`protocol_version = "HTTP/1.1"` on the handler (1.0 doesn't allow
proper 206 responses).

Also: **don't** send `Cache-Control: no-store` for audio files. Let the
browser cache them so re-seeks stay in-memory. The HTML cache-busting we
already do via `?t=<timestamp>` injection covers what we actually need
to refresh (JSX/CSS source).

### 3. Audio autoplay-unlock pattern

Chrome refuses `audio.play()` unless it happens in direct response to a
user gesture. When the picker auto-syncs play state via React effects,
the gesture chain is broken (the effect runs after the click handler
returns), and `play()` rejects silently with `NotAllowedError`.

Fix: on first user click/keypress anywhere on the page, fire a one-shot
`audio.play().then(() => audio.pause())` inside the gesture handler. This
permanently unlocks the element for subsequent programmatic `play()`
calls. Gate the main playback effect on an `unlocked` state flag so we
don't even try until the gesture lands.

```js
document.addEventListener('pointerdown', unlock, true); // capture
// in unlock(): a.play().then(() => { a.pause(); setUnlocked(true); })
```

A small "click anywhere to enable audio" banner is shown until unlocked.

### 4. URL-param overrides on `MusicSync`

The iframe preview reloads the creative with
`?musicStartAt=N&musicVolume=N&musicMute=1`. `MusicSync` reads these out
of `URLSearchParams` and applies them via `React.useMemo` before the
component uses the `startAt`, `volume`, `muted` props. This lets the
picker test arbitrary configurations against the real video without
touching the JSX file.

The `musicMute=1` flag is critical: when both the picker's `<audio>` and
the iframe's `<MusicSync>` play the same track at slight wall-clock
offsets, you hear a phase-shift "reverb." Muting the iframe and using
the picker as sole audio source eliminates it.

### 5. Cross-iframe play/pause sync via postMessage

A small bridge in `animations.jsx` listens for
`{type: 'stage-play' | 'stage-pause' | 'stage-seek', t}` from the parent
window and broadcasts `{type: 'stage-state', playing}` outward when its
own playing state changes. The picker translates audio play/pause events
into outgoing messages and incoming messages into picker audio state.

This means: pause the picker → iframe video pauses. Click pause inside
the iframe → picker audio pauses. No reload needed.

### 6. Drag-to-seek: classic mousedown + document listeners

`setPointerCapture` is unreliable when called on an ancestor of the
actual click target (the canvases stacked inside `.wave-wrap`). Switched
to classic pattern:

```js
waveWrap.addEventListener('mousedown', (e) => {
  e.preventDefault();
  seekTo(clientXToTime(e.clientX));
  const onMove = (ev) => seekTo(clientXToTime(ev.clientX));
  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
});
```

Plus `pointer-events: none` on every canvas / overlay so mousedown always
hits the parent. Drag survives pointer moving off the waveform area.

## Pitfalls hit along the way (in chronological order)

- **Babel-standalone caches JSX.** Hard refresh wasn't always enough. Fix
  was a server that rewrites HTML to inject `?t=<timestamp>` into every
  `<script type="text/babel" src>` / `<link rel="stylesheet" href>` —
  every page load asks for a URL the browser has never seen. After this,
  regular Ctrl+R works.
- **Cleanup-pause race.** The first MusicSync implementation paused the
  audio in the effect cleanup function, racing the next effect's
  `play()` and producing `AbortError: play() request was interrupted by
  a call to pause()`. Removed the cleanup pause; the body of the
  next-effect handles transition correctly.
- **`canplay` event spam.** Every Stage frame fired a seek effect that
  re-triggered `canplay`. Only seek when `playing && unlocked` so paused-
  state drift doesn't cause runaway events.
- **Editorial chapter labels.** "COLD OPEN", "THE SALES PITCH",
  "CLOSING · THE PARENT" — filmmaker jargon that doesn't belong in a
  finished ad. Removed surgically while keeping the per-concept visual
  chrome (TC/REC on A, Field Report header + page numbers on C).
- **JSX `<MusicSync>` lived outside the `<Stage>` initially** — gets no
  timeline context. Must be a child of `<Stage>` so `useTimeline()`
  returns the right values.
- **Unicode in print() crashes on Windows cp1252.** Avoid `→`, em-dashes,
  etc. in server log strings. Use ASCII arrows (`->`) instead.
- **`audioop` deprecated in 3.13.** Pure-Python fallback in place; will
  need a real replacement when 3.13 lands.

## Templates folder structure

`templates/audio-picker/` ships four files plus a README:

| File | Purpose |
|------|---------|
| `audio-picker.html` | The picker UI. Edit the `TRACKS` array near the top per project. |
| `music-sync.jsx` | URL-param-aware MusicSync component (drop into project root). |
| `animations.jsx` | Stage starter + postMessage bridge for iframe sync. |
| `_serve_nocache.py` | Local server: no-cache + HTML rewrite + Range + library endpoints + ffmpeg pre-decoder. |
| `README.md` | Setup notes. |

The repo-level `music-library/` folder is where new music goes. The
server scans it on every `/api/library` call and queues uncached files
for background decoding.

## Where to go next (open work)

- Pick start points for Creative B and C (both still at `startAt={0.00}`)
- Render the three creatives to MP4 via the `jsx-to-mp4` skill once music
  timing feels right
- Mux the chosen audio into the rendered MP4s via the ffmpeg
  post-process pass (recipe in the Westfield grand-opening lesson)
- Maybe: promote the picker server changes to the global
  `~/.claude/scripts/serve-jsx-design.py` so all future projects pick up
  Range support, pre-decoding, library serving, etc.
