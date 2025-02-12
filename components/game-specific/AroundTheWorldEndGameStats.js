import React from 'react';
import { BaseEndGameStats } from './BaseEndGameStats';

export const AroundTheWorldEndGameStats = ({ player }) => {
  const stats = player.stats || {};

  const mainStats = [
    { value: stats.hitRate || 0, label: 'Hit Rate' },
    { value: stats.maxStreak || 0, label: 'Best Streak' },
    { value: stats.averageDartsPerNumber?.toFixed(1) || 0, label: 'Avg Darts' },
  ];

  const rightStats = [
    { value: stats.firstDartHitRate || 0, label: '1st %' },
    { value: stats.perfectTurns || 0, label: 'Perfect' },
    { value: stats.doubleHits || 0, label: 'DBL' },
    { value: stats.tripleHits || 0, label: 'TRP' },
  ];

  return (
    <BaseEndGameStats 
      player={player}
      mainStats={mainStats}
      rightStats={rightStats}
    />
  );
}; 