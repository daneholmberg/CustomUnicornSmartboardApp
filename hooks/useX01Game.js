import { useState, useEffect } from 'react';
import useSmartboard from '../useSmartboard';

export default function useX01Game(initialPlayers) {
  const MAX_DARTS = 3; // Default number of darts per turn
  const { connected, throws, error } = useSmartboard();
  const [gamePlayers, setGamePlayers] = useState(initialPlayers);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [throwsThisTurn, setThrowsThisTurn] = useState(0);
  const [currentTurnScore, setCurrentTurnScore] = useState(0);
  const [gameMessage, setGameMessage] = useState("");

  const handleThrow = (dart) => {
    const currentPlayer = gamePlayers[currentPlayerIndex];
    const throwValue = dart.score * dart.multiplier;
    let message = `${currentPlayer.name} scored ${throwValue}. `;
    let newScore = currentPlayer.score;
    let shouldChangeTurn = false;

    // Check if this throw would bust
    // if (throwValue > currentPlayer.score || 
    //     (currentPlayer.score - throwValue === 1) || 
    //     (currentPlayer.score - throwValue === 0 && dart.multiplier !== 2)) {
    if (throwValue > currentPlayer.score) {
      message += "Bust! Turn ends.";
      shouldChangeTurn = true;
      newScore = currentPlayer.score - currentTurnScore; // Revert to score at start of turn
    } else {
      newScore = currentPlayer.score - throwValue;
      setCurrentTurnScore(prev => prev + throwValue);
      message += `Score: ${newScore}`;

      if (newScore === 0) {
        message += ` ${currentPlayer.name} wins!`;
        shouldChangeTurn = true;
      }
    }

    // Update player's score and throws
    const updatedPlayer = {
      ...currentPlayer,
      score: newScore,
      throws: [...currentPlayer.throws, dart],
    };
    const updatedPlayers = [...gamePlayers];
    updatedPlayers[currentPlayerIndex] = updatedPlayer;
    setGamePlayers(updatedPlayers);

    const newThrowCount = throwsThisTurn + 1;
    // End turn if a bust/win occurs or if MAX_DARTS are reached
    if (shouldChangeTurn || newThrowCount === MAX_DARTS) {
      setCurrentPlayerIndex((prev) => (prev + 1) % gamePlayers.length);
      setThrowsThisTurn(0);
      setCurrentTurnScore(0);
    } else {
      setThrowsThisTurn(newThrowCount);
    }

    setGameMessage(message);
  };

  // Handle throws from smartboard
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
    handleThrow, // Expose this for the dartboard component
  };
} 