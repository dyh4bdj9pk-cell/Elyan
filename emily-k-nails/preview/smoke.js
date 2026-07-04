const { chromium } = require("playwright");
const fs = require("fs");
(async () => {
  const body = fs.readFileSync(__dirname + "/preview.html", "utf8");
  const page = "<!doctype html><html><head><meta charset=utf8></head><body>" + body + "</body></html>";
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(async()=>await chromium.launch());
  const pg = await b.newPage();
  const errs = [];
  pg.on("pageerror", e => errs.push("PAGEERROR: " + e.message));
  pg.on("console", m => { if (m.type()==="error") errs.push("CONSOLE: " + m.text()); });
  await pg.setContent(page, { waitUntil: "networkidle" });
  await pg.waitForTimeout(1200);
  const hero = await pg.textContent("body");
  console.log("HERO has 'Emily K':", hero.includes("Emily K"));
  console.log("HERO has 'NAILS':", hero.includes("NAILS"));
  console.log("Has 'Book Appointment':", hero.includes("Book Appointment"));
  // click Sets nav to ensure routing + gallery render
  await pg.getByText("SETS", { exact:false }).first().click().catch(()=>{});
  await pg.waitForTimeout(500);
  const setsTxt = await pg.textContent("body");
  console.log("Sets shows 'Rosé Ombré':", setsTxt.includes("Rosé Ombré"));
  console.log("ERRORS:", errs.length ? errs.slice(0,8) : "none");
  await b.close();
})();
