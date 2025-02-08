import { TurnManager } from './TurnManager';

/**
 * Base class for all dart game engines
 * @abstract
 */
export class BaseGameEngine {
  /**
   * @param {Object} config - Game configuration
   * @param {Array<Player>} config.players - Array of player objects
   */
  constructor(config) {
    this.turnManager = new TurnManager(config.players);
    this.gameMessage = '';
    this.lastHit = null;
    this.completedCount = 0;
    this.throwHistory = [];
    this.hitHistory = [];
  }

  /**
   * Marks a player as completed and updates game state
   * @param {Player} player - Player to mark as completed
   * @param {string} message - Victory/completion message
   */
  setPlayerCompleted(player, message) {
    player.completed = true;
    this.completedCount++;
    player.place = this.completedCount;
    this.gameMessage = message;
    this.turnManager.nextPlayer();
  }

  // Common, shared logic for undoing a throw
  _undoGenericThrow() {
    const lastThrow = this.throwHistory.pop();
    if (!lastThrow) {
      return null;
    }
    this.lastHit = this.hitHistory.pop() || null;
    this.turnManager.undoThrow();
    return lastThrow;
  }

  // Base undoLastThrow now just calls our helper
  undoLastThrow() {
    return this._undoGenericThrow() !== null;
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