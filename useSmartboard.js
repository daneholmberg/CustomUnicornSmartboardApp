import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Dynamically require real or mock smartboard, based on platform
 */
let smartboard;
if (Platform.OS === 'web') {
  smartboard = require('./smartboard/smartboard-mock')();
} else if (process.env.NODE_ENV === 'prod') {
  smartboard = require('./smartboard/smartboard')();
} else {
  smartboard = require('./smartboard/smartboard-mock')();
}

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
    if (Platform.OS === 'web') {
      setThrows(prev => [...prev, generateMockThrow()]);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, use mock implementation
      setConnected(true);
      
      // Optional: Automatic throws every 2 seconds
    //   const mockInterval = setInterval(() => {
    //     setThrows(prev => [...prev, generateMockThrow()]);
    //   }, 2000); // Reduced from 5000ms to 2000ms for more frequent throws

    //   return () => clearInterval(mockInterval);
        return () => {};
    }
    
    // Normal BLE implementation for native platforms
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