# AA Creative Playbook
*What copy goes where on a creative — per funnel beat. The author's reference for templates + the rulebook the engine validates against. Validated against 13 statics + 2 videos in the playbook spike (see `docs/creative-playbook-research.md` for the full research + sources).*

## The 5 laws (non-negotiable)
1. **Beat picks the roles & how many; the reading sequence picks placement** — *space* for static (top→bottom), *time* for video (0s→end).
2. **Hook first/top · proof in the first half · offer+CTA last/bottom.**
3. **Emotional hook opens, rational proof closes.** (AA is a considered, high-ticket purchase — data matters, but emotion earns the look.)
4. **Captions are structural** (~85% watch muted) · hierarchy lives in **size** (1.5–2× jumps).
5. **Integrity = advantage:** no pro/scholarship dream, no parent guilt, no fake urgency. AA's no-hype, coach-to-parent voice converts *because* of this, not despite it.

## The 13 roles (closed enum)
| Role | Does | Static zone | maxChars (guide) | Treatment notes | AA example |
|---|---|---|---|---|---|
| `eyebrow` | context label, orients (WHO + WHERE) | top kicker | 34 | **White-bg / red-text chip** (a filled pill that hugs the text) — pops over footage, far stronger than thin red mono. Set via `el.chipBg`/`chipPad`/`chipRadius` in `renderTextLayer`. Copy pattern: **`{CITY} SPORTS PARENTS`** (auto-filled from the location tier; state suffix stripped) | "CARMEL SPORTS PARENTS" |
| `hook` | stops the scroll | top third *or* lower-third-over-gradient (see lone-hook note) | 40–60 | display, large, apex of hierarchy | "Getting faster? Or just more tired?" |
| `claim` | the promise | upper-mid | 40 | display | "Foundational youth program" |
| `mechanism` | *why* it works | mid | 60 | display | "The right reps, measured" |
| `reframe` | the epiphany / remove-blame | mid (centered for D) + anchor | 28 | display or mono anchor | "The last-rep lie" |
| `proof` | credibility | mid-lower | 60 | mono/display | "CSCS · NCAA D1 · 15 yrs" |
| `stat` | a number+outcome | mid-lower | 20 | mono, big numerals; **label needs explicit color** (spike finding) | "+4.2\" vert / −0.4s 40yd" |
| `testimonial` | someone like me | mid-lower | 120 | display, quoted | "My kid gained 4 inches…" |
| `byline` | attribution | near testimonial | 40 | mono, subdued | "Sarah M. · parent · U14" |
| `offer` | the next step's value | bottom | 40 | display | "Free assessment" |
| `guarantee` | risk reversal (**verbatim-locked**) | bottom / eyebrow | — | display/mono | `+1 mph speed. +3" vertical. 90 days. Or your training is on us.` |
| `cta` | the action | bottom (often in a red bar) | 24 | display | "Book your free assessment" |
| `brand` | lockup / identity | bottom or lockup | 24 | display/mono | "ATHLETES ACCELERATION" |

Notes: 13 is the *dictionary*; a typical frame uses 3–5. `mechanism` has no current copy — reserved. `guarantee` is verbatim-locked everywhere: **`+1 mph speed. +3" vertical. 90 days. Or your training is on us.`**

## How many roles? (decided by beat + stage, not taste)
**1** = beat A pure scroll-stop (TOF). **2** = branded awareness (A/B) or a simple offer (F). **3** = consideration that must teach + prove (C/D/E). **4+** = rare. Model it as **1 dominant + up to ~2 supporting** (hierarchy keeps one message on top).

## When to use which — the selection rule (just-the-hook vs all-6)
**Two different "how many" questions:** *within ONE creative* = how many roles (driven by beat + temperature); *across a CAMPAIGN* = how many creatives & which beats.

**Governing rule: one ad = one message.**
- **A static carries ONE dominant beat (1–3 roles).** It never runs all 6.
- **Only a VIDEO carries the full A→F arc** (time sequences beats). *Validated: the 30s full-arc vertical video works — each beat a full-frame caption with a beat ticker + progress bar.*
- **A carousel is the third axis** — paginated; one beat per card, so it CAN run A→F across cards (validated with a 3-card A→E→F set).

