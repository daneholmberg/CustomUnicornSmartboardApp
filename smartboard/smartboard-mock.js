// Remove debug import since it's not available in React Native
const log = console.log;

class SmartboardMock {
  startScan() {
    log("Started mock scanning");
  }

  connect(uuid, callback) {
    log("Mock connecting to device");
    callback({
      uuid,
      advertisement: { localName: 'Mock Dartboard' }
    });
  }

  initialize(peripheral, buttonNumber, throwCallback, playerChangeCallback) {
    log(`Mock connected to ${peripheral.advertisement.localName}`);
  }

  disconnect(callback) {
    log("Mock disconnected");
    if (callback) callback();
  }
}

const createSmartboardMock = () => {
  log("Starting mock smartboard!");
  return new SmartboardMock();
};

export { createSmartboardMock as default };
