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

  // We now wrap super.undoThrow() but also reset currentTurnScore if we changed players
  undoThrow() {
    const didHaveZeroThrows = (this.throwsThisTurn === 0);
    super.undoThrow(); // calls TurnManager's logic
    if (didHaveZeroThrows) {
      // If we just moved to the previous player, reset currentTurnScore
      this.currentTurnScore = 0;
    }
  }
} 