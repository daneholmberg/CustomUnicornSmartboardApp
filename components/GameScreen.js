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
      <View style={[styles.header, theme.elevation.small]}>
        <Text style={styles.headerTitle}>{title}</Text>
        
        {gameMessage && (
          <View style={styles.messageContainer}>
            <Text style={styles.gameMessage}>{gameMessage}</Text>
            <Text style={styles.throwCount}>
              Throws: {throwsThisTurn}<Text style={styles.throwTotal}>/3</Text>
            </Text>
          </View>
        )}
      </View>
      
      <View style={[styles.gameInfo, theme.elevation.small]}>
        {renderPlayerInfo()}
      </View>

      {error && (
        <View style={[styles.errorContainer, theme.elevation.small]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {(Platform.OS === 'web' || !connected) && (
        <View style={[styles.dartboardContainer, theme.elevation.medium]}>
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
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  messageContainer: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameMessage: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  throwCount: {
    color: theme.colors.text.primary,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
    opacity: 0.8,
  },
  throwTotal: {
    opacity: 0.6,
  },
  gameInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  dartboardContainer: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
});