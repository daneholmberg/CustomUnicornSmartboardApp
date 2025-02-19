import { X01GameEngine } from '../../gameEngine/X01GameEngine';

describe('X01GameEngine', () => {
  let gameEngine;
  const mockPlayer = {
    id: 1,
    name: 'Test Player',
    score: 301,
    stats: {},
  };

  const mockPlayers = [
    { id: 1, name: 'Player 1', score: 301, stats: {} },
    { id: 2, name: 'Player 2', score: 301, stats: {} },
  ];

  describe('Game Initialization', () => {
    it('should initialize with valid X01 scores', () => {
      const scores = [301, 501];
      scores.forEach(score => {
        const engine = new X01GameEngine({
          players: [{ ...mockPlayer, score }],
          selectedScore: score,
        });
        expect(engine.turnManager.getCurrentPlayer().score).toBe(score);
      });
    });

    it('should initialize with multiple players', () => {
      const engine = new X01GameEngine({
        players: mockPlayers,
        selectedScore: 301,
      });
      expect(engine.turnManager.players.length).toBe(2);
      expect(engine.turnManager.currentPlayerIndex).toBe(0);
    });
  });

  describe('Score Handling', () => {
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: [mockPlayer],
        selectedScore: 301,
      });
    });

    it('should handle single number scoring', () => {
      const dart = { score: 20, multiplier: 1 };
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(281);
    });

    it('should handle double scoring', () => {
      const dart = { score: 20, multiplier: 2 };
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(261);
    });

    it('should handle triple scoring', () => {
      const dart = { score: 20, multiplier: 3 };
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(241);
    });

    it('should handle bull (25) and double bull (50)', () => {
      const bull = { score: 25, multiplier: 1 };
      const doubleBull = { score: 25, multiplier: 2 };
      
      gameEngine.handleThrow(bull);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(276);
      
      gameEngine.handleThrow(doubleBull);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(226);
    });

    it('should track turn total correctly', () => {
      const darts = [
        { score: 20, multiplier: 3 }, // 60
        { score: 19, multiplier: 3 }, // 57
        { score: 18, multiplier: 1 }, // 18
      ];

      const expectedScores = [60, 117, 135]; // Expected running totals after each throw
      
      darts.forEach((dart, index) => {
        gameEngine.handleThrow(dart);
        
        if (index === 2) {
          // For the last throw, check the previousTurnScore since the turn will have ended
          expect(gameEngine.turnManager.previousTurnScore).toBe(expectedScores[index]);
        } else {
          expect(gameEngine.turnManager.currentTurnScore).toBe(expectedScores[index]);
        }
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(301 - expectedScores[index]);
      });
    });
  });

  describe('Turn Management', () => {
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: mockPlayers,
        selectedScore: 301,
      });
    });

    it('should progress through 3 darts per turn', () => {
      const dart = { score: 20, multiplier: 1 };
      
      gameEngine.handleThrow(dart); // First dart
      expect(gameEngine.turnManager.throwsThisTurn).toBe(1);
      
      gameEngine.handleThrow(dart); // Second dart
      expect(gameEngine.turnManager.throwsThisTurn).toBe(2);
      
      gameEngine.handleThrow(dart); // Third dart
      expect(gameEngine.turnManager.throwsThisTurn).toBe(0); // Reset for next player
    });

    it('should switch players after 3 darts', () => {
      const dart = { score: 20, multiplier: 1 };
      
      // Throw 3 darts
      for (let i = 0; i < 3; i++) {
        gameEngine.handleThrow(dart);
      }
      
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(1);
      expect(gameEngine.turnManager.getCurrentPlayer().id).toBe(2);
    });

    it('should rotate through all players', () => {
      const dart = { score: 20, multiplier: 1 };
      
      // Complete first player's turn
      for (let i = 0; i < 3; i++) {
        gameEngine.handleThrow(dart);
      }
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(1);
      
      // Complete second player's turn
      for (let i = 0; i < 3; i++) {
        gameEngine.handleThrow(dart);
      }
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(0);
    });
  });

  describe('Game End Conditions', () => {
    beforeEach(() => {
      // Start with 301
      gameEngine = new X01GameEngine({
        players: [mockPlayer],
        selectedScore: 301,
      });
      
      // Throw darts to get to 40
      const dartsToGet40 = [
        { score: 20, multiplier: 3 }, // 60
        { score: 20, multiplier: 2 }, // 60
        { score: 20, multiplier: 1 }, // 57
        { score: 19, multiplier: 3 }, // 57
        { score: 20, multiplier: 3 }, // 60
        { score: 12, multiplier: 2 }, // 14
      ];
      
      dartsToGet40.forEach(dart => {
        if (gameEngine.turnManager.getCurrentPlayer().score > 40) {
          gameEngine.handleThrow(dart);
        }
      });
    });

    it('should handle winning with exact score', () => {
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
      const dart = { score: 20, multiplier: 2 }; // Double 20
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(0);
      expect(gameEngine.turnManager.getCurrentPlayer().completed).toBe(true);
      expect(gameEngine.turnManager.isGameOver()).toBe(true);
    });

    it('should prevent score going below zero', () => {
      // Get to score 20 first
      gameEngine.handleThrow({ score: 20, multiplier: 1 }); // Now at 20
      
      const dart = { score: 20, multiplier: 2 }; // Score of 40
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40); // Should reset to original score
    });
  });

  describe('Bust Scenarios', () => {
    beforeEach(() => {
      // Start with 301
      gameEngine = new X01GameEngine({
        players: [mockPlayer],
        selectedScore: 301,
      });
      
      // Throw darts to get to 40
      const dartsToGet40 = [
        { score: 20, multiplier: 3 }, // 60
        { score: 20, multiplier: 3 }, // 60
        { score: 19, multiplier: 3 }, // 57
        { score: 12, multiplier: 1 }, // 12
        { score: 20, multiplier: 3 }, // 60
        { score: 12, multiplier: 1 }, // 12
        
      ];
      
      dartsToGet40.forEach(dart => {
        gameEngine.handleThrow(dart);
      });
    });

    it('should bust when score would go below zero', () => {
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
      const dart = { score: 20, multiplier: 3 }; // 60 points
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40); // Original score
      expect(gameEngine.turnManager.currentTurnScore).toBe(0); // Reset turn score
    });

    it('should reset turn score after bust', () => {
      expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
      const darts = [
        { score: 20, multiplier: 1 }, // 20 points
        { score: 20, multiplier: 2 }, // 40 points - should bust
      ];

      darts.forEach(dart => gameEngine.handleThrow(dart));
      expect(gameEngine.turnManager.currentTurnScore).toBe(0);
    });

    it('should switch to next player after bust in multiplayer game', () => {
      gameEngine = new X01GameEngine({
        players: mockPlayers,
        selectedScore: 301,
      });

      const dart = { score: 20, multiplier: 3 }; // 60 points
      for (let i = 0; i < 3; i++) {
        gameEngine.handleThrow(dart);
      }
      
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(1);
    });
  });

  describe('handleThrow', () => {
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: [mockPlayer],
        selectedScore: 301,
      });
    });
    it('should subtract score when dart hits a number', () => {
      const dart = {
        score: 20,
        multiplier: 1,
      };
      console.log(gameEngine.turnManager.throwsThisTurn);

      gameEngine.handleThrow(dart);
      
      const currentPlayer = gameEngine.turnManager.getCurrentPlayer();
      expect(currentPlayer.score).toBe(281); // 301 - 20
    });

    it('should move to next dart for the same player after second throw. We threw 1 dart in the setup', () => {
      const dart = {
        score: 20,
        multiplier: 1,
      };
      console.log(gameEngine.turnManager.throwsThisTurn);
      gameEngine.handleThrow(dart);
      console.log(gameEngine.turnManager.throwsThisTurn);
      
      expect(gameEngine.turnManager.throwsThisTurn).toBe(1);
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(0); // Same player
    });

    it('should handle triple hits correctly', () => {
      const dart = {
        score: 20,
        multiplier: 3,
      };

      gameEngine.handleThrow(dart);
      
      const currentPlayer = gameEngine.turnManager.getCurrentPlayer();
      expect(currentPlayer.score).toBe(241); // 301 - (20 * 3)
    });

    it('should track turn score correctly', () => {
      const dart1 = {
        score: 20,
        multiplier: 1,
      };
      const dart2 = {
        score: 19,
        multiplier: 1,
      };

      gameEngine.handleThrow(dart1);
      gameEngine.handleThrow(dart2);
      
      expect(gameEngine.turnManager.currentTurnScore).toBe(39);
    });
  });
}); 