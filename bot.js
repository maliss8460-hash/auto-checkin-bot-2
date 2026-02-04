const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://www.skport.com/en/sign-in";
const CHECKIN_XPATH = '//*[@id="content-container"]/div[1]/div[4]/div[1]/div/div[1]';

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
  });

  try {
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { timeout: 60000 });

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(5000);

    console.log("⏳ Đợi ô email...");
    await page.waitForSelector('input[name="email"]', {
      timeout: 60000,
      state: "visible",
    });

    console.log("✍️ Nhập email...");
    await page.fill('input[name="email"]', EMAIL);

    console.log("✍️ Nhập password...");
    await page.fill('input[type="password"]', PASSWORD);

    console.log("🔑 Click login...");
    await page.click('button[type="submit"]');

    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(8000);

    console.log("🎯 Tìm nút điểm danh...");
    const btn = page.locator(`xpath=${CHECKIN_XPATH}`);

    if (await btn.count() > 0) {
      await btn.click();
      console.log("✅ Điểm danh thành công!");
    } else {
      console.log("⚠️ Không thấy nút điểm danh!");
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
    await page.screenshot({ path: "error.png" });
    console.log("📸 Đã chụp ảnh lỗi error.png");
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
