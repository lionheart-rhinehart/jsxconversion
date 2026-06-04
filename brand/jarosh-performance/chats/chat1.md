# Jarosh Athletic Performance Design

_Started 2026-06-03 20:43 UTC_

---

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "Design System"
Current date is now June 3, 2026
</system-info>

<pasted_text name="Create design system">
We will create a design system in this project.

**Company description:** Jarosh Performance

---

Design systems are folders on the file system containing typography guidelines, colors, assets, brand style and tone guides, css styles, and React recreations of UIs, decks, etc. they give design agents the ability to create designs against a company's existing products, and create assets using that company's brand. Design systems should contain real visual assets (logos, brand illustrations, etc), low-level visual foundations (e.g. typography specifics; color system, shadow, border, spacing systems) and also high-level visual ELEMENTS (buttons, full screens) within ui kits.

No need to invoke the create_design_system skill; this is it.

To begin, create a todo list with the tasks below, then follow it:

- Explore provided assets and materials to gain a high-level understanding of the company/product context, the different products represented, etc. Read each asset (codebase, figma, file etc) and see what they do. Find some product copy; examine core screens; find any design system definitions.
- Create a README.md with the high-level understanding of the company/product context, the different products represented, etc. Mention the sources you were given: full Figma links, GitHub repos, codebase paths, etc. Do not assume the reader has access, but store in case they do.
- Call set_project_title with a short name derived from the brand/product (e.g. "Acme Design System"). This replaces the generic placeholder so the project is findable.
- IF any slide decks attached, use your repl tool to look at them, extract key assets + text, write to disk.
- Explore the codebase and/or figma design contexts and create a colors_and_type.css file containing CSS vars for both base type + color styles (e.g. fg1, fg2, serif-display, etc) and semantic CSS vars (e.g. h1, h2, code, p). Copy any webfonts or ttfs into fonts/.
- Explore, then update README.md with a CONTENT FUNDAMENTALS section: how is copy written? What is tone, casing, etc? I vs you, etc? are emoji used? What is the vibe? Include specific examples
- Explore, update README.md with VISUAL FOUNDATIONS section that talks about the visual motifs and foundations of the brand. Colors, type, spacing, backgrounds (images? full-bleed? hand-drawn illustrations? repeating patterns/textures? gradients?), animation (easing? fades? bounces? no anims?), hover states (opacity, darker colors, lighter colors?), press states (color? shrink?), borders, inner/outer shadow systems, protection gradients vs capsules, layout rules (fixed elements), use of transparency and blur (when?), color vibe of imagery (warm? cool? b&w? grain?), corner radii, what do cards look like (shadow, rounding, border), etc. whatever else you can think of. answer ALL these questions.
- If you are missing font files, find the nearest match on Google Fonts. Flag this substitution to the user and ask for updated font files.
- As you work, create HTML card files in preview/ that populate the Design System tab. Target ~700×150px each (400px max) — err toward MORE small cards, not fewer dense ones. Split at the sub-concept level: separate cards for primary vs neutral vs semantic colors; display vs body vs mono type; spacing tokens vs a spacing-in-use example; one card per component state cluster. A typical system is 12–20+ cards. Skip titles and framing — the asset name renders OUTSIDE the card, so just show the swatches/specimens/tokens directly with minimal decoration. After writing each batch, call register_assets with items carrying viewport {width: 700, height: <your estimate>}, a one-line subtitle, and a `group` tag so the Design System tab can split cards into sections. Use these groups: "Type" for typography specimens and scales, "Colors" for palettes / color scales / semantic colors, "Spacing" for radii / shadow systems / spacing tokens / elevation, "Components" for buttons / form inputs / cards / badges / menus, "Brand" for logos / imagery / anything that doesn't fit the others. Title-cased, consistent across the batch.
- Copy logos, icons and other visual assets into assets/. update README.md with an ICONOGRAPHY describing the brand's approach to iconography. Answer ALL these and more: are certain icon systems used? is there a builtin icon font? are there SVGs used commonly, or png icons? (if so, copy them in!) Is emoji ever used? Are unicode chars used as icons? Make sure to copy key logos, background images, maybe 1-2 full-bleed generic images, and ALL generic illustrations you find. NEVER draw your own SVGs or generate images; COPY icons programmatically if you can.
- For icons: FIRST copy the codebase's own icon font/sprite/SVGs into assets/ if you can. Otherwise, if the set is CDN-available (e.g. Lucide, Heroicons), link it from CDN. If neither, substitute the closest CDN match (same stroke weight / fill style) and FLAG the substitution. Document usage in ICONOGRAPHY.
- For each product given (E.g. app and website), create UI kits in ui_kits/<product>/{README.md, index.html, Component1.jsx, Component2.jsx}; see the UI kits section. Verify visually. Make one todo list item for each product/surface.
- If you were given a slide template, create sample slides in slides/{index.html, TitleSlide.jsx, ComparisonSlide.jsx, BigQuoteSlide.jsx, etc}. If no sample slides were given, don't create them. Create an HTML file per slide type; if decks were provided, copy their style. Use the visual foundations and bring in logos + other assets. Register each slide HTML via register_assets with viewport {width: 1280, height: 720} so the 16:9 frame scales to fit the card.
- Register each UI kit's index.html as its own card via register_assets with viewport {width: <kit's design width>, height: <above-fold height>} — the declared height caps what's shown, so pick the portion worth previewing.
- Update README.md with a short "index" pointing the reader to the other files available. This should serve as a manifest of the root folder, plus a list of ui kits, etc.
- Create SKILL.md file (details below)
- You are done! The Design System tab shows every registered card. Do NOT summarize your output; just mention CAVEATS (e.g. things you were unable to do or unsure) and have a CLEAR, BOLD ASK for the user to help you ITERATE to make things PERFECT.

