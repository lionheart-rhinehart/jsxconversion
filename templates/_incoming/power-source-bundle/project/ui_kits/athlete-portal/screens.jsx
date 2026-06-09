/* Power Source — Athlete Portal screens. */

const P_LOGO = "../../assets/logo/logo-reversed.png";
const NAV_ITEMS = [
  { id: "dashboard", icon: "layout-dashboard", label: "Dashboard" },
  { id: "program", icon: "list-checks", label: "My Program" },
  { id: "progress", icon: "trending-up", label: "Progress" },
  { id: "schedule", icon: "calendar-days", label: "Schedule" },
  { id: "profile", icon: "user", label: "Profile" },
];

function Sidebar({ view, setView }) {
  return (
    <aside className="ap-side">
      <div className="ap-side__logo"><img src={P_LOGO} alt="Power Source" /></div>
      <nav className="ap-nav">
        {NAV_ITEMS.map((n) => (
          <NavItem key={n.id} icon={n.icon} label={n.label} active={view === n.id} onClick={() => setView(n.id)} />
        ))}
      </nav>
      <div className="ap-side__spacer" />
      <div className="ap-coach">
        <Avatar name="Coach Jim" accent="bolt" />
        <div className="ap-coach__meta"><b>Coach Jim</b><span>Your trainer</span></div>
      </div>
    </aside>
  );
}

function Topbar({ title, onLogout }) {
  return (
    <div className="ap-top">
      <h1 className="ap-top__title">{title}</h1>
      <div className="ap-top__right">
        <span className="ap-streak"><Icon name="flame" /> 14-day streak</span>
        <Avatar name="Jordan Vega" />
        <Button variant="ghost" onClick={onLogout} size="md">Log out</Button>
      </div>
    </div>
  );
}

function SectionLabel({ children }) { return <div className="ap-label">{children}</div>; }

