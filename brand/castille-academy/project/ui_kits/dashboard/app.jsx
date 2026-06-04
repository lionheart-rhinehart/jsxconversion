/* Castille Academy · Parent/Athlete Dashboard (the Castille Index portal) */
const { useState, useEffect } = React;
function useLucide(){ useEffect(()=>{ if(window.lucide) window.lucide.createIcons(); }); }
function Ic({ name, size=18, style }){ return <i data-lucide={name} style={{ width:size, height:size, strokeWidth:1.75, display:'inline-flex', ...style }} />; }

const ATHLETES = [
  { initial:'M', name:'Mara Ellison', tier:'Rise · U15', sport:'Soccer', index:74, season:18,
    v:71, f:78, c:73, attendance:94,
    history:[56,58,61,61,66,70,74],
    next:{ day:'Tue', date:'Jun 4', time:'4:30 PM', coach:'Coach Daly', type:'Velocity block' },
    block:{ name:'Block 3 · Velocity', done:7, total:12 },
    sched:[
      { day:'TUE', d:'04', t:'4:30 PM', type:'Velocity · Small group', coach:'Coach Daly' },
      { day:'THU', d:'06', t:'5:30 PM', type:'Force · Small group', coach:'Coach Daly' },
      { day:'SAT', d:'08', t:'9:00 AM', type:'Craft + Assessment', coach:'Coach Mott' },
    ],
    assess:[ {date:'May 2', i:74, d:4}, {date:'Apr 4', i:70, d:4}, {date:'Mar 7', i:66, d:5}, {date:'Feb 1', i:61, d:0} ] },
  { initial:'J', name:'Jonah Ellison', tier:'Prep · U11', sport:'Basketball', index:61, season:12,
    v:64, f:55, c:64, attendance:88,
    history:[49,50,52,55,57,59,61],
    next:{ day:'Wed', date:'Jun 5', time:'5:30 PM', coach:'Coach Reyes', type:'Foundations' },
    block:{ name:'Block 2 · Foundations', done:4, total:8 },
    sched:[
      { day:'WED', d:'05', t:'5:30 PM', type:'Foundations', coach:'Coach Reyes' },
      { day:'FRI', d:'07', t:'5:30 PM', type:'Foundations', coach:'Coach Reyes' },
    ],
    assess:[ {date:'May 2', i:61, d:4}, {date:'Apr 4', i:57, d:5}, {date:'Mar 7', i:52, d:3}, {date:'Feb 1', i:49, d:0} ] },
];

