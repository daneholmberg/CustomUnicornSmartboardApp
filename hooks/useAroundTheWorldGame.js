import { useState, useEffect } from 'react';
import useSmartboard from '../useSmartboard';

export default function useAroundTheWorldGame(initialPlayers) {
  const MAX_DARTS = 3; // Default number of darts per turn
  const aroundTheWorldTargets = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 25];
  const { connected, throws, error, mockThrow } = useSmartboard();
  const [gamePlayers, setGamePlayers] = useState(initialPlayers.map(player => ({
    ...player,
    currentIndex: 0,
    currentTarget: aroundTheWorldTargets[0],
    completed: false,
  })));
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [throwsThisTurn, setThrowsThisTurn] = useState(0);
  const [gameMessage, setGameMessage] = useState("");
  const [lastHit, setLastHit] = useState(null);

  const findNextActivePlayer = (startIndex) => {
    let nextIndex = (startIndex + 1) % gamePlayers.length;
    // Keep looking for next uncompleted player
    while (gamePlayers[nextIndex].completed && nextIndex !== startIndex) {
      nextIndex = (nextIndex + 1) % gamePlayers.length;
    }
    return nextIndex;
  };

  const nextPlayer = () => {
    setCurrentPlayerIndex(findNextActivePlayer(currentPlayerIndex));
    setThrowsThisTurn(0);
  };

  const updatePlayerState = (player, dart, newTarget, newIndex, message, completed = false) => {
    const updatedPlayer = {
      ...player,
      currentTarget: newTarget,
      currentIndex: newIndex,
      throws: [...player.throws, dart],
      completed,
    };
    const updatedPlayers = [...gamePlayers];
    updatedPlayers[currentPlayerIndex] = updatedPlayer;
    setGamePlayers(updatedPlayers);
    setGameMessage(message);
  };

  const handleThrow = (dart) => {
    setLastHit(dart); // Set the last hit
    const currentPlayer = gamePlayers[currentPlayerIndex];
    let message = `${currentPlayer.name} threw a dart. `;
    
    if (dart.score === currentPlayer.currentTarget) {
      message += `Hit ${currentPlayer.currentTarget}`;
      if (dart.multiplier > 1) {
        message += ` with a multiplier of ${dart.multiplier}!`;
      }
      
      if (currentPlayer.currentIndex + dart.multiplier < aroundTheWorldTargets.length) {
        const newIndex = currentPlayer.currentIndex + dart.multiplier;
        const newTarget = aroundTheWorldTargets[newIndex];
        updatePlayerState(currentPlayer, dart, newTarget, newIndex, message);
      } else {
        message += `${currentPlayer.name} wins!`;
        const finalIndex = aroundTheWorldTargets.length - 1;
        const finalTarget = aroundTheWorldTargets[finalIndex];
        updatePlayerState(currentPlayer, dart, finalTarget, finalIndex, message, true);
        nextPlayer();
        return;
      }
    } else {
      message += `Missed ${currentPlayer.currentTarget}. `;
      updatePlayerState(
        currentPlayer, 
        dart, 
        currentPlayer.currentTarget, 
        currentPlayer.currentIndex, 
        message
      );
    }

    // Handle turn end
    const newThrowCount = throwsThisTurn + 1;
    if (newThrowCount === MAX_DARTS) {
      nextPlayer();
    } else {
      setThrowsThisTurn(newThrowCount);
    }
  };

  useEffect(() => {
    if (throws.length > 0) {
      const lastThrow = throws[throws.length - 1];
      handleThrow(lastThrow);
    }
  }, [throws]);

  return { 
    gamePlayers, 
    currentPlayerIndex, 
    gameMessage, 
    connected, 
    error,
    throwsThisTurn,
    handleThrow,
    mockThrow,
    lastHit,
  };
} 