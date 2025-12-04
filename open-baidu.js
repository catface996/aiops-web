import { chromium } from 'playwright';

(async () => {
  // 启动浏览器（非无头模式，这样可以看到浏览器窗口）
  const browser = await chromium.launch({ headless: false });

  // 创建新页面
  const page = await browser.newPage();

  // 打开百度
  await page.goto('https://www.baidu.com');

  console.log('已打开百度，页面标题:', await page.title());

  // 保持浏览器打开 30 秒
  await page.waitForTimeout(30000);

  // 关闭浏览器
  await browser.close();
})();
