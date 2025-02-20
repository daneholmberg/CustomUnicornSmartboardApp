import { renderHook, act } from '@testing-library/react-hooks';
import { useGameState } from '../../hooks/useGameState';
import { GAME_MODES } from '../../constants/gameModes';
import { SmartboardProvider } from '../../context/SmartboardContext';
import { SettingsProvider } from '../../context/SettingsContext';
import React from 'react';

// Move wrapper outside of describe blocks so it's available to all tests
const wrapper = ({ children }) => (
  <SettingsProvider>
    <SmartboardProvider>
      {children}
    </SmartboardProvider>
  </SettingsProvider>
);

// Shared test constants
const TEST_CONSTANTS = {
  DEFAULT_SCORE: 301,
  TEST_THROW_VALUE: 20,
  TEST_MULTIPLIER: 1,
  PLAYERS_COUNT: 4,
  THROWS_PER_TURN: 3,
};

// Shared helper functions
const createMultiplePlayers = (count = TEST_CONSTANTS.PLAYERS_COUNT) => 
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Player ${i + 1}`,
  }));

const createMockThrow = (score = TEST_CONSTANTS.TEST_THROW_VALUE, multiplier = TEST_CONSTANTS.TEST_MULTIPLIER) => ({
  score,
  multiplier,
});

// Helper to simulate a full turn of throws
const simulateFullTurn = (result) => {
  for (let i = 0; i < TEST_CONSTANTS.THROWS_PER_TURN; i++) {
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
    });
  }
};

// Helper to verify player scores
const verifyPlayerScores = (players, expectedScores) => {
  players.forEach((player, index) => {
    expect(player.score).toBe(expectedScores[index]);
  });
};

describe('useGameState Hook', () => {
  // Helper to create basic game config
  const createGameConfig = (overrides = {}) => ({
    mode: GAME_MODES.X01,
    players: [
      {
        id: 1,
        name: 'Test Player',
      },
    ],
    selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
    ...overrides,
  });

  it('should initialize with clean game state', () => {
    const gameConfig = createGameConfig();
    const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

    expect(result.current).toMatchObject({
      gameType: GAME_MODES.X01,
      selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      throwsThisTurn: 0,
      currentTurnScore: 0,
      previousTurnScore: 0,
      hasHistory: false,
      lastHit: null,
    });
  });

  it('should reset game state when gameConfig changes', () => {
    const initialConfig = createGameConfig();
    const { result, rerender } = renderHook(
      (props) => useGameState(props),
      {
        wrapper,
        initialProps: initialConfig,
      }
    );

    // Make some throws in initial game
    act(() => {
      result.current.handleThrow(createMockThrow());
      result.current.handleThrow(createMockThrow());
    });

    // Verify throws were recorded
    expect(result.current.throwsThisTurn).toBe(2);
    expect(result.current.currentTurnScore).toBe(TEST_CONSTANTS.TEST_THROW_VALUE * 2);

    // Change game config
    const newConfig = createGameConfig({ selectedScore: 501 });
    rerender(newConfig);

    // Verify state was reset
    expect(result.current.throwsThisTurn).toBe(0);
    expect(result.current.currentTurnScore).toBe(0);
    expect(result.current.selectedScore).toBe(501);
    expect(result.current.hasHistory).toBe(false);
    expect(result.current.lastHit).toBeNull();
  });

  it('should handle throws and update state accordingly', () => {
    const gameConfig = createGameConfig();
    const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

    act(() => {
      result.current.handleThrow(createMockThrow());
    });

    expect(result.current.throwsThisTurn).toBe(1);
    expect(result.current.currentTurnScore).toBe(TEST_CONSTANTS.TEST_THROW_VALUE);
    expect(result.current.hasHistory).toBe(true);
    expect(result.current.lastHit).toEqual(createMockThrow());
  });

  it('should handle undo and restore previous state', () => {
    const gameConfig = createGameConfig();
    const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

    // Make a throw
    act(() => {
      result.current.handleThrow(createMockThrow());
    });

    const stateAfterThrow = {
      throwsThisTurn: result.current.throwsThisTurn,
      currentTurnScore: result.current.currentTurnScore,
      lastHit: result.current.lastHit,
    };

    // Undo the throw
    act(() => {
      result.current.handleUndo();
    });

    // Verify state was restored
    expect(result.current.throwsThisTurn).toBe(0);
    expect(result.current.currentTurnScore).toBe(0);
    expect(result.current.lastHit).toBeNull();
    expect(result.current).not.toEqual(stateAfterThrow);
  });

  it('should respond to smartboard context updates', () => {
    const gameConfig = createGameConfig();
    const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

    // Initial state should include smartboard context values
    expect(result.current).toHaveProperty('connected');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('mockThrow');
  });

  it('should maintain separate states for different game instances', () => {
    const config1 = createGameConfig();
    const config2 = createGameConfig({ selectedScore: 501 });

    const { result: result1 } = renderHook(() => useGameState(config1), { wrapper });
    const { result: result2 } = renderHook(() => useGameState(config2), { wrapper });

    // Make throws in first game
    act(() => {
      result1.current.handleThrow(createMockThrow());
    });

    // Verify states are independent
    expect(result1.current.currentTurnScore).toBe(TEST_CONSTANTS.TEST_THROW_VALUE);
    expect(result2.current.currentTurnScore).toBe(0);
    expect(result1.current.selectedScore).toBe(301);
    expect(result2.current.selectedScore).toBe(501);
  });

  it('should properly advance turns and update scores', () => {
    const gameConfig = {
      mode: GAME_MODES.X01,
      players: createMultiplePlayers(2), // Just use 2 players for clarity
      selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
    };

    const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

    // First player's turn
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
      console.log('After 1st throw - Player:', result.current.currentPlayerIndex, 'Score:', result.current.players[0].score);
      result.current.handleThrow({ score: 20, multiplier: 1 });
      console.log('After 2nd throw - Player:', result.current.currentPlayerIndex, 'Score:', result.current.players[0].score);
      result.current.handleThrow({ score: 20, multiplier: 1 });
      console.log('After 3rd throw - Player:', result.current.currentPlayerIndex, 'Score:', result.current.players[0].score);
    });

    // Should now be second player's turn
    expect(result.current.currentPlayerIndex).toBe(1);
    expect(result.current.players[0].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE - 60);
    expect(result.current.players[1].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE);

    // Second player's turn
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
      console.log('P2 After 1st throw - Player:', result.current.currentPlayerIndex, 'Score:', result.current.players[1].score);
      result.current.handleThrow({ score: 20, multiplier: 1 });
      console.log('P2 After 2nd throw - Player:', result.current.currentPlayerIndex, 'Score:', result.current.players[1].score);
      result.current.handleThrow({ score: 20, multiplier: 1 });
      console.log('P2 After 3rd throw - Player:', result.current.currentPlayerIndex, 'Score:', result.current.players[1].score);
    });

    // Should be back to first player
    expect(result.current.currentPlayerIndex).toBe(0);
    expect(result.current.players[0].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE - 60);
    expect(result.current.players[1].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE - 60);
  });
});

describe('useGameState Hook - Stress Testing', () => {
  // Helper to create multiple players
  const createMultiplePlayers = (count = TEST_CONSTANTS.PLAYERS_COUNT) => 
    Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
    }));

  describe('Multi-player Game Stability', () => {
    it('should maintain correct scores after multiple turns and app restart', () => {
      const gameConfig = {
        mode: GAME_MODES.X01,
        players: createMultiplePlayers(),
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      };

      // Start first game instance
      let { result, rerender } = renderHook(() => useGameState(gameConfig), { wrapper });
      
      // Play first round
      simulateFullTurn(result); // Player 1's turn
      const player1Score = TEST_CONSTANTS.DEFAULT_SCORE - (20 * 3);
      expect(result.current.players[0].score).toBe(player1Score);

      // Simulate app restart by recreating hook
      act(() => {
        result.current.resetGame();
      });
      
      // Verify scores persisted correctly
      expect(result.current.players[0].score).toBe(player1Score);
      expect(result.current.players[1].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
    });

    it('should handle rapid player transitions without losing score state', () => {
      const gameConfig = {
        mode: GAME_MODES.X01,
        players: createMultiplePlayers(),
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      };

      const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

      // Simulate rapid turns with quick transitions
      for (let i = 0; i < TEST_CONSTANTS.PLAYERS_COUNT * 2; i++) {
        act(() => {
          result.current.handleThrow({ score: 20, multiplier: 1 });
          result.current.handleThrow({ score: 20, multiplier: 1 });
          result.current.handleThrow({ score: 20, multiplier: 1 });
        });
      }

      // Verify all players' scores are correctly maintained
      const expectedScores = result.current.players.map((_, index) => 
        TEST_CONSTANTS.DEFAULT_SCORE - (2 * 3 * 20) // 2 full turns of 3 darts each
      );
      verifyPlayerScores(result.current.players, expectedScores);
    });

    it('should handle multiple game restarts without score corruption', () => {
      const gameConfig = {
        mode: GAME_MODES.X01,
        players: createMultiplePlayers(),
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      };

      const { result, rerender } = renderHook(() => useGameState(gameConfig), { wrapper });

      // Play some turns
      simulateFullTurn(result);
      console.log('After first turn:', result.current.players[0].score); // Should be 441

      // First restart
      act(() => {
        result.current.resetGame();
      });
      console.log('After first rerender:', result.current.players[0].score); // Is state preserved?
      simulateFullTurn(result);
      console.log('After second turn:', result.current.players[0].score); // Should be 381

      // Second restart
      act(() => {
        result.current.resetGame();
      });
      console.log('After second rerender:', result.current.players[0].score); // Is state preserved?
      simulateFullTurn(result);
      console.log('After third turn:', result.current.players[0].score); // Should be 321

      const expectedScore = TEST_CONSTANTS.DEFAULT_SCORE - (3 * 20 * 3);
      expect(result.current.players[0].score).toBe(expectedScore);
    });

    it('should maintain correct turn order after undoing throws', () => {
      const gameConfig = {
        mode: GAME_MODES.X01,
        players: createMultiplePlayers(),
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      };

      const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

      // Play some turns
      simulateFullTurn(result); // Player 1
      simulateFullTurn(result); // Player 2
      
      // Undo last player's throws
      act(() => {
        result.current.handleUndo();
        result.current.handleUndo();
        result.current.handleUndo();
      });

      // Verify we're back to Player 2's turn with correct score
      expect(result.current.currentPlayerIndex).toBe(1);
      expect(result.current.players[1].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
    });

    it('should handle bust scenarios without corrupting other players scores', () => {
      const gameConfig = {
        mode: GAME_MODES.X01,
        players: createMultiplePlayers(),
        selectedScore: TEST_CONSTANTS.DEFAULT_SCORE,
      };

      const { result } = renderHook(() => useGameState(gameConfig), { wrapper });

      // Get Player 1 close to winning
      act(() => {
        result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
        result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
        result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      });

      const player1ScoreAfterFirstTurn = TEST_CONSTANTS.DEFAULT_SCORE - (60 * 3);
      expect(result.current.players[0].score).toBe(player1ScoreAfterFirstTurn);

      // Next turn - attempt bust
      act(() => {
        result.current.handleThrow({ score: 20, multiplier: 3 }); // Would go below 0
      });

      // Verify Player 1's score reverted to pre-bust state
      expect(result.current.players[0].score).toBe(player1ScoreAfterFirstTurn);
      
      // Verify other players' scores unchanged
      expect(result.current.players[1].score).toBe(TEST_CONSTANTS.DEFAULT_SCORE);
    });
  });
});

describe('useGameState Hook - Reset Functionality', () => {
  const INITIAL_SCORE = 501;
  
  const createTestConfig = (playerCount = 2) => ({
    mode: GAME_MODES.X01,
    players: createMultiplePlayers(playerCount),
    selectedScore: INITIAL_SCORE,
  });

  it('should reset to clean state when resetGame is called', () => {
    const { result } = renderHook(() => useGameState(createTestConfig()), { wrapper });

    // Make some throws
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 2 }); // 40
      result.current.handleThrow({ score: 20, multiplier: 1 }); // 20
    });

    // Verify game state was modified
    expect(result.current.players[0].score).toBe(INITIAL_SCORE - 120);
    expect(result.current.currentTurnScore).toBe(120);
    expect(result.current.hasHistory).toBe(true);
    expect(result.current.throwsThisTurn).toBe(3);

    // Reset game
    act(() => {
      result.current.resetGame();
    });

    // Verify complete reset to initial state
    expect(result.current.players[0].score).toBe(INITIAL_SCORE);
    expect(result.current.players[1].score).toBe(INITIAL_SCORE);
    expect(result.current.currentTurnScore).toBe(0);
    expect(result.current.throwsThisTurn).toBe(0);
    expect(result.current.hasHistory).toBe(false);
    expect(result.current.lastHit).toBeNull();
    expect(result.current.currentPlayerIndex).toBe(0);
  });

  it('should maintain clean state across multiple resets', () => {
    const { result } = renderHook(() => useGameState(createTestConfig(4)), { wrapper });
    
    // Sequence of play and reset actions
    const sequences = [
      { throws: 2, score: 40 },
      { throws: 1, score: 60 },
      { throws: 3, score: 100 },
    ];

    for (const sequence of sequences) {
      // Play some throws
      for (let i = 0; i < sequence.throws; i++) {
        act(() => {
          result.current.handleThrow({ score: 20, multiplier: 1 });
        });
      }

      // Verify game was modified
      expect(result.current.currentTurnScore).toBeGreaterThan(0);
      expect(result.current.hasHistory).toBe(true);

      // Reset and verify clean state
      act(() => {
        result.current.resetGame();
      });

      // Verify all players reset to initial score
      result.current.players.forEach(player => {
        expect(player.score).toBe(INITIAL_SCORE);
      });

      // Verify turn state reset
      expect(result.current.currentTurnScore).toBe(0);
      expect(result.current.throwsThisTurn).toBe(0);
      expect(result.current.hasHistory).toBe(false);
      expect(result.current.currentPlayerIndex).toBe(0);
    }
  });

  it('should reset player statistics on game reset', () => {
    const { result } = renderHook(() => useGameState(createTestConfig()), { wrapper });

    // Play a full game with high scores
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
    });

    const expectedCleanStats = {
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

    // Reset game
    act(() => {
      result.current.resetGame();
    });

    // Verify all player stats are reset
    result.current.players.forEach(player => {
      expect(player.stats).toEqual(expectedCleanStats);
    });
  });

  it('should handle reset during ongoing turn', () => {
    const { result } = renderHook(() => useGameState(createTestConfig()), { wrapper });

    // Start a turn but don't complete it
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
      result.current.handleThrow({ score: 20, multiplier: 1 });
      // Don't throw third dart
    });

    // Reset mid-turn
    act(() => {
      result.current.resetGame();
    });

    // Verify clean state
    expect(result.current.throwsThisTurn).toBe(0);
    expect(result.current.currentTurnScore).toBe(0);
    expect(result.current.players[0].score).toBe(INITIAL_SCORE);
    
    // Verify can start new turn
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
    });
    expect(result.current.throwsThisTurn).toBe(1);
    expect(result.current.currentTurnScore).toBe(20);
  });

  it('should preserve game configuration after reset', () => {
    const customConfig = {
      mode: GAME_MODES.X01,
      players: createMultiplePlayers(3),
      selectedScore: 701, // Custom starting score
    };

    const { result } = renderHook(() => useGameState(customConfig), { wrapper });

    // Play some throws and reset
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
      result.current.resetGame();
    });

    // Verify config preserved
    expect(result.current.gameType).toBe(GAME_MODES.X01);
    expect(result.current.players).toHaveLength(3);
    expect(result.current.selectedScore).toBe(701);
    expect(result.current.players[0].score).toBe(701);
  });
}); 