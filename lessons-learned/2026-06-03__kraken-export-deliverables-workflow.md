# Exporting finished creatives INTO the Kraken Content Library

**Date:** 2026-06-03
**Branch:** claude/kraken-export-angle3

How to push a campaign's rendered creatives into a Kraken Content-Library folder as downloadable
files (did this for all 20 of `multisport-foundations-more-games` → folder "ANGLE 3").

## The tool

`scripts/kraken-export.mjs` — pushes every `status:"rendered"` asset (with an existing `output` file)
to Supabase Storage, registers it via the `ingest-content` edge function, files it in a destination
folder, generates a video poster-frame thumbnail, and writes the new content `{id,url,folder}` back
onto each asset + the campaign manifest. It dedups on the `(campaign, angleId, assetId)` triple, so
re-running won't double-upload.

```
# dry-run first (no writes) — confirms auth, folder resolution, and the asset list
node scripts/kraken-export.mjs <campaign> --workspace <id|name> --folder "<name|UUID>" --dry-run
# then for real
node scripts/kraken-export.mjs <campaign> --workspace <id|name> --folder "<name|UUID>"
```

## Things that tripped me up / worth knowing

- **`--workspace` and `--folder` both accept a raw UUID** (not just a name). A Kraken folder URL is
  `.../w/<workspaceId>/content?folder=<folderId>` — paste those two UUIDs straight in. The tool
  resolves the folder UUID to its name ("ANGLE 3") for you.
- **It only uploads `status:"rendered"` assets with an `output` file.** Anything `planned`/missing is
  skipped (not an error).
- **Credentials** load lazily from the Kraken's `.env.local` (path in
  `.claude/skills/creative-engine/config.json` → `kraken.credentialsEnvPath`); the service-role key is
  masked in logs. If creds aren't wired, the tool errors clearly.
- **It's outward + hard to reverse** (writes to live Supabase). Always `--dry-run` first.
- **Exported MP4s are silent** — audio mux is still deferred in run-campaign.
- **Format for delivery:** if the client asks for "mp4 and png," convert any GIF assets to MP4 first
  (flip `format: "gif"` → `"video"` in the plan and re-render) — the export uploads `asset.output`
  as-is, so a `.gif` asset would land as `image/gif`, not mp4.

Related sessions: the angle-3 build/rebalance, the TrimmedMedia footage fix, the angle-coherence fix,
and the stale-edit-snapshot gotcha (all 2026-06-03).
