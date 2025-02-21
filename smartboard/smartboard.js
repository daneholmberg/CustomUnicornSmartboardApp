import { Platform } from 'react-native';
import * as ExpoDevice from 'expo-device';
import * as ExpoBlE from 'expo-ble';

// Update logging to use __DEV__ and console.warn for better visibility
const log = (...args) => {
  if (__DEV__) {
    // Use console.warn in dev mode for better visibility in Expo client
    console.warn('[Smartboard]', ...args);
  }
};

const logError = (...args) => {
  if (__DEV__) {
    console.error('[Smartboard Error]', ...args);
  }
};

// Log initial setup
log('Initializing Smartboard module');
log('Platform:', Platform.OS);
log('ExpoDevice available:', !!ExpoDevice);
log('ExpoBLE available:', !!ExpoBlE);

// Constants in a separate object for better organization
const CONSTANTS = {
  BOARD: [15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5, 20, 1, 18, 4, 13, 6, 10],
  SERVICES: {
    SCORING: 'fff0',
    BATTERY: '180f'
  },
  CHARACTERISTICS: {
    BUTTON: 'fff2',
    THROW_NOTIFICATIONS: 'fff1',
    BATTERY_LEVEL: '2a19'
  }
};

// Helper functions
const helpers = {
  /**
   * Shifts a dart number based on the board's physical orientation.
   * @param {number} num - The raw dart number received from the hardware (1-20 or 25 for bullseye)
   * @param {number} button - The calibration number (must be in CONSTANTS.BOARD) that represents
   *                         how many positions the physical board is rotated from standard orientation.
   *                         For example, if the physical 20 is where 3 should be, button should be 3.
   * @returns {number} The adjusted score or 0 if button is invalid
   */
  shift(num, button) {
    if (num === 25) return num;
    
    const buttonIndex = CONSTANTS.BOARD.indexOf(button);
    if (buttonIndex === -1) {
      logError('Invalid button number:', button);
      return 0; // Explicitly return 0 for invalid button
    }
    
    const numIndex = CONSTANTS.BOARD.indexOf(num);
    const index = (numIndex + buttonIndex) % CONSTANTS.BOARD.length;
    log('Shift calculation:', {
      rawValue: num,
      buttonNumber: button,
      numIndex: numIndex,
      buttonIndex: buttonIndex,
      finalIndex: index,
      result: CONSTANTS.BOARD[index]
    });
    return CONSTANTS.BOARD[index];
  }
};

class Smartboard {
  constructor() {
    log('Creating new Smartboard instance');
    this.peripheral = null;
    this.subscription = null;
    this.lastValidDartTimestamp = 0; // used to debounce valid dart notifications
  }

  async isBLESupported() {
    log('Checking BLE support...');
    if (Platform.OS === 'web') {
      log('Web platform detected, BLE not supported');
      return false;
    }
    
    try {
      const isSupported = await ExpoBlE.isSupported();
      log('BLE support check result:', isSupported);
      if (!isSupported) {
        logError('Bluetooth LE is not supported on this device');
        return false;
      }
      return true;
    } catch (error) {
      logError('Error checking BLE support:', error);
      logError('Support check error stack:', error.stack);
      return false;
    }
  }

  async startScan() {
    log('Starting scan process...');
    try {
      const isSupported = await this.isBLESupported();
      log('BLE supported:', isSupported);
      if (!isSupported) return;

      // Request permission if needed (Android)
      if (Platform.OS === 'android') {
        log('Requesting Android permissions...');
        const { status } = await ExpoBlE.requestPermissionsAsync();
        log('Permission status:', status);
        if (status !== 'granted') {
          logError('Permission to access Bluetooth was denied');
          return;
        }
      }

      // Start scanning
      log('Initializing scan for services:', CONSTANTS.SERVICES.SCORING);
      this.subscription = ExpoBlE.addListener('scanningDidStop', () => {
        log('Scanning stopped');
      });

      await ExpoBlE.startScanningAsync([CONSTANTS.SERVICES.SCORING], {
        allowDuplicates: false
      });
      log('Scan started successfully');
    } catch (error) {
      logError('Scan error:', error);
      logError('Scan error stack:', error.stack);
    }
  }

  async connect(deviceId, callback) {
    log('Connecting to device:', deviceId);
    try {
      const isSupported = await this.isBLESupported();
      if (!isSupported) {
        logError('Cannot connect - BLE not supported');
        return;
      }

      log('Stopping any ongoing scans...');
      await ExpoBlE.stopScanningAsync();
      
      log('Attempting connection to device...');
      const device = await ExpoBlE.connectToDeviceAsync(deviceId);
      log('Connected to device:', device.name);
      
      this.peripheral = device;
      log('Discovering services and characteristics...');
      await ExpoBlE.discoverServicesAndCharacteristicsAsync(device.id);
      log('Services discovered');
      callback(device);
    } catch (error) {
      logError('Connection error:', error);
      logError('Connection error stack:', error.stack);
    }
  }

