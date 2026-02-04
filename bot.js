const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://game.skport.com/endfield/sign-in";

(async () => {
  console.log("🤖 Bot bắt đầu chạy...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🌐 Mở trang login...");
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded" });

    console.log("⏳ Đợi form login...");
    await page.waitForSelector('input[name="email"]', { timeout: 60000 });

    console.log("✍️ Nhập tài khoản...");
    await page.fill('input[name="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);

    console.log("🔑 Click login...");
    await page.click('button[type="submit"]');

    console.log("⏳ Chờ sau login 30s...");
    await page.waitForTimeout(30000);

    // ===== tìm frame nếu có =====
    let targetFrame = page;
    for (const f of page.frames()) {
      const html = await f.content();
      if (html.includes("Day")) {
        targetFrame = f;
        console.log("✅ Đã tìm thấy iframe điểm danh!");
        break;
      }
    }

    console.log("🔍 Tìm tất cả ô Day...");

    const dayBoxes = await targetFrame.$$(`div:has-text("Day")`);
    console.log("📦 Số ô tìm được:", dayBoxes.length);

    let count = 0;

    for (const box of dayBoxes) {
      try {
        const info = await box.evaluate(el => {
          const style = getComputedStyle(el);
          return {
            text: el.innerText,
            opacity: style.opacity,
            bg: style.backgroundColor,
          };
        });

        // bỏ qua ô đã nhận (thường mờ hoặc xám)
        if (info.opacity < 0.6) {
          console.log("⏭️ Bỏ qua ô đã nhận:", info.text.trim());
          continue;
        }

        console.log("🖱️ Click:", info.text.trim());
        await box.click();
        count++;

        // chờ animation
        await page.waitForTimeout(2000);
      } catch (e) {
        console.log("⚠️ Không click được 1 ô:", e.message);
      }
    }

    console.log(`✅ Đã click ${count} ô!`);

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
    try {
      await page.screenshot({ path: "error.png" });
      console.log("📸 Đã chụp ảnh lỗi!");
    } catch {}
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
