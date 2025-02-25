// We don't use standard around the world rules. 
// We use a target number and then advance by the multiplier.
// If the target number is 20, we advance to the bullseye.
// If the target number is 25, we win, inner bullseye counts.
// In the future we will add the option to have to hit inner bullseye to win. This comment might not be rememered to be deleted once we do.

import { BaseGameEngine } from './BaseGameEngine';
import { AROUND_THE_WORLD_TARGETS } from '../constants';
import { GAME_MODES } from '../constants/gameModes';

// Add validation at class level
if (!Array.isArray(AROUND_THE_WORLD_TARGETS) || AROUND_THE_WORLD_TARGETS.length === 0) {
  throw new Error('AROUND_THE_WORLD_TARGETS must be a non-empty array');
}

/**
 * Game engine for Around the World variant
 * Handles progression through numbers with multiplier advancement
 */
export class AroundTheWorldGameEngine extends BaseGameEngine {
  constructor(config) {
    if (!config?.players?.length) {
      throw new GameConfigError('AroundTheWorldGameEngine requires at least one player');
    }

    const initializedPlayers = config.players.map(player => ({
      ...player,
      targetIndex: 0,
      stats: {
        attempts: 0,
        hits: 0,
        hitRate: 0,
        currentStreak: 0,
        maxStreak: 0,
        firstDartHits: 0,
        firstDartAttempts: 0,
        firstDartHitRate: 0,
        totalDartsToNextNumber: 0,
        numbersCompleted: 0,
        averageDartsPerNumber: 0,
        perfectTurns: 0,
        doubleHits: 0,
        tripleHits: 0,
        multiplierAttempts: 0,
        multiplierHitRate: 0,
        dartsThrown: 0,
      }
    }));
    
    super({ ...config, players: initializedPlayers });
  }

  findNextActivePlayer(startIndex) {
    const players = this.turnManager.getState().players;
    let nextIndex = (startIndex + 1) % players.length;
    while (players[nextIndex].completed && nextIndex !== startIndex) {
      nextIndex = (nextIndex + 1) % players.length;
    }
    return nextIndex;
  }

  undoLastThrow() {
    const lastThrow = this._undoGenericThrow();
    if (!lastThrow) return false;

    const player = this.turnManager.getState().players[lastThrow.playerIndex];
    
    // Handle case where meta might be undefined
    const meta = lastThrow.meta || {};
    const targetIndex = meta.targetIndex !== undefined ? meta.targetIndex : player.targetIndex;

    // Safely decrement attempts
    if (player.stats.attempts > 0) {
      player.stats.attempts--;
    }

    // If it was a hit on that target, revert
    const targetAtTimeOfThrow = AROUND_THE_WORLD_TARGETS[targetIndex];
    if (lastThrow.dart.score === targetAtTimeOfThrow) {
      if (player.stats.hits > 0) {
        player.stats.hits--;
      }
      player.targetIndex = targetIndex;
    }

    // Safely calculate hit rate
    player.stats.hitRate = player.stats.attempts > 0
      ? Math.round((player.stats.hits / player.stats.attempts) * 100)
      : 0;

    this.gameMessage = `Aiming for: ${AROUND_THE_WORLD_TARGETS[player.targetIndex]}`;
    return true;
  }

