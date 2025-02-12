import React from 'react';
import { AROUND_THE_WORLD_TARGETS } from '../../constants/gameConstants';

export const useAroundTheWorldHighlighting = (currentTarget) => {
  const getHighlightInfo = React.useCallback((number, multiplier) => {
    // If no target or invalid target, no highlighting
    if (!currentTarget) {
      return { isHighlighted: false };
    }

    // For bullseye (target 25), highlight both inner and outer bull
    if (currentTarget === 25 && (number === 25 || number === 50)) {
      return {
        isHighlighted: true,
        color: multiplier === 2 ? '#88ff88' : '#b8f7b8'
      };
    }

    // For regular numbers, highlight with different colors based on multiplier
    if (number === currentTarget) {
      let color;
      if (multiplier === 3) color = '#ffb8b8';
      else if (multiplier === 2) color = '#88ff88';
      else color = '#b8f7b8';

      return {
        isHighlighted: true,
        color
      };
    }

    return { isHighlighted: false };
  }, [currentTarget]);

  return getHighlightInfo;
}; 