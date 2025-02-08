import { X01GameEngine } from './X01GameEngine';
import { AroundTheWorldGameEngine } from './AroundTheWorldGameEngine';
import { GAME_MODES } from '../constants/gameModes';
import { GameError } from '../utils/errors';

/**
 * Creates appropriate game engine instance based on game mode
 * @param {GameConfig} config - Game configuration object
 * @returns {BaseGameEngine} Initialized game engine instance
 */
export function createGameEngine(config) {
  if (!config?.mode) {
    throw new GameConfigError('Game mode must be specified');
  }

  switch (config.mode) {
    case GAME_MODES.X01:
      return new X01GameEngine(config);
    case GAME_MODES.AROUND_THE_WORLD:
      return new AroundTheWorldGameEngine(config);
    default:
      throw new GameConfigError(`Unsupported game mode: ${config.mode}`);
  }
}