const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://game.skport.com/endfield/sign-in";

async function autoScroll(pageOrFrame) {
  console.log("🧭 Bắt đầu cuộn trang...");

  await pageOrFrame.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;

      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight - 200) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });

  console.log("✅ Cuộn trang xong!");
}

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    // ================= LOGIN =================
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });

    console.log("⏳ Đợi form login...");
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    console.log("✍️ Nhập email & password...");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    console.log("🔑 Click login...");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(8000);

    // ================= TÌM IFRAME =================
    console.log("🧩 Tìm iframe game...");
    let targetFrame = null;

    for (const frame of page.frames()) {
      const url = frame.url();
      if (url.includes("skport") || url.includes("endfield")) {
        targetFrame = frame;
        console.log("✅ Đã tìm thấy iframe:", url);
        break;
      }
    }

    if (!targetFrame) {
      console.log("❌ Không tìm thấy iframe game!");
      await page.screenshot({ path: "error_iframe.png" });
      return;
    }

    await page.waitForTimeout(5000);

    // ================= AUTO SCROLL + CLICK =================
    console.log("🎯 Bắt đầu quét điểm danh...");

    let clicked = new Set();

    for (let round = 1; round <= 6; round++) {
      console.log(`\n🔄 Quét lần ${round}...`);

      await autoScroll(targetFrame);
      await page.waitForTimeout(2000);

      const dayBoxes = await targetFrame.$$(`div:has-text("Day")`);
      console.log("📦 Số ô Day tìm được:", dayBoxes.length);

      for (let i = 0; i < dayBoxes.length; i++) {
        if (clicked.has(i)) continue;

        try {
          const text = await dayBoxes[i].innerText();
          const label = text.trim().replace(/\s+/g, " ");

          console.log("🖱️ Click:", label);

          await dayBoxes[i].scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);

          await dayBoxes[i].click({ timeout: 3000 });
          clicked.add(i);

          await page.waitForTimeout(1500);
        } catch (err) {
          console.log("⚠️ Không click được Day:", i);
        }
      }
    }

    console.log("\n🎉 Hoàn thành điểm danh!");

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
    await page.screenshot({ path: "error.png" });
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
