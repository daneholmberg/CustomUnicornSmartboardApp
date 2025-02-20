import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext();

const STORAGE_KEYS = {
  BOARD_ROTATION: '@settings/board_rotation',
};

// Reference array for number positions, with 20 at index 0
const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

// Standard position reference - number 15 should be at index 7 in normal orientation
const STANDARD_POSITION = {
  NUMBER: 15,
  INDEX: 7,
};

export const DEFAULT_BOARD_ROTATION = 0;

export const SettingsProvider = ({ children }) => {
  const [boardRotation, setBoardRotation] = useState(DEFAULT_BOARD_ROTATION);
  const [selectedNumber, setSelectedNumber] = useState(STANDARD_POSITION.NUMBER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const getOffsetForNumber = (targetNumber) => {
    // Convert string to number if needed
    const number = parseInt(targetNumber, 10);
    const index = NUMBERS.indexOf(number);
    
    // Calculate offset relative to STANDARD_POSITION
    // Add NUMBERS.length to handle negative values
    const offset = (index - STANDARD_POSITION.INDEX + NUMBERS.length) % NUMBERS.length;
    
    
    return index >= 0 ? offset : 0;
  };

  const loadSettings = async () => {
    try {
      const storedNumber = await AsyncStorage.getItem(STORAGE_KEYS.BOARD_ROTATION);
      if (storedNumber !== null) {
        const dartNumber = parseInt(storedNumber, 10);
        setSelectedNumber(dartNumber);
        const offset = getOffsetForNumber(dartNumber);
        setBoardRotation(offset);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBoardRotation = async (dartNumber) => {
    try {
      const number = parseInt(dartNumber, 10);
      const offset = getOffsetForNumber(number);
      
      await AsyncStorage.setItem(STORAGE_KEYS.BOARD_ROTATION, number.toString());
      setSelectedNumber(number);
      setBoardRotation(offset);
    } catch (error) {
      console.error('Error saving board rotation:', error);
    }
  };

  const value = {
    boardRotation,
    selectedNumber,
    updateBoardRotation,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 