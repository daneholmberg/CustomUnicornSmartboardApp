var debug = require('debug')('kcapp-smartboard:movement');
var gpio = require('rpi-gpio');

/**
 * Initialize the movement sensor with a callback
 * @param {func} callback - Callback function to trigger when movement is detected
 * @param {int} bouncetime - Bouncetime of 'gpio change' events. Allows to ignore events happening too frequently (Default: 200ms)
 */
exports.initialize = (callback, bouncetime = 200) => {
    this.callback = callback;
    var changeFunc = (pin, value) => {
        var last = Date.now() - this.last_motion;
        if (value && last > bouncetime) {
            debug("Movement Detected!");
            this.callback();
        }
        this.last_motion = Date.now();
    };
    gpio.on('change', changeFunc);
    this.changeFunc = changeFunc

    debug('Registered movement callback');
    gpio.setup(this.pin, gpio.DIR_IN, gpio.EDGE_RISING);
};

/**
 * Remove the listener function
 */
exports.teardown = () => {
    if (this.changeFunc) {
        debug("Removing listener");
        gpio.removeListener('çhange', this.changeFunc);
    }
}

/**
 * Configure the movement sensor module
 * @param {int} pin - GPIO Pin of movement sensor (Board mode)
 */
module.exports = (pin) => {
    this.pin = pin;
    this.last_motion = 0;
    debug(`Movement Sensor configured on pin ${this.pin}`);
    return this;
};