function DashboardView() {
  return (
    <div className="ap-content">
      <div>
        <SectionLabel>Tuesday · June 9</SectionLabel>
        <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, textTransform: "uppercase", fontSize: 30, color: "var(--text-strong)", lineHeight: .95, letterSpacing: "-.01em" }}>
          Welcome back, <span style={{ color: "var(--bolt-400)" }}>Jordan</span>
        </h2>
      </div>

      <div className="ap-row ap-row--hero">
        <div className="ap-session">
          <span className="ap-session__when">Next Session · Today 4:30 PM</span>
          <div className="ap-session__focus">Speed &amp; Explosiveness</div>
          <dl className="ap-session__meta">
            <div><dt>Coach</dt><dd>Coach Jim</dd></div>
            <div><dt>Block</dt><dd>Week 4 · Lower</dd></div>
            <div><dt>Duration</dt><dd>60 min</dd></div>
          </dl>
          <div className="ap-session__actions">
            <Button variant="bolt">Check In</Button>
            <Button variant="ghost">View Plan</Button>
          </div>
        </div>
        <div className="ap-row" style={{ gridTemplateColumns: "1fr", gap: 18 }}>
          <StatTile accent="electric" eyebrow="Sessions" value="38" caption="this season" />
          <StatTile accent="bolt" eyebrow="Attendance" value="96" unit="%" caption="last 30 days" />
        </div>
      </div>

      <div className="ap-row ap-row--3">
        <div className="ap-card" style={{ gridColumn: "span 2" }}>
          <div className="ap-card__head"><span className="ap-card__title">Performance vs. baseline</span><span className="ap-card__link">View all</span></div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <ProgressBar name="40-yd dash" value={78} label="−0.34s" accent="bolt" />
            <ProgressBar name="Vertical jump" value={64} label="+4.2 in" />
            <ProgressBar name="Back squat" value={88} label="+38%" accent="bolt" />
            <ProgressBar name="Conditioning" value={52} label="+12%" />
          </div>
        </div>
        <div className="ap-note">
          <p className="ap-note__q">"Great work holding form on your last set, Jordan. Drive those knees on sprints this week — you're close to a PR."</p>
          <div className="ap-note__by"><Avatar name="Coach Jim" accent="bolt" /> Coach Jim · 2 days ago</div>
        </div>
      </div>

      <div className="ap-card">
        <div className="ap-card__head"><span className="ap-card__title">This week</span><span className="ap-card__link">Full schedule</span></div>
        <div className="ap-sched">
          {[
            { d: "TUE", n: "9", t: "Speed & Explosiveness", s: "4:30 PM · Coach Jim", b: "bolt" },
            { d: "THU", n: "11", t: "Upper Strength", s: "4:30 PM · Coach Mia", b: "electric" },
            { d: "SAT", n: "13", t: "Team Conditioning", s: "9:00 AM · Group", b: "electric" },
          ].map((r) => (
            <div className="ap-sched__row" key={r.n}>
              <div className="ap-sched__day"><b>{r.n}</b><span>{r.d}</span></div>
              <div className="ap-sched__info"><b>{r.t}</b><span>{r.s}</span></div>
              <Badge variant={r.b === "bolt" ? "bolt" : "steel"}>{r.b === "bolt" ? "Today" : "Booked"}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgramView() {
  const blocks = [
    { title: "Dynamic Warm-up", meta: "8 min · mobility", done: true },
    { title: "Sprint Mechanics", meta: "4 × 20yd · full recovery", done: true },
    { title: "Trap-bar Deadlift", meta: "5 × 3 @ RPE 7", done: false },
    { title: "Box Jumps", meta: "4 × 4 · reset each rep", done: false },
    { title: "Sled Pushes", meta: "6 × 15yd", done: false },
    { title: "Core Finisher", meta: "3 rounds", done: false },
  ];
  return (
    <div className="ap-content">
      <div className="ap-card">
        <div className="ap-card__head">
          <span className="ap-card__title">Week 4 · Lower Power</span>
          <Badge variant="electric" dot>In progress</Badge>
        </div>
        <ProgressBar name="Today's plan" value={2} max={6} label="2 / 6 done" />
        <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
          {blocks.map((b, i) => (
            <div key={i} className="ap-sched__row" style={{ alignItems: "center" }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", flex: "none", display: "grid", placeItems: "center",
                background: b.done ? "var(--success)" : "transparent", border: b.done ? "0" : "2px solid var(--border-strong)", color: "#fff" }}>
                {b.done && <Icon name="check" />}
              </div>
              <div className="ap-sched__info"><b style={{ color: b.done ? "var(--text-muted)" : "var(--text-strong)", textDecoration: b.done ? "line-through" : "none" }}>{b.title}</b><span>{b.meta}</span></div>
              {!b.done && <Button variant="ghost" size="md">Log</Button>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProgressView() {
  return (
    <div className="ap-content">
      <div className="ap-row ap-row--4">
        <StatTile accent="bolt" eyebrow="40-yd dash" value="5.21" unit="s" caption="▼ from 5.55" />
        <StatTile accent="electric" eyebrow="Vertical" value="26.4" unit="in" caption="▲ from 22.2" />
        <StatTile accent="bolt" eyebrow="Back squat" value="245" unit="lb" caption="▲ from 178" />
        <StatTile accent="electric" eyebrow="Broad jump" value="8'2" caption="▲ from 7'5" />
      </div>
      <div className="ap-card">
        <div className="ap-card__head"><span className="ap-card__title">Season trend</span><span className="ap-card__link">Export</span></div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, padding: "8px 0" }}>
          {[40, 52, 48, 63, 60, 72, 78, 75, 84, 88, 92].map((h, i) => (
            <div key={i} style={{ flex: 1, height: h + "%", borderRadius: "4px 4px 0 0",
              background: i === 10 ? "var(--bolt-400)" : "var(--electric-500)", opacity: i === 10 ? 1 : .55 + i * .03 }} />
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", letterSpacing: ".04em" }}>Composite performance index · last 11 sessions</div>
      </div>
    </div>
  );
}

function Login({ onAuth }) {
  const [tab, setTab] = React.useState("login");
  React.useEffect(() => { if (window.lucide) window.lucide.createIcons(); });
  return (
    <div className="ap-login">
      <div className="ap-login__card">
        <img className="ap-login__logo" src={P_LOGO} alt="Power Source" />
        <div className="ap-pill-tabs">
          <button className={tab === "login" ? "is-active" : ""} onClick={() => setTab("login")}>Member Login</button>
          <button className={tab === "join" ? "is-active" : ""} onClick={() => setTab("join")}>New Athlete</button>
        </div>
        <h2 className="ap-login__title">{tab === "login" ? "Welcome back" : "Join the team"}</h2>
        <p className="ap-login__sub">{tab === "login" ? "Log in to see today's plan and your progress." : "Create your athlete profile to get started."}</p>
        <form className="ap-login__form" onSubmit={(e) => { e.preventDefault(); onAuth(); }}>
          {tab === "join" && <Input label="Athlete name" required placeholder="First & last" />}
          <Input label="Email" required type="email" placeholder="you@email.com" defaultValue="jordan@email.com" />
          <Input label="Password" required type="password" placeholder="••••••••" defaultValue="powersource" />
          <div className="ap-login__row"><span /><a href="#">Forgot password?</a></div>
          <Button variant="bolt" fullWidth type="submit">{tab === "login" ? "Log In" : "Create Account"}</Button>
        </form>
      </div>
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, DashboardView, ProgramView, ProgressView, Login, NAV_ITEMS });
