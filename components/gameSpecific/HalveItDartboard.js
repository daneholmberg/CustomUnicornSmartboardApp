import React from 'react';
import Dartboard from '../Dartboard';
import { useHalveItHighlighting } from './HalveItDartboardLogic';

export function HalveItDartboard({ onThrow, lastHit, currentRound, currentTarget }) {
  const getHighlightInfo = useHalveItHighlighting(currentTarget);
  
  return (
    <Dartboard
      onThrow={onThrow}
      lastHit={lastHit}
      getHighlightInfo={getHighlightInfo}
    />
  );
} 