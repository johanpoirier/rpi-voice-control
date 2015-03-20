"use strict";

var config = require(__dirname + '/../config.js'),
    unirest = require('unirest'),
    logger = require(__dirname + '/logger.js');

/*************** Send command to z-home ***************/
var sendZwaveCommand = function (device) {
    var request = unirest.post(config.zhomeHost + "/api/events");

    request.header('Content-Type', 'application/json');
    request.header('Origin', 'razberry');
    request.header('Authorization', 'Basic ' + config.apiToken);

    request.send({
        "device": device.ip,
        "type": "virtual",
        "name": device.name,
        "level": device.level,
        "scale": ""
    }).end(function (response) {
        logger.debug(response.body);
    });
};

var sendVirtualCommand = function (device) {
    var request = unirest.put(config.zhomeHost + "/api/virtual/devices/" + device.id);

    request.header('Content-Type', 'application/json');
    request.header('Origin', 'razberry');
    request.header('Authorization', 'Basic ' + config.apiToken);

    request.send(device).end(function (response) {
        logger.debug(response.body);
    });
};

var findDevice = function (deviceId, cb) {
    var request = unirest.get(config.zhomeHost + "/api/devices/" + deviceId);

    request.header('Content-Type', 'application/json');
    request.header('Origin', 'razberry');
    request.header('Authorization', 'Basic ' + config.apiToken);

    request.send().end(function (response) {
        cb(response.body);
    });
};

var intentExists = function (intent) {
    var intents = ['Home_TV_on', 'Light_control', 'Temperature', 'TV_control'];
    return intents.some(function (it) {
        return it === intent.intent;
    });
};

module.exports = {
    "process": function (intent) {
        if (intentExists(intent)) {
            if (intent.intent === 'TV_control' || intent.intent === 'Home_TV_on') {
                var onOffEntity = intent.entities['on_off'];
                if (onOffEntity && onOffEntity.length > 0) {
                    findDevice("Freebox Player", function (device) {
                        if (device instanceof Object) {
                            device.level = onOffEntity.pop().value;
                            sendVirtualCommand(device);
                        } else {
                            logger.warn("device not found:", device);
                        }
                    });
                }
            } else {
                logger.warn("intent not handled yet", intent);
            }
        } else {
            logger.info("intent not recognized", intent);
        }
    }
};