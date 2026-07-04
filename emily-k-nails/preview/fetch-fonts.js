// Fetch Google Fonts woff2 (latin) and emit an inline @font-face stylesheet.
const https=require("https"), fs=require("fs");
const UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";
function get(url,bin){return new Promise((res,rej)=>{https.get(url,{headers:{"User-Agent":UA}},r=>{
  if(r.statusCode>=300&&r.statusCode<400&&r.headers.location)return get(r.headers.location,bin).then(res,rej);
  const c=[];r.on("data",d=>c.push(d));r.on("end",()=>res(bin?Buffer.concat(c):Buffer.concat(c).toString("utf8")));}).on("error",rej);});}
(async()=>{
  const fams=[
    "Cormorant+Garamond:wght@400;500;600",
    "Jost:wght@300;400;500"
  ];
  let out="";
  for(const fam of fams){
    const css=await get(`https://fonts.googleapis.com/css2?family=${fam}&display=swap`,false);
    // keep only latin blocks (the block whose unicode-range includes U+0000)
    const blocks=css.split("@font-face").slice(1);
    for(const b of blocks){
      if(!/unicode-range:[^;]*U\+0000/.test(b)) continue; // latin subset only
      const fw=(b.match(/font-weight:\s*(\d+)/)||[])[1];
      const ff=(b.match(/font-family:\s*'([^']+)'/)||[])[1];
      const url=(b.match(/url\(([^)]+\.woff2)\)/)||[])[1];
      if(!url) continue;
      const buf=await get(url,true);
      out+=`@font-face{font-family:'${ff}';font-style:normal;font-weight:${fw};font-display:swap;src:url(data:font/woff2;base64,${buf.toString("base64")}) format('woff2');}\n`;
      console.error(`embedded ${ff} ${fw} — ${(buf.length/1024).toFixed(0)}KB`);
    }
  }
  fs.writeFileSync("preview/fonts.css",out);
  console.error("fonts.css:",(out.length/1024).toFixed(0),"KB");
})();
