import { useState, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════
// DESIGN TOKENS — white + pink, white stripes  (elevated: richer pinks,
// warm paper surface, layered pink-tinted elevation — palette unchanged)
// ══════════════════════════════════════════════════════════════
const C = {
  bg:"#ffffff", paper:"#fffafc", card:"#ffffff", card2:"#fdf1f6",
  border:"#f1dce6", line:"#ecc7d8",
  pink:"#d76a92", pinkDeep:"#b8446e", pinkSoft:"#f7c9db", wine:"#7c2c49",
  text:"#241a20", soft:"#8a7681", muted:"#bfa8b4", ink:"#ffffff",
  shadow:"0 1px 2px rgba(183,68,110,0.05)",
  shadowSoft:"0 8px 24px -14px rgba(183,68,110,0.22)",
  shadowUp:"0 20px 50px -18px rgba(183,68,110,0.32)",
};
const F = { serif:"'Cormorant Garamond', Georgia, 'Times New Roman', serif", sans:"'Jost', 'Helvetica Neue', Arial, sans-serif" };
// finer, more couture stripe — a delicate 1px pink hairline every 8px
const STRIPES = "repeating-linear-gradient(45deg,#ffffff 0 7px,#f9dcea 7px 8px)";
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap');
:root{--ek-ease:cubic-bezier(.2,.7,.2,1);--ek-ease-soft:cubic-bezier(.33,1,.68,1);}
*{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeLegibility;}
html{scroll-behavior:smooth;}
::selection{background:#f7c9db;color:#a23b64;}
.ek-display{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif;}
.ek-in{transition:border-color .25s var(--ek-ease),box-shadow .25s var(--ek-ease),background .25s;}
.ek-in:focus{border-color:#d76a92 !important;box-shadow:0 0 0 3px rgba(215,106,146,0.14);background:#fffdfe;}
.ek-in::placeholder{color:#cbb6c2;}
.ek-btn{position:relative;overflow:hidden;transition:transform .3s var(--ek-ease),box-shadow .3s var(--ek-ease),opacity .2s,background .3s;}
.ek-btn:not(:disabled):hover{transform:translateY(-2px);}
.ek-btn:not(:disabled):active{transform:translateY(0);}
.ek-btn-pink::after{content:"";position:absolute;top:0;left:-120%;width:55%;height:100%;background:linear-gradient(100deg,transparent,rgba(255,255,255,0.5),transparent);transform:skewX(-18deg);transition:left .75s var(--ek-ease-soft);pointer-events:none;}
.ek-btn-pink:not(:disabled):hover::after{left:135%;}
.ek-btn-pink:not(:disabled):hover{box-shadow:0 16px 32px -12px rgba(183,68,110,0.6) !important;}
.ek-card{transition:transform .4s var(--ek-ease),box-shadow .4s var(--ek-ease),border-color .4s;}
.ek-card:hover{transform:translateY(-5px);box-shadow:0 22px 50px -20px rgba(183,68,110,0.32);border-color:#e9bcd0;}
.ek-imgwrap{overflow:hidden;}
.ek-imgwrap img{transition:transform .8s var(--ek-ease-soft);}
.ek-card:hover .ek-imgwrap img{transform:scale(1.06);}
.ek-nav{position:relative;}
.ek-nav::after{content:"";position:absolute;left:0;right:0;bottom:-6px;height:1px;background:#b8446e;transform:scaleX(0);transform-origin:center;transition:transform .35s var(--ek-ease);}
.ek-nav:hover::after{transform:scaleX(1);}
:focus-visible{outline:2px solid #d76a92;outline-offset:3px;}
@keyframes ekrise{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
.ek-rise{animation:ekrise .9s var(--ek-ease) both;}
.ek-rise-1{animation-delay:.09s;}.ek-rise-2{animation-delay:.18s;}.ek-rise-3{animation-delay:.27s;}.ek-rise-4{animation-delay:.36s;}
@keyframes ekglow{0%,100%{opacity:.65;transform:scale(1);}50%{opacity:1;transform:scale(1.05);}}
.ek-glow{animation:ekglow 10s ease-in-out infinite;}
@media (prefers-reduced-motion:reduce){*{animation:none !important;transition:none !important;scroll-behavior:auto !important;}}
`;

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════
const ADMIN_PASS   = "emilyk2025";
const MIN_STD      = 7;    // custom set: min 1 week
const MIN_RUSH     = 2;    // rush: 2 days
const CUSTOM_FEE   = 10;   // custom (made-ahead) option
const RUSH_FEE     = 20;
const DEPOSIT      = 15;
const SHIP_FEE     = 12;
const ADDON_LO     = 5;
const ADDON_HI     = 10;
const WEEKLY_CAP   = 6;

const SYSTEMS = {
  "Acrylic": [
    {l:"Extra Short",lo:50,hi:55},{l:"Short",lo:55,hi:60},{l:"Medium",lo:60,hi:65},{l:"Long",lo:65,hi:70},
  ],
  "Gel X": [
    {l:"Extra Short",lo:40,hi:45},{l:"Short",lo:45,hi:50},{l:"Medium",lo:50,hi:55},{l:"Long",lo:55,hi:60},
  ],
};
const DELIVERY = [
  {l:"Within 8 miles",fee:10,max:8},
  {l:"9–16 miles",fee:20,max:16},
];
const SLOTS  = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW    = ["S","M","T","W","T","F","S"];

// ══════════════════════════════════════════════════════════════
// SHARED STORAGE (shared=true)
// ══════════════════════════════════════════════════════════════
const sGet = async (k) => { try { const r = await window.storage.get(k, true); return r ? JSON.parse(r.value) : null; } catch { return null; } };
const sSet = async (k,v) => { try { await window.storage.set(k, JSON.stringify(v), true); } catch {} };
const sDel = async (k) => { try { await window.storage.delete(k, true); } catch {} };
const sGetRaw = async (k) => { try { const r = await window.storage.get(k, true); return r ? r.value : null; } catch { return null; } };
const sSetRaw = async (k,v) => { try { await window.storage.set(k, v, true); } catch {} };
// PER-USER STORAGE (shared=false) — best-effort personal saves (My Sets, Favorites)
const uGet = async (k) => { try { const r = await window.storage.get(k, false); return r ? JSON.parse(r.value) : null; } catch { return null; } };
const uSet = async (k,v) => { try { await window.storage.set(k, JSON.stringify(v), false); } catch {} };
// account-scoped keys (shared) so saves follow the customer across devices
const acctKey = (id,what) => `emily_acct_${id}_${what}`;

// ══════════════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════════════
const addDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const todayStr = () => new Date().toISOString().split("T")[0];
const calInfo = (y,m) => ({ first:new Date(y,m,1).getDay(), count:new Date(y,m+1,0).getDate() });
const pad2 = n => String(n).padStart(2,"0");
const dKey = (y,m,d) => `${y}-${pad2(m+1)}-${pad2(d)}`;
const fmtD = s => { if(!s) return ""; const [y,m,d]=s.split("-"); return `${MONTHS[+m-1]} ${+d}, ${y}`; };
const takenKey = (dk,t) => `${dk}|${t}`;
const weekKey = s => { const d=new Date(s+"T00:00:00"); const off=(d.getDay()+6)%7; d.setDate(d.getDate()-off); return d.toISOString().split("T")[0]; };

function haversineMiles(a,b){
  const toRad=d=>d*Math.PI/180, R=3958.8;
  const dLat=toRad(b.lat-a.lat), dLng=toRad(b.lng-a.lng);
  const s=Math.sin(dLat/2)**2+Math.cos(toRad(a.lat))*Math.cos(toRad(b.lat))*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(s));
}
function textEmily(phone, body){
  const num=(phone||"").replace(/[^\d+]/g,"");
  const url=num?`sms:${num}?&body=${encodeURIComponent(body)}`:`sms:?&body=${encodeURIComponent(body)}`;
  window.location.href=url;
}
function fileToData(file){ return new Promise(res=>{ const r=new FileReader(); r.onload=e=>res(e.target.result); r.readAsDataURL(file); }); }

function useVW(){
  const [w,setW]=useState(typeof window!=="undefined"?window.innerWidth:1200);
  useEffect(()=>{ const on=()=>setW(window.innerWidth); window.addEventListener("resize",on); return ()=>window.removeEventListener("resize",on); },[]);
  return w;
}

// ══════════════════════════════════════════════════════════════
// UI PRIMITIVES
// ══════════════════════════════════════════════════════════════
function Btn({ children, onClick, v="pink", size="md", disabled, full, sx={} }){
  const base={position:"relative",cursor:disabled?"not-allowed":"pointer",border:"none",fontFamily:F.sans,letterSpacing:"0.24em",textTransform:"uppercase",fontWeight:500,opacity:disabled?0.36:1,borderRadius:0,width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",whiteSpace:"nowrap",
    ...(size==="sm"?{padding:"10px 19px",fontSize:9.5}:size==="lg"?{padding:"18px 46px",fontSize:11}:{padding:"14px 32px",fontSize:10.5})};
  const vs={
    pink:{background:"linear-gradient(180deg,#df7ba0 0%,#c9567f 100%)",color:C.ink,boxShadow:"0 10px 26px -12px rgba(183,68,110,0.6)"},
    outline:{background:"transparent",color:C.pinkDeep,border:`1px solid ${C.pink}`},
    ghost:{background:"transparent",color:C.soft,border:`1px solid ${C.border}`},
    danger:{background:"transparent",color:"#b5484a",border:"1px solid #d9a3a4"},
  };
  return <button className={`ek-btn ek-btn-${v}`} disabled={disabled} onClick={disabled?undefined:onClick} style={{...base,...vs[v],...sx}}>{children}</button>;
}
function Inp({ label, sx={}, ...p }){
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label&&<label style={{fontSize:10,letterSpacing:"0.16em",color:C.muted,textTransform:"uppercase"}}>{label}</label>}
    <input {...p} className="ek-in" style={{background:C.card,border:`1px solid ${C.border}`,color:C.text,padding:"13px 15px",fontSize:16,fontFamily:F.sans,outline:"none",width:"100%",boxSizing:"border-box",borderRadius:0,...sx}}/>
  </div>);
}
function TA({ label, ...p }){
  return (<div style={{display:"flex",flexDirection:"column",gap:6}}>
    {label&&<label style={{fontSize:10,letterSpacing:"0.16em",color:C.muted,textTransform:"uppercase"}}>{label}</label>}
    <textarea {...p} className="ek-in" style={{background:C.card,border:`1px solid ${C.border}`,color:C.text,padding:"13px 15px",fontSize:16,fontFamily:F.sans,outline:"none",resize:"vertical",minHeight:80,width:"100%",boxSizing:"border-box",borderRadius:0}}/>
  </div>);
}
function PHead({ title, sub }){
  return (<div style={{textAlign:"center",marginBottom:"clamp(38px,7vw,60px)"}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:11,marginBottom:22}}>
      <span style={{width:28,height:1,background:C.line}}/>
      <span style={{width:5,height:5,transform:"rotate(45deg)",background:C.pink}}/>
      <span style={{width:28,height:1,background:C.line}}/>
    </div>
    <h1 className="ek-display" style={{fontSize:"clamp(33px,7.5vw,56px)",fontWeight:500,letterSpacing:"0.01em",color:C.text,margin:"0 0 14px",lineHeight:1.04}}>{title}</h1>
    {sub&&<p style={{color:C.soft,fontSize:"clamp(12px,3.5vw,13px)",letterSpacing:"0.02em",margin:"0 auto",maxWidth:490,lineHeight:1.95}}>{sub}</p>}
  </div>);
}
function InspoUpload({ data, onData, mobile }){
  const ref=useRef(null);
  return (
    <div>
      <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:8}}>INSPO PHOTO (OPTIONAL)</div>
      <div style={{fontSize:11,color:C.muted,marginBottom:12,lineHeight:1.6}}>Already know the look you want? Add a photo of the set for Emily.</div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{ const f=e.target.files[0]; if(f) onData(await fileToData(f)); e.target.value=""; }}/>
      <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
        <Btn v="outline" size="sm" onClick={()=>ref.current?.click()}>{data?"Change Photo":"Add Inspo Photo"}</Btn>
        {data&&<img src={data} alt="inspo" style={{width:52,height:52,objectFit:"cover",border:`1px solid ${C.border}`}}/>}
        {data&&<button onClick={()=>onData(null)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>remove</button>}
      </div>
    </div>
  );
}
function CalGrid({ year, month, onPrev, onNext, renderDay }){
  const {first,count}=calInfo(year,month);
  const cells=[...Array(first).fill(null),...Array.from({length:count},(_,i)=>i+1)];
  return (<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <button onClick={onPrev} style={{background:"none",border:"none",color:C.soft,cursor:"pointer",fontSize:24,padding:"4px 14px",lineHeight:1,fontFamily:"serif"}}>‹</button>
      <div style={{fontSize:12,letterSpacing:"0.16em",color:C.text}}>{MONTHS[month].toUpperCase()} {year}</div>
      <button onClick={onNext} style={{background:"none",border:"none",color:C.soft,cursor:"pointer",fontSize:24,padding:"4px 14px",lineHeight:1,fontFamily:"serif"}}>›</button>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>
      {DOW.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:9,color:C.muted,padding:"4px 0"}}>{d}</div>)}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
      {cells.map((day,i)=><div key={i}>{day?renderDay(day,dKey(year,month,day)):null}</div>)}
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════════
// DEPOSIT PANEL — appears on confirmation; pay the $15 deposit and mark it sent
// ══════════════════════════════════════════════════════════════
function DepositPanel({ pay, orderId, orders, saveOrders, mobile }){
  const [copied,setCopied]=useState("");
  const order=orderId?(orders||[]).find(o=>o.id===orderId):null;
  const paid=!!order?.depositPaid;
  const handles=pay||{};
  const cashTag=(handles.cashApp||"").trim();
  const cashUrl=cashTag?`https://cash.app/${cashTag.startsWith("$")?cashTag:"$"+cashTag}/${DEPOSIT}`:null;
  const copy=(text,label)=>{ try{ navigator.clipboard?.writeText(text); }catch{} setCopied(label); setTimeout(()=>setCopied(""),1600); };
  const markPaid=async()=>{ if(!orderId||!saveOrders)return; await saveOrders((orders||[]).map(o=>o.id===orderId?{...o,depositPaid:true}:o)); };

  const methods=[
    cashUrl&&{key:"cash",label:"Cash App",value:cashTag.startsWith("$")?cashTag:"$"+cashTag,action:()=>window.open(cashUrl,"_blank"),btn:`Send $${DEPOSIT} on Cash App`},
    handles.zelle&&{key:"zelle",label:"Zelle",value:handles.zelle,action:()=>copy(handles.zelle,"zelle"),btn:copied==="zelle"?"Copied ✓":"Copy Zelle Info"},
    handles.applePay&&{key:"apple",label:"Apple Pay",value:handles.applePay,action:()=>copy(handles.applePay,"apple"),btn:copied==="apple"?"Copied ✓":"Copy Apple Pay Info"},
  ].filter(Boolean);

  if(paid) return (
    <div style={{marginTop:30,padding:"20px 22px",background:`${C.pink}0e`,border:`1px solid ${C.pink}55`,display:"flex",alignItems:"center",gap:14,justifyContent:"center"}}>
      <span style={{width:26,height:26,borderRadius:"50%",background:C.pink,color:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>✓</span>
      <span style={{fontSize:13,color:C.pinkDeep,letterSpacing:"0.04em"}}>Deposit marked as sent — thank you! Emily will confirm your spot.</span>
    </div>
  );

  return (
    <div style={{marginTop:34,textAlign:"left",background:C.card,border:`1px solid ${C.border}`,padding:mobile?22:28,boxShadow:C.shadowSoft}}>
      <div style={{fontSize:9,letterSpacing:"0.24em",color:C.pinkDeep,marginBottom:8,textAlign:"center"}}>SECURE YOUR SPOT</div>
      <div className="ek-display" style={{fontSize:24,fontWeight:500,color:C.text,textAlign:"center",marginBottom:6}}>Pay your ${DEPOSIT} deposit</div>
      <p style={{fontSize:12,color:C.soft,textAlign:"center",lineHeight:1.8,margin:"0 auto 22px",maxWidth:380}}>A ${DEPOSIT} deposit confirms your order. Send it with any method below, then tap <b style={{color:C.pinkDeep}}>“I’ve sent it”</b>.</p>
      {methods.length===0 ? (
        <div style={{fontSize:12,color:C.soft,textAlign:"center",lineHeight:1.8,padding:"6px 0 18px"}}>Emily will send you her Apple Pay · Cash App · Zelle details in your text thread — reply there to send the ${DEPOSIT} deposit.</div>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>
          {methods.map(m=>(
            <div key={m.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"12px 14px",border:`1px solid ${C.border}`,background:C.paper,flexWrap:"wrap"}}>
              <div><div style={{fontSize:9,letterSpacing:"0.18em",color:C.pinkDeep,marginBottom:3}}>{m.label.toUpperCase()}</div><div style={{fontSize:13,color:C.text}}>{m.value}</div></div>
              <Btn v={m.key==="cash"?"pink":"outline"} size="sm" onClick={m.action}>{m.btn}</Btn>
            </div>
          ))}
        </div>
      )}
      <Btn v="pink" full onClick={markPaid} disabled={!orderId}>I’ve Sent the ${DEPOSIT} Deposit</Btn>
      <div style={{fontSize:10,color:C.muted,textAlign:"center",marginTop:12,lineHeight:1.7}}>Marking it here just lets Emily know it’s on the way — she’ll confirm once received.</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// NAV
// ══════════════════════════════════════════════════════════════
function IconSearch({ c="#8a7681", s=16 }){ return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.5" y2="16.5"/></svg>); }
function IconHeart({ c=C.pink, fill="none", s=18 }){ return (<svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth="1.6"><path d="M12 20.5S3.5 15 3.5 8.8C3.5 6 5.6 4.2 8 4.2c1.9 0 3.2 1.1 4 2.4.8-1.3 2.1-2.4 4-2.4 2.4 0 4.5 1.8 4.5 4.6C20.5 15 12 20.5 12 20.5z"/></svg>); }
function IconUser({ c=C.soft, s=16 }){ return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.7 2.9-6.2 6.5-6.2s6.5 2.5 6.5 6.2"/></svg>); }

function NailCard({ item, fav, onFav, onOpen, onAdd, addLabel, disabled, mobile }){
  const isProduct=item.type==="product"||item.price!=null;
  return (
    <div className="ek-card" style={{background:C.card,border:`1px solid ${fav?C.pink:C.border}`,overflow:"hidden",position:"relative"}}>
      <button onClick={e=>{e.stopPropagation();onFav&&onFav();}} title="Save to Favorites" style={{position:"absolute",top:8,right:8,zIndex:2,background:"rgba(255,255,255,0.85)",border:"none",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IconHeart c={C.pink} fill={fav?C.pink:"none"} s={16}/></button>
      <div className="ek-imgwrap" onClick={onOpen} style={{cursor:onOpen?"pointer":"default"}}>
        {item.imgUrl?<img src={item.imgUrl} alt={item.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>:<div style={{width:"100%",aspectRatio:"1",background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:11}}>NO IMAGE</div>}
      </div>
      <div style={{padding:mobile?11:14}}>
        <div style={{fontSize:12,color:C.text,marginBottom:4}}>{item.name}</div>
        {(item.cat||item.setNum)&&<div style={{fontSize:9,color:C.pinkDeep,letterSpacing:"0.1em",marginBottom:8}}>{[item.cat,item.setNum?`SET ${item.setNum}`:""].filter(Boolean).join(" · ").toUpperCase()}</div>}
        {isProduct&&<div style={{fontSize:13,color:C.pinkDeep,marginBottom:10}}>${item.price}</div>}
        {onAdd&&<Btn v="ghost" size="sm" full onClick={onAdd} disabled={disabled}>{addLabel||"Add to Set"}</Btn>}
      </div>
    </div>
  );
}

function SetCard({ item, fav, onFav, onOrder, onOpen, mobile }){
  return (
    <div className="ek-card" style={{background:C.card,border:`1px solid ${fav?C.pink:C.border}`,overflow:"hidden",position:"relative"}}>
      <button onClick={e=>{e.stopPropagation();onFav&&onFav();}} title="Save to Favorites" style={{position:"absolute",top:8,right:8,zIndex:2,background:"rgba(255,255,255,0.85)",border:"none",borderRadius:"50%",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IconHeart c={C.pink} fill={fav?C.pink:"none"} s={16}/></button>
      <div className="ek-imgwrap" onClick={onOpen||undefined} style={{cursor:onOpen?"pointer":"default"}}>
        {item.imgUrl?<img src={item.imgUrl} alt={item.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>:<div style={{width:"100%",aspectRatio:"1",background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:11}}>NO IMAGE</div>}
      </div>
      <div style={{padding:16}}>
        <div style={{fontSize:14,color:C.text,marginBottom:4}}>{item.name}</div>
        {(item.cat||item.setNum)&&<div style={{fontSize:9,color:C.pinkDeep,letterSpacing:"0.1em",marginBottom:8}}>{[item.cat,item.setNum?`SET ${item.setNum}`:""].filter(Boolean).join(" · ").toUpperCase()}</div>}
        {item.desc&&<div style={{fontSize:12,color:C.soft,marginBottom:14,lineHeight:1.6}}>{item.desc}</div>}
        <Btn v="pink" size="sm" full onClick={onOrder}>Order This Set</Btn>
      </div>
    </div>
  );
}

function NailDetailModal({ item, gallery, isFav, toggleFav, addNail, orderSet, onClose, mobile }){
  if(!item) return null;
  const num=item.setNum;
  const group=num?gallery.filter(g=>g.setNum===num):[item];
  const fullSet=group.find(g=>g.type==="set");
  const nails=group.filter(g=>g.type!=="set");
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(44,34,41,0.55)",backdropFilter:"blur(3px)",display:"flex",alignItems:"flex-start",justifyContent:"center",overflowY:"auto",padding:mobile?"16px":"40px"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.bg,border:`1px solid ${C.border}`,maxWidth:640,width:"100%",padding:mobile?20:34,position:"relative",boxShadow:C.shadowUp}}>
        <button onClick={onClose} style={{position:"absolute",top:14,right:16,background:"none",border:"none",fontSize:22,color:C.soft,cursor:"pointer",lineHeight:1}}>×</button>
        <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:6}}>{num?`SET ${num}`:"DESIGN"}</div>
        <h2 className="ek-display" style={{fontSize:28,fontWeight:500,letterSpacing:"0.01em",color:C.text,margin:"0 0 18px",lineHeight:1.1}}>{fullSet?fullSet.name:item.name}</h2>
        {fullSet && (
          <div style={{marginBottom:24}}>
            {fullSet.imgUrl&&<img src={fullSet.imgUrl} alt={fullSet.name} style={{width:"100%",maxHeight:300,objectFit:"cover",border:`1px solid ${C.border}`,marginBottom:12}}/>}
            {fullSet.desc&&<div style={{fontSize:13,color:C.soft,lineHeight:1.7,marginBottom:12}}>{fullSet.desc}</div>}
            <Btn v="pink" size="sm" onClick={()=>orderSet(fullSet)}>Order This Full Set</Btn>
          </div>
        )}
        {nails.length>0 && (<>
          <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:12}}>INDIVIDUAL NAILS{num?` · SET ${num}`:""}</div>
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(3,1fr)",gap:10}}>
            {nails.map(n=>(
              <div key={n.id} style={{border:`1px solid ${isFav(n.id)?C.pink:C.border}`,background:C.card,position:"relative"}}>
                <button onClick={()=>toggleFav(n)} style={{position:"absolute",top:6,right:6,background:"rgba(255,255,255,0.85)",border:"none",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><IconHeart c={C.pink} fill={isFav(n.id)?C.pink:"none"} s={14}/></button>
                {n.imgUrl?<img src={n.imgUrl} alt={n.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>:<div style={{width:"100%",aspectRatio:"1",background:C.card2}}/>}
                <div style={{padding:8}}><div style={{fontSize:11,color:C.text,marginBottom:6}}>{n.name}</div><Btn v="ghost" size="sm" full onClick={()=>addNail(n)}>Add to Set</Btn></div>
              </div>
            ))}
          </div>
        </>)}
      </div>
    </div>
  );
}

function Nav({ page, go, cartN, account, mobile }){
  const links=mobile?[{id:"book",l:"Book"},{id:"gallery",l:"Shop"},{id:"sets",l:"Sets"}]:[{id:"home",l:"Home"},{id:"book",l:"Book"},{id:"gallery",l:"Shop"},{id:"sets",l:"Sets"},{id:"prices",l:"Pricing"}];
  return (
    <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:500,background:"rgba(255,255,255,0.94)",backdropFilter:"blur(16px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mobile?"0 12px":"0 36px",height:58}}>
      <div onClick={()=>go("home")} className="ek-nav" style={{cursor:"pointer",color:C.pinkDeep,fontSize:11,letterSpacing:mobile?"0.14em":"0.34em",fontWeight:500,whiteSpace:"nowrap"}}>{mobile?"EMILY K":"EMILY K · NAILS"}</div>
      <div style={{display:"flex",gap:mobile?12:20,alignItems:"center"}}>
        {links.map(({id,l})=><span key={id} className="ek-nav" onClick={()=>go(id)} style={{cursor:"pointer",fontSize:9,letterSpacing:mobile?"0.08em":"0.18em",color:page===id?C.pinkDeep:C.soft,whiteSpace:"nowrap"}}>{l.toUpperCase()}</span>)}
        <span onClick={()=>go("search")} title="Search" style={{cursor:"pointer",display:"flex",alignItems:"center"}}><IconSearch c={page==="search"?C.pinkDeep:C.soft}/></span>
        <span onClick={()=>go("saved")} title="Saved & Favorites" style={{cursor:"pointer",display:"flex",alignItems:"center"}}><IconHeart c={page==="saved"?C.pinkDeep:C.soft} fill={page==="saved"?C.pink:"none"} s={16}/></span>
        <span onClick={()=>go("account")} title={account?"Your account":"Sign in"} style={{cursor:"pointer",display:"flex",alignItems:"center",position:"relative"}}>
          <IconUser c={page==="account"?C.pinkDeep:C.soft}/>
          {account&&<span style={{position:"absolute",top:-2,right:-2,width:6,height:6,borderRadius:"50%",background:C.pink}}/>}
        </span>
        <span onClick={()=>go("cart")} style={{cursor:"pointer",fontSize:9,letterSpacing:mobile?"0.05em":"0.14em",color:page==="cart"?C.pinkDeep:C.soft,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
          CART{cartN>0&&<span style={{background:C.pink,color:C.ink,borderRadius:"50%",width:15,height:15,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700}}>{cartN}</span>}
        </span>
      </div>
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════════════════════
function HomePage({ go, mobile }){
  return (<div>
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"90px 24px 60px",position:"relative",overflow:"hidden",background:"linear-gradient(180deg,#ffffff 0%,#fffafc 100%)"}}>
      <div className="ek-glow" style={{position:"absolute",top:"26%",left:"50%",width:"min(760px,120%)",height:520,transform:"translate(-50%,-50%)",background:"radial-gradient(ellipse 60% 55% at 50% 50%, #fbe3ef 0%, rgba(255,255,255,0) 68%)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",top:0,left:0,right:0,height:7,background:STRIPES}}/>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:7,background:STRIPES}}/>
      <div className="ek-rise" style={{position:"relative",fontSize:"clamp(8px,2.4vw,9px)",letterSpacing:"0.44em",color:C.pinkDeep,marginBottom:28}}>FORT WORTH · HOME STUDIO</div>
      <div className="ek-display ek-rise ek-rise-1" style={{position:"relative",fontSize:"clamp(58px,17vw,132px)",fontWeight:500,letterSpacing:"0.01em",color:C.text,lineHeight:0.9,marginBottom:12}}>Emily K</div>
      <div className="ek-rise ek-rise-1" style={{position:"relative",fontSize:"clamp(11px,3.5vw,15px)",letterSpacing:"0.46em",color:C.pink,marginBottom:34}}>NAILS</div>
      <div className="ek-rise ek-rise-2" style={{position:"relative",display:"flex",alignItems:"center",gap:12,marginBottom:34}}>
        <span style={{width:34,height:1,background:C.line}}/><span style={{width:5,height:5,transform:"rotate(45deg)",background:C.pink}}/><span style={{width:34,height:1,background:C.line}}/>
      </div>
      <p className="ek-rise ek-rise-2" style={{position:"relative",fontSize:"clamp(13px,3.6vw,15px)",color:C.soft,maxWidth:370,lineHeight:2,margin:"0 0 46px"}}>Luxury acrylic & Gel X sets, crafted by hand.<br/>Each design built for you alone.</p>
      <div className="ek-rise ek-rise-3" style={{position:"relative",display:"flex",gap:12,flexWrap:"wrap",justifyContent:"center",width:mobile?"100%":"auto",maxWidth:360}}>
        <Btn v="pink" size="lg" full={mobile} onClick={()=>go("book")}>Book Appointment</Btn>
        <Btn v="outline" size="lg" full={mobile} onClick={()=>go("sets")}>Browse Sets</Btn>
      </div>
    </div>
    <div style={{background:C.card2,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
      <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(3,1fr)"}}>
        {[{t:"Browse Sets",d:"Shop ready-made set designs",id:"sets"},{t:"Build Custom",d:"Pick nails & make your own set",id:"gallery"},{t:"Book In-Person",d:"Get your set done with Emily",id:"book"}].map((f,i)=>(
          <div key={i} onClick={()=>go(f.id)} style={{padding:"38px 30px",textAlign:"center",cursor:"pointer",borderRight:!mobile&&i<2?`1px solid ${C.border}`:"none",borderBottom:mobile&&i<2?`1px solid ${C.border}`:"none"}}>
            <div style={{fontSize:10,letterSpacing:"0.16em",color:C.pinkDeep,marginBottom:8}}>{f.t.toUpperCase()}</div>
            <div style={{fontSize:12,color:C.soft}}>{f.d}</div>
          </div>
        ))}
      </div>
    </div>
    <div style={{maxWidth:1100,margin:"0 auto",padding:"44px 24px",display:"flex",gap:"clamp(28px,6vw,56px)",flexWrap:"wrap",justifyContent:"center",textAlign:"center"}}>
      {[{k:"Location",v:"Fort Worth, TX"},{k:"Payment",v:"Apple Pay · Cash App · Zelle · Cash"},{k:"Deposit",v:"$15 to confirm any order"},{k:"Instagram",v:"@_nailsbyemilyk"}].map(({k,v})=>(
        <div key={k}><div style={{fontSize:9,letterSpacing:"0.22em",color:C.pinkDeep,marginBottom:8}}>{k.toUpperCase()}</div><div style={{fontSize:13,color:C.soft}}>{v}</div></div>
      ))}
    </div>
    <div style={{height:7,background:STRIPES,borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}/>
    <div style={{textAlign:"center",padding:"36px 24px",color:C.muted,fontSize:10,letterSpacing:"0.12em"}}>
      <div style={{color:C.pinkDeep,fontSize:11,marginBottom:8}}>EMILY K NAILS</div>
      <div>Fort Worth · Home Studio · @_nailsbyemilyk</div>
      <div style={{marginTop:12}}><span onClick={()=>go("policy")} style={{cursor:"pointer",color:C.soft,fontSize:10,marginRight:16}}>Policy</span><span onClick={()=>go("admin")} style={{cursor:"pointer",color:C.border,fontSize:11,padding:8}}>·</span></div>
    </div>
  </div>);
}

// ══════════════════════════════════════════════════════════════
// BOOK  (appointment; can carry a chosen set)
// ══════════════════════════════════════════════════════════════
function BookPage({ avail, taken, markTaken, orders, saveOrders, phone, pay, cart, setCart, go, mobile }){
  const now=new Date();
  const [y,setY]=useState(now.getFullYear());
  const [m,setM]=useState(now.getMonth());
  const [selDate,setSel]=useState(null);
  const [selTime,setTime]=useState(null);
  const [form,setForm]=useState({name:"",phone:"",notes:""});
  const [inspo,setInspo]=useState(null);
  const [done,setDone]=useState(false);
  const [lastId,setLastId]=useState(null);

  const today=todayStr();
  const setItems=cart||[];
  const setSummary=setItems.map(c=>c.name).join(", ");
  const openSlots=dk=>(avail[dk]||[]).filter(t=>!taken[takenKey(dk,t)]);
  const hasAny=Object.keys(avail).some(dk=>openSlots(dk).length>0&&dk>=today);
  const onDay=dk=>{ if(dk<today||openSlots(dk).length===0)return; setSel(dk); setTime(null); };

  const submit=async()=>{
    if(!form.name||!form.phone||!selTime)return;
    const id=Date.now();
    if(inspo) await sSetRaw(`emily_inspo_${id}`, inspo);
    const order={id,type:"appointment",createdAt:new Date().toISOString(),name:form.name,phone:form.phone,date:selDate,time:selTime,notes:form.notes,set:setSummary||null,inspoId:inspo?id:null,deposit:DEPOSIT,depositPaid:false};
    await saveOrders([...(orders||[]),order]);
    await markTaken(selDate,selTime);
    const body=`New appointment — Emily K Nails
Name: ${form.name}
Phone: ${form.phone}
Date: ${fmtD(selDate)} at ${selTime}${setSummary?`
Set: ${setSummary}`:""}${form.notes?`
Notes: ${form.notes}`:""}${inspo?`
Inspo photo: sent in the app — see your Admin › Orders tab.`:""}
A $15 deposit is required to confirm (Apple Pay / Cash App / Zelle).`;
    textEmily(phone,body);
    if(setItems.length) setCart([]);
    setLastId(id);
    setDone(true);
  };

  if(done) return (
    <div style={{paddingTop:58,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:490,padding:24}}>
        <div style={{width:60,height:6,margin:"0 auto 22px",background:STRIPES,border:`1px solid ${C.border}`}}/>
        <h2 className="ek-display" style={{fontSize:30,fontWeight:500,letterSpacing:"0.01em",color:C.text,marginBottom:16}}>Appointment Confirmed</h2>
        <p style={{color:C.text,fontSize:15,lineHeight:1.9,marginBottom:16}}>Your appointment has been confirmed, for <span style={{color:C.pinkDeep}}>{fmtD(selDate)}</span> at <span style={{color:C.pinkDeep}}>{selTime}</span>. Looking forward to seeing you :)</p>
        <p style={{color:C.muted,fontSize:13,marginBottom:6,lineHeight:1.8}}>A text to Emily opened with your details — <b style={{color:C.soft}}>hit send</b>. A $15 deposit confirms your spot.</p>
        <DepositPanel pay={pay} orderId={lastId} orders={orders} saveOrders={saveOrders} mobile={mobile}/>
        <div style={{marginTop:26}}><Btn v="outline" onClick={()=>{setDone(false);setSel(null);setTime(null);setForm({name:"",phone:"",notes:""});setInspo(null);setLastId(null);}}>Done</Btn></div>
      </div>
    </div>
  );

  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Book Appointment" sub="Open dates are highlighted. Booked times cross out automatically."/>
        {setItems.length>0 && (
          <div style={{maxWidth:760,margin:"0 auto 28px",background:C.card2,border:`1px solid ${C.pink}55`,padding:16,fontSize:12,color:C.soft,lineHeight:1.7}}>
            Your selected set (<b style={{color:C.pinkDeep}}>{setSummary}</b>) will be made during this appointment.
          </div>
        )}
        {!hasAny ? (
          <div style={{textAlign:"center",padding:"56px 24px",color:C.soft,fontSize:14,lineHeight:2}}>No open availability right now.<br/>DM <span style={{color:C.pinkDeep}}>@_nailsbyemilyk</span> to book.</div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?28:40,alignItems:"start"}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?18:30,boxShadow:C.shadowSoft}}>
              <CalGrid year={y} month={m} onPrev={()=>{ if(m===0){setY(y-1);setM(11);}else setM(m-1); }} onNext={()=>{ if(m===11){setY(y+1);setM(0);}else setM(m+1); }}
                renderDay={(day,dk)=>{ const all=avail[dk]||[]; const open=openSlots(dk).length; const past=dk<today; const full=all.length>0&&open===0&&!past; const avl=open>0&&!past; const sel=selDate===dk;
                  return <div onClick={()=>avl&&onDay(dk)} style={{height:mobile?42:38,display:"flex",alignItems:"center",justifyContent:"center",cursor:avl?"pointer":"default",background:sel?C.pink:avl?`${C.pink}1c`:full?C.card2:"transparent",color:sel?C.ink:avl?C.pinkDeep:full?C.muted:past?"#dcd0d6":C.muted,border:sel?"none":avl?`1px solid ${C.pink}66`:"1px solid transparent",textDecoration:full?"line-through":"none",fontSize:12}}>{day}</div>; }}/>
            </div>
            <div>
              {!selDate ? <div style={{textAlign:"center",color:C.muted,paddingTop:mobile?8:60,fontSize:13}}>Select a highlighted date to continue</div> : (
                <div style={{display:"flex",flexDirection:"column",gap:24}}>
                  <div>
                    <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:14}}>{fmtD(selDate).toUpperCase()}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                      {(avail[selDate]||[]).map(slot=>{ const tk=taken[takenKey(selDate,slot)];
                        return <div key={slot} onClick={()=>!tk&&setTime(slot)} style={{padding:"10px 16px",border:`1px solid ${tk?C.border:selTime===slot?C.pink:C.border}`,cursor:tk?"not-allowed":"pointer",fontSize:12,background:tk?C.card2:selTime===slot?C.pink:C.card,color:tk?C.muted:selTime===slot?C.ink:C.soft,textDecoration:tk?"line-through":"none"}}>{slot}</div>; })}
                    </div>
                  </div>
                  {selTime && (
                    <div style={{display:"flex",flexDirection:"column",gap:14}}>
                      <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep}}>YOUR INFORMATION</div>
                      <Inp label="Full Name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
                      <Inp label="Phone *" type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
                      <TA label="Design ideas / notes" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Length, system, any requests..."/>
                      <InspoUpload data={inspo} onData={setInspo} mobile={mobile}/>
                      <Btn v="pink" full disabled={!form.name||!form.phone} onClick={submit}>Request & Text Emily</Btn>
                      <p style={{fontSize:10,color:C.muted,margin:0,lineHeight:1.9}}>A $15 deposit confirms your spot. $15 late fee after 10 min · cancelled after 15 min.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SHOP  (individual nails → build a custom set)
// ══════════════════════════════════════════════════════════════
function ShopPage({ gallery, cart, setCart, go, mobile, isFav, toggleFav, onSaveMySet }){
  const [filter,setFilter]=useState("all");
  const [detail,setDetail]=useState(null);
  const [naming,setNaming]=useState(false);
  const [setName,setSetName]=useState("");
  const nails=gallery.filter(n=>n.type!=="set");
  const isProduct=n=>n.type==="product"||n.price!=null;
  const cats=["all",...new Set(nails.map(n=>n.cat).filter(Boolean))];
  const shown=filter==="all"?nails:nails.filter(n=>n.cat===filter);
  const designQty=cart.filter(c=>!isProduct(c)&&!c.isSet).reduce((s,c)=>s+c.qty,0);
  const add=n=>{ if(!isProduct(n)&&designQty>=10)return; const ex=cart.find(c=>c.id===n.id); if(ex)setCart(cart.map(c=>c.id===n.id?{...c,qty:c.qty+1}:c)); else setCart([...cart,{...n,qty:1}]); };
  const rem=id=>setCart(cart.filter(c=>c.id!==id));
  const orderSet=x=>{ setCart([{...x,qty:1,isSet:true}]); setDetail(null); go("cart"); };
  const hasDesigns=cart.some(c=>!isProduct(c)&&!c.isSet);
  const saveNow=()=>{ const items=cart.filter(c=>!isProduct(c)&&!c.isSet); if(items.length===0||!setName.trim())return; onSaveMySet(setName.trim(),items); setNaming(false); setSetName(""); };
  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Build a Custom Set" sub="Pick designs to build your set — tap any nail to see its full set. Up to 10 nails."/>
        {nails.length===0 ? <div style={{textAlign:"center",padding:"64px 24px",color:C.soft,fontSize:14,lineHeight:2}}>Designs coming soon.<br/>Follow <span style={{color:C.pinkDeep}}>@_nailsbyemilyk</span>.</div> : (
          <>
            <div style={{display:"flex",gap:8,marginBottom:30,flexWrap:"wrap"}}>{cats.map(c=><Btn key={c} v={filter===c?"pink":"ghost"} size="sm" onClick={()=>setFilter(c)}>{c}</Btn>)}</div>
            <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 300px",gap:mobile?28:36,alignItems:"start"}}>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(185px,1fr))",gap:mobile?12:14}}>
                {shown.map(n=><NailCard key={n.id} item={n} mobile={mobile} fav={isFav(n.id)} onFav={()=>toggleFav(n)} onOpen={()=>setDetail(n)} onAdd={()=>add(n)} addLabel={isProduct(n)?(cart.find(c=>c.id===n.id)?`Added ×${cart.find(c=>c.id===n.id).qty}`:"Add"):(cart.find(c=>c.id===n.id)?`Added ×${cart.find(c=>c.id===n.id).qty}`:"Add to Set")} disabled={!isProduct(n)&&designQty>=10}/>)}
              </div>
              <div style={{background:C.card,border:`1px solid ${C.border}`,padding:24,position:mobile?"static":"sticky",top:74,order:mobile?-1:0,boxShadow:C.shadowSoft}}>
                <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:18}}>YOUR SET ({designQty}/10)</div>
                {cart.length===0?<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"24px 0",lineHeight:1.9}}>Select designs<br/>from the grid</div>:(
                  <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:18}}>{cart.map(it=>(
                    <div key={it.id} style={{display:"flex",alignItems:"center",gap:10}}>
                      {it.imgUrl?<img src={it.imgUrl} alt="" style={{width:40,height:40,objectFit:"cover"}}/>:<div style={{width:40,height:40,background:C.card2}}/>}
                      <div style={{flex:1}}><div style={{fontSize:12,color:C.text}}>{it.name}</div><div style={{fontSize:10,color:C.muted}}>×{it.qty}</div></div>
                      <button onClick={()=>rem(it.id)} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:15,padding:4}}>✕</button>
                    </div>))}
                  </div>
                )}
                <div style={{height:3,background:C.card2,borderRadius:2,marginBottom:4,overflow:"hidden"}}><div style={{height:"100%",width:`${(designQty/10)*100}%`,background:C.pink,transition:"width .4s var(--ek-ease)"}}/></div>
                <div style={{fontSize:9,color:C.muted,marginBottom:18}}>{10-designQty} nails remaining</div>
                {naming ? (
                  <div style={{marginBottom:12,display:"flex",flexDirection:"column",gap:8}}>
                    <Inp label="Name this set" value={setName} onChange={e=>setSetName(e.target.value)} placeholder="e.g. My Summer Set"/>
                    <div style={{display:"flex",gap:8}}><Btn v="pink" size="sm" full onClick={saveNow}>Save</Btn><Btn v="ghost" size="sm" onClick={()=>{setNaming(false);setSetName("");}}>Cancel</Btn></div>
                  </div>
                ) : <Btn v="ghost" size="sm" full sx={{marginBottom:10}} onClick={()=>hasDesigns&&setNaming(true)} disabled={!hasDesigns}>Save to My Sets</Btn>}
                <Btn v={cart.length>0?"pink":"ghost"} full onClick={()=>cart.length>0&&go("cart")} disabled={cart.length===0}>Checkout</Btn>
              </div>
            </div>
          </>
        )}
      </div>
      {detail&&<NailDetailModal item={detail} gallery={gallery} isFav={isFav} toggleFav={toggleFav} addNail={n=>add(n)} orderSet={orderSet} onClose={()=>setDetail(null)} mobile={mobile}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SETS  (browse ready-made full sets)
// ══════════════════════════════════════════════════════════════
function SetsPage({ gallery, setCart, go, mobile, isFav, toggleFav }){
  const [detail,setDetail]=useState(null);
  const sets=gallery.filter(n=>n.type==="set");
  const order=s=>{ setCart([{...s,qty:1,isSet:true}]); go("cart"); };
  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Browse Sets" sub="Ready-made full sets — tap ♡ to save, or order one"/>
        {sets.length===0 ? <div style={{textAlign:"center",padding:"64px 24px",color:C.soft,fontSize:14,lineHeight:2}}>Sets coming soon.<br/>Follow <span style={{color:C.pinkDeep}}>@_nailsbyemilyk</span>.</div> : (
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
            {sets.map(s=><SetCard key={s.id} item={s} mobile={mobile} fav={isFav(s.id)} onFav={()=>toggleFav(s)} onOrder={()=>order(s)} onOpen={s.setNum?()=>setDetail(s):undefined}/>)}
          </div>
        )}
      </div>
      {detail&&<NailDetailModal item={detail} gallery={gallery} isFav={isFav} toggleFav={toggleFav} addNail={n=>setCart(prev=>[...prev,{...n,qty:1}])} orderSet={x=>{order(x);setDetail(null);}} onClose={()=>setDetail(null)} mobile={mobile}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════════════════════════
function SearchPage({ gallery, cart, setCart, go, mobile, isFav, toggleFav }){
  const [q,setQ]=useState("");
  const [detail,setDetail]=useState(null);
  const isProduct=n=>n.type==="product"||n.price!=null;
  const term=q.trim().toLowerCase();
  const results=term?gallery.filter(g=>[g.name,g.cat,g.desc,g.setNum,g.type==="set"?"set full set":"nail design"].filter(Boolean).some(v=>String(v).toLowerCase().includes(term))):[];
  const add=n=>{ const ex=cart.find(c=>c.id===n.id); if(ex)setCart(cart.map(c=>c.id===n.id?{...c,qty:c.qty+1}:c)); else setCart([...cart,{...n,qty:1}]); };
  const orderSet=x=>{ setCart([{...x,qty:1,isSet:true}]); go("cart"); };
  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Search" sub="Find styles, names, categories, or set numbers"/>
        <div style={{maxWidth:520,margin:"0 auto 34px"}}><Inp value={q} onChange={e=>setQ(e.target.value)} placeholder="Search designs, sets, categories..."/></div>
        {!term ? <div style={{textAlign:"center",color:C.muted,fontSize:13,padding:"30px 0"}}>Start typing to search</div>
          : results.length===0 ? <div style={{textAlign:"center",color:C.soft,fontSize:14,padding:"30px 0"}}>No matches for "{q}"</div>
          : (<div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
              {results.map(g=> g.type==="set"
                ? <SetCard key={g.id} item={g} mobile={mobile} fav={isFav(g.id)} onFav={()=>toggleFav(g)} onOrder={()=>orderSet(g)} onOpen={g.setNum?()=>setDetail(g):undefined}/>
                : <NailCard key={g.id} item={g} mobile={mobile} fav={isFav(g.id)} onFav={()=>toggleFav(g)} onOpen={()=>setDetail(g)} onAdd={()=>add(g)} addLabel={isProduct(g)?"Add":"Add to Set"}/>)}
            </div>)}
      </div>
      {detail&&<NailDetailModal item={detail} gallery={gallery} isFav={isFav} toggleFav={toggleFav} addNail={n=>add(n)} orderSet={x=>{orderSet(x);setDetail(null);}} onClose={()=>setDetail(null)} mobile={mobile}/>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ACCOUNT  (customer login — syncs saved sets & favorites across devices)
// ══════════════════════════════════════════════════════════════
function AccountPage({ account, login, signup, logout, go, mySets, favs, mobile }){
  const [mode,setMode]=useState("login");
  const [f,setF]=useState({name:"",phone:"",pass:""});
  const [err,setErr]=useState("");
  const [busy,setBusy]=useState(false);
  const submit=async()=>{
    setErr("");
    if(mode==="signup"&&!f.name.trim()){ setErr("Please enter your name."); return; }
    if(!f.phone.trim()||!f.pass){ setErr("Enter your phone and password."); return; }
    setBusy(true);
    const res=mode==="login"
      ? await login({phone:f.phone.trim(),pass:f.pass})
      : await signup({name:f.name.trim(),phone:f.phone.trim(),pass:f.pass});
    setBusy(false);
    if(res&&res.error){ setErr(res.error); return; }
    setF({name:"",phone:"",pass:""}); go("saved");
  };

  if(account) return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:520,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Your Account" sub="Your saved sets and favorites follow you on any device"/>
        <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?24:32,boxShadow:C.shadowSoft}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:24}}>
            <div style={{width:46,height:46,borderRadius:"50%",background:`${C.pink}18`,display:"flex",alignItems:"center",justifyContent:"center"}}><IconUser c={C.pinkDeep} s={22}/></div>
            <div><div style={{fontSize:17,color:C.text}}>{account.name}</div><div style={{fontSize:12,color:C.muted}}>{account.phone}</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>
            <div style={{background:C.paper,border:`1px solid ${C.border}`,padding:"18px 16px",textAlign:"center"}}><div className="ek-display" style={{fontSize:28,color:C.pinkDeep,lineHeight:1}}>{mySets.length}</div><div style={{fontSize:10,letterSpacing:"0.14em",color:C.muted,marginTop:6}}>MY SETS</div></div>
            <div style={{background:C.paper,border:`1px solid ${C.border}`,padding:"18px 16px",textAlign:"center"}}><div className="ek-display" style={{fontSize:28,color:C.pinkDeep,lineHeight:1}}>{favs.length}</div><div style={{fontSize:10,letterSpacing:"0.14em",color:C.muted,marginTop:6}}>FAVORITES</div></div>
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <Btn v="pink" size="sm" onClick={()=>go("saved")}>View Saved</Btn>
            <Btn v="outline" size="sm" onClick={()=>go("gallery")}>Build a Set</Btn>
            <Btn v="ghost" size="sm" onClick={logout}>Sign Out</Btn>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:440,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title={mode==="login"?"Sign In":"Create Account"} sub="Keep your custom sets and favorites saved across every device"/>
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:28}}>
          {[{k:"login",l:"Sign In"},{k:"signup",l:"Sign Up"}].map(o=><Btn key={o.k} v={mode===o.k?"pink":"ghost"} size="sm" onClick={()=>{setMode(o.k);setErr("");}}>{o.l}</Btn>)}
        </div>
        <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?24:30,display:"flex",flexDirection:"column",gap:16,boxShadow:C.shadowSoft}}>
          {mode==="signup"&&<Inp label="Name *" value={f.name} onChange={e=>setF(v=>({...v,name:e.target.value}))} placeholder="Your name"/>}
          <Inp label="Phone *" type="tel" autoComplete="username" value={f.phone} onChange={e=>setF(v=>({...v,phone:e.target.value}))} placeholder="817-555-0134"/>
          <Inp label="Password *" type="password" autoComplete={mode==="login"?"current-password":"new-password"} value={f.pass} onChange={e=>setF(v=>({...v,pass:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="••••••••"/>
          {err&&<div style={{color:"#b5484a",fontSize:12,lineHeight:1.6}}>{err}</div>}
          <Btn v="pink" full disabled={busy} onClick={submit}>{busy?"Please wait…":mode==="login"?"Sign In":"Create Account"}</Btn>
          <div style={{fontSize:10,color:C.muted,lineHeight:1.7,textAlign:"center"}}>Your account keeps favorites & saved sets in sync. It’s optional — you can always browse and order without one.</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SAVED
// ══════════════════════════════════════════════════════════════
function SavedPage({ mySets, saveMySets, favs, gallery, isFav, toggleFav, cart, setCart, go, account, mobile }){
  const [tab,setTab]=useState("mysets");
  const isProduct=n=>n.type==="product"||n.price!=null;
  const favSets=favs.filter(f=>f.kind==="set").map(f=>gallery.find(g=>g.id===f.id)).filter(Boolean);
  const favNails=favs.filter(f=>f.kind==="nail").map(f=>gallery.find(g=>g.id===f.id)).filter(Boolean);
  const useMySet=x=>{ setCart(x.items.map(i=>({...i,qty:1}))); go("cart"); };
  const delMySet=id=>saveMySets(mySets.filter(m=>m.id!==id));
  const orderSet=x=>{ setCart([{...x,qty:1,isSet:true}]); go("cart"); };
  const add=n=>{ const ex=cart.find(c=>c.id===n.id); if(ex)setCart(cart.map(c=>c.id===n.id?{...c,qty:c.qty+1}:c)); else setCart([...cart,{...n,qty:1}]); };
  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Saved" sub="Your custom sets and favorites"/>
        {account
          ? <div style={{fontSize:11,color:C.pinkDeep,textAlign:"center",marginTop:-34,marginBottom:30,lineHeight:1.6,maxWidth:520,marginLeft:"auto",marginRight:"auto"}}>✓ Synced to your account ({account.name}) — available on any device you sign in on.</div>
          : <div style={{fontSize:11,color:C.muted,textAlign:"center",marginTop:-34,marginBottom:30,lineHeight:1.6,maxWidth:520,marginLeft:"auto",marginRight:"auto"}}>Saved on this device for your visit. <span onClick={()=>go("account")} style={{color:C.pinkDeep,cursor:"pointer"}}>Sign in</span> to keep them across devices.</div>}
        <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:34}}>
          {[{k:"mysets",l:`My Sets (${mySets.length})`},{k:"favs",l:`Favorites (${favSets.length+favNails.length})`}].map(o=><Btn key={o.k} v={tab===o.k?"pink":"ghost"} size="sm" onClick={()=>setTab(o.k)}>{o.l}</Btn>)}
        </div>
        {tab==="mysets" ? (
          mySets.length===0 ? <div style={{textAlign:"center",color:C.soft,fontSize:14,padding:"40px 0",lineHeight:2}}>No saved sets yet.<br/>Build one in <span onClick={()=>go("gallery")} style={{color:C.pinkDeep,cursor:"pointer"}}>Shop</span> and tap "Save to My Sets".</div>
          : <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
              {mySets.map(x=>(
                <div key={x.id} style={{background:C.card,border:`1px solid ${C.border}`,padding:18}}>
                  <div style={{fontSize:14,color:C.text,marginBottom:12}}>{x.name}</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>
                    {x.items.map((it,i)=> it.imgUrl?<img key={i} src={it.imgUrl} alt="" style={{width:38,height:38,objectFit:"cover",border:`1px solid ${C.border}`}}/>:<div key={i} style={{width:38,height:38,background:C.card2}}/>)}
                  </div>
                  <div style={{fontSize:10,color:C.muted,marginBottom:14}}>{x.items.length} nails</div>
                  <div style={{display:"flex",gap:8}}><Btn v="pink" size="sm" full onClick={()=>useMySet(x)}>Use for Checkout</Btn><Btn v="danger" size="sm" onClick={()=>delMySet(x.id)}>✕</Btn></div>
                </div>
              ))}
            </div>
        ) : (
          (favSets.length+favNails.length)===0 ? <div style={{textAlign:"center",color:C.soft,fontSize:14,padding:"40px 0",lineHeight:2}}>No favorites yet.<br/>Tap the ♡ on any nail or set to save it here.</div>
          : <div style={{display:"flex",flexDirection:"column",gap:34}}>
              {favSets.length>0 && (<div>
                <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:16}}>FAVORITE SETS</div>
                <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:16}}>
                  {favSets.map(x=><SetCard key={x.id} item={x} mobile={mobile} fav={true} onFav={()=>toggleFav(x)} onOrder={()=>orderSet(x)}/>)}
                </div>
              </div>)}
              {favNails.length>0 && (<div>
                <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:6}}>FAVORITE NAILS</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:16}}>Saved for reference — add any to your current set.</div>
                <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(185px,1fr))",gap:14}}>
                  {favNails.map(n=><NailCard key={n.id} item={n} mobile={mobile} fav={true} onFav={()=>toggleFav(n)} onAdd={()=>add(n)} addLabel={isProduct(n)?"Add":"Add to Set"}/>)}
                </div>
              </div>)}
            </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// CART / CHECKOUT
// ══════════════════════════════════════════════════════════════
function CartPage({ cart, setCart, gallery, orders, saveOrders, phone, pay, loc, mySets, favs, go, mobile }){
  const [mode,setMode]=useState("custom");      // custom | appointment
  const [system,setSystem]=useState(null);
  const [length,setLength]=useState(null);
  const [addonsOn,setAddonsOn]=useState(false);
  const [speed,setSpeed]=useState("Standard");  // Standard | Rush
  const [fulfill,setFulfill]=useState(null);     // Pickup | Delivery | Ship
  const [zone,setZone]=useState(null);
  const [miles,setMiles]=useState(null);
  const [geoErr,setGeoErr]=useState("");
  const [geoBusy,setGeoBusy]=useState(false);
  const [ready,setReady]=useState("");
  const [form,setForm]=useState({name:"",phone:"",address:"",notes:""});
  const [inspo,setInspo]=useState(null);
  const [done,setDone]=useState(false);
  const [capErr,setCapErr]=useState("");
  const [lastId,setLastId]=useState(null);

  const isProduct=c=>c.type==="product"||c.price!=null;
  const products=cart.filter(isProduct);
  const designItems=cart.filter(c=>!isProduct(c));
  const rush=speed==="Rush";
  const minDays=rush?MIN_RUSH:MIN_STD;
  const minReady=addDays(minDays);
  const lenObj=SYSTEMS[system]?.find(l=>l.l===length);
  const baseLo=lenObj?lenObj.lo:0, baseHi=lenObj?lenObj.hi:0;
  const zoneObj=zone;
  const delFee=fulfill==="Delivery"&&zoneObj?zoneObj.fee:0;
  const shipFee=fulfill==="Ship"?SHIP_FEE:0;
  const rushFee=rush?RUSH_FEE:0;
  const addFee=addonsOn?ADDON_LO:0;
  const prodT=products.reduce((s,c)=>s+(c.price||0)*c.qty,0);
  const estLo=(lenObj?baseLo+CUSTOM_FEE+addFee+rushFee:0)+delFee+shipFee+prodT;
  const estHi=(lenObj?baseHi+CUSTOM_FEE+ADDON_HI+rushFee:0)+delFee+shipFee+prodT; // rough upper

  // rush restricts fulfillment: pickup or delivery(≤16) only — clear Ship
  useEffect(()=>{ if(rush&&fulfill==="Ship"){ setFulfill(null); setZone(null); setMiles(null); } },[rush]); // eslint-disable-line

  const glueItem=gallery?.find(g=>g.id==="product_glue");
  const hasGlue=cart.some(c=>c.id==="product_glue");
  const addGlue=()=>{ if(!glueItem)return; const ex=cart.find(c=>c.id==="product_glue"); if(ex)setCart(cart.map(c=>c.id==="product_glue"?{...c,qty:c.qty+1}:c)); else setCart([...cart,{...glueItem,qty:1}]); };

  const geocodeAddress=async()=>{
    setGeoErr("");
    if(!form.address.trim()){ setGeoErr("Enter your address first."); return; }
    if(!loc||loc.lat==null){ setGeoErr("Auto distance isn't set up — choose your range below."); return; }
    setGeoBusy(true);
    try{
      const url=`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(form.address)}`;
      const r=await fetch(url); const data=await r.json();
      if(!data||!data.length){ setGeoErr("Couldn't find that address — check it or choose your range."); setGeoBusy(false); return; }
      const d=haversineMiles({lat:+data[0].lat,lng:+data[0].lon},loc);
      setMiles(d);
      if(d<=8) setZone(DELIVERY[0]); else if(d<=16) setZone(DELIVERY[1]);
      else { setZone(null); setGeoErr("That address is outside the 16-mile delivery range — try Ship, or DM @_nailsbyemilyk."); }
    }catch{ setGeoErr("Address lookup is blocked here — choose your range below."); }
    setGeoBusy(false);
  };
  const geolocate=()=>{
    setGeoErr("");
    if(!loc||loc.lat==null){ setGeoErr("Auto distance isn't set up — choose your range below."); return; }
    if(!navigator.geolocation){ setGeoErr("Location unavailable — choose your range below."); return; }
    navigator.geolocation.getCurrentPosition(pos=>{ const d=haversineMiles({lat:pos.coords.latitude,lng:pos.coords.longitude},loc); setMiles(d);
      if(d<=8) setZone(DELIVERY[0]); else if(d<=16) setZone(DELIVERY[1]); else { setZone(null); setGeoErr("Outside the 16-mile range — try Ship or DM Emily."); }
    },()=>setGeoErr("Couldn't read location — allow access or choose your range."),{enableHighAccuracy:true,timeout:10000});
  };

  const weekCount = ready ? (orders||[]).filter(o=>o.type==="custom"&&o.readyDate&&weekKey(o.readyDate)===weekKey(ready)).length : 0;
  const weekFull = ready && weekCount>=WEEKLY_CAP;

  const bookAppt=()=>go("book"); // set carries via cart

  const placeCustom=async()=>{
    setCapErr("");
    if(weekFull){ setCapErr(`That week is full for custom sets (max ${WEEKLY_CAP}). Pick a later ready-by date — or book an appointment instead (no weekly limit).`); return; }
    const id=Date.now();
    if(inspo) await sSetRaw(`emily_inspo_${id}`, inspo);
    const designs=designItems.map(c=>`${c.name}${c.qty>1?` x${c.qty}`:""}`).join(", ")||"none";
    const extras=products.map(c=>`${c.name} ($${c.price})`).join(", ")||"none";
    const fulfilLine=fulfill==="Delivery"?`Delivery (${zone?.l}${miles!=null?`, ~${miles.toFixed(1)} mi`:""}, +$${delFee})`:fulfill==="Ship"?`Ship — contiguous U.S. (+$${SHIP_FEE})`:"Pickup";
    const browsed=cart.some(c=>c.isSet);
    const buildLine=browsed?"Browsed full set":"Custom set — nails picked individually";
    const order={id,type:"custom",createdAt:new Date().toISOString(),name:form.name,phone:form.phone,system,length,speed,fulfillment:fulfill,shipFee:fulfill==="Ship"?SHIP_FEE:0,deliveryFee:delFee,addons:addonsOn,readyDate:ready,estLo,address:form.address||null,notes:form.notes,set:cart.find(c=>c.isSet)?.name||null,designs,built:buildLine,inspoId:inspo?id:null,deposit:DEPOSIT,depositPaid:false};
    await saveOrders([...(orders||[]),order]);
    const body=`New custom set order — Emily K Nails
Name: ${form.name}
Phone: ${form.phone}
Type: ${buildLine}
Set/Designs: ${cart.find(c=>c.isSet)?.name||designs}
System: ${system} · Length: ${length}
Add-ons: ${addonsOn?"yes (+$5–10)":"no"}
Speed: ${speed}${rush?" (+$20, 2-day)":""}
Fulfillment: ${fulfilLine}${form.address?`
Address: ${form.address}`:""}
Extras: ${extras}
Ready by: ${fmtD(ready)}
Est. total: $${estLo}+ (incl. $${CUSTOM_FEE} customization)${form.notes?`
Notes: ${form.notes}`:""}${inspo?`
Inspo photo: sent in the app — see your Admin › Orders tab.`:""}
A $15 deposit is required to confirm (Apple Pay / Cash App / Zelle).

--- day-before reminder to send ${form.name} ---
Hello just a reminder tomorrow is ${fulfill==="Delivery"?"delivery":fulfill==="Ship"?"ship-out":"pickup"} day of your set :)`;
    textEmily(phone,body);
    setCart([]); setLastId(id); setDone(true);
  };

  if(done) return (
    <div style={{paddingTop:58,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",maxWidth:500,padding:24}}>
        <div style={{width:60,height:6,margin:"0 auto 22px",background:STRIPES,border:`1px solid ${C.border}`}}/>
        <h2 className="ek-display" style={{fontSize:30,fontWeight:500,letterSpacing:"0.01em",color:C.text,marginBottom:16}}>Order Confirmed</h2>
        <p style={{color:C.text,fontSize:15,lineHeight:1.9,marginBottom:16}}>Your custom gallery set has been confirmed. Your order will be ready to <span style={{color:C.pinkDeep}}>{fulfill==="Delivery"?"be delivered":fulfill==="Ship"?"ship out":"pick up"}</span> on <span style={{color:C.pinkDeep}}>{fmtD(ready)}</span>. Thank you for your purchase :)</p>
        <p style={{color:C.muted,fontSize:13,marginBottom:6,lineHeight:1.8}}>A text to Emily opened with your order — <b style={{color:C.soft}}>hit send</b>. A $15 deposit confirms it.</p>
        <DepositPanel pay={pay} orderId={lastId} orders={orders} saveOrders={saveOrders} mobile={mobile}/>
        <div style={{marginTop:26}}><Btn v="outline" onClick={()=>go("home")}>Back to Home</Btn></div>
      </div>
    </div>
  );

  if(cart.length===0) return (
    <div style={{paddingTop:58,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center",padding:24}}>
        <div style={{color:C.soft,fontSize:14,marginBottom:32}}>Your set is empty</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
          <Btn v="pink" onClick={()=>go("sets")}>Browse Sets</Btn>
          <Btn v="outline" onClick={()=>go("gallery")}>Build a Set</Btn>
        </div>
      </div>
    </div>
  );

  const lenList=system?SYSTEMS[system]:[];

  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Your Set" sub="Choose how you'd like it done, then finalize details"/>

        {/* MODE */}
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:12,marginBottom:34,maxWidth:760,marginLeft:"auto",marginRight:"auto"}}>
          {[{k:"custom",t:"Custom Set (made ahead)",d:"Emily makes it — pick up, delivery, or shipping"},{k:"appointment",t:"In an Appointment",d:"Get this set done with Emily in person"}].map(o=>(
            <div key={o.k} onClick={()=>setMode(o.k)} style={{padding:"20px 22px",border:`1px solid ${mode===o.k?C.pink:C.border}`,background:mode===o.k?`${C.pink}12`:C.card,cursor:"pointer"}}>
              <div style={{fontSize:12,letterSpacing:"0.08em",color:mode===o.k?C.pinkDeep:C.text,marginBottom:6}}>{o.t.toUpperCase()}</div>
              <div style={{fontSize:12,color:C.soft,lineHeight:1.5}}>{o.d}</div>
            </div>
          ))}
        </div>

        {mode==="appointment" ? (
          <div style={{textAlign:"center",maxWidth:560,margin:"0 auto"}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?24:32,boxShadow:C.shadowSoft}}>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:14}}>SELECTED</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",marginBottom:22}}>
                {cart.map(it=> it.imgUrl?<img key={it.id} src={it.imgUrl} alt="" style={{width:60,height:60,objectFit:"cover",border:`1px solid ${C.border}`}}/>:<div key={it.id} style={{width:60,height:60,background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.muted}}>SET</div>)}
              </div>
              <p style={{fontSize:13,color:C.soft,lineHeight:1.8,marginBottom:24}}>You'll pick your date and time on the booking page. Your set comes with you and is made during the appointment.</p>
              <Btn v="pink" onClick={bookAppt}>Continue to Booking</Btn>
              <div style={{fontSize:10,color:C.muted,marginTop:14}}>A $15 deposit confirms your appointment.</div>
            </div>
          </div>
        ) : (
        <>
        {(mySets.length>0 || favs.some(f=>f.kind==="set")) && (
          <div style={{maxWidth:1100,margin:"0 auto 26px"}}>
            <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:10,textAlign:"center"}}>START FROM A SAVED SET (OPTIONAL)</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {mySets.map(x=><Btn key={x.id} v="ghost" size="sm" onClick={()=>setCart(x.items.map(i=>({...i,qty:1})))}>My: {x.name}</Btn>)}
              {favs.filter(f=>f.kind==="set").map(f=>gallery.find(g=>g.id===f.id)).filter(Boolean).map(x=><Btn key={x.id} v="ghost" size="sm" onClick={()=>setCart([{...x,qty:1,isSet:true}])}>♥ {x.name}</Btn>)}
            </div>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 340px",gap:mobile?32:44,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:32}}>
            {/* selected */}
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:16}}>SELECTED</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
                {cart.map(it=><div key={it.id} style={{textAlign:"center"}}>{it.imgUrl?<img src={it.imgUrl} alt="" style={{width:64,height:64,objectFit:"cover",border:`1px solid ${C.border}`}}/>:<div style={{width:64,height:64,background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,color:C.muted}}>{it.isSet?"SET":"◇"}</div>}<div style={{fontSize:9,color:C.muted,marginTop:3,maxWidth:64,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.name}</div></div>)}
              </div>
            </div>
            {/* system */}
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:12}}>SYSTEM</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {Object.keys(SYSTEMS).map(s=><div key={s} onClick={()=>{setSystem(s);setLength(null);}} style={{padding:"12px 22px",border:`1px solid ${system===s?C.pink:C.border}`,cursor:"pointer",background:system===s?`${C.pink}12`:C.card,color:system===s?C.pinkDeep:C.text,fontSize:13}}>{s}</div>)}
              </div>
            </div>
            {/* length */}
            {system && (
              <div>
                <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:6}}>LENGTH</div>
                <div style={{fontSize:11,color:C.muted,marginBottom:14}}>Pricing is based on length ({system}).</div>
                <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(150px,1fr))",gap:8}}>
                  {lenList.map(o=><div key={o.l} onClick={()=>setLength(o.l)} style={{padding:"12px 14px",border:`1px solid ${length===o.l?C.pink:C.border}`,cursor:"pointer",background:length===o.l?`${C.pink}12`:C.card}}><div style={{fontSize:12,color:length===o.l?C.pinkDeep:C.text}}>{o.l}</div><div style={{fontSize:11,color:C.soft}}>${o.lo}–{o.hi}</div></div>)}
                </div>
              </div>
            )}
            {/* add-ons */}
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:12}}>ADD-ONS</div>
              <div onClick={()=>setAddonsOn(v=>!v)} style={{padding:"12px 16px",border:`1px solid ${addonsOn?C.pink:C.border}`,cursor:"pointer",background:addonsOn?`${C.pink}12`:C.card,display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:mobile?"100%":300}}>
                <span style={{fontSize:13,color:addonsOn?C.pinkDeep:C.text}}>Add-ons (art, charms, etc.)</span><span style={{fontSize:12,color:C.soft}}>+$5–10</span>
              </div>
            </div>
            {/* speed */}
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:6}}>SPEED</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:12}}>Standard needs 1 week. Rush is ready in 2 days (pickup or ≤16 mi delivery only).</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[{k:"Standard",t:"Standard · 1 week"},{k:"Rush",t:"Rush · 2 days (+$20)"}].map(o=><div key={o.k} onClick={()=>{setSpeed(o.k);setReady("");}} style={{padding:"12px 18px",border:`1px solid ${speed===o.k?C.pink:C.border}`,cursor:"pointer",background:speed===o.k?`${C.pink}12`:C.card,color:speed===o.k?C.pinkDeep:C.text,fontSize:13}}>{o.t}</div>)}
              </div>
            </div>
            {/* fulfillment */}
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:6}}>PICKUP · DELIVERY · SHIP</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:12,lineHeight:1.6}}>Custom sets deliver to your home. Pickup and out-of-state shipping (contiguous U.S.) are also available.{rush?" Rush is pickup or ≤16 mi delivery only.":""}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {["Pickup","Delivery",...(rush?[]:["Ship"])].map(f=><div key={f} onClick={()=>{setFulfill(f); if(f!=="Delivery"){setZone(null);setMiles(null);setGeoErr("");}}} style={{padding:"12px 22px",border:`1px solid ${fulfill===f?C.pink:C.border}`,cursor:"pointer",background:fulfill===f?`${C.pink}12`:C.card,color:fulfill===f?C.pinkDeep:C.text,fontSize:13}}>{f}</div>)}
              </div>
              {fulfill==="Ship" && <div style={{marginTop:12,padding:"10px 12px",background:`${C.pink}12`,border:`1px solid ${C.pink}55`,fontSize:12,color:C.pinkDeep}}>Shipping (contiguous U.S. only) — +${SHIP_FEE}</div>}
              {fulfill==="Delivery" && (
                <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:14}}>
                  <Inp label="Delivery Address *" value={form.address} onChange={e=>{setForm(f=>({...f,address:e.target.value}));setMiles(null);setGeoErr("");}} placeholder="Street, city, state, ZIP"/>
                  <div>
                    <div style={{fontSize:9,letterSpacing:"0.18em",color:C.pinkDeep,marginBottom:6}}>DELIVERY FEE</div>
                    <div style={{fontSize:11,color:C.muted,marginBottom:12,lineHeight:1.6}}>Enter your address and calculate — the fee applies automatically by distance.</div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <Btn v="pink" size="sm" disabled={geoBusy} onClick={geocodeAddress}>{geoBusy?"Calculating…":"Calculate From Address"}</Btn>
                      <Btn v="ghost" size="sm" onClick={geolocate}>Use Current Location</Btn>
                    </div>
                    {geoErr&&<div style={{fontSize:11,color:"#b5484a",marginTop:10,lineHeight:1.6}}>{geoErr}</div>}
                    {miles!=null&&zone&&<div style={{marginTop:12,padding:"10px 12px",background:`${C.pink}12`,border:`1px solid ${C.pink}55`,fontSize:12,color:C.pinkDeep}}>~{miles.toFixed(1)} mi · {zone.l} (+${zone.fee})</div>}
                    <div style={{fontSize:10,color:C.muted,marginTop:14,marginBottom:8,letterSpacing:"0.06em"}}>OR CHOOSE YOUR RANGE</div>
                    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:8}}>
                      {DELIVERY.map(d=><div key={d.l} onClick={()=>{setZone(d);setMiles(null);setGeoErr("");}} style={{padding:"12px 16px",border:`1px solid ${zone?.l===d.l?C.pink:C.border}`,cursor:"pointer",background:zone?.l===d.l?`${C.pink}12`:C.card,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:13,color:zone?.l===d.l?C.pinkDeep:C.text}}>{d.l}</span><span style={{fontSize:12,color:C.soft}}>+${d.fee}</span></div>)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* ready date */}
            <div>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:8}}>READY BY DATE</div>
              <div style={{fontSize:11,color:C.muted,marginBottom:6}}>{rush?"Rush — earliest is 2 days out":"Standard — minimum 1 week"}: {minReady}</div>
              {weekFull && <div style={{fontSize:11,color:"#b5484a",marginBottom:10}}>That week is full for custom sets ({WEEKLY_CAP}/{WEEKLY_CAP}) — choose a later date, or book an appointment (no limit).</div>}
              <Inp type="date" value={ready} min={minReady} onChange={e=>{setReady(e.target.value);setCapErr("");}} sx={{maxWidth:mobile?"100%":220}}/>
            </div>
            {/* contact */}
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep}}>CONTACT INFORMATION</div>
              <Inp label="Full Name *" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
              <Inp label="Phone *" type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))}/>
              <TA label="Notes" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Anything else for Emily..."/>
              <InspoUpload data={inspo} onData={setInspo} mobile={mobile}/>
            </div>
          </div>

          {/* summary */}
          <div style={{background:C.card,border:`1px solid ${C.border}`,padding:28,position:mobile?"static":"sticky",top:74,boxShadow:C.shadowSoft}}>
            <div style={{fontSize:9,letterSpacing:"0.2em",color:C.pinkDeep,marginBottom:22}}>ORDER SUMMARY</div>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
              {[{k:"System",v:system||"—"},{k:"Length",v:length||"—"},{k:"Base Price",v:lenObj?`$${baseLo}–${baseHi}`:"—"},{k:"Speed",v:speed}].map(({k,v})=>(
                <div key={k} style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>{k}</span><span style={{fontSize:12,color:C.text}}>{v}</span></div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 12px",background:`${C.pink}12`,border:`1px solid ${C.pink}55`}}><span style={{fontSize:11,color:C.pinkDeep}}>Customization</span><span style={{fontSize:12,color:C.pinkDeep}}>+${CUSTOM_FEE}</span></div>
              {addonsOn&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>Add-ons</span><span style={{fontSize:12,color:C.text}}>+$5–10</span></div>}
              {rush&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>Rush (2-day)</span><span style={{fontSize:12,color:C.text}}>+${RUSH_FEE}</span></div>}
              {fulfill==="Delivery"&&zone&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>Delivery ({zone.l})</span><span style={{fontSize:12,color:C.text}}>+${zone.fee}</span></div>}
              {fulfill==="Ship"&&<div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>Shipping</span><span style={{fontSize:12,color:C.text}}>+${SHIP_FEE}</span></div>}
              {products.map(p=><div key={p.id} style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>{p.name}{p.qty>1?` ×${p.qty}`:""}</span><span style={{fontSize:12,color:C.text}}>+${p.price*p.qty}</span></div>)}
              <div style={{height:1,background:C.border}}/>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:C.text}}>Estimated Total</span><span style={{fontSize:15,color:C.pinkDeep}}>{lenObj?`$${estLo}+`:"—"}</span></div>
              <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:C.soft}}>Deposit to confirm</span><span style={{fontSize:13,color:C.pinkDeep}}>${DEPOSIT}</span></div>
            </div>
            <div style={{fontSize:10,color:C.muted,marginBottom:18,lineHeight:1.8}}>A <span style={{color:C.pinkDeep}}>$15 deposit</span> is required to confirm any order. Final price may vary with design complexity.</div>
            {!hasGlue&&glueItem&&(
              <div style={{background:`${C.pink}0d`,border:`1px solid ${C.pink}55`,padding:14,marginBottom:16}}>
                <div style={{fontSize:12,color:C.text,marginBottom:6}}>Don't forget nail glue</div>
                <div style={{fontSize:11,color:C.soft,marginBottom:12,lineHeight:1.6}}>Keep your set secure at home — add nail glue for $5.</div>
                <Btn v="outline" size="sm" full onClick={addGlue}>Add Nail Glue · $5</Btn>
              </div>
            )}
            {capErr&&<div style={{fontSize:11,color:"#b5484a",marginBottom:12,lineHeight:1.6}}>{capErr}</div>}
            <Btn v="pink" full disabled={!form.name||!form.phone||!system||!length||!ready||!fulfill||weekFull||(fulfill==="Delivery"&&(!zone||!form.address))} onClick={placeCustom}>Place Order & Text Emily</Btn>
            <div style={{fontSize:10,color:C.muted,marginTop:14,textAlign:"center",lineHeight:1.8}}>Apple Pay · Cash App · Zelle · Cash</div>
          </div>
        </div>
        </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PRICES
