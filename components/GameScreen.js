import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Dartboard from './Dartboard';
import { theme } from '../theme';

export default function GameScreen({ 
  title,
  gameState,
  renderPlayerInfo,
  connected,
  error,
  handleThrow,
}) {
  const { gameMessage, throwsThisTurn, lastHit, targetNumbers } = gameState;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{title}</Text>
        <Text style={styles.gameMessage}>{gameMessage}</Text>
      </View>
      
      <View style={styles.gameInfo}>
        {renderPlayerInfo()}
        <View style={styles.throwCounter}>
          <Text style={styles.throwCounterText}>
            Throws: {throwsThisTurn}/3
          </Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
      
      {(Platform.OS === 'web' || !connected) && (
        <View style={styles.dartboardContainer}>
          <Dartboard 
            onThrow={handleThrow} 
            lastHit={lastHit} 
            targetNumbers={targetNumbers}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  gameMessage: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  gameInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  throwCounter: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.md,
  },
  throwCounterText: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  dartboardContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
});