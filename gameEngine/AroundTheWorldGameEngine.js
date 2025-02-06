import { BaseGameEngine } from './BaseGameEngine';

export class AroundTheWorldGameEngine extends BaseGameEngine {
  constructor(config) {
    super(config);
    this.targets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
    this.players = config.players.map(player => ({
      ...player,
      currentIndex: 0,
      currentTarget: this.targets[0],
      completed: false,
    }));
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
    
    if (dart.score === currentPlayer.currentTarget) {
      if (currentPlayer.currentIndex + dart.multiplier < this.targets.length) {
        currentPlayer.currentIndex += dart.multiplier;
        currentPlayer.currentTarget = this.targets[currentPlayer.currentIndex];
        this.gameMessage = `${currentPlayer.name} hit ${dart.score}${dart.multiplier > 1 ? ` with multiplier ${dart.multiplier}` : ''}!`;
      } else {
        currentPlayer.completed = true;
        this.gameMessage = `${currentPlayer.name} wins!`;
        this.turnManager.currentPlayerIndex = this.findNextActivePlayer(this.turnManager.currentPlayerIndex);
        return;
      }
    } else {
      this.gameMessage = `${currentPlayer.name} missed ${currentPlayer.currentTarget}`;
    }

    this.turnManager.incrementThrows();
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