import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { theme } from '../theme';

export const X01Stats = ({ stats, textSize = 10, variant = 'simple' }) => {
  if (variant === 'simple') {
    return (
      <View style={styles.statItem}>
        <Text style={[styles.label, { fontSize: textSize }]}>AVG/ROUND:</Text>
        <Text style={[styles.value, { fontSize: textSize }]}>
          {stats?.averagePerRound || 0}
        </Text>
      </View>
    );
  }

  const StatColumn = ({ title, items }) => (
    <View style={styles.column}>
      <Text style={styles.columnTitle}>{title}</Text>
      <View style={styles.columnContent}>
        {items.map((item, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.label}>{item.label}</Text>
            <Text style={[styles.value, styles.largeValue]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const HighScoreGrid = ({ scores }) => (
    <View style={styles.highScoreGrid}>
      {scores.map((score, index) => (
        <View 
          key={index} 
          style={[
            styles.highScoreItem,
            index % 2 === 0 && styles.highScoreItemLeft,
            index < 2 && styles.highScoreItemTop
          ]}
        >
          <Text style={styles.highScoreValue}>{score.count}</Text>
          <Text style={styles.highScoreLabel}>{score.label}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsGrid}>
        <StatColumn
          title="Averages"
          items={[
            { label: 'Per Round', value: stats?.averagePerRound || 0 },
            { label: 'First 9', value: stats?.first9DartAvg || 0 },
          ]}
        />
        <StatColumn
          title="Best Scores"
          items={[
            { label: 'Highest Round', value: stats?.highestRound || 0 },
          ]}
        />
        <View style={[styles.column, styles.highScoreColumn]}>
          <Text style={styles.columnTitle}>High Score Rounds</Text>
          <HighScoreGrid
            scores={[
              { label: '50+', count: stats?.rounds50Plus || 0 },
              { label: '75+', count: stats?.rounds75Plus || 0 },
              { label: '100+', count: stats?.rounds100Plus || 0 },
              { label: '120+', count: stats?.rounds120Plus || 0 },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  column: {
    flex: 1,
    minWidth: 120,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.elevation.small,
  },
  highScoreColumn: {
    flex: 1.2, // Give more space to the high score grid
  },
  columnTitle: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    opacity: 0.9,
  },
  columnContent: {
    gap: theme.spacing.sm,
  },
  statItem: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  label: {
    color: theme.colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.9,
  },
  value: {
    color: theme.colors.text.highlight,
    fontWeight: '700',
    textAlign: 'center',
  },
  largeValue: {
    fontSize: 24,
  },
  highScoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    justifyContent: 'space-between',
    alignContent: 'space-between',
    height: 120, // Fixed height for consistent layout
  },
  highScoreItem: {
    alignItems: 'center',
    width: '48%',
    aspectRatio: 1.6,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.surface2,
    ...theme.elevation.tiny,
  },
  highScoreItemLeft: {
    marginRight: '2%',
  },
  highScoreItemTop: {
    marginBottom: '2%',
  },
  highScoreLabel: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.8,
  },
  highScoreValue: {
    color: theme.colors.text.highlight,
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
  },
}); 