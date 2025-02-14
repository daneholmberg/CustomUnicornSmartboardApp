import { executeQuery, executeTransaction } from '../../connection';

export const startMatch = async (gameTypeId, playerIds) => {
  return await executeTransaction(async () => {
    // Create match record
    const { insertId: matchId } = await executeQuery(
      'INSERT INTO matches (game_type_id) VALUES (?)',
      [gameTypeId]
    );

    // Add players to match
    for (const playerId of playerIds) {
      await executeQuery(
        'INSERT INTO match_players (match_id, player_id) VALUES (?, ?)',
        [matchId, playerId]
      );
    }

    return matchId;
  });
};

export const endMatch = async (matchId, playerResults) => {
  await executeTransaction(async () => {
    // Update match end time
    await executeQuery(
      'UPDATE matches SET end_time = CURRENT_TIMESTAMP WHERE match_id = ?',
      [matchId]
    );

    // Update player results
    for (const { playerId, finalScore, finalRank } of playerResults) {
      await executeQuery(
        'UPDATE match_players SET final_score = ?, final_rank = ? WHERE match_id = ? AND player_id = ?',
        [finalScore, finalRank, matchId, playerId]
      );
    }
  });
};

export const getMatchById = async (matchId) => {
  const { rows } = await executeQuery(
    `SELECT m.*, gt.name as game_type_name
     FROM matches m
     JOIN game_types gt ON m.game_type_id = gt.game_type_id
     WHERE m.match_id = ?`,
    [matchId]
  );
  return rows[0] || null;
};

export const getMatchPlayers = async (matchId) => {
  const { rows } = await executeQuery(
    `SELECT mp.*, p.name
     FROM match_players mp
     JOIN players p ON mp.player_id = p.player_id
     WHERE mp.match_id = ?
     ORDER BY mp.final_rank NULLS LAST, p.name`,
    [matchId]
  );
  return rows;
};

export const getPlayerMatches = async (playerId, gameTypeId = null) => {
  const query = `
    SELECT m.*, gt.name as game_type_name, mp.final_score, mp.final_rank
    FROM matches m
    JOIN match_players mp ON m.match_id = mp.match_id
    JOIN game_types gt ON m.game_type_id = gt.game_type_id
    WHERE mp.player_id = ?
    ${gameTypeId ? 'AND m.game_type_id = ?' : ''}
    ORDER BY m.start_time DESC
  `;
  
  const params = gameTypeId ? [playerId, gameTypeId] : [playerId];
  const { rows } = await executeQuery(query, params);
  return rows;
}; 