import { GAME_MODES } from '../constants/gameModes';

/**
 * Extracts essential configuration properties based on game mode
 * @param {Object} gameConfig - Full game configuration
 * @returns {Object} Essential configuration properties
 */
export function getEssentialGameConfig(gameConfig) {
  const baseConfig = {
    mode: gameConfig.mode,
    players: gameConfig.players.map(player => ({
      id: player.id,
      name: player.name
    }))
  };

  switch (gameConfig.mode) {
    case GAME_MODES.X01:
      return {
        ...baseConfig,
        selectedScore: gameConfig.selectedScore
      };
    case GAME_MODES.HALVE_IT:
      return {
        ...baseConfig,
        roundCount: gameConfig.roundCount,
        penaltyMode: gameConfig.penaltyMode,
        bullseyeMode: gameConfig.bullseyeMode
      };
    default: // AROUND_THE_WORLD and any future modes
      return baseConfig;
  }
}

/**
 * Gets dependency array for essential config memoization
 * @param {Object} gameConfig - Full game configuration
 * @returns {Array} Array of dependencies for useMemo
 */
export function getEssentialConfigDeps(gameConfig) {
  const deps = [
    gameConfig.mode,
    // Always include players
    JSON.stringify(gameConfig.players.map(p => ({ id: p.id, name: p.name })))
  ];

  // Add mode-specific properties
  if (gameConfig.mode === GAME_MODES.X01) {
    deps.push(gameConfig.selectedScore);
  } else if (gameConfig.mode === GAME_MODES.HALVE_IT) {
    deps.push(
      gameConfig.roundCount,
      gameConfig.penaltyMode,
      gameConfig.bullseyeMode
    );
  }

  return deps;
} 