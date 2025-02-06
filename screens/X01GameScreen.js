import React from 'react';
import { Text } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';

export default function X01GameScreen({ gameConfig }) {
  const gameState = useGameState(gameConfig);
  
  const renderPlayerInfo = () => (
    <>
      <Text style={styles.infoText}>
        Current Turn: {gameState.players[gameState.currentPlayerIndex].name}
      </Text>
      {gameState.players.map((player, index) => (
        <Text key={index} style={[
          styles.infoText,
          index === gameState.currentPlayerIndex && styles.currentPlayer
        ]}>
          {player.name}: {player.score}
        </Text>
      ))}
    </>
  );

  return (
    <GameScreen
      title={`Game: X01 (${gameConfig.selectedScore})`}
      gameState={gameState}
      renderPlayerInfo={renderPlayerInfo}
      connected={gameState.connected}
      error={gameState.error}
      handleThrow={gameState.handleThrow}
    />
  );
}

const styles = {
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  currentPlayer: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
}; 