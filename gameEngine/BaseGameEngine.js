import { TurnManager } from './TurnManager';

export class BaseGameEngine {
  constructor(config) {
    this.turnManager = new TurnManager(config.players);
    this.gameMessage = '';
    this.lastHit = null;
  }

  handleThrow(dart) {
    throw new Error('handleThrow must be implemented by subclass');
  }

  getGameState() {
    return {
      ...this.turnManager.getState(),
      gameMessage: this.gameMessage,
      lastHit: this.lastHit,
    };
  }
}