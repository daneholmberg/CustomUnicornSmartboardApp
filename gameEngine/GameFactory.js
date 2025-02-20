import { X01GameEngine } from './X01GameEngine';
import { AroundTheWorldGameEngine } from './AroundTheWorldGameEngine';
import { GAME_MODES } from '../constants/gameModes';
import { GameError } from '../utils/errors';
import { HalveItGameEngine } from './HalveItGameEngine';

/**
 * Creates appropriate game engine instance based on game mode
 * @param {GameConfig} config - Game configuration object
 * @returns {BaseGameEngine} Initialized game engine instance
 * @throws {GameError} When game mode is not specified or unsupported
 */
export function createGameEngine(config) {
  if (!config?.mode) {
    throw new GameError('Game mode must be specified');
  }

  switch (config.mode) {
    case GAME_MODES.X01:
      return new X01GameEngine(config);
    case GAME_MODES.AROUND_THE_WORLD:
      return new AroundTheWorldGameEngine(config);
    case GAME_MODES.HALVE_IT:
      return new HalveItGameEngine(config);
    default:
      throw new GameError(`Unsupported game mode: ${config.mode}`);
  }
}