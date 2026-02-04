const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

const LOGIN_URL = "https://game.skport.com/endfield/sign-in";

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickShowAll(frame) {
  console.log("🔍 Tìm nút 'Xem tất cả phần thưởng'...");
  try {
    const btn = await frame.waitForSelector('text="Xem tất cả phần thưởng"', {
      timeout: 8000,
    });
    if (btn) {
      await btn.click();
      console.log("✅ Đã bấm 'Xem tất cả phần thưởng'");
      await sleep(3000);
    }
  } catch {
    console.log("⚠️ Không thấy nút (có thể đã mở)");
  }
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

    // ===== SHOW ALL DAYS =====
    await clickShowAll(frameTarget);

    console.log("🎯 Bắt đầu duyệt các ngày...");

    // lấy tất cả ô ngày
    const dayBoxes = await frameTarget.$$(`div:has-text("Day"), div:has-text("Ngày")`);

    console.log("📦 Tổng số ô tìm được:", dayBoxes.length);

    for (let i = 0; i < dayBoxes.length; i++) {
      try {
        const box = dayBoxes[i];

        await box.scrollIntoViewIfNeeded();
        await sleep(500);

        const text = await box.innerText();
        console.log(`👉 Check: ${text.trim()}`);

        // kiểm tra đã nhận hay chưa bằng icon tick hoặc class
        const isChecked = await box.evaluate(el => {
          return el.innerHTML.includes("check") || el.className.includes("checked");
        });

        if (isChecked) {
          console.log("✅ Đã nhận → bỏ qua");
          continue;
        }

        // nếu chưa nhận → click
        console.log("🟡 Ngày CHƯA nhận → click!");
        await box.click();
        await sleep(3000);

        console.log("🎉 Điểm danh xong!");
        break; // dừng lại sau khi click ngày chưa nhận
      } catch (err) {
        console.log("⚠️ Lỗi day", i, err.message);
      }
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
    await page.screenshot({ path: "error.png" });
  } finally {
    await browser.close();
    console.log("🤖 Bot end.");
  }
})();
