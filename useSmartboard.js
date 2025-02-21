import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import smartboardMock from './smartboard/smartboard-mock';
import Constants from 'expo-constants';
import { useSettings } from './context/SettingsContext';

// Initialize BLE manager only in production builds
let bleManager;
const isExpoGo = Constants.executionEnvironment === 'storeClient';

const initializeBleManager = () => {
  if (!bleManager && !isExpoGo) {
    try {
      console.log('Initializing BLE Manager...');
      bleManager = new BleManager();
      console.log('BLE Manager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize BLE Manager:', error);
      console.error('BLE init error stack:', error.stack);
      return false;
    }
  }
  return !!bleManager;
};

// Initialize on module load
if (!isExpoGo) {
  initializeBleManager();
} else {
  console.log('Running in Expo Go - BLE functionality disabled');
}

/**
 * Connection states for the smartboard
 */
export const CONNECTION_STATE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
};

// BLE UUIDs and characteristics
const BLE_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
let DART_CHARACTERISTIC_UUID = null; // Will be set after discovery

// Add this helper function at module level
const translateDartData = (rawScore, multiplier, boardRotation) => {
  console.log('[translateDartData] Input:', { rawScore, multiplier, boardRotation });

  // Handle player change signal
  if (multiplier === 170 && rawScore === 85) {
    console.log('[translateDartData] Detected player change signal/miss');
    return {
      score: 0,
      multiplier: 0
    };
  }

  // Handle bullseye hits (no translation needed)
  if (rawScore === 25 || rawScore === 50) {
    console.log('[translateDartData] Bullseye hit - no translation needed:', 
      { score: rawScore, multiplier: rawScore === 50 ? 2 : 1 });
    return {
      score: rawScore,
      multiplier: rawScore === 50 ? 2 : 1
    };
  }

  // Reference array for number positions, with 20 at index 0
  const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  
  // Find the index of the raw score in the NUMBERS array
  const rawIndex = NUMBERS.indexOf(rawScore);
  if (rawIndex === -1) {
    console.error('[translateDartData] Invalid raw score:', rawScore);
    return { score: rawScore, multiplier };
  }

  // Apply the board rotation offset to get the actual number
  // Add NUMBERS.length before modulo to handle negative boardRotation
  const adjustedIndex = (rawIndex - boardRotation + NUMBERS.length) % NUMBERS.length;
  const translatedScore = NUMBERS[adjustedIndex];

  console.log('[translateDartData] Translation:', {
    rawScore,
    rawIndex,
    boardRotation,
    adjustedIndex,
    translatedScore,
    multiplier,
    explanation: `Raw ${rawScore} at position ${rawIndex}, shifted by rotation ${boardRotation} = position ${adjustedIndex} which is ${translatedScore}`,
    NUMBERS_slice: NUMBERS.slice(0, 5) // Log first few numbers for debugging
  });

  return {
    score: translatedScore,
    multiplier
  };
};

/**
 * Get the appropriate smartboard implementation
 */
const getSmartboard = (useMock = true) => {
  console.log(`Getting smartboard implementation (useMock: ${useMock})`);
  
  if (useMock) {
    console.log('Using mock smartboard implementation');
    return smartboardMock();
  }
  
  if (!bleManager) {
    console.error('BLE Manager not initialized. Check console for details.');
    return null;
  }
  
  console.log('Using real smartboard implementation');
  try {
    const instance = bleManager.getConnectedDevice();
    console.log('Successfully created real smartboard instance');
    return instance;
  } catch (error) {
    console.error('Failed to create real smartboard instance:', error);
    console.error('Creation error stack:', error.stack);
    return null;
  }
};

/**
 * Generate a random dart throw
 */
const generateMockThrow = () => ({
  score: Math.floor(Math.random() * 20) + 1, // 1-20
  multiplier: Math.floor(Math.random() * 3) + 1 // 1-3
});

/**
 * useSmartboard hook
 * - Supports both mock and real smartboard connections via BLE
 * - Manages connection state and throws
 */
