const { chromium } = require("playwright");
const fs = require("fs");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://www.skport.com/en/sign-in";
const CHECKIN_XPATH = '//*[@id="content-container"]/div[1]/div[4]/div[1]/div/div[1]';

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { waitUntil: "networkidle" });

    console.log("⏳ Đợi form login...");
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    console.log("✍️ Nhập tài khoản...");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    console.log("🔑 Click login...");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(5000);

    console.log("🎯 Tìm nút điểm danh...");
    await page.waitForXPath(CHECKIN_XPATH, { timeout: 15000 });
    const [btn] = await page.$x(CHECKIN_XPATH);

    if (btn) {
      await btn.click();
      console.log("✅ Điểm danh thành công!");
    } else {
      console.log("⚠️ Không thấy nút điểm danh!");
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);

    // 📸 chụp ảnh lỗi
    await page.screenshot({ path: "error.png", fullPage: true });
    console.log("📸 Đã chụp ảnh lỗi: error.png");
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
