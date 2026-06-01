#!/usr/bin/env node
// One-time: add `role` to the 5 retrofitted video template *_SPEC fields, by key.
// Idempotent (skips a field that already has a role line). Keys → roles below.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "brand/video-templates/templates";
const FILES = ["stat-reveal.jsx", "quote-card.jsx", "coach-lower-thirds.jsx", "logo-sting.jsx", "meet-coach.jsx"];

const ROLE = {
  eyebrow: "eyebrow", title1: "claim", title2: "claim", ctaText: "cta", ctaMicro: "cta",
  stat1Value: "stat", stat1Unit: "stat", stat1Label: "stat",
  stat2Value: "stat", stat2Unit: "stat", stat2Label: "stat",
  freeLine1: "guarantee", freeLine2: "guarantee",
  quoteText: "testimonial", quote: "testimonial",
  bylineName: "byline", bylineMeta: "byline", coachName: "byline",
  coachFirst: "byline", coachLast: "byline", url: "byline",
  statsLabel: "eyebrow", stats: "stat", facts: "stat",
  coachTitle: "claim", credentials: "proof",
  wordmark1: "brand", wordmark2: "brand", tagline: "claim",
  // duration / media intentionally omitted (slider / image)
};

let total = 0;
for (const f of FILES) {
  const path = join(DIR, f);
  let src = readFileSync(path, "utf8");
  let n = 0;
  src = src.replace(
    /^(\s*)"key": "([A-Za-z0-9_]+)",[ \t]*$(?![\s\S]{0,40}?"role":)/gm,
    (m, indent, key) => {
      if (!ROLE[key]) return m;
      n++;
      return `${m}\n${indent}"role": "${ROLE[key]}",`;
    },
  );
  if (n) { writeFileSync(path, src); total += n; }
  console.log(`${f}: +${n} roles`);
}
console.log(`Annotated ${total} video spec fields.`);