function Sidebar({ nav, setNav, athlete, setIdx, idx }){
  const items = [['Overview','layout-dashboard'],['Schedule','calendar'],['Progress','trending-up'],['Assessments','clipboard-list'],['Messages','mail']];
  return (
    <aside style={{ width:248, background:'var(--ca-ink-950)', color:'var(--ca-paper-100)', display:'flex', flexDirection:'column', flexShrink:0, height:'100%' }}>
      <div style={{ padding:'22px 22px 18px', borderBottom:'1px solid var(--ca-ink-800)', display:'flex', alignItems:'center', gap:11 }}>
        <div style={{ width:34, height:38, border:'1.5px solid var(--ca-red-500)', borderRadius:'4px 4px 16px 16px/4px 4px 20px 20px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:19, color:'var(--ca-red-400)' }}>C</div>
        <div style={{ display:'flex', flexDirection:'column', gap:1 }}>
          <b style={{ fontFamily:'var(--font-display)', fontSize:18, color:'var(--ca-white)', lineHeight:1 }}>Castille</b>
          <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:9, letterSpacing:'0.4em', color:'var(--ca-red-500)', textTransform:'uppercase' }}>Academy</span>
        </div>
      </div>
      <nav style={{ padding:'16px 12px', display:'flex', flexDirection:'column', gap:3, flex:1 }}>
        {items.map(([label,icon])=>(
          <button key={label} onClick={()=>setNav(label)} style={{
            display:'flex', alignItems:'center', gap:12, padding:'11px 13px', borderRadius:'var(--r-md)', border:0, cursor:'pointer', textAlign:'left',
            background: nav===label ? 'var(--ca-ink-850)' : 'transparent',
            color: nav===label ? 'var(--ca-white)' : 'var(--ca-ink-400)',
            fontFamily:'var(--font-cond)', fontWeight:600, fontSize:14, letterSpacing:'0.06em', textTransform:'uppercase' }}>
            <Ic name={icon} size={17} style={{ color: nav===label ? 'var(--ca-red-500)':'var(--ca-ink-500)' }} />{label}
          </button>
        ))}
      </nav>
      <div style={{ padding:12, borderTop:'1px solid var(--ca-ink-800)' }}>
        <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-ink-500)', padding:'0 6px 8px' }}>Athletes</div>
        {ATHLETES.map((a,i)=>(
          <button key={a.name} onClick={()=>setIdx(i)} style={{
            width:'100%', display:'flex', alignItems:'center', gap:10, padding:'8px', borderRadius:'var(--r-md)', border:0, cursor:'pointer', textAlign:'left', marginBottom:2,
            background: idx===i ? 'var(--ca-ink-850)':'transparent' }}>
            <span style={{ width:32, height:32, borderRadius:'50%', background: idx===i?'var(--ca-red-600)':'var(--ca-ink-800)', color:'var(--ca-white)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:14, flexShrink:0 }}>{a.initial}</span>
            <span style={{ display:'flex', flexDirection:'column', minWidth:0 }}>
              <span style={{ fontFamily:'var(--font-body)', fontWeight:600, fontSize:13, color:'var(--ca-paper-100)', whiteSpace:'nowrap' }}>{a.name}</span>
              <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ca-ink-500)' }}>{a.tier}</span>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function Ring({ value, size=132 }){
  return (
    <div style={{ position:'relative', width:size, height:size, borderRadius:'50%', background:`conic-gradient(var(--ca-red-600) 0 ${value}%, var(--ca-ink-100) ${value}% 100%)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
      <div style={{ position:'absolute', inset:11, borderRadius:'50%', background:'var(--ca-white)' }} />
      <div style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1 }}>
        <b style={{ fontFamily:'var(--font-cond)', fontWeight:800, fontSize:size*0.36, color:'var(--ca-ink-900)', fontVariantNumeric:'tabular-nums' }}>{value}</b>
        <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ca-red-600)', marginTop:3 }}>Index</span>
      </div>
    </div>
  );
}

function Spark({ data, w=360, h=120 }){
  const max=Math.max(...data)+4, min=Math.min(...data)-4, rng=max-min||1;
  const pts=data.map((v,i)=>[ (i/(data.length-1))*w, h-((v-min)/rng)*h ]);
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' ');
  const area=line+` L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%', height:h, display:'block', overflow:'visible' }} preserveAspectRatio="none">
      <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="rgba(168,25,24,0.18)"/><stop offset="1" stopColor="rgba(168,25,24,0)"/></linearGradient></defs>
      <path d={area} fill="url(#g1)" />
      <path d={line} fill="none" stroke="var(--ca-red-600)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      {pts.map((p,i)=> i===pts.length-1 ? <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="var(--ca-red-600)" stroke="#fff" strokeWidth="2" /> : null)}
    </svg>
  );
}

function Card({ children, style, pad=24 }){
  return <div style={{ background:'var(--ca-white)', border:'1px solid var(--ca-ink-200)', borderRadius:'var(--r-lg)', boxShadow:'var(--shadow-1)', padding:pad, ...style }}>{children}</div>;
}
function Eyebrow({ children, style }){ return <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-red-600)', ...style }}>{children}</div>; }

function Bars({ a }){
  const rows=[['Velocity',a.v],['Force',a.f],['Craft',a.c]];
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:13, flex:1 }}>
      {rows.map(([t,v])=>(
        <div key={t} style={{ display:'flex', flexDirection:'column', gap:5 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-cond)', fontWeight:600, fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase' }}>
            <span style={{ color:'var(--ca-ink-700)' }}>{t}</span><span style={{ color:'var(--ca-ink-900)', fontVariantNumeric:'tabular-nums' }}>{v}</span>
          </div>
          <div style={{ height:7, borderRadius:999, background:'var(--ca-ink-100)' }}><div style={{ height:'100%', width:v+'%', borderRadius:999, background:'var(--ca-red-600)' }} /></div>
        </div>
      ))}
    </div>
  );
}

function Overview({ a }){
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'grid', gridTemplateColumns:'1.05fr 1fr', gap:20 }}>
        <Card>
          <Eyebrow style={{ marginBottom:14 }}>Castille Index</Eyebrow>
          <div style={{ display:'flex', gap:22, alignItems:'center' }}>
            <Ring value={a.index} />
            <Bars a={a} />
          </div>
        </Card>
        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
            <Eyebrow>Index over time</Eyebrow>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap', fontFamily:'var(--font-cond)', fontWeight:700, fontSize:13, letterSpacing:'0.04em', color:'var(--ca-success)' }}><Ic name="trending-up" size={14} />+{a.season} season</span>
          </div>
          <Spark data={a.history} />
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--ca-ink-400)', marginTop:6 }}>
            <span>Block 1</span><span>Now</span>
          </div>
        </Card>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
        <Tile icon="calendar" label="Next session" big={a.next.time} sub={a.next.day+' '+a.next.date+' · '+a.next.type} />
        <Tile icon="layers" label="Current block" big={a.block.done+' / '+a.block.total} sub={a.block.name} progress={a.block.done/a.block.total} />
        <Tile icon="check-circle" label="Attendance" big={a.attendance+'%'} sub="Last 90 days" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <Card pad={0}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px 14px', borderBottom:'1px solid var(--ca-ink-100)' }}>
            <h4 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ca-ink-900)', margin:0 }}>This Week</h4>
            <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ca-red-600)', cursor:'pointer' }}>Full schedule</span>
          </div>
          <div>
            {a.sched.map((s,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 22px', borderBottom: i<a.sched.length-1?'1px solid var(--ca-ink-100)':'none' }}>
                <div style={{ width:48, textAlign:'center', flexShrink:0 }}>
                  <div style={{ fontFamily:'var(--font-cond)', fontWeight:700, fontSize:11, letterSpacing:'0.1em', color:'var(--ca-red-600)' }}>{s.day}</div>
                  <div style={{ fontFamily:'var(--font-cond)', fontWeight:800, fontSize:24, color:'var(--ca-ink-900)', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{s.d}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:'var(--font-body)', fontWeight:600, fontSize:14, color:'var(--ca-ink-900)' }}>{s.type}</div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:12.5, color:'var(--ca-ink-500)' }}>{s.t} · {s.coach}</div>
                </div>
                <Ic name="chevron-right" size={18} style={{ color:'var(--ca-ink-300)' }} />
              </div>
            ))}
          </div>
        </Card>
        <Card pad={0}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 22px 14px', borderBottom:'1px solid var(--ca-ink-100)' }}>
            <h4 style={{ fontFamily:'var(--font-display)', fontSize:22, color:'var(--ca-ink-900)', margin:0 }}>Assessments</h4>
            <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:12, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ca-red-600)', cursor:'pointer' }}>Export</span>
          </div>
          <div>
            {a.assess.map((r,i)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:16, padding:'13px 22px', borderBottom: i<a.assess.length-1?'1px solid var(--ca-ink-100)':'none' }}>
                <Ic name="clipboard-list" size={18} style={{ color:'var(--ca-ink-400)' }} />
                <div style={{ flex:1, fontFamily:'var(--font-body)', fontWeight:600, fontSize:14, color:'var(--ca-ink-900)' }}>{r.date}</div>
                <div style={{ fontFamily:'var(--font-cond)', fontWeight:800, fontSize:22, color:'var(--ca-ink-900)', fontVariantNumeric:'tabular-nums' }}>{r.i}</div>
                <div style={{ width:54, textAlign:'right', fontFamily:'var(--font-cond)', fontWeight:700, fontSize:13, color: r.d>0?'var(--ca-success)':'var(--ca-ink-400)' }}>{r.d>0?'+'+r.d:'—'}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Tile({ icon, label, big, sub, progress }){
  return (
    <Card>
      <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:14 }}>
        <Ic name={icon} size={16} style={{ color:'var(--ca-red-600)' }} />
        <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-ink-500)' }}>{label}</span>
      </div>
      <div style={{ fontFamily:'var(--font-cond)', fontWeight:800, fontSize:30, color:'var(--ca-ink-900)', lineHeight:1, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>{big}</div>
      <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ca-ink-500)', marginTop:6 }}>{sub}</div>
      {progress!=null && <div style={{ height:6, borderRadius:999, background:'var(--ca-ink-100)', marginTop:14 }}><div style={{ height:'100%', width:(progress*100)+'%', borderRadius:999, background:'var(--ca-red-600)' }} /></div>}
    </Card>
  );
}

