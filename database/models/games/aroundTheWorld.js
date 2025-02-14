import { executeQuery, executeTransaction } from '../../connection';

export const saveDart = async (matchId, playerId, roundNumber, dartNumber, target, hit) => {
  const { insertId } = await executeQuery(
    `INSERT INTO atw_darts 
     (match_id, player_id, round_number, dart_number, target, hit)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [matchId, playerId, roundNumber, dartNumber, target, hit]
  );
  return insertId;
};

export const getMatchDarts = async (matchId, playerId = null) => {
  const query = `
    SELECT d.*, p.name as player_name
    FROM atw_darts d
    JOIN players p ON d.player_id = p.player_id
    WHERE d.match_id = ?
    ${playerId ? 'AND d.player_id = ?' : ''}
    ORDER BY d.round_number, d.dart_number
  `;
  
  const params = playerId ? [matchId, playerId] : [matchId];
  const { rows } = await executeQuery(query, params);
  return rows;
};

export const calculateMatchStats = async (matchId, playerId) => {
  const stats = await executeTransaction(async () => {
    // Calculate match statistics
    const { rows } = await executeQuery(`
      WITH DartStats AS (
        SELECT
          COUNT(*) as total_darts,
          SUM(CASE WHEN hit = 1 THEN 1 ELSE 0 END) as total_hits,
          SUM(CASE WHEN dart_number = 1 AND hit = 1 THEN 1 ELSE 0 END) as first_dart_hits,
          COUNT(CASE WHEN dart_number = 1 THEN 1 END) as total_first_darts,
          COUNT(DISTINCT CASE WHEN hit = 1 THEN round_number END) as perfect_turns
        FROM atw_darts
        WHERE match_id = ? AND player_id = ?
      ),
      ConsecutiveHits AS (
        SELECT
          hit,
          row_number() OVER (ORDER BY round_number, dart_number) - 
          row_number() OVER (PARTITION BY hit ORDER BY round_number, dart_number) as grp
        FROM atw_darts
        WHERE match_id = ? AND player_id = ? AND hit = 1
      )
      SELECT
        ds.*,
        COALESCE(MAX(COUNT(*)) OVER (PARTITION BY grp), 0) as max_streak
      FROM DartStats ds
      LEFT JOIN ConsecutiveHits ch ON 1=1
      GROUP BY ds.total_darts, ds.total_hits, ds.first_dart_hits, ds.total_first_darts, ds.perfect_turns
    `, [matchId, playerId, matchId, playerId]);

    const matchStats = rows[0];
    const hit_rate = matchStats.total_hits / matchStats.total_darts;
    const first_dart_hr = matchStats.first_dart_hits / matchStats.total_first_darts;
    const avg_darts_per_hit = matchStats.total_darts / (matchStats.total_hits || 1);

    // Save match stats
    await executeQuery(
      `INSERT OR REPLACE INTO atw_match_stats 
       (match_id, player_id, hit_rate, max_streak, avg_darts_per_hit, 
        first_dart_hr, perfect_turns)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [matchId, playerId, hit_rate, matchStats.max_streak, avg_darts_per_hit,
       first_dart_hr, matchStats.perfect_turns]
    );

    return {
      hit_rate,
      max_streak: matchStats.max_streak,
      avg_darts_per_hit,
      first_dart_hr,
      perfect_turns: matchStats.perfect_turns
    };
  });

  return stats;
};

export const updatePlayerStats = async (playerId, matchStats) => {
  await executeQuery(`
    INSERT INTO atw_player_stats (
      player_id, total_atw_matches,
      cumulative_hits, cumulative_darts,
      max_streak_all_time
    )
    VALUES (?, 1, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      total_atw_matches = total_atw_matches + 1,
      cumulative_hits = cumulative_hits + excluded.cumulative_hits,
      cumulative_darts = cumulative_darts + excluded.cumulative_darts,
      max_streak_all_time = MAX(max_streak_all_time, ?)
  `, [
    playerId,
    matchStats.total_hits || 0,
    matchStats.total_darts || 0,
    matchStats.max_streak || 0,
    matchStats.max_streak || 0
  ]);
};

export const getPlayerStats = async (playerId) => {
  const { rows } = await executeQuery(
    'SELECT * FROM atw_player_stats WHERE player_id = ?',
    [playerId]
  );
  return rows[0] || null;
}; 