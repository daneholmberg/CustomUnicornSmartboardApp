import { GAME_CONSTANTS } from '../constants';

export class TurnManager {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.throwsThisTurn = 0;
  }

  isEndOfTurn() {
    return this.throwsThisTurn >= GAME_CONSTANTS.MAX_DARTS_PER_TURN;
  }

  willBeEndOfTurn() {
    return this.throwsThisTurn + 1 >= GAME_CONSTANTS.MAX_DARTS_PER_TURN;
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.throwsThisTurn = 0;
  }

  incrementThrows() {
    this.throwsThisTurn++;
    if (this.isEndOfTurn()) {
      this.nextPlayer();
    }
  }

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  getState() {
    return {
      currentPlayerIndex: this.currentPlayerIndex,
      throwsThisTurn: this.throwsThisTurn,
      players: this.players,
    };
  }
} 