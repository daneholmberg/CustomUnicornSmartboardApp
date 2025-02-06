import { TurnManager } from './TurnManager';

export class BaseGameEngine {
  constructor(config) {
    this.turnManager = new TurnManager(config.players);
    this.gameMessage = '';
    this.lastHit = null;
  }

  setPlayerCompleted(player, message) {
    player.completed = true;
    this.gameMessage = message;
    this.turnManager.nextPlayer();
  }

  handleThrow(dart) {
    throw new Error('handleThrow must be implemented by subclass');
  }

  getGameState() {
    return {
      ...this.turnManager.getState(),
      gameMessage: this.gameMessage,
      lastHit: this.lastHit,
      targetNumbers: [], // Default to empty array, subclasses can override
    };
  }
}