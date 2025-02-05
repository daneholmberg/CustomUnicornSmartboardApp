import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Dartboard from '../components/Dartboard';
import useAroundTheWorldGame from '../hooks/useAroundTheWorldGame';

export default function AroundTheWorldGameScreen({ gameConfig }) {
  const MAX_DARTS = 3; // Default number of darts per turn
  const { 
    gamePlayers, 
    currentPlayerIndex, 
    gameMessage, 
    connected, 
    error,
    throwsThisTurn,
    handleThrow
  } = useAroundTheWorldGame(gameConfig.players);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Game: Around the World</Text>
      <Text style={styles.infoText}>{gameMessage}</Text>
      
      {gamePlayers.length > 0 && (
        <View style={styles.gameInfo}>
          <Text style={styles.infoText}>
            Current Turn: {gamePlayers[currentPlayerIndex].name}
          </Text>
          <Text style={styles.infoText}>
            Target: {gamePlayers[currentPlayerIndex].currentTarget}
          </Text>
          <Text style={styles.infoText}>
            Throws this turn: {throwsThisTurn}/{MAX_DARTS}
          </Text>
        </View>
      )}
      
      <View style={styles.playerList}>
        {gamePlayers.map((player, index) => (
          <Text key={index} style={[
            styles.infoText,
            index === currentPlayerIndex && styles.currentPlayer
          ]}>
            {player.name}: Target is {player.currentTarget}
          </Text>
        ))}
      </View>

      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {/* Show dartboard on web or when not connected to real board */}
      {(Platform.OS === 'web' || !connected) && (
        <View style={styles.dartboardContainer}>
          <Dartboard onThrow={handleThrow} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 20,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  playerList: {
    marginVertical: 20,
    alignItems: 'center',
  },
  currentPlayer: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dartboardContainer: {
    marginTop: 20,
  },
}); 