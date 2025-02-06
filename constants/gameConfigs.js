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
}; 