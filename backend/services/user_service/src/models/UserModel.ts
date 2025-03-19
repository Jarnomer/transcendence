import { Database } from 'sqlite';

import { queryWithJsonParsingObject } from '../../../utils/utils';

export class UserModel {
  private db: Database;
  private static instance: UserModel;

  constructor(db: Database) {
    this.db = db;
  }

  static getInstance(db: Database) {
    if (!UserModel.instance) {
      UserModel.instance = new UserModel(db);
    }
    return UserModel.instance;
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

  async createUser(user_id: string) {
    // const profile_id = uuidv4();
    return await this.db.get(`INSERT INTO user_profiles (user_id) VALUES (?) RETURNING *`, [
      user_id,
    ]);
  }

  async getUserByID(user_id: string) {
    return await this.db.get(`SELECT * FROM user_profiles WHERE user_id = ?`, [user_id]);
  }

  async getAllUsersWithRank() {
    return await this.db.all(
      `SELECT
          u.*,
          COALESCE(win_count, 0) AS wins,
          DENSE_RANK() OVER (ORDER BY win_count DESC) AS rank
          FROM user_profiles u
            LEFT JOIN
            (
                SELECT
                player_id,
                COUNT(*) AS win_count
                FROM game_players
                WHERE is_winner = 1
                GROUP BY player_id
            ) gp ON u.user_id = gp.player_id
      ORDER BY rank;`
    );
  }

  async getAllUsers() {
    return await this.db.all(`SELECT * FROM user_profiles`);
  }

  async updateUserByID(
    user_id: string,
    updates: Partial<{
      display_name: string;
      first_name: string;
      last_name: string;
      bio: string;
      avatar_url: string;
      status: string;
    }>
  ) {
    const values = Object.values(updates);
    values.push(user_id);
    const fields = Object.keys(updates)
      .map((column) => `${column} = ?`)
      .join(', ');
    const query = `UPDATE user_profiles SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? RETURNING *`;
    return await this.db.get(query, values);
  }

  async deleteUserByID(user_id: string) {
    return await this.db.run(`DELETE FROM user_profiles WHERE user_id = ?`, [user_id]);
  }

  async createUserStats(user_id: string) {
    return await this.db.get(`INSERT INTO user_stats (user_id) VALUES (?) RETURNING *`, [user_id]);
  }

  //get users profile join user stats friends friend request games
  async getUserData(user_id: string) {
    const query = `
    SELECT
      up.*,
      u.username,
      json_object('wins', us.wins, 'losses', us.losses) AS stats,
      (
        SELECT
        json_group_array
        (
          json_object
          (
            'game_id', g.game_id,
            'status', g.status,
            'started_at', g.start_time,
            'ended_at', g.end_time,
            'my_score', gp_me.score,
            'vsplayer',
              json_object
              (
                'user_id', gp_opponent.player_id,
                'display_name', up_opponent.display_name,
                'avatar_url', up_opponent.avatar_url,
                'score', gp_opponent.score,
                'is_winner', gp_opponent.is_winner
              )
          )
        )
          FROM games g
          LEFT JOIN game_players gp_me ON g.game_id = gp_me.game_id
          LEFT JOIN game_players gp_opponent ON g.game_id = gp_opponent.game_id AND gp_me.player_id <> gp_opponent.player_id
          LEFT JOIN user_profiles up_opponent ON gp_opponent.player_id = up_opponent.user_id
          WHERE gp_me.player_id = up.user_id
          ORDER BY g.start_time DESC
          LIMIT 10
      ) AS games,

      -- ✅ Last 10 Friends (Properly Limited)
      (
        SELECT
        json_group_array
        (
          json_object
          (
            'user_id', f.user_id,
            'display_name', f.display_name,
            'avatar_url', f.avatar_url,
            'status', f.status
          )
        )
        FROM
        (
          -- ✅ First, filter & limit
          SELECT f.user_id, f.display_name, f.avatar_url, f.status
          FROM friends
          JOIN user_profiles f ON friends.friend_id = f.user_id
          WHERE friends.user_id = up.user_id
          LIMIT 10
        ) f
      ) AS friends,

      -- ✅ Last 10 Friend Requests (Properly Limited)
      (
        SELECT
        json_group_array
        (
          json_object
          (
            'user_id', fr.sender_id,
            'display_name', fr.display_name,
            'avatar_url', fr.avatar_url,
            'status', fr.status
          )
        )
        FROM
        (
          -- ✅ First, filter & limit
          SELECT friend_requests.sender_id, friend_requests.status, user_profiles.display_name, user_profiles.avatar_url
          FROM friend_requests
          JOIN user_profiles ON friend_requests.sender_id = user_profiles.user_id
          WHERE friend_requests.receiver_id = up.user_id
          LIMIT 10
        ) fr
      ) AS friend_requests

    -- ✅ Main Table
    FROM user_profiles up
    LEFT JOIN users u ON up.user_id = u.user_id
    LEFT JOIN user_stats us ON up.user_id = us.user_id
    WHERE up.user_id = ?;
    `;

    return await queryWithJsonParsingObject(
      this.db,
      query,
      [user_id],
      ['games', 'friends', 'friend_requests', 'stats']
    );
  }
}
