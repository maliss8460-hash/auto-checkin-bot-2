const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://www.skport.com/en/sign-in";

// XPath nút check-in
const CHECKIN_XPATH = '//*[@id="content-container"]/div[1]/div[4]/div[1]/div/div[1]';

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("⏳ Đợi form login...");
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    console.log("✍️ Nhập tài khoản...");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    console.log("🔑 Click login...");
    await page.click('button[type="submit"]');

    // ⏳ chờ login xong (quan trọng)
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(8000);

    console.log("🎯 Tìm nút điểm danh...");

    const checkinBtn = page.locator(`xpath=${CHECKIN_XPATH}`);

    if (await checkinBtn.count() > 0) {
      await checkinBtn.click();
      console.log("✅ Điểm danh thành công!");
    } else {
      console.log("⚠️ Không thấy nút điểm danh!");
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
