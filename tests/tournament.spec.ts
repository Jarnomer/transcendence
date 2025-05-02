import { chromium, test, Page } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

const totalUsers = 15; // total number of users to simulate

test('simulate ${totalUsers} users joining tournament', async () => {
  const browser = await chromium.launch({
    // args: ['--enable-unsafe-swiftshader'],
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--enable-unsafe-swiftshader'],
  });

  const baseUrl = 'https://localhost:8443';
  // const baseUrl = 'https://192.168.1.111:8443';

  async function playAndMaybeContinue(page: Page, username: string): Promise<boolean> {
    try {
      await page
        .getByText('You have a game starting against:', { exact: false })
        .waitFor({ state: 'visible', timeout: 180_000 });
      console.log(`${username} sees next game invite`);
      await page.getByRole('button', { name: 'Accept' }).click();
      console.log(`${username} accepted next round`);
    } catch {
      console.log(`${username} eliminated`);
      return false;
    }

    try {
      await page
        .getByText('continue', { exact: true })
        .waitFor({ state: 'visible', timeout: 180_000 });
      if (await page.getByText('You Win!', { exact: true }).isVisible()) {
        console.log(`${username} won`);
      } else {
        console.log(`${username} lost`);
        return false;
      }
      await page.getByText('continue', { exact: true }).click();
      console.log(`${username} clicked continue`);
      return true;
    } catch (err) {
      console.error(`${username} did not see continue button in time`);
      return false;
    }
  }

  // Simulate a single user flow
  const simulateUser = async (i: number) => {
    const context = await browser.newContext();
    const { page, username } = await loginOrRegister(context, baseUrl, { index: i });

    console.log(`Logged in as: ${username}`);

    await page.goto(`${baseUrl}/gameMenu`);
    console.log(`${username} navigated to game menu`);

    await page.getByText('Tournament').nth(0).click();
    console.log(`${username} clicked tournament button`);

    await page.waitForURL('**/tournament');
    console.log(`${username} navigated to tournament page`);

    const joinButton = page.getByLabel(/Join /).first();
    await joinButton.waitFor({ state: 'visible' });
    await joinButton.click();
    console.log(`${username} clicked join`);

    // Loop through rounds until eliminated
    let stillInTournament = true;
    while (stillInTournament) {
      stillInTournament = await playAndMaybeContinue(page, username);
    }

    await context.close();
  };

  // Simulate all users concurrently
  await Promise.all(Array.from({ length: totalUsers }, (_, i) => simulateUser(i + 1)));

  await browser.close();
});