// ══════════════════════════════════════════════════════════════
function PriceTable({ title, rows }){
  return (
    <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"clamp(24px,5vw,34px)"}}>
      <div style={{fontSize:9,letterSpacing:"0.22em",color:C.pinkDeep,marginBottom:22}}>{title}</div>
      {rows.map(({l,lo,hi})=><div key={l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:C.text}}>{l}</span><span style={{fontSize:14,color:C.pinkDeep}}>${lo}–{hi}</span></div>)}
    </div>
  );
}
function PricesPage({ mobile }){
  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Pricing" sub="Sets priced by length. Price increases with designs."/>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:20,marginBottom:20}}>
          <PriceTable title="ACRYLIC" rows={SYSTEMS["Acrylic"]}/>
          <PriceTable title="GEL X" rows={SYSTEMS["Gel X"]}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:20,marginBottom:20}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"clamp(24px,5vw,34px)"}}>
            <div style={{fontSize:9,letterSpacing:"0.22em",color:C.pinkDeep,marginBottom:18}}>EXTRAS</div>
            {[{l:"Add-ons (art, charms, etc.)",v:"$5–10"},{l:"Customization (custom set)",v:"+$10"},{l:"Rush (ready in 2 days)",v:"+$20"},{l:"Deposit to confirm",v:"$15"},{l:"Nail glue",v:"$5"}].map(x=><div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:C.text}}>{x.l}</span><span style={{fontSize:13,color:C.pinkDeep}}>{x.v}</span></div>)}
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,padding:"clamp(24px,5vw,34px)"}}>
            <div style={{fontSize:9,letterSpacing:"0.22em",color:C.pinkDeep,marginBottom:18}}>DELIVERY & SHIPPING</div>
            {[{l:"Within 8 miles",v:"+$10"},{l:"9–16 miles",v:"+$20"},{l:"Ship — contiguous U.S.",v:"+$12"}].map(x=><div key={x.l} style={{display:"flex",justifyContent:"space-between",padding:"12px 0",borderBottom:`1px solid ${C.border}`}}><span style={{fontSize:13,color:C.text}}>{x.l}</span><span style={{fontSize:13,color:C.pinkDeep}}>{x.v}</span></div>)}
            <div style={{fontSize:11,color:C.muted,marginTop:14,lineHeight:1.7}}>Custom sets are delivered to your home. Pickup and out-of-state shipping (contiguous U.S. only) also available.</div>
          </div>
        </div>
        <div style={{background:C.card2,border:`1px solid ${C.border}`,padding:22,textAlign:"center",fontSize:12,color:C.soft,letterSpacing:"0.03em"}}>Accepted: Apple Pay · Cash App · Zelle · Cash</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// POLICY
