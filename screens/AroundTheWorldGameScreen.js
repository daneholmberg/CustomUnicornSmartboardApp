import React, { useRef } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { PlayerCard } from '../components/PlayerCard';
import { AroundTheWorldStats } from '../components/AroundTheWorldStats';
import { theme } from '../theme';
import { AROUND_THE_WORLD_TARGETS } from '../constants/gameConstants';
import { useAutoScroll } from '../hooks/useAutoScroll';

export default function AroundTheWorldGameScreen({ gameConfig, onReset, onRestart }) {
  const gameState = useGameState(gameConfig);
  const scrollViewRef = useRef(null);
  
  useAutoScroll(scrollViewRef, gameState.currentPlayerIndex, gameState.players.length);
  
  const renderPlayerInfo = () => (
    <View style={styles.container}>
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
            mainScore={AROUND_THE_WORLD_TARGETS[player.targetIndex]}
            mainScoreLabel="AIMING FOR"
            renderStats={(player) => <AroundTheWorldStats stats={player.stats} />}
            playerCount={gameState.players.length}
          />
        ))}
      </ScrollView>
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
      onUndo={gameState.handleUndo}
      onReset={onReset}
      onRestart={onRestart}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  players: {
    gap: theme.spacing.xs,
  },
  scrollView: {
    padding: theme.spacing.xs,
  },
  fitContent: {
    flex: 1,
    justifyContent: 'space-evenly',
  },
}); 