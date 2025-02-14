export const CORE_TABLE_SCHEMAS = {
  players: `
    CREATE TABLE IF NOT EXISTS players (
      player_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `,

  game_types: `
    CREATE TABLE IF NOT EXISTS game_types (
      game_type_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    )
  `,

  matches: `
    CREATE TABLE IF NOT EXISTS matches (
      match_id INTEGER PRIMARY KEY AUTOINCREMENT,
      game_type_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      end_time DATETIME,
      FOREIGN KEY (game_type_id) REFERENCES game_types(game_type_id)
    )
  `,

  match_players: `
    CREATE TABLE IF NOT EXISTS match_players (
      match_id INTEGER NOT NULL,
      player_id INTEGER NOT NULL,
      final_score INTEGER,
      final_rank INTEGER,
      PRIMARY KEY (match_id, player_id),
      FOREIGN KEY (match_id) REFERENCES matches(match_id),
      FOREIGN KEY (player_id) REFERENCES players(player_id)
    )
  `
}; 