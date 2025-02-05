import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import GameSetupScreen from './screens/GameSetupScreen';
import X01GameScreen from './screens/X01GameScreen';
import AroundTheWorldGameScreen from './screens/AroundTheWorldGameScreen';

export default function App() {
  const [gameConfig, setGameConfig] = useState(null);

  const startGame = (config) => {
    setGameConfig(config);
  };

  return (
    <View style={{ flex: 1 }}>
      {gameConfig ? (
        gameConfig.mode === 'x01' ? (
          <X01GameScreen gameConfig={gameConfig} />
        ) : (
          <AroundTheWorldGameScreen gameConfig={gameConfig} />
        )
      ) : (
        <GameSetupScreen onStartGame={startGame} />
      )}
      <StatusBar style="auto" />
    </View>
  );
}
