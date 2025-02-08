/**
 * Base class for game-related errors
 */
export class GameError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when game configuration is invalid
 */
export class GameConfigError extends GameError {
  constructor(message) {
    super(`Configuration Error: ${message}`);
  }
}

/**
 * Error thrown during gameplay when invalid actions occur
 */
export class GamePlayError extends GameError {
  constructor(message) {
    super(`Gameplay Error: ${message}`);
  }
}

/**
 * Error thrown when state validation fails
 */
export class GameStateError extends GameError {
  constructor(message) {
    super(`State Error: ${message}`);
  }
} 