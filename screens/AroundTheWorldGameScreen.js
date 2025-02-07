import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { PlayerCard } from '../components/PlayerCard';
import { AroundTheWorldStats } from '../components/AroundTheWorldStats';
import { theme } from '../theme';
import { AROUND_THE_WORLD_TARGETS } from '../constants/gameConstants';

export default function AroundTheWorldGameScreen({ gameConfig }) {
  const gameState = useGameState(gameConfig);
  
  const renderPlayerInfo = () => (
    <View style={styles.container}>
      <View style={styles.players}>
        {gameState.players.map((player, index) => (
          <PlayerCard
            key={index}
            player={player}
            isActive={index === gameState.currentPlayerIndex}
            mainScore={AROUND_THE_WORLD_TARGETS[player.targetIndex]}
            mainScoreLabel="AIMING FOR"
            renderStats={(player) => <AroundTheWorldStats stats={player.stats} />}
          />
        ))}
      </View>
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