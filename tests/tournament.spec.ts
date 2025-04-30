// tests/tournament.spec.ts
import { chromium, test } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

test('simulate 3 users joining tournament', async () => {
  const browser = await chromium.launch();
  const baseUrl = 'https://localhost:8443';

  const simulateUser = async (i: number) => {
    const context = await browser.newContext();
    const { page, username } = await loginOrRegister(context, baseUrl);

    console.log(`Logged in as: ${username}`);

    await page.goto(`${baseUrl}/gameMenu`);
    console.log(`${username} navigated to game menu`);

    await page.getByText('Tournament').nth(0).click();
    console.log(`${username} clicked tournament button`);

    await page.waitForURL('**/tournament');
    console.log(`${username} navigated to tournament page`);

    const joinButton = page.getByLabel(/Join /).first();
    await joinButton.waitFor({ state: 'visible' });
    // console.log(`${username} sees join button`);
    await joinButton.click();
    console.log(`${username} clicked join`);

    await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    // console.log(`${username} sees game start popup`);
    await page.getByRole('button', { name: 'Accept' }).click();
    console.log(`${username} accepted first game`);

    // wait for 10 minutes
    await page.waitForTimeout(10 * 60 * 1000);

    // await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    // await page.getByRole('button', { name: 'Accept' }).click();
    // console.log(`${username} accepted second round`);

    // await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    // await page.getByRole('button', { name: 'Accept' }).click();
    // console.log(`${username} accepted third round`);

    // await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    // await page.getByRole('button', { name: 'Accept' }).click();
    // console.log(`${username} accepted fourth round`);

    await context.close();
  };

  // Launch 5 users in parallel
  await Promise.all([
    simulateUser(1),
    simulateUser(2),
    simulateUser(3),
    // simulateUser(4),
    // simulateUser(5),
    // simulateUser(6),
    // simulateUser(7),
  ]);

  await browser.close();
});