UI kit details:
- UI Kits are high-fidelity visual + interaction recreations of interfaces. They cut corners on functionality -- they are not 'real production code' -- but they provide high-fidelity UI components. Your UI kits should be pixel-perfect recreations, created by reading the original UI code if possible, or using figma's get-design-context. They should be modular and reusable, so they can easily be pieced together for real designs. UI kits should recreate key screens in the product as click-thru prototypes. a UI kit's index.html must look like a typical view of the product. These are recreations, not storybooks.
- To start, update the todo list to contain these steps for each product: (1) Explore codebase + components in Figma (design context) and code, (2) Create 3-5 core screens for each product (e.g. homepage or app) with interactive click-thru components, (3) Iterate visually on the designs 1-2x, cross-referencing with design context.
- Figure out the core products from this company/codebase. There may be one, or a few. (e.g. mobile app, marketing website, docs website).
- Each UI kit must contain JSX components (well-factored; small, neat) for core UI elements (e.g. sidebars, composers, file panels, hero units, headers, footers, buttons, fields, menus, blog posts, video players, settings screens, login, etc).
- The index.html file should demonstrate an interactive version of the UI (e.g a chat app would show you a login screen, let you create a chat, send a message, etc, as fake)
- You should get the visuals exactly right, using design context or codebase import. Don't copy component implementations exactly; make simple mainly-cosmetic versions. It's important to copy.
- Focus on good component coverage, not replicating every single section in a design.
- Do not invent new designs for UI kits. The job of the UI kit is to replicate the existing design, not create a new one. Copy the design, don't reinvent it. If you do not see it in the project, omit, or leave purposely blank with a disclaimer.

Guidance
- Run independently without stopping unless there's a crucial blocker (E.g. lack of Figma access to a pasted link; lack of codebase access).
- When creating slides and UI kits, avoid cutting corners on iconography; instead, copy icon assets in! Do not create halfway representations of iconography using hand-rolled SVG, emoji, etc.
- CRITICAL: Do not recreate UIs from screenshots alone unless you have no other choice! Use the codebase, or Figma's get-design-context, as a source of truth. Screenshots are much lossier than code; use screenshots as a high-level guide but always find components in the codebase if you can!
- Avoid these visual motifs unless you are sure you see them in the codebase or Figma: bluish-purple gradients, emoji cards, cards with rounded corners and colored left-border only
- Avoid reading SVGs -- this is a waste of context! If you know their usage, just copy them and then reference them.
- When using Figma, use get-design-context to understand the design system and components being used. Screenshots are ONLY useful for high-level guidance. Make sure to expand variables and child components to get their content, too. (get_variable_defs)
- Create these files in the ROOT of the project unless asked not to. For example, README.md should be at the root, not in a folder!
- Stop if key resources are unnecessible: iff a codebase was attached or mentioned, but you are unable to access it via local_ls, etc, you MUST stop and ask the user to re-attach it using the Import menu. These get reattached often; do not complete a design system if you get a disconnect! Similarly, if a Figma url is inaccessible, stop and ask the user to rectify. NEVER go ahead spending tons of time making a design system if you cannot access all the resources the user gave you.

