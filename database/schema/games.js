export const GAME_TABLE_SCHEMAS = {
  x01: {
    darts: `
      CREATE TABLE IF NOT EXISTS x01_darts (
        x01_dart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        dart_number INTEGER NOT NULL,
        points_scored INTEGER NOT NULL,
        remaining INTEGER,
        dart_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id),
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `,
    match_stats: `
      CREATE TABLE IF NOT EXISTS x01_match_stats (
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        avg_per_round REAL,
        highest_round INTEGER,
        first_9_dart_avg REAL,
        count_50_plus INTEGER,
        count_75_plus INTEGER,
        count_100_plus INTEGER,
        count_120_plus INTEGER,
        PRIMARY KEY (match_id, player_id),
        FOREIGN KEY (match_id) REFERENCES matches(match_id),
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `,
    player_stats: `
      CREATE TABLE IF NOT EXISTS x01_player_stats (
        player_id INTEGER PRIMARY KEY,
        total_x01_matches INTEGER NOT NULL DEFAULT 0,
        cumulative_points_first_9_darts INTEGER NOT NULL DEFAULT 0,
        cumulative_darts_first_9 INTEGER NOT NULL DEFAULT 0,
        cumulative_50_plus INTEGER NOT NULL DEFAULT 0,
        cumulative_75_plus INTEGER NOT NULL DEFAULT 0,
        cumulative_100_plus INTEGER NOT NULL DEFAULT 0,
        cumulative_120_plus INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `
  },

  aroundTheWorld: {
    darts: `
      CREATE TABLE IF NOT EXISTS atw_darts (
        atw_dart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        dart_number INTEGER NOT NULL,
        target INTEGER NOT NULL,
        hit BOOLEAN NOT NULL,
        dart_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id),
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `,
    match_stats: `
      CREATE TABLE IF NOT EXISTS atw_match_stats (
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        hit_rate REAL,
        max_streak INTEGER,
        avg_darts_per_hit REAL,
        first_dart_hr REAL,
        perfect_turns INTEGER,
        double_hits INTEGER,
        triple_hits INTEGER,
        PRIMARY KEY (match_id, player_id),
        FOREIGN KEY (match_id) REFERENCES matches(match_id),
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `,
    player_stats: `
      CREATE TABLE IF NOT EXISTS atw_player_stats (
        player_id INTEGER PRIMARY KEY,
        total_atw_matches INTEGER NOT NULL DEFAULT 0,
        cumulative_hits INTEGER NOT NULL DEFAULT 0,
        cumulative_darts INTEGER NOT NULL DEFAULT 0,
        max_streak_all_time INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `
  },

  halveIt: {
    darts: `
      CREATE TABLE IF NOT EXISTS halve_it_darts (
        halve_it_dart_id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        round_number INTEGER NOT NULL,
        dart_number INTEGER NOT NULL,
        target INTEGER NOT NULL,
        points_scored INTEGER NOT NULL,
        was_penalty BOOLEAN NOT NULL DEFAULT 0,
        dart_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (match_id) REFERENCES matches(match_id),
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `,
    match_stats: `
      CREATE TABLE IF NOT EXISTS halve_it_match_stats (
        match_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        total_points INTEGER,
        max_round_score INTEGER,
        hit_rate REAL,
        total_points_lost INTEGER,
        halve_percent REAL,
        number_of_penalties INTEGER,
        PRIMARY KEY (match_id, player_id),
        FOREIGN KEY (match_id) REFERENCES matches(match_id),
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `,
    player_stats: `
      CREATE TABLE IF NOT EXISTS halve_it_player_stats (
        player_id INTEGER PRIMARY KEY,
        total_halve_it_matches INTEGER NOT NULL DEFAULT 0,
        cumulative_points INTEGER NOT NULL DEFAULT 0,
        total_penalties INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (player_id) REFERENCES players(player_id)
      )
    `
  }
}; 