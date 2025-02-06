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
    let nextIndex = (startIndex + 1) % this.players.length;
    while (this.players[nextIndex].completed && nextIndex !== startIndex) {
      nextIndex = (nextIndex + 1) % this.players.length;
    }
    return nextIndex;
  }

  nextPlayer() {
    this.currentPlayerIndex = this.findNextActivePlayer(this.currentPlayerIndex);
    this.throwsThisTurn = 0;
  }

  handleThrow(dart) {
    this.lastHit = dart;
    const currentPlayer = this.players[this.currentPlayerIndex];
    
    if (dart.score === currentPlayer.currentTarget) {
      if (currentPlayer.currentIndex + dart.multiplier < this.targets.length) {
        currentPlayer.currentIndex += dart.multiplier;
        currentPlayer.currentTarget = this.targets[currentPlayer.currentIndex];
        this.gameMessage = `${currentPlayer.name} hit ${dart.score}${dart.multiplier > 1 ? ` with multiplier ${dart.multiplier}` : ''}!`;
      } else {
        currentPlayer.completed = true;
        this.gameMessage = `${currentPlayer.name} wins!`;
        this.nextPlayer();
        return;
      }
    } else {
      this.gameMessage = `${currentPlayer.name} missed ${currentPlayer.currentTarget}`;
    }

    this.throwsThisTurn++;
    if (this.isEndOfTurn()) {
      this.nextPlayer();
    }
  }
}