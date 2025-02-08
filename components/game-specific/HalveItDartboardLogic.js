import React from 'react';
import { HALVE_IT_POSSIBLE_TARGETS } from '../../constants/gameConstants';

export const useHalveItHighlighting = (currentTarget) => {
  const getHighlightInfo = React.useCallback((number, multiplier) => {
    if (!currentTarget) {
      return { isHighlighted: false };
    }

    let isHighlighted = false;
    let color = '#b8f7b8';

    switch (currentTarget) {
      // Regular numbers 1-20
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
      case 11:
      case 12:
      case 13:
      case 14:
      case 15:
      case 16:
      case 17:
      case 18:
      case 19:
      case 20:
        isHighlighted = number === currentTarget;
        break;

      // Any double
      case 'double':
        isHighlighted = multiplier === 2;
        color = '#88ff88';
        break;

      // Any triple
      case 'triple':
        isHighlighted = multiplier === 3;
        color = '#ffb8b8';
        break;

      // Any bullseye
      case 25:
        isHighlighted = (number === 25 || number === 50);
        color = '#b8f7b8';
        break;

      // Outer bullseye only
      case 'outerBull':
        isHighlighted = (number === 25 || number === 50);
        color = '#b8f7b8';
        break;

      // Inner bullseye only
      case 'innerBull':
        isHighlighted = number === 50;
        color = '#88ff88';
        break;

      default:
        return { isHighlighted: false };
    }

    return { isHighlighted, color };
  }, [currentTarget]);

  return getHighlightInfo;
}; 