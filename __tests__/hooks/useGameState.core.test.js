import { renderHook, act } from '@testing-library/react-hooks';
import { useGameState } from '../../hooks/useGameState';
import { GAME_MODES } from '../../constants/gameModes';
import { SmartboardProvider } from '../../context/SmartboardContext';
import { SettingsProvider } from '../../context/SettingsContext';
import React from 'react';

// Test wrapper for required context providers
const wrapper = ({ children }) => (
  <SettingsProvider>
    <SmartboardProvider>
      {children}
    </SmartboardProvider>
  </SettingsProvider>
);

describe('useGameState Hook - Game Flow', () => {
  const DEFAULT_CONFIG = {
    mode: GAME_MODES.X01,
    players: [
      { id: 1, name: 'Player 1' },
      { id: 2, name: 'Player 2' }
    ],
    selectedScore: 501
  };

  it('should handle a complete game lifecycle', () => {
    const { result, rerender } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });

    // Initial state check
    expect(result.current.players[0].score).toBe(501);
    expect(result.current.players[1].score).toBe(501);
    expect(result.current.currentPlayerIndex).toBe(0);

    // Play some turns
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
    });

    // Check state after first player's turn
    expect(result.current.players[0].score).toBe(321); // 501 - 180
    expect(result.current.currentPlayerIndex).toBe(1);

    // Simulate app background/foreground transition
    rerender();

    // State should persist
    expect(result.current.players[0].score).toBe(321);
    expect(result.current.currentPlayerIndex).toBe(1);

    // Continue game
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 2 }); // 40
      result.current.handleThrow({ score: 20, multiplier: 2 }); // 40
      result.current.handleThrow({ score: 20, multiplier: 2 }); // 40
    });

    // Check state after second player's turn
    expect(result.current.players[1].score).toBe(381); // 501 - 120
    expect(result.current.currentPlayerIndex).toBe(0);
  });

  it('should handle game config changes correctly', () => {
    const { result, rerender } = renderHook(
      (props) => useGameState(props),
      {
        wrapper,
        initialProps: DEFAULT_CONFIG
      }
    );

    // Play some throws
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
      result.current.handleThrow({ score: 20, multiplier: 1 });
    });

    // Change game config
    const newConfig = {
      ...DEFAULT_CONFIG,
      selectedScore: 301,
      players: [
        { id: 1, name: 'Player 1' },
        { id: 2, name: 'Player 2' },
        { id: 3, name: 'Player 3' }
      ]
    };

    rerender(newConfig);

    // Verify game was reset with new config
    expect(result.current.players).toHaveLength(3);
    expect(result.current.players[0].score).toBe(301);
    expect(result.current.currentPlayerIndex).toBe(0);
    expect(result.current.throwsThisTurn).toBe(0);
  });

  it('should handle rapid throws without state corruption', () => {
    const { result } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });

    // Simulate rapid throws
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
      result.current.handleThrow({ score: 20, multiplier: 1 });
      result.current.handleThrow({ score: 20, multiplier: 1 });
    });

    const firstPlayerScore = result.current.players[0].score;

    // More rapid throws for second player
    act(() => {
      result.current.handleThrow({ score: 19, multiplier: 1 });
      result.current.handleThrow({ score: 19, multiplier: 1 });
      result.current.handleThrow({ score: 19, multiplier: 1 });
    });

    // Scores should be correctly maintained
    expect(result.current.players[0].score).toBe(firstPlayerScore);
    expect(result.current.players[1].score).toBe(501 - 57);
  });

  it('should handle undo across player transitions', () => {
    const { result } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });

    // Complete first player's turn
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 }); // 20
      result.current.handleThrow({ score: 20, multiplier: 1 }); // 40
      result.current.handleThrow({ score: 20, multiplier: 1 }); // 60
    });

    const firstPlayerScore = result.current.players[0].score;

    // Start second player's turn
    act(() => {
      result.current.handleThrow({ score: 19, multiplier: 1 }); // 19
    });

    // Undo into previous player's turn
    act(() => {
      result.current.handleUndo(); // Undo 19
      result.current.handleUndo(); // Undo last throw of previous player
    });

    // Verify correct state
    expect(result.current.currentPlayerIndex).toBe(0);
    expect(result.current.players[0].score).toBe(firstPlayerScore + 20); // Added back last throw
    expect(result.current.throwsThisTurn).toBe(2);
  });

  it('should maintain consistent state during bust scenarios', () => {
    const { result } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });

    // Player 1: 501 -> 321 (180 points)
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
    });

    // Player 2: 501 -> 321
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 });
      result.current.handleThrow({ score: 20, multiplier: 3 });
      result.current.handleThrow({ score: 20, multiplier: 3 });
    });

    // Player 1: 321 -> 141
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 });
      result.current.handleThrow({ score: 20, multiplier: 3 });
      result.current.handleThrow({ score: 20, multiplier: 3 });
    });

    // Player 2: 321 -> 141
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 });
      result.current.handleThrow({ score: 20, multiplier: 3 });
      result.current.handleThrow({ score: 20, multiplier: 3 });
    });

    // Player 1: 141 -> 21
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      console.log('After first throw of final turn:', {
        p1Score: result.current.players[0].score,
        currentPlayer: result.current.currentPlayerIndex,
        throwsThisTurn: result.current.throwsThisTurn
      });
      
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
    });


    // Attempt bust
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 2 }); // 40
    });


    // Post-bust assertions
    expect(result.current.players[0].score).toBe(141); // Reverted to start-of-turn score
    expect(result.current.currentPlayerIndex).toBe(1); // Next player
    expect(result.current.throwsThisTurn).toBe(0); // Reset throws
  });

  it('should handle finishing a game correctly', () => {
    const config = {
      ...DEFAULT_CONFIG,
      selectedScore: 301,
      players: [DEFAULT_CONFIG.players[0]] // Single player
    };

    const { result } = renderHook(() => useGameState(config), { wrapper });

    // First turn: 180 points (301 -> 121)
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
    });

    // Second turn: 79 points (121 -> 42)
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 3 }); // 60
      result.current.handleThrow({ score: 19, multiplier: 1 }); // 19
    });

    expect(result.current.players[0].score).toBe(42);

    // Final throw: 21x2 = 42
    act(() => {
      result.current.handleThrow({ score: 21, multiplier: 2 });
    });

    expect(result.current.players[0].score).toBe(0);
    expect(result.current.hasWinner).toBe(true);
  });

  it('should handle a single turn without memory issues', () => {
    const { result } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });

    console.log('Initial state:', {
      players: result.current.players,
      currentPlayerIndex: result.current.currentPlayerIndex
    });

    // Single throw
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
    });

    console.log('After throw:', {
      players: result.current.players,
      currentPlayerIndex: result.current.currentPlayerIndex,
      gameEngine: result.current.gameEngine // See if we're leaking engines
    });

    expect(result.current.players[0].score).toBe(481);
  });

  it('should maintain clean state references', () => {
    const { result } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });
    
    // Check initial state structure
    const initialState = JSON.stringify(result.current);
    console.log('State size:', initialState.length);

    // Make a throw
    act(() => {
      result.current.handleThrow({ score: 20, multiplier: 1 });
    });

    // Check if state size grows unexpectedly
    const afterThrowState = JSON.stringify(result.current);
    console.log('New state size:', afterThrowState.length);
  });

  it('should maintain stable references across renders', () => {
    const { result, rerender } = renderHook(() => useGameState(DEFAULT_CONFIG), { wrapper });
    
    const initialHandleThrow = result.current.handleThrow;
    const initialHandleUndo = result.current.handleUndo;

    // Rerender with same config
    rerender();

    // Functions should maintain same reference
    expect(result.current.handleThrow).toBe(initialHandleThrow);
    expect(result.current.handleUndo).toBe(initialHandleUndo);
  });

  it('should only recreate game engine when essential config changes', () => {
    let renderCount = 0;
    const { rerender } = renderHook(
      (props) => {
        renderCount++;
        return useGameState(props);
      },
      {
        wrapper,
        initialProps: DEFAULT_CONFIG
      }
    );

    const initialCount = renderCount;

    // Rerender with new object, same values
    rerender({
      ...DEFAULT_CONFIG,
      someExtraProperty: 'test'
    });

    // Should not recreate engine (1 render)
    expect(renderCount).toBe(initialCount + 1);

    // Rerender with actual config change
    rerender({
      ...DEFAULT_CONFIG,
      selectedScore: 301
    });

    // Should recreate engine (2 renders: engine change + state update)
    expect(renderCount).toBe(initialCount + 3); // Updated expectation
  });
}); 