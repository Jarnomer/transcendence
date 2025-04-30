// tests/tournament.spec.ts

// import { chromium, test } from '@playwright/test';

// import { loginOrRegister } from '../utils/auth';

// test('simulate 15 users joining tournament', async () => {
//   const totalUsers = 15;

//   const browser = await chromium.launch();
//   const baseUrl = 'https://localhost:8443';

//   const userSessions = await Promise.all(
//     Array.from({ length: totalUsers }, async (_, i) => {
//       const context = await browser.newContext();
//       const { page, username } = await loginOrRegister(context, baseUrl, { index: i + 1 });
//       return { page, username, context };
//     })
//   );

//   // Step 1: All users navigate to tournament page
//   await Promise.all(
//     userSessions.map(async ({ page, username }) => {
//       await page.goto(`${baseUrl}/gameMenu`);
//       await page.getByText('Tournament').first().click();
//       await page.waitForURL('**/tournament');
//       console.log(`${username} ready to join tournament`);
//     })
//   );

//   // Step 2: All users click "Join" concurrently
//   await Promise.all(
//     userSessions.map(async ({ page, username }) => {
//       const joinButton = page.getByLabel(/Join /).first();
//       await joinButton.waitFor({ state: 'visible' });
//       await joinButton.click();
//       console.log(`${username} clicked join`);
//     })
//   );

//   // // All users click "Accept" for the first game
//   // await Promise.all(
//   //   userSessions.map(async ({ page, username }) => {
//   //     await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
//   //     await page.getByRole('button', { name: 'Accept' }).click();
//   //     console.log(`${username} accepted first game`);
//   //     await page.getByText('continue').click();
//   //     console.log(`${username} clicked continue`);
//   //   })
//   // );

//   // Step 3: Simulate tournament matches with limited concurrency
//   // const limit = pLimit(concurrency);
//   await Promise.all(
//     userSessions.map(({ page, username, context }) => {
//       for (let round = 1; round <= 4; round++) {
//         await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
//         await page.getByRole('button', { name: 'Accept' }).click();
//         console.log(`${username} accepted round ${round}`);
//         await page.getByText('continue').click();
//         console.log(`${username} clicked continue`);
//       }
//       await context.close();
//     })
//   );

//   await browser.close();
// });

import { chromium, test } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

test('simulate 15 users joining tournament', async () => {
  const totalUsers = 15; // total number of users to simulate

  const browser = await chromium.launch();
  const baseUrl = 'https://localhost:8443';

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
    // console.log(`${username} sees join button`);
    await joinButton.click();
    console.log(`${username} clicked join`);

    await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    // console.log(`${username} sees game start popup`);
    await page.getByRole('button', { name: 'Accept' }).click();
    console.log(`${username} accepted first game`);

    // wait for 10 minutes
    // await page.waitForTimeout(10 * 60 * 1000);
    await page.getByText('continue').click();
    console.log(`${username} clicked continue`);

    // await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Accept' }).click();
    console.log(`${username} accepted second round game`);

    await page.getByText('continue').click();
    console.log(`${username} clicked continue`);

    // await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Accept' }).click();
    console.log(`${username} accepted third round game`);

    await page.getByText('continue').click();
    console.log(`${username} clicked continue`);

    // await page.getByText('You have a game starting against:').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Accept' }).click();
    console.log(`${username} accepted fourth round game`);

    await page.getByText('continue').click();
    console.log(`${username} clicked continue`);

    await context.close();
  };

  // Run test for all users
  await Promise.all(Array.from({ length: totalUsers }, (_, i) => simulateUser(i + 1)));
  // await Promise.all(

  await browser.close();
});
