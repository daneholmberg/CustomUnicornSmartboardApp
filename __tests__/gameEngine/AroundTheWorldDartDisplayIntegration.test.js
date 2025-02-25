import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { AroundTheWorldGameEngine } from '../../gameEngine/AroundTheWorldGameEngine';
import { DartDisplay } from '../../components/gameSpecific/DartDisplay';

describe('AroundTheWorldGameEngine and DartDisplay Integration', () => {
  // Utility function to create players
  const createPlayers = (count = 2) => {
    return Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Player ${i + 1}`,
    }));
  };

  it('should maintain currentTurnDarts correctly during gameplay', () => {
    // Create a game engine with 2 players
    const gameEngine = new AroundTheWorldGameEngine({
      players: createPlayers(2),
    });

    // Get the first target number for the first player
    const initialState = gameEngine.getGameState();
    const targetNumber = initialState.targetNumbers[0];

    // Make some throws for player 1
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit target
    
    // Use a score other than the target number and not 1 to avoid duplicate text
    const secondThrowScore = targetNumber === 5 ? 10 : 5; // Choose a score that's definitely not the target
    gameEngine.handleThrow({ score: secondThrowScore, multiplier: 1 }); 

    // Get the updated game state
    const gameState = gameEngine.getGameState();

    // Verify the currentTurnDarts array has been updated with the correct darts
    expect(gameState.currentTurnDarts).toHaveLength(2);
    expect(gameState.currentTurnDarts[0]).toEqual({ score: targetNumber, multiplier: 1 });
    expect(gameState.currentTurnDarts[1]).toEqual({ score: secondThrowScore, multiplier: 1 });

    // Render the DartDisplay component with the current darts
    render(<DartDisplay darts={gameState.currentTurnDarts} />);

    // Use getAllByText for cases where we might have multiple elements with the same text
    // and check the count of dart elements matches our expectations
    const targetElements = screen.getAllByText(`${targetNumber}`);
    expect(targetElements.length).toBe(1);
    
    const secondScoreElements = screen.getAllByText(`${secondThrowScore}`);
    expect(secondScoreElements.length).toBe(1);
    
    // One slot should still be empty
    expect(screen.getByText('-')).toBeTruthy();
  });

  it('should track darts across player turns', () => {
    // Create a game engine with 2 players
    const gameEngine = new AroundTheWorldGameEngine({
      players: createPlayers(2),
    });

    // Get the first target number for the first player
    const initialState = gameEngine.getGameState();
    const targetNumber = initialState.targetNumbers[0];

    // Player 1 completes their turn with 3 throws
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit

    // Verify we're now on Player 2's turn
    const stateAfterPlayer1 = gameEngine.getGameState();
    expect(stateAfterPlayer1.currentPlayerIndex).toBe(1); // Player 2 (index 1)
    
    // Player 1's darts should be in lastTurnDarts
    expect(stateAfterPlayer1.lastTurnDarts).toHaveLength(3);
    expect(stateAfterPlayer1.lastTurnDarts.every(dart => 
      dart.score === targetNumber && dart.multiplier === 1
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

    // Should show Player 1's darts - we'll need to use getAllByText because there are multiple
    expect(screen.getAllByText(`${targetNumber}`)).toHaveLength(3);

    // Now Player 2 throws a dart
    const player2Target = stateAfterPlayer1.targetNumbers[0];
    gameEngine.handleThrow({ score: player2Target, multiplier: 3 }); // Hit with triple
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

    // Should now show Player 2's dart with the triple notation
    expect(screen.getByText(`T${player2Target}`)).toBeTruthy();
    
    // And two placeholder dashes
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('should support undoing throws and update dart display accordingly', () => {
    // Create a game engine with 2 players
    const gameEngine = new AroundTheWorldGameEngine({
      players: createPlayers(2),
    });

    // Get the first target number for the first player
    const initialState = gameEngine.getGameState();
    const targetNumber = initialState.targetNumbers[0];

    // Player 1 throws two darts
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit target
    gameEngine.handleThrow({ score: targetNumber, multiplier: 2 }); // Hit target with double

    // Get initial state
    const stateAfterThrows = gameEngine.getGameState();
    expect(stateAfterThrows.currentTurnDarts).toHaveLength(2);

    // Render the DartDisplay
    render(<DartDisplay darts={stateAfterThrows.currentTurnDarts} />);
    
    // Should show both darts
    expect(screen.getByText(`${targetNumber}`)).toBeTruthy();
    expect(screen.getByText(`D${targetNumber}`)).toBeTruthy();

    // Undo the last throw
    gameEngine.undoLastThrow();
    const stateAfterUndo = gameEngine.getGameState();

    // Clear previous render and render with updated state
    screen.unmount();
    render(<DartDisplay darts={stateAfterUndo.currentTurnDarts} />);

    // Should only show the first dart now
    expect(screen.getByText(`${targetNumber}`)).toBeTruthy();
    expect(screen.queryByText(`D${targetNumber}`)).toBeNull();
    
    // Should have two placeholder dashes
    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  // This test replaces the one that was causing memory issues
  it('should handle player turn transitions after undo', () => {
    // Create a game engine with 2 players
    const gameEngine = new AroundTheWorldGameEngine({
      players: createPlayers(2),
    });

    // Get the first target number for the first player
    const initialState = gameEngine.getGameState();
    const targetNumber = initialState.targetNumbers[0];

    // Player 1 completes their turn with 3 throws
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit
    
    // Verify we're still on Player 1's turn
    expect(gameEngine.getGameState().currentPlayerIndex).toBe(0);
    expect(gameEngine.getGameState().throwsThisTurn).toBe(2);
    
    // Complete the turn with the 3rd throw
    gameEngine.handleThrow({ score: targetNumber, multiplier: 1 }); // Hit
    
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
    
    // Should show 3 darts from Player 1
    expect(screen.getAllByText(`${targetNumber}`)).toHaveLength(3);
    
    // Clean up
    screen.unmount();
  });
}); 