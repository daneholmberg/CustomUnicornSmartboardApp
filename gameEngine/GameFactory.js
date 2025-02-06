import { X01GameEngine } from './X01GameEngine';
import { AroundTheWorldGameEngine } from './AroundTheWorldGameEngine';
import { GAME_MODES } from '../constants';

export function createGameEngine(config) {
  switch (config.mode) {
    case GAME_MODES.X01:
      return new X01GameEngine(config);
    case GAME_MODES.AROUND_THE_WORLD:
      return new AroundTheWorldGameEngine(config);
    default:
      throw new Error(`Unknown game mode: ${config.mode}`);
  }
}