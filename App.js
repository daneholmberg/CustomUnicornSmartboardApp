import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import GameSetupScreen from './screens/GameSetupScreen';
import X01GameScreen from './screens/X01GameScreen';
import AroundTheWorldGameScreen from './screens/AroundTheWorldGameScreen';
import { GAME_MODES } from './gameEngine/GameFactory';

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
    <View style={{ flex: 1 }}>
      {CurrentGameScreen ? (
        <CurrentGameScreen gameConfig={gameConfig} />
      ) : (
        <GameSetupScreen onStartGame={startGame} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
