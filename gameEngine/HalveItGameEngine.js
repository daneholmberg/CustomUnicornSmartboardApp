import { BaseGameEngine } from './BaseGameEngine';
import { HALVE_IT_POSSIBLE_TARGETS } from '../constants/gameConstants';
import { GameConfigError } from '../utils/errors';

export class HalveItGameEngine extends BaseGameEngine {
  constructor(config) {
    if (!config?.players?.length) {
      throw new GameConfigError('HalveItGameEngine requires at least one player');
    }

    const roundCount = config.roundCount ?? 9;
    const penaltyMode = config.penaltyMode ?? 'half';
    const bullseyeMode = config.bullseyeMode ?? 'outer';

    // Generate random rounds based on config
    const rounds = HalveItGameEngine.generateRandomRounds(roundCount, bullseyeMode);

    const initializedPlayers = config.players.map(player => ({
      ...player,
      score: 40,
      currentRound: 1,
      roundScore: 0,
      roundHits: 0,
      hasCompletedAllRounds: false,
      stats: {
        totalHits: 0,
        rounds: 0,
        hitRate: 0
      }
    }));

    super({ ...config, players: initializedPlayers });
    
    this.rounds = rounds;
    this.roundCount = roundCount;
    this.penaltyMode = penaltyMode;
    this.bullseyeMode = bullseyeMode;
  }

  static generateRandomRounds(count, bullseyeMode) {
    if (count < 1) {
      throw new GameConfigError('Round count must be at least 1');
    }

    const shuffled = [...HALVE_IT_POSSIBLE_TARGETS]
      .sort(() => Math.random() - 0.5);
    
    let lastRound;
    let otherRounds;

    // Filter out all bull-related targets from the pool of random targets
    otherRounds = shuffled.filter(t => t.target !== 25 && t.target !== 'outerBull' && t.target !== 'innerBull');

    switch (bullseyeMode) {
      case 'outer':
        lastRound = { 
          target: 'outerBull', 
          label: 'Outer Bull', 
          description: 'Hit outer bull (inner counts)' 
        };
        break;
      case 'inner':
        lastRound = { 
          target: 'innerBull', 
          label: 'Inner Bull', 
          description: 'Must hit inner bull' 
        };
        break;
      default: // 'random'
        lastRound = otherRounds[count - 1];
        break;
    }
    
    return [
      ...otherRounds.slice(0, count - 1),
      lastRound
    ];
  }

  isValidHit(dart, target) {
    switch (target) {
      // Regular numbers 1-20
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
        return dart.score === target;
      
      // Any double
      case 'double':
        return dart.multiplier === 2;
      
      // Any triple
      case 'triple':
        return dart.multiplier === 3;
      
      // Any bullseye (outer or inner)
      case 25:
        return dart.score === 25 || dart.score === 50;
      
      // Outer bullseye only (inner counts as double)
      case 'outerBull':
        return dart.score === 25;
      
      // Inner bullseye only
      case 'innerBull':
        return dart.score === 50;
      
      default:
        return false;
    }
  }

  applyPenalty(score) {
    if (this.penaltyMode === 'third') {
      // Reduce by ⅓ and round down
      return Math.floor(score * (2/3));
    } else {
      // Default to halving
      return Math.floor(score / 2);
    }
  }

  handleEndOfTurn(player) {
    if (player.roundHits === 0) {
      const oldScore = player.score;
      player.score = this.applyPenalty(oldScore);
      const penaltyType = this.penaltyMode === 'third' ? 'reduced by ⅓' : 'halved';
      this.gameMessage = `${player.name} missed all throws! Score ${penaltyType} from ${oldScore} to ${player.score}`;
    } else {
      this.gameMessage = `${player.name} finished round with ${player.roundScore} points`;
    }

    player.stats.rounds++;
    player.stats.hitRate = Math.round((player.stats.totalHits / (player.stats.rounds * 3)) * 100);

    if (player.currentRound < this.rounds.length) {
      player.currentRound++;
    } else {
      player.hasCompletedAllRounds = true;
      this.gameMessage = `${player.name} finished with ${player.score} points!`;
      
      const allPlayersFinished = this.turnManager.getState().players.every(p => p.hasCompletedAllRounds);
      if (allPlayersFinished) {
        this.determineWinner();
      }
    }

    player.roundScore = 0;
    player.roundHits = 0;
  }

