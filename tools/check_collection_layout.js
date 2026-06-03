const { chromium } = require("playwright");
const { pathToFileURL } = require("url");

const pagePath = "C:/Users/byeng/OneDrive/Desktop/ai 과제용/42131233bb/bean_grow_html/collection.html";
const screenshotPath = "C:/Users/byeng/OneDrive/Desktop/ai 과제용/42131233bb/tools/collection-layout.png";

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Users/byeng/AppData/Local/ms-playwright/chromium-1217/chrome-win64/chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(pagePath).href, { waitUntil: "networkidle" });
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const report = await page.evaluate((capturedPath) => {
    const rounded = (value) => Math.round(value * 10) / 10;
    const cardReports = [...document.querySelectorAll(".screen-collection .bean-card")].map((card) => {
      const img = card.querySelector("img");
      const label = card.querySelector("b")?.textContent.trim() || "";
      const cardBox = card.getBoundingClientRect();
      const imgBox = img.getBoundingClientRect();
      return {
        label,
        card: {
          top: rounded(cardBox.top),
          left: rounded(cardBox.left),
          width: rounded(cardBox.width),
          height: rounded(cardBox.height),
        },
        img: {
          top: rounded(imgBox.top),
          left: rounded(imgBox.left),
          width: rounded(imgBox.width),
          height: rounded(imgBox.height),
        },
        overflow: {
          top: rounded(cardBox.top - imgBox.top),
          left: rounded(cardBox.left - imgBox.left),
          right: rounded(imgBox.right - cardBox.right),
          bottom: rounded(imgBox.bottom - cardBox.bottom),
        },
      };
    });

    const bad = cardReports.filter((item) =>
      Object.values(item.overflow).some((value) => value > 0)
    );

    return {
      screenshotPath: capturedPath,
      viewport: { width: innerWidth, height: innerHeight },
      pageHeight: document.documentElement.scrollHeight,
      pngImages: document.querySelectorAll(".screen-collection img[src$='.png']").length,
      gifImages: document.querySelectorAll(".screen-collection img[src$='.gif']").length,
      overflowCount: bad.length,
      overflowItems: bad,
      sampleCards: cardReports.slice(0, 5),
    };
  }, screenshotPath);

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})();
