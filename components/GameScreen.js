import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import Dartboard from './Dartboard';

export default function GameScreen({ 
  title,
  gameState,
  renderPlayerInfo,
  connected,
  error,
  handleThrow,
}) {
  const { gameMessage, throwsThisTurn, lastHit } = gameState;
  
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{title}</Text>
      <Text style={styles.infoText}>{gameMessage}</Text>
      
      <View style={styles.gameInfo}>
        {renderPlayerInfo()}
        <Text style={styles.infoText}>
          Throws this turn: {throwsThisTurn}/3
        </Text>
      </View>

      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      
      {(Platform.OS === 'web' || !connected) && (
        <View style={styles.dartboardContainer}>
          <Dartboard onThrow={handleThrow} lastHit={lastHit} />
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
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  gameInfo: {
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
  },
  playerList: {
    marginVertical: 20,
    alignItems: 'center',
    width: '100%',
  },
  currentPlayer: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dartboardContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});