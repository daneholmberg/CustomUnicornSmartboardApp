const debug = require('debug')('kcapp-smartboard:main');
const smartboard = process.env.NODE_ENV === "prod" ? require('./smartboard')() : require("./smartboard-mock")();
const host = process.env.KCAPP_API || "localhost";
const port = process.env.PORT || 3000;
const kcapp = require('kcapp-sio-client/kcapp')(host, port, 'smartboard', "http");

const X01 = 1;
const SHOOTOUT = 2;

this.connected = false;
this.peripheral = {};

/**
 * Disconnect from the smartboard
 * @param {object} data
 */
function disconnectListener(data) {
    smartboard.disconnect(this.peripheral, () => {
        debug("Disconnected");
        this.connected = false;
    });
}

function connectToMatch(data) {
    const match = data.match;
    const legId = match.current_leg_id;
    const config = match.venue.config;
    if (match.venue && config.has_smartboard) {
        debug(`Connected to match ${match.id}`);
        kcapp.connectLegNamespace(legId, (leg) => {
            debug(`Connected to leg ${legId}`);
            if (!this.connected) {
                leg.emit('announce', { type: 'notify', message: 'Searching for smartboard ...' });
                smartboard.startScan();
                smartboard.connect(config.smartboard_uuid, (peripheral) => {
                    this.connected = true;
                    this.peripheral = peripheral;

                    smartboard.initialize(peripheral, config.smartboard_button_number,
                        (dart) => {
                            const player = leg.currentPlayer;
                            if (dart.multiplier == 0) {
                                dart.multiplier = 1;
                                dart.zone = 'inner';
                            } else if (dart.multiplier == 1) {
                                dart.zone = 'outer';
                            }
                            debug(`Got throw ${JSON.stringify(dart)} for ${player.player.id}`);
                            leg.emitThrow(dart);

                            if (match.match_type.id == SHOOTOUT) {
                                player.current_score += dart.score * dart.multiplier;
                                const visits = leg.leg.visits.length;
                                if (visits > 0 && ((visits * 3 + leg.dartsThrown) % (9 * leg.leg.players.length) === 0)) {
                                    debug("Match finished! sending visit");
                                    leg.emitVisit();
                                } else if (leg.dartsThrown == 3) {
                                    leg.emitVisit();
                                }
                            }
                            else if (match.match_type.id == X01) {
                                player.current_score -= dart.score * dart.multiplier;

                                if (player.current_score === 0 && dart.multiplier === 2) {
                                    debug("Player Checkout! sending visit");
                                    leg.emit('announce', { type: 'confirm_checkout', message: "" });
                                } else if (player.current_score <= 1) {
                                    debug("Player busted, sending visit");
                                    leg.emitVisit();
                                } else if (leg.dartsThrown == 3) {
                                    leg.emitVisit();
                                }
                            } else {
                                if (leg.dartsThrown == 3) {
                                    leg.emitVisit();
                                }
                            }
                        },
                        () => {
                            debug("Button pressed, sending visit");
                            leg.emitVisit();
                        }
                    );

                    leg.on('leg_finished', (data) => {
                        debug(`Got leg_finished event!`);
                        const match = data.match;
                        if (match.is_finished) {
                            debug("Match is finished, disconnecting from board");
                            disconnectListener.bind(this)(data);
                        } else {
                            debug("Leg is finished");
                        }
                    });
                    leg.emit('announce', { type: 'success', message: 'Connected to smartboard' });

                    leg.on('cancelled', (data) => {
                        debug("Leg cancelled, disconnecting from board");
                        disconnectListener.bind(this)();
                    });
                });
            } else {
                debug("Already connected to board...");
                leg.emit('announce', { type: 'success', message: 'Already Connected' });
                leg.on('leg_finished', disconnectListener.bind(this));
            }
        });
    }
}

kcapp.connect(() => {
    kcapp.on('new_match', (data) => {
        connectToMatch(data);
    });
    kcapp.on('warmup_started', (data) => {
        connectToMatch(data);
    });
    kcapp.on('reconnect_smartboard', (data) => {
        connectToMatch(data);
    });
});
debug("Waiting for matches to start...");
