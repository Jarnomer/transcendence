import { Database } from 'sqlite';
import { v4 as uuidv4 } from 'uuid';

import { queryWithJsonParsingObject } from '../../../utils/utils';

export class GameModel {
  private db: Database;
  private static instance: GameModel;

  constructor(db: Database) {
    this.db = db;
  }

  static getInstance(db: Database) {
    if (!GameModel.instance) {
      GameModel.instance = new GameModel(db);
    }
    return GameModel.instance;
  }

  async runTransaction(callback: (db: Database) => Promise<any>) {
    try {
      await this.db.run('BEGIN TRANSACTION'); // Start transaction
      const result = await callback(this.db); // Run the transaction logic
      await this.db.run('COMMIT'); // Commit transaction if successful
      return result;
    } catch (error) {
      await this.db.run('ROLLBACK'); // Rollback transaction on error
      throw error; // Rethrow error for handling
    }
  }

  /**
   *
   * @param user_id  user_id of the player
   * @param opponent_id user_id of the opponent
   * @returns game object
   * @example
   * {
   *  game_id: 'game_id',
   *  start_time: 'created_at',
   *  end_time: 'end_time',
   *  status: 'status',
   *  }
   */
  async createGame(user_id: string, opponent_id: string) {
    const id = uuidv4();
    console.log('createGame', id, user_id, opponent_id);
    const game_id = await this.db.get(`INSERT INTO games (game_id) VALUES (?) RETURNING *`, [id]);
    await this.db.run(`INSERT INTO game_players (game_id, player_id) VALUES (?, ?)`, [id, user_id]);
    await this.db.run(`INSERT INTO game_players (game_id, player_id) VALUES (?, ?)`, [
      id,
      opponent_id,
    ]);
    return game_id;
  }

  async getGameByUserID(user_id: string) {
    return await this.db.get(
      `SELECT g.game_id
      FROM games g
      JOIN game_players gp ON g.game_id = gp.game_id
      WHERE gp.player_id = ?
      AND status = 'ongoing'`,
      [user_id]
    );
  }

  async getGame(game_id: string) {
    const query = `
      SELECT
      g.*,
      ( SELECT json_group_array
        (json_object
          (
          'user_id', gp.player_id,
          'display_name', up.display_name,
          'avatar_url', up.avatar_url
          )
        )
        FROM game_players gp
        JOIN user_profiles up ON gp.player_id = up.user_id
        WHERE gp.game_id = g.game_id
      ) AS players
      FROM games g
      WHERE g.game_id = ?;
    `;
    return await queryWithJsonParsingObject(this.db, query, [game_id], ['players']);
  }

  async getOngoingGame(user_id: string) {
    return await this.db.get(
      `SELECT COUNT(*) AS ongoing_games
      FROM games g
      JOIN game_players gp ON g.game_id = gp.game_id
      WHERE gp.player_id = ? AND status = 'ongoing'`,
      [user_id]
    );
  }

  async updateGame(
    game_id: string,
    winner_id: string,
    loser_id: string,
    winner_score: number,
    loser_score: number
  ) {
    const updatedGame = await this.db.get(
      `UPDATE games
      SET status = 'completed'
      WHERE game_id = ? RETURNING *`,
      [game_id]
    );
    await this.db.run(
      `UPDATE game_players
      SET score = ?, is_winner = true
      WHERE game_id = ? AND player_id = ?`,
      [winner_score, game_id, winner_id]
    );
    await this.db.run(
      `UPDATE game_players
      SET score = ?, is_winner = false
      WHERE game_id = ? AND player_id = ?`,
      [loser_score, game_id, loser_id]
    );
    return updatedGame;
  }
}
