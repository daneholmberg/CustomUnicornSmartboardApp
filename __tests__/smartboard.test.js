import createSmartboard from '../smartboard/smartboard';
import { Buffer } from 'buffer';

// --- Create a mock for Expo-ble ---
// Jest will use this mock when smartboard.js imports ExpoBlE.
jest.mock('expo-ble', () => {
  let listeners = {};
  return {
    addListener: jest.fn((event, callback) => {
      listeners[event] = callback;
      return { remove: () => { delete listeners[event]; } };
    }),
    startNotificationsAsync: jest.fn(() => Promise.resolve()),
    stopScanningAsync: jest.fn(() => Promise.resolve()),
    connectToDeviceAsync: jest.fn(() => Promise.resolve({ id: 'test-device', name: 'Test Device' })),
    discoverServicesAndCharacteristicsAsync: jest.fn(() => Promise.resolve()),
    servicesForDeviceAsync: jest.fn(() => Promise.resolve([{ uuid: 'fff0' }])),
    characteristicsForServiceAsync: jest.fn(() => Promise.resolve([
      // Return a characteristic that matches the throw notify uuid
      { uuid: 'fff1', serviceUuid: 'fff0' }
    ])),
    writeCharacteristicWithoutResponseAsync: jest.fn(() => Promise.resolve()),
    disconnectFromDeviceAsync: jest.fn(() => Promise.resolve()),
    // Helper to simulate emitting events for tests.
    __emit: (event, args) => {
      if (listeners[event]) {
        listeners[event](args);
      }
    },
    __getListeners: () => listeners,
  };
});

// Import the mocked module so we can call __emit
import * as ExpoBlE from 'expo-ble';