function Placeholder({ nav }){
  return (
    <Card style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'72px 24px', color:'var(--ca-ink-400)' }}>
      <Ic name="hammer" size={26} style={{ color:'var(--ca-ink-300)', marginBottom:12 }} />
      <div style={{ fontFamily:'var(--font-display)', fontSize:24, color:'var(--ca-ink-700)' }}>{nav}</div>
      <p style={{ fontFamily:'var(--font-body)', fontSize:14, maxWidth:340, marginTop:8 }}>This view is part of the kit's surface map. The Overview tab is the built-out reference screen.</p>
    </Card>
  );
}

function App(){
  const [idx,setIdx]=useState(0);
  const [nav,setNav]=useState('Overview');
  useLucide();
  const a=ATHLETES[idx];
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'var(--ca-paper-100)' }}>
      <Sidebar nav={nav} setNav={setNav} athlete={a} idx={idx} setIdx={setIdx} />
      <main style={{ flex:1, overflowY:'auto' }}>
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'22px 32px', background:'var(--ca-white)', borderBottom:'1px solid var(--ca-ink-200)', position:'sticky', top:0, zIndex:5 }}>
          <div>
            <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-ink-400)', whiteSpace:'nowrap' }}>{a.name} · {a.sport}</div>
            <h1 style={{ fontFamily:'var(--font-display)', fontSize:30, color:'var(--ca-ink-900)', margin:'2px 0 0' }}>{nav}</h1>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:14 }}>
            <button style={{ width:42, height:42, borderRadius:'50%', border:'1px solid var(--ca-ink-200)', background:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--ca-ink-600)' }}><Ic name="bell" size={18} /></button>
            <button style={{ display:'inline-flex', alignItems:'center', gap:8, background:'var(--ca-red-600)', color:'#fff', border:0, borderRadius:'var(--r-md)', padding:'12px 18px', cursor:'pointer', fontFamily:'var(--font-cond)', fontWeight:600, fontSize:14, letterSpacing:'0.08em', textTransform:'uppercase' }}><Ic name="plus" size={16} />Book Session</button>
          </div>
        </header>
        <div style={{ padding:32, maxWidth:1120, margin:'0 auto' }}>
          {nav==='Overview' ? <Overview a={a} /> : <Placeholder nav={nav} />}
        </div>
      </main>
    </div>
  );
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
