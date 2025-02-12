import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { SmartboardProvider } from './context/SmartboardContext';
import { DartboardProvider } from './context/DartboardContext';
import GameSetupScreen from './screens/GameSetupScreen';
import { GAME_MODES } from './constants/gameModes';
import X01GameScreen from './screens/X01GameScreen';
import AroundTheWorldGameScreen from './screens/AroundTheWorldGameScreen';
import HalveItGameScreen from './screens/HalveItGameScreen';
import { theme } from './theme';
import * as ScreenOrientation from 'expo-screen-orientation';
import PostGameScreen from './screens/PostGameScreen';

const gameScreens = {
  [GAME_MODES.X01]: X01GameScreen,
  [GAME_MODES.AROUND_THE_WORLD]: AroundTheWorldGameScreen,
  [GAME_MODES.HALVE_IT]: HalveItGameScreen,
};

export default function App() {
  const [gameConfig, setGameConfig] = useState(null);
  const [showPostGame, setShowPostGame] = useState(false);
  const [lastGameState, setLastGameState] = useState(null);

  useEffect(() => {
    async function lockOrientation() {
      try {
        if (Platform.OS !== 'web') {
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE_LEFT
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

  const resetGame = () => {
    setGameConfig(null);
  };

  const restartGame = () => {
    // Create a new game with the same config to reset all state
    setGameConfig({ ...gameConfig });
  };

  const handleEndGame = (gameState) => {
    setLastGameState(gameState);
    setShowPostGame(true);
  };

  const startNewGame = () => {
    setGameConfig(null);
    setShowPostGame(false);
    setLastGameState(null);
  };

  const restartWithSamePlayers = () => {
    setShowPostGame(false);
    restartGame();
  };

  const CurrentGameScreen = gameConfig ? gameScreens[gameConfig.mode] : null;

  if (showPostGame) {
    return (
      <PostGameScreen
        gameState={lastGameState}
        onNewGame={startNewGame}
        onRestartGame={restartWithSamePlayers}
      />
    );
  }

  return (
    <SmartboardProvider>
      <DartboardProvider>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {CurrentGameScreen ? (
            <CurrentGameScreen 
              gameConfig={gameConfig} 
              onReset={resetGame}
              onRestart={restartGame}
              onEndGame={(gameState) => handleEndGame(gameState)}
            />
          ) : (
            <GameSetupScreen onStartGame={startGame} />
          )}
          <StatusBar hidden />
        </View>
      </DartboardProvider>
    </SmartboardProvider>
  );
}
