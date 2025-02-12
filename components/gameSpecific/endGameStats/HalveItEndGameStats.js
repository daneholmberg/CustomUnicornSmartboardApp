import React from 'react';
import { BaseEndGameStats } from './BaseEndGameStats';

export const HalveItEndGameStats = ({ player }) => {
  const stats = player.stats || {};

  const mainStats = [
    { value: player.score || 0, label: 'Points' },
    { value: stats.maxRoundScore || 0, label: 'Best Round' },
    { value: `${stats.hitRate || 0}%`, label: 'Hit Rate' },
  ];

  const rightStats = [
    { value: stats.totalPenalties || 0, label: 'Penalties' },
    { value: `${stats.halveRate || 0}%`, label: 'Halve %' },
    { value: stats.pointsLost || 0, label: 'Lost Pts' },
  ];

  return (
    <BaseEndGameStats 
      player={player}
      mainStats={mainStats}
      rightStats={rightStats}
    />
  );
}; 