  determineWinner() {
    const players = this.turnManager.getState().players;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    // Handle ties by giving same place to tied players
    let currentPlace = 1;
    let currentScore = sortedPlayers[0].score;
    
    sortedPlayers.forEach((player, index) => {
      if (player.score < currentScore) {
        currentPlace = index + 1;
        currentScore = player.score;
      }
      player.place = currentPlace;
    });

    const winners = sortedPlayers.filter(p => p.place === 1);
    if (winners.length === 1) {
      this.gameMessage = `Game Over! ${winners[0].name} wins with ${winners[0].score} points!`;
    } else {
      const winnerNames = winners.map(w => w.name).join(' and ');
      this.gameMessage = `Game Over! Tie between ${winnerNames} with ${winners[0].score} points!`;
    }

    // Mark all players as completed for game end
    players.forEach(player => {
      player.completed = true;
    });
  }

  handleThrow(dart) {
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const round = this.rounds[currentPlayer.currentRound - 1];
    const isLastRound = currentPlayer.currentRound === this.rounds.length;

    this.throwHistory.push({
      dart,
      playerIndex: this.turnManager.currentPlayerIndex,
      throwsThisTurn: this.turnManager.throwsThisTurn,
      meta: {
        roundScore: currentPlayer.roundScore,
        score: currentPlayer.score,
        currentRound: currentPlayer.currentRound,
        roundHits: currentPlayer.roundHits
      }
    });

    if (this.lastHit) {
      this.hitHistory.push(this.lastHit);
    }
    this.lastHit = dart;
    this.turnManager.addDart(dart);

    let isValidHit = this.isValidHit(dart, round.target);
    let points = dart.score * dart.multiplier;

    // Special handling for bullseye modes in last round
    if (isLastRound && round.target === 'outerBull') {
      // For outer bull target, inner bull counts but doesn't give extra points
      if (dart.score === 50) {
        isValidHit = true;
        points = 25; // Count inner as outer
      }
    }

    if (isValidHit) {
      currentPlayer.roundScore += points;
      currentPlayer.score += points;
      currentPlayer.roundHits++;
      currentPlayer.stats.totalHits++;
      this.gameMessage = `${currentPlayer.name} hit ${round.label} for ${points} points! Total: ${currentPlayer.score}`;
    } else {
      this.gameMessage = `${currentPlayer.name} missed ${round.label}`;
    }

    if (this.turnManager.willBeEndOfTurn()) {
      // Special handling for inner bull mode - must hit inner or score is halved
      if (isLastRound && round.target === 'innerBull' && !currentPlayer.roundHits) {
        currentPlayer.score = Math.floor(currentPlayer.score / 2);
        this.gameMessage = `${currentPlayer.name} didn't hit inner bull! Score halved to ${currentPlayer.score}`;
      }
      this.handleEndOfTurn(currentPlayer);
    }

    this.turnManager.incrementThrows();
  }

  undoLastThrow() {
    const lastThrow = this._undoGenericThrow();
    if (!lastThrow) return false;

    const player = this.turnManager.getState().players[lastThrow.playerIndex];
    const { roundScore, score, currentRound, roundHits } = lastThrow.meta;

    player.roundScore = roundScore;
    player.score = score;
    player.currentRound = currentRound;
    player.roundHits = roundHits;

    const round = this.rounds[player.currentRound - 1];
    this.gameMessage = `Aiming for: ${round.description}`;
    return true;
  }

  getGameState() {
    const state = super.getGameState();
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const currentRound = this.rounds[currentPlayer.currentRound - 1];

    return {
      ...state,
      currentRound: currentPlayer.currentRound,
      totalRounds: this.rounds.length,
      roundDescription: currentRound.description,
      roundLabel: currentRound.label,
      rounds: this.rounds,
      penaltyMode: this.penaltyMode,
      bullseyeMode: this.bullseyeMode
    };
  }
} 