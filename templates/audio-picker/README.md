# Audio Picker Template

A self-contained tool for picking music start points against a JSX-design
video preview. Drop these two files into any project's folder alongside the
creative HTML runners.

## What you get

- **Waveform** per track, decoded with the Web Audio API
- **Click + drag** anywhere on the waveform to seek
- **Mark start** button captures the current playhead as `startAt`
- **Live video preview** — clicking "Preview in video" reloads the matching
  creative in a side-by-side iframe with `?musicStartAt=N` so you can see
  the music drop hit the right visual beat without editing JSX
- **Copy snippet** spits out the ready-to-paste `<MusicSync ...>` line

## Files

| File | Where it goes | Why |
|------|--------------|-----|
| `audio-picker.html` | Project root | The UI |
| `music-sync.jsx` | Project root | Reads `?musicStartAt=N`, `?musicVolume=N`, `?musicMute=1` URL params so the iframe preview can override JSX values without an edit |
| `animations.jsx` | Project root | Same as starter, plus a postMessage bridge that lets the picker drive iframe play/pause (and broadcasts state back). Only needed if you want pause-syncs-everything behavior. |
| `_serve_nocache.py` | Project root | Local server with no-cache headers, HTML cache-busting, HTTP Range support for audio seeking, library endpoints (`/api/library`, `/api/use-library-track`), and **background waveform pre-decoder** (`/peaks/<name>.json`, `/api/save-peaks`) using ffmpeg. |

## Music library + pre-decoded waveforms

The server treats three folders as audio sources:

1. **`<repo>/music-library/`** — canonical "drop new music here" folder at the repo root. Recommended for your own organized library.
2. **`~/Downloads`** — fallback library source so existing tracks just work.
3. **`<project>/audio/`** — tracks already imported into the current project (these are what the JSX renders).

On startup, the server scans all three and **background-decodes** any audio file that doesn't yet have a cached waveform. Cached peaks land in `<project>/.peaks-cache/<filename>.json` (~10–30 KB each, gitignore-worthy). The audio picker fetches these via `/peaks/<filename>.json` and skips its slow client-side Web Audio decode entirely — clicking a different track in the dropdown switches the waveform almost instantly.

If you drop a new file into `music-library/` while the server is running, the next time the picker hits `/api/library` (every open + every track switch) the server re-scans and queues the new track for background decoding. After a few seconds it's ready.

Requires `ffmpeg` and `ffprobe` on PATH (already required by the broader `jsx-to-mp4` setup).

## Setup in a new project

1. **Copy both files** into the new project's folder (where `creative-*.html` lives).

2. **Make sure each `creative-*.html` loads `music-sync.jsx`** after `animations.jsx`:
   ```html
   <script type="text/babel" src="animations.jsx"></script>
   <script type="text/babel" src="music-sync.jsx"></script>
   <script type="text/babel" src="tweaks-panel.jsx"></script>
   <script type="text/babel" src="creative-X.jsx"></script>
   ```

3. **Place each `<MusicSync>` inside its `<Stage>`** in the corresponding `creative-X.jsx`:
   ```jsx
   <Stage ...>
     <CreativeX/>
     <MusicSync src="audio/your-track.mp3" startAt={0} volume={0.75} fadeIn={1.2} fadeOut={1.8}/>
   </Stage>
   ```

4. **Edit the `TRACKS` array** near the top of `audio-picker.html` to match this
   project's audio files and creatives. The shape:
   ```js
   const TRACKS = [
     {
       id: 'a',                              // short identifier
       creative: 'Creative A · The Hook',    // display label
       title: 'Track Name — Artist',         // display label
       file: 'audio/track-a.mp3',            // path to the MP3
       videoFile: 'creative-a.html',         // the iframe target
       initial: 0,                            // current startAt value in the JSX
       volume: 0.75, fadeIn: 1.2, fadeOut: 1.8, // mirrored from the JSX
     },
     // … one entry per creative
   ];
   ```

5. **Open `http://127.0.0.1:8080/audio-picker.html`** (or whatever port your
   preview server uses). The picker auto-decodes the waveforms.

## How the URL-param override works

`MusicSync` reads `?musicStartAt=N` from the page URL and uses that instead of
the JSX `startAt` prop, when present. The audio picker's iframe sets that
parameter to whatever you've marked. The override is *preview-only*: it doesn't
modify any JSX file. Once you've found the right start point, copy the snippet
and paste it back into the actual JSX yourself (or have Claude do it for you).

## Performance note

Decoding takes ~1–3 seconds per track depending on length. Once decoded, the
peaks are cached in memory — subsequent waveform redraws (resize, etc.) are
instant. The cache resets on page reload.

## Browser compatibility

- Web Audio API: Chrome, Edge, Firefox, Safari (all modern)
- Pointer events for drag-to-seek: all modern browsers
- The `?musicStartAt` override requires `MusicSync` from this template (not
  the bare starter from older projects)
