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

  handleThrow(dart) {
    if (!dart || typeof dart.score !== 'number') {
      console.error('Invalid dart throw:', dart);
      return;
    }

    this.lastHit = dart;
    const currentPlayer = this.turnManager.getCurrentPlayer();
    
    if (!currentPlayer) {
      console.error('No current player found');
      return;
    }

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