---
title: Supabase Storage serves user HTML as text/plain — iframe src= shows source, not the page
date: 2026-06-10
branch: main
---

# Supabase Storage + self-contained HTML bundles: two gotchas

Discovered building `/design-to-approval` (uploads a self-contained live-HTML proof of a Claude Design to
the Kraken Content Library so a client reviews the *animated design* in the portal — no MP4/PNG render).

## 1. The bucket mime allowlist rejects the charset suffix
Uploading with `Content-Type: text/html; charset=utf-8` to `content-images` failed:
`415 invalid_mime_type — mime type text/html; charset=utf-8 is not supported`.

The bucket allowlist contains the **exact string** `text/html` — and Supabase matches the *whole*
content-type, so the `; charset=utf-8` suffix is a miss. **Fix: upload with the bare `text/html`.**

Also: `content-images` was never meant for HTML. There's a purpose-built **`content-bundles`** bucket
(public) whose allowlist includes `text/html`, `text/css`, `application/javascript`, fonts, etc. — the right
home for self-contained HTML bundles. List buckets + allowlists with
`GET /storage/v1/bucket` (service-role) before guessing.

## 2. Storage serves the stored .html as `text/plain` (security downgrade)
Even after a clean upload as `text/html`, a `HEAD` on the public object returns **`content-type: text/plain`**.
Object stores deliberately refuse to serve user-uploaded HTML as `text/html` on the storage domain (it would
let anyone host active HTML/XSS there). So a naive `<iframe src={storageUrl}>` renders the **HTML source as
text**, not the page.

**Fixes (consumer side):**
- **Proxy route (best):** an app API route fetches the object server-side and re-serves it with
  `content-type: text/html` → `<iframe src="/api/embed/<id>">` works, same-origin, you control CSP.
- **`srcdoc`:** `const html = await fetch(url).then(r => r.text()); iframe.srcdoc = html` — `text/plain` is
  fine to `.text()`, and `srcdoc` + `sandbox="allow-scripts"` runs the inline scripts. Needs CORS on the
  bucket (public Supabase objects send `Access-Control-Allow-Origin: *`).

**How to catch it early:** after upload, `HEAD` the public URL and assert the content-type — don't assume the
upload mime is the serve mime. (Verifying "the bytes are reachable (200)" is NOT enough; check the type.)

See `docs/kraken-embed-approval-handoff.md` for the full contract handed to the Kraken portal chat.