**Pick by audience temperature:**
| Temperature | Beat(s) | Roles | # | Format | CTA |
|---|---|---|---|---|---|
| **COLD** (TOF, doesn't know you) | A (–B) | `hook` (+`brand`) | 1–2 | static / 3s video | low or none |
| **WARM** (MOF, knows the problem) | C · D · E | reframe/mechanism + proof/stat/testimonial | 2–3 | **video shines** | medium |
| **HOT** (BOF, retarget) | F | offer+guarantee+cta | 2–3 | static / short video | direct |
| **FULL ARC** | A→F | all, sequenced over time | 6 | **30s+ video OR carousel** | direct |

**Campaign coverage:** spread beats A–F across the *asset mix*, not inside one asset. Rough lead-gen budget: **~70% warm proof/offer · ~20% hot retarget · ~10% cold hook tests.** Each plan asset carries one `beat` (or `beat:null` for brand bumpers) — the plan IS the coverage map.

## Three rules the engine now enforces (learned the hard way)
1. **Variety — distinct skeleton per asset within a beat.** Never reuse a template beyond `knobs.repetitionCap` (3), and A2≠A3≠A4, D1≠D2≠D3, F1≠F3. Two assets that share a skeleton AND look alike is the failure to avoid. Prefer the clean AA-native bank: statics `cluster-30` (giant-stat) · `cluster-31` (credential/quote) · `cluster-32` (offer+guarantee+cta) · `cluster-33` (hook-over-footage) · `cluster-34` (phrase-kill) · `cluster-35` (split red/black) · `cluster-36` (centered reframe) · `cluster-37` (mechanism velocity-chart); motion `velocity-drop` (mechanism) · `season-clock` (retarget offer) + `stat-reveal`/`meet-coach`/`logo-sting`. Legacy `cluster-1..22` only render correctly once the brand-kit sync fills their `logo`/`city`/`brand_name`.
2. **Stands alone — who it's for + what it's about, without the body copy.** Every non-`null`-beat asset gets a locale **eyebrow** anchor rendered as a **white chip** (`CARMEL SPORTS PARENTS` — `{CITY} SPORTS PARENTS`, built by `buildEyebrowAnchor` in `roles.mjs`, state suffix stripped), auto-injected from the location/campaign data tiers (set `angle.location`; leave the eyebrow unset). The hook is a **complete thought**, never a bare IP fragment ("THE LAST REP LIE" is a tag, not a hook).
3. **Brand identity syncs from the kit, not the template.** `logo`, `brand_name`, `city` come from the data tiers via the cascade (statics + motion). Never hand-paste a city or trust a template's placeholder; unfilled content slots are blanked, not bled.

## Beat recipe cards
Each: **roles (req / opt) · count · static zone · video time · hook/angle · objection.**

- **A — Stop-the-scroll** · `hook` (req) + `eyebrow`/`brand` (opt) · 1–2 · static: hook (see placement note) + hero photo · video **0–3s** · question / pain / pattern-interrupt · just earn the look.
- **B — Name-the-moment** · `hook`/`claim` + `reframe` · 2 · hook top, reframe upper-mid · **3–7s** · the recognizable struggle · "is this for us?".
- **C — Reveal-mechanism** · `mechanism`/`reframe` (+`stat`) · 1–2 · mid · **7–12s** · "not more reps — the right ones, measured" · "what makes you different?".
- **D — Remove-blame** ★ · `reframe` (req) (+`testimonial`) · 1–2 · **centered** epiphany + microscript anchor · **7–12s** · "your athlete isn't the problem; the plan was" · guilt→relief (Feel-Felt-Found).
- **E — Prove-it** · `proof`+`stat`+`testimonial` (+`byline`) · 2–3 · mid-lower (first half) · **10–22s** · "+4.2\" vert, −0.4s 40yd, 90 days" · "will it work / my kid's different?".
- **F — Offer** · `offer`+`guarantee`+`cta` (+`eyebrow`,`brand`) · 2–3 · bottom band; guarantee may seed top eyebrow · **last 3–5s** · free assessment + guarantee · price/commitment.

## Layout maps
**Static (vertical 9:16, inside safe zone):** top 14% & bottom ~20–35% & sides 6% are UI-unsafe. `eyebrow` (top kicker) → **`hook`** → `claim`/`reframe` (upper-mid) → `proof`/`stat`/`testimonial` (mid-lower, first half) → `offer`/`guarantee`/`cta`/`brand` (bottom, above UI band). Eye-flow = Z.

**Lone-hook placement (spike finding):** a single cold hook in the *top third* over a photo can look floaty. Prefer **anchoring the lone hook in the lower third over the dark protection gradient** (classic Reels look), with the athlete filling the frame above — unless the photo's negative space is genuinely in the top third. Standardize per template.

**Video (30s):** A 0–3 · B/C/D 3–10 · E 10–22 · F 22–27 · cta+brand 27–30. Reset visual every 3–5s. Captions always on. Word budget: 15s≈40 · 30s≈75–85 · 60s≈150–170.

## Hook bank (swap format, hold the trigger)
Question · Tired-of · From→To · Number-mistake · Social-proof-number · Before/After · Pattern-interrupt · Curiosity-gap. *One angle → 20+ hooks.* **Angle = strategic idea = campaign `angle`; hook = the role-slot copy.**

## Motion authoring rules (spike findings — bake into motion templates)
- **Author vertical-native** (1080×1920). Don't drop a square (1:1) template into a 9:16 frame — it top-loads and leaves a void.
- **`useTime()` must be called INSIDE `<Stage>`** — i.e. in a child component, not the component that *hosts* the Stage. Calling it in the host returns t=0 and every time-gated element renders invisibly.
- **Every text style needs an explicit `color`** — unset text defaults to black and disappears on dark backgrounds.
- Captions carry the whole message (muted viewing): big, legible, high-contrast, one idea per scene.

## Edge cases
- **`beat: null`** for brand bumpers / logo stings / transitions (no funnel beat).
- A role can be carried by **media** (a hero photo as the hook), not only text.
- Strong roles play out of position (a powerful `guarantee` can BE the hook). Placement law still holds: whatever carries the hook sits top/first.
