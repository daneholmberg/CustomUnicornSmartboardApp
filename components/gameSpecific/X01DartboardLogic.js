import React from 'react';

// Pre-calculate all possible winning combinations for scores up to 60
export const calculateAllWinningCombinations = () => {
  const combinations = new Map();
  
  // Calculate for scores 1 to 60
  for (let score = 1; score <= 60; score++) {
    const targets = [];
    
    // Check singles (any number that equals the score)
    if (score <= 20) {
      targets.push({
        number: score,
        multiplier: 1
      });
    }
    
    // Check doubles
    if (score <= 40 && score % 2 === 0) {
      targets.push({
        number: score / 2,
        multiplier: 2
      });
    }
    
    // Check triples
    if (score <= 60) {
      const possibleTriple = score / 3;
      if (Number.isInteger(possibleTriple) && possibleTriple <= 20) {
        targets.push({
          number: possibleTriple,
          multiplier: 3
        });
      }
    }
    
    if (targets.length > 0) {
      combinations.set(score, targets);
    }
  }
  
  return combinations;
};

// Create a hook for X01 dartboard highlighting
export const useX01Highlighting = (score) => {
  const [winningCombinations] = React.useState(() => calculateAllWinningCombinations());
  
  const getHighlightInfo = React.useCallback((number, multiplier) => {
    // If no score or over 60, no winning combinations possible
    if (!score || score > 60) {
      return { isHighlighted: false };
    }

    const possibleWins = winningCombinations.get(score) || [];
    const isWinningCombination = possibleWins.some(
      win => win.number === number && win.multiplier === multiplier
    );

    return {
      isHighlighted: isWinningCombination,
      color: isWinningCombination ? '#ff69b4' : undefined
    };
  }, [score, winningCombinations]);

  return getHighlightInfo;
}; 