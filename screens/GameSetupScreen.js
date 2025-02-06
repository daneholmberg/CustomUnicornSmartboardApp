import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import { GAME_MODES, GAME_CONFIGS } from '../constants';

export default function GameSetupScreen({ onStartGame }) {
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [players, setPlayers] = useState([]);
  const [playerNameInput, setPlayerNameInput] = useState("");

  const selectedConfig = selectedGameMode ? GAME_CONFIGS[selectedGameMode] : null;

  const handleAddPlayer = () => {
    if (playerNameInput.trim() && selectedGameMode) {
      const playerState = GAME_CONFIGS[selectedGameMode].initialPlayerState({
        selectedScore: configValues.selectedScore
      });
      setPlayers(prev => [
        ...prev,
        {
          name: playerNameInput.trim(),
          ...playerState,
        }
      ]);
      setPlayerNameInput("");
    }
  };

  const renderSetupFields = () => {
    if (!selectedConfig) return null;

    return selectedConfig.setupFields.map((field) => {
      switch (field.type) {
        case 'select':
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.optionsRow}>
                {field.options.map((option) => (
                  <View key={option.value} style={styles.optionButton}>
                    <Button
                      key={option.value}
                      title={option.label}
                      onPress={() => setConfigValues(prev => ({
                        ...prev,
                        [field.name]: option.value
                      }))}
                      color={configValues[field.name] === option.value ? '#2196F3' : '#666'}
                    />
                  </View>
                ))}
              </View>
            </View>
          );
        default:
          return null;
      }
    });
  };

  return (
    <View style={styles.container}>
      {!selectedGameMode ? (
        <>
          <Text style={styles.headerText}>Select Game Mode</Text>
          <View style={styles.buttonRow}>
            {Object.entries(GAME_CONFIGS).map(([mode, config]) => (
              <Button
                key={mode}
                title={config.name}
                onPress={() => setSelectedGameMode(mode)}
              />
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.headerText}>{GAME_CONFIGS[selectedGameMode].name}</Text>
          {renderSetupFields()}
          
          <TextInput 
            style={styles.input}
            placeholder="Enter player name"
            value={playerNameInput}
            onChangeText={setPlayerNameInput}
          />
          <Button title="Add Player" onPress={handleAddPlayer} />
          
          {players.length > 0 && (
            <>
              <View style={styles.playerList}>
                <Text style={styles.subHeaderText}>Players:</Text>
                {players.map((player, index) => (
                  <Text key={index} style={styles.playerText}>
                    {player.name}
                  </Text>
                ))}
              </View>
              
              <Button 
                title="Start Game" 
                onPress={() => onStartGame({ 
                  mode: selectedGameMode,
                  players,
                  selectedScore: configValues.selectedScore,
                })}
              />
            </>
          )}
        </>
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
  fieldContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  playerText: {
    fontSize: 16,
    marginBottom: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    marginHorizontal: 10,
    minWidth: 80,
  },
}); 