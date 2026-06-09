/* Power Source — Athlete Portal: app shell + widgets.
   Reuses base primitives from ../marketing-site/ui.jsx (Button, Badge,
   Avatar, Input, StatTile, Icon). Defines portal-specific UI here. */

(function () {
  function ensureStyles(id, css) {
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id; el.textContent = css; document.head.appendChild(el);
  }
  ensureStyles("ps-portal-styles", `
  .ap{display:grid;grid-template-columns:248px 1fr;min-height:100vh;background:var(--surface-base);}
  /* Sidebar */
  .ap-side{background:var(--ink-900);border-right:1px solid var(--border-subtle);display:flex;flex-direction:column;padding:22px 16px;position:sticky;top:0;height:100vh;box-sizing:border-box;}
  .ap-side__logo{display:flex;align-items:center;gap:10px;padding:4px 8px 22px;}
  .ap-side__logo img{height:34px;}
  .ap-nav{display:flex;flex-direction:column;gap:4px;}
  .ap-nav__item{display:flex;align-items:center;gap:12px;padding:11px 12px;border-radius:var(--radius-md);font-family:var(--font-heading);font-weight:600;font-size:14px;color:var(--text-body);cursor:pointer;border:1px solid transparent;transition:background var(--dur-fast) var(--ease-out),color var(--dur-fast) var(--ease-out);}
  .ap-nav__item svg{width:19px;height:19px;}
  .ap-nav__item:hover{background:var(--ink-800);color:var(--text-strong);}
  .ap-nav__item.is-active{background:var(--electric-500);color:#fff;border-color:transparent;box-shadow:var(--shadow-md);}
  .ap-side__spacer{flex:1;}
  .ap-coach{background:var(--surface-steel);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:14px;display:flex;gap:11px;align-items:center;}
  .ap-coach__meta b{display:block;font-family:var(--font-heading);font-weight:700;font-size:13px;color:#fff;}
  .ap-coach__meta span{font-family:var(--font-mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--electric-200);}
  /* Topbar */
  .ap-main{display:flex;flex-direction:column;min-width:0;}
  .ap-top{display:flex;align-items:center;gap:18px;padding:20px 32px;border-bottom:1px solid var(--border-subtle);position:sticky;top:0;background:rgba(5,6,8,.82);backdrop-filter:blur(12px);z-index:50;}
  .ap-top__title{font-family:var(--font-display);font-weight:800;text-transform:uppercase;font-size:26px;letter-spacing:-.01em;color:var(--text-strong);line-height:1;}
  .ap-top__right{margin-left:auto;display:flex;align-items:center;gap:14px;}
  .ap-streak{display:inline-flex;align-items:center;gap:7px;font-family:var(--font-mono);font-weight:700;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--bolt-300);background:rgba(225,204,66,.1);border:1px solid var(--bolt-800);border-radius:var(--radius-pill);padding:7px 13px;}
  .ap-streak svg{width:15px;height:15px;}
  .ap-content{padding:28px 32px 48px;display:flex;flex-direction:column;gap:22px;}
  /* Section label */
  .ap-label{font-family:var(--font-mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-muted);margin-bottom:2px;}
  /* Grid helpers */
  .ap-row{display:grid;gap:18px;}
  .ap-row--3{grid-template-columns:repeat(3,1fr);}
  .ap-row--4{grid-template-columns:repeat(4,1fr);}
  .ap-row--hero{grid-template-columns:1.6fr 1fr;}
  /* Session card */
  .ap-session{position:relative;overflow:hidden;background:var(--grad-steel);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:26px;display:flex;flex-direction:column;gap:18px;}
  .ap-session::after{content:"";position:absolute;right:-40px;top:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(225,204,66,.18),transparent 70%);}
  .ap-session__when{font-family:var(--font-mono);font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:var(--bolt-300);}
  .ap-session__focus{font-family:var(--font-display);font-weight:800;text-transform:uppercase;font-size:34px;line-height:.95;color:#fff;letter-spacing:-.01em;}
  .ap-session__meta{display:flex;gap:22px;flex-wrap:wrap;}
  .ap-session__meta div{display:flex;flex-direction:column;gap:3px;}
  .ap-session__meta dt{font-family:var(--font-mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--steel-200);}
  .ap-session__meta dd{margin:0;font-family:var(--font-heading);font-weight:600;font-size:15px;color:#fff;}
  .ap-session__actions{display:flex;gap:12px;position:relative;}
  /* Generic card */
  .ap-card{background:var(--surface-raised);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);padding:20px;box-shadow:var(--shadow-md);}
  .ap-card__head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}
  .ap-card__title{font-family:var(--font-heading);font-weight:700;font-size:16px;color:var(--text-strong);}
  .ap-card__link{font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--electric-300);cursor:pointer;}
  /* Progress bar */
  .ap-prog{display:flex;flex-direction:column;gap:8px;}
  .ap-prog__top{display:flex;justify-content:space-between;align-items:baseline;}
  .ap-prog__name{font-family:var(--font-heading);font-weight:600;font-size:14px;color:var(--text-strong);}
  .ap-prog__val{font-family:var(--font-mono);font-size:12px;color:var(--text-muted);}
  .ap-prog__track{height:8px;border-radius:var(--radius-pill);background:var(--ink-700);overflow:hidden;}
  .ap-prog__fill{height:100%;border-radius:var(--radius-pill);background:var(--grad-electric);}
  .ap-prog__fill--bolt{background:var(--grad-bolt);}
  /* Schedule list */
  .ap-sched{display:flex;flex-direction:column;}
  .ap-sched__row{display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--border-subtle);}
  .ap-sched__row:last-child{border-bottom:0;}
  .ap-sched__day{width:46px;flex:none;text-align:center;}
  .ap-sched__day b{display:block;font-family:var(--font-display);font-weight:800;font-size:20px;color:var(--text-strong);line-height:1;}
  .ap-sched__day span{font-family:var(--font-mono);font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);}
  .ap-sched__info{flex:1;}
  .ap-sched__info b{display:block;font-family:var(--font-heading);font-weight:600;font-size:14px;color:var(--text-strong);}
  .ap-sched__info span{font-size:12px;color:var(--text-muted);}
  /* Coach note */
  .ap-note{background:var(--surface-raised);border:1px solid var(--border-subtle);border-left:var(--bw-3) solid var(--bolt-400);border-radius:var(--radius-lg);padding:20px;}
  .ap-note__q{font-family:var(--font-body);font-style:italic;font-size:15px;line-height:1.55;color:var(--text-strong);}
  .ap-note__by{margin-top:12px;display:flex;align-items:center;gap:10px;font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);}
  /* Login */
  .ap-login{min-height:100vh;display:grid;place-items:center;background:var(--grad-arena);padding:24px;}
  .ap-login__card{width:400px;max-width:100%;background:var(--ink-850);border:1px solid var(--border-default);border-top:var(--bw-3) solid var(--bolt-400);border-radius:var(--radius-xl);box-shadow:var(--shadow-xl);padding:34px;}
  .ap-login__logo{height:46px;margin-bottom:22px;}
  .ap-login__title{font-family:var(--font-display);font-weight:800;text-transform:uppercase;font-size:30px;color:#fff;line-height:.95;margin-bottom:6px;}
  .ap-login__sub{font-size:14px;color:var(--text-body);margin-bottom:22px;}
  .ap-login__form{display:flex;flex-direction:column;gap:14px;}
  .ap-login__row{display:flex;justify-content:space-between;align-items:center;font-size:12px;}
  .ap-login__row a{color:var(--electric-300);font-family:var(--font-mono);}
  .ap-pill-tabs{display:flex;gap:6px;background:var(--ink-800);padding:4px;border-radius:var(--radius-pill);margin-bottom:22px;}
  .ap-pill-tabs button{flex:1;border:0;background:transparent;color:var(--text-muted);font-family:var(--font-heading);font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:.04em;padding:8px;border-radius:var(--radius-pill);cursor:pointer;}
  .ap-pill-tabs button.is-active{background:var(--electric-500);color:#fff;}
  @media(max-width:880px){.ap{grid-template-columns:1fr;}.ap-side{display:none;}.ap-row--hero,.ap-row--3,.ap-row--4{grid-template-columns:1fr;}}
  `);

  const cx = (...a) => a.filter(Boolean).join(" ");

  function ProgressBar({ name, value, max = 100, label, accent = "electric" }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
      <div className="ap-prog">
        <div className="ap-prog__top">
          <span className="ap-prog__name">{name}</span>
          <span className="ap-prog__val">{label || pct + "%"}</span>
        </div>
        <div className="ap-prog__track"><div className={cx("ap-prog__fill", accent === "bolt" && "ap-prog__fill--bolt")} style={{ width: pct + "%" }} /></div>
      </div>
    );
  }

  function NavItem({ icon, label, active, onClick }) {
    return (
      <div className={cx("ap-nav__item", active && "is-active")} onClick={onClick}>
        <Icon name={icon} /> {label}
      </div>
    );
  }

  Object.assign(window, { ProgressBar, NavItem });
})();
