import { executeQuery, executeTransaction } from '../../connection';

export const saveDart = async (matchId, playerId, roundNumber, dartNumber, pointsScored, remaining) => {
  const { insertId } = await executeQuery(
    `INSERT INTO x01_darts 
     (match_id, player_id, round_number, dart_number, points_scored, remaining)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [matchId, playerId, roundNumber, dartNumber, pointsScored, remaining]
  );
  return insertId;
};

export const getMatchDarts = async (matchId, playerId = null) => {
  const query = `
    SELECT d.*, p.name as player_name
    FROM x01_darts d
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
    // Calculate round scores and stats
    const { rows } = await executeQuery(`
      WITH RoundScores AS (
        SELECT 
          round_number,
          SUM(points_scored) as round_total
        FROM x01_darts
        WHERE match_id = ? AND player_id = ?
        GROUP BY round_number
      )
      SELECT
        AVG(round_total) as avg_per_round,
        MAX(round_total) as highest_round,
        COUNT(CASE WHEN round_total >= 50 THEN 1 END) as count_50_plus,
        COUNT(CASE WHEN round_total >= 75 THEN 1 END) as count_75_plus,
        COUNT(CASE WHEN round_total >= 100 THEN 1 END) as count_100_plus,
        COUNT(CASE WHEN round_total >= 120 THEN 1 END) as count_120_plus
      FROM RoundScores
    `, [matchId, playerId]);

    const matchStats = rows[0];

    // Save match stats
    await executeQuery(
      `INSERT OR REPLACE INTO x01_match_stats 
       (match_id, player_id, avg_per_round, highest_round, 
        count_50_plus, count_75_plus, count_100_plus, count_120_plus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [matchId, playerId, matchStats.avg_per_round, matchStats.highest_round,
       matchStats.count_50_plus, matchStats.count_75_plus, 
       matchStats.count_100_plus, matchStats.count_120_plus]
    );

    return matchStats;
  });

  return stats;
};

export const updatePlayerStats = async (playerId, matchStats) => {
  await executeQuery(`
    INSERT INTO x01_player_stats (
      player_id, total_x01_matches,
      cumulative_50_plus, cumulative_75_plus,
      cumulative_100_plus, cumulative_120_plus
    )
    VALUES (?, 1, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET
      total_x01_matches = total_x01_matches + 1,
      cumulative_50_plus = cumulative_50_plus + excluded.cumulative_50_plus,
      cumulative_75_plus = cumulative_75_plus + excluded.cumulative_75_plus,
      cumulative_100_plus = cumulative_100_plus + excluded.cumulative_100_plus,
      cumulative_120_plus = cumulative_120_plus + excluded.cumulative_120_plus
  `, [
    playerId,
    matchStats.count_50_plus || 0,
    matchStats.count_75_plus || 0,
    matchStats.count_100_plus || 0,
    matchStats.count_120_plus || 0
  ]);
};

export const getPlayerStats = async (playerId) => {
  const { rows } = await executeQuery(
    'SELECT * FROM x01_player_stats WHERE player_id = ?',
    [playerId]
  );
  return rows[0] || null;
}; 