// ══════════════════════════════════════════════════════════════
function PolicyPage(){
  const sects=[
    {t:"Deposit & Booking",items:["A $15 deposit is required to confirm any appointment or custom order.","Custom sets need at least 1 week's notice (rush option: 2 days).","Max 6 custom (made-ahead) sets per week. Appointments are unlimited — you can always book one."]},
    {t:"Late Policy",items:["10–15 minutes late: a $15 late fee.","After 15 minutes: appointment cancelled.","Please be on time :)"]},
    {t:"Delivery & Shipping",items:["Custom sets deliver to your home.","Delivery within 16 miles; out-of-state shipping to contiguous U.S. only.","Priority (rush) sets are pickup or ≤16 mi delivery only.","Delivery is arranged upon communication."]},
    {t:"General",items:["Come with bare hands (unless booked for soak-off).","Payment: Apple Pay, Cash App, Zelle, or Cash."]},
  ];
  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:720,margin:"0 auto",padding:"clamp(44px,10vw,78px) 20px"}}>
        <PHead title="Policy" sub="Please read before booking"/>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {sects.map(({t,items})=>(
            <div key={t} style={{background:C.card,border:`1px solid ${C.border}`,padding:"clamp(24px,6vw,34px)"}}>
              <div style={{fontSize:9,letterSpacing:"0.22em",color:C.pinkDeep,marginBottom:20}}>{t.toUpperCase()}</div>
              <ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:14}}>
                {items.map((it,i)=><li key={i} style={{display:"flex",gap:12,alignItems:"flex-start"}}><span style={{color:C.pink,flexShrink:0,marginTop:3,fontSize:9}}>◆</span><span style={{fontSize:14,color:C.soft,lineHeight:1.8}}>{it}</span></li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ADMIN LOGIN
// ══════════════════════════════════════════════════════════════
function AdminLogin({ onLogin }){
  const [pw,setPw]=useState(""); const [err,setErr]=useState(false);
  const go=()=>{ if(pw===ADMIN_PASS)onLogin(); else{setErr(true);setPw("");} };
  return (
    <div style={{paddingTop:58,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{width:"100%",maxWidth:380,padding:24}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <div style={{width:60,height:6,margin:"0 auto 16px",background:STRIPES,border:`1px solid ${C.border}`}}/>
          <h2 className="ek-display" style={{fontSize:26,fontWeight:500,letterSpacing:"0.02em",color:C.text}}>Admin Access</h2>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          <Inp label="Password" type="password" value={pw} onChange={e=>{setPw(e.target.value);setErr(false);}} onKeyDown={e=>e.key==="Enter"&&go()} placeholder="Enter password"/>
          {err&&<div style={{color:"#b5484a",fontSize:12}}>Incorrect password</div>}
          <Btn v="pink" full onClick={go}>Enter</Btn>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// INSPO THUMB (lazy load)
// ══════════════════════════════════════════════════════════════
function InspoThumb({ id }){
  const [src,setSrc]=useState(null);
  useEffect(()=>{ let on=true; (async()=>{ const d=await sGetRaw(`emily_inspo_${id}`); if(on)setSrc(d); })(); return ()=>{on=false;}; },[id]);
  if(!src) return null;
  return <a href={src} target="_blank" rel="noreferrer"><img src={src} alt="inspo" style={{width:64,height:64,objectFit:"cover",border:`1px solid ${C.border}`}}/></a>;
}

// ══════════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════════
function AdminPage({ avail, setAvail, saveAvail, taken, setTaken, saveTaken, gallery, setGallery, orders, saveOrders, phone, savePhone, loc, saveLoc, pay, savePay, logout, mobile }){
  const [tab,setTab]=useState("avail");
  const [calY,setCalY]=useState(new Date().getFullYear());
  const [calM,setCalM]=useState(new Date().getMonth());
  const [selDate,setSelDate]=useState(null);
  const [slots,setSlots]=useState([]);
  const [saved,setSaved]=useState(false);
  const [availView,setAvailView]=useState("month");
  const [weekStart,setWeekStart]=useState(()=>{ const x=new Date(); const off=(x.getDay()+6)%7; x.setDate(x.getDate()-off+7); x.setHours(0,0,0,0); return x; });
  const [weekDraft,setWeekDraft]=useState({});
  const [nName,setNName]=useState(""); const [nCat,setNCat]=useState(""); const [nSet,setNSet]=useState(""); const [nDesc,setNDesc]=useState(""); const [nPrice,setNPrice]=useState(""); const [nType,setNType]=useState("design");
  const [phoneDraft,setPhoneDraft]=useState(phone||""); const [phoneSaved,setPhoneSaved]=useState(false);
  const [latDraft,setLatDraft]=useState(loc?.lat!=null?String(loc.lat):""); const [lngDraft,setLngDraft]=useState(loc?.lng!=null?String(loc.lng):""); const [locSaved,setLocSaved]=useState(false);
  const [addrDraft,setAddrDraft]=useState(""); const [homeGeoBusy,setHomeGeoBusy]=useState(false); const [homeGeoErr,setHomeGeoErr]=useState("");
  const [payDraft,setPayDraft]=useState({applePay:pay?.applePay||"",cashApp:pay?.cashApp||"",zelle:pay?.zelle||""}); const [paySaved,setPaySaved]=useState(false);
  const fileRef=useRef(null); const imgRef=useRef(null); const [imgTargetId,setImgTargetId]=useState(null);

  useEffect(()=>{ setPhoneDraft(phone||""); },[phone]);
  useEffect(()=>{ setLatDraft(loc?.lat!=null?String(loc.lat):""); setLngDraft(loc?.lng!=null?String(loc.lng):""); },[loc]);
  useEffect(()=>{ setPayDraft({applePay:pay?.applePay||"",cashApp:pay?.cashApp||"",zelle:pay?.zelle||""}); },[pay]);
  useEffect(()=>{ if(availView!=="week")return; const dr={}; for(let i=0;i<7;i++){ const d=new Date(weekStart); d.setDate(d.getDate()+i); const k=dKey(d.getFullYear(),d.getMonth(),d.getDate()); dr[k]=avail[k]||[]; } setWeekDraft(dr); },[weekStart,availView,avail]);
  const weekDates=Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(d.getDate()+i); return d; });
  const weekLabel=`${MONTHS[weekDates[0].getMonth()].slice(0,3)} ${weekDates[0].getDate()} – ${MONTHS[weekDates[6].getMonth()].slice(0,3)} ${weekDates[6].getDate()}`;
  const toggleWeekSlot=(k,s)=>setWeekDraft(p=>({...p,[k]:(p[k]||[]).includes(s)?p[k].filter(x=>x!==s):[...(p[k]||[]),s]}));
  const saveWeek=async()=>{ const up={...avail}; Object.keys(weekDraft).forEach(k=>{ const arr=weekDraft[k]||[]; if(arr.length===0)delete up[k]; else up[k]=arr.slice().sort((a,b)=>SLOTS.indexOf(a)-SLOTS.indexOf(b)); }); setAvail(up); await saveAvail(up); setSaved(true); setTimeout(()=>setSaved(false),2000); };

  const onDay=dk=>{ setSelDate(dk); setSlots(avail[dk]||[]); setSaved(false); };
  const toggleSlot=s=>setSlots(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const saveSlots=async()=>{ const up={...avail}; if(slots.length===0)delete up[selDate]; else up[selDate]=slots; setAvail(up); await saveAvail(up); setSaved(true); setTimeout(()=>setSaved(false),2000); };
  const freeSlot=async(dk,t)=>{ const up={...taken}; delete up[takenKey(dk,t)]; setTaken(up); await saveTaken(up); };
  const savePhoneNow=async()=>{ await savePhone(phoneDraft.trim()); setPhoneSaved(true); setTimeout(()=>setPhoneSaved(false),2000); };
  const saveLocNow=async()=>{ const la=parseFloat(latDraft),ln=parseFloat(lngDraft); if(isNaN(la)||isNaN(ln))return; await saveLoc({lat:la,lng:ln}); setLocSaved(true); setTimeout(()=>setLocSaved(false),2000); };
  const savePayNow=async()=>{ await savePay({applePay:payDraft.applePay.trim(),cashApp:payDraft.cashApp.trim(),zelle:payDraft.zelle.trim()}); setPaySaved(true); setTimeout(()=>setPaySaved(false),2000); };
  const toggleDeposit=async o=>{ await saveOrders((orders||[]).map(x=>x.id===o.id?{...x,depositPaid:!x.depositPaid}:x)); };
  const geocodeHome=async()=>{
    setHomeGeoErr("");
    if(!addrDraft.trim()){ setHomeGeoErr("Enter your address first."); return; }
    setHomeGeoBusy(true);
    try{
      const url=`https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q=${encodeURIComponent(addrDraft)}`;
      const r=await fetch(url); const data=await r.json();
      if(!data||!data.length){ setHomeGeoErr("Couldn't find that address — check it, or enter coordinates below."); setHomeGeoBusy(false); return; }
      setLatDraft(String(+data[0].lat)); setLngDraft(String(+data[0].lon)); setHomeGeoErr("");
    }catch{ setHomeGeoErr("Address lookup is blocked in preview — enter coordinates below, or try again on the published site."); }
    setHomeGeoBusy(false);
  };

  const onFiles=async e=>{
    const files=Array.from(e.target.files);
    for(const file of files){
      const data=await fileToData(file);
      const id=`g_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      const pr=nPrice!==""?Number(nPrice):null;
      const item={id,name:nName||file.name.replace(/\.[^/.]+$/,""),cat:nCat||(nType==="set"?"set":"general"),setNum:nSet.trim()||null,desc:nDesc,type:nType,createdAt:new Date().toISOString(),...(pr!=null?{price:pr,type:"product"}:{})};
      const meta=(await sGet("emily_gmeta"))||[];
      await sSet("emily_gmeta",[...meta,item]);
      await sSetRaw(`emily_img_${id}`,data);
      setGallery(prev=>[...prev,{...item,imgUrl:data}]);
    }
    setNName("");setNCat("");setNSet("");setNDesc("");setNPrice("");
    e.target.value="";
  };
  const onReplaceImg=async e=>{ const file=e.target.files[0]; const id=imgTargetId; if(!file||!id){e.target.value="";return;} const data=await fileToData(file); await sSetRaw(`emily_img_${id}`,data); setGallery(prev=>prev.map(n=>n.id===id?{...n,imgUrl:data}:n)); setImgTargetId(null); e.target.value=""; };
  const delItem=async id=>{ const meta=(await sGet("emily_gmeta"))||[]; await sSet("emily_gmeta",meta.filter(n=>n.id!==id)); await sDel(`emily_img_${id}`); setGallery(prev=>prev.filter(n=>n.id!==id)); };

  const bookedList=Object.keys(taken).filter(k=>taken[k]).map(k=>{const[dk,t]=k.split("|");return{dk,t};}).sort((a,b)=>a.dk===b.dk?SLOTS.indexOf(a.t)-SLOTS.indexOf(b.t):(a.dk<b.dk?-1:1));
  const queue=[...(orders||[])].sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)); // who ordered first

  const TABS=[{id:"avail",l:"Availability"},{id:"booked",l:`Booked (${bookedList.length})`},{id:"orders",l:`Orders (${(orders||[]).length})`},{id:"gallery",l:"Gallery"},{id:"settings",l:"Settings"}];

  return (
    <div style={{paddingTop:58}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"clamp(36px,8vw,56px) 20px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:36,flexWrap:"wrap",gap:16}}>
          <div><div style={{fontSize:9,letterSpacing:"0.26em",color:C.pinkDeep,marginBottom:8}}>ADMIN</div><h1 className="ek-display" style={{fontSize:30,fontWeight:500,letterSpacing:"0.01em",color:C.text,margin:0}}>Dashboard</h1></div>
          <Btn v="ghost" size="sm" onClick={logout}>Log Out</Btn>
        </div>
        {!phone&&<div style={{background:`${C.pink}12`,border:`1px solid ${C.pink}55`,padding:14,marginBottom:24,fontSize:12,color:C.soft,lineHeight:1.7}}>Add your phone in <b onClick={()=>setTab("settings")} style={{color:C.pinkDeep,cursor:"pointer"}}>Settings</b> so bookings text to you.</div>}

        <div style={{display:"flex",borderBottom:`1px solid ${C.border}`,marginBottom:32,overflowX:"auto"}}>
          {TABS.map(({id,l})=><div key={id} onClick={()=>setTab(id)} style={{padding:"12px 18px",cursor:"pointer",fontSize:10,letterSpacing:"0.12em",whiteSpace:"nowrap",color:tab===id?C.pinkDeep:C.muted,borderBottom:tab===id?`2px solid ${C.pink}`:"2px solid transparent",marginBottom:-1}}>{l.toUpperCase()}</div>)}
        </div>

        {tab==="avail" && (
          <div>
            <div style={{display:"flex",gap:8,marginBottom:22,alignItems:"center",flexWrap:"wrap"}}>
              {[{k:"month",l:"Month View"},{k:"week",l:"Week View"}].map(o=><div key={o.k} onClick={()=>setAvailView(o.k)} style={{padding:"9px 18px",border:`1px solid ${availView===o.k?C.pink:C.border}`,cursor:"pointer",background:availView===o.k?`${C.pink}12`:C.card,color:availView===o.k?C.pinkDeep:C.text,fontSize:11,letterSpacing:"0.08em"}}>{o.l}</div>)}
              <span style={{fontSize:11,color:C.muted}}>Set open times per day — customers can only book these.</span>
            </div>
            {availView==="week" && (
              <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?16:26,marginBottom:8}}>
                <div style={{fontSize:11,color:C.muted,marginBottom:16,lineHeight:1.6,textAlign:"center"}}>Opens on next week so you can post times a week ahead — clients book early instead of scrambling. Use ‹ › for other weeks.</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <button onClick={()=>{const d=new Date(weekStart);d.setDate(d.getDate()-7);setWeekStart(d);}} style={{background:"none",border:"none",color:C.soft,cursor:"pointer",fontSize:24,padding:"4px 12px",fontFamily:"serif"}}>‹</button>
                  <div style={{fontSize:12,letterSpacing:"0.12em",color:C.text,textAlign:"center"}}>{weekLabel}</div>
                  <button onClick={()=>{const d=new Date(weekStart);d.setDate(d.getDate()+7);setWeekStart(d);}} style={{background:"none",border:"none",color:C.soft,cursor:"pointer",fontSize:24,padding:"4px 12px",fontFamily:"serif"}}>›</button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {weekDates.map(d=>{ const k=dKey(d.getFullYear(),d.getMonth(),d.getDate()); const past=k<todayStr(); const chosen=weekDraft[k]||[];
                    return (
                      <div key={k} style={{opacity:past?0.4:1,borderBottom:`1px solid ${C.border}`,paddingBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
                          <div style={{fontSize:12,color:C.text}}>{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][(d.getDay()+6)%7]} · {MONTHS[d.getMonth()].slice(0,3)} {d.getDate()}</div>
                          <div style={{fontSize:10,color:chosen.length?C.pinkDeep:C.muted}}>{chosen.length} open</div>
                        </div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {SLOTS.map(s=>{ const tk=taken[takenKey(k,s)]; const on=chosen.includes(s);
                            return <div key={s} onClick={()=>!past&&!tk&&toggleWeekSlot(k,s)} style={{padding:"7px 11px",border:`1px solid ${tk?C.border:on?C.pink:C.border}`,cursor:past||tk?"default":"pointer",fontSize:11,background:tk?C.card2:on?C.pink:C.card,color:tk?C.muted:on?C.ink:C.soft,textDecoration:tk?"line-through":"none"}}>{s}</div>; })}
                        </div>
                      </div>
                    ); })}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginTop:18}}><Btn v="pink" onClick={saveWeek}>Save Week</Btn>{saved&&<span style={{fontSize:12,color:C.pinkDeep}}>✓ Saved</span>}<span style={{fontSize:10,color:C.muted}}>Booked times can't be unset here.</span></div>
              </div>
            )}
            {availView==="month" && (
          <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr",gap:mobile?28:40,alignItems:"start"}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?18:30}}>
              <CalGrid year={calY} month={calM} onPrev={()=>{ if(calM===0){setCalY(calY-1);setCalM(11);}else setCalM(calM-1); }} onNext={()=>{ if(calM===11){setCalY(calY+1);setCalM(0);}else setCalM(calM+1); }}
                renderDay={(day,dk)=>{ const s=avail[dk]||[],sel=selDate===dk,has=s.length>0; return <div onClick={()=>onDay(dk)} style={{height:mobile?44:38,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:sel?C.pink:has?`${C.pink}1c`:"transparent",color:sel?C.ink:has?C.pinkDeep:C.muted,border:sel?"none":has?`1px solid ${C.pink}55`:"1px solid transparent",fontSize:12,gap:2}}>{day}{has&&<div style={{fontSize:7,opacity:0.75}}>{s.length}</div>}</div>; }}/>
            </div>
            <div>
              {!selDate?<div style={{color:C.muted,fontSize:13,textAlign:"center",paddingTop:mobile?8:60}}>Tap a date to set its available times</div>:(
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  <div style={{fontSize:12,color:C.pinkDeep}}>{fmtD(selDate)}</div>
                  <div style={{fontSize:9,letterSpacing:"0.18em",color:C.muted}}>TAP TO TOGGLE TIMES</div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {SLOTS.map(s=>{ const tk=taken[takenKey(selDate,s)]; return <div key={s} onClick={()=>!tk&&toggleSlot(s)} style={{padding:"11px 16px",border:`1px solid ${tk?C.border:slots.includes(s)?C.pink:C.border}`,cursor:tk?"not-allowed":"pointer",fontSize:12,background:tk?C.card2:slots.includes(s)?C.pink:C.card,color:tk?C.muted:slots.includes(s)?C.ink:C.soft,textDecoration:tk?"line-through":"none"}}>{s}</div>; })}
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:12}}><Btn v="pink" onClick={saveSlots}>Save</Btn>{saved&&<span style={{fontSize:12,color:C.pinkDeep}}>✓ Saved</span>}</div>
                </div>
              )}
            </div>
          </div>
            )}
          </div>
        )}

        {tab==="booked" && (
          <div>
            <div style={{fontSize:12,color:C.soft,marginBottom:18,lineHeight:1.7}}>Booked times show crossed out on the site. Free a slot if someone cancels.</div>
            {bookedList.length===0?<div style={{textAlign:"center",color:C.muted,padding:"48px 24px",fontSize:13}}>No booked times</div>:(
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                {bookedList.map(({dk,t})=><div key={dk+t} style={{background:C.card,border:`1px solid ${C.border}`,padding:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,color:C.text}}>{fmtD(dk)}</div><div style={{fontSize:12,color:C.pinkDeep}}>{t}</div></div><Btn v="danger" size="sm" onClick={()=>freeSlot(dk,t)}>Free</Btn></div>)}
              </div>
            )}
          </div>
        )}

        {tab==="orders" && (
          <div>
            <div style={{fontSize:12,color:C.soft,marginBottom:18,lineHeight:1.7}}>Ordered first appears first — work top to bottom. Custom sets show their ready-by date so you know priority.</div>
            {queue.length===0?<div style={{textAlign:"center",color:C.muted,padding:"48px 24px",fontSize:13}}>No orders yet</div>:(
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {queue.map((o,i)=>(
                  <div key={o.id} style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?16:22}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14,gap:12}}>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:C.pink,color:C.ink,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0}}>{i+1}</div>
                        <div><div style={{fontSize:9,color:C.pinkDeep,letterSpacing:"0.14em",marginBottom:3}}>{o.type==="appointment"?"APPOINTMENT":"CUSTOM SET"}</div><div style={{fontSize:16,color:C.text}}>{o.name}</div></div>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                        <div style={{fontSize:10,color:C.muted,textAlign:"right"}}>ordered<br/>{new Date(o.createdAt).toLocaleDateString()}</div>
                        <span style={{fontSize:9,letterSpacing:"0.1em",padding:"3px 9px",borderRadius:999,border:`1px solid ${o.depositPaid?C.pink:C.border}`,background:o.depositPaid?`${C.pink}14`:"transparent",color:o.depositPaid?C.pinkDeep:C.muted,whiteSpace:"nowrap"}}>{o.depositPaid?"DEPOSIT ✓":"DEPOSIT DUE"}</span>
                      </div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(150px,1fr))",gap:12}}>
                      <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>PHONE</div><div style={{fontSize:13,color:C.text}}>{o.phone}</div></div>
                      {o.type==="appointment"?(
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>WHEN</div><div style={{fontSize:13,color:C.text}}>{fmtD(o.date)} · {o.time}</div></div>
                      ):(<>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>READY BY</div><div style={{fontSize:13,color:C.pinkDeep}}>{fmtD(o.readyDate)}</div></div>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>SYSTEM · LENGTH</div><div style={{fontSize:13,color:C.text}}>{o.system} · {o.length}</div></div>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>SPEED</div><div style={{fontSize:13,color:C.text}}>{o.speed}</div></div>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>FULFILLMENT</div><div style={{fontSize:13,color:C.text}}>{o.fulfillment}{o.deliveryFee?` (+$${o.deliveryFee})`:o.shipFee?` (+$${o.shipFee})`:""}</div></div>
                        <div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>EST.</div><div style={{fontSize:13,color:C.pinkDeep}}>${o.estLo}+</div></div>
                        {o.address&&<div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>ADDRESS</div><div style={{fontSize:12,color:C.soft}}>{o.address}</div></div>}
                      </>)}
                      {o.set&&<div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>SET</div><div style={{fontSize:12,color:C.soft}}>{o.set}</div></div>}
                      {o.notes&&<div><div style={{fontSize:9,color:C.muted,marginBottom:3}}>NOTES</div><div style={{fontSize:12,color:C.soft}}>{o.notes}</div></div>}
                    </div>
                    {o.inspoId&&<div style={{marginTop:12}}><div style={{fontSize:9,color:C.muted,marginBottom:6}}>INSPO PHOTO</div><InspoThumb id={o.inspoId}/></div>}
                    <div style={{marginTop:14,display:"flex",gap:8,flexWrap:"wrap"}}>
                      <Btn v={o.depositPaid?"ghost":"outline"} size="sm" onClick={()=>toggleDeposit(o)}>{o.depositPaid?"Mark Deposit Unpaid":"Mark Deposit Paid"}</Btn>
                      <Btn v="danger" size="sm" onClick={()=>saveOrders((orders||[]).filter(x=>x.id!==o.id))}>Remove</Btn>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="gallery" && (
          <div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?20:30,marginBottom:24}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:C.pinkDeep,marginBottom:12}}>ADD DESIGN OR SET</div>
              <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
                {[{k:"design",l:"Individual Nail"},{k:"set",l:"Full Set"},{k:"product",l:"Product (priced)"}].map(o=><div key={o.k} onClick={()=>setNType(o.k)} style={{padding:"9px 16px",border:`1px solid ${nType===o.k?C.pink:C.border}`,cursor:"pointer",background:nType===o.k?`${C.pink}12`:C.card,color:nType===o.k?C.pinkDeep:C.text,fontSize:11}}>{o.l}</div>)}
              </div>
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr":"1fr 1fr 0.7fr 1fr"+(nType==="product"?" 0.7fr":""),gap:12,marginBottom:12}}>
                <Inp label="Name" value={nName} onChange={e=>setNName(e.target.value)} placeholder={nType==="set"?"e.g. Ocean Set":"e.g. Blue Starfish"}/>
                <Inp label="Category" value={nCat} onChange={e=>setNCat(e.target.value)} placeholder="e.g. summer, glam"/>
                <Inp label="Set #" value={nSet} onChange={e=>setNSet(e.target.value)} placeholder="e.g. 1"/>
                <Inp label="Description" value={nDesc} onChange={e=>setNDesc(e.target.value)} placeholder="Short description..."/>
                {nType==="product"&&<Inp label="Price $" type="number" value={nPrice} onChange={e=>setNPrice(e.target.value)} placeholder="5"/>}
              </div>
              <div style={{fontSize:11,color:C.muted,marginBottom:16,lineHeight:1.6}}>Give a full set and each of its nails the <b>same Set #</b> to link them — customers tap a nail to see the whole set.</div>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={onFiles} style={{display:"none"}}/>
              <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}><Btn v="pink" onClick={()=>fileRef.current?.click()}>Upload Photo(s)</Btn><span style={{fontSize:11,color:C.muted}}>{nType==="set"?"A full set design for the Sets page":nType==="product"?"A priced product (e.g. glue)":"An individual nail for the Shop"}</span></div>
            </div>
            <input ref={imgRef} type="file" accept="image/*" onChange={onReplaceImg} style={{display:"none"}}/>
            {gallery.length===0?<div style={{textAlign:"center",color:C.muted,padding:"48px 24px",fontSize:13}}>Nothing uploaded yet</div>:(
              <div style={{display:"grid",gridTemplateColumns:mobile?"1fr 1fr":"repeat(auto-fill,minmax(180px,1fr))",gap:14}}>
                {gallery.map(n=>(
                  <div key={n.id} style={{background:C.card,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                    {n.imgUrl?<img src={n.imgUrl} alt={n.name} style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}/>:<div style={{width:"100%",aspectRatio:"1",background:C.card2,display:"flex",alignItems:"center",justifyContent:"center",color:C.muted,fontSize:11}}>NO IMAGE</div>}
                    <div style={{padding:12}}>
                      <div style={{fontSize:12,color:C.text,marginBottom:2}}>{n.name}{n.price!=null?` · $${n.price}`:""}</div>
                      <div style={{fontSize:10,color:C.pinkDeep,marginBottom:10}}>{[n.type==="set"?"SET":n.type==="product"?"PRODUCT":n.cat,n.setNum?`#${n.setNum}`:""].filter(Boolean).join(" · ")}</div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        <Btn v="ghost" size="sm" full onClick={()=>{setImgTargetId(n.id);setTimeout(()=>imgRef.current?.click(),0);}}>{n.imgUrl?"Replace Image":"Add Image"}</Btn>
                        {n.id!=="product_glue"&&<Btn v="danger" size="sm" full onClick={()=>delItem(n.id)}>Delete</Btn>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab==="settings" && (
          <div style={{maxWidth:440}}>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?20:30}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:C.pinkDeep,marginBottom:8}}>YOUR PHONE NUMBER</div>
              <div style={{fontSize:12,color:C.soft,marginBottom:16,lineHeight:1.7}}>Bookings and orders open a text to this number pre-filled with the details.</div>
              <Inp label="Phone" type="tel" value={phoneDraft} onChange={e=>setPhoneDraft(e.target.value)} placeholder="817-555-0134"/>
              <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}><Btn v="pink" onClick={savePhoneNow}>Save Number</Btn>{phoneSaved&&<span style={{fontSize:12,color:C.pinkDeep}}>✓ Saved</span>}</div>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?20:30,marginTop:18}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:C.pinkDeep,marginBottom:8}}>DEPOSIT PAYMENT HANDLES</div>
              <div style={{fontSize:12,color:C.soft,marginBottom:16,lineHeight:1.7}}>Shown on the confirmation screen so customers can send the ${DEPOSIT} deposit right away. Leave any blank to hide it.</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                <Inp label="Cash App tag" value={payDraft.cashApp} onChange={e=>setPayDraft(p=>({...p,cashApp:e.target.value}))} placeholder="$EmilyK"/>
                <Inp label="Zelle (phone or email)" value={payDraft.zelle} onChange={e=>setPayDraft(p=>({...p,zelle:e.target.value}))} placeholder="817-555-0134"/>
                <Inp label="Apple Pay (phone or email)" value={payDraft.applePay} onChange={e=>setPayDraft(p=>({...p,applePay:e.target.value}))} placeholder="817-555-0134"/>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}><Btn v="pink" onClick={savePayNow}>Save Handles</Btn>{paySaved&&<span style={{fontSize:12,color:C.pinkDeep}}>✓ Saved</span>}</div>
            </div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,padding:mobile?20:30,marginTop:18}}>
              <div style={{fontSize:9,letterSpacing:"0.18em",color:C.pinkDeep,marginBottom:8}}>YOUR LOCATION (AUTO DELIVERY FEE)</div>
              <div style={{fontSize:12,color:C.soft,marginBottom:16,lineHeight:1.7}}>Delivery fees are figured from the distance between your home and the customer. Type your home address and tap Find — it fills the coordinates for you.</div>
              <Inp label="Home Address" value={addrDraft} onChange={e=>{setAddrDraft(e.target.value);setHomeGeoErr("");}} placeholder="Street, city, state, ZIP"/>
              <div style={{display:"flex",gap:10,alignItems:"center",marginTop:12,flexWrap:"wrap"}}>
                <Btn v="outline" size="sm" disabled={homeGeoBusy} onClick={geocodeHome}>{homeGeoBusy?"Finding…":"Find From Address"}</Btn>
                {homeGeoErr&&<span style={{fontSize:11,color:"#b5484a",lineHeight:1.5}}>{homeGeoErr}</span>}
              </div>
              <div style={{fontSize:10,color:C.muted,margin:"18px 0 8px",letterSpacing:"0.06em"}}>COORDINATES {latDraft&&lngDraft?"— found, save below":"— or enter manually"}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <Inp label="Latitude" value={latDraft} onChange={e=>setLatDraft(e.target.value)} placeholder="32.7555"/>
                <Inp label="Longitude" value={lngDraft} onChange={e=>setLngDraft(e.target.value)} placeholder="-97.3308"/>
              </div>
              <div style={{fontSize:10,color:C.muted,marginTop:10,lineHeight:1.6}}>No luck with the address? In Google Maps, right-click your home → click the numbers to copy → paste above.</div>
              <div style={{display:"flex",alignItems:"center",gap:12,marginTop:16}}><Btn v="pink" onClick={saveLocNow}>Save Location</Btn>{locSaved&&<span style={{fontSize:12,color:C.pinkDeep}}>✓ Saved</span>}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ROOT
// ══════════════════════════════════════════════════════════════
export default function App(){
  const [page,setPage]=useState("home");
  const [cart,setCart]=useState([]);
  const [avail,setAvail]=useState({});
  const [taken,setTaken]=useState({});
  const [gallery,setGallery]=useState([]);
  const [orders,setOrders]=useState([]);
  const [phone,setPhone]=useState("");
  const [loc,setLoc]=useState(null);
  const [pay,setPay]=useState({applePay:"",cashApp:"",zelle:""});
  const [mySets,setMySets]=useState([]);
  const [favs,setFavs]=useState([]);
  const [account,setAccount]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [loading,setLoading]=useState(true);
  const vw=useVW(); const mobile=vw<768;

  useEffect(()=>{(async()=>{
    const a=await sGet("emily_avail"); if(a)setAvail(a);
    const t=await sGet("emily_taken"); if(t)setTaken(t);
    const o=await sGet("emily_orders"); if(o)setOrders(o);
    const p=await sGet("emily_phone"); if(p)setPhone(p);
    const lc=await sGet("emily_loc"); if(lc)setLoc(lc);
    const py=await sGet("emily_pay"); if(py)setPay({applePay:"",cashApp:"",zelle:"",...py});
    // account session (device) → identity (shared) → per-account saves (shared)
    const accs=(await sGet("emily_accounts"))||[];
    const sess=await uGet("emily_session");
    const acc=sess?accs.find(x=>x.id===sess)||null:null;
    setAccount(acc);
    if(acc){
      const ms=await sGet(acctKey(acc.id,"mysets")); setMySets(ms||[]);
      const fv=await sGet(acctKey(acc.id,"favs")); setFavs(fv||[]);
    } else {
      const ms=await uGet("emily_mysets"); if(ms)setMySets(ms);
      const fv=await uGet("emily_favs"); if(fv)setFavs(fv);
    }
    let meta=(await sGet("emily_gmeta"))||[];
    if(!meta.some(n=>n.id==="product_glue")){ const glue={id:"product_glue",name:"Nail Glue",cat:"add-on",desc:"Bond adhesive for your set",price:5,type:"product",createdAt:new Date().toISOString()}; meta=[glue,...meta]; await sSet("emily_gmeta",meta); }
    const full=await Promise.all(meta.map(async n=>({...n,imgUrl:await sGetRaw(`emily_img_${n.id}`)})));
    setGallery(full); setLoading(false);
  })();},[]);

  const saveAvail=async v=>await sSet("emily_avail",v);
  const saveTaken=async v=>await sSet("emily_taken",v);
  const saveOrders=async v=>{ setOrders(v); await sSet("emily_orders",v); };
  const savePhone=async v=>{ setPhone(v); await sSet("emily_phone",v); };
  const saveLoc=async v=>{ setLoc(v); await sSet("emily_loc",v); };
  const savePay=async v=>{ setPay(v); await sSet("emily_pay",v); };

  // saved sets / favorites — routed to account (shared) when signed in, else device
  const persistMySets=async v=>{ if(account) await sSet(acctKey(account.id,"mysets"),v); else await uSet("emily_mysets",v); };
  const persistFavs=async v=>{ if(account) await sSet(acctKey(account.id,"favs"),v); else await uSet("emily_favs",v); };
  const saveMySets=async v=>{ setMySets(v); await persistMySets(v); };
  const addMySet=async(name,items)=>{ const v=[...mySets,{id:Date.now(),name,items,createdAt:new Date().toISOString()}]; setMySets(v); await persistMySets(v); };
  const toggleFav=item=>{ const kind=item.type==="set"?"set":"nail"; const ex=favs.find(f=>f.id===item.id); const v=ex?favs.filter(f=>f.id!==item.id):[...favs,{id:item.id,kind}]; setFavs(v); persistFavs(v); };
  const isFav=id=>favs.some(f=>f.id===id);
  const markTaken=async(dk,t)=>{ const up={...taken,[takenKey(dk,t)]:true}; setTaken(up); await saveTaken(up); };

  // customer auth
  const login=async({phone:ph,pass})=>{
    const accs=(await sGet("emily_accounts"))||[];
    const acc=accs.find(a=>a.phone===ph&&a.pass===pass);
    if(!acc) return {error:"No matching account — check your phone and password, or sign up."};
    await uSet("emily_session",acc.id); setAccount(acc);
    const ms=await sGet(acctKey(acc.id,"mysets")); setMySets(ms||[]);
    const fv=await sGet(acctKey(acc.id,"favs")); setFavs(fv||[]);
    return {ok:true};
  };
  const signup=async({name,phone:ph,pass})=>{
    const accs=(await sGet("emily_accounts"))||[];
    if(accs.some(a=>a.phone===ph)) return {error:"An account with this phone already exists — please sign in."};
    const acc={id:`u_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,name,phone:ph,pass,createdAt:new Date().toISOString()};
    await sSet("emily_accounts",[...accs,acc]);
    await uSet("emily_session",acc.id); setAccount(acc);
    // carry any device saves into the new account
    const devMs=(await uGet("emily_mysets"))||[]; const devFv=(await uGet("emily_favs"))||[];
    const startMs=devMs.length?devMs:mySets; const startFv=devFv.length?devFv:favs;
    setMySets(startMs); setFavs(startFv);
    if(startMs.length) await sSet(acctKey(acc.id,"mysets"),startMs);
    if(startFv.length) await sSet(acctKey(acc.id,"favs"),startFv);
    return {ok:true};
  };
  const logoutAcct=async()=>{
    await uSet("emily_session",null); setAccount(null);
    const ms=await uGet("emily_mysets"); setMySets(ms||[]);
    const fv=await uGet("emily_favs"); setFavs(fv||[]);
  };

  const go=p=>{ setPage(p); window.scrollTo(0,0); };
  const cartN=cart.reduce((s,c)=>s+c.qty,0);

  if(loading) return <div style={{background:C.bg,color:C.pinkDeep,display:"flex",alignItems:"center",justifyContent:"center",height:"100vh",fontFamily:F.serif,letterSpacing:"0.26em",fontSize:20,fontWeight:500}}><style>{GLOBAL_CSS}</style>Emily K Nails</div>;

  return (
    <div style={{background:C.bg,color:C.text,minHeight:"100vh",fontFamily:F.sans}}>
      <style>{GLOBAL_CSS}</style>
      <Nav page={page} go={go} cartN={cartN} account={account} mobile={mobile}/>
      {page==="home"    && <HomePage go={go} mobile={mobile}/>}
      {page==="book"    && <BookPage avail={avail} taken={taken} markTaken={markTaken} orders={orders} saveOrders={saveOrders} phone={phone} pay={pay} cart={cart} setCart={setCart} go={go} mobile={mobile}/>}
      {page==="gallery" && <ShopPage gallery={gallery} cart={cart} setCart={setCart} go={go} mobile={mobile} isFav={isFav} toggleFav={toggleFav} onSaveMySet={addMySet}/>}
      {page==="sets"    && <SetsPage gallery={gallery} setCart={setCart} go={go} mobile={mobile} isFav={isFav} toggleFav={toggleFav}/>}
      {page==="search"  && <SearchPage gallery={gallery} cart={cart} setCart={setCart} go={go} mobile={mobile} isFav={isFav} toggleFav={toggleFav}/>}
      {page==="saved"   && <SavedPage mySets={mySets} saveMySets={saveMySets} favs={favs} gallery={gallery} isFav={isFav} toggleFav={toggleFav} cart={cart} setCart={setCart} go={go} account={account} mobile={mobile}/>}
      {page==="account" && <AccountPage account={account} login={login} signup={signup} logout={logoutAcct} go={go} mySets={mySets} favs={favs} mobile={mobile}/>}
      {page==="cart"    && <CartPage cart={cart} setCart={setCart} gallery={gallery} orders={orders} saveOrders={saveOrders} phone={phone} pay={pay} loc={loc} mySets={mySets} favs={favs} go={go} mobile={mobile}/>}
      {page==="prices"  && <PricesPage mobile={mobile}/>}
      {page==="policy"  && <PolicyPage/>}
      {page==="admin"   && (isAdmin
        ? <AdminPage avail={avail} setAvail={setAvail} saveAvail={saveAvail} taken={taken} setTaken={setTaken} saveTaken={saveTaken} gallery={gallery} setGallery={setGallery} orders={orders} saveOrders={saveOrders} phone={phone} savePhone={savePhone} loc={loc} saveLoc={saveLoc} pay={pay} savePay={savePay} logout={()=>setIsAdmin(false)} mobile={mobile}/>
        : <AdminLogin onLogin={()=>setIsAdmin(true)}/>)}
    </div>
  );
}
