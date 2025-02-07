import { TurnManager } from './TurnManager';
import { GAME_CONSTANTS } from '../constants/gameConstants';

export class X01TurnManager extends TurnManager {
  constructor(players) {
    super(players);
    this.currentTurnScore = 0;
    this.startOfTurnScore = players[0].score;
  }

  nextPlayer() {
    super.nextPlayer();
    this.currentTurnScore = 0;
    this.startOfTurnScore = this.getCurrentPlayer().score;
  }

  // Add method to handle turn scoring
  addToTurnScore(value) {
    this.currentTurnScore += value;
  }

  getState() {
    return {
      ...super.getState(),
      currentTurnScore: this.currentTurnScore,
      startOfTurnScore: this.startOfTurnScore,
    };
  }

  undoThrow() {
    if (this.throwsThisTurn > 0) {
      this.throwsThisTurn--;
    } else if (this.throwsThisTurn === 0) {
      // Go back to previous player's last throw
      const prevIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
      this.currentPlayerIndex = prevIndex;
      this.throwsThisTurn = GAME_CONSTANTS.MAX_DARTS_PER_TURN - 1;
      // Reset current turn score when going back to previous player
      this.currentTurnScore = 0;
    }
  }
} 