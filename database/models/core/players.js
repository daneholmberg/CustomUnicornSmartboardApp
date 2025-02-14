import { executeQuery } from '../../connection';

export const addPlayer = async (name) => {
  const { insertId } = await executeQuery(
    'INSERT INTO players (name) VALUES (?)',
    [name]
  );
  return insertId;
};

export const getPlayers = async () => {
  const { rows } = await executeQuery(
    'SELECT * FROM players ORDER BY name'
  );
  return rows;
};

export const getPlayerById = async (playerId) => {
  const { rows } = await executeQuery(
    'SELECT * FROM players WHERE player_id = ?',
    [playerId]
  );
  return rows[0] || null;
};

export const updatePlayer = async (playerId, name) => {
  await executeQuery(
    'UPDATE players SET name = ? WHERE player_id = ?',
    [name, playerId]
  );
};

export const deletePlayer = async (playerId) => {
  await executeQuery(
    'DELETE FROM players WHERE player_id = ?',
    [playerId]
  );
}; 