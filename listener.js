var Wit = require(__dirname + '/modules/wit.js'),
    Commander = require(__dirname + '/modules/commander.js'),
    logger = require(__dirname + '/modules/logger.js'),
    apiKey = process.env.WITKEY;

var haVoC = new Wit({ key: apiKey });
logger.info('[home] listening...');

haVoC.on('error', function(err) {
    logger.error('[home] error', err);
    haVoC.recordVoice();
});

haVoC.on('result', function(text, intent) {
    logger.info('[home]', text, intent);
    Commander.process(intent);
});

haVoC.recordVoice();