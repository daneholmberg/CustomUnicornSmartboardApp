import { BaseGameEngine } from './BaseGameEngine';

export class AroundTheWorldGameEngine extends BaseGameEngine {
  constructor(config) {
    const initializedPlayers = config.players.map(player => ({
      ...player,
      currentTarget: 1,
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
    this.lastHit = dart;
    const currentPlayer = this.turnManager.getCurrentPlayer();
    const targetNumber = currentPlayer.currentTarget;

    // Update statistics
    if (dart.score === targetNumber || (targetNumber === 25 && dart.score === 50)) {
      currentPlayer.stats.hits++;
      
      // If not at bullseye yet, advance by multiplier
      if (targetNumber < 20) {
        const advance = dart.multiplier;
        currentPlayer.currentTarget += advance;
        
        const skippedNumbers = advance > 1 ? 
          Array.from({ length: advance - 1 }, (_, i) => targetNumber + i + 1).join(', ') :
          null;
          
        this.gameMessage = `${currentPlayer.name} hit ${targetNumber}${
          dart.multiplier > 1 ? ` with ${dart.multiplier}x` : ''
        }!${skippedNumbers ? ` Skipping ${skippedNumbers}.` : ''} Now aiming for ${currentPlayer.currentTarget}`;
      } 
      // If at 20, advance to bullseye
      else if (targetNumber === 20) {
        currentPlayer.currentTarget = 25;
        this.gameMessage = `${currentPlayer.name} hit 20! Now aim for the bullseye to win!`;
      }
      // If hit bullseye, win
      else {
        this.gameMessage = `${currentPlayer.name} wins with a bullseye!`;
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
    return {
      ...state,
      targetNumbers: [currentPlayer.currentTarget],
    };
  }
}