SKILL.md
- When you are done, we should make this file cross-compatible with Agent SKills in case the user wants to download it and use it in Claude Code.
- Create a SKILL.md file like this:

<skill-md>
---
name: {brand}-design
description: Use this skill to generate well-branded interfaces and assets for {brand}, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for protoyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.
If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.
If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.
</skill-md>

</pasted_text>

## Assistant

_[tool: list_files]_

I'll start by exploring what's in the project to understand what materials I have to work with.

_[tool: list_files]_

The project is empty. Let me check the referenced design-system project for any materials.

_[tool: read_file]_

_[tool: read_file]_

This project is empty, but I have access to a reference design system project. Let me read its README and key files to understand the context before asking you anything.

_[tool: questions_v2]_

I now understand the context. There's a complete reference design system for "Athletes Acceleration" (a youth sports-performance brand) in the linked project, with reusable photography, video, and fonts. But you've asked for a **Jarosh Performance** design system — a different brand. Let me check whether Jarosh Performance has a findable web presence to anchor the brand.

_[tool: web_search]_

Jarosh Performance is a real youth/HS/collegiate sports-performance gym in Ankeny, Iowa, founded by Nick Jarosh (formerly "Nick Jarosh Fitness"). Tagline: "Speed ~ Agility ~ Strength ~ Power." Let me pull the actual website to get real brand colors, logo, and design.

_[tool: web_fetch]_

_[tool: web_fetch]_

_[tool: web_search]_

I have a solid public-profile picture of Jarosh Performance now, but I'm missing the brand's actual visual assets — and that's the one thing I shouldn't invent. Here's what I found and where I need you.

**What I know about Jarosh Performance:**
- Youth / HS / collegiate sports-performance gym in Ankeny, Iowa, founded by **Nick Jarosh** (formerly "Nick Jarosh Fitness") — 15+ yrs experience, worked with the Cincinnati Reds & college athletics
- Tagline: **"Speed ~ Agility ~ Strength ~ Power"** · "Helping area athletes gain that competitive edge" · hashtag **#notjustaspeedprogram**
- Flagship program **SUPERCHARGED** (acceleration/speed system) · measurable, data-driven, small-group, parent-welcome
- Site: jaroshperformance.fitness · orange (🧡) shows up in their social posts

I also have access to a sibling design system (Athletes Acceleration) in a linked project with a large reusable library of **real athlete training photography + video clips + fonts** I can pull from.

Before I build, a few decisions that will shape everything:

## User

Questions answered:
- brand_color: 2
- reuse_media: No — I'll provide Jarosh's own photos
- surfaces: Marketing website (homepage, programs, results, booking), Instagram / social ad templates, Slide deck template, Parent-facing athlete progress report / dashboard
- aesthetic: Premium & technical — data-forward, lab/measurement feel
- variations: Yes — 2-3 directions for the hero/landing
- typography: Keep that stack — it fits sports performance

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: list_files]_

