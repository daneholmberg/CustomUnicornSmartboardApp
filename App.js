import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { SmartboardProvider } from './context/SmartboardContext';
import { DartboardProvider } from './context/DartboardContext';
import GameSetupScreen from './screens/GameSetupScreen';
import { GAME_MODES } from './constants';
import X01GameScreen from './screens/X01GameScreen';
import AroundTheWorldGameScreen from './screens/AroundTheWorldGameScreen';
import { theme } from './theme';

const gameScreens = {
  [GAME_MODES.X01]: X01GameScreen,
  [GAME_MODES.AROUND_THE_WORLD]: AroundTheWorldGameScreen,
};

export default function App() {
  const [gameConfig, setGameConfig] = useState(null);

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
          <StatusBar barStyle="light-content" />
        </View>
      </DartboardProvider>
    </SmartboardProvider>
  );
}
