import { useState, useEffect } from 'react';
import { useSmartboardContext } from '../context/SmartboardContext';
import { createGameEngine } from '../gameEngine/GameFactory';

export function useGameState(gameConfig) {
  const { connected, lastThrow, error, mockThrow } = useSmartboardContext();
  const [gameEngine] = useState(() => createGameEngine(gameConfig));
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

  return {
    ...gameState,
    connected,
    error,
    handleThrow,
    handleUndo,
    mockThrow,
  };
}