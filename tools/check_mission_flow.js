const { chromium } = require("playwright");
const { pathToFileURL } = require("url");

const root = "C:/Users/byeng/OneDrive/Desktop/ai 과제용/42131233bb/bean_grow_html";
const executablePath = "C:/Users/byeng/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe";

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
  const missionUrl = pathToFileURL(`${root}/missions.html`).href;
  const homeUrl = pathToFileURL(`${root}/index.html`).href;
  const recordsUrl = pathToFileURL(`${root}/records.html`).href;

  await page.goto(missionUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => localStorage.removeItem("beanGrowMissionStateV1"));
  await page.reload({ waitUntil: "networkidle" });

  const eventTitles = [];
  for (let index = 0; index < 10; index += 1) {
    await page.locator("[data-complete]").nth(index).click();
    const modal = page.locator(".event-card h2");
    if (await modal.count()) {
      eventTitles.push(await modal.textContent());
      await page.locator(".event-card button").click();
    }
  }

  const missionText = await page.locator("#missionProgressText").textContent();
  await page.screenshot({ path: "C:/Users/byeng/OneDrive/Desktop/ai 과제용/42131233bb/tools/mission-flow.png", fullPage: true });

  await page.goto(homeUrl, { waitUntil: "networkidle" });
  const home = {
    level: await page.locator("#levelText").textContent(),
    exp: await page.locator("#expText").textContent(),
    progress: await page.locator("#homeProgressText").textContent(),
  };
  await page.screenshot({ path: "C:/Users/byeng/OneDrive/Desktop/ai 과제용/42131233bb/tools/home-flow.png", fullPage: true });

  await page.goto(recordsUrl, { waitUntil: "networkidle" });
  const records = {
    clears: await page.locator("#recordClearDays").textContent(),
    exp: await page.locator("#recordExp").textContent(),
    level: await page.locator("#recordLevel").textContent(),
    done: await page.locator("#doneListCount").textContent(),
  };
  await page.screenshot({ path: "C:/Users/byeng/OneDrive/Desktop/ai 과제용/42131233bb/tools/records-flow.png", fullPage: true });

  await browser.close();
  console.log(JSON.stringify({ eventTitles, missionText, home, records }, null, 2));
})();
