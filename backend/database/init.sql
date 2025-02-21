
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255)  UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(255) DEFAULT 'default_avatar.png',
  online_status BOOLEAN DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',  -- values could be 'pending', 'accepted', etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, friend_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matchmaking_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  status TEXT DEFAULT 'waiting',       -- 'waiting', 'matched', 'playing'
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  matched_with INTEGER DEFAULT NULL,     -- opponent user_id if matched
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (matched_with) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS pong_matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  player1_id INTEGER NOT NULL,
  player2_id INTEGER NOT NULL,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  match_status TEXT DEFAULT 'ongoing',  -- 'ongoing', 'completed'
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME DEFAULT NULL,
  winner_id INTEGER DEFAULT NULL,
  FOREIGN KEY (player1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (player2_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

