/* Castille Academy · Athlete mobile app (dark). Loads inside IOSDevice. */
const { useState: useS, useEffect: useE } = React;
function useLucide(){ useE(()=>{ if(window.lucide) window.lucide.createIcons(); }); }
function Ic({ name, size=20, style }){ return <i data-lucide={name} style={{ width:size, height:size, strokeWidth:1.9, display:'inline-flex', ...style }} />; }
const CL = '../../assets/clips/';

const CLIPS = [
  { key:'sprint',    label:'Sprint Mechanics', tag:'Velocity' },
  { key:'agility',   label:'Agility Ladder',   tag:'Velocity' },
  { key:'box-jumps', label:'Box Jumps',        tag:'Force' },
  { key:'lifting',   label:'Trap-Bar Lift',    tag:'Force' },
  { key:'medball',   label:'Med Ball Throw',   tag:'Force' },
  { key:'jumping',   label:'Broad Jump',       tag:'Craft' },
];
const SESSION = [
  { key:'sprint',    name:'Sprint Mechanics', detail:'4 × 20m · full recovery', done:true },
  { key:'box-jumps', name:'Box Jumps',        detail:'5 × 3 · max intent', done:true },
  { key:'lifting',   name:'Trap-Bar Lift',    detail:'4 × 5 · RPE 7', done:false },
  { key:'medball',   name:'Med Ball Throw',   detail:'4 × 4 each side', done:false },
  { key:'agility',   name:'Agility Ladder',   detail:'6 patterns · quality', done:false },
];

