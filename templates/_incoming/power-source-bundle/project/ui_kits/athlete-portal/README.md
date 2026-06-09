# UI Kit — Power Source Athlete Portal

A member-facing web app for athletes/parents to track training. Dark, dashboard-style surface built on the design-system tokens. This is an **original product surface** that extends the brand into an app context (the live business uses a third-party "Members Only" area; this is a branded reimagining, not a copy of proprietary software).

## Run it
Open `index.html`.
- **Login** screen (Member Login / New Athlete tabs) → any submit logs you in (prefilled demo creds).
- **Sidebar** switches between Dashboard, My Program, Progress, Schedule, Profile.
- **Dashboard** — next-session hero, season stats, performance-vs-baseline bars, coach note, this-week schedule.
- **My Program** — today's training blocks with completion + "Log" actions.
- **Progress** — measured PRs and a season-trend chart.
- **Schedule** — weekly plan. **Profile** — editable athlete details.
- **Log out** returns to the login screen.

## Files
- `index.html` — app shell, login/auth + view-switch state, Schedule/Profile views.
- `portal.jsx` — app-shell CSS + portal widgets (`Sidebar` styles, `NavItem`, `ProgressBar`, session/card/schedule/note styles).
- `screens.jsx` — `Sidebar`, `Topbar`, `DashboardView`, `ProgramView`, `ProgressView`, `Login`.
- Reuses base primitives from `../marketing-site/ui.jsx` (Button, Badge, Avatar, Input, StatTile, Icon).

## Notes
- All athlete data (names, stats, schedule) is **demo content** — wire to real data in production.
- Icons render as React-owned Lucide SVG (the shared `Icon` builds the SVG from Lucide's icon data rather than mutating the DOM, so it's safe inside re-rendering React trees).
- In production, import the real components from the compiled design-system bundle instead of the kit's local primitives.
