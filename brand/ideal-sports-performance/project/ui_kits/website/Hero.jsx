/* global React, Button, Eyebrow */
function Hero({ onNav }) {
  return (
    <section
      style={{
        position: "relative",
        minHeight: 620,
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "var(--ink)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(../../assets/hero-original.webp)",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(95deg, rgba(15,52,84,.92) 0%, rgba(21,72,115,.7) 38%, rgba(28,28,29,.35) 70%, rgba(28,28,29,.1) 100%)",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 28px",
          width: "100%",
        }}
      >
        <Eyebrow light>Premier Performance Training · Fort Worth, TX</Eyebrow>
        <h1
          style={{
            font: "var(--display-1)",
            textTransform: "uppercase",
            letterSpacing: "-.015em",
            color: "#fff",
            margin: "18px 0 0",
            maxWidth: 720,
          }}
        >
          Do you need to increase your{" "}
          <span style={{ color: "var(--isp-blue-300)" }}>velocity?</span>
        </h1>
        <p
          style={{
            font: "var(--lead)",
            color: "rgba(255,255,255,.82)",
            margin: "18px 0 30px",
            maxWidth: 520,
          }}
        >
          Individualized, coach‑led training that builds speed, power and durability — for baseball, every sport, and adults. <strong style={{ color: "#fff" }}>Let ISP help.</strong>
        </p>
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Button size="lg" iconRight="arrow-right" onClick={() => onNav("contact")}>
            Try ISP Free
          </Button>
          <Button size="lg" variant="light" onClick={() => onNav("baseball")}>
            View Programs
          </Button>
        </div>
        <p style={{ font: "var(--caption)", color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: ".1em", marginTop: 22 }}>
          Your first class is always free
        </p>
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
