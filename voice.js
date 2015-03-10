var arguments = process.argv.slice(2);

var Speakable = require('./speakable.js');
var apiKey = process.env.GKEY;

if (arguments[0] === 'w') {
    Speakable = require('./speechable.js');
    apiKey = process.env.WITKEY;
}

var speakable = new Speakable({ key: apiKey });

/*speakable.on('speechReady', function() {
    console.log("[speakable] listening...");
});
speakable.on('speechEnd', function() {
    console.log('[speakable] ended');
});*/

speakable.on('error', function(err) {
    //console.log('[speakable] error', err);
    speakable.recordVoice();
});

speakable.on('speechResult', function(text, outcomes) {
    if (text) {
        console.log('[speakable]', text);
        outcomes.forEach(function (outcome) {
            console.log('[speakable] ' + outcome.intent, JSON.stringify(outcome.entities));
        });
    } else {
        //console.log('[speakable] no result');
    }
});

speakable.recordVoice();
