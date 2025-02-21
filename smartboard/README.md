![logo](https://raw.githubusercontent.com/wiki/kcapp/smartboard/images/logo.png)
# smartboard
Integration of [Unicorn Smartboard](https://www.unicornsmartboard.com/smartboard.html) into kcapp

## Usage
For detailed information and usage, see the [Wiki](https://github.com/kcapp/smartboard/wiki)

### Connect
```javascript
const smartboard = require('./smartboard')();

// Start scanning for the board
smartboard.startScan();
// Register a connect callback, which will be called once board has been found, and connection has been established
smartboard.connect(board-uuid, (peripheral) => {
    // Initialize the board and register callbacks
    smartboard.initialize(peripheral, config.smartboard_button_number,
        (dart) => {
            // Dart throw callback
        },
        () => {
            // Button pressed callback
        }
    );
});
```

#### Values
`dart` object returned contains the following
```javascript
const dart = {
  score: int ,
  multiplier: int
};
```
`score` wil be the value of the field, correctly shifted to account for board rotation
`mulitplier` will be one the following
```
0 - single (thin)
1 - single (fat)
2 - double
3 - triple
```

### Disconnect
```javascript
smartboard.disconnect(peripheral, () => {
    // Disconnected
});
```
