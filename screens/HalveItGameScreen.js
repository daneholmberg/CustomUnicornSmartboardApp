import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView, Text } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { PlayerCard } from '../components/PlayerCard';
import { HalveItDartboard } from '../components/gameSpecific/HalveItDartboard';
import { theme } from '../theme';
import { useAutoScroll } from '../hooks/useAutoScroll';

const HalveItStats = ({ stats }) => (
  <View style={styles.statsContainer}>
    <Text style={styles.statsText}>Hit Rate: {stats.hitRate}%</Text>
  </View>
);

export default function HalveItGameScreen({ gameConfig, onReset, onRestart, onEndGame }) {
  const gameState = useGameState(gameConfig);
  const scrollViewRef = useRef(null);
  
  useAutoScroll(scrollViewRef, gameState.currentPlayerIndex, gameState.players.length);

  const renderPlayerInfo = () => (
    <View style={styles.container}>
      <View style={styles.roundInfo}>
        <Text style={styles.roundLabel}>ROUND {gameState.currentRound} OF {gameState.totalRounds}</Text>
        <Text style={styles.roundTarget}>{gameState.roundDescription}</Text>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.players,
          gameState.players.length <= 5 && styles.fitContent
        ]}
        showsVerticalScrollIndicator={false}
      >
        {gameState.players.map((player, index) => (
          <PlayerCard
            key={index}
            player={player}
            isActive={index === gameState.currentPlayerIndex}
            mainScore={player.score}
            subScore={player.roundScore}
            subScoreLabel="ROUND"
            playerCount={gameState.players.length}
            renderStats={(player) => <HalveItStats stats={player.stats} />}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <GameScreen
      title="Halve It"
      gameState={gameState}
      DartboardComponent={() => (
        <HalveItDartboard
          onThrow={gameState.handleThrow}
          lastHit={gameState.lastHit}
          currentTarget={gameState.rounds?.[gameState.currentRound - 1]?.target}
        />
      )}
      renderPlayerInfo={renderPlayerInfo}
      connected={gameState.connected}
      error={gameState.error}
      onUndo={gameState.handleUndo}
      onReset={onReset}
      onRestart={onRestart}
      onEndGame={() => onEndGame(gameState)}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  roundInfo: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    alignItems: 'center',
  },
  roundLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  roundTarget: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  scrollView: {
    flex: 1,
    padding: theme.spacing.xs,
  },
  players: {
    gap: theme.spacing.xs,
  },
  fitContent: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  statsText: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
}); 