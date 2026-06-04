# Social Ad Templates — UI Kit

Instagram-ready ad templates in the Jarosh Performance system, laid out on a pan/zoom **design canvas** so you can compare formats side by side. Open `index.html`.

> ⚠️ Copy/metrics are reconstructions in the brand voice. Photo areas are **placeholder slots** (orange registration corners + calibration grid) — drop Jarosh's own athlete photos in. Logo is a placeholder mark.

## Formats & templates

| Format | Size | Templates |
|---|---|---|
| **Square** | 1080×1080 | **Stat drop** (big mono metric on dark grid), **Athlete spotlight** (photo + gain badge), **Testimonial** (light, quote + stars) |
| **Portrait** | 1080×1350 | **SUPERCHARGED clinic** (program announcement + CTA), **Four pillars** (Speed/Agility/Strength/Power list) |
| **Story** | 1080×1920 | **PR alert** (gym record / new PR, photo + gain badge) |

## System rules used

- **Bracket-tag eyebrow** with optional live pulse: `[ MEASURED PROGRESS ]`.
- **Metric-first**: the number is the hero. Mono, tabular, muted unit.
- **Gain-green** only on improvement badges (`+4″ vertical`).
- **Calibration grid** on dark; lighter grid on the white testimonial.
- **Lockup + @handle** anchored top/bottom; `#notjustaspeedprogram` as the recurring sign-off.
- Dark templates carry the red radial glow; light templates stay clean.

## Reuse / export

- Each template is a self-contained component in `index.html` sized to its artboard. Duplicate an artboard, swap the metric/headline, done.
- To export a flat PNG for posting: open an artboard in the canvas focus view and screenshot, or render the component at its native px size.
- Swap each `.ad-photo` slot for a real `<img style="object-fit:cover">` when photography lands.
