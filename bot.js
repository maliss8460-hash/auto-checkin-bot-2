const { chromium } = require("playwright");

const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ⏰ chờ tới 23:30
async function waitUntil2330() {
  while (true) {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();

    if (h === 23 && m >= 30) {
      console.log("🎯 Đã tới 23:30, bắt đầu điểm danh!");
      break;
    }

    console.log(`⏳ Chưa tới giờ (${h}:${m}) -> chờ 30 giây...`);
    await sleep(30000);
  }
}

async function main() {
  console.log("🤖 Bot bắt đầu chạy...");

  if (!EMAIL || !PASSWORD) {
    console.log("❌ Thiếu EMAIL hoặc PASSWORD!");
    return;
  }

  await waitUntil2330();

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log("🌐 Mở trang game...");
    
    // ✅ LINK LOGIN = LINK ĐIỂM DANH
    await page.goto("https://game.skport.com/endfield/sign-in", {
      waitUntil: "networkidle"
    });

    console.log("🔐 Nhập email...");
    await page.fill('input[name="email"]', EMAIL);

    console.log("🔐 Nhập mật khẩu...");
    await page.fill('input[type="password"]', PASSWORD);

    // đợi nút login enable
    await page.waitForFunction(() => {
      const btn = document.querySelector('button[type="submit"]');
      return btn && !btn.disabled;
    });

    console.log("👉 Click login...");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(5000);
    console.log("✅ Login xong!");

    console.log("🔎 Tìm ô điểm danh hôm nay...");

    // 👉 tìm ô chưa điểm danh (icon sáng)
    const checkinBtn = await page.$('img[src*="endfield_attendance"]');

    if (!checkinBtn) {
      console.log("⏳ Chưa tới giờ hoặc đã điểm danh rồi.");
    } else {
      await checkinBtn.click();
      console.log("🎉 Click điểm danh!");
    }

  } catch (err) {
    console.log("❌ Lỗi:", err.message);
  }

  await browser.close();
  console.log("😴 Bot kết thúc.");
}

main();
