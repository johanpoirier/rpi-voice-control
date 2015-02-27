var arguments = process.argv.slice(2);

var Speakable = require('./speakable.js');
var apiKey = process.env.GKEY;

if (arguments[0] === 'w') {
    Speakable = require('./speechable.js');
    apiKey = process.env.WITKEY;
}

var speakable = new Speakable({ key: apiKey }, { lang: 'fr', threshold: '-20d' });

speakable.on('speechStart', function() {
    console.log('speachStart');
});
speakable.on('speechStop', function() {
    console.log('speachStop');
});

speakable.on('error', function(err) {
    console.log('onError:');
    console.log(err);
    speakable.recordVoice();
});

speakable.on('speechResult', function(recognizedWords) {
    console.log('onSpeechResult:')
    console.log(recognizedWords);
    speakable.recordVoice();
});

console.log("Listening...");
speakable.recordVoice();