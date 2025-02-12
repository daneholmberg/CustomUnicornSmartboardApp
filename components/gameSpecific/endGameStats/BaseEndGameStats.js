import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../../../theme';

export const BaseEndGameStats = ({ player, mainStats, rightStats }) => {
  const getOrdinalSuffix = (number) => {
    const j = number % 10;
    const k = number % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };

  const MainStat = ({ value, label }) => (
    <View style={styles.mainStat}>
      <Text style={styles.mainStatValue}>{value}</Text>
      <Text style={styles.mainStatLabel}>{label}</Text>
    </View>
  );

  const HighScoreStat = ({ value, label }) => (
    <View style={styles.highScoreStat}>
      <Text style={styles.highScoreValue}>{value}</Text>
      <Text style={styles.highScoreLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.playerResult}>
      <View style={styles.leftSection}>
        <View style={styles.placeContainer}>
          <Text style={styles.placeText}>
            {player.place ? `${player.place}${getOrdinalSuffix(player.place)}` : '-'}
          </Text>
        </View>
        <Text style={styles.playerName}>{player.name}</Text>
      </View>

      <View style={styles.centerSection}>
        {mainStats.map((stat, index) => (
          <MainStat key={index} value={stat.value} label={stat.label} />
        ))}
      </View>

      <View style={styles.rightSection}>
        {rightStats.map((stat, index) => (
          <HighScoreStat key={index} value={stat.value} label={stat.label} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerResult: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    height: 52,
    overflow: 'hidden',
    ...theme.elevation.tiny,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '30%',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surface2,
  },
  placeContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.xs,
  },
  placeText: {
    color: theme.colors.text.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
    flex: 1,
  },
  centerSection: {
    flexDirection: 'row',
    width: '40%',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.xs,
  },
  mainStat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainStatValue: {
    color: theme.colors.text.highlight,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  mainStatLabel: {
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: '500',
  },
  rightSection: {
    flexDirection: 'row',
    width: '30%',
    paddingHorizontal: theme.spacing.xs,
    backgroundColor: theme.colors.surface2,
  },
  highScoreStat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highScoreValue: {
    color: theme.colors.text.highlight,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  highScoreLabel: {
    color: theme.colors.text.secondary,
    fontSize: 10,
    fontWeight: '500',
  },
}); 