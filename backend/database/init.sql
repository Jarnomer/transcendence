
-- Users table (authentication only)
CREATE TABLE IF NOT EXISTS users (
  user_id TEXT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  refresh_token TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
  updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- User profiles (separate table)
CREATE TABLE  IF NOT EXISTS user_profiles (
    -- profile_id TEXT PRIMARY KEY,
    user_id TEXT PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
    display_name VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255) DEFAULT 'uploads/default_avatar.png',
    status TEXT CHECK(status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
    last_active DATETIME DEFAULT (CURRENT_TIMESTAMP),
    updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- User stats (separate table)
CREATE TABLE   IF NOT EXISTS user_stats (
  user_stat_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0
);

-- creates a table for notifications
CREATE TABLE   IF NOT EXISTS notifications (
    notification_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type TEXT CHECK(type IN ('friend_request', 'message_mention', 'game_invite')) NOT NULL,
    reference_id TEXT, -- Can store friend request ID, message ID, etc.
    seen BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE  IF NOT EXISTS friend_requests (
  sender_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  receiver_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending',
  created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (sender_id, receiver_id)
);

CREATE TABLE  IF NOT EXISTS friends (
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  created_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (user_id, friend_id)
);

-- creates a table for rooms where users can chat
CREATE TABLE  IF NOT EXISTS chat_rooms (
    chat_room_id TEXT PRIMARY KEY,  -- UUID for unique chat rooms
    type TEXT CHECK(type IN ('private', 'group')) NOT NULL,
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- references the chat_rooms table and users table to keep track of which users are in which chat rooms
CREATE TABLE  IF NOT EXISTS chat_members (
    chat_room_id TEXT REFERENCES chat_rooms(chat_room_id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
    PRIMARY KEY (chat_room_id, user_id)
);

-- creates a table for messages sent in chat rooms
CREATE TABLE  IF NOT EXISTS messages (
    message_id TEXT PRIMARY KEY,  -- UUID for messages
    chat_room_id TEXT NOT NULL REFERENCES chat_rooms(chat_room_id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE  IF NOT EXISTS message_reactions (
  message_reaction_id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL REFERENCES messages(message_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  reaction TEXT NOT NULL, -- e.g., 'like', 'heart', 'laugh'
  created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(content, content='messages', content_rowid='id');

CREATE TABLE  IF NOT EXISTS matchmaking_queue (
  matchmaking_queue_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('waiting', 'matched', 'playing')) NOT NULL,
  matched_with TEXT DEFAULT NULL REFERENCES users(user_id) ON DELETE SET NULL, -- NULL if not matched
  joined_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);


CREATE TABLE IF NOT EXISTS game_players (
  game_id TEXT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (game_id, player_id)
);

CREATE TABLE IF NOT EXISTS games (
  game_id TEXT PRIMARY KEY,
  status TEXT CHECK(status IN ('ongoing', 'completed')) DEFAULT 'ongoing',
  start_time DATETIME DEFAULT (CURRENT_TIMESTAMP),
  end_time DATETIME
);

CREATE TABLE IF NOT EXISTS tournaments (
  tournament_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK(type IN ('4x4', '8x8', '16x16')) NOT NULL,
  created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS tournament_games (
  tournament_id TEXT NOT NULL REFERENCES tournaments(tournament_id) ON DELETE CASCADE,
  game_id TEXT NOT NULL REFERENCES games(game_id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  PRIMARY KEY (tournament_id, game_id)
);


-- insert AI users securely in user table


CREATE TRIGGER IF NOT EXISTS update_user_stats
AFTER UPDATE ON games
WHEN NEW.status = 'completed'
BEGIN
    -- 🏆 Update wins for the winner
    UPDATE user_stats
    SET wins = wins + 1
    WHERE user_id = (
        SELECT player_id FROM game_players
        WHERE game_id = NEW.game_id AND is_winner = TRUE
    );

    -- ❌ Update losses for the loser
    UPDATE user_stats
    SET losses = losses + 1
    WHERE user_id = (
        SELECT player_id FROM game_players
        WHERE game_id = NEW.game_id AND is_winner = FALSE
    );

    -- ⏳ Set game end time
    UPDATE games
    SET end_time = CURRENT_TIMESTAMP
    WHERE game_id = NEW.game_id;
END;

--trigger to update user last active time when user status changes
CREATE TRIGGER IF NOT EXISTS update_user_last_active
AFTER UPDATE ON user_profiles
WHEN NEW.status <> OLD.status
BEGIN
  UPDATE user_profiles
  SET last_active = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
END;

-- trigger to update user updated_at time when user profile is updated
CREATE TRIGGER IF NOT EXISTS update_user_updated_at
AFTER UPDATE ON user_profiles
WHEN NEW.display_name <> OLD.display_name
OR NEW.first_name <> OLD.first_name
OR NEW.last_name <> OLD.last_name
OR NEW.bio <> OLD.bio
OR NEW.avatar_url <> OLD.avatar_url
OR NEW.status <> OLD.status
BEGIN
  UPDATE users
  SET updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
END;

-- trigger to update user update authentication
CREATE TRIGGER IF NOT EXISTS update_user_authenticated_updated_at
AFTER UPDATE ON users
WHEN NEW.refresh_token <> OLD.refresh_token
OR NEW.password <> OLD.password
OR NEW.username <> OLD.username
OR NEW.email <> OLD.email
BEGIN
  UPDATE users
  SET updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.user_id;
END;


CREATE TRIGGER IF NOT EXISTS remove_matchmaking_entry_on_game_complete
AFTER UPDATE ON games
WHEN NEW.status = 'completed'
BEGIN
    DELETE FROM matchmaking_queue
    WHERE user_id IN (
        SELECT player_id FROM game_players WHERE game_id = NEW.game_id
    );
END;

--trigger for inserting friend when friend request accepted
CREATE TRIGGER IF NOT EXISTS insert_friend_on_friend_request_accepted
AFTER UPDATE ON friend_requests
WHEN NEW.status = 'accepted'
BEGIN
  INSERT INTO friends(user_id, friend_id)
  VALUES (NEW.sender_id, NEW.receiver_id);
  INSERT INTO friends(user_id, friend_id)
  VALUES (NEW.receiver_id, NEW.sender_id);
END;
