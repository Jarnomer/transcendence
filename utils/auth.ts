// utils/auth.ts
import { BrowserContext, expect } from '@playwright/test';

export async function loginOrRegister(
  context: BrowserContext,
  baseUrl: string,
  options?: {
    index?: number;
    username?: string;
    password?: string;
    saveStoragePath?: string;
  }
) {
  // const username = options?.username ?? `testuser_${Date.now()}`;
  // const username = options?.username ?? `testuser_${Math.random().toString(36).slice(2, 6)}`;
  const username =
    options?.username ?? `testuser_${options?.index ?? Math.random().toString(36).slice(2, 6)}`;

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
    await expect(page.getByRole('button', { name: 'Register' })).toBeVisible();
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page.getByPlaceholder('Password')).toBeVisible();
    await page.getByPlaceholder('Username').fill(username);
    console.log(`Filled username: ${username}`);
    await page.getByPlaceholder('Password').fill(password);
    console.log(`Filled password: ${password}`);
    await page.getByRole('button', { name: 'Register' }).click();
    console.log('Clicked register button');
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
