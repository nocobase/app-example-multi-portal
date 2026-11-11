import { chromium, expect } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const base = process.env.SERVICEHUB_URL ?? 'http://127.0.0.1:13600';
await context.request.post(base + '/main/api/auth/sign-in/email', {
  headers: { Origin: base },
  data: { email: 'customer-1@servicehub.example', password: 'ServiceHub2026!' },
});
const page = await context.newPage();
await page.goto(base + '/main/portals/customer');
await page.getByRole('button', { name: '发起报修', exact: true }).click();
await page.getByLabel('问题标题').fill('手机页面提交验收');
await page
  .getByLabel('详细描述')
  .fill('从手机报修表单提交并验证服务记录持久保存。');
await page.getByRole('button', { name: '提交报修', exact: true }).click();
await expect(page.getByRole('dialog')).toHaveCount(0);
await expect(
  page.getByRole('button', { name: '手机页面提交验收', exact: true }),
).toBeVisible();
await page.reload();
await expect(
  page.getByRole('button', { name: '手机页面提交验收', exact: true }),
).toBeVisible();
console.log('PASS mobile report form and persistence');
await browser.close();