  /**
   * Handles a dart throw for the current player
   * @param {DartThrow} dart - The dart throw data
   */
  handleThrow(dart) {
    if (!this.validateDartThrow(dart)) {
      throw new GamePlayError('Invalid dart throw data');
    }

    const currentPlayer = this.turnManager.getCurrentPlayer();
    const currentTargetIndex = currentPlayer.targetIndex;
    const targetNumber = AROUND_THE_WORLD_TARGETS[currentTargetIndex];
    
    // Track stats before the throw
    const isFirstDartOfTurn = this.turnManager.throwsThisTurn === 0;
    const dartsAtCurrentTarget = currentPlayer.stats.dartsThrown - 
      (currentPlayer.stats.numbersCompleted * currentPlayer.stats.averageDartsPerNumber);
    
    // Save throw history for undo
    this.throwHistory.push({
      dart,
      playerIndex: this.turnManager.currentPlayerIndex,
      throwsThisTurn: this.turnManager.throwsThisTurn,
      meta: { targetIndex: currentPlayer.targetIndex }
    });
    
    // Update hit history
    if (this.lastHit) {
      this.hitHistory.push(this.lastHit);
    }
    this.lastHit = dart;
    
    // Add dart to current turn darts in the turn manager
    this.turnManager.addDart(dart);
    
    // Update base stats
    currentPlayer.stats.dartsThrown++;
    
    // Track multiplier attempts
    if (dart.multiplier > 1) {
      currentPlayer.stats.multiplierAttempts++;
      if (dart.multiplier === 2) currentPlayer.stats.doubleHits++;
      if (dart.multiplier === 3) currentPlayer.stats.tripleHits++;
    }

    const isHit = dart.score === targetNumber || 
      (targetNumber === 25 && dart.score === 50);

    if (isHit) {
      // Update streaks
      currentPlayer.stats.currentStreak++;
      currentPlayer.stats.maxStreak = Math.max(
        currentPlayer.stats.maxStreak,
        currentPlayer.stats.currentStreak
      );

      // Track first dart hits
      if (isFirstDartOfTurn) {
        currentPlayer.stats.firstDartHits++;
      }
      currentPlayer.stats.hits++;
      
      // Track darts to complete number
      currentPlayer.stats.totalDartsToNextNumber += dartsAtCurrentTarget + 1;
      currentPlayer.stats.numbersCompleted++;
      
      // Update averages
      currentPlayer.stats.averageDartsPerNumber = 
        currentPlayer.stats.totalDartsToNextNumber / currentPlayer.stats.numbersCompleted;
      
      // Track hits in current turn
      this.turnManager.currentTurnHits = (this.turnManager.currentTurnHits || 0) + 1;
      
      // Check for perfect turn (hitting all 3 darts in a turn)
      if (this.turnManager.throwsThisTurn === 2 && 
          this.turnManager.currentTurnHits === 3) {
        currentPlayer.stats.perfectTurns++;
      }

      // If not at bullseye yet, advance by multiplier
      if (currentPlayer.targetIndex < AROUND_THE_WORLD_TARGETS.length - 1) {
        const advance = Math.min(
          dart.multiplier,
          AROUND_THE_WORLD_TARGETS.length - 1 - currentPlayer.targetIndex
        );
        const oldTarget = currentPlayer.targetIndex;
        currentPlayer.targetIndex += advance;
        
        const skippedNumbers = advance > 1 ? 
          AROUND_THE_WORLD_TARGETS
            .slice(oldTarget + 1, oldTarget + advance)
            .join(', ') :
          null;
          
        const nextTarget = AROUND_THE_WORLD_TARGETS[currentPlayer.targetIndex];
        this.gameMessage = `${currentPlayer.name} hit ${targetNumber}${
          dart.multiplier > 1 ? ` with ${dart.multiplier}x` : ''
        }!${skippedNumbers ? ` Skipping ${skippedNumbers}.` : ''} Now aiming for ${nextTarget}`;
      }
      // If hit bullseye, win
      else {
        this.setPlayerCompleted(currentPlayer, `${currentPlayer.name} wins with a bullseye!`);
        this.hasWinner = true;
        return;
      }
    } else {
      currentPlayer.stats.currentStreak = 0;
      // Add message for misses
      this.gameMessage = `${currentPlayer.name} missed ${targetNumber} with ${dart.score}`;
    }
    
    // Update first dart attempts
    if (isFirstDartOfTurn) {
      currentPlayer.stats.firstDartAttempts++;
    }

    // Update rates
    currentPlayer.stats.hitRate = Math.round(
      (currentPlayer.stats.hits / currentPlayer.stats.attempts) * 100
    );
    currentPlayer.stats.firstDartHitRate = Math.round(
      (currentPlayer.stats.firstDartHits / currentPlayer.stats.firstDartAttempts) * 100
    );
    currentPlayer.stats.multiplierHitRate = Math.round(
      ((currentPlayer.stats.doubleHits + currentPlayer.stats.tripleHits) / 
       currentPlayer.stats.multiplierAttempts) * 100
    ) || 0;

    if (this.turnManager.willBeEndOfTurn()) {
      this.turnManager.currentTurnHits = 0;  // Reset hits counter for next turn
      this.turnManager.nextPlayer();
    } else {
      this.turnManager.incrementThrows();
    }

    // Inside handleThrow method, add this line before updating rates:
    currentPlayer.stats.attempts++;
  }

  /**
   * Validates incoming dart throw data
   * @private
   */
  validateDartThrow(dart) {
    return dart && 
           typeof dart.score === 'number' && 
           typeof dart.multiplier === 'number';
  }

  getGameState() {
    const state = super.getGameState();
    const currentPlayer = this.turnManager.getCurrentPlayer();
    
    if (!currentPlayer) {
      throw new NoCurrentPlayerError('No current player found');
    }

    const targetNumber = AROUND_THE_WORLD_TARGETS[currentPlayer.targetIndex];
    if (typeof targetNumber !== 'number') {
      throw new InvalidTargetIndexError('Invalid target index:', currentPlayer.targetIndex);
    }

    return {
      ...state,
      targetNumbers: [targetNumber],
      hasWinner: this.hasWinner,
      gameType: GAME_MODES.AROUND_THE_WORLD,
    };
  }
}