// tests/tournament.spec.ts
import { chromium, test } from '@playwright/test';

import { loginOrRegister } from '../utils/auth';

test('simulate three users joining tournament', async () => {
  const browser = await chromium.launch();
  const context1 = await browser.newContext();
  // const context2 = await browser.newContext();
  // const context3 = await browser.newContext();

  const baseUrl = 'https://localhost:8443';

  const { page: player1, username: u1 } = await loginOrRegister(context1, baseUrl);
  // const { page: player2, username: u2 } = await loginOrRegister(context2, baseUrl);
  // const { page: player3, username: u3 } = await loginOrRegister(context3, baseUrl);

  console.log(`Logged in as: ${u1}`);

  // Now both players can navigate and join your tournament system
  await player1.goto(`${baseUrl}/gameMenu`);
  console.log(`${u1} navigated to game menu`);
  // await player1.waitForSelector('text="tournament');
  console.log(`${u1} game menu loaded`);
  // await player1.getByRole('button', { name: 'Tournament' }).click();
  // await player1.pause(); // lets you inspect the UI in Playwright's inspector

  // await player1.locator('div:has-text("Tournament")').first().click();
  // await page.locator('.game-menu-card', { hasText: 'Tournament' }).click();
  await player1.getByText('Tournament').nth(0).click(); // h2
  // await page.getByText('Tournament').nth(1).click(); // hover-info

  console.log(`${u1} clicked tournament button`);
  // await player1.goto(`${baseUrl}/tournament`);
  await player1.waitForURL('**/tournament');
  console.log(`${u1} navigated to tournament page`);
  // await player2.goto(`${baseUrl}/tournament`);
  // await player3.goto(`${baseUrl}/tournament`);

  // Wait for the tournament page to load
  // await player1.waitForSelector('#join-game-button');
  // console.log(`Player 1 tournament page loaded`);
  // await player1.getByRole('button', { id: 'join-game-button' }).click();
  // const joinButton = player1.locator('#join-game-button');
  // await joinButton.waitFor({ state: 'visible' });
  // await joinButton.waitFor({ state: 'attached' });
  // await joinButton.waitFor({ state: 'visible' });
  // await player1.getByRole('button', { name: /join/i }).first().click();

  // console.log(`Join button is visible`);
  // await joinButton.click();
  // await player1.getByText('Open tournaments').waitFor({ state: 'visible', timeout: 20000 });
  await player1.waitForTimeout(10000);


  // Wait for any join button (aria-label="Join TournamentName") to appear
  const joinButton = player1.getByLabel(/Join /).first();
  await joinButton.waitFor({ state: 'visible', timeout: 40000 }); // more generous timeout
  console.log(`Join button is visible`);
  await player1.getByLabel(/Join /).first().click();

  console.log(`${u1} clicked join game button`);
  // await player2.getByRole('button', { name: 'Join' }).click();
  // await player3.getByRole('button', { name: 'Join' }).click();

  // Wait for the tournament lobby to load for all players
  // await player1.waitForURL('**/tournamentLobby');
  // await player2.waitForURL('**/tournamentLobby');
  // await player3.waitForURL('**/tournamentLobby');

  // Check if all players are in the tournament lobby
  // const player1LobbyText = await player1.getByText('Tournament Lobby').innerText();
  // const player2LobbyText = await player2.getByText('Tournament Lobby').innerText();
  // const player3LobbyText = await player3.getByText('Tournament Lobby').innerText();

  // console.log(`Player 1 Lobby Text: ${player1LobbyText}`);
  // console.log(`Player 2 Lobby Text: ${player2LobbyText}`);
  // console.log(`Player 3 Lobby Text: ${player3LobbyText}`);

  // Wait for the accept game popup to appear
  await player1
    .getByText('You have a game starting against:')
    .waitFor({ state: 'visible', timeout: 50000 });
  console.log(`Accept game popup is visible`);
  // click to accept
  await player1.getByRole('button', { name: 'Accept' }).click();
  console.log(`${u1} accepted the game`);

  console.log(`Waiting for 140 seconds for game to end...`);
  await player1.waitForTimeout(140000);

  // await player1
  //   .getByText('You have a game starting against:')
  //   .waitFor({ state: 'visible', timeout: 30000 });
  // console.log(`Accept game popup is visible`);
  // // click to accept
  // await player1.getByRole('button', { name: 'Accept' }).click();
  // console.log(`${u1} accepted the 2nd round game`);

  await player1.waitForTimeout(20000);

  await browser.close();
});
