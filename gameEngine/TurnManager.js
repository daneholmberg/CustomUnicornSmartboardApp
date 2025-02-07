import { GAME_CONSTANTS } from '../constants/gameConstants';

export class TurnManager {
  constructor(players) {
    this.players = players;
    this.currentPlayerIndex = 0;
    this.throwsThisTurn = 0;
  }

  findNextActivePlayer() {
    // Get array of uncompleted player indices
    const activePlayers = this.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !player.completed);

    if (activePlayers.length === 0) return this.currentPlayerIndex;

    // Find the next player after current
    const nextActive = activePlayers.find(({ index }) => index > this.currentPlayerIndex);
    return nextActive ? nextActive.index : activePlayers[0].index;
  }

  nextPlayer() {
    this.currentPlayerIndex = this.findNextActivePlayer();
    this.throwsThisTurn = 0;
  }

  isEndOfTurn() {
    return this.throwsThisTurn >= GAME_CONSTANTS.MAX_DARTS_PER_TURN;
  }

  willBeEndOfTurn() {
    return this.throwsThisTurn + 1 >= GAME_CONSTANTS.MAX_DARTS_PER_TURN;
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

  // Add method to check if game is over
  isGameOver() {
    return this.players.filter(player => !player.completed).length <= 1;
  }

  undoThrow() {
    if (this.throwsThisTurn > 0) {
      this.throwsThisTurn--;
    } else if (this.throwsThisTurn === 0) {
      // Go back to previous player's last throw
      const prevIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
      this.currentPlayerIndex = prevIndex;
      this.throwsThisTurn = GAME_CONSTANTS.MAX_DARTS_PER_TURN - 1;
    }
  }
} 