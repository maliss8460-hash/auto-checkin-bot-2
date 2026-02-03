const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://www.skport.com/en/sign-in";

// XPath nút điểm danh (của bạn)
const CHECKIN_XPATH = '//*[@id="content-container"]/div[1]/div[4]/div[1]/div/div[1]';

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  if (!EMAIL || !PASSWORD) {
    console.log("❌ Thiếu EMAIL hoặc PASSWORD!");
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 1️⃣ Mở trang login
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { waitUntil: "networkidle" });

    // 2️⃣ Nhập email & password
    console.log("✍️ Nhập tài khoản...");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    // 3️⃣ Click login
    console.log("🔑 Đăng nhập...");
    await page.click('button[type="submit"]');

    // đợi login xong
    await page.waitForTimeout(5000);

    // 4️⃣ Click điểm danh
    console.log("🎯 Tìm nút điểm danh...");
    try {
      await page.waitForXPath(CHECKIN_XPATH, { timeout: 5000 });
      const [btn] = await page.$x(CHECKIN_XPATH);

      if (btn) {
        await btn.click();
        console.log("✅ Điểm danh thành công!");
      } else {
        console.log("⚠️ Không tìm thấy nút điểm danh!");
      }
    } catch (e) {
      console.log("⏳ Có thể đã điểm danh hoặc chưa tới giờ!");
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
