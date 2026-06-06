// Purpose-built "winner" designs — the two distinct-at-large-size patterns done RIGHT
// (text and media do NOT collide), plus a facility example. Renders to _experiment/winners/
// and writes winners.json for the viewer. This is the fair quality test of the winners.
import { writeFileSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..", "..");
const NAMED = join(ROOT, "brand", "aa-design-system", "project", "assets");
const RENDER = join(ROOT, ".claude", "skills", "jsx-to-mp4", "scripts", "render.mjs");
const OUT = join(ROOT, "out");
const DIR = join(HERE, "winners"); const ASSETS = join(DIR, "assets");
mkdirSync(ASSETS, { recursive: true });

// assets
copyFileSync(join(HERE, "cutout", "photo-agility-female.png"), join(ASSETS, "athlete-cut.png"));
copyFileSync(join(NAMED, "photo-jump-male.jpg"), join(ASSETS, "athlete-photo.jpg"));
copyFileSync(join(HERE, "facility", "fac-gym.png"), join(ASSETS, "facility.png"));

const wrap = (inner, bg) => `export default function Example(){return(<div style={{width:1080,height:1920,position:"relative",overflow:"hidden",background:"${bg}"}}>${inner}</div>);}`;

const DESIGNS = {
  // cutout done right: athlete on the RIGHT, giant stat on the LEFT — no overlap
  "win-cutout-stat": wrap(`
    <img src="./assets/athlete-cut.png" style={{position:"absolute",right:-40,bottom:0,height:"88%",objectFit:"contain"}} />
    <div style={{position:"absolute",left:64,top:240}}>
      <div style={{fontFamily:"JetBrains Mono",color:"#fff",fontSize:34,letterSpacing:"0.12em",fontWeight:700,opacity:0.9}}>VERTICAL JUMP</div>
      <div style={{fontFamily:"Anton",color:"#fff",fontSize:380,lineHeight:0.8,marginTop:8}}>92<span style={{fontSize:150}}>%</span></div>
      <div style={{width:120,height:8,background:"#fff",margin:"18px 0"}} />
      <div style={{fontFamily:"Geist",color:"#fff",fontSize:42,fontWeight:600,maxWidth:420}}>improved in 90 days</div>
    </div>`, "#c4141d"),

  // split done right: photo left 45%, text panel right 55% — clean
  "win-split-headline": wrap(`
    <div style={{position:"absolute",left:0,top:0,bottom:0,width:"45%",overflow:"hidden"}}><img src="./assets/athlete-photo.jpg" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div>
    <div style={{position:"absolute",right:0,top:0,bottom:0,width:"55%",background:"#111",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 56px"}}>
      <div style={{fontFamily:"JetBrains Mono",color:"#c4141d",fontSize:30,letterSpacing:"0.08em",marginBottom:20}}>CARMEL SPORT PARENTS</div>
      <div style={{fontFamily:"Anton",color:"#fff",fontSize:120,lineHeight:0.9,textTransform:"uppercase"}}>Faster by the fall</div>
      <div style={{width:120,height:7,background:"#c4141d",margin:"30px 0"}} />
      <div style={{fontFamily:"Geist",color:"#cfcfcf",fontSize:38,fontWeight:600}}>8-week speed program</div>
    </div>`, "#111"),

  // split with FACILITY (persona-free) done right
  "win-split-facility": wrap(`
    <div style={{position:"absolute",left:0,top:0,bottom:0,width:"45%",overflow:"hidden"}}><img src="./assets/facility.png" style={{width:"100%",height:"100%",objectFit:"cover"}} /></div>
    <div style={{position:"absolute",right:0,top:0,bottom:0,width:"55%",background:"#0d0d12",display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 56px"}}>
      <div style={{fontFamily:"JetBrains Mono",color:"#c4141d",fontSize:30,letterSpacing:"0.08em",marginBottom:20}}>THE FACILITY</div>
      <div style={{fontFamily:"Anton",color:"#fff",fontSize:104,lineHeight:0.92,textTransform:"uppercase"}}>Where Carmel trains all winter</div>
      <div style={{width:120,height:7,background:"#c4141d",margin:"30px 0"}} />
      <div style={{fontFamily:"Geist",color:"#cfcfcf",fontSize:36,fontWeight:600}}>Indoor turf · strength · speed</div>
    </div>`, "#0d0d12"),
};

const out = [];
for (const [name, jsx] of Object.entries(DESIGNS)) {
  writeFileSync(join(DIR, `${name}.jsx`), jsx);
  const r = spawnSync("node", [RENDER, join(DIR, `${name}.jsx`)], { cwd: ROOT, encoding: "utf8", timeout: 120000 });
  const produced = join(OUT, `${name}.png`);
  if (r.status !== 0 || !existsSync(produced)) { process.stderr.write(`  FAIL ${name}: ${(r.stderr||"").split("\n").slice(-2).join(" ")}\n`); continue; }
  copyFileSync(produced, join(DIR, `${name}.png`));
  const label = { "win-cutout-stat": "Cutout · giant-stat (done right)", "win-split-headline": "Split-panel · action (done right)", "win-split-facility": "Split-panel · facility (done right)" }[name];
  out.push({ name, label, png: `${name}.png` }); process.stderr.write(`  ok ${name}\n`);
}
writeFileSync(join(DIR, "winners.json"), JSON.stringify({ winners: out }, null, 2) + "\n");
process.stderr.write(`[winners] wrote ${out.length} purpose-built designs\n`);
