import { GAME_CONSTANTS } from '../constants/gameConstants';
import { GameConfigError } from '../errors/gameErrors';

/**
 * Manages player turns and throw counts for dart games
 */
export class TurnManager {
  /**
   * @param {Array<Player>} players - Array of player objects
   */
  constructor(players) {
    if (!Array.isArray(players) || players.length === 0) {
      throw new GameConfigError('TurnManager requires at least one player');
    }
    this.players = players;
    this.currentPlayerIndex = 0;
    this.throwsThisTurn = 0;
  }

  /**
   * Finds the next active (non-completed) player
   * @returns {number} Index of next active player
   */
  findNextActivePlayer() {
    const activePlayers = this.players
      .map((player, index) => ({ player, index }))
      .filter(({ player }) => !player.completed);

    if (activePlayers.length === 0) {
      return this.currentPlayerIndex;
    }

    const nextActive = activePlayers.find(({ index }) => index > this.currentPlayerIndex);
    return nextActive ? nextActive.index : activePlayers[0].index;
  }

  /**
   * Advances to the next player and resets throw count
   */
  nextPlayer() {
    this.currentPlayerIndex = this.findNextActivePlayer();
    this.throwsThisTurn = 0;
  }

  /**
   * Checks if current turn is complete
   * @returns {boolean} True if max throws reached
   */
  isEndOfTurn() {
    return this.throwsThisTurn >= GAME_CONSTANTS.MAX_DARTS_PER_TURN;
  }

  /**
   * Checks if next throw will complete the turn
   * @returns {boolean} True if next throw will reach max throws
   */
  willBeEndOfTurn() {
    return this.throwsThisTurn + 1 >= GAME_CONSTANTS.MAX_DARTS_PER_TURN;
  }

  /**
   * Increments throw count and handles turn completion
   */
  incrementThrows() {
    this.throwsThisTurn++;
    if (this.isEndOfTurn()) {
      this.nextPlayer();
    }
  }

  /**
   * Gets the current active player
   * @returns {Player} Current player object
   */
  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  }

  /**
   * Returns current game state
   * @returns {TurnState} Current turn state
   */
  getState() {
    return {
      currentPlayerIndex: this.currentPlayerIndex,
      throwsThisTurn: this.throwsThisTurn,
      players: this.players,
    };
  }

  /**
   * Checks if game is complete
   * @returns {boolean} True if only one or fewer active players remain
   */
  isGameOver() {
    return this.players.filter(player => !player.completed).length <= 1;
  }

  /**
   * Handles undoing a throw, including player changes
   */
  undoThrow() {
    if (this.throwsThisTurn > 0) {
      this.throwsThisTurn--;
    } else if (this.throwsThisTurn === 0) {
      const prevIndex = (this.currentPlayerIndex - 1 + this.players.length) % this.players.length;
      this.currentPlayerIndex = prevIndex;
      this.throwsThisTurn = GAME_CONSTANTS.MAX_DARTS_PER_TURN - 1;
    }
  }
} 