import { chromium, expect, Page, test } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

const totalUsers = 16; // total number of users to simulate

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
      console.log(`${username} accepted next game`);
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

  const simulateTournamentCreator = async (i: number) => {
    const context = await browser.newContext();
    const { page, username } = await loginOrRegister(context, baseUrl);

    await page.waitForURL(`${baseUrl}/gameMenu`);
    console.log(`${username} navigated to game menu`);

    // wait for the tournament button to be visible
    await page
      .getByText('Tournament', { exact: true })
      .waitFor({ state: 'visible', timeout: 60_000 });
    await page.getByText('Tournament').nth(0).click();
    console.log(`${username} clicked tournament button`);

    // await page.waitForURL('**/signUp');
    // await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible({
    //   timeout: 15000,
    // });
    // wait for display name input to be visible
    await page.getByLabel('Display name').waitFor({ state: 'visible', timeout: 60_000 });
    await page.getByLabel('Display name').fill(username);
    console.log(`Filled display name: ${username}`);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('text=Edit Profile')).toHaveCount(0);
    console.log(`Registered new user: ${username}`);

    console.log(`Logged in as: ${username}`);

    await page.waitForURL('**/tournament');
    console.log(`${username} navigated to tournament page`);

    // click the create tournament button
    await page.getByRole('button', { name: 'Create' });
    await page.getByRole('button', { name: 'Create' }).click();
    console.log(`${username} clicked create tournament`);

    // move player count slider to 16
    const playerCountSlider = page.getByRole('slider', { name: 'Player Count' });
    await playerCountSlider.waitFor({ state: 'visible', timeout: 60_000 });
    await playerCountSlider.fill('16');
    console.log(`Filled player count slider: 16`);

    // input tournament name
    const tournamentNameInput = page.getByLabel('Tournament Name:');
    await tournamentNameInput.waitFor({ state: 'visible', timeout: 60_000 });
    await tournamentNameInput.fill(`Tournament ${i}`);
    console.log(`Filled tournament name: Tournament ${i}`);
    await page.getByRole('button', { name: 'Create tournament' }).click();
    console.log(`${username} clicked create tournament`);

    // Loop through rounds until eliminated
    let stillInTournament = true;
    while (stillInTournament) {
      stillInTournament = await playAndMaybeContinue(page, username);
    }

    await context.close();
  };

  // Simulate a single user flow
  const simulateUser = async (i: number) => {
    if (i === 1) {
      // Simulate the tournament creator
      await simulateTournamentCreator(i);
      return;
    }
    // Simulate a normal user after a 15 second delay
    await new Promise((resolve) => setTimeout(resolve, 15_000));
    const context = await browser.newContext();
    const { page, username } = await loginOrRegister(context, baseUrl);

    await page.waitForURL(`${baseUrl}/gameMenu`);
    console.log(`${username} navigated to game menu`);

    // wait for the tournament button to be visible
    await page
      .getByText('Tournament', { exact: true })
      .waitFor({ state: 'visible', timeout: 60_000 });
    await page.getByText('Tournament').nth(0).click();
    console.log(`${username} clicked tournament button`);

    // await page.waitForURL('**/signUp');
    // await expect(page.getByRole('heading', { name: 'Edit Profile' })).toBeVisible({
    //   timeout: 15000,
    // });
    // wait for display name input to be visible
    await page.getByLabel('Display name').waitFor({ state: 'visible', timeout: 60_000 });
    await page.getByLabel('Display name').fill(username);
    console.log(`Filled display name: ${username}`);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('text=Edit Profile')).toHaveCount(0);
    console.log(`Registered new user: ${username}`);

    console.log(`Logged in as: ${username}`);

    await page.waitForURL('**/tournament');
    console.log(`${username} navigated to tournament page`);

    const joinButton = page.getByLabel(/Join /).first();
    await joinButton.waitFor({ state: 'visible' });
    await joinButton.click();
    console.log(`${username} clicked join`);

    // Loop through rounds until eliminated
    let stillInTournament = true;
    let roundCounter = 1;
    while (stillInTournament) {
      stillInTournament = await playAndMaybeContinue(page, username);
      if (stillInTournament) {
        roundCounter++;
        console.log(`${username} is in round ${roundCounter}`);
      }
    }

    await context.close();
  };

  await Promise.all(Array.from({ length: totalUsers }, (_, i) => simulateUser(i + 1)));
  // Simulate the tournament creator

  await browser.close();
});
