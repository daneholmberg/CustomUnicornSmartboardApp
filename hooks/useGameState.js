import { useState, useEffect, useRef } from 'react';
import { useSmartboardContext } from '../context/SmartboardContext';
import { createGameEngine } from '../gameEngine/GameFactory';

/**
 * Custom hook to manage dart game state
 * @param {Object} gameConfig - Configuration for the game
 * @returns {Object} Game state and control functions
 */
export function useGameState(gameConfig) {
  const { connected, lastThrow, error, mockThrow } = useSmartboardContext();
  
  // Initialize the game engine/state once.
  const [gameEngine, setGameEngine] = useState(() => createGameEngine(gameConfig));
  const [gameState, setGameState] = useState(() => gameEngine.getGameState());

  /**
   * Keep track of the old config contents (stringified).
   * Compare each time to avoid resetting on every new object reference.
   */
  const previousConfigRef = useRef(JSON.stringify(gameConfig));

  /**
   * Resets the game to initial state with the current or overridden config
   */
  const resetGame = (overrideConfig) => {
    const finalConfig = overrideConfig || gameConfig;
    const newEngine = createGameEngine(finalConfig);
    setGameEngine(newEngine);
    setGameState(newEngine.getGameState());
  };

  /**
   * Compare the contents of the new config vs. the old. 
   * Only reset if the contents really changed.
   */
  useEffect(() => {
    const newConfigString = JSON.stringify(gameConfig);
    if (previousConfigRef.current !== newConfigString) {
      previousConfigRef.current = newConfigString;
      resetGame();
    }
  }, [gameConfig]);

  /**
   * Handles a dart throw
   * @param {Object} dart - The dart throw data
   */
  const handleThrow = (dart) => {
    gameEngine.handleThrow(dart);
    setGameState(gameEngine.getGameState());
  };

  /**
   * Undoes the last throw
   */
  const handleUndo = () => {
    gameEngine.undoLastThrow();
    setGameState(gameEngine.getGameState());
  };

  // Handle incoming throws from smartboard
  useEffect(() => {
    if (lastThrow) {
      handleThrow(lastThrow);
    }
  }, [lastThrow]);

  return {
    ...gameState,
    connected,
    error,
    handleThrow,
    handleUndo,
    resetGame,
    mockThrow,
  };
}