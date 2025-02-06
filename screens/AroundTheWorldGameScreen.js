import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';
import { PlayerCard } from '../components/PlayerCard';
import { AroundTheWorldStats } from '../components/AroundTheWorldStats';
import { theme } from '../theme';

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
            mainScore={player.currentTarget}
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