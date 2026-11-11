import { chromium } from '@playwright/test';
const browser = await chromium.launch({
  headless: true,
  ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
    ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
    : {}),
});
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 },
});
const base = process.env.SERVICEHUB_URL ?? 'http://127.0.0.1:13600';
await context.request.post(base + '/main/api/auth/sign-in/email', {
  headers: { Origin: base },
  data: { email: 'customer-1@servicehub.example', password: 'ServiceHub2026!' },
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(base + '/main/portals/customer');
await page.waitForTimeout(2500);
console.log('body', (await page.locator('body').innerText()).slice(0, 1400));
console.log('errors', errors);
await page.screenshot({ path: '/tmp/servicehub-customer.png', fullPage: true });
await browser.close();
