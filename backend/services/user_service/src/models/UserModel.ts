import { Database } from 'sqlite';

import { GameAudioOptions, GameSettings, GraphicsSettings } from '@shared/types';

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

  async createUser(user_id: string) {
    return await this.db.get(`INSERT INTO user_profiles (user_id) VALUES (?) RETURNING *`, [
      user_id,
    ]);
  }

  async getUserByID(user_id: string) {
    return await this.db.get(`SELECT * FROM user_profiles WHERE user_id = ?`, [user_id]);
  }

  // async getAllUsersWithRank() {
  //   return await this.db.all(
  //     `SELECT
  //         u.*,
  //         COALESCE(win_count, 0) AS wins,
  //         DENSE_RANK() OVER (ORDER BY win_count DESC) AS rank
  //         FROM user_profiles u
  //           LEFT JOIN
  //           (
  //               SELECT
  //               player_id,
  //               COUNT(*) AS win_count
  //               FROM game_players
  //               WHERE is_winner = 1
  //               GROUP BY player_id
  //           ) gp ON u.user_id = gp.player_id
  //     ORDER BY rank
  //     ;`
  //   );
  // }

  async getAllUsersWithRank() {
    return await this.db.all(
      `SELECT
          us.*,
          up.*
          FROM user_stats us
          LEFT JOIN user_profiles up ON us.user_id = up.user_id
          ORDER BY us.rank
      ;`
    );
  }

  async getAllUsers(user_id: string) {
    return await this.db.all(
      `
      SELECT * FROM user_profiles
      WHERE user_id != ?
      AND user_id NOT IN (
        SELECT blocked_user_id FROM blocked_users WHERE user_id = ?
        UNION
        SELECT user_id FROM blocked_users WHERE blocked_user_id = ?
      )`,
      [user_id, user_id, user_id]
    );
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
    return await this.db.run(`DELETE FROM users WHERE user_id = ?`, [user_id]);
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
      json_object('wins', us.wins, 'losses', us.losses, 'rating', us.elo, 'rank', us.rank) AS stats,
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
          WHERE friend_requests.receiver_id = up.user_id AND friend_requests.status = 'pending'
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

  async getNotifications(user_id: string) {
    return await this.db.all(
      `SELECT *
      FROM notifications n
      WHERE n.user_id = ? AND n.seen = 0 ORDER BY created_at DESC`,
      [user_id]
    );
  }

  async markNotificationAsSeen(notification_id: string) {
    return await this.db.get(
      `UPDATE notifications SET seen = 1 WHERE notification_id = ? RETURNING *`,
      [notification_id]
    );
  }

  async saveGameSettings(user_id: string, settings: GameSettings) {
    const settingsString = JSON.stringify(settings);
    return await this.db.get(
      `UPDATE user_profiles SET game_settings = ? WHERE user_id = ? RETURNING *`,
      [settingsString, user_id]
    );
  }

  async getUserStats(user_id: string) {
    return await this.db.get(`SELECT * FROM user_stats WHERE user_id = ?`, [user_id]);
  }

  async saveAudioSettings(user_id: string, settings: GameAudioOptions) {
    const settingsString = JSON.stringify(settings);
    return await this.db.get(
      `UPDATE user_profiles SET audio_settings = ? WHERE user_id = ? RETURNING *`,
      [settingsString, user_id]
    );
  }

  async getAudioSettings(user_id: string) {
    const result = await this.db.get(`SELECT audio_settings FROM user_profiles WHERE user_id = ?`, [
      user_id,
    ]);

    if (result && result.audio_settings) {
      try {
        return JSON.parse(result.audio_settings);
      } catch (error) {
        console.error('Error parsing audio settings:', error);
        return null;
      }
    }

    return null;
  }

  async saveGraphicsSettings(user_id: string, settings: GraphicsSettings) {
    const settingsString = JSON.stringify(settings);
    return await this.db.get(
      `UPDATE user_profiles SET graphics_settings = ? WHERE user_id = ? RETURNING *`,
      [settingsString, user_id]
    );
  }

  async getGraphicsSettings(user_id: string) {
    const result = await this.db.get(
      `SELECT graphics_settings FROM user_profiles WHERE user_id = ?`,
      [user_id]
    );

    if (result && result.graphics_settings) {
      try {
        return JSON.parse(result.graphics_settings);
      } catch (error) {
        console.error('Error parsing graphics settings:', error);
        return null;
      }
    }

    return null;
  }
}
