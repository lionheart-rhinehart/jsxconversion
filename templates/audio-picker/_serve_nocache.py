"""Tiny local server with two cache-busting layers:

  1. Sends `Cache-Control: no-store` on every response.
  2. Rewrites `.jsx` and `.css` script/link refs in served HTML to append
     `?t=<timestamp>` so each page load asks for a URL the browser has
     never seen — guarantees fresh JSX/CSS without any DevTools toggling.

Plus two endpoints the audio picker uses to browse the user's music library:

  GET  /api/library          → JSON list of audio files in LIBRARY_PATH
  POST /api/use-library-track {"name": "X.mp3"} → copies that file into
                                                  the project's audio/
                                                  folder so the picker can
                                                  use it like any existing
                                                  project track.
"""
import http.server, socketserver, sys, os, time, re, json, shutil, urllib.parse, mimetypes, subprocess, threading, struct

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))
LIBRARY_PATH = os.path.join(os.path.expanduser("~"), "Downloads")
# Repo-level music library — drop new music here and it's auto-decoded.
# Lives one level up from the project folder (the jsxconversion repo root).
REPO_ROOT = os.path.dirname(ROOT)
MUSIC_LIBRARY_DIR = os.path.join(REPO_ROOT, "music-library")
# Pre-decoded waveform peaks live here (per-project so paths stay portable).
PEAKS_CACHE_DIR = os.path.join(ROOT, ".peaks-cache")
AUDIO_EXTS = {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac", ".opus"}
PEAKS_RESOLUTION = 1200  # number of peak bins in the waveform

# Try to import audioop (deprecated in 3.13, present in <=3.12) for fast peak
# computation. Fall back to a pure-Python loop if it's gone.
try:
    import audioop
    def _max_abs(pcm_bytes, sample_width=2):
        return audioop.max(pcm_bytes, sample_width)
except ImportError:
    def _max_abs(pcm_bytes, sample_width=2):
        if sample_width != 2:
            raise NotImplementedError("only 16-bit supported")
        m = 0
        for i in range(0, len(pcm_bytes), 2):
            v = struct.unpack_from('<h', pcm_bytes, i)[0]
            if v < 0: v = -v
            if v > m: m = v
        return m

# Match: src="foo.jsx" or src='foo.jsx' or href="foo.css" — possibly with existing query string
SCRIPT_RE = re.compile(rb'((?:src|href)=["\'])([^"\']+?\.(?:jsx|css))(\?[^"\']*)?(["\'])')


# ── Waveform peaks pre-decoder ────────────────────────────────────────────
# Uses ffmpeg to extract PCM, then bins into peak values for fast waveform
# rendering. Saves to <project>/.peaks-cache/<filename>.json. The audio picker
# checks for these via GET /peaks/<filename>.json — if present, it skips the
# slow client-side Web Audio decode entirely.

def _peaks_cache_path(name):
    safe = name.replace('/', '_').replace('\\', '_')
    return os.path.join(PEAKS_CACHE_DIR, safe + '.json')

def _is_peaks_cached(name):
    return os.path.isfile(_peaks_cache_path(name))

def _decode_peaks(mp3_path, num_peaks=PEAKS_RESOLUTION):
    """Decode a single MP3's waveform peaks via ffmpeg. Returns dict."""
    duration_out = subprocess.check_output([
        'ffprobe', '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        mp3_path,
    ], timeout=30)
    duration = float(duration_out.decode().strip())

    # Mono 4kHz 16-bit PCM keeps the data small enough that pure-Python
    # binning stays under a second per track.
    pcm = subprocess.check_output([
        'ffmpeg', '-v', 'error', '-i', mp3_path,
        '-ac', '1', '-ar', '4000',
        '-f', 's16le', '-',
    ], timeout=60)

    total_samples = len(pcm) // 2
    if total_samples == 0:
        return {'peaks': [0.0] * num_peaks, 'duration': duration}

    bin_size = max(1, total_samples // num_peaks)
    peaks = []
    for i in range(num_peaks):
        sb = i * bin_size * 2
        eb = min(sb + bin_size * 2, len(pcm))
        if eb <= sb:
            peaks.append(0.0)
            continue
        peaks.append(round(_max_abs(pcm[sb:eb], 2) / 32768.0, 4))
    return {'peaks': peaks, 'duration': duration}

def _save_peaks(name, data):
    os.makedirs(PEAKS_CACHE_DIR, exist_ok=True)
    tmp = _peaks_cache_path(name) + '.tmp'
    with open(tmp, 'w') as f:
        json.dump(data, f)
    os.replace(tmp, _peaks_cache_path(name))

# Background decode queue
_decode_queue = []
_decode_seen = set()
_decode_lock = threading.Lock()
_decode_thread = None

def _decode_worker():
    while True:
        with _decode_lock:
            if not _decode_queue:
                return
            mp3_path, name = _decode_queue.pop(0)
        if _is_peaks_cached(name):
            continue
        try:
            data = _decode_peaks(mp3_path)
            _save_peaks(name, data)
            print(f"[peaks] decoded {name} ({len(data['peaks'])} bins · {data['duration']:.1f}s)", flush=True)
        except subprocess.TimeoutExpired:
            print(f"[peaks] timeout: {name}", flush=True)
        except FileNotFoundError as e:
            print(f"[peaks] ffmpeg missing: {e}", flush=True)
        except Exception as e:
            print(f"[peaks] decode failed for {name}: {e}", flush=True)

def _queue_decode(mp3_path, name):
    """Add a track to the background decode queue if not already cached/queued."""
    if _is_peaks_cached(name):
        return
    with _decode_lock:
        if name in _decode_seen:
            return
        _decode_seen.add(name)
        _decode_queue.append((mp3_path, name))
    _ensure_decode_thread()

def _ensure_decode_thread():
    global _decode_thread
    if _decode_thread is not None and _decode_thread.is_alive():
        return
    _decode_thread = threading.Thread(target=_decode_worker, daemon=True)
    _decode_thread.start()

def _scan_and_queue_all():
    """Scan every known audio source and queue any uncached track."""
    sources = [
        (LIBRARY_PATH, "library"),
        (os.path.join(ROOT, "audio"), "project audio/"),
        (MUSIC_LIBRARY_DIR, "music-library/"),
    ]
    for path, label in sources:
        try:
            files = os.listdir(path)
        except FileNotFoundError:
            continue
        for f in files:
            if os.path.splitext(f)[1].lower() in AUDIO_EXTS:
                _queue_decode(os.path.join(path, f), f)


def _safe_audio_name(name):
    """Reject names that would escape the audio dir or aren't audio files."""
    if not name or not isinstance(name, str): return None
    if "/" in name or "\\" in name or ".." in name: return None
    if os.path.splitext(name)[1].lower() not in AUDIO_EXTS: return None
    return name


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    # HTTP/1.1 is required for Range responses; SimpleHTTPRequestHandler
    # defaults to HTTP/1.0 which can't return 206 Partial Content properly.
    protocol_version = "HTTP/1.1"

    def end_headers(self):
        # Audio files are big and immutable per session; let the browser
        # cache them so seeks don't trigger re-download. Cache-busting via
        # `?t=` is still applied to JSX/CSS in our HTML rewriter.
        path_only = self.path.split("?", 1)[0].lower()
        is_audio = any(path_only.endswith(ext) for ext in AUDIO_EXTS)
        if not is_audio:
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    # ── Virtual path routing ──────────────────────────────────────────────
    #   /library/<file>      → mirror of ~/Downloads (audio only)
    #   /music-library/<file>→ repo-level music-library/ (audio only)
    #   /peaks/<name>.json   → pre-decoded waveform peaks cache
    def translate_path(self, path):
        decoded = urllib.parse.unquote(path.split("?", 1)[0])
        if decoded.startswith("/library/"):
            rel = decoded[len("/library/"):]
            if ".." in rel or rel.startswith("/") or "\\" in rel:
                return os.path.join(LIBRARY_PATH, "__forbidden__")
            if os.path.splitext(rel)[1].lower() not in AUDIO_EXTS:
                return os.path.join(LIBRARY_PATH, "__not_audio__")
            return os.path.join(LIBRARY_PATH, rel)
        if decoded.startswith("/music-library/"):
            rel = decoded[len("/music-library/"):]
            if ".." in rel or rel.startswith("/") or "\\" in rel:
                return os.path.join(MUSIC_LIBRARY_DIR, "__forbidden__")
            if os.path.splitext(rel)[1].lower() not in AUDIO_EXTS:
                return os.path.join(MUSIC_LIBRARY_DIR, "__not_audio__")
            return os.path.join(MUSIC_LIBRARY_DIR, rel)
        if decoded.startswith("/peaks/"):
            rel = decoded[len("/peaks/"):]
            if ".." in rel or rel.startswith("/") or "\\" in rel:
                return os.path.join(PEAKS_CACHE_DIR, "__forbidden__")
            return os.path.join(PEAKS_CACHE_DIR, rel)
        return super().translate_path(path)

    def do_GET(self):
        # ── /api/library ──────────────────────────────────────────────────
        if self.path.startswith("/api/library"):
            def _list_audio(path):
                try:
                    return sorted(
                        f for f in os.listdir(path)
                        if os.path.isfile(os.path.join(path, f))
                        and os.path.splitext(f)[1].lower() in AUDIO_EXTS
                    )
                except Exception:
                    return []
            downloads_files = _list_audio(LIBRARY_PATH)
            music_lib_files = _list_audio(MUSIC_LIBRARY_DIR)
            in_audio = _list_audio(os.path.join(ROOT, "audio"))
            # Union: music-library tracks first, then anything in Downloads
            # that isn't already there.
            seen = set(music_lib_files)
            combined = list(music_lib_files) + [f for f in downloads_files if f not in seen]
            # Trigger any uncached pre-decoding in the background — picker
            # calls /api/library on every open and after every track switch.
            _scan_and_queue_all()
            cached = []
            try:
                cached = [
                    f[:-5] for f in os.listdir(PEAKS_CACHE_DIR)
                    if f.endswith('.json')
                ]
            except FileNotFoundError:
                pass
            body = json.dumps({
                "library": combined,
                "downloads": downloads_files,
                "music_library": music_lib_files,
                "library_path": LIBRARY_PATH,
                "music_library_path": MUSIC_LIBRARY_DIR,
                "in_project_audio": in_audio,
                "peaks_cached": cached,
            }).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # Strip any incoming ?t=... so file lookup works
        path = self.path.split("?", 1)[0]
        fs_path = self.translate_path(path)

        # Audio files: serve with HTTP Range support so the <audio> element
        # can seek into un-buffered regions. Python's SimpleHTTPRequestHandler
        # ignores Range, returning 200 + full file, which breaks seeking on
        # large MP3s — the browser will snap currentTime back to 0.
        if os.path.isfile(fs_path) and os.path.splitext(fs_path)[1].lower() in AUDIO_EXTS:
            return self._serve_with_range(fs_path)

        # Only rewrite HTML; everything else falls through to default handling
        if fs_path.endswith(".html") and os.path.isfile(fs_path):
            try:
                with open(fs_path, "rb") as f:
                    body = f.read()
            except OSError:
                return super().do_GET()

            ts = str(int(time.time() * 1000)).encode()
            def inject(m):
                return m.group(1) + m.group(2) + b"?t=" + ts + m.group(4)
            body = SCRIPT_RE.sub(inject, body)

            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        # For non-HTML requests, also strip the ?t=... we injected
        if "?" in self.path and any(self.path.split("?")[0].endswith(ext) for ext in (".jsx", ".css", ".js")):
            self.path = self.path.split("?", 1)[0]
        return super().do_GET()

    def _serve_with_range(self, fs_path):
        """Stream a file with HTTP Range support (206 Partial Content).

        The browser's <audio> element sends a Range header when seeking into
        a region that isn't buffered. Without 206 responses, the seek fails
        and currentTime snaps back to 0.
        """
        try:
            size = os.path.getsize(fs_path)
        except OSError:
            self.send_error(404); return
        ctype = mimetypes.guess_type(fs_path)[0] or "application/octet-stream"

        range_header = self.headers.get("Range")
        if not range_header:
            # No range: send full file with Accept-Ranges so the browser
            # knows it can re-request with a Range header later.
            try:
                with open(fs_path, "rb") as f:
                    data = f.read()
            except OSError:
                self.send_error(500); return
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self.send_header("Content-Length", str(size))
            self.send_header("Accept-Ranges", "bytes")
            self.end_headers()
            self.wfile.write(data)
            return

        # Parse "bytes=START-END" or "bytes=START-"
        start, end = 0, size - 1
        try:
            units, range_spec = range_header.split("=", 1)
            if units.strip().lower() != "bytes":
                self.send_error(416); return
            start_str, end_str = range_spec.split("-", 1)
            if start_str.strip():
                start = int(start_str)
            if end_str.strip():
                end = int(end_str)
            if start < 0 or start >= size or end < start:
                self.send_error(416); return
            end = min(end, size - 1)
        except Exception:
            self.send_error(416); return

        length = end - start + 1
        try:
            with open(fs_path, "rb") as f:
                f.seek(start)
                data = f.read(length)
        except OSError:
            self.send_error(500); return

        self.send_response(206)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(length))
        self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
        self.send_header("Accept-Ranges", "bytes")
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        # ── /api/use-library-track ────────────────────────────────────────
        # Copies a file from library sources into the project's audio/ folder.
        # Tries music-library/ first, then ~/Downloads.
        if self.path.startswith("/api/use-library-track"):
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = json.loads(self.rfile.read(length).decode())
            except Exception:
                self.send_error(400, "bad json"); return
            name = _safe_audio_name(body.get("name"))
            if not name:
                self.send_error(400, "invalid name"); return
            src = None
            for base in (MUSIC_LIBRARY_DIR, LIBRARY_PATH):
                cand = os.path.join(base, name)
                if os.path.isfile(cand):
                    src = cand; break
            if not src:
                self.send_error(404, "not in library"); return
            audio_dir = os.path.join(ROOT, "audio")
            os.makedirs(audio_dir, exist_ok=True)
            dst = os.path.join(audio_dir, name)
            copied = False
            if not os.path.isfile(dst):
                shutil.copy2(src, dst)
                copied = True
            # Make sure peaks are cached too (no-op if already)
            _queue_decode(dst, name)
            resp = json.dumps({
                "ok": True,
                "path": "audio/" + name,
                "copied": copied,
            }).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        # ── /api/save-peaks ────────────────────────────────────────────────
        # Fallback path: when the browser had to decode peaks itself (cache
        # miss), it sends them here so the next session is instant.
        # Body: {"name": "X.mp3", "peaks": [...], "duration": N}
        if self.path.startswith("/api/save-peaks"):
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = json.loads(self.rfile.read(length).decode())
            except Exception:
                self.send_error(400, "bad json"); return
            name = _safe_audio_name(body.get("name"))
            peaks = body.get("peaks")
            duration = body.get("duration")
            if not name or not isinstance(peaks, list) or not isinstance(duration, (int, float)):
                self.send_error(400, "invalid payload"); return
            try:
                _save_peaks(name, {"peaks": peaks, "duration": float(duration)})
            except Exception as e:
                self.send_error(500, f"save failed: {e}"); return
            resp = json.dumps({"ok": True}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(resp)))
            self.end_headers()
            self.wfile.write(resp)
            return

        self.send_error(404, "no such endpoint")


if __name__ == "__main__":
    os.chdir(ROOT)
    os.makedirs(MUSIC_LIBRARY_DIR, exist_ok=True)
    os.makedirs(PEAKS_CACHE_DIR, exist_ok=True)
    # Queue background pre-decoding of all known audio sources
    _scan_and_queue_all()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", PORT), NoCacheHandler) as httpd:
        print(f"Serving {ROOT}")
        print(f"  -> http://127.0.0.1:{PORT}  (no-cache + HTML rewrite + Range)")
        print(f"  Downloads library: {LIBRARY_PATH}")
        print(f"  Music library:     {MUSIC_LIBRARY_DIR}")
        print(f"  Peaks cache:       {PEAKS_CACHE_DIR}")
        sys.stdout.flush()
        httpd.serve_forever()
