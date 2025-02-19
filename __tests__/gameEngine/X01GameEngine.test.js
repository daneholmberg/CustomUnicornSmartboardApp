import { X01GameEngine } from '../../gameEngine/X01GameEngine';

describe('X01GameEngine', () => {
  let gameEngine;
  
  // Common test data
  const createMockPlayer = (id = 1, name = 'Test Player', score = 301) => ({
    id,
    name,
    score,
    stats: {},
  });

  const throwDartsToScore = (engine, targetScore) => {
    // First, get close to but not under the target score using triples
    while (engine.turnManager.getCurrentPlayer().score > targetScore + 60) {
      engine.handleThrow({ score: 20, multiplier: 3 }); // 60 points per throw
    }
    
    // If we're not at the start of a turn, throw zeros to complete it
    while (engine.turnManager.throwsThisTurn > 0) {
      engine.handleThrow({ score: 0, multiplier: 1 }); // Use 0 instead of 1 to not affect score
    }
    
    // Now we're at the start of a fresh turn
    // Calculate exact points needed to reach target
    const currentScore = engine.turnManager.getCurrentPlayer().score;
    const remainingPoints = currentScore - targetScore;
    
    if (remainingPoints > 0) {
      // Throw exactly what we need to reach the target score
      engine.handleThrow({ score: remainingPoints, multiplier: 1 });
      
      // Complete this turn with zeros
      while (engine.turnManager.throwsThisTurn > 0) {
        engine.handleThrow({ score: 0, multiplier: 1 }); // Use 0 instead of 1 to not affect score
      }
    }
  };

  describe('Initialization', () => {
    describe('with valid configurations', () => {
      it('should initialize with 301', () => {
        const engine = new X01GameEngine({
          players: [createMockPlayer()],
          selectedScore: 301,
        });
        expect(engine.turnManager.getCurrentPlayer().score).toBe(301);
      });

      it('should initialize with 501', () => {
        const engine = new X01GameEngine({
          players: [createMockPlayer(1, 'Test Player', 501)],
          selectedScore: 501,
        });
        expect(engine.turnManager.getCurrentPlayer().score).toBe(501);
      });

      it('should initialize with multiple players', () => {
        const engine = new X01GameEngine({
          players: [
            createMockPlayer(1, 'Player 1'),
            createMockPlayer(2, 'Player 2'),
          ],
          selectedScore: 301,
        });
        expect(engine.turnManager.players.length).toBe(2);
        expect(engine.turnManager.currentPlayerIndex).toBe(0);
      });
    });

    // TODO: Add invalid configuration tests
  });

  describe('Scoring', () => {
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: [createMockPlayer()],
        selectedScore: 301,
      });
    });

    describe('basic scoring', () => {
      it('should handle single numbers (1-20)', () => {
        gameEngine.handleThrow({ score: 20, multiplier: 1 });
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(281);
      });

      it('should handle doubles (2x)', () => {
        gameEngine.handleThrow({ score: 20, multiplier: 2 });
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(261);
      });

      it('should handle triples (3x)', () => {
        gameEngine.handleThrow({ score: 20, multiplier: 3 });
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(241);
      });
    });

    describe('special scoring', () => {
      it('should handle bull (25)', () => {
        gameEngine.handleThrow({ score: 25, multiplier: 1 });
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(276);
      });

      it('should handle double bull (50)', () => {
        gameEngine.handleThrow({ score: 25, multiplier: 2 });
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(251);
      });
    });

    describe('turn scoring', () => {
      it('should accumulate turn score correctly', () => {
        const darts = [
          { score: 20, multiplier: 1 }, // 20
          { score: 19, multiplier: 1 }, // 19
        ];

        darts.forEach(dart => gameEngine.handleThrow(dart));
        expect(gameEngine.turnManager.currentTurnScore).toBe(39);
      });

      it('should track turn score across all three darts', () => {
        const darts = [
          { score: 20, multiplier: 3 }, // 60
          { score: 19, multiplier: 3 }, // 57
          { score: 18, multiplier: 1 }, // 18
        ];

        darts.forEach((dart, index) => {
          gameEngine.handleThrow(dart);
          const expectedScore = index === 2 ? 0 : [60, 117][index];
          expect(gameEngine.turnManager.currentTurnScore).toBe(expectedScore);
        });
        expect(gameEngine.turnManager.previousTurnScore).toBe(135);
      });
    });
  });

  describe('Turn Management', () => {
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: [
          createMockPlayer(1, 'Player 1'),
          createMockPlayer(2, 'Player 2'),
        ],
        selectedScore: 301,
      });
    });

    it('should track throws within a turn', () => {
      const dart = { score: 20, multiplier: 1 };
      
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.throwsThisTurn).toBe(1);
      
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.throwsThisTurn).toBe(2);
      
      gameEngine.handleThrow(dart);
      expect(gameEngine.turnManager.throwsThisTurn).toBe(0);
    });

    it('should switch players after three darts', () => {
      const dart = { score: 20, multiplier: 1 };
      
      // Complete first player's turn
      for (let i = 0; i < 3; i++) {
        gameEngine.handleThrow(dart);
      }
      
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(1);
      expect(gameEngine.turnManager.getCurrentPlayer().id).toBe(2);
    });

    it('should rotate through all players', () => {
      const dart = { score: 20, multiplier: 1 };
      
      // Complete two full rounds
      for (let i = 0; i < 6; i++) {
        gameEngine.handleThrow(dart);
      }
      
      expect(gameEngine.turnManager.currentPlayerIndex).toBe(0);
    });
  });

  describe('Game End Conditions', () => {
    beforeEach(() => {
      gameEngine = new X01GameEngine({
        players: [createMockPlayer()],
        selectedScore: 301,
      });
    });

    describe('winning', () => {
      it('should handle winning with exact score', () => {
        // Get to 40 first
        throwDartsToScore(gameEngine, 40);
        
        // Verify we're at 40
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
        
        // Win with double 20
        gameEngine.handleThrow({ score: 20, multiplier: 2 });
        
        const player = gameEngine.turnManager.getCurrentPlayer();
        expect(player.score).toBe(0);
        expect(player.completed).toBe(true);
        expect(gameEngine.turnManager.isGameOver()).toBe(true);
      });
    });

    describe('busting', () => {
      it('should bust when score would go below zero', () => {
        // Get to 40 first
        throwDartsToScore(gameEngine, 40);
        
        // Verify we're at 40
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
        
        // Try to score 60 (should bust)
        gameEngine.handleThrow({ score: 20, multiplier: 3 });
        
        // Score should remain at 40 after bust
        console.log(gameEngine.turnManager.getCurrentPlayer().score);
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
        expect(gameEngine.turnManager.currentTurnScore).toBe(0);
      });

      it('should reset turn score after bust', () => {
        // Get to 40 first
        throwDartsToScore(gameEngine, 40);
        
        // Verify we're at 40
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
        
        const darts = [
          { score: 20, multiplier: 1 }, // 20 points
          { score: 20, multiplier: 2 }, // 40 points - should bust
        ];

        darts.forEach(dart => gameEngine.handleThrow(dart));
        expect(gameEngine.turnManager.currentTurnScore).toBe(0);
        expect(gameEngine.turnManager.getCurrentPlayer().score).toBe(40);
      });
    });
  });
});