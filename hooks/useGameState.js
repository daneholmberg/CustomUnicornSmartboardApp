import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSmartboardContext } from '../context/SmartboardContext';
import { createGameEngine } from '../gameEngine/GameFactory';
import { getEssentialGameConfig, getEssentialConfigDeps } from '../utils/gameConfig';

export function useGameState(gameConfig) {
  const { connected, lastThrow, error, mockThrow } = useSmartboardContext();
  
  // Extract only essential config properties for memoization
  const essentialConfig = useMemo(
    () => getEssentialGameConfig(gameConfig),
    getEssentialConfigDeps(gameConfig)
  );
  
  // Use essentialConfig for game engine creation, but preserve all original config
  const gameEngine = useMemo(() => createGameEngine({
    ...gameConfig, // Keep all config for potential future use
    ...essentialConfig // Override with essential values
  }), [essentialConfig]);

  const [gameState, setGameState] = useState(gameEngine.getGameState());

  const handleThrow = useCallback((dart) => {
    gameEngine.handleThrow(dart);
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  const handleUndo = useCallback(() => {
    gameEngine.undoLastThrow();
    setGameState(gameEngine.getGameState());
  }, [gameEngine]);

  useEffect(() => {
    if (lastThrow) {
      handleThrow(lastThrow);
    }
  }, [lastThrow, handleThrow]);

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