import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {}),
});
const origins = [
  process.env.SERVICEHUB_URL ?? 'http://127.0.0.1:13600',
  process.env.SERVICEHUB_PUBLIC_URL,
].filter(Boolean);
for (const origin of origins) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    ...(origin.startsWith('https:') && process.env.HTTPS_PROXY
      ? { proxy: { server: process.env.HTTPS_PROXY } }
      : {}),
  });
  const response = await context.request.post(
    origin + '/main/api/auth/sign-in/email',
    {
      headers: { Origin: origin },
      data: {
        email: 'engineer-1@servicehub.example',
        password: 'ServiceHub2026!',
      },
    },
  );
  if (response.status() !== 200)
    throw new Error('Sign-in ' + response.status() + ' on ' + origin);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(origin + '/main/portals/engineer', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });
  await expect(page.getByRole('heading', { name: '你好，林晨' })).toBeVisible({
    timeout: 45000,
  });
  await expect(page.getByText('我的服务任务')).toBeVisible();
  await page.waitForTimeout(700);
  const dimensions = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
  }));
  if (dimensions.width > dimensions.viewport)
    throw new Error('Horizontal overflow ' + JSON.stringify(dimensions));
  if (errors.length) throw new Error(errors.join('\n'));
  await page
    .getByRole('button', { name: /查看任务/ })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: '关闭', exact: true }).first().click();
  await page.screenshot({
    path:
      origin === origins[0]
        ? '/tmp/servicehub-engineer-mobile.png'
        : '/tmp/servicehub-public-mobile.png',
    fullPage: true,
  });
  console.log('PASS', origin, 'mobile layout and task dialog');
  await context.close();
}
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const base = origins[0];
await context.request.post(base + '/main/api/auth/sign-in/email', {
  headers: { Origin: base },
  data: { email: 'admin@nocobase.com', password: 'admin123' },
});
const page = await context.newPage();
await page.goto(base + '/main/');
await expect(page.getByRole('heading', { name: '客户服务台' })).toBeVisible();
await expect(page.getByRole('link', { name: /服务洞察/ })).toHaveCount(0);
await page.getByRole('button', { name: '恢复演示数据', exact: true }).click();
await expect(page.getByRole('dialog')).toBeVisible();
await page.getByRole('button', { name: '确认恢复', exact: true }).click();
await expect(page.getByRole('dialog')).toHaveCount(0);
await page.screenshot({
  path: '/tmp/servicehub-workbench.png',
  fullPage: true,
});
console.log('PASS admin workbench and reset');
await browser.close();
