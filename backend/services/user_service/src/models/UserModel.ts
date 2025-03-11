import { Database } from "sqlite";
import { v4 as uuidv4 } from 'uuid';
import { queryWithJsonParsing } from '../utils/utils';

export class UserModel {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async runTransaction(callback: (db: Database) => Promise<any>) {
    try {
      await this.db.run("BEGIN TRANSACTION"); // Start transaction
      const result = await callback(this.db); // Run the transaction logic
      await this.db.run("COMMIT"); // Commit transaction if successful
      return result;
    } catch (error) {
      await this.db.run("ROLLBACK"); // Rollback transaction on error
      throw error; // Rethrow error for handling
    }
  }

  async createUser(user_id: string) {
    const profile_id = uuidv4();
    return await this.db.get(
      `INSERT INTO user_profiles (user_id, profile_id) VALUES (?, ?) RETURNING *`,
      [user_id, profile_id]
    );
  }

  async getUserByID(user_id: string) {
    return await this.db.get(`SELECT * FROM user_profiles WHERE user_id = ?`, [user_id]);
  }

  async getAllUsers() {
    return await this.db.all(`SELECT * FROM user_profiles`);
  }

  async updateUserByID(user_id: string, updates: Partial<{
    display_name: string;
    first_name: string;
    last_name: string;
    bio: string;
    avatar_url: string;
    status: string;
  }>) {
    const values = Object.values(updates);
    values.push(user_id);
    const fields = Object.keys(updates).map((column) => `${column} = ?`).join(", ");
    const query = `UPDATE user_profiles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? RETURNING *`;
    return await this.db.get(query, values);
  }

  async deleteUserByID(user_id: string) {
    return await this.db.run(`DELETE FROM user_profiles WHERE user_id = ?`, [user_id]);
  }

  async createUserStats(user_id: string) {
    return await this.db.get(
      `INSERT INTO user_stats (user_id) VALUES (?) RETURNING *`,
      [user_id]
    );
  }

  //get users profile join user stats friends friend request games
  async getUserData(user_id: string) {
    const query = `
    SELECT
      up.*,
      u.username,
      json_object('wins', us.wins, 'losses', us.losses) AS stats,

      -- Limit games to 10
      (SELECT json_group_array(
        json_object(
          'game_id', g.game_id,
          'player1', json_object('user_id', g.player1_id, 'score', g.player1_score),
          'player2', json_object('user_id', g.player2_id, 'score', g.player2_score),
          'winner', json_object(
            'user_id', g.winner_id,
            'score', CASE
              WHEN g.winner_id = g.player1_id THEN g.player1_score
              ELSE g.player2_score
            END
          ),
          'loser', json_object(
            'user_id', g.loser_id,
            'score', CASE
              WHEN g.loser_id = g.player1_id THEN g.player1_score
              ELSE g.player2_score
            END
          ),
          'started_at', g.start_time,
          'ended_at', g.end_time,
          'display_name', up2.display_name
        )
      )
      FROM games g
      LEFT JOIN user_profiles up2 ON  g.winner_id = up2.user_id  OR g.loser_id = up2.user_id AND up2.user_id != up.user_id
      WHERE g.player1_id = up.user_id OR g.player2_id = up.user_id
      ORDER BY g.start_time DESC -- Order by newest games first
      LIMIT 10
      ) AS games,

      -- Limit friends to 10
      (SELECT json_group_array(
        json_object(
          'user_id', f.user_id,
          'display_name', f.display_name,
          'avatar_url', f.avatar_url,
          'status', f.status
        )
      )
      FROM friends
      JOIN user_profiles f ON friends.friend_id = f.user_id
      WHERE friends.user_id = up.user_id
      LIMIT 10
      ) AS friends,

      -- Limit friend requests to 10
      (SELECT json_group_array(
        json_object(
          'user_id', f2.user_id,
          'display_name', f2.display_name,
          'avatar_url', f2.avatar_url,
          'status', friend_requests.status
        )
      )
      FROM friend_requests
      JOIN user_profiles f2 ON friend_requests.sender_id = f2.user_id
      WHERE friend_requests.receiver_id = up.user_id
      LIMIT 10
      ) AS friend_requests

    FROM user_profiles up
    LEFT JOIN users u ON up.user_id = u.user_id
    LEFT JOIN user_stats us ON up.user_id = us.user_id
    WHERE up.user_id = ?;
    `;

    return await queryWithJsonParsing(this.db, query, [user_id], [
      "games",
      "friends",
      "friend_requests",
      "stats",
    ]);
  }
}
