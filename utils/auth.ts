// utils/auth.ts
import { BrowserContext, expect } from '@playwright/test';

export async function loginOrRegister(
  context: BrowserContext,
  baseUrl: string,
  options?: {
    username?: string;
    password?: string;
    saveStoragePath?: string;
  }
) {
  // const username = options?.username ?? `testuser_${Date.now()}`;
  const username = options?.username ?? `testuser_${crypto.randomUUID().slice(0, 8)}`;
  const password = options?.password ?? 'TestPassword123';
  const page = await context.newPage();

  await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });

  await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();

  // Try registering
  try {
    await page.getByRole('button', { name: 'Register' }).click();
    console.log('Clicked register button');
    await page.waitForSelector('text=Register');
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
    console.log('Register page is visible');
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    console.log('Register form is visible');
    await page.getByPlaceholder('Username').fill(username);
    console.log(`Filled username: ${username}`);
    await page.getByPlaceholder('Password').fill(password);
    console.log(`Filled password: ${password}`);
    await page.getByRole('button', { name: 'Register' }).click();
    console.log('Clicked register button');
    await page.waitForURL('**/signUp');
    await page.waitForTimeout(7000);
    await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible();
    console.log('Edit Profile page is visible');
    await page.getByLabel('Display name').fill(username);
    console.log(`Filled display name: ${username}`);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('text=Edit Profile')).toHaveCount(0);
    console.log(`Registered new user: ${username}`);
  } catch (err) {
    console.log(`Register failed (probably exists), trying login...`);
    // Retry with login
    // await page.goto(`${baseUrl}/login`);
    // await page.getByPlaceholder('Username').fill(username);
    // await page.getByPlaceholder('Password').fill(password);
    // await page.getByRole('button', { name: 'Login' }).click();
    // await page.waitForURL('**/gameMenu');
  }

  // Optionally save session state
  if (options?.saveStoragePath) {
    await context.storageState({ path: options.saveStoragePath });
  }

  return { page, username, password };
}
