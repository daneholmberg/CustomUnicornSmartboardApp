// Set up Jest's expect
import '@testing-library/jest-native';
import { jest } from '@jest/globals';

// Mock Expo modules
jest.mock('expo-status-bar', () => ({
  StatusBar: jest.fn(),
}));

jest.mock('expo-screen-orientation', () => ({
  lockAsync: jest.fn(),
  OrientationLock: {
    LANDSCAPE_RIGHT: 'LANDSCAPE_RIGHT',
    PORTRAIT: 'PORTRAIT',
  },
}));

jest.mock('expo-device', () => ({
  DeviceType: {
    PHONE: 1,
    TABLET: 2,
  },
  deviceType: 1,
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn().mockImplementation(() => ({
    startDeviceScan: jest.fn(),
    stopDeviceScan: jest.fn(),
    connectToDevice: jest.fn(),
    cancelDeviceConnection: jest.fn(),
  })),
}));

// Mock react-native-svg
jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: jest.fn().mockImplementation(({ children }) => React.createElement('svg', {}, children)),
    Path: jest.fn().mockImplementation(props => React.createElement('path', props)),
    Circle: jest.fn().mockImplementation(props => React.createElement('circle', props)),
    // Add other SVG components as needed
  };
});

// Mock Expo's Constants
jest.mock('expo-constants', () => ({
  Constants: {
    manifest: {
      extra: {
        // Add any environment variables you need to mock
      },
    },
  },
}));

// Silence console.warn and console.error in tests
global.console.warn = jest.fn();
global.console.error = jest.fn(); 