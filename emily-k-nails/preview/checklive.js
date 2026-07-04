const { chromium } = require("playwright");
(async () => {
  const url = "https://claude.ai/public/artifacts/7f4565e9-899d-420c-95f0-d31097dd9497";
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const opts = { executablePath: "/opt/pw-browsers/chromium" };
  if (proxy) opts.proxy = { server: proxy };
  const b = await chromium.launch(opts).catch(async()=>await chromium.launch(proxy?{proxy:{server:proxy}}:{}));
  const pg = await b.newPage({ viewport: { width: 430, height: 932 } });
  try {
    await pg.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await pg.waitForTimeout(6000);
    await pg.screenshot({ path: "preview/live.png", fullPage: false });
    const title = await pg.title();
    let txt = "";
    try { txt = (await pg.textContent("body")).replace(/\s+/g," ").trim().slice(0,300); } catch {}
    // try to peek into artifact iframe
    let frameTxt = "";
    for (const fr of pg.frames()) {
      try { const t = await fr.textContent("body"); if (t && t.includes("Emily")) { frameTxt = t.replace(/\s+/g," ").trim().slice(0,300); break; } } catch {}
    }
    console.log("TITLE:", title);
    console.log("BODY:", txt);
    console.log("FRAME(Emily):", frameTxt || "(none found)");
  } catch (e) {
    console.log("ERROR:", e.message);
    try { await pg.screenshot({ path: "preview/live.png" }); } catch {}
  }
  await b.close();
})();
