import { TurnManager } from './TurnManager';

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
} 