function Ring({ value, size=148 }){
  return (
    <div style={{ position:'relative', width:size, height:size, borderRadius:'50%', background:`conic-gradient(var(--ca-red-500) 0 ${value}%, var(--ca-ink-800) ${value}% 100%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ position:'absolute', inset:13, borderRadius:'50%', background:'var(--ca-ink-950)' }} />
      <div style={{ position:'relative', display:'flex', flexDirection:'column', alignItems:'center', lineHeight:1 }}>
        <b style={{ fontFamily:'var(--font-cond)', fontWeight:800, fontSize:size*0.4, color:'#fff', fontVariantNumeric:'tabular-nums' }}>{value}</b>
        <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--ca-red-400)', marginTop:3 }}>Index</span>
      </div>
    </div>
  );
}
function Poster({ k, h=104, label, tag, onClick }){
  return (
    <button onClick={onClick} style={{ position:'relative', border:0, padding:0, cursor:'pointer', borderRadius:14, overflow:'hidden', background:'var(--ca-ink-900)', height:h, width:'100%', display:'block' }}>
      <img src={CL+'posters/clip-'+k+'.jpg'} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'grayscale(1) contrast(1.05) brightness(0.74)' }} />
      <span style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.78))' }} />
      <span style={{ position:'absolute', top:9, left:9, width:30, height:30, borderRadius:'50%', background:'rgba(168,25,24,0.92)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Ic name="play" size={15} style={{ marginLeft:2 }} /></span>
      {label && <span style={{ position:'absolute', left:11, right:11, bottom:9, textAlign:'left' }}>
        {tag && <span style={{ display:'block', fontFamily:'var(--font-cond)', fontWeight:600, fontSize:9.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-red-400)' }}>{tag}</span>}
        <span style={{ display:'block', fontFamily:'var(--font-body)', fontWeight:700, fontSize:13.5, color:'#fff', lineHeight:1.2 }}>{label}</span>
      </span>}
    </button>
  );
}

function Home({ a, onStart, openClip }){
  return (
    <div style={{ padding:'8px 18px 16px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
        <div>
          <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-red-400)', whiteSpace:'nowrap' }}>Good evening</div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:30, color:'#fff', lineHeight:1 }}>Mara</div>
        </div>
        <div style={{ width:42, height:42, borderRadius:'50%', background:'var(--ca-red-600)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:18 }}>M</div>
      </div>

      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'6px 0 16px' }}>
        <Ring value={a.index} />
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:14, whiteSpace:'nowrap', fontFamily:'var(--font-cond)', fontWeight:700, fontSize:14, letterSpacing:'0.04em', color:'#5fcf94' }}><Ic name="trending-up" size={15} />+{a.season} this season</div>
        <div style={{ display:'flex', gap:8, marginTop:16, width:'100%' }}>
          {[['Velocity',a.v],['Force',a.f],['Craft',a.c]].map(([t,v])=>(
            <div key={t} style={{ flex:1, background:'var(--ca-ink-900)', border:'1px solid var(--ca-ink-800)', borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
              <div style={{ fontFamily:'var(--font-cond)', fontWeight:800, fontSize:24, color:'#fff', lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{v}</div>
              <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--ca-ink-400)', marginTop:5 }}>{t}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background:'var(--ca-ink-900)', border:'1px solid var(--ca-ink-800)', borderRadius:16, overflow:'hidden' }}>
        <div style={{ padding:'16px 16px 12px', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:10.5, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-red-400)' }}>Today · 4:30 PM</div>
            <div style={{ fontFamily:'var(--font-display)', fontSize:23, color:'#fff', marginTop:3 }}>Velocity Block</div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:12.5, color:'var(--ca-ink-400)', marginTop:3 }}>5 exercises · ~55 min · Coach Daly</div>
          </div>
          <span style={{ fontFamily:'var(--font-cond)', fontWeight:700, fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', background:'var(--ca-ink-800)', color:'var(--ca-ink-200)', padding:'5px 9px', borderRadius:999 }}>2/5</span>
        </div>
        <div style={{ display:'flex', gap:8, padding:'0 16px 16px' }}>
          {CLIPS.slice(0,3).map(c=> <Poster key={c.key} k={c.key} h={64} onClick={()=>openClip(c)} />)}
        </div>
        <button onClick={onStart} style={{ width:'100%', border:0, background:'var(--ca-red-600)', color:'#fff', padding:'15px', cursor:'pointer', fontFamily:'var(--font-cond)', fontWeight:600, fontSize:15, letterSpacing:'0.1em', textTransform:'uppercase', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}><Ic name="play" size={17} />Continue Session</button>
      </div>
    </div>
  );
}

function Today({ openClip }){
  return (
    <div style={{ padding:'4px 18px 16px' }}>
      <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-red-400)' }}>Block 3 · Session 7</div>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, color:'#fff', margin:'3px 0 16px' }}>Velocity Block</h2>
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {SESSION.map((e,i)=>(
          <button key={i} onClick={()=>openClip(CLIPS.find(c=>c.key===e.key)||{key:e.key,label:e.name})} style={{ display:'flex', alignItems:'center', gap:13, background:'var(--ca-ink-900)', border:'1px solid var(--ca-ink-800)', borderRadius:14, padding:10, cursor:'pointer', textAlign:'left', width:'100%' }}>
            <div style={{ position:'relative', width:64, height:48, borderRadius:9, overflow:'hidden', flexShrink:0 }}>
              <img src={CL+'posters/clip-'+e.key+'.jpg'} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', filter:'grayscale(1) brightness(0.8)' }} />
              <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}><Ic name="play" size={16} /></span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-body)', fontWeight:700, fontSize:14.5, color:'#fff' }}>{e.name}</div>
              <div style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--ca-ink-400)' }}>{e.detail}</div>
            </div>
            <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', background: e.done?'var(--ca-red-600)':'transparent', border: e.done?'0':'1.5px solid var(--ca-ink-600)', color:'#fff' }}>{e.done && <Ic name="check" size={14} />}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Clips({ openClip }){
  return (
    <div style={{ padding:'4px 18px 16px' }}>
      <h2 style={{ fontFamily:'var(--font-display)', fontSize:28, color:'#fff', margin:'2px 0 4px' }}>Exercise Library</h2>
      <p style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--ca-ink-400)', margin:'0 0 16px' }}>Coach-filmed technique clips for every movement in your block.</p>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
        {CLIPS.map(c=> <Poster key={c.key} k={c.key} label={c.label} tag={c.tag} onClick={()=>openClip(c)} />)}
      </div>
    </div>
  );
}

function Profile({ a }){
  const badges=[['medal','First 70+'],['flame','12-day streak'],['shield-check','Form verified'],['zap','Top split PR']];
  return (
    <div style={{ padding:'4px 18px 16px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--ca-red-600)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-display)', fontSize:26 }}>M</div>
        <div>
          <div style={{ fontFamily:'var(--font-display)', fontSize:24, color:'#fff', lineHeight:1 }}>Mara Ellison</div>
          <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--ca-ink-400)', marginTop:5 }}>Rise · U15 · Soccer · Carmel</div>
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
        {badges.map(([ic,t])=>(
          <div key={t} style={{ display:'flex', alignItems:'center', gap:10, background:'var(--ca-ink-900)', border:'1px solid var(--ca-ink-800)', borderRadius:12, padding:'13px 13px' }}>
            <Ic name={ic} size={18} style={{ color:'var(--ca-red-400)' }} />
            <span style={{ fontFamily:'var(--font-body)', fontWeight:600, fontSize:13, color:'#fff' }}>{t}</span>
          </div>
        ))}
      </div>
      {[['user','Account'],['bell','Notifications'],['credit-card','Membership'],['life-buoy','Help']].map(([ic,t])=>(
        <div key={t} style={{ display:'flex', alignItems:'center', gap:13, padding:'15px 4px', borderBottom:'1px solid var(--ca-ink-800)' }}>
          <Ic name={ic} size={18} style={{ color:'var(--ca-ink-400)' }} />
          <span style={{ flex:1, fontFamily:'var(--font-body)', fontWeight:500, fontSize:15, color:'#fff' }}>{t}</span>
          <Ic name="chevron-right" size={18} style={{ color:'var(--ca-ink-600)' }} />
        </div>
      ))}
    </div>
  );
}

function Player({ clip, onClose }){
  if(!clip) return null;
  return (
    <div style={{ position:'absolute', inset:0, zIndex:80, background:'#000', display:'flex', flexDirection:'column' }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:`url(${CL+'posters/clip-'+clip.key+'.jpg'})`, backgroundSize:'cover', backgroundPosition:'center', filter:'grayscale(1) brightness(0.8)' }} />
      <video src={CL+'clip-'+clip.key+'.mp4'} poster={CL+'posters/clip-'+clip.key+'.jpg'} autoPlay loop muted playsInline style={{ position:'relative', width:'100%', flex:1, objectFit:'cover', background:'transparent' }} />
      <button onClick={onClose} style={{ position:'absolute', top:54, right:18, width:38, height:38, borderRadius:'50%', border:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(8px)', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Ic name="x" size={20} /></button>
      <div style={{ position:'absolute', left:0, right:0, bottom:0, padding:'40px 22px 40px', background:'linear-gradient(180deg, transparent, rgba(0,0,0,0.9))' }}>
        <div style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--ca-red-400)' }}>{clip.tag||'Technique'}</div>
        <div style={{ fontFamily:'var(--font-display)', fontSize:26, color:'#fff', margin:'3px 0 2px' }}>{clip.label}</div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'rgba(255,255,255,0.6)' }}>Coach demo · slow-motion loop</div>
      </div>
    </div>
  );
}

function TabBar({ tab, setTab }){
  const tabs=[['Home','home'],['Today','dumbbell'],['Clips','clapperboard'],['Profile','user']];
  return (
    <div style={{ display:'flex', borderTop:'1px solid var(--ca-ink-800)', background:'rgba(10,10,10,0.92)', backdropFilter:'blur(16px)', padding:'9px 8px 26px' }}>
      {tabs.map(([t,ic])=>(
        <button key={t} onClick={()=>setTab(t)} style={{ flex:1, border:0, background:'transparent', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:4, color: tab===t?'var(--ca-red-500)':'var(--ca-ink-500)' }}>
          <Ic name={ic} size={22} />
          <span style={{ fontFamily:'var(--font-cond)', fontWeight:600, fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase' }}>{t}</span>
        </button>
      ))}
    </div>
  );
}

function MobileApp(){
  const [tab,setTab]=useS('Home');
  const [clip,setClip]=useS(null);
  useLucide();
  const a={ index:74, season:18, v:71, f:78, c:73 };
  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', background:'var(--ca-ink-950)', position:'relative' }}>
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', paddingTop:62 }}>
        {tab==='Home' && <Home a={a} onStart={()=>setTab('Today')} openClip={setClip} />}
        {tab==='Today' && <Today openClip={setClip} />}
        {tab==='Clips' && <Clips openClip={setClip} />}
        {tab==='Profile' && <Profile a={a} />}
      </div>
      <TabBar tab={tab} setTab={setTab} />
      <Player clip={clip} onClose={()=>setClip(null)} />
    </div>
  );
}
Object.assign(window, { MobileApp });