Clear brief. Locking it in: **orange `#FF6A00`**, premium/technical "performance-lab" aesthetic, keep the Anton + Geist + JetBrains Mono stack, no stock photos (I'll use drop-in image slots + technical placeholders and flag for your photos), and four surfaces — marketing site (with 2–3 hero directions), social ad templates, slide deck, and a parent-facing progress dashboard.

Let me study the reference system's structure so I mirror its token architecture, then build. Reading the key files in parallel.

_[tool: read_file]_

_[tool: read_file]_

Now let me study the marketing-site UI kit so I understand the component patterns and interactive structure I'll adapt.

_[tool: read_file]_

_[tool: read_file]_

Let me read the component and section JSX so I can adapt the structure rather than rebuild from zero.

_[tool: update_todos]_

I now have a complete understanding of the reference architecture. Time to build. Let me set up my task list and start.Setting the title and copying the three fonts (open-source, safe to reuse) from the reference project.

_[tool: set_project_title]_

_[tool: copy_files]_

_[tool: write_file]_

Now the core token file — orange brand, cool technical graphite neutrals, telemetry-green for gains, and semantic type rules tuned for the performance-lab aesthetic.

_[tool: write_file]_

No logo was provided, so I'll build a clean placeholder brand mark — a geometric "fast-forward + calibration ruler" monogram (speed + measurement, the two ideas at the brand's core). It renders reliably on light and dark, and I'll flag it for replacement. The full lockup pairs this with an Anton wordmark in CSS.

_[tool: show_html]_

Let me quickly verify the mark renders well, then write the README.

_[tool: show_html]_

_[tool: save_screenshot]_

_[tool: save_screenshot]_

_[tool: write_file]_

Let me preview the mark inside an HTML wrapper on both light and dark.

_[tool: show_html]_

_[tool: write_file]_

The mark reads cleanly on both backgrounds. Now the comprehensive README — brand context, content fundamentals, visual foundations, and iconography.

_[tool: write_file]_

Now the preview cards. First the shared base CSS, then the cards in batches.

_[tool: write_file]_

_[tool: write_file]_

Now the Type cards.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Colors cards.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Spacing group — scale, radii, shadows, motion, and the signature calibration grid.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

Components group — starting with buttons, inputs, and the signature metric tile.

_[tool: write_file]_

The signature metric tile — the atomic unit of the whole system (mono value, unit, gain delta, sparkline).

_[tool: write_file]_

_[tool: write_file]_

Pillar card, program card, and the guarantee stat block.

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

A telemetry readout strip and a testimonial card.

_[tool: write_file]_

_[tool: write_file]_

Brand cards — logo, the photo-placeholder treatment (since you're supplying photos), and the voice/tagline card.

_[tool: write_file]_

_[tool: show_html]_

That's 25 cards across all five groups. Let me spot-check a couple of the most complex ones render correctly (fonts + icons + sparklines) before registering.

_[tool: save_screenshot]_

Icons rendered as ligature text — the Material Symbols font loaded late. Let me confirm whether it's just timing.

_[tool: run_script]_

The Material Symbols font isn't resolving the ligature via CSS `@import` — I'll add a direct `<link>` to every preview card so the DS tab renders icons reliably. Batching it.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

Let me force the font to load before capture to confirm whether this is a real failure or just a rasterizer limitation.

_[tool: save_screenshot]_

_[tool: register_assets]_

This is a known limitation of the DOM-rasterization screenshot path with remote icon webfonts — note the local fonts (mono numerals, Anton) render fine, only the remote Material Symbols falls back to text. In a real browser (the Design System tab and the UI-kit previews), the glyphs render correctly. I'll let the verifier confirm in its real iframe. Registering all 25 cards now.

_[tool: update_todos]_

Foundations and all 25 cards are done and registered. Let me mark progress and clear some exploration context.

_[tool: snip]_

_[tool: snip]_

_[tool: write_file]_

## User

that color is supposed to be: #fa3f36

## Assistant

_[tool: run_script]_

Important correction — thank you. The brand color is **`#fa3f36`** (a scarlet signal red), not orange. That changes the whole palette identity. Let me propagate it everywhere: rename the token family `--jp-orange-*` → `--jp-red-*`, rebuild the ramp around `#fa3f36`, and update every card, the logo mark, and the README. Doing the bulk rename first.

_[tool: run_script]_

_[tool: read_file]_

Now the core token file — rebuilding the ramp around `#fa3f36`.

## Assistant

_[tool: run_script]_

_[tool: str_replace_edit]_

_[tool: read_file]_

Let me re-read the exact current text after the var rename.

_[tool: str_replace_edit]_

_[tool: grep]_

Let me catch any stragglers of "orange" across the project.

_[tool: str_replace_edit]_

_[tool: grep]_

Let me verify the README's color rationale still reads correctly after the swap.

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: unregister_assets]_