describe('Smartboard BLE notification handling', () => {
  let smartboard;
  let throwCallback;
  let playerChangeCallback;
  const deviceId = 'test-device';
  const characteristics = [{ uuid: 'fff1', serviceUuid: 'fff0' }];

  beforeEach(async () => {
    jest.resetModules();
    smartboard = createSmartboard();
    throwCallback = jest.fn();
    playerChangeCallback = jest.fn();

    // Call setupCharacteristics to register the characteristic listener.
    await smartboard.setupCharacteristics(
      deviceId,
      characteristics,
      3,
      throwCallback,
      playerChangeCallback
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('processes a valid dart notification', () => {
    // Create valid notification data: e.g. rawValue 10 (valid since 1<=10<=20) and multiplier 2.
    const dataBuffer = Buffer.from([10, 2]);
    const base64Value = dataBuffer.toString('base64');

    // Emit the simulated BLE characteristicValueChanged event.
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });

    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback).toHaveBeenCalledWith({
      // The score will be shifted using the helper. We simply ensure a number is passed.
      score: expect.any(Number),
      multiplier: 2,
    });
  });

  test('ignores duplicate valid notifications within 300ms', () => {
    jest.useFakeTimers();
    let currentTime = 1000;
    // Override Date.now() to simulate time progression.
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

    // First valid notification.
    let dataBuffer = Buffer.from([10, 2]);
    let base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);

    // Advance time by 200ms (still within the 300ms debounce interval)
    currentTime += 200;

    // Second valid notification.
    dataBuffer = Buffer.from([15, 1]);
    base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    // Since this second notification comes in too quickly, it should be ignored.
    expect(throwCallback).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  test('processes separate valid notifications more than 300ms apart', () => {
    jest.useFakeTimers();
    let currentTime = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

    // First valid notification.
    let dataBuffer = Buffer.from([10, 2]);
    let base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);

    // Advance time by 350ms to exceed the debounce threshold.
    currentTime += 350;

    // Second valid notification.
    dataBuffer = Buffer.from([15, 1]);
    base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  test('ignores invalid dart data', () => {
    // Test with an invalid rawValue (e.g. 30 is not in 1–20 nor is it 25)
    let dataBuffer = Buffer.from([30, 2]);
    let base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();

    // Test with an invalid multiplier (e.g. 10, outside the 1–3 range)
    dataBuffer = Buffer.from([10, 10]);
    base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('ignores event with non-matching characteristic uuid', () => {
    const dataBuffer = Buffer.from([10, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'non-matching-uuid' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
    expect(playerChangeCallback).not.toHaveBeenCalled();
  });

  test('ignores notification when data length is less than 2 (empty data)', () => {
    const base64Value = Buffer.from([]).toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('ignores notification when data length is less than 2 (one-byte data)', () => {
    const dataBuffer = Buffer.from([10]); // only one byte provided
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('calls playerChangeCallback when rawValue is 85 and multiplier is 170', () => {
    const dataBuffer = Buffer.from([85, 170]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(playerChangeCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback).not.toHaveBeenCalled();
  });

  // Additional tests for expanded scenarios
  test('processes a valid bullseye hit with rawValue 25 and multiplier 1', () => {
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([25, 1]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    // Bullseye should always return 25 regardless of multiplier
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback).toHaveBeenCalledWith({ score: 25, multiplier: 1 });
  });

  test('processes a valid bullseye hit with rawValue 25 and multiplier 2', () => {
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([25, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback).toHaveBeenCalledWith({ score: 25, multiplier: 2 });
  });

  test('processes a valid bullseye hit with rawValue 25 and multiplier 3', () => {
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([25, 3]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback).toHaveBeenCalledWith({ score: 25, multiplier: 3 });
  });

  test('processes notification with extra data bytes (only first two bytes are used)', () => {
    jest.clearAllMocks();
    // Extra bytes after the first two should be ignored
    const dataBuffer = Buffer.from([10, 2, 99, 100]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    // For rawValue 10 with buttonNumber 3:
    // BOARD = [15,2,17,3,19,7,16,8,11,14,9,12,5,20,1,18,4,13,6,10]
    // index(10) is 19, index(3) is 3, so (19+3)=22 mod 20 = 2, BOARD[2] = 17
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 17, multiplier: 2 });
  });

  test('processes notifications exactly 300ms apart (edge of debounce threshold)', () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    let currentTime = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

    // First notification
    let dataBuffer = Buffer.from([10, 2]);
    let base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);

    // Advance time exactly by 300ms (should NOT be debounced because condition is < 300)
    currentTime += 300;

    // Second notification
    dataBuffer = Buffer.from([15, 1]);
    base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  test('processes valid notification with rawValue 1 and multiplier 1, returns expected shifted score', () => {
    jest.clearAllMocks();
    // For rawValue 1 and buttonNumber 3:
    // BOARD = [15,2,17,3,19,7,16,8,11,14,9,12,5,20,1,18,4,13,6,10]
    // index(1) is 14, index(3) is 3, so (14+3)=17 mod 20 = 17, BOARD[17] = 13
    const dataBuffer = Buffer.from([1, 1]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 13, multiplier: 1 });
  });

  test('processes valid notification with rawValue 20 and multiplier 3, returns expected shifted score', () => {
    jest.clearAllMocks();
    // For rawValue 20 and buttonNumber 3:
    // index(20) is 13, index(3) is 3, so (13+3)=16 mod 20 = 16, BOARD[16] = 4
    const dataBuffer = Buffer.from([20, 3]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 4, multiplier: 3 });
  });

  test('ignores notification when rawValue is 0', () => {
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([0, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('ignores notification when multiplier is 0', () => {
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([10, 0]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('debounces notification if triggered 299ms after previous valid notification', () => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    let currentTime = 1000;
    jest.spyOn(Date, 'now').mockImplementation(() => currentTime);

    // First valid notification
    let dataBuffer = Buffer.from([10, 2]);
    let base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);

    // Advance time by 299ms (should still be within debounce threshold)
    currentTime += 299;
    dataBuffer = Buffer.from([15, 1]);
    base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  test('ignores notification when rawValue is 50', () => {
    // rawValue 50 is not valid (only 1-20 and 25 are valid), so callback should not be triggered
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([50, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('ignores notification when rawValue is negative', () => {
    // Negative rawValue should be invalid
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([255, 2]); // 255 interpreted as -1 if signed, but readUInt8 gives 255 which is > 20
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('ignores notification when multiplier is above valid range', () => {
    // multiplier 4 is not valid as allowed range is 1-3
    jest.clearAllMocks();
    const dataBuffer = Buffer.from([10, 4]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('ignores notification with an invalid base64 string', () => {
    // Providing an invalid base64 string should result in an empty buffer and hence be ignored
    jest.clearAllMocks();
    const invalidBase64 = "!!!invalid_base64!!!";
    ExpoBlE.__emit('characteristicValueChanged', {
      value: invalidBase64,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).not.toHaveBeenCalled();
  });

  test('processes notification with a button number not in board (button index returns -1)', async () => {
    jest.resetModules();
    const smartboardModule = require('../smartboard/smartboard');
    const newSmartboard = smartboardModule.default();
    await newSmartboard.setupCharacteristics(deviceId, [{ uuid: 'fff1', serviceUuid: 'fff0' }], 99, throwCallback, playerChangeCallback);

    // For rawValue 10:
    // BOARD = [15,2,17,3,19,7,16,8,11,14,9,12,5,20,1,18,4,13,6,10]
    // index(10) is 19, BOARD.indexOf(99) = -1, so (19 + (-1)) = 18 mod 20 = 18, BOARD[18] = 17
    const dataBuffer = Buffer.from([10, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 17, multiplier: 2 });
  });

  test('processes notification with button number 0 (not in board)', async () => {
    jest.resetModules();
    const smartboardModule = require('../smartboard/smartboard');
    const newSmartboard = smartboardModule.default();
    await newSmartboard.setupCharacteristics(deviceId, [{ uuid: 'fff1', serviceUuid: 'fff0' }], 0, throwCallback, playerChangeCallback);

    // For rawValue 10 with button 0:
    // index(10) is 19, BOARD.indexOf(0) = -1, so (19 + (-1)) = 18 mod 20 = 18, BOARD[18] = 17
    const dataBuffer = Buffer.from([10, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 17, multiplier: 2 });
  });

  test('processes notification with corrupted button number (255)', async () => {
    jest.resetModules();
    const smartboardModule = require('../smartboard/smartboard');
    const newSmartboard = smartboardModule.default();
    await newSmartboard.setupCharacteristics(deviceId, [{ uuid: 'fff1', serviceUuid: 'fff0' }], 255, throwCallback, playerChangeCallback);

    // For rawValue 10 with button 255 (corrupted/overflow):
    // index(10) is 19, BOARD.indexOf(255) = -1, so (19 + (-1)) = 18 mod 20 = 18, BOARD[18] = 17
    const dataBuffer = Buffer.from([10, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 17, multiplier: 2 });
  });

  test('processes notification with undefined button number', async () => {
    jest.resetModules();
    const smartboardModule = require('../smartboard/smartboard');
    const newSmartboard = smartboardModule.default();
    await newSmartboard.setupCharacteristics(deviceId, [{ uuid: 'fff1', serviceUuid: 'fff0' }], undefined, throwCallback, playerChangeCallback);

    // For rawValue 10 with undefined button:
    // index(10) is 19, BOARD.indexOf(undefined) = -1, so (19 + (-1)) = 18 mod 20 = 18, BOARD[18] = 17
    const dataBuffer = Buffer.from([10, 2]);
    const base64Value = dataBuffer.toString('base64');
    ExpoBlE.__emit('characteristicValueChanged', {
      value: base64Value,
      characteristic: { uuid: 'fff1' },
      device: { id: deviceId },
    });
    expect(throwCallback).toHaveBeenCalledTimes(1);
    expect(throwCallback.mock.calls[0][0]).toEqual({ score: 17, multiplier: 2 });
  });



}); 