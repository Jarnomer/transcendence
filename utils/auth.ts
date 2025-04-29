// utils/auth.ts
import { Page, BrowserContext, expect } from '@playwright/test';

export async function loginOrRegister(
  context: BrowserContext,
  baseUrl: string,
  options?: {
    username?: string;
    password?: string;
    saveStoragePath?: string;
  }
) {
  const username = options?.username ?? `testuser_${Date.now()}`;
  const password = options?.password ?? 'TestPassword123';
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`);

  // Try registering
  try {
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Register' }).click();
    await page.waitForURL('**/signUp');
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
    await page.getByLabel('Display name').fill(username);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('text=Edit Profile')).toHaveCount(0);
    console.log(`Registered new user: ${username}`);
  } catch (err) {
    console.log(`Register failed (probably exists), trying login...`);
    // Retry with login
    await page.goto(`${baseUrl}/login`);
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForURL('**/gameMenu');
  }

  // Optionally save session state
  if (options?.saveStoragePath) {
    await context.storageState({ path: options.saveStoragePath });
  }

  return { page, username, password };
}
