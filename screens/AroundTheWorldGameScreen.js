import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { theme } from '../theme';

export default function AroundTheWorldGameScreen({ gameConfig }) {
  const gameState = useGameState(gameConfig);
  
  const renderPlayerInfo = () => (
    <View style={styles.playerInfoContainer}>
      <Text style={styles.currentTurnText}>
        Current Turn: {gameState.players[gameState.currentPlayerIndex].name}
      </Text>
      <Text style={styles.targetText}>
        Target: {gameState.players[gameState.currentPlayerIndex].currentTarget}
      </Text>
      <View style={styles.playerList}>
        {gameState.players.map((player, index) => (
          <View 
            key={index} 
            style={[
              styles.playerCard,
              index === gameState.currentPlayerIndex && styles.activePlayer
            ]}
          >
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={styles.targetNumber}>Target: {player.currentTarget}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <GameScreen
      title="Around the World"
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
  },
  targetText: {
    fontSize: 24,
    color: theme.colors.text.accent,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  playerList: {
    gap: theme.spacing.sm,
  },
  playerCard: {
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
    marginBottom: theme.spacing.xs,
  },
  targetNumber: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
}); 