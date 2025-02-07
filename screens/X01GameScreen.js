import React, { useRef } from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { PlayerCard } from '../components/PlayerCard';
import { X01Stats } from '../components/X01Stats';
import { theme } from '../theme';
import { useAutoScroll } from '../hooks/useAutoScroll';

export default function X01GameScreen({ gameConfig }) {
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
            mainScore={player.score}
            renderStats={(player) => <X01Stats stats={player.stats} />}
            playerCount={gameState.players.length}
          />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <GameScreen
      title={`X01 (${gameState.selectedScore})`}
      gameState={gameState}
      renderPlayerInfo={renderPlayerInfo}
      connected={gameState.connected}
      error={gameState.error}
      handleThrow={gameState.handleThrow}
      onUndo={gameState.handleUndo}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 0, // Important for scroll containment
  },
  scrollView: {
    flex: 1,
  },
  players: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs, // Add some padding for better scroll feel
  },
  fitContent: {
    flex: 1, // This will make content stretch to fill available space when ≤5 players
    justifyContent: 'space-evenly', // Evenly distribute players when ≤5
  },
}); 