import React from 'react';
import { BaseEndGameStats } from './BaseEndGameStats';

/**
 * Displays end-game statistics for an X01 game.
 * Add or remove stats based on what your X01GameEngine provides.
 */
export const X01EndGameStats = ({ player }) => {
  const stats = player.stats || {};

  const mainStats = [
    { value: stats.averagePerRound || 0, label: 'Average' },
    { value: stats.highestRound || 0, label: 'Highest' },
    { value: stats.first9DartAvg || 0, label: 'First 9' },
  ];

  const rightStats = [
    { value: stats.rounds50Plus || 0, label: '50+' },
    { value: stats.rounds75Plus || 0, label: '75+' },
    { value: stats.rounds100Plus || 0, label: '100+' },
    { value: stats.rounds120Plus || 0, label: '120+' },
  ];

  return (
    <BaseEndGameStats 
      player={player}
      mainStats={mainStats}
      rightStats={rightStats}
    />
  );
}; 