/* global React, Button, Eyebrow, Icon */
const ISP_PROGRAMS = [
  {
    id: "baseball",
    kicker: "Baseball\nPerformance",
    tag: "Velocity",
    icon: "target",
    photo: true,
    body:
      "The Baseball Performance Plan takes our training a step further — individualized monthly throwing plans built around velocity development and mechanical adjustments. We identify key weaknesses in movement patterns and build a plan to attack them, enhancing performance while reducing injury risk.",
  },
  {
    id: "sports",
    kicker: "Sports\nPerformance",
    tag: "All Sports",
    icon: "zap",
    photo: false,
    body:
      "We develop athletes of every sport to maximize their potential on and off the field: movement training, injury reduction & rehab, linear and lateral speed, foot speed and agility, explosive power, functional strength, and nutritional counseling.",
  },
  {
    id: "adult",
    kicker: "Adult\nTraining",
    tag: "Fitness",
    icon: "dumbbell",
    photo: false,
    body:
      "The same coached progression, built for adults. Proper functional strength, mobility and conditioning programmed to your goals — guided by our staff every session, whatever your starting point.",
  },
];

function ProgramCard({ p, onNav }) {
  const [hover, setHover] = React.useState(false);
  return (
    <article
      id={p.id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "#fff",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-md)",
        transform: hover ? "translateY(-4px)" : "none",
        transition: "all var(--dur) var(--ease)",
        display: "flex",
        flexDirection: "column",
        scrollMarginTop: 90,
      }}
    >
      <div
        style={{
          height: 190,
          position: "relative",
          backgroundImage: p.photo ? "url(../../assets/hero-original.webp)" : "none",
          background: p.photo ? undefined : "linear-gradient(140deg, var(--isp-blue), var(--isp-blue-900))",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(28,28,29,0) 35%, rgba(28,28,29,.62))" }} />
        <div style={{ position: "absolute", top: 16, left: 16, background: p.photo ? "var(--isp-blue)" : "var(--ink)", color: "#fff", borderRadius: 999, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6, font: "var(--caption)", textTransform: "uppercase", letterSpacing: ".06em", zIndex: 2 }}>
          <Icon name={p.icon} size={15} /> {p.tag}
        </div>
        <h3 style={{ position: "absolute", left: 20, bottom: 16, zIndex: 2, color: "#fff", font: "var(--h2)", textTransform: "uppercase", whiteSpace: "pre-line", lineHeight: ".92", margin: 0 }}>
          {p.kicker}
        </h3>
      </div>
      <div style={{ padding: "22px 22px 24px", display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ font: "var(--body-sm)", color: "var(--fg-muted)", margin: "0 0 20px", flex: 1 }}>{p.body}</p>
        <Button variant="ghost" size="sm" iconRight="arrow-right" onClick={() => onNav("contact")} style={{ alignSelf: "flex-start" }}>
          Learn More
        </Button>
      </div>
    </article>
  );
}

function Programs({ onNav }) {
  return (
    <section style={{ background: "var(--bg)", padding: "var(--space-9) 28px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-7)" }}>
          <Eyebrow style={{ justifyContent: "center" }}>Our Programs</Eyebrow>
          <h2 style={{ font: "var(--h1)", textTransform: "uppercase", letterSpacing: "-.01em", margin: "12px 0 0" }}>
            Train with a <span style={{ color: "var(--isp-blue)" }}>plan</span>
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
          {ISP_PROGRAMS.map((p) => (
            <ProgramCard key={p.id} p={p} onNav={onNav} />
          ))}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { Programs, ISP_PROGRAMS });
