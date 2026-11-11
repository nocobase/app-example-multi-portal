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
await page.getByRole('button', { name: 'Report a fault', exact: true }).click();
await page.getByLabel('Issue title').fill('Mobile repair request');
await page
  .getByLabel('Description')
  .fill('Submit a repair from mobile and verify that it persists.');
await page.getByRole('button', { name: 'Submit request', exact: true }).click();
await expect(page.getByRole('dialog')).toHaveCount(0);
await expect(
  page.getByRole('button', { name: 'Mobile repair request', exact: true }),
).toBeVisible();
await page.reload();
await expect(
  page.getByRole('button', { name: 'Mobile repair request', exact: true }),
).toBeVisible();
console.log('PASS mobile report form and persistence');
await browser.close();
