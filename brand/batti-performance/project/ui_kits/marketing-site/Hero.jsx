// Batti-Performance kit — Hero
function Hero({ onApply }) {
  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        <Photo label="Hero — athlete sprint / training action" icon="sprint" />
      </div>
      <div className="hero-scrim"></div>
      <div className="bp-container hero-inner">
        <h1>
          Breakaway speed<br />
          Unstoppable agility<br />
          Character <span className="accent">beyond sport</span>
        </h1>
        <p className="hero-guar">
          We <b>GUARANTEE</b> your child gains <b>3″</b> on their vertical and <b>1&nbsp;mph</b> in
          their speed in just <b>30 sessions</b> — or we train them for <b>FREE</b>.
        </p>
        <Btn variant="primary" lg icon="arrow_forward" onClick={onApply}>Claim your athlete analysis</Btn>
      </div>
      <div className="scroll-hint">
        <span>Scroll</span>
        <Icon name="expand_more" />
      </div>
    </section>
  );
}
Object.assign(window, { Hero });
