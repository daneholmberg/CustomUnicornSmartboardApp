export class BaseGameEngine {
  constructor(config) {
    this.players = config.players;
    this.currentPlayerIndex = 0;
    this.throwsThisTurn = 0;
    this.MAX_DARTS = 3;
    this.gameMessage = '';
    this.lastHit = null;
  }

  handleThrow(dart) {
    throw new Error('handleThrow must be implemented by subclass');
  }

  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.throwsThisTurn = 0;
  }

  isEndOfTurn() {
    return this.throwsThisTurn >= this.MAX_DARTS;
  }

  getGameState() {
    return {
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      throwsThisTurn: this.throwsThisTurn,
      gameMessage: this.gameMessage,
      lastHit: this.lastHit,
    };
  }
}