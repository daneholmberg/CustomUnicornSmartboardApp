import { TurnManager } from './TurnManager';
import { GAME_CONSTANTS } from '../constants/gameConstants';
import { GameConfigError, GamePlayError } from '../errors/gameErrors';

/**
 * Specialized turn manager for X01 games
 * Tracks turn scores and handles X01-specific turn logic
 */
export class X01TurnManager extends TurnManager {
  constructor(players) {
    super(players);
    
    if (!players.every(player => typeof player.score === 'number')) {
      throw new GameConfigError('X01 players must have initial scores');
    }
    
    this.currentTurnScore = 0;
    this.previousTurnScore = 0;
    this.startOfTurnScore = this.validatePlayerScore(players[0].score);
  }

  /**
   * Validates a player's score
   * @private
   * @param {number} score - Score to validate
   * @returns {number} Validated score
   * @throws {GameConfigError} If score is invalid
   */
  validatePlayerScore(score) {
    if (typeof score !== 'number' || score < 0) {
      throw new GameConfigError('Player score must be a positive number');
    }
    return score;
  }

  /**
   * Advances to next player and resets turn-specific scores
   */
  nextPlayer() {
    this.previousTurnScore = this.currentTurnScore;
    super.nextPlayer();
    this.currentTurnScore = 0;
    const currentPlayer = this.getCurrentPlayer();
    this.startOfTurnScore = this.validatePlayerScore(currentPlayer.score);
  }

  /**
   * Adds value to current turn score
   * @param {number} value - Score to add
   * @throws {GamePlayError} If value is invalid
   */
  addToTurnScore(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new GamePlayError('Turn score value must be a valid number');
    }
    this.currentTurnScore += value;
  }

  /**
   * Returns current game state including X01-specific data
   * @returns {X01TurnState} Current turn state
   */
  getState() {
    return {
      ...super.getState(),
      currentTurnScore: this.currentTurnScore,
      previousTurnScore: this.previousTurnScore,
      startOfTurnScore: this.startOfTurnScore,
    };
  }

  /**
   * Handles undoing a throw, including score management
   */
  undoThrow() {
    const didHaveZeroThrows = (this.throwsThisTurn === 0);
    super.undoThrow();
    if (didHaveZeroThrows) {
      this.currentTurnScore = 0;
    }
  }
} 