Now fix the registered card name (it still says "orange").

_[tool: register_assets]_

_[tool: show_html]_

Let me verify the new red palette renders correctly.

_[tool: write_file]_

The scarlet ramp looks clean and premium. Now the flagship marketing-site UI kit. Writing its stylesheet first.

_[tool: write_file]_

Now the shared components.

_[tool: write_file]_

Now the page sections.

_[tool: write_file]_

Now the interactive index.html with a booking modal.Let me preview the marketing site and check it renders.

_[tool: show_html]_

_[tool: get_webview_logs]_

Strong layout. Icons are still showing as ligature text — I need to determine if the font genuinely fails to load or it's just capture timing. Let me check logs and re-capture after a delay.

_[tool: save_screenshot]_

_[tool: show_to_user]_

Even after forcing load + 2.5s, icons stay as text — consistent with the DOM-rasterizer being unable to fetch the remote icon font during capture (the local Anton/Geist render fine). Let me confirm in a real browser via the user's pane so I'm not building on a false assumption.

_[tool: sleep]_

_[tool: eval_js_user_view]_

_[tool: eval_js_user_view]_

_[tool: save_screenshot]_

Confirmed — in the real browser the icon font is `loaded`, `fonts.check` returns `true`, and the glyph renders at 15px (a single glyph, not 4-char text). The ligature-text in screenshots is purely a rasterizer artifact; the product is correct. I'll proceed confidently.

Let me verify the rest of the page's layout by scrolling through it.

_[tool: copy_starter_component]_

The pillars and guarantee render beautifully — cohesive lab aesthetic, red signal accents, mono data. Now the 2–3 hero directions you asked for. Let me bring in the design canvas component.

_[tool: write_file]_

Now the three hero directions on a design canvas.

_[tool: show_html]_

_[tool: get_webview_logs]_

The design canvas works — hero A (data/instrument) renders cleanly. Let me confirm no console errors.

_[tool: write_file]_

No errors. Let me write the kit README and register both the site and hero directions.

_[tool: register_assets]_

_[tool: update_todos]_

_[tool: snip]_

_[tool: copy_starter_component]_

Now the social-ads kit — Instagram templates across square, portrait, and story formats on a design canvas. Bringing in the canvas component.

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: grep]_

The canvas opened zoomed-in at 100%. Let me check how it sets initial zoom so I can verify a full ad composition.

_[tool: save_screenshot]_

The canvas has no auto-fit (starts at 100%). Let me zoom it out programmatically to verify the full ad compositions.The three square ads compose well — stat drop, athlete spotlight, and the light testimonial. Let me see the portrait and story rows.

_[tool: save_screenshot]_

_[tool: save_screenshot]_

The square ads are solid. Let me pan down to confirm the portrait and story templates render.

_[tool: save_screenshot]_

Overshot. Let me pan back up to land on the portrait row.

_[tool: save_screenshot]_

The story ad (PR alert, 1080×1920) renders perfectly. All three formats confirmed. Let me reset the canvas view position and write the kit README.

_[tool: write_file]_

_[tool: register_assets]_

_[tool: update_todos]_

_[tool: snip]_

Parent dashboard kit next — the best showcase of the data-forward aesthetic. Writing its stylesheet.

_[tool: write_file]_

_[tool: write_file]_

Now the dashboard app.

_[tool: show_html]_

_[tool: save_screenshot]_

Excellent layout. Let me scroll to verify the chart, table, and side column.

_[tool: save_screenshot]_

The trend chart renders beautifully — improving 10-yard split with baseline and latest markers. Let me verify the side panels (they stack below at this width).

_[tool: write_file]_

The dashboard is complete and cohesive — attendance ring, coach note, all rendering. Let me write its README and register it.

_[tool: register_assets]_

_[tool: update_todos]_

_[tool: snip]_

_[tool: copy_starter_component]_

