import React from 'react';
import Dartboard from '../Dartboard';
import { useX01Highlighting } from './X01DartboardLogic';

export function X01Dartboard({ onThrow, lastHit, currentScore }) {
  const getHighlightInfo = useX01Highlighting(currentScore, lastHit);
  
  return (
    <Dartboard
      onThrow={onThrow}
      lastHit={lastHit}
      getHighlightInfo={getHighlightInfo}
    />
  );
} 