export default function useSmartboard() {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.DISCONNECTED);
  const [throws, setThrows] = useState([]);
  const [error, setError] = useState(null);
  const [useMock, setUseMock] = useState(true);
  const [device, setDevice] = useState(null);
  const [monitorSubscription, setMonitorSubscription] = useState(null);
  const attemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 2000; // 2 seconds
  const { boardRotation } = useSettings();
  const boardRotationRef = useRef(boardRotation);

  useEffect(() => {
    
  }, [boardRotation]);

  // Reset attempts when device changes
  useEffect(() => {
    if (device) {
      attemptsRef.current = 0;
    }
  }, [device]);

  // Cleanup monitoring subscription when component unmounts or device changes
  useEffect(() => {
    return () => {
      if (monitorSubscription) {
        
        monitorSubscription.remove();
      }
    };
  }, [monitorSubscription]);

  // Update the ref when boardRotation changes
  useEffect(() => {
    boardRotationRef.current = boardRotation;
    
  }, [boardRotation]);

  // Setup monitoring for a device
  const setupMonitoring = useCallback(async (discoveredDevice) => {
    attemptsRef.current += 1;
    

    if (attemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection in setupMonitoring.`);
      setError('Max reconnection attempts reached. Please try connecting again.');
      setConnectionState(CONNECTION_STATE.DISCONNECTED);
      return;
    }
    
    try {
      // Clear any existing subscription
      if (monitorSubscription) {
        
        monitorSubscription.remove();
        setMonitorSubscription(null);
      }

      if (!DART_CHARACTERISTIC_UUID) {
        throw new Error('Dart characteristic UUID not discovered');
      }

      const subscription = discoveredDevice.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        DART_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error(`[setupMonitoring] Monitoring error: ${error.message}`, {
              code: error.code,
              stack: error.stack
            });

            if (error.message === 'Operation was cancelled') {
              console.log('[setupMonitoring] Operation was cancelled (possibly subscription removed or device disconnected).');
            }

            // Attempt reconnection if not exceeded
            if (error.message === 'Operation was cancelled' && 
                discoveredDevice && 
                attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
              console.log(`[setupMonitoring] Retrying monitoring in ${RECONNECT_DELAY} ms...`);
              setTimeout(() => {
                setupMonitoring(discoveredDevice);
              }, RECONNECT_DELAY);
            } else if (attemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
              console.log('[setupMonitoring] Max reconnection attempts reached. Stopping monitoring.');
              setError('Failed to establish stable monitoring connection. Please try again.');
              setConnectionState(CONNECTION_STATE.DISCONNECTED);
            }
            return;
          }

          // Reset attempts on successful monitoring
          if (characteristic) {
            attemptsRef.current = 0;
          }

          if (characteristic?.value) {
            try {
              const base64 = characteristic.value;
              console.warn('[Smartboard] Received dart notification, base64 value:', base64);
              
              const binaryString = atob(base64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              console.warn('[Smartboard] Parsed data buffer (hex):', 
                Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
              
              if (bytes.length < 2) {
                console.warn('[Smartboard] Data length too short:', bytes.length);
                return;
              }

              const rawValue = bytes[0];
              let multiplier = bytes[1];
              console.warn('[Smartboard] Parsed values - rawValue:', rawValue, 'multiplier:', multiplier);

              if (multiplier === 170 && rawValue === 85) {
                console.warn('[Smartboard] Detected miss signal (170/85)');
                // Process as a valid miss
                const dartData = { score: 0, multiplier: 0 };
                setThrows(prev => [...prev, dartData]);
                return;
              }

              // Add validation logging
              console.warn('[Smartboard] Starting validation checks...');

              // Special handling for bullseye
              const isBullseye = rawValue === 25;
              // Regular score validation for non-bullseye
              const isValidRegularScore = rawValue >= 1 && rawValue <= 20;
              // For bullseye, only multiplier 1 (outer) or 2 (inner) is valid
              const isValidBullseyeMultiplier = isBullseye ? (multiplier === 1 || multiplier === 2) : true;
              // For regular scores, multiplier can be 1, 2, or 3
              const isValidRegularMultiplier = !isBullseye ? [1, 2, 3].includes(multiplier) : true;

              const isValidScore = isBullseye || isValidRegularScore;
              const isValidMultiplier = isValidBullseyeMultiplier && isValidRegularMultiplier;

              console.warn('[Smartboard] Validation results:', {
                rawValue,
                multiplier,
                isBullseye,
                isValidScore,
                isValidMultiplier,
                isValidBullseyeMultiplier,
                isValidRegularMultiplier
              });

              // Only validate score, convert invalid multipliers to 1
              if (!isValidScore) {
                console.warn('[Smartboard] Invalid score - returning without processing dart');
                return;
              }
              
              // Convert invalid multiplier to 1, but preserve bullseye multiplier
              if (!isValidMultiplier) {
                console.warn('[Smartboard] Invalid multiplier detected, converting to 1');
                multiplier = 1;
              } else if (isBullseye) {
                // Keep the original multiplier for valid bullseye hits
                console.warn('[Smartboard] Valid bullseye hit with multiplier:', multiplier);
              }
              console.warn('[Smartboard] Validation passed - processing dart...');

              // Debounce: if a valid dart was processed within 0.3s, ignore this notification
              const now = Date.now();
              if (this.lastValidDartTimestamp && now - this.lastValidDartTimestamp < 300) {
                console.warn('[Smartboard] Debouncing dart notification');
                return;
              }
              this.lastValidDartTimestamp = now;
              
              const dartData = translateDartDataUsingRef(rawValue, multiplier);
              
              if (dartData.type === 'playerChange') {
                console.warn('[Smartboard] Player change signal received');
                return;
              }

              console.warn('[Smartboard] Final dart data:', dartData);
              setThrows(prev => [...prev, dartData]);
            } catch (parseError) {
              console.error('[Smartboard] Error parsing dart data:', parseError);
            }
          }
        }
      );
      setMonitorSubscription(subscription);
    } catch (monitorError) {
      console.error('[setupMonitoring] Failed to setup monitoring:', monitorError);
      
      // Attempt to reconnect if monitoring setup fails and we haven't exceeded max attempts
      if (discoveredDevice && attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        console.log('Attempting to reconnect due to monitoring setup failure...');
        setTimeout(() => {
          discoveredDevice.connect()
            .then(() => discoveredDevice.discoverAllServicesAndCharacteristics())
            .then(() => setupMonitoring(discoveredDevice))
            .catch(reconnectError => {
              console.error('Reconnection failed:', reconnectError);
              setError('Failed to establish monitoring connection');
              setConnectionState(CONNECTION_STATE.DISCONNECTED);
            });
        }, RECONNECT_DELAY);
      } else {
        setError('Failed to establish monitoring connection after multiple attempts');
        setConnectionState(CONNECTION_STATE.DISCONNECTED);
      }
    }
  }, [translateDartData]); // Add translateDartData as dependency

  // Callback for manual mock throws
  const mockThrow = useCallback(() => {
    if (connectionState === CONNECTION_STATE.CONNECTED && useMock) {
      const rawScore = Math.floor(Math.random() * 20) + 1;
      const multiplier = Math.floor(Math.random() * 3) + 1;
      const dartData = translateDartDataUsingRef(rawScore, multiplier);
      setThrows(prev => [...prev, dartData]);
    }
  }, [connectionState, useMock]); // Remove boardRotation from dependencies

  // Connect to the smartboard (mock or real)
  const connect = useCallback(async (useRealBoard = false) => {
    try {
      setError(null);
      setConnectionState(CONNECTION_STATE.CONNECTING);
      setUseMock(!useRealBoard);

      if (!useRealBoard) {
        // Mock connection is instant
        setConnectionState(CONNECTION_STATE.CONNECTED);
        return;
      }

      // Force mock mode in Expo Go
      if (isExpoGo) {
        console.log('Running in Expo Go - forcing mock mode');
        setUseMock(true);
        setConnectionState(CONNECTION_STATE.CONNECTED);
        return;
      }

      // Ensure BLE Manager is initialized
      if (!initializeBleManager()) {
        throw new Error('Failed to initialize BLE Manager');
      }

      if (!bleManager) {
        throw new Error('BLE Manager not initialized. Check console for details.');
      }

      // Ensure Bluetooth is enabled
      console.log('Checking Bluetooth state...');
      const state = await bleManager.state();
      console.log('Current Bluetooth state:', state);
      if (state !== 'PoweredOn') {
        throw new Error(`Bluetooth is not enabled (current state: ${state})`);
      }

      console.log('Starting BLE device scan...');
      
      let isScanning = true;  // Track scanning state
      
      // Start scanning with timeout
      const scanTimeout = setTimeout(() => {
        if (isScanning) {
          isScanning = false;
          try {
            bleManager.stopDeviceScan();
          } catch (e) {
            console.error('Error stopping scan on timeout:', e);
          }
          setError('Scan timeout - no device found');
          setConnectionState(CONNECTION_STATE.DISCONNECTED);
        }
      }, 20000);

      // Cleanup function to ensure we always stop scanning
      const cleanup = () => {
        if (isScanning) {
          isScanning = false;
          try {
            bleManager.stopDeviceScan();
          } catch (e) {
            console.error('Error stopping scan in cleanup:', e);
          }
        }
        clearTimeout(scanTimeout);
      };

      try {
        bleManager.startDeviceScan(null, null, async (error, scannedDevice) => {
          if (error) {
            console.error('Scan error:', error);
            console.error('Scan error details:', {
              message: error.message,
              code: error.code,
              stack: error.stack
            });
            cleanup();
            throw error;
          }

          if (!isScanning) {
            return; // Don't process devices if we're not supposed to be scanning
          }

          if (scannedDevice) {
            console.log('Device found:', {
              name: scannedDevice.name,
              id: scannedDevice.id,
              rssi: scannedDevice.rssi
            });
          }

          // Look for our device name
          const deviceName = scannedDevice?.name || '';
          if (deviceName.toLowerCase().includes('unicorn smartboard')) {
            console.log('Found Unicorn Smartboard device:', {
              name: scannedDevice.name,
              id: scannedDevice.id,
              rssi: scannedDevice.rssi,
              serviceUUIDs: scannedDevice.serviceUUIDs,
            });
            
            cleanup(); // Stop scanning before attempting connection

            try {
              console.log('Initiating connection to Unicorn device...');
              const connectedDevice = await scannedDevice.connect();
              console.log('Initial connection successful, discovering services...');
              const discoveredDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
              console.log('Services discovered for device:', {
                id: discoveredDevice.id
              });
              const discoveredServices = await discoveredDevice.services();
              console.log('[connect] Discovered services:', discoveredServices);

              for (const service of discoveredServices) {
                const serviceCharacteristics = await discoveredDevice.characteristicsForService(service.uuid);
                console.log(`[connect] Service ${service.uuid} - characteristics:`, serviceCharacteristics);
                
                // If this is our target service, store its characteristic UUID
                if (service.uuid === BLE_SERVICE_UUID) {
                  // Look for a characteristic that is notifiable (can send dart data)
                  const dartCharacteristic = serviceCharacteristics.find(c => c.isNotifiable);
                  if (dartCharacteristic) {
                    DART_CHARACTERISTIC_UUID = dartCharacteristic.uuid;
                    console.log(`[connect] Found dart characteristic: ${DART_CHARACTERISTIC_UUID}`);
                  } else {
                    throw new Error('No suitable notifiable characteristic found for dart data');
                  }
                }
              }

              setDevice(discoveredDevice);

              // Setup connection state monitoring
              discoveredDevice.onDisconnected((error, device) => {
                console.log('[onDisconnected] Device disconnected:', {
                  errorMessage: error?.message,
                  deviceId: device?.id
                });
                setConnectionState(CONNECTION_STATE.DISCONNECTED);
                setDevice(null);

                if (monitorSubscription) {
                  console.log('[onDisconnected] Removing existing monitor subscription...');
                  monitorSubscription.remove();
                  setMonitorSubscription(null);
                }

                // Attempt reconnection only if there's an error and not exceeding attempts
                if (error && attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
                  attemptsRef.current += 1;
                  console.log(`[onDisconnected] Attempting reconnection (#${attemptsRef.current}) in ${RECONNECT_DELAY}ms...`);
                  setTimeout(() => {
                    connect(true); 
                  }, RECONNECT_DELAY);
                } else {
                  console.log('[onDisconnected] Not reconnecting (no error or max attempts reached)');
                }
              });

              // Setup monitoring for dart throws
              await setupMonitoring(discoveredDevice);

              setConnectionState(CONNECTION_STATE.CONNECTED);
              console.log('Device fully connected and monitoring');
            } catch (err) {
              console.error('Connection error:', err);
              throw err;
            }
          }
        });
      } catch (err) {
        const errorMessage = err.message || 'Unknown connection error';
        console.error('Connection failed:', errorMessage);
        console.error('Overall error stack:', err.stack);
        setError(errorMessage);
        setConnectionState(CONNECTION_STATE.DISCONNECTED);
      }
    } catch (err) {
      const errorMessage = err.message || 'Unknown connection error';
      console.error('Connection failed:', errorMessage);
      console.error('Overall error stack:', err.stack);
      setError(errorMessage);
      setConnectionState(CONNECTION_STATE.DISCONNECTED);
    }
  }, [connectionState]);

  // Disconnect from the smartboard
  const disconnect = useCallback(async () => {
    if (!useMock && device) {
      try {
        console.log('Disconnecting from device...');
        await device.cancelConnection();
        console.log('Device disconnected');
      } catch (err) {
        console.error('Error disconnecting:', err);
      }
    }
    setConnectionState(CONNECTION_STATE.DISCONNECTED);
    setDevice(null);
    setThrows([]);
  }, [useMock, device]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (device) {
        device.cancelConnection()
          .catch(err => console.error('Error disconnecting on cleanup:', err));
      }
    };
  }, [device]);

  // Add this helper inside the hook
  const translateDartDataUsingRef = (rawScore, multiplier) => {
    const currentRotation = boardRotationRef.current;
    const NUMBERS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
    
    // Handle special cases first
    if (multiplier === 170 && rawScore === 85) {
      return { score: 0, multiplier: 0 };
    }

    // Fix bullseye handling - preserve the multiplier!
    if (rawScore === 25) {
      return {
        score: rawScore,
        multiplier // Keep the original multiplier instead of forcing it to 1 or 2
      };
    }

    // Rest of the translation logic for regular scores...
    const rawIndex = NUMBERS.indexOf(rawScore);
    if (rawIndex === -1) {
      console.error('[translateDartDataUsingRef] Invalid raw score:', rawScore);
      return { score: rawScore, multiplier };
    }

    const adjustedIndex = (rawIndex + currentRotation) % NUMBERS.length;
    const translatedScore = NUMBERS[adjustedIndex];

    console.log('[translateDartDataUsingRef] Translation:', {
      rawScore,
      rawIndex,
      boardRotation: currentRotation,
      adjustedIndex,
      translatedScore,
      multiplier,
      explanation: `Raw ${rawScore} at position ${rawIndex}, adding rotation ${currentRotation} = position ${adjustedIndex} which is ${translatedScore}`,
      NUMBERS_slice: NUMBERS.slice(0, 5)
    });

    return {
      score: translatedScore,
      multiplier
    };
  };

  return { 
    connectionState,
    connected: connectionState === CONNECTION_STATE.CONNECTED,
    connecting: connectionState === CONNECTION_STATE.CONNECTING,
    throws, 
    error,
    mockThrow,
    connect,
    disconnect,
    useMock
  };
} 