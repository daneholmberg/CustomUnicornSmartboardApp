import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { GAME_MODES } from '../constants/gameModes';
import { GAME_CONFIGS } from '../constants/gameConfigs';
import { useOrientation } from '../hooks/useOrientation';
import { theme } from '../theme';

export default function GameSetupScreen({ onStartGame }) {
  const orientation = useOrientation();
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [players, setPlayers] = useState([]);
  const [playerNameInput, setPlayerNameInput] = useState("");
  const inputRef = useRef(null);

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
      Keyboard.dismiss();
    }
  };

  const handleInputSubmit = () => {
    handleAddPlayer();
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
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      configValues[field.name] === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setConfigValues(prev => ({
                      ...prev,
                      [field.name]: option.value
                    }))}
                  >
                    <Text style={[
                      styles.optionButtonText,
                      configValues[field.name] === option.value && styles.optionButtonTextSelected
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
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
      <View style={[styles.content, orientation === 'landscape' && styles.landscapeContent]}>
        <View style={[styles.section, styles.leftSection]}>
          <Text style={styles.headerText}>
            {selectedGameMode ? GAME_CONFIGS[selectedGameMode].name : 'Select Game Mode'}
          </Text>
          
          {!selectedGameMode ? (
            <View style={styles.gameModeContainer}>
              {Object.entries(GAME_CONFIGS).map(([mode, config]) => (
                <TouchableOpacity
                  key={mode}
                  style={styles.gameModeButton}
                  onPress={() => setSelectedGameMode(mode)}
                >
                  <Text style={styles.gameModeButtonText}>{config.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <ScrollView style={styles.setupContainer}>
              {renderSetupFields()}
            </ScrollView>
          )}
        </View>

        {selectedGameMode && (
          <View style={[styles.section, styles.rightSection]}>
            <Text style={styles.headerText}>Players</Text>
            <View style={styles.playerInputContainer}>
              <TextInput 
                ref={inputRef}
                style={styles.input}
                placeholder="Enter player name"
                placeholderTextColor={theme.colors.text.secondary}
                value={playerNameInput}
                onChangeText={setPlayerNameInput}
                onSubmitEditing={handleInputSubmit}
                returnKeyType="done"
                blurOnSubmit={false}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddPlayer}
              >
                <Text style={styles.addButtonText}>Add Player</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.playerList}>
              {players.map((player, index) => (
                <View key={index} style={styles.playerCard}>
                  <Text style={styles.playerText}>{player.name}</Text>
                </View>
              ))}
            </ScrollView>
            
            {players.length > 0 && (
              <TouchableOpacity 
                style={styles.startButton}
                onPress={() => onStartGame({ 
                  mode: selectedGameMode,
                  players,
                  selectedScore: configValues.selectedScore,
                })}
              >
                <Text style={styles.startButtonText}>Start Game</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  landscapeContent: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  section: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.elevation.small,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  gameModeContainer: {
    gap: theme.spacing.md,
  },
  gameModeButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    ...theme.elevation.tiny,
  },
  gameModeButtonText: {
    color: theme.colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  setupContainer: {
    flex: 1,
  },
  fieldContainer: {
    marginBottom: theme.spacing.lg,
  },
  fieldLabel: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  optionButton: {
    backgroundColor: theme.colors.surface2,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    minWidth: 80,
    ...theme.elevation.tiny,
  },
  optionButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  optionButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionButtonTextSelected: {
    color: theme.colors.text.primary,
  },
  playerInputContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.surface2,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    ...theme.elevation.tiny,
  },
  addButtonText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  playerList: {
    flex: 1,
  },
  playerCard: {
    backgroundColor: theme.colors.surface2,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    ...theme.elevation.tiny,
  },
  playerText: {
    color: theme.colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.lg,
    ...theme.elevation.small,
  },
  startButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 