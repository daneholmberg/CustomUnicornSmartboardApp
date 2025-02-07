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
    // Store state before the throw
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const currentTurnScore = this.turnManager.currentTurnScore;
    
    // Add to history with current state
    this.throwHistory.push({
      dart,
      playerIndex: this.turnManager.currentPlayerIndex,
      throwsThisTurn: this.turnManager.throwsThisTurn,
      turnScore: currentTurnScore,
      playerScore: currentPlayer.score
    });
    
    // Store current hit and set new one
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
    
    if (this.turnManager.willBeEndOfTurn()) {
      currentPlayer.stats.totalScore += this.turnManager.currentTurnScore;
      currentPlayer.stats.rounds += 1;
      currentPlayer.stats.averagePerRound = Math.round(currentPlayer.stats.totalScore / currentPlayer.stats.rounds);
    }
    
    this.turnManager.incrementThrows();
  }

  getGameState() {
    const state = super.getGameState();
    const turnState = this.turnManager.getState();
    return {
      ...state,
      ...turnState,
      selectedScore: this.selectedScore,
      gameType: 'X01',  // It's also good practice to identify the game type
    };
  }

  undoLastThrow() {
    const lastThrow = this.throwHistory.pop();
    if (!lastThrow) return false;
    
    // Get the player who made the throw we're undoing
    const player = this.turnManager.getState().players[lastThrow.playerIndex];
    
    // Restore player's score
    player.score = lastThrow.playerScore;
    
    // Restore turn score
    this.turnManager.currentTurnScore = lastThrow.turnScore;
    
    // Update stats if we're undoing a complete round
    if (this.turnManager.throwsThisTurn === 0) {
      player.stats.totalScore -= this.turnManager.currentTurnScore;
      player.stats.rounds--;
      player.stats.averagePerRound = player.stats.rounds > 0 
        ? Math.round(player.stats.totalScore / player.stats.rounds)
        : 0;
    }
    
    // Restore previous hit
    this.lastHit = this.hitHistory.pop() || null;
    
    this.turnManager.undoThrow();
    this.gameMessage = `Round score: ${this.turnManager.currentTurnScore}`;
    
    return true;
  }
}