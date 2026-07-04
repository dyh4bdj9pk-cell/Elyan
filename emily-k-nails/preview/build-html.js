// Assembles a self-contained preview.html: #root + inline storage shim + demo
// seed + inlined app bundle. No external requests (works under Artifact CSP).
const fs = require("fs");
const path = require("path");

const bundle = fs.readFileSync(path.join(__dirname, "bundle.js"), "utf8");
const fonts = fs.readFileSync(path.join(__dirname, "fonts.css"), "utf8");

const seed = `
(function(){
  var KP='ekprev_';
  // Storage backend: localStorage when allowed, else in-memory (sandboxed iframes
  // may deny localStorage). Bulletproof shim for the artifact window.storage API.
  var mem={}, LS=null;
  try{ LS=window.localStorage; LS.setItem('__ektest','1'); LS.removeItem('__ektest'); }catch(e){ LS=null; }
  function g(k){ if(LS){try{return LS.getItem(k);}catch(e){}} return (k in mem)?mem[k]:null; }
  function s(k,v){ if(LS){try{LS.setItem(k,v);return;}catch(e){}} mem[k]=v; }
  function d(k){ if(LS){try{LS.removeItem(k);return;}catch(e){}} delete mem[k]; }
  window.storage={
    get:function(k){var v=g(KP+k);return Promise.resolve(v==null?null:{value:v});},
    set:function(k,v){s(KP+k,v);return Promise.resolve();},
    delete:function(k){d(KP+k);return Promise.resolve();}
  };
  function S(k,v){s(KP+k,JSON.stringify(v));}
  function SR(k,v){s(KP+k,v);}
  // nail-swatch image as an inline SVG data URI
  function img(a,b,label){
    var svg='<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">'
      +'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">'
      +'<stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs>'
      +'<rect width="400" height="400" fill="url(#g)"/>'
      +'<g fill="none" stroke="rgba(255,255,255,.55)" stroke-width="2">'
      +'<ellipse cx="200" cy="150" rx="70" ry="120"/><ellipse cx="200" cy="150" rx="40" ry="120"/></g>'
      +'<text x="200" y="360" font-family="Georgia,serif" font-size="26" fill="rgba(255,255,255,.9)" text-anchor="middle" letter-spacing="2">'+label+'</text>'
      +'</svg>';
    return 'data:image/svg+xml;utf8,'+encodeURIComponent(svg);
  }
  if(!g(KP+'ekprev_seeded')){
    s(KP+'ekprev_seeded','1');
    S('emily_phone','817-555-0134');
    S('emily_pay',{cashApp:'$EmilyK',zelle:'817-555-0134',applePay:'817-555-0134'});
    // availability — next several days, a few slots each
    var avail={}; var slots=['10:00 AM','11:00 AM','1:00 PM','2:00 PM','4:00 PM'];
    for(var i=2;i<=12;i+=2){var d=new Date();d.setDate(d.getDate()+i);
      var k=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      avail[k]=slots.slice(0,3+(i%3));}
    S('emily_avail',avail);
    // gallery: two linked sets (full set + individual nails share a Set #)
    var meta=[
      {id:'demo_set1',name:'Rosé Ombré',cat:'glam',setNum:'1',desc:'Soft pink ombré with fine hand-painted detail — a house favorite.',type:'set',createdAt:new Date().toISOString()},
      {id:'demo_n1',name:'Petal',cat:'glam',setNum:'1',desc:'',type:'design',createdAt:new Date().toISOString()},
      {id:'demo_n2',name:'Blush',cat:'glam',setNum:'1',desc:'',type:'design',createdAt:new Date().toISOString()},
      {id:'demo_n3',name:'Champagne',cat:'glam',setNum:'1',desc:'',type:'design',createdAt:new Date().toISOString()},
      {id:'demo_set2',name:'Pearl Muse',cat:'bridal',setNum:'2',desc:'Milky pearl base with a delicate chrome sheen.',type:'set',createdAt:new Date().toISOString()},
      {id:'demo_n4',name:'Pearl',cat:'bridal',setNum:'2',desc:'',type:'design',createdAt:new Date().toISOString()},
      {id:'demo_n5',name:'Veil',cat:'bridal',setNum:'2',desc:'',type:'design',createdAt:new Date().toISOString()}
    ];
    S('emily_gmeta',meta);
    var imgs={
      demo_set1:img('#f7c9db','#d76a92','ROSÉ OMBRÉ'), demo_n1:img('#fbe0ec','#e79ab8','PETAL'),
      demo_n2:img('#f7c9db','#d76a92','BLUSH'), demo_n3:img('#f3d9c9','#e0a894','CHAMPAGNE'),
      demo_set2:img('#fdeef4','#e7c3d4','PEARL MUSE'), demo_n4:img('#ffffff','#f1dce6','PEARL'),
      demo_n5:img('#fbe0ec','#d99cb8','VEIL')
    };
    Object.keys(imgs).forEach(function(id){SR('emily_img_'+id,imgs[id]);});
  }
})();
`;

const html =
`<style>${fonts}</style>
<div id="root"></div>
<div style="position:fixed;bottom:10px;left:50%;transform:translateX(-50%);z-index:9000;background:rgba(255,255,255,.92);border:1px solid #f1dce6;color:#8a7681;font:11px/1.4 system-ui,sans-serif;padding:6px 14px;border-radius:999px;box-shadow:0 6px 18px -8px rgba(183,68,110,.3);pointer-events:none">Preview · demo data · admin password: emilyk2025</div>
<script>${seed}</script>
<script>${bundle}</script>`;

fs.writeFileSync(path.join(__dirname, "preview.html"), html);
console.log("preview.html written:", html.length, "bytes");
