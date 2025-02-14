import { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import smartboardMock from './smartboard/smartboard-mock';
import Constants from 'expo-constants';

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
        console.log('Cleaning up characteristic monitoring...');
        monitorSubscription.remove();
      }
    };
  }, [monitorSubscription]);

  // Setup monitoring for a device
  const setupMonitoring = useCallback(async (discoveredDevice) => {
    attemptsRef.current += 1;
    console.log(`[setupMonitoring] Attempt ${attemptsRef.current}/${MAX_RECONNECT_ATTEMPTS} for device ${discoveredDevice?.id}`);

    if (attemptsRef.current > MAX_RECONNECT_ATTEMPTS) {
      console.log(`Max reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached. Stopping reconnection in setupMonitoring.`);
      setError('Max reconnection attempts reached. Please try connecting again.');
      setConnectionState(CONNECTION_STATE.DISCONNECTED);
      return;
    }
    
    try {
      // Clear any existing subscription
      if (monitorSubscription) {
        console.log('[setupMonitoring] Removing existing monitor subscription before setting up new one');
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
              // Decode base64 to byte array
              const base64 = characteristic.value;
              const binaryString = atob(base64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              
              const rawValue = bytes[0];
              const multiplier = bytes[1];
              
              // Check for player change signal
              if (multiplier === 170 && rawValue === 85) {
                console.log('Player change signal received');
                // You might want to handle player changes here
                return;
              }

              // Calculate the actual dart score
              const dartData = {
                score: rawValue,
                multiplier: multiplier === 2 ? 2 : multiplier === 3 ? 3 : 1
              };
              
              console.log('Received dart throw:', dartData);
              setThrows(prev => [...prev, dartData]);
            } catch (parseError) {
              console.error('Error parsing dart data:', {
                error: parseError,
                rawValue: characteristic.value,
                errorDetails: parseError.stack
              });
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
  }, [monitorSubscription]);

  // Callback for manual mock throws
  const mockThrow = useCallback(() => {
    if (connectionState === CONNECTION_STATE.CONNECTED && useMock) {
      setThrows(prev => [...prev, generateMockThrow()]);
    }
  }, [connectionState, useMock]);

  // Connect to the smartboard (mock or real)
  const connect = useCallback(async (useRealBoard = false) => {
    console.log(`Attempting to connect (useRealBoard: ${useRealBoard})`);
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
      console.log('Setting up scan timeout of 20 seconds...');
      const scanTimeout = setTimeout(() => {
        console.log('Scan timeout reached - stopping device scan');
        if (isScanning) {
          isScanning = false;
          try {
            bleManager.stopDeviceScan();
            console.log('Device scan stopped due to timeout');
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
            console.log('Device scan stopped in cleanup');
          } catch (e) {
            console.error('Error stopping scan in cleanup:', e);
          }
        }
        clearTimeout(scanTimeout);
      };

      try {
        console.log('Starting device scan with no filters...');
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