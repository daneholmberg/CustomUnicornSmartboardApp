import { TurnManager } from './TurnManager';

export class BaseGameEngine {
  constructor(config) {
    this.turnManager = new TurnManager(config.players);
    this.gameMessage = '';
    this.lastHit = null;
    this.completedCount = 0;
  }

  setPlayerCompleted(player, message) {
    player.completed = true;
    this.completedCount++;
    player.place = this.completedCount;
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