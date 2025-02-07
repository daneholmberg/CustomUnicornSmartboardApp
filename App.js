import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { SmartboardProvider } from './context/SmartboardContext';
import { DartboardProvider } from './context/DartboardContext';
import GameSetupScreen from './screens/GameSetupScreen';
import { GAME_MODES } from './constants/gameModes';
import X01GameScreen from './screens/X01GameScreen';
import AroundTheWorldGameScreen from './screens/AroundTheWorldGameScreen';
import { theme } from './theme';
import * as ScreenOrientation from 'expo-screen-orientation';

const gameScreens = {
  [GAME_MODES.X01]: X01GameScreen,
  [GAME_MODES.AROUND_THE_WORLD]: AroundTheWorldGameScreen,
};

export default function App() {
  const [gameConfig, setGameConfig] = useState(null);

  useEffect(() => {
    async function lockOrientation() {
      try {
        if (Platform.OS !== 'web') {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT
          );
        }
      } catch (error) {
        console.warn('Failed to lock orientation:', error);
      }
    }
    lockOrientation();
  }, []);

  const startGame = (config) => {
    setGameConfig(config);
  };

  const CurrentGameScreen = gameConfig ? gameScreens[gameConfig.mode] : null;

  return (
    <SmartboardProvider>
      <DartboardProvider>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {CurrentGameScreen ? (
            <CurrentGameScreen gameConfig={gameConfig} />
          ) : (
            <GameSetupScreen onStartGame={startGame} />
          )}
          <StatusBar hidden />
        </View>
      </DartboardProvider>
    </SmartboardProvider>
  );
}
