import { TurnManager } from './TurnManager';

export class BaseGameEngine {
  constructor(config) {
    this.turnManager = new TurnManager(config.players);
    this.gameMessage = '';
    this.lastHit = null;
    this.completedCount = 0;
    this.throwHistory = [];
    this.hitHistory = [];
  }

  setPlayerCompleted(player, message) {
    player.completed = true;
    this.completedCount++;
    player.place = this.completedCount;
    this.gameMessage = message;
    this.turnManager.nextPlayer();
  }

  undoLastThrow() {
    const lastThrow = this.throwHistory.pop();
    if (!lastThrow) return false;
    
    this.lastHit = this.hitHistory.pop() || null;
    
    this.turnManager.undoThrow();
    
    return true;
  }

  handleThrow(dart) {
    if (this.lastHit) {
      this.hitHistory.push(this.lastHit);
    }
    this.lastHit = dart;
    
    this.throwHistory.push({
      dart,
      playerIndex: this.turnManager.currentPlayerIndex,
      throwsThisTurn: this.turnManager.throwsThisTurn
    });
    
    throw new Error('handleThrow must be implemented by subclass');
  }

  getGameState() {
    return {
      ...this.turnManager.getState(),
      gameMessage: this.gameMessage,
      lastHit: this.lastHit,
      targetNumbers: [], // Default to empty array, subclasses can override
      hasHistory: this.throwHistory.length > 0,
    };
  }
}