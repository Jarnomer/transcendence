// tests/tournament.spec.ts
import { test, chromium } from '@playwright/test';
import { loginOrRegister } from '../utils/auth';

test('simulate three users joining tournament', async () => {
  const browser = await chromium.launch();
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const context3 = await browser.newContext();

  const baseUrl = 'https://localhost:8443';

  const { page: player1, username: u1 } = await loginOrRegister(context1, baseUrl);
  const { page: player2, username: u2 } = await loginOrRegister(context2, baseUrl);
  const { page: player3, username: u3 } = await loginOrRegister(context3, baseUrl);

  console.log(`Logged in as: ${u1}, ${u2}, ${u3}`);

  // Now both players can navigate and join your tournament system
  await player1.goto(`${baseUrl}/tournament`);
  await player2.goto(`${baseUrl}/tournament`);
  await player3.goto(`${baseUrl}/tournament`);

  await player1.getByRole('button', { name: 'Join' }).click();
  await player2.getByRole('button', { name: 'Join' }).click();
  await player3.getByRole('button', { name: 'Join' }).click();

  // Wait for the tournament lobby to load for all players
  await player1.waitForURL('**/tournamentLobby');
  await player2.waitForURL('**/tournamentLobby');
  await player3.waitForURL('**/tournamentLobby');

  // Check if all players are in the tournament lobby
  const player1LobbyText = await player1.getByText('Tournament Lobby').innerText();
  const player2LobbyText = await player2.getByText('Tournament Lobby').innerText();
  const player3LobbyText = await player3.getByText('Tournament Lobby').innerText();

  console.log(`Player 1 Lobby Text: ${player1LobbyText}`);
  console.log(`Player 2 Lobby Text: ${player2LobbyText}`);
  console.log(`Player 3 Lobby Text: ${player3LobbyText}`);

  await browser.close();
});
