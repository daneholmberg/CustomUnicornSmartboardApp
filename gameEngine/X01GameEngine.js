import { BaseGameEngine } from './BaseGameEngine';

export class X01GameEngine extends BaseGameEngine {
  constructor(config) {
    super(config);
    this.currentTurnScore = 0;
  }

  handleThrow(dart) {
    this.lastHit = dart;
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const throwValue = dart.score * dart.multiplier;
    
    if (throwValue > currentPlayer.score) {
      this.gameMessage = `${currentPlayer.name} Bust! Turn ends.`;
      currentPlayer.score -= this.currentTurnScore;
      this.turnManager.nextPlayer();
      this.currentTurnScore = 0;
      return;
    }

    currentPlayer.score -= throwValue;
    this.currentTurnScore += throwValue;
    this.turnManager.incrementThrows();
    
    if (currentPlayer.score === 0) {
      this.gameMessage = `${currentPlayer.name} wins!`;
      return;
    }

    this.gameMessage = `${currentPlayer.name} scored ${throwValue}. Score: ${currentPlayer.score}`;
    
    if (this.turnManager.isEndOfTurn()) {
      this.turnManager.nextPlayer();
      this.currentTurnScore = 0;
    }
  }
}