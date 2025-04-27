class EloSystem {
  private static K_FACTOR = 32; // Adjust this based on your ranking system

  static calculateElo(
    winnerElo: number,
    loserElo: number
  ): { newWinnerElo: number; newLoserElo: number } {
    const expectedWin = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedLose = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = Math.round(winnerElo + this.K_FACTOR * (1 - expectedWin));
    const newLoserElo = Math.round(loserElo + this.K_FACTOR * (0 - expectedLose));

    return { newWinnerElo, newLoserElo };
  }
}

import { db } from '@services/db';
import EloSystem from '@services/elo';

async function updateEloAfterGame(gameId: string) {
  const players = await db.all(
    'SELECT player_id, elo, is_winner FROM game_players INNER JOIN user_stats ON game_players.player_id = user_stats.user_id WHERE game_id = ?',
    [gameId]
  );

  if (players.length !== 2) {
    console.error('Game must have exactly 2 players for ELO update.');
    return;
  }

  const [player1, player2] = players;
  const winner = player1.is_winner ? player1 : player2;
  const loser = player1.is_winner ? player2 : player1;

  const { newWinnerElo, newLoserElo } = EloSystem.calculateElo(winner.elo, loser.elo);

  await db.run('UPDATE user_stats SET elo = ? WHERE user_id = ?', [newWinnerElo, winner.player_id]);
  await db.run('UPDATE user_stats SET elo = ? WHERE user_id = ?', [newLoserElo, loser.player_id]);

  console.log(
    `ELO updated! Winner: ${winner.player_id} → ${newWinnerElo}, Loser: ${loser.player_id} → ${newLoserElo}`
  );
}

// WITH RankedUsers AS (
//   SELECT
//     user_id,
//     elo,
//     RANK() OVER (ORDER BY elo DESC) AS rank
//   FROM user_stats
// )
// UPDATE user_stats
// SET rank = (SELECT rank FROM RankedUsers WHERE RankedUsers.user_id = user_stats.user_id);

// SELECT user_id, elo, rank
// FROM user_stats
// ORDER BY rank ASC
// LIMIT 10;
