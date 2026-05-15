// variation-e.jsx — TEXT MESSAGE THREAD
// 30s · A mom texting in real-time over the course of 2 months.
// Phone screenshot framing. iMessage-style bubbles. The testimonial
// unfolds naturally as a conversation. Timestamps fast-forward.

const VE_W = 1080, VE_H = 1920;
const VE_BG = '#000000';
const VE_SCREEN = '#000000';
const VE_BUBBLE_THEM = '#262628';
const VE_BUBBLE_ME = '#d72020'; // brand red instead of iMessage blue
const VE_INK = '#f2f0ed';
const VE_MUTE = '#7c7c80';
const VE_RED = '#d72020';

// Outer "phone" feel — black device border, status bar, header chrome.
function VEPhoneChrome() {
  const t = useTime();
  const inP = clamp(t / 0.6, 0, 1);
  return (
    <>
      {/* Status bar — time updates with the conversation timeline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 60px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontWeight: 600, fontSize: 36, color: VE_INK,
        zIndex: 5,
      }}>
        <div>{veClockTime(t)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* signal */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            {[6, 10, 14, 18].map(h => (
              <div key={h} style={{ width: 5, height: h, background: VE_INK, borderRadius: 1 }}/>
            ))}
          </div>
          {/* wifi */}
          <svg width="30" height="22" viewBox="0 0 30 22" fill="none">
            <path d="M15 5C9 5 4 9 1 14M15 10C11 10 7 13 5 16M15 16a3 3 0 100 6 3 3 0 000-6z" stroke={VE_INK} strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          {/* battery */}
          <div style={{
            width: 56, height: 24, border: `2px solid ${VE_INK}`, borderRadius: 5,
            padding: 2, position: 'relative',
          }}>
            <div style={{ width: '85%', height: '100%', background: VE_INK, borderRadius: 1 }}/>
            <div style={{ position: 'absolute', right: -6, top: 6, width: 4, height: 8, background: VE_INK, borderRadius: 1 }}/>
          </div>
        </div>
      </div>

      {/* Contact header — avatar circle + name + sub */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 100,
        padding: '30px 0 26px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        opacity: inP,
        zIndex: 5,
      }}>
        <div style={{
          width: 110, height: 110, borderRadius: 55,
          background: `linear-gradient(135deg, #d72020, #7a0d0d)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"Fraunces", serif', fontSize: 52, fontWeight: 600,
          color: '#fff', marginBottom: 14,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}>
          M
        </div>
        <div style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: 36, fontWeight: 600, color: VE_INK,
          letterSpacing: '-0.01em',
        }}>
          Coach (AA) ›
        </div>
        <div style={{
          fontFamily: 'system-ui, sans-serif',
          fontSize: 22, color: VE_MUTE, marginTop: 4,
        }}>
          {veSessionTag(t)}
        </div>
      </div>

      {/* Bottom input bar */}
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, height: 160,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '0 40px',
        zIndex: 5,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 28,
          border: '2px solid #4a4a4e', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#888', fontSize: 36,
        }}>+</div>
        <div style={{
          flex: 1, height: 64, borderRadius: 32,
          border: '1.5px solid rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center',
          padding: '0 26px',
          fontFamily: 'system-ui, sans-serif', fontSize: 28,
          color: VE_MUTE,
        }}>
          iMessage
        </div>
        <div style={{
          width: 56, height: 56, borderRadius: 28,
          background: '#262628', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: VE_INK, fontSize: 26,
        }}>🎤</div>
      </div>
    </>
  );
}

// Clock time on the status bar — advances just a few minutes
function veClockTime(t) {
  // Static — single sitting, around 8:42 AM
  return `8:42`;
}
function veSessionTag(t) {
  return 'iMessage · active now';
}

// A single message bubble, "them" side (left) or "me" (right)
function VEBubble({ children, side = 'them', startT, holdY = 0, tail = true, accent = false }) {
  const t = useTime();
  const p = clamp((t - startT) / 0.35, 0, 1);
  const eased = Easing.easeOutBack(p);
  if (p === 0) return null;
  const isMe = side === 'me';
  return (
    <div style={{
      position: 'absolute',
      left: isMe ? 'auto' : 48,
      right: isMe ? 48 : 'auto',
      top: holdY,
      maxWidth: 760,
      transformOrigin: isMe ? 'bottom right' : 'bottom left',
      transform: `scale(${0.6 + 0.4 * eased}) translateY(${(1 - eased) * 30}px)`,
      opacity: eased,
    }}>
      <div style={{
        background: isMe ? VE_BUBBLE_ME : VE_BUBBLE_THEM,
        color: '#fff',
        padding: '22px 32px',
        borderRadius: 36,
        borderBottomLeftRadius: !isMe && tail ? 8 : 36,
        borderBottomRightRadius: isMe && tail ? 8 : 36,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: accent ? 44 : 36,
        fontWeight: accent ? 600 : 400,
        lineHeight: 1.3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        letterSpacing: '-0.01em',
      }}>
        {children}
      </div>
    </div>
  );
}

// Typing indicator (three dots, animated)
function VETyping({ startT, endT, holdY = 0 }) {
  const t = useTime();
  const visible = t >= startT && t < endT;
  if (!visible) return null;
  const localT = t - startT;
  return (
    <div style={{
      position: 'absolute', left: 48, top: holdY,
      background: VE_BUBBLE_THEM,
      padding: '24px 32px',
      borderRadius: 36, borderBottomLeftRadius: 8,
      display: 'flex', gap: 10, alignItems: 'center',
      animation: 've-bubble-in 0.2s',
    }}>
      {[0, 0.15, 0.3].map((delay, i) => {
        const phase = (localT * 1.8 - delay) % 1.2;
        const a = phase > 0 && phase < 0.5 ? Math.sin(phase * Math.PI * 2) * 0.5 + 0.5 : 0.3;
        return (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 7,
            background: VE_MUTE,
            opacity: 0.4 + a * 0.6,
          }}/>
        );
      })}
    </div>
  );
}

// Reaction emoji floating up on a bubble (heart / fire)
function VEReaction({ startT, x, y, type = 'heart' }) {
  const t = useTime();
  const p = clamp((t - startT) / 0.8, 0, 1);
  const eased = Easing.easeOutBack(p);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute',
      left: x, top: y,
      width: 76, height: 76, borderRadius: 38,
      background: '#1c1c1e',
      border: '2px solid #000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 44,
      transform: `scale(${0.4 + 0.6 * eased}) rotate(${(1 - eased) * 30}deg)`,
      boxShadow: '0 6px 16px rgba(0,0,0,0.5)',
    }}>
      {type === 'heart' ? '❤️' : type === 'fire' ? '🔥' : '‼️'}
    </div>
  );
}

// Date divider — "WEEK 4" type label between chunks
function VEDateDivider({ startT, label, y }) {
  const t = useTime();
  const p = clamp((t - startT) / 0.6, 0, 1);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: y,
      textAlign: 'center',
      fontFamily: 'system-ui, sans-serif', fontSize: 22, fontWeight: 600,
      color: VE_MUTE,
      letterSpacing: '0.16em', textTransform: 'uppercase',
      opacity: p,
    }}>
      {label}
    </div>
  );
}

// Whole thread — one continuous conversation. The mom unloads her story
// in real-time over about 25 seconds. Scrolls up as it gets long.
function VEThread() {
  const t = useTime();
  // Scroll up gradually to keep the latest message in view
  const scroll = Math.max(0, (t - 6) * 35);
  const scrollClamped = Math.min(scroll, 1200);

  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: 380, bottom: 160,
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: -scrollClamped,
        height: 3000,
      }}>
        {/* Single date stamp at the top of the conversation */}
        <VEDateDivider startT={1.4} label="— today · 8:42 AM" y={20}/>

        <VEBubble side="them" startT={1.6} holdY={80} accent>
          Quick story for you 💪
        </VEBubble>
        <VEBubble side="them" startT={3.0} holdY={210}>
          Wanted to send an update on Marcus.
        </VEBubble>
        <VETyping startT={4.6} endT={5.4} holdY={340}/>
        <VEBubble side="them" startT={5.4} holdY={340}>
          He's been with you guys 2 months now.
        </VEBubble>

        <VEBubble side="them" startT={7.4} holdY={470}>
          OK so the speed gains are real.
        </VEBubble>
        <VEBubble side="them" startT={9.0} holdY={600}>
          Coach timed him this week and he was beating kids
          two years older than him.
        </VEBubble>
        <VEReaction startT={10.8} x={760} y={590} type="fire"/>

        <VEBubble side="them" startT={12.4} holdY={810}>
          But honestly the speed isn't even the thing.
        </VEBubble>
        <VEBubble side="them" startT={14.2} holdY={950} accent>
          His <span style={{ color: '#ff8a8a' }}>confidence</span> is off the charts.
        </VEBubble>
        <VEReaction startT={15.8} x={760} y={950} type="heart"/>

        <VETyping startT={16.8} endT={17.8} holdY={1100}/>
        <VEBubble side="them" startT={17.8} holdY={1100}>
          I never thought I'd see the day my son would
          <em> love</em> to run and work out.
        </VEBubble>

        <VEBubble side="them" startT={20.0} holdY={1330} accent>
          Just had to say thank you. ❤️
        </VEBubble>

        {/* Coach replies */}
        <VEBubble side="me" startT={22.2} holdY={1480}>
          That made my whole day.
        </VEBubble>
        <VEBubble side="me" startT={23.8} holdY={1600}>
          Tell Marcus we're proud of him.
        </VEBubble>
        <VEReaction startT={25.2} x={120} y={1600} type="heart"/>
      </div>
    </div>
  );
}

// Outro card overlays the phone in the last 3 seconds
function VEOutro() {
  const t = useTime();
  const startT = 26.8;
  const p = clamp((t - startT) / 0.7, 0, 1);
  const e = Easing.easeOutCubic(p);
  if (p === 0) return null;
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: `rgba(0,0,0,${0.86 * e})`,
      backdropFilter: `blur(${e * 14}px)`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      opacity: e, zIndex: 10,
    }}>
      <div style={{
        fontFamily: 'system-ui, sans-serif', fontSize: 30, fontWeight: 600,
        color: VE_RED, letterSpacing: '0.3em', textTransform: 'uppercase',
        marginBottom: 30,
      }}>
        Actual message. Actual parent.
      </div>
      <img src="assets/logo.png" style={{
        width: 460, height: 460, objectFit: 'contain',
        filter: `drop-shadow(0 0 60px rgba(215,32,32,0.5))`,
        transform: `scale(${0.92 + 0.08 * e})`,
      }}/>
      <div style={{
        fontFamily: 'Anton, sans-serif', fontSize: 110,
        color: '#fff', letterSpacing: '0.02em', textTransform: 'uppercase',
        marginTop: 10,
      }}>
        Train this summer.
      </div>
      <div style={{
        fontFamily: 'system-ui, monospace', fontSize: 28,
        color: VE_MUTE, marginTop: 28,
        letterSpacing: '0.28em', textTransform: 'uppercase',
      }}>
        @athletes_acceleration
      </div>
    </div>
  );
}

function VariationE() {
  return (
    <Stage width={VE_W} height={VE_H} duration={30} background={VE_SCREEN} persistKey="aa-ve">
      <VEPhoneChrome/>
      <VEThread/>
      <VEOutro/>
      <style>{`@keyframes ve-bubble-in { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
    </Stage>
  );
}

window.VariationE = VariationE;
