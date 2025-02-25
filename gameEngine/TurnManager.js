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
    this.currentTurnDarts = [];
    this.lastTurnDarts = [];
    this.lastTurnTimestamp = null;
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
    if (this.currentTurnDarts.length > 0) {
      this.lastTurnDarts = [...this.currentTurnDarts];
      this.lastTurnTimestamp = Date.now();
    }
    this.currentPlayerIndex = this.findNextActivePlayer();
    this.throwsThisTurn = 0;
    this.currentTurnDarts = [];
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
      currentTurnDarts: this.currentTurnDarts,
      lastTurnDarts: this.lastTurnDarts,
      lastTurnTimestamp: this.lastTurnTimestamp,
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
      // If we're undoing a throw within the same player's turn,
      this.throwsThisTurn--;
      
      // Safely remove the last dart
      if (this.currentTurnDarts.length > 0) {
        this.currentTurnDarts.pop();
      }
    } else if (this.throwsThisTurn === 0) {
      // If we're at the beginning of a player's turn (throwsThisTurn = 0)
      // we should go back to the previous player's turn
      
      // Get the previous player index (wrap around to the end if at the start)
      const prevPlayerIndex = (this.currentPlayerIndex === 0) 
        ? this.players.length - 1 
        : this.currentPlayerIndex - 1;
        
      // Switch to the previous player
      this.currentPlayerIndex = prevPlayerIndex;
      
      // Reset to the end of that player's turn
      this.throwsThisTurn = GAME_CONSTANTS.MAX_DARTS_PER_TURN;
      
      // Clear all dart arrays - the BaseGameEngine should restore them
      this.currentTurnDarts = [];
      this.lastTurnDarts = [];
      this.lastTurnTimestamp = null;
    }
  }

  addDart(dart) {
    // Ensure we have a valid dart object
    if (!dart || typeof dart !== 'object') {
      return;
    }
    
    // Add the dart to the current turn array
    this.currentTurnDarts.push(dart);
    
    // Reset lastTurnDarts when starting a new turn
    if (this.currentTurnDarts.length === 1 && this.throwsThisTurn === 0) {
      this.lastTurnDarts = [];
      this.lastTurnTimestamp = null;
    }
    
    // Safety check: limit the number of darts (prevents memory leaks)
    if (this.currentTurnDarts.length > GAME_CONSTANTS.MAX_DARTS_PER_TURN) {
      this.currentTurnDarts = this.currentTurnDarts.slice(-GAME_CONSTANTS.MAX_DARTS_PER_TURN);
    }
  }
} 