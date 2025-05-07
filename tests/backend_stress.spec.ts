import { chromium, test } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

const testUsers = 30;

test('simulate ${totalUsers} users joining tournament', async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--enable-unsafe-swiftshader'],
  });

  // const baseUrl = 'https://localhost:8443';
  const baseUrl = 'https://192.168.1.111:8443';

  // Simulate a single user flow
  const simulateUser = async (i: number) => {
    const context = await browser.newContext();
    const { page, username } = await loginOrRegister(context, baseUrl);

    await page.waitForURL(`${baseUrl}/gameMenu`);
    console.log(`${username} navigated to game menu`);

    let gameCounter = 5;
    while (gameCounter > 0) {
      await page
        .getByText('SinglePlayer', { exact: true })
        .waitFor({ state: 'visible', timeout: 60_000 });
      await page.getByText('Singleplayer').nth(0).click();
      console.log(`${username} clicked SinglePlayer button`);

      await page.getByText('Brutal', { exact: true }).waitFor({ state: 'visible' });
      await page.getByText('Brutal').nth(0).click();
      console.log(`${username} clicked Brutal button`);

      await page.getByText('Start Game', { exact: true }).waitFor({ state: 'visible' });
      await page.getByText('Start Game').nth(0).click();
      console.log(`${username} clicked Start Game button`);

      try {
        await page
          .getByText('continue', { exact: true })
          .waitFor({ state: 'visible', timeout: 180_000 });
        await page.getByText('continue', { exact: true }).click();
        console.log(`${username} clicked continue`);
      } catch (err) {
        console.error(`${username} did not see continue button in time`);
        break;
      }

      gameCounter--;
    }

    console.log(`${username} finished games`);
    await context.close();
  };

  await Promise.all(Array.from({ length: testUsers }, (_, i) => simulateUser(i + 1)));

  await browser.close();
});
