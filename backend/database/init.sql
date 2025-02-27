
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email VARCHAR(255)  UNIQUE,
  password VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
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

CREATE TABLE IF NOT EXISTS match_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,       -- The user for whom this record applies
  opponent_id INTEGER NOT NULL,   -- The opponent's user ID
  game_type TEXT DEFAULT '1v1',   -- Type of match (e.g., '1v1'); useful if you add other game modes later
  user_score INTEGER DEFAULT 0,   -- Score of the user in this match
  opponent_score INTEGER DEFAULT 0, -- Score of the opponent
  match_date DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When the match was played
  details TEXT,                   -- Additional details (e.g., JSON data with stats or notes)
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (opponent_id) REFERENCES users(id) ON DELETE CASCADE
);
