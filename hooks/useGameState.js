import { useState, useEffect } from 'react';
import useSmartboard from '../useSmartboard';
import { createGameEngine } from '../gameEngine/GameFactory';

export function useGameState(gameConfig) {
  const { connected, throws, error, mockThrow } = useSmartboard();
  const [gameEngine] = useState(() => createGameEngine(gameConfig));
  const [gameState, setGameState] = useState(gameEngine.getGameState());

  const handleThrow = (dart) => {
    gameEngine.handleThrow(dart);
    setGameState(gameEngine.getGameState());
  };

  useEffect(() => {
    if (throws.length > 0) {
      const lastThrow = throws[throws.length - 1];
      handleThrow(lastThrow);
    }
  }, [throws]);

  return {
    ...gameState,
    connected,
    error,
    handleThrow,
    mockThrow,
  };
}