export const GAME_CONSTANTS = {
  MAX_DARTS_PER_TURN: 3,
  HIGHLIGHT_DURATION_MS: 5000,
};

export const AROUND_THE_WORLD_TARGETS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  25  // bullseye
];

export const HALVE_IT_POSSIBLE_TARGETS = [
  // Singles 1-20
  { target: 1, label: '1s', description: 'Hit any 1' },
  { target: 2, label: '2s', description: 'Hit any 2' },
  { target: 3, label: '3s', description: 'Hit any 3' },
  { target: 4, label: '4s', description: 'Hit any 4' },
  { target: 5, label: '5s', description: 'Hit any 5' },
  { target: 6, label: '6s', description: 'Hit any 6' },
  { target: 7, label: '7s', description: 'Hit any 7' },
  { target: 8, label: '8s', description: 'Hit any 8' },
  { target: 9, label: '9s', description: 'Hit any 9' },
  { target: 10, label: '10s', description: 'Hit any 10' },
  { target: 11, label: '11s', description: 'Hit any 11' },
  { target: 12, label: '12s', description: 'Hit any 12' },
  { target: 13, label: '13s', description: 'Hit any 13' },
  { target: 14, label: '14s', description: 'Hit any 14' },
  { target: 15, label: '15s', description: 'Hit any 15' },
  { target: 16, label: '16s', description: 'Hit any 16' },
  { target: 17, label: '17s', description: 'Hit any 17' },
  { target: 18, label: '18s', description: 'Hit any 18' },
  { target: 19, label: '19s', description: 'Hit any 19' },
  { target: 20, label: '20s', description: 'Hit any 20' },
  
  // Doubles and Triples
  { target: 'double', label: 'Doubles', description: 'Hit any double' },
  { target: 'triple', label: 'Triples', description: 'Hit any triple' },
  
  // Bullseye variations
  { target: 25, label: 'Bull', description: 'Hit any bullseye (outer or inner)' },
  { target: 'outerBull', label: 'Outer Bull', description: 'Hit outer bullseye (inner counts as double)' },
  { target: 'innerBull', label: 'Inner Bull', description: 'Hit inner bullseye only' }
]; 