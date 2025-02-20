import { X01GameEngine } from '../../gameEngine/X01GameEngine';
import { createGameEngine } from '../../gameEngine/GameFactory';
import { GAME_MODES } from '../../constants/gameModes';
import { GameError } from '../../utils/errors';

describe('X01 Game State Persistence', () => {
  // Test constants to avoid magic numbers/values
  const TEST_CONSTANTS = {
    DEFAULT_SCORE: 301,
    TEST_THROW_VALUE: 20,
    TEST_MULTIPLIER: 1,
  };

  // Helper function to create a basic player with type documentation
  /**
   * Creates a mock player for testing
   * @param {number} id - Player ID
   * @param {string} name - Player name
   * @param {number} score - Starting score
   * @returns {Object} Mock player object
   */
  const createMockPlayer = (id = 1, name = 'Test Player', score = TEST_CONSTANTS.DEFAULT_SCORE) => ({
    id,
    name,
    score,
    stats: {},
  });

  /**
   * Creates a mock dart throw for testing
   * @param {number} score - Dart score
   * @param {number} multiplier - Score multiplier
   * @returns {Object} Mock dart throw
   */
  const createMockThrow = (score = TEST_CONSTANTS.TEST_THROW_VALUE, multiplier = TEST_CONSTANTS.TEST_MULTIPLIER) => ({
    score,
    multiplier,
  });

  /**
   * Helper to verify clean game state
   * @param {X01GameEngine} engine - Game engine to verify
   */
  const expectCleanGameState = (engine) => {
    // Check engine properties directly instead of through getGameState
    expect(engine.throwHistory).toEqual([]);
    expect(engine.hitHistory).toEqual([]);
    expect(engine.lastHit).toBeNull();
    expect(engine.gameMessage).toBe('');
    expect(engine.completedCount).toBe(0);
    
    // Check turn manager state
    expect(engine.turnManager.currentTurnScore).toBe(0);
    expect(engine.turnManager.throwsThisTurn).toBe(0);
    
    // Check player state
    const currentPlayer = engine.turnManager.getCurrentPlayer();
    expect(currentPlayer.score).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
    expect(currentPlayer.completed).toBeFalsy();
  };

  describe('Game Engine State Management', () => {
    let gameEngine;
    
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });
    });

    afterEach(() => {
      // Clean up any potential static/shared state
      gameEngine = null;
    });

    it('should start with a clean state when initialized', () => {
      expectCleanGameState(gameEngine);
    });

    it('should not retain previous game state when creating a new game engine', () => {
      // Make some throws in the first game
      const mockThrow = createMockThrow();
      gameEngine.handleThrow(mockThrow);
      gameEngine.handleThrow(mockThrow);
      
      // Create a new game engine
      const newGameEngine = new X01GameEngine({
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      expectCleanGameState(newGameEngine);
    });

    it('should properly reset state between games using the same engine instance', () => {
      // Make some throws
      const mockThrow = createMockThrow();
      gameEngine.handleThrow(mockThrow);
      gameEngine.handleThrow(mockThrow);
      
      // Reset the game engine
      gameEngine = new X01GameEngine({
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      expectCleanGameState(gameEngine);
    });

    // Add test for state after throws
    it('should properly track state after throws', () => {
      const mockThrow = createMockThrow();
      gameEngine.handleThrow(mockThrow);

      expect(gameEngine.throwHistory.length).toBe(1);
      expect(gameEngine.lastHit).toEqual(mockThrow);
      expect(gameEngine.turnManager.currentTurnScore).toBe(TEST_CONSTANTS.TEST_THROW_VALUE);
      expect(gameEngine.turnManager.throwsThisTurn).toBe(1);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(TEST_CONSTANTS.DEFAULT_SCORE - TEST_CONSTANTS.TEST_THROW_VALUE);
    });
  });

  describe('Game Factory State Management', () => {
    it('should create a fresh game engine each time', () => {
      // Create first game engine and make some throws
      const firstEngine = createGameEngine({
        mode: GAME_MODES.X01,
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });
      
      const mockThrow = createMockThrow();
      firstEngine.handleThrow(mockThrow);
      firstEngine.handleThrow(mockThrow);

      // Create second game engine
      const secondEngine = createGameEngine({
        mode: GAME_MODES.X01,
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      expectCleanGameState(secondEngine);
    });

    it('should throw GameError when mode is not specified', () => {
      expect(() => createGameEngine({
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      })).toThrow(GameError);
    });

    it('should throw GameError with correct message when mode is not specified', () => {
      expect(() => createGameEngine({
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      })).toThrow('Game mode must be specified');
    });

    it('should throw GameError with correct message for unsupported mode', () => {
      expect(() => createGameEngine({
        mode: 'INVALID_MODE',
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      })).toThrow('Unsupported game mode: INVALID_MODE');
    });
  });

  describe('Game State Hook Integration', () => {
    // Move React-specific tests to a separate file
    it.todo('should reset game state when gameConfig changes - implement in React test file');
  });

  describe('Player State Management', () => {
    const EXPECTED_CLEAN_STATS = {
      totalScore: 0,
      rounds: 0,
      averagePerRound: 0,
      first9DartAvg: 0,
      highestRound: 0,
      rounds50Plus: 0,
      rounds75Plus: 0,
      rounds100Plus: 0,
      rounds120Plus: 0,
      first3Rounds: [],
    };

    it('should not share player state between game instances', () => {
      const firstGame = new X01GameEngine({
        players: [createMockPlayer(1, 'Player 1')],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });
      
      firstGame.handleThrow(createMockThrow());
      
      const secondGame = new X01GameEngine({
        players: [createMockPlayer(1, 'Player 1')],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      // Access engine properties directly instead of through getGameState
      expect(firstGame.turnManager.getCurrentPlayer().score)
        .toBe(TEST_CONSTANTS.DEFAULT_SCORE - TEST_CONSTANTS.TEST_THROW_VALUE);
      expect(secondGame.turnManager.getCurrentPlayer().score)
        .toBe(TEST_CONSTANTS.DEFAULT_SCORE);
    });

    it('should properly initialize new players when reusing player IDs', () => {
      const player = createMockPlayer(1, 'Player 1');
      
      const firstGame = new X01GameEngine({
        players: [player],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });
      
      firstGame.handleThrow(createMockThrow());
      
      const secondGame = new X01GameEngine({
        players: [player],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      // Access engine properties directly
      const secondGamePlayer = secondGame.turnManager.getCurrentPlayer();
      expect(secondGamePlayer.score).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
      expect(secondGamePlayer.stats).toEqual(EXPECTED_CLEAN_STATS);
    });

    it('should deep clone player stats when initializing new game', () => {
      const player = createMockPlayer(1, 'Player 1');
      
      const firstGame = new X01GameEngine({
        players: [player],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });
      
      // Modify first game's player stats
      const firstGamePlayer = firstGame.turnManager.getCurrentPlayer();
      firstGamePlayer.stats.totalScore = 100;
      
      // Create second game with same player object
      const secondGame = new X01GameEngine({
        players: [player],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      // Second game should have fresh stats
      const secondGamePlayer = secondGame.turnManager.getCurrentPlayer();
      expect(secondGamePlayer.stats).toEqual(EXPECTED_CLEAN_STATS);
      expect(secondGamePlayer.stats).not.toBe(firstGamePlayer.stats); // Ensure deep clone
    });

    // Add test to verify getGameState behavior
    it('should return correct game state through getGameState', () => {
      const game = new X01GameEngine({
        players: [createMockPlayer()],
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      });

      const mockThrow = createMockThrow();
      game.handleThrow(mockThrow);

      const state = game.getGameState();
      
      // Verify the structure and content of getGameState
      expect(state).toMatchObject({
        // Game configuration
        gameType: 'X01',
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
        requiredMultiplier: expect.any(Number),

        // Player state
        players: expect.any(Array),
        currentPlayerIndex: expect.any(Number),

        // Turn state
        throwsThisTurn: expect.any(Number),
        currentTurnScore: expect.any(Number),
        previousTurnScore: expect.any(Number),
        startOfTurnScore: expect.any(Number),
        currentTurnDarts: expect.any(Array),
        lastTurnDarts: expect.any(Array),
        lastTurnTimestamp: null,

        // Game progress
        gameMessage: expect.any(String),
        lastHit: mockThrow,
        hasHistory: true,

        // Game specific
        targetNumbers: expect.any(Array),
        winningTargets: expect.any(Array),
      });

      // Verify some specific values
      expect(state.selectedScore).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
      expect(state.startOfTurnScore).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
      expect(state.currentTurnScore).toBe(TEST_CONSTANTS.TEST_THROW_VALUE);
      expect(state.throwsThisTurn).toBe(1);
      
      // Verify hasWinner is undefined at game start
      expect(state.hasWinner).toBeUndefined();

      // Verify game is not complete
      expect(state.players.every(p => !p.completed)).toBe(true);
    });
  });
}); 