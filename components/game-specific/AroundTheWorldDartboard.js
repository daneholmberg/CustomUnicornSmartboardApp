import React from 'react';
import Dartboard from '../Dartboard';
import { useAroundTheWorldHighlighting } from './AroundTheWorldDartboardLogic';

export function AroundTheWorldDartboard({ onThrow, lastHit, currentTarget }) {
  const getHighlightInfo = useAroundTheWorldHighlighting(currentTarget);
  
  return (
    <Dartboard
      onThrow={onThrow}
      lastHit={lastHit}
      getHighlightInfo={getHighlightInfo}
    />
  );
} 