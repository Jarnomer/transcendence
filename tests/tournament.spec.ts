import { chromium, Page, test } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

const totalUsers = 4; // total number of users to simulate

test('simulate ${totalUsers} users joining tournament', async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--enable-unsafe-swiftshader'],
  });

  const baseUrl = 'https://localhost:8443';

  async function playAndMaybeContinue(
    page: Page,
    username: string,
    roundCounter: number
  ): Promise<boolean> {
    try {
      await page
        .getByText('You have a game starting against:', { exact: false })
        .waitFor({ state: 'visible', timeout: 180_000 });
      console.log(`${username} sees round ${roundCounter} game invite`);
      await page.getByRole('button', { name: 'Accept' }).click();
      console.log(`${username} accepted round ${roundCounter} game invite`);
    } catch {
      console.log(`${username} eliminated`);
      return false;
    }

    try {
      await page
        .getByText('continue', { exact: true })
        .waitFor({ state: 'visible', timeout: 180_000 });
      if (await page.getByText('You Win!', { exact: true }).isVisible()) {
        console.log(`${username} won round ${roundCounter} game`);
      } else {
        console.log(`${username} lost round ${roundCounter} game`);
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

  const simulateTournamentCreator = async (page: Page, username: string, i: number) => {
    await page.waitForURL(`${baseUrl}/gameMenu`);
    console.log(`${username} navigated to game menu`);

    // wait for the tournament button to be visible
    await page
      .getByText('Tournament', { exact: true })
      .waitFor({ state: 'visible', timeout: 60_000 });
    await page.getByText('Tournament').nth(0).click();
    console.log(`${username} clicked tournament button`);

    await page.waitForURL('**/tournament');
    console.log(`${username} navigated to tournament page`);

    // click the create tournament button
    await page.getByRole('button', { name: 'Create' });
    await page.getByRole('button', { name: 'Create' }).click();
    console.log(`${username} clicked create tournament`);

    // move player count slider to 16
    const playerCountSlider = page.getByRole('slider', { name: 'Player Count' });
    await playerCountSlider.waitFor({ state: 'visible', timeout: 60_000 });
    // fill the slider with the value of totalUsers
    await playerCountSlider.fill(totalUsers.toString());
    console.log(`Filled player count slider: ${totalUsers}`);

    // input tournament name
    const tournamentNameInput = page.getByLabel('Tournament Name:');
    await tournamentNameInput.waitFor({ state: 'visible', timeout: 60_000 });
    await tournamentNameInput.fill(`Tournament ${i}`);
    console.log(`Filled tournament name: Tournament ${i}`);
    await page.getByRole('button', { name: 'Create tournament' }).click();
    console.log(`${username} clicked create tournament`);
  };

  // Simulate a single user flow
  const simulateUser = async (i: number) => {
    const context = await browser.newContext();
    const { page, username } = await loginOrRegister(context, baseUrl);
    if (i === 1) {
      // Simulate the tournament creator
      await simulateTournamentCreator(page, username, i);
    } else {
      // Simulate a normal user after a 10 second delay
      await new Promise((resolve) => setTimeout(resolve, 10_000));

      await page.waitForURL(`${baseUrl}/gameMenu`);
      console.log(`${username} navigated to game menu`);

      // wait for the tournament button to be visible
      await page
        .getByText('Tournament', { exact: true })
        .waitFor({ state: 'visible', timeout: 60_000 });
      await page.getByText('Tournament').nth(0).click();
      console.log(`${username} clicked tournament button`);

      await page.waitForURL('**/tournament');
      console.log(`${username} navigated to tournament page`);

      const joinButton = page.getByLabel(/Join /).first();
      await joinButton.waitFor({ state: 'visible' });
      await joinButton.click();
      console.log(`${username} clicked join`);
    }

    // Loop through rounds until eliminated
    let stillInTournament = true;
    let roundCounter = 1;
    while (stillInTournament) {
      stillInTournament = await playAndMaybeContinue(page, username, roundCounter);
      if (stillInTournament) {
        roundCounter++;
        if (roundCounter > Math.log2(totalUsers)) {
          console.log(`${username} won the tournament`);
          break;
        }
        console.log(`${username} is waiting for round ${roundCounter} game`);
      }
    }

    console.log(`${username} finished tournament`);
    await context.close();
  };

  await Promise.all(Array.from({ length: totalUsers }, (_, i) => simulateUser(i + 1)));

  await browser.close();
});
