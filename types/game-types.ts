/**
 * Player object representing a dart game participant
 */
export interface Player {
  id: string;
  name: string;
  score?: number;
  completed?: boolean;
  place?: number;
  stats?: PlayerStats;
}

/**
 * Game configuration object
 */
export interface GameConfig {
  mode: string;
  players: Player[];
  selectedScore?: number;
  options?: GameOptions;
}

/**
 * State of a turn in the game
 */
export interface TurnState {
  currentPlayerIndex: number;
  throwsThisTurn: number;
  players: Player[];
}

/**
 * X01-specific turn state
 */
export interface X01TurnState extends TurnState {
  currentTurnScore: number;
  startOfTurnScore: number;
}

/**
 * Dart throw data
 */
export interface DartThrow {
  score: number;
  multiplier: number;
  sector?: number;
}

/**
 * Player statistics
 */
export interface PlayerStats {
  attempts?: number;
  hits?: number;
  hitRate?: number;
  totalScore?: number;
  rounds?: number;
  averagePerRound?: number;
}

/**
 * Game options configuration
 */
export interface GameOptions {
  doubleIn?: boolean;
  doubleOut?: boolean;
  straightIn?: boolean;
  straightOut?: boolean;
  customRules?: Record<string, unknown>;
} 