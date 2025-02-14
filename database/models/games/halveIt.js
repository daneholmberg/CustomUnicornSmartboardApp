import { executeQuery, executeTransaction } from '../../connection';

export const saveDart = async (matchId, playerId, roundNumber, dartNumber, target, pointsScored, wasPenalty) => {
  const { insertId } = await executeQuery(
    `INSERT INTO halve_it_darts 
     (match_id, player_id, round_number, dart_number, target, points_scored, was_penalty)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [matchId, playerId, roundNumber, dartNumber, target, pointsScored, wasPenalty]
  );
  return insertId;
};

export const getMatchDarts = async (matchId, playerId = null) => {
  const query = `
    SELECT d.*, p.name as player_name
    FROM halve_it_darts d
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
      WITH RoundStats AS (
        SELECT 
          round_number,
          target,
          SUM(points_scored) as round_total,
          COUNT(*) as total_darts,
          SUM(CASE WHEN points_scored > 0 THEN 1 ELSE 0 END) as hits,
          SUM(CASE WHEN was_penalty = 1 THEN 1 ELSE 0 END) as penalties,
          CASE 
            WHEN MIN(points_scored) = 0 THEN 1 
            ELSE 0 
          END as was_halved
        FROM halve_it_darts
        WHERE match_id = ? AND player_id = ?
        GROUP BY round_number, target
      )
      SELECT
        SUM(round_total) as total_points,
        MAX(round_total) as max_round_score,
        SUM(hits)::FLOAT / SUM(total_darts) as hit_rate,
        SUM(CASE WHEN was_halved = 1 THEN round_total ELSE 0 END) as total_points_lost,
        SUM(was_halved)::FLOAT / COUNT(*) as halve_percent,
        SUM(penalties) as number_of_penalties
      FROM RoundStats
    `, [matchId, playerId]);

    const matchStats = rows[0];

    // Save match stats
    await executeQuery(
      `INSERT OR REPLACE INTO halve_it_match_stats 
       (match_id, player_id, total_points, max_round_score, hit_rate,
        total_points_lost, halve_percent, number_of_penalties)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [matchId, playerId, matchStats.total_points, matchStats.max_round_score,
       matchStats.hit_rate, matchStats.total_points_lost, 
       matchStats.halve_percent, matchStats.number_of_penalties]
    );

    return matchStats;
  });

  return stats;
};

export const updatePlayerStats = async (playerId, matchStats) => {
  await executeQuery(`
    INSERT INTO halve_it_player_stats (
      player_id, total_halve_it_matches,
      cumulative_points, total_penalties
    )
    VALUES (?, 1, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      total_halve_it_matches = total_halve_it_matches + 1,
      cumulative_points = cumulative_points + excluded.cumulative_points,
      total_penalties = total_penalties + excluded.total_penalties
  `, [
    playerId,
    matchStats.total_points || 0,
    matchStats.number_of_penalties || 0
  ]);
};

export const getPlayerStats = async (playerId) => {
  const { rows } = await executeQuery(
    'SELECT * FROM halve_it_player_stats WHERE player_id = ?',
    [playerId]
  );
  return rows[0] || null;
}; 