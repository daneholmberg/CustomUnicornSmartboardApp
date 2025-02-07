import { BaseGameEngine } from './BaseGameEngine';
import { GAME_CONSTANTS } from '../constants/gameConstants';
import { X01TurnManager } from './X01TurnManager';
import { TurnManager } from './TurnManager';

export class X01GameEngine extends BaseGameEngine {
  constructor(config) {
    // Initialize player scores
    const selectedScore = config.selectedScore || 301;
    const initializedPlayers = config.players.map(player => ({
      ...player,
      score: selectedScore,
      stats: {
        totalScore: 0,
        rounds: 0,
        averagePerRound: 0
      }
    }));
    
    // Call super first with initialized players
    super({ ...config, players: initializedPlayers });
    
    // Override the turn manager with X01-specific one
    this.turnManager = new X01TurnManager(initializedPlayers);
    
    // Now we can use 'this'
    this.selectedScore = selectedScore;
  }

  handleThrow(dart) {
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const currentTurnScore = this.turnManager.currentTurnScore;
    const isLastThrowOfTurn = this.turnManager.willBeEndOfTurn();

    // Store the current state before the throw
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

    // Save old hit, set new one
    if (this.lastHit) {
      this.hitHistory.push(this.lastHit);
    }
    this.lastHit = dart;
    
    const throwValue = dart.score * dart.multiplier;

    if (throwValue > currentPlayer.score) {
      this.gameMessage = `${currentPlayer.name} Bust! Turn ends.`;
      currentPlayer.score = this.turnManager.startOfTurnScore;
      this.turnManager.nextPlayer();
      return;
    }

    currentPlayer.score -= throwValue;
    this.turnManager.addToTurnScore(throwValue);
    
    if (currentPlayer.score === 0) {
      this.setPlayerCompleted(currentPlayer, `${currentPlayer.name} wins!`);
      return;
    }

    this.gameMessage = `${currentPlayer.name} scored ${throwValue}. Score this round: ${this.turnManager.currentTurnScore}`;
    
    // Update stats when completing a turn
    if (isLastThrowOfTurn) {
      currentPlayer.stats.totalScore += this.turnManager.currentTurnScore;
      currentPlayer.stats.rounds += 1;
      currentPlayer.stats.averagePerRound = Math.round(currentPlayer.stats.totalScore / currentPlayer.stats.rounds);
    }
    
    this.turnManager.incrementThrows();
  }

  calculateWinningTargets(score) {
    const targets = new Set();
    
    // Check all possible doubles (must finish on a double)
    if (score <= 40 && score % 2 === 0) {
      targets.add(score / 2); // The required double
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

  getGameState() {
    const state = super.getGameState();
    const turnState = this.turnManager.getState();
    const currentPlayer = this.turnManager.getCurrentPlayer();
    
    // Calculate winning targets if score is 60 or less
    const winningTargets = currentPlayer.score <= 60 ? 
      this.calculateWinningTargets(currentPlayer.score) : 
      [];

    return {
      ...state,
      ...turnState,
      selectedScore: this.selectedScore,
      gameType: 'X01',
      winningTargets,  // Add winning targets to game state
      requiredMultiplier: currentPlayer.score <= 40 && currentPlayer.score % 2 === 0 ? 2 : 3,
    };
  }

  undoLastThrow() {
    const lastThrow = this._undoGenericThrow();
    if (!lastThrow) return false;

    const player = this.turnManager.getState().players[lastThrow.playerIndex];
    const { turnScore, playerScore, stats, wasLastThrowOfTurn } = lastThrow.meta || {};

    // Restore player's score
    if (typeof playerScore === 'number') {
      player.score = playerScore;
    }

    // Restore turn score
    if (typeof turnScore === 'number') {
      this.turnManager.currentTurnScore = turnScore;
    }

    // If we're undoing what was the last throw of a turn, restore previous stats
    if (wasLastThrowOfTurn && stats) {
      player.stats = { ...stats };
    }

    this.gameMessage = `Round score: ${this.turnManager.currentTurnScore}`;
    return true;
  }
}