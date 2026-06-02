// Q&A CARD — 9:16 Reel — talking head Q&A frame (custom layout, no shared element)
function QACardReel({ data = {} }) {
  const t = window.useTime ? window.useTime() : 0;
  const RED = '#c4141d';

  const eyebrow = data.eyebrow ?? 'ASK THE COACH';
  const askedBy = data.askedBy ?? '@DM FROM A PARENT';
  const question = data.question ?? 'WHEN SHOULD MY 12-YEAR-OLD START LIFTING?';
  const answerLabel = data.answerLabel ?? "COACH'S ANSWER:";
  const answerLine1 = data.answerLine1 ?? 'YESTERDAY.';
  const answerLine2 = data.answerLine2 ?? 'WITH PROPER COACHING.';
  const answerNote = data.answerNote ?? 'The risk is bad coaching, not the age. Start now with someone who knows.';
  const coachName = data.coachName ?? 'COACH TORRES';
  const ctaText = data.ctaText ?? 'GOT A QUESTION? DM US.';
  const media = data.media ?? 'assets/photo-coach-action.jpg';

  const eyebrowT = Math.max(0, Math.min(1, (t - 0.2) / 0.4));
  const qLabelT = Math.max(0, Math.min(1, (t - 0.6) / 0.4));
  const qT = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 0.9) / 0.5))) : 1;
  const aLabelT = Math.max(0, Math.min(1, (t - 2.6) / 0.4));
  const a1T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 2.9) / 0.5))) : 1;
  const a2T = window.Easing ? window.Easing.easeOutCubic(Math.max(0, Math.min(1, (t - 3.5) / 0.5))) : 1;
  const noteT = Math.max(0, Math.min(1, (t - 4.4) / 0.5));
  const ctaT = window.Easing ? window.Easing.easeOutBack(Math.max(0, Math.min(1, (t - 5.6) / 0.5))) : 1;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0b0d', overflow: 'hidden' }}>
      {/* Top half: question on dark with eyebrow */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '52%', background: '#15171a', padding: '110px 60px 60px', boxSizing: 'border-box' }}>
        <Eyebrow top={150} fontSize={24}>// {eyebrow}</Eyebrow>
        <div style={{ marginTop: 28, fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: '#969ca7', letterSpacing: '0.12em', opacity: qLabelT }}>{askedBy}</div>
        <div style={{ marginTop: 16, fontFamily: 'Anton, sans-serif', fontSize: 92, color: '#fff', lineHeight: 0.95, opacity: qT, transform: `translateY(${(1 - qT) * 14}px)` }}>"{question}"</div>
      </div>

      <div style={{ position: 'absolute', top: '52%', left: 0, right: 0, height: 6, background: RED, boxShadow: `0 0 24px ${RED}` }}/>

      {/* Bottom half: coach photo + answer */}
      {window.TrimmedMedia && <window.TrimmedMedia src={media} clipStart={data.media_clipStart} clipEnd={data.media_clipEnd} muted={!data.media_audio} style={{ position: 'absolute', top: '52%', left: 0, right: 0, bottom: 0, width: '100%', height: '48%', objectFit: 'cover', filter: 'brightness(0.32) saturate(0.85) contrast(1.1)' }}/>}
      <div style={{ position: 'absolute', top: '52%', left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, rgba(10,11,13,0.5) 0%, rgba(10,11,13,0.95) 100%)' }}/>

      <div style={{ position: 'absolute', top: 'calc(52% + 60px)', left: 60, right: 60 }}>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 22, color: RED, letterSpacing: '0.18em', marginBottom: 14, opacity: aLabelT }}>{answerLabel}</div>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 140, color: '#fff', lineHeight: 0.88 }}>
          <div style={{ opacity: a1T, transform: `translateY(${(1 - a1T) * 16}px)`, color: RED }}>{answerLine1}</div>
          <div style={{ opacity: a2T, transform: `translateY(${(1 - a2T) * 16}px)`, marginTop: 6 }}>{answerLine2}</div>
        </div>
        <div style={{ marginTop: 28, padding: '16px 20px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderLeft: `4px solid ${RED}`, opacity: noteT }}>
          <div style={{ fontFamily: 'Geist, sans-serif', fontSize: 22, color: '#fff', fontWeight: 500, lineHeight: 1.4 }}>{answerNote}</div>
          <div style={{ marginTop: 10, fontFamily: '"JetBrains Mono", monospace', fontSize: 14, color: '#969ca7', letterSpacing: '0.12em' }}>— {coachName}</div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: 90, left: 60, right: 60, padding: '22px 28px', background: RED, display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: ctaT }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 40, color: '#fff' }}>{ctaText}</div>
        <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#fff', letterSpacing: '0.1em' }}>@ATHLETESACCEL</div>
      </div>
    </div>
  );
}
window.QACardReel = QACardReel;
const QA_CARD_SPEC = {
  id: 'qa-card', name: 'Q & A CARD',
  fields: [
  {
    "key": "duration",
    "label": "Length",
    "type": "slider",
    "default": 7,
    "min": 4,
    "max": 15,
    "step": 0.5,
    "unit": "s"
  },
  {
    "key": "eyebrow",
    "label": "Eyebrow",
    "type": "text",
    "default": "ASK THE COACH"
  },
  {
    "key": "askedBy",
    "label": "Asked by",
    "type": "text",
    "default": "@DM FROM A PARENT"
  },
  {
    "key": "question",
    "label": "Question",
    "type": "textarea",
    "default": "WHEN SHOULD MY 12-YEAR-OLD START LIFTING?"
  },
  {
    "key": "answerLabel",
    "label": "Answer label",
    "type": "text",
    "default": "COACH'S ANSWER:"
  },
  {
    "key": "answerLine1",
    "label": "Answer line 1 (red)",
    "type": "text",
    "default": "YESTERDAY."
  },
  {
    "key": "answerLine2",
    "label": "Answer line 2",
    "type": "text",
    "default": "WITH PROPER COACHING."
  },
  {
    "key": "answerNote",
    "label": "Answer note",
    "type": "textarea",
    "default": "The risk is bad coaching, not the age. Start now with someone who knows."
  },
  {
    "key": "coachName",
    "label": "Coach signature",
    "type": "text",
    "default": "COACH TORRES"
  },
  {
    "key": "ctaText",
    "label": "CTA",
    "type": "text",
    "default": "GOT A QUESTION? DM US."
  },
  {
    "key": "media",
    "label": "Coach photo/video",
    "type": "image",
    "default": "assets/photo-coach-action.jpg"
  }
],
};
window.QA_CARD_SPEC = QA_CARD_SPEC;
