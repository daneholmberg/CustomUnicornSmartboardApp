// This is the manual mock for the expo-ble module.
// It follows our coding style (single quotes, semicolons, etc.) and exposes the functionality needed for tests.

const listeners = {};

module.exports = {
  addListener: jest.fn((event, callback) => {
    listeners[event] = callback;
    return { remove: () => { delete listeners[event]; } };
  }),
  startNotificationsAsync: jest.fn(() => Promise.resolve()),
  stopScanningAsync: jest.fn(() => Promise.resolve()),
  connectToDeviceAsync: jest.fn(() =>
    Promise.resolve({ id: 'test-device', name: 'Test Device' })
  ),
  discoverServicesAndCharacteristicsAsync: jest.fn(() => Promise.resolve()),
  servicesForDeviceAsync: jest.fn(() =>
    Promise.resolve([{ uuid: 'fff0' }])
  ),
  characteristicsForServiceAsync: jest.fn(() =>
    Promise.resolve([{ uuid: 'fff1', serviceUuid: 'fff0' }])
  ),
  writeCharacteristicWithoutResponseAsync: jest.fn(() => Promise.resolve()),
  disconnectFromDeviceAsync: jest.fn(() => Promise.resolve()),
  // Helper functions for tests to simulate BLE events
  __emit: (event, args) => {
    if (listeners[event]) {
      listeners[event](args);
    }
  },
  __getListeners: () => listeners,
}; 