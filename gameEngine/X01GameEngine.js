import { BaseGameEngine } from './BaseGameEngine';
import { GAME_CONSTANTS } from '../constants/gameConstants';
import { X01TurnManager } from './X01TurnManager';
import { TurnManager } from './TurnManager';
import { GameConfigError, GamePlayError } from '../errors/gameErrors';

/**
 * Game engine for X01 variants (301, 501, etc)
 * Handles scoring and win conditions for X01 games
 */
export class X01GameEngine extends BaseGameEngine {
  /**
   * @param {Object} config - Game configuration
   * @param {Array<Player>} config.players - Array of player objects
   * @param {number} [config.selectedScore=301] - Starting score for the game
   */
  constructor(config) {
    const selectedScore = config.selectedScore || 301;
    
    // Initialize players before super call
    const initializedPlayers = config.players?.map(player => ({
      ...player,
      score: selectedScore,
      stats: {
        totalScore: 0,
        rounds: 0,
        averagePerRound: 0,
        first9DartAvg: 0,
        highestRound: 0,
        rounds50Plus: 0,
        rounds75Plus: 0,
        rounds100Plus: 0,
        rounds120Plus: 0,
        first3Rounds: [], // Track first 3 rounds for 9-dart average
      }
    }));

    // Call super first
    super({ ...config, players: initializedPlayers });

    // Now we can use 'this' safely
    if (!config?.players?.length) {
      throw new GameConfigError('X01GameEngine requires at least one player');
    }

    if (!this.isValidStartingScore(selectedScore)) {
      throw new GameConfigError('Invalid starting score for X01 game');
    }
    
    // Override the turn manager with X01-specific one
    this.turnManager = new X01TurnManager(initializedPlayers);
    this.selectedScore = selectedScore;
  }

  /**
   * Validates if a score is valid for X01
   * @private
   * @param {number} score - Score to validate
   * @returns {boolean} True if score is valid
   */
  isValidStartingScore(score) {
    return typeof score === 'number' && 
           score > 0 && 
           score % 100 === 1; // Must end in 01
  }

  /**
   * Handles a dart throw
   * @param {DartThrow} dart - The dart throw data
   */
  handleThrow(dart) {
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const currentTurnScore = this.turnManager.currentTurnScore;
    const isLastThrowOfTurn = this.turnManager.willBeEndOfTurn();

    this.throwHistory.push({
      dart,
      playerIndex: this.turnManager.currentPlayerIndex,
      throwsThisTurn: this.turnManager.throwsThisTurn,
      meta: {
        turnScore: currentTurnScore,
        playerScore: currentPlayer.score,
        stats: { ...currentPlayer.stats },
        wasLastThrowOfTurn: isLastThrowOfTurn
      },
    });

    if (this.lastHit) {
      this.hitHistory.push(this.lastHit);
    }
    this.lastHit = dart;
    this.turnManager.addDart(dart);
    
    const throwValue = this.calculateThrowValue(dart);
    
    if (!this.isValidScore(currentPlayer.score - throwValue)) {
      this.handleBust(currentPlayer);
      return;
    }

    this.applyThrow(currentPlayer, throwValue);
    
    if (currentPlayer.score === 0) {
      this.handleWin(currentPlayer);
      return;
    }

    this.updateGameMessage(currentPlayer, throwValue);
    this.updatePlayerStats(currentPlayer, isLastThrowOfTurn);
    
    this.turnManager.incrementThrows();
  }

  /**
   * Calculates score value for a throw
   * @private
   * @param {DartThrow} dart 
   * @returns {number} Score value
   */
  calculateThrowValue(dart) {
    return dart.score * dart.multiplier;
  }

  /**
   * Validates if a score would be valid
   * @private
   * @param {number} score 
   * @returns {boolean}
   */
  isValidScore(score) {
    return score >= 0;
  }

  /**
   * Handles bust scenario
   * @private
   * @param {Player} player 
   */
  handleBust(player) {
    this.gameMessage = `${player.name} Bust! Turn ends.`;
    player.score = this.turnManager.startOfTurnScore;
    this.turnManager.nextPlayer();
  }

  /**
   * Applies throw score to player
   * @private
   * @param {Player} player 
   * @param {number} value 
   */
  applyThrow(player, value) {
    player.score -= value;
    this.turnManager.addToTurnScore(value);
  }

