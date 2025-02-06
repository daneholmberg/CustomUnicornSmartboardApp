import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { PlayerCard } from '../components/PlayerCard';
import { X01Stats } from '../components/X01Stats';
import { theme } from '../theme';

export default function X01GameScreen({ gameConfig }) {
  const gameState = useGameState(gameConfig);
  
  const renderPlayerInfo = () => (
    <View style={styles.container}>
      <View style={styles.players}>
        {gameState.players.map((player, index) => (
          <PlayerCard
            key={index}
            player={player}
            isActive={index === gameState.currentPlayerIndex}
            mainScore={player.score}
            renderStats={(player) => <X01Stats stats={player.stats} />}
          />
        ))}
      </View>
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
}); 