import { GAME_TYPES } from '../../constants/gameModes';
import { executeTransaction, executeQuery } from '../connection';
import { CORE_TABLE_SCHEMAS } from './core';
import { GAME_TABLE_SCHEMAS } from './games';

export const SCHEMA_VERSION = 2;

const MIGRATIONS = {
  1: async () => {
    // Create core tables
    for (const [tableName, schema] of Object.entries(CORE_TABLE_SCHEMAS)) {
      await executeQuery(schema);
    }

    // Create game-specific tables
    for (const gameType of Object.values(GAME_TABLE_SCHEMAS)) {
      for (const schema of Object.values(gameType)) {
        await executeQuery(schema);
      }
    }

    // Insert initial game types
    for (const gameType of Object.values(GAME_TYPES)) {
      await executeQuery(
        'INSERT OR IGNORE INTO game_types (name) VALUES (?)',
        [gameType]
      );
    }
  },

  2: async () => {
    // Core table indexes
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
      CREATE INDEX IF NOT EXISTS idx_matches_game_type ON matches(game_type_id);
      CREATE INDEX IF NOT EXISTS idx_matches_start_time ON matches(start_time);
      CREATE INDEX IF NOT EXISTS idx_match_players_player ON match_players(player_id);
      CREATE INDEX IF NOT EXISTS idx_match_players_match ON match_players(match_id);
    `);

    // X01 indexes
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_x01_darts_match ON x01_darts(match_id);
      CREATE INDEX IF NOT EXISTS idx_x01_darts_player ON x01_darts(player_id);
      CREATE INDEX IF NOT EXISTS idx_x01_darts_round ON x01_darts(match_id, player_id, round_number);
      CREATE INDEX IF NOT EXISTS idx_x01_match_stats_player ON x01_match_stats(player_id);
      CREATE INDEX IF NOT EXISTS idx_x01_match_stats_match ON x01_match_stats(match_id);
    `);

    // Around the World indexes
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_atw_darts_match ON atw_darts(match_id);
      CREATE INDEX IF NOT EXISTS idx_atw_darts_player ON atw_darts(player_id);
      CREATE INDEX IF NOT EXISTS idx_atw_darts_round ON atw_darts(match_id, player_id, round_number);
      CREATE INDEX IF NOT EXISTS idx_atw_match_stats_player ON atw_match_stats(player_id);
      CREATE INDEX IF NOT EXISTS idx_atw_match_stats_match ON atw_match_stats(match_id);
    `);

    // Halve It indexes
    await executeQuery(`
      CREATE INDEX IF NOT EXISTS idx_halve_it_darts_match ON halve_it_darts(match_id);
      CREATE INDEX IF NOT EXISTS idx_halve_it_darts_player ON halve_it_darts(player_id);
      CREATE INDEX IF NOT EXISTS idx_halve_it_darts_round ON halve_it_darts(match_id, player_id, round_number);
      CREATE INDEX IF NOT EXISTS idx_halve_it_match_stats_player ON halve_it_match_stats(player_id);
      CREATE INDEX IF NOT EXISTS idx_halve_it_match_stats_match ON halve_it_match_stats(match_id);
    `);
  }
};

export const initializeDatabase = async () => {
  try {
    // Check current schema version
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const { rows: versions } = await executeQuery(
      'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
    );
    
    const currentVersion = versions.length > 0 ? versions[0].version : 0;

    // Apply any pending migrations
    for (let version = currentVersion + 1; version <= SCHEMA_VERSION; version++) {
      if (MIGRATIONS[version]) {
        await executeTransaction(async tx => {
          await MIGRATIONS[version]();
          await executeQuery(
            'INSERT INTO schema_version (version) VALUES (?)',
            [version]
          );
        });
      }
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}; 