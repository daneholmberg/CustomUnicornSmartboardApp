import { GAME_MODES } from './gameModes';

export const GAME_CONFIGS = {
  [GAME_MODES.X01]: {
    name: 'X01',
    setupFields: [
      {
        type: 'select',
        name: 'selectedScore',
        label: 'Starting Score',
        options: [
          { label: '301', value: 301 },
          { label: '501', value: 501 },
        ],
      },
    ],
    initialPlayerState: (config) => ({
      score: config.selectedScore,
      throws: [],
    }),
  },
  [GAME_MODES.AROUND_THE_WORLD]: {
    name: 'Around the World',
    setupFields: [],
    initialPlayerState: () => ({
      currentTarget: 1,
      currentIndex: 0,
      completed: false,
      throws: [],
    }),
  },
  [GAME_MODES.HALVE_IT]: {
    name: 'Halve It',
    setupFields: [
      {
        type: 'select',
        name: 'roundCount',
        label: 'Number of Rounds',
        options: [
          { label: '5 Rounds', value: 5 },
          { label: '9 Rounds', value: 9 },
          { label: '13 Rounds', value: 13 },
        ],
      },
      {
        type: 'select',
        name: 'penaltyMode',
        label: 'Miss Penalty',
        options: [
          { label: 'Halve Score', value: 'half' },
          { label: 'Reduce by ⅓', value: 'third' },
        ],
      },
      {
        type: 'select',
        name: 'bullseyeMode',
        label: 'Final Round',
        options: [
          { label: 'Outer Bull (Inner Counts)', value: 'outer' },
          { label: 'Inner Bull Only', value: 'inner' },
          { label: 'Random Target', value: 'random' },
        ],
      },
    ],
    initialPlayerState: () => ({
      score: 40,
      currentRound: 1,
      throws: [],
      throwHistory: [],
    }),
  },
}; 