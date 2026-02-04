const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://game.skport.com/endfield/sign-in";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log("🤖 Bot start...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ===== LOGIN =====
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });

    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');

    await sleep(8000);

    // ===== FIND IFRAME =====
    let frameTarget = null;
    for (const frame of page.frames()) {
      if (frame.url().includes("skport")) {
        frameTarget = frame;
        console.log("✅ Found iframe:", frame.url());
        break;
      }
    }

    if (!frameTarget) {
      console.log("❌ Không tìm thấy iframe!");
      await page.screenshot({ path: "error_iframe.png" });
      return;
    }

    await sleep(5000);

    // ===== CLICK "SHOW ALL REWARDS" =====
    try {
      console.log("🔍 Tìm nút Show All Rewards...");
      const showAllBtn = await frameTarget.waitForSelector(
        'span:has-text("Show All Rewards")',
        { timeout: 10000 }
      );

      await showAllBtn.click();
      console.log("✅ Đã click Show All Rewards");

      await sleep(3000);

      // chụp màn hình sau khi mở
      await page.screenshot({ path: "after_show_all.png", fullPage: true });
      console.log("📸 Đã chụp ảnh: after_show_all.png");

    } catch (err) {
      console.log("⚠️ Không thấy nút Show All Rewards (có thể đã mở)");
    }

    // ===== FIND ALL DAYS CHƯA NHẬN =====
    console.log("🎯 Tìm ngày chưa điểm danh...");

    const unclaimedDays = await frameTarget.$$('div.sc-guPfGz.erDkLw');

    console.log("🟡 Số ngày chưa nhận:", unclaimedDays.length);

    if (unclaimedDays.length === 0) {
      console.log("🎉 Không còn ngày nào chưa nhận!");
      return;
    }

    // click ngày đầu tiên chưa nhận
    const targetDay = unclaimedDays[0];

    await targetDay.scrollIntoViewIfNeeded();
    await sleep(1000);

    const dayText = await targetDay.innerText();
    console.log("👉 Click:", dayText);

    await targetDay.click();
    await sleep(3000);

    // screenshot sau khi điểm danh
    await page.screenshot({ path: "after_claim.png", fullPage: true });
    console.log("📸 Đã chụp ảnh: after_claim.png");

    console.log("🎉 Điểm danh thành công!");

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
    await page.screenshot({ path: "error.png" });
  } finally {
    await browser.close();
    console.log("🤖 Bot end.");
  }
})();
