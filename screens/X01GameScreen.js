import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { theme } from '../theme';

export default function X01GameScreen({ gameConfig }) {
  const gameState = useGameState(gameConfig);
  
  const renderPlayerInfo = () => (
    <View style={styles.playerInfoContainer}>
      <Text style={styles.currentTurnText}>
        Current Turn: {gameState.players[gameState.currentPlayerIndex].name}
      </Text>
      <View style={styles.scoreBoard}>
        {gameState.players.map((player, index) => (
          <View 
            key={index} 
            style={[
              styles.playerScore,
              index === gameState.currentPlayerIndex && styles.activePlayer
            ]}
          >
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.scoreText}>{player.score}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <GameScreen
      title={`Game: X01 (${gameState.selectedScore})`}
      gameState={gameState}
      renderPlayerInfo={renderPlayerInfo}
      connected={gameState.connected}
      error={gameState.error}
      handleThrow={gameState.handleThrow}
    />
  );
}

const styles = StyleSheet.create({
  playerInfoContainer: {
    gap: theme.spacing.md,
  },
  currentTurnText: {
    fontSize: 18,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreBoard: {
    gap: theme.spacing.sm,
  },
  playerScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
  },
  activePlayer: {
    backgroundColor: theme.colors.accent,
  },
  playerName: {
    color: theme.colors.text.primary,
    fontSize: 16,
  },
  scoreText: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
}); 