import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';

export default function GameSetupScreen({ onStartGame }) {
  // New state for game mode and (for X01) score selection
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [selectedScore, setSelectedScore] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playerNameInput, setPlayerNameInput] = useState("");

  return (
    <View style={styles.container}>
      {/* Step 1: Choose Game Mode */}
      {!selectedGameMode && (
        <>
          <Text style={styles.headerText}>Select Game Mode</Text>
          <View style={styles.buttonRow}>
            <Button title="X01" onPress={() => setSelectedGameMode('x01')} />
            <Button title="Around the World" onPress={() => setSelectedGameMode('aroundTheWorld')} />
          </View>
        </>
      )}

      {/* Step 2a: For X01, choose starting score */}
      {selectedGameMode === 'x01' && !selectedScore && (
        <>
          <Text style={styles.headerText}>Select X01 Game Score</Text>
          <View style={styles.buttonRow}>
            <Button title="301" onPress={() => setSelectedScore(301)} />
            <Button title="501" onPress={() => setSelectedScore(501)} />
          </View>
        </>
      )}

      {/* Step 2b: For Around the World, show selected mode info */}
      {selectedGameMode === 'aroundTheWorld' && (
        <Text style={styles.infoText}>Game: Around the World</Text>
      )}

      {/* Step 3: Add players once game mode (and for X01 also score) has been selected */}
      {(selectedGameMode === 'x01' && selectedScore) || selectedGameMode === 'aroundTheWorld' ? (
        <>
          {selectedGameMode === 'x01' && (
            <Text style={styles.infoText}>Selected X01 Score: {selectedScore}</Text>
          )}
          <TextInput 
            style={styles.input}
            placeholder="Enter player name"
            value={playerNameInput}
            onChangeText={setPlayerNameInput}
          />
          <Button 
            title="Add Player" 
            onPress={() => {
              if (playerNameInput.trim()) {
                if (selectedGameMode === 'x01') {
                  setPlayers(prev => [
                    ...prev, 
                    { name: playerNameInput.trim(), score: selectedScore, throws: [] }
                  ]);
                } else if (selectedGameMode === 'aroundTheWorld') {
                  // For Around the World, each player starts with a current target of 1
                  setPlayers(prev => [
                    ...prev,
                    { name: playerNameInput.trim(), currentTarget: 1, throws: [] }
                  ]);
                }
                setPlayerNameInput("");
              }
            }} 
          />
        </>
      ) : null}

      {players.length > 0 && (
        <View style={styles.playerList}>
          <Text style={styles.subHeaderText}>Players:</Text>
          {players.map((player, index) => (
            <Text key={index} style={styles.infoText}>
              {player.name} - {selectedGameMode === 'x01' ? player.score : player.currentTarget}
            </Text>
          ))}
        </View>
      )}
      
      {players.length > 0 && (
        <Button 
          title="Start Game" 
          onPress={() => onStartGame({ 
            mode: selectedGameMode, 
            players, 
            ...(selectedGameMode === 'x01' && { selectedScore })
          })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 20,
    marginBottom: 20,
  },
  subHeaderText: {
    fontSize: 18,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 20,
    justifyContent: 'space-between',
    width: '60%',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '80%',
  },
  playerList: {
    marginVertical: 20,
    alignItems: 'center',
  },
}); 