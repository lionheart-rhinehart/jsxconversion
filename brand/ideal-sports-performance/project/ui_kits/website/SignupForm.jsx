/* global React, Button, Eyebrow, Icon */
const { useState: useStateForm } = React;

function Field({ label, children }) {
  return (
    <label style={{ display: "block", marginBottom: 16 }}>
      <span style={{ display: "block", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--gray-600)", marginBottom: 7 }}>{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  const [focus, setFocus] = useStateForm(false);
  const { as, ...rest } = props;
  const style = {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 14px",
    border: `1.5px solid ${focus ? "var(--isp-blue)" : "var(--border-strong)"}`,
    borderRadius: "var(--radius)",
    font: "var(--body)",
    color: "var(--ink)",
    background: "#fff",
    boxShadow: focus ? "var(--focus-ring)" : "none",
    outline: "none",
    transition: "all var(--dur-fast) var(--ease)",
  };
  const Tag = as || "input";
  return <Tag {...rest} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} style={style} />;
}

function SignupForm() {
  const [sent, setSent] = useStateForm(false);
  const [program, setProgram] = useStateForm("Baseball Performance");

  return (
    <section id="contact" style={{ background: "var(--bg)", padding: "var(--space-9) 28px", scrollMarginTop: 80 }}>
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          background: "#fff",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.1fr)",
        }}
        className="isp-signup-grid"
      >
        <div
          style={{
            background: "linear-gradient(160deg, var(--isp-blue), var(--isp-blue-900))",
            color: "#fff",
            padding: "44px 38px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Eyebrow light>First class free</Eyebrow>
          <h2 style={{ font: "var(--h2)", textTransform: "uppercase", color: "#fff", margin: "14px 0 12px", lineHeight: ".95" }}>
            Sign up for a class today
          </h2>
          <p style={{ font: "var(--body)", color: "rgba(255,255,255,.85)", margin: 0 }}>
            Your first class is on us. Drop your info and an ISP team member will reach out to get you scheduled.
          </p>
          <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12 }}>
            {[["map-pin", "3800 Southwest Blvd, Fort Worth, TX 76116"], ["phone", "1 (817) 301‑5644"], ["mail", "[email protected]"]].map(([ic, t]) => (
              <div key={ic} style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(255,255,255,.9)", fontSize: 14 }}>
                <Icon name={ic} size={18} color="var(--isp-blue-300)" /> {t}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "40px 38px" }}>
          {sent ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14, minHeight: 320 }}>
              <span style={{ width: 64, height: 64, borderRadius: 999, background: "var(--isp-blue-tint)", color: "var(--isp-blue)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="check" size={34} />
              </span>
              <h3 style={{ font: "var(--h3)", textTransform: "uppercase", margin: 0 }}>You're in!</h3>
              <p style={{ font: "var(--body)", color: "var(--fg-muted)", margin: 0, maxWidth: 320 }}>
                Thanks — we'll reach out shortly to schedule your free <strong>{program}</strong> class.
              </p>
              <Button variant="ghost" size="sm" onClick={() => setSent(false)}>Submit another</Button>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <Field label="First name"><Input required placeholder="Jordan" /></Field>
                <Field label="Last name"><Input required placeholder="Carter" /></Field>
              </div>
              <Field label="Email"><Input type="email" required placeholder="[email protected]" /></Field>
              <Field label="Phone"><Input type="tel" placeholder="(817) 000‑0000" /></Field>
              <Field label="Program of interest">
                <Input as="select" value={program} onChange={(e) => setProgram(e.target.value)}>
                  <option>Baseball Performance</option>
                  <option>Sports Performance</option>
                  <option>Adult Training</option>
                </Input>
              </Field>
              <Button type="submit" iconRight="arrow-right" style={{ width: "100%", justifyContent: "center", marginTop: 6 }}>
                Claim My Free Class
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
Object.assign(window, { SignupForm });
