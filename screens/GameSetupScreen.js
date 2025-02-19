import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Keyboard } from 'react-native';
import { GAME_MODES } from '../constants/gameModes';
import { GAME_CONFIGS } from '../constants/gameConfigs';
import { useOrientation } from '../hooks/useOrientation';
import { useSmartboardContext } from '../context/SmartboardContext';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import SmartboardConnection from '../components/SmartboardConnection';

/**
 * State Choice: local
 * Reason: Setup screen state (selected game mode, player names, config values) is only 
 * needed within this screen and doesn't need to persist or be shared. Once game starts, 
 * this state is transformed into initial game state.
 * 
 * @param {Object} props
 * @param {Function} props.onStartGame - Callback fired when game setup is complete
 * @param {Function} props.onBack - Callback to navigate back to home screen
 * @param {Function} props.onOpenSettings - Callback to open settings
 */
export default function GameSetupScreen({ onStartGame, onBack, onOpenSettings }) {
  const orientation = useOrientation();
  const { connected } = useSmartboardContext();
  const [selectedGameMode, setSelectedGameMode] = useState(null);
  const [configValues, setConfigValues] = useState({});
  const [players, setPlayers] = useState([]);
  const [playerNameInput, setPlayerNameInput] = useState("");
  const inputRef = useRef(null);

  const selectedConfig = selectedGameMode ? GAME_CONFIGS[selectedGameMode] : null;

  // Set default values when game mode is selected
  useEffect(() => {
    if (selectedGameMode === GAME_MODES.HALVE_IT) {
      setConfigValues({
        roundCount: 9,
        penaltyMode: 'half',
        bullseyeMode: 'outer'
      });
    }
  }, [selectedGameMode]);

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

  const handleStartGame = () => {
    onStartGame({ 
      mode: selectedGameMode,
      players,
      roundCount: configValues.roundCount,
      penaltyMode: configValues.penaltyMode,
      selectedScore: configValues.selectedScore,
    });
  };

  /**
   * Renders the configuration fields for the selected game mode.
   * Supports different field types (currently 'select') and renders
   * appropriate UI components based on the field configuration.
   */
  const renderSetupFields = () => {
    if (!selectedConfig) return null;

    return selectedConfig.setupFields.map((field) => {
      switch (field.type) {
        case 'select':
          return (
            <View key={field.name} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <View style={styles.optionsRow}>
                {field.options.map((option) => {
                  // Use default value if no value is set
                  const isSelected = configValues[field.name] === option.value ||
                    (!configValues[field.name] && 
                      ((field.name === 'roundCount' && option.value === 9) ||
                       (field.name === 'penaltyMode' && option.value === 'half'))
                    );
                  
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected
                      ]}
                      onPress={() => setConfigValues(prev => ({
                        ...prev,
                        [field.name]: option.value
                      }))}
                    >
                      <Text style={[
                        styles.optionButtonText,
                        isSelected && styles.optionButtonTextSelected
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          );
        default:
          return null;
      }
    });
  };

  /**
   * Renders the player list section including the input field for new players,
   * the list of added players, and the start game button when applicable.
   */
  const renderPlayerInfo = () => {
    if (selectedGameMode) {
      return (
        <View style={[styles.section, styles.rightSection]}>
          <Text style={styles.headerText}>Players</Text>
          
          <SmartboardConnection />
          
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
              style={[
                styles.addButton,
                !connected && styles.buttonDisabled
              ]}
              onPress={handleAddPlayer}
              disabled={!connected}
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
              style={[
                styles.startButton,
                !connected && styles.buttonDisabled
              ]}
              onPress={handleStartGame}
              disabled={!connected}
            >
              <Text style={styles.startButtonText}>
                {connected ? 'Start Game' : 'Connect Smartboard to Start'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Setup</Text>
        <TouchableOpacity 
          style={styles.settingsButton} 
          onPress={onOpenSettings}
        >
          <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
      
      {selectedGameMode && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => {
            setSelectedGameMode(null);
            setPlayers([]);
            setConfigValues({});
          }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      )}

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

        {renderPlayerInfo()}
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
    paddingTop: theme.spacing.xl * 2,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    position: 'absolute',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    zIndex: 1,
  },
  backButtonText: {
    color: theme.colors.text.primary,
    fontSize: 16,
    marginLeft: theme.spacing.sm,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.large,
    paddingHorizontal: theme.spacing.medium,
  },
  settingsButton: {
    padding: theme.spacing.small,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text.primary,
  },
}); 