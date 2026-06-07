// Phase A — open-design → AA kit adapter. Locks that an imported system produces a
// kit whose tags satisfy the brand-kit contract (all color + font tokens present).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mapTokensToTags } from "../scripts/lib/open-design-import.mjs";
import { COLOR_TOKEN_KEYS } from "../scripts/lib/palette.mjs";
import { FONT_TOKEN_KEYS } from "../scripts/lib/brand-kit.mjs";

const TOKENS = [
  { name: "--bg", value: "#ffffff", type: "color" },
  { name: "--surface", value: "#f5f5f7", type: "color" },
  { name: "--text", value: "#111111", type: "color" },
  { name: "--text-muted", value: "#555555", type: "color" },
  { name: "--accent", value: "#0a84ff", type: "color" },
  { name: "--accent-strong", value: "#0060df", type: "color" },
  { name: "--font-display", value: "'SF Pro Display', sans-serif", type: "fontFamily" },
  { name: "--font-body", value: "'SF Pro Text', system-ui", type: "fontFamily" },
  { name: "--font-mono", value: "'SF Mono', monospace", type: "fontFamily" },
];

test("maps open-design tokens → all required AA color + font tags", () => {
  const tags = mapTokensToTags(TOKENS, { slug: "apple", brandName: "Apple" });
  for (const k of COLOR_TOKEN_KEYS) {
    assert.ok(tags[k], `missing color token: ${k}`);
    assert.match(tags[k], /^#|rgb|hsl/i, `color token ${k} not a color: ${tags[k]}`);
  }
  for (const k of FONT_TOKEN_KEYS) assert.ok(tags[k], `missing font token: ${k}`);
  assert.equal(tags.brand_name, "Apple");
  assert.equal(tags.kitPath, "brand/apple");
  assert.equal(tags.brand_red, "#0a84ff");      // mapped from --accent
  assert.equal(tags.brand_red_deep, "#0060df"); // mapped from --accent-strong
  assert.equal(tags.white, "#ffffff");          // mapped from --bg
});

test("falls back to AA defaults when tokens are sparse (still valid)", () => {
  const tags = mapTokensToTags([{ name: "--accent", value: "#22cc88", type: "color" }], { slug: "x" });
  for (const k of COLOR_TOKEN_KEYS) assert.ok(tags[k], `missing ${k}`);
  for (const k of FONT_TOKEN_KEYS) assert.ok(tags[k], `missing ${k}`);
  assert.equal(tags.brand_red, "#22cc88");
  assert.equal(tags.brand_red_deep, "#22cc88"); // no deep → reuse accent
  assert.equal(tags.white, "#ffffff");          // no bg → default
});
