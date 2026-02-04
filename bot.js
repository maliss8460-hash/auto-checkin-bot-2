const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

// ✅ LINK LOGIN MỚI
const LOGIN_URL = "https://game.skport.com/endfield/sign-in";

// XPath nút điểm danh
const CHECKIN_XPATH = '//*[@id="content-container"]/div[1]/div[4]/div[1]/div/div[1]';

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  try {
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });
    await page.waitForLoadState("networkidle");

    console.log("⏳ Đợi form login...");
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    console.log("✍️ Nhập tài khoản...");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    console.log("🔑 Click login...");
    await page.click('button[type="submit"]');

    // ⏳ chờ sau khi login 30s
    console.log("⏳ Đợi sau khi login 30s...");
    await page.waitForTimeout(30000);

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
    await page.screenshot({ path: "error.png" });
    console.log("📸 Đã chụp ảnh lỗi!");
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