  /**
   * Handles win scenario
   * @private
   * @param {Player} player 
   */
  handleWin(player) {
    this.setPlayerCompleted(player, `${player.name} wins!`);
    this.hasWinner = true;
  }

  /**
   * Updates game message after throw
   * @private
   * @param {Player} player 
   * @param {number} throwValue 
   */
  updateGameMessage(player, throwValue) {
    this.gameMessage = `${player.name} scored ${throwValue}. Score this round: ${this.turnManager.currentTurnScore}`;
  }

  /**
   * Updates player statistics
   * @private
   * @param {Player} player 
   * @param {boolean} isLastThrowOfTurn 
   */
  updatePlayerStats(player, isLastThrowOfTurn) {
    if (isLastThrowOfTurn) {
      const roundScore = this.turnManager.currentTurnScore;
      player.stats.totalScore += roundScore;
      player.stats.rounds += 1;
      
      // Update highest round if current round is higher
      if (roundScore > player.stats.highestRound) {
        player.stats.highestRound = roundScore;
      }

      // Track high score rounds
      if (roundScore >= 120) {
        player.stats.rounds120Plus++;
        player.stats.rounds100Plus++;
        player.stats.rounds75Plus++;
        player.stats.rounds50Plus++;
      } else if (roundScore >= 100) {
        player.stats.rounds100Plus++;
        player.stats.rounds75Plus++;
        player.stats.rounds50Plus++;
      } else if (roundScore >= 75) {
        player.stats.rounds75Plus++;
        player.stats.rounds50Plus++;
      } else if (roundScore >= 50) {
        player.stats.rounds50Plus++;
      }

      // Calculate first 9 dart average (first 3 rounds)
      if (player.stats.rounds <= 3) {
        player.stats.first3Rounds.push(roundScore);
        if (player.stats.rounds === 3) {
          const total9DartScore = player.stats.first3Rounds.reduce((a, b) => a + b, 0);
          player.stats.first9DartAvg = Math.round(total9DartScore / 3);
        }
      }

      // Update overall average
      player.stats.averagePerRound = Math.round(
        player.stats.totalScore / player.stats.rounds
      );
    }
  }

  /**
   * Calculates possible winning target numbers
   * @param {number} score - Current player score
   * @returns {number[]} Array of possible winning target numbers
   */
  calculateWinningTargets(score) {
    const targets = new Set();
    
    // Check all possible doubles (must finish on a double)
    if (score <= 40 && score % 2 === 0) {
      targets.add(score / 2);
    }
    
    // Check all possible triples
    if (score <= 60) {
      const possibleTriple = score / 3;
      if (Number.isInteger(possibleTriple) && possibleTriple <= 20) {
        targets.add(possibleTriple);
      }
    }
    
    return Array.from(targets);
  }

  /**
   * Gets current game state including X01-specific data
   * @returns {Object} Current game state
   */
  getGameState() {
    const state = super.getGameState();
    const turnState = this.turnManager.getState();
    const currentPlayer = this.turnManager.getCurrentPlayer();
    
    const winningTargets = currentPlayer.score <= 60 ? 
      this.calculateWinningTargets(currentPlayer.score) : 
      [];

    return {
      ...state,
      ...turnState,
      selectedScore: this.selectedScore,
      gameType: 'X01',
      winningTargets,
      requiredMultiplier: currentPlayer.score <= 40 && currentPlayer.score % 2 === 0 ? 2 : 3,
      hasWinner: this.hasWinner,
    };
  }

  /**
   * Undoes the last throw and restores previous state
   * @returns {boolean} True if throw was successfully undone
   */
  undoLastThrow() {
    const lastThrow = this._undoGenericThrow();
    if (!lastThrow) return false;

    const player = this.turnManager.getState().players[lastThrow.playerIndex];
    const { turnScore, playerScore, stats, wasLastThrowOfTurn } = lastThrow.meta || {};

    if (typeof playerScore === 'number') {
      player.score = playerScore;
    }

    if (typeof turnScore === 'number') {
      this.turnManager.currentTurnScore = turnScore;
    }

    if (wasLastThrowOfTurn && stats) {
      player.stats = { ...stats };
    }

    this.gameMessage = `Round score: ${this.turnManager.currentTurnScore}`;
    return true;
  }
}