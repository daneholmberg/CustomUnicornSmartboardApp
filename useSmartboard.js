import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import smartboardMock from './smartboard/smartboard-mock';

// Only import real smartboard in production
let smartboardReal;
if (process.env.NODE_ENV === 'prod') {
  smartboardReal = require('./smartboard/smartboard').default;
}

/**
 * Get the appropriate smartboard implementation
 */
const getSmartboard = () => {
  // Always use mock unless explicitly in production
  if (process.env.NODE_ENV !== 'prod') {
    return smartboardMock();
  }
  return smartboardReal();
};

const smartboard = getSmartboard();

/**
 * Generate a random dart throw
 */
const generateMockThrow = () => ({
  score: Math.floor(Math.random() * 20) + 1, // 1-20
  multiplier: Math.floor(Math.random() * 3) + 1 // 1-3
});

/**
 * useSmartboard hook
 * - Starts scanning and connects to the board on mount.
 * - Stores throws in state, so that components can read them.
 */
export default function useSmartboard() {
  const [connected, setConnected] = useState(false);
  const [throws, setThrows] = useState([]);
  const [error, setError] = useState(null);

  // Callback for manual mock throws
  const mockThrow = useCallback(() => {
    setThrows(prev => [...prev, generateMockThrow()]);
  }, []);

  useEffect(() => {
    // Always use mock implementation in development
    if (process.env.NODE_ENV !== 'prod') {
      setConnected(true);
      return () => {};
    }
    
    // Normal BLE implementation only in production
    try {
      smartboard.startScan();
      smartboard.connect("fake-uuid-here", (peripheral) => {
        setConnected(true);
        smartboard.initialize(
          peripheral,
          20,
          (dart) => {
            setThrows(prev => [...prev, dart]);
          },
          () => {
            console.log("Smartboard button pressed");
          }
        );
      });
    } catch (err) {
      setError(err.message);
    }

    return () => {
      if (smartboard.disconnect) {
        smartboard.disconnect();
      }
    };
  }, []);

  return { 
    connected, 
    throws, 
    error,
    mockThrow // Expose the mock throw function
  };
} 