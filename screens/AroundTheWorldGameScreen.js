import React from 'react';
import { Text } from 'react-native';
import { useGameState } from '../hooks/useGameState';
import GameScreen from '../components/GameScreen';

export default function AroundTheWorldGameScreen({ gameConfig }) {
  const gameState = useGameState(gameConfig);
  
  const renderPlayerInfo = () => (
    <>
      <Text style={styles.infoText}>
        Current Turn: {gameState.players[gameState.currentPlayerIndex].name}
      </Text>
      <Text style={styles.infoText}>
        Target: {gameState.players[gameState.currentPlayerIndex].currentTarget}
      </Text>
      {gameState.players.map((player, index) => (
        <Text key={index} style={[
          styles.infoText,
          index === gameState.currentPlayerIndex && styles.currentPlayer
        ]}>
          {player.name}: Target is {player.currentTarget}
        </Text>
      ))}
    </>
  );

  return (
    <GameScreen
      title="Game: Around the World"
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