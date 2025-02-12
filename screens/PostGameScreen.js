import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { theme } from '../theme';
import { X01EndGameStats } from '../components/gameSpecific/endGameStats/X01EndGameStats';
import { AroundTheWorldEndGameStats } from '../components/gameSpecific/endGameStats/AroundTheWorldEndGameStats';
import { GAME_MODES } from '../constants/gameModes';

export default function PostGameScreen({ gameState, onNewGame, onRestartGame }) {
  console.log('PostGameScreen - gameState:', gameState); // Debug log

  // Create a mapping of game types to their components
  const gameComponents = {
    [GAME_MODES.X01]: X01EndGameStats,
    [GAME_MODES.AROUND_THE_WORLD]: AroundTheWorldEndGameStats,
  };

  const StatsComponent = gameComponents[gameState?.gameType];

  // Better error handling with more information
  if (!StatsComponent) {
    console.error('Game type error:', {
      receivedType: gameState?.gameType,
      availableTypes: Object.keys(gameComponents),
      fullGameState: gameState,
    });

    // Show error UI instead of returning null
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Error: Unknown game type "{gameState?.gameType}"
        </Text>
        <TouchableOpacity 
          style={[styles.button, styles.newGameButton]} 
          onPress={onNewGame}
        >
          <Text style={styles.buttonText}>Return to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Game Results</Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {gameState.players.map((player, index) => (
          <StatsComponent key={`player-${index}`} player={player} />
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.newGameButton]} 
          onPress={onNewGame}
        >
          <Text style={styles.buttonText}>New Game</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.restartButton]} 
          onPress={onRestartGame}
        >
          <Text style={styles.buttonText}>Restart with Same Players</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  button: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.elevation.small,
  },
  newGameButton: {
    backgroundColor: theme.colors.primary,
  },
  restartButton: {
    backgroundColor: theme.colors.accent,
  },
  buttonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.text.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
}); 