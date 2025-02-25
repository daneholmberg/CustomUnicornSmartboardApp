import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { X01GameEngine } from '../../gameEngine/X01GameEngine';
import { DartDisplay } from '../../components/gameSpecific/DartDisplay';

describe('X01GameEngine and DartDisplay Integration', () => {
  // Utility function to create players
  const createPlayers = (count = 2) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
    }));
  };

  it('should maintain currentTurnDarts correctly during gameplay', () => {
    // Create a game engine with 2 players
    const gameEngine = new X01GameEngine({
      players: createPlayers(2),
      selectedScore: 301,
    });

    // Make some throws for player 1
    gameEngine.handleThrow({ score: 20, multiplier: 3 }); // Triple 20
    gameEngine.handleThrow({ score: 20, multiplier: 1 }); // Single 20

    // Get the updated game state
    const gameState = gameEngine.getGameState();

    // Verify the currentTurnDarts array has been updated with the correct darts
    expect(gameState.currentTurnDarts).toHaveLength(2);
    expect(gameState.currentTurnDarts[0]).toEqual({ score: 20, multiplier: 3 });
    expect(gameState.currentTurnDarts[1]).toEqual({ score: 20, multiplier: 1 });

    // Render the DartDisplay component with the current darts
    render(<DartDisplay darts={gameState.currentTurnDarts} />);

    // Verify the display shows the correct dart values
    expect(screen.getByText('T20')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('-')).toBeTruthy(); // One slot should still be empty
  });

  it('should track darts across player turns', () => {
    // Create a game engine with 2 players
    const gameEngine = new X01GameEngine({
      players: createPlayers(2),
      selectedScore: 301,
    });

    // Player 1 completes their turn
    gameEngine.handleThrow({ score: 20, multiplier: 3 }); // Triple 20
    gameEngine.handleThrow({ score: 20, multiplier: 3 }); // Triple 20
    gameEngine.handleThrow({ score: 20, multiplier: 3 }); // Triple 20

    // Verify we're now on Player 2's turn
    const stateAfterPlayer1 = gameEngine.getGameState();
    expect(stateAfterPlayer1.currentPlayerIndex).toBe(1); // Player 2 (index 1)
    
    // Player 1's darts should be in lastTurnDarts
    expect(stateAfterPlayer1.lastTurnDarts).toHaveLength(3);
    expect(stateAfterPlayer1.lastTurnDarts.every(dart => 
      dart.score === 20 && dart.multiplier === 3
    )).toBe(true);
    
    // Player 2's currentTurnDarts should be empty
    expect(stateAfterPlayer1.currentTurnDarts).toHaveLength(0);

    // Render the DartDisplay to check Player 1's darts are shown
    render(
      <DartDisplay 
        darts={stateAfterPlayer1.currentTurnDarts} 
        lastTurnDarts={stateAfterPlayer1.lastTurnDarts}
        lastTurnTimestamp={stateAfterPlayer1.lastTurnTimestamp} 
      />
    );

    // Should show Player 1's darts
    expect(screen.getAllByText('T20')).toHaveLength(3);

    // Now Player 2 throws a dart
    gameEngine.handleThrow({ score: 19, multiplier: 3 }); // Triple 19
    const stateAfterPlayer2FirstThrow = gameEngine.getGameState();

    // Clear previous render and render with updated state
    screen.unmount();
    render(
      <DartDisplay 
        darts={stateAfterPlayer2FirstThrow.currentTurnDarts}
        lastTurnDarts={stateAfterPlayer2FirstThrow.lastTurnDarts}
        lastTurnTimestamp={stateAfterPlayer2FirstThrow.lastTurnTimestamp}
      />
    );

    // Should now show Player 2's dart
    expect(screen.getByText('T19')).toBeTruthy();
    
    // And two placeholder dashes
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('should support undoing throws and update dart display accordingly', () => {
    // Create a game engine with 2 players
    const gameEngine = new X01GameEngine({
      players: createPlayers(2),
      selectedScore: 301,
    });

    // Player 1 throws two darts
    gameEngine.handleThrow({ score: 20, multiplier: 3 }); // Triple 20
    gameEngine.handleThrow({ score: 19, multiplier: 3 }); // Triple 19

    // Get initial state
    const initialState = gameEngine.getGameState();
    expect(initialState.currentTurnDarts).toHaveLength(2);

    // Render the DartDisplay
    render(<DartDisplay darts={initialState.currentTurnDarts} />);
    
    // Should show both darts
    expect(screen.getByText('T20')).toBeTruthy();
    expect(screen.getByText('T19')).toBeTruthy();

    // Undo the last throw
    gameEngine.undoLastThrow();
    const stateAfterUndo = gameEngine.getGameState();

    // Clear previous render and render with updated state
    screen.unmount();
    render(<DartDisplay darts={stateAfterUndo.currentTurnDarts} />);

    // Should only show the first dart now
    expect(screen.getByText('T20')).toBeTruthy();
    expect(screen.queryByText('T19')).toBeNull();
    
    // Should have two placeholder dashes
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('should handle player turn transitions correctly', () => {
    // Create a game engine with 2 players
    const gameEngine = new X01GameEngine({
      players: createPlayers(2),
      selectedScore: 301,
    });

    // Player 1 completes their turn with 3 throws
    gameEngine.handleThrow({ score: 20, multiplier: 1 }); // Single 20
    gameEngine.handleThrow({ score: 19, multiplier: 1 }); // Single 19
    
    // Verify we're still on Player 1's turn
    expect(gameEngine.getGameState().currentPlayerIndex).toBe(0);
    expect(gameEngine.getGameState().throwsThisTurn).toBe(2);
    
    // Complete the turn with the 3rd throw
    gameEngine.handleThrow({ score: 18, multiplier: 1 }); // Single 18
    
    // Verify we're now on Player 2's turn
    const stateAfterPlayer1 = gameEngine.getGameState();
    expect(stateAfterPlayer1.currentPlayerIndex).toBe(1); // Player 2 (index 1)
    expect(stateAfterPlayer1.throwsThisTurn).toBe(0);
    
    // Now verify the dart display shows player 1's darts initially
    render(
      <DartDisplay 
        darts={stateAfterPlayer1.currentTurnDarts}
        lastTurnDarts={stateAfterPlayer1.lastTurnDarts}
        lastTurnTimestamp={stateAfterPlayer1.lastTurnTimestamp}
      />
    );
    
    // Should show all 3 darts from Player 1's turn
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('19')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    
    // Clean up
    screen.unmount();
  });

  // New test to specifically verify we can undo back to a previous player's turn
  it('should be able to undo back to previous player', () => {
    // Create a game engine with 2 players
    const gameEngine = new X01GameEngine({
      players: createPlayers(2),
      selectedScore: 301,
    });

    // Player 1 throws two darts (not completing their turn)
    gameEngine.handleThrow({ score: 20, multiplier: 1 }); // Single 20
    gameEngine.handleThrow({ score: 19, multiplier: 1 }); // Single 19
    
    // Verify Player 1 has thrown 2 darts
    const stateAfterTwoDarts = gameEngine.getGameState();
    expect(stateAfterTwoDarts.currentPlayerIndex).toBe(0);
    expect(stateAfterTwoDarts.throwsThisTurn).toBe(2);
    
    // Now complete the turn with third dart
    gameEngine.handleThrow({ score: 18, multiplier: 1 }); // Single 18
    
    // Verify we've moved to Player 2's turn
    const stateAfterPlayer1 = gameEngine.getGameState();
    expect(stateAfterPlayer1.currentPlayerIndex).toBe(1); // Player 2 (index 1)
    expect(stateAfterPlayer1.throwsThisTurn).toBe(0);
    
    // Calculate Player 1's score after their turn (for later verification)
    const player1ScoreAfterTurn = 301 - (20 + 19 + 18);
    
    // Player 2 throws one dart
    gameEngine.handleThrow({ score: 20, multiplier: 3 }); // Triple 20
    
    // Verify Player 2 has thrown one dart
    const stateAfterPlayer2FirstThrow = gameEngine.getGameState();
    expect(stateAfterPlayer2FirstThrow.currentPlayerIndex).toBe(1);
    expect(stateAfterPlayer2FirstThrow.throwsThisTurn).toBe(1);
    
    // Now undo Player 2's first throw - this should go back to Player 1's completed turn
    gameEngine.undoLastThrow();
    
    // Check that we've reverted to Player 1
    const stateAfterUndo = gameEngine.getGameState();
    expect(stateAfterUndo.currentPlayerIndex).toBe(0); // Back to Player 1
    expect(stateAfterUndo.throwsThisTurn).toBe(3); // At the end of Player 1's turn with all 3 darts
    
    // Verify Player 1's score is correct
    expect(stateAfterUndo.players[0].score).toBe(player1ScoreAfterTurn);
    
    // Verify the dart display now shows Player 1's last turn darts
    render(<DartDisplay darts={stateAfterUndo.currentTurnDarts} />);
    
    // Should show all 3 darts from Player 1
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('19')).toBeTruthy();
    expect(screen.getByText('18')).toBeTruthy();
    
    // Undo one more time
    gameEngine.undoLastThrow();
    
    // Now we should be at Player 1's turn with only 2 darts thrown
    const stateAfterSecondUndo = gameEngine.getGameState();
    expect(stateAfterSecondUndo.currentPlayerIndex).toBe(0); // Still Player 1
    expect(stateAfterSecondUndo.throwsThisTurn).toBe(2); // Now with only 2 darts thrown
    
    // Verify the dart display now shows only 2 darts
    screen.unmount();
    render(<DartDisplay darts={stateAfterSecondUndo.currentTurnDarts} />);
    
    // Should show only the first 2 darts from Player 1
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('19')).toBeTruthy();
    expect(screen.queryByText('18')).toBeNull();
    
    // Should have one empty slot
    expect(screen.getByText('-')).toBeTruthy();
    
    screen.unmount();
  });
}); 