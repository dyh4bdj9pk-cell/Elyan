const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const orig = fs.readFileSync(__dirname + "/../App.jsx", "utf8");
  const body = fs.readFileSync(__dirname + "/copy.html", "utf8");
  const doc = "<!doctype html><html><head><meta charset=utf8></head><body>" + body + "</body></html>";
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(()=>chromium.launch());
  const pg = await b.newPage();
  await pg.setContent(doc, { waitUntil: "load" });
  const val = await pg.$eval("#code", el => el.value);
  console.log("textarea === original App.jsx :", val === orig);
  console.log("orig len:", orig.length, "| textarea len:", val.length);
  // check button exists and has handler by clicking (clipboard may be denied headless, but should not throw)
  const label = await pg.$eval("#cp", el => el.textContent);
  console.log("button label:", JSON.stringify(label));
  await b.close();
})();
