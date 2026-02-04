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

    // ====== TÌM FRAME (nếu có iframe) ======
    let frames = page.frames();
    let targetFrame = page;

    if (frames.length > 1) {
      console.log("🧩 Phát hiện iframe, thử tìm frame chứa điểm danh...");
      for (const f of frames) {
        const html = await f.content();
        if (html.includes("Day")) {
          targetFrame = f;
          console.log("✅ Đã chọn iframe phù hợp!");
          break;
        }
      }
    }

    console.log("🎯 Scan ô điểm danh màu vàng...");

    const boxes = await targetFrame.$$("div");
    let clicked = false;

    for (const b of boxes) {
      const bg = await b.evaluate(el => getComputedStyle(el).backgroundColor);
      const text = await b.evaluate(el => el.innerText || "");

      // tìm ô có chữ Day + màu vàng (ước lượng)
      if (
        text.includes("Day") &&
        (bg.includes("255, 215") || bg.includes("255, 255") || bg.includes("gold"))
      ) {
        await b.click();
        console.log("✅ Đã click ô điểm danh:", text.trim());
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      console.log("⚠️ Không tìm thấy ô vàng, thử click ô có chữ Day gần nhất...");

      const fallback = await targetFrame.$('div:has-text("Day")');
      if (fallback) {
        await fallback.click();
        console.log("✅ Click fallback Day box!");
      } else {
        console.log("❌ Không tìm thấy ô điểm danh!");
      }
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);

    try {
      await page.screenshot({ path: "error.png" });
      console.log("📸 Đã chụp ảnh lỗi: error.png");
    } catch {}
  } finally {
    await browser.close();
    console.log("🤖 Bot kết thúc!");
  }
})();
