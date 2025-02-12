import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { theme } from '../theme';
import { X01Stats } from '../components/X01Stats';

export default function PostGameScreen({ gameState, onNewGame, onRestartGame }) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  
  const sortedPlayers = [...gameState.players].sort((a, b) => 
    (a.place || Number.MAX_VALUE) - (b.place || Number.MAX_VALUE)
  );

  const PlayerStats = ({ player }) => (
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
        <View style={styles.mainStat}>
          <Text style={styles.mainStatValue}>{player.stats.averagePerRound}</Text>
          <Text style={styles.mainStatLabel}>Average</Text>
        </View>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatValue}>{player.stats.highestRound}</Text>
          <Text style={styles.mainStatLabel}>Highest</Text>
        </View>
        <View style={styles.mainStat}>
          <Text style={styles.mainStatValue}>{player.stats.first9DartAvg}</Text>
          <Text style={styles.mainStatLabel}>First 9</Text>
        </View>
      </View>
      <View style={styles.rightSection}>
        <View style={styles.highScoreStat}>
          <Text style={styles.highScoreValue}>{player.stats.rounds50Plus}</Text>
          <Text style={styles.highScoreLabel}>50+</Text>
        </View>
        <View style={styles.highScoreStat}>
          <Text style={styles.highScoreValue}>{player.stats.rounds75Plus}</Text>
          <Text style={styles.highScoreLabel}>75+</Text>
        </View>
        <View style={styles.highScoreStat}>
          <Text style={styles.highScoreValue}>{player.stats.rounds100Plus}</Text>
          <Text style={styles.highScoreLabel}>100+</Text>
        </View>
        <View style={styles.highScoreStat}>
          <Text style={styles.highScoreValue}>{player.stats.rounds120Plus}</Text>
          <Text style={styles.highScoreLabel}>120+</Text>
        </View>
      </View>
    </View>
  );

  const CompactStat = ({ label, value }) => (
    <View style={styles.compactStat}>
      <Text style={styles.compactValue}>{value}</Text>
      <Text style={styles.compactLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Results</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {sortedPlayers.map((player) => (
          <PlayerStats key={player.id} player={player} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
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

function getOrdinalSuffix(number) {
  const j = number % 10;
  const k = number % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    ...theme.elevation.small,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
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
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.xs,
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    ...theme.elevation.small,
  },
  button: {
    flex: 1,
    padding: theme.spacing.sm,
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
    fontSize: 14,
    fontWeight: '600',
  },
}); 