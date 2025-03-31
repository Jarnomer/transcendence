PRAGMA foreign_keys = ON;
 PRAGMA foreign_key_check;
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
    avatar_url VARCHAR(255) DEFAULT '/uploads/default_avatar.png',
    status TEXT CHECK(status IN ('online', 'offline', 'away', 'busy')) DEFAULT 'offline',
    last_active DATETIME DEFAULT (CURRENT_TIMESTAMP),
    updated_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

-- User stats (separate table)
CREATE TABLE   IF NOT EXISTS user_stats (
  user_stat_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  elo INTEGER DEFAULT 1000,
  rank INTEGER DEFAULT 0
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

-- Chat Rooms Table (public, private, global)
CREATE TABLE IF NOT EXISTS chat_rooms (
    chat_room_id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT  NOT NULL, -- e.g., "public", "private", "global" "tournament id"
    created_by TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS room_members (
  chat_room_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(chat_room_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  PRIMARY KEY (chat_room_id, user_id)
);


-- Direct Messages Table (1-on-1 chat)
CREATE TABLE IF NOT EXISTS direct_messages (
    direct_messages_id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(user_id),
    FOREIGN KEY (receiver_id) REFERENCES users(user_id)
);

-- Chat Messages Table (storing messages for rooms)
CREATE TABLE IF NOT EXISTS chat_messages (
    chat_messages_id TEXT PRIMARY KEY,
    chat_room_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(chat_room_id),
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
);

-- Message Reactions Table (emoji reactions)
CREATE TABLE IF NOT EXISTS message_reactions (
    message_reactions_id TEXT PRIMARY KEY,
    message_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    reaction TEXT NOT NULL, -- e.g., "👍", "🔥"
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES chat_messages(chat_messages_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexing for Fast Querying
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_direct_messages_users ON direct_messages(sender_id, receiver_id);

-- CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(content, content='messages', content_rowid='id');

CREATE TABLE  IF NOT EXISTS queues (
  queue_id TEXT PRIMARY KEY,
  mode TEXT NOT NULL DEFAULT '1v1',
  variant TEXT NOT NULL DEFAULT 'online',
  created_at DATETIME DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE IF NOT EXISTS queue_players (
  queue_id TEXT NOT NULL REFERENCES queues(queue_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  status TEXT CHECK(status IN ('waiting', 'matched', 'playing')) NOT NULL,
  joined_at DATETIME DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (queue_id, user_id)
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


-- trigger to update user stats when game is completed
CREATE TRIGGER IF NOT EXISTS update_user_stats
AFTER UPDATE ON games
WHEN NEW.status = 'completed'
BEGIN
    -- Set the end time for the game
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
AFTER UPDATE OF status ON games
FOR EACH ROW
WHEN NEW.status = 'completed'
BEGIN
    DELETE FROM queues
    WHERE EXISTS (
        SELECT 1
        FROM queue_players AS qp
        JOIN game_players AS gp ON qp.user_id = gp.player_id
        WHERE gp.game_id = NEW.game_id
        AND qp.queue_id = queues.queue_id
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
  DELETE FROM friend_requests
  WHERE sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id;
END;

--trigger for deleting queue when user leaves queue
CREATE TRIGGER IF NOT EXISTS delete_queue_on_user_leave
AFTER DELETE ON queue_players
BEGIN
  DELETE FROM queues
  WHERE queue_id = OLD.queue_id
  AND NOT EXISTS (
    SELECT * FROM queue_players
    WHERE queue_id = OLD.queue_id
  );
END;

--trigger for restricting duplicate friend requests
-- CREATE TRIGGER prevent_duplicate_friend_requests
-- BEFORE INSERT ON friend_requests
-- FOR EACH ROW
-- WHEN EXISTS (
--   SELECT 1
--   FROM friends
--   WHERE (user_id = NEW.sender_id AND friend_id = NEW.receiver_id)
--      OR (user_id = NEW.receiver_id AND friend_id = NEW.sender_id)
-- )
-- BEGIN
--   SELECT RAISE(ABORT, 'Cannot send a friend request: users are already friends');
-- END;

--trigger for notifications when friend request is sent
CREATE TRIGGER IF NOT EXISTS send_notification_on_friend_request
AFTER INSERT ON friend_requests
BEGIN
    INSERT INTO notifications (notification_id, user_id, type, reference_id, seen, created_at)
    VALUES (
        LOWER(HEX(RANDOMBLOB(16))), -- Generate a unique notification_id
        NEW.receiver_id,            -- Notify the receiver of the friend request
        'friend_request',           -- Type of notification
        NEW.sender_id,              -- Reference the sender_id (or friend request ID if applicable)
        FALSE,                      -- Mark as unseen
        CURRENT_TIMESTAMP           -- Notification timestamp
    );
END;
