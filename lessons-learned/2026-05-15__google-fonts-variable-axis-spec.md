# Google Fonts: preserve the axis spec or you get the wrong cut

**Date:** 2026-05-15
**Branch:** claude/competent-lewin-48c6f8
**Commit:** 792225f

## What happened

When rendering testimonial-summer variation-c, the word "confidence" overflowed past the 1080px frame at `fontSize: 220px`. The renderer claimed Fraunces was loaded — but the rendered font was visibly wider than the Claude Design preview.

## Root cause

Fraunces is a **variable font** with an `opsz` (optical size) axis from 9 to 144. The Claude Design preview's HTML `<link>` requests it with the axis range intact:

```
Fraunces:ital,opsz,wght@0,9..144,400..800;1,9..144,400..800
```

At `fontSize: 220px`, the browser auto-applies `font-optical-sizing: auto` and picks `opsz≈144` (narrow display cut). That's what fits.

The renderer's `fontFamilyInGoogleFontsUrl` helper stripped the axis spec entirely (`Fraunces:...` → `Fraunces`), then asked Google Fonts for static instances with a hardcoded weight matrix (`ital,wght@0,400;...`). Google served 6 static woff2s frozen at the wide text-grade `opsz` — much wider than the variable-font at opsz=144. The text overflowed.

Same problem hit Caveat: the design ships only weights 500 and 700, but our broad request `ital,wght@0,400;...0,700` got a 400 because 400 is the only one Caveat doesn't have a italic for, causing the fallback to plain (returns weight 400 only). The 700 headlines were being browser-faked from regular.

## The fix

`familiesInGoogleFontsUrl` now returns `{ family, axisSpec }` pairs. `fetchGoogleFontsCss(family, axisSpec)` uses the axis spec verbatim when present, falling back to the broad default only when the shipped HTML has no spec. The variable woff2s with `font-weight: 400 800` ranges now get downloaded, and `font-optical-sizing: auto` works as designed.

## How to recognize this in future

- If a rendered design "looks close but not pixel-perfect" against its Claude Design preview, suspect font axes first.
- Confirm by checking the cached `font.css`: if you see static `font-weight: 400` declarations where the shipped HTML link asked for a range (e.g. `400..800`), you're serving the wrong cut.
- Variable fonts on Google Fonts use `..` syntax in their axis specs. Static instance requests use `;` separators.

## References

- Fix commit: 893c7b5
- Affected file: `.claude/skills/jsx-to-mp4/scripts/fonts.mjs:183` (`fetchGoogleFontsCss`)
- Affected file: `.claude/skills/jsx-to-mp4/scripts/fonts.mjs:102` (`familiesInGoogleFontsUrl`)
