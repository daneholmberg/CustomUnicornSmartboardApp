// We don't use standard around the world rules. 
// We use a target number and then advance by the multiplier.
// If the target number is 20, we advance to the bullseye.
// If the target number is 25, we win, inner bullseye counts.
// In the future we will add the option to have to hit inner bullseye to win. This comment might not be rememered to be deleted once we do.

import { BaseGameEngine } from './BaseGameEngine';
import { AROUND_THE_WORLD_TARGETS } from '../constants';

// Add validation at class level
if (!Array.isArray(AROUND_THE_WORLD_TARGETS) || AROUND_THE_WORLD_TARGETS.length === 0) {
  throw new Error('AROUND_THE_WORLD_TARGETS must be a non-empty array');
}

export class AroundTheWorldGameEngine extends BaseGameEngine {
  constructor(config) {
    if (!config || !Array.isArray(config.players)) {
      throw new Error('AroundTheWorldGameEngine requires a config with players array');
    }

    const initializedPlayers = config.players.map(player => ({
      ...player,
      targetIndex: 0, // Track position in AROUND_THE_WORLD_TARGETS array
      stats: {
        attempts: 0,
        hits: 0,
        hitRate: 0
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
    const lastThrow = this.throwHistory.pop();
    if (!lastThrow) return false;
    
    // Get the player who made the throw we're undoing
    const player = this.turnManager.getState().players[lastThrow.playerIndex];
    
    // Update stats
    player.stats.attempts--;
    
    // Check if this was a hit against the target at the time of the throw
    const targetAtTimeOfThrow = AROUND_THE_WORLD_TARGETS[lastThrow.targetIndex];
    if (lastThrow.dart.score === targetAtTimeOfThrow) {
      player.stats.hits--;
      // Revert the target index to what it was at the time of the throw
      player.targetIndex = lastThrow.targetIndex;
    }
    
    // Recalculate hit rate
    player.stats.hitRate = player.stats.attempts > 0
      ? Math.round((player.stats.hits / player.stats.attempts) * 100)
      : 0;
    
    // Restore previous hit
    this.lastHit = this.hitHistory.pop() || null;
    
    this.turnManager.undoThrow();
    this.gameMessage = `Aiming for: ${AROUND_THE_WORLD_TARGETS[player.targetIndex]}`;
    
    return true;
  }

  handleThrow(dart) {
    // Store the current target index before the throw
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const currentTargetIndex = currentPlayer.targetIndex;
    
    // Add to history with the target index
    this.throwHistory.push({
      dart,
      playerIndex: this.turnManager.currentPlayerIndex,
      throwsThisTurn: this.turnManager.throwsThisTurn,
      targetIndex: currentTargetIndex
    });
    
    if (!dart || typeof dart.score !== 'number') {
      console.error('Invalid dart throw:', dart);
      return;
    }

    if (!currentPlayer) {
      console.error('No current player found');
      return;
    }

    // Store current hit and set new one
    if (this.lastHit) {
      this.hitHistory.push(this.lastHit);
    }
    this.lastHit = dart;
    
    const targetNumber = AROUND_THE_WORLD_TARGETS[currentPlayer.targetIndex];
    
    if (typeof targetNumber !== 'number') {
      console.error('Invalid target index:', currentPlayer.targetIndex);
      return;
    }

    // Update statistics
    if (dart.score === targetNumber || (targetNumber === 25 && dart.score === 50)) {
      currentPlayer.stats.hits++;
      
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
        return;
      }
    } else {
      // Add message for misses
      this.gameMessage = `${currentPlayer.name} missed ${targetNumber} with ${dart.score}`;
    }
    
    currentPlayer.stats.attempts++;
    currentPlayer.stats.hitRate = Math.round((currentPlayer.stats.hits / currentPlayer.stats.attempts) * 100);

    if (this.turnManager.willBeEndOfTurn()) {
      this.turnManager.nextPlayer();
    } else {
      this.turnManager.incrementThrows();
    }
  }

  getGameState() {
    const state = super.getGameState();
    const currentPlayer = this.turnManager.getCurrentPlayer();
    
    if (!currentPlayer) {
      console.warn('No current player found');
      return {
        ...state,
        targetNumbers: [],
      };
    }

    const targetNumber = AROUND_THE_WORLD_TARGETS[currentPlayer.targetIndex];
    if (typeof targetNumber !== 'number') {
      console.warn('Invalid target index:', currentPlayer.targetIndex);
      return {
        ...state,
        targetNumbers: [],
      };
    }

    return {
      ...state,
      targetNumbers: [targetNumber],
    };
  }
}