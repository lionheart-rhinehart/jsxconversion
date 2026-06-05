// Batti-Performance kit — Apply / athlete-analysis funnel modal
function ApplyModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ athlete: "", age: "", sport: "", goal: "", parent: "", email: "", phone: "" });
  const set = (k, v) => setData((d) => ({ ...d, [k]: v }));
  const TOTAL = 3;

  useEffect(() => { if (open) { setStep(0); } }, [open]);

  if (!open) return null;

  const sports = ["Football", "Basketball", "Baseball", "Soccer", "Track", "Volleyball", "Other"];
  const goals = ["Top speed", "Vertical jump", "Agility & cuts", "Strength", "Confidence"];

  const canNext =
    (step === 0 && data.athlete && data.age && data.sport) ||
    (step === 1 && data.goal) ||
    (step === 2 && data.parent && data.email);

  const next = () => { if (step < TOTAL) setStep(step + 1); };

  return (
    <div className={"modal-bg" + (open ? " open" : "")} onClick={(e) => { if (e.target.classList.contains("modal-bg")) onClose(); }}>
      <div className="modal">
        {step < TOTAL ? (
          <>
            <div className="modal-head">
              <div>
                <Eyebrow>Free athlete analysis</Eyebrow>
                <h3>{["Tell us about your athlete", "What's the goal?", "Where do we send the plan?"][step]}</h3>
              </div>
              <button onClick={onClose} aria-label="Close"><Icon name="close" style={{ fontSize: 26 }} /></button>
            </div>
            <div className="modal-body">
              <div className="steps-dots">
                {[0, 1, 2].map((i) => <i key={i} className={i <= step ? "on" : ""} />)}
              </div>

              {step === 0 && (
                <>
                  <div className="field">
                    <label>Athlete's name</label>
                    <input value={data.athlete} onChange={(e) => set("athlete", e.target.value)} placeholder="First & last" />
                  </div>
                  <div className="field">
                    <label>Age</label>
                    <input value={data.age} onChange={(e) => set("age", e.target.value)} placeholder="e.g. 14" inputMode="numeric" />
                  </div>
                  <div className="field">
                    <label>Primary sport</label>
                    <div className="chip-row">
                      {sports.map((s) => (
                        <button key={s} className={"chip" + (data.sport === s ? " sel" : "")} onClick={() => set("sport", s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <div className="field">
                  <label>Biggest priority right now</label>
                  <div className="chip-row">
                    {goals.map((g) => (
                      <button key={g} className={"chip" + (data.goal === g ? " sel" : "")} onClick={() => set("goal", g)}>{g}</button>
                    ))}
                  </div>
                  <p style={{ color: "var(--fg-muted-dark)", fontSize: 14, marginTop: 18, marginBottom: 0 }}>
                    We'll baseline {data.athlete ? data.athlete.split(" ")[0] : "your athlete"}'s 10/20/40 speed, vertical, and mobility on day one — no guessing, just data.
                  </p>
                </div>
              )}

              {step === 2 && (
                <>
                  <div className="field">
                    <label>Parent / guardian name</label>
                    <input value={data.parent} onChange={(e) => set("parent", e.target.value)} placeholder="Your name" />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@email.com" type="email" />
                  </div>
                  <div className="field">
                    <label>Phone (optional)</label>
                    <input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(___) ___-____" inputMode="tel" />
                  </div>
                </>
              )}

              <div className="modal-foot">
                <button className="back" onClick={() => (step === 0 ? onClose() : setStep(step - 1))}>
                  {step === 0 ? "Cancel" : "← Back"}
                </button>
                <Btn variant="primary" icon={step === 2 ? "check" : "arrow_forward"} onClick={() => canNext && next()}>
                  {step === 2 ? "Claim my analysis" : "Continue"}
                </Btn>
              </div>
            </div>
          </>
        ) : (
          <div className="modal-body">
            <div className="success">
              <Icon name="verified" />
              <h3>You're in.</h3>
              <p>
                Thanks{data.parent ? `, ${data.parent.split(" ")[0]}` : ""}. A Batti-Performance coach will reach out
                within 24 hours to schedule {data.athlete ? data.athlete.split(" ")[0] : "your athlete"}'s free
                assessment. Day one, we baseline the numbers.
              </p>
              <div style={{ marginTop: 24 }}>
                <Btn variant="primary" onClick={onClose}>Done</Btn>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { ApplyModal });
