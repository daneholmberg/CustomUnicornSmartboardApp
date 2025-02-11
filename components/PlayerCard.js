import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';
import { PlayerMedal } from './PlayerMedal';

export const PlayerCard = ({ 
  player, 
  isActive, 
  renderStats,
  mainScore, 
  mainScoreLabel,
  playerCount 
}) => {
  // Make cards much more compact
  const getDynamicSizes = (count) => {
    switch (count) {
      case 2:
        return {
          containerHeight: 60,
          fontSize: 14,
          scoreSize: 24,
          padding: theme.spacing.sm,
          statsSize: 11
        };
      case 3:
        return {
          containerHeight: 50,
          fontSize: 13,
          scoreSize: 20,
          padding: theme.spacing.xs,
          statsSize: 10
        };
      case 4:
      case 5:
        return {
          containerHeight: 40,
          fontSize: 12,
          scoreSize: 18,
          padding: theme.spacing.xs,
          statsSize: 9
        };
      default:
        return {
          containerHeight: 35,
          fontSize: 11,
          scoreSize: 16,
          padding: theme.spacing.xs,
          statsSize: 8
        };
    }
  };

  const sizes = getDynamicSizes(playerCount);

  return (
    <View style={[
      styles.outerContainer,
      isActive && styles.activeOuterContainer
    ]}>
      <View style={[
        styles.container, 
        { 
          height: sizes.containerHeight,
          padding: sizes.padding,
          gap: sizes.padding
        }
      ]}>
        <View style={styles.leftSection}>
          <View style={[styles.header, { gap: theme.spacing.xs }]}>
            <Text style={[styles.name, { fontSize: sizes.fontSize }]}>
              {player.name}
            </Text>
            {isActive && (
              <View style={[styles.activeBadge, { padding: 2 }]}>
                <Text style={[styles.activeBadgeText, { fontSize: sizes.statsSize }]}>
                  Active
                </Text>
              </View>
            )}
          </View>
          {renderStats && (
            <View style={[styles.statsContainer, { marginTop: 1 }]}>
              {React.cloneElement(renderStats(player), { 
                textSize: sizes.statsSize 
              })}
            </View>
          )}
        </View>
        
        <View style={styles.scoreSection}>
          {mainScoreLabel && (
            <Text style={[styles.scoreLabel, { fontSize: sizes.statsSize }]}>
              {mainScoreLabel}
            </Text>
          )}
          <Text style={[styles.score, { fontSize: sizes.scoreSize }]}>
            {mainScore}
          </Text>
        </View>

        {player.place && <PlayerMedal place={player.place} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: theme.borderRadius.md,
    padding: 2, // This creates space for the active border
  },
  activeOuterContainer: {
    backgroundColor: theme.colors.primary,
    ...theme.elevation.medium,
  },
  container: {
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  name: {
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
  scoreSection: {
    alignItems: 'flex-end',
    minWidth: 60,
  },
  scoreLabel: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginBottom: -2,
  },
  score: {
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
  statsContainer: {
    marginTop: theme.spacing.xs,
  },
}); 