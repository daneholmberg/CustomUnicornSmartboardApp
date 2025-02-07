import { useState, useEffect, useMemo } from 'react';
import { useSmartboardContext } from '../context/SmartboardContext';
import { createGameEngine } from '../gameEngine/GameFactory';

export function useGameState(gameConfig) {
  const { connected, lastThrow, error, mockThrow } = useSmartboardContext();
  
  // Use useMemo instead of useState to recreate the game engine when gameConfig changes
  const gameEngine = useMemo(() => createGameEngine(gameConfig), [gameConfig]);
  const [gameState, setGameState] = useState(gameEngine.getGameState());

  const handleThrow = (dart) => {
    gameEngine.handleThrow(dart);
    setGameState(gameEngine.getGameState());
  };

  const handleUndo = () => {
    gameEngine.undoLastThrow();
    setGameState(gameEngine.getGameState());
  };

  useEffect(() => {
    if (lastThrow) {
      handleThrow(lastThrow);
    }
  }, [lastThrow]);

  // Reset game state when gameConfig changes
  useEffect(() => {
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  return {
    ...gameState,
    connected,
    error,
    handleThrow,
    handleUndo,
    mockThrow,
  };
}