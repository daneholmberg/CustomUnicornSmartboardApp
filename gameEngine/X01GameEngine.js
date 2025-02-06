import { BaseGameEngine } from './BaseGameEngine';

export class X01GameEngine extends BaseGameEngine {
  constructor(config) {
    super(config);
    this.currentTurnScore = 0;
  }

  handleThrow(dart) {
    this.lastHit = dart;
    const currentPlayer = this.players[this.currentPlayerIndex];
    const throwValue = dart.score * dart.multiplier;
    
    if (throwValue > currentPlayer.score) {
      this.gameMessage = `${currentPlayer.name} Bust! Turn ends.`;
      currentPlayer.score -= this.currentTurnScore;
      this.nextPlayer();
      this.currentTurnScore = 0;
      return;
    }

    currentPlayer.score -= throwValue;
    this.currentTurnScore += throwValue;
    this.throwsThisTurn++;
    
    if (currentPlayer.score === 0) {
      this.gameMessage = `${currentPlayer.name} wins!`;
      return;
    }

    this.gameMessage = `${currentPlayer.name} scored ${throwValue}. Score: ${currentPlayer.score}`;
    
    if (this.isEndOfTurn()) {
      this.nextPlayer();
      this.currentTurnScore = 0;
    }
  }
}