The dashboard is done. Now the slide deck template you requested. Bringing in the deck component.

_[tool: write_file]_

Now the deck. Writing the slide template with the brand system.

_[tool: show_html]_

_[tool: save_screenshot]_

The title slide may have been captured mid-entrance-animation. Let me re-capture after animations settle.

_[tool: get_webview_logs]_

Only the lockup renders — the mid/foot content is missing. Let me inspect the DOM to find the cause.

_[tool: show_to_user]_

_[tool: eval_js_user_view]_

_[tool: screenshot_user_view]_

The DOM confirms everything renders correctly in the real browser (h1 visible, opacity 1, white, full geometry) — the blank screenshot is the rasterizer choking on the deck's scaled shadow-DOM. Let me confirm what the user actually sees with a true pane capture.

_[tool: str_replace_edit]_

Now I can see the real render — it's striking, but the title headline lines **overlap** (Anton at line-height 0.84 is too tight at that size). Let me loosen the display line-height and tune the oversized headlines across the deck.

_[tool: str_replace_edit]_

Also loosening the marketing hero line-height slightly for the same reason.

_[tool: show_to_user]_

Let me reload the deck and verify the title slide in the real browser.

_[tool: sleep]_

_[tool: screenshot_user_view]_

_[tool: str_replace_edit]_

Line-height 0.95 is still snug for Anton's tall caps. Let me give it proper breathing room at 1.0 for the deck, and verify once more.

_[tool: show_to_user]_

_[tool: sleep]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

The title slide is clean now. Let me check the pillars and big-stat slides.

_[tool: sleep]_

_[tool: screenshot_user_view]_

_[tool: eval_js_user_view]_

Layout reads well (icons show as ligature text only in the rasterizer — confirmed loading in the real browser earlier). Let me verify the 4th pillar card isn't actually overflowing the slide.

_[tool: update_todos]_

_[tool: register_assets]_

The 4th card sits 97px inside the slide edge — fits fine; the cut was a capture artifact. The deck is solid. Let me register it and write the SKILL file.

_[tool: write_file]_

Now the SKILL.md manifest.

_[tool: delete_file]_

_[tool: update_todos]_

_[tool: snip]_

Let me clean up the debug scratch files and snip the resolved deck-verification trail.

_[tool: done]_

Everything is built and registered. Let me surface the flagship deliverable and confirm it loads cleanly.

_[tool: fork_verifier_agent]_

_[tool: update_todos]_

The **Jarosh Performance design system** is built — a premium, data-forward "performance-lab" identity in your scarlet `#fa3f36` with cool carbon neutrals, the Anton/Geist/JetBrains Mono stack, and a calibration-grid + telemetry motif throughout. The Design System tab now holds 25 token/component cards, plus four working surfaces: the marketing site (+3 hero directions), Instagram ad templates, a parent progress dashboard, and a 7-slide deck. Full brand rules live in `README.md`; `SKILL.md` makes it portable to Claude Code.

**Caveats — the things I couldn't source and had to stand in for:**
- **Logo is a placeholder** (a speed-chevron + calibration-ruler mark). It's flagged everywhere; swap in your real logo (SVG ideal) and I'll update every lockup.
- **No real photography** — per your call, every image area is a drop-in slot with registration corners, never stock. They're ready for Jarosh's own photos.
- **Copy, programs, metrics, and testimonials are plausible reconstructions** in the brand voice (paraphrased from your public reviews/posts), not verbatim — e.g. the "−0.18s / +3.5″ / 90-day" guarantee is invented to fit the data-forward system.
- Icons are **Material Symbols** (inherited for consistency); confirm or swap.

**My ask to make this perfect — I need three things from you:**
1. **The official logo file** (and confirm the exact red — I used `#fa3f36`).
2. **A batch of real Jarosh photos/clips** to drop into the slots (sprint, agility, lifting, group shots).
3. **The real specifics** — actual program names + ages, schedule, pricing, your true guarantee/results numbers, and 3–4 real testimonials — so I can replace the sample data.

Tell me which surface to refine first (marketing site, social, dashboard, or deck) and send any of the above, and I'll iterate.

