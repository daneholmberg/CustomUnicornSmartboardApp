import { executeQuery } from '../../connection';

export const getGameTypes = async () => {
  const { rows } = await executeQuery(
    'SELECT * FROM game_types ORDER BY name'
  );
  return rows;
};

export const getGameTypeById = async (gameTypeId) => {
  const { rows } = await executeQuery(
    'SELECT * FROM game_types WHERE game_type_id = ?',
    [gameTypeId]
  );
  return rows[0] || null;
};

export const getGameTypeByName = async (name) => {
  const { rows } = await executeQuery(
    'SELECT * FROM game_types WHERE name = ?',
    [name]
  );
  return rows[0] || null;
}; 