  async initialize(peripheral, buttonNumber, throwCallback, playerChangeCallback) {
    log('Initializing BLE device...');
    try {
      const services = await ExpoBlE.servicesForDeviceAsync(peripheral.id);
      const scoringService = services.find(s => s.uuid === CONSTANTS.SERVICES.SCORING);
      
      if (!scoringService) {
        throw new Error('Scoring service not found');
      }

      const characteristics = await ExpoBlE.characteristicsForServiceAsync(peripheral.id, scoringService.uuid);
      await this.setupCharacteristics(peripheral.id, characteristics, buttonNumber, throwCallback, playerChangeCallback);
    } catch (error) {
      log('Initialization error:', error);
    }
  }

  async setupCharacteristics(deviceId, characteristics, buttonNumber, throwCallback, playerChangeCallback) {
    // Add validation at start
    if (CONSTANTS.BOARD.indexOf(buttonNumber) === -1) {
      logError('Invalid calibration button number:', buttonNumber);
      return;
    }
    
    const buttonChar = characteristics.find(c => c.uuid === CONSTANTS.CHARACTERISTICS.BUTTON);
    const throwNotifyChar = characteristics.find(c => c.uuid === CONSTANTS.CHARACTERISTICS.THROW_NOTIFICATIONS);

    if (buttonChar) {
      try {
        await ExpoBlE.writeCharacteristicWithoutResponseAsync(
          deviceId,
          buttonChar.serviceUuid,
          buttonChar.uuid,
          Buffer.from([0x03]).toString('base64')
        );
      } catch (err) {
        log('Button enable error:', err);
      }
    }

    if (throwNotifyChar) {
      try {
        this.subscription = ExpoBlE.addListener(
          'characteristicValueChanged',
          ({ value, characteristic, device }) => {
            if (characteristic.uuid === throwNotifyChar.uuid) {
              log('Received dart notification, base64 value:', value);
              const data = Buffer.from(value, 'base64');
              log('Parsed data buffer (hex):', data.toString('hex'));
              if (data.length < 2) {
                log('Data length too short:', data.length);
                return;
              }

              const rawValue = data.readUInt8(0);
              const multiplier = data.readUInt8(1);
              log('Parsed values - rawValue:', rawValue, 'multiplier:', multiplier);

              if (multiplier === 170 && rawValue === 85) {
                log('Detected player change callback trigger');
                playerChangeCallback();
                return;
              }

              // Add validation logging
              log('Starting validation checks...');
              const isValidScore = rawValue === 25 || (rawValue >= 1 && rawValue <= 20);
              const isValidMultiplier = [1, 2, 3].includes(multiplier);
              
              log('Validation results:', {
                rawValue,
                multiplier,
                isValidScore,
                isValidMultiplier,
                scoreCheck: rawValue === 25 || (rawValue >= 1 && rawValue <= 20),
                multiplierCheck: [1, 2, 3].includes(multiplier)
              });

              if (!isValidScore || !isValidMultiplier) {
                log('Validation failed - returning without processing dart');
                return;
              }
              log('Validation passed - processing dart...');

              // Add explicit multiplier mapping
              const validMultiplier = isValidMultiplier ? multiplier : 1;

              // Debounce: if a valid dart was processed within 0.3s, ignore this notification
              const now = Date.now();
              if (this.lastValidDartTimestamp && now - this.lastValidDartTimestamp < 300) {
                log('Debouncing dart notification');
                return;
              }
              this.lastValidDartTimestamp = now;

              const shiftedScore = helpers.shift(rawValue, buttonNumber);
              log('Computed shiftedScore:', shiftedScore, 'from rawValue:', rawValue, 'and buttonNumber:', buttonNumber);
              throwCallback({
                score: shiftedScore,
                multiplier: validMultiplier // Use validated multiplier
              });
            }
          }
        );

        await ExpoBlE.startNotificationsAsync(
          deviceId,
          throwNotifyChar.serviceUuid,
          throwNotifyChar.uuid
        );
      } catch (err) {
        log('Notification setup error:', err);
      }
    }
  }

  async disconnect() {
    try {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }

      if (this.peripheral) {
        await ExpoBlE.disconnectFromDeviceAsync(this.peripheral.id);
        log('Disconnected successfully');
        this.peripheral = null;
      }
    } catch (error) {
      log('Disconnect error:', error);
    }
  }
}

export default function createSmartboard() {
  return new Smartboard();
}
