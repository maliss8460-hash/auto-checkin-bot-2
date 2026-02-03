const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const URL = "https://www.skport.com/en/sign-in";
const CHECKIN_XPATH = '//*[@id="content-container"]/div[1]/div[4]/div[1]/div/div[1]';

(async () => {
  if (!EMAIL || !PASSWORD) {
    console.log("❌ Thiếu EMAIL hoặc PASSWORD!");
    process.exit(1);
  }

  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🌐 Mở trang...");
    await page.goto(URL, { waitUntil: "networkidle" });

    // login
    await page.fill('input[type="text"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);

    console.log("🔑 Login xong!");

    // click điểm danh
    try {
      await page.waitForXPath(CHECKIN_XPATH, { timeout: 5000 });
      const [btn] = await page.$x(CHECKIN_XPATH);

      if (btn) {
        await btn.click();
        console.log("✅ Điểm danh thành công!");
      } else {
        console.log("⚠️ Không tìm thấy nút điểm danh!");
      }
    } catch {
      console.log("⏳ Có thể đã điểm danh hoặc chưa tới giờ!");
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
