import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';
import { PlayerMedal } from './PlayerMedal';

export const PlayerCard = ({ 
  player, 
  isActive, 
  renderStats,
  mainScore, 
  mainScoreLabel 
}) => {
  return (
    <View style={[styles.container, isActive && styles.activeContainer]}>
      <View style={styles.header}>
        <Text style={styles.name}>{player.name}</Text>
        {isActive && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active</Text>
          </View>
        )}
      </View>

      <View style={styles.scoreContainer}>
        {mainScoreLabel && (
          <Text style={styles.scoreLabel}>{mainScoreLabel}</Text>
        )}
        <Text style={styles.score}>{mainScore}</Text>
      </View>

      {player.place && <PlayerMedal place={player.place} />}

      {renderStats && (
        <View style={styles.statsContainer}>
          {renderStats(player)}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginVertical: theme.spacing.xs,
    width: '100%',
    ...theme.elevation.small,
  },
  activeContainer: {
    backgroundColor: theme.colors.surfaceAccent,
    borderColor: theme.colors.primary,
    borderWidth: 2,
    transform: [{ scale: 1.02 }],
    ...theme.elevation.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  activeBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activeBadgeText: {
    color: theme.colors.text.primary,
    fontSize: 10,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xs,
  },
  scoreLabel: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statsContainer: {
    marginTop: theme.spacing.xs,
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.text.secondary + '20',
  },
}); 