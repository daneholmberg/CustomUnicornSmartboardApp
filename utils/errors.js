/**
 * Base class for game-related errors
 */
export class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class GameConfigError extends GameError {
  constructor(message) {
    super(`Configuration Error: ${message}`);
  }
}

export class GamePlayError extends GameError {
  constructor(message) {
    super(`Gameplay Error: ${message